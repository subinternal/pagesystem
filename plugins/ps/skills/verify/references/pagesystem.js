var PS_KITS = PS_KITS || [];
// Kit A: chat input, attachment and message. Sample data stays on the page; nothing is uploaded or sent.
PS_KITS.push(function kitA(root, { doc, win, listen, find, emit }) {
  const timers = new Set(), observers = [];
  const later = (fn, ms) => { const id = win.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = id => { if (id === undefined) return; win.clearTimeout(id); timers.delete(id); };
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const icon = name => { const el = node('span', 'ps-i ps-i-' + name); el.setAttribute('aria-hidden', 'true'); return el; };
  const iconButton = (name, label, data) => { const b = node('button', 'ps-icon-action'); b.type = 'button'; b.setAttribute('aria-label', label); Object.assign(b.dataset, data); b.append(icon(name)); return b; };
  const say = (region, text) => { if (!region) return; region.textContent = ''; later(() => { region.textContent = text; }, 30); };
  const clock = new win.Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

  // Motion is presentation only: the DOM is already final when an animation starts, and reduced motion skips it entirely.
  // Durations and the curve come from the tokens; pointer actions animate, keyboard-initiated ones do not.
  const rootStyle = win.getComputedStyle(doc.documentElement);
  const PRESS = parseFloat(rootStyle.getPropertyValue('--press')) || 160, SETTLE = parseFloat(rootStyle.getPropertyValue('--settle')) || 220;
  const EASE = rootStyle.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
  const reduce = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const still = () => !!reduce?.matches || typeof doc.documentElement.animate !== 'function';
  const byPointer = event => !!event && event.detail > 0;
  const animations = new Set();
  const play = (el, keyframes, options) => {
    if (still()) return null;
    const animation = el.animate(keyframes, { duration: SETTLE, easing: EASE, ...options });
    const drop = () => animations.delete(animation);
    animations.add(animation); animation.finished.then(drop, drop);
    return animation;
  };
  const appear = el => play(el, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: PRESS });
  const rise = (el, options) => play(el, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], options);
  const after = (animation, fn) => (animation ? animation.finished.then(fn, fn) : fn());
  const snapshot = els => new Map(els.filter(el => el?.getClientRects().length).map(el => [el, el.getBoundingClientRect()]));
  // FLIP: measure before a change, then slide each element from where it was to where it now is.
  const glide = before => {
    if (!before || still()) return;
    for (const [el, from] of before) {
      if (!el.isConnected) continue;
      for (const running of el.getAnimations()) if (running.id === 'ps-glide') running.cancel();
      const to = el.getBoundingClientRect(), dx = from.left - to.left, dy = from.top - to.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      play(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { id: 'ps-glide' });
    }
  };
  // A removed file leaves at once; an inert copy in a positioned layer fades out where it stood.
  const leave = (li, layer) => {
    if (still() || !li.isConnected) return;
    const list = li.parentElement, from = li.getBoundingClientRect(), base = layer.getBoundingClientRect();
    const ghost = doc.createElement(list.tagName);
    ghost.className = `${list.className} ps-motion-ghost`;
    if (list.dataset.layout) ghost.dataset.layout = list.dataset.layout;
    ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    Object.assign(ghost.style, { left: `${from.left - base.left}px`, top: `${from.top - base.top}px`, width: `${from.width}px` });
    ghost.append(li.cloneNode(true)); layer.append(ghost);
    after(play(ghost, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: PRESS }), () => ghost.remove());
  };
  // Icons crossfade in one grid cell, so send turns into stop and copy into a check without a jump.
  const swapIcon = (button, name, animate) => {
    const old = button.querySelector('.ps-i:not([data-leaving])'), next = icon(name);
    if (old?.classList.contains(`ps-i-${name}`)) return;
    if (!old || !animate || still()) { if (old) old.replaceWith(next); else button.append(next); return; }
    old.dataset.leaving = ''; button.append(next);
    play(next, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: PRESS });
    after(play(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], { duration: PRESS }), () => old.remove());
  };

  // Files: kind drives the icon; the extension is shown as the type so nothing depends on color.
  const KINDS = { png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', heic: 'image', mp4: 'video', mov: 'video', webm: 'video', xlsx: 'sheet', xls: 'sheet', csv: 'sheet', numbers: 'sheet', zip: 'archive', tar: 'archive', gz: 'archive' };
  const ICONS = { image: 'image', video: 'video', sheet: 'grid', archive: 'package', document: 'file' };
  const extension = name => (/\.([a-z0-9]+)$/i.exec(name)?.[1] || '').toLowerCase();
  const kindOf = name => KINDS[extension(name)] || 'document';
  const typeOf = name => extension(name).toUpperCase() || 'File';
  const bytes = n => n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
  const totalOf = items => items.reduce((sum, li) => sum + Number(li.dataset.size || 0), 0);

  function fillAttachment(li, state, progress, fade = false) {
    const name = li.dataset.name, size = Number(li.dataset.size || 0);
    li.dataset.state = state;
    const text = li.querySelector('.ps-attachment-text'), actions = li.querySelector('.ps-attachment-actions');
    text.replaceChildren(node('span', 'ps-attachment-name', name));
    actions.replaceChildren();
    if (state === 'uploading') {
      const row = node('span', 'ps-attachment-progress'), bar = node('progress');
      bar.max = 100; bar.value = progress; bar.setAttribute('aria-label', `Uploading ${name}`);
      row.append(bar, node('span', '', `${progress}%`)); text.append(row);
    } else {
      const meta = node('span', 'ps-attachment-meta');
      if (state === 'error') meta.textContent = li.dataset.error || 'Upload failed. Retry or remove.';
      else meta.append(node('span', 'ps-attachment-type', `${typeOf(name)} · `), bytes(size));
      text.append(meta);
    }
    if (state === 'error' && li.dataset.retry !== 'false') actions.append(iconButton('retry', `Retry ${name}`, { attachmentRetry: '' }));
    if (li.dataset.removable !== 'false') actions.append(iconButton('close', `Remove ${name}`, { attachmentRemove: '' }));
    li.querySelector('.ps-attachment-media').replaceChildren(icon(state === 'error' ? 'alert' : ICONS[kindOf(name)]));
    if (fade) { play(text, [{ opacity: 0.35 }, { opacity: 1 }], { duration: PRESS }); play(actions, [{ opacity: 0 }, { opacity: 1 }], { duration: PRESS }); }
  }

  function attachment(file, state = 'ready', removable = true) {
    const li = node('li', 'ps-attachment');
    li.dataset.name = file.name; li.dataset.size = String(file.size);
    if (!removable) li.dataset.removable = 'false';
    const media = node('span', 'ps-attachment-media'); media.setAttribute('aria-hidden', 'true');
    li.append(media, node('span', 'ps-attachment-text'), node('span', 'ps-attachment-actions'));
    fillAttachment(li, state, 0);
    return li;
  }

  // Removing a file moves focus to its neighbor's remove button, or to the fallback when the set empties.
  function removeAttachment(li, fallback) {
    const items = [...li.parentElement.children], index = items.indexOf(li);
    const next = items[index + 1] || items[index - 1];
    li.remove();
    (next?.querySelector('[data-attachment-remove]') || fallback)?.focus();
  }

  // Attachment sets: remove, add a sample file with progress, and retry a failed upload.
  const SAMPLE_FILES = [
    { name: 'pricing-page-audit.pdf', size: 1153434 },
    { name: 'checkout-recording.mov', size: 18874368, fail: 'Connection dropped. Retry or remove.' },
    { name: 'renewal-cohorts.csv', size: 94208 },
  ];
  for (const set of find('[data-ps-attachment]')) {
    const list = set.querySelector('[data-attachment-list]'), add = set.querySelector('[data-attachment-add]');
    const summary = set.querySelector('[data-attachment-summary]'), live = set.querySelector('[data-attachment-live]');
    const uploads = new Map();
    let added = 0;
    for (const li of list.children) if (!li.querySelector('.ps-attachment-text')?.childElementCount) fillAttachment(li, li.dataset.state || 'ready', 0);
    const refresh = () => {
      const items = [...list.children], ready = items.filter(li => li.dataset.state === 'ready');
      const waiting = items.length - ready.length;
      if (summary) summary.textContent = items.length ? `${ready.length} ${ready.length === 1 ? 'file' : 'files'} ready · ${bytes(totalOf(ready))}${waiting ? ` · ${waiting} ${waiting === 1 ? 'needs' : 'need'} attention` : ''}` : 'No files attached';
    };
    const upload = (li, failAt, start = 0) => {
      cancel(uploads.get(li));
      let progress = start;
      const step = () => {
        progress = Math.min(100, progress + 16);
        if (failAt && progress >= failAt.at) { uploads.delete(li); li.dataset.error = failAt.message; fillAttachment(li, 'error', 0, true); refresh(); say(live, `${li.dataset.name} failed to upload`); emit(set, 'pagesystem:attachment', { action: 'error', name: li.dataset.name }); return; }
        if (progress >= 100) { uploads.delete(li); fillAttachment(li, 'ready', 0, true); refresh(); say(live, `${li.dataset.name} attached`); emit(set, 'pagesystem:attachment', { action: 'ready', name: li.dataset.name, size: Number(li.dataset.size) }); return; }
        const bar = li.querySelector('progress');
        if (bar) { bar.value = progress; bar.nextElementSibling.textContent = `${progress}%`; } else fillAttachment(li, 'uploading', progress);
        uploads.set(li, later(step, 180));
      };
      fillAttachment(li, 'uploading', progress);
      uploads.set(li, later(step, 180));
    };
    for (const li of list.children) if (li.dataset.state === 'uploading') upload(li, 0, Number(li.dataset.progress || 0));
    listen(set, 'click', event => {
      const button = event.target.closest('button');
      if (!button || !set.contains(button)) return;
      const li = button.closest('.ps-attachment');
      if (button === add) {
        const sample = SAMPLE_FILES[added % SAMPLE_FILES.length]; added += 1;
        const item = attachment(sample, 'uploading');
        list.append(item); if (byPointer(event)) appear(item); refresh(); say(live, `Uploading ${sample.name}`);
        upload(item, sample.fail && added <= SAMPLE_FILES.length ? { at: 64, message: sample.fail } : null);
      } else if (li && 'attachmentRemove' in button.dataset) {
        const name = li.dataset.name;
        cancel(uploads.get(li)); uploads.delete(li);
        if (!add) set.tabIndex = -1;
        const animate = byPointer(event), before = animate ? snapshot([...list.children].filter(item => item !== li)) : null;
        if (animate) leave(li, set);
        removeAttachment(li, add || set); glide(before); refresh(); say(live, `Removed ${name}`);
        emit(set, 'pagesystem:attachment', { action: 'remove', name });
      } else if (li && 'attachmentRetry' in button.dataset) {
        delete li.dataset.error; upload(li, null);
        li.querySelector('[data-attachment-remove]')?.focus();
        say(live, `Retrying ${li.dataset.name}`);
        emit(set, 'pagesystem:attachment', { action: 'retry', name: li.dataset.name });
      }
    });
    refresh();
  }

  // Chat input: auto-growing prompt, sample attachments, model choice, Enter to send and a stop state.
  for (const box of find('[data-ps-chat-input]')) {
    const form = box.querySelector('form'), field = form.querySelector('textarea'), send = form.querySelector('[data-chat-send]');
    const model = form.querySelector('select'), files = form.querySelector('[data-chat-files]'), addButton = form.querySelector('[data-chat-add]');
    const menu = form.querySelector('[data-chat-menu]'), status = box.querySelector('[data-chat-status]'), log = box.querySelector('[data-chat-log]');
    const style = win.getComputedStyle(field);
    const singleLine = parseFloat(style.lineHeight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    let picker;
    const options = () => [...menu.querySelectorAll('[role="menuitem"]')];
    let sentByPointer = false;
    // Every change goes through update: measure, mutate, lay out, then let the pill grow or settle continuously.
    const update = (animate, mutate) => {
      const moving = animate && !still();
      const fromHeight = moving ? form.getBoundingClientRect().height : 0;
      const before = moving ? snapshot([addButton, model, send, ...files.children]) : null;
      mutate?.();
      const responding = box.dataset.chatState === 'responding';
      const content = field.value.trim().length > 0 || files.children.length > 0;
      files.hidden = !files.children.length;
      // Expand on the first wrap or file and stay open until the prompt is cleared, so the layout never flickers between states.
      if (!('expanded' in form.dataset)) {
        field.style.height = 'auto';
        if (files.children.length || field.value.includes('\n') || field.scrollHeight > singleLine + 2) form.dataset.expanded = '';
      } else if (!field.value && !files.children.length) delete form.dataset.expanded;
      field.style.height = 'auto';
      field.style.height = `${field.scrollHeight}px`;
      send.disabled = !responding && !content;
      send.setAttribute('aria-label', responding ? 'Stop response' : 'Send message');
      swapIcon(send, responding ? 'stop' : 'up', moving);
      if (!moving) return;
      for (const running of form.getAnimations()) if (running.id === 'ps-height') running.cancel();
      const toHeight = form.getBoundingClientRect().height;
      if (Math.abs(toHeight - fromHeight) > 0.5) {
        if (menu.hidden) form.dataset.moving = '';
        after(play(form, [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], { id: 'ps-height' }), () => {
          if (!form.getAnimations().some(running => running.id === 'ps-height')) delete form.dataset.moving;
        });
      }
      glide(before);
    };
    const render = () => update(false);
    const setStatus = text => { if (status) status.textContent = text; };
    const closeMenu = (focusButton) => {
      if (menu.hidden) return;
      menu.hidden = true; addButton.setAttribute('aria-expanded', 'false');
      if (focusButton) addButton.focus();
    };
    const openMenu = animate => {
      menu.hidden = false; addButton.setAttribute('aria-expanded', 'true');
      if (animate) play(menu, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: PRESS });
      options()[0]?.focus();
    };
    const attach = (list, animate) => {
      const added = list.map(file => attachment(file));
      update(animate, () => files.append(...added));
      if (animate) for (const li of added) appear(li);
      setStatus(`${list.length === 1 ? list[0].name : `${list.length} files`} attached. Files stay on this page.`);
      emit(box, 'pagesystem:chat-input', { action: 'attach', files: list.map(f => ({ name: f.name, size: f.size })) });
    };
    for (const li of files.children) if (!li.querySelector('.ps-attachment-text')?.childElementCount) fillAttachment(li, 'ready');

    // Typing reflows the prompt; the pill follows it continuously, as the reference's height transition does.
    listen(field, 'input', () => update(true));
    listen(send, 'click', event => { sentByPointer = byPointer(event); });
    listen(field, 'keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); closeMenu(true); return; }
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
      event.preventDefault(); sentByPointer = false;
      if (box.dataset.chatState === 'responding') { setStatus('Stop the current response before sending another prompt.'); return; }
      if (!send.disabled) form.requestSubmit(send);
    });
    listen(form, 'submit', event => {
      event.preventDefault();
      const animate = sentByPointer; sentByPointer = false;
      if (box.dataset.chatState === 'responding') {
        update(animate, () => { delete box.dataset.chatState; });
        setStatus('Response stopped. Your draft is kept.');
        emit(box, 'pagesystem:chat-input', { action: 'stop' });
        field.focus();
        return;
      }
      const text = field.value.trim(), sent = [...files.children].map(li => ({ name: li.dataset.name, size: Number(li.dataset.size) }));
      if (!text && !sent.length) return;
      const choice = model.selectedOptions[0]?.textContent || model.value;
      if (log) {
        const item = node('li', 'ps-message'); item.dataset.from = 'user';
        item.append(node('span', 'ps-message-who', 'You'));
        if (sent.length) { const chips = node('ul', 'ps-attachments'); chips.dataset.layout = 'inline'; chips.setAttribute('aria-label', 'Attached files'); for (const f of sent) chips.append(attachment(f, 'ready', false)); item.append(chips); }
        if (text) item.append(node('div', 'ps-message-bubble', text));
        const meta = node('div', 'ps-message-meta'), now = new Date(), time = node('time', '', clock.format(now));
        time.dateTime = now.toISOString(); meta.append(time, node('span', '', `To ${choice}`)); meta.lastChild.dataset.messageNote = '';
        item.append(meta); log.append(item); log.hidden = false;
        if (animate) rise(item);
      }
      emit(box, 'pagesystem:chat-input', { action: 'send', text, model: model.value, files: sent });
      update(animate, () => { field.value = ''; files.replaceChildren(); });
      setStatus(`Sent to ${choice}${sent.length ? ` with ${sent.length} ${sent.length === 1 ? 'file' : 'files'}` : ''}. Sample only: nothing left this page.`);
      field.focus();
    });
    listen(model, 'change', () => {
      setStatus(`${model.selectedOptions[0]?.textContent} will answer the next prompt.`);
      emit(box, 'pagesystem:chat-input', { action: 'model', model: model.value });
    });
    listen(addButton, 'click', event => (menu.hidden ? openMenu(byPointer(event)) : closeMenu(false)));
    listen(addButton, 'keydown', event => { if (event.key === 'ArrowDown' && menu.hidden) { event.preventDefault(); openMenu(false); } });
    listen(menu, 'keydown', event => {
      const items = options(), index = items.indexOf(doc.activeElement);
      const move = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 }[event.key];
      if (move !== undefined) { event.preventDefault(); items[(move + items.length) % items.length].focus(); }
      else if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
      else if (event.key === 'Tab') closeMenu(false);
    });
    listen(menu, 'click', event => {
      const option = event.target.closest('[role="menuitem"]');
      if (!option) return;
      closeMenu(false);
      if ('chatDevice' in option.dataset) {
        if (!picker) {
          picker = node('input'); picker.type = 'file'; picker.multiple = true; picker.hidden = true; picker.tabIndex = -1;
          listen(picker, 'change', () => { const list = [...picker.files].map(f => ({ name: f.name, size: f.size })); picker.value = ''; if (list.length) attach(list, true); field.focus(); });
          form.append(picker);
        }
        picker.click();
        return;
      }
      attach([{ name: option.dataset.name, size: Number(option.dataset.size) }], byPointer(event));
      field.focus();
    });
    listen(doc, 'pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && !addButton.contains(event.target)) closeMenu(false); });
    listen(files, 'click', event => {
      const button = event.target.closest('[data-attachment-remove]');
      if (!button) return;
      const li = button.closest('.ps-attachment'), name = li.dataset.name;
      const animate = byPointer(event);
      update(animate, () => { if (animate) leave(li, form); removeAttachment(li, field); });
      setStatus(`Removed ${name}.`);
      emit(box, 'pagesystem:chat-input', { action: 'remove', name });
    });
    // Reflow (a late font, a resized panel) changes how the prompt wraps, so the height follows the field's width.
    let width = 0;
    if (win.ResizeObserver) {
      const observer = new win.ResizeObserver(() => { if (field.clientWidth !== width) { width = field.clientWidth; render(); } });
      observer.observe(field); observers.push(observer);
    }
    if (doc.fonts) listen(doc.fonts, 'loadingdone', render);
    render();
  }

  // Messages: copy with confirmation, edit a sent turn, regenerate an answer and page between versions.
  const ALTERNATES = {
    refund: [
      ['Yes. Annual plans bought in the last 14 days get a full refund; after that the unused months are credited to the account, not paid out.', 'To issue it, open the invoice, choose Refund, and pick full or prorated. The customer sees the credit within one billing cycle.'],
      ['Within 14 days of purchase the refund is full. Later than that, Northwind credits the unused months instead of returning money.', 'Send the customer the invoice link so they can confirm which case applies before you process it.'],
    ],
  };
  for (const thread of find('[data-ps-message]')) {
    const live = thread.querySelector('[data-message-live]');
    // A sample thread plays its turns in once, the first time it is scrolled into view, and can be replayed.
    if ('messageAutoplay' in thread.dataset && !still() && win.IntersectionObserver) {
      const playIn = () => {
        for (const running of animations) if (running.id === 'ps-turn') running.cancel();
        thread.querySelectorAll('.ps-thread > .ps-message').forEach((li, i) => rise(li, { id: 'ps-turn', delay: i * 140, fill: 'backwards' }));
      };
      const observer = new win.IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect(); playIn();
      }, { threshold: 0.2 });
      observer.observe(thread); observers.push(observer);
      const replay = node('button', 'ps-button ps-conversation-replay'); replay.type = 'button';
      replay.append(icon('retry'), 'Replay conversation');
      listen(replay, 'click', playIn);
      thread.append(replay);
    }
    const versions = new WeakMap(), copied = new WeakMap();
    const bodyOf = msg => msg.querySelector('[data-message-text]');
    const paragraphs = lines => lines.map(line => node('p', '', line));
    const pager = msg => {
      let el = msg.querySelector('.ps-message-pager');
      if (!el) {
        el = node('span', 'ps-message-pager');
        el.append(iconButton('left', 'Previous response', { messageAction: 'prev' }), node('span'), iconButton('right', 'Next response', { messageAction: 'next' }));
        msg.querySelector('.ps-message-meta').prepend(el);
      }
      return el;
    };
    const show = (msg, index, animate) => {
      const state = versions.get(msg); state.index = index;
      bodyOf(msg).replaceChildren(...state.list[index].map(n => n.cloneNode(true)));
      if (animate) play(bodyOf(msg), [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }]);
      const p = pager(msg); p.children[1].textContent = `${index + 1} / ${state.list.length}`;
      p.children[0].disabled = index === 0; p.children[2].disabled = index === state.list.length - 1;
      p.hidden = state.list.length < 2;
    };
    const finishEdit = (msg, save) => {
      const form = msg.querySelector('.ps-message-edit'), bubble = msg.querySelector('.ps-message-bubble');
      if (!form) return;
      const value = form.querySelector('textarea').value.trim();
      if (save && value) {
        const before = bubble.textContent; bubble.textContent = value;
        const meta = msg.querySelector('.ps-message-meta');
        if (before !== value && !meta.querySelector('[data-message-note]')) { const note = node('span', '', 'Edited'); note.dataset.messageNote = ''; meta.append(note); }
        say(live, 'Message updated');
        emit(thread, 'pagesystem:message', { action: 'edit', id: msg.dataset.messageId, text: value });
      }
      form.remove(); bubble.hidden = false;
      msg.querySelector('[data-message-action="edit"]')?.focus();
    };
    const regenerate = (msg, animate) => {
      const key = msg.dataset.messageSample, failed = msg.dataset.state === 'error';
      if (!versions.has(msg)) versions.set(msg, { index: 0, alternate: 0, list: failed ? [] : [[...bodyOf(msg).childNodes].map(n => n.cloneNode(true))] });
      const state = versions.get(msg);
      msg.setAttribute('aria-busy', 'true');
      say(live, failed ? 'Retrying response' : 'Regenerating response');
      later(() => {
        const alternates = ALTERNATES[key] || [];
        if (alternates.length) state.list.push(paragraphs(alternates[state.alternate++ % alternates.length]));
        msg.removeAttribute('aria-busy');
        if (failed) {
          delete msg.dataset.state;
          const meta = msg.querySelector('.ps-message-meta'); meta.hidden = false;
          if (animate) rise(meta, { duration: PRESS });
        }
        if (!state.list.length) return;
        show(msg, state.list.length - 1, animate);
        msg.querySelector('[data-message-action="retry"]')?.focus();
        say(live, `Response ${state.list.length} of ${state.list.length}`);
        emit(thread, 'pagesystem:message', { action: 'retry', id: msg.dataset.messageId, version: state.list.length });
      }, 600);
    };
    listen(thread, 'click', event => {
      const button = event.target.closest('button[data-message-action]');
      const msg = event.target.closest('.ps-message');
      if (!msg || !thread.contains(msg)) return;
      if (!button) {
        // Tapping a bubble pins its time and actions, as hover does for a pointer.
        if (event.target.closest('.ps-message-bubble')) msg.toggleAttribute('data-revealed');
        return;
      }
      const action = button.dataset.messageAction;
      if (action === 'copy') {
        const text = (bodyOf(msg) || msg.querySelector('.ps-message-bubble')).innerText.trim();
        const done = ok => {
          cancel(copied.get(button));
          button.dataset.done = ''; swapIcon(button, ok ? 'check' : 'close', byPointer(event));
          button.setAttribute('aria-label', ok ? 'Copied' : 'Copy unavailable');
          say(live, ok ? 'Message copied' : 'This browser blocked copying. Select the text instead.');
          copied.set(button, later(() => { delete button.dataset.done; swapIcon(button, 'copy', byPointer(event)); button.setAttribute('aria-label', 'Copy message'); }, 1600));
          if (ok) emit(thread, 'pagesystem:message', { action: 'copy', id: msg.dataset.messageId, text });
        };
        const clip = win.navigator.clipboard;
        if (clip?.writeText) clip.writeText(text).then(() => done(true), () => done(false)); else done(false);
      } else if (action === 'edit') {
        if (msg.querySelector('.ps-message-edit')) return;
        const bubble = msg.querySelector('.ps-message-bubble'), form = node('form', 'ps-message-edit');
        const area = node('textarea', 'ps-input'); area.value = bubble.textContent; area.rows = 3; area.setAttribute('aria-label', 'Edit message');
        const row = node('div'), cancelButton = node('button', 'ps-button', 'Cancel'), save = node('button', 'ps-button ps-button-primary', 'Save');
        cancelButton.type = 'button'; cancelButton.dataset.messageAction = 'cancel'; save.type = 'submit';
        row.append(cancelButton, save); form.append(area, row);
        bubble.hidden = true; bubble.after(form);
        if (byPointer(event)) play(form, [{ opacity: 0 }, { opacity: 1 }], { duration: PRESS });
        listen(form, 'submit', e => { e.preventDefault(); finishEdit(msg, true); });
        listen(area, 'input', () => { save.disabled = !area.value.trim(); });
        listen(area, 'keydown', e => {
          if (e.key === 'Escape') { e.preventDefault(); finishEdit(msg, false); }
          else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (area.value.trim()) finishEdit(msg, true); }
        });
        area.focus(); area.setSelectionRange(area.value.length, area.value.length);
      } else if (action === 'cancel') finishEdit(msg, false);
      else if (action === 'retry') { if (msg.getAttribute('aria-busy') !== 'true') regenerate(msg, byPointer(event)); }
      else if (action === 'prev' || action === 'next') {
        const state = versions.get(msg); if (!state) return;
        const index = Math.max(0, Math.min(state.list.length - 1, state.index + (action === 'next' ? 1 : -1)));
        show(msg, index, byPointer(event));
        if (button.disabled) (action === 'next' ? button.previousElementSibling.previousElementSibling : button.nextElementSibling.nextElementSibling).focus();
        say(live, `Response ${index + 1} of ${state.list.length}`);
      }
    });
  }

  return () => {
    for (const id of timers) win.clearTimeout(id); timers.clear();
    for (const observer of observers) observer.disconnect();
    for (const animation of [...animations]) animation.cancel();
  };
});

/* Kit B: agent conversation parts. Chat history, a streamed reply and inline citations.
   Every listener goes through listen() so disposal aborts it; every timer goes through later() so disposal clears it. */
var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitB(root, { doc, win, listen, find, emit }) {
  const timers = new Set();
  const later = (fn, ms) => { const id = win.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = id => { if (id) { win.clearTimeout(id); timers.delete(id); } return 0; };
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const icon = name => { const el = node('span', 'ps-i ps-i-' + name); el.setAttribute('aria-hidden', 'true'); return el; };
  const label = (button, name, text) => button.replaceChildren(icon(name), doc.createTextNode(text));
  const reducedMotion = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;
  /* Motion is presentation only. Markup and state always reach their final form at once; a keyboard-driven change
     or reduced motion skips the transition. Roots carry data-still while the last input was a key press. */
  const roots = [], animations = new Set(), observers = new Set();
  const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
  const ms = (name, fallback) => parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue(name)) || fallback;
  let keyboard = false;
  // A focus-visible element means the change came from the keyboard, even before the document-level key listener runs.
  const still = () => keyboard || reducedMotion() || !!doc.activeElement?.matches?.(':focus-visible');
  const animate = (el, frames, duration) => {
    if (still() || !el.animate) return null;
    const run = el.animate(frames, { duration, easing: EASE_OUT });
    animations.add(run); run.finished.then(() => animations.delete(run), () => animations.delete(run));
    return run;
  };

  /* Chat history: conversations grouped by day, filtered by search, renamed or deleted with undo. */
  const SAMPLE_TODAY = Date.UTC(2026, 9, 29);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const GROUPS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'Previous 7 days'], ['earlier', 'Earlier']];
  const daysAgo = at => Math.round((SAMPLE_TODAY - Date.UTC(+at.slice(0, 4), +at.slice(5, 7) - 1, +at.slice(8, 10))) / 864e5);
  const groupOf = at => { const d = daysAgo(at); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d <= 7 ? 'week' : 'earlier'; };
  // US forms: a 12-hour clock for recent times, month before day for older ones.
  const clock = at => { const hour = +at.slice(11, 13); return `${hour % 12 || 12}:${at.slice(14, 16)} ${hour < 12 ? 'AM' : 'PM'}`; };
  const dayLabel = at => `${MONTHS[+at.slice(5, 7) - 1]} ${+at.slice(8, 10)}`;
  const whenLabel = at => daysAgo(at) <= 1 ? clock(at) : dayLabel(at);
  const CHATS = [
    { id: 'domain', model: 'Opus 5.5', tokens: [21840, 2610], cost: 0.52, files: ['dns-records.csv'], tools: ['dns_lookup', 'web_fetch'], title: 'Point a domain at a new deployment', at: '2026-10-29T09:42', turns: [
      ['How do I point my domain at the new deployment?', ['Add the domain to the project in its settings first. Until the project knows about it, a record at your registrar points at a deployment that will not answer for that name.', 'Then create the record the settings page asks for: an A record for a bare domain such as example.com, or a CNAME for a subdomain such as\u00a0www.example.com.']],
      ['How long until the change shows up?', ['Usually a few minutes. Settings checks the record regularly and marks the domain ready as soon as it sees the right answer.', 'Caching is what slows it down. Resolvers keep the old record until its TTL runs out, so lower the TTL to five minutes the day before a planned move.']],
      ['Will the certificate renew on its own?', ['Yes. A certificate is issued once the record resolves and renewal starts thirty days before expiry. It only fails if the record stops pointing here.']],
      ['Can www redirect to the bare domain, or does that have to happen at the registrar?', ['Do it here. Add both names to the project, open www.example.com in settings and set it to a permanent 308 redirect. Paths and query strings carry across.']],
      ['And if I switch registrars later?', ['Nothing here needs to change. Copy every record to the new registrar before the transfer, including mail records, and change the nameservers last.']]
    ] },
    { id: 'invoice', model: 'Sonnet 5.5', tokens: [3120, 410], cost: 0.02, files: ['invoice-2041.pdf'], tools: [], title: 'Reminder for an overdue invoice', at: '2026-10-29T08:15', turns: [
      ['Draft a polite reminder for invoice 2041, which is 14 days overdue.', ['Here is a short draft: “Hi Dana, a quick reminder that invoice 2041 for $1,240 was due on October 15. Could you let me know when we can expect payment? Happy to resend it if that helps.”']],
      ['Make it a little firmer.', ['“Hi Dana, invoice 2041 for $1,240 is now 14 days past due. Please arrange payment by Friday, November 1, or tell me today if something is holding it up.”']]
    ] },
    { id: 'standup', model: 'Sonnet 5.5', tokens: [6480, 520], cost: 0.03, files: ['standup-2026-10-28.md'], tools: [], title: 'Summarize Tuesday’s standup notes', at: '2026-10-28T17:20', turns: [
      ['Summarize these standup notes in three lines.', ['Search indexing ships Thursday behind a flag. The billing migration is blocked on a schema review. Two people are out Friday, so the retro moves to Monday.']],
      ['Who owns the schema review?', ['Priya owns it, with Sam as the second reviewer. The notes give no date, so it is worth asking for one.']]
    ] },
    { id: 'query', model: 'Opus 5.5', tokens: [14200, 1880], cost: 0.36, files: ['reports.sql', 'explain-plan.txt'], tools: ['sql_explain'], title: 'Why the reports query is slow', at: '2026-10-28T11:05', turns: [
      ['The monthly reports query takes 40 seconds. Where should I look first?', ['Start with the plan. A sequential scan on events filtered by account and month usually means the composite index is missing or not selective enough.']],
      ['The plan shows a sort spilling to disk.', ['Then the sort is larger than the working memory allowed for it. Sort fewer rows by filtering first, or add an index that already returns rows in the order you need.']]
    ] },
    { id: 'onboarding', model: 'Sonnet 5.5', tokens: [1240, 260], cost: 0.01, files: [], tools: ['drive_search'], title: 'Onboarding checklist for a new designer', at: '2026-10-26T14:30', turns: [
      ['What should a new product designer have by the end of week one?', ['Access to the design files, the component library and the research archive; one shadowed customer call; and a small shipped fix so the release path is familiar.']]
    ] },
    { id: 'pricing', model: 'Sonnet 5.5', tokens: [980, 140], cost: 0.004, files: [], tools: ['calculator'], title: 'Compare annual and monthly pricing', at: '2026-10-24T10:10', turns: [
      ['Is annual billing worth it at $18 a month versus $180 a year?', ['Annual saves $36 a year, two months free. It is worth it if you are confident you will use it for at least ten months.']]
    ] },
    { id: 'trip', model: 'Sonnet 5.5', tokens: [1100, 230], cost: 0.005, files: [], tools: ['weather_forecast'], title: 'Packing list for a three-day site visit', at: '2026-10-12T19:45', turns: [
      ['Packing list for three days at a construction site in late October?', ['Safety boots, a hard hat if the site does not lend one, layers and a waterproof shell, a headlamp, a notebook in a zip bag, and chargers for a day without power.']]
    ] }
  ];
  // Detail card formatting. Excerpts cut at a word boundary; costs under a cent never read as $0.00.
  const COUNT = new Intl.NumberFormat('en-US');
  const usd = n => n < 0.01 ? 'Under $0.01' : `$${n.toFixed(2)}`;
  const excerpt = (text, max) => {
    if (text.length <= max) return text;
    const cut = text.lastIndexOf(' ', max);
    return text.slice(0, cut > max / 2 ? cut : max).replace(/[\s,.;:–—]+$/, '') + '…';
  };
  const activeLabel = at => { const d = daysAgo(at); return `${d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : dayLabel(at)}, ${clock(at)}`; };
  const chatText = chat => (chat.title + ' ' + chat.turns.map(([q, a]) => q + ' ' + a.join(' ')).join(' ')).toLowerCase();

  for (const block of find('[data-ps-chat-history]')) {
    roots.push(block);
    const key = 'kb-chats-' + (++uid);
    const search = block.querySelector('[data-chat-search]'), list = block.querySelector('[data-chat-list]');
    const empty = block.querySelector('[data-chat-empty]'), status = block.querySelector('[data-chat-status]');
    const undoButton = block.querySelector('[data-chat-undo]'), count = block.querySelector('[data-chat-count]');
    const thread = block.querySelector('[data-chat-thread]'), transcript = block.querySelector('[data-chat-transcript]');
    const toggle = block.querySelector('[data-chat-questions-toggle]'), questions = block.querySelector('[data-chat-questions]');
    let chats = CHATS.map(chat => ({ ...chat, text: chatText(chat) }));
    let selected = chats.some(c => c.id === block.dataset.chatSelected) ? block.dataset.chatSelected : chats[0].id;
    let editing = null, undo = null, leaving = 0, leavingId = null, closing = 0;
    // One details card at a time, opened by the row's disclosure button; opening the thread stays the row's main action.
    let expanded = null;

    const visible = () => { const q = search?.value.trim().toLowerCase() || ''; return q ? chats.filter(c => c.text.includes(q)) : chats; };
    const rowButton = id => list?.querySelector(`[data-chat-open="${id}"]`);
    const say = (text, canUndo = false) => { if (status) status.textContent = text; if (undoButton) undoButton.hidden = !canUndo; };

    /* Details card: the last two turns trimmed, the model, token and cost totals, what the conversation touched and
       when it was last active. Built from the chat record with textContent only. */
    const cardId = id => `${key}-card-${id}`;
    const fact = (term, value) => { const row = node('div'); row.append(node('dt', '', term), node('dd', '', value)); return row; };
    const buildCard = chat => {
      const slot = node('div', 'ps-chats-card-slot'), card = node('div', 'ps-chats-card');
      slot.id = cardId(chat.id); slot.setAttribute('role', 'group'); slot.setAttribute('aria-label', `Details for “${chat.title}”`);
      const recent = chat.turns.slice(-2), turns = node('ol', 'ps-chats-card-turns'), lead = node('div', 'ps-chats-card-recent');
      for (const [question, answer] of recent) { const li = node('li'); li.append(node('p', 'ps-chats-card-ask', excerpt(question, 80)), node('p', 'ps-chats-card-reply', excerpt(answer[0], 100))); turns.append(li); }
      lead.append(node('p', 'ps-chats-card-caption', chat.turns.length === 1 ? 'The only turn' : chat.turns.length === 2 ? 'Both turns' : `Last 2 of ${chat.turns.length} turns`), turns);
      const [tokensIn, tokensOut] = chat.tokens, sum = tokensIn + tokensOut, facts = node('dl', 'ps-chats-card-facts');
      facts.append(fact('Model', chat.model), fact('Tokens', COUNT.format(sum)), fact('Cost', usd(chat.cost)), fact('Last active', activeLabel(chat.at)));
      const meter = node('dl', 'ps-chats-card-meter'), row = node('div'), track = node('span', 'ps-chats-meter-track');
      track.setAttribute('aria-hidden', 'true');
      for (const [share, kind] of [[tokensIn / sum, 'input'], [tokensOut / sum, 'output']]) { const fill = node('i'); fill.dataset.kind = kind; fill.style.width = `${(share * 100).toFixed(2)}%`; track.append(fill); }
      row.append(node('dt', '', 'Tokens in · out'), track, node('dd', '', `${COUNT.format(tokensIn)} · ${COUNT.format(tokensOut)}`)); meter.append(row);
      const touched = node('dl', 'ps-chats-card-touched');
      for (const [term, items] of [['Files', chat.files], ['Tools', chat.tools]]) {
        const row = node('div'), value = node('dd');
        if (items.length) { const ul = node('ul'); for (const item of items) ul.append(node('li', '', item)); value.append(ul); } else value.append(node('span', 'ps-chats-card-none', 'None'));
        row.append(node('dt', '', term), value); touched.append(row);
      }
      card.append(lead, facts, meter, touched); slot.append(card);
      return slot;
    };
    const cardFrames = height => [{ height: `${height}px`, opacity: 0.72 }, { height: '0px', opacity: 0 }];
    const markOpen = (li, open) => {
      li.toggleAttribute('data-expanded', open);
      const button = li.querySelector('[data-chat-details]'); if (!button) return;
      button.setAttribute('aria-expanded', String(open));
      if (open) button.setAttribute('aria-controls', cardId(li.dataset.chat)); else button.removeAttribute('aria-controls');
    };
    // Opening grows the card under its row; the card it replaces collapses as an inert, unlabeled copy at the same time.
    // Both run only for pointer input; keyboard and reduced motion change at once. Focus stays on the disclosure button.
    const setDetails = (id, animated = true) => {
      const before = expanded, oldLi = before && list?.querySelector(`[data-chat="${before}"]`), oldSlot = oldLi?.querySelector('.ps-chats-card-slot');
      expanded = id;
      if (oldLi) markOpen(oldLi, false);
      if (oldSlot) {
        const height = oldSlot.offsetHeight;
        oldSlot.removeAttribute('id'); oldSlot.removeAttribute('role'); oldSlot.removeAttribute('aria-label'); oldSlot.setAttribute('aria-hidden', 'true'); oldSlot.inert = true;
        const out = animated && height ? animate(oldSlot, cardFrames(height), ms('--press', 160)) : null;
        if (out) out.onfinish = out.oncancel = () => oldSlot.remove(); else oldSlot.remove();
      }
      const li = id && list?.querySelector(`[data-chat="${id}"]:not([data-editing])`), chat = chats.find(c => c.id === id);
      if (li && chat) {
        const slot = buildCard(chat); li.append(slot); markOpen(li, true);
        if (animated) { animate(slot, cardFrames(slot.offsetHeight).reverse(), ms('--settle', 220)); animate(slot.firstChild, [{ transform: 'translateY(-4px)' }, { transform: 'none' }], ms('--settle', 220)); }
      }
      if (before !== id) emit(block, 'pagesystem:chat-history', { action: id ? 'details' : 'close-details', id: id ?? before });
    };

    const renderList = () => {
      if (!list) return;
      const shown = visible(), q = search?.value.trim() || '';
      const roving = shown.some(c => c.id === selected) ? selected : shown[0]?.id;
      list.replaceChildren();
      for (const [group, title] of GROUPS) {
        const rows = shown.filter(c => groupOf(c.at) === group);
        if (!rows.length) continue;
        const section = node('div', 'ps-chats-group'), heading = node('h2', 'ps-chats-group-title', title), ul = node('ul', 'ps-chats-rows');
        heading.id = `${key}-${group}`; section.setAttribute('role', 'group'); section.setAttribute('aria-labelledby', heading.id);
        for (const chat of rows) {
          const li = node('li', 'ps-chats-row'), tab = chat.id === roving ? 0 : -1;
          li.dataset.chat = chat.id;
          if (chat.id === selected) li.dataset.selected = '';
          if (chat.id === editing) {
            const input = node('input', 'ps-input ps-chats-rename');
            input.type = 'text'; input.value = chat.title; input.maxLength = 80; input.dataset.chatRename = chat.id;
            input.setAttribute('aria-label', 'Conversation title');
            li.dataset.editing = ''; li.append(input); ul.append(li); continue;
          }
          const open = node('button', 'ps-chats-open'), time = node('time', 'ps-chats-time', whenLabel(chat.at));
          open.type = 'button'; open.dataset.chatOpen = chat.id; open.tabIndex = tab;
          if (chat.id === selected) open.setAttribute('aria-current', 'true');
          time.dateTime = chat.at;
          open.append(node('span', 'ps-chats-title', chat.title), time);
          const actions = node('span', 'ps-chats-actions');
          for (const [action, name, text] of [['rename', 'pencil', 'Rename'], ['delete', 'trash', 'Delete']]) {
            const button = node('button', 'ps-chats-icon');
            button.type = 'button'; button.tabIndex = tab; button.dataset.chatAction = action;
            button.setAttribute('aria-label', `${text} “${chat.title}”`); button.append(icon(name)); actions.append(button);
          }
          const more = node('button', 'ps-chats-icon ps-chats-more');
          more.type = 'button'; more.tabIndex = tab; more.dataset.chatDetails = chat.id;
          more.setAttribute('aria-label', `Details for “${chat.title}”`); more.append(icon('chevron')); actions.append(more);
          const body = node('div', 'ps-chats-row-body'); body.append(open, actions);
          li.append(body); ul.append(li);
          if (chat.id === expanded) { li.append(buildCard(chat)); markOpen(li, true); } else markOpen(li, false);
        }
        section.append(heading, ul); list.append(section);
      }
      if (empty) {
        empty.hidden = shown.length > 0;
        empty.querySelector('[data-chat-empty-text]').textContent = q ? `No conversations match “${q}”.` : 'No conversations left. Undo the last delete to bring it back.';
        empty.querySelector('[data-chat-clear]').hidden = !q;
      }
      if (count) count.textContent = q ? `${shown.length} of ${chats.length} conversations match` : `${chats.length} ${chats.length === 1 ? 'conversation' : 'conversations'} · sample data`;
    };

    const closeQuestions = (refocus = false, fade = false) => {
      if (!questions || questions.hidden) return;
      closing = cancel(closing);
      transcript.inert = false; thread.removeAttribute('data-questions'); toggle.setAttribute('aria-pressed', 'false');
      const done = () => { closing = 0; questions.hidden = true; questions.removeAttribute('data-leaving'); };
      if (fade && !still()) { questions.dataset.leaving = ''; closing = later(done, ms('--press', 160)); } else done();
      if (refocus) toggle.focus();
    };

    const renderThread = () => {
      if (!thread) return;
      const chat = chats.find(c => c.id === selected);
      closeQuestions();
      thread.querySelector('[data-chat-title]').textContent = chat ? chat.title : 'No conversation selected';
      const meta = thread.querySelector('[data-chat-meta]');
      if (meta) meta.textContent = chat ? `${GROUPS.find(g => g[0] === groupOf(chat.at))[1]} · ${whenLabel(chat.at)} · ${chat.turns.length} ${chat.turns.length === 1 ? 'question' : 'questions'}` : 'Choose a conversation from the list.';
      if (toggle) toggle.disabled = !chat || chat.turns.length < 2;
      transcript.replaceChildren(); transcript.scrollTop = 0;
      const ol = questions?.querySelector('[data-chat-question-list]'); ol?.replaceChildren();
      if (!chat) { transcript.append(node('p', 'ps-chats-none', 'Select a conversation to read it here.')); return; }
      chat.turns.forEach(([q, answer], i) => {
        const turn = node('div', 'ps-chats-turn'), ask = node('p', 'ps-chats-ask'), reply = node('div', 'ps-chats-answer');
        ask.append(node('span', 'ps-chats-who', 'You'), q);
        ask.id = `${key}-q${i}`; ask.tabIndex = -1;
        for (const text of answer) reply.append(node('p', '', text));
        turn.append(ask, reply); transcript.append(turn);
        if (ol) { const li = node('li'), jump = node('button', 'ps-chats-question', q); jump.type = 'button'; jump.dataset.chatJump = String(i); li.append(jump); ol.append(li); }
      });
    };

    const select = (id, focus = true) => {
      if (!chats.some(c => c.id === id)) return;
      const changed = id !== selected;
      flush(); selected = id; renderList();
      if (changed) { renderThread(); animate(transcript, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], ms('--press', 160)); }
      if (focus) rowButton(id)?.focus();
      if (changed) emit(block, 'pagesystem:chat-history', { action: 'select', id });
    };

    const startRename = id => { flush(); editing = id; renderList(); const input = list.querySelector('[data-chat-rename]'); input?.focus(); input?.select(); };
    const finishRename = (commit, refocus = true) => {
      const input = list.querySelector('[data-chat-rename]'); if (!input) return;
      const chat = chats.find(c => c.id === editing), next = input.value.trim().replace(/\s+/g, ' ');
      editing = null;
      if (commit && next && next !== chat.title) {
        const before = chat.title; chats = chats.map(c => c.id === chat.id ? { ...c, title: next, text: chatText({ ...c, title: next }) } : c);
        undo = { kind: 'rename', id: chat.id, title: before };
        say(`Renamed to “${next}”.`, true); emit(block, 'pagesystem:chat-history', { action: 'rename', id: chat.id, title: next });
      } else if (commit && !next) say(`A title cannot be empty. Kept “${chat.title}”.`);
      renderList(); if (chat.id === selected && thread) renderThread();
      if (refocus) rowButton(chat.id)?.focus();
    };

    // A deleted row collapses before the list re-renders; any other action first completes a pending collapse.
    const flush = () => { if (!leaving) return; leaving = cancel(leaving); commitRemove(leavingId); };
    const remove = id => {
      flush();
      if (expanded === id) setDetails(null, false);
      const li = list?.querySelector(`[data-chat="${id}"]`);
      if (!li || still()) { commitRemove(id); return; }
      const ids = visible().map(c => c.id), at = ids.indexOf(id), neighbor = ids[at + 1] ?? ids[at - 1];
      if (neighbor) rowButton(neighbor)?.focus();
      li.dataset.leaving = ''; li.inert = true; leavingId = id;
      leaving = later(() => { leaving = 0; commitRemove(id); }, ms('--settle', 220));
    };
    const commitRemove = id => {
      const index = chats.findIndex(c => c.id === id); if (index < 0) return;
      const chat = chats[index], shownBefore = visible(), at = shownBefore.findIndex(c => c.id === id);
      chats = chats.filter(c => c.id !== id); undo = { kind: 'delete', chat, index, wasSelected: selected === id };
      if (expanded === id) expanded = null;
      const neighbor = visible()[Math.min(at, visible().length - 1)];
      if (selected === id) { selected = neighbor?.id ?? chats[0]?.id ?? null; renderThread(); }
      renderList(); say(`Deleted “${chat.title}”.`, true);
      (neighbor ? rowButton(neighbor.id) : search || undoButton)?.focus();
      emit(block, 'pagesystem:chat-history', { action: 'delete', id });
    };

    const restore = () => {
      flush();
      if (!undo) return;
      const last = undo; undo = null;
      if (last.kind === 'delete') {
        chats = [...chats.slice(0, last.index), last.chat, ...chats.slice(last.index)];
        if (last.wasSelected || !selected) { selected = last.chat.id; renderThread(); }
        say(`Restored “${last.chat.title}”.`);
      } else {
        chats = chats.map(c => c.id === last.id ? { ...c, title: last.title, text: chatText({ ...c, title: last.title }) } : c);
        if (last.id === selected) renderThread();
        say(`Title restored to “${last.title}”.`);
      }
      renderList(); (rowButton(last.kind === 'delete' ? last.chat.id : last.id) || search)?.focus();
      const back = last.kind === 'delete' && list?.querySelector(`[data-chat="${last.chat.id}"]`);
      if (back) animate(back, [{ gridTemplateRows: '0fr', opacity: 0 }, { gridTemplateRows: '1fr', opacity: 1 }], ms('--settle', 220));
      emit(block, 'pagesystem:chat-history', { action: 'undo', id: last.kind === 'delete' ? last.chat.id : last.id });
    };

    if (list) {
      listen(list, 'click', event => {
        const open = event.target.closest('[data-chat-open]');
        if (open) { select(open.dataset.chatOpen); return; }
        const more = event.target.closest('[data-chat-details]');
        if (more) { flush(); setDetails(expanded === more.dataset.chatDetails ? null : more.dataset.chatDetails); return; }
        const action = event.target.closest('[data-chat-action]'); if (!action) return;
        const id = action.closest('[data-chat]').dataset.chat;
        if (action.dataset.chatAction === 'rename') startRename(id); else remove(id);
      });
      listen(list, 'keydown', event => {
        const rename = event.target.closest('[data-chat-rename]');
        if (rename) {
          if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); finishRename(true); }
          else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finishRename(false); }
          return;
        }
        const row = event.target.closest('[data-chat]'); if (!row) return;
        if (event.key === 'Escape' && expanded) { event.preventDefault(); setDetails(null, false); return; }
        const ids = [...list.querySelectorAll('[data-chat-open]')].map(b => b.dataset.chatOpen), at = ids.indexOf(row.dataset.chat);
        const move = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: ids.length - 1 }[event.key];
        if (move !== undefined) { event.preventDefault(); if (ids[move]) select(ids[move]); }
        else if (event.key === 'F2') { event.preventDefault(); startRename(row.dataset.chat); }
        else if ((event.key === 'Delete' || event.key === 'Backspace') && event.target.matches('[data-chat-open]')) { event.preventDefault(); remove(row.dataset.chat); }
      });
      listen(list, 'focusout', event => { if (event.target.matches('[data-chat-rename]') && editing) finishRename(true, false); });
    }
    if (search) {
      listen(search, 'input', () => { flush(); editing = null; renderList(); });
      listen(search, 'keydown', event => {
        if (event.key === 'ArrowDown') { const first = list.querySelector('[data-chat-open]'); if (first) { event.preventDefault(); select(first.dataset.chatOpen); } }
        else if (event.key === 'Escape' && search.value) { event.preventDefault(); search.value = ''; renderList(); }
      });
    }
    const clear = block.querySelector('[data-chat-clear]');
    if (clear) listen(clear, 'click', () => { search.value = ''; renderList(); search.focus(); });
    if (undoButton) listen(undoButton, 'click', restore);

    if (toggle && questions) {
      listen(toggle, 'click', () => {
        if (!questions.hidden && !closing) { closeQuestions(false, true); return; }
        closing = cancel(closing); questions.removeAttribute('data-leaving');
        questions.hidden = false; transcript.inert = true; thread.dataset.questions = 'open';
        toggle.setAttribute('aria-pressed', 'true');
        // Each question travels from where it sits in the transcript into the column; off-screen ones drop in.
        const view = transcript.getBoundingClientRect();
        for (const jump of questions.querySelectorAll('[data-chat-jump]')) {
          const from = transcript.querySelector(`#${key}-q${jump.dataset.chatJump}`).getBoundingClientRect(), to = jump.getBoundingClientRect();
          const seen = from.bottom > view.top && from.top < view.bottom;
          animate(jump, seen ? [{ transform: `translate(${from.right - to.right}px, ${from.top - to.top}px)` }, { transform: 'none' }] : [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], ms('--settle', 220));
        }
        questions.querySelector('[data-chat-jump]')?.focus();
        emit(block, 'pagesystem:chat-history', { action: 'questions', id: selected });
      });
      listen(questions, 'click', event => {
        const jump = event.target.closest('[data-chat-jump]'); if (!jump) return;
        const smooth = !still();
        closeQuestions(false, true);
        const ask = transcript.querySelector(`#${key}-q${jump.dataset.chatJump}`);
        const top = ask.getBoundingClientRect().top - transcript.getBoundingClientRect().top + transcript.scrollTop - 16;
        transcript.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
        ask.focus({ preventScroll: true });
        emit(block, 'pagesystem:chat-history', { action: 'jump', id: selected, question: Number(jump.dataset.chatJump) });
      });
      listen(questions, 'keydown', event => {
        const jumps = [...questions.querySelectorAll('[data-chat-jump]')], at = jumps.indexOf(doc.activeElement);
        if (event.key === 'Escape') { event.preventDefault(); closeQuestions(true); }
        else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && at >= 0) { event.preventDefault(); jumps[Math.max(0, Math.min(jumps.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)))].focus(); }
      });
    }
    renderList(); renderThread(); if (count && !list) count.textContent = '';
  }

  /* Streaming text: the final reply is in the markup; words are hidden and revealed in order at a chosen pace. */
  const TICK = 48; // DOM writes are batched to about twenty per second whatever the pace.
  const BLOCKS = 'h2,h3,h4,p,ul,ol,li,pre,figure,blockquote';
  for (const block of find('[data-ps-streaming-text]')) {
    roots.push(block);
    const reply = block.querySelector('[data-stream-reply]'), live = block.querySelector('[data-stream-live]');
    const stateText = block.querySelector('[data-stream-state]'), progress = block.querySelector('[data-stream-progress]');
    const toggle = block.querySelector('[data-stream-toggle]'), stop = block.querySelector('[data-stream-stop]');
    const replay = block.querySelector('[data-stream-replay]'), paceSelect = block.querySelector('[data-stream-pace]');
    const tokens = [];
    const collect = el => {
      for (const child of [...el.childNodes]) {
        if (child.nodeType === 3 && child.data.trim()) {
          const parts = child.data.match(/\s*\S+\s*/g), frag = doc.createDocumentFragment();
          for (const part of parts) { const span = node('span', 'ps-stream-w', part); tokens.push(span); frag.append(span); }
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          if (child.hasAttribute('data-stream-atom')) { child.classList.add('ps-stream-w'); tokens.push(child); } else collect(child);
        }
      }
    };
    collect(reply);
    const containers = [...reply.querySelectorAll(BLOCKS)];
    let index = tokens.length, state = 'complete', timer = 0, settle = 0, fading = 0, last = 0, carry = 0, played = false;
    const pace = () => Math.max(4, Number(paceSelect?.value || block.dataset.streamMs || 28));
    const announce = text => { if (live) live.textContent = text; };
    const reveal = token => { token.hidden = false; for (let el = token.parentElement; el && el !== reply; el = el.parentElement) if (el.hidden) el.hidden = false; };
    const paint = () => {
      const words = `${index} of ${tokens.length} words`;
      const text = { streaming: 'Streaming', paused: 'Paused', stopped: 'Stopped, reply incomplete', complete: 'Reply complete' }[state];
      block.dataset.streamState = state;
      if (stateText) stateText.textContent = text;
      if (progress) progress.textContent = state === 'complete' ? `${tokens.length} words` : words;
      reply.setAttribute('aria-busy', String(state === 'streaming'));
      if (toggle) {
        const focused = doc.activeElement === toggle;
        label(toggle, state === 'paused' ? 'play' : 'pause', state === 'paused' ? 'Resume' : 'Pause');
        toggle.hidden = state === 'complete' || state === 'stopped';
        if (focused && toggle.hidden) replay?.focus();
      }
      if (stop) { const focused = doc.activeElement === stop; stop.hidden = state !== 'streaming'; if (focused && stop.hidden) replay?.focus(); }
    };
    const finish = () => {
      timer = cancel(timer); index = tokens.length; for (const token of tokens) reveal(token);
      state = 'complete'; paint(); announce(`Reply complete, ${tokens.length} words.`);
      settle = cancel(settle); settle = later(() => reply.removeAttribute('data-stream-animate'), 600);
      emit(block, 'pagesystem:streaming-text', { state, words: index, total: tokens.length });
    };
    const step = () => {
      timer = 0; const now = win.performance.now();
      carry += (now - last) / pace(); last = now;
      let n = Math.floor(carry); carry -= n;
      while (n-- > 0 && index < tokens.length) reveal(tokens[index++]);
      if (index >= tokens.length) { finish(); return; }
      paint(); timer = later(step, TICK);
    };
    const run = () => { state = 'streaming'; last = win.performance.now(); carry = 1; paint(); step(); };
    const play = () => {
      played = true; timer = cancel(timer); settle = cancel(settle); fading = cancel(fading);
      reply.removeAttribute('data-stream-leaving');
      if (reducedMotion()) { reply.removeAttribute('data-stream-animate'); finish(); announce(`Reply shown in full, ${tokens.length} words.`); return; }
      for (const el of containers) el.hidden = true;
      for (const token of tokens) token.hidden = true;
      index = 0; reply.dataset.streamAnimate = ''; announce('Reply streaming.');
      emit(block, 'pagesystem:streaming-text', { state: 'streaming', words: 0, total: tokens.length });
      run();
    };
    if (toggle) listen(toggle, 'click', () => {
      if (state === 'streaming') { timer = cancel(timer); state = 'paused'; paint(); announce(`Paused at ${index} of ${tokens.length} words.`); }
      else if (state === 'paused') { announce('Resumed.'); run(); }
      emit(block, 'pagesystem:streaming-text', { state, words: index, total: tokens.length });
    });
    if (stop) listen(stop, 'click', () => {
      if (state !== 'streaming') return;
      timer = cancel(timer); state = 'stopped'; paint(); announce(`Stopped. The reply is incomplete at ${index} of ${tokens.length} words.`);
      emit(block, 'pagesystem:streaming-text', { state, words: index, total: tokens.length });
    });
    // Replay fades the old reply out before streaming again; a key press or reduced motion restarts at once.
    const restart = () => {
      if (still() || !index) { play(); return; }
      timer = cancel(timer); fading = cancel(fading);
      reply.dataset.streamLeaving = ''; fading = later(play, ms('--press', 160));
    };
    if (replay) listen(replay, 'click', restart);
    if (paceSelect) listen(paceSelect, 'change', () => emit(block, 'pagesystem:streaming-text', { state, pace: pace(), words: index, total: tokens.length }));
    paint();
    // Autoplay runs once, the first time the reply is scrolled into view, and never under reduced motion.
    if (block.hasAttribute('data-stream-autoplay') && !reducedMotion() && 'IntersectionObserver' in win) {
      const watch = new win.IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        watch.disconnect(); observers.delete(watch);
        if (!played && !reducedMotion()) play();
      }, { threshold: 0.35 });
      watch.observe(block); observers.add(watch);
    }
  }

  /* Inline citations: markers open one shared source card on hover, focus or click; the source list owns the facts. */
  for (const block of find('[data-ps-inline-citations]')) {
    roots.push(block);
    const card = block.querySelector('[data-cite-card]');
    const markers = [...block.querySelectorAll('[data-cite]')];
    const sources = new Map();
    for (const li of block.querySelectorAll('[data-source]')) {
      const text = sel => li.querySelector(sel)?.textContent.trim() || '';
      sources.set(li.dataset.source, { li, mark: text('[data-source-mark]'), publisher: text('[data-source-publisher]'), title: text('[data-source-title]'), summary: text('[data-source-summary]'), date: text('[data-source-date]') });
    }
    const idsOf = marker => marker.dataset.cite.split(/\s+/).filter(id => sources.has(id));
    for (const marker of markers) {
      const ids = idsOf(marker), names = ids.map(id => sources.get(id).publisher).join(', ');
      // The accessible name starts with the visible text so speech input can target the marker.
      const visible = [...marker.childNodes].filter(n => n.nodeType === 3 || n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join('').trim();
      const plural = ids.length > 1 ? 'Sources' : 'Source';
      if (/^\d/.test(visible)) marker.setAttribute('aria-label', `${plural} ${visible}: ${names}`);
      else marker.append(node('span', 'ps-visually-hidden', `, ${plural.toLowerCase()} ${ids.join(', ')}: ${names}`));
      marker.setAttribute('aria-expanded', 'false'); marker.setAttribute('aria-controls', card.id); marker.setAttribute('aria-haspopup', 'dialog');
    }
    const nav = card.querySelector('[data-card-nav]'), prev = card.querySelector('[data-card-prev]'), next = card.querySelector('[data-card-next]');
    const link = card.querySelector('[data-card-link]');
    let active = null, ids = [], page = 0, pinned = false, openTimer = 0, closeTimer = 0, leaveTimer = 0, returning = false;

    const place = () => {
      if (!active) return;
      const box = block.getBoundingClientRect(), mark = active.getBoundingClientRect();
      const width = card.offsetWidth, height = card.offsetHeight;
      const left = Math.max(8, Math.min(mark.left - box.left, box.width - width - 8));
      const below = mark.bottom + 8 + height <= win.innerHeight || mark.top - 8 - height < 0;
      card.style.left = `${left}px`;
      card.style.top = `${below ? mark.bottom - box.top + 8 : mark.top - box.top - 8 - height}px`;
      card.dataset.side = below ? 'below' : 'above';
      // The card grows from the marker it belongs to.
      card.style.transformOrigin = `${Math.round(mark.left + mark.width / 2 - box.left - left)}px ${below ? '0' : '100%'}`;
    };
    const paintCard = () => {
      const source = sources.get(ids[page]);
      for (const s of sources.values()) s.li.removeAttribute('data-active');
      source.li.dataset.active = '';
      card.querySelector('[data-card-mark]').textContent = source.mark;
      card.querySelector('[data-card-publisher]').textContent = source.publisher;
      card.querySelector('[data-card-title]').textContent = source.title;
      card.querySelector('[data-card-summary]').textContent = source.summary;
      card.querySelector('[data-card-date]').textContent = source.date;
      nav.hidden = ids.length < 2;
      card.querySelector('[data-card-count]').textContent = `${page + 1} / ${ids.length}`;
      prev.disabled = page === 0; next.disabled = page === ids.length - 1;
      link.href = '#' + source.li.id; link.textContent = `Show source ${ids[page]} in the list`;
    };
    const show = (marker, pin) => {
      openTimer = cancel(openTimer); closeTimer = cancel(closeTimer);
      if (active && active !== marker) active.setAttribute('aria-expanded', 'false');
      if (active !== marker) { ids = idsOf(marker); page = 0; }
      active = marker; pinned = pin; marker.setAttribute('aria-expanded', 'true');
      leaveTimer = cancel(leaveTimer); card.removeAttribute('data-leaving');
      card.hidden = false; paintCard(); place();
      emit(block, 'pagesystem:inline-citations', { action: 'open', sources: ids, page });
    };
    const hide = refocus => {
      openTimer = cancel(openTimer); closeTimer = cancel(closeTimer);
      if (!active) return;
      const marker = active; active = null; pinned = false;
      marker.setAttribute('aria-expanded', 'false');
      const done = () => { leaveTimer = 0; card.hidden = true; card.removeAttribute('data-leaving'); };
      leaveTimer = cancel(leaveTimer);
      if (refocus || still()) done(); else { card.dataset.leaving = ''; leaveTimer = later(done, ms('--press', 160)); }
      for (const s of sources.values()) s.li.removeAttribute('data-active');
      if (refocus) { returning = true; marker.focus(); returning = false; }
    };
    const sliding = [...card.children].filter(el => !el.matches('[data-card-nav]'));
    const turn = delta => {
      const to = page + delta; if (to < 0 || to >= ids.length) return;
      page = to; paintCard(); place();
      for (const el of sliding) animate(el, [{ opacity: 0, transform: `translateX(${delta * 8}px)` }, { opacity: 1, transform: 'none' }], ms('--press', 160));
      emit(block, 'pagesystem:inline-citations', { action: 'page', sources: ids, page });
    };
    const tabbables = () => [...block.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')].filter(el => !card.contains(el) && !el.closest('[hidden]'));

    listen(block, 'pointerover', event => {
      if (event.pointerType !== 'mouse') return;
      const marker = event.target.closest('[data-cite]');
      if (event.target.closest('[data-cite-card]')) { closeTimer = cancel(closeTimer); return; }
      if (!marker) return;
      closeTimer = cancel(closeTimer);
      if (pinned || marker === active) return;
      openTimer = cancel(openTimer); openTimer = later(() => show(marker, false), active ? 0 : 120);
    });
    listen(block, 'pointerout', event => {
      if (event.pointerType !== 'mouse') return;
      const from = event.target.closest('[data-cite],[data-cite-card]'), to = event.relatedTarget?.closest?.('[data-cite],[data-cite-card]');
      if (!from || to) return;
      openTimer = cancel(openTimer);
      if (!pinned && active) closeTimer = later(() => { if (!card.contains(doc.activeElement) && doc.activeElement !== active) hide(false); }, 200);
    });
    listen(block, 'focusin', event => {
      const marker = event.target.closest('[data-cite]');
      if (marker && !returning && marker !== active && marker.matches(':focus-visible')) show(marker, false);
    });
    listen(block, 'focusout', event => {
      const to = event.relatedTarget;
      if (active && to && to !== active && !card.contains(to) && !to.closest?.('[data-cite]')) hide(false);
    });
    listen(block, 'click', event => {
      const marker = event.target.closest('[data-cite]');
      if (!marker) return;
      if (marker === active && pinned) { hide(false); return; }
      show(marker, true);
      if (event.detail === 0) card.focus();
    });
    listen(doc, 'pointerdown', event => { if (active && !card.contains(event.target) && !event.target.closest?.('[data-cite]')) hide(false); });
    listen(block, 'keydown', event => {
      if (!active) return;
      const inCard = card.contains(event.target);
      if (event.key === 'Escape') { event.preventDefault(); hide(inCard || event.target === active); }
      else if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && (inCard || event.target === active) && ids.length > 1) { event.preventDefault(); turn(event.key === 'ArrowRight' ? 1 : -1); }
      else if (event.key === 'Tab' && inCard) {
        const inside = [...card.querySelectorAll('button:not(:disabled),a[href]')].filter(el => !el.closest('[hidden]'));
        const leavingBack = event.shiftKey && (event.target === card || event.target === inside[0]);
        const leavingForward = !event.shiftKey && event.target === inside[inside.length - 1];
        if (!leavingBack && !leavingForward) return;
        event.preventDefault();
        const marker = active, order = tabbables(), after = order[order.indexOf(marker) + 1];
        hide(false); returning = true; (leavingBack ? marker : after || marker).focus(); returning = false;
      }
    });
    listen(prev, 'click', () => turn(-1));
    listen(next, 'click', () => turn(1));
    listen(link, 'click', event => {
      event.preventDefault();
      const li = sources.get(ids[page]).li;
      const folded = li.closest('details'); if (folded) folded.open = true;
      hide(false); li.tabIndex = -1; li.focus({ preventScroll: true }); li.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
    listen(win, 'resize', place);
  }

  if (roots.length) {
    const setKeyboard = next => { if (next === keyboard) return; keyboard = next; for (const el of roots) el.toggleAttribute('data-still', next); };
    listen(doc, 'keydown', () => setKeyboard(true));
    listen(doc, 'pointerdown', () => setKeyboard(false));
    listen(doc, 'pointermove', () => setKeyboard(false));
  }

  return () => {
    for (const id of timers) win.clearTimeout(id); timers.clear();
    for (const run of animations) run.cancel(); animations.clear();
    for (const watch of observers) watch.disconnect(); observers.clear();
  };
});

/* Kit C: plan card, task list and code block. Content lives in the inert specimen; these behaviors read it and keep state on the page. */
var PS_KITS = PS_KITS || [];

PS_KITS.push(function kitC(root, { doc, win, listen, find, emit }) {
  // Pure syntax tokenizer: one line in, typed runs out, with block-comment state carried to the next line.
  // O(L) per line of length L. Only keywords, strings and comments carry color.
  const PS_CODE_KEYWORDS = new Set('abstract as async await break case catch class const continue default delete do else enum export extends false finally for from function if implements import in instanceof interface let new null of private public readonly return satisfies static super switch this throw true try type typeof undefined var void while yield'.split(' '));
  function psCodeTokens(line, language, state) {
    const tokens = [], push = (type, text) => { if (!text) return; const last = tokens[tokens.length - 1]; if (last && last.type === type) last.text += text; else tokens.push({ type, text }); };
    const shell = language === 'shell', script = /^(?:ts|tsx|js|jsx|json)$/.test(language), css = language === 'css';
    let i = 0, inComment = state.inComment;
    while (i < line.length) {
      if (inComment) { const end = line.indexOf('*/', i); if (end < 0) { push('comment', line.slice(i)); i = line.length; } else { push('comment', line.slice(i, end + 2)); i = end + 2; inComment = false; } continue; }
      const rest = line.slice(i), ch = line[i];
      if ((script || css) && rest.startsWith('/*')) { inComment = true; continue; }
      if ((script && rest.startsWith('//')) || (shell && ch === '#' && (i === 0 || /\s/.test(line[i - 1])))) { push('comment', rest); break; }
      if (ch === '"' || ch === "'" || (ch === '`' && !shell)) {
        let j = i + 1; while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
        push('string', line.slice(i, j + 1)); i = j + 1; continue;
      }
      if (script && /[A-Za-z_$]/.test(ch)) { const word = /^[A-Za-z_$][\w$]*/.exec(rest)[0]; push(PS_CODE_KEYWORDS.has(word) ? 'keyword' : 'plain', word); i += word.length; continue; }
      push('plain', ch); i += 1;
    }
    return { tokens, state: { inComment } };
  }

  // Pure line model: raw specimen text to rows. Diff rows carry old/new numbers; shell rows carry prompt or output.
  function psCodeRows(text, { diff, shell, start, oldStart, newStart }) {
    const lines = text.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    let oldNo = oldStart, newNo = newStart, no = start;
    return lines.map(raw => {
      if (diff) {
        const sign = raw[0], body = raw.slice(1), change = sign === '+' ? 'added' : sign === '-' ? 'removed' : 'context';
        const row = { text: body, change, old: change === 'added' ? '' : String(oldNo), next: change === 'removed' ? '' : String(newNo) };
        if (change !== 'added') oldNo += 1; if (change !== 'removed') newNo += 1;
        return row;
      }
      if (shell) return raw.startsWith('$ ') ? { text: raw.slice(2), kind: 'prompt', number: String(no++) } : { text: raw, kind: 'output', number: String(no++) };
      return { text: raw, number: String(no++) };
    });
  }

  const timers = new Set(), intervals = new Set(), animations = new Set(), observers = new Set(), finishers = new Set();
  const later = (fn, ms) => { const id = win.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = id => { if (id) { win.clearTimeout(id); timers.delete(id); } };
  const node = (tag, text, cls) => { const el = doc.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const mac = /Mac|iPhone|iPad/.test(win.navigator.platform || win.navigator.userAgent || '');

  // Motion is presentation only: the DOM always holds the real state, animations only ease into it.
  // Durations and the curve come from the motion tokens so a host override applies here too.
  const reduced = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const moving = () => !reduced.matches;
  const rootStyle = win.getComputedStyle(doc.documentElement);
  const token = (name, fallback) => { const value = rootStyle.getPropertyValue(name).trim(); const n = parseFloat(value); return Number.isFinite(n) ? (value.endsWith('s') && !value.endsWith('ms') ? n * 1000 : n) : fallback; };
  const PRESS = token('--press', 160), SETTLE = token('--settle', 220), EASE = rootStyle.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
  const RISE = [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }];
  // Text rolls in under a clip rather than fading, so it never passes through an unreadable contrast.
  const TICK = [{ clipPath: 'inset(100% 0 0 0)', transform: 'translateY(4px)' }, { clipPath: 'inset(0)', transform: 'none' }];
  const POP = [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }];
  const DRAW = [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }];
  const play = (el, frames, duration = SETTLE, options = {}) => {
    if (!el || !moving() || typeof el.animate !== 'function') return null;
    const animation = el.animate(frames, { duration, easing: EASE, fill: 'backwards', ...options });
    animations.add(animation); const drop = () => animations.delete(animation); animation.finished.then(drop, drop);
    return animation;
  };
  // Changes the person makes with a pointer animate; keyboard-initiated changes apply at once.
  const trackInput = block => { listen(block, 'pointerdown', () => { block.dataset.input = 'pointer'; }); listen(block, 'keydown', () => { block.dataset.input = 'key'; }); };
  const userMotion = block => moving() && block.dataset.input !== 'key';
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < (win.innerHeight || 0) * 0.85 && r.height > 0; };
  // Runs once when the element is first mostly in view; O(1) per block, observer released on first hit or dispose.
  const onFirstView = (el, fn) => {
    if (inView(el) || typeof win.IntersectionObserver !== 'function') { fn(); return; }
    const io = new win.IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); observers.delete(io); fn(); } }, { threshold: 0.35 });
    io.observe(el); observers.add(io);
  };
  // One autoplay per block: frames run in order with their own wait; stop() cancels, finish() jumps to the authored state.
  const autoplay = ({ block, prepare, frames, settle, replay }) => {
    let pending = null, playing = false;
    const stop = () => { cancel(pending); pending = null; playing = false; block.removeAttribute('aria-busy'); };
    const finish = () => { if (!playing) return; stop(); settle(false); };
    const start = () => {
      stop(); if (!moving()) return;
      playing = true; block.setAttribute('aria-busy', 'true'); block.dataset.input = 'auto'; prepare();
      const queue = frames(); let i = 0;
      const next = () => { if (i >= queue.length) { stop(); settle(true); return; } const [run, wait] = queue[i++]; run(); pending = later(next, wait); };
      pending = later(next, 360);
    };
    if (replay && moving()) { replay.hidden = false; listen(replay, 'click', start); }
    // Any other interaction ends the demonstration first, so the person always acts on the real state.
    const interrupt = event => { if (playing && !(replay && replay.contains(event.target))) finish(); };
    listen(block, 'pointerdown', interrupt); listen(block, 'keydown', interrupt);
    if (typeof reduced.addEventListener === 'function') listen(reduced, 'change', () => { if (!moving()) { finish(); if (replay) replay.hidden = true; } });
    finishers.add(finish);
    if (moving()) onFirstView(block, start);
  };

  // Detail cards: one per component is open at a time, in its owner's disclosure region, built from the hidden source list there.
  // The region grows open; a hidden, inert copy of the region it left collapses in place, so the rows between glide.
  const GROW = height => [{ height: '0px', opacity: 0.72 }, { height: `${height}px`, opacity: 1 }];
  const NUDGE = [{ transform: 'translateY(-4px)' }, { transform: 'none' }];
  const collapseCopy = region => {
    const height = region.offsetHeight; if (!height || !moving()) return;
    const copy = region.cloneNode(true);
    copy.removeAttribute('id'); for (const el of copy.querySelectorAll('[id]')) el.removeAttribute('id');
    copy.setAttribute('aria-hidden', 'true'); copy.inert = true; copy.dataset.detailCopy = '';
    region.after(copy);
    const out = play(copy, GROW(height).reverse(), SETTLE, { fill: 'forwards' });
    if (out) { const drop = () => copy.remove(); out.finished.then(drop, drop); } else copy.remove();
  };
  const growOpen = (region, card) => { play(region, GROW(region.offsetHeight)); play(card, NUDGE); };
  // Source facts: <div data-fact="key"><dt>…</dt><dd>…</dd>…</div> inside a hidden dl.
  const factsOf = (source, key) => [...(source?.querySelector(`:scope > [data-fact="${key}"]`)?.querySelectorAll('dd') || [])];
  const firstFact = (source, key) => factsOf(source, key)[0]?.textContent.trim() || '';
  const minutesOf = (source, key) => { const n = Number(factsOf(source, key)[0]?.dataset.minutes); return Number.isFinite(n) && n >= 0 ? n : null; };
  const pair = (label, value, cls) => { const row = node('div', undefined, cls); row.append(node('dt', label), node('dd', value)); return row; };
  const caption = text => node('p', text, 'ps-detail-caption');
  const meter = (label, value, share) => {
    const list = node('dl', undefined, 'ps-detail-meters'), row = node('div', undefined, 'ps-detail-meter'), track = node('span', undefined, 'ps-detail-meter-track'), fill = node('i');
    track.setAttribute('aria-hidden', 'true'); fill.style.width = `${(Math.min(1, Math.max(0, share)) * 100).toFixed(2)}%`; track.append(fill);
    row.append(node('dt', label), track, node('dd', value)); list.append(row);
    return { list, fill, value: row.lastChild };
  };
  const idents = (items, label) => { const list = node('ul', undefined, 'ps-detail-idents'); list.setAttribute('aria-label', label); for (const text of items) list.append(node('li', text)); return list; };

  const PLAN_STATE_TEXT = { done: 'Done', active: 'In progress', pending: 'Pending', blocked: 'Blocked' };
  for (const block of find('[data-ps-plan-card]')) {
    trackInput(block);
    const steps = [...block.querySelectorAll('.ps-plan-step')];
    const list = block.querySelector('[data-plan-list]'), more = block.querySelector('[data-plan-more]');
    const badge = block.querySelector('[data-plan-badge]'), count = block.querySelector('[data-plan-count]'), status = block.querySelector('[data-plan-status]');
    const panes = [...block.querySelectorAll('[data-plan-pane]')], editor = block.querySelector('[data-plan-edit]');
    const progress = block.querySelector('[data-plan-progress]');
    const visible = Number(block.dataset.planVisible || steps.length);
    const labels = { pending: 'Awaiting approval', edit: 'Editing', approved: 'Approved', rejected: 'Rejected', running: 'Running', stopped: 'Stopped' };
    let state = block.dataset.planState || 'pending', before = state, expanded = false, countdown = null;
    for (const kbd of block.querySelectorAll('[data-plan-mod]')) kbd.textContent = mac ? '⌘' : 'Ctrl';
    const stepState = step => step.dataset.status || 'pending';
    const renderSteps = (animate = false) => {
      const collapsed = !expanded && steps.length > visible + 1;
      steps.forEach((step, i) => { const hide = collapsed && i >= visible; if (step.hidden && !hide && animate) play(step, RISE, SETTLE, { delay: (i - visible) * 24 }); step.hidden = hide; });
      if (more) {
        more.hidden = state === 'edit' || steps.length <= visible + 1;
        more.setAttribute('aria-expanded', String(!collapsed));
        const label = more.querySelector('[data-plan-more-label]'), text = collapsed ? `${steps.length - visible} more steps` : 'Show fewer steps';
        if (label.textContent !== text) { label.textContent = text; if (animate) play(label, TICK); }
        more.querySelector('.ps-plan-more-mark').textContent = collapsed ? '…' : '–';
      }
      const done = steps.filter(s => stepState(s) === 'done').length, blocked = steps.filter(s => stepState(s) === 'blocked').length;
      if (count) { const text = ['pending', 'edit', 'rejected'].includes(state) ? `${steps.length} steps` : `${done} of ${steps.length} done${blocked ? ` · ${blocked} blocked` : ''}`; if (count.textContent !== text) { count.textContent = text; if (animate) play(count, TICK); } }
      if (progress) { progress.max = steps.length; progress.value = done; }
      if (openStep) { if (openStep.hidden || state === 'edit') openDetail(null, false); else fillStep(openStep); }
    };
    // Step detail card: what and why, a blocked step's reason first, time against the estimate, dependencies, files and tools.
    const toggleOf = step => step.querySelector('.ps-plan-step-toggle');
    const regionOf = step => doc.getElementById(toggleOf(step).getAttribute('aria-controls'));
    const sourceOf = step => regionOf(step)?.querySelector('[data-plan-source]');
    let openStep = null;
    const fillStep = step => {
      const region = regionOf(step), source = sourceOf(step); if (!source) return null;
      const status = stepState(step), card = node('div', undefined, 'ps-detail-card ps-plan-card'), parts = [];
      const reason = firstFact(source, 'reason');
      if (status === 'blocked' && reason) {
        const box = node('div', undefined, 'ps-detail-reason'), since = firstFact(source, 'since');
        box.append(node('p', reason)); if (since) box.append(node('p', `Blocked since ${since}`, 'ps-detail-note'));
        parts.push(box);
      }
      const does = factsOf(source, 'does')[0];
      if (does) { const p = node('p', undefined, 'ps-detail-lead'); for (const child of does.childNodes) p.append(child.cloneNode(true)); parts.push(p); }

      const facts = node('dl', undefined, 'ps-detail-facts'), est = minutesOf(source, 'estimate'), took = minutesOf(source, 'took'), elapsed = minutesOf(source, 'elapsed');
      facts.append(pair('Step', `${steps.indexOf(step) + 1} of ${steps.length}`));
      if (est !== null) facts.append(pair('Estimate', `${est} min`));
      if (status === 'done' && took !== null) facts.append(pair('Took', `${took} min`));
      if (status === 'active') { const started = firstFact(source, 'started'); if (started) facts.append(pair('Started', started)); if (elapsed !== null) facts.append(pair('Elapsed', `${elapsed} min`)); }
      parts.push(facts);
      const spent = status === 'done' ? took : status === 'active' ? elapsed : null;
      if (spent !== null && est) parts.push(meter(status === 'done' ? 'Time against estimate' : 'Elapsed of estimate', `${spent} of ${est} min`, spent / est).list);
      const output = firstFact(source, 'output');
      if (status === 'done' && output) { const group = node('div', undefined, 'ps-detail-group'); group.append(caption('Output'), node('p', output, 'ps-detail-text')); parts.push(group); }

      const after = factsOf(source, 'after').map(dd => steps[Number(dd.dataset.step) - 1]).filter(Boolean);
      if (after.length) {
        const group = node('div', undefined, 'ps-detail-group'), list = node('ul', undefined, 'ps-plan-card-deps');
        for (const dep of after) {
          const item = node('li'), mark = node('span', undefined, 'ps-step-mark'), depStatus = stepState(dep);
          item.dataset.status = depStatus; mark.setAttribute('aria-hidden', 'true');
          item.append(mark, node('span', `${steps.indexOf(dep) + 1}. ${dep.querySelector('.ps-plan-step-text').textContent}`), node('span', PLAN_STATE_TEXT[depStatus], 'ps-plan-card-dep-state'));
          list.append(item);
        }
        group.append(caption('Depends on'), list); parts.push(group);
      }
      const files = factsOf(source, 'files').map(dd => dd.textContent.trim()), tools = factsOf(source, 'tools').map(dd => dd.textContent.trim());
      if (files.length || tools.length) {
        const touches = node('dl', undefined, 'ps-detail-touches');
        for (const [label, items] of [['Files', files], ['Tools', tools]]) if (items.length) { const row = node('div'), dd = node('dd'); dd.append(idents(items, label)); row.append(node('dt', label), dd); touches.append(row); }
        parts.push(touches);
      }
      card.append(...parts);
      region.querySelector(':scope > .ps-detail-card')?.remove(); region.append(card);
      return card;
    };
    // Choosing the open step folds its card; choosing another moves the card there. Pointer changes animate, keyboard ones apply at once.
    const openDetail = (step, animated) => {
      const prev = openStep; if (prev === step) return;
      if (prev) { const region = regionOf(prev); if (animated && !region.hidden) collapseCopy(region); region.hidden = true; toggleOf(prev).setAttribute('aria-expanded', 'false'); }
      openStep = step; if (!step) return;
      const region = regionOf(step), card = fillStep(step);
      region.hidden = false; toggleOf(step).setAttribute('aria-expanded', 'true');
      if (animated && card) growOpen(region, card);
    };
    function paintBadge(animate) { if (!badge) return; const text = labels[state]; badge.className = 'ps-badge' + (state === 'approved' ? ' ps-badge-good' : state === 'rejected' ? ' ps-badge-error' : ''); if (badge.textContent !== text) { badge.textContent = text; if (animate) play(badge, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], PRESS); } }
    const setState = (next, message, focus = true, animate = userMotion(block)) => {
      state = next; block.dataset.planState = next;
      for (const pane of panes) { const show = pane.dataset.planPane === next; if (show && pane.hidden && animate && pane !== editor) play(pane, RISE); pane.hidden = !show; }
      list.hidden = next === 'edit';
      paintBadge(animate);
      if (animate) { play(block.querySelector(`.ps-plan-foot[data-plan-pane="${next}"] .ps-i-check`), DRAW, SETTLE, { delay: 60 }); if (next === 'edit') [...editor.children].forEach((row, i) => play(row, RISE, SETTLE, { delay: i * 24 })); }
      if (message !== undefined) status.textContent = message;
      renderSteps(animate);
      if (focus) block.querySelector(`[data-plan-pane="${next}"] input, [data-plan-pane="${next}"] button:not([hidden])`)?.focus();
      emit(block, 'pagesystem:plan-card', { state: next, steps: steps.map(s => ({ text: s.querySelector('.ps-plan-step-text').textContent, status: stepState(s) })) });
    };
    const stopCountdown = () => { if (!countdown) return; win.clearInterval(countdown.id); intervals.delete(countdown.id); countdown = null; for (const el of block.querySelectorAll('[data-plan-auto-note]')) el.hidden = true; for (const el of block.querySelectorAll('[data-plan-manual-note]')) el.hidden = false; };
    const openEditor = () => {
      stopCountdown(); before = state; editor.replaceChildren();
      steps.forEach((step, i) => {
        const label = node('label'), input = node('input', undefined, 'ps-input');
        input.type = 'text'; input.value = step.querySelector('.ps-plan-step-text').textContent; input.setAttribute('aria-label', `Step ${i + 1}`); input.required = true;
        const number = node('span', String(i + 1)); number.setAttribute('aria-hidden', 'true');
        label.append(number, input); editor.append(label);
      });
      const error = block.querySelector('[data-plan-error]'); if (error) error.textContent = '';
      setState('edit', 'Editing the plan. Nothing runs while you edit.');
    };
    const saveEditor = () => {
      const inputs = [...editor.querySelectorAll('input')], empty = inputs.find(input => !input.value.trim()), error = block.querySelector('[data-plan-error]');
      inputs.forEach(input => input.removeAttribute('aria-invalid'));
      if (empty) { empty.setAttribute('aria-invalid', 'true'); error.textContent = `Step ${inputs.indexOf(empty) + 1} needs a description.`; empty.focus(); return; }
      inputs.forEach((input, i) => { steps[i].querySelector('.ps-plan-step-text').textContent = input.value.trim(); });
      error.textContent = '';
      setState('pending', 'Plan updated. It still needs your approval before anything runs.');
    };
    const act = action => {
      if (action === 'approve') { stopCountdown(); setState('approved', 'Plan approved by you. The agent can start the first step.'); }
      else if (action === 'reject') { stopCountdown(); setState('rejected', 'Plan rejected. The agent will not run it.'); }
      else if (action === 'edit') openEditor();
      else if (action === 'save') saveEditor();
      else if (action === 'cancel') setState(before === 'edit' ? 'pending' : before, 'Edits discarded.');
      else if (action === 'undo' || action === 'reopen') setState('pending', 'Plan reopened. It needs your approval again.');
      else if (action === 'stop') setState('stopped', 'Plan stopped after the current step. No further steps will start.');
      else if (action === 'resume') setState('running', 'Plan resumed from the next pending step.');
      else if (action === 'stop-timer') { stopCountdown(); status.textContent = 'Auto-approve stopped. Nothing runs until you approve.'; block.querySelector('[data-plan-action="approve"]')?.focus(); }
    };
    listen(block, 'click', event => {
      const toggle = event.target.closest('.ps-plan-step-toggle');
      if (toggle && block.contains(toggle)) { const step = toggle.closest('.ps-plan-step'); openDetail(openStep === step ? null : step, userMotion(block)); return; }
      if (more && event.target.closest('[data-plan-more]')) { expanded = !expanded; renderSteps(userMotion(block)); if (!expanded) more.focus(); return; }
      const button = event.target.closest('[data-plan-action]'); if (button && block.contains(button)) act(button.dataset.planAction);
    });
    listen(block, 'keydown', event => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.isComposing) { if (state === 'pending') { event.preventDefault(); act('approve'); } else if (state === 'edit') { event.preventDefault(); act('save'); } }
      else if (event.key === 'Escape' && state === 'edit') { event.preventDefault(); act('cancel'); }
      else if (event.key === 'Escape' && openStep && event.target.closest('.ps-plan-step') === openStep) { event.preventDefault(); const owner = toggleOf(openStep); openDetail(null, false); owner.focus(); }
      else if (event.key === 'Enter' && state === 'edit' && event.target.matches('input')) { event.preventDefault(); act('save'); }
    });
    const seconds = Number(block.dataset.planAuto || 0);
    if (seconds > 0 && state === 'pending') {
      const ring = block.querySelector('.ps-plan-ring'), note = block.querySelector('[data-plan-auto-text]');
      let left = seconds, hover = false, focus = false;
      const digit = node('span', String(left), 'ps-plan-seconds');
      const paint = changed => {
        const paused = hover || focus; digit.textContent = String(left);
        note.replaceChildren(doc.createTextNode(paused ? 'Auto-approve paused at ' : 'Auto-approves in '), digit, doc.createTextNode(paused ? ' s while you review' : ' s'));
        if (changed) play(digit, TICK);
        if (ring) ring.style.setProperty('--ps-plan-left', `${left / seconds * 100}%`);
      };
      const id = win.setInterval(() => { if (hover || focus) return; left -= 1; if (left <= 0) { stopCountdown(); setState('approved', `Approved automatically after ${seconds} seconds under your auto‑approve setting. Undo is available.`, false, moving()); return; } paint(true); }, 1000);
      intervals.add(id); countdown = { id };
      listen(block, 'pointerenter', () => { hover = true; paint(); }); listen(block, 'pointerleave', () => { hover = false; paint(); });
      listen(block, 'focusin', () => { focus = true; paint(); }); listen(block, 'focusout', event => { if (!block.contains(event.relatedTarget)) { focus = false; paint(); } });
      paint();
    }
    for (const pane of panes) pane.hidden = pane.dataset.planPane !== state;
    // An authored open step starts open; every other region starts closed. A remount replaces the card it built before.
    const authoredOpen = steps.find(step => toggleOf(step)?.getAttribute('aria-expanded') === 'true');
    for (const step of steps) { const toggle = toggleOf(step), region = toggle && regionOf(step); if (!region) continue; toggle.setAttribute('aria-expanded', 'false'); region.hidden = true; region.querySelector(':scope > .ps-detail-card')?.remove(); }
    for (const copy of block.querySelectorAll('[data-detail-copy]')) copy.remove();
    if (authoredOpen) openDetail(authoredOpen, false);
    paintBadge(false); renderSteps();

    // A running plan replays its progress once: each step goes pending, in progress, then to its authored status.
    if (state === 'running' && steps.some(s => stepState(s) !== 'pending')) {
      const authored = steps.map(stepState);
      const setStep = (step, value, animate) => {
        step.dataset.status = value; const label = step.querySelector('.ps-plan-step-state'); label.textContent = PLAN_STATE_TEXT[value];
        if (animate) { play(step.querySelector('.ps-step-mark'), POP, SETTLE); if (value !== 'pending') play(label, TICK); }
      };
      autoplay({
        block, replay: block.querySelector('[data-kit-replay]'),
        prepare: () => { steps.forEach(step => setStep(step, 'pending', false)); renderSteps(false); },
        frames: () => authored.flatMap((value, i) => value === 'pending' ? [] : [[() => { setStep(steps[i], 'active', true); renderSteps(true); }, value === 'active' ? 300 : 700], ...(value === 'active' ? [] : [[() => { setStep(steps[i], value, true); renderSteps(true); }, 500]])]),
        settle: announce => { steps.forEach((step, i) => setStep(step, authored[i], false)); renderSteps(false); if (announce) status.textContent = `Plan progress: ${count.textContent}.`; },
      });
    }
  }

  for (const block of find('[data-ps-task-list]')) {
    trackInput(block);
    const toggle = block.querySelector('[data-task-toggle]'), body = doc.getElementById(toggle.getAttribute('aria-controls'));
    const tasks = [...block.querySelectorAll('.ps-tasks-list > .ps-task')], status = block.querySelector('[data-task-status]');
    const count = block.querySelector('[data-task-count]'), ring = block.querySelector('.ps-tasks-ring');
    const check = task => task.querySelector(':scope > .ps-task-row input');
    // Each task owns a detail region (its disclosure target) holding its subtasks and a hidden source list.
    const expandOf = task => task.querySelector(':scope > .ps-task-row .ps-task-expand');
    const regionOf = task => { const button = expandOf(task); return button ? doc.getElementById(button.getAttribute('aria-controls')) : null; };
    for (const copy of block.querySelectorAll('[data-detail-copy]')) copy.remove();
    const subInputs = new Map(tasks.map(task => [task, [...(regionOf(task) || task).querySelectorAll('.ps-task-sub input')]]));
    const subs = task => subInputs.get(task) || [];
    // Detail card: who owns the task and when it is due, subtasks with a meter, recent activity and linked items.
    // Built once per task; render() repaints only the facts and the meter, so a focused subtask is never moved.
    const cards = new Map();
    const buildCard = task => {
      const region = regionOf(task); if (!region) return;
      const source = region.querySelector('[data-task-source]'), list = region.querySelector('.ps-task-sub');
      if (list && list.parentElement !== region) region.prepend(list);
      region.querySelector(':scope > .ps-detail-card')?.remove();
      const card = node('div', undefined, 'ps-detail-card ps-task-card'), facts = node('dl', undefined, 'ps-detail-facts');
      card.append(facts);
      let progress = null;
      if (list) { const group = node('div', undefined, 'ps-detail-group ps-task-card-subs'); progress = meter('Subtasks', '', 0); group.append(progress.list, list); card.append(group); }
      const activity = factsOf(source, 'activity');
      if (activity.length) {
        const group = node('div', undefined, 'ps-detail-group'), lines = node('ol', undefined, 'ps-task-activity');
        lines.setAttribute('aria-label', 'Recent activity');
        for (const dd of activity) {
          const item = node('li'), line = node('span', undefined, 'ps-task-activity-line');
          line.append(node('span', dd.dataset.who || '', 'ps-task-activity-who'), doc.createTextNode(` ${dd.textContent.trim()}`));
          item.append(line, node('span', dd.dataset.when || '', 'ps-task-activity-when')); lines.append(item);
        }
        group.append(caption('Recent activity'), lines); card.append(group);
      }
      const links = factsOf(source, 'links').map(dd => dd.textContent.trim());
      if (links.length) { const touches = node('dl', undefined, 'ps-detail-touches'), row = node('div'), dd = node('dd'); dd.append(idents(links, 'Linked')); row.append(node('dt', 'Linked'), dd); touches.append(row); card.append(touches); }
      region.append(card);
      cards.set(task, { region, source, card, facts, progress });
    };
    const paintCard = task => {
      const entry = cards.get(task); if (!entry) return;
      const { source, facts, progress } = entry, rows = [];
      for (const [key, label] of [['assignee', 'Assignee'], ['due', 'Due']]) { const value = firstFact(source, key); if (value) rows.push(pair(label, value)); }
      const waiting = firstFact(source, 'waiting'); if (waiting && task.hasAttribute('data-blocked')) rows.push(pair('Waiting on', waiting));
      facts.replaceChildren(...rows);
      if (progress) { const boxes = subs(task), done = boxes.filter(b => b.checked).length, text = `${done} of ${boxes.length}`; progress.fill.style.width = `${(done / boxes.length * 100).toFixed(2)}%`; if (progress.value.textContent !== text) progress.value.textContent = text; }
    };
    let openTask = null;
    const openDetail = (task, animated) => {
      const prev = openTask; if (prev === task) return;
      if (prev) { const region = regionOf(prev); if (animated && !region.hidden) collapseCopy(region); region.hidden = true; expandOf(prev).setAttribute('aria-expanded', 'false'); }
      openTask = task; if (!task) return;
      const { region, card } = cards.get(task);
      region.hidden = false; expandOf(task).setAttribute('aria-expanded', 'true');
      if (animated) growOpen(region, card);
    };
    const render = (announce, animate = false) => {
      let active = null;
      for (const task of tasks) {
        const input = check(task), children = subs(task), meta = task.querySelector(':scope > .ps-task-row .ps-task-meta');
        if (children.length) { const done = children.filter(c => c.checked).length; input.checked = done === children.length; input.indeterminate = done > 0 && done < children.length; }
        const blocked = task.hasAttribute('data-blocked');
        const statusName = input.checked ? 'done' : blocked ? 'blocked' : !active ? 'active' : 'pending';
        if (statusName === 'active') active = task;
        task.dataset.status = statusName;
        const parts = [];
        if (statusName === 'active') parts.push('In progress'); if (statusName === 'blocked') parts.push('Blocked');
        if (children.length) parts.push(`${children.filter(c => c.checked).length} of ${children.length}`);
        const text = parts.join(' · ');
        if (meta && meta.textContent !== text) { meta.textContent = text; if (animate && text) play(meta, TICK); }
        for (const box of children) box.closest('.ps-task').dataset.status = box.checked ? 'done' : 'pending';
        paintCard(task);
      }
      const done = tasks.filter(t => check(t).checked).length, countText = `${done} of ${tasks.length}`;
      if (count.textContent !== countText) { count.textContent = countText; if (animate) play(count, TICK); }
      ring.style.setProperty('--ps-tasks-done', `${done / tasks.length * 100}%`);
      const complete = String(done === tasks.length);
      if (block.dataset.complete !== complete) { block.dataset.complete = complete; if (animate && complete === 'true') play(ring, POP, SETTLE); }
      if (announce) status.textContent = done === tasks.length ? `All ${tasks.length} tasks complete.` : `${done} of ${tasks.length} tasks complete. ${active ? `Next: ${active.querySelector('.ps-task-name').textContent}.` : ''}`;
      if (announce) emit(block, 'pagesystem:task-list', { done, total: tasks.length, active: active ? active.querySelector('.ps-task-name').textContent : null });
    };
    listen(block, 'change', event => {
      const input = event.target.closest('input[type="checkbox"]'); if (!input) return;
      const task = input.closest('.ps-task');
      if (tasks.includes(task)) for (const sub of subs(task)) sub.checked = input.checked;
      render(true, userMotion(block));
    });
    const reveal = (control, target) => { const open = control.getAttribute('aria-expanded') !== 'true'; control.setAttribute('aria-expanded', String(open)); target.hidden = !open; if (open && userMotion(block)) play(target, RISE); };
    listen(block, 'click', event => {
      // The checkbox and its label check a task off; only the disclosure button opens its card.
      const expand = event.target.closest('.ps-task-expand');
      if (expand) { const task = expand.closest('.ps-task'); if (cards.has(task)) openDetail(openTask === task ? null : task, userMotion(block)); return; }
      const unblock = event.target.closest('[data-task-unblock]');
      if (unblock) {
        const task = unblock.closest('.ps-task'); task.removeAttribute('data-blocked'); check(task).disabled = false; subs(task).forEach(s => { s.disabled = false; });
        task.querySelector('.ps-task-reason')?.remove(); unblock.remove(); render(false, userMotion(block));
        status.textContent = `${task.querySelector('.ps-task-name').textContent} is unblocked and can be checked off.`; check(task).focus();
        emit(block, 'pagesystem:task-list', { unblocked: task.querySelector('.ps-task-name').textContent });
      }
    });
    listen(toggle, 'click', () => reveal(toggle, body));
    listen(block, 'keydown', event => {
      if (event.key === 'Escape' && openTask && openTask.contains(event.target)) { event.preventDefault(); const owner = expandOf(openTask); openDetail(null, false); owner.focus(); return; }
      if (!event.target.matches('input[type="checkbox"]') || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const boxes = [...block.querySelectorAll('input[type="checkbox"]')].filter(b => !b.disabled && !b.closest('[inert]') && b.getClientRects().length);
      const at = boxes.indexOf(event.target), next = event.key === 'Home' ? 0 : event.key === 'End' ? boxes.length - 1 : at + (event.key === 'ArrowDown' ? 1 : -1);
      if (boxes[next]) { event.preventDefault(); boxes[next].focus(); }
    });
    // An authored open task starts open; every other region starts closed.
    const authoredOpen = tasks.find(task => expandOf(task)?.getAttribute('aria-expanded') === 'true');
    for (const task of tasks) { buildCard(task); const region = regionOf(task); if (region) { region.hidden = true; expandOf(task).setAttribute('aria-expanded', 'false'); } }
    render(false);
    if (authoredOpen && cards.has(authoredOpen)) openDetail(authoredOpen, false);

    // The list replays the agent's work once: leaf tasks check off in order until the authored state is reached.
    const leaves = tasks.flatMap(task => subs(task).length ? subs(task) : [check(task)]);
    const authored = leaves.map(box => box.checked);
    if (authored.some(Boolean)) autoplay({
      block, replay: block.querySelector('[data-kit-replay]'),
      prepare: () => { leaves.forEach(box => { box.checked = false; }); render(false); },
      frames: () => leaves.flatMap((box, i) => authored[i] ? [[() => { box.checked = true; render(false, true); }, 650]] : []),
      settle: announce => { leaves.forEach((box, i) => { box.checked = authored[i]; }); render(announce, false); },
    });
  }

  for (const block of find('[data-ps-code-block]')) {
    trackInput(block);
    const code = block.querySelector('pre > code'), language = block.dataset.language || 'plain';
    const diff = block.hasAttribute('data-diff'), shell = language === 'shell', numbered = block.dataset.lineNumbers !== 'false';
    const rows = psCodeRows(code.textContent, { diff, shell, start: Number(block.dataset.start || 1), oldStart: Number(block.dataset.oldStart || 1), newStart: Number(block.dataset.newStart || 1) });
    const copyButton = block.querySelector('[data-code-copy]'), wrapButton = block.querySelector('[data-code-wrap]'), status = block.querySelector('[data-code-status]');
    const foot = block.querySelector('[data-code-foot]'), moreButton = block.querySelector('[data-code-more]');
    const lines = node('span', undefined, 'ps-code-lines');
    let state = { inComment: false };
    const digits = Math.max(2, ...rows.map(r => (r.number || r.old || r.next || '').length));
    block.style.setProperty('--ps-code-digits', String(digits));
    const elements = rows.map(row => {
      const el = node('span', undefined, 'ps-code-row');
      if (row.change) el.dataset.change = row.change; if (row.kind) el.dataset.kind = row.kind;
      if (numbered) {
        const numbers = diff ? [row.old, row.next] : [row.number];
        for (const n of numbers) { const num = node('span', n, 'ps-code-num'); num.setAttribute('aria-hidden', 'true'); el.append(num); }
        const gap = node('span', diff ? (row.change === 'added' ? '+' : row.change === 'removed' ? '−' : '') : '', 'ps-code-gap'); gap.setAttribute('aria-hidden', 'true'); el.append(gap);
      }
      const src = node('span', undefined, 'ps-code-src');
      if (diff && row.change !== 'context') src.append(node('span', row.change === 'added' ? 'Added: ' : 'Removed: ', 'ps-visually-hidden'));
      const result = psCodeTokens(row.text, language, state); state = result.state;
      for (const token of result.tokens) src.append(token.type === 'plain' ? doc.createTextNode(token.text) : node('span', token.text, 'ps-tok-' + token.type));
      if (!row.text) src.append(doc.createTextNode(' '));
      el.append(src); lines.append(el); return el;
    });
    code.replaceChildren(lines);
    const copyText = () => (diff ? rows.filter(r => r.change !== 'removed') : shell ? rows.filter(r => r.kind === 'prompt') : rows).map(r => r.text).join('\n');
    const limit = Number(block.dataset.collapse || 0), collapsible = limit > 0 && rows.length > limit + 2;
    let expanded = !collapsible;
    const renderLines = (animate = false) => {
      elements.forEach((el, i) => { const hide = !expanded && i >= limit; if (el.hidden && !hide && animate) play(el, [{ opacity: 0 }, { opacity: 1 }], SETTLE, { delay: Math.min((i - limit) * 12, 120) }); el.hidden = hide; });
      if (!foot) return; foot.hidden = !collapsible; if (!collapsible) return;
      moreButton.setAttribute('aria-expanded', String(expanded));
      const label = moreButton.querySelector('[data-code-more-label]'); label.textContent = expanded ? 'Show fewer lines' : `Show all ${rows.length} lines`; if (animate) play(label, TICK);
      foot.querySelector('[data-code-shown]').textContent = expanded ? `${rows.length} lines` : `Showing ${limit} of ${rows.length} lines`;
    };
    let copied = null;
    const label = copyButton?.querySelector('.ps-code-action-label');
    const swap = (icon, text, animate) => { const i = copyButton.querySelector('.ps-i'); i.className = 'ps-i ' + icon; label.textContent = text; if (animate) { play(i, POP, PRESS); play(label, TICK, PRESS); } };
    const resetCopy = () => { copyButton.dataset.copied = 'false'; swap('ps-i-duplicate', 'Copy', userMotion(block)); };
    const flash = text => { cancel(copied); copyButton.dataset.copied = 'true'; swap('ps-i-check', text, userMotion(block)); copied = later(resetCopy, 2000); };
    const what = diff ? 'the new version' : shell ? `${rows.filter(r => r.kind === 'prompt').length} commands` : `${rows.length} lines`;
    if (copyButton) listen(copyButton, 'click', async () => {
      const text = copyText();
      try {
        if (!win.navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await win.navigator.clipboard.writeText(text);
        flash('Copied'); status.textContent = `Copied ${what} to the clipboard.`;
        emit(block, 'pagesystem:code-block', { action: 'copy', characters: text.length });
      } catch {
        if (!expanded) { expanded = true; renderLines(); }
        const selection = win.getSelection(); selection.removeAllRanges(); const range = doc.createRange(); range.selectNodeContents(code); selection.addRange(range);
        flash('Selected'); status.textContent = `The browser did not allow clipboard access. The code is selected; press ${mac ? '⌘' : 'Ctrl'}+C to copy it.`;
        emit(block, 'pagesystem:code-block', { action: 'copy-fallback', characters: text.length });
      }
    });
    if (wrapButton) listen(wrapButton, 'click', () => {
      const wrap = wrapButton.getAttribute('aria-pressed') !== 'true';
      wrapButton.setAttribute('aria-pressed', String(wrap)); block.dataset.wrap = String(wrap);
      status.textContent = wrap ? 'Long lines wrap.' : 'Long lines scroll sideways.';
      emit(block, 'pagesystem:code-block', { action: 'wrap', wrap });
    });
    if (moreButton) listen(moreButton, 'click', () => {
      expanded = !expanded; renderLines(userMotion(block));
      status.textContent = expanded ? `Showing all ${rows.length} lines.` : `Showing the first ${limit} lines.`;
      emit(block, 'pagesystem:code-block', { action: expanded ? 'expand' : 'collapse', lines: rows.length });
    });
    renderLines();

    // A terminal session replays once: commands type in, then their output appears line by line.
    if (shell && block.hasAttribute('data-code-autoplay')) autoplay({
      block, replay: block.querySelector('[data-kit-replay]'),
      prepare: () => { for (const el of elements) el.dataset.pending = 'true'; },
      frames: () => elements.map((el, i) => {
        const typing = rows[i].kind === 'prompt' ? Math.min(Math.max(rows[i].text.length * 28, 240), 640) : 0;
        return [() => { delete el.dataset.pending; if (typing) play(el.querySelector('.ps-code-src'), DRAW, typing, { easing: `steps(${Math.max(rows[i].text.length, 1)}, end)` }); else play(el, TICK, PRESS); }, typing ? typing + 260 : 140];
      }),
      settle: () => { for (const el of elements) delete el.dataset.pending; },
    });
  }

  return () => {
    for (const id of timers) win.clearTimeout(id); timers.clear();
    for (const id of intervals) win.clearInterval(id); intervals.clear();
    for (const io of observers) io.disconnect(); observers.clear();
    // A disposed autoplay leaves the authored state in place so a remount reads the real content.
    for (const finish of finishers) finish(); finishers.clear();
    for (const animation of animations) animation.cancel(); animations.clear();
  };
});

var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitD(root, { doc, win, listen, find, emit }) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const shortDate = iso => `${months[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;
  const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const count = new Intl.NumberFormat('en-US');
  // Motion is presentation only: every animation starts from and returns to the final markup state.
  const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timing = (el, name, fallback) => parseFloat(win.getComputedStyle(el).getPropertyValue(name)) || fallback;
  const animate = (el, frames, duration) => reduced() || !el.animate ? null : el.animate(frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
  // Keyboard-initiated changes are not animated; CSS reads data-input to drop transitions too.
  const trackInput = el => { listen(el, 'pointerdown', () => { el.dataset.input = 'pointer'; }); listen(el, 'keydown', () => { el.dataset.input = 'key'; }); };
  const stops = [];

  // Pure CRM helpers: matching, ordering, the win meter and the activity line.
  const crmMatches = (row, query, stage) => (stage === '' || String(row.keys.stage) === stage) && (!query || row.text.includes(query));
  const crmCompare = (key, dir) => (a, b) => {
    const x = a.keys[key], y = b.keys[key];
    const order = typeof x === 'number' ? x - y : x.localeCompare(y);
    return order * dir || a.index - b.index;
  };
  const winShare = win => `${Math.max(0, Math.min(100, win))}%`;
  const sparkPoints = (values, width, height, inset) => {
    const min = Math.min(...values), span = Math.max(1, Math.max(...values) - min), step = (width - inset * 2) / Math.max(1, values.length - 1);
    return values.map((v, i) => [inset + i * step, height - inset - (v - min) / span * (height - inset * 2)]);
  };
  // Horizontal control points at each midpoint give a smooth line that never overshoots a value.
  const sparkPath = points => {
    const step = points.length > 1 ? points[1][0] - points[0][0] : 0;
    return points.map(([x, y], i) => i ? `C${(x - step / 2).toFixed(1)} ${points[i - 1][1].toFixed(1)} ${(x - step / 2).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  };
  const trendWord = values => {
    const third = Math.max(1, Math.floor(values.length / 3)), mean = list => list.reduce((n, v) => n + v, 0) / list.length;
    const change = mean(values.slice(-third)) - mean(values.slice(0, third));
    return change > 1 ? 'rising' : change < -1 ? 'falling' : 'steady';
  };
  // The account card reads a hidden record in each row header: ARR, contacts, touches, the next step and, off the path, the stage reached.
  const crmRecord = dl => {
    const all = sel => dl ? [...dl.querySelectorAll(sel)] : [], reached = dl?.querySelector('[data-reached]'), next = dl?.querySelector('[data-next]');
    return {
      arr: Number(dl?.querySelector('[data-arr]')?.dataset.arr || 0),
      reached: reached ? Number(reached.dataset.reached) : null,
      contacts: all('[data-contact]').map(dd => ({ name: dd.textContent.trim(), role: dd.dataset.contact })),
      touches: all('[data-touch]').map(dd => ({ date: dd.dataset.touch, channel: dd.dataset.channel, person: dd.textContent.trim() })).sort((a, b) => b.date.localeCompare(a.date)),
      next: next ? { text: next.textContent.trim(), owner: next.dataset.owner, due: next.dataset.next } : null,
    };
  };
  const dayNumber = iso => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 86400000;
  const daysBetween = (from, to) => Math.round(dayNumber(to) - dayNumber(from));
  const days = n => `${n} ${n === 1 ? 'day' : 'days'}`;
  const sinceText = n => n <= 0 ? 'Touched today' : n === 1 ? 'Last touch yesterday' : `${days(n)} since the last touch`;
  const dueText = n => n === 0 ? 'Due today' : n > 0 ? `In ${days(n)}` : `${days(-n)} overdue`;
  const ordinal = n => { const v = n % 100, s = ['th', 'st', 'nd', 'rd']; return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`; };

  for (const block of find('[data-ps-crm-table]')) {
    const body = block.querySelector('[data-crm-body]'), all = block.querySelector('[data-crm-all]'), region = block.querySelector('[data-crm-region]');
    const search = block.querySelector('[data-crm-search]'), stage = block.querySelector('[data-crm-stage]'), bulk = block.querySelector('[data-crm-bulk]');
    const status = block.querySelector('[data-crm-status]'), empty = block.querySelector('[data-crm-empty]'), today = block.dataset.crmToday;
    const sorters = [...block.querySelectorAll('[data-crm-sort]')], press = timing(block, '--press', 160), settle = timing(block, '--settle', 220);
    trackInput(block);
    const rows = [...body.rows].filter(tr => tr.hasAttribute('data-crm-row')).map((tr, index) => {
      const cells = tr.cells, check = tr.querySelector('input[type="checkbox"]');
      // The name sits in the account button, after its decorative mark.
      const keys = { company: (cells[1].querySelector('.ps-crm-name') || cells[1].lastChild).textContent.trim(), stage: Number(cells[2].dataset.value), owner: cells[3].querySelector('.ps-crm-owner').lastChild.textContent.trim(), deals: Number(cells[4].dataset.value), pipeline: Number(cells[5].dataset.value), win: Number(cells[6].dataset.value), last: cells[8].dataset.value };
      return { tr, id: tr.dataset.crmRow, index, check, keys, lastCell: cells[8], button: tr.querySelector('.ps-crm-account'), record: crmRecord(tr.querySelector('[data-crm-account]')), text: [keys.company, keys.owner, cells[2].textContent].join(' ').toLowerCase() };
    });
    for (const row of rows) {
      // The figure leads; a thin meter after it carries the same share.
      const meter = row.tr.querySelector('.ps-crm-meter');
      meter.style.setProperty('--share', winShare(row.keys.win)); meter.replaceChildren(node('i'));
      // The line sits in context gray; only the latest week is marked in color.
      const holder = row.tr.querySelector('[data-trend]'), values = holder.dataset.trend.split(' ').map(Number), points = sparkPoints(values, 96, 24, 3), [lastX, lastY] = points[points.length - 1];
      const svg = doc.createElementNS(svgNS, 'svg'), path = doc.createElementNS(svgNS, 'path'), dot = doc.createElementNS(svgNS, 'circle');
      svg.setAttribute('viewBox', '0 0 96 24'); svg.setAttribute('aria-hidden', 'true'); path.setAttribute('d', sparkPath(points));
      for (const [key, value] of Object.entries({ cx: lastX.toFixed(1), cy: lastY.toFixed(1), r: '2.25' })) dot.setAttribute(key, value);
      svg.append(path, dot); holder.append(svg); holder.setAttribute('role', 'img'); holder.setAttribute('aria-label', `Activity over 12 weeks, ${trendWord(values)}`);
    }
    const selected = new Set(rows.filter(row => row.check.checked).map(row => row.id));
    let sort = { key: 'pipeline', dir: -1 }, anchor = null, visible = rows;
    const announce = text => { status.textContent = text; };
    const paintSelection = () => {
      for (const row of rows) { const on = selected.has(row.id); row.check.checked = on; if (on) row.tr.dataset.selected = 'true'; else delete row.tr.dataset.selected; }
      const shown = visible.filter(row => selected.has(row.id)).length, hidden = selected.size - shown;
      all.checked = visible.length > 0 && shown === visible.length; all.indeterminate = shown > 0 && shown < visible.length; all.disabled = visible.length === 0;
      const opening = bulk.hidden && selected.size > 0;
      bulk.hidden = selected.size === 0;
      if (opening && block.dataset.input !== 'key') animate(bulk, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], press);
      block.querySelector('[data-crm-count]').textContent = `${selected.size} selected${hidden ? `, ${hidden} hidden by the filter` : ''}`;
      block.querySelector('[data-crm-summary]').textContent = selected.size ? `${selected.size} of ${rows.length} selected` : `${visible.length} ${visible.length === 1 ? 'account' : 'accounts'} in view`;
    };
    const render = () => {
      const query = search.value.trim().toLowerCase();
      visible = rows.filter(row => crmMatches(row, query, stage.value)).sort(crmCompare(sort.key, sort.dir));
      const shown = new Set(visible);
      for (const row of visible) body.append(row.tr);
      for (const row of rows) row.tr.hidden = !shown.has(row);
      // The account card follows its row through every reorder and closes when a filter hides the row.
      if (openRow && !shown.has(openRow)) setCard(null, false);
      if (openRow) openRow.tr.after(cardRow);
      for (const button of sorters) {
        const th = button.closest('th'), active = button.dataset.crmSort === sort.key, icon = button.querySelector('.ps-i');
        if (active) th.setAttribute('aria-sort', sort.dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort');
        icon.className = active ? `ps-i ${sort.dir > 0 ? 'ps-i-up' : 'ps-i-down'}` : 'ps-i';
      }
      const sum = key => visible.reduce((n, row) => n + row.keys[key], 0);
      block.querySelector('[data-crm-deals]').textContent = count.format(sum('deals'));
      for (const el of block.querySelectorAll('[data-crm-pipeline],[data-crm-pipeline-total]')) el.textContent = dollars.format(sum('pipeline'));
      block.querySelector('[data-crm-win]').textContent = visible.length ? `${Math.round(sum('win') / visible.length)}%` : '—';
      empty.hidden = visible.length > 0; region.dataset.empty = String(!visible.length);
      if (!visible.length) block.querySelector('[data-crm-empty-text]').textContent = query ? `No accounts match “${search.value.trim()}”${stage.value ? ' in this stage' : ''}.` : 'No accounts are in this stage.';
      paintSelection();
    };
    listen(search, 'input', () => { render(); emit(block, 'pagesystem:crm-table', { action: 'filter', query: search.value, stage: stage.value, visible: visible.length }); });
    listen(stage, 'change', () => { render(); emit(block, 'pagesystem:crm-table', { action: 'filter', query: search.value, stage: stage.value, visible: visible.length }); });
    for (const button of sorters) listen(button, 'click', event => {
      const key = button.dataset.crmSort, numeric = typeof rows[0].keys[key] === 'number' && key !== 'stage';
      sort = sort.key === key ? { key, dir: -sort.dir } : { key, dir: numeric || key === 'last' ? -1 : 1 };
      const before = new Map(visible.map((row, i) => [row, i]));
      render();
      // A pointer sort nudges each moved row 8px from the side it came from, as the reference does; order indices need no layout reads.
      if (event.detail > 0) {
        visible.forEach((row, i) => {
          const was = before.get(row); if (was === undefined || was === i) return;
          const frames = [{ transform: `translateY(${was > i ? 8 : -8}px)` }, { transform: 'none' }];
          animate(row.tr, frames, settle); if (row === openRow) animate(cardRow, frames, settle);
        });
        animate(button.querySelector('.ps-i'), [{ opacity: 0, transform: 'scale(.25)' }, { opacity: 1, transform: 'none' }], press);
      }
      emit(block, 'pagesystem:crm-table', { action: 'sort', key, direction: sort.dir > 0 ? 'ascending' : 'descending' });
    });
    listen(body, 'click', event => {
      const check = event.target.closest('input[type="checkbox"]'); if (!check) return;
      const row = rows.find(item => item.check === check), on = check.checked;
      // Shift extends from the last clicked row across the rows currently in view.
      const from = anchor ? visible.indexOf(anchor) : -1, to = visible.indexOf(row);
      const range = event.shiftKey && from >= 0 ? visible.slice(Math.min(from, to), Math.max(from, to) + 1) : [row];
      for (const item of range) on ? selected.add(item.id) : selected.delete(item.id);
      anchor = row; paintSelection(); emit(block, 'pagesystem:crm-table', { action: 'select', ids: [...selected] });
    });
    listen(all, 'change', () => {
      const every = visible.every(row => selected.has(row.id));
      for (const row of visible) every ? selected.delete(row.id) : selected.add(row.id);
      paintSelection(); emit(block, 'pagesystem:crm-table', { action: 'select', ids: [...selected] });
    });
    listen(block.querySelector('[data-crm-clear]'), 'click', () => { selected.clear(); anchor = null; paintSelection(); announce('Selection cleared.'); all.focus(); emit(block, 'pagesystem:crm-table', { action: 'select', ids: [] }); });
    listen(block.querySelector('[data-crm-contacted]'), 'click', () => {
      const ids = [...selected];
      for (const row of rows) if (selected.has(row.id)) {
        row.keys.last = today; row.lastCell.dataset.value = today;
        const time = row.lastCell.querySelector('time'); time.dateTime = today; time.textContent = shortDate(today);
      }
      selected.clear(); anchor = null; render(); if (openRow) fillCard(openRow); all.focus();
      announce(`Marked ${ids.length} ${ids.length === 1 ? 'account' : 'accounts'} as contacted on ${shortDate(today)}.`);
      emit(block, 'pagesystem:crm-table', { action: 'contacted', ids, date: today });
    });
    listen(block.querySelector('[data-crm-reset]'), 'click', () => { search.value = ''; stage.value = ''; render(); search.focus(); });
    listen(region, 'scroll', () => { region.dataset.scrolled = String(region.scrollLeft > 0); });

    // Account card: its own full-width row under the account. The panel is pinned to the region's visible width so a sideways scroll never hides it.
    const base = block.getAttribute('aria-labelledby') || 'crm', cardId = `${base}-account`, titleId = `${base}-account-title`;
    let cardRow = body.querySelector(':scope > [data-crm-detail]'), openRow = null;
    if (!cardRow) {
      cardRow = node('tr', 'ps-crm-detail-row'); cardRow.dataset.crmDetail = ''; cardRow.hidden = true;
      const cell = node('td'), panel = node('div', 'ps-crm-detail');
      panel.id = cardId; panel.setAttribute('role', 'group'); cell.append(panel); cardRow.append(cell); body.prepend(cardRow);
    }
    const panel = cardRow.cells[0].firstChild;
    cardRow.cells[0].colSpan = block.querySelector('thead tr').cells.length;
    for (const row of rows) if (row.button) { row.button.setAttribute('aria-controls', cardId); row.button.setAttribute('aria-expanded', 'false'); }
    const fitCard = () => block.style.setProperty('--crm-view', `${region.clientWidth}px`);
    if (typeof ResizeObserver === 'function') { const observer = new ResizeObserver(fitCard); observer.observe(region); stops.push(() => observer.disconnect()); }
    const path = [...stage.options].filter(option => option.value !== '' && !option.hasAttribute('data-crm-off-path')).map(option => ({ value: Number(option.value), name: option.textContent }));
    const stageName = value => [...stage.options].find(option => option.value === String(value))?.textContent || '';
    const heading = (text, tag = 'h4') => node(tag, 'ps-crm-card-caption', text);
    const dateNode = iso => { const el = node('time', '', shortDate(iso)); el.dateTime = iso; return el; };
    const cardMeter = (label, value, share, mark) => {
      const item = node('div', 'ps-crm-card-meter'), track = node('span', 'ps-crm-card-track'), fill = node('i');
      track.setAttribute('aria-hidden', 'true'); fill.style.width = `${(Math.max(0, Math.min(1, share)) * 100).toFixed(1)}%`; track.append(fill);
      if (mark !== undefined) { const tick = node('b'); tick.style.left = `${(mark * 100).toFixed(1)}%`; track.append(tick); }
      item.append(node('dt', '', label), track, node('dd', '', value));
      return item;
    };
    const fillCard = row => {
      const { record, keys } = row, touches = [...record.touches];
      // A contact marked here is newer than the record's history, so it leads the list.
      if (!touches.length || keys.last > touches[0].date) touches.unshift({ date: keys.last, channel: 'Marked contacted', person: keys.owner });
      const head = node('header'), title = node('h3', '', keys.company);
      title.id = titleId; head.append(title, node('span', 'ps-crm-card-since', sinceText(daysBetween(keys.last, today))));

      // Stage path: steps behind are filled, the current one is marked; an account off the path is marked where it stalled.
      const offPath = !path.some(step => step.value === keys.stage), at = path.findIndex(step => step.value === (offPath ? record.reached : keys.stage));
      const steps = node('ol', 'ps-crm-path');
      steps.setAttribute('aria-label', 'Stage path');
      path.forEach((step, i) => {
        const li = node('li'), bar = node('i');
        li.dataset.step = i < at ? 'done' : i === at ? 'current' : 'next'; bar.setAttribute('aria-hidden', 'true');
        li.append(bar, node('span', '', step.name));
        if (i === at) { li.setAttribute('aria-current', 'step'); if (offPath) { li.dataset.status = 'stalled'; li.append(node('span', 'ps-crm-path-note', stageName(keys.stage))); } }
        steps.append(li);
      });

      // Size and odds against every account in the table: ARR by rank, win likelihood with the table average marked.
      const arrs = rows.map(other => other.record.arr), top = Math.max(1, ...arrs), rank = 1 + arrs.filter(v => v > record.arr).length;
      const average = rows.reduce((n, other) => n + other.keys.win, 0) / rows.length;
      const odds = node('section'), meters = node('dl', 'ps-crm-card-meters');
      meters.append(
        cardMeter('ARR', `${dollars.format(record.arr)} · ${ordinal(rank)} of ${rows.length}`, record.arr / top),
        cardMeter('Win likelihood', `${keys.win}% · average ${Math.round(average)}%`, keys.win / 100, average / 100));
      odds.append(heading(`Pipeline · against all ${rows.length}`), meters);

      const next = node('section', 'ps-crm-card-next');
      next.append(heading('Next step'));
      if (record.next) {
        const due = daysBetween(today, record.next.due), meta = node('p', 'ps-crm-card-meta'), when = node('span', '', 'Due '), left = node('span', '', dueText(due));
        when.append(dateNode(record.next.due));
        if (due < 0) left.dataset.alert = 'true';
        meta.append(node('span', '', record.next.owner), when, left);
        next.append(node('p', 'ps-crm-card-step', record.next.text), meta);
      } else next.append(node('p', 'ps-crm-card-step', 'None planned'));

      const recent = node('section'), list = node('ol', 'ps-crm-card-touches');
      for (const touch of touches.slice(0, 3)) { const li = node('li'), who = node('span', '', touch.person); who.append(' ', node('small', '', touch.channel)); li.append(dateNode(touch.date), who); list.append(li); }
      recent.append(heading('Recent touches'), list);
      const people = node('section'), contacts = node('ul', 'ps-crm-card-contacts');
      for (const person of record.contacts) { const li = node('li'); li.append(node('strong', '', person.name), node('span', '', person.role)); contacts.append(li); }
      people.append(heading('Primary contacts'), contacts);

      // One band under the row: the stage path and recency lead, then four facts side by side, read left to right.
      const lead = node('div', 'ps-crm-card-top'), cols = node('div', 'ps-crm-card-cols');
      lead.append(steps, head); cols.append(odds, next, recent, people);
      const card = node('div', 'ps-crm-card'); card.append(lead, cols);
      panel.replaceChildren(card); panel.setAttribute('aria-labelledby', titleId);
    };
    const cardFrames = height => [{ height: `${height}px`, opacity: 0.72 }, { height: '0px', opacity: 0 }];
    // Moving or closing collapses an inert stand-in where the card was while the real card grows under its new row.
    const setCard = (row, animated) => {
      const height = cardRow.hidden ? 0 : panel.offsetHeight;
      if (animated && openRow && height && row !== openRow) {
        const ghost = cardRow.cloneNode(true);
        ghost.removeAttribute('data-crm-detail'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
        for (const el of ghost.querySelectorAll('[id],[aria-labelledby]')) { el.removeAttribute('id'); el.removeAttribute('aria-labelledby'); }
        cardRow.after(ghost);
        const out = animate(ghost.cells[0].firstChild, cardFrames(height), press);
        if (out) out.onfinish = out.oncancel = () => ghost.remove(); else ghost.remove();
      }
      if (openRow) { delete openRow.tr.dataset.crmOpen; openRow.button?.setAttribute('aria-expanded', 'false'); }
      openRow = row;
      if (!row) { cardRow.hidden = true; body.prepend(cardRow); return; }
      fitCard(); fillCard(row); row.tr.after(cardRow); cardRow.hidden = false;
      row.tr.dataset.crmOpen = ''; row.button?.setAttribute('aria-expanded', 'true');
      // Scroll the region just enough to show the card above the pinned totals, never past the pinned header and the account row.
      const view = region.getBoundingClientRect(), owner = row.tr.getBoundingClientRect(), end = cardRow.getBoundingClientRect().bottom;
      const headEdge = view.top + region.clientTop + (block.querySelector('thead')?.offsetHeight || 0), footEdge = view.top + region.clientTop + region.clientHeight - (block.querySelector('tfoot')?.offsetHeight || 0);
      const by = Math.min(end - footEdge, owner.top - headEdge);
      if (by > 0) region.scrollTo({ top: region.scrollTop + by, behavior: animated && !reduced() ? 'smooth' : 'auto' });
      if (animated) {
        animate(panel, cardFrames(panel.offsetHeight).reverse(), settle);
        animate(panel.firstChild, [{ transform: 'translateY(-4px)' }, { transform: 'none' }], settle);
      }
    };
    // Choosing the open account again folds its card; choosing another moves the card there.
    const toggleCard = (row, animated) => {
      const closing = row === openRow;
      setCard(closing ? null : row, animated);
      emit(block, 'pagesystem:crm-table', { action: closing ? 'close-detail' : 'open-detail', id: row.id });
    };
    listen(body, 'click', event => {
      const tr = event.target.closest('tr[data-crm-row]'), onButton = event.target.closest('.ps-crm-account');
      if (!tr || !body.contains(tr) || (!onButton && event.target.closest('.ps-crm-pick, input, label, a, button, select, textarea'))) return;
      // A drag that selected text in a cell is not a request to open the card.
      if (!onButton && String(win.getSelection?.() || '')) return;
      const row = rows.find(item => item.tr === tr);
      toggleCard(row, event.detail > 0); row.button?.focus({ preventScroll: true });
    });
    listen(block, 'keydown', event => {
      if (event.key !== 'Escape' || !openRow || !(openRow.tr.contains(event.target) || cardRow.contains(event.target))) return;
      event.preventDefault();
      const row = openRow; toggleCard(row, false); row.button?.focus();
    });
    render();
  }

  // Pure trace helpers: tree from aria-level order, a readable axis, visibility and formatting.
  const parseSpans = items => {
    const stack = [];
    return items.map((el, index) => {
      const level = Number(el.getAttribute('aria-level')), start = Number(el.dataset.start), duration = Number(el.dataset.duration);
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      const parent = stack[stack.length - 1] || null;
      const span = { el, index, level, start, duration, end: start + duration, kind: el.dataset.kind, error: el.dataset.status === 'error', cost: el.dataset.cost === undefined ? null : Number(el.dataset.cost), tokens: Number(el.dataset.tokens || 0), parent, children: [] };
      if (parent) parent.children.push(span);
      stack.push(span);
      return span;
    });
  };
  const descendants = span => span.children.flatMap(child => [child, ...descendants(child)]);
  const niceStep = raw => { const power = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 5, 10].map(n => n * power).find(n => n >= raw); };
  const traceAxis = total => { const step = niceStep(total / 4), max = Math.ceil(total * 1.12 / step) * step; return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) }; };
  const seconds = ms => ms === 0 ? '0s' : ms >= 10000 ? `${(ms / 1000).toFixed(1).replace(/\.0$/, '')}s` : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  const usd = value => `$${value > 0 && value < 0.01 ? value.toFixed(3) : value.toFixed(2)}`;
  const tokens = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const spanCost = span => span.kind === 'agent' ? descendants(span).reduce((n, s) => n + (s.cost || 0), 0) : span.cost;
  // A label sits after its bar when it fits, else before it; null when neither side has room.
  const labelSide = (startPx, endPx, labelPx, trackPx, gap) => endPx + gap + labelPx <= trackPx ? 'after' : startPx - gap - labelPx >= 0 ? 'before' : null;
  const phaseAt = (span, t) => t < span.start ? 'pending' : t >= span.end ? 'done' : 'running';
  // Run totals at trace time t: calls count once started, cost, tokens and errors once finished.
  const metricsAt = (spans, t, total) => {
    const calls = spans.filter(s => s.kind !== 'agent'), done = calls.filter(s => s.end <= t), started = calls.filter(s => s.start <= t);
    // While a run replays its clock keeps one unit, so the figure only grows; sub-second runs count in milliseconds.
    const clock = t >= total ? seconds(total) : total < 1000 ? seconds(Math.round(t / 100) * 100) : `${(Math.round(t / 100) / 10).toFixed(1)}s`;
    return { duration: clock, cost: usd(done.reduce((n, s) => n + (s.cost || 0), 0)), tokens: tokens(done.reduce((n, s) => n + s.tokens, 0)), models: String(started.filter(s => s.kind === 'model').length), tools: String(started.filter(s => s.kind === 'tool').length), errors: String(spans.filter(s => s.error && s.end <= t).length) };
  };
  const REPLAY_SPEED = 4;
  const kindName = { agent: 'Agent', model: 'Model call', tool: 'Tool call' };
  const traceVisible = (spans, expanded, query) => {
    if (!query) return spans.filter(span => { for (let p = span.parent; p; p = p.parent) if (!expanded.has(p.index)) return false; return true; });
    const show = new Set();
    for (const span of spans) if (span.el.querySelector('.ps-trace-name').textContent.toLowerCase().includes(query)) for (let s = span; s; s = s.parent) show.add(s);
    return spans.filter(span => show.has(span));
  };

  const observers = [];
  let disposed = false;
  for (const block of find('[data-ps-trace-waterfall]')) {
    const tree = block.querySelector('[data-trace-tree]'), search = block.querySelector('[data-trace-search]'), empty = block.querySelector('[data-trace-empty]');
    const spans = parseSpans([...tree.querySelectorAll('[data-trace-span]')]);
    const press = timing(block, '--press', 160), settle = timing(block, '--settle', 220);
    trackInput(block);
    const total = Math.max(...spans.map(span => span.end)), axis = traceAxis(total), pct = ms => `${(ms / axis.max * 100).toFixed(3)}%`;
    const expanded = new Set(spans.filter(span => span.children.length && !span.el.hasAttribute('data-collapsed')).map(span => span.index));
    let selected = spans.find(span => span.el.getAttribute('aria-selected') === 'true') || spans[0], current = selected, shown = spans;

    for (const tick of axis.ticks) {
      const label = node('span', 'ps-trace-tick', seconds(tick).replace('.0s', 's')); label.style.setProperty('--x', pct(tick)); block.querySelector('[data-trace-axis]').append(label);
      if (tick) { const line = node('i'); line.style.setProperty('--x', pct(tick)); block.querySelector('[data-trace-grid]').append(line); }
    }
    const finalLabel = span => {
      const time = span.el.querySelector('.ps-trace-time'), cost = spanCost(span);
      time.replaceChildren(node('span', '', seconds(span.duration)));
      if (cost !== null && cost > 0) time.append(node('span', 'ps-trace-cost', ` · ${usd(cost)}`));
    };
    const slowest = spans.filter(span => span.kind !== 'agent').reduce((a, b) => b.duration > a.duration ? b : a);
    for (const span of spans) {
      const bar = span.el.querySelector('.ps-trace-bar');
      if (span.children.length) span.el.setAttribute('aria-expanded', String(expanded.has(span.index))); else span.el.dataset.leaf = '';
      span.el.style.setProperty('--x', pct(span.start)); span.el.style.setProperty('--w', `max(var(--s-4), ${pct(span.duration)})`);
      finalLabel(span);
      if (span === slowest) span.el.querySelector('.ps-trace-label').append(node('span', 'ps-badge ps-trace-slowest', 'Slowest'));
      if (span.error && span.kind !== 'agent') bar.append(node('i', 'ps-i ps-i-trace-x'));
      if (span.kind === 'agent') for (const child of descendants(span)) {
        if (child.kind === 'agent') continue;
        const seg = node('i', 'ps-trace-seg'); seg.dataset.kind = child.kind; if (child.error) seg.dataset.status = 'error';
        seg.style.left = `${(child.start - span.start) / span.duration * 100}%`; seg.style.width = `${child.duration / span.duration * 100}%`; bar.append(seg);
        (child.segs ||= []).push(seg); (span.marks ||= []).push([seg, child]);
      }
    }
    const metricEls = Object.fromEntries([...block.querySelectorAll('[data-trace-metric]')].map(el => [el.dataset.traceMetric, el]));
    const writeMetrics = values => {
      for (const [key, value] of Object.entries(values)) if (metricEls[key].textContent !== value) metricEls[key].textContent = value;
      metricEls.errors.dataset.alert = String(values.errors !== '0');
    };
    writeMetrics(metricsAt(spans, total, total));
    // Each figure reserves the widest text it shows during a replay, so changing digits never shift the figures beside it.
    // Totals only change at a span's start or end, and the clock only grows, so those moments cover every width.
    const reserve = {};
    for (const t of [0, ...spans.flatMap(span => [span.start, span.end]), total]) for (const [key, value] of Object.entries(metricsAt(spans, t, total))) if (value.length >= (reserve[key] || '').length) reserve[key] = value;
    for (const [key, value] of Object.entries(reserve)) metricEls[key].dataset.reserve = value;
    // The run's cost against the previous run: a signed pill with its arrow, then the figure it is measured from.
    const change = block.querySelector('[data-trace-previous-cost]'), previousCost = Number(change?.dataset.tracePreviousCost);
    if (change && previousCost > 0) {
      const runCost = spans.reduce((n, s) => n + (s.kind === 'agent' ? 0 : s.cost || 0), 0), pctChange = Math.round((runCost - previousCost) / previousCost * 100);
      const trend = pctChange === 0 ? 'flat' : pctChange > 0 ? 'up' : 'down', pill = node('span', 'ps-delta');
      pill.dataset.trend = trend; pill.dataset.effect = trend === 'flat' ? 'flat' : trend === 'up' ? 'bad' : 'good';
      if (trend !== 'flat') { const arrow = node('i', `ps-i ps-i-${trend}`); arrow.setAttribute('aria-hidden', 'true'); pill.append(arrow); }
      pill.append(`${pctChange > 0 ? '+' : pctChange < 0 ? '−' : ''}${Math.abs(pctChange)}%`);
      change.replaceChildren(pill, node('span', '', `vs ${usd(previousCost)} last run`));
    }

    // The detail card opens inside the selected row, under its bar. Without script it stays below the tree.
    // It sits in an unnamed group the row owns, as nested steps do; browsers leave a group out of the row's name.
    const card = block.querySelector('[data-trace-detail]'), cardTitleId = card.getAttribute('aria-labelledby');
    const slot = node('div', 'ps-trace-detail-slot'); slot.setAttribute('role', 'group'); card.removeAttribute('aria-labelledby');
    let cardOpen = true;
    const fact = (k, v, cls) => { const row = node('div', cls); row.append(node('dt', '', k), node('dd', '', v)); return row; };
    const nameOf = span => span.el.querySelector('.ps-trace-name strong').textContent;
    const meter = (label, value, parts) => {
      const row = node('div', 'ps-trace-meter'), track = node('span', 'ps-trace-meter-track');
      track.setAttribute('aria-hidden', 'true');
      for (const [share, kind] of parts) { const fill = node('i'); fill.dataset.kind = kind; fill.style.width = `${(share * 100).toFixed(2)}%`; track.append(fill); }
      row.append(node('dt', '', label), track, node('dd', '', value));
      return row;
    };
    const covered = intervals => {
      let length = 0, end = -Infinity;
      for (const [a, b] of intervals.toSorted((x, y) => x[0] - y[0])) { if (b <= end) continue; length += b - Math.max(a, end); end = b; }
      return length;
    };
    const attrsOf = span => [...span.el.querySelector('.ps-trace-attrs').children].map(row => [row.querySelector('dt').textContent, row.querySelector('dd').textContent]);
    const fillCard = s => {
      const name = nameOf(s), target = s.el.querySelector('.ps-trace-name > span:last-child').textContent, attrs = attrsOf(s);
      const head = node('header'), mark = node('span', 'ps-trace-mark'), icon = node('i', `ps-i ps-i-trace-${s.kind}`), title = node('h3');
      mark.setAttribute('aria-hidden', 'true'); mark.append(icon);
      title.id = cardTitleId; title.append(node('span', '', name), node('span', 'ps-trace-detail-target', target));
      const badge = node('span', s.error ? 'ps-badge ps-badge-error' : 'ps-badge', s.error ? 'Failed' : 'Completed');
      // The row above names the span, so the panel leads with what the row cannot hold: outcome, duration and timing.
      const scopeOf = s.parent || { start: 0, duration: total }, when = node('span', 'ps-trace-card-when', `+${seconds(s.start)} → +${seconds(s.end)} · ${Math.round(s.duration / scopeOf.duration * 100)}% of ${s.parent ? nameOf(s.parent) : 'the run'}`);
      head.append(mark, title, badge, node('span', 'ps-trace-card-duration', seconds(s.duration)), when);
      const parts = [head];

      if (s.error) {
        const reason = node('p', 'ps-trace-card-error'), x = node('i', 'ps-i ps-i-trace-x');
        x.setAttribute('aria-hidden', 'true');
        reason.append(x, node('span', '', attrs.map(([k, v]) => k === 'Error' ? v : `${k}\u00a0${v}`).join('\u00a0· ')));
        parts.push(reason);
        const retry = s.parent?.children.find(other => other.start >= s.end && !other.error && nameOf(other) === name);
        if (retry) parts.push(node('p', 'ps-trace-card-note', `Recovered by the next attempt at +${seconds(retry.start)}, which finished in ${seconds(retry.duration)}.`));
      }

      // Where the span sits inside its parent: siblings faint, this span in its ink.
      const scope = s.parent || { start: 0, duration: total, children: spans.filter(span => !span.parent) };
      const place = node('div', 'ps-trace-card-place'), lane = node('span', 'ps-trace-card-lane');
      lane.setAttribute('aria-hidden', 'true');
      for (const sibling of scope.children) {
        const seg = node('i'); seg.dataset.kind = sibling.kind;
        if (sibling === s) seg.dataset.current = ''; if (sibling.error) seg.dataset.status = 'error';
        seg.style.left = `${(sibling.start - scope.start) / scope.duration * 100}%`; seg.style.width = `max(2px, ${(sibling.duration / scope.duration * 100).toFixed(2)}%)`;
        lane.append(seg);
      }
      place.append(
        node('p', 'ps-trace-card-caption', s.parent ? `Within ${nameOf(s.parent)}` : 'Within the run'),
        lane);
      const cols = node('div', 'ps-trace-card-cols'); cols.append(place); parts.push(cols);

      const facts = node('dl', 'ps-trace-card-facts');
      facts.append(fact('Kind', kindName[s.kind]));
      const cost = spanCost(s); if (cost !== null) facts.append(fact('Cost', usd(cost)));
      if (s.tokens) facts.append(fact('Tokens', count.format(s.tokens)));
      if (s.kind === 'agent') facts.append(fact('Steps', String(descendants(s).length)));

      // Breakdowns: an agent by the time its calls kept it busy, a model call by its token split.
      if (s.kind === 'agent') {
        const calls = descendants(s).filter(d => d.kind !== 'agent'), busy = kind => covered(calls.filter(d => !kind || d.kind === kind).map(d => [d.start, d.end]));
        const list = node('dl', 'ps-trace-card-meters'), idle = s.duration - busy();
        for (const kind of ['model', 'tool']) {
          const n = calls.filter(d => d.kind === kind).length; if (!n) continue;
          const t = busy(kind);
          list.append(meter(`${kindName[kind]}s · ${n}`, `${seconds(t)} · ${Math.round(t / s.duration * 100)}%`, [[t / s.duration, kind]]));
        }
        list.append(meter('Waiting', `${seconds(idle)} · ${Math.round(idle / s.duration * 100)}%`, [[idle / s.duration, 'idle']]));
        const box = node('div', 'ps-trace-card-break'); box.append(node('p', 'ps-trace-card-caption', 'Where the time went'), list); cols.append(box);
      } else if (s.kind === 'model') {
        const tokensIn = Number((attrs.find(([k]) => k === 'Input tokens')?.[1] || '').replace(/\D/g, '')), tokensOut = Number((attrs.find(([k]) => k === 'Output tokens')?.[1] || '').replace(/\D/g, ''));
        if (tokensIn + tokensOut > 0) {
          const list = node('dl', 'ps-trace-card-meters'), sum = tokensIn + tokensOut;
          list.append(meter('In · out', `${count.format(tokensIn)} · ${count.format(tokensOut)}`, [[tokensIn / sum, 'input'], [tokensOut / sum, 'output']]));
          const box = node('div', 'ps-trace-card-break'); box.append(node('p', 'ps-trace-card-caption', 'Token split'), list); cols.append(box);
        }
      }

      // A failure's attributes already read in the reason line; token counts read in the meter.
      const rest = s.error ? [] : attrs.filter(([k]) => k !== 'Input tokens' && k !== 'Output tokens');
      parts.push(facts);
      if (rest.length) { const list = node('dl', 'ps-trace-card-attrs'); for (const [k, v] of rest) list.append(fact(k, v)); parts.push(list); }
      const body = node('div', 'ps-trace-card'); body.append(...parts);
      card.replaceChildren(body);
    };
    const cardFrames = height => [{ height: `${height}px`, opacity: 0.72 }, { height: '0px', opacity: 0 }];
    // Moving the card collapses a stand-in where it was while the real card grows under the new row, so rows between glide.
    const placeCard = (animated, open = true) => {
      const from = card.parentElement, height = card.offsetHeight;
      if (animated && cardOpen && height && (!open || slot.parentElement !== selected.el)) {
        const ghost = card.cloneNode(true);
        ghost.removeAttribute('aria-labelledby'); ghost.removeAttribute('data-trace-detail'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
        for (const el of ghost.querySelectorAll('[id]')) el.removeAttribute('id');
        const ghostSlot = node('div', 'ps-trace-detail-slot'); ghostSlot.setAttribute('aria-hidden', 'true');
        ghostSlot.append(ghost); slot.after(ghostSlot);
        const out = animate(ghost, cardFrames(height), press);
        if (out) out.onfinish = out.oncancel = () => ghostSlot.remove(); else ghostSlot.remove();
      }
      cardOpen = open; slot.hidden = !open;
      paintFocus(); settleTip();
      if (!open) return;
      fillCard(selected);
      if (from !== slot) slot.append(card);
      if (slot.parentElement !== selected.el) selected.el.append(slot);
      if (animated) {
        const target = card.offsetHeight;
        animate(card, cardFrames(target).reverse(), settle);
        animate(card.firstChild, [{ transform: 'translateY(-4px)' }, { transform: 'none' }], settle);
      }
    };
    const detail = () => placeCard(false);
    // Focus and context: while a span's card is open, it and its own steps keep their color and every other mark
    // steps back; inside a parent's bar, the segments drawn for the focused steps keep theirs too.
    const paintFocus = () => {
      const focus = new Set(cardOpen ? [selected, ...descendants(selected)] : []);
      if (cardOpen) block.dataset.focusing = ''; else delete block.dataset.focusing;
      for (const span of spans) {
        if (focus.has(span)) span.el.dataset.focus = ''; else delete span.el.dataset.focus;
        for (const [seg, child] of span.marks || []) if (focus.has(child)) seg.dataset.focus = ''; else delete seg.dataset.focus;
      }
    };
    const paint = () => {
      const query = search.value.trim().toLowerCase();
      shown = traceVisible(spans, expanded, query);
      const visible = new Set(shown);
      for (const span of spans) {
        span.el.hidden = !visible.has(span);
        if (span.children.length) span.el.setAttribute('aria-expanded', String(query ? true : expanded.has(span.index)));
        span.el.setAttribute('aria-selected', String(span === selected));
      }
      rove();
      slot.hidden = !cardOpen;
      paintFocus();
      empty.hidden = shown.length > 0;
      if (!shown.length) empty.textContent = `No steps match “${search.value.trim()}”.`;
      placeLabels();
      placeTip();
    };
    // Rows not yet reached in a replay are out of the tab order; until the current row is reached the stop sits on the first reached row.
    const reachable = () => shown.filter(span => span.el.dataset.run !== 'pending');
    const rove = () => {
      const open = reachable();
      if (!shown.includes(current)) current = shown[0] || current;
      const stop = open.includes(current) ? current : open[0];
      for (const span of spans) span.el.tabIndex = span === stop ? 0 : -1;
    };
    const placeLabels = () => {
      const track = shown[0]?.el.querySelector('.ps-trace-track'), width = track?.clientWidth;
      if (!width) return;
      for (const span of shown) {
        const start = span.start / axis.max * width, end = start + Math.max(4, span.duration / axis.max * width);
        // Without room for duration and cost, the label keeps the duration; cost stays in the metrics and detail.
        const time = span.el.querySelector('.ps-trace-time');
        delete span.el.dataset.labelShort;
        const full = labelSide(start, end, time.scrollWidth, width, 8);
        const short = full || labelSide(start, end, time.firstChild.offsetWidth, width, 8);
        span.el.dataset.labelSide = short || 'after';
        if (!full) span.el.dataset.labelShort = '';
      }
    };
    const focusSpan = span => { current = span; paint(); span.el.focus(); };
    // Choosing the open span again folds its card; choosing another span moves the card to it.
    const choose = (span, animated) => {
      if (span === selected && cardOpen) { placeCard(animated, false); emit(block, 'pagesystem:trace-waterfall', { action: 'close-detail', index: span.index }); return; }
      selected = span; current = span; paint(); placeCard(animated);
      emit(block, 'pagesystem:trace-waterfall', { action: 'select', index: span.index, kind: span.kind, start: span.start, duration: span.duration, status: span.error ? 'error' : 'ok' });
    };
    const reveal = [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }];
    const toggle = (span, open, animated) => {
      if (!span.children.length || search.value.trim()) return;
      const before = new Set(shown);
      if (open) expanded.add(span.index); else expanded.delete(span.index);
      paint();
      if (animated && open) for (const s of shown) if (!before.has(s) && s.el.dataset.run !== 'pending') animate(s.el, reveal, settle);
      emit(block, 'pagesystem:trace-waterfall', { action: open ? 'expand' : 'collapse', index: span.index });
    };
    // A pinned tip beside the bar under the pointer or the focused row: name, duration and cost. It is presentation
    // only; the row, its label and the detail card carry the same facts for assistive technology.
    const plotRows = block.querySelector('.ps-trace-rows'), tip = node('div', 'ps-plot-tip ps-trace-tip');
    tip.setAttribute('aria-hidden', 'true'); tip.hidden = true; plotRows.append(tip);
    let tipSpan = null, tipTimer = 0;
    const hideTip = () => { tipSpan = null; tip.hidden = true; delete block.dataset.tipFor; };
    const placeTip = () => {
      if (!tipSpan) return;
      if (tipSpan.el.hidden || tipSpan.el.dataset.run === 'pending') { hideTip(); return; }
      const width = plotRows.clientWidth, height = plotRows.clientHeight, tw = tip.offsetWidth, th = tip.offsetHeight, gap = 8;
      if (!width || !height || !tw) return;
      const frame = plotRows.getBoundingClientRect(), bar = tipSpan.el.querySelector('.ps-trace-bar').getBoundingClientRect(), time = tipSpan.el.querySelector('.ps-trace-time').getBoundingClientRect();
      const left = Math.min(bar.left, time.left) - frame.left, right = Math.max(bar.right, time.right) - frame.left, middle = bar.top + bar.height / 2 - frame.top;
      const after = right + gap + tw <= width || left - gap - tw < 0;
      tip.style.left = after ? `${(Math.min(right + gap, width - tw) / width * 100).toFixed(3)}%` : 'auto';
      tip.style.right = after ? 'auto' : `${((width - left + gap) / width * 100).toFixed(3)}%`;
      tip.style.top = `${(Math.max(0, Math.min(middle - th / 2, height - th)) / height * 100).toFixed(3)}%`;
    };
    const showTip = span => {
      if (!span || span.el.hidden || block.hasAttribute('data-playing')) { hideTip(); return; }
      if (span !== tipSpan) {
        const list = node('dl'), cost = spanCost(span);
        list.append(node('dt', '', 'Duration'), node('dd', '', seconds(span.duration)));
        if (cost !== null) list.append(node('dt', '', 'Cost'), node('dd', '', usd(cost)));
        tip.replaceChildren(node('strong', '', nameOf(span)), list);
        tipSpan = span; block.dataset.tipFor = String(span.index);
      }
      tip.hidden = false; placeTip();
    };
    // Rows move while a card opens or closes, so the tip is pinned again once that motion has settled.
    const settleTip = () => { placeTip(); clearTimeout(tipTimer); tipTimer = setTimeout(placeTip, settle + 20); };
    stops.push(() => clearTimeout(tipTimer));
    const spanAt = el => spans.find(item => item.el === el);
    const focusedSpan = () => { const el = doc.activeElement?.closest?.('[data-trace-span]'); return el && tree.contains(el) && el.matches(':focus-visible') ? spanAt(el) : null; };
    listen(tree, 'pointermove', event => {
      if (event.pointerType === 'touch') return;
      const el = event.target.closest('[data-trace-span]');
      if (!el || event.target.closest('.ps-trace-detail-slot')) { showTip(focusedSpan()); return; }
      showTip(spanAt(el));
    });
    listen(tree, 'pointerleave', () => showTip(focusedSpan()));
    listen(tree, 'focusin', event => { const el = event.target.closest?.('[data-trace-span]'); if (el && event.target === el && el.matches(':focus-visible')) showTip(spanAt(el)); });
    listen(tree, 'focusout', event => { if (!tree.contains(event.relatedTarget)) hideTip(); });
    listen(tree, 'click', event => {
      const el = event.target.closest('[data-trace-span]'); if (!el || event.target.closest('[data-trace-detail]')) return;
      const span = spans.find(item => item.el === el);
      if (event.target.closest('[data-trace-toggle]') && span.children.length) { current = span; toggle(span, !expanded.has(span.index), event.detail > 0); span.el.focus(); return; }
      choose(span, event.detail > 0); span.el.focus();
    });
    listen(tree, 'keydown', event => {
      const nav = reachable(), span = spans.find(item => item.el === event.target.closest('[data-trace-span]')) || current, at = nav.indexOf(span);
      const move = to => { event.preventDefault(); if (nav[to]) focusSpan(nav[to]); };
      if (event.key === 'ArrowDown') move(Math.min(nav.length - 1, at + 1));
      else if (event.key === 'ArrowUp') move(Math.max(0, at - 1));
      else if (event.key === 'Home') move(0);
      else if (event.key === 'End') move(nav.length - 1);
      else if (event.key === 'ArrowRight') { event.preventDefault(); if (span.children.length && !expanded.has(span.index) && !search.value.trim()) toggle(span, true); else if (span.children.length && nav[at + 1]?.parent === span) focusSpan(nav[at + 1]); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); if (span.children.length && expanded.has(span.index) && !search.value.trim()) toggle(span, false); else if (span.parent) focusSpan(span.parent); }
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(span); }
      else if (event.key === 'Escape' && cardOpen) { event.preventDefault(); placeCard(false, false); emit(block, 'pagesystem:trace-waterfall', { action: 'close-detail', index: selected.index }); }
    });
    listen(search, 'input', () => { paint(); emit(block, 'pagesystem:trace-waterfall', { action: 'filter', query: search.value, visible: shown.length }); });
    if (typeof ResizeObserver === 'function') { const observer = new ResizeObserver(() => { placeLabels(); placeTip(); }); observer.observe(tree); observers.push(observer); }
    // Label widths change when the web fonts arrive, which no resize reports.
    doc.fonts?.ready.then(() => { if (!disposed) placeLabels(); });
    paint(); detail();

    // Replay: the run plays from zero at REPLAY_SPEED, revealing each span as it starts and growing its bar to the final markup state.
    const controls = block.querySelector('[data-trace-controls]'), pauseButton = block.querySelector('[data-trace-pause]'), status = block.querySelector('[data-trace-status]');
    const layer = node('span', 'ps-trace-now-layer'), playhead = node('i', 'ps-trace-now');
    layer.setAttribute('aria-hidden', 'true'); layer.hidden = true; layer.append(playhead); block.querySelector('.ps-trace-rows').append(layer);
    const run = { raf: 0, t: total, last: 0, active: false, trackPx: 0, phase: new Map(spans.map(span => [span, 'done'])) };
    const setPause = label => { pauseButton.querySelector('span').textContent = label; pauseButton.querySelector('.ps-i').className = `ps-i ps-i-trace-${label === 'Pause' ? 'pause' : 'play'}`; };
    const apply = t => {
      let moved = false;
      for (const span of spans) {
        const phase = phaseAt(span, t), was = run.phase.get(span), bar = span.el.querySelector('.ps-trace-bar'), time = span.el.querySelector('.ps-trace-time');
        if (phase !== was) {
          run.phase.set(span, phase); moved = moved || was === 'pending' || phase === 'pending';
          for (const seg of span.segs || []) if (phase === 'done') delete seg.dataset.run; else seg.dataset.run = phase;
          if (phase === 'done') { delete span.el.dataset.run; finalLabel(span); bar.style.clipPath = ''; time.style.transform = ''; if (span.error && was === 'running') { const mark = bar.querySelector('.ps-i-trace-x'); if (mark) animate(mark, [{ opacity: 0, transform: 'scale(.25)' }, { opacity: 1, transform: 'none' }], press); } }
          else { span.el.dataset.run = phase; if (phase === 'running') time.replaceChildren(node('span', '', seconds(0))); }
          if (was === 'pending' && !span.el.hidden) animate(bar, reveal, settle);
        }
        if (phase === 'running') {
          const p = (t - span.start) / span.duration, text = seconds(Math.round((t - span.start) / 100) * 100);
          bar.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
          if (time.firstChild.textContent !== text) time.firstChild.textContent = text;
          time.style.transform = span.el.dataset.labelSide === 'before' ? '' : `translateX(${(-(1 - p) * span.duration / axis.max * run.trackPx).toFixed(1)}px)`;
        }
      }
      playhead.style.transform = `translateX(${(t / axis.max * 100).toFixed(3)}%)`;
      writeMetrics(metricsAt(spans, t, total));
      if (moved) rove();
    };
    const frame = stamp => {
      run.t = Math.min(total, run.t + Math.max(0, stamp - run.last) * REPLAY_SPEED); run.last = stamp;
      apply(run.t);
      if (run.t >= total) finish(true); else run.raf = requestAnimationFrame(frame);
    };
    const finish = announce => {
      cancelAnimationFrame(run.raf); run.active = false; run.t = total; apply(total);
      delete block.dataset.playing; tree.removeAttribute('aria-busy'); layer.hidden = true; pauseButton.disabled = true; setPause('Pause');
      paint();
      if (announce) {
        const failed = spans.filter(span => span.error).length;
        status.textContent = `Replay finished: ${seconds(total)}, ${spans.length} spans${failed ? `, ${failed} failed` : ''}.`;
        emit(block, 'pagesystem:trace-waterfall', { action: 'replay-complete', duration: total });
      }
    };
    const play = () => {
      if (reduced()) return;
      cancelAnimationFrame(run.raf); hideTip();
      run.trackPx = block.querySelector('[data-trace-axis]').clientWidth; run.t = 0;
      block.dataset.playing = ''; tree.setAttribute('aria-busy', 'true'); layer.hidden = false; status.textContent = ''; pauseButton.disabled = false; setPause('Pause');
      apply(0); run.active = true; run.last = performance.now(); run.raf = requestAnimationFrame(frame);
      emit(block, 'pagesystem:trace-waterfall', { action: 'replay', speed: REPLAY_SPEED });
    };
    listen(block.querySelector('[data-trace-replay]'), 'click', play);
    listen(pauseButton, 'click', () => {
      if (run.active) { cancelAnimationFrame(run.raf); run.active = false; setPause('Resume'); }
      else if (run.t < total) { run.active = true; run.last = performance.now(); setPause('Pause'); run.raf = requestAnimationFrame(frame); }
    });
    const motionQuery = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const syncMotion = () => { controls.hidden = reduced(); if (reduced() && block.hasAttribute('data-playing')) finish(false); };
    if (motionQuery) listen(motionQuery, 'change', syncMotion);
    syncMotion();
    // Autoplay once, the first time a quarter of the panel is on screen.
    if (!reduced() && typeof IntersectionObserver === 'function') {
      const seen = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { seen.disconnect(); play(); } }, { threshold: 0.25 });
      seen.observe(block); observers.push(seen);
    }
    stops.push(() => { if (block.hasAttribute('data-playing')) finish(false); });
  }
  return () => { disposed = true; for (const observer of observers) observer.disconnect(); for (const stop of stops) stop(); };
});

var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitE(root, { doc, win, listen, find }) {
  // Pure helpers: they take numbers and strings and touch no DOM.
  // The view box: one drawing unit per pixel where the frame is smaller than the drawing, centered on what is shown
  // (the routes and pins), grown to fit it if it is larger than the frame, and kept inside the drawing's extent so the
  // edge of the drawing never shows. A frame larger than the drawing shows all of it.
  const viewFor = (frame, shown, extent, pad = 44) => {
    const [ex, ey, ew, eh] = extent;
    const x0 = shown.x0 - pad, y0 = shown.y0 - pad, x1 = shown.x1 + pad, y1 = shown.y1 + pad;
    let vw = Math.max(frame.w, x1 - x0), vh = Math.max(frame.h, y1 - y0);
    if (vw / vh > frame.w / frame.h) vh = (vw * frame.h) / frame.w; else vw = (vh * frame.w) / frame.h;
    const place = (center, size, lo, span) => (size >= span ? lo + (span - size) / 2 : Math.min(Math.max(center - size / 2, lo), lo + span - size));
    return [place((x0 + x1) / 2, vw, ex, ew), place((y0 + y1) / 2, vh, ey, eh), vw, vh].map((n) => Math.round(n * 10) / 10);
  };
  const stepIndex = (index, key, count) => {
    if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % count;
    if (key === 'ArrowUp' || key === 'ArrowLeft') return (index - 1 + count) % count;
    if (key === 'Home') return 0;
    if (key === 'End') return count - 1;
    return -1;
  };

  const cleanups = [];
  let serial = 0;

  for (const map of find('[data-ps-agent-map]')) {
    const svg = map.querySelector('.ps-am-drawing');
    const status = map.querySelector('[data-am-status]');
    const extent = (svg?.dataset.amExtent ?? '').split(/\s+/).map(Number);
    const settledView = svg?.getAttribute('viewBox');

    // Frame the drawing on what is shown. Bounds come from the shapes themselves, so a new route needs no numbers.
    const frame = () => {
      if (!svg || extent.length !== 4 || extent.some(Number.isNaN)) return;
      const box = svg.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      const shown = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      for (const el of svg.querySelectorAll('.ps-am-r:not([data-am-state="off"]), .ps-am-pin')) {
        const b = el.getBBox();
        const m = el.transform?.baseVal?.consolidate()?.matrix;
        const dx = m ? m.e : 0, dy = m ? m.f : 0;
        shown.x0 = Math.min(shown.x0, b.x + dx); shown.y0 = Math.min(shown.y0, b.y + dy);
        shown.x1 = Math.max(shown.x1, b.x + b.width + dx); shown.y1 = Math.max(shown.y1, b.y + b.height + dy);
      }
      if (!Number.isFinite(shown.x0)) return;
      svg.setAttribute('viewBox', viewFor({ w: box.width, h: box.height }, shown, extent).join(' '));
    };
    let pending = 0;
    const reframe = () => { if (pending) return; pending = win.requestAnimationFrame(() => { pending = 0; frame(); }); };
    const Observer = win.ResizeObserver;
    const observer = Observer && svg ? new Observer(reframe) : null;
    observer?.observe(svg);
    listen(win, 'resize', reframe);
    reframe();

    const say = (text) => { if (status) status.textContent = text; };

    if (map.dataset.amVariant === 'route') {
      // Route: the travel mode picks the mode's first way; "Take this way" swaps to the other way of the same mode.
      // Every way's text is already in the markup, so the settled page reads correctly with no script.
      const legs = [...map.querySelectorAll('.ps-am-leg[data-am-way]')];
      const routes = [...map.querySelectorAll('.ps-am-r[data-am-way]')];
      const others = [...map.querySelectorAll('.ps-am-other[data-am-other-of]')];
      const radios = [...map.querySelectorAll('.ps-am-modes input[type="radio"]')];
      const time = map.querySelector('[data-am-pin-time]');
      const routeGroup = map.querySelector('.ps-am-routes');
      // Radio names must be unique per instance, or two copies of the map on one page would share one group.
      const name = `am-mode-${++serial}`;
      const originalName = radios[0]?.name;
      for (const radio of radios) radio.name = name;
      let way = legs.find((leg) => !leg.hidden)?.dataset.amWay ?? legs[0]?.dataset.amWay;

      const show = (next, { announce } = {}) => {
        const leg = legs.find((l) => l.dataset.amWay === next);
        if (!leg) return;
        way = next;
        const mode = leg.dataset.amMode;
        for (const l of legs) l.hidden = l !== leg;
        for (const o of others) o.hidden = o.dataset.amOtherOf !== way;
        for (const r of routes) {
          const rmode = legs.find((l) => l.dataset.amWay === r.dataset.amWay)?.dataset.amMode;
          r.dataset.amState = r.dataset.amWay === way ? 'chosen' : rmode === mode ? 'other' : 'off';
        }
        // The chosen line is drawn last, over the other way where they share a street.
        const chosen = routes.find((r) => r.dataset.amWay === way);
        if (chosen && routeGroup) routeGroup.append(chosen);
        if (time) time.textContent = leg.dataset.amTime ?? '';
        for (const radio of radios) radio.checked = radio.value === mode;
        reframe();
        if (announce) {
          const head = leg.querySelector('.ps-am-leg-head')?.textContent.trim() ?? '';
          const via = leg.querySelector('.ps-am-leg-via')?.textContent.trim() ?? '';
          say(`Shown: ${head}. ${via}.`);
        }
      };
      for (const radio of radios) listen(radio, 'change', () => {
        const first = legs.find((l) => l.dataset.amMode === radio.value);
        if (first) show(first.dataset.amWay, { announce: true });
      });
      for (const button of map.querySelectorAll('[data-am-take]')) listen(button, 'click', () => {
        show(button.dataset.amTake, { announce: true });
        // The button that was pressed is now hidden; keep focus on the one that took its place.
        map.querySelector(`.ps-am-other:not([hidden]) [data-am-take]`)?.focus();
      });
      // Pointing at a stop marks its pin.
      for (const stop of map.querySelectorAll('.ps-am-stop[data-am-stop]')) {
        const pin = svg?.querySelector(`.ps-am-pin[data-am-stop="${stop.dataset.amStop}"]`);
        listen(stop, 'pointerenter', () => pin?.setAttribute('data-am-hot', ''));
        listen(stop, 'pointerleave', () => pin?.removeAttribute('data-am-hot'));
      }
      show(way);
      cleanups.push(() => {
        for (const radio of radios) if (originalName) radio.name = originalName;
        for (const pin of map.querySelectorAll('[data-am-hot]')) pin.removeAttribute('data-am-hot');
      });
    } else {
      // Places: a row and its pin are one place. Choosing either selects it everywhere; arrows move between rows with
      // one tab stop; Escape clears the selection.
      const rows = [...map.querySelectorAll('.ps-am-place[data-am-place]')];
      const pins = [...(svg?.querySelectorAll('.ps-am-pin[data-am-place]') ?? [])];
      const label = svg?.querySelector('[data-am-picked-label]');
      const pinOf = (id) => pins.find((p) => p.dataset.amPlace === id);
      const rowOf = (id) => rows.find((r) => r.dataset.amPlace === id);
      let picked = null;
      const rove = (row) => { for (const r of rows) r.tabIndex = r === row ? 0 : -1; };
      rove(rows[0]);

      const pick = (id) => {
        picked = picked === id ? null : id;
        for (const r of rows) r.setAttribute('aria-pressed', String(r.dataset.amPlace === picked));
        for (const p of pins) p.toggleAttribute('data-am-picked', p.dataset.amPlace === picked);
        const row = picked ? rowOf(picked) : null;
        if (label) {
          const pin = picked ? pinOf(picked) : null;
          const m = pin?.transform?.baseVal?.consolidate()?.matrix;
          label.hidden = !m;
          if (m) {
            label.textContent = row.querySelector('b')?.textContent ?? '';
            label.setAttribute('x', String(m.e + 18)); label.setAttribute('y', String(m.f + 5));
          }
        }
        if (row) rove(row);
        say(row ? `Selected ${row.querySelector('b')?.textContent}, ${rows.indexOf(row) + 1} of ${rows.length}.` : 'Selection cleared.');
      };
      for (const row of rows) {
        const pin = pinOf(row.dataset.amPlace);
        listen(row, 'click', () => pick(row.dataset.amPlace));
        listen(row, 'pointerenter', () => pin?.setAttribute('data-am-hot', ''));
        listen(row, 'pointerleave', () => pin?.removeAttribute('data-am-hot'));
        listen(row, 'keydown', (event) => {
          const next = stepIndex(rows.indexOf(row), event.key, rows.length);
          if (next < 0) return;
          event.preventDefault();
          rove(rows[next]); rows[next].focus();
        });
      }
      // Pins are pointer shortcuts; the rows are the accessible way to every place.
      for (const pin of pins) {
        const row = rowOf(pin.dataset.amPlace);
        listen(pin, 'click', () => { pick(pin.dataset.amPlace); row?.scrollIntoView({ block: 'nearest' }); });
        listen(pin, 'pointerenter', () => row?.setAttribute('data-am-hot', ''));
        listen(pin, 'pointerleave', () => row?.removeAttribute('data-am-hot'));
      }
      listen(map, 'keydown', (event) => { if (event.key === 'Escape' && picked) { pick(picked); } });
      cleanups.push(() => {
        for (const r of rows) { r.setAttribute('aria-pressed', 'false'); r.removeAttribute('tabindex'); r.removeAttribute('data-am-hot'); }
        for (const p of pins) { p.removeAttribute('data-am-picked'); p.removeAttribute('data-am-hot'); }
        if (label) label.hidden = true;
      });
    }

    cleanups.push(() => {
      observer?.disconnect();
      if (pending) win.cancelAnimationFrame(pending);
      if (svg && settledView) svg.setAttribute('viewBox', settledView);
      if (status) status.textContent = '';
    });
  }

  return () => { for (const cleanup of cleanups.splice(0)) cleanup(); };
});

var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitF(root, { doc, win, listen, find, emit }) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const shape = (tag, attrs) => { const el = doc.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, String(v)); return el; };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MINUS = '−';
  // A readout's separators bind to the word before them, so a wrapped line never starts with a dot.
  const joined = text => String(text).replaceAll(' · ', '\u00a0· ');

  // Pure helpers: formatting, comparison, scales, windows and goal status. Every printed figure is derived through these.
  const full = { currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), count: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }) };
  const short = { currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumSignificantDigits: 3 }), count: new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 3 }) };
  const KINDS = ['currency', 'count', 'percent'];
  const kindOf = value => KINDS.includes(value) ? value : 'count';
  const format = (v, kind, compact) => kind === 'percent' ? `${v.toFixed(2)}%` : compact && (kind === 'currency' || v >= 10000) ? short[kind].format(v) : full[kind].format(v);
  const goalFormat = (v, kind) => kind === 'currency' ? short.currency.format(v).replace('K', 'k') : full.count.format(v);
  // A rate changes in percentage points; amounts and counts change in percent. The sign and the arrow both carry the direction.
  const delta = (cur, prev, kind) => {
    if (!Number.isFinite(cur) || !Number.isFinite(prev) || (kind !== 'percent' && prev === 0)) return null;
    const d = kind === 'percent' ? cur - prev : (cur / prev - 1) * 100, r = Math.round(d * 10) / 10;
    const trend = r > 0 ? 'up' : r < 0 ? 'down' : 'flat';
    return { trend, text: `${r > 0 ? '+' : r < 0 ? MINUS : ''}${Math.abs(r).toFixed(1)}${kind === 'percent' ? ' pts' : '%'}` };
  };
  const ICON = { up: 'ps-i-up', down: 'ps-i-down', flat: 'ps-i-right' };
  const paintDelta = (pill, d) => { const i = node('i', `ps-i ${ICON[d.trend]}`); i.setAttribute('aria-hidden', 'true'); pill.dataset.trend = d.trend; pill.replaceChildren(i, doc.createTextNode(d.text)); };
  // A value scale over [lo, hi]: round steps, about one gridline per 48px, and a floor that is printed when it is not zero.
  const niceScale = (lo, hi, height) => {
    const lines = Math.max(2, Math.min(5, Math.floor(height / 48)));
    if (!(hi > lo)) { hi = lo + 1; }
    const raw = (hi - lo) / lines, power = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map(n => n * power).find(n => n >= raw);
    const min = Math.floor(lo / step) * step, max = Math.ceil(hi / step) * step, ticks = [];
    for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step) * step);
    return { min, max, ticks };
  };
  const tickText = (v, kind, isTop) => {
    const text = kind === 'percent' ? `${+v.toFixed(2)}%` : (kind === 'currency' ? short.currency : short.count).format(v);
    return isTop ? text : text.replace('$', '').replace('%', '');
  };
  // Horizontal control points at each midpoint: a smooth line that never overshoots a measured value.
  const smooth = pts => pts.map(([x, y], i) => i ? `C${((x + pts[i - 1][0]) / 2).toFixed(1)} ${pts[i - 1][1].toFixed(1)} ${((x + pts[i - 1][0]) / 2).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const numbers = text => String(text || '').trim().split(/\s+/).filter(Boolean).map(Number);
  const PERIODS = { week: { days: 7, bucket: 1, vs: 'last week', names: ['This week', 'Last week'], unit: 'day' }, month: { days: 30, bucket: 1, vs: 'last month', names: ['This month', 'Last month'], unit: 'day' }, quarter: { days: 91, bucket: 7, vs: 'last quarter', names: ['This quarter', 'Last quarter'], unit: 'week' } };
  const aggregate = (list, agg) => { const s = list.reduce((n, v) => n + v, 0); return agg === 'sum' ? s : s / list.length; };
  const dayLabel = (end, offset) => { const d = new Date(end - offset * 86400000); return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`; };
  // The current window ends on the last day; the previous window is the same length immediately before it.
  const windowOf = (daily, agg, period) => {
    const { days } = PERIODS[period];
    if (daily.length < days * 2) return null;
    return { cur: aggregate(daily.slice(-days), agg), prev: aggregate(daily.slice(-2 * days, -days), agg) };
  };
  const seriesOf = (daily, agg, period, end) => {
    const { days, bucket } = PERIODS[period], n = daily.length, start = n - days, rows = [];
    for (let i = 0; i < days; i += bucket) rows.push({ label: dayLabel(end, n - 1 - (start + i)), prevLabel: dayLabel(end, n - 1 - (start - days + i)), cur: aggregate(daily.slice(start + i, start + i + bucket), agg), prev: aggregate(daily.slice(start - days + i, start - days + i + bucket), agg) });
    return rows;
  };
  // Status compares progress with the share of the period elapsed; a budget reads the other way round.
  const statusOf = (mode, ratio, pace) => {
    const rel = pace > 0 ? ratio / pace : 1;
    if (mode === 'budget') return ratio > 1 ? ['over-limit', 'Over limit'] : rel > 1.08 ? ['over', 'Over pace'] : rel < .92 ? ['under', 'Under pace'] : ['on', 'On pace'];
    return ratio >= 1 ? ['complete', 'Complete'] : rel >= 1.08 ? ['ahead', 'Ahead'] : rel < .92 ? ['behind', 'Behind'] : ['on', 'On pace'];
  };
  const STATUS_ICON = { complete: 'ps-i-check', ahead: 'ps-i-up', on: 'ps-i-check', behind: 'ps-i-kpi-alert', under: 'ps-i-check', over: 'ps-i-kpi-alert', 'over-limit': 'ps-i-kpi-alert' };
  const STATUS_ORDER = ['complete', 'ahead', 'on', 'under', 'behind', 'over', 'over-limit'];
  const onTrack = status => ['complete', 'ahead', 'on', 'under'].includes(status);

  // Motion is presentation only and plays from the final state; keyboard input and reduced motion get none.
  // Durations and the curve come from the motion tokens, so a host override applies here too. Every run is keyed per element:
  // a new change cancels the one in flight and starts from what is on screen, and dispose cancels whatever is left.
  const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const rootStyle = win.getComputedStyle(doc.documentElement);
  const token = (name, fallback) => { const raw = rootStyle.getPropertyValue(name).trim(), n = parseFloat(raw); return Number.isFinite(n) ? (/\ds$/.test(raw) ? n * 1000 : n) : fallback; };
  const FAST = token('--fast', 140), PRESS = token('--press', 160), SETTLE = token('--settle', 220), EASE = rootStyle.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
  const trackInput = el => { listen(el, 'pointerdown', () => { el.dataset.input = 'pointer'; }); listen(el, 'keydown', () => { el.dataset.input = 'key'; }); };
  const moving = el => !reduced() && el.dataset.input === 'pointer';
  const running = new Set(), slots = new WeakMap();
  const stop = (el, key) => slots.get(el)?.[key]?.cancel();
  const play = (el, frames, duration, key = 'main') => {
    if (!el?.animate) return null;
    stop(el, key); const own = slots.get(el) || {}; slots.set(el, own);
    const run = el.animate(frames, { duration, easing: EASE }); own[key] = run; running.add(run);
    const done = () => { running.delete(run); if (own[key] === run) delete own[key]; };
    run.addEventListener('finish', done); run.addEventListener('cancel', done);
    return run;
  };
  // A changed figure rolls through a fixed window in the direction the value moved; a changed label settles from 0.72 and 2px below.
  const roll = (el, text, dir, animate) => {
    if (!el || el.textContent === text) return; el.textContent = text;
    if (animate) play(el, dir < 0 ? [{ clipPath: 'inset(35% 0 0 0)', transform: 'translateY(-35%)' }, { clipPath: 'inset(0)', transform: 'none' }] : [{ clipPath: 'inset(0 0 35% 0)', transform: 'translateY(35%)' }, { clipPath: 'inset(0)', transform: 'none' }], PRESS, 'roll');
  };
  const swap = (el, text, animate) => { if (!el || el.textContent === text) return; el.textContent = text; if (animate) play(el, [{ opacity: .72, transform: 'translateY(2px)' }, { opacity: 1, transform: 'none' }], PRESS, 'swap'); };
  const rise = el => play(el, [{ opacity: .72, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], SETTLE, 'rise');
  // A transient copy that only animates out: inert, hidden from assistive tech, removed when its run ends either way.
  const ghostOf = el => {
    const copy = el.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
    for (const n of [copy, ...copy.querySelectorAll('*')]) for (const { name } of [...n.attributes]) if (name === 'id' || /^data-(kpi|goal)/.test(name)) n.removeAttribute(name);
    return copy;
  };
  const fadeAway = (copy, frames, duration) => { const run = play(copy, frames, duration, 'away'); if (run) { const drop = () => copy.remove(); run.addEventListener('finish', drop); run.addEventListener('cancel', drop); } else copy.remove(); };
  // Paths morph only where the browser can interpolate the d property; elsewhere the change crossfades.
  const morphs = typeof CSS !== 'undefined' && !!CSS.supports?.('d', 'path("M0 0")');
  const drawnPath = el => { const d = win.getComputedStyle(el).getPropertyValue('d'); return d && d !== 'none' ? d : `path("${el.getAttribute('d') || 'M0 0'}")`; };
  // A tip's box is as wide as its widest reading, so scrubbing changes digits without resizing it. Measured in em, so text size can change.
  const fitTip = (tip, count, fill) => {
    if (!count || win.getComputedStyle(tip).display === 'none') return;
    tip.style.minWidth = ''; let widest = 0;
    for (let i = 0; i < count; i += 1) { fill(i); widest = Math.max(widest, tip.getBoundingClientRect().width); }
    const em = parseFloat(win.getComputedStyle(tip).fontSize) || 12; tip.style.minWidth = `${(Math.ceil(widest) / em).toFixed(3)}em`;
  };
  // A tip appears with a quick fade and a 4px rise; CSS fades it out. A tip that changes side or edge moves at once, so it never sweeps over the mark.
  const tipIn = tip => play(tip, [{ opacity: .72, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], FAST, 'in');
  const tipJump = (tip, transform) => { tip.style.transition = 'none'; tip.style.transform = transform; void tip.offsetWidth; tip.style.transition = ''; };
  let disposed = false;
  const observers = [];
  const watchSize = (el, draw) => { if (typeof ResizeObserver !== 'function') return; let width = el.clientWidth; const seen = new ResizeObserver(() => { if (el.clientWidth !== width) { width = el.clientWidth; draw(); } }); seen.observe(el); observers.push(seen); };
  const stepKey = (key, index, last) => ({ ArrowLeft: index - 1, ArrowDown: index - 1, ArrowRight: index + 1, ArrowUp: index + 1, Home: 0, End: last })[key];

  // An info hint is a native disclosure; Escape and a press outside close it.
  // Opened with a pointer, its note grows from the trigger.
  for (const hint of find('.ps-kpi-hint')) {
    trackInput(hint);
    listen(hint, 'toggle', () => { const note = hint.querySelector('p'); if (!hint.open || !note || !moving(hint)) return;
      const from = hint.querySelector('summary').getBoundingClientRect(), box = note.getBoundingClientRect(); note.style.transformOrigin = `${(from.left + from.width / 2 - box.left).toFixed(1)}px 0`;
      play(note, [{ opacity: .72, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], FAST, 'grow'); });
    listen(hint, 'keydown', event => { if (event.key === 'Escape' && hint.open) { hint.open = false; hint.querySelector('summary')?.focus(); } });
    listen(doc, 'pointerdown', event => { if (hint.open && !hint.contains(event.target)) hint.open = false; });
  }

  /* KPI card: the headline is the latest value; the sparkline is inspected without changing it. */
  for (const block of find('[data-ps-kpi-card]')) {
    const kind = kindOf(block.dataset.kpiFormat), rows = [...block.querySelectorAll('[data-kpi-rows] tr[data-value]')];
    const points = rows.map(tr => ({ label: tr.cells[0].textContent.trim(), value: Number(tr.dataset.value) })).filter(p => Number.isFinite(p.value));
    const figure = block.querySelector('[data-kpi-figure]'), pill = block.querySelector('[data-kpi-delta]');
    if (points.length) {
      const last = points.at(-1);
      if (figure) { figure.value = String(last.value); figure.textContent = format(last.value, kind); }
      const d = points.length > 1 ? delta(last.value, points.at(-2).value, kind) : null;
      if (pill && d) paintDelta(pill, d);
      const target = block.querySelector('[data-kpi-target]'), goal = Number(target?.dataset.kpiTarget);
      if (target && goal > 0) { const pct = Math.round(last.value / goal * 100); target.querySelector('[data-kpi-progress]').textContent = `${pct}%`; target.querySelector('.ps-kpi-track > span')?.style.setProperty('--progress', `${Math.min(100, pct)}%`); }
    }
    const spark = block.querySelector('[data-kpi-spark]');
    if (!spark || points.length < 2) continue;
    const when = block.querySelector('[data-kpi-when]'), value = block.querySelector('[data-kpi-value]'), caption = block.querySelector('.ps-kpi-caption')?.textContent.trim() || 'value';
    const lastIndex = points.length - 1;
    let index = lastIndex;
    // The trend summary stays the description; the plot becomes the inspect control.
    const summary = spark.getAttribute('aria-label') || '';
    let described = block.querySelector('[data-kpi-summary]');
    if (!described) { described = node('span', 'ps-visually-hidden', summary); described.dataset.kpiSummary = ''; described.id = `${block.getAttribute('aria-labelledby') || 'kpi'}-trend`; spark.after(described); }
    spark.setAttribute('role', 'slider'); spark.tabIndex = 0; spark.setAttribute('aria-label', `Inspect ${caption.toLowerCase()}`); spark.setAttribute('aria-describedby', described.id);
    spark.setAttribute('aria-valuemin', '1'); spark.setAttribute('aria-valuemax', String(points.length));
    const svg = shape('svg', { 'aria-hidden': 'true', focusable: 'false' });
    const area = shape('path', { class: 'ps-kpi-area' }), line = shape('path', { class: 'ps-kpi-line' }), guide = shape('line', { class: 'ps-kpi-guide', x1: 0, x2: 0 });
    const current = shape('circle', { class: 'ps-kpi-current', r: 2.5 }), dot = shape('circle', { class: 'ps-kpi-dot', r: 4, cx: 0, cy: 0 });
    svg.append(area, guide, line, current, dot);
    // The tip is built once and updated in place: the period, the value under the line's swatch (the caption names it), and the change from the point before.
    const tip = node('div', 'ps-plot-tip ps-kpi-tip'), tipHead = node('strong'), list = node('dl'), valueTerm = node('dt'), valueCell = node('dd'), changeTerm = node('dt', 'ps-kpi-tip-change'), changeCell = node('dd', 'ps-kpi-tip-change'), changePill = node('span', 'ps-delta'), changeName = node('span');
    tip.setAttribute('aria-hidden', 'true'); valueTerm.append(node('i')); changeTerm.append(node('i'), changeName); changeCell.append(changePill);
    list.append(valueTerm, valueCell, changeTerm, changeCell); tip.append(tipHead, list);
    spark.replaceChildren(svg, tip); trackInput(block);
    let xy = [], side = '', hovering = false, pinned = false;
    const fillTip = i => {
      const p = points[i], d = i ? delta(p.value, points[i - 1].value, kind) : null;
      tipHead.textContent = i === lastIndex ? `${p.label} · current` : p.label; valueCell.textContent = format(p.value, kind);
      changeTerm.hidden = changeCell.hidden = !d; if (d) { changeName.textContent = `vs ${points[i - 1].label}`; paintDelta(changePill, d); }
    };
    const shown = () => spark.hasAttribute('data-tip');
    const placeTip = jump => {
      const [x, y] = xy[index] || [0, 0], w = spark.clientWidth, gap = 12, tw = tip.offsetWidth, th = tip.offsetHeight;
      // Beside the point on the side with room; when neither side has room, above the line, so it never covers the mark.
      const after = x + gap + tw <= w, before = x - gap - tw >= 0, place = after ? 'after' : before ? 'before' : 'above';
      const tx = after ? x + gap : before ? x - gap - tw : Math.max(0, Math.min(w - tw, x - tw / 2)), ty = place === 'above' ? -th - gap / 2 : y - th / 2;
      const next = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
      if (jump || (shown() && side && side !== place)) tipJump(tip, next); else tip.style.transform = next;
      side = place;
    };
    const place = () => {
      const [x, y] = xy[index] || [0, 0];
      dot.style.transform = `translate(${x}px, ${y}px)`; guide.style.transform = `translateX(${x}px)`;
      guide.toggleAttribute('data-rest', index === lastIndex);
      fillTip(index); placeTip(false);
    };
    const draw = () => {
      const w = spark.clientWidth || 240, h = spark.clientHeight || 56, inset = 5, values = points.map(p => p.value);
      const min = Math.min(...values), span = Math.max(1e-9, Math.max(...values) - min), step = (w - inset * 2) / lastIndex;
      xy = values.map((v, i) => [inset + i * step, inset + (1 - (v - min) / span) * (h - inset * 2)]);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
      const path = smooth(xy); line.setAttribute('d', path); area.setAttribute('d', `${path} L${xy.at(-1)[0].toFixed(1)} ${h} L${xy[0][0].toFixed(1)} ${h} Z`);
      guide.setAttribute('y1', 0); guide.setAttribute('y2', h); current.setAttribute('cx', xy.at(-1)[0]); current.setAttribute('cy', xy.at(-1)[1]);
      fitTip(tip, points.length, fillTip); place();
    };
    const show = next => {
      index = Math.max(0, Math.min(lastIndex, next)); const p = points[index];
      when.textContent = index === lastIndex ? `${p.label} · current` : p.label; value.textContent = format(p.value, kind);
      spark.setAttribute('aria-valuenow', String(index + 1)); spark.setAttribute('aria-valuetext', `${p.label}, ${format(p.value, kind)}${index === lastIndex ? ', current' : ''}`);
      block.toggleAttribute('data-inspecting', index !== lastIndex); place();
      emit(block, 'pagesystem:kpi-card', { index, label: p.label, value: p.value });
    };
    // The tip shows while a pointer is over the line, while the line has focus, and after a tap until a press elsewhere.
    const reveal = pointer => {
      const on = hovering || pinned || doc.activeElement === spark;
      if (on === shown()) return;
      spark.toggleAttribute('data-tip', on);
      if (on) { stop(tip, 'in'); placeTip(true); if (pointer && moving(block)) tipIn(tip); }
    };
    const at = event => { const box = spark.getBoundingClientRect(); return Math.round((event.clientX - box.left - 5) / Math.max(1, box.width - 10) * lastIndex); };
    listen(spark, 'pointerenter', event => { if (event.pointerType === 'touch') return; block.dataset.input = 'pointer'; hovering = true; reveal(true); });
    listen(spark, 'pointermove', event => { if (event.pointerType !== 'touch') { block.dataset.input = 'pointer'; hovering = true; } else if (!pinned) return; show(at(event)); reveal(true); });
    listen(spark, 'pointerdown', event => { if (event.pointerType !== 'touch') return; pinned = true; show(at(event)); reveal(true); });
    listen(doc, 'pointerdown', event => { if (pinned && !spark.contains(event.target)) { pinned = false; if (doc.activeElement !== spark) show(lastIndex); reveal(); } });
    listen(spark, 'pointerleave', event => { if (event.pointerType === 'touch') return; hovering = false; if (doc.activeElement !== spark && !pinned) show(lastIndex); reveal(); });
    listen(spark, 'focus', () => reveal(false));
    listen(spark, 'blur', () => { if (!hovering && !pinned) show(lastIndex); reveal(); });
    listen(spark, 'keydown', event => { const next = stepKey(event.key, index, lastIndex); if (next === undefined) return; event.preventDefault(); show(next); });
    draw(); show(lastIndex); watchSize(spark, draw);
    doc.fonts?.ready?.then(() => { if (!disposed && spark.isConnected) draw(); });
  }

  /* KPI strip: one period for every measure; the chosen measure's trend is drawn against the previous period. */
  for (const block of find('[data-ps-kpi-strip]')) {
    const tabs = [...block.querySelectorAll('[role="tab"]')], radios = [...block.querySelectorAll('[data-kpi-period]')];
    const panel = block.querySelector('[role="tabpanel"]'), plot = block.querySelector('[data-kpi-plot]'), empty = block.querySelector('[data-kpi-plot-empty]');
    const readout = block.querySelector('[data-kpi-readout]'), body = block.querySelector('[data-kpi-rows]'), key = block.querySelector('.ps-kpis-key');
    const endISO = block.dataset.kpiEnd || '', end = Date.UTC(Number(endISO.slice(0, 4)), Number(endISO.slice(5, 7)) - 1, Number(endISO.slice(8, 10)));
    if (!plot || !tabs.length || !Number.isFinite(end)) continue;
    trackInput(block);
    // Parse each measure once: its unit, how it aggregates, its daily history or the reason it has none.
    const measures = tabs.map(tab => ({
      tab, name: tab.querySelector('.ps-kpis-caption')?.textContent.trim() || '', kind: kindOf(tab.dataset.kpiFormat), agg: tab.dataset.kpiAggregate === 'mean' ? 'mean' : 'sum',
      daily: tab.hasAttribute('data-kpi-empty') ? [] : numbers(tab.dataset.kpiDaily).filter(Number.isFinite), reason: tab.dataset.kpiEmpty || '', shown: null,
      goals: Object.fromEntries(Object.keys(PERIODS).map(p => [p, Number(tab.getAttribute(`data-kpi-goal-${p}`)) || 0])),
    }));
    let selected = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')), period = radios.find(r => r.checked)?.value || 'month', point = 0, rows = [], xy = [];
    if (!PERIODS[period]) period = 'month';
    const scale = node('div', 'ps-kpis-scale'), area = node('div', 'ps-kpis-area'), dates = block.querySelector('.ps-kpis-dates') || node('div', 'ps-kpis-dates');
    scale.setAttribute('aria-hidden', 'true'); area.setAttribute('aria-hidden', 'true'); dates.setAttribute('aria-hidden', 'true');
    if (!dates.isConnected) plot.after(dates);
    const svg = shape('svg', { focusable: 'false' }), fill = shape('path', { class: 'ps-kpis-fill' }), prevLine = shape('path', { class: 'ps-kpis-prev' }), curLine = shape('path', { class: 'ps-kpis-line' });
    const goalLine = shape('line', { class: 'ps-kpis-goal-line' }), guide = shape('line', { class: 'ps-kpis-guide', x1: 0, x2: 0 }), prevDot = shape('circle', { class: 'ps-kpis-prev-dot', r: 3, cx: 0, cy: 0 }), curDot = shape('circle', { class: 'ps-kpis-dot', r: 4.5, cx: 0, cy: 0 });
    const goalTag = node('span', 'ps-kpis-goal-tag');
    // Where every place on the goal line is crossed by data, the goal is named in the key instead, drawn as the plot draws it.
    const goalKey = node('li', 'ps-kpis-goal-key'), goalKeyText = node('span'), goalSwatch = node('i', 'ps-kpis-swatch');
    goalSwatch.dataset.goal = ''; goalKey.append(goalSwatch, goalKeyText); goalKey.hidden = true; if (key) key.append(goalKey);
    // The tip is built once and updated in place: the date, both periods with their swatches, and the change between them.
    const tip = node('div', 'ps-plot-tip'), tipHead = node('strong'), tipList = node('dl');
    const tipRows = ['', 'ps-kpis-tip-prev'].map(cls => { const term = node('dt', cls), name = node('span'), when = node('span', 'ps-kpis-tip-when'), cell = node('dd'); term.append(node('i'), name, when); tipList.append(term, cell); return { name, when, cell }; });
    const changeTerm = node('dt', 'ps-kpis-tip-change'), changeCell = node('dd', 'ps-kpis-tip-change'), changePill = node('span', 'ps-delta');
    changeTerm.append(node('i'), node('span', '', 'Change')); changeCell.append(changePill); tipList.append(changeTerm, changeCell); tip.append(tipHead, tipList); tip.setAttribute('aria-hidden', 'true');
    svg.append(fill, goalLine, prevLine, guide, curLine, prevDot, curDot); area.replaceChildren(svg, goalTag, tip); plot.replaceChildren(scale, area);
    plot.setAttribute('role', 'slider'); plot.tabIndex = 0; plot.setAttribute('aria-valuemin', '1');
    // What is on screen now, kept so the next change can move marks from it: the scale, the goal and the drawn paths.
    let geom = null, ghost = null, scaleGhost = null, glide = null, side = '', hovering = false, pinned = false;

    // Figures roll in the direction they moved; pills and labels settle; a goal that comes or goes rises or collapses.
    const collapse = (el, animate) => {
      if (!animate) { el.remove(); return; }
      const h = el.offsetHeight, copy = ghostOf(el); el.replaceWith(copy); copy.style.overflow = 'hidden';
      fadeAway(copy, [{ height: `${h}px`, opacity: .72 }, { height: '0px', marginTop: '0px', opacity: 0 }], PRESS);
    };
    const paintTabs = motion => measures.forEach(m => {
      const w = windowOf(m.daily, m.agg, period), figure = m.tab.querySelector('[data-kpi-figure]'), change = m.tab.querySelector('[data-kpi-change]');
      if (!w) { figure.textContent = '—'; m.shown = null; change.replaceChildren(node('span', 'ps-kpis-reason', m.reason || 'No data for this period')); m.tab.querySelector('[data-kpi-goal]')?.remove(); return; }
      roll(figure, format(w.cur, m.kind, true), m.shown === null ? 0 : Math.sign(w.cur - m.shown), motion && m.shown !== null); m.shown = w.cur;
      const d = delta(w.cur, w.prev, m.kind);
      let pill = change.querySelector('[data-kpi-delta]'), vs = pill?.nextElementSibling;
      if (d) {
        if (!pill || !vs) { pill = node('span', 'ps-delta'); pill.dataset.kpiDelta = ''; vs = node('span'); change.replaceChildren(pill, vs); }
        const was = pill.textContent; paintDelta(pill, d);
        if (motion && was && was !== pill.textContent) play(pill, [{ opacity: .72, transform: 'translateY(2px)' }, { opacity: 1, transform: 'none' }], PRESS, 'swap');
        swap(vs, `vs ${PERIODS[period].vs}`, motion);
      } else change.replaceChildren(node('span', '', `No ${PERIODS[period].vs} to compare`));
      let goal = m.tab.querySelector('[data-kpi-goal]'); const target = m.goals[period];
      if (!target) { if (goal) collapse(goal, motion); return; }
      const pct = Math.round(w.cur / target * 100), text = `${pct}% of ${format(target, m.kind, true)} goal`;
      let bar = goal?.querySelector('.ps-kpi-track > span'), label = bar && goal.lastElementChild;
      const fresh = !goal || !bar || label === bar.parentElement;
      if (fresh) {
        if (!goal) { goal = node('span', 'ps-kpis-goal'); goal.dataset.kpiGoal = ''; m.tab.append(goal); }
        const track = node('span', 'ps-kpi-track'); bar = node('span'); label = node('span'); track.setAttribute('aria-hidden', 'true'); track.append(bar); goal.replaceChildren(track, label);
        if (motion) rise(goal);
      }
      bar.style.setProperty('--progress', `${Math.min(100, pct)}%`); if (fresh) label.textContent = text; else swap(label, text, motion);
    });
    const fillTip = i => {
      const r = rows[i], m = measures[selected], names = PERIODS[period].names, d = delta(r.cur, r.prev, m.kind);
      tipHead.textContent = PERIODS[period].bucket > 1 ? `Week of ${r.label}` : r.label;
      tipRows[0].name.textContent = names[0]; tipRows[0].when.textContent = ''; tipRows[0].cell.textContent = format(r.cur, m.kind);
      tipRows[1].name.textContent = names[1]; tipRows[1].when.textContent = r.prevLabel; tipRows[1].cell.textContent = format(r.prev, m.kind);
      changeTerm.hidden = changeCell.hidden = !d; if (d) paintDelta(changePill, d);
    };
    const shown = () => plot.hasAttribute('data-tip');
    // The tip sits beside the point, on the side with room, at the edge away from both lines; a change of side or edge moves it at once.
    const placeTip = jump => {
      const [x, y] = xy[point] || [0, 0], width = area.clientWidth, h = area.clientHeight, gap = 12, tw = tip.offsetWidth, th = tip.offsetHeight;
      const after = x + gap + tw <= width || x - gap - tw < 0, py = xy.prev?.[point]?.[1] ?? y, low = (y + py) / 2 > h / 2;
      const next = `translate(${Math.round(after ? x + gap : x - gap - tw)}px, ${Math.round(low ? 0 : Math.max(0, h - th))}px)`, place = `${after}${low}`;
      if (jump || (shown() && side && side !== place)) tipJump(tip, next); else tip.style.transform = next;
      side = place;
    };
    const paintDates = () => {
      const labels = rows.map(r => r.label), em = parseFloat(win.getComputedStyle(dates).fontSize) || 12, width = (area.clientWidth || 600) * 12 / em, n = Math.max(1, rows.length - 1);
      const ticks = typeof dateTicks === 'function' ? dateTicks(labels, width) : labels.map((text, index) => ({ index, text }));
      const every = ticks.length > 1 ? ticks[1].index - ticks[0].index : 1, visible = ticks.filter(t => t.index === point || Math.abs(t.index - point) > every / 2 || every === 1);
      if (!visible.some(t => t.index === point)) visible.push({ index: point, text: labels[point] });
      visible.sort((a, b) => a.index - b.index); let month = '';
      dates.replaceChildren(...visible.map(t => {
        const [head, ...rest] = labels[t.index].split(' '), el = node('span', '', head === month ? rest.join(' ') : labels[t.index]); month = head;
        el.style.left = `${t.index / n * 100}%`; el.dataset.edge = t.index === 0 ? 'start' : t.index === rows.length - 1 ? 'end' : '';
        if (t.index === point) el.dataset.focus = ''; return el;
      }));
    };
    // Scrubbing moves the point at once in the figures; the dots, the guide and the tip glide to it in CSS.
    const showPoint = next => {
      point = Math.max(0, Math.min(rows.length - 1, next)); const r = rows[point], m = measures[selected], [x, y] = xy[point] || [0, 0], py = xy.prev?.[point]?.[1] ?? 0;
      curDot.style.transform = `translate(${x}px, ${y}px)`; prevDot.style.transform = `translate(${x}px, ${py}px)`; guide.style.transform = `translateX(${x}px)`;
      const names = PERIODS[period].names, d = delta(r.cur, r.prev, m.kind);
      const week = PERIODS[period].bucket > 1;
      readout.textContent = joined(`${week ? 'Week of ' : ''}${r.label} · ${format(r.cur, m.kind)} ${names[0].toLowerCase()} · ${format(r.prev, m.kind)} ${week ? 'in the week of' : 'on'} ${r.prevLabel}${d ? ` (${d.text})` : ''}`);
      plot.setAttribute('aria-valuenow', String(point + 1)); plot.setAttribute('aria-valuetext', readout.textContent);
      fillTip(point); placeTip(false); paintDates();
      emit(block, 'pagesystem:kpi-strip', { measure: m.tab.dataset.kpi, period, index: point, label: r.label, current: r.cur, previous: r.prev });
    };
    // The goal tag takes whichever end of its line, above or below, crosses the fewest drawn values: the current period's last
    // value weighs most, since that is where the reader looks. O(periods x 4) per draw.
    const placeGoalTag = (gy, w, count) => {
      delete goalTag.dataset.place;
      const tw = goalTag.offsetWidth, th = goalTag.offsetHeight, gap = 4, n = Math.max(1, count - 1);
      const sides = [['', w - tw, gy - gap - th], ['below', w - tw, gy + gap], ['start', 0, gy - gap - th], ['start-below', 0, gy + gap]];
      const near = (x, y, x0, y0) => x >= x0 - gap && x <= x0 + tw + gap && y >= y0 - gap && y <= y0 + th + gap;
      let best = null;
      for (const [side, x0, y0] of sides) {
        let cost = (y0 < 0 || y0 + th > area.clientHeight) ? 100 : 0;
        xy.forEach(([x, y], i) => { if (near(x, y, x0, y0)) cost += i === n ? 6 : 1; });
        xy.prev.forEach(([x, y]) => { if (near(x, y, x0, y0)) cost += 0.5; });
        if (!best || cost < best.cost) best = { side, cost };
      }
      const inKey = best.cost >= 1 && !!key;
      if (inKey) goalTag.dataset.place = 'key'; else if (best.side) goalTag.dataset.place = best.side; else delete goalTag.dataset.place;
      goalKeyText.textContent = goalTag.textContent; goalKey.hidden = !inKey;
    };
    const draw = () => {
      const m = measures[selected], w = area.clientWidth || 600, h = area.clientHeight || 200, inset = 6, n = Math.max(1, rows.length - 1);
      const goal = m.goals[period] ? (m.agg === 'sum' ? m.goals[period] / rows.length : m.goals[period]) : 0;
      const values = rows.flatMap(r => [r.cur, r.prev]).concat(goal ? [goal] : []);
      const sc = niceScale(Math.min(...values), Math.max(...values), h), span = sc.max - sc.min, yOf = v => inset + (1 - (v - sc.min) / span) * (h - inset * 2), xOf = i => i / n * w;
      xy = rows.map((r, i) => [xOf(i), yOf(r.cur)]); xy.prev = rows.map((r, i) => [xOf(i), yOf(r.prev)]);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
      const path = smooth(xy); curLine.setAttribute('d', path); prevLine.setAttribute('d', smooth(xy.prev));
      fill.setAttribute('d', `${path} L${w} ${h} L0 ${h} Z`); guide.setAttribute('y1', 0); guide.setAttribute('y2', h);
      // Gridlines sit only at labeled values; the floor prints its value because the scale need not start at zero.
      scale.replaceChildren(...sc.ticks.map((t, i) => { const line = node('span'); line.style.setProperty('--at', `${(yOf(t) / h) * 100}%`); line.append(node('b', '', tickText(t, m.kind, i === sc.ticks.length - 1))); return line; }));
      goalLine.style.display = goal ? '' : 'none'; goalTag.hidden = !goal; if (!goal) goalKey.hidden = true;
      if (goal) { const gy = yOf(goal); goalLine.setAttribute('x1', 0); goalLine.setAttribute('x2', w); goalLine.setAttribute('y1', gy); goalLine.setAttribute('y2', gy); goalTag.textContent = `${m.agg === 'sum' ? 'Goal pace' : 'Goal'} ${tickText(goal, m.kind, true)}`; goalTag.style.top = `${gy}px`; placeGoalTag(gy, w, rows.length); }
      geom = { measure: selected, count: rows.length, h, yOf, ticks: sc.ticks, goalY: goal ? yOf(goal) : null };
      fitTip(tip, rows.length, fillTip);
      showPoint(point);
    };
    // Before a change: copies of the marks as drawn this frame, mid-flight included, so the change starts from what is on screen.
    const snapshot = () => {
      if (!geom || plot.hidden) return null;
      const copy = el => { const c = ghostOf(el); if (morphs) c.style.d = drawnPath(el); return c; };
      return { ...geom, paths: morphs ? [drawnPath(fill), drawnPath(prevLine), drawnPath(curLine)] : null, lines: [copy(fill), copy(prevLine), copy(curLine)], goal: geom.goalY === null ? [] : [ghostOf(goalLine), ghostOf(goalTag)], scale: ghostOf(scale) };
    };
    // A change in the data moves the marks from the old drawing: lines with the same dates morph, others crossfade; gridlines and the goal slide
    // when the measure is the same, so the scale reads as one axis re-ranging. The dots and the guide follow at the same pace.
    const transition = old => {
      const same = old.measure === selected, h = geom.h, clamp = v => Math.max(-h, Math.min(h, v)), inside = y => Math.max(0, Math.min(h, y));
      stop(ghost, 'away'); stop(scaleGhost, 'away');
      let lead = null;
      if (morphs && old.count === geom.count) {
        [fill, prevLine, curLine].forEach((el, i) => { lead = play(el, [{ d: old.paths[i] }, { d: `path("${el.getAttribute('d')}")` }], SETTLE, 'morph'); });
      } else {
        ghost = shape('g', { class: 'ps-kpis-ghost' }); ghost.append(...old.lines); svg.insertBefore(ghost, prevDot); fadeAway(ghost, [{ opacity: 1 }, { opacity: 0 }], PRESS);
        for (const el of [fill, prevLine, curLine]) { stop(el, 'morph'); lead = play(el, [{ opacity: 0 }, { opacity: 1 }], PRESS, 'fade'); }
      }
      const goalShown = geom.goalY !== null, slide = same && goalShown && old.goalY !== null;
      if (slide) for (const el of [goalLine, goalTag]) play(el, [{ transform: `translateY(${clamp(old.goalY - geom.goalY)}px)` }, { transform: 'none' }], SETTLE, 'move');
      else {
        if (goalShown) for (const el of [goalLine, goalTag]) play(el, [{ opacity: 0 }, { opacity: 1 }], PRESS, 'fade');
        if (old.goal.length) { const [line, tag] = old.goal, g = shape('g', { class: 'ps-kpis-ghost' }); g.append(line); svg.insertBefore(g, prevLine); area.insertBefore(tag, tip); for (const el of [g, tag]) fadeAway(el, [{ opacity: 1 }, { opacity: 0 }], PRESS); }
      }
      scaleGhost = old.scale; scale.before(scaleGhost); fadeAway(scaleGhost, [{ opacity: 1 }, { opacity: 0 }], PRESS);
      if (same) {
        // A gridline travels toward where its value now sits, held inside the plot, so nothing crosses the dates or the header.
        [...scaleGhost.children].forEach((span, i) => play(span, [{ transform: 'none' }, { transform: `translateY(${inside(geom.yOf(old.ticks[i])) - old.yOf(old.ticks[i])}px)` }], SETTLE, 'move'));
        [...scale.children].forEach((span, i) => play(span, [{ opacity: 0, transform: `translateY(${inside(old.yOf(geom.ticks[i])) - geom.yOf(geom.ticks[i])}px)` }, { opacity: 1, transform: 'none' }], SETTLE, 'move'));
      } else play(scale, [{ opacity: 0 }, { opacity: 1 }], PRESS, 'fade');
      if (lead) {
        block.style.setProperty('--kpis-glide', `${lead.effect.getTiming().duration}ms`);
        glide = lead; lead.addEventListener('finish', () => { if (glide !== lead) return; block.style.removeProperty('--kpis-glide'); if (!block.getAttribute('style')) block.removeAttribute('style'); });
      }
    };
    const render = animate => {
      const m = measures[selected], names = PERIODS[period].names, unit = PERIODS[period].unit, motion = animate && moving(block);
      tabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === selected)); t.tabIndex = i === selected ? 0 : -1; });
      panel.setAttribute('aria-labelledby', m.tab.id); paintTabs(motion);
      swap(block.querySelector('[data-kpi-chart-title]'), `${m.name} by ${unit}`, motion);
      swap(block.querySelector('[data-kpi-key-current]'), names[0], motion); swap(block.querySelector('[data-kpi-key-previous]'), names[1], motion);
      block.querySelector('[data-kpi-col-unit]').textContent = unit === 'day' ? 'Day' : 'Week of';
      block.querySelector('[data-kpi-col-current]').textContent = names[0]; block.querySelector('[data-kpi-col-previous]').textContent = names[1];
      block.querySelector('[data-kpi-table-caption]').textContent = `${m.name} by ${unit}`;
      const has = !!windowOf(m.daily, m.agg, period), wasEmpty = !empty.hidden, old = has && motion ? snapshot() : null;
      plot.hidden = !has; dates.hidden = !has; key.hidden = !has; readout.hidden = !has; empty.hidden = has;
      if (!has) {
        empty.textContent = `No ${m.name.toLowerCase()} for this period. ${m.reason || 'The source has not reported yet'}.`;
        const tr = node('tr'), td = node('td', '', 'No values for this period'); td.colSpan = 3; tr.append(td); body.replaceChildren(tr);
        geom = null; if (motion && !wasEmpty) rise(empty);
        return;
      }
      rows = seriesOf(m.daily, m.agg, period, end); point = rows.length - 1;
      plot.setAttribute('aria-label', `Inspect ${m.name.toLowerCase()} by ${unit}, ${names[0].toLowerCase()} against ${names[1].toLowerCase()}`); plot.setAttribute('aria-valuemax', String(rows.length));
      body.replaceChildren(...rows.map(r => { const tr = node('tr'), th = node('th', '', r.label); th.scope = 'row'; tr.append(th, node('td', '', format(r.cur, m.kind)), node('td', '', format(r.prev, m.kind))); return tr; }));
      draw();
      if (!motion) return;
      if (old) transition(old); else for (const el of [plot, dates, key]) rise(el);
      play(dates, [{ opacity: .72 }, { opacity: 1 }], PRESS, 'swap'); play(readout, [{ opacity: .72, transform: 'translateY(2px)' }, { opacity: 1, transform: 'none' }], PRESS, 'swap');
      if (body.offsetParent) rise(body);
    };
    const select = (i, focus) => { if (i < 0 || i >= tabs.length) return; const changed = i !== selected; selected = i; if (focus) tabs[i].focus(); if (changed) render(true); };
    tabs.forEach((tab, i) => listen(tab, 'click', () => select(i, false)));
    listen(block.querySelector('[role="tablist"]'), 'keydown', event => {
      const next = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return; event.preventDefault(); block.dataset.input = 'key'; select((next + tabs.length) % tabs.length, true);
    });
    for (const radio of radios) listen(radio, 'change', () => { if (!radio.checked || !PERIODS[radio.value]) return; period = radio.value; render(true); });
    // The tip shows while a pointer is over the plot, while the plot has focus, and after a tap until a press elsewhere; a touch drag scrubs.
    const reveal = pointer => {
      const on = hovering || pinned || doc.activeElement === plot;
      if (on === shown()) return;
      plot.toggleAttribute('data-tip', on);
      if (on) { stop(tip, 'in'); placeTip(true); if (pointer && moving(block)) tipIn(tip); }
    };
    const pointAt = event => { const box = area.getBoundingClientRect(); return Math.round((event.clientX - box.left) / Math.max(1, box.width) * (rows.length - 1)); };
    listen(plot, 'pointerenter', event => { if (event.pointerType === 'touch' || !rows.length) return; block.dataset.input = 'pointer'; hovering = true; showPoint(pointAt(event)); reveal(true); });
    listen(plot, 'pointermove', event => { if (!rows.length) return; if (event.pointerType !== 'touch') { block.dataset.input = 'pointer'; hovering = true; } else if (!pinned) return; showPoint(pointAt(event)); reveal(true); });
    listen(plot, 'pointerdown', event => { if (event.pointerType !== 'touch' || !rows.length) return; pinned = true; showPoint(pointAt(event)); reveal(true); });
    listen(doc, 'pointerdown', event => { if (pinned && !plot.contains(event.target)) { pinned = false; reveal(); } });
    listen(plot, 'pointerleave', event => { if (event.pointerType === 'touch') return; hovering = false; reveal(); });
    listen(plot, 'focus', () => reveal(false)); listen(plot, 'blur', () => reveal(false));
    listen(plot, 'keydown', event => { const next = stepKey(event.key, point, rows.length - 1); if (next === undefined) return; event.preventDefault(); showPoint(next); });
    render(false); watchSize(plot, () => { if (rows.length && !plot.hidden) draw(); });
    doc.fonts?.ready?.then(() => { if (!disposed && rows.length && !plot.hidden) draw(); });
  }

  /* Goal progress: each goal against its target and the pace expected by today, on one shared percent-of-target scale. */
  for (const block of find('[data-ps-goal-progress]')) {
    const mode = block.dataset.goalMode === 'budget' ? 'budget' : 'goals', elapsed = Number(block.dataset.goalElapsed), days = Number(block.dataset.goalDays);
    if (!(days > 0) || !(elapsed >= 0)) continue;
    const pace = Math.min(1, elapsed / days), left = Math.max(0, days - elapsed), list = block.querySelector('[data-goal-list]'), readout = block.querySelector('[data-goal-readout]');
    block.toggleAttribute('data-goal-closed', left === 0);

    // Each label is centered on its marker; when two would come within a minimum gap, or one would leave the track, one caption replaces them.
    for (const scale of block.querySelectorAll('[data-goal-axis]')) {
      const caption = scale.querySelector('[data-axis-caption]'); if (!caption) continue;
      const fit = () => {
        scale.removeAttribute('data-collapsed'); caption.hidden = true;
        const box = scale.getBoundingClientRect(), gap = 12, labels = [...scale.querySelectorAll(':scope > b')].map(b => b.getBoundingClientRect()).filter(r => r.width).sort((a, b) => a.left - b.left);
        const clash = labels.some((r, i) => r.left < box.left - .5 || r.right > box.right + .5 || (i && r.left - labels[i - 1].right < gap));
        scale.toggleAttribute('data-collapsed', clash); caption.hidden = !clash;
      };
      fit(); watchSize(scale, fit);
    }
    trackInput(block);
    const goals = [...block.querySelectorAll('[data-goal]')].map((li, plan) => {
      const actual = Number(li.dataset.goalActual), target = Number(li.dataset.goalTarget), ratio = target > 0 ? actual / target : 0, [status, word] = statusOf(mode, ratio, pace);
      return { li, plan, button: li.querySelector('.ps-goal-row'), name: li.querySelector('.ps-goal-name > span')?.textContent.trim() || '', actual, target, ratio, status, word, kind: li.dataset.goalFormat === 'currency' ? 'currency' : 'count' };
    }).filter(g => Number.isFinite(g.actual) && g.target > 0);
    if (!goals.length || !list) continue;
    const top = Math.max(1.2, Math.ceil(Math.max(...goals.map(g => g.ratio)) * 10) / 10), at = v => `${(Math.min(v, top) / top * 100).toFixed(2)}%`;
    for (const g of goals) {
      const bar = g.li.querySelector('.ps-goal-bar'); bar.dataset.status = g.status;
      bar.querySelector('.ps-goal-fill').style.setProperty('--actual', at(g.ratio)); bar.querySelector('.ps-goal-pace').style.setProperty('--at', at(pace)); bar.querySelector('.ps-goal-target').style.setProperty('--at', at(1));
      const badge = g.li.querySelector('.ps-goal-status'), icon = node('i', `ps-i ${STATUS_ICON[g.status]}`); icon.setAttribute('aria-hidden', 'true');
      badge.dataset.status = g.status; badge.replaceChildren(icon, doc.createTextNode(g.word));
    }
    const axis = block.querySelector('.ps-goals-axis-track'); axis?.style.setProperty('--pace', at(pace)); axis?.style.setProperty('--target', at(1));
    // The summary meter: one cell per goal, those on track first, so the count reads as a length.
    const units = block.querySelector('.ps-units--goals');
    if (units) {
      const order = [...goals].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.plan - b.plan);
      units.style.setProperty('--cells', String(goals.length));
      units.replaceChildren(...order.map(g => { const cell = node('i'); cell.dataset.goalCell = String(g.plan); cell.toggleAttribute('data-on', onTrack(g.status)); return cell; }));
      const ok = goals.filter(g => onTrack(g.status)).length, done = goals.every(g => g.status === 'complete');
      block.querySelector('[data-goal-count]').textContent = `${ok} of ${goals.length}`;
      block.querySelector('[data-goal-count-label]').textContent = done ? 'goals complete' : 'goals on pace';
      const words = { complete: 'complete', ahead: 'ahead', on: 'on pace', behind: 'behind' };
      block.querySelector('[data-goal-tally]').textContent = Object.keys(words).map(s => [s, goals.filter(g => g.status === s).length]).filter(([, n]) => n).map(([s, n]) => `${n} ${words[s]}`).join(' · ');
    }
    const rows = () => goals.filter(g => g.button).sort((a, b) => a.li.compareDocumentPosition(b.li) & 2 ? 1 : -1);
    let chosen = goals.find(g => g.button?.getAttribute('aria-pressed') === 'true') || goals[0];
    const describe = g => {
      const f = v => goalFormat(v, g.kind), pct = Math.round(g.ratio * 100), expected = g.target * pace, gap = g.actual - expected, weeks = left / 7;
      if (mode === 'budget') {
        const rest = g.target - g.actual;
        return `${g.name} · ${f(g.actual)} of ${f(g.target)} (${pct}%) · expected by today ${f(Math.round(expected))} · ${g.word.toLowerCase()}${Math.abs(gap) >= 1 ? ` by ${f(Math.round(Math.abs(gap)))}` : ''} · ${rest >= 0 ? `${f(rest)} left, ${f(Math.round(rest / Math.max(1, left)))} a day for ${left} days` : `${f(-rest)} over the limit`}`;
      }
      if (g.status === 'complete') return `${g.name} · ${f(g.actual)} of ${f(g.target)} · ${pct}% of target${g.actual > g.target ? `, ${f(g.actual - g.target)} over` : ''}`;
      const need = (g.target - g.actual) / Math.max(1 / 7, weeks), needText = g.kind === 'currency' ? goalFormat(Math.round(need), 'currency') : need.toFixed(need < 10 ? 1 : 0);
      return `${g.name} · ${f(g.actual)} of ${f(g.target)} (${pct}%) · expected by today ${f(Math.round(expected))} · ${gap >= 0 ? 'ahead' : 'behind'} by ${f(Math.round(Math.abs(gap)))} · needs ${needText} a week for ${weeks.toFixed(1)} weeks`;
    };
    const choose = (g, focus) => {
      chosen = g;
      for (const x of goals) if (x.button) { x.button.setAttribute('aria-pressed', String(x === g)); x.button.tabIndex = x === g ? 0 : -1; }
      for (const cell of block.querySelectorAll('[data-goal-cell]')) cell.toggleAttribute('data-focus', cell.dataset.goalCell === String(g.plan));
      swap(readout, joined(describe(g)), !focus && moving(block));
      if (focus) g.button.focus();
      emit(block, 'pagesystem:goal-progress', { goal: g.name, actual: g.actual, target: g.target, status: g.status });
    };
    for (const g of goals) if (g.button) listen(g.button, 'click', () => choose(g, false));
    listen(list, 'keydown', event => {
      const order = rows(), i = order.indexOf(chosen), next = { ArrowUp: i - 1, ArrowLeft: i - 1, ArrowDown: i + 1, ArrowRight: i + 1, Home: 0, End: order.length - 1 }[event.key];
      if (next === undefined || !order.length) return; event.preventDefault(); choose(order[Math.max(0, Math.min(order.length - 1, next))], true);
    });
    // Reordering keeps each row's node, so focus and pressed state survive; rows slide from where they were drawn.
    const sort = block.querySelector('[data-goal-sort]');
    if (sort) listen(sort, 'change', () => {
      // A row caught mid-slide starts its next slide from where it is drawn now: measure first, then cancel the run in flight.
      const animate = moving(block), before = new Map(goals.map(g => [g.li, g.li.getBoundingClientRect().top]));
      for (const g of goals) stop(g.li, 'move');
      const behind = g => g.ratio / Math.max(pace, 1e-9);
      const order = [...goals].sort(sort.value === 'behind' ? (a, b) => behind(a) - behind(b) || a.plan - b.plan : (a, b) => a.plan - b.plan);
      list.append(...order.map(g => g.li));
      if (animate) for (const g of order) { const dy = before.get(g.li) - g.li.getBoundingClientRect().top; if (Math.abs(dy) > .5) play(g.li, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], SETTLE, 'move'); }
      emit(block, 'pagesystem:goal-progress', { sort: sort.value });
    });
    if (chosen?.button) choose(chosen, false);
  }

  return () => { disposed = true; for (const observer of observers) observer.disconnect(); for (const run of [...running]) run.cancel(); running.clear(); };
});

var PS_KITS = PS_KITS || [];
// Kit G: reporting charts. Line chart, bar chart and period comparison read their values from the data table in the
// markup (one canonical place per figure), draw the marks from it and let the reader move one focus through the periods.
PS_KITS.push((() => {
  const SERIES = ['identity', 'endpoint', 'cloud', 'email', 'network', 'saas'];
  // A count scale: a round whole-number top at or above the largest value, about one gridline per 48px of height.
  // Copied from valueScale in src/data-state.mjs so the kit carries no dependency on that module.
  const chartScale = (max, height) => {
    if (!Number.isFinite(max) || max < 0 || !Number.isFinite(height) || height <= 0) throw new Error('Invalid scale');
    const lines = Math.max(2, Math.min(5, Math.floor(height / 48))), raw = Math.max(1, max) / lines, power = 10 ** Math.floor(Math.log10(raw));
    const step = Math.max(1, [1, 2, 5, 10].map(n => n * power).find(n => n >= raw)), top = Math.ceil(Math.max(1, max) / step) * step;
    return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
  };
  // Time labels: the first carries its month, later ones drop it until the month changes; about one per 64px of width.
  // Copied from dateTicks in src/data-state.mjs.
  const chartTicks = (labels, width) => {
    if (!Array.isArray(labels) || !Number.isFinite(width) || width <= 0) throw new Error('Invalid ticks');
    const every = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(width / 64)))), out = []; let month = '';
    for (let index = 0; index < labels.length; index += every) { const [head, ...rest] = labels[index].split(' '); out.push({ index, text: head === month ? rest.join(' ') : labels[index] }); month = head; }
    return out;
  };
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  const finite = list => list.filter(Number.isFinite);
  const mean = list => list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0;
  const sum = list => list.reduce((a, b) => a + b, 0);
  const span = labels => labels.length > 1 ? `${labels[0]}–${labels.at(-1)}` : labels[0] || '';
  // A change always states its direction twice: in the trend (arrow) and in the sign of its text.
  const change = (now, base) => {
    if (!Number.isFinite(now) || !Number.isFinite(base) || base === 0) return null;
    const pct = Math.round((now - base) / Math.abs(base) * 1000) / 10, trend = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
    return { pct, trend, text: `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(pct).toFixed(1)}%`, arrow: trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→' };
  };
  // Direct labels keep their wanted heights where they can and are pushed apart by at least `gap`, inside [lo, hi].
  const spread = (wanted, gap, lo, hi) => {
    const order = wanted.map((y, i) => ({ y: clamp(y, lo, hi), i })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
    const over = order.length ? order[order.length - 1].y - hi : 0;
    if (over > 0) { order[order.length - 1].y -= over; for (let k = order.length - 2; k >= 0; k--) order[k].y = Math.min(order[k].y, order[k + 1].y - gap); }
    const out = []; for (const item of order) out[item.i] = item.y; return out;
  };
  // A path through the defined points; a missing value lifts the pen rather than bridging the gap.
  const pathThrough = points => { let d = '', pen = false; for (const p of points) { if (!p) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`; pen = true; } return d; };
  const nextIndex = (key, index, count) => ({ ArrowLeft: index - 1, ArrowUp: index - 1, ArrowRight: index + 1, ArrowDown: index + 1, Home: 0, End: count - 1 })[key];
  const live = new WeakMap();
  const EASE = 'cubic-bezier(.22,1,.36,1)';

  return function kitG(root, { doc, win, find, emit }) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
    const shape = (tag, attrs) => { const el = doc.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v)); return el; };
    const number = new Intl.NumberFormat('en-US');
    const formatter = block => {
      const prefix = block.dataset.chartFormat === 'currency' ? '$' : '', sign = v => v < 0 ? '−' : '';
      return {
        full: v => `${sign(v)}${prefix}${number.format(Math.abs(Math.round(v)))}`,
        short: (v, unit = true) => { const a = Math.abs(v), text = a >= 1e6 ? `${+(a / 1e6).toFixed(1)}M` : a >= 1000 ? `${+(a / 1000).toFixed(1)}k` : String(Math.round(a)); return `${sign(v)}${unit ? prefix : ''}${text}`; },
        signed: v => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${prefix}${number.format(Math.abs(Math.round(v)))}`,
      };
    };
    const colorOf = s => s.style === 'previous' ? 'var(--muted)' : `var(--source-${s.key || 'endpoint'})`;
    // The table is the record: a column is a series when its header names one; a cell's data-value is the measured figure.
    const readData = table => {
      const heads = [...table.tHead.rows[0].cells];
      const series = heads.map((th, column) => ({ th, column })).filter(({ th }) => th.hasAttribute('data-series')).map(({ th, column }) => ({
        column, name: th.dataset.name || th.textContent.trim(), key: SERIES.includes(th.dataset.series) ? th.dataset.series : null,
        style: th.dataset.style === 'previous' ? 'previous' : 'solid', area: th.hasAttribute('data-area'),
      }));
      const rows = [...table.tBodies[0].rows].map(tr => {
        const cells = [...tr.cells], head = cells[0], label = head.textContent.trim();
        return {
          label, full: head.dataset.label || label,
          values: series.map(s => { const raw = cells[s.column]?.dataset.value; return raw === undefined || raw === '' || !Number.isFinite(Number(raw)) ? null : Number(raw); }),
          partial: series.map(s => !!cells[s.column]?.hasAttribute('data-partial')),
        };
      });
      return { series, rows };
    };
    // Separators bind to the word before them, so a wrapped readout never starts a line with a dot.
    const setText = (el, text) => { text = String(text).replaceAll(' · ', '\u00a0· '); if (el && el.textContent !== text) el.textContent = text; };
    // A delta pill keeps its icon and text nodes; only their class and text change.
    const setDelta = (el, delta) => {
      if (!el) return; el.hidden = !delta; if (!delta) return;
      el.dataset.trend = delta.trend;
      let [icon, text] = el.children;
      if (el.children.length !== 2 || icon.tagName !== 'I') { icon = node('i'); icon.setAttribute('aria-hidden', 'true'); text = node('span'); el.replaceChildren(icon, text); }
      const cls = `ps-i ps-i-${delta.trend === 'up' ? 'up' : delta.trend === 'down' ? 'down' : 'right'}`; if (icon.className !== cls) icon.className = cls;
      setText(text, delta.text);
    };

    // Motion is presentation only: the DOM is written in its final state, then element.animate() plays from the old look.
    // Nothing is scheduled through timers, frames or the frame's globals, so disposal only cancels what is running.
    const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = (name, fallback) => parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue(name)) || fallback;
    const running = new Set(), slots = new WeakMap();
    const halt = (el, key) => slots.get(el)?.[key]?.cancel();
    const play = (el, frames, duration, key) => {
      if (!el.animate) return; halt(el, key); const own = slots.get(el) || {}; slots.set(el, own);
      const run = el.animate(frames, { duration, easing: EASE }); own[key] = run; running.add(run);
      const done = () => { running.delete(run); if (own[key] === run) delete own[key]; }; run.addEventListener('finish', done); run.addEventListener('cancel', done);
    };
    // Only a pointer moves things; a key press, a resize or reduced motion lands at once.
    const moving = block => block.dataset.input === 'pointer' && !reduced();
    // Glide: read where each mark is drawn now (mid-flight included), let the caller write the new place, then slide from
    // the old place to it with a transform. An interrupted glide restarts from wherever it had reached.
    const glide = (els, animate) => {
      const before = els.map(el => animate && el.isConnected && !el.hidden ? el.getBoundingClientRect() : null);
      for (const el of els) halt(el, 'glide');
      return () => {
        if (!animate) return; const duration = ms('--fast', 140);
        els.forEach((el, k) => {
          const a = before[k]; if (!a || !(a.width || a.height) || el.hidden) return;
          const b = el.getBoundingClientRect(); if (!(b.width || b.height)) return;
          const dx = a.left - b.left, dy = a.top - b.top; if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
          play(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], duration, 'glide');
        });
      };
    };
    // A changed figure rolls through a fixed window in the direction it moved: up rises from below, down drops from above.
    const roll = (el, text, direction, animate) => {
      if (!el || el.textContent === text) return; el.textContent = text; if (!animate || !direction) return;
      play(el, direction > 0
        ? [{ clipPath: 'inset(0 0 35% 0)', transform: 'translateY(35%)' }, { clipPath: 'inset(0)', transform: 'none' }]
        : [{ clipPath: 'inset(35% 0 0 0)', transform: 'translateY(-35%)' }, { clipPath: 'inset(0)', transform: 'none' }], ms('--press', 160), 'roll');
    };
    const rollValue = (el, value, fmt, animate) => {
      if (!el) return; const was = Number(el.dataset.shown);
      roll(el, Number.isFinite(value) ? fmt.full(value) : '—', Number.isFinite(was) && Number.isFinite(value) ? Math.sign(value - was) : 0, animate);
      if (Number.isFinite(value)) el.dataset.shown = String(value); else delete el.dataset.shown;
    };

    // The tip is built once and updated in place: a header, one row per series and an optional foot (a delta or a note).
    // Its width is fixed from the widest reading in the chart, so the box holds still while the reader scrubs.
    const tipView = (tip, series, color, dash) => {
      const title = node('strong'), list = node('dl'), cells = series.map(s => {
        const term = node('dt'), swatch = node('i'), value = node('dd'); swatch.style.setProperty('--tip-color', color(s)); if (dash && s.style === 'previous') swatch.dataset.mark = 'dash';
        term.append(swatch, node('span', undefined, s.name)); list.append(term, value); return value;
      });
      const footName = node('dt', 'ps-plot-tip-total'), footValue = node('dd', 'ps-plot-tip-total'), pill = node('span', 'ps-delta');
      footValue.append(pill); list.append(footName, footValue); tip.replaceChildren(title, list);
      const set = view => {
        setText(title, view.heading); view.values.forEach((v, k) => setText(cells[k], v));
        footName.hidden = footValue.hidden = !view.foot; if (view.foot) { setText(footName, view.foot.name); setDelta(pill, view.foot.delta || null); }
      };
      // Measured over every period once per draw (a resize or a text-size change): O(periods) reads of one small box.
      const fit = views => {
        tip.style.minWidth = ''; if (!views.length) return;
        tip.style.setProperty('--tip-value', `${Math.max(1, ...views.flatMap(v => v.values.map(text => text.length)))}ch`);
        if (!tip.offsetWidth) return; // hidden on a narrow plot
        let width = 0; for (const view of views) { set(view); width = Math.max(width, tip.getBoundingClientRect().width); }
        tip.style.minWidth = `${Math.ceil(width)}px`;
      };
      return { set, fit };
    };
    // The tip grows away from its mark on the side with room, and never leaves the plot vertically.
    const placeTip = (tip, box, left, right, top) => {
      const width = box.clientWidth, gap = 12, tw = tip.offsetWidth, after = right + gap + tw <= width || left - gap - tw < 0;
      tip.style.left = after ? `${right + gap}px` : 'auto'; tip.style.right = after ? 'auto' : `${width - left + gap}px`;
      tip.style.top = `${clamp(top, 0, Math.max(0, box.clientHeight - tip.offsetHeight))}px`;
    };
    // The focused period's label always shows, in ink; thinned neighbors that would crowd it give way.
    const paintDates = (row, labels, ticks, index, xOf) => {
      const every = ticks.length > 1 ? ticks[1].index - ticks[0].index : 1;
      const shown = ticks.filter(t => every === 1 || t.index === index || Math.abs(t.index - index) > every / 2);
      if (!shown.some(t => t.index === index) && labels[index] !== undefined) shown.push({ index });
      shown.sort((a, b) => a.index - b.index); let month = '';
      row.replaceChildren(...shown.map(t => {
        const [head, ...rest] = labels[t.index].split(' '), label = node('span', undefined, head === month && rest.length ? rest.join(' ') : labels[t.index]);
        month = head; label.dataset.x = String(xOf(t.index)); if (t.index === index) label.dataset.focus = ''; return label;
      }));
      // Labels stay inside the row: an edge label shifts inward instead of hanging past the plot as text grows.
      // Positions are stored as fractions of the row, so a row that narrows before the next draw keeps its labels inside it.
      const width = Math.max(1, row.clientWidth);
      for (const label of row.children) { const half = label.offsetWidth / 2; label.style.left = `${clamp(Number(label.dataset.x), half, Math.max(half, width - half)) / width * 100}%`; }
    };
    // Tick spacing assumes caption text at 12px; larger text asks for proportionally fewer labels.
    const tickWidth = (row, width) => width / Math.max(1, (parseFloat(win.getComputedStyle(row).fontSize) || 12) / 12);
    // Input source decides motion: a pointer gets short ease-out transitions, a key press none (CSS reads data-input).
    // Captured on the block, so the source is known before any inner handler draws the change.
    const track = (block, on) => { const set = value => { if (block.dataset.input !== value) block.dataset.input = value; }; on(block, 'pointerdown', () => set('pointer'), true); on(block, 'pointermove', () => set('pointer'), true); on(block, 'keydown', () => set('key'), true); };
    // Redraws when the plot's width changes or its date row grows with the text size.
    const observe = (el, rowEl, draw) => {
      let key = ''; const Observer = win.ResizeObserver; if (!Observer) return () => {};
      const ro = new Observer(() => { const next = `${Math.round(el.clientWidth)}:${Math.round(rowEl.clientHeight)}`; if (next !== key) { key = next; draw(); } });
      ro.observe(el); ro.observe(rowEl); return () => ro.disconnect();
    };

    function lineChart(block, on) {
      const plot = block.querySelector('[data-chart-plot]'), table = block.querySelector('[data-chart-data]'); if (!plot || !table) return () => {};
      const { series, rows } = readData(table), fmt = formatter(block), labels = rows.map(r => r.label), n = rows.length; if (!n || !series.length) return () => {};
      const notes = [...block.querySelectorAll('[data-chart-notes] [data-at]')].map(li => ({ index: labels.indexOf(li.dataset.at), name: li.dataset.mark || li.textContent.trim() })).filter(m => m.index >= 0);
      const prev = series.findIndex(s => s.style === 'previous'), main = Math.max(0, series.findIndex(s => s.style !== 'previous'));
      const lastOf = si => { for (let i = n - 1; i >= 0; i--) if (Number.isFinite(rows[i].values[si])) return i; return -1; };
      let index = Math.max(0, lastOf(main)), geo = null;
      const canvas = node('div', 'ps-chart-canvas'), svg = shape('svg', { 'aria-hidden': 'true', focusable: 'false' }), scale = node('div', 'ps-chart-scale');
      const focus = node('div', 'ps-chart-focus'), tip = node('div', 'ps-plot-tip'), dates = node('div', 'ps-chart-dates'), ends = node('div', 'ps-line-labels'), key = node('ul', 'ps-line-key'), marks = node('div', 'ps-chart-marks');
      const dots = series.map(s => { const dot = node('i', 'ps-chart-dot'); dot.style.setProperty('--series', colorOf(s)); return dot; });
      // Narrow plots move the end labels into a key above the plot; each entry draws its line as the plot does.
      for (const [si, s] of series.entries()) {
        const li = node('li'), swatch = node('i'), last = lastOf(si); swatch.style.setProperty('--series', colorOf(s)); if (s.style === 'previous') swatch.dataset.mark = 'dash';
        li.append(swatch, node('span', undefined, s.name), node('b', undefined, last >= 0 ? fmt.full(rows[last].values[si]) : '—')); key.append(li);
      }
      // The frame holds the scale, labels and tip, which sit in the gutters; only the drawing inside the canvas is clipped.
      const frame = node('div', 'ps-chart-frame');
      tip.setAttribute('aria-hidden', 'true'); if (notes.length) frame.dataset.marks = '';
      const tipFor = tipView(tip, series, s => s.style === 'previous' ? 'var(--inverse-muted)' : colorOf(s), true);
      // Everything the focus states about one period, computed once for the tip, the headline and the readout.
      const present = i => {
        const row = rows[i], v = row.values[main], delta = change(v, prev >= 0 ? row.values[prev] : rows[0].values[main]), note = notes.filter(m => m.index === i).map(m => m.name);
        return {
          row, v, delta, note, heading: row.full, values: series.map((s, si) => Number.isFinite(row.values[si]) ? fmt.full(row.values[si]) : '—'),
          foot: prev >= 0 && delta ? { name: 'Change', delta } : note.length ? { name: note.join(', ') } : null,
        };
      };
      canvas.append(svg, focus, ...dots); frame.append(scale, canvas, marks, ends, tip); plot.replaceChildren(key, frame, dates);
      for (const el of [key, frame, dates]) el.setAttribute('aria-hidden', 'true');
      const readout = block.querySelector('[data-chart-readout]');

      const draw = () => {
        const W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return;
        const { top, ticks } = chartScale(Math.max(0, ...rows.flatMap(r => finite(r.values))), H);
        const x = i => n > 1 ? i / (n - 1) * W : W / 2, y = v => H - v / top * H;
        geo = { W, H, x, y, ticks: chartTicks(labels, tickWidth(dates, W)) };
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
        const parts = ticks.map(t => shape('line', { x1: 0, x2: W, y1: y(t), y2: y(t), class: t ? 'ps-chart-grid' : 'ps-chart-zero' }));
        for (const m of notes) parts.push(shape('line', { x1: x(m.index), x2: x(m.index), y1: 0, y2: H, class: 'ps-chart-note-line' }));
        const points = series.map((s, si) => rows.map((r, i) => Number.isFinite(r.values[si]) ? [x(i), y(r.values[si])] : null));
        for (const [si, s] of series.entries()) {
          const defined = points[si].filter(Boolean); if (!s.area || defined.length < 2) continue;
          const area = shape('path', { d: `${pathThrough(defined)}L${defined.at(-1)[0].toFixed(1)} ${H}L${defined[0][0].toFixed(1)} ${H}Z`, class: 'ps-line-area' });
          area.style.setProperty('--series', colorOf(s)); parts.push(area);
        }
        // The comparison draws first and the primary last, so the series being read sits on top.
        const order = series.map((s, si) => si).sort((a, b) => (series[a].style === 'previous' ? -1 : a === main ? 1 : 0) - (series[b].style === 'previous' ? -1 : b === main ? 1 : 0));
        for (const si of order) { const line = shape('path', { d: pathThrough(points[si]), class: 'ps-line-path' }); line.style.setProperty('--series', colorOf(series[si])); if (series[si].style === 'previous') line.dataset.style = 'previous'; parts.push(line); }
        svg.replaceChildren(...parts);
        // The unit is stated once, on the top value.
        scale.replaceChildren(...ticks.map(t => { const label = node('b', undefined, t ? fmt.short(t, t === top) : '0'); label.style.top = `${y(t) / H * 100}%`; return label; }));
        const wanted = series.map((s, si) => { const last = lastOf(si); return last >= 0 ? y(rows[last].values[si]) : H; });
        const placed = spread(wanted, 38, 12, H - 12);
        ends.replaceChildren(...series.map((s, si) => {
          const last = lastOf(si), label = node('div', 'ps-line-label'), swatch = node('i'); label.style.top = `${placed[si] / H * 100}%`; swatch.style.setProperty('--series', colorOf(s)); if (s.style === 'previous') swatch.dataset.mark = 'dash';
          const name = node('span'); name.append(swatch, node('span', undefined, s.name)); label.append(node('b', undefined, last >= 0 ? fmt.full(rows[last].values[si]) : '—'), name); return label;
        }));
        marks.replaceChildren(...notes.map(m => { const flag = node('span', 'ps-chart-mark', m.name); flag.style.left = `${x(m.index) / W * 100}%`; flag.style.setProperty('--at', String(x(m.index) / W)); return flag; }));
        for (const flag of marks.children) if (flag.offsetLeft + flag.offsetWidth > W) flag.dataset.side = 'start';
        tipFor.fit(rows.map((r, i) => present(i)));
        show(index, false);
      };

      // The guide, the dots and the tip are written to their final place, then glide there together on a pointer.
      const show = (i, animate) => {
        index = clamp(i, 0, n - 1); if (!geo) return; const { row, v, delta, note, ...view } = present(index);
        const settle = glide([focus, ...dots, tip], animate);
        const X = geo.x(index), pct = X / geo.W * 100; focus.style.left = `${pct}%`;
        let high = geo.H;
        dots.forEach((dot, si) => { const value = row.values[si]; dot.hidden = !Number.isFinite(value); if (dot.hidden) return; const Y = geo.y(value); high = Math.min(high, Y); dot.style.left = `${pct}%`; dot.style.top = `${Y / geo.H * 100}%`; });
        tipFor.set(view);
        placeTip(tip, canvas, X, X, high - 24);
        settle();
        paintDates(dates, labels, geo.ticks, index, geo.x);
        setText(block.querySelector('[data-chart-label]'), row.full);
        rollValue(block.querySelector('[data-chart-value]'), v, fmt, animate);
        setDelta(block.querySelector('[data-chart-delta]'), index === 0 && prev < 0 ? null : delta);
        setText(block.querySelector('[data-chart-base]'), prev >= 0 ? `vs ${series[prev].name.toLowerCase()}` : index === 0 ? 'First period' : `since ${labels[0]}`);
        if (readout) setText(readout, [row.full, ...series.map((s, si) => `${s.name} ${Number.isFinite(row.values[si]) ? fmt.full(row.values[si]) : 'no data'}`), ...(delta && (prev >= 0 || index) ? [`${delta.arrow}\u00a0${delta.text} ${prev >= 0 ? `vs ${series[prev].name.toLowerCase()}` : `since ${labels[0]}`}`] : []), ...note].join(' · '));
        emit(block, 'pagesystem:line-chart', { index, label: row.label, values: [...row.values] });
      };
      const all = finite(rows.map(r => r.values[main]));
      setText(block.querySelector('[data-chart-peak]'), all.length ? fmt.full(Math.max(...all)) : '—');
      setText(block.querySelector('[data-chart-mean]'), all.length ? fmt.full(mean(all)) : '—');
      const at = event => { const box = canvas.getBoundingClientRect(); return clamp(Math.round((event.clientX - box.left) / Math.max(1, box.width) * (n - 1)), 0, n - 1); };
      // A pointer or a touch drag scrubs; a tap pins the period under it; keys step without motion.
      on(plot, 'pointermove', event => { const i = at(event); if (i !== index) show(i, moving(block)); });
      on(plot, 'pointerdown', event => show(at(event), moving(block)));
      on(plot, 'keydown', event => { const i = nextIndex(event.key, index, n); if (i === undefined) return; event.preventDefault(); show(i, false); });
      const stop = observe(canvas, dates, draw); draw();
      return stop;
    }

    // Vertical bars, shared by the bar chart and the period comparison: one button per period, one bar per series.
    function columnChart(block, on, opts) {
      const plot = block.querySelector('[data-chart-plot]'), table = block.querySelector('[data-chart-data]'); if (!plot || !table) return null;
      const { series, rows } = readData(table), fmt = formatter(block), labels = rows.map(r => r.label), n = rows.length; if (!n || !series.length) return null;
      const main = Math.max(0, series.findIndex(s => s.style !== 'previous')), prev = series.findIndex(s => s.style === 'previous');
      const values = finite(rows.map(r => r.values[main]));
      const reference = opts.reference === 'target' ? { name: 'Target', value: Number(block.dataset.chartTarget) } : opts.reference === 'average' ? { name: 'Average', value: mean(values) } : null;
      if (reference && !Number.isFinite(reference.value)) reference.value = null;
      const frame = node('div', 'ps-chart-frame ps-bar-frame'), canvas = node('div', 'ps-chart-canvas'), scale = node('div', 'ps-chart-scale'), columns = node('div', 'ps-bar-columns'), tip = node('div', 'ps-plot-tip'), dates = node('div', 'ps-chart-dates');
      const ref = reference?.value != null ? node('div', 'ps-chart-ref') : null; tip.setAttribute('aria-hidden', 'true');
      if (ref) { const tag = node('span', 'ps-chart-ref-tag'); tag.append(node('span', undefined, reference.name), node('b', undefined, fmt.short(reference.value))); ref.append(tag); ref.setAttribute('aria-hidden', 'true'); plot.dataset.reference = ''; }
      if (prev >= 0) plot.dataset.grouped = '';
      scale.setAttribute('aria-hidden', 'true'); dates.setAttribute('aria-hidden', 'true');
      const describe = i => { const row = rows[i]; return [row.full, ...series.map((s, si) => `${s.name} ${Number.isFinite(row.values[si]) ? fmt.full(row.values[si]) + (row.partial[si] ? ' so far' : '') : 'not yet'}`)].join(', '); };
      const buttons = rows.map((row, i) => {
        const button = node('button', 'ps-bar-column'); button.type = 'button'; button.dataset.index = String(i); button.setAttribute('aria-label', describe(i));
        for (const [si, s] of series.entries()) {
          const bar = node('span', 'ps-bar'); bar.dataset.role = s.style === 'previous' ? 'previous' : 'primary'; bar.style.setProperty('--series', colorOf(s)); bar.setAttribute('aria-hidden', 'true');
          if (row.partial[si]) bar.dataset.partial = ''; if (!Number.isFinite(row.values[si])) bar.dataset.empty = ''; button.append(bar);
        }
        columns.append(button); return button;
      });
      // A partial bucket's label sits outside its button, so the button's name stays the one its label states.
      const flags = rows.map((row, i) => row.partial.some(Boolean) ? { i, el: node('span', 'ps-bar-flag', 'Partial') } : null).filter(Boolean);
      for (const f of flags) f.el.setAttribute('aria-hidden', 'true');
      // One band marks the inspected period and slides between columns, so the eye follows the focus rather than a blink.
      const band = node('span', 'ps-bar-band'); band.setAttribute('aria-hidden', 'true'); band.style.setProperty('--band-n', String(n)); columns.prepend(band);
      canvas.append(columns); frame.append(scale, canvas, ...flags.map(f => f.el), ...(ref ? [ref] : []), tip); plot.replaceChildren(frame, dates);
      const tipFor = tipView(tip, series, s => s.style === 'previous' ? 'var(--inverse-muted)' : colorOf(s), false);
      const present = i => {
        const row = rows[i], delta = opts.delta(rows, i, main, prev, reference, series);
        return { row, delta, heading: row.full, values: series.map((s, si) => Number.isFinite(row.values[si]) ? fmt.full(row.values[si]) + (row.partial[si] ? ' so far' : '') : 'Not yet'), foot: delta ? { name: delta.name, delta } : null };
      };
      let index = opts.start(rows, main), ticks = [];
      const draw = () => {
        const H = canvas.clientHeight, W = canvas.clientWidth; if (!H || !W) return;
        const { top, ticks: lines } = chartScale(Math.max(0, reference?.value || 0, ...rows.flatMap(r => finite(r.values))), H);
        scale.replaceChildren(...lines.map(t => { const line = node('span'); line.append(node('b', undefined, t ? fmt.short(t, t === top) : '0')); line.style.bottom = `${t / top * 100}%`; if (!t) line.dataset.zero = ''; return line; }));
        buttons.forEach((button, i) => {
          const bars = [...button.querySelectorAll('.ps-bar')]; bars.forEach((bar, si) => { const v = rows[i].values[si]; bar.style.height = `${Number.isFinite(v) ? v / top * 100 : 0}%`; });
        });
        for (const f of flags) { const bar = buttons[f.i].querySelector('.ps-bar[data-partial]'), si = rows[f.i].partial.indexOf(true); f.el.style.left = `${(buttons[f.i].offsetLeft + bar.offsetLeft + bar.offsetWidth / 2) / W * 100}%`; f.el.style.bottom = `calc(${rows[f.i].values[si] / top * 100}% + var(--s-4))`; }
        if (ref) ref.style.bottom = `${reference.value / top * 100}%`;
        ticks = chartTicks(labels, tickWidth(dates, W)); tipFor.fit(rows.map((r, i) => present(i))); show(index, false, false);
      };
      const center = i => { const b = buttons[i]; return b.offsetLeft + b.offsetWidth / 2; };
      // The band and the tip glide to the chosen period on a pointer; the bar colors crossfade in CSS.
      const show = (i, moveFocus, animate) => {
        index = clamp(i, 0, n - 1); const { row, delta, ...view } = present(index);
        const settle = glide([band, tip], animate);
        buttons.forEach((b, k) => { b.tabIndex = k === index ? 0 : -1; b.setAttribute('aria-pressed', String(k === index)); });
        band.style.setProperty('--band-i', String(index));
        if (moveFocus) buttons[index].focus();
        paintDates(dates, labels, ticks, index, center);
        tipFor.set(view);
        const b = buttons[index], tallest = Math.max(0, ...[...b.querySelectorAll('.ps-bar')].map(bar => bar.offsetHeight));
        placeTip(tip, canvas, b.offsetLeft, b.offsetLeft + b.offsetWidth, canvas.clientHeight - tallest);
        settle();
        opts.focus?.(row, delta, main, fmt, animate);
        const readout = block.querySelector('[data-chart-readout]'); if (readout) setText(readout, [describe(index), ...(delta ? [`${delta.arrow}\u00a0${delta.text} ${delta.base}`] : [])].join(' · '));
        emit(block, opts.event, { index, label: row.label, values: [...row.values] });
      };
      on(columns, 'click', event => { const b = event.target.closest('.ps-bar-column'); if (b) show(Number(b.dataset.index), false, moving(block)); });
      on(columns, 'keydown', event => { const i = nextIndex(event.key, index, n); if (i === undefined) return; event.preventDefault(); show(i, true, false); });
      const stop = observe(canvas, dates, draw); draw();
      return { stop, rows, series, main, prev, fmt, labels };
    }

    // Ranked horizontal bars: names and values are printed at every row, so the headline is the only restatement.
    function rankedChart(block, on) {
      const plot = block.querySelector('[data-chart-plot]'), table = block.querySelector('[data-chart-data]'); if (!plot || !table) return () => {};
      const { series, rows: authored } = readData(table), fmt = formatter(block); if (!authored.length || !series.length) return () => {};
      const rows = authored.map((r, i) => ({ ...r, order: i })).sort((a, b) => (b.values[0] ?? -1) - (a.values[0] ?? -1) || a.order - b.order), n = rows.length;
      const values = finite(rows.map(r => r.values[0])), average = mean(values), { top } = chartScale(Math.max(0, ...values), 200);
      const list = node('div', 'ps-bar-list'), guide = node('div', 'ps-bar-guide'), ref = node('div', 'ps-chart-ref'), axis = node('div', 'ps-bar-axis'), tag = node('span', 'ps-chart-ref-tag');
      list.style.gridTemplateRows = `repeat(${n}, auto) auto`; guide.style.gridRow = `1 / ${n + 1}`; axis.style.gridRow = String(n + 1);
      ref.style.left = `${average / top * 100}%`; tag.style.left = `${average / top * 100}%`; tag.append(node('span', undefined, 'Average'), node('b', undefined, fmt.short(average)));
      guide.append(ref); axis.append(tag); for (const el of [guide, axis]) el.setAttribute('aria-hidden', 'true');
      const buttons = rows.map((row, i) => {
        const button = node('button', 'ps-bar-row'), trackEl = node('span', 'ps-bar-track'), bar = node('span', 'ps-bar'), v = row.values[0];
        button.type = 'button'; button.dataset.index = String(i); button.style.gridRow = String(i + 1);
        bar.dataset.role = 'primary'; bar.style.setProperty('--series', colorOf(series[0])); bar.style.width = `${Number.isFinite(v) ? v / top * 100 : 0}%`; trackEl.setAttribute('aria-hidden', 'true'); trackEl.append(bar);
        button.append(node('span', 'ps-bar-name', row.full), node('span', 'ps-visually-hidden', ', '), trackEl, node('span', 'ps-bar-value', Number.isFinite(v) ? fmt.full(v) : '—')); list.append(button); return button;
      });
      // The band is a grid item sharing the focused row's cell, so it always fits that row and slides when the focus moves.
      const band = node('span', 'ps-bar-band'); band.setAttribute('aria-hidden', 'true');
      list.prepend(band); list.append(guide, axis); plot.replaceChildren(list);
      let index = 0;
      const show = (i, moveFocus, animate) => {
        index = clamp(i, 0, n - 1); const row = rows[index], v = row.values[0], delta = change(v, average);
        const settle = glide([band], animate);
        buttons.forEach((b, k) => { b.tabIndex = k === index ? 0 : -1; b.setAttribute('aria-pressed', String(k === index)); }); band.style.gridRow = String(index + 1);
        settle(); if (moveFocus) buttons[index].focus();
        setText(block.querySelector('[data-chart-label]'), `${row.full} · ranked ${index + 1} of ${n}`);
        rollValue(block.querySelector('[data-chart-value]'), v, fmt, animate);
        setDelta(block.querySelector('[data-chart-delta]'), delta); setText(block.querySelector('[data-chart-base]'), 'vs average');
        const readout = block.querySelector('[data-chart-readout]'); if (readout) setText(readout, `${row.full} · ${fmt.full(v)} · ranked ${index + 1} of ${n}${delta ? ` · ${delta.arrow}\u00a0${delta.text} vs average` : ''}`);
        emit(block, 'pagesystem:bar-chart', { index, label: row.label, values: [...row.values] });
      };
      setText(block.querySelector('[data-chart-total]'), fmt.full(sum(values))); setText(block.querySelector('[data-chart-mean]'), fmt.full(average));
      on(list, 'click', event => { const b = event.target.closest('.ps-bar-row'); if (b) show(Number(b.dataset.index), false, moving(block)); });
      on(list, 'keydown', event => { const i = nextIndex(event.key, index, n); if (i === undefined) return; event.preventDefault(); show(i, true, false); });
      show(0, false, false);
      return () => {};
    }

    function barChart(block, on) {
      if (block.dataset.chartOrientation === 'horizontal') return rankedChart(block, on);
      const compare = block.dataset.chartCompare || 'previous';
      const chart = columnChart(block, on, {
        event: 'pagesystem:bar-chart', reference: block.dataset.chartReference,
        start: (rows, main) => { let best = 0; rows.forEach((r, i) => { if ((r.values[main] ?? -Infinity) > (rows[best].values[main] ?? -Infinity)) best = i; }); return compare === 'latest' ? rows.length - 1 : best; },
        delta: (rows, i, main, prev, reference, series) => {
          const v = rows[i].values[main];
          if (prev >= 0) { const d = change(v, rows[i].values[prev]); return d && { ...d, name: 'Change', base: `vs ${series[prev].name}` }; }
          if (reference && block.dataset.chartReference === 'target') { const d = change(v, reference.value); return d && { ...d, name: 'Vs target', base: 'vs target' }; }
          const d = i ? change(v, rows[i - 1].values[main]) : null; return d && { ...d, name: `Vs ${rows[i - 1].label}`, base: `vs ${rows[i - 1].label}` };
        },
        focus: (row, delta, main, fmt, animate) => {
          setText(block.querySelector('[data-chart-label]'), row.full);
          rollValue(block.querySelector('[data-chart-value]'), row.values[main], fmt, animate);
          setDelta(block.querySelector('[data-chart-delta]'), delta); setText(block.querySelector('[data-chart-base]'), delta ? delta.base : 'First period');
        },
      });
      if (!chart) return () => {};
      const values = finite(chart.rows.map(r => r.values[chart.main])), target = Number(block.dataset.chartTarget);
      setText(block.querySelector('[data-chart-total]'), chart.fmt.full(sum(values))); setText(block.querySelector('[data-chart-mean]'), chart.fmt.full(mean(values)));
      if (Number.isFinite(target)) setText(block.querySelector('[data-chart-hits]'), `${values.filter(v => v >= target).length} of ${values.length}`);
      if (chart.prev >= 0) { const d = change(sum(values), sum(finite(chart.rows.map(r => r.values[chart.prev])))); setText(block.querySelector('[data-chart-yoy]'), d ? `${d.arrow}\u00a0${d.text}` : '—'); }
      return chart.stop;
    }

    function periodComparison(block, on) {
      const chart = columnChart(block, on, {
        event: 'pagesystem:period-comparison',
        start: (rows, main) => { for (let i = rows.length - 1; i >= 0; i--) if (Number.isFinite(rows[i].values[main])) return i; return 0; },
        delta: (rows, i, main, prev) => { if (prev < 0 || rows[i].partial[main]) return null; const d = change(rows[i].values[main], rows[i].values[prev]); return d && { ...d, name: 'Change', base: `vs ${rows[i].label} ${block.dataset.pairPrevious || 'last period'}` }; },
      });
      if (!chart) return () => {};
      const { rows, main, prev, fmt } = chart, name = block.dataset.pairPrevious || 'last period';
      // Like for like: the headline compares only buckets that are complete in the current period.
      const complete = rows.filter(r => Number.isFinite(r.values[main]) && !r.partial[main]);
      const current = sum(finite(rows.map(r => r.values[main]))), previous = prev >= 0 ? sum(finite(rows.map(r => r.values[prev]))) : 0;
      const whole = complete.length === rows.length, base = sum(finite(complete.map(r => r.values[prev]))), so = sum(complete.map(r => r.values[main]));
      setText(block.querySelector('[data-pair-current]'), fmt.full(current)); setText(block.querySelector('[data-pair-previous]'), fmt.full(previous));
      setDelta(block.querySelector('[data-chart-delta]'), change(so, base));
      setText(block.querySelector('[data-chart-base]'), whole ? `vs ${name}` : `${span(complete.map(r => r.label))} against the same days ${name}`);
      // Movers are ordered by the size of their change, whichever way it went.
      const movers = block.querySelector('[data-pair-movers]');
      if (movers) {
        const items = [...movers.querySelectorAll(':scope > li[data-current][data-previous]')].map(li => ({ li, now: Number(li.dataset.current), was: Number(li.dataset.previous) })).filter(m => Number.isFinite(m.now) && Number.isFinite(m.was));
        items.sort((a, b) => Math.abs(b.now - b.was) - Math.abs(a.now - a.was));
        for (const m of items) { setText(m.li.querySelector('[data-mover-value]'), fmt.full(m.now)); setText(m.li.querySelector('[data-mover-change]'), fmt.signed(m.now - m.was)); setDelta(m.li.querySelector('.ps-delta'), change(m.now, m.was)); movers.append(m.li); }
      }
      return chart.stop;
    }

    const disposers = [];
    const mount = (block, init) => {
      live.get(block)?.();
      const controller = new win.AbortController(), on = (el, type, fn, capture = false) => el.addEventListener(type, fn, { signal: controller.signal, capture });
      track(block, on); const stop = init(block, on);
      const off = () => {
        controller.abort(); stop(); if (live.get(block) === off) live.delete(block);
        for (const run of [...running]) if (block.contains(run.effect?.target)) run.cancel();
      };
      live.set(block, off); disposers.push(off);
    };
    for (const block of find('[data-ps-line-chart]')) mount(block, lineChart);
    for (const block of find('[data-ps-bar-chart]')) mount(block, barChart);
    for (const block of find('[data-ps-period-comparison]')) mount(block, periodComparison);
    return () => { for (const off of disposers.splice(0)) off(); };
  };
})());

var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitH(root, { doc, win, listen, find, emit }) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const svg = (tag, attrs) => { const el = doc.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v)); return el; };

  // Pure helpers. Every displayed figure is derived from the data attributes through these.
  const MINUS = '−';
  const finite = value => value !== '' && value != null && Number.isFinite(Number(value));
  const sum = values => values.reduce((n, v) => n + v, 0);
  // Shares at one decimal that add to exactly 100.0: largest remainder on tenths of a percent.
  const shares = values => {
    const total = sum(values); if (!total) return values.map(() => 0);
    const raw = values.map(v => v / total * 1000), floor = raw.map(Math.floor);
    let left = 1000 - sum(floor);
    raw.map((v, i) => [v - floor[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { floor[i] += 1; left -= 1; } });
    return floor.map(v => v / 10);
  };
  // Whole cells per part for a unit meter, by the same largest-remainder rule.
  const allocate = (values, cells, whole) => {
    const raw = values.map(v => v / whole * cells), floor = raw.map(Math.floor);
    let left = Math.min(cells, Math.round(sum(raw))) - sum(floor);
    raw.map((v, i) => [v - floor[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { floor[i] += 1; left -= 1; } });
    return floor;
  };
  const change = (current, previous) => previous ? (current - previous) / Math.abs(previous) * 100 : null;
  const signed = (value, digits, suffix) => { const text = Math.abs(value).toFixed(digits); return (Number(text) === 0 ? '' : value > 0 ? '+' : MINUS) + text + suffix; };
  const trendOf = value => value == null || Number(Math.abs(value).toFixed(1)) === 0 ? 'flat' : value > 0 ? 'up' : 'down';
  const ordinal = n => { const v = n % 100, s = ['th', 'st', 'nd', 'rd']; return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`; };
  const formatter = (unit, digits) => {
    const d = Number.isFinite(digits) ? digits : ['usd', 'count', 'ms'].includes(unit) ? 0 : 1;
    const number = new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    if (unit === 'usd') { const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }); return v => (v < 0 ? MINUS : '') + money.format(Math.abs(v)); }
    if (unit === 'percent') return v => (v < 0 ? MINUS : '') + number.format(Math.abs(v)) + '%';
    if (unit === 'hours') return v => number.format(v) + ' h';
    if (unit === 'ms') return v => number.format(v) + ' ms';
    return v => (v < 0 ? MINUS : '') + number.format(Math.abs(v));
  };
  const unitOf = el => formatter(el.dataset.unit || 'count', finite(el.dataset.digits) ? Number(el.dataset.digits) : undefined);
  // Parts under the threshold fold into Other, but only when two or more would fold, and never more than six
  // named parts keep a color. The result keeps descending order with Other last.
  const fold = (parts, threshold, colors) => {
    const total = sum(parts.map(p => p.value)), sorted = [...parts].sort((a, b) => b.value - a.value || a.index - b.index);
    let keep = sorted.filter((p, i) => i < colors && p.value / total >= threshold);
    let rest = sorted.filter(p => !keep.includes(p));
    if (rest.length === 1 && keep.length < colors) { keep = sorted; rest = []; }
    else if (rest.length === 1) { rest.unshift(keep.pop()); }
    const groups = keep.map(p => ({ ...p, members: [] }));
    if (rest.length) groups.push({ key: 'other', label: 'Other', value: sum(rest.map(p => p.value)), previous: rest.every(p => p.previous != null) ? sum(rest.map(p => p.previous)) : null, members: rest, other: true });
    return groups;
  };
  const PALETTE = ['endpoint', 'network', 'email', 'identity', 'saas', 'cloud'];
  const colorVar = key => key === 'other' ? 'var(--strong-line)' : key === 'spare' ? 'var(--well)' : `var(--source-${key})`;
  // A smooth sparkline through every value: horizontal control points at each midpoint never overshoot.
  const sparkPoints = (values, width, height, inset, low, high) => {
    const span = Math.max(1e-9, high - low), step = (width - inset * 2) / Math.max(1, values.length - 1);
    return values.map((v, i) => [inset + i * step, height - inset - (v - low) / span * (height - inset * 2)]);
  };
  const sparkPath = points => points.map(([x, y], i) => i ? `C${(x - (x - points[i - 1][0]) / 2).toFixed(1)} ${points[i - 1][1].toFixed(1)} ${(x - (x - points[i - 1][0]) / 2).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const trendWord = values => {
    const third = Math.max(1, Math.floor(values.length / 3)), mean = list => sum(list) / list.length;
    const a = mean(values.slice(0, third)), b = mean(values.slice(-third)), rel = a ? (b - a) / Math.abs(a) : b - a;
    return rel > 0.02 ? 'rising' : rel < -0.02 ? 'falling' : 'steady';
  };
  // Attainment against a target: lower-is-better metrics invert the ratio. Status follows from it, never typed.
  const attainment = (current, target, better) => better === 'down' ? (current ? target / current : 1) : (target ? current / target : 1);
  const statusOf = ratio => ratio >= 1 ? 'on' : ratio >= 0.95 ? 'risk' : 'off';
  const STATUS = { on: 'On track', risk: 'At risk', off: 'Off track' }, STATUS_RANK = { off: 0, risk: 1, on: 2 };

  // Shared presentation: a delta pill states direction in its arrow and sign, color only reinforces.
  const pill = (value, digits, suffix, effect, cls) => {
    const el = node('span', 'ps-delta' + (cls ? ' ' + cls : '')), trend = trendOf(value), icon = node('i', 'ps-i ' + (trend === 'up' ? 'ps-i-up' : trend === 'down' ? 'ps-i-down' : 'ps-i-right'));
    icon.setAttribute('aria-hidden', 'true'); el.dataset.trend = trend; if (effect) el.dataset.effect = trend === 'flat' ? 'flat' : effect;
    el.append(icon, doc.createTextNode(value == null ? 'New' : signed(value, digits, suffix))); return el;
  };
  const effectOf = (value, better) => value == null || better === 'none' ? undefined : (value >= 0) === (better !== 'down') ? 'good' : 'bad';

  // Motion is presentation only: the DOM is written in its final state, then element.animate() plays from the old look.
  // Key presses and reduced motion skip it; nothing is scheduled, so disposal only cancels running animations, and an
  // animation's own finish or cancel removes any stand-in it was carrying.
  const running = new Set(), byElement = new WeakMap();
  const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timing = (el, name, fallback) => parseFloat(win.getComputedStyle(el).getPropertyValue(name)) || fallback;
  const play = (el, frames, duration, after) => {
    if (!el.animate) { after?.(); return null; }
    const run = el.animate(frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' }), mine = byElement.get(el) || new Set();
    running.add(run); mine.add(run); byElement.set(el, mine);
    let settled = false; const done = () => { if (settled) return; settled = true; running.delete(run); mine.delete(run); after?.(); };
    run.addEventListener('finish', done); run.addEventListener('cancel', done); return run;
  };
  // Stops an element's own animations; measure first, so an interrupted move restarts from where it was drawn.
  const halt = el => { for (const run of [...(byElement.get(el) || [])]) run.cancel(); };
  const rise = (el, duration) => play(el, [{ opacity: 0.72, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], duration);
  // A changed figure rolls in from the side it moved toward.
  const roll = (el, up, duration) => play(el, up ? [{ clipPath: 'inset(0 0 35% 0)', transform: 'translateY(35%)' }, { clipPath: 'inset(0)', transform: 'none' }] : [{ clipPath: 'inset(35% 0 0 0)', transform: 'translateY(-35%)' }, { clipPath: 'inset(0)', transform: 'none' }], duration);
  const trackInput = el => { listen(el, 'pointerdown', () => { el.dataset.input = 'pointer'; }); listen(el, 'keydown', () => { el.dataset.input = 'key'; }); };
  const still = el => reduced() || el.dataset.input === 'key';
  // A pinned tip: it glides between positions on pointer input, rises in when it appears and fades out through an
  // inert copy when it goes, so the real tip is hidden at once and the markup is always final.
  const floating = tip => {
    let ghost = null;
    const drop = () => { if (ghost) { halt(ghost); ghost?.remove(); ghost = null; } };
    return {
      place(x, y, animate, duration) {
        const showing = !tip.hidden; drop(); tip.hidden = false;
        tip.toggleAttribute('data-glide', showing && animate); tip.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
        if (!showing && animate) rise(tip, duration);
      },
      hide(animate, duration) {
        if (tip.hidden) return; drop(); halt(tip);
        if (animate) {
          const copy = tip.cloneNode(true); copy.dataset.ghost = ''; copy.removeAttribute('data-glide'); copy.inert = true; tip.after(copy); ghost = copy;
          play(copy, [{ opacity: 1 }, { opacity: 0 }], duration, () => { copy.remove(); if (ghost === copy) ghost = null; });
        }
        tip.hidden = true; tip.removeAttribute('data-glide');
      },
    };
  };
  // A tip keeps one width while it is scrubbed: the widest of every state it can show, in ems so it follows the text size.
  const fixWidth = (tip, states, fill) => {
    tip.style.minWidth = ''; const was = tip.hidden; tip.hidden = false; let widest = 0;
    if (win.getComputedStyle(tip).display !== 'none') for (const state of states) { fill(state); widest = Math.max(widest, tip.getBoundingClientRect().width); }
    tip.hidden = was; const size = parseFloat(win.getComputedStyle(tip).fontSize) || 16;
    if (widest) tip.style.minWidth = `${(Math.ceil(widest) / size).toFixed(3)}em`;
  };
  // A delta pill rewritten in place: the same nodes, a new sign, arrow and effect.
  const repill = (el, value, digits, suffix, effect) => {
    const trend = trendOf(value), icon = el.firstChild, text = el.lastChild;
    el.dataset.trend = trend; if (effect) el.dataset.effect = trend === 'flat' ? 'flat' : effect; else delete el.dataset.effect;
    icon.className = 'ps-i ' + (trend === 'up' ? 'ps-i-up' : trend === 'down' ? 'ps-i-down' : 'ps-i-right');
    text.textContent = value == null ? '—' : signed(value, digits, suffix);
  };
  // A block is bound once per mounted root; disposal releases it so a later mount binds again.
  const bound = [], observers = [];
  let breakdownSerial = 0;
  const claim = block => { if (block.__psKitH) return false; block.__psKitH = true; bound.push(block); return true; };
  // Rows slide from where they were drawn (measured before the change, mid-flight included) to their new places.
  const tops = els => new Map(els.map(el => [el, el.getBoundingClientRect().top]));
  const flip = (before, duration) => { for (const [el, was] of before) { if (el.hidden || !el.isConnected) continue; const dy = was - el.getBoundingClientRect().top; if (Math.abs(dy) > 0.5) play(el, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], duration); } };
  // Roving focus over a list of controls: arrows move, Home and End jump.
  const rove = (event, list, current) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!list.length) return null;
    const at = Math.max(0, list.indexOf(current));
    if (event.key in keys) return list[Math.max(0, Math.min(list.length - 1, at + keys[event.key]))];
    if (event.key === 'Home') return list[0];
    if (event.key === 'End') return list[list.length - 1];
    return null;
  };

  /* Bar list: ranked rows on one shared scale; a chosen row is compared against the rest. */
  for (const block of find('[data-ps-bar-list]')) {
    if (!claim(block)) continue;
    const list = block.querySelector('[data-barlist-rows]'), more = block.querySelector('[data-barlist-more]'), readout = block.querySelector('[data-barlist-readout]');
    const tag = block.querySelector('[data-barlist-tag]'), sorts = [...block.querySelectorAll('[data-barlist-sort]')], fmt = unitOf(block), noun = block.dataset.noun || '';
    const items = [...list.children].filter(li => finite(li.dataset.value)).map((li, index) => ({
      li, index, button: li.querySelector('.ps-barlist-row'), value: Number(li.dataset.value),
      previous: finite(li.dataset.previous) ? Number(li.dataset.previous) : null,
      label: li.dataset.label || li.querySelector('.ps-barlist-text')?.textContent.trim() || '',
    }));
    if (!items.length) continue;
    const limit = Math.max(1, Number(block.dataset.limit) || 5), total = sum(items.map(it => it.value)), max = Math.max(...items.map(it => it.value)) || 1;
    const shareList = shares(items.map(it => it.value)), ranked = [...items].sort((a, b) => b.value - a.value || a.index - b.index);
    const defaultReadout = readout?.textContent || '';
    let sort = sorts.find(el => el.checked)?.value || 'value', expanded = block.hasAttribute('data-expanded');
    let chosen = items.find(it => it.li.hasAttribute('data-chosen')) || null, active = chosen;
    trackInput(block);
    // Marks and derived text: bar lengths share one scale, the largest row fills its track.
    items.forEach((it, i) => {
      it.share = shareList[i]; it.rank = ranked.indexOf(it) + 1;
      it.li.style.setProperty('--barlist-w', `${+(it.value / max * 100).toFixed(2)}%`);
      const value = it.li.querySelector('.ps-barlist-value'), share = it.li.querySelector('.ps-barlist-share'), delta = it.li.querySelector('.ps-barlist-delta');
      // The row's name is its visible text plus hidden joiners, so speech reads "/pricing, 28,460 views, 18.2% of the total".
      const hidden = text => node('span', 'ps-visually-hidden', text);
      if (value) value.replaceChildren(hidden(', '), doc.createTextNode(fmt(it.value)), ...(noun ? [hidden(' ' + noun)] : []));
      if (share) share.replaceChildren(hidden(', '), doc.createTextNode(`${it.share.toFixed(1)}%`), hidden(' of the total'));
      const diff = it.previous != null ? change(it.value, it.previous) : null;
      if (delta) delta.replaceChildren(hidden(', '), pill(diff, 1, '%', effectOf(diff, block.dataset.better || 'up')), hidden(diff == null ? ' this period' : ' on the previous period'));
      it.button.removeAttribute('aria-label');
    });
    const totalEl = block.querySelector('[data-barlist-total]'), deltaEl = block.querySelector('[data-barlist-delta]');
    if (totalEl) totalEl.textContent = fmt(total);
    if (deltaEl && finite(block.dataset.previousTotal)) { const diff = change(total, Number(block.dataset.previousTotal)); deltaEl.replaceWith(pill(diff, 1, '%', effectOf(diff, block.dataset.better || 'up'))); }
    // The tag's width clamps it inside the scale; it is re-measured whenever its text reflows.
    const measureTag = () => { if (tag && !tag.hidden) block.style.setProperty('--barlist-tag', `${tag.offsetWidth}px`); };
    if (tag && win.ResizeObserver) { const watch = new win.ResizeObserver(measureTag); watch.observe(tag); observers.push(watch); }
    const ordered = () => [...items].sort(sort === 'name' ? (a, b) => a.label.localeCompare(b.label) || a.index - b.index : (a, b) => b.value - a.value || a.index - b.index);
    const visible = () => [...list.children].map(li => items.find(it => it.li === li)).filter(it => it && !it.li.hidden);
    const describe = it => {
      const parts = [`${it.label}`, `${ordinal(it.rank)} of ${items.length}`, `${fmt(it.value)}${noun ? ' ' + noun : ''}`, `${it.share.toFixed(1)}% of the total`];
      const lead = ranked[0], next = ranked[1];
      if (it === lead && next) parts.push(`${fmt(it.value - next.value)} ahead of ${next.label}`);
      else if (it !== lead) parts.push(`${fmt(lead.value - it.value)} behind ${lead.label}`);
      return parts.join(' · ');
    };
    let shownChoice = chosen, ready = false;
    const paint = (announce = true) => {
      block.toggleAttribute('data-focused', !!chosen);
      for (const it of items) { const on = it === chosen; it.button.setAttribute('aria-pressed', String(on)); it.li.toggleAttribute('data-chosen', on); it.button.tabIndex = it === active ? 0 : -1; }
      // The reference line marks the chosen value across every row; its tag sits at the scale's top edge. Moving from one
      // choice to another glides the line and rolls the tag's figure; with no choice the line fades where it stood.
      const was = shownChoice, moving = !!(was && chosen && was !== chosen), animate = ready && !still(block);
      block.toggleAttribute('data-glide', moving);
      if (chosen) block.style.setProperty('--barlist-ref', `${chosen.value / max * 100}%`);
      if (tag) {
        const appearing = tag.hidden && !!chosen;
        tag.textContent = chosen ? fmt(chosen.value) : ''; tag.hidden = !chosen; measureTag();
        if (animate && appearing) rise(tag, timing(block, '--press', 160));
        else if (animate && moving) roll(tag, chosen.value > was.value, timing(block, '--press', 160));
      }
      shownChoice = chosen;
      if (readout && announce) readout.textContent = (chosen ? describe(chosen) : defaultReadout).replaceAll(' · ', '\u00a0· ');
      emit(block, 'pagesystem:bar-list', { sort, expanded, chosen: chosen ? { label: chosen.label, value: chosen.value, share: chosen.share, rank: chosen.rank } : null });
    };
    // Rows that leave are drawn by an inert, unlabeled stand-in outside the list, so the list itself is always final.
    const frame = list.parentElement, standIns = new Set();
    const standIn = rows => {
      const box = node('div', 'ps-barlist-standin'); box.setAttribute('aria-hidden', 'true'); box.inert = true;
      for (const it of rows) {
        const row = node('div', 'ps-barlist-ghost'), copy = it.button.cloneNode(true);
        row.style.setProperty('--barlist-w', it.li.style.getPropertyValue('--barlist-w')); copy.removeAttribute('aria-pressed'); copy.tabIndex = -1;
        row.append(copy); box.append(row);
      }
      standIns.add(box); return box;
    };
    const clearStandIns = () => { for (const box of [...standIns]) { halt(box); box.remove(); } standIns.clear(); };
    const below = () => { const out = []; for (let el = frame.nextElementSibling; el; el = el.nextElementSibling) out.push(el); return out; };
    const layout = animate => {
      // Measure what is drawn now, mid-flight included, then stop everything and write the final state.
      const shown = items.filter(it => !it.li.hidden), after = below();
      const before = animate ? tops([...shown.map(it => it.li), ...after]) : null, rects = animate ? new Map(shown.map(it => [it, it.li.getBoundingClientRect()])) : null;
      clearStandIns(); halt(list); for (const it of items) halt(it.li); for (const el of after) halt(el);
      const order = ordered(); list.append(...order.map(it => it.li));
      order.forEach((it, i) => { it.li.hidden = !expanded && i >= limit; });
      if (more) { more.hidden = items.length <= limit; more.setAttribute('aria-expanded', String(expanded)); more.textContent = expanded ? `Show top ${limit}` : `Show all ${items.length}`; }
      if (chosen?.li.hidden) chosen = null;
      if (!active || active.li.hidden) active = chosen || visible()[0] || null;
      if (!animate) return;
      const settle = timing(block, '--settle', 220), press = timing(block, '--press', 160);
      const leaving = shown.filter(it => it.li.hidden), entering = order.filter(it => !it.li.hidden && !before.has(it.li));
      if (leaving.length && !entering.length) {
        // Show top N: the rows past the limit collapse under the list, carrying everything below up with them.
        const box = standIn(leaving); list.after(box);
        play(box, [{ height: `${box.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], settle, () => { box.remove(); standIns.delete(box); });
      } else if (leaving.length) {
        // A re-sort that swaps which rows make the top N: each leaving row fades where it stood while the rest slide.
        const origin = frame.getBoundingClientRect(), style = win.getComputedStyle(frame);
        for (const it of leaving) {
          const box = standIn([it]), rect = rects.get(it);
          box.classList.add('ps-barlist-standin-over'); box.style.top = `${rect.top - origin.top}px`; box.style.gridTemplateColumns = style.gridTemplateColumns; box.style.columnGap = style.columnGap;
          frame.append(box); play(box, [{ opacity: 1 }, { opacity: 0 }], press, () => { box.remove(); standIns.delete(box); });
        }
      }
      // Show all: the list is revealed downward in step with the controls below it sliding to their new places.
      const lead = after.find(el => !el.hidden), grow = lead && before.has(lead) ? lead.getBoundingClientRect().top - before.get(lead) : 0;
      if (grow > 0.5 && entering.length) play(list, [{ clipPath: `inset(-8px -8px ${grow}px -8px)` }, { clipPath: 'inset(-8px -8px -8px -8px)' }], settle);
      flip(before, settle);
      for (const it of entering) rise(it.li, press);
    };
    const choose = (it, focus) => { chosen = chosen === it ? null : it; if (it) active = it; paint(); if (focus) it.button.focus(); };
    listen(list, 'click', event => { const li = event.target.closest('li'); const it = items.find(x => x.li === li); if (it) choose(it, false); });
    listen(list, 'keydown', event => {
      block.dataset.input = 'key';
      if (event.key === 'Escape' && chosen) { event.preventDefault(); chosen = null; paint(); return; }
      const current = items.find(it => it.button === doc.activeElement), next = rove(event, visible(), current);
      if (!next) return; event.preventDefault(); active = next; chosen = next; paint(); next.button.focus();
    });
    for (const input of sorts) listen(input, 'change', () => { if (!input.checked) return; sort = input.value; layout(!still(block)); paint(false); });
    if (more) listen(more, 'click', () => { expanded = !expanded; layout(!still(block)); paint(false); });
    layout(false); paint(!!chosen); ready = true;
  }

  /* Breakdown: one part-to-whole bar (or two periods, or a budget meter) and a legend table that drives it. */
  for (const block of find('[data-ps-breakdown]')) {
    if (!claim(block)) continue;
    const mode = block.dataset.breakdownMode || 'share', fmt = unitOf(block), threshold = (finite(block.dataset.threshold) ? Number(block.dataset.threshold) : 3) / 100;
    const dataRows = [...block.querySelectorAll('[data-breakdown-data] tr')].filter(tr => finite(tr.dataset.value));
    const parts = dataRows.map((tr, index) => ({ index, key: tr.dataset.key || `part-${index}`, label: tr.dataset.label || tr.cells[0].textContent.trim(), value: Number(tr.dataset.value), previous: finite(tr.dataset.previous) ? Number(tr.dataset.previous) : null }));
    const figure = block.querySelector('[data-breakdown-figure]'), legend = block.querySelector('[data-breakdown-legend]'), status = block.querySelector('[data-breakdown-status]');
    if (!parts.length || !figure || !legend) continue;
    const budget = mode === 'budget' && finite(block.dataset.budget) ? Number(block.dataset.budget) : null;
    const groups = fold(parts, threshold, PALETTE.length);
    groups.forEach((g, i) => { g.color = g.other ? 'other' : PALETTE[i]; });
    const total = sum(groups.map(g => g.value)), whole = budget || total, previousTotal = groups.every(g => g.previous != null) ? sum(groups.map(g => g.previous)) : null;
    const current = shares(budget ? [...groups.map(g => g.value), Math.max(0, budget - total)] : groups.map(g => g.value));
    const before = previousTotal ? shares(groups.map(g => g.previous)) : null;
    groups.forEach((g, i) => { g.share = current[i]; g.prevShare = before ? before[i] : null; g.diff = change(g.value, g.previous); });
    const spare = budget ? { key: 'unallocated', label: 'Unallocated', value: Math.max(0, budget - total), share: current.at(-1), color: 'spare', members: [] } : null;
    const entries = spare ? [...groups, spare] : groups;
    trackInput(block);
    // Headline figures.
    const totalEl = block.querySelector('[data-breakdown-total]'), deltaEl = block.querySelector('[data-breakdown-delta]');
    if (totalEl) totalEl.textContent = fmt(total);
    if (deltaEl && previousTotal != null) { const diff = change(total, previousTotal); deltaEl.replaceWith(pill(diff, 1, '%', effectOf(diff, block.dataset.better || 'up'))); }
    const spareEl = block.querySelector('[data-breakdown-spare]'); if (spareEl && spare) spareEl.textContent = fmt(spare.value);
    // Marks: segments flex by value and separate by a gap of background; a budget draws whole cells instead.
    const bars = [], segs = new Map(entries.map(g => [g.key, []]));
    const segment = (g, grow, cls) => { const el = node('span', 'ps-breakdown-seg' + (cls ? ' ' + cls : '')); el.dataset.key = g.key; el.dataset.color = g.color; if (grow != null) el.style.flexGrow = String(grow); segs.get(g.key).push(el); return el; };
    const periods = mode === 'compare' && before ? [['current', block.dataset.currentLabel || 'Current', 'value'], ['previous', block.dataset.previousLabel || 'Previous', 'previous']] : [['current', null, 'value']];
    const rows = periods.map(([id, label, field]) => {
      const row = node('div', 'ps-breakdown-track'), bar = node('div', 'ps-breakdown-bar'); row.dataset.period = id;
      if (label) row.append(node('span', 'ps-breakdown-period', label));
      if (budget) {
        const cells = Math.max(10, Number(block.dataset.cells) || 40), counts = allocate(groups.map(g => g.value), cells, budget);
        bar.classList.add('ps-breakdown-cells'); bar.style.setProperty('--cells', String(cells));
        groups.forEach((g, i) => { for (let c = 0; c < counts[i]; c++) bar.append(segment(g, null)); });
        for (let c = sum(counts); c < cells; c++) bar.append(segment(spare, null));
      } else for (const g of groups) if (g[field] > 0) bar.append(segment(g, g[field]));
      row.append(bar); bars.push(bar); return row;
    });
    const scale = node('div', 'ps-breakdown-scale'); scale.setAttribute('aria-hidden', 'true');
    scale.append(node('span', '', budget ? fmt(0) : '0%'), node('span', '', budget ? fmt(budget) : '100%'));
    const tip = node('div', 'ps-plot-tip ps-breakdown-tip'); tip.setAttribute('aria-hidden', 'true'); tip.hidden = true;
    const plot = node('div', 'ps-breakdown-plot'); plot.append(scale, tip, ...rows);
    figure.replaceChildren(plot);
    // Legend rows: swatch, name, figures, and the members of Other.
    const columns = (legend.closest('table')?.tHead?.rows[0]?.cells.length || 4) - 1;
    const share = v => v == null ? '—' : `${v.toFixed(1)}%`;
    const cellsFor = g => {
      if (g === spare) return [fmt(g.value), share(g.share), ''];
      if (mode === 'compare') return [share(g.prevShare), share(g.share), g.prevShare == null ? null : pill(g.share - g.prevShare, 1, ' pt', 'neutral')];
      return [fmt(g.value), share(g.share), g.previous == null ? null : pill(g.diff, 1, '%', effectOf(g.diff, block.dataset.better || 'up'))];
    };
    const buttons = new Map();
    const serial = ++breakdownSerial;
    legend.replaceChildren(...entries.flatMap(g => {
      const tr = node('tr'), th = node('th'), button = node('button', 'ps-breakdown-item'), swatch = node('i', 'ps-breakdown-swatch');
      th.scope = 'row'; tr.dataset.key = g.key; button.type = 'button'; swatch.dataset.color = g.color; swatch.setAttribute('aria-hidden', 'true');
      button.append(swatch, node('span', '', g.label)); button.setAttribute('aria-pressed', 'false'); th.append(button); buttons.set(g.key, button);
      tr.append(th);
      for (const value of cellsFor(g).slice(0, columns)) { const td = node('td'); if (value?.nodeType) td.append(value); else td.textContent = value ?? '—'; tr.append(td); }
      if (!g.members.length) return [tr];
      // Other's members take a full-width line under it, and describe its control.
      const names = g.members.map(m => `${m.label}\u00a0${(m.value / whole * 100).toFixed(1)}%`), more = node('tr', 'ps-breakdown-members-row'), cell = node('td', 'ps-breakdown-members', `${g.members.length} folded: ${names.join(', ')}`);
      more.dataset.key = g.key; cell.colSpan = columns + 1; cell.id = `ps-breakdown-${serial}-members`; button.setAttribute('aria-describedby', cell.id); more.append(cell);
      return [tr, more];
    }));
    let hovered = null, chosen = null, active = entries[0].key;
    const entryOf = key => entries.find(g => g.key === key);
    // The tip is built once and rewritten in place: swatch and name, then the figures in a fixed-width tabular column.
    const tipSwatch = node('i'), tipName = node('span'), tipHead = node('strong'), tipList = node('dl'), tipCells = [];
    tipHead.append(tipSwatch, tipName);
    if (mode === 'compare') for (const [, label] of [periods[1], periods[0]]) { const dd = node('dd'); tipList.append(node('dt', '', label), dd); tipCells.push(dd); }
    else { tipCells.push(node('dd'), node('dd', 'ps-breakdown-tip-share')); tipList.append(...tipCells); }
    tip.append(tipHead, tipList);
    const fillTip = g => {
      tipSwatch.style.setProperty('--tip-color', colorVar(g.color)); tipName.textContent = g.label;
      const values = mode === 'compare' ? [share(g.prevShare), share(g.share)] : [fmt(g.value), share(g.share)];
      tipCells.forEach((dd, i) => { dd.textContent = values[i]; });
    };
    const tipState = floating(tip), drawn = entries.filter(g => segs.get(g.key)?.length);
    let tipFor = null, tipSized = false, ready = false;
    const sizeTip = () => { fixWidth(tip, drawn, fillTip); tipSized = !!tip.style.minWidth; if (tipFor) fillTip(tipFor); };
    const placeTip = g => {
      const marks = segs.get(g.key) || [];
      if (!marks.length) { tipState.hide(false); tipFor = null; return; }
      if (!tipSized) sizeTip();
      fillTip(g); tipFor = g;
      // Centered over the mark in the first bar and clamped inside the plot, so it never covers the bar it describes.
      const first = marks.filter(el => el.parentElement === bars[0]);
      const span = first.length ? first : marks, left = span[0].offsetLeft + span[0].parentElement.offsetLeft, right = span.at(-1).offsetLeft + span.at(-1).offsetWidth + span[0].parentElement.offsetLeft;
      const showing = !tip.hidden; tip.hidden = false;
      const width = plot.clientWidth, tw = tip.offsetWidth, x = Math.max(0, Math.min(width - tw, (left + right) / 2 - tw / 2));
      tip.hidden = !showing; tipState.place(x, 0, ready && !still(block), timing(block, '--fast', 140));
    };
    const paint = () => {
      const key = hovered || chosen; block.toggleAttribute('data-focused', !!key);
      for (const g of entries) {
        const on = g.key === key; for (const el of segs.get(g.key) || []) el.toggleAttribute('data-on', on);
        for (const tr of legend.querySelectorAll(`tr[data-key="${g.key}"]`)) { tr.toggleAttribute('data-on', on); tr.toggleAttribute('data-chosen', g.key === chosen); }
        buttons.get(g.key).setAttribute('aria-pressed', String(g.key === chosen)); buttons.get(g.key).tabIndex = g.key === active ? 0 : -1;
      }
      if (key) placeTip(entryOf(key)); else { tipState.hide(ready && !still(block), timing(block, '--press', 160)); tipFor = null; }
    };
    // Text can reflow after first paint (fonts, zoom, a narrower panel): the plot re-measures the tip's width, and the
    // tip re-centers whenever it or the plot resizes.
    if (win.ResizeObserver) {
      const watch = new win.ResizeObserver(changes => { if (changes.some(c => c.target === plot)) tipSized = false; if (tipFor && !tip.hidden) placeTip(tipFor); });
      watch.observe(tip); watch.observe(plot); observers.push(watch);
    }
    const announce = () => {
      const g = chosen && entryOf(chosen);
      if (status) status.textContent = !g ? '' : mode === 'compare' ? `${g.label}: ${share(g.prevShare)} ${periods[1][1]}, ${share(g.share)} ${periods[0][1]}` : `${g.label}: ${fmt(g.value)}, ${share(g.share)} of ${budget ? 'the budget' : 'the total'}`;
      emit(block, 'pagesystem:breakdown', { chosen: g ? { key: g.key, label: g.label, value: g.value, share: g.share } : null });
    };
    const choose = key => { chosen = chosen === key ? null : key; active = key; paint(); announce(); };
    const pointing = () => { block.dataset.input = 'pointer'; };
    listen(legend, 'click', event => { const tr = event.target.closest('tr[data-key]'); if (tr && event.target.closest('button')) choose(tr.dataset.key); });
    listen(legend, 'pointerover', event => { const tr = event.target.closest('tr[data-key]'); if (event.pointerType === 'touch' || !tr || hovered === tr.dataset.key) return; pointing(); hovered = tr.dataset.key; paint(); });
    listen(legend, 'pointerleave', event => { if (!hovered || event.pointerType === 'touch') return; hovered = null; paint(); });
    // Focus arriving by Tab never passes a key through this block, so a visible focus ring marks it as keyboard input.
    listen(legend, 'focusin', event => { const tr = event.target.closest('tr[data-key]'); if (!tr) return; if (event.target.matches(':focus-visible')) block.dataset.input = 'key'; active = tr.dataset.key; hovered = tr.dataset.key; paint(); });
    listen(legend, 'focusout', event => { if (legend.contains(event.relatedTarget)) return; hovered = null; paint(); });
    listen(legend, 'keydown', event => {
      block.dataset.input = 'key';
      if (event.key === 'Escape' && chosen) { event.preventDefault(); chosen = null; paint(); announce(); return; }
      const list = entries.map(g => buttons.get(g.key)), next = rove(event, list, doc.activeElement);
      if (!next) return; event.preventDefault(); next.focus();
    });
    // A mouse scrubs by hovering. A finger taps to pin a part, or drags along the bar to scrub and pins where it lifts.
    let touch = null;
    const segAt = (x, y) => doc.elementFromPoint(x, y)?.closest?.('.ps-breakdown-seg');
    listen(plot, 'pointerdown', event => { touch = event.pointerType === 'touch' && event.target.closest?.('.ps-breakdown-seg') ? { id: event.pointerId, x: event.clientX, dragged: false } : null; });
    listen(plot, 'pointermove', event => {
      if (event.pointerType === 'touch') {
        if (!touch || touch.id !== event.pointerId) return;
        if (!touch.dragged && Math.abs(event.clientX - touch.x) < 6) return;
        touch.dragged = true; pointing();
        const key = segAt(event.clientX, event.clientY)?.dataset.key; if (key && key !== hovered) { hovered = key; paint(); }
        return;
      }
      pointing(); const key = event.target.closest?.('.ps-breakdown-seg')?.dataset.key || null; if (key === hovered) return; hovered = key; paint();
    });
    listen(plot, 'pointerup', event => {
      if (!touch || touch.id !== event.pointerId) return;
      const { dragged } = touch; touch = dragged ? { dragged } : null;
      if (dragged && hovered) { chosen = hovered; active = hovered; hovered = null; paint(); announce(); }
    });
    listen(plot, 'pointercancel', () => { touch = null; if (hovered) { hovered = null; paint(); } });
    listen(plot, 'pointerleave', event => { if (!hovered || event.pointerType === 'touch') return; hovered = null; paint(); });
    listen(plot, 'click', event => {
      if (touch?.dragged) { touch = null; return; }
      const el = event.target.closest?.('.ps-breakdown-seg'); if (el) choose(el.dataset.key);
    });
    const initial = block.dataset.chosen; if (initial && entryOf(initial)) { chosen = initial; active = initial; }
    paint(); ready = true;
  }

  /* KPI table: metrics with current and previous values, a derived change, a sparkline and a derived status. */
  for (const block of find('[data-ps-kpi-table]')) {
    if (!claim(block)) continue;
    const table = block.querySelector('table'), region = block.querySelector('[data-kpitable-region]'), status = block.querySelector('[data-kpitable-status]');
    if (!table) continue;
    const sorters = [...block.querySelectorAll('[data-kpitable-sort]')];
    trackInput(block);
    const metrics = [], groups = [...table.tBodies].map(body => ({ body, rows: [], subtotal: body.querySelector('[data-kpitable-subtotal]'), head: body.querySelector('.ps-kpitable-group') }));
    const cell = (tr, name) => tr.querySelector(`[data-cell="${name}"]`), sparks = new Map();
    const spark = (holder, values, target, label) => {
      if (!holder) return;
      const high = Math.max(...values, target ?? -Infinity), low = Math.min(...values, target ?? Infinity), w = 96, h = 24, inset = 3;
      const points = sparkPoints(values, w, h, inset, low, high), root = svg('svg', { viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true', focusable: 'false' });
      if (target != null) { const y = sparkPoints([target], w, h, inset, low, high)[0][1]; root.append(svg('line', { x1: 0, x2: w, y1: y.toFixed(1), y2: y.toFixed(1), class: 'ps-kpitable-target' })); }
      root.append(svg('path', { d: sparkPath(points), class: 'ps-kpitable-line' }));
      const [x, y] = points.at(-1); root.append(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 2.25, class: 'ps-kpitable-dot' }));
      holder.replaceChildren(root); holder.setAttribute('role', 'img');
      holder.setAttribute('aria-label', `${label}: ${values.length}-week trend, ${trendWord(values)}${target != null ? ', target line shown' : ''}`);
      return points;
    };
    const meter = (holder, ratio) => {
      if (!holder) return; const cells = 10, on = Math.max(0, Math.min(cells, Math.round(ratio * cells))), wrap = node('span', 'ps-kpitable-meter'), group = node('span', 'ps-kpitable-progress');
      wrap.setAttribute('aria-hidden', 'true'); for (let i = 0; i < cells; i++) { const c = node('i'); if (i < on) c.dataset.on = ''; wrap.append(c); }
      group.append(wrap, node('span', 'ps-kpitable-attain', `${Math.round(ratio * 100)}%`)); holder.replaceChildren(group);
    };
    const fill = (tr, m) => {
      const fmt = unitOf(tr), diff = change(m.current, m.previous), target = m.target;
      const set = (name, text) => { const el = cell(tr, name); if (el) el.textContent = text; };
      set('current', fmt(m.current)); set('previous', fmt(m.previous)); if (target != null) set('target', fmt(target));
      const delta = cell(tr, 'change'); if (delta) delta.replaceChildren(pill(diff, 1, '%', effectOf(diff, m.better)));
      const trend = cell(tr, 'trend'); m.lined = !!trend?.hasAttribute('data-target-line'); m.fmt = fmt;
      m.points = spark(trend, m.spark, m.lined ? target : null, m.label); if (trend) sparks.set(trend, m);
      if (target != null) {
        const ratio = attainment(m.current, target, m.better); m.status = statusOf(ratio); meter(cell(tr, 'progress'), ratio);
        const holder = cell(tr, 'status'); if (holder) { const badge = node('span', 'ps-kpitable-status', STATUS[m.status]); badge.dataset.status = m.status; holder.replaceChildren(badge); }
      }
      m.diff = diff;
    };
    const parse = tr => {
      const spark = (tr.dataset.spark || '').split(/\s+/).filter(Boolean).map(Number);
      if (!finite(tr.dataset.current) || !finite(tr.dataset.previous) || spark.some(v => !Number.isFinite(v))) return null;
      return { tr, label: tr.querySelector('th')?.textContent.trim() || '', current: Number(tr.dataset.current), previous: Number(tr.dataset.previous), target: finite(tr.dataset.target) ? Number(tr.dataset.target) : null, better: tr.dataset.better || 'up', spark: spark.length > 1 ? spark : [Number(tr.dataset.previous), Number(tr.dataset.current)] };
    };
    groups.forEach(group => {
      group.rows = [...group.body.rows].filter(tr => tr.hasAttribute('data-current') && !tr.hasAttribute('data-kpitable-subtotal')).map((tr, index) => { const m = parse(tr); if (!m) return null; m.index = index; fill(tr, m); metrics.push(m); return m; }).filter(Boolean);
      // A subtotal is the sum of its group's rows, week by week; it is never typed.
      const sub = group.subtotal;
      if (sub && group.rows.length) {
        const length = Math.min(...group.rows.map(m => m.spark.length));
        const m = { tr: sub, label: sub.querySelector('th')?.textContent.trim() || 'Total', current: sum(group.rows.map(r => r.current)), previous: sum(group.rows.map(r => r.previous)), target: finite(sub.dataset.target) ? Number(sub.dataset.target) : null, better: sub.dataset.better || 'up', spark: Array.from({ length }, (_, i) => sum(group.rows.map(r => r.spark[r.spark.length - length + i]))) };
        sub.dataset.current = String(m.current); sub.dataset.previous = String(m.previous); fill(sub, m); group.total = m;
      }
    });
    // The header summary counts statuses across metric rows (subtotals restate their group and are not counted).
    const summary = block.querySelector('[data-kpitable-summary]');
    if (summary) for (const key of Object.keys(STATUS)) { const el = summary.querySelector(`[data-status="${key}"]`); if (el) el.textContent = `${metrics.filter(m => m.status === key).length} ${STATUS[key].toLowerCase()}`; }
    // Sparkline probe: scrubbing a trend with the pointer moves a guide and a dot to the nearest point, and a pinned tip
    // above the row reads that point's value and its change on the point before. A finger taps to pin and drags to scrub.
    const trendHead = [...(table.tHead?.rows[0]?.cells || [])].find(th => /last \d+/i.test(th.textContent));
    const span = /last (\d+) (week|month|day)s?/i.exec(trendHead?.textContent || ''), noun = span ? span[2][0].toUpperCase() + span[2].slice(1).toLowerCase() : 'Point';
    const tip = node('div', 'ps-plot-tip ps-kpitable-tip'); tip.setAttribute('aria-hidden', 'true'); tip.hidden = true;
    const tipWhen = node('strong'), tipList = node('dl'), tipName = node('span'), tipValue = node('dd'), tipStep = node('dt', '', span ? `vs prior ${noun.toLowerCase()}` : 'vs prior point'), tipChange = node('dd'), tipPill = pill(0, 1, '%');
    const tipTargetTerm = node('dt', '', 'Target'), tipTarget = node('dd'), tipKey = node('dt'), tipMark = node('i');
    tipKey.append(tipMark, tipName); tipChange.append(tipPill); tipList.append(tipKey, tipValue, tipStep, tipChange, tipTargetTerm, tipTarget); tip.append(tipWhen, tipList);
    block.querySelector(':scope > .ps-kpitable-tip')?.remove(); block.append(tip);
    const tipState = floating(tip);
    const fillTip = (m, i) => {
      const values = m.spark, diff = i ? change(values[i], values[i - 1]) : null;
      tipWhen.textContent = `${noun} ${i + 1} of ${values.length}`; tipName.textContent = m.label; tipValue.textContent = m.fmt(values[i]);
      repill(tipPill, diff, 1, '%', effectOf(diff, m.better));
      const lined = m.lined && m.target != null; tipTargetTerm.hidden = tipTarget.hidden = !lined; if (lined) tipTarget.textContent = m.fmt(m.target);
    };
    let probe = null;
    const marks = holder => {
      const root = holder.querySelector('svg'); let guide = root.querySelector('.ps-kpitable-guide'), dot = root.querySelector('.ps-kpitable-probe');
      if (!guide) { guide = svg('line', { x1: 0, x2: 0, y1: 0, y2: 24, class: 'ps-kpitable-guide' }); dot = svg('circle', { cx: 0, cy: 0, r: 2.75, class: 'ps-kpitable-probe' }); root.append(guide, dot); }
      return { root, guide, dot };
    };
    const nearest = (m, holder, clientX) => {
      const r = holder.querySelector('svg').getBoundingClientRect(), x = (clientX - r.left) / Math.max(1, r.width) * 96, step = 90 / Math.max(1, m.spark.length - 1);
      return Math.max(0, Math.min(m.spark.length - 1, Math.round((x - 3) / step)));
    };
    const probeAt = (m, holder, index, touch) => {
      if (probe?.holder === holder && probe.index === index) { probe.touch = touch; return; }
      const animate = !still(block), same = probe?.holder === holder;
      if (!same) { probe?.holder.removeAttribute('data-probing'); probe?.holder.removeAttribute('data-glide'); fixWidth(tip, m.spark.map((_, i) => i), i => fillTip(m, i)); }
      fillTip(m, index); probe = { m, holder, index, touch };
      const { root, guide, dot } = marks(holder), [px, py] = m.points[index];
      holder.setAttribute('data-probing', ''); holder.toggleAttribute('data-glide', same && animate);
      guide.style.transform = `translate(${px}px, 0px)`; dot.style.transform = `translate(${px}px, ${py}px)`;
      // Above the row, centered on the point and clamped inside the panel; below the row when there is no room above.
      const r = root.getBoundingClientRect(), cellBox = holder.getBoundingClientRect(), box = block.getBoundingClientRect(), left = box.left + block.clientLeft, top = box.top + block.clientTop;
      const showing = !tip.hidden; tip.hidden = false; const tw = tip.offsetWidth, th = tip.offsetHeight; tip.hidden = !showing;
      const anchor = r.left - left + px / 96 * r.width, gap = 4, x = Math.max(0, Math.min(block.clientWidth - tw, anchor - tw / 2));
      const above = cellBox.top - top - th - gap, y = above >= 0 ? above : cellBox.bottom - top + gap;
      tipState.place(x, y, animate, timing(block, '--fast', 140));
    };
    const unprobe = animate => {
      if (!probe) return; probe.holder.removeAttribute('data-probing'); probe.holder.removeAttribute('data-glide'); probe = null;
      tipState.hide(animate && !still(block), timing(block, '--press', 160));
    };
    if (region) {
      const holderOf = target => { const holder = target.closest?.('td[data-cell="trend"]'); return holder && sparks.has(holder) && holder.querySelector('svg') ? holder : null; };
      listen(region, 'pointermove', event => {
        if (event.pointerType === 'touch') { if (probe?.touch === event.pointerId) probeAt(probe.m, probe.holder, nearest(probe.m, probe.holder, event.clientX), event.pointerId); return; }
        const holder = holderOf(event.target); if (!holder) { unprobe(true); return; }
        block.dataset.input = 'pointer'; const m = sparks.get(holder); probeAt(m, holder, nearest(m, holder, event.clientX), null);
      });
      listen(region, 'pointerleave', event => { if (event.pointerType !== 'touch') unprobe(true); });
      listen(region, 'pointerdown', event => {
        const holder = event.pointerType === 'touch' && holderOf(event.target); if (!holder) return;
        const m = sparks.get(holder); probeAt(m, holder, nearest(m, holder, event.clientX), event.pointerId);
      });
      listen(region, 'pointercancel', event => { if (probe?.touch === event.pointerId) unprobe(true); });
      // A pinned probe stays until a tap lands anywhere else.
      listen(doc, 'pointerdown', event => { if (probe && !(region.contains(event.target) && holderOf(event.target))) unprobe(true); });
    }
    let sort = null;
    const keyOf = { metric: m => m.label, change: m => m.diff ?? -Infinity, status: m => STATUS_RANK[m.status] ?? 3 };
    const apply = animate => {
      unprobe(false);
      const before = animate ? tops(metrics.map(m => m.tr)) : null; for (const m of metrics) halt(m.tr);
      for (const group of groups) {
        const rows = [...group.rows].sort((a, b) => {
          if (!sort) return a.index - b.index;
          const x = keyOf[sort.key](a), y = keyOf[sort.key](b), order = typeof x === 'string' ? x.localeCompare(y) : x - y;
          return order * sort.dir || a.index - b.index;
        });
        const anchor = group.subtotal || null; for (const m of rows) group.body.insertBefore(m.tr, anchor);
      }
      for (const button of sorters) {
        const th = button.closest('th'), on = sort?.key === button.dataset.kpitableSort, icon = button.querySelector('.ps-i');
        if (on) th.setAttribute('aria-sort', sort.dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort');
        if (icon) icon.className = 'ps-i ' + (on ? sort.dir > 0 ? 'ps-i-up' : 'ps-i-down' : 'ps-i-chevron');
      }
      if (animate) flip(before, timing(block, '--settle', 220));
    };
    // Names sort A to Z first; change sorts largest first; status sorts the worst first.
    const first = { metric: 1, change: -1, status: 1 };
    for (const button of sorters) listen(button, 'click', () => {
      const key = button.dataset.kpitableSort;
      sort = sort?.key === key ? { key, dir: -sort.dir } : { key, dir: first[key] || 1 };
      apply(!still(block));
      const label = button.textContent.trim();
      if (status) status.textContent = `Sorted by ${label.toLowerCase()}, ${sort.dir > 0 ? 'ascending' : 'descending'}${groups.length > 1 ? ', within each group' : ''}.`;
      emit(block, 'pagesystem:kpi-table', { sort: { ...sort } });
    });
    // The pinned metric column casts an edge only while rows are scrolled beneath it; a probe it would leave behind goes.
    if (region) { const edge = () => region.toggleAttribute('data-scrolled', region.scrollLeft > 0); listen(region, 'scroll', () => { edge(); unprobe(false); }); edge(); }
    apply(false);
  }

  return () => { for (const run of [...running]) run.cancel(); running.clear(); for (const block of bound) delete block.__psKitH; bound.length = 0; for (const watch of observers) watch.disconnect(); observers.length = 0; };
});

var PS_KITS = PS_KITS || [];
PS_KITS.push(function kitI(root, { doc, win, listen, find, emit }) {
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const count = new Intl.NumberFormat('en-US');
  const MINUS = '−';
  const observers = [];
  // A readout's separators bind to the word before them, so a wrapped line never starts with a dot.
  const joined = text => String(text).replaceAll(' · ', '\u00a0· ');
  const signed = (value, digits, suffix) => `${value > 0 ? '+' : value < 0 ? MINUS : ''}${Math.abs(value).toFixed(digits)}${suffix}`;
  const percent = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  const median = values => { const s = [...values].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const quantile = (values, q) => { const s = [...values].sort((a, b) => a - b), at = (s.length - 1) * q, i = Math.floor(at); return s[i] + (s[Math.min(i + 1, s.length - 1)] - s[i]) * (at - i); };
  const trendOf = (value, digits) => Math.abs(value) < 0.5 * 10 ** -digits ? 'flat' : value > 0 ? 'up' : 'down';

  // Pure scale helpers. A scale ends on round values at or beyond the data, with about one gridline per 48px.
  const niceStep = (span, lines) => { const raw = span / Math.max(1, lines), power = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 2.5, 5, 10].map(n => n * power).find(n => n >= raw * 0.999); };
  const niceRange = (min, max, lines) => {
    if (!(max > min)) max = min + 1;
    const step = niceStep(max - min, lines), lo = Math.floor(min / step + 1e-9) * step, hi = Math.ceil(max / step - 1e-9) * step, ticks = [];
    for (let i = 0; lo + i * step <= hi + step / 2; i++) ticks.push(Number((lo + i * step).toFixed(10)));
    return { lo, hi, ticks };
  };
  // Units are formatted once per kind; `short` drops the unit so a scale can state it only on its top value.
  const compact = value => { const a = Math.abs(value); return a >= 1e6 ? `${+(value / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M` : a >= 1e3 ? `${+(value / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k` : count.format(+value.toFixed(1)); };
  const formatter = unit => {
    if (unit === 'currency') return { full: v => `${v < 0 ? MINUS : ''}$${compact(Math.abs(v))}`, short: compact };
    if (unit === 'percent') return { full: v => `${v < 0 ? MINUS : ''}${count.format(Math.abs(+v.toFixed(1)))}%`, short: v => `${v < 0 ? MINUS : ''}${count.format(Math.abs(+v.toFixed(1)))}`, signed: v => signed(v, 0, '%') };
    if (unit && unit !== 'count') return { full: v => `${count.format(+v.toFixed(1))} ${unit}`, short: v => count.format(+v.toFixed(1)) };
    return { full: v => count.format(+v.toFixed(1)), short: v => count.format(+v.toFixed(1)) };
  };

  // Motion is presentation only: the DOM is written in its final state first, then element.animate() plays from the old look.
  // Nothing is scheduled through timers, frames or observers; disposal cancels every running animation.
  // Durations and the curve come from the motion tokens, so a host override applies here too.
  const rootStyle = win.getComputedStyle(doc.documentElement);
  const token = (name, fallback) => { const value = rootStyle.getPropertyValue(name).trim(), n = parseFloat(value); return Number.isFinite(n) ? (/\ds$/.test(value) && !value.endsWith('ms') ? n * 1000 : n) : fallback; };
  const FAST = token('--fast', 140), PRESS = token('--press', 160), SETTLE = token('--settle', 220);
  const EASE = rootStyle.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
  const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // A block moves only while its last input was a pointer (or typing into a field) and the reader has not asked for less motion.
  const moving = block => !reduced() && !block.hasAttribute('data-still');
  const running = new Set(), slots = new WeakMap();
  const stop = (el, key) => { slots.get(el)?.[key]?.cancel(); };
  const play = (el, frames, duration, key) => {
    if (typeof el.animate !== 'function') return null;
    stop(el, key);
    const own = slots.get(el) || {}; slots.set(el, own);
    const run = el.animate(frames, { duration, easing: EASE });
    own[key] = run; running.add(run);
    const done = () => { running.delete(run); if (own[key] === run) delete own[key]; };
    run.addEventListener('finish', done); run.addEventListener('cancel', done);
    return run;
  };
  const shown = el => el.isConnected && el.getClientRects().length > 0;
  // FLIP: measure where each element is drawn now (mid-flight included), apply the final layout, then travel from the old place.
  // Reads, writes and reads again once per call, so a batch of N elements costs two layouts, not 2N.
  const glide = (els, apply, animate, duration = FAST) => {
    const list = Array.isArray(els) ? els : [els];
    const before = animate ? list.map(el => shown(el) ? el.getBoundingClientRect() : null) : [];
    for (const el of list) stop(el, 'glide');
    apply();
    if (!animate) return;
    list.forEach((el, i) => {
      const was = before[i]; if (!was || !shown(el)) return;
      const now = el.getBoundingClientRect(), dx = was.left - now.left, dy = was.top - now.top;
      if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) play(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0px, 0px)' }], duration, 'glide');
    });
  };
  // A changed figure rolls through a fixed window in the direction it moved: up rises from below, down drops from above.
  // A roll already traveling the same way keeps going with the new text, so a fast drag reads as one movement.
  const ROLL_UP = [{ clipPath: 'inset(0 0 35% 0)', transform: 'translateY(35%)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }];
  const ROLL_DOWN = [{ clipPath: 'inset(35% 0 0 0)', transform: 'translateY(-35%)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }];
  const roll = (el, text, direction, animate) => {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    if (!animate || !direction) return;
    const current = slots.get(el)?.roll;
    if (current && current.direction === direction && current.playState === 'running') return;
    const run = play(el, direction > 0 ? ROLL_UP : ROLL_DOWN, PRESS, 'roll');
    if (run) run.direction = direction;
  };
  const swap = (el, text, animate) => {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    if (animate) play(el, [{ opacity: 0.72, transform: 'translateY(2px)' }, { opacity: 1, transform: 'none' }], PRESS, 'swap');
  };

  // Each initialization claims its block; listeners left by an earlier run on the same block stand down.
  const claim = block => {
    const run = String((Number(block.dataset.kitRun) || 0) + 1);
    block.dataset.kitRun = run;
    // A key press marks the block still, so CSS drops its transitions and nothing animates; a pointer restores motion.
    // Typing into a field is not a step through the plot: the matches it changes still transition.
    // Every handler notes its event first, so the mark is current before the change it causes is drawn.
    const note = event => {
      if (event.type === 'keydown') block.toggleAttribute('data-still', !event.target.matches?.('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea'));
      else if (event.type === 'pointerdown' || (event.type === 'pointermove' && event.pointerType !== 'touch')) block.removeAttribute('data-still');
    };
    const on = (el, type, fn) => listen(el, type, event => { if (block.dataset.kitRun === run) { note(event); fn(event); } });
    for (const type of ['pointerdown', 'pointermove', 'keydown']) on(block, type, () => {});
    return on;
  };

  // The pinned tip: an inverse card beside its anchor, on the side with room, positioned in percentages so it survives resizing.
  // It keeps one node per row so values change in place, and its width is set once (in em) from the widest content it will
  // show, so scrubbing never resizes the box. Moves glide by FLIP; it rises in when a pointer arrives and fades when it leaves.
  const makeTip = (tip, frame, samples, { scroll = false } = {}) => {
    const head = node('strong'), list = node('dl');
    tip.replaceChildren(head, list);
    let shape = '', cells = [], placed = false, sized = false;
    const write = (title, rows) => {
      if (head.textContent !== title) head.textContent = title;
      const next = rows.map(([, , color, trend]) => trend ? 'd' : color ? 's' : 'p').join('');
      if (next !== shape) {
        shape = next;
        cells = rows.map(([, , color, trend]) => {
          const term = node('dt'), label = node('span'), value = node('dd'), cell = { label, value, text: value };
          if (color) { cell.swatch = node('i'); term.append(cell.swatch); }
          term.append(label);
          if (trend) {
            cell.pill = node('span', 'ps-delta'); cell.icon = node('i'); cell.icon.setAttribute('aria-hidden', 'true'); cell.text = node('span');
            cell.pill.append(cell.icon, cell.text); value.append(cell.pill);
          }
          cell.term = term;
          return cell;
        });
        list.replaceChildren(...cells.flatMap(cell => [cell.term, cell.value]));
      }
      rows.forEach(([name, value, color, trend], i) => {
        const cell = cells[i];
        if (cell.label.textContent !== name) cell.label.textContent = name;
        if (cell.text.textContent !== value) cell.text.textContent = value;
        if (cell.swatch) cell.swatch.style.setProperty('--tip-color', color);
        if (cell.pill) { cell.pill.dataset.trend = trend; cell.icon.className = `ps-i ps-i-${trend === 'flat' ? 'right' : trend}`; }
      });
    };
    // Measured the first time the tip is laid out (a narrow plot hides it), at the left edge so nothing constrains it.
    const fit = () => {
      if (sized || !tip.offsetWidth) return;
      sized = true;
      const { left, right } = tip.style;
      tip.style.minWidth = ''; tip.style.left = '0'; tip.style.right = 'auto';
      let widest = 0;
      for (const [title, rows] of samples()) { write(title, rows); widest = Math.max(widest, tip.getBoundingClientRect().width); }
      const size = parseFloat(win.getComputedStyle(tip).fontSize) || 16;
      tip.style.minWidth = `${(Math.ceil(widest) + 1) / size}em`;
      tip.style.left = left; tip.style.right = right;
    };
    const place = box => {
      const width = frame.clientWidth, height = frame.clientHeight, gap = 8, tw = tip.offsetWidth, th = tip.offsetHeight;
      if (!width || !height || !tw) return;
      const room = scroll ? frame.scrollWidth : width, floor = scroll ? frame.scrollHeight : height;
      const after = box.right + gap + tw <= room || box.left - gap - tw < 0;
      tip.style.left = after ? `${(box.right + gap) / width * 100}%` : 'auto';
      tip.style.right = after ? 'auto' : `${(width - box.left + gap) / width * 100}%`;
      tip.style.top = `${clamp(box.top - th / 2, 0, Math.max(0, floor - th)) / height * 100}%`;
    };
    const enter = animate => {
      if (!tip.hasAttribute('data-away')) return;
      tip.removeAttribute('data-away');
      if (animate) play(tip, [{ opacity: 0.72, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], FAST, 'enter');
    };
    return {
      // Writes and places the tip. `animate` glides it from where it is drawn; an away tip is placed directly, then shown.
      show(title, rows, box, { animate = false, reveal = true, duration = FAST } = {}) {
        fit(); write(title, rows);
        const away = tip.hasAttribute('data-away');
        glide(tip, () => place(box), animate && placed && !away, duration);
        placed = true;
        if (reveal) enter(animate);
      },
      enter,
      leave() { tip.setAttribute('data-away', ''); stop(tip, 'enter'); },
      get away() { return tip.hasAttribute('data-away'); },
    };
  };

  // A delta pill states direction in its arrow and its signed text.
  const setDelta = (pill, value, digits, suffix) => {
    if (!pill) return;
    const trend = trendOf(value, digits);
    const icon = node('i', `ps-i ps-i-${trend === 'flat' ? 'right' : trend}`);
    icon.setAttribute('aria-hidden', 'true');
    pill.dataset.trend = trend;
    pill.replaceChildren(icon, node('span', '', signed(trend === 'flat' ? 0 : value, digits, suffix)));
  };

  // Labels that would touch a kept neighbor are hidden; the last label, which carries the unit, always stays.
  const thinLabels = row => {
    const labels = [...row.children], end = labels.at(-1)?.getBoundingClientRect();
    let right = -Infinity;
    for (const label of labels) {
      label.hidden = false;
      const box = label.getBoundingClientRect();
      if (label !== labels.at(-1) && (box.left < right + 8 || (end && box.right > end.left - 8))) { label.hidden = true; continue; }
      right = box.right;
    }
  };

  // Touch scrubs only while pressed: a tap pins the reading and a drag moves it; a resting finger never steals the scroll.
  const scrubber = (on, surface, pick) => {
    let pressed = null;
    on(surface, 'pointerdown', event => {
      if (event.button !== 0) return;
      pressed = event.pointerId; surface.setPointerCapture?.(event.pointerId); pick(event);
    });
    on(surface, 'pointermove', event => { if (event.pointerType !== 'touch' || pressed === event.pointerId) pick(event); });
    for (const type of ['pointerup', 'pointercancel']) on(surface, type, event => { if (pressed === event.pointerId) pressed = null; });
  };

  // Retention cohort -------------------------------------------------------------------------------------------
  // Pure: a cohort's retained share by period, and the size-weighted average across the cohorts that reached it.
  const COHORT_BREAKS = [0.15, 0.25, 0.35, 0.5, 0.75];
  const cohortLevel = share => 1 + COHORT_BREAKS.filter(b => share >= b).length;
  const cohortAverage = (cohorts, period) => {
    const reached = cohorts.filter(c => c.users.length > period);
    const users = reached.reduce((n, c) => n + c.users[period], 0), size = reached.reduce((n, c) => n + c.size, 0);
    return { users, size, cohorts: reached.length, share: size ? users / size : 0 };
  };
  const readCohorts = table => [...table.tBodies[0].rows].map((tr, index) => {
    const cells = [...tr.querySelectorAll('td[data-users]')];
    return { index, tr, cells, label: tr.dataset.cohort, note: tr.dataset.cohortNote || '', size: Number(tr.dataset.size), users: cells.map(td => Number(td.dataset.users)), partial: cells.map(td => td.hasAttribute('data-partial')) };
  });

  const retentionCohort = block => {
    const on = claim(block);
    const table = block.querySelector('[data-cohort-table]');
    if (!table) return;
    const unit = block.dataset.cohortUnit || 'Week', unitLower = unit.toLowerCase();
    const cohorts = readCohorts(table), periods = Math.max(...cohorts.map(c => c.users.length));
    const average = Array.from({ length: periods }, (_, p) => cohortAverage(cohorts, p));
    const target = Number(block.dataset.cohortHeadline) || Math.min(4, periods - 1);
    const readout = block.querySelector('[data-cohort-readout]');

    // Headline: the cohort of interest (the marked one, else the newest to reach the period) against the cohorts before it.
    const subject = cohorts.find(c => c.note && c.users.length > target) || [...cohorts].reverse().find(c => c.users.length > target && !c.partial[target]);
    if (subject) {
      const share = subject.users[target] / subject.size, before = cohortAverage(cohorts.slice(0, subject.index), target);
      const figure = block.querySelector('[data-cohort-figure]'); if (figure) figure.textContent = percent(share);
      const who = block.querySelector('[data-cohort-subject]'); if (who) who.textContent = `${subject.label} cohort`;
      if (before.size) setDelta(block.querySelector('[data-cohort-delta]'), (share - before.share) * 100, 1, ' pts');
    }
    const avgFigure = block.querySelector('[data-cohort-average]'); if (avgFigure && average[target]) avgFigure.textContent = percent(average[target].share);
    const signups = block.querySelector('[data-cohort-signups]'); if (signups) signups.textContent = count.format(cohorts.reduce((n, c) => n + c.size, 0));

    // The weighted-average row is derived, never typed: its cells are rewritten from the cohorts above it.
    const foot = table.tFoot?.rows[0], avgCells = foot ? [...foot.querySelectorAll('td[data-cohort-avg]')] : [];
    avgCells.forEach((td, p) => { const a = average[p]; if (!a) return; td.dataset.users = String(a.users); td.textContent = percent(a.share, 0); });
    const footSize = foot?.querySelector('[data-cohort-avg-size]'); if (footSize) footSize.textContent = count.format(average[0]?.size || 0);

    const curves = block.dataset.cohortView === 'curves';
    const rows = [...cohorts.map(c => ({ ...c, average: false })), { index: cohorts.length, label: 'Weighted average', cells: avgCells, size: 0, users: average.map(a => a.users), sizes: average.map(a => a.size), reached: average.map(a => a.cohorts), partial: [], average: true }];
    const shareOf = (row, p) => row.average ? average[p].share : row.users[p] / row.size;
    const describe = (row, p) => {
      if (row.average) return `Weighted average · ${unit} ${p} · ${count.format(average[p].users)} of ${count.format(average[p].size)} retained across ${average[p].cohorts} ${average[p].cohorts === 1 ? "cohort" : "cohorts"} · ${percent(average[p].share)}`;
      return `${row.label} cohort · ${unit} ${p} · ${count.format(row.users[p])} of ${count.format(row.size)} retained · ${percent(shareOf(row, p))}${row.partial[p] ? ` · ${unitLower} in progress` : ''}`;
    };
    // The tip's reading of one cell: retained users, the rate, and the gap to the weighted average as a delta.
    const reading = (row, p) => {
      const a = average[p], share = shareOf(row, p);
      if (row.average) return [`Weighted average · ${unit} ${p}`, [['Retained', `${count.format(a.users)} of ${count.format(a.size)}`, 'var(--plot-baseline)'], ['Rate', percent(share)], ['Cohorts', count.format(a.cohorts)]]];
      const gap = (share - a.share) * 100, trend = trendOf(gap, 1);
      return [`${row.label} cohort · ${unit} ${p}${row.partial[p] ? ' · in progress' : ''}`, [['Retained', `${count.format(row.users[p])} of ${count.format(row.size)}`, 'var(--cohort-hue)'], ['Rate', percent(share)], ['Vs average', signed(trend === 'flat' ? 0 : gap, 1, ' pts'), '', trend]]];
    };
    let at = { r: subject ? subject.index : 0, c: subject ? target : 0 };

    if (!curves) {
      // Grid view: one sequential hue, light to dark; the two darkest steps take light text so every figure keeps 4.5:1.
      for (const row of rows) row.cells.forEach((td, p) => { const share = shareOf(row, p); td.dataset.level = String(cohortLevel(share)); td.textContent = percent(share, 0); });
      const heads = [...table.tHead.rows[0].cells], lead = heads.length - periods;
      const cellAt = ({ r, c }) => rows[r]?.cells[c];
      const locate = td => { const r = rows.findIndex(row => row.cells.includes(td)); return r < 0 ? null : { r, c: rows[r].cells.indexOf(td) }; };
      // The cell tip lives in the scrolling region beside the table, so it scrolls with the cells it describes.
      const region = table.closest('.ps-table-region') || table.parentElement;
      const tipEl = node('div', 'ps-plot-tip'); tipEl.setAttribute('aria-hidden', 'true'); tipEl.dataset.away = '';
      region.append(tipEl);
      const tip = makeTip(tipEl, region, () => rows.flatMap(row => row.cells.map((_, p) => reading(row, p))), { scroll: true });
      let hovered = null;
      const boxOf = td => {
        const frame = region.getBoundingClientRect(), cell = td.getBoundingClientRect();
        const left = cell.left - frame.left - region.clientLeft + region.scrollLeft, top = cell.top - frame.top - region.clientTop + region.scrollTop;
        return { left, right: left + cell.width, top: top + cell.height / 2 };
      };
      const inspect = (spot, animate, reveal = true) => {
        const td = cellAt(spot); if (!td) return;
        const [title, lines] = reading(rows[spot.r], spot.c);
        tip.show(title, lines, boxOf(td), { animate, reveal });
      };
      const held = () => table.contains(doc.activeElement);
      const select = (next, focus) => {
        at = next;
        for (const row of rows) for (const td of row.cells) { td.tabIndex = -1; td.removeAttribute('aria-selected'); }
        const td = cellAt(at); if (!td) return;
        td.tabIndex = 0; td.setAttribute('aria-selected', 'true');
        heads.forEach((th, i) => th.toggleAttribute('data-focus', i === at.c + lead));
        rows.forEach((row, r) => row.cells[0]?.closest('tr')?.querySelector('th')?.toggleAttribute('data-focus', r === at.r));
        if (readout) readout.textContent = joined(describe(rows[at.r], at.c));
        if (focus) { td.focus(); if (!hovered) inspect(at, moving(block)); }
        emit(block, 'pagesystem:retention-cohort', { cohort: rows[at.r].label, period: at.c, share: shareOf(rows[at.r], at.c) });
      };
      on(table, 'keydown', event => {
        if (!event.target.matches?.('td[data-level]')) return;
        const last = r => rows[r].cells.length - 1;
        let { r, c } = at;
        if (event.key === 'ArrowRight') c = Math.min(last(r), c + 1);
        else if (event.key === 'ArrowLeft') c = Math.max(0, c - 1);
        else if (event.key === 'ArrowDown') { r = Math.min(rows.length - 1, r + 1); c = Math.min(c, last(r)); }
        else if (event.key === 'ArrowUp') { r = Math.max(0, r - 1); c = Math.min(c, last(r)); }
        else if (event.key === 'Home') { if (event.ctrlKey || event.metaKey) r = 0; c = 0; }
        else if (event.key === 'End') { if (event.ctrlKey || event.metaKey) r = rows.length - 1; c = last(r); }
        else return;
        event.preventDefault();
        hovered = null;
        select({ r, c }, true);
      });
      on(table, 'click', event => {
        const td = event.target.closest?.('td[data-level]'); if (!td) return;
        const spot = locate(td); if (spot) select(spot, true);
      });
      // A pointer reads whichever cell it rests on; the selection stays put until a cell is pressed.
      on(table, 'pointerover', event => {
        if (event.pointerType === 'touch') return;
        const td = event.target.closest?.('td[data-level]'); if (!td || td === hovered) return;
        const spot = locate(td); if (!spot) return;
        const arriving = !hovered && tip.away;
        hovered = td;
        inspect(spot, moving(block) && !arriving, false);
        tip.enter(moving(block));
      });
      on(table, 'pointerleave', () => {
        if (!hovered) return;
        hovered = null;
        if (held()) inspect(at, moving(block)); else tip.leave();
      });
      on(table, 'focusin', event => { if (!hovered && event.target.matches?.('td[data-level]')) inspect(at, false); });
      on(table, 'focusout', event => { if (!hovered && !table.contains(event.relatedTarget)) tip.leave(); });
      select(at, false);
      // Where the grid scrolls sideways, it opens with the selected cell in view beside the pinned names, never cut at the edge.
      const chosen = cellAt(at), pinned = chosen?.closest('tr')?.querySelector('th');
      if (chosen && pinned && region.scrollWidth > region.clientWidth) {
        const view = region.getBoundingClientRect(), cell = chosen.getBoundingClientRect(), edge = pinned.getBoundingClientRect().right;
        if (cell.right > view.right) region.scrollLeft += cell.right - view.right + 8;
        else if (cell.left < edge) region.scrollLeft -= edge - cell.left + 8;
      }
      return;
    }

    // Curves view: each cohort is a line in context gray; the chosen cohort is redrawn on top in the series color, the average is
    // a dashed reference. Changing cohort morphs that line between the two shapes and slides its dots.
    const plot = block.querySelector('[data-cohort-plot]'), picker = block.querySelector('[data-cohort-pick]');
    if (!plot) return;
    const svgNS = 'http://www.w3.org/2000/svg';
    const axis = block.querySelector('[data-cohort-axis]');
    const scale = node('div', 'ps-curve-scale'), area = node('div', 'ps-curve-area');
    scale.setAttribute('aria-hidden', 'true');
    for (const tick of [0, 0.25, 0.5, 0.75, 1]) { const line = node('span'); line.style.setProperty('--at', `${tick * 100}%`); line.append(node('b', '', tick === 1 ? '100%' : String(tick * 100))); if (!tick) line.dataset.zero = ''; scale.append(line); }
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const x = p => periods > 1 ? p / (periods - 1) * 100 : 0, y = share => (1 - share) * 100;
    const shape = shares => shares.map((s, p) => `${p ? 'L' : 'M'}${x(p).toFixed(2)} ${y(s).toFixed(2)}`).join(' ');
    const path = (d, cls) => { const el = doc.createElementNS(svgNS, 'path'); el.setAttribute('class', cls); el.setAttribute('vector-effect', 'non-scaling-stroke'); el.setAttribute('d', d); return el; };
    const sharesOf = c => c.users.map(u => u / c.size);
    const lines = cohorts.map(c => path(shape(sharesOf(c)), 'ps-curve-line'));
    const focusLine = path('', 'ps-curve-focus');
    svg.append(...lines, path(shape(average.map(a => a.share)), 'ps-curve-average'), focusLine);
    const dots = node('div', 'ps-curve-dots'), tag = node('span', 'ps-curve-tag'), tagText = node('span'), tipEl = node('div', 'ps-plot-tip');
    const guide = node('i', 'ps-curve-guide'), cursor = node('b', 'ps-curve-cursor');
    const dotEls = Array.from({ length: periods }, () => node('i'));
    dots.append(...dotEls, cursor); tag.append(tagText);
    for (const el of [dots, tag, tipEl, guide]) el.setAttribute('aria-hidden', 'true');
    area.append(guide, svg, dots, tag, tipEl);
    plot.replaceChildren(scale, area);
    const periodLabels = Array.from({ length: periods }, (_, p) => { const label = node('span', '', p ? String(p) : `${unit}\u00a00`); label.style.setProperty('--x', `${x(p)}%`); if (!p) label.dataset.lead = ''; return label; });
    if (axis) { axis.replaceChildren(...periodLabels); axis.setAttribute('aria-hidden', 'true'); }
    if (picker) picker.replaceChildren(...cohorts.map(c => { const option = node('option', '', `${c.label} · ${count.format(c.size)}`); option.value = String(c.index); return option; }));
    const tipFor = (r, c) => {
      const row = cohorts[r], share = row.users[c] / row.size, avg = average[c], gap = (share - avg.share) * 100, trend = trendOf(gap, 1);
      return [`${row.label} cohort · ${unit} ${c}`, [['Retained', `${count.format(row.users[c])} of ${count.format(row.size)}`, 'var(--cohort-hue)'], ['Rate', percent(share)], ['Average', percent(avg.share)], ['Vs average', signed(trend === 'flat' ? 0 : gap, 1, ' pts'), '', trend]]];
    };
    const tip = makeTip(tipEl, area, () => cohorts.flatMap((row, r) => row.users.map((_, c) => tipFor(r, c))));

    // The focus line morphs when the two shapes have the same points; otherwise the old line fades out over the new one.
    // It starts from the shape drawn this frame, so a change mid-flight continues from where the line is.
    const morph = (d, animate) => {
      const drawn = animate ? win.getComputedStyle(focusLine).getPropertyValue('d') : '';
      const from = drawn.startsWith('path(') ? drawn.slice(6, -2) : focusLine.getAttribute('d');
      stop(focusLine, 'morph');
      focusLine.setAttribute('d', d);
      if (!animate || !from || from === d) return;
      const points = text => (text.match(/[ML]/gi) || []).length;
      if (points(from) === points(d) && win.CSS?.supports?.('d', `path("${d}")`)) { play(focusLine, [{ d: `path("${from}")` }, { d: `path("${d}")` }], SETTLE, 'morph'); return; }
      const ghost = path(from, 'ps-curve-focus'); ghost.dataset.ghost = '';
      focusLine.after(ghost);
      const run = play(ghost, [{ opacity: 1 }, { opacity: 0 }], PRESS, 'fade');
      if (!run) { ghost.remove(); return; }
      const drop = () => ghost.remove(); run.addEventListener('finish', drop); run.addEventListener('cancel', drop);
    };
    let drawnRow = -1, lastAvg = null;
    const show = (animate = false) => {
      const row = cohorts[at.r], share = row.users[at.c] / row.size, avg = average[at.c], rowChanged = drawnRow !== at.r, first = drawnRow < 0;
      const go = animate && !first, duration = rowChanged ? SETTLE : FAST;
      lines.forEach((line, i) => line.toggleAttribute('data-focus', i === at.r));
      if (rowChanged) morph(shape(sharesOf(row)), go);
      // Dots, the cursor ring, the guide and the average tag travel together from where they are drawn.
      glide([...(rowChanged ? dotEls : []), cursor, guide, tag], () => {
        if (rowChanged) dotEls.forEach((dot, p) => {
          const on = p < row.users.length;
          dot.toggleAttribute('data-off', !on);
          if (on) { dot.style.left = `${x(p)}%`; dot.style.top = `${y(row.users[p] / row.size)}%`; }
        });
        dotEls.forEach((dot, p) => dot.toggleAttribute('data-focus', p === at.c));
        cursor.style.left = guide.style.left = `${x(at.c)}%`; cursor.style.top = `${y(share)}%`;
        tag.style.top = `${y(avg.share)}%`;
      }, go, duration);
      // The average's value at the inspected period is tagged at the scale's right edge.
      roll(tagText, `Avg ${percent(avg.share, 0)}`, lastAvg === null ? 0 : Math.sign(avg.share - lastAvg), go);
      lastAvg = avg.share;
      periodLabels.forEach((label, p) => label.toggleAttribute('data-focus', p === at.c));
      const [title, rowsOut] = tipFor(at.r, at.c);
      const left = x(at.c) / 100 * area.clientWidth, top = y(share) / 100 * area.clientHeight;
      tip.show(title, rowsOut, { left: left - 8, right: left + 8, top }, { animate: go, duration });
      drawnRow = at.r;
      if (picker) picker.value = String(at.r);
      if (readout) readout.textContent = joined(describe(row, at.c));
      emit(block, 'pagesystem:retention-cohort', { cohort: row.label, period: at.c, share });
    };
    let hovering = false;
    on(plot, 'keydown', event => {
      let { r, c } = at;
      const last = i => cohorts[i].users.length - 1;
      if (event.key === 'ArrowRight') c = Math.min(last(r), c + 1);
      else if (event.key === 'ArrowLeft') c = Math.max(0, c - 1);
      else if (event.key === 'ArrowDown') { r = Math.min(cohorts.length - 1, r + 1); c = Math.min(c, last(r)); }
      else if (event.key === 'ArrowUp') { r = Math.max(0, r - 1); c = Math.min(c, last(r)); }
      else if (event.key === 'Home') c = 0;
      else if (event.key === 'End') c = last(r);
      else return;
      event.preventDefault(); at = { r, c }; show(false);
    });
    // A pointer scrubs the nearest period of the chosen cohort; touch scrubs while pressed.
    scrubber(on, plot, event => {
      const box = area.getBoundingClientRect(); if (!box.width) return;
      const c = clamp(Math.round((event.clientX - box.left) / box.width * (periods - 1)), 0, cohorts[at.r].users.length - 1);
      if (c !== at.c) { at = { r: at.r, c }; show(moving(block)); }
    });
    on(plot, 'pointerenter', event => { hovering = true; if (event.pointerType !== 'touch') tip.enter(moving(block)); });
    on(plot, 'pointerleave', () => { hovering = false; if (doc.activeElement !== plot) tip.leave(); });
    on(plot, 'focus', () => tip.enter(false));
    on(plot, 'blur', () => { if (!hovering) tip.leave(); });
    if (picker) on(picker, 'change', () => { const r = Number(picker.value); at = { r, c: Math.min(at.c, cohorts[r].users.length - 1) }; show(moving(block)); });
    show(false);
  };

  // Histogram with a range brush ------------------------------------------------------------------------------
  // Pure: what share of the population falls between two bin edges, and where a quantile falls inside its bin.
  const binsInRange = (bins, lo, hi) => bins.slice(lo, hi).reduce((n, b) => n + b.count, 0);
  const binQuantile = (bins, total, q) => {
    let seen = 0;
    for (const bin of bins) { if (seen + bin.count >= q * total) return bin.from + (bin.to - bin.from) * (bin.count ? (q * total - seen) / bin.count : 0); seen += bin.count; }
    return bins.at(-1).to;
  };

  const histogramRange = block => {
    const on = claim(block);
    const bins = [...block.querySelectorAll('[data-hist-table] tr')].map(tr => ({ from: Number(tr.dataset.from), to: Number(tr.dataset.to), count: Number(tr.dataset.count) }));
    const plot = block.querySelector('[data-hist-plot]'), brush = block.querySelector('[data-hist-brush]'), axis = block.querySelector('[data-hist-axis]');
    if (!bins.length || !plot || !brush) return;
    const n = bins.length, total = bins.reduce((s, b) => s + b.count, 0), noun = block.dataset.histNoun || 'items', Noun = noun[0].toUpperCase() + noun.slice(1);
    const fmt = formatter(block.dataset.histUnit), edge = i => i < n ? bins[i].from : bins[n - 1].to, min = edge(0), max = edge(n);
    const edgeOf = value => { const i = bins.findIndex(b => b.from >= value); return i < 0 ? n : i; };
    let lo = clamp(edgeOf(Number(block.dataset.histFrom ?? min)), 0, n - 1), hi = clamp(edgeOf(Number(block.dataset.histTo ?? max)), lo + 1, n);
    let inspected = bins.slice(lo, hi).reduce((best, b, i) => b.count > bins[best].count ? lo + i : best, lo);
    const span = (a, b) => `${fmt.full(edge(a))} – ${fmt.full(edge(b))}`;

    // The count scale sits in the gutter at round values; the unit is named once in the plot's caption.
    const height = plot.clientHeight || 200, { hi: top, ticks } = niceRange(0, Math.max(...bins.map(b => b.count)), Math.max(2, Math.min(5, Math.floor(height / 48))));
    const scale = node('div', 'ps-hist-scale'), bars = node('div', 'ps-hist-bars'), lane = node('div'), tipEl = node('div', 'ps-plot-tip');
    scale.setAttribute('aria-hidden', 'true'); tipEl.setAttribute('aria-hidden', 'true');
    for (const tick of ticks) { const line = node('span'); line.style.setProperty('--at', `${tick / top * 100}%`); line.append(node('b', '', compact(tick))); if (!tick) line.dataset.zero = ''; scale.append(line); }
    const columns = bins.map(bin => { const col = node('div', 'ps-hist-bar'), bar = node('span'); bar.style.height = `${bin.count / top * 100}%`; col.append(bar); return col; });
    bars.append(...columns, tipEl);
    // Markers: percentiles and any reference value, dashed across the plot with their values tagged above it.
    const markers = [];
    for (const q of (block.dataset.histPercentiles || '').split(/\s+/).filter(Boolean)) markers.push({ name: `p${q}`, value: binQuantile(bins, total, Number(q) / 100) });
    if (block.dataset.histReference) markers.push({ name: block.dataset.histReferenceLabel || 'Target', value: Number(block.dataset.histReference), reference: true });
    const at = value => (value - min) / (max - min) * 100;
    for (const marker of markers) {
      const line = node('i', 'ps-hist-marker'); line.style.left = `${at(marker.value)}%`; bars.append(line);
      const label = node('span', 'ps-hist-tag'); label.append(node('b', '', marker.name), node('span', '', fmt.full(Math.round(marker.value)))); label.style.left = `${at(marker.value)}%`; lane.append(label);
      marker.label = label;
    }
    plot.replaceChildren(scale, bars);
    const shownLane = block.querySelector('[data-hist-lane]') || lane;
    shownLane.replaceChildren(...lane.childNodes);
    shownLane.hidden = !markers.length;
    for (const m of block.querySelectorAll('[data-hist-percentile]')) { const hit = markers.find(x => x.name === m.dataset.histPercentile); if (hit) m.textContent = fmt.full(Math.round(hit.value)); }
    // Tags that would collide step onto a second row instead of overlapping.
    const settleTags = () => {
      let right = -Infinity, rows = 1;
      // A tag stays inside the figure: centered on its line where it fits, otherwise slid inward just far enough.
      const room = shownLane.parentElement.getBoundingClientRect();
      for (const label of shownLane.children) { label.style.translate = ''; const box = label.getBoundingClientRect(), left = clamp(box.left, room.left, room.right - box.width); if (left !== box.left) label.style.translate = `calc(-50% + ${left - box.left}px) 0`; }
      for (const label of [...shownLane.children].sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left))) {
        label.removeAttribute('data-row');
        const box = label.getBoundingClientRect();
        if (box.left < right + 4) { label.dataset.row = '2'; rows = 2; } else right = box.right;
      }
      shownLane.dataset.rows = String(rows);
    };

    // Edge labels thin by the space they have; the last carries the unit.
    if (axis) {
      // Labeled edges step by a round multiple of the band width, about one per 56px.
      const band = bins[0].to - bins[0].from, raw = (max - min) / Math.max(2, Math.floor((axis.clientWidth || 600) / 56));
      const every = [1, 2, 4, 5, 10, 20, 25, 50, 100, 200, 500].find(k => k * band >= raw) || n, labels = [];
      for (let i = 0; i <= n; i += every) labels.push(i);
      if (labels.at(-1) !== n) labels[labels.length - 1] = n;
      axis.replaceChildren(...labels.map(i => { const label = node('span', '', i === n ? fmt.full(edge(i)) : fmt.short(edge(i))); label.style.setProperty('--x', `${i / n * 100}%`); if (i === 0) label.dataset.edge = 'start'; if (i === n) label.dataset.edge = 'end'; return label; }));
      thinLabels(axis);
    }

    // The brush: a track on the same x scale as the bars, the brushed window, and two slider handles.
    const track = node('div', 'ps-hist-track'), window_ = node('div', 'ps-hist-window');
    const handle = (name) => { const el = node('div', 'ps-hist-handle'); el.tabIndex = 0; el.setAttribute('role', 'slider'); el.setAttribute('aria-label', name); el.setAttribute('aria-orientation', 'horizontal'); return el; };
    const low = handle(`${block.dataset.histLabel || 'Range'} from`), high = handle(`${block.dataset.histLabel || 'Range'} to`);
    track.append(window_);
    brush.replaceChildren(track, low, high);

    const tipFor = (index, inside = index >= lo && index < hi) => { const bin = bins[index]; return [`${fmt.full(bin.from)} – ${fmt.full(bin.to)}`, [[Noun, count.format(bin.count), inside ? 'var(--hist-color)' : 'var(--plot-context)'], ['Share', percent(bin.count / total)], [inside ? 'In range' : 'Outside range', '']]]; };
    const tip = makeTip(tipEl, bars, () => bins.flatMap((_, i) => [tipFor(i, true), tipFor(i, false)]));
    const shareText = () => `${percent(binsInRange(bins, lo, hi) / total)} of ${count.format(total)} ${noun}`;
    const inspect = (index, animate = false) => {
      inspected = index;
      columns.forEach((col, i) => col.toggleAttribute('data-focus', i === index));
      const bin = bins[index], inside = index >= lo && index < hi;
      const [title, rows] = tipFor(index);
      const col = columns[index], stack = col.firstChild;
      tip.show(title, rows, { left: col.offsetLeft, right: col.offsetLeft + col.offsetWidth, top: stack.offsetTop + Math.min(24, stack.offsetHeight / 2) }, { animate, reveal: false });
      const readout = block.querySelector('[data-hist-readout]');
      if (readout) readout.textContent = joined(`${fmt.full(bin.from)} – ${fmt.full(bin.to)} · ${count.format(bin.count)} ${noun} · ${inside ? 'inside' : 'outside'} the range ${span(lo, hi)}`);
    };
    // The headline figures roll in the direction they moved: the count and its share by the count, the range by its edges.
    let shownCount = null, shownLo = lo, shownHi = hi;
    const update = (animate = false) => {
      const inRange = binsInRange(bins, lo, hi);
      columns.forEach((col, i) => { col.dataset.in = String(i >= lo && i < hi); });
      window_.style.left = `${lo / n * 100}%`; window_.style.right = `${100 - hi / n * 100}%`;
      low.style.left = `${lo / n * 100}%`; high.style.left = `${hi / n * 100}%`;
      for (const [el, value, a, b] of [[low, edge(lo), edge(0), edge(hi - 1)], [high, edge(hi), edge(lo + 1), edge(n)]]) {
        el.setAttribute('aria-valuemin', String(a)); el.setAttribute('aria-valuemax', String(b)); el.setAttribute('aria-valuenow', String(value));
        el.setAttribute('aria-valuetext', `${fmt.full(value)}, ${count.format(inRange)} ${noun} in range, ${percent(inRange / total)}`);
      }
      const byCount = shownCount === null ? 0 : Math.sign(inRange - shownCount), byEdge = Math.sign(lo - shownLo) || Math.sign(hi - shownHi);
      roll(block.querySelector('[data-hist-count]'), count.format(inRange), byCount, animate);
      roll(block.querySelector('[data-hist-share]'), shareText(), byCount, animate);
      roll(block.querySelector('[data-hist-range]'), span(lo, hi), byEdge, animate);
      shownCount = inRange; shownLo = lo; shownHi = hi;
      inspect(clamp(inspected, 0, n - 1), animate);
      emit(block, 'pagesystem:histogram-range', { from: edge(lo), to: edge(hi), count: inRange, share: inRange / total });
    };
    const move = (which, next) => {
      const before = [lo, hi];
      if (which === 'low') lo = clamp(next, 0, hi - 1); else hi = clamp(next, lo + 1, n);
      inspected = which === 'low' ? lo : hi - 1;
      if (before[0] === lo && before[1] === hi && columns[inspected].hasAttribute('data-focus')) return;
      update(moving(block));
      tip.enter(moving(block));
    };
    for (const [el, which] of [[low, 'low'], [high, 'high']]) {
      on(el, 'keydown', event => {
        const current = which === 'low' ? lo : hi, step = event.shiftKey ? 10 : 1;
        const next = { ArrowLeft: current - step, ArrowDown: current - step, ArrowRight: current + step, ArrowUp: current + step, PageDown: current - 10, PageUp: current + 10, Home: -Infinity, End: Infinity }[event.key];
        if (next === undefined) return;
        event.preventDefault(); move(which, clamp(next, 0, n));
      });
      on(el, 'focus', () => { inspect(which === 'low' ? lo : hi - 1, moving(block)); tip.enter(moving(block)); });
      on(el, 'blur', event => { if (!hovering && !brush.contains(event.relatedTarget)) tip.leave(); });
    }
    // Dragging: the pressed handle (or the nearer one, when the track is pressed) follows the pointer to the nearest edge.
    let dragging = null, hovering = false;
    const edgeAt = clientX => { const box = track.getBoundingClientRect(); return clamp(Math.round((clientX - box.left) / box.width * n), 0, n); };
    on(brush, 'pointerdown', event => {
      if (event.button !== 0) return;
      const target = edgeAt(event.clientX);
      dragging = event.target === low ? 'low' : event.target === high ? 'high' : Math.abs(target - lo) <= Math.abs(target - hi) && target < hi ? 'low' : 'high';
      (dragging === 'low' ? low : high).focus();
      brush.setPointerCapture?.(event.pointerId);
      move(dragging, target);
      event.preventDefault();
    });
    on(brush, 'pointermove', event => { if (dragging) move(dragging, edgeAt(event.clientX)); });
    for (const type of ['pointerup', 'pointercancel']) on(brush, type, () => { dragging = null; });
    // A pointer over the bars reads the band beneath it; the tip rises in on arrival and fades when the pointer leaves.
    scrubber(on, bars, event => {
      const box = bars.getBoundingClientRect(); if (!box.width) return;
      const index = clamp(Math.floor((event.clientX - box.left) / box.width * n), 0, n - 1);
      if (index !== inspected) inspect(index, moving(block));
      tip.enter(moving(block));
    });
    on(bars, 'pointerenter', () => { hovering = true; });
    on(bars, 'pointerleave', () => { hovering = false; if (!brush.contains(doc.activeElement)) tip.leave(); });
    update(false);
    if (markers.length) settleTags();
  };

  // Scatter plot ---------------------------------------------------------------------------------------------
  let scatterCount = 0;
  const scatterPlot = block => {
    const on = claim(block);
    const plot = block.querySelector('[data-scatter-plot]'), axis = block.querySelector('[data-scatter-axis]');
    const points = [...block.querySelectorAll('[data-scatter-table] tr')].map(tr => ({ name: tr.querySelector('th')?.textContent.trim() || '', x: Number(tr.dataset.x), y: Number(tr.dataset.y), size: Number(tr.dataset.size) || 0, category: tr.dataset.category || '' }));
    if (!plot || !points.length) return;
    const fx = formatter(block.dataset.scatterXUnit), fy = formatter(block.dataset.scatterYUnit);
    const xName = block.dataset.scatterX || 'x', yName = block.dataset.scatterY || 'y', noun = block.dataset.scatterNoun || 'points';
    const showY = v => fy.signed ? fy.signed(v) : fy.full(v);
    const id = block.id || `ps-scatter-${++scatterCount}`;
    // Points are read in x order; ties fall back to y so the order is total.
    const order = points.map((p, i) => i).sort((a, b) => points[a].x - points[b].x || points[a].y - points[b].y);
    const xs = points.map(p => p.x), ys = points.map(p => p.y), medX = median(xs), medY = median(ys);
    const lines = Math.max(2, Math.min(5, Math.floor((plot.clientHeight || 300) / 64)));
    const X = niceRange(0, Math.max(...xs), Math.max(2, Math.min(6, Math.floor((plot.clientWidth || 600) / 110)))), Y = niceRange(Math.min(0, ...ys), Math.max(...ys), lines);
    const px = v => (v - X.lo) / (X.hi - X.lo) * 100, py = v => (1 - (v - Y.lo) / (Y.hi - Y.lo)) * 100;

    const quadrants = (block.dataset.scatterQuadrants || '').split('|').map(s => s.trim()).filter(Boolean);
    const quadrantOf = p => quadrants.length === 4 ? quadrants[(p.y > medY ? 0 : 2) + (p.x > medX ? 1 : 0)] : '';
    const categories = (block.dataset.scatterCategories || '').split('|').filter(Boolean).slice(0, 4).map(pair => { const [name, key] = pair.split(':'); return { name: name.trim(), color: `var(--source-${(key || 'endpoint').trim()})` }; });
    const colorOf = p => categories.find(c => c.name === p.category)?.color || 'var(--scatter-color)';
    const sizeBreaks = (block.dataset.scatterSizeBreaks || '').split(/\s+/).filter(Boolean).map(Number);
    const sizeOf = p => sizeBreaks.length ? 1 + sizeBreaks.filter(b => p.size >= b).length : 0;
    // Outliers sit beyond 1.5 interquartile ranges on either measure.
    const fence = values => { const q1 = quantile(values, 0.25), q3 = quantile(values, 0.75), r = q3 - q1; return [q1 - 1.5 * r, q3 + 1.5 * r]; };
    const [xl, xh] = fence(xs), [yl, yh] = fence(ys);
    const outlier = p => block.hasAttribute('data-scatter-outliers') && (p.x < xl || p.x > xh || p.y < yl || p.y > yh);

    // Structure: gridlines at labeled values only, zero in baseline ink, median quadrant lines dashed with their values tagged at the edges.
    const frame = node('div', 'ps-scatter-frame'), marks = node('div', 'ps-scatter-marks'), list = node('div', 'ps-scatter-points'), tipEl = node('div', 'ps-plot-tip'), scaleY = node('div', 'ps-scatter-scale');
    for (const el of [marks, tipEl, scaleY]) el.setAttribute('aria-hidden', 'true');
    Y.ticks.forEach((tick, i) => { const line = node('span'); line.style.setProperty('--at', `${100 - py(tick)}%`); line.append(node('b', '', i === Y.ticks.length - 1 ? fy.full(tick) : fy.short(tick))); if (tick === 0) line.dataset.zero = ''; scaleY.append(line); });
    if (quadrants.length === 4 || block.hasAttribute('data-scatter-medians')) {
      const vx = node('i', 'ps-scatter-median'), hy = node('i', 'ps-scatter-median'), tx = node('span', 'ps-scatter-edge-tag', `Median ${fx.full(medX)}`), ty = node('span', 'ps-scatter-edge-tag', `Median ${showY(medY)}`);
      vx.dataset.axis = 'x'; vx.style.left = `${px(medX)}%`; hy.dataset.axis = 'y'; hy.style.top = `${py(medY)}%`;
      tx.dataset.axis = 'x'; tx.style.left = `${px(medX)}%`; ty.dataset.axis = 'y'; ty.style.top = `${py(medY)}%`;
      marks.append(vx, hy, tx, ty);
    }
    quadrants.forEach((name, i) => { const label = node('span', 'ps-scatter-quadrant', name); label.dataset.corner = ['tl', 'tr', 'bl', 'br'][i]; marks.append(label); });
    // Category names sit at their cluster (the median of each category), never in a detached key.
    for (const c of categories) {
      const members = points.filter(p => p.category === c.name); if (!members.length) continue;
      const label = node('span', 'ps-scatter-cluster', c.name); label.style.setProperty('--cat-color', c.color);
      label.style.left = `${px(median(members.map(p => p.x)))}%`; label.style.top = `${py(median(members.map(p => p.y)))}%`; marks.append(label);
    }
    list.id = `${id}-points`; list.tabIndex = 0; list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', block.dataset.scatterLabel || `${noun} by ${xName} and ${yName}`);
    const dots = points.map((p, i) => {
      const dot = node('div', 'ps-scatter-dot'); dot.id = `${id}-p${i}`; dot.setAttribute('role', 'option'); dot.setAttribute('aria-selected', 'false');
      dot.setAttribute('aria-label', `${p.name}, ${fx.full(p.x)} ${xName}, ${showY(p.y)} ${yName}${p.category ? `, ${p.category}` : ''}${sizeBreaks.length ? `, ${count.format(p.size)} ${block.dataset.scatterSizeName || 'size'}` : ''}`);
      dot.style.left = `${px(p.x)}%`; dot.style.top = `${py(p.y)}%`; dot.style.setProperty('--dot-color', colorOf(p));
      if (sizeBreaks.length) dot.dataset.size = String(sizeOf(p));
      if (categories.length) dot.dataset.category = '';
      if (outlier(p)) { dot.dataset.outlier = ''; const label = node('span', 'ps-scatter-label', p.name); label.style.left = `${px(p.x)}%`; label.style.top = `${py(p.y)}%`; marks.append(label); }
      return dot;
    });
    // Larger marks first, so small ones are never hidden beneath them.
    list.append(...order.slice().sort((a, b) => sizeOf(points[b]) - sizeOf(points[a])).map(i => dots[i]));
    frame.append(marks, list, tipEl);
    plot.replaceChildren(scaleY, frame);
    if (axis) {
      axis.replaceChildren(...X.ticks.map((tick, i) => { const label = node('span', '', i === X.ticks.length - 1 ? fx.full(tick) : fx.short(tick)); label.style.setProperty('--x', `${px(tick)}%`); if (!i) label.dataset.edge = 'start'; if (i === X.ticks.length - 1) label.dataset.edge = 'end'; return label; }));
      axis.setAttribute('aria-hidden', 'true');
      thinLabels(axis);
    }
    // Text in the plot is placed, not stamped: each tag tries its candidate sides and keeps the one that covers the fewest marks
    // and earlier labels, so a median value or an outlier's name never sits on the points it describes. O(labels x sides x points).
    const placeLabels = () => {
      const hit = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const bounds = frame.getBoundingClientRect(), taken = [...marks.querySelectorAll('.ps-scatter-quadrant, .ps-scatter-cluster')].map(el => el.getBoundingClientRect());
      const dotBoxes = dots.map(el => el.getBoundingClientRect());
      const cost = box => dotBoxes.reduce((sum, d) => sum + hit(box, d), 0) + taken.reduce((sum, t) => sum + 4 * hit(box, t), 0)
        + 8 * (box.width * box.height - hit(box, bounds));
      const sides = { 'ps-scatter-edge-tag': ['', 'end', 'below', 'end-below'], 'ps-scatter-label': ['end', 'start', 'above-end', 'above-start'] };
      for (const el of marks.querySelectorAll('.ps-scatter-edge-tag, .ps-scatter-label')) {
        let best = null;
        for (const side of sides[el.className]) {
          el.dataset.place = side; const box = el.getBoundingClientRect(), score = cost(box);
          if (!best || score < best.score - 1) best = { side, score, box };
        }
        el.dataset.place = best.side; taken.push(best.box);
      }
    };
    placeLabels();
    if (win.ResizeObserver) { let width = frame.clientWidth; const watch = new win.ResizeObserver(() => { if (frame.clientWidth !== width) { width = frame.clientWidth; placeLabels(); } }); watch.observe(frame); observers.push(watch); }

    // Headline figures are derived from the points.
    const set = (sel, text) => { const el = block.querySelector(sel); if (el) el.textContent = text; };
    set('[data-scatter-median-x]', fx.full(medX)); set('[data-scatter-median-y]', showY(medY));
    const leaders = points.filter(p => p.x > medX && p.y > medY).length;
    set('[data-scatter-leaders]', count.format(leaders)); set('[data-scatter-leaders-share]', `${percent(leaders / points.length, 0)} of ${count.format(points.length)} ${noun}`);

    const search = block.querySelector('[data-scatter-search]'), status = block.querySelector('[data-scatter-status]'), readout = block.querySelector('[data-scatter-readout]');
    let matches = null, focus = order.at(-1), hovering = false;
    if (block.dataset.scatterFocus) { const i = points.findIndex(p => p.name === block.dataset.scatterFocus); if (i >= 0) focus = i; }
    const steps = () => matches ? order.filter(i => matches.has(i)) : order;
    const tipFor = p => [p.name, [[xName, fx.full(p.x), colorOf(p)], [yName, showY(p.y)], ...(sizeBreaks.length ? [[block.dataset.scatterSizeName || 'Size', count.format(p.size)]] : []), ...(p.category ? [['Segment', p.category]] : []), ...(quadrantOf(p) ? [[quadrantOf(p), '']] : [])]];
    const tip = makeTip(tipEl, frame, () => points.map(tipFor));
    const show = (animate = false) => {
      const p = points[focus], dot = dots[focus];
      dots.forEach((el, i) => { const active = i === focus; el.setAttribute('aria-selected', String(active)); el.toggleAttribute('data-focus', active); el.toggleAttribute('data-match', !!matches && matches.has(i)); });
      list.toggleAttribute('data-searching', !!matches);
      list.setAttribute('aria-activedescendant', dot.id);
      const [title, rows] = tipFor(p);
      const left = px(p.x) / 100 * frame.clientWidth, top = py(p.y) / 100 * frame.clientHeight, r = dot.offsetWidth / 2 + 4;
      tip.show(title, rows, { left: left - r, right: left + r, top }, { animate, reveal: false });
      if (readout) readout.textContent = joined(`${p.name} · ${fx.full(p.x)} ${xName} · ${showY(p.y)} ${yName}${p.category ? ` · ${p.category}` : ''}${sizeBreaks.length ? ` · ${count.format(p.size)} ${(block.dataset.scatterSizeName || 'size').toLowerCase()}` : ''}${quadrantOf(p) ? ` · ${quadrantOf(p)}` : ''}`);
      emit(block, 'pagesystem:scatter-plot', { name: p.name, x: p.x, y: p.y });
    };
    on(list, 'keydown', event => {
      const path = steps(); if (!path.length) return;
      const here = path.indexOf(focus);
      const next = { ArrowRight: here + 1, ArrowDown: here + 1, ArrowLeft: here < 0 ? 0 : here - 1, ArrowUp: here < 0 ? 0 : here - 1, Home: 0, End: path.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); focus = path[clamp(next, 0, path.length - 1)]; show(false); tip.enter(false);
    });
    // A pointer inspects the nearest point within reach; pressing it also moves keyboard focus to the plot, so the tip stays.
    const nearest = event => {
      const box = frame.getBoundingClientRect(); let best = -1, reach = 24 ** 2;
      for (const i of steps()) { const dx = px(points[i].x) / 100 * box.width + box.left - event.clientX, dy = py(points[i].y) / 100 * box.height + box.top - event.clientY, d = dx * dx + dy * dy; if (d < reach) { reach = d; best = i; } }
      return best;
    };
    scrubber(on, list, event => {
      const i = nearest(event);
      if (i >= 0 && i !== focus) { focus = i; show(moving(block)); }
      if (i >= 0 || event.type === 'pointerdown') tip.enter(moving(block));
    });
    on(list, 'pointerenter', () => { hovering = true; });
    on(list, 'pointerleave', () => { hovering = false; if (doc.activeElement !== list) tip.leave(); });
    on(list, 'focus', () => tip.enter(false));
    on(list, 'blur', () => { if (!hovering) tip.leave(); });
    if (search) on(search, 'input', () => {
      const query = search.value.trim().toLowerCase();
      matches = query ? new Set(points.flatMap((p, i) => `${p.name} ${p.category}`.toLowerCase().includes(query) ? [i] : [])) : null;
      if (matches && matches.size && !matches.has(focus)) focus = steps()[0];
      swap(status, !matches ? `${count.format(points.length)} ${noun}` : matches.size ? `${count.format(matches.size)} of ${count.format(points.length)} ${noun} match “${search.value.trim()}”` : `No ${noun} match “${search.value.trim()}”. Clear the search to see all ${count.format(points.length)}.`, moving(block));
      show(moving(block));
    });
    show(false);
  };

  for (const block of find('[data-ps-retention-cohort]')) retentionCohort(block);
  for (const block of find('[data-ps-histogram-range]')) histogramRange(block);
  for (const block of find('[data-ps-scatter-plot]')) scatterPlot(block);
  // Listeners are aborted with the shared signal; every running animation is canceled, which also drops stand-ins.
  return () => { for (const run of [...running]) run.cancel(); running.clear(); for (const watch of observers.splice(0)) watch.disconnect(); };
});

// Fictional records. Models have no I/O and bounded linear transforms.
const BRIEF_SOURCES = [
 {id:'research',name:'Research notes',type:'Research',text:'Teams lose context when project decisions move between documents. Keep the source beside the decision.'},
 {id:'principles',name:'Interface principles',type:'Guidelines',text:'Use readable type, shared edges and explicit states. Make every action recoverable.'},
 {id:'launch',name:'Launch brief',type:'Planning',text:'The first release serves small product teams. Prioritize review, clear ownership and a useful offline handoff.'}
];
function prepareContextBrief(instruction,ids,formality,detail){
 if(typeof instruction!=='string'||!instruction.trim()||instruction.length>1000)throw new Error('Write an instruction from 1 to 1,000 characters.');
 if(!Array.isArray(ids)||!ids.length||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!BRIEF_SOURCES.some(s=>s.id===id)))throw new Error('Select at least one source.');
 if([formality,detail].some(v=>!Number.isInteger(v)||v<0||v>100))throw new Error('Tone values must be between 0 and 100.');
 const register=formality<34?'Formal':formality>66?'Conversational':'Balanced',depth=detail<34?'Brief':detail>66?'Detailed':'Standard';
 const selected=new Set(ids),sources=BRIEF_SOURCES.filter(s=>selected.has(s.id));
 return {instruction:instruction.trim(),sources:sources.map(s=>({...s})),register,depth,text:[instruction.trim(),`Style: ${register.toLowerCase()}, ${depth.toLowerCase()}.`,...sources.map(s=>`${s.name}\n${s.text}`)].join('\n\n')};
}
const APPROVAL_REQUESTS = [
 {id:'font',title:'Typeface license',person:'Maya Okafor',initials:'MO',team:'Design',amount:420,detail:'Annual team license for six designers. Includes web and desktop use.',category:'Software'},
 {id:'research',title:'Research incentives',person:'Theo Martin',initials:'TM',team:'Research',amount:960,detail:'Twelve moderated interviews at $80 per participant. Research plan is attached in the sample.',category:'Research'},
 {id:'travel',title:'Studio workshop',person:'Lena Hoffmann',initials:'LH',team:'Product',amount:1850,detail:'Rail travel and two nights for the product workshop. The requested amount exceeds the sample $1,500 review threshold.',category:'Travel'},
 {id:'hosting',title:'Preview environments',person:'Sam Chen',initials:'SC',team:'Engineering',amount:240,detail:'Three months of isolated review environments for the upcoming launch.',category:'Infrastructure'}
];
function initialApprovals(){return Object.fromEntries(APPROVAL_REQUESTS.map(r=>[r.id,{status:'pending',reason:''}]));}
function decideApproval(states,id,action,reason=''){
 if(!APPROVAL_REQUESTS.some(r=>r.id===id)||!states[id]||states[id].status!=='pending')throw new Error('Only a pending request can be decided.');
 if(!['approved','returned'].includes(action))throw new Error('Unknown decision.');
 if(typeof reason!=='string'||reason.length>240||action==='returned'&&!reason.trim())throw new Error('Add a return reason, up to 240 characters.');
 return {...states,[id]:{status:action,reason:reason.trim()}};
}
const RELEASE_PHASES=[{id:'design',name:'Design sign-off',owner:'Design',days:2},{id:'build',name:'Implementation',owner:'Engineering',days:5},{id:'review',name:'Quality review',owner:'Product',days:3},{id:'rollout',name:'Staged rollout',owner:'Engineering',days:1}];
function planRelease(durations){
 if(!Array.isArray(durations)||durations.length!==4||durations.some(n=>!Number.isInteger(n)||n<1||n>7))throw new Error('Each phase needs 1–7 calendar days.');
 let end=0;const phases=RELEASE_PHASES.map((phase,i)=>{const start=end;end+=durations[i];return {...phase,days:durations[i],start,end};});return {phases,total:end,slack:14-end,deadline:14};
}
const CAPACITY_PEOPLE=[{name:'Maya Okafor',initials:'MO',role:'Design',capacity:32},{name:'Lena Hoffmann',initials:'LH',role:'Design',capacity:40},{name:'Sam Chen',initials:'SC',role:'Engineering',capacity:40},{name:'Theo Martin',initials:'TM',role:'Research',capacity:24}];
const CAPACITY_PROJECTS=['Website','Design system','Research'];
const CAPACITY_INITIAL=[[18,10,4],[16,18,4],[22,14,0],[4,0,16]];
function capacitySummary(matrix){
 if(!Array.isArray(matrix)||matrix.length!==4||matrix.some(row=>!Array.isArray(row)||row.length!==3||row.some(n=>!Number.isInteger(n)||n<0||n>40)))throw new Error('Use whole hours from 0 to 40 for every project.');
 const projects=[0,0,0];const people=CAPACITY_PEOPLE.map((p,i)=>{let assigned=0;for(let j=0;j<3;j++){assigned+=matrix[i][j];projects[j]+=matrix[i][j];}return {...p,assigned,remaining:p.capacity-assigned,hours:[...matrix[i]]};});
 return {people,projects,assigned:projects.reduce((a,b)=>a+b,0),available:CAPACITY_PEOPLE.reduce((n,p)=>n+p.capacity,0),overbooked:people.filter(p=>p.remaining<0).length};
}
const ACCESS_ROLES=['Owner','Member','Guest'];
const ACCESS_RULES=[
 {name:'Project files',levels:['None','View','Edit'],guestMax:1,initial:[2,2,1]},
 {name:'Design library',levels:['None','View','Edit'],guestMax:1,initial:[2,2,1]},
 {name:'Team members',levels:['None','View','Manage'],guestMax:0,initial:[2,1,0]},
 {name:'Billing',levels:['None','View','Manage'],guestMax:0,initial:[2,0,0]},
 {name:'Audit history',levels:['None','View','Export'],guestMax:0,initial:[2,1,0]}
];
function validateAccess(matrix){
 if(!Array.isArray(matrix)||matrix.length!==5)throw new Error('Expected five capabilities.');
 matrix.forEach((row,i)=>{if(!Array.isArray(row)||row.length!==3||row.some(n=>!Number.isInteger(n)||n<0||n>2)||row[0]!==2||row[2]>ACCESS_RULES[i].guestMax)throw new Error('Owner access is fixed; guests cannot manage or access restricted capabilities.');});return matrix.map(row=>[...row]);
}
const REVISION_SECTIONS=[
 {id:'opening',title:'Opening',before:'We build tools for teams that want to do their best work.',after:'We build review tools for product teams that need clearer decisions.'},
 {id:'delivery',title:'Delivery',before:'Every project includes a dashboard and a final presentation.',after:'Every project includes an interactive prototype, documented decisions and a reusable component library.'},
 {id:'next',title:'Next step',before:'Contact us to learn more about our full range of services.',after:'Bring one difficult workflow. We will map the decisions and prototype the next step.'}
];
function revisionWindow(before,after){
 if(typeof before!=='string'||typeof after!=='string'||before.length>2000||after.length>2000)throw new Error('Versions must be text of at most 2,000 characters.');
 const a=before.match(/\s+|\S+/g)||[],b=after.match(/\s+|\S+/g)||[];let start=0,end=0;
 while(start<a.length&&start<b.length&&a[start]===b[start])start++;
 while(end<a.length-start&&end<b.length-start&&a[a.length-1-end]===b[b.length-1-end])end++;
 return {prefix:a.slice(0,start).join(''),removed:a.slice(start,a.length-end).join(''),added:b.slice(start,b.length-end).join(''),suffix:end?a.slice(a.length-end).join(''):''};
}
function assembleRevision(decisions){
 if(!Array.isArray(decisions)||decisions.length!==3||decisions.some(d=>!['accepted','rejected'].includes(d)))throw new Error('Review all three changes before assembling.');
 return REVISION_SECTIONS.map((section,i)=>decisions[i]==='accepted'?section.after:section.before).join('\n\n');
}

function enhanceProductComponents(root) {
  const doc = root.ownerDocument || root, win = doc.defaultView;
  const controller = new win.AbortController();
  const find = selector => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  const on = (el, event, fn) => el.addEventListener(event, fn, {signal:controller.signal});
  const node = (tag, text, cls) => { const el=doc.createElement(tag); if(text!==undefined)el.textContent=text; if(cls)el.className=cls; return el; };
  const emit = (el, name, detail) => el.dispatchEvent(new win.CustomEvent('pagesystem:'+name,{bubbles:true,detail}));
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  const cloneRows = rows => rows.map(row=>[...row]);

  /* Motion is presentation only. Every render writes the final DOM first; an animation then runs from the previous look
     back to it. Reduced motion, keyboard-initiated changes and a block's first render apply at once. Timers come from this
     module's realm because a sandboxed preview frame blocks callbacks scheduled through its own window. */
  const EASE_OUT='cubic-bezier(.22,1,.36,1)', live=new WeakSet(), running=new Set(), pending=new Map(), observers=new Set();
  const reduced = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ms = (el, name, fallback) => parseFloat(win.getComputedStyle(el).getPropertyValue(name)) || fallback;
  const still = block => !live.has(block) || block.dataset.input === 'key' || reduced();
  const trackInput = block => { on(block,'pointerdown',()=>{block.dataset.input='pointer';}); on(block,'keydown',()=>{block.dataset.input='key';}); };
  const animate = (block, el, frames, duration, options) => {
    if (!el || still(block) || !el.animate) return null;
    const run = el.animate(frames, {duration, easing:EASE_OUT, ...options}); running.add(run);
    run.addEventListener('finish', () => running.delete(run)); return run;
  };
  // A finalizer that must run even if the block is disposed first: disposal runs it at once.
  const later = (fn, delay) => { const id = setTimeout(() => { pending.delete(id); fn(); }, delay); pending.set(id, fn); return id; };
  // Text that changed rises 4px from 0.72 opacity, so contrast holds on every frame.
  const rise = (block, el, distance=4, name='--press', fallback=160) => animate(block, el, [{opacity:.72, transform:`translateY(${distance}px)`}, {opacity:1, transform:'none'}], ms(block, name, fallback));
  const setText = (block, el, text, distance=2) => { const changed = el.textContent !== text; el.textContent = text; if (changed && text) rise(block, el, distance); };
  // A changed figure rolls into its box from the direction it moved; the clip keeps it inside the box.
  const roll = (block, el, text, from, to) => {
    const changed = el.textContent !== text; el.textContent = text; if (!changed || !Number.isFinite(from) || !Number.isFinite(to) || from === to) return;
    const up = to > from;
    animate(block, el, [{transform:`translateY(${up ? 35 : -35}%)`, clipPath:up ? 'inset(0 0 35% 0)' : 'inset(35% 0 0 0)'}, {transform:'none', clipPath:'inset(0)'}], ms(block, '--settle', 220));
  };
  // Bars tween their geometry from where they are drawn now (mid-tween included) to the new final values.
  const drawn = (el, props) => Object.fromEntries(props.map(prop => [prop, win.getComputedStyle(el)[prop]]));
  const tween = (block, el, from, props) => { if (!from) return; const to = drawn(el, props); if (props.every(prop => from[prop] === to[prop])) return; animate(block, el, [from, to], ms(block, '--settle', 220)); };

  for (const block of find('[data-ps-context-composer]')) {
    const form=block.querySelector('form'), input=form.elements.namedItem('instruction');
    const formality=form.elements.namedItem('formality'), depth=form.elements.namedItem('depth');
    const sourceList=block.querySelector('[data-context-sources]'), result=block.querySelector('[data-context-result]');
    const prepare=block.querySelector('[data-context-prepare]'), status=block.querySelector('[data-context-status]');
    trackInput(block);
    for(const [i,source] of BRIEF_SOURCES.entries()) {
      const label=node('label',undefined,'ps-context-source'), check=node('input');check.type='checkbox';check.value=source.id;check.checked=i<2;
      const text=node('span');text.append(node('strong',source.name),node('small',source.type));label.append(check,text);sourceList.append(label);
    }
    const checks=[...sourceList.querySelectorAll('input')];
    const selected=()=>checks.filter(c=>c.checked).map(c=>c.value);
    const render=()=>{
      result.hidden=true;block.querySelector('[data-context-output]').value='';
      const ids=selected();prepare.disabled=!input.value.trim()||!ids.length;
      block.querySelector('[data-context-count]').textContent=`${ids.length} sources · ${input.value.length} / 1,000 characters`;
      const excerpt=block.querySelector('[data-context-excerpt]'),shown=new Set([...excerpt.children].map(p=>p.dataset.source));excerpt.replaceChildren();
      for(const source of BRIEF_SOURCES.filter(s=>ids.includes(s.id))){const p=node('p');p.dataset.source=source.id;p.append(node('strong',source.name+' '),node('span',source.text));excerpt.append(p);}
      if(!ids.length){const p=node('p','Select a source to include its context.');p.dataset.source='none';excerpt.append(p);}
      for(const p of excerpt.children)if(!shown.has(p.dataset.source))rise(block,p);
      const register=Number(formality.value)<34?'Formal':Number(formality.value)>66?'Conversational':'Balanced';
      const detail=Number(depth.value)<34?'Brief':Number(depth.value)>66?'Detailed':'Standard';
      formality.nextElementSibling.textContent=register;depth.nextElementSibling.textContent=detail;
      formality.setAttribute('aria-valuetext',register);depth.setAttribute('aria-valuetext',detail);
      const dot=block.querySelector('[data-context-dot]');dot.style.left=`${formality.value}%`;dot.style.top=`${depth.value}%`;
      setText(block,block.querySelector('[data-context-style]'),`${register} · ${detail}`);status.textContent='';
    };
    on(form,'input',render);
    // The dot eases to a clicked point (CSS transition) but follows a drag directly.
    const plane=block.querySelector('.ps-tone-plane'), field=block.querySelector('.ps-tone-field');let dragging=false;
    const moveTone=event=>{const bounds=field.getBoundingClientRect();formality.value=Math.round(Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100)));depth.value=Math.round(Math.max(0,Math.min(100,(event.clientY-bounds.top)/bounds.height*100)));render();};
    on(plane,'pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;event.preventDefault();dragging=true;plane.setPointerCapture(event.pointerId);moveTone(event);});
    on(plane,'pointermove',event=>{if(dragging){plane.dataset.dragging='';moveTone(event);}});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])on(plane,event,()=>{dragging=false;delete plane.dataset.dragging;});
    on(form,'submit',event=>{event.preventDefault();try{const brief=prepareContextBrief(input.value,selected(),Number(formality.value),Number(depth.value));block.querySelector('[data-context-output]').value=brief.text;result.hidden=false;rise(block,result,4,'--settle',220);setText(block,status,'Brief prepared locally. No generated answer or message was sent.');emit(block,'context-brief',brief);}catch(error){setText(block,status,error.message);}});
    on(input,'keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)&&!event.isComposing){event.preventDefault();if(!prepare.disabled)form.requestSubmit();}});
    on(block.querySelector('[data-context-select]'),'click',()=>{const output=block.querySelector('[data-context-output]');output.focus();output.select();});
    on(block.querySelector('[data-context-reset]'),'click',()=>{form.reset();checks.forEach((c,i)=>c.checked=i<2);render();input.focus();});render();live.add(block);
  }

  for (const block of find('[data-ps-approval-inbox]')) {
    let states=initialApprovals(), selected='font', closing=null;const history=[];
    const filter=block.querySelector('[data-approval-filter]'), list=block.querySelector('[data-approval-list]'), panel=block.querySelector('[data-approval-detail]');
    const dialog=block.querySelector('dialog'), reason=block.querySelector('[data-approval-reason]'), status=block.querySelector('[data-approval-status]');
    const total=block.querySelector('[data-approval-total]');let pendingTotal=NaN;
    trackInput(block);
    const visible=()=>APPROVAL_REQUESTS.filter(r=>filter.value==='all'||(filter.value==='pending'?states[r.id].status==='pending':states[r.id].status!=='pending'));
    // A row that leaves the view collapses in place as an inert, hidden copy, so the rows below slide up rather than jump.
    const collapse=(row,before)=>{
      const ghost=node('div',undefined,'ps-request-ghost'),inner=node('div');ghost.setAttribute('aria-hidden','true');ghost.inert=true;row.tabIndex=-1;row.disabled=true;inner.append(row);ghost.append(inner);list.insertBefore(ghost,before);
      const settle=ms(block,'--settle',220),gap=parseFloat(win.getComputedStyle(list).rowGap)||0;
      const run=animate(block,ghost,[{gridTemplateRows:'1fr',opacity:1,marginBottom:'0px'},{gridTemplateRows:'0fr',opacity:0,marginBottom:`${-gap}px`}],settle,{fill:'forwards'});
      if(run)later(()=>{run.cancel();ghost.remove();},settle);else ghost.remove();
    };
    const render=()=>{
      const requests=visible();if(!requests.some(r=>r.id===selected))selected=requests[0]?.id||null;
      for(const ghost of list.querySelectorAll('.ps-request-ghost'))ghost.remove();
      const old=[...list.children],shown=new Map(old.map(b=>[b.dataset.request,b.querySelector('small').textContent])),wasSelected=old.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.request;
      list.replaceChildren();for(const r of requests){const button=node('button',undefined,'ps-request-row');button.type='button';button.dataset.request=r.id;button.setAttribute('aria-pressed',String(r.id===selected));
        const avatar=node('span',r.initials,'ps-product-avatar');avatar.setAttribute('aria-hidden','true');const info=node('span');info.append(node('strong',r.title),node('small',`${r.person} · ${states[r.id].status}`));button.append(avatar,info,node('span',money(r.amount),'ps-product-number'));list.append(button);
        if(!shown.has(r.id))rise(block,button);else if(shown.get(r.id)!==button.querySelector('small').textContent)rise(block,button.querySelector('small'),2);}
      if(!still(block))old.forEach((row,i)=>{if(requests.some(r=>r.id===row.dataset.request))return;const next=old.slice(i+1).map(b=>list.querySelector(`[data-request="${b.dataset.request}"]`)).find(Boolean)||null;collapse(row,next);});
      const empty=block.querySelector('[data-approval-empty]');if(empty.hidden&&!requests.length)rise(block,empty);empty.hidden=!!requests.length;panel.hidden=!selected;
      const pending=APPROVAL_REQUESTS.filter(r=>states[r.id].status==='pending'),sum=pending.reduce((n,r)=>n+r.amount,0);setText(block,block.querySelector('[data-approval-count]'),`${pending.length} pending`);roll(block,total,money(sum),pendingTotal,sum);pendingTotal=sum;
      // The breakdown meter: one cell per request in queue order, colored by its status; the key beside it states each count.
      const meter=block.querySelector('[data-approval-meter]'),key=block.querySelector('[data-approval-breakdown]');
      if(meter){meter.style.setProperty('--cells',String(APPROVAL_REQUESTS.length));meter.replaceChildren(...APPROVAL_REQUESTS.map(r=>{const cell=node('i');cell.dataset.status=states[r.id].status;if(r.id===selected)cell.dataset.focus='';return cell;}));}
      if(key){const counts=['pending','approved','returned'].map(s=>[s,APPROVAL_REQUESTS.filter(r=>states[r.id].status===s).length]);key.replaceChildren(...counts.map(([s,n])=>{const item=node('span'),swatch=node('i');swatch.dataset.status=s;item.append(swatch,doc.createTextNode(`${n} ${s}`));return item;}));}
      block.querySelector('[data-approval-undo]').disabled=!history.length;
      if(selected){const request=APPROVAL_REQUESTS.find(r=>r.id===selected),state=states[selected];block.querySelector('[data-approval-title]').textContent=request.title;block.querySelector('[data-approval-description]').textContent=request.detail;block.querySelector('[data-approval-person]').textContent=`${request.person} · ${request.team}`;block.querySelector('[data-approval-amount]').textContent=money(request.amount);block.querySelector('[data-approval-risk]').hidden=request.amount<=1500;
        reason.value=state.reason;reason.disabled=state.status!=='pending';reason.removeAttribute('aria-invalid');block.querySelector('[data-approval-approve]').disabled=state.status!=='pending';block.querySelector('[data-approval-return]').disabled=state.status!=='pending';
        const decision=block.querySelector('[data-approval-decision]'),text=state.status==='pending'?'Awaiting a sample decision':`Sample decision: ${state.status}`;
        if(wasSelected&&wasSelected!==selected){decision.textContent=text;rise(block,panel,2);}else setText(block,decision,text);}
    };
    const decide=action=>{
      try{const next=decideApproval(states,selected,action,reason.value);history.push({states,selected});states=next;setText(block,status,action==='approved'?'Sample request approved. Undo is available.':'Sample request returned with your reason. Undo is available.');render();emit(block,'approval',{states});return list.querySelector('[aria-pressed="true"]')||block.querySelector('[data-approval-undo]');}
      catch(error){setText(block,status,error.message);reason.setAttribute('aria-invalid','true');return reason;}
    };
    // The dialog grows from the button that opened it and shrinks back over --press before it closes; Escape closes at once.
    // A decision is applied before the dialog starts closing; only the focus move waits for the dialog to leave.
    const closeDialog=target=>{
      const press=ms(block,'--press',160),run=animate(block,dialog,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.97)'}],press,{fill:'forwards'});
      if(!run){dialog.close();target?.focus();return;}
      closing=later(()=>{closing=null;run.cancel();dialog.close();target?.focus();},press);
    };
    on(list,'click',event=>{const button=event.target.closest('[data-request]');if(button){selected=button.dataset.request;status.textContent='';render();list.querySelector('[aria-pressed="true"]').focus();}});
    on(filter,'change',()=>{status.textContent='';render();});
    on(block.querySelector('[data-approval-approve]'),'click',event=>{const r=APPROVAL_REQUESTS.find(r=>r.id===selected);block.querySelector('[data-approval-confirm-text]').textContent=`Approve ${r.title.toLowerCase()} for ${money(r.amount)} in this sample? No payment or external approval will occur.`;dialog.showModal();
      if(still(block))return;const from=event.currentTarget.getBoundingClientRect(),box=dialog.getBoundingClientRect();
      dialog.style.transformOrigin=`${Math.round(from.left+from.width/2-box.left)}px ${Math.round(from.top+from.height/2-box.top)}px`;
      animate(block,dialog,[{opacity:.72,transform:'scale(.97)'},{opacity:1,transform:'none'}],ms(block,'--settle',220));});
    on(dialog,'close',()=>{dialog.style.transformOrigin='';});
    on(block.querySelector('[data-approval-confirm]'),'click',()=>{if(!closing)closeDialog(decide('approved'));});on(block.querySelector('[data-approval-cancel]'),'click',()=>{if(!closing)closeDialog(null);});
    on(block.querySelector('[data-approval-return]'),'click',()=>decide('returned').focus());
    on(block.querySelector('[data-approval-undo]'),'click',()=>{if(!history.length)return;const previous=history.pop();states=previous.states;selected=previous.selected;filter.value='all';render();setText(block,status,'Last sample decision undone.');});
    on(block.querySelector('[data-approval-reset]'),'click',()=>{states=initialApprovals();history.length=0;selected='font';filter.value='pending';render();setText(block,status,'Sample inbox reset.');});render();live.add(block);
  }

  for(const block of find('[data-ps-release-planner]')) {
    const form=block.querySelector('form'), fields=block.querySelector('[data-release-fields]'), chart=block.querySelector('[data-release-chart]'),status=block.querySelector('[data-release-status]');
    const total=block.querySelector('[data-release-total]'),slack=block.querySelector('[data-release-slack]');let saved=RELEASE_PHASES.map(p=>p.days),days=NaN,plan=null,focus=null;
    trackInput(block);
    for(const phase of RELEASE_PHASES){const label=node('label',undefined,'ps-compact-field');label.append(node('span',phase.name));const input=node('input',undefined,'ps-input');input.type='number';input.min='1';input.max='7';input.step='1';input.required=true;input.value=phase.days;input.dataset.phase=phase.id;label.append(input,node('small','Calendar days'));fields.append(label);}
    const inputs=[...fields.querySelectorAll('input')],read=()=>inputs.map(x=>x.value===''?NaN:Number(x.value));
    const span=phase=>phase.days===1?`Day ${phase.end}`:`Day ${phase.start+1}–${phase.end}`;
    // The headline delta states its direction in arrow and words; color only repeats whether the plan holds.
    const paintSlack=(text,effect,icon)=>{const changed=slack.textContent!==text,parts=[doc.createTextNode(text)];if(icon){const i=node('i',undefined,`ps-i ps-i-${icon}`);i.setAttribute('aria-hidden','true');parts.unshift(i);}slack.replaceChildren(...parts);slack.dataset.effect=effect;slack.dataset.warning=String(effect==='bad');if(changed)rise(block,slack,2);};
    // The pinned tip restates the phase row (days, owner, dates) beside its bar; it reads the inspected row, else the chosen one.
    const tip=node('div',undefined,'ps-plot-tip');tip.setAttribute('aria-hidden','true');let inspected=null;
    const placeTip=()=>{
      const id=inspected||focus,phase=plan?.phases.find(p=>p.id===id),row=phase&&chart.querySelector(`.ps-release-row[data-phase="${id}"]`);if(!row){tip.hidden=true;return;}
      tip.hidden=false;const list=node('dl'),term=node('dt'),swatch=node('i');swatch.dataset.phase=phase.id;term.append(swatch,node('span','Duration'));
      list.append(term,node('dd',`${phase.days} ${phase.days===1?'day':'days'}`),node('dt','Owner'),node('dd',phase.owner),node('dt','Dates'),node('dd',span(phase)));tip.replaceChildren(node('strong',phase.name),list);
      const box=chart.getBoundingClientRect(),bar=row.querySelector('.ps-release-bar').getBoundingClientRect(),lane=row.getBoundingClientRect(),gap=12,width=tip.offsetWidth;
      const after=bar.right-box.left+gap+width<=box.width||bar.left-box.left-gap-width<0;
      tip.style.left=after?`${Math.round(bar.right-box.left+gap)}px`:`${Math.round(bar.left-box.left-gap-width)}px`;
      tip.style.top=`${Math.round(Math.max(0,Math.min(box.height-tip.offsetHeight,lane.top-box.top+(lane.height-tip.offsetHeight)/2)))}px`;
    };
    const choose=(id,moveFocus)=>{focus=id;chart.dataset.focus=id;for(const row of chart.querySelectorAll('.ps-release-row')){const on=row.dataset.phase===id;row.setAttribute('aria-pressed',String(on));row.tabIndex=on?0:-1;if(on&&moveFocus)row.focus();}placeTip();emit(block,'release-phase',{phase:id});};
    const render=()=>{
      try{plan=planRelease(read());}catch(error){plan=null;chart.hidden=true;total.textContent='—';days=NaN;paintSlack('Check durations','neutral',null);setText(block,status,error.message);return false;}
      const reappear=chart.hidden,motion=!still(block)&&!reappear,geometry=['left','width'];
      const before=motion?new Map([...chart.querySelectorAll('.ps-release-bar')].map(bar=>[bar.dataset.phase,drawn(bar,geometry)])):new Map();
      const deadlineBefore=motion&&chart.querySelector('.ps-release-deadline')?drawn(chart.querySelector('.ps-release-deadline'),['left']):null;
      if(!focus)focus=plan.phases.reduce((a,b)=>b.days>a.days?b:a).id;
      // The scale ends on a whole week at or past both the plan and the target; gridlines fall only on the labeled weeks.
      chart.hidden=false;chart.replaceChildren();const scale=Math.ceil(Math.max(plan.deadline,plan.total)/7)*7,at=day=>`${day/scale*100}%`,weeks=[];for(let day=0;day<=scale;day+=7)weeks.push(day);
      const head=node('div',undefined,'ps-release-head'),edge=node('div'),tag=node('span',`Target · day ${plan.deadline}`,'ps-release-tag');head.setAttribute('aria-hidden','true');tag.style.left=at(plan.deadline);if(plan.deadline/scale>.7)tag.dataset.edge='end';edge.append(tag);head.append(node('span'),edge);chart.append(head);
      for(const phase of plan.phases){
        const row=node('button',undefined,'ps-release-row'),label=node('span'),past=phase.end>plan.deadline;row.type='button';row.dataset.phase=phase.id;row.dataset.past=String(past);
        label.append(node('strong',phase.name),node('small',`${span(phase)} · ${phase.owner}${past?' · past target':''}`));
        const track=node('span',undefined,'ps-release-track');track.setAttribute('aria-hidden','true');
        for(const day of weeks){const line=node('i',undefined,'ps-release-grid');line.style.left=at(day);if(!day)line.dataset.zero='';track.append(line);}
        const bar=node('span',String(phase.days),'ps-release-bar');bar.style.left=at(phase.start);bar.style.width=at(phase.days);bar.dataset.phase=phase.id;
        const deadline=node('i',undefined,'ps-release-deadline');deadline.style.left=at(plan.deadline);track.append(bar,deadline);row.append(label,track);chart.append(row);
      }
      // Weeks are labeled once with their unit, later ones stay terse.
      const axis=node('div',undefined,'ps-release-axis'),ticks=node('div');axis.setAttribute('aria-hidden','true');axis.append(node('span'),ticks);
      for(const day of weeks){const tick=node('span',day?String(day):'Day 0');tick.style.left=at(day);if(day===scale&&day)tick.dataset.edge='end';ticks.append(tick);}chart.append(axis,tip);
      // Changed phases slide and stretch to their new span; the target marker moves when the scale does.
      for(const bar of chart.querySelectorAll('.ps-release-bar'))tween(block,bar,before.get(bar.dataset.phase),geometry);
      if(deadlineBefore)for(const deadline of chart.querySelectorAll('.ps-release-deadline'))tween(block,deadline,deadlineBefore,['left']);
      if(reappear)rise(block,chart,4,'--settle',220);choose(focus,false);
      roll(block,total,`${plan.total} days`,days,plan.total);days=plan.total;
      paintSlack(plan.slack<0?`${-plan.slack} days past target`:plan.slack===0?'At the target':`${plan.slack} days of buffer`,plan.slack<0?'bad':plan.slack===0?'neutral':'good',plan.slack<0?'up':plan.slack===0?'right':'down');
      setText(block,block.querySelector('[data-release-dirty]'),JSON.stringify(read())===JSON.stringify(saved)?'Saved locally':'Unsaved changes');status.textContent='';emit(block,'release-plan',plan);return true;
    };
    on(chart,'click',event=>{const row=event.target.closest('.ps-release-row');if(row)choose(row.dataset.phase,false);});
    on(chart,'keydown',event=>{const rows=[...chart.querySelectorAll('.ps-release-row')],i=rows.findIndex(r=>r.dataset.phase===focus);if(i<0)return;
      const next={ArrowDown:i+1,ArrowRight:i+1,ArrowUp:i-1,ArrowLeft:i-1,Home:0,End:rows.length-1}[event.key];if(next===undefined)return;event.preventDefault();choose(rows[Math.max(0,Math.min(rows.length-1,next))].dataset.phase,true);});
    on(chart,'pointerover',event=>{const row=event.target.closest('.ps-release-row');if(row&&row.dataset.phase!==inspected){inspected=row.dataset.phase;placeTip();}});
    on(chart,'pointerleave',()=>{if(inspected){inspected=null;placeTip();}});
    if(globalThis.ResizeObserver){const watch=new globalThis.ResizeObserver(()=>placeTip());watch.observe(chart);observers.add(watch);}
    on(form,'input',render);on(form,'submit',event=>{event.preventDefault();if(render()){saved=read();render();setText(block,status,'Plan saved in this demo. Dates represent sequential calendar days.');}});
    on(block.querySelector('[data-release-discard]'),'click',()=>{inputs.forEach((input,i)=>input.value=saved[i]);render();setText(block,status,'Saved durations restored.');});render();live.add(block);
  }

  for(const block of find('[data-ps-capacity-planner]')) {
    let saved=cloneRows(CAPACITY_INITIAL),matrix=cloneRows(saved),selected=0,assigned=NaN;
    const list=block.querySelector('[data-capacity-people]'), select=block.querySelector('[data-capacity-person]'), fields=block.querySelector('[data-capacity-fields]'),form=block.querySelector('form'),status=block.querySelector('[data-capacity-status]');
    const total=block.querySelector('[data-capacity-total]'),available=block.querySelector('[data-capacity-available]'),over=block.querySelector('[data-capacity-over]');
    trackInput(block);
    CAPACITY_PEOPLE.forEach((p,i)=>{const option=node('option',p.name);option.value=i;select.append(option);});
    CAPACITY_PROJECTS.forEach((project,i)=>{const label=node('label',undefined,'ps-compact-field');label.append(node('span',project+' · hours'));const input=node('input',undefined,'ps-input');input.type='number';input.min='0';input.max='40';input.step='1';input.required=true;input.dataset.project=i;label.append(input);fields.append(label);});
    const inputs=[...fields.querySelectorAll('input')],geometry=['left','width'];
    const render=(sync=false)=>{
      const motion=!still(block),old=motion?[...list.querySelectorAll('.ps-capacity-person')].map(row=>({over:row.dataset.over,segments:[...row.querySelectorAll('.ps-capacity-track span')].map(span=>drawn(span,geometry)),boundary:drawn(row.querySelector('.ps-capacity-track i'),['left']),room:drawn(row.querySelector('.ps-capacity-track b'),['width'])})):[];
      // One shared scale, so people compare directly: a round ten at or past the busiest person and the largest capacity.
      const summary=capacitySummary(matrix),top=Math.ceil(Math.max(...summary.people.map(p=>Math.max(p.capacity,p.assigned)))/10)*10,at=hours=>`${hours/top*100}%`;
      list.replaceChildren();list.dataset.focus=String(selected);
      summary.people.forEach((person,i)=>{
        const row=node('div',undefined,'ps-capacity-person');row.dataset.over=String(person.remaining<0);if(i===selected)row.dataset.selected='';
        const head=node('div',undefined,'ps-chart-caption');head.append(node('strong',person.name),node('span',`${person.assigned} / ${person.capacity} h${person.remaining<0?` · ${-person.remaining} h over`:''}`));
        // Hours fill the person's capacity project by project; anything past the capacity tick is one overflow segment.
        const track=node('div',undefined,'ps-capacity-track'),room=node('b');track.setAttribute('aria-hidden','true');room.style.width=at(person.capacity);track.append(room);
        let used=0;person.hours.forEach((hours,j)=>{const within=Math.max(0,Math.min(hours,person.capacity-used));const bar=node('span');bar.dataset.project=j;bar.style.left=at(used);bar.style.width=at(within);used+=within;track.append(bar);});
        const spill=node('span');spill.dataset.over='';spill.style.left=at(person.capacity);spill.style.width=at(Math.max(0,-person.remaining));track.append(spill);
        const boundary=node('i');boundary.style.left=at(person.capacity);track.append(boundary);
        const note=node('p',`${person.role} · ${person.remaining<0?`${-person.remaining} h over capacity`:`${person.remaining} h available`}`,'ps-note');row.append(head,track,note);list.append(row);
        // Segments re-flow to their new share; the capacity tick moves when the shared scale changes.
        const was=old[i];if(was){track.querySelectorAll('span').forEach((span,j)=>tween(block,span,was.segments[j],geometry));tween(block,boundary,was.boundary,['left']);tween(block,room,was.room,['width']);if(was.over!==row.dataset.over)rise(block,note,2);}});
      const scale=node('div',undefined,'ps-capacity-scale');scale.setAttribute('aria-hidden','true');
      for(let hours=0;hours<=top;hours+=10){const tick=node('span',hours===top?`${hours} h`:String(hours));tick.style.left=at(hours);if(!hours)tick.dataset.edge='start';else if(hours===top)tick.dataset.edge='end';else if((top-hours)%20)tick.dataset.minor='';scale.append(tick);}list.append(scale);
      const free=summary.people.reduce((n,p)=>n+Math.max(0,p.remaining),0);
      roll(block,total,`${summary.assigned} / ${summary.available} h`,assigned,summary.assigned);assigned=summary.assigned;setText(block,available,`${free} h`);
      setText(block,over,summary.overbooked===1?'1 person':`${summary.overbooked} people`);over.dataset.warning=String(summary.overbooked>0);
      const warning=block.querySelector('[data-capacity-warning]');setText(block,warning,summary.overbooked?`${summary.overbooked} ${summary.overbooked===1?'person is':'people are'} over capacity`:'Everyone is within capacity');warning.dataset.warning=String(summary.overbooked>0);
      block.querySelector('[data-capacity-save]').disabled=summary.overbooked>0;setText(block,block.querySelector('[data-capacity-dirty]'),JSON.stringify(matrix)===JSON.stringify(saved)?'Saved locally':'Unsaved changes');
      if(sync)inputs.forEach((input,i)=>input.value=matrix[selected][i]);emit(block,'capacity',summary);
    };
    const update=()=>{const row=inputs.map(input=>input.value===''?NaN:Number(input.value));const next=cloneRows(matrix);next[selected]=row;try{capacitySummary(next);}catch(error){setText(block,status,error.message);block.querySelector('[data-capacity-save]').disabled=true;return false;}matrix=next;status.textContent='';render();return true;};
    on(select,'change',()=>{if(!update()){select.value=selected;inputs.find(x=>!x.validity.valid)?.focus();return;}selected=Number(select.value);render(true);});
    for(const input of inputs)on(input,'input',update);
    on(form,'submit',event=>{event.preventDefault();if(!update())return;if(capacitySummary(matrix).overbooked){setText(block,status,'Resolve overbooked people before saving.');return;}saved=cloneRows(matrix);render();setText(block,status,'Allocation saved locally.');});
    on(block.querySelector('[data-capacity-discard]'),'click',()=>{matrix=cloneRows(saved);render(true);setText(block,status,'Saved allocation restored.');});render(true);live.add(block);
  }

  for(const block of find('[data-ps-permission-matrix]')) {
    let saved=ACCESS_RULES.map(r=>[...r.initial]),matrix=cloneRows(saved);
    const table=block.querySelector('[data-access-rows]'),status=block.querySelector('[data-access-status]');
    trackInput(block);
    ACCESS_RULES.forEach((rule,i)=>{const row=node('tr'),heading=node('th',rule.name);heading.scope='row';row.append(heading);ACCESS_ROLES.forEach((role,j)=>{const cell=node('td');cell.dataset.role=role;if(j===0){cell.append(node('span',rule.levels[2],'ps-access-fixed'));}else{const select=node('select',undefined,'ps-input');select.setAttribute('aria-label',`${rule.name}, ${role}`);select.dataset.capability=i;select.dataset.role=j;rule.levels.forEach((level,k)=>{if(j===2&&k>rule.guestMax)return;const option=node('option',level);option.value=k;select.append(option);});select.value=matrix[i][j];cell.append(select);}row.append(cell);});table.append(row);});
    const controls=[...table.querySelectorAll('select')];
    const render=()=>{let changed=0;matrix.forEach((row,i)=>row.forEach((level,j)=>{if(level!==saved[i][j])changed++;}));setText(block,block.querySelector('[data-access-dirty]'),changed?`${changed} unsaved ${changed===1?'change':'changes'}`:'Saved locally');
      // Each role's summary line keeps its element; only a line whose access changed rises.
      const summary=block.querySelector('[data-access-summary]');[['Member',1],['Guest',2]].forEach(([role,index],n)=>{const enabled=ACCESS_RULES.filter((_,i)=>matrix[i][index]>0).map((rule)=>rule.name.toLowerCase());let line=summary.children[n];if(!line){line=node('p');summary.append(line);}setText(block,line,`${role}: ${enabled.length?enabled.join(', '):'no access'}.`);});
      controls.forEach(select=>select.value=matrix[Number(select.dataset.capability)][Number(select.dataset.role)]);
    };
    on(table,'change',event=>{const select=event.target.closest('select');if(!select)return;const next=cloneRows(matrix);next[Number(select.dataset.capability)][Number(select.dataset.role)]=Number(select.value);try{matrix=validateAccess(next);status.textContent='';render();}catch(error){setText(block,status,error.message);render();}});
    on(block.querySelector('[data-access-save]'),'click',()=>{saved=validateAccess(matrix);render();setText(block,status,'Sample permissions saved locally. No account access changed.');emit(block,'access',{matrix:cloneRows(saved)});});
    on(block.querySelector('[data-access-discard]'),'click',()=>{matrix=cloneRows(saved);render();setText(block,status,'Saved permissions restored.');});render();live.add(block);
  }

  for(const block of find('[data-ps-revision-compare]')) {
    let selected=0,decisions=['pending','pending','pending'],shown=0,shownDecisions=[...decisions];const tabs=block.querySelector('[data-revision-sections]'),result=block.querySelector('[data-revision-result]'),status=block.querySelector('[data-revision-status]');
    trackInput(block);
    const render=()=>{
      tabs.replaceChildren();REVISION_SECTIONS.forEach((section,i)=>{const button=node('button',undefined,'ps-revision-section');button.type='button';button.dataset.section=i;button.setAttribute('aria-pressed',String(i===selected));const state=node('small',decisions[i]);button.append(node('strong',section.title),state);tabs.append(button);if(decisions[i]!==shownDecisions[i])rise(block,state,2);});
      const section=REVISION_SECTIONS[selected],diff=revisionWindow(section.before,section.after);for(const [key,change,tag]of [['before',diff.removed,'del'],['after',diff.added,'ins']]){const paragraph=block.querySelector(`[data-revision-${key}]`);paragraph.replaceChildren(doc.createTextNode(diff.prefix));if(change)paragraph.append(node(tag,change));paragraph.append(doc.createTextNode(diff.suffix));
        // A new section's text nudges in from the side of the section it replaced.
        if(selected!==shown)animate(block,paragraph,[{opacity:.72,transform:`translateX(${Math.sign(selected-shown)*4}px)`},{opacity:1,transform:'none'}],ms(block,'--press',160));}
      block.querySelector('[data-revision-title]').textContent=section.title;const decision=block.querySelector('[data-revision-decision]'),line=`This change is ${decisions[selected]}.`;if(selected!==shown)decision.textContent=line;else setText(block,decision,line);
      const completed=decisions.filter(d=>d!=='pending').length;setText(block,block.querySelector('[data-revision-count]'),`${completed} of 3 reviewed`);block.querySelector('[data-revision-progress]').value=completed;block.querySelector('[data-revision-assemble]').disabled=completed!==3;result.hidden=true;block.querySelector('[data-revision-output]').value='';shown=selected;shownDecisions=[...decisions];emit(block,'revision',{selected,decisions:[...decisions]});
    };
    on(tabs,'click',event=>{const button=event.target.closest('[data-section]');if(button){selected=Number(button.dataset.section);render();tabs.querySelector('[aria-pressed="true"]').focus();}});
    for(const [selector,decision]of [['accept','accepted'],['reject','rejected'],['reopen','pending']])on(block.querySelector(`[data-revision-${selector}]`),'click',()=>{decisions[selected]=decision;setText(block,status,decision==='pending'?'Change reopened.':`Change ${decision}. You can reopen it.`);render();});
    on(block.querySelector('[data-revision-assemble]'),'click',()=>{block.querySelector('[data-revision-output]').value=assembleRevision(decisions);result.hidden=false;rise(block,result,4,'--settle',220);setText(block,status,'Reviewed draft assembled locally.');});
    on(block.querySelector('[data-revision-select]'),'click',()=>{const output=block.querySelector('[data-revision-output]');output.focus();output.select();});
    on(block.querySelector('[data-revision-reset]'),'click',()=>{selected=0;decisions=['pending','pending','pending'];render();setText(block,status,'All changes reopened.');});render();live.add(block);
  }
  return () => {
    controller.abort();
    for (const [id, fn] of pending) { clearTimeout(id); fn(); }
    pending.clear(); for (const run of running) run.cancel(); running.clear();
    for (const watch of observers) watch.disconnect(); observers.clear();
  };
}

function spendingErrors(value){
 const errors={};if(!Number.isInteger(value.monthly)||value.monthly<100||value.monthly>10000)errors.monthly='Monthly limit must be $100–$10,000 in whole dollars.';
 if(!Number.isInteger(value.transaction)||value.transaction<1||value.transaction>value.monthly)errors.transaction='Per-transaction limit must be positive and no greater than the monthly limit.';
 if(!['virtual','physical'].includes(value.type))errors.type='Choose a card type.';
 if(!Array.isArray(value.categories)||!value.categories.length||value.categories.some(c=>!['Software','Travel','Ads','Meals','Hardware'].includes(c)))errors.categories='Select at least one supported merchant category.';
 return errors;
}
const TEMPLATE_VALUES={name:'Maya',company:'Northstar',role:'Product designer'};
function renderTemplate(source,values=TEMPLATE_VALUES){
 if(typeof source!=='string'||source.length>1000)throw new Error('Template must be at most 1,000 characters');
 const unknown=new Set();const text=source.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,(match,key)=>{if(!Object.hasOwn(values,key)){unknown.add(key);return match;}return String(values[key]);});
 if(/[{}]/.test(text)&&unknown.size===0)unknown.add('unclosed variable');return {text,unknown:[...unknown]};
}
function shortcutFromEvent(event){
 if(['Control','Meta','Alt','Shift'].includes(event.key))return {pending:true};
 if(event.key==='Escape')return {cancel:true};
 if(!event.ctrlKey&&!event.metaKey&&!event.altKey)return {error:'Include Control, Command, or Alt with a letter or number.'};
 if(!/^[a-z0-9]$/i.test(event.key))return {error:'Choose a letter or number after your modifier keys.'};
 const key=event.key.toUpperCase(),parts=[event.ctrlKey?'Ctrl':null,event.metaKey?'Meta':null,event.altKey?'Alt':null,event.shiftKey?'Shift':null,key].filter(Boolean);
 if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&['L','T','W','R','N','Q','K'].includes(key))return {error:'That combination is reserved in this demo. Try adding Shift or choosing another key.'};
 return {chord:parts.join('+')};
}
const EASING_PRESETS={standard:[0.42,0,0.58,1],enter:[0.16,1,0.3,1],exit:[0.7,0,0.84,0],linear:[0,0,1,1]};
function easingCurve(points){
 if(!Array.isArray(points)||points.length!==4||points.some(v=>!Number.isFinite(v)||v<0||v>1))throw new Error('Four control values between zero and one are required');
 const [x1,y1,x2,y2]=points;return {path:`M 40 240 C ${40+x1*320} ${240-y1*200}, ${40+x2*320} ${240-y2*200}, 360 40`,css:`cubic-bezier(${points.map(n=>Number(n.toFixed(2))).join(', ')})`};
}
/* Spend against a monthly limit, read as a unit meter: `cells` equal shares of the limit, the share expected by today
   (even spend across the month), and what is left per remaining day. Pure; amounts are whole dollars. */
function spendingPace({limit,spent,day,days,cells=40}){
 if(![limit,spent,day,days,cells].every(Number.isFinite)||limit<=0||spent<0||days<1||day<1||day>days||cells<1)throw new Error('Spending pace needs a positive limit, spend of zero or more and a day within the month');
 const expected=limit*day/days,daysLeft=days-day,left=limit-spent;
 const status=spent>limit?'over-limit':spent>expected?'over':'on';
 const on=Math.min(cells,Math.round(spent/limit*cells)),pace=Math.round(day/days*cells);
 return {status,expected:Math.round(expected),left,daysLeft,perDay:left>0&&daysLeft>0?Math.floor(left/daysLeft):0,share:Math.round(spent/limit*100),pacePercent:day/days*100,cells:Array.from({length:cells},(_,i)=>({on:i<on,over:i<on&&(status==='over-limit'||i>=pace)}))};
}

function enhanceToolComponents(root){
 const doc=root.ownerDocument||root,win=doc.defaultView,controller=new win.AbortController(),cleanups=[];
 const find=s=>[...(root.matches?.(s)?[root]:[]),...root.querySelectorAll(s)],on=(el,type,fn)=>el.addEventListener(type,fn,{signal:controller.signal});
 const emit=(b,name,detail)=>b.dispatchEvent(new win.CustomEvent('pagesystem:'+name,{bubbles:true,detail}));
 /* Motion is presentation only: the DOM is written in its final state first, then a short Web Animation plays from
    the previous look back to that state. Reduced motion and keyboard-initiated changes skip it. Scheduling uses this
    module's realm (the global IntersectionObserver), never the specimen frame's window, which may be sandboxed. */
 const EASE_OUT='cubic-bezier(.22,1,.36,1)',running=new Set(),observers=new Set();let keyboard=false;
 const reduced=()=>!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const still=()=>keyboard||reduced()||!!doc.activeElement?.matches?.(':focus-visible');
 const ms=(name,fallback)=>parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue(name))||fallback;
 const halt=el=>{for(const run of el.getAnimations?.()??[])run.cancel();};
 const play=(el,frames,duration,options={})=>{if(!el?.animate)return null;const run=el.animate(frames,{duration,easing:EASE_OUT,...options});running.add(run);const done=()=>running.delete(run);run.finished.then(done,done);return run;};
 // A changed message or label rises 4px from 72% opacity, so its contrast holds at every frame.
 const rise=(el,move)=>{if(!move||!el)return;halt(el);play(el,[{opacity:.72,transform:'translateY(4px)'},{opacity:1,transform:'none'}],ms('--press',160));};
 const settleText=(el,text,move)=>{if(!el||el.textContent===text)return;el.textContent=text;rise(el,move);};
 on(doc,'keydown',()=>{keyboard=true;});on(doc,'pointerdown',()=>{keyboard=false;});
 for(const b of find('[data-ps-spending-controls]')){
  const form=b.querySelector('form'),field=n=>form.elements.namedItem(n),categories=[...form.querySelectorAll('[name="category"]')],range=b.querySelector('[data-spend-range]'),status=b.querySelector('[data-spend-status]');
  const total=b.querySelector('[data-spend-total]'),type=b.querySelector('[data-spend-type]'),dirty=b.querySelector('[data-spend-dirty]'),delta=b.querySelector('[data-spend-delta]');
  const meter=b.querySelector('[data-spend-meter]'),units=meter?[...meter.querySelectorAll('[data-spend-units] > i')]:[],pace=b.querySelector('[data-spend-pace]'),budget=b.querySelector('[data-spend-budget]');
  const month={spent:Number(b.dataset.spendSpent),day:Number(b.dataset.spendDay),days:Number(b.dataset.spendDays)},usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const read=()=>({type:field('type').value,monthly:field('monthly').value===''?NaN:Number(field('monthly').value),transaction:field('transaction').value===''?NaN:Number(field('transaction').value),categories:categories.filter(c=>c.checked).map(c=>c.value),online:field('online').checked,international:field('international').checked});let saved=read(),shown=saved.monthly;
  // The headline figure rolls in from the side it moved toward: up when the limit rises, down when it falls. Dragging
  // the range is direct manipulation, so the figure follows the thumb without a tween.
  const roll=(from,to)=>{if(!Number.isFinite(from)||!Number.isFinite(to)||from===to)return;const up=to>from;halt(total);play(total,[{transform:`translateY(${up?'':'-'}.3em)`,clipPath:up?'inset(0 0 30% 0)':'inset(30% 0 0 0)'},{transform:'none',clipPath:'inset(0)'}],ms('--settle',220));};
  const icon=name=>{const el=doc.createElement('i');el.className=`ps-i ps-i-${name}`;el.setAttribute('aria-hidden','true');return el;};
  // The delta pill compares the draft limit with the saved one, so it shows only while the limit is unsaved. Arrow and
  // sign carry the direction; a higher limit is not better or worse, so the pill stays neutral.
  const showDelta=(limit,valid)=>{if(!delta)return;const change=valid?limit-saved.monthly:0;delta.hidden=!change;if(!change)return;delta.dataset.trend=change>0?'up':'down';delta.replaceChildren(icon(change>0?'up':'down'),`${change>0?'+':'−'}${usd(Math.abs(change))} from saved`);};
  // Spent this month is fixed sample data; the meter re-reads it against the draft limit so a lower limit shows its
  // effect before it is saved. Status is said in words with an icon, never by the danger color alone.
  const showMeter=(limit,valid)=>{if(!meter)return;if(!valid){for(const cell of units){delete cell.dataset.on;delete cell.dataset.over;}pace.hidden=true;budget.textContent='Enter a limit from $100 to $10,000';meter.querySelector('[data-spend-units]').setAttribute('aria-label','No meter until the monthly limit is between $100 and $10,000.');return;}
   const r=spendingPace({limit,...month,cells:units.length}),words={on:'On pace','over':'Over pace','over-limit':'Over limit'}[r.status];
   r.cells.forEach((cell,i)=>{units[i].toggleAttribute('data-on',cell.on);units[i].toggleAttribute('data-over',cell.over);});
   meter.querySelector('[data-spend-share]').textContent=`${r.share}% of ${usd(limit)}`;meter.querySelector('[data-spend-expected]').textContent=usd(r.expected);
   meter.querySelector('[data-spend-units]').setAttribute('aria-label',`${usd(month.spent)} spent of ${usd(limit)}, ${r.share}%. Expected by day ${month.day} of ${month.days}: ${usd(r.expected)}. ${words}.`);
   pace.hidden=false;pace.dataset.status=r.status;if(pace.lastChild?.textContent!==words){pace.replaceChildren(icon(r.status==='on'?'check':'kpi-alert'),words);}
   budget.textContent=r.status==='over-limit'?`${usd(-r.left)} over this limit · purchases decline until it resets`:r.daysLeft?`${usd(r.left)} left · ${usd(r.perDay)} a day for ${r.daysLeft} ${r.daysLeft===1?'day':'days'}`:`${usd(r.left)} left · resets tomorrow`;};
  const render=(move=false)=>{const value=read(),valid=Number.isFinite(value.monthly)&&value.monthly>=100&&value.monthly<=10000,before=shown;range.value=String(valid?value.monthly:100);shown=valid?value.monthly:NaN;total.textContent=valid?usd(value.monthly):'Check limit';if(move)roll(before,shown);
   const kind=value.type==='physical'?'Physical card':'Virtual card';if(type.textContent!==kind){type.textContent=kind;if(move)play(type,[{opacity:.72},{opacity:1}],ms('--press',160));}
   showDelta(value.monthly,valid);showMeter(value.monthly,valid);settleText(dirty,JSON.stringify(value)===JSON.stringify(saved)?'Saved locally':'Unsaved changes',move);};
  on(range,'input',()=>{field('monthly').value=range.value;render();});on(form,'input',e=>{if(e.target!==range)render(!still());});
  on(form,'submit',e=>{e.preventDefault();const move=!still(),value=read(),errors=spendingErrors(value);for(const name of ['monthly','transaction','type'])field(name).setAttribute('aria-invalid',String(!!errors[name]));for(const c of categories)c.setAttribute('aria-invalid',String(!!errors.categories));if(Object.keys(errors).length){status.textContent=Object.values(errors).join(' ');rise(status,move);const first=Object.keys(errors)[0];(first==='categories'?categories[0]:field(first)).focus();return;}saved={...value,categories:[...value.categories]};render(move);status.textContent='Controls saved locally. No card was created or changed.';rise(status,move);emit(b,'spending',saved);});
  on(b.querySelector('[data-spend-discard]'),'click',()=>{const move=!still();for(const name of ['type','monthly','transaction']){field(name).value=saved[name];field(name).removeAttribute('aria-invalid');}for(const name of ['online','international'])field(name).checked=saved[name];for(const c of categories){c.checked=saved.categories.includes(c.value);c.removeAttribute('aria-invalid');}render(move);status.textContent='Saved controls restored.';rise(status,move);});render();
 }
 for(const b of find('[data-ps-template-editor]')){
  const input=b.querySelector('textarea'),output=b.querySelector('[data-template-output]'),status=b.querySelector('[data-template-status]'),save=b.querySelector('[data-template-save]'),dirty=b.querySelector('[data-template-dirty]');let saved=input.value;
  // Typing is keyboard input and stays still; a pointer insert, save or discard crossfades the preview from 72%.
  const render=(move=false)=>{const result=renderTemplate(input.value),changed=output.textContent!==result.text;output.textContent=result.text;if(move&&changed){halt(output);play(output,[{opacity:.72},{opacity:1}],ms('--press',160));}b.querySelector('[data-template-count]').textContent=`${input.value.length} / 1,000`;input.setAttribute('aria-invalid',String(result.unknown.length>0));settleText(status,result.unknown.length?`Resolve these variables: ${result.unknown.join(', ')}.`:'All variables resolved using the sample record.',move);save.disabled=result.unknown.length>0||!input.value.trim();settleText(dirty,input.value===saved?'Saved locally':'Unsaved changes',move);emit(b,'template',result);};
  on(input,'input',()=>render());for(const button of b.querySelectorAll('[data-template-variable]'))on(button,'click',()=>{const move=!still(),token='{{'+button.dataset.templateVariable+'}}',start=input.selectionStart,end=input.selectionEnd;if(input.value.length-(end-start)+token.length>1000){settleText(status,'This variable would exceed 1,000 characters.',move);return;}input.setRangeText(token,start,end,'end');input.focus();render(move);});
  on(save,'click',()=>{const move=!still();if(!save.disabled){saved=input.value;render(move);settleText(status,'Template saved in this demo.',move);}});on(b.querySelector('[data-template-discard]'),'click',()=>{const move=!still();input.value=saved;render(move);settleText(status,'Saved template restored.',move);});render();
 }
 for(const b of find('[data-ps-shortcut-recorder]')){
  const capture=b.querySelector('[data-shortcut-capture]'),keys=b.querySelector('[data-shortcut-keys]'),status=b.querySelector('[data-shortcut-status]'),dirty=b.querySelector('[data-shortcut-dirty]');let saved='Ctrl+Shift+J',draft=saved,armed=false,shownChord;
  // Capturing a chord is keyboard input, so the keycaps change in place. A pointer restore lifts them in 24ms apart,
  // and arming by pointer draws the listening ring outward from the button edge.
  const show=(move=false)=>{const changed=shownChord!==undefined&&shownChord!==draft,wasArmed=capture.getAttribute('aria-pressed')==='true';shownChord=draft;keys.replaceChildren();for(const key of draft.split('+')){const el=doc.createElement('kbd');el.textContent=key==='Meta'?'Command':key;keys.append(el);}
   if(move&&changed)[...keys.children].forEach((el,i)=>play(el,[{opacity:.72,transform:'translateY(4px)'},{opacity:1,transform:'none'}],ms('--press',160),{delay:i*24,fill:'backwards'}));
   capture.textContent=armed?'Listening · press Escape to cancel':'Record shortcut';capture.setAttribute('aria-pressed',String(armed));
   if(move&&armed&&!wasArmed){const ring=win.getComputedStyle(capture);play(capture,[{outlineOffset:'0px',outlineColor:'transparent'},{outlineOffset:ring.outlineOffset,outlineColor:ring.outlineColor}],ms('--press',160));}
   b.querySelector('[data-shortcut-save]').disabled=armed;settleText(dirty,draft===saved?'Saved locally':'Unsaved shortcut',move);};
  on(capture,'click',()=>{const move=!still();armed=!armed;settleText(status,armed?'Press a modifier and a letter or number while this control is focused.':'Recording canceled.',move);show(move);});
  on(capture,'keydown',e=>{if(!armed||e.key==='Tab')return;e.stopPropagation();e.preventDefault();const result=shortcutFromEvent(e);if(result.pending)return;if(result.cancel){armed=false;status.textContent='Recording canceled.';}else if(result.error){status.textContent=result.error;}else {draft=result.chord;armed=false;status.textContent='Shortcut captured. Save it to test below.';}show();});
  on(capture,'blur',()=>{if(armed){armed=false;status.textContent='Recording canceled when focus left the control.';show();}});
  on(b.querySelector('[data-shortcut-save]'),'click',()=>{const move=!still();saved=draft;settleText(status,'Shortcut saved locally. It works only in the test field below.',move);show(move);emit(b,'shortcut',{chord:saved});});
  on(b.querySelector('[data-shortcut-reset]'),'click',()=>{const move=!still();draft=saved;armed=false;settleText(status,'Saved shortcut restored.',move);show(move);});let runs=0;
  on(b.querySelector('[data-shortcut-test]'),'keydown',e=>{const result=shortcutFromEvent(e);if(result.chord===saved){e.preventDefault();e.stopPropagation();runs++;b.querySelector('[data-shortcut-runs]').textContent=`Shortcut recognized ${runs} ${runs===1?'time':'times'}.`;}});show();
 }
 for(const b of find('[data-ps-easing-editor]')){
  const preset=b.querySelector('[data-ease-preset]'),inputs=[...b.querySelectorAll('[data-ease-point]')],curve=b.querySelector('[data-ease-curve]'),dot=b.querySelector('[data-ease-dot]'),track=b.querySelector('[data-ease-track]'),status=b.querySelector('[data-ease-status]');let animation;
  const read=()=>inputs.map(x=>Number(x.value));let shownPoints=read();
  const stop=()=>{animation?.cancel();animation=undefined;};
  const point=([x1,y1,x2,y2])=>[[40+x1*320,240-y1*200],[40+x2*320,240-y2*200]],anchors=[[40,240],[360,40]];
  // A pointer-chosen preset re-flows the plot: the curve tweens its path, each control point slides from where it was,
  // and each handle line pivots on its fixed anchor so its free end tracks the moving point. Dragging a range is direct
  // manipulation and stays still, as does any keyboard change.
  const reflow=(from,to)=>{const duration=ms('--settle',220),[was,now]=[point(from),point(to)],marks=[curve,...b.querySelectorAll('[data-ease-first],[data-ease-second],[data-ease-first-line],[data-ease-second-line]')];marks.forEach(halt);
   play(curve,[{d:`path("${easingCurve(from).path}")`},{d:`path("${easingCurve(to).path}")`}],duration);
   ['first','second'].forEach((key,i)=>{const [ox,oy]=was[i],[nx,ny]=now[i],[ax,ay]=anchors[i],length=Math.hypot(nx-ax,ny-ay);if(ox===nx&&oy===ny)return;
    play(b.querySelector(`[data-ease-${key}]`),[{transform:`translate(${ox-nx}px,${oy-ny}px)`},{transform:'none'}],duration);
    if(length<1)return;const frames=[];
    for(let k=0;k<=6;k++){const t=k/6,px=ox+(nx-ox)*t,py=oy+(ny-oy)*t,turn=(Math.atan2(py-ay,px-ax)-Math.atan2(ny-ay,nx-ax))*180/Math.PI;frames.push({transformOrigin:`${ax}px ${ay}px`,transform:`rotate(${turn.toFixed(3)}deg) scale(${(Math.hypot(px-ax,py-ay)/length).toFixed(4)})`});}
    play(b.querySelector(`[data-ease-${key}-line]`),frames,duration);});};
  const render=(move=false)=>{stop();const points=read(),result=easingCurve(points),before=shownPoints;shownPoints=points;curve.setAttribute('d',result.path);b.querySelector('[data-ease-code]').textContent=result.css;const [x1,y1,x2,y2]=points;for(const [key,x,y]of [['first',40+x1*320,240-y1*200],['second',40+x2*320,240-y2*200]]){b.querySelector(`[data-ease-${key}]`).setAttribute('cx',x);b.querySelector(`[data-ease-${key}]`).setAttribute('cy',y);const line=b.querySelector(`[data-ease-${key}-line]`);line.setAttribute('x2',x);line.setAttribute('y2',y);}inputs.forEach(input=>{input.nextElementSibling.textContent=Number(input.value).toFixed(2);});if(move&&before.some((v,i)=>v!==points[i]))reflow(before,points);status.textContent='Curve updated. Preview uses 240 milliseconds.';emit(b,'easing',{points,css:result.css});};
  on(preset,'change',()=>{if(preset.value==='custom')return;const move=!still();inputs.forEach((el,i)=>el.value=EASING_PRESETS[preset.value][i]);render(move);});for(const input of inputs)on(input,'input',()=>{preset.value='custom';render();});
  // The preview is the component's own content, so it runs on request with the chosen curve. It also plays once,
  // silently, the first time the track scrolls into view; Preview motion is its replay.
  const preview=announce=>{stop();const distance=Math.max(0,track.clientWidth-dot.offsetWidth);animation=dot.animate([{transform:'translateX(0)'},{transform:`translateX(${distance}px)`}],{duration:240,easing:easingCurve(read()).css,fill:'forwards'});if(!announce)return;status.textContent='Preview running for 240 milliseconds.';animation.onfinish=()=>{status.textContent='Preview complete. Run it again to compare.';};};
  on(b.querySelector('[data-ease-preview]'),'click',()=>{stop();if(reduced()){status.textContent='Preview stays still because reduced motion is enabled. The curve and values remain available.';return;}preview(true);});cleanups.push(stop);render();
  if(!reduced()&&typeof IntersectionObserver==='function'){const watch=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;watch.disconnect();observers.delete(watch);if(!animation&&!reduced())preview(false);},{threshold:.6});watch.observe(track);observers.add(watch);}
 }
 return()=>{controller.abort();cleanups.forEach(fn=>fn());for(const run of running)run.cancel();running.clear();for(const watch of observers)watch.disconnect();observers.clear();};
}

// Synthetic fixtures and bounded, deterministic workflow transforms.
const CASE_EVENTS = [
 {time:'09:12',title:'Invoice link opened',source:'Email',detail:'A sample message linked to an unrecognized sign-in page.',kind:'email'},
 {time:'09:14',title:'MFA request approved',source:'Identity',detail:'A push request was accepted outside the usual session.',kind:'identity'},
 {time:'09:15',title:'New device signed in',source:'Identity',detail:'The session has no previously trusted device record.',kind:'identity'},
 {time:'09:21',title:'Access key created',source:'Cloud',detail:'A new key was issued for the sample production account.',kind:'cloud'},
 {time:'09:24',title:'Archive downloaded',source:'Endpoint',detail:'The sample session downloaded a 2.1 GB archive.',kind:'endpoint'}
];
function caseTransition(state,action){
 if(!['investigating','contained','closed'].includes(state))throw new Error('Invalid case state');
 if(action==='reset')return 'investigating';
 if(action==='contain'&&state==='investigating')return 'contained';
 if(action==='close'&&state==='contained')return 'closed';
 throw new Error('Case transition is not allowed');
}
const DEPENDENCY_NODES = [
 ['api','Public API','Service','Degraded','Requests are waiting on the billing queue.'],
 ['auth','Identity','Service','Healthy','Token validation is operating normally.'],
 ['billing','Billing','Service','Degraded','Queue latency is above the sample threshold.'],
 ['search','Search','Service','Healthy','Search requests are within their target.'],
 ['events','Event bus','Queue','At risk','The retry backlog could delay downstream jobs.'],
 ['keys','Key store','Database','Healthy','Credentials are available.'],
 ['ledger','Ledger','Database','At risk','Writes depend on billing recovery.'],
 ['mail','Mail worker','Worker','Healthy','No affected deliveries in this sample.'],
 ['index','Search index','Database','Healthy','The current index is available.'],
 ['webhooks','Webhooks','Worker','At risk','Retries are waiting on the event bus.'],
 ['archive','Archive','Database','Healthy','Historical events are readable.']
].map(([id,name,type,status,detail])=>({id,name,type,status,detail}));
const DEPENDENCY_EDGES=[['api','auth'],['api','billing'],['api','search'],['api','events'],['auth','keys'],['billing','ledger'],['billing','mail'],['search','index'],['events','webhooks'],['events','archive']];
function reachableNodes(nodes,edges,start,hops){
 if(![1,2].includes(hops)||nodes.length>16||edges.length>24)throw new Error('Invalid graph bounds');
 const ids=new Set(nodes.map(n=>n.id));if(!ids.has(start)||ids.size!==nodes.length)throw new Error('Invalid graph root or IDs');
 const neighbors=new Map(nodes.map(n=>[n.id,[]]));for(const [a,b]of edges){if(!ids.has(a)||!ids.has(b))throw new Error('Unknown graph node');neighbors.get(a).push(b);neighbors.get(b).push(a);}
 const distance=new Map([[start,0]]),queue=[start];for(let i=0;i<queue.length;i++){const id=queue[i];if(distance.get(id)>=hops)continue;for(const next of neighbors.get(id))if(!distance.has(next)){distance.set(next,distance.get(id)+1);queue.push(next);}}
 return nodes.filter(n=>distance.has(n.id)).map(n=>({...n,depth:distance.get(n.id)}));
}
const INITIAL_SEQUENCE=[{id:1,title:'Quick introduction',channel:'Email',delay:0},{id:2,title:'Connection note',channel:'LinkedIn',delay:2},{id:3,title:'Follow up',channel:'Email',delay:3}];
function sequenceDays(steps){
 if(!Array.isArray(steps)||steps.length<1||steps.length>6||new Set(steps.map(s=>s.id)).size!==steps.length)throw new Error('Use one to six uniquely identified steps');
 let day=0;return steps.map(s=>{if(!Number.isInteger(s.id)||typeof s.title!=='string'||!s.title.trim()||s.title.length>60||!['Email','LinkedIn'].includes(s.channel)||!Number.isInteger(s.delay)||s.delay<0||s.delay>30)throw new Error('Each step needs a title, channel and a delay of 0–30 days');day+=s.delay;return {...s,day};});
}
function scheduleErrors(value){
 const errors={};if(!['email','linkedin','both'].includes(value.channel))errors.channel='Choose a supported channel.';
 const cap=value.channel==='email'?100:40;
 if(!Number.isInteger(value.limit)||value.limit<1||value.limit>cap)errors.limit=`Choose a daily limit from 1 to ${cap}.`;
 if(!Array.isArray(value.days)||value.days.some(d=>!Number.isInteger(d)||d<0||d>6)||new Set(value.days).size!==value.days.length||value.enabled&&value.days.length===0)errors.days='Choose at least one operating day.';
 const minutes=text=>typeof text==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(text)?Number(text.slice(0,2))*60+Number(text.slice(3)):NaN;
 if(!Number.isFinite(minutes(value.start)))errors.start='Enter a start time.';
 if(!Number.isFinite(minutes(value.end))||minutes(value.end)<=minutes(value.start))errors.end='End time must be later on the same day.';
 return errors;
}

function enhanceWorkflowComponents(root){
 const doc=root.ownerDocument||root,win=doc.defaultView,controller=new win.AbortController();
 const find=s=>[...(root.matches?.(s)?[root]:[]),...root.querySelectorAll(s)],on=(el,type,fn)=>el.addEventListener(type,fn,{signal:controller.signal});
 const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const emit=(block,name,detail)=>block.dispatchEvent(new win.CustomEvent('pagesystem:'+name,{bubbles:true,detail}));

 /* Motion is presentation only: every handler writes the final DOM first, then may ease into it.
    Timers, frames and observers come from this module's realm, because a docs preview frame is sandboxed
    without scripts and blocks callbacks scheduled through its own window. Element.animate() is safe there.
    Nothing animates under reduced motion, on a block's first render, or after a key press (data-still). */
 const reduceQuery=win.matchMedia?.('(prefers-reduced-motion: reduce)'),reduced=()=>!!reduceQuery?.matches;
 const rootStyle=win.getComputedStyle(doc.documentElement);
 const token=(name,fallback)=>{const v=rootStyle.getPropertyValue(name).trim(),n=parseFloat(v);return Number.isFinite(n)?(/\ds$/.test(v)?n*1000:n):fallback;};
 const PRESS=token('--press',160),SETTLE=token('--settle',220),EASE=rootStyle.getPropertyValue('--ease-out').trim()||'cubic-bezier(.22,1,.36,1)';
 const animations=new Set(),timers=new Set(),observers=new Set(),ghosts=new Set(),finishers=new Set(),ready=new WeakSet();
 const later=(fn,delay)=>{const id=setTimeout(()=>{timers.delete(id);fn();},delay);timers.add(id);return id;};
 const clearLater=id=>{if(id){clearTimeout(id);timers.delete(id);}};
 // run() checks only reduced motion (used by autoplay); play() also skips first renders and keyboard-initiated changes.
 const run=(el,frames,options)=>{if(!el||reduced()||typeof el.animate!=='function')return null;let a;try{a=el.animate(frames,{easing:EASE,...options});}catch{return null;}animations.add(a);const drop=()=>animations.delete(a);a.addEventListener('finish',drop);a.addEventListener('cancel',drop);return a;};
 const moving=block=>ready.has(block)&&!reduced()&&!block.hasAttribute('data-still');
 const play=(block,el,frames,duration,options)=>moving(block)?run(el,frames,{duration,...options}):null;
 const trackInput=block=>{on(block,'pointerdown',()=>block.removeAttribute('data-still'));on(block,'keydown',()=>block.setAttribute('data-still',''));};
 // Changed text rises briefly from a readable opacity, so contrast holds on every frame.
 const RISE=[{opacity:.72,transform:'translateY(3px)'},{opacity:1,transform:'none'}];
 const say=(block,el,text,force=false)=>{if(el.textContent===text&&!force)return;el.textContent=text;if(text)play(block,el,RISE,PRESS);};
 // Changed counts roll under a clip in the direction they moved; the glyphs never pass through low opacity.
 const roll=(block,el,text)=>{const before=parseFloat(el.textContent),after=parseFloat(text);if(el.textContent===text)return;el.textContent=text;if(!Number.isFinite(before)||before===after)return;
  play(block,el,after>before?[{transform:'translateY(50%)',clipPath:'inset(0 0 50% 0)'},{transform:'none',clipPath:'inset(0)'}]:[{transform:'translateY(-50%)',clipPath:'inset(50% 0 0 0)'},{transform:'none',clipPath:'inset(0)'}],PRESS);};
 // A removed element stays as an inert, unlabeled copy while it leaves, then is dropped.
 const ghost=(el,frames,duration)=>{el.setAttribute('aria-hidden','true');el.inert=true;ghosts.add(el);const a=run(el,frames,{duration,fill:'forwards'});const drop=()=>{ghosts.delete(el);el.remove();};if(a)later(drop,duration);else drop();};
 // Runs once when the block is first mostly in view; O(1) per block, released on first hit or dispose.
 const onFirstView=(el,fn)=>{if(typeof IntersectionObserver!=='function'){fn();return;}const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();observers.delete(io);fn();}},{threshold:.35});io.observe(el);observers.add(io);};

 const caseMinutes=time=>Number(time.slice(0,2))*60+Number(time.slice(3,5));
 // Fields two consecutive events share explain how the chain links; only these identify the same actor or machine.
 const CASE_LINKS=[['host','host'],['user','user'],['ip','IP'],['session','session']];
 const caseLink=(prev,next,gap)=>{const value=(r,k)=>r?.fields.find(([key])=>key===k)?.[1];const same=CASE_LINKS.filter(([k])=>value(prev,k)!==undefined&&value(prev,k)===value(next,k)).map(([,label])=>label);
  const phrase=same.length?`Same ${same.length>1?same.slice(0,-1).join(', ')+' and '+same.at(-1):same[0]}`:'No shared host, user or IP';return `${phrase}, ${gap} min later`;};
 let caseUid=0;
 for(const b of find('[data-ps-incident-timeline]')){
  trackInput(b);
  let state='investigating',selected=4,cardOpen=true;const list=b.querySelector('[data-case-events]'),dialog=b.querySelector('dialog'),action=b.querySelector('[data-case-action]'),evidence=b.querySelector('[data-case-evidence]'),statusLabel=b.querySelector('[data-case-status]'),message=b.querySelector('[data-case-message]'),phases=[...b.querySelectorAll('[data-case-phase]')];
  // The specimen carries each event's raw record, severity, rule and analyst note in hidden description lists.
  const records=[...b.querySelectorAll('[data-case-records] > [data-case-record]')].map(dl=>({fields:[...dl.children].map(row=>[row.querySelector('dt').textContent,row.querySelector('dd').textContent]),severity:dl.dataset.severity,score:Number(dl.dataset.score),rule:dl.dataset.rule,ruleName:dl.dataset.ruleName,note:dl.dataset.note||''}));
  const prefix=`case-${++caseUid}`,rows=[],slot=node('div',undefined,'ps-case-card-slot');slot.id=`${prefix}-detail`;slot.setAttribute('role','region');
  const show=()=>{rows.forEach((el,i)=>{el.toggleAttribute('data-selected',i===selected);el.setAttribute('aria-expanded',String(cardOpen&&i===selected));if(cardOpen&&i===selected)el.setAttribute('aria-controls',slot.id);else el.removeAttribute('aria-controls');});const event=CASE_EVENTS[selected];say(b,evidence,`${event.time} · ${event.source}. ${event.detail}`);};
  CASE_EVENTS.forEach((event,i)=>{const button=node('button',undefined,'ps-evidence-row ps-source-'+event.kind);button.type='button';button.id=`${prefix}-ev${i}`;button.append(node('time',event.time),node('i'),node('span',event.title));on(button,'click',e=>choose(i,e.detail>0));rows.push(button);list.append(button);});
  /* Detail card: severity and the rule that flagged the event, where it sits in the case window and how it links to the
     evidence before it, the analyst note, and the raw record. It opens under its row; one card per case. */
  const fact=(k,v,cls)=>{const row=node('div',undefined,cls);row.append(node('dt',k),node('dd',v));return row;};
  const fill=i=>{const event=CASE_EVENTS[i],record=records[i],card=node('div',undefined,'ps-case-card'),t0=caseMinutes(CASE_EVENTS[0].time),span=Math.max(1,caseMinutes(CASE_EVENTS.at(-1).time)-t0),at=caseMinutes(event.time)-t0;
   if(record){const meters=node('dl',undefined,'ps-case-card-severity'),row=node('div',undefined,'ps-case-meter'),track=node('span',undefined,'ps-case-meter-track'),bar=node('i');
    track.setAttribute('aria-hidden','true');bar.dataset.severity=record.severity.toLowerCase();bar.style.width=`${Math.max(0,Math.min(100,record.score))}%`;track.append(bar);
    row.append(node('dt','Severity'),track,node('dd',`${record.severity} · ${record.score}`));const rule=node('div',undefined,'ps-case-card-rule'),name=node('dd');name.append(node('code',record.rule),node('span',record.ruleName));rule.append(node('dt','Flagged by'),name);meters.append(row,rule);card.append(meters);}
   const where=node('div',undefined,'ps-case-card-place'),lane=node('span',undefined,'ps-case-card-lane');lane.setAttribute('aria-hidden','true');
   if(i>0){const link=node('b');link.style.left=`${(caseMinutes(CASE_EVENTS[i-1].time)-t0)/span*100}%`;link.style.width=`${(caseMinutes(event.time)-caseMinutes(CASE_EVENTS[i-1].time))/span*100}%`;lane.append(link);}
   CASE_EVENTS.forEach((other,j)=>{const tick=node('i',undefined,'ps-source-'+other.kind);if(j===i)tick.dataset.current='';tick.style.left=`${(caseMinutes(other.time)-t0)/span*100}%`;lane.append(tick);});
   const prev=CASE_EVENTS[i-1];where.append(node('p',`Within the ${span} minute case window`,'ps-case-card-caption'),lane,node('p',`+${at} min from the first event · ${i+1} of ${CASE_EVENTS.length}`,'ps-case-card-scale'));
   if(record&&(!prev||records[i-1])){const links=node('dl',undefined,'ps-case-card-link');links.append(fact(prev?`Linked to ${prev.time} ${prev.title}`:'Linked evidence',prev?caseLink(records[i-1],record,caseMinutes(event.time)-caseMinutes(prev.time)):'First event in the chain'));card.append(where,links);}else card.append(where);
   if(record?.note){const note=node('div',undefined,'ps-case-card-note');note.append(node('p','Analyst note','ps-case-card-caption'),node('p',record.note));card.append(note);}
   if(record?.fields.length){const raw=node('div',undefined,'ps-case-card-raw'),dl=node('dl');for(const [k,v]of record.fields)dl.append(fact(k,v));raw.append(node('p',`Raw event · ${event.source}`,'ps-case-card-caption'),dl);card.append(raw);}
   slot.replaceChildren(card);};
  // Moving the card collapses an inert copy where it was while the real card grows under the new row. Pointer input only.
  const CARD=h=>[{height:'0px',opacity:.72},{height:`${h}px`,opacity:1}];
  const place=animated=>{const owner=rows[selected],height=slot.isConnected&&!slot.hidden?slot.offsetHeight:0;
   if(animated&&height&&moving(b)&&(!cardOpen||slot.previousElementSibling!==owner)){const copy=slot.cloneNode(true);copy.removeAttribute('id');copy.removeAttribute('role');copy.removeAttribute('aria-labelledby');for(const el of copy.querySelectorAll('[id]'))el.removeAttribute('id');slot.after(copy);ghost(copy,[{height:`${height}px`,opacity:.72},{height:'0px',opacity:0}],PRESS);}
   slot.hidden=!cardOpen;if(!cardOpen)return;fill(selected);slot.setAttribute('aria-labelledby',owner.id);if(slot.previousElementSibling!==owner)owner.after(slot);
   if(animated){play(b,slot,CARD(slot.offsetHeight),SETTLE);play(b,slot.firstChild,[{transform:'translateY(-4px)'},{transform:'none'}],SETTLE);}};
  // Choosing the open row again folds its card; choosing another row moves the card to it. Focus stays on the row.
  const choose=(i,animated)=>{if(i===selected&&cardOpen){cardOpen=false;show();place(animated);emit(b,'case-detail',{action:'close',index:i});return;}selected=i;cardOpen=true;show();place(animated);emit(b,'case-detail',{action:'open',index:i});};
  on(list,'keydown',e=>{if(e.key==='Escape'&&cardOpen&&rows.includes(e.target)){e.preventDefault();cardOpen=false;show();place(false);emit(b,'case-detail',{action:'close',index:selected});}});
  place(false);
  // Phase bars fill from the start edge as a case advances and drain when it resets.
  const FILL=[{transform:'scaleX(0)'},{transform:'none'}],DRAIN=[{transform:'none'},{transform:'scaleX(0)'}];
  const render=()=>{say(b,statusLabel,{investigating:'Investigating',contained:'Contained',closed:'Closed'}[state]);statusLabel.dataset.state=state;
   const reached={investigating:2,contained:3,closed:4}[state];phases.forEach((el,i)=>{const done=String(i<reached),was=el.dataset.done;el.dataset.done=done;if(was!==undefined&&was!==done)play(b,el,done==='true'?FILL:DRAIN,SETTLE,{pseudoElement:'::before'});});
   action.textContent=state==='investigating'?'Contain sample account':state==='contained'?'Close sample case':'Case closed';action.disabled=state==='closed';
   say(b,message,state==='investigating'?'Review the evidence before containing this sample session.':state==='contained'?'Sample session contained. You can now close the case.':'Sample case closed. Reset to review again.');show();emit(b,'case',{state,selected});};
  // The confirmation grows from the button that opened it and closes in --press; a key press opens and closes it at once.
  let closing=0,closeDone=null;
  const finishClose=()=>{if(!closeDone)return;const done=closeDone;closeDone=null;clearLater(closing);closing=0;done();};finishers.add(finishClose);
  const open=()=>{finishClose();dialog.showModal();const from=action.getBoundingClientRect(),box=dialog.getBoundingClientRect(),clamp=(v,max)=>Math.max(0,Math.min(max,v));
   dialog.style.transformOrigin=`${Math.round(clamp(from.left+from.width/2-box.left,box.width))}px ${Math.round(clamp(from.top+from.height/2-box.top,box.height))}px`;
   play(b,dialog,[{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'none'}],PRESS);play(b,dialog,[{opacity:0},{opacity:1}],PRESS,{pseudoElement:'::backdrop'});};
  const close=after=>{finishClose();const leave=play(b,dialog,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.97)'}],PRESS,{fill:'forwards'});const bd=leave&&play(b,dialog,[{opacity:1},{opacity:0}],PRESS,{pseudoElement:'::backdrop',fill:'forwards'});
   closeDone=()=>{dialog.close();leave?.cancel();bd?.cancel();after?.();};if(leave)closing=later(finishClose,PRESS);else finishClose();};
  on(action,'click',()=>{if(state==='investigating')open();else if(state==='contained'){state=caseTransition(state,'close');render();b.querySelector('[data-case-reset]').focus();}});
  on(b.querySelector('[data-case-confirm]'),'click',()=>{state=caseTransition(state,'contain');render();close(()=>action.focus());});on(b.querySelector('[data-case-cancel]'),'click',()=>close());
  on(b.querySelector('[data-case-reset]'),'click',e=>{state=caseTransition(state,'reset');selected=4;render();place(e.detail>0);});render();ready.add(b);
  // The live case replays once when first in view: phases fill and evidence arrives in order, ending on the authored state.
  const replay=b.querySelector('[data-case-replay]');
  if(replay){
   let demo=[],busy=0;const stopDemo=()=>{for(const a of demo)a.cancel();demo=[];clearLater(busy);busy=0;b.removeAttribute('aria-busy');};finishers.add(stopDemo);
   const start=()=>{stopDemo();if(reduced())return;const rows=[...list.children],step=140,lead=160;b.setAttribute('aria-busy','true');
    phases.forEach((el,i)=>{if(el.dataset.done==='true')demo.push(run(el,FILL,{duration:SETTLE,delay:i*(step*2),fill:'backwards',pseudoElement:'::before'}));});
    rows.forEach((row,i)=>demo.push(run(row,[{clipPath:'inset(0 100% 0 0)',transform:'translateX(-4px)'},{clipPath:'inset(0)',transform:'none'}],{duration:SETTLE,delay:lead+i*step,fill:'backwards'})));
    const end=lead+rows.length*step;demo.push(run(evidence,RISE,{duration:PRESS,delay:end,fill:'backwards'}));demo=demo.filter(Boolean);busy=later(stopDemo,end+PRESS);};
   const sync=()=>{replay.hidden=reduced();if(reduced())stopDemo();};sync();if(reduceQuery?.addEventListener)on(reduceQuery,'change',sync);
   on(replay,'click',start);
   // Any other interaction ends the demonstration, so the person always acts on the real state.
   const interrupt=e=>{if(demo.length&&!replay.contains(e.target))stopDemo();};on(b,'pointerdown',interrupt);on(b,'keydown',interrupt);
   if(!reduced())onFirstView(b,start);
  }
 }
 for(const b of find('[data-ps-relationship-map]')){
  trackInput(b);
  // The dependencies form a tree, drawn as nested lists: the source, its direct dependencies, and each indirect one
  // beside its own parent. Every service is a button naming itself, its kind and its status, so the drawing is the
  // accessible list; arrows move between services in reading order with one tab stop, Enter or Space selects.
  const hops=b.querySelector('[data-map-hops]'),plot=b.querySelector('[data-map-plot]');let selected='api',visible=[],buttons=[];
  const show=(focus=false)=>{const current=visible.find(n=>n.id===selected);say(b,b.querySelector('[data-map-detail]'),`${current.name} · ${current.type} · ${current.status}. ${current.detail}`);
   for(const btn of buttons){const on=btn.dataset.node===selected;btn.setAttribute('aria-pressed',String(on));btn.tabIndex=on?0:-1;if(on&&focus)btn.focus();}
   emit(b,'dependency',{id:selected,hops:Number(hops.value)});};
  const render=()=>{visible=reachableNodes(DEPENDENCY_NODES,DEPENDENCY_EDGES,'api',Number(hops.value));if(!visible.some(n=>n.id===selected))selected='api';
   const byId=new Map(visible.map(n=>[n.id,n])),kids=new Map(visible.map(n=>[n.id,[]]));
   for(const n of visible){if(!n.depth)continue;const parent=DEPENDENCY_EDGES.map(([a,c])=>a===n.id?c:c===n.id?a:null).find(id=>byId.get(id)?.depth===n.depth-1);kids.get(parent).push(n);}
   const before=new Set(buttons.map(x=>x.dataset.node));buttons=[];
   const item=n=>{const li=node('li'),btn=node('button',undefined,'ps-map-node'),meta=node('span',undefined,'ps-map-meta');btn.type='button';btn.dataset.node=n.id;btn.dataset.status=n.status==='Healthy'?'healthy':'risk';
    meta.append(node('span',n.type),node('span',n.status,'ps-map-health'));btn.append(node('span',n.name,'ps-map-name'),meta);buttons.push(btn);li.append(btn);
    if(kids.get(n.id).length){const ol=node('ol');for(const c of kids.get(n.id))ol.append(item(c));li.append(ol);}return li;};
   const tree=node('ol');tree.append(item(byId.get('api')));plot.replaceChildren(tree);
   if(moving(b))for(const btn of buttons)if(!before.has(btn.dataset.node))play(b,btn.parentElement,[{opacity:0},{opacity:1}],PRESS,{delay:SETTLE-PRESS,fill:'backwards'});
   roll(b,b.querySelector('[data-map-count]'),String(visible.length));roll(b,b.querySelector('[data-map-risk]'),String(visible.filter(n=>n.status!=='Healthy').length));show();};
  on(hops,'change',render);
  on(plot,'click',e=>{const btn=e.target.closest('[data-node]');if(btn){selected=btn.dataset.node;show();}});
  on(plot,'keydown',e=>{const at=buttons.indexOf(doc.activeElement);if(at<0)return;const to={ArrowDown:at+1,ArrowUp:at-1,Home:0,End:buttons.length-1}[e.key];if(to===undefined)return;e.preventDefault();
   const next=buttons[Math.max(0,Math.min(buttons.length-1,to))];for(const btn of buttons)btn.tabIndex=btn===next?0:-1;next.focus();});
  render();ready.add(b);
 }
 for(const b of find('[data-ps-sequence-builder]')){
  trackInput(b);
  let saved=INITIAL_SEQUENCE.map(s=>({...s})),steps=saved.map(s=>({...s})),selected=2,nextId=4;
  const list=b.querySelector('[data-sequence-list]'),form=b.querySelector('form'),title=form.elements.namedItem('title'),channel=form.elements.namedItem('channel'),delay=form.elements.namedItem('delay'),status=b.querySelector('[data-sequence-status]');
  // Rows are rebuilt on each render, so motion compares old and new rows by step id: moved rows nudge from where they were,
  // new rows rise in, removed rows collapse in place. O(N) per render, N at most six.
  const render=(fields=true)=>{const before=new Map(),old=[...list.querySelectorAll('[data-step]')];if(moving(b))for(const el of old)before.set(el.dataset.step,el.getBoundingClientRect().top);
   const index=steps.findIndex(s=>s.id===selected);list.replaceChildren();sequenceDays(steps).forEach((step,i)=>{const button=node('button',undefined,'ps-sequence-step');button.type='button';button.dataset.step=String(step.id);button.setAttribute('aria-pressed',String(step.id===selected));button.append(node('span',String(i+1),'ps-step-number'),node('span',step.title),node('small',`Day ${step.day} · ${step.channel}`));list.append(button);});
   if(before.size){const ids=new Set(steps.map(s=>String(s.id))),gap=parseFloat(win.getComputedStyle(list).rowGap)||0;
    old.forEach((el,i)=>{if(ids.has(el.dataset.step))return;const shell=node('div',undefined,'ps-sequence-ghost');el.removeAttribute('data-step');shell.append(el);list.insertBefore(shell,list.children[i]||null);ghost(shell,[{gridTemplateRows:'1fr',opacity:1,marginBottom:'0px'},{gridTemplateRows:'0fr',opacity:0,marginBottom:`${-gap}px`}],SETTLE);});
    for(const el of list.querySelectorAll('[data-step]')){const top=before.get(el.dataset.step);if(top===undefined)play(b,el,[{opacity:.72,transform:'translateY(4px)'},{opacity:1,transform:'none'}],SETTLE);else if(Math.abs(top-el.getBoundingClientRect().top)>.5)play(b,el,[{transform:`translateY(${top-el.getBoundingClientRect().top}px)`},{transform:'none'}],SETTLE);}}
   if(fields){title.value=steps[index].title;channel.value=steps[index].channel;delay.value=steps[index].delay;}
   for(const [key,disabled]of [['up',index===0],['down',index===steps.length-1],['remove',steps.length===1],['add',steps.length===6]])b.querySelector(`[data-sequence-${key}]`).disabled=disabled;
   say(b,b.querySelector('[data-sequence-dirty]'),JSON.stringify(steps)===JSON.stringify(saved)?'Saved locally':'Unsaved changes');roll(b,b.querySelector('[data-sequence-count]'),`${steps.length} steps`);emit(b,'sequence',{steps:sequenceDays(steps)});};
  // Choosing another step crossfades the editor so the fields read as the new step's, not an edit of the old one.
  const swapFields=()=>{for(const el of form.querySelectorAll('.ps-compact-field'))play(b,el,RISE,PRESS);};
  const update=()=>{if(!form.reportValidity())return false;const index=steps.findIndex(s=>s.id===selected);const candidate=steps.map((step,i)=>i===index?{...step,title:title.value.trim(),channel:channel.value,delay:Number(delay.value)}:step);try{sequenceDays(candidate);}catch(e){say(b,status,e.message);return false;}steps=candidate;status.textContent='';render(false);return true;};
  on(form,'submit',e=>{e.preventDefault();if(update()){saved=steps.map(s=>({...s}));render(false);say(b,status,'Sequence saved in this demo. No messages will be sent.',true);}});
  for(const el of [title,channel,delay])on(el,'input',()=>{if(el.validity.valid&&title.value.trim())update();});
  on(list,'click',e=>{const el=e.target.closest('[data-step]');if(el&&update()){const changed=Number(el.dataset.step)!==selected;selected=Number(el.dataset.step);render();if(changed)swapFields();}});
  for(const [key,offset]of [['up',-1],['down',1]])on(b.querySelector(`[data-sequence-${key}]`),'click',()=>{if(!update())return;const i=steps.findIndex(s=>s.id===selected),j=i+offset;if(j<0||j>=steps.length)return;[steps[i],steps[j]]=[steps[j],steps[i]];render();});
  on(b.querySelector('[data-sequence-add]'),'click',()=>{if(steps.length===6||!update())return;selected=nextId++;steps.push({id:selected,title:'New step',channel:'Email',delay:1});render();swapFields();title.focus();});
  on(b.querySelector('[data-sequence-remove]'),'click',()=>{if(steps.length===1)return;const index=steps.findIndex(s=>s.id===selected);steps=steps.filter(s=>s.id!==selected);selected=steps[Math.min(index,steps.length-1)].id;say(b,status,'Step removed. Discard restores the saved sequence.',true);render();swapFields();title.focus();});
  on(b.querySelector('[data-sequence-discard]'),'click',()=>{steps=saved.map(s=>({...s}));selected=steps[0].id;render();swapFields();say(b,status,'Saved sequence restored.',true);});render();ready.add(b);
 }
 for(const b of find('[data-ps-schedule-controls]')){
  trackInput(b);
  const form=b.querySelector('form'),field=name=>form.elements.namedItem(name),days=[...b.querySelectorAll('[name="day"]')],status=b.querySelector('[data-schedule-status]');
  const read=()=>({enabled:field('enabled').checked,channel:field('channel').value,limit:field('limit').value===''?NaN:Number(field('limit').value),days:days.filter(d=>d.checked).map(d=>Number(d.value)),start:field('start').value,end:field('end').value,pause:field('pause').checked});let saved=read();
  const show=()=>{const value=read(),cap=value.channel==='email'?100:40;say(b,b.querySelector('[data-schedule-cap]'),`${cap} per day maximum for this channel`);field('limit').max=cap;say(b,b.querySelector('[data-schedule-summary]'),value.enabled?`${value.days.length} days per week · ${value.start||'—'}–${value.end||'—'} · UTC`:'Schedule paused');say(b,b.querySelector('[data-schedule-dirty]'),JSON.stringify(value)===JSON.stringify(saved)?'Saved locally':'Unsaved changes');};
  // A repeated save attempt re-announces its outcome, so the message rises again even when its text is unchanged.
  on(form,'input',show);on(form,'submit',e=>{e.preventDefault();const value=read(),errors=scheduleErrors(value);for(const name of ['channel','limit','start','end'])field(name).setAttribute('aria-invalid',String(!!errors[name]));for(const day of days)day.setAttribute('aria-invalid',String(!!errors.days));if(Object.keys(errors).length){say(b,status,Object.values(errors).join(' '),true);const name=Object.keys(errors)[0];(name==='days'?days[0]:field(name)).focus();return;}saved={...value,days:[...value.days]};show();say(b,status,'Schedule saved in this demo. No activity is scheduled.',true);emit(b,'schedule',saved);});
  on(b.querySelector('[data-schedule-discard]'),'click',()=>{for(const name of ['channel','limit','start','end']){field(name).value=saved[name];field(name).removeAttribute('aria-invalid');}for(const name of ['enabled','pause'])field(name).checked=saved[name];for(const day of days){day.checked=saved.days.includes(Number(day.value));day.removeAttribute('aria-invalid');}show();say(b,status,'Saved schedule restored.',true);});show();ready.add(b);
 }
 return()=>{controller.abort();for(const finish of finishers)finish();for(const id of timers)clearTimeout(id);timers.clear();for(const io of observers)io.disconnect();observers.clear();for(const a of animations)a.cancel();animations.clear();for(const el of ghosts)el.remove();ghosts.clear();};
}

// Synthetic fixtures. Every displayed total is derived from these records.
const SIGNAL_KEYS=['identity','endpoint','cloud','email','network','saas'];
const SIGNAL_LABELS=['Identity','Endpoint','Cloud','Email','Network','SaaS'];
const SIGNAL_HISTORY=[
 [220,140,80,50,35,24],[260,180,92,75,42,28],[420,250,124,140,68,42],
 [410,280,138,150,72,45],[390,260,142,135,65,48],[240,160,98,62,44,31],
 [225,150,85,55,39,26],[460,320,160,180,85,56],[490,350,180,210,91,62],
 [510,380,195,185,95,70],[480,340,170,160,88,65],[720,410,235,360,140,90],
 [290,190,120,85,58,39],[270,180,110,78,49,35]
];
function volumeBuckets(keys, period='day') {
 if(!Array.isArray(keys)||keys.some(key=>!SIGNAL_KEYS.includes(key))||!['day','week'].includes(period))throw new Error('Invalid volume selection');
 const indices=new Set(keys.map(key=>SIGNAL_KEYS.indexOf(key))), size=period==='week'?7:1, buckets=[];
 for(let start=0;start<SIGNAL_HISTORY.length;start+=size){const values=Array(6).fill(0);let escalated=0;
  for(const day of SIGNAL_HISTORY.slice(start,start+size))for(let i=0;i<6;i++)if(indices.has(i)){values[i]+=day[i];escalated+=Math.floor(day[i]*.008);}
  buckets.push({label:size===1?`Oct ${start+1}`:`Oct ${start+1}–${Math.min(start+size,14)}`,values,total:values.reduce((a,b)=>a+b,0),escalated});
 }
 return buckets;
}
// A count scale: a round whole-number top at or above the largest value, with about one gridline per 48px of height.
function valueScale(max, height) {
 if(!Number.isFinite(max)||max<0||!Number.isFinite(height)||height<=0)throw new Error('Invalid scale');
 const lines=Math.max(2,Math.min(5,Math.floor(height/48))), raw=Math.max(1,max)/lines, power=10**Math.floor(Math.log10(raw));
 const step=Math.max(1,[1,2,5,10].map(n=>n*power).find(n=>n>=raw)), top=Math.ceil(Math.max(1,max)/step)*step;
 return {top,ticks:Array.from({length:Math.round(top/step)+1},(_,i)=>i*step)};
}
// Time labels: the first carries its month, later ones drop it until the month changes; about one per 64px of width.
function dateTicks(labels, width) {
 if(!Array.isArray(labels)||!Number.isFinite(width)||width<=0)throw new Error('Invalid ticks');
 const every=Math.max(1,Math.ceil(labels.length/Math.max(2,Math.floor(width/64)))), out=[];let month='';
 for(let index=0;index<labels.length;index+=every){const [head,...rest]=labels[index].split(' ');out.push({index,text:head===month?rest.join(' '):labels[index]});month=head;}
 return out;
}
// Relative change in percent, or null when there is no base to compare against.
function percentChange(current, previous) {
 if(!Number.isFinite(current)||!Number.isFinite(previous))throw new Error('Invalid change');
 return previous===0?null:(current-previous)/previous*100;
}
// The headline comparison for volume: the last week in view against the first.
function volumeChange(keys) {
 const weeks=volumeBuckets(keys,'week'),first=weeks[0],last=weeks.at(-1);
 return {current:last.total,previous:first.total,currentLabel:last.label,previousLabel:first.label,change:percentChange(last.total,first.total)};
}
const MATCH_DISTRIBUTIONS={
 design:[6,10,20,39,57,83,91,70,62,48,37,20,5],
 engineering:[9,14,29,43,68,90,87,80,71,58,43,28,8]
};
function matchingPopulation(role, threshold) {
 if(!MATCH_DISTRIBUTIONS[role]||!Number.isFinite(threshold)||threshold<40||threshold>100)throw new Error('Invalid match threshold');
 const bins=MATCH_DISTRIBUTIONS[role].map((count,i)=>({score:40+i*5,count}));
 return {bins,total:bins.reduce((n,x)=>n+x.count,0),qualified:bins.reduce((n,x)=>n+(x.score>=threshold?x.count:0),0)};
}
const FUNNEL_STAGES=['Visited','Signed up','Created a project','Invited a teammate','Activated'];
const FUNNEL_COHORTS={
 week:{direct:[840,260,180,98,64],community:[480,185,121,72,48]},
 month:{direct:[3620,980,710,390,256],community:[2120,820,540,326,198]}
};
function funnelValues(period, channel) {
 const cohort=FUNNEL_COHORTS[period];if(!cohort||!['all','direct','community'].includes(channel))throw new Error('Invalid funnel cohort');
 return channel==='all'?cohort.direct.map((n,i)=>n+cohort.community[i]):[...cohort[channel]];
}
// Overall conversion, last stage over entry, in percent rounded to one decimal as it is displayed.
function funnelRate(values) {
 return values[0]?Math.round(values.at(-1)/values[0]*1000)/10:0;
}
// A channel compares with the other channel in the same period; all channels compare with the other period's cohort.
function funnelComparison(period, channel) {
 const values=funnelValues(period,channel),otherPeriod=period==='week'?'month':'week';
 const base=channel==='all'?funnelValues(otherPeriod,'all'):funnelValues(period,channel==='direct'?'community':'direct');
 const rate=funnelRate(values),baseRate=funnelRate(base);
 const baseLabel=channel==='all'?(otherPeriod==='month'?'30-day cohort':'7-day cohort'):(channel==='direct'?'Community':'Direct');
 return {rate,baseRate,baseLabel,points:Math.round((rate-baseRate)*10)/10};
}
const ACTIVITY_TOTALS=[9,18,22,14,30,4,0,12,29,36,18,24,7,2,17,35,42,27,31,5,0,22,40,48,32,38,8,3,19,28,34,25,26,6,1];
const ACTIVITY_DAYS=ACTIVITY_TOTALS.map((total,i)=>({date:new Date(Date.UTC(2026,8,28+i)).toISOString().slice(0,10),code:Math.floor(total*.6),design:Math.floor(total*.25),docs:total-Math.floor(total*.6)-Math.floor(total*.25)}));
function activityValues(category) {
 if(!['all','code','design','docs'].includes(category))throw new Error('Invalid activity category');
 return ACTIVITY_DAYS.map(day=>({date:day.date,value:category==='all'?day.code+day.design+day.docs:day[category],...day}));
}
// A sequential scale in four steps above zero: a day's step is the quarter of the busiest day it falls in.
function heatLevel(value, max) {
 if(!Number.isFinite(value)||!Number.isFinite(max)||value<0)throw new Error('Invalid heat value');
 return value===0?0:Math.min(4,Math.max(1,Math.ceil(value/Math.max(1,max)*4)));
}
// The whole-number range each step covers; a step no whole number reaches is empty (from > to).
function heatScale(max) {
 if(!Number.isFinite(max)||max<0)throw new Error('Invalid heat scale');
 const top=Math.max(1,max);
 return [{level:0,from:0,to:0},...[1,2,3,4].map(level=>({level,from:Math.floor((level-1)*top/4)+1,to:Math.floor(level*top/4)}))];
}
// Calendar cells name their month once: on the first cell and on each first of the month.
function calendarMonths(dates) {
 if(!Array.isArray(dates)||dates.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d)))throw new Error('Invalid dates');
 return dates.map((iso,i)=>{const day=new Date(`${iso}T00:00:00Z`);return i===0||day.getUTCDate()===1?day.toLocaleString('en-US',{month:'short',timeZone:'UTC'}):'';});
}

function enhanceDataComponents(root) {
 const doc=root.ownerDocument||root, win=doc.defaultView, controller=new win.AbortController();
 const find=selector=>[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
 const listen=(el,type,fn,capture=false)=>el.addEventListener(type,fn,{signal:controller.signal,capture});
 const node=(tag,text,cls)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const number=new Intl.NumberFormat('en-US'), format=value=>number.format(value);
 const emit=(block,name,detail)=>block.dispatchEvent(new win.CustomEvent('pagesystem:'+name,{bubbles:true,detail}));
 /* Motion is presentation only: the DOM is written in its final state first, then element.animate() plays from the old look.
    Nothing is scheduled through timers, frames or observers, so the frame's sandbox cannot block it and disposal only cancels.
    A block carries data-still while its last input was a key press; reduced motion and key presses skip every animation. */
 const EASE='cubic-bezier(.22,1,.36,1)', running=new Set(), slots=new WeakMap();
 const reduced=()=>!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const ms=(name,fallback)=>parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue(name))||fallback;
 const track=block=>{listen(block,'pointerdown',()=>block.removeAttribute('data-still'),true);listen(block,'keydown',()=>block.setAttribute('data-still',''),true);};
 const still=block=>reduced()||block.hasAttribute('data-still');
 const stop=(el,key)=>{slots.get(el)?.[key]?.cancel();};
 const play=(el,frames,duration,key)=>{
  if(!el.animate)return;stop(el,key);const own=slots.get(el)||{};slots.set(el,own);
  const run=el.animate(frames,{duration,easing:EASE});own[key]=run;running.add(run);
  const done=()=>{running.delete(run);if(own[key]===run)delete own[key];};run.addEventListener('finish',done);run.addEventListener('cancel',done);
 };
 // A changed figure rises into a fixed baseline window: the clip's bottom edge stays put while the glyphs travel, so contrast holds every frame.
 const roll=(el,text,animate)=>{if(el.textContent===text)return;el.textContent=text;if(animate)play(el,[{clipPath:'inset(0 0 35% 0)',transform:'translateY(35%)'},{clipPath:'inset(0 0 0 0)',transform:'none'}],ms('--press',160),'roll');};
 // A changed readout settles in from 0.72 opacity and 2px below, never from invisible.
 const swap=(el,text,animate)=>{if(el.textContent===text)return;el.textContent=text;if(animate)play(el,[{opacity:.72,transform:'translateY(2px)'},{opacity:1,transform:'none'}],ms('--press',160),'swap');};
 // A delta pill states direction in its arrow and its signed text; color joins only where up is known to be good.
 const setDelta=(el,value,unit,effect)=>{
  if(!el)return;const known=value!==null&&Number.isFinite(value);el.hidden=!known;if(!known)return;
  const direction=value>0?'up':value<0?'down':'flat',label=`${value>0?'+':value<0?'−':''}${Math.abs(value).toFixed(1)}${unit}`;
  const parts=[];if(direction!=='flat'){const icon=node('i',undefined,`ps-i ps-i-${direction}`);icon.setAttribute('aria-hidden','true');parts.push(icon);}
  parts.push(node('span',label));el.replaceChildren(...parts);
  if(effect)el.dataset.trend=direction;else el.removeAttribute('data-trend');
 };
 // Layout offsets inside a positioned frame, unaffected by any transform that is mid-animation.
 const offsetIn=(el,frame)=>{let x=0,y=0;for(let n=el;n&&n!==frame;n=n.offsetParent){x+=n.offsetLeft;y+=n.offsetTop;}return {x,y};};
 // A pinned tip sits beside its mark on the side with room, anchored in percentages of its frame so it survives resizing.
 const pinTip=(tip,frame,mark,top)=>{
  const width=frame.clientWidth,height=frame.clientHeight;if(!width||!height||!tip.offsetWidth)return;
  const gap=8,at=offsetIn(mark,frame),left=at.x,right=left+mark.offsetWidth,tw=tip.offsetWidth,th=tip.offsetHeight;
  const after=right+gap+tw<=width||left-gap-tw<0;tip.style.left=after?`${(right+gap)/width*100}%`:'auto';tip.style.right=after?'auto':`${(width-left+gap)/width*100}%`;
  tip.style.top=`${Math.max(0,Math.min(height-th,top??at.y))/height*100}%`;
 };
 const tipList=pairs=>{const list=node('dl');for(const [term,value,total] of pairs){list.append(node('dt',term,total?'ps-plot-tip-total':undefined),node('dd',value,total?'ps-plot-tip-total':undefined));}return list;};
 for(const block of find('[data-ps-signal-volume]')) {
  const checks=[...block.querySelectorAll('input[type="checkbox"]')], period=block.querySelector('[data-volume-period]'),inspect=block.querySelector('[data-volume-inspect]'),plot=block.querySelector('[data-volume-plot]'),empty=block.querySelector('[data-volume-empty]');let rows=[],ready=false;track(block);
  const delta=block.querySelector('[data-volume-delta]'),base=block.querySelector('[data-volume-base]'),peakDate=block.querySelector('[data-volume-peak-date]');
  // The value scale sits in the plot's gutter at labeled round values; dates qualify their month once, then stay terse.
  const scale=node('div',undefined,'ps-volume-scale'),columns=()=>[...plot.querySelectorAll(':scope > .ps-volume-column')];
  const dates=plot.nextElementSibling?.matches('.ps-volume-dates')?plot.nextElementSibling:node('div',undefined,'ps-volume-dates');
  scale.setAttribute('aria-hidden','true');dates.setAttribute('aria-hidden','true');if(!dates.isConnected)plot.after(dates);
  const compact=value=>value>=1000?`${+(value/1000).toFixed(1)}k`:String(value);
  // The pinned tip restates the inspected period beside its column; the readout and table carry the same values.
  const tip=node('div',undefined,'ps-plot-tip');tip.setAttribute('aria-hidden','true');let ticks=[];
  const placeTip=(col,row)=>{
   const keys=SIGNAL_KEYS.filter((key,i)=>row.values[i]>0),list=node('dl');
   for(const key of keys){const i=SIGNAL_KEYS.indexOf(key),term=node('dt'),swatch=node('i');swatch.style.setProperty('--tip-color',`var(--source-${key})`);term.append(swatch,node('span',SIGNAL_LABELS[i]));list.append(term,node('dd',format(row.values[i])));}
   list.append(node('dt','Total','ps-plot-tip-total'),node('dd',format(row.total),'ps-plot-tip-total'));
   tip.replaceChildren(node('strong',row.label),list);tip.hidden=!row.total;if(!row.total)return;
   const stack=col.firstChild;pinTip(tip,plot,col,stack?offsetIn(stack,plot).y:0);
  };
  // The inspected period's date always shows, in ink; thinned neighbors that would crowd it give way.
  const paintDates=index=>{
   const every=ticks.length>1?ticks[1].index-ticks[0].index:1,shown=ticks.filter(t=>t.index===index||Math.abs(t.index-index)>every/2||every===1);
   if(!shown.some(t=>t.index===index)&&rows[index])shown.push({index,text:rows[index].label});
   shown.sort((a,b)=>a.index-b.index);let month='';
   dates.replaceChildren(...shown.map(t=>{const [head,...rest]=rows[t.index].label.split(' '),label=node('span',head===month?rest.join(' '):rows[t.index].label);month=head;label.style.gridColumn=String(t.index+1);
    if(t.index===0)label.dataset.edge='start';else if(t.index===rows.length-1)label.dataset.edge='end';if(t.index===index)label.dataset.focus='';return label;}));
  };
  const show=()=>{const index=Number(inspect.value),row=rows[index];if(!row)return;
   block.querySelector('[data-volume-date]').textContent=row.label;inspect.setAttribute('aria-valuetext',`${row.label}, ${format(row.total)} events`);
   block.querySelector('[data-volume-readout]').textContent=`${row.label} · ${format(row.total)} events · ${row.escalated} escalated`;
   const cols=columns();cols.forEach((el,i)=>el.dataset.selected=String(i===index));if(cols[index])placeTip(cols[index],row);paintDates(index);emit(block,'volume',{period:period.value,index,...row});
  };
  const render=()=>{
   const animate=ready&&!still(block),before=columns().map(col=>parseFloat(col.firstChild?.style.height)||0);
   const keys=checks.filter(el=>el.checked).map(el=>el.value);rows=volumeBuckets(keys,period.value);
   const {top,ticks:scaleTicks}=valueScale(Math.max(...rows.map(x=>x.total)),plot.clientHeight||220);
   inspect.max=String(rows.length-1);inspect.value=String(Math.min(Number(inspect.value),rows.length-1));plot.replaceChildren(scale,tip);
   scale.replaceChildren(...(keys.length?scaleTicks:[]).map(tick=>{const line=node('span');line.append(node('b',tick?compact(tick):'0'));line.style.setProperty('--at',`${tick/top*100}%`);if(!tick)line.dataset.zero='';return line;}));
   rows.forEach((row,index)=>{const col=node('div',undefined,'ps-volume-column'),stack=node('div',undefined,'ps-volume-stack'),height=row.total/top*100;stack.style.height=`${height}%`;col.dataset.selected=String(index===Number(inspect.value));
    row.values.forEach((value,i)=>{if(!value)return;const segment=node('span',undefined,'ps-source-'+SIGNAL_KEYS[i]);segment.style.flexGrow=String(value);stack.append(segment);});col.append(stack);plot.append(col);
    // Same buckets tween from their old height; a new grouping grows its columns from the baseline.
    const was=before.length===rows.length?before[index]:0;if(animate&&height>0&&was!==height)play(stack,[{transform:`scaleY(${was/height})`},{transform:'none'}],ms('--settle',220),'height');
   });
   const peak=rows.reduce((a,b)=>b.total>a.total?b:a,rows[0]);
   roll(block.querySelector('[data-volume-total]'),format(rows.reduce((n,x)=>n+x.total,0)),animate);roll(block.querySelector('[data-volume-peak]'),format(peak.total),animate);
   roll(block.querySelector('[data-volume-escalated]'),format(rows.reduce((n,x)=>n+x.escalated,0)),animate);if(peakDate)peakDate.textContent=keys.length?peak.label:'';
   // The headline compares the last week in view with the first; with no sources there is nothing to compare.
   const change=volumeChange(keys);setDelta(delta,keys.length?change.change:null,'%',false);if(base)base.textContent=keys.length&&change.change!==null?`${change.currentLabel} vs ${change.previousLabel}`:'';
   const opening=empty.hidden&&!keys.length;empty.hidden=keys.length>0;if(animate&&opening)play(empty,[{opacity:.72,transform:'translateY(4px)'},{opacity:1,transform:'none'}],ms('--press',160),'swap');
   dates.style.setProperty('--count',String(rows.length));
   ticks=keys.length?dateTicks(rows.map(x=>x.label),plot.clientWidth||600):[];if(!keys.length){dates.replaceChildren();tip.hidden=true;}
   const table=block.querySelector('[data-volume-table]');table.replaceChildren();for(const row of rows){const tr=node('tr');for(const value of [row.label,format(row.total),format(row.escalated)])tr.append(node('td',value));table.append(tr);}show();
  };
  for(const check of checks)listen(check,'change',render);listen(period,'change',render);listen(inspect,'input',show);
  listen(plot,'pointermove',event=>{if(event.pointerType==='touch')return;const cols=columns();if(!cols.length)return;const left=cols[0].getBoundingClientRect().left,right=cols.at(-1).getBoundingClientRect().right;inspect.value=String(Math.max(0,Math.min(rows.length-1,Math.floor((event.clientX-left)/(right-left)*rows.length))));show();});render();ready=true;
 }
 for(const block of find('[data-ps-match-distribution]')) {
  const role=block.querySelector('[data-match-role]'),threshold=block.querySelector('[data-match-threshold]'),bin=block.querySelector('[data-match-bin]'),plot=block.querySelector('[data-match-plot]'),axis=block.querySelector('[data-match-axis]');let ready=false;track(block);
  for(let score=40;score<=100;score+=5){if(score===85)continue;const option=node('option',`${score}%`);option.value=String(score);bin.append(option);}const sorted=[...bin.options].sort((a,b)=>Number(a.value)-Number(b.value));bin.replaceChildren(...sorted);bin.value='85';
  // The threshold is a dashed reference line between score groups with its value tagged at the top; the tip restates the inspected group.
  const ref=node('div',undefined,'ps-match-ref'),tag=node('span',undefined,'ps-match-ref-tag'),tip=node('div',undefined,'ps-plot-tip');ref.append(tag);ref.setAttribute('aria-hidden','true');tip.setAttribute('aria-hidden','true');
  const columns=()=>[...plot.querySelectorAll(':scope > .ps-match-column')];
  for(const stale of plot.querySelectorAll(':scope > .ps-match-ref, :scope > .ps-plot-tip'))stale.remove();
  // Score labels at every third group; the inspected group's label always shows, in ink, and its near neighbors give way.
  const paintAxis=(bins,index)=>{if(!axis)return;axis.replaceChildren(...bins.flatMap((x,i)=>{
   if(i!==index&&(i%3!==0||Math.abs(i-index)<2))return [];const label=node('span',`${x.score}%`);label.style.gridColumn=String(i+1);
   if(i===0)label.dataset.edge='start';else if(i===bins.length-1)label.dataset.edge='end';if(i===index)label.dataset.focus='';return [label];}));};
  const render=source=>{
   const minimum=Number(threshold.value),data=matchingPopulation(role.value,minimum),animate=ready&&!still(block),index=Math.max(0,data.bins.findIndex(x=>x.score===Number(bin.value)));
   let cols=columns();if(cols.length!==data.bins.length){plot.replaceChildren();cols=data.bins.map(()=>{const column=node('div',undefined,'ps-match-column');column.append(node('div',undefined,'ps-match-dots'));return plot.appendChild(column);});}if(!ref.isConnected)plot.append(ref,tip);
   // Columns are kept between renders: dots are added or removed in place, qualification recolors through a CSS transition.
   const groups=cols.map(column=>column.firstChild),tops=animate?groups.map(group=>group.getBoundingClientRect().top):null,added=[];
   data.bins.forEach((bucket,i)=>{const column=cols[i],group=groups[i],dots=Math.ceil(bucket.count/4);column.dataset.qualified=String(bucket.score>=minimum);column.dataset.selected=String(i===index);
    while(group.children.length>dots)group.lastChild.remove();while(group.children.length<dots)added.push(group.appendChild(node('i')));});
   const at=(minimum-40)/5;ref.style.setProperty('--at',String(at));ref.dataset.side=at>data.bins.length/2?'start':'end';tag.replaceChildren(node('span','Threshold'),node('b',`${minimum}%`));
   const selected=data.bins[index],included=selected.score>=minimum;
   tip.replaceChildren(node('strong',`${selected.score}% match`),tipList([['Profiles',format(selected.count)],['Shortlist',included?'Included':'Excluded']]));pinTip(tip,plot,cols[index],0);paintAxis(data.bins,index);
   if(animate){
    // Centered dot groups move when their height changes: each slides from where it was drawn, interrupting cleanly from mid-flight.
    for(const group of groups)stop(group,'move');
    groups.forEach((group,i)=>{const dy=tops[i]-group.getBoundingClientRect().top;if(Math.abs(dy)>.5)play(group,[{transform:`translateY(${dy}px)`},{transform:'none'}],ms('--settle',220),'move');});
    for(const dot of added)play(dot,[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'none'}],ms('--settle',220),'enter');
   }
   roll(block.querySelector('[data-match-count]'),format(data.qualified),animate);block.querySelector('[data-match-summary]').textContent=`of ${format(data.total)} profiles at ${minimum}% or above`;
   block.querySelector('[data-match-percent]').textContent=`${Math.round(data.qualified/data.total*100)}% qualify`;block.querySelector('[data-match-threshold-label]').textContent=`${minimum}%`;threshold.setAttribute('aria-valuetext',`${minimum}% match score`);
   // The readout settles on a deliberate choice of group or role, not on every step of a threshold drag.
   swap(block.querySelector('[data-match-detail]'),`${selected.score}% match · ${selected.count} profiles · ${included?'Within':'Below'} the shortlist threshold`,animate&&source!=='threshold');
   const table=block.querySelector('[data-match-table]');table.replaceChildren();for(const row of data.bins){const tr=node('tr');for(const value of [`${row.score}%`,String(row.count),row.score>=minimum?'Included':'Excluded'])tr.append(node('td',value));table.append(tr);}emit(block,'matches',{role:role.value,threshold:minimum,qualified:data.qualified,total:data.total});
  };
  listen(role,'change',()=>render('role'));listen(threshold,'input',()=>render('threshold'));listen(bin,'change',()=>render('bin'));render();ready=true;
 }
 for(const block of find('[data-ps-conversion-funnel]')) {
  const period=block.querySelector('[data-funnel-period]'),channel=block.querySelector('[data-funnel-channel]'),plot=block.querySelector('[data-funnel-stages]');let selected=2,values=[],ready=false;track(block);
  const delta=block.querySelector('[data-funnel-delta]'),base=block.querySelector('[data-funnel-base]'),visits=block.querySelector('[data-funnel-visits]');
  const stages=()=>[...plot.querySelectorAll(':scope > .ps-funnel-stage')],drops=()=>[...plot.querySelectorAll(':scope > .ps-funnel-drop')];
  const show=()=>{const value=values[selected],previous=selected?values[selected-1]:values[0],rate=previous?Math.round(value/previous*100):0;
   stages().forEach((el,i)=>el.setAttribute('aria-pressed',String(i===selected)));swap(block.querySelector('[data-funnel-detail]'),`${FUNNEL_STAGES[selected]} · ${format(value)} people · ${selected?`${rate}% from the previous stage; ${format(previous-value)} did not continue`:'Cohort entry stage'}`,ready&&!still(block));emit(block,'funnel',{period:period.value,channel:channel.value,stage:selected,count:value});
  };
  const render=()=>{values=funnelValues(period.value,channel.value);const animate=ready&&!still(block);
   // Stage buttons persist across cohorts so focus and pressed state survive; each bar tweens its width from the shared zero.
   if(stages().length!==values.length){plot.replaceChildren();values.forEach((value,i)=>{
    if(i){const drop=node('p',undefined,'ps-funnel-drop');drop.dataset.drop=String(i);plot.append(drop);}
    const button=node('button',undefined,'ps-funnel-stage'),lane=node('span',undefined,'ps-funnel-lane');button.type='button';button.dataset.stage=String(i);lane.setAttribute('aria-hidden','true');lane.append(node('span',undefined,'ps-funnel-fill'));
    button.append(node('span',FUNNEL_STAGES[i],'ps-funnel-name'),lane,node('strong',undefined,'ps-funnel-value'));plot.append(button);});}
   stages().forEach((button,i)=>{const bar=button.querySelector('.ps-funnel-fill'),was=parseFloat(bar.style.width),width=values[0]?values[i]/values[0]*100:0;bar.style.width=`${width}%`;roll(button.querySelector('.ps-funnel-value'),format(values[i]),animate);
    if(animate&&width>0&&was>=0&&was!==width)play(bar,[{transform:`scaleX(${was/width})`},{transform:'none'}],ms('--settle',220),'width');});
   // The loss between two stages is labeled where it happens, under the later bar.
   for(const drop of drops()){const i=Number(drop.dataset.drop),previous=values[i-1],kept=previous?values[i]/previous*100:0,icon=node('i',undefined,'ps-i ps-i-down');icon.setAttribute('aria-hidden','true');
    drop.replaceChildren(icon,node('span',`${format(previous-values[i])} did not continue`),node('span',`${kept.toFixed(1)}% continued`));}
   const comparison=funnelComparison(period.value,channel.value);setDelta(delta,comparison.points,' pts',true);if(base)base.textContent=`vs ${comparison.baseLabel}`;
   roll(block.querySelector('[data-funnel-rate]'),`${funnelRate(values).toFixed(1)}%`,animate);if(visits)roll(visits,format(values[0]),animate);roll(block.querySelector('[data-funnel-completed]'),format(values.at(-1)),animate);show();};
  listen(plot,'click',event=>{const el=event.target.closest('[data-stage]');if(!el)return;selected=Number(el.dataset.stage);show();});listen(period,'change',render);listen(channel,'change',render);render();ready=true;
 }
 for(const block of find('[data-ps-activity-heatmap]')) {
  const category=block.querySelector('[data-activity-category]'),grid=block.querySelector('[data-activity-grid]'),key=block.querySelector('[data-activity-key]'),peak=block.querySelector('[data-activity-peak]'),peakDate=block.querySelector('[data-activity-peak-date]');let selected=24,values=[],ready=false;track(block);
  // The tip lives in the calendar's frame, beside the grid, so the grid itself holds only rows.
  let frame=grid.parentElement;if(!frame.matches('.ps-activity-plot')){frame=node('div',undefined,'ps-activity-plot');grid.before(frame);frame.append(grid);}
  frame.querySelector(':scope > .ps-plot-tip')?.remove();const tip=node('div',undefined,'ps-plot-tip');tip.setAttribute('aria-hidden','true');frame.append(tip);
  const dayName=iso=>new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
  const show=focus=>{const cells=[...grid.querySelectorAll('button')];for(const [i,el] of cells.entries()){el.tabIndex=i===selected?0:-1;el.setAttribute('aria-selected',String(i===selected));}
   const day=values[selected];swap(block.querySelector('[data-activity-detail]'),`${day.date} · ${day.value} ${category.value==='all'?'total':category.options[category.selectedIndex].text.toLowerCase()} contributions. Code ${day.code}, design ${day.design}, documentation\u00a0${day.docs}.`,ready&&!still(block));
   tip.replaceChildren(node('strong',dayName(day.date)),tipList([['Code',String(day.code)],['Design',String(day.design)],['Documentation',String(day.docs)],['Total',String(day.code+day.design+day.docs),true]]));pinTip(tip,frame,cells[selected]);
   if(focus)cells[selected].focus();emit(block,'activity',{category:category.value,...day});};
  // The 35 day cells persist across categories, so a level change recolors through the CSS transition and focus stays put.
  const render=()=>{values=activityValues(category.value);const max=Math.max(0,...values.map(x=>x.value)),animate=ready&&!still(block);
   if(grid.querySelectorAll('button').length!==values.length){grid.replaceChildren();const months=calendarMonths(values.map(x=>x.date));for(let week=0;week<5;week++){const row=node('div');row.setAttribute('role','row');for(let weekday=0;weekday<7;weekday++){const index=week*7+weekday,button=node('button');if(months[index]){button.dataset.month=months[index];button.append(node('small',months[index]),' ');}button.append(node('span',String(Number(values[index].date.slice(-2)))));button.type='button';button.dataset.day=String(index);button.setAttribute('role','gridcell');row.append(button);}grid.append(row);}}
   for(const button of grid.querySelectorAll('button')){const day=values[Number(button.dataset.day)];button.dataset.level=String(heatLevel(day.value,max));button.setAttribute('aria-label',`${button.dataset.month?`${button.dataset.month} `:''}${Number(day.date.slice(-2))}, ${day.date}, ${day.value} contributions`);}
   // The key is the scale itself: each step with the whole-number range of daily contributions it covers.
   if(key)key.replaceChildren(...heatScale(max).map(step=>{const item=node('li'),swatch=node('i');swatch.dataset.level=String(step.level);item.append(swatch,node('span',step.level===0?'0':step.from>step.to?'–':step.from===step.to?String(step.from):`${step.from}–${step.to}`));return item;}));
   const busiest=values.reduce((a,b)=>b.value>a.value?b:a,values[0]);if(peak)roll(peak,String(busiest.value),animate);if(peakDate)peakDate.textContent=busiest.value?dayName(busiest.date):'';
   roll(block.querySelector('[data-activity-total]'),format(values.reduce((n,x)=>n+x.value,0)),animate);roll(block.querySelector('[data-activity-days]'),String(values.filter(x=>x.value>0).length),animate);show(false);};
  listen(category,'change',render);listen(grid,'click',event=>{const el=event.target.closest('[data-day]');if(!el)return;selected=Number(el.dataset.day);show(false);});
  listen(grid,'keydown',event=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(event.key in offsets){event.preventDefault();selected=Math.max(0,Math.min(34,selected+offsets[event.key]));show(true);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();selected=event.key==='Home'?0:34;show(true);}});render();ready=true;
 }
 return()=>{controller.abort();for(const run of [...running])run.cancel();running.clear();};
}

// Parsed once from the authored specimen; all transitions are pure and bounded.
function parseSource(record) {
  const {id, name, status} = record;
  if (['progress','weight','rate'].some(key=>!['number','string'].includes(typeof record[key])||String(record[key]).trim()==='')) throw new Error('Missing source measurement');
  const progress=Number(record.progress), weight=Number(record.weight), rate=Number(record.rate);
  const history=String(record.history).split(',').map(Number);
  if (typeof id!=='string' || !/^[a-z]+$/.test(id) || typeof name!=='string' || !name.trim() || !['connected','disconnected','paused','syncing','error'].includes(status)) throw new Error('Invalid source identity or state');
  if (![progress,weight,rate].every(Number.isFinite) || progress<0 || progress>100 || weight<0 || weight>100 || rate<0 || history.length!==20 || history.some(x=>!Number.isFinite(x)||x<0||x>100)) throw new Error('Invalid source measurements');
  if ((status==='connected' && progress!==100) || (['disconnected','error'].includes(status) && progress!==0) || (['paused','syncing'].includes(status) && progress>=100)) throw new Error('Contradictory source progress');
  return {id,name,status,progress,weight,rate,history};
}
function transitionSource(source, action) {
  if (action==='disconnect') return {...source,status:'disconnected',progress:0};
  if (action==='start' && ['disconnected','error','paused'].includes(source.status)) return {...source,status:'syncing'};
  if (action==='pause' && source.status==='syncing') return {...source,status:'paused'};
  if (action==='tick' && source.status==='syncing') {
    const progress=Math.min(100,source.progress+12);
    return {...source,progress,status:progress===100?'connected':'syncing'};
  }
  return source;
}
function connectionSummary(sources) {
  return sources.reduce((sum,source)=>source.status==='connected'?{ready:sum.ready+1,coverage:sum.coverage+source.weight,rate:sum.rate+source.rate}:sum,{ready:0,coverage:0,rate:0});
}

/* A self-contained source connection demo. No network or storage. */
function enhanceConnections(root, motion) {
  const doc=root.ownerDocument||root, win=doc.defaultView;
  // Timers belong to the trusted initializer realm; preview frames intentionally disallow scripts.
  const controller=new win.AbortController(), timers=new Set(), cleanups=[];
  const roots=[...(root.matches?.('[data-ps-source-connections]')?[root]:[]),...root.querySelectorAll('[data-ps-source-connections]')];
  const listen=(el,type,fn)=>el.addEventListener(type,fn,{signal:controller.signal});
  for(const block of roots) {
    const cards=[...block.querySelectorAll('[data-source]')];
    const original=cards.map(el=>parseSource({...el.dataset,id:el.dataset.source,name:el.querySelector('strong').textContent}));
    if(cards.length!==6 || new Set(original.map(x=>x.id)).size!==6 || original.reduce((n,x)=>n+x.weight,0)!==100) throw new Error('Connection demo requires six unique sources with total weight 100');
    const refs=new Map(cards.map(el=>[el.dataset.source,{card:el,port:block.querySelector(`[data-source-port="${el.dataset.source}"]`),status:el.querySelector('[data-source-status]'),indicator:el.querySelector('[data-source-indicator]')} ]));
    const initialSelection=cards.find(el=>el.getAttribute('aria-pressed')==='true')?.dataset.source||original[0].id;
    let sources=original.map(x=>({...x})),selected=initialSelection;
    const running=new Map();
    motion.track(block);
    const percent=block.querySelector('[data-connection-percent]'), count=block.querySelector('[data-connection-count]'), coverage=block.querySelector('[data-connection-coverage]');
    const title=block.querySelector('[data-connection-title]'), detailEl=block.querySelector('[data-connection-detail]');
    // A changed figure rolls in under a clip; unchanged text is left alone so a sync tick does not flicker it.
    const write=(el,text,roll)=>{if(el.textContent===text)return;el.textContent=text;if(roll)motion.play(el,motion.TICK,{duration:motion.PRESS});};
    const action=block.querySelector('[data-connection-action]'),disconnect=block.querySelector('[data-connection-disconnect]');
    // History: tall, softly rounded bars with a fine gap, drawn on a 160 × 48 grid from a shared baseline.
    for(const source of original) {
      const chart=refs.get(source.id).card.querySelector('svg');chart.setAttribute('viewBox','0 0 160 48');
      for(const [i,value] of source.history.entries()) { const bar=doc.createElementNS('http://www.w3.org/2000/svg','rect'),height=Math.max(4,value*.48); for(const [key,val] of Object.entries({x:i*8+.75,y:48-height,width:6.5,height,rx:2}))bar.setAttribute(key,String(val));chart.append(bar); }
    }
    // Coverage reads as a unit meter: twenty cells of five points each. The native progress stays the accessible value.
    const units=block.querySelector('.ps-coverage-units')||doc.createElement('span');units.className='ps-coverage-units';units.setAttribute('aria-hidden','true');
    const cells=Array.from({length:20},()=>doc.createElement('i'));units.replaceChildren(...cells);
    if(!units.isConnected)coverage.after(units);
    const stop=id=>{const timer=running.get(id);if(timer!==undefined){globalThis.clearInterval(timer);timers.delete(timer);running.delete(id);}};
    const render=(announce=false,rolled=announce)=>{
      for(const source of sources) {
        const {card,port,status,indicator}=refs.get(source.id);card.dataset.status=source.status;card.setAttribute('aria-pressed',String(selected===source.id));port.dataset.status=source.status;port.dataset.selected=String(selected===source.id);
        // Two facts are two spans, so a narrow card can set each on its own line instead of breaking after the separator.
        const parts=source.status==='connected'?[`${(source.rate/1000).toFixed(1)}k / day`,'Connected']:source.status==='error'?['Authorization expired']:source.status==='disconnected'?['Not connected']:[source.status==='paused'?'Sync paused':'Syncing',`${source.progress}%`];
        if(status.dataset.parts!==parts.join('|')){status.dataset.parts=parts.join('|');status.replaceChildren(...parts.flatMap((text,i)=>{const span=doc.createElement('span');span.textContent=text;if(!i)return [span];const sep=doc.createElement('span');sep.className='ps-source-sep';sep.textContent=' · ';return [sep,span];}));}
        indicator.textContent=source.status==='disconnected'?'+':source.status==='error'?'!':source.status==='connected'?'✓':`${source.progress}%`;
        for(const [i,bar] of [...card.querySelectorAll('svg rect')].entries())bar.dataset.available=String(source.status==='connected'||(['paused','syncing'].includes(source.status)&&i<source.progress/5));
      }
      const summary=connectionSummary(sources),source=sources.find(x=>x.id===selected);
      write(count,`${summary.ready} of ${sources.length} connected`,rolled);
      block.querySelector('[data-connection-rate]').textContent=`${new Intl.NumberFormat('en-US').format(summary.rate)} events / day`;
      coverage.value=summary.coverage;cells.forEach((cell,i)=>{if(i<Math.round(summary.coverage/5))cell.dataset.on='';else delete cell.dataset.on;});write(percent,`${summary.coverage}%`,rolled);
      title.textContent=source.name;
      const detail=source.status==='connected'?'Connected. Incoming events are included in the sample coverage.':source.status==='error'?'Authorization expired. Reconnect to restore access to this sample source.':source.status==='disconnected'?'Connect this sample source to include its events and extend coverage.':source.status==='paused'?`Backfill paused at ${source.progress}%. Resume to finish importing the sample history.`:`Importing sample history · ${source.progress}%. You can pause and resume without losing progress.`;
      detailEl.textContent=detail;
      const actionHadFocus=doc.activeElement===action;
      action.textContent=source.status==='connected'?'Connected':source.status==='syncing'?'Pause sync':source.status==='paused'?'Resume sync':source.status==='error'?'Reconnect':'Connect source';action.disabled=source.status==='connected';disconnect.disabled=source.status==='disconnected';
      if(actionHadFocus&&action.disabled)disconnect.focus();
      if(announce){block.querySelector('[data-connection-announcement]').textContent=`${source.name}. ${detail}`;block.dispatchEvent(new win.CustomEvent('pagesystem:connections',{bubbles:true,detail:{selected,sources:sources.map(({id,status,progress})=>({id,status,progress})),...summary}}));}
    };
    const update=(id,event)=>{sources=sources.map(source=>source.id===id?transitionSource(source,event):source);render(event!=='tick'||sources.find(x=>x.id===id).status==='connected',true);};
    // Choosing another source swaps the inspector copy with a short rise.
    for(const card of cards)listen(card,'click',()=>{const changed=selected!==card.dataset.source;selected=card.dataset.source;render(true);if(changed)for(const el of [title,detailEl])motion.play(el,motion.RISE,{duration:motion.PRESS});});
    listen(action,'click',()=>{
      const id=selected, source=sources.find(x=>x.id===id);
      stop(id);
      if(source.status==='syncing'){update(id,'pause');return;}
      if(source.status==='connected')return;
      update(id,'start');
      const timer=globalThis.setInterval(()=>{update(id,'tick');if(sources.find(x=>x.id===id).status!=='syncing')stop(id);},240);
      timers.add(timer);running.set(id,timer);
    });
    listen(disconnect,'click',()=>{stop(selected);update(selected,'disconnect');action.focus();});
    listen(block.querySelector('[data-connection-reset]'),'click',()=>{for(const id of running.keys())stop(id);sources=original.map(x=>({...x}));selected=initialSelection;render(true);});
    render();
    // The source map assembles once, the first time it is scrolled into view: each card's history grows from its
    // baseline in sequence and coverage draws to its value. Only presentation moves; the markup is already final.
    // Never under reduced motion; any press inside the block ends it at once; Replay restarts it cleanly.
    const replay=block.querySelector('[data-connection-replay]'), intro=new Set();
    const finishIntro=()=>{for(const animation of intro)animation.cancel();intro.clear();block.removeAttribute('aria-busy');};
    const playIntro=()=>{
      finishIntro();if(motion.reduced())return;
      const run=(el,frames,options)=>{const animation=motion.animate(el,frames,{fill:'backwards',...options});if(animation){intro.add(animation);animation.finished.then(()=>{intro.delete(animation);if(!intro.size)block.removeAttribute('aria-busy');},()=>{});}};
      block.setAttribute('aria-busy','true');
      cards.forEach((card,c)=>[...card.querySelectorAll('svg rect')].forEach((bar,i)=>run(bar,[{transform:'scaleY(0)'},{transform:'none'}],{delay:c*60+i*14})));
      cells.filter(cell=>cell.hasAttribute('data-on')).forEach((cell,i)=>run(cell,[{opacity:.2},{opacity:1}],{duration:160,delay:240+i*40}));
      run(percent,motion.TICK,{duration:motion.PRESS,delay:700});
      if(!intro.size)block.removeAttribute('aria-busy');
    };
    if(replay){replay.hidden=motion.reduced();listen(replay,'click',playIntro);}
    const interrupt=event=>{if(intro.size&&!replay?.contains(event.target))finishIntro();};
    listen(block,'pointerdown',interrupt);listen(block,'keydown',interrupt);
    if(motion.query)listen(motion.query,'change',()=>{if(motion.reduced())finishIntro();if(replay)replay.hidden=motion.reduced();});
    if(!motion.reduced())motion.onFirstView(block,playIntro);
    cleanups.push(finishIntro);
  }
  return()=>{controller.abort();for(const cleanup of cleanups)cleanup();for(const timer of timers)globalThis.clearInterval(timer);timers.clear();};
}

// Pure state operations shared by browser behaviors and tests.
function searchItems(items, query) {
  const terms = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item => terms.every(term => `${item.name} ${item.keywords || ''}`.toLocaleLowerCase().includes(term)));
}
function noticeState(ids) {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !id)) throw new Error('Notice IDs must be unique nonempty strings');
  return { ids: [...ids], dismissed: [] };
}
function remainingNotices(state) {
  const removed = new Set(state.dismissed);
  return state.ids.filter(id => !removed.has(id));
}
function transitionNotices(state, action) {
  if (action.type === 'reset') return noticeState(state.ids);
  if (action.type === 'undo') return {...state, dismissed: state.dismissed.slice(0,-1)};
  if (action.type === 'dismiss' && remainingNotices(state)[0] === action.id) return {...state, dismissed: [...state.dismissed,action.id]};
  return state;
}
function filterRecords(records, query, facets) {
  const types = new Set(facets.types), owners = new Set(facets.owners);
  return searchItems(records,query).filter(item => (!types.size || types.has(item.type)) && (!owners.size || owners.has(item.owner)));
}
const FILE_LIMITS = Object.freeze({count:5, bytes:10*1024*1024});
function fileIssue(file, occupied) {
  if (!file || typeof file.name !== 'string' || !Number.isSafeInteger(file.size) || file.size < 1) return 'This file is empty or unreadable.';
  if (file.size > FILE_LIMITS.bytes) return 'Each file must be 10 MiB or smaller.';
  if (occupied >= FILE_LIMITS.count) return 'Keep up to five files. Remove one to add another.';
  return null;
}
function fileKind(bytes) {
  const starts = expected => expected.every((byte,i)=>bytes[i]===byte);
  if (starts([137,80,78,71,13,10,26,10])) return 'image/png';
  if (starts([255,216,255])) return 'image/jpeg';
  if (starts([37,80,68,70,45])) return 'application/pdf';
  if (starts([82,73,70,70]) && [87,69,66,80].every((byte,i)=>bytes[i+8]===byte)) return 'image/webp';
  return null;
}
function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)} KiB` : `${(bytes/(1024*1024)).toFixed(1)} MiB`;
}

/* Shared motion for the native, connection and rich families. Motion is presentation only: callers commit state
   first, then ask for an animation that eases into it, so the DOM always holds the final state. Reduced motion skips
   everything; a change that follows a key press skips it too, and roots carry data-still so CSS transitions agree.
   Timers, frames and observers come from this module's realm: a sandboxed preview frame cannot run callbacks it
   schedules itself. Text never starts below 0.72 opacity, so contrast holds on every frame. */
function familyMotion(doc, win, signal) {
  const query = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced = () => !!query?.matches;
  const style = win.getComputedStyle(doc.documentElement);
  const token = (name, fallback) => { const value = style.getPropertyValue(name).trim(), n = parseFloat(value); return Number.isFinite(n) ? (value.endsWith('ms') ? n : value.endsWith('s') ? n * 1000 : n) : fallback; };
  const PRESS = token('--press', 160), SETTLE = token('--settle', 220), EASE = style.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
  const roots = new Set(), animations = new Set(), timers = new Set(), observers = new Set();
  let keyboard = false;
  const setKeyboard = next => { if (next === keyboard) return; keyboard = next; for (const el of roots) el.toggleAttribute('data-still', next); };
  // Capture phase, so the flag is set before any component handler reacts to the same key press.
  doc.addEventListener('keydown', () => setKeyboard(true), { capture: true, signal });
  doc.addEventListener('pointerdown', () => setKeyboard(false), { capture: true, signal });
  const register = animation => { animations.add(animation); const drop = () => animations.delete(animation); animation.finished.then(drop, drop); return animation; };
  // animate() honors reduced motion only (an explicit replay); play() also stays still after a key press.
  const animate = (el, keyframes, options = {}) => !el || reduced() || typeof el.animate !== 'function' ? null : register(el.animate(keyframes, { duration: SETTLE, easing: EASE, ...options }));
  const play = (el, keyframes, options) => keyboard ? null : animate(el, keyframes, options);
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const onFirstView = (el, fn) => {
    if (typeof IntersectionObserver !== 'function') { fn(); return; }
    const io = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { io.disconnect(); observers.delete(io); fn(); } }, { threshold: 0.25 });
    io.observe(el); observers.add(io);
  };
  // List reflow in O(n) layout reads: snapshot the visible rows, commit, then rows that stayed slide from their old
  // place and rows that arrived rise 4px. Rows that left are already gone, so the list collapses into the gap.
  const RISE = [{ opacity: .72, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }];
  const snapshot = rows => keyboard || reduced() ? null : new Map(rows.filter(el => !el.hidden && el.isConnected).map(el => [el, el.getBoundingClientRect().top]));
  const reflow = (before, rows) => {
    if (!before) return;
    for (const el of rows) {
      if (el.hidden || !el.isConnected) continue;
      const top = before.get(el);
      if (top === undefined) play(el, RISE);
      else { const dy = top - el.getBoundingClientRect().top; if (Math.abs(dy) > .5) play(el, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }]); }
    }
  };
  return {
    PRESS, SETTLE, EASE, RISE, reduced, query,
    // A changed value rolls up under a clip instead of fading, so it is never unreadable.
    TICK: [{ clipPath: 'inset(100% 0 0 0)', transform: 'translateY(4px)' }, { clipPath: 'inset(0)', transform: 'none' }],
    get still() { return keyboard || reduced(); },
    track: el => { roots.add(el); el.toggleAttribute('data-still', keyboard); },
    animate, play, later, onFirstView, snapshot, reflow,
    dispose: () => { for (const id of timers) clearTimeout(id); timers.clear(); for (const io of observers) io.disconnect(); observers.clear(); for (const animation of animations) animation.cancel(); animations.clear(); }
  };
}

/* Compound UI behaviors. State changes are immediate; motion is presentation only. */
function enhanceRichComponents(root, motion) {
  const doc = root.ownerDocument || root, win = doc.defaultView;
  const controller = new win.AbortController(), cleanups = [];
  let disposed = false;
  const find = selector => [...(root.matches?.(selector) ? [root] : []),...root.querySelectorAll(selector)];
  const listen = (el,type,fn) => el.addEventListener(type,fn,{signal:controller.signal});
  const emit = (el,name,detail) => el.dispatchEvent(new win.CustomEvent(name,{bubbles:true,detail}));
  const node = (tag,text,className) => { const el=doc.createElement(tag); if(text!==undefined) el.textContent=text; if(className) el.className=className; return el; };
  for (const block of find('[data-ps-command-menu]')) {
    const dialog=block.querySelector('dialog'), input=block.querySelector('[role="combobox"]');
    const options=[...block.querySelectorAll('[data-command]')];
    const items=options.map(el=>({id:el.dataset.command,name:el.textContent,keywords:el.dataset.keywords,el}));
    let visible=items, active=0, trigger, closing=null, afterClose=null;
    motion.track(block);
    const paint = () => {
      for(const item of items) item.el.setAttribute('aria-selected',String(item===visible[active]));
      if(visible[active]) input.setAttribute('aria-activedescendant',visible[active].el.id); else input.removeAttribute('aria-activedescendant');
    };
    const search = () => {
      visible=searchItems(items,input.value);active=0;const ids=new Set(visible.map(x=>x.id));
      for(const item of items) item.el.hidden=!ids.has(item.id);
      for(const group of block.querySelectorAll('[data-command-group]')) group.hidden=![...group.querySelectorAll('[data-command]')].some(el=>!el.hidden);
      block.querySelector('[data-command-empty]').hidden=visible.length>0;
      block.querySelector('[data-command-count]').textContent=`${visible.length} ${visible.length===1?'command':'commands'}`;paint();
    };
    const open = (from,query='') => {
      if(dialog.open) {input.focus();return;}
      trigger=from; input.value=query;search();dialog.showModal();input.setAttribute('aria-expanded','true');input.focus();
      // The panel grows from its trigger: the origin is the trigger's center, clamped to the panel.
      if(motion.still||!from?.isConnected) return;
      const panel=dialog.getBoundingClientRect(), at=from.getBoundingClientRect();
      const x=Math.min(Math.max(at.left+at.width/2-panel.left,0),panel.width), y=Math.min(Math.max(at.top+at.height/2-panel.top,0),panel.height);
      motion.play(dialog,[{opacity:.72,transform:'scale(.97)',transformOrigin:`${x}px ${y}px`},{opacity:1,transform:'none',transformOrigin:`${x}px ${y}px`}]);
    };
    // A pointer close shrinks back for --press before the dialog closes; a key press or reduced motion closes at once.
    const close = after => {
      if(!dialog.open) return;
      if(after) afterClose=after;
      if(closing) return;
      closing=motion.play(dialog,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.97)'}],{duration:motion.PRESS,fill:'forwards'});
      if(!closing){dialog.close();const run=afterClose;afterClose=null;run?.();return;}
      dialog.dataset.closing='';
      // A timer from this realm, not the animation's promise, ends the close: a sandboxed frame may not settle it.
      const ending=closing;
      motion.later(()=>{if(closing!==ending) return;dialog.close();const run=afterClose;afterClose=null;run?.();},motion.PRESS);
    };
    const choose = item => {
      if(!item) return;
      const label=item.el.querySelector('span:nth-child(2)').firstChild.textContent.trim();
      block.querySelector('[data-command-status]').textContent=`${label} selected. Demo only; no workspace changes.`;
      close(()=>emit(block,'pagesystem:command',{id:item.id,label}));
    };
    for(const el of block.querySelectorAll('[data-command-open],[data-command-preset]')) listen(el,'click',()=>open(el,el.dataset.commandPreset||''));
    listen(input,'input',search);
    listen(input,'keydown',event=>{
      if(event.isComposing) return;
      if(event.key==='ArrowDown'||event.key==='ArrowUp') {event.preventDefault();if(visible.length){active=(active+(event.key==='ArrowDown'?1:-1)+visible.length)%visible.length;paint();visible[active].el.scrollIntoView({block:'nearest'});}}
      if(event.key==='Enter') {event.preventDefault();choose(visible[active]);}
    });
    for(const item of items) listen(item.el,'click',()=>choose(item));
    listen(block.querySelector('[data-command-close]'),'click',()=>close());
    listen(dialog,'close',()=>{closing=null;delete dialog.dataset.closing;for(const animation of dialog.getAnimations({subtree:true})) animation.cancel();const run=afterClose;afterClose=null;run?.();input.setAttribute('aria-expanded','false');if(!disposed&&trigger?.isConnected) trigger.focus();});
    listen(dialog,'click',event=>{if(event.target!==dialog) return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) close();});
    listen(doc,'keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'&&doc.querySelector('[data-ps-command-menu]')===block){event.preventDefault();open(block.querySelector('[data-command-open]'));}});
    cleanups.push(()=>{if(dialog.open) dialog.close();});search();
  }
  for(const block of find('[data-ps-notification-stack]')) {
    const cards=[...block.querySelectorAll('[data-notice]')], byId=new Map(cards.map(el=>[el.dataset.notice,el]));
    let state=noticeState([...byId.keys()]);
    const undo=block.querySelector('[data-notice-undo]'), reset=block.querySelector('[data-notice-reset]'), empty=block.querySelector('[data-notice-empty]');
    motion.track(block);
    // Cards already in the deck slide between depths by CSS transition; a card or empty state that was hidden rises in.
    const render=(event,focus=false)=>{
      const ids=remainingNotices(state), positions=new Map(ids.map((id,index)=>[id,index]));
      const wasDepth=new Map(cards.map(card=>[card,card.dataset.depth])), wasEmpty=!empty.hidden;
      for(const card of cards){const depth=positions.get(card.dataset.notice);card.hidden=depth===undefined||depth>2;card.inert=depth!==0;card.setAttribute('aria-hidden',String(depth!==0));card.dataset.depth=String(depth??-1);if(depth!==0) card.querySelector('details').open=false;}
      block.querySelector('.ps-notice-deck').hidden=!ids.length;empty.hidden=!!ids.length;
      block.querySelector('[data-notice-count]').textContent=`${ids.length} ${ids.length===1?'update':'updates'}`;
      block.querySelector('[data-notice-status]').textContent=state.dismissed.length?`${state.dismissed.length} dismissed. Undo is available.`:'Sample notifications. Nothing changes outside this page.';
      undo.disabled=!state.dismissed.length;
      const front=byId.get(ids[0]);
      if(event&&front&&!['0','1'].includes(wasDepth.get(front))) motion.play(front,[{opacity:.72,transform:'translateY(-4px) scale(.985)'},{opacity:1,transform:'none'}]);
      if(event&&!empty.hidden&&!wasEmpty) motion.play(empty,motion.RISE);
      if(focus) (front?.querySelector('[data-notice-dismiss]')||reset).focus();
      if(event) emit(block,'pagesystem:notifications',{remaining:ids,dismissed:[...state.dismissed]});
    };
    for(const card of cards) listen(card.querySelector('[data-notice-dismiss]'),'click',event=>{state=transitionNotices(state,{type:'dismiss',id:card.dataset.notice});render(event,true);});
    listen(undo,'click',event=>{state=transitionNotices(state,{type:'undo'});render(event,true);});
    listen(reset,'click',event=>{state=transitionNotices(state,{type:'reset'});render(event,true);});render();
  }
  for(const block of find('[data-ps-filter-menu]')) {
    const query=block.querySelector('[data-filter-query]'), checks=[...block.querySelectorAll('input[type="checkbox"]')], chips=block.querySelector('[data-filter-chips]');
    const records=[...block.querySelectorAll('[data-record]')].map(el=>({id:el.dataset.record,name:el.dataset.name,type:el.dataset.type,owner:el.dataset.owner,el}));
    for(const check of checks) check.parentElement.querySelector('span').textContent=records.filter(item=>item[check.name==='types'?'type':'owner']===check.value).length;
    motion.track(block);
    const rows=records.map(item=>item.el);
    const render=(notify=true)=>{
      const before=notify?motion.snapshot(rows):null, chipsBefore=new Set([...chips.children].map(chip=>`${chip.dataset.facetName}:${chip.dataset.facetValue}`));
      const selected=checks.filter(el=>el.checked), facets={types:selected.filter(x=>x.name==='types').map(x=>x.value),owners:selected.filter(x=>x.name==='owners').map(x=>x.value)};
      const results=filterRecords(records,query.value,facets), ids=new Set(results.map(x=>x.id));
      for(const item of records) item.el.hidden=!ids.has(item.id);
      block.querySelector('[data-filter-count]').textContent=`${results.length} ${results.length===1?'file':'files'}`;
      block.querySelector('[data-facet-count]').textContent=`${selected.length} selected`;
      block.querySelector('[data-filter-empty]').hidden=results.length>0;chips.replaceChildren();
      for(const check of selected){const label=check.parentElement.childNodes[1].textContent.trim();const button=node('button',label,'ps-filter-chip');button.type='button';button.setAttribute('aria-label',`Remove ${label} filter`);const x=node('span','×');x.setAttribute('aria-hidden','true');button.append(x);button.dataset.facetName=check.name;button.dataset.facetValue=check.value;chips.append(button);}
      chips.hidden=!selected.length;
      // Surviving results slide into the space left by filtered rows; new results and new chips rise in.
      if(before){motion.reflow(before,rows);for(const chip of chips.children) if(!chipsBefore.has(`${chip.dataset.facetName}:${chip.dataset.facetValue}`)) motion.play(chip,[{opacity:.72,transform:'scale(.97)'},{opacity:1,transform:'none'}],{duration:motion.PRESS});}
      if(notify) emit(block,'pagesystem:filter',{query:query.value,...facets,ids:results.map(x=>x.id)});
    };
    listen(chips,'click',event=>{const button=event.target.closest('button[data-facet-name]');if(!button)return;const check=checks.find(x=>x.name===button.dataset.facetName&&x.value===button.dataset.facetValue);if(!check)return;const index=[...chips.children].indexOf(button);check.checked=false;render();(chips.children[Math.min(index,chips.children.length-1)]||query).focus();});
    listen(query,'input',()=>render());for(const check of checks) listen(check,'change',()=>render());
    listen(block.querySelector('[data-filter-clear]'),'click',()=>{for(const check of checks)check.checked=false;query.value='';render();query.focus();});render(false);
  }
  for(const block of find('[data-ps-file-dropzone]')) {
    const input=block.querySelector('input[type="file"]'), pick=block.querySelector('[data-file-pick]'), drop=block.querySelector('[data-file-drop]'), list=block.querySelector('[data-file-list]'), message=block.querySelector('[data-file-message]');
    const entries=new Map();let sequence=0,dragDepth=0;
    motion.track(block);
    const rowsOf=()=>[...entries.values()].map(entry=>entry.row);
    // A settled status rolls in under a clip, so the change from reading to ready or failed is seen, not just read.
    const settled=entry=>motion.play(entry.statusEl,motion.TICK,{duration:motion.PRESS});
    const announce=()=>{block.querySelector('[data-file-count]').textContent=`${entries.size} / ${FILE_LIMITS.count}`;emit(block,'pagesystem:files',{items:[...entries.values()].map(x=>({id:x.id,file:x.file,status:x.status,mime:x.mime||null}))});};
    const remove=entry=>{const before=motion.snapshot(rowsOf());entries.delete(entry.id);entry.controller.abort();entry.reader?.abort();entry.row.remove();motion.reflow(before,rowsOf());entry.preview.removeAttribute('src');announce();message.textContent=`${entry.file.name} removed. Nothing was uploaded.`;pick.focus();};
    const read=entry=>{
      entry.reader?.abort();entry.status='reading';entry.statusEl.textContent='Reading on this device…';entry.progress.hidden=false;entry.progress.value=0;entry.retry.hidden=true;entry.preview.hidden=true;entry.preview.removeAttribute('src');
      const reader=new win.FileReader();entry.reader=reader;
      const alive=()=>!disposed&&entries.get(entry.id)===entry&&entry.reader===reader;
      const fail=text=>{if(!alive())return;entry.status='failed';entry.statusEl.textContent=text;entry.progress.hidden=true;entry.retry.hidden=false;entry.preview.hidden=true;entry.preview.removeAttribute('src');entry.reader=null;announce();settled(entry);};
      reader.onprogress=event=>{if(alive()&&event.lengthComputable)entry.progress.value=event.loaded/event.total;};
      reader.onerror=()=>fail('Could not read this file. Try again.');
      reader.onload=()=>{
        if(!alive())return;
        const encoded=String(reader.result).split(',')[1]||'';let type;
        try{type=fileKind(Uint8Array.from(win.atob(encoded.slice(0,24)),x=>x.charCodeAt(0)));}catch{fail('This file could not be decoded.');return;}
        if(!type){fail('Unsupported content. Choose PNG, JPG, WebP or PDF.');return;}
        entry.mime=type;
        const ready=()=>{if(!alive())return;entry.status='ready';entry.statusEl.textContent=`${formatBytes(entry.file.size)} · Ready locally`;entry.progress.hidden=true;entry.reader=null;announce();settled(entry);};
        if(type.startsWith('image/')){entry.preview.onload=()=>{entry.preview.hidden=false;motion.play(entry.preview,[{opacity:0},{opacity:1}]);ready();};entry.preview.onerror=()=>fail('The image is damaged or cannot be previewed.');entry.preview.src=`data:${type};base64,${encoded}`;}
        else ready();
      };
      reader.readAsDataURL(entry.file);announce();
    };
    const add=files=>{
      const errors=[];
      for(const file of files){const issue=fileIssue(file,entries.size);if(issue){errors.push(`${file.name}: ${issue}`);continue;}
        const id=`file-${++sequence}`, row=node('li',undefined,'ps-file-row'), preview=node('img');preview.alt='';preview.hidden=true;
        const icon=node('span','▤','ps-record-icon');icon.setAttribute('aria-hidden','true');icon.append(preview);
        const text=node('div',undefined,'ps-file-copy'), name=node('strong',file.name), statusEl=node('span','Reading…'), progress=node('progress');progress.max=1;progress.value=0;progress.setAttribute('aria-label',`Reading ${file.name}`);text.append(name,statusEl,progress);
        const actions=node('div',undefined,'ps-file-actions'), retry=node('button','Retry','ps-text-action');retry.type='button';retry.hidden=true;retry.setAttribute('aria-label',`Retry ${file.name}`);
        const close=node('button','×','ps-icon-button');close.type='button';close.setAttribute('aria-label',`Remove ${file.name}`);actions.append(retry,close);row.append(icon,text,actions);list.append(row);motion.play(row,motion.RISE);
        const entry={id,file,row,preview,statusEl,progress,retry,status:'reading',reader:null,controller:new win.AbortController()};entries.set(id,entry);close.addEventListener('click',()=>remove(entry),{signal:entry.controller.signal});retry.addEventListener('click',()=>read(entry),{signal:entry.controller.signal});read(entry);
      }
      message.textContent=errors.length?errors.slice(0,3).join(' '):'Preparing your files locally. Nothing uploads.';input.value='';announce();
    };
    listen(pick,'click',()=>input.click());listen(input,'change',()=>add([...input.files]));
    listen(drop,'dragenter',event=>{event.preventDefault();dragDepth++;drop.dataset.dragging='true';});
    listen(drop,'dragover',event=>{event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';});
    listen(drop,'dragleave',event=>{event.preventDefault();dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)delete drop.dataset.dragging;});
    listen(drop,'drop',event=>{event.preventDefault();dragDepth=0;delete drop.dataset.dragging;add([...(event.dataTransfer?.files||[])]);});
    cleanups.push(()=>{for(const entry of entries.values()){entry.controller.abort();entry.reader?.abort();entry.preview.onload=null;entry.preview.onerror=null;entry.preview.removeAttribute('src');}entries.clear();});
  }
  // Animations, timers and observers belong to the shared motion instance, which the caller disposes.
  return ()=>{disposed=true;controller.abort();for(const cleanup of cleanups)cleanup();};
}

/* Native behaviors. Initialize a document or subtree once; dispose before remounting. */
function enhanceComponents(root) {
  const doc = root.ownerDocument || root;
  const win = doc.defaultView;
  const controller = new win.AbortController();
  const listen = (el, type, handler) => el.addEventListener(type, handler, { signal: controller.signal });
  const find = selector => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  const emit = (el, name, detail) => el.dispatchEvent(new win.CustomEvent(name, { bubbles: true, detail }));
  // One motion instance for the native, connection and rich families: one key/pointer tracker, one disposal.
  const motion = familyMotion(doc, win, controller.signal);
  for (const block of find('[data-ps-composer]')) {
    const form = block.querySelector('form');
    const input = form.elements.namedItem('brief');
    const intent = form.elements.namedItem('intent');
    const button = form.querySelector('button[type="submit"]');
    const result = block.querySelector('[data-brief-result]');
    motion.track(block);
    const update = () => {
      button.disabled = !input.value.trim() || !input.validity.valid;
      result.hidden = true;
      block.querySelector('[data-brief-text]').textContent = '';
      block.querySelector('[data-brief-title]').textContent = '';
    };
    listen(input, 'input', update);
    listen(intent, 'change', update);
    listen(input, 'keydown', event => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.isComposing) {
        event.preventDefault();
        if (!button.disabled) form.requestSubmit(button);
      }
    });
    listen(form, 'submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text || !input.validity.valid || !['page', 'review'].includes(intent.value)) return;
      block.querySelector('[data-brief-title]').textContent = intent.value === 'page' ? 'Page brief · prepared locally' : 'Site review · prepared locally';
      block.querySelector('[data-brief-text]').textContent = text;
      // The prepared brief rises into place; Control+Enter or reduced motion shows it at once.
      if (result.hidden) { result.hidden = false; motion.play(result, motion.RISE); } else motion.play(result.querySelector('[data-brief-text]'), motion.TICK, { duration: motion.PRESS });
      emit(block, 'pagesystem:brief', { text, intent: intent.value });
    });
    update();
  }
  for (const form of find('[data-ps-review-checklist]')) {
    const checks = [...form.querySelectorAll('input[type="checkbox"]')];
    const count = form.querySelector('[data-review-count]');
    motion.track(form);
    const update = (announce = true) => {
      const completed = checks.filter(input => input.checked).length, text = `${completed} of ${checks.length} checked`;
      // The count rolls when it changes; the check mark and progress fill ease by CSS, both still after a key press.
      if (count.textContent !== text) { count.textContent = text; if (announce) motion.play(count, motion.TICK, { duration: motion.PRESS }); }
      const progress = form.querySelector('progress');
      progress.max = checks.length;
      progress.value = completed;
      if (announce) emit(form, 'pagesystem:review', { completed, total: checks.length });
    };
    listen(form, 'change', () => update());
    listen(form, 'reset', event => {
      event.preventDefault();
      for (const input of checks) input.checked = input.defaultChecked;
      update();
    });
    update(false);
  }
  // The selected segment's surface slides from the previous choice. Native radios keep the state; arrow keys stay still.
  for (const group of find('.ps-segments')) {
    motion.track(group);
    let current = group.querySelector('input:checked');
    listen(group, 'change', event => {
      const next = event.target, previous = current;
      if (!next.matches?.('input[type="radio"]') || !next.checked) return;
      current = next;
      if (!previous || previous === next || motion.still) return;
      const from = previous.nextElementSibling?.getBoundingClientRect(), to = next.nextElementSibling?.getBoundingClientRect();
      if (!from || !to?.width) return;
      motion.play(next.nextElementSibling, [{ transform: `translateX(${from.left - to.left}px) scaleX(${from.width / to.width})` }, { transform: 'none' }], { pseudoElement: '::before' });
    });
  }
  const disposeProduct = enhanceProductComponents(root);
  const disposeTools = enhanceToolComponents(root);
  const disposeWorkflow = enhanceWorkflowComponents(root);
  const disposeData = enhanceDataComponents(root);
  const disposeConnections = enhanceConnections(root, motion);
  const disposeRich = enhanceRichComponents(root, motion);
  // Kit modules register initializers on PS_KITS; each receives the shared listener so disposal aborts it with the rest.
  // A sandboxed preview frame may not run callbacks it schedules itself, so kit timers and observers come from this
  // (trusted) realm; everything else reads through to the frame's own window. In an export the two are the same window.
  const scheduling = { setTimeout: (...args) => setTimeout(...args), clearTimeout: id => clearTimeout(id), setInterval: (...args) => setInterval(...args), clearInterval: id => clearInterval(id), requestAnimationFrame: callback => requestAnimationFrame(callback), cancelAnimationFrame: id => cancelAnimationFrame(id), IntersectionObserver: globalThis.IntersectionObserver, ResizeObserver: globalThis.ResizeObserver, MutationObserver: globalThis.MutationObserver };
  const kitWin = new Proxy(win, { get(target, key) { if (Object.hasOwn(scheduling, key)) return scheduling[key]; const value = target[key]; return typeof value === 'function' ? value.bind(target) : value; } });
  const disposeKits = (typeof PS_KITS === 'undefined' ? [] : PS_KITS).map(init => init(root, { doc, win: kitWin, listen, find, emit }) || (() => {}));
  // Ranges expose their position as --ps-fill so the track can show progress; scripts that move a range repaint on the same event.
  const ranges = find('input[type="range"]');
  const paintRanges = () => { for (const range of ranges) { const min = Number(range.min || 0), max = Number(range.max || 100); range.style.setProperty('--ps-fill', `${max > min ? (Number(range.value) - min) / (max - min) * 100 : 0}%`); } };
  if (ranges.length) { paintRanges(); for (const type of ['input', 'change', 'click', 'keyup']) listen(root, type, () => win.requestAnimationFrame(paintRanges)); }
  return () => { controller.abort(); for (const dispose of disposeKits) dispose(); disposeRich(); disposeConnections(); motion.dispose(); disposeData(); disposeWorkflow(); disposeTools(); disposeProduct(); };
}

