# Agent map (agent-map)

Kind: component. An agent answer that draws the route or places it found as a diagram beside an itinerary that names every stop and leg in text.

Task: Compare the ways an agent found to get somewhere, or the places it recommends, and pick one, with the map and the list always agreeing.

Elements: [button](button.md), [badge](badge.md), [text](text.md).

Category: agent.

Native behavior: agent-map. It needs pagesystem.js (see ../implementation.md).

## content

- The question asked, quoted, and the agent answer in plain text
- An inline SVG drawing labeled as sample and not to scale: streets as hairlines on the plot ink levels, water in one tint, parks as dashed outlines, and a few street and area names
- For a route, the chosen way in full ink and the other way of the same mode in gray, dotted for walking and solid for a vehicle
- Numbered pins that match the numbered stops or places in the list, with the destination's travel time beside its pin
- Travel modes in a segmented control, each with its time
- An itinerary: each stop with its kind and a practical detail, and the leg between stops with its mode, time, distance and the way it goes
- The other way of the same mode, named with its time and distance, with one action to take it
- For places, one numbered row per place with its name, kind, a practical detail and one sentence, in visiting order where there is one
- A visible sample badge and caption

## states

- settled: the default way on the map and in the itinerary, readable with no script
- mode changed: the route lines, the leg, the destination time and the other way updated together
- other way taken: the gray way becomes the chosen one and the chosen one turns gray
- stop or row pointed at: its pin ringed
- place selected: the row pressed and labeled Selected, its pin ringed and named on the map
- selection cleared
- framed: the view centered on what is shown, at the drawing's own scale
- reduced motion: no color transitions

## responsive

- Below 40rem of component width the map leads and the itinerary or places follow; from 40rem they sit side by side, the plan in a 15 to 19rem column.
- The map shows one drawing unit per pixel and centers on the shown routes and pins, so labels keep their size and the route is never cropped; where they are wider than the frame it zooms out just enough to fit them.
- The drawing runs past every edge the frame can show, so its edge never appears.
- The list layout reads the places first at full width, with the map beneath them at a fixed height.
- Travel modes stay on one row, each time set under its mode's name.

## checks

- Choosing a travel mode updates the route lines, the leg's mode, time, distance and way, the destination time on the map and the other way together, and announces the change in a status region.
- Take this way swaps the chosen and the other way of the same mode and keeps focus on the action that remains.
- The chosen route and the selected place are named in text as well as shown by ink, ring or fill.
- Choosing a row or a pin selects the same place everywhere and announces it with its position; choosing it again or pressing Escape clears it.
- Arrow keys, Home and End move between place rows with one tab stop; travel modes are native radio buttons with their own arrow keys.
- Pins are pointer shortcuts inside an image; every place stays reachable through its row.
- Map colors come only from the ink, surface and plot tokens; streets are thin flat lines with no fill or shading, and the drawing holds in light and dark themes and in forced colors.
- Each copy of the map on a page keeps its own travel-mode group.
- Disposal restores the settled view box, radio names and selection.
- No map tiles, images or network requests are used; routes, times, distances and places are labeled sample data.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Agent map</h1><p class="ps-note">A route an agent found, drawn as a diagram beside the itinerary that names every stop and leg.</p></header>
<section class="ps-agent-map" data-ps-agent-map data-am-variant="route" aria-label="Agent answer with a route map">
<p class="ps-am-asked"><span class="ps-am-asked-label">You asked</span> <span>Walk me from the Ferry Building up to Coit Tower.</span></p>
<p class="ps-am-answer">Two ways up Telegraph Hill. Up Kearny Street is quicker, about 22 minutes and uphill most of the way. Along the Embarcadero and up the Filbert Steps takes 30 minutes but stays flat for longer. The 39 bus and a short drive are below.</p>
<div class="ps-am-body">
<div class="ps-am-plan">
<fieldset class="ps-segments ps-am-modes"><legend class="ps-visually-hidden">How to get there</legend>
<label><input type="radio" name="am-mode" value="walk" checked><span>Walk<b class="ps-am-fig">22 min</b></span></label>
<label><input type="radio" name="am-mode" value="bus"><span>Bus 39<b class="ps-am-fig">15 min</b></span></label>
<label><input type="radio" name="am-mode" value="drive"><span>Drive<b class="ps-am-fig">9 min</b></span></label>
</fieldset>
<ol class="ps-am-stops">
<li class="ps-am-stop" data-am-stop="ferry"><span class="ps-am-node" aria-hidden="true">1</span><p class="ps-am-stop-text"><b>Ferry Building</b><span>Market hall · 15 ft</span></p>
<div class="ps-am-leg" data-am-way="walk-a" data-am-mode="walk" data-am-time="22 min"><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Walk <span class="ps-am-fig">22 min · 1.1 mi</span></p><p class="ps-am-leg-via">Up Washington and Kearny Street, climbing 270 ft</p></div></div>
<div class="ps-am-leg" data-am-way="walk-b" data-am-mode="walk" data-am-time="30 min" hidden><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Walk <span class="ps-am-fig">30 min · 1.4 mi</span></p><p class="ps-am-leg-via">Along the Embarcadero and up the Filbert Steps, flat until the steps</p></div></div>
<div class="ps-am-leg" data-am-way="bus" data-am-mode="bus" data-am-time="15 min" hidden><span class="ps-am-line" data-am-line="solid" aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Bus 39 <span class="ps-am-fig">15 min · 1.3 mi</span></p><p class="ps-am-leg-via">Up Montgomery Street to the stop at the tower</p></div></div>
<div class="ps-am-leg" data-am-way="drive" data-am-mode="drive" data-am-time="9 min" hidden><span class="ps-am-line" data-am-line="solid" aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Drive <span class="ps-am-fig">9 min · 1.7 mi</span></p><p class="ps-am-leg-via">Along the Embarcadero and up Lombard Street</p></div></div>
</li>
<li class="ps-am-stop" data-am-stop="coit"><span class="ps-am-node" aria-hidden="true">2</span><p class="ps-am-stop-text"><b>Coit Tower</b><span>Viewpoint · 285 ft</span></p></li>
</ol>
<div class="ps-am-other" data-am-other-of="walk-a"><span class="ps-am-line" data-am-line="dots" data-am-quiet aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Other way <span class="ps-am-fig">30 min · 1.4 mi</span></p><p class="ps-am-leg-via">Along the Embarcadero and up the Filbert Steps, flat until the steps</p><button type="button" class="ps-am-take" data-am-take="walk-b">Take this way</button></div></div>
<div class="ps-am-other" data-am-other-of="walk-b" hidden><span class="ps-am-line" data-am-line="dots" data-am-quiet aria-hidden="true"></span><div class="ps-am-leg-text"><p class="ps-am-leg-head">Other way <span class="ps-am-fig">22 min · 1.1 mi</span></p><p class="ps-am-leg-via">Up Washington and Kearny Street, climbing 270 ft</p><button type="button" class="ps-am-take" data-am-take="walk-a">Take this way</button></div></div>
</div>
<figure class="ps-am-map"><svg class="ps-am-drawing" viewBox="200 20 440 380" data-am-extent="-200 -200 1040 840" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="am-route-title"><title id="am-route-title">Sample map of northeast San Francisco, not to scale, with the chosen route from the Ferry Building to Coit Tower.</title>
<g class="ps-am-minor"><path d="M20 -200V640M90 -200V640M160 -200V640M230 -200V640M440 -200V640M510 -200V640"/><path d="M-200 10H840M-200 50H840M-200 170H840M-200 270H840M-200 360H840M-200 400H840M-200 450H840M-200 500H840"/></g>
<g class="ps-am-major"><path d="M300 640V150"/><path d="M370 640V-200"/><path d="M-200 90H840"/><path d="M-200 130H840"/><path d="M-200 230H840"/><path d="M-200 310H840"/></g>
<path class="ps-am-water" d="M612 640C598 520 586 400 586 300C586 230 572 170 548 128C520 80 478 30 420 -40C390 -80 350 -140 300 -200H840V640Z"/>
<path class="ps-am-shore" d="M612 640C598 520 586 400 586 300C586 230 572 170 548 128C520 80 478 30 420 -40C390 -80 350 -140 300 -200"/>
<path class="ps-am-avenue" id="am-route-emb" d="M292 -200C340 -120 378 -60 408 -22C464 46 504 94 530 140C552 180 564 236 564 300C564 400 576 520 590 640"/>
<path class="ps-am-major-line" d="M300 150C300 132 312 118 330 112"/>
<ellipse class="ps-am-park" cx="330" cy="110" rx="38" ry="24"/>
<g class="ps-am-labels"><text x="392" y="328">Washington St</text><text x="380" y="83">Lombard St</text><text x="400" y="122">Filbert St</text><text transform="translate(292 296) rotate(-90)">Kearny St</text><text transform="translate(362 296) rotate(-90)">Montgomery St</text><text class="ps-am-area" x="384" y="392">Financial District</text><text class="ps-am-area" x="150" y="196">North Beach</text><text class="ps-am-area" x="400" y="200">Telegraph Hill</text><text class="ps-am-named" x="286" y="80" text-anchor="end">Pioneer Park</text><text class="ps-am-named ps-am-on-water" x="548" y="28">San Francisco Bay</text><text><textPath href="#am-route-emb" startOffset="31%">The Embarcadero</textPath></text></g>
<g class="ps-am-routes"><path class="ps-am-r" data-am-way="walk-b" data-am-line="dots" data-am-state="other" d="M515 330C540 300 552 250 545 200C540 170 534 146 528 130H372C350 124 338 116 330 112"/><path class="ps-am-r" data-am-way="walk-a" data-am-line="dots" data-am-state="chosen" d="M515 330L515 310H300V150C300 132 312 118 330 112"/><path class="ps-am-r" data-am-way="bus" data-am-line="solid" data-am-state="off" d="M515 330L515 310H370V130C370 122 350 116 330 112"/><path class="ps-am-r" data-am-way="drive" data-am-line="solid" data-am-state="off" d="M515 330C540 300 552 250 545 200C536 150 518 112 500 90H350C342 96 336 104 330 112"/></g>
<g class="ps-am-pins"><g class="ps-am-pin" data-am-stop="ferry" transform="translate(515 330)"><circle r="11"/><text dy="4" text-anchor="middle">1</text></g><text class="ps-am-pin-label" x="497" y="352" text-anchor="end">Ferry Building</text><g class="ps-am-pin" data-am-stop="coit" transform="translate(330 112)"><circle r="11"/><text dy="4" text-anchor="middle">2</text></g><text class="ps-am-pin-label" x="374" y="104">Coit Tower <tspan class="ps-am-pin-time" data-am-pin-time>22 min</tspan></text></g>
</svg></figure>
</div>
<p class="ps-am-note"><span class="ps-badge">Sample</span> Illustrative map, not to scale. Routes, times and distances are sample data.</p>
<p class="ps-visually-hidden" role="status" data-am-status></p>
</section>
</main>
```

## Variant: Recommendations

Five recommended places in walking order, numbered alike on the list and the map and joined by the walk between them; choosing a row or a pin selects the same place.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Agent map: recommendations</h1><p class="ps-note">Five places an agent suggested, in the order to walk them, numbered alike on the list and the map; choosing either side selects the same place.</p></header>
<section class="ps-agent-map" data-ps-agent-map data-am-variant="places" aria-label="Agent answer with recommended places on a map">
<p class="ps-am-asked"><span class="ps-am-asked-label">You asked</span> <span>What should I see in Chicago this afternoon?</span></p>
<p class="ps-am-answer">Five stops between Willis Tower and the river, none more than a 15-minute walk from the next. Start at the Skydeck while the light is high and finish on the Riverwalk toward sunset.</p>
<div class="ps-am-body">
<div class="ps-am-plan">
<ol class="ps-am-places" aria-label="Recommended places, in walking order">
<li><button type="button" class="ps-am-place" data-am-place="willis" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">1</span><span class="ps-am-place-text"><b>Willis Tower Skydeck</b><span class="ps-am-kind">Observation deck · last entry 6:30 PM</span><span class="ps-am-desc">Glass ledges on the 103rd floor, with a view over the city and the lake.</span></span><span class="ps-am-picked">Selected</span></button><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span></li>
<li><button type="button" class="ps-am-place" data-am-place="library" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">2</span><span class="ps-am-place-text"><b>Harold Washington Library</b><span class="ps-am-kind">Library · open until 7 PM</span><span class="ps-am-desc">The central library, known for the glass-roofed Winter Garden on its ninth floor.</span></span><span class="ps-am-picked">Selected</span></button><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span></li>
<li><button type="button" class="ps-am-place" data-am-place="temple" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">3</span><span class="ps-am-place-text"><b>Chicago Temple</b><span class="ps-am-kind">Church · built 1924</span><span class="ps-am-desc">A Gothic skyscraper church, with a small chapel at the top of its spire.</span></span><span class="ps-am-picked">Selected</span></button><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span></li>
<li><button type="button" class="ps-am-place" data-am-place="cultural" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">4</span><span class="ps-am-place-text"><b>Chicago Cultural Center</b><span class="ps-am-kind">Landmark · next tour 4 PM</span><span class="ps-am-desc">The city’s first central library; tours end under the Tiffany glass dome.</span></span><span class="ps-am-picked">Selected</span></button><span class="ps-am-line" data-am-line="dots" aria-hidden="true"></span></li>
<li><button type="button" class="ps-am-place" data-am-place="riverwalk" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">5</span><span class="ps-am-place-text"><b>Chicago Riverwalk</b><span class="ps-am-kind">Riverside · sunset 5:32 PM</span><span class="ps-am-desc">The path along the main branch of the river, below the bridges and towers.</span></span><span class="ps-am-picked">Selected</span></button></li>
</ol>
</div>
<figure class="ps-am-map"><svg class="ps-am-drawing" viewBox="100 40 400 360" data-am-extent="-300 -300 1500 1240" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="am-rec-title"><title id="am-rec-title">Sample map of the Chicago Loop, not to scale, with five recommended places numbered in walking order.</title>
<g class="ps-am-minor"><path d="M190 -300V940M230 -300V940M310 -300V940M390 -300V940M470 -300V940M520 -300V940"/><path d="M-300 125H1200M-300 230H1200M-300 265H1200M-300 335H1200M-300 410H1200M-300 450H1200"/></g>
<g class="ps-am-major"><path d="M120 -300V940"/><path d="M270 95V940"/><path d="M350 95V940"/><path d="M430 95V940"/><path d="M-300 95H1200"/><path d="M-300 160H1200"/><path d="M-300 195H1200"/><path d="M-300 300H1200"/><path d="M-300 370H1200"/></g>
<path class="ps-am-water" d="M-300 40H1200V80H110V940H80V80H-300Z"/>
<path class="ps-am-shore" d="M-300 40H1200M-300 80H80V940M110 940V80H1200"/>
<path class="ps-am-park" d="M450 110H580V340H450Z"/>
<g class="ps-am-labels"><text transform="translate(132 340) rotate(-90)">Wacker Dr</text><text x="182" y="294">Adams St</text><text x="370" y="364">Van Buren St</text><text x="322" y="189">Washington St</text><text x="130" y="154">Randolph St</text><text transform="translate(344 340) rotate(-90)">State St</text><text transform="translate(264 290) rotate(-90)">Clark St</text><text transform="translate(424 300) rotate(-90)">Michigan Ave</text><text class="ps-am-area" x="160" y="245">The Loop</text><text class="ps-am-named" x="515" y="230" text-anchor="middle">Millennium Park</text><text class="ps-am-named ps-am-on-water" x="200" y="66">Chicago River</text></g>
<g class="ps-am-routes"><path class="ps-am-r" data-am-line="dots" data-am-state="chosen" d="M160 300V370H350M350 370H310V195H270M270 195V160H420V178M420 178V95H400"/></g>
<g class="ps-am-pins"><g class="ps-am-pin" data-am-place="willis" transform="translate(160 300)"><circle r="11"/><text dy="4" text-anchor="middle">1</text></g><g class="ps-am-pin" data-am-place="library" transform="translate(350 370)"><circle r="11"/><text dy="4" text-anchor="middle">2</text></g><g class="ps-am-pin" data-am-place="temple" transform="translate(270 195)"><circle r="11"/><text dy="4" text-anchor="middle">3</text></g><g class="ps-am-pin" data-am-place="cultural" transform="translate(420 178)"><circle r="11"/><text dy="4" text-anchor="middle">4</text></g><g class="ps-am-pin" data-am-place="riverwalk" transform="translate(400 95)"><circle r="11"/><text dy="4" text-anchor="middle">5</text></g><text class="ps-am-pin-label" data-am-picked-label hidden></text></g>
</svg></figure>
</div>
<p class="ps-am-note"><span class="ps-badge">Sample</span> Illustrative map, not to scale. Places, hours and descriptions are sample data.</p>
<p class="ps-visually-hidden" role="status" data-am-status></p>
</section>
</main>
```

## Variant: List

Three suggested places as full-width rows with kind, address and time to spend, followed by the map with each place numbered as in the list.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Agent map: list</h1><p class="ps-note">The suggested places read first as full rows, with the map below for where they are.</p></header>
<section class="ps-agent-map" data-ps-agent-map data-am-variant="places" data-am-layout="list" aria-label="Agent answer with suggested places and a map">
<p class="ps-am-asked"><span class="ps-am-asked-label">You asked</span> <span>I have a morning in Boston. Where should I go?</span></p>
<p class="ps-am-answer">Three on the Freedom Trail downtown, none more than ten minutes apart on foot.</p>
<div class="ps-am-body">
<div class="ps-am-plan">
<ol class="ps-am-places" aria-label="Suggested places">
<li><button type="button" class="ps-am-place" data-am-place="statehouse" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">1</span><span class="ps-am-place-text"><b>Old State House</b><span class="ps-am-kind">Historic building · 206 Washington St · about 15 min</span><span class="ps-am-desc">A brick statehouse from 1713; the Declaration of Independence was read from its balcony.</span></span><span class="ps-am-picked">Selected</span></button></li>
<li><button type="button" class="ps-am-place" data-am-place="chapel" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">2</span><span class="ps-am-place-text"><b>King’s Chapel</b><span class="ps-am-kind">Chapel · 58 Tremont St · about 45 min</span><span class="ps-am-desc">A granite chapel whose crypt tour runs beneath the floor of the nave.</span></span><span class="ps-am-picked">Selected</span></button></li>
<li><button type="button" class="ps-am-place" data-am-place="meeting" aria-pressed="false"><span class="ps-am-node" aria-hidden="true">3</span><span class="ps-am-place-text"><b>Old South Meeting House</b><span class="ps-am-kind">Meeting house · 310 Washington St · about 30 min</span><span class="ps-am-desc">The meeting house where the Boston Tea Party began in December 1773.</span></span><span class="ps-am-picked">Selected</span></button></li>
</ol>
</div>
<figure class="ps-am-map"><svg class="ps-am-drawing" viewBox="120 100 520 320" data-am-extent="-400 -300 1600 1100" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="am-list-title"><title id="am-list-title">Sample map of downtown Boston, not to scale, with three suggested places numbered as in the list.</title>
<g class="ps-am-minor"><path d="M-400 120H1200M-400 250H1200M-400 440H1200M-400 520H1200"/><path d="M450 -300V800M600 -300V800M700 -300V800M200 -300V800M110 -300V800"/></g>
<g class="ps-am-major"><path d="M180 800C220 600 270 420 300 300C320 220 330 120 340 -300"/><path d="M398 -300C392 60 388 300 382 800"/><path d="M-400 190H1200"/><path d="M300 300C330 296 360 292 390 290"/><path d="M386 360H1200"/><path d="M520 -300V800"/></g>
<path class="ps-am-water" d="M860 -300C820 0 800 300 840 520C870 680 900 760 920 800H1200V-300Z"/>
<path class="ps-am-shore" d="M860 -300C820 0 800 300 840 520C870 680 900 760 920 800"/>
<path class="ps-am-park" d="M40 420L210 410C200 500 190 580 180 640L20 650Z"/>
<rect class="ps-am-park" x="250" y="30" width="200" height="110"/>
<g class="ps-am-labels"><text transform="translate(270 404) rotate(-74)">Tremont St</text><text transform="translate(392 470) rotate(-90)">Washington St</text><text x="430" y="184">State St</text><text x="430" y="354">Milk St</text><text x="306" y="318">School St</text><text transform="translate(514 300) rotate(-90)">Congress St</text><text class="ps-am-area" x="420" y="470">Downtown Crossing</text><text class="ps-am-named" x="350" y="90" text-anchor="middle">City Hall Plaza</text><text class="ps-am-named" x="110" y="530" text-anchor="middle">Boston Common</text><text class="ps-am-named ps-am-on-water" x="880" y="300">Boston Harbor</text></g>
<g class="ps-am-pins"><g class="ps-am-pin" data-am-place="statehouse" transform="translate(396 190)"><circle r="11"/><text dy="4" text-anchor="middle">1</text></g><g class="ps-am-pin" data-am-place="chapel" transform="translate(304 290)"><circle r="11"/><text dy="4" text-anchor="middle">2</text></g><g class="ps-am-pin" data-am-place="meeting" transform="translate(386 360)"><circle r="11"/><text dy="4" text-anchor="middle">3</text></g><text class="ps-am-pin-label" data-am-picked-label hidden></text></g>
</svg></figure>
</div>
<p class="ps-am-note"><span class="ps-badge">Sample</span> Illustrative map, not to scale. Places, addresses and times are sample data.</p>
<p class="ps-visually-hidden" role="status" data-am-status></p>
</section>
</main>
```
