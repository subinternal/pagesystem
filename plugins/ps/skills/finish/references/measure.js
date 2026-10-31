// Pagesystem measure: checks a rendered page against Pagesystem's foundations and returns findings as JSON, so a page
// is called finished by evidence rather than by eye. Self-contained: no dependencies, no network, no storage.
//
//   Load it into the page (Playwright: page.addScriptTag({ path }); a browser console: paste this file), then
//   const report = await pagesystemMeasure({ pointer: 'coarse' });
//
// Run it at a phone width (375) and a desk width (1440), in each theme, and again with { textSpacing: true }.
// "fail" is breakage (WCAG failures, content off the page, unnamed controls); "warn" misses the house standard.
(function install(scope) {
  const visible = (el) => {
    if (!(el instanceof Element) || el.closest('[aria-hidden="true"],[hidden],template,script,style,noscript')) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    // The visually hidden pattern (1px, clipped) is for assistive technology; it is not laid out text.
    if (r.width <= 1.5 && r.height <= 1.5) return false;
    if (s.clipPath === 'inset(50%)' || (s.clip && s.clip !== 'auto' && /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(s.clip))) return false;
    return true;
  };
  const describe = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      let p = n.localName;
      if (n.id) { parts.unshift(`${p}#${n.id}`); break; }
      const cls = [...n.classList].filter((c) => !/^(is|has)-/.test(c)).slice(0, 2);
      if (cls.length) p += `.${cls.join('.')}`;
      const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.localName === n.localName) : [];
      if (same.length > 1) p += `:nth-of-type(${same.indexOf(n) + 1})`;
      parts.unshift(p);
    }
    return parts.join(' > ');
  };
  const text = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const snippet = (el) => { const t = text(el); return t.length > 70 ? `${t.slice(0, 67)}…` : t; };

  // Colors: parse rgb()/rgba() as the browser reports them; blend a translucent color over what is behind it.
  const rgba = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  // color(srgb r g b / a), as browsers report colors mixed with color-mix() or given in srgb, in 0..1 channels.
  const srgb = (c) => { const m = c.match(/color\(srgb\s+([^)]+)\)/); if (!m) return rgba(c); const v = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return { r: v[0] * 255, g: v[1] * 255, b: v[2] * 255, a: v.length > 3 ? v[3] : 1 }; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  // The ground behind an element: the first opaque background up the tree, blending translucent ones on the way. An
  // image or gradient makes it unknowable, and the element is reported as not measured rather than guessed.
  const ground = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') {
        // A gradient whose stops are all one color is a flat tint written as a gradient: it is measured as that color.
        const image = s.backgroundImage.replace(/,\s*none\b/g, ''); // empty layers add nothing
        const stops = /^linear-gradient\(.*\)$/.test(image) && !/\),\s*linear-gradient/.test(image) ? [...image.matchAll(/rgba?\([^)]+\)|color\(srgb[^)]+\)/g)].map((m) => m[0]) : [];
        const flat = stops.length > 1 && stops.every((c) => c === stops[0]) ? srgb(stops[0]) : null;
        if (!flat) return null;
        layers.push(flat);
        if (flat.a >= 1) break;
      }
      const c = srgb(s.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  };

  // Lines: the tops of a block's words, measured where the browser actually broke them.
  const range = document.createRange();
  const lines = (el) => {
    const tops = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.parentElement || !visible(t.parentElement)) continue;
      for (const m of t.data.matchAll(/\S+/g)) {
        range.setStart(t, m.index); range.setEnd(t, m.index + m[0].length);
        const r = range.getBoundingClientRect();
        if (r.height) tops.push(Math.round(r.top));
      }
    }
    if (!tops.length) return { count: 0, last: 0 };
    const rows = [...new Set(tops)].sort((a, b) => a - b);
    // Words on a row within a few pixels of each other share a line (baseline shifts, inline icons).
    const merged = [];
    for (const y of rows) if (!merged.length || y - merged[merged.length - 1] > 4) merged.push(y);
    const lastTop = merged[merged.length - 1];
    return { count: merged.length, last: tops.filter((y) => y >= lastTop - 4).length };
  };

  // Text that flows as a paragraph: a block whose children are all inline. A flex, grid or table row puts its parts in
  // columns on purpose; a word in its own column is layout, not a word left alone on a line.
  const inlineOnly = (el) => [...el.children].every((c) => c.localName === 'br' || !visible(c) || getComputedStyle(c).display.startsWith('inline'));
  const flowing = (el) => ['block', 'list-item', 'inline-block', 'flow-root'].includes(getComputedStyle(el).display) && inlineOnly(el);
  const scrolls = (el) => { for (let n = el.parentElement; n; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; };
  const interactive = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=radio],[role=switch],[tabindex]:not([tabindex="-1"])';
  const accessibleName = (el) => {
    if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label').trim();
    const by = el.getAttribute('aria-labelledby');
    if (by) { const t = by.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim(); if (t) return t; }
    if (el.labels?.length) { const t = [...el.labels].map((l) => l.textContent).join(' ').trim(); if (t) return t; }
    const own = (el.textContent || '').trim(); if (own) return own;
    const img = el.querySelector('img[alt]'); if (img?.alt.trim()) return img.alt.trim();
    if (el.title?.trim()) return el.title.trim();
    if (el.placeholder?.trim()) return el.placeholder.trim();
    if (el.localName === 'input' && ['submit', 'reset', 'button'].includes(el.type) && el.value) return el.value;
    return '';
  };
  const inlineInText = (el) => el.localName === 'a' && el.parentElement && /^(p|li|dd|td|span|small|figcaption|blockquote)$/.test(el.parentElement.localName) && text(el.parentElement).length > text(el).length + 3;

  async function measure(options = {}) {
    const pointer = options.pointer ?? (matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine');
    const target = pointer === 'coarse' ? 44 : 36;
    const limit = options.limit ?? 600;
    let spacing = null;
    // Under text spacing only clipping is judged: lines are meant to break differently there. Each clipping box's
    // overflow is recorded first, so a box that already overflowed by design (a map drawn to cover its frame) is not
    // blamed on the spacing.
    const before = new Map();
    if (options.textSpacing) {
      for (const el of document.body.querySelectorAll('*')) { const s = getComputedStyle(el); if (s.overflowY === 'hidden' || s.overflow === 'hidden' || s.overflowY === 'clip') before.set(el, el.scrollHeight - el.clientHeight); }
      // WCAG 1.4.12's override: content and controls must survive it without clipping or overlap.
      spacing = document.createElement('style');
      spacing.textContent = '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';
      document.head.append(spacing);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    if (document.fonts?.ready) await document.fonts.ready;
    const findings = [];
    const add = (rule, severity, el, detail) => findings.push({ rule, severity, element: el ? describe(el) : 'document', text: el ? snippet(el) : '', detail });
    const all = [...document.body.querySelectorAll('*')].filter(visible);
    const vw = document.documentElement.clientWidth;

    // 1. Nothing runs off the page sideways; a region that scrolls on purpose is its own container.
    if (document.documentElement.scrollWidth > vw + 1) add('page-overflow', 'fail', null, { pageWidth: document.documentElement.scrollWidth, viewport: vw });
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && !scrolls(el) && el.children.length === 0) add('off-page', 'fail', el, { right: Math.round(r.right), viewport: vw });
    }

    // 2. Wrapping. Headings and questions never end on one word; labels, buttons and links in controls never wrap;
    //    body text never ends on one word.
    let checked = 0;
    for (const el of options.textSpacing ? [] : all) {
      if (checked > limit) break;
      const tag = el.localName;
      const isHeading = /^h[1-4]$/.test(tag) || tag === 'summary';
      const isControl = el.matches('button,[role=button],label,.ps-button,.ps-badge') || (el.matches('a[href]') && !inlineInText(el));
      const isProse = /^(p|li|figcaption|dd|blockquote)$/.test(tag);
      if (!isHeading && !isControl && !isProse) continue;
      if (!text(el)) continue;
      checked++;
      const l = lines(el);
      // A control's own label wrapping is a fault whatever the control's display (buttons are usually inline-flex).
      if (isControl && l.count > 1 && text(el).split(/\s+/).length <= 6 && inlineOnly(el)) add('label-wraps', 'warn', el, { lines: l.count });
      else if ((isHeading || isProse) && l.count > 1 && l.last === 1 && flowing(el)) add(isHeading ? 'heading-orphan' : 'text-orphan', 'warn', el, { lines: l.count });
    }

    // 3. Contrast of every text element against the ground it actually sits on.
    for (const el of all) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
      if (!own) continue;
      const s = getComputedStyle(el);
      const fg = srgb(s.color); const bg = ground(el);
      if (!fg) continue;
      if (!bg) { add('contrast-unmeasured', 'warn', el, { reason: 'text over an image or gradient; check it by eye' }); continue; }
      const size = parseFloat(s.fontSize); const bold = Number(s.fontWeight) >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      const need = large ? 3 : 4.5;
      const got = ratio(over(fg, bg), bg);
      if (got < need) add('contrast', 'fail', el, { ratio: Number(got.toFixed(2)), needs: need, fontSize: size });
      if (size < 12 && text(el).length > 2) add('text-too-small', 'warn', el, { fontSize: size });
    }

    // 4. Targets: WCAG 2.2's 24px floor is a failure; under the house target (36 fine, 44 coarse) is a warning.
    //    A link inside a sentence is exempt, as WCAG allows.
    const targets = [...document.querySelectorAll(interactive)].filter((el) => visible(el) && !inlineInText(el));
    const boxes = targets.map((el) => el.getBoundingClientRect());
    // WCAG 2.5.8's spacing exception: an undersized target passes if a 24px circle on its center meets no other
    // target's 24px circle (centers at least 24px apart) and no other target's box.
    const spaced = (i) => {
      const a = boxes[i]; const cx = a.left + a.width / 2; const cy = a.top + a.height / 2;
      return boxes.every((b, j) => {
        if (j === i || targets[j].contains(targets[i]) || targets[i].contains(targets[j])) return true;
        const bx = b.left + b.width / 2; const by = b.top + b.height / 2;
        const dx = Math.max(b.left - cx, 0, cx - b.right); const dy = Math.max(b.top - cy, 0, cy - b.bottom);
        return Math.hypot(bx - cx, by - cy) >= 24 && Math.hypot(dx, dy) >= 12;
      });
    };
    for (const [i, el] of targets.entries()) {
      const r = boxes[i];
      const small = Math.min(r.width, r.height);
      if (small < 24 && !spaced(i)) add('target-too-small', 'fail', el, { width: Math.round(r.width), height: Math.round(r.height), floor: 24 });
      else if (r.height < target - 0.5 && el.localName !== 'summary') add('target-under-house', 'warn', el, { height: Math.round(r.height), target, pointer });
      if (!accessibleName(el)) add('control-unnamed', 'fail', el, { role: el.getAttribute('role') ?? el.localName });
    }

    // 5. Reading width: prose wider than about 80 characters is hard to track (the house measure is 65ch).
    const zero = document.createElement('canvas').getContext('2d');
    for (const el of all) {
      if (el.localName !== 'p' || text(el).length < 160) continue;
      const s = getComputedStyle(el);
      zero.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      const ch = zero.measureText('0').width || parseFloat(s.fontSize) * 0.5;
      // A paragraph laid out as a grid or flex row (a label beside its text) is read column by column: measure the
      // widest column, not the row.
      const columns = /^(inline-)?(grid|flex)$/.test(s.display) ? [...el.children].filter(visible) : [el];
      const measureCh = Math.max(...(columns.length ? columns : [el]).map((c) => c.getBoundingClientRect().width)) / ch;
      if (measureCh > 80) add('measure-too-wide', 'warn', el, { characters: Math.round(measureCh), house: 65 });
    }

    // 6. Structure: language, one h1, no skipped heading levels, images with alt, form fields with names.
    if (!document.documentElement.lang) add('no-lang', 'fail', null, { fix: 'set <html lang>' });
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
    const h1s = headings.filter((h) => h.localName === 'h1').length;
    if (h1s !== 1) add('h1-count', 'warn', null, { h1: h1s });
    headings.reduce((prev, h) => { const lvl = Number(h.localName[1]); if (prev && lvl > prev + 1) add('heading-skip', 'warn', h, { from: `h${prev}`, to: h.localName }); return lvl; }, 0);
    for (const img of document.querySelectorAll('img')) if (visible(img) && !img.hasAttribute('alt')) add('img-no-alt', 'fail', img, { src: (img.currentSrc || img.src).slice(0, 80) });

    // 7. With text spacing on, content must not be clipped.
    if (spacing) {
      for (const el of all) {
        const s = getComputedStyle(el);
        const grew = el.scrollHeight - el.clientHeight - Math.max(0, before.get(el) ?? 0);
        if ((s.overflowY === 'hidden' || s.overflow === 'hidden' || s.overflowY === 'clip') && grew > 2 && text(el)) add('clipped-with-text-spacing', 'fail', el, { clippedBy: grew, height: el.clientHeight });
      }
      spacing.remove();
    }

    const summary = { fail: findings.filter((f) => f.severity === 'fail').length, warn: findings.filter((f) => f.severity === 'warn').length };
    const byRule = findings.reduce((m, f) => ({ ...m, [f.rule]: (m[f.rule] ?? 0) + 1 }), {});
    return { page: { url: location.href, width: vw, height: innerHeight, pointer, colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', textSpacing: Boolean(options.textSpacing) }, summary, byRule, findings, notMeasured: ['keyboard order and focus visibility', 'reduced motion', 'meaning and hierarchy', 'states not on screen (errors, empty, loading)'] };
  }
  scope.pagesystemMeasure = measure;
})(globalThis);
