// Échecs : une partie d'échecs contre l'ordinateur, sept niveaux.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels, échiquier et pièces en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Échecs</span><span class="hint" id="chInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="chCv" width="176" height="198"></canvas></div>
    <div class="gSide">
      <div class="row"><button class="btn main" id="chNew">NOUVELLE PARTIE</button><button class="btn" id="chUndo">ANNULER</button></div>
      <div class="row"><select class="f gSel" id="chLevel"><option value="0">Débutant</option><option value="1">Facile</option><option value="2" selected>Moyen</option><option value="3">Difficile</option><option value="4">Expert</option><option value="5">Maître</option><option value="6">Grand maître</option></select><select class="f gSel" id="chColor"><option value="w" selected>Je joue les blancs</option><option value="b">Je joue les noirs</option><option value="r">Couleur au hasard</option></select></div>
      <div class="sysCard"><b>PRISES</b><div class="chTaken" id="chTakenMe"></div><div class="chTaken" id="chTakenAi"></div></div>
      <div class="sysCard"><b>COUPS</b><div id="chMoves" class="chMoves"></div></div>
      <div class="hint">Clique une pièce puis sa case d'arrivée, ou fais-la glisser. Notation française : R roi, D dame, T tour, F fou, C cavalier. La partie en cours est gardée.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:0 1 auto;min-width:min(100%,340px);position:relative}
.gameBox canvas{image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none;width:min(calc(100vw - 80px),max(300px,calc((100vh - 190px) * 176 / 198)));height:auto;aspect-ratio:176/198}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.chTaken{display:flex;align-items:center;flex-wrap:wrap;gap:2px;min-height:34px}
.chTaken img{width:32px;height:32px;image-rendering:pixelated}
.chTaken span{margin-right:8px;opacity:.7}
.chTaken b{margin-left:8px}
.chMoves{overflow-y:auto;max-height:max(140px,calc(100vh - 560px))}
.chMv{display:grid;grid-template-columns:44px 1fr 1fr;padding:3px 6px;align-items:center}
.chMv:nth-child(even){background:rgba(255,255,255,.05)}
.chMv .n{opacity:.55}
.chMv .on{background:rgba(255,106,213,.28);outline:2px solid rgba(255,106,213,.6);padding:0 4px;justify-self:start}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, sfx } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "ÉCHECS", T: {"k": "#07020f", "k2": "#120828", "fill": "#1c1038", "fillOn": "#2a1850", "hl": "#382066", "line": "#5a3a8a", "acc": "#ffd84a", "accL": "#fff4b0", "accS": "#c09a20", "accD": "#4a3a08", "rivet": "#fff4b0", "btn": "#382066", "btnHi": "#6a4aa0", "btnLo": "#120828", "btnHov": "#4a2a80", "btnHovHi": "#8a6ac0", "text": "#f8f0ff", "muted": "#b8a8d8", "acc2": "#ff6ad5", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#0a0418", "bgDot": "#1c1038", "bgDot2": "#120828", "spark": "#5a3a8a", "spark2": "#ffd84a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["....kggk....", "..kkggggkk..", "....kggk....", "..kkkkkkkk..", ".kwwwwwwwwk.", ".kwwgwwgwwk.", "..kwwwwwwk..", "..kwwwwwwk..", "...kwwwwk...", "..kkkkkkkk..", ".kwwwwwwwwk.", ".kkkkkkkkkk."],
  icons: [[/^NOUVELLE/, "play"], [/^PRISES/, "crown"], [/^COUPS/, "note"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const LEGACY_GAMES = {"top":["chess"],"best":"^$"};
  let games = await doc('games');
  if (games == null) {  // première ouverture : tu retrouves tes records et tes parties d'avant
    const old = legacy.api ? await legacy.api('games').catch(() => null) : null; games = { best: {} };
    if (old) { const re = new RegExp(LEGACY_GAMES.best); for (const [k, v] of Object.entries(old.best || {})) if (re.test(k)) games.best[k] = v; for (const k of LEGACY_GAMES.top) if (old[k] !== undefined) games[k] = old[k]; await folder.write('games', games); }
  }
  games = { best: {}, ...games };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const gstore = (k, init) => (games[k] ??= init);
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.82)'; g.fillRect(0, y0 - 18, w, lines.length * 16 + 16);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 16 + (size > 8 ? 4 : 0), color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
let actx = null, chMute = false;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .06, at = 0) => { if (chMute) return; try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
const chToc = () => { beep(200, .07, 'triangle', 110, .14); beep(900, .02, 'square', 0, .02); };
const chClac = () => { beep(460, .06, 'square', 220, .07); beep(150, .09, 'triangle', 70, .12); };
  // ---- les règles et l'ordinateur ----
/* ---------- chess rules and engine: board = 64 chars from a8 to h1, uppercase = white, '.' = empty ---------- */
function chessCore() {
  const VAL = {p: 100, n: 320, b: 330, r: 500, q: 900, k: 0};
  const PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
    e: [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50],
  };
  const isW = x => x >= 'A' && x <= 'Z', isB = x => x >= 'a' && x <= 'z';
  const ND = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]], BD = [[-1, -1], [-1, 1], [1, -1], [1, 1]], RD = [[-1, 0], [1, 0], [0, -1], [0, 1]], KD = BD.concat(RD);
  const start = () => ({b: [...'rnbqkbnrpppppppp' + '.'.repeat(32) + 'PPPPPPPPRNBQKBNR'], w: true, c: 'KQkq', ep: -1, h: 0});
  function attacked(b, sq, byW) {
    const r = sq >> 3, c = sq & 7, [P, N, B, R, Q, K] = byW ? 'PNBRQK' : 'pnbrqk', pr = byW ? r + 1 : r - 1;
    if (pr >= 0 && pr < 8 && ((c > 0 && b[pr * 8 + c - 1] === P) || (c < 7 && b[pr * 8 + c + 1] === P))) return true;
    for (const [dr, dc] of ND) { const y = r + dr, x = c + dc; if (y >= 0 && y < 8 && x >= 0 && x < 8 && b[y * 8 + x] === N) return true; }
    for (const [dr, dc] of KD) { const y = r + dr, x = c + dc; if (y >= 0 && y < 8 && x >= 0 && x < 8 && b[y * 8 + x] === K) return true; }
    for (const [dirs, S] of [[BD, B], [RD, R]]) for (const [dr, dc] of dirs) for (let y = r + dr, x = c + dc; y >= 0 && y < 8 && x >= 0 && x < 8; y += dr, x += dc) {
      const v = b[y * 8 + x]; if (v === '.') continue; if (v === S || v === Q) return true; break;
    }
    return false;
  }
  function gen(s, capsOnly) {  // pseudo-legal moves {f, t, cap, p (promotion), ep, dbl}
    const b = s.b, w = s.w, out = [], mine = w ? isW : isB, theirs = w ? isB : isW;
    for (let sq = 0; sq < 64; sq++) {
      const pc = b[sq]; if (!mine(pc)) continue;
      const t = pc.toLowerCase(), r = sq >> 3, c = sq & 7;
      if (t === 'p') {
        const d = w ? -1 : 1, r1 = r + d, last = r1 === (w ? 0 : 7);
        const add = (to, cap, ep) => { if (last) for (const p of 'qnrb') out.push({f: sq, t: to, cap, p: w ? p.toUpperCase() : p}); else out.push({f: sq, t: to, cap, ep}); };
        if (b[r1 * 8 + c] === '.' && (!capsOnly || last)) { add(r1 * 8 + c, '.'); if (!capsOnly && r === (w ? 6 : 1) && b[(r + 2 * d) * 8 + c] === '.') out.push({f: sq, t: (r + 2 * d) * 8 + c, cap: '.', dbl: true}); }
        for (const dc of [-1, 1]) { const x = c + dc; if (x < 0 || x > 7) continue; const to = r1 * 8 + x; if (theirs(b[to])) add(to, b[to]); else if (to === s.ep) add(to, w ? 'p' : 'P', true); }
        continue;
      }
      const dirs = t === 'n' ? ND : t === 'b' ? BD : t === 'r' ? RD : KD, slide = t === 'b' || t === 'r' || t === 'q';
      for (const [dr, dc] of dirs) for (let y = r + dr, x = c + dc; y >= 0 && y < 8 && x >= 0 && x < 8; y += dr, x += dc) {
        const to = y * 8 + x, v = b[to];
        if (mine(v)) break;
        if (v !== '.') { out.push({f: sq, t: to, cap: v}); break; }
        if (!capsOnly) out.push({f: sq, t: to, cap: '.'});
        if (!slide) break;
      }
      if (t === 'k' && !capsOnly && sq === (w ? 60 : 4)) {
        const [K, Q, R] = w ? 'KQR' : 'kqr', e = !w;
        if (s.c.includes(K) && b[sq + 1] === '.' && b[sq + 2] === '.' && b[sq + 3] === R && !attacked(b, sq, e) && !attacked(b, sq + 1, e) && !attacked(b, sq + 2, e)) out.push({f: sq, t: sq + 2, cap: '.'});
        if (s.c.includes(Q) && b[sq - 1] === '.' && b[sq - 2] === '.' && b[sq - 3] === '.' && b[sq - 4] === R && !attacked(b, sq, e) && !attacked(b, sq - 1, e) && !attacked(b, sq - 2, e)) out.push({f: sq, t: sq - 2, cap: '.'});
      }
    }
    return out;
  }
  function make(s, m) {
    const b = s.b.slice(), pc = b[m.f];
    b[m.t] = m.p || pc; b[m.f] = '.';
    if (m.ep) b[m.t + (s.w ? 8 : -8)] = '.';
    if ((pc === 'K' || pc === 'k') && Math.abs(m.t - m.f) === 2) { if (m.t > m.f) { b[m.f + 1] = b[m.f + 3]; b[m.f + 3] = '.'; } else { b[m.f - 1] = b[m.f - 4]; b[m.f - 4] = '.'; } }
    let c = s.c;
    if (c) {
      if (pc === 'K') c = c.replace(/[KQ]/g, ''); if (pc === 'k') c = c.replace(/[kq]/g, '');
      for (const q of [m.f, m.t]) c = c.replace({63: 'K', 56: 'Q', 7: 'k', 0: 'q'}[q] || '#', '');
    }
    return {b, w: !s.w, c, ep: m.dbl ? (m.f + m.t) / 2 : -1, h: pc === 'P' || pc === 'p' || m.cap !== '.' ? 0 : s.h + 1};
  }
  const kingOf = (b, w) => b.indexOf(w ? 'K' : 'k');
  const inCheck = s => attacked(s.b, kingOf(s.b, s.w), !s.w);
  const ok = (s, n) => !attacked(n.b, kingOf(n.b, s.w), !s.w);  // the side that moved is not left in check
  const legal = s => gen(s).filter(m => ok(s, make(s, m)));
  const key = s => s.b.join('') + (s.w ? 'w' : 'b') + s.c + s.ep;
  function evaluate(s) {
    let v = 0, mat = 0;
    for (const x of s.b) if (x !== '.' && x !== 'p' && x !== 'P') mat += VAL[x.toLowerCase()];
    const end = mat <= 2600;  // both sides: about a rook and a minor piece each, or less
    for (let i = 0; i < 64; i++) {
      const x = s.b[i]; if (x === '.') continue;
      const t = x.toLowerCase(), tab = t === 'k' && end ? PST.e : PST[t];
      if (isW(x)) v += VAL[t] + tab[i]; else v -= VAL[t] + tab[i ^ 56];
    }
    return s.w ? v : -v;
  }
  const MATE = 100000;
  let nodes = 0, deadline = 0, stop = false;
  const order = (s, ms) => ms.map(m => [m, (m.cap !== '.' ? 10 * VAL[m.cap.toLowerCase()] - VAL[s.b[m.f].toLowerCase()] + 1000 : 0) + (m.p ? VAL[m.p.toLowerCase()] : 0)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  function qs(s, alpha, beta, ply) {
    const stand = evaluate(s);
    if (stand >= beta || ply > 30) return stand;
    if (stand > alpha) alpha = stand;
    for (const m of order(s, gen(s, true))) {
      const n = make(s, m); if (!ok(s, n)) continue;
      const v = -qs(n, -beta, -alpha, ply + 1);
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function search(s, depth, alpha, beta, ply, hist) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) stop = true;
    if (stop) return 0;
    if (s.h >= 100 || hist.includes(key(s))) return 0;  // fifty moves, or a position already seen: a draw
    if (depth <= 0) return qs(s, alpha, beta, ply);
    let any = false, bestV = -Infinity;
    hist.push(key(s));
    for (const m of order(s, gen(s))) {
      const n = make(s, m); if (!ok(s, n)) continue;
      any = true;
      const ext = ply < 8 && attacked(n.b, kingOf(n.b, n.w), s.w) ? 1 : 0;  // a check is searched one move deeper
      const v = -search(n, depth - 1 + ext, -beta, -alpha, ply + 1, hist);
      if (v > bestV) bestV = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    hist.pop();
    if (!any) return inCheck(s) ? -MATE + ply : 0;
    return bestV;
  }
  const LEVELS = [{d: 1, noise: 220, ms: 4000}, {d: 2, noise: 60, ms: 4000}, {d: 3, noise: 0, ms: 3000}, {d: 30, noise: 0, ms: 1500}, {d: 30, noise: 0, ms: 4000}, {d: 30, noise: 0, ms: 8000}, {d: 30, noise: 0, ms: 15000}];
  function think({s, hist, level}) {  // best move for the side to move
    const lv = LEVELS[level], root = order(s, legal(s));
    if (!root.length) return null;
    nodes = 0; stop = false; deadline = Date.now() + lv.ms;
    let best = root[0];
    for (let d = 1; d <= lv.d; d++) {
      let alpha = -Infinity, cur = null;
      for (const m of [best, ...root.filter(x => x !== best)]) {
        let v = -search(make(s, m), d - 1, -Infinity, lv.noise ? Infinity : -alpha, 1, hist.slice());
        if (stop) break;
        v += (Math.random() * 2 - 1) * lv.noise;
        if (v > alpha) { alpha = v; cur = m; }
      }
      if (stop) break;
      best = cur;
      if (alpha > MATE - 100) break;  // a forced mate found
    }
    return {f: best.f, t: best.t, p: best.p || ''};
  }
  return {start, legal, make, inCheck, key, think, isW};
}

/* ---------- Échecs : l'interface ---------- */
const CH = chessCore();
const chessWorker = new Worker(URL.createObjectURL(new Blob([`const C = (${chessCore})(); onmessage = e => postMessage({id: e.data.id, m: C.think(e.data)});`], {type: 'text/javascript'})));
// les pièces en 16 × 16 : o contour, w corps, h reflet, s ombre, k détails (yeux, croix, joyaux)
const CH_ART = {
  p: ['................', '................', '......oooo......', '.....ohwwso.....', '.....owwwso.....', '......owso......', '.....oowsoo.....', '......owso......', '......owso......', '.....owwwso.....', '....owwwwwso....', '...owwwwwwwso...', '..oooooooooooo..', '..ohwwwwwwwwso..', '..oooooooooooo..', '................'],
  r: ['................', '..ooo.oooo.ooo..', '..ohwoohwoohso..', '..ohwwwwwwwwso..', '..oooooooooooo..', '...ohwwwwwwso...', '...ohwwwwwwso...', '...ohwwwwwwso...', '...ohwwwwwwso...', '...ohwwwwwwso...', '..oooooooooooo..', '..ohwwwwwwwwso..', '.oooooooooooooo.', '.ohwwwwwwwwwwso.', '.oooooooooooooo.', '................'],
  n: ['................', '.......o........', '......owoo......', '.....owwwwoo....', '....owkwwwwwo...', '...owwwwwwwwso..', '..owwwwwwwwwso..', '..ooooo.owwwso..', '.......owwwwso..', '......owwwwwso..', '.....owwwwwwso..', '....owwwwwwwso..', '..oooooooooooo..', '..ohwwwwwwwwso..', '..oooooooooooo..', '................'],
  b: ['.......oo.......', '......owwo......', '.......oo.......', '......owso......', '.....owwwso.....', '....owwwkwso....', '....owwkwwso....', '....owkwwwso....', '.....owwwso.....', '......owso......', '.....oooooo.....', '....owwwwwso....', '..oooooooooooo..', '..ohwwwwwwwwso..', '..oooooooooooo..', '................'],
  q: ['..o....oo....o..', '.oko..okko..oko.', '..oo.o.oo.o.oo..', '..owoowwwwoowo..', '..owwwwwwwwwso..', '...owwwkwwwso...', '...owwwwwwwso...', '....owwwwwso....', '....owwwwwso....', '.....owwwso.....', '....oooooooo....', '...owwwwwwwso...', '..oooooooooooo..', '..ohwwwwwwwwso..', '..oooooooooooo..', '................'],
  k: ['......okko......', '....ookkkkoo....', '......okko......', '...oooooooooo...', '..owwwwwwwwwso..', '..owwkwwwwkwso..', '...owwwwwwwso...', '...owwwwwwwso...', '....owwwwwso....', '....owwwwwso....', '...oooooooooo...', '...owwwwwwwso...', '..oooooooooooo..', '..ohwwwwwwwwso..', '..oooooooooooo..', '................'],
};
const CH_PAL = {w: {o: '#1c1238', w: '#f4ecdc', h: '#ffffff', s: '#b8a890', k: '#e0a020'}, b: {o: '#05010b', w: '#6a1e4a', h: '#c0588a', s: '#3a0a28', k: '#ff6ad5'}};
const CH_SPR = Object.fromEntries([...'pnbrqk'].flatMap(t => [[t, CH_PAL.b], [t.toUpperCase(), CH_PAL.w]].map(([k, P]) => [k, cnv(17, 17, q => { q.globalAlpha = .45; sprite(q, CH_ART[t], 1, 1, {o: '#000', w: '#000', h: '#000', s: '#000', k: '#000'}); q.globalAlpha = 1; sprite(q, CH_ART[t], 0, 0, P); })])));
const CH_IMG = Object.fromEntries(Object.entries(CH_SPR).map(([k, c]) => [k, cnv(34, 34, q => q.drawImage(c, 0, 0, 34, 34)).toDataURL()]));  // pour le panneau des prises
const CH_NAMES = {k: 'R', q: 'D', r: 'T', b: 'F', n: 'C', p: ''};  // la notation française
const chSqName = i => 'abcdefgh'[i & 7] + (8 - (i >> 3));
// l'échiquier : 8 cases de 20 pixels dans un cadre de 8, sous une bande de texte
const W = 176, H = 198, SQ = 20, BX = 8, BY = 30, SLIDE = 150;
const cv = $('chCv'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const CH_SQ = [false, true].map(dark => cnv(SQ, SQ, q => {
  const [base, spot, hi, lo] = dark ? ['#4a2a78', '#55348a', '#5e3e94', '#38205e'] : ['#dccdf2', '#cfbfe8', '#ece2fa', '#c4b2e0'];
  px(q, base, 0, 0, SQ, SQ); let s = dark ? 7 : 3;
  for (let k = 0; k < 8; k++) { s = (s * 37 + 11) % 97; px(q, spot, 2 + s % 16, 2 + (s * 7) % 16, (s % 3) + 1, 1); }
  px(q, hi, 0, 0, SQ, 1); px(q, hi, 0, 0, 1, SQ); px(q, lo, 0, SQ - 1, SQ, 1); px(q, lo, SQ - 1, 0, 1, SQ);
}));
// les coordonnées du cadre en petits caractères de 3 × 5
const TINY = {1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111',
  a: '000011101101011', b: '100100111101111', c: '000111100100111', d: '001001111101111', e: '000111111100111', f: '011100110100100', g: '111101111001110', h: '100100111101101'};
const tiny = (q, ch, x, y, col) => { const b = TINY[ch]; for (let k = 0; k < 15; k++) if (b[k] === '1') px(q, col, x + k % 3, y + Math.floor(k / 3)); };
let ch = null, chId = 0, chHover = -1, chDrag = null;
function chSan(s, m, all) {
  const pc = s.b[m.f], t = pc.toLowerCase(), n = CH.make(s, m);
  let san;
  if (t === 'k' && Math.abs(m.t - m.f) === 2) san = m.t > m.f ? 'O-O' : 'O-O-O';
  else {
    const others = all.filter(o => o !== m && o.t === m.t && s.b[o.f] === pc && o.f !== m.f), cap = m.cap !== '.';
    let dis = '';
    if (t !== 'p' && others.length) dis = others.some(o => (o.f & 7) === (m.f & 7)) ? (others.some(o => o.f >> 3 === m.f >> 3) ? chSqName(m.f) : chSqName(m.f)[1]) : chSqName(m.f)[0];
    san = (t === 'p' ? (cap ? chSqName(m.f)[0] : '') : CH_NAMES[t] + dis) + (cap ? 'x' : '') + chSqName(m.t) + (m.p ? '=' + CH_NAMES[m.p.toLowerCase()] : '');
  }
  if (CH.inCheck(n)) san += CH.legal(n).length ? '+' : '#';
  return san;
}
function chStatus() {  // null tant que la partie continue, sinon {result: 'w' | 'b' | 'd', why}
  const s = ch.s, moves = CH.legal(s);
  if (!moves.length) return CH.inCheck(s) ? {result: s.w ? 'b' : 'w', why: 'échec et mat'} : {result: 'd', why: 'pat'};
  if (s.h >= 100) return {result: 'd', why: 'règle des 50 coups'};
  if (ch.hist.filter(k => k === CH.key(s)).length >= 3) return {result: 'd', why: 'triple répétition'};
  const rest = s.b.filter(x => x !== '.' && x !== 'k' && x !== 'K');
  if (!rest.length || (rest.length === 1 && /[nbNB]/.test(rest[0]))) return {result: 'd', why: 'matériel insuffisant'};
  return null;
}
function chReplay(save) {
  ch = {s: CH.start(), hist: [], moves: [], level: save.level, human: save.human, sel: -1, over: null, anim: null, promo: null};
  ch.hist.push(CH.key(ch.s));
  for (const mv of save.moves) { const m = CH.legal(ch.s).find(x => x.f === mv.f && x.t === mv.t && (x.p || '') === (mv.p || '')); if (!m) break; chApply(m, true); }
}
function chApply(m, quiet, dragged) {
  const all = CH.legal(ch.s), prev = ch.s.b;
  ch.moves.push({f: m.f, t: m.t, p: m.p || '', san: chSan(ch.s, m, all), cap: m.cap});
  ch.s = CH.make(ch.s, m); ch.hist.push(CH.key(ch.s)); ch.sel = -1; ch.promo = null;
  ch.over = chStatus();
  if (quiet) return;
  if (!dragged) ch.anim = {f: m.f, t: m.t, pc: prev[m.f], prev, t0: performance.now()};  // une pièce lâchée à la main n'a pas besoin de glisser
  (m.cap !== '.' ? chClac : chToc)();
  const st = gstore('chess', {});
  st.save = ch.over ? null : {level: ch.level, human: ch.human, moves: ch.moves.map(({f, t, p}) => ({f, t, p}))};
  if (ch.over) {
    const r = (st['lvl' + ch.level] ??= {w: 0, l: 0, d: 0});
    const k = ch.over.result === 'd' ? 'd' : ch.over.result === ch.human ? 'w' : 'l'; r[k]++;
    setTimeout(() => sfx(k === 'w' ? 'launch' : k === 'l' ? 'error' : 'notify'), SLIDE);
  }
  saveGames(); chRender();
  if (!ch.over && (ch.s.w ? 'w' : 'b') !== ch.human) chThink();
}
function chThink() {
  ch.thinking = true; chRender();
  const id = ++chId;
  setTimeout(() => chessWorker.postMessage({id, s: ch.s, hist: ch.hist.slice(0, -1), level: ch.level}), 300);  // une courte pause : la réponse de l'ordinateur se suit mieux
}
chessWorker.onmessage = e => {
  if (e.data.id !== chId || !ch || ch.over) return;
  ch.thinking = false;
  const m = e.data.m && CH.legal(ch.s).find(x => x.f === e.data.m.f && x.t === e.data.m.t && (x.p || '') === e.data.m.p);
  if (m) chApply(m);
};
function chNew() {
  const c = $('chColor').value, human = c === 'r' ? (Math.random() < .5 ? 'w' : 'b') : c;
  chId++; chReplay({level: +$('chLevel').value, human, moves: []});
  gstore('chess', {}).save = {level: ch.level, human, moves: []}; saveGames();
  chRender();
  if (human === 'b') chThink();
}
function chOpen() {
  if (ch) return chRender();
  const save = games.chess?.save;
  if (!save) return chNew();
  chReplay(save); $('chLevel').value = save.level; chRender();
  if (!ch.over && (ch.s.w ? 'w' : 'b') !== ch.human) chThink();
}
function chTargets() { return ch.sel < 0 ? [] : CH.legal(ch.s).filter(m => m.f === ch.sel); }
function chTry(to, dragged) {  // le joueur joue ch.sel → to ; une promotion demande quelle pièce
  const ms = chTargets().filter(m => m.t === to);
  if (!ms.length) return false;
  if (ms.length === 1) { chApply(ms[0], false, dragged); return true; }
  ch.promo = ms.sort((a, b) => 'QRBNqrbn'.indexOf(a.p) - 'QRBNqrbn'.indexOf(b.p)); return true;
}
const chXY = i => { const k = ch.human === 'b' ? 63 - i : i; return [BX + (k & 7) * SQ, BY + (k >> 3) * SQ]; };
const PROMO = {x: W / 2 - 46, y: BY + 4 * SQ - 14, w: 23};  // le choix de la promotion : quatre cases au milieu de l'échiquier
const chMyTurn = () => !ch.over && (ch.s.w ? 'w' : 'b') === ch.human;
const chState = () => { const o = ch.over, you = ch.human;
  if (o) return o.result === 'd' ? 'Nulle' : o.result === you ? 'Tu as gagné !' : 'L\'ordinateur gagne';
  if (!chMyTurn()) return 'L\'ordinateur réfléchit';
  return CH.inCheck(ch.s) ? 'Échec ! À toi de jouer' : 'À toi de jouer'; };
function chDraw() {
  if (!ch) return;
  const now = performance.now(), s = ch.s, flip = ch.human === 'b', pulse = (Math.sin(now / 160) + 1) / 2, mine = chMyTurn();
  px(g, '#0a0418', 0, 0, W, H);
  let A = ch.anim, t = 1; if (A) { t = Math.min(1, (now - A.t0) / SLIDE); if (t >= 1) ch.anim = A = null; }
  // la bande du haut : à qui le tour, en gros
  const check = CH.inCheck(s);
  g.drawImage(CH_SPR[s.w ? 'K' : 'k'], 4, 4);
  pxFont(g, chState() + (ch.thinking ? '.'.repeat(1 + Math.floor(now / 300) % 3) : ''), 24, 17, ch.over ? '#ffd84a' : check && mine ? (pulse > .5 ? '#ff4a5a' : '#ffb0b8') : mine ? '#7ee07a' : '#b8a8d8', 8);
  // le cadre et ses coordonnées
  px(g, '#07020f', 0, 22, W, H - 22); px(g, '#2a1640', 1, 23, W - 2, H - 24); px(g, '#4a2a78', 1, 23, W - 2, 1); px(g, '#4a2a78', 1, 23, 1, H - 24);
  for (const [x, y] of [[1, 23], [W - 4, 23], [1, H - 4], [W - 4, H - 4]]) px(g, '#ffd84a', x, y, 3, 3);
  for (let k = 0; k < 8; k++) { tiny(g, String(flip ? k + 1 : 8 - k), 3, BY + k * SQ + 8, '#8a74b8'); tiny(g, 'abcdefgh'[flip ? 7 - k : k], BX + k * SQ + 9, BY + 8 * SQ + 2, '#8a74b8'); }
  // les cases, les marques et les pièces
  const targets = chTargets(), last = ch.moves.at(-1), kingSq = check ? s.b.indexOf(s.w ? 'K' : 'k') : -1;
  const board = A ? A.prev.map((x, i) => i === A.f ? '.' : x) : s.b;
  for (let i = 0; i < 64; i++) {
    const [x, y] = chXY(i), dark = ((i >> 3) + (i & 7)) % 2 === 1;
    g.drawImage(CH_SQ[+dark], x, y);
    const box = (col, w) => { px(g, col, x, y, SQ, w); px(g, col, x, y + SQ - w, SQ, w); px(g, col, x, y, w, SQ); px(g, col, x + SQ - w, y, w, SQ); };
    if (!A && last && (i === last.f || i === last.t)) { g.globalAlpha = .32; px(g, '#ffd07a', x, y, SQ, SQ); g.globalAlpha = 1; }
    if (i === kingSq && !A) { g.globalAlpha = .35 + .35 * pulse; px(g, '#ff4a5a', x, y, SQ, SQ); g.globalAlpha = 1; }
    if (i === ch.sel) box('#ff6ad5', 2);
    if (board[i] !== '.' && !(chDrag?.moved && chDrag.i === i)) g.drawImage(CH_SPR[board[i]], x + 2, y + 2);
    const tg = targets.find(m => m.t === i);
    if (tg) { if (tg.cap !== '.') for (const [cx, cy] of [[0, 0], [SQ - 4, 0], [0, SQ - 4], [SQ - 4, SQ - 4]]) { px(g, '#ff4a5a', x + cx, y + cy + (cy ? 3 : 0), 4, 1); px(g, '#ff4a5a', x + cx + (cx ? 3 : 0), y + cy, 1, 4); }
      else { px(g, '#07020f', x + 7, y + 7, 6, 6); px(g, '#ffd0f2', x + 8, y + 8, 4, 4); } }
    if (i === chHover && mine && !A && !ch.promo) box('rgba(255,255,255,.6)', 1);
  }
  if (A) { const [x0, y0] = chXY(A.f), [x1, y1] = chXY(A.t); g.drawImage(CH_SPR[A.pc], Math.round(x0 + (x1 - x0) * t + 2), Math.round(y0 + (y1 - y0) * t + 2)); }
  if (chDrag?.moved) g.drawImage(CH_SPR[ch.s.b[chDrag.i]], Math.round(chDrag.cx - 9), Math.round(chDrag.cy - 11));
  // la promotion : quelle pièce ?
  if (ch.promo) { px(g, 'rgba(7,2,15,.75)', BX, BY, 8 * SQ, 8 * SQ); px(g, '#07020f', PROMO.x - 3, PROMO.y - 13, PROMO.w * 4 + 6, PROMO.w + 17); px(g, '#2a1640', PROMO.x - 2, PROMO.y - 12, PROMO.w * 4 + 4, PROMO.w + 15);
    pxFont(g, 'Promotion', W / 2, PROMO.y - 3, '#ffd84a', 8, 'center');
    ch.promo.forEach((m, k) => { const x = PROMO.x + k * PROMO.w, y = PROMO.y + 1; g.drawImage(CH_SQ[k % 2], x + 1, y, PROMO.w - 2, PROMO.w - 2); g.drawImage(CH_SPR[m.p], x + 3, y + 2); }); }
  // la fin de partie
  if (ch.over && !A) { const o = ch.over, win = o.result === ch.human;
    gameText(g, W, [[o.result === 'd' ? 'NULLE' : win ? 'GAGNÉ !' : 'PERDU', o.result === 'd' ? '#c8e8ff' : win ? '#7ee07a' : '#ff4a5a', 16], [o.why, '#ffffff']], BY + 4 * SQ - 6); }
  if (Math.floor(now / 500) !== chDraw.lab) { chDraw.lab = Math.floor(now / 500); cv.setAttribute('aria-label', 'Échecs : ' + chState()); }
}
function chRender() {
  const you = ch.human;
  const ml = $('chMoves'); ml.replaceChildren();
  for (let i = 0; i < ch.moves.length; i += 2) { const row = el('div', 'chMv'), a = el('span', '', ch.moves[i].san), b = el('span', '', ch.moves[i + 1]?.san || '');
    if (i === ch.moves.length - 1) a.className = 'on'; if (i + 1 === ch.moves.length - 1) b.className = 'on';
    row.append(el('span', 'n', (i / 2 + 1) + '.'), a, b); ml.append(row); }
  ml.scrollTop = ml.scrollHeight;
  const VAL = {p: 1, n: 3, b: 3, r: 5, q: 9, k: 0};
  const taken = side => ch.moves.filter(m => m.cap !== '.' && CH.isW(m.cap) === (side === 'b')).map(m => m.cap).sort((a, b) => VAL[b.toLowerCase()] - VAL[a.toLowerCase()]);
  const diff = taken(you).reduce((a, x) => a + VAL[x.toLowerCase()], 0) - taken(you === 'w' ? 'b' : 'w').reduce((a, x) => a + VAL[x.toLowerCase()], 0);
  for (const [id, side, who] of [['chTakenMe', you, 'Toi'], ['chTakenAi', you === 'w' ? 'b' : 'w', 'Ordinateur']]) {
    $(id).replaceChildren(el('span', '', who), ...taken(side).map(x => { const i = el('img'); i.src = CH_IMG[x]; i.alt = ''; return i; }));
    const d = side === you ? diff : -diff; if (d > 0) $(id).append(el('b', '', '+' + d));
  }
  const st = games.chess?.['lvl' + ch.level] || {w: 0, l: 0, d: 0};
  $('chInfo').textContent = 'Niveau ' + $('chLevel').options[ch.level].text + ' · ' + st.w + ' victoires, ' + st.d + ' nulles, ' + st.l + ' défaites';
  $('chUndo').disabled = ch.moves.length < (ch.human === 'w' ? 1 : 2) || ch.thinking;
}
// la souris : cliquer une pièce puis sa case, ou la faire glisser
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
const chAt = (x, y) => { const C = Math.floor((x - BX) / SQ), R = Math.floor((y - BY) / SQ); if (C < 0 || C > 7 || R < 0 || R > 7) return -1; const k = R * 8 + C; return ch?.human === 'b' ? 63 - k : k; };
cv.onpointerdown = e => {
  if (!ch || ch.over || ch.thinking || ch.anim || !chMyTurn()) return;
  const [x, y] = cpos(e);
  if (ch.promo) { const k = Math.floor((x - PROMO.x) / PROMO.w); if (y >= PROMO.y && y < PROMO.y + PROMO.w && k >= 0 && k < ch.promo.length) chApply(ch.promo[k]); else ch.promo = null; return; }
  const i = chAt(x, y); if (i < 0) return;
  if (ch.sel >= 0 && chTry(i)) return;
  const pc = ch.s.b[i];
  if (pc === '.' || CH.isW(pc) !== (ch.human === 'w')) { ch.sel = -1; return; }
  ch.sel = i; chToc(); chDrag = {i, x, y, cx: x, cy: y, moved: false}; cv.setPointerCapture?.(e.pointerId);
};
cv.onpointermove = e => { const [x, y] = cpos(e); chHover = chAt(x, y);
  if (!chDrag) return; chDrag.cx = x; chDrag.cy = y; if (!chDrag.moved && Math.hypot(x - chDrag.x, y - chDrag.y) > 3) chDrag.moved = true; };
cv.onpointerup = e => { if (!chDrag) return; const d = chDrag; chDrag = null; if (!d.moved) return; const [x, y] = cpos(e), i = chAt(x, y); if (i >= 0 && i !== d.i) chTry(i, true); };
cv.onpointerleave = () => { chHover = -1; };
$('chNew').onclick = () => { $('chNew').blur(); chNew(); };
$('chLevel').onchange = () => { if (!ch || ch.moves.length < 2 || ch.over) return chNew(); ch.level = +$('chLevel').value; games.chess.save.level = ch.level; saveGames(); chRender(); };
$('chColor').onchange = chNew;
$('chUndo').onclick = () => {  // reprend ton dernier coup et la réponse de l'ordinateur
  if (ch.thinking) return;
  const keep = ch.moves.slice(0, -((ch.s.w ? 'w' : 'b') === ch.human ? 2 : 1)).map(({f, t, p}) => ({f, t, p}));
  chId++; chReplay({level: ch.level, human: ch.human, moves: keep}); games.chess.save = {level: ch.level, human: ch.human, moves: keep}; saveGames(); chRender();
};
// vérification : 20 coups au départ, le coup du berger finit en mat et s'écrit Dxf7#, les 12 pièces dessinées, le dessin sans erreur
const SCHOLAR = [[52, 36], [12, 28], [61, 34], [1, 18], [59, 31], [6, 21], [31, 13]].map(([f, t]) => ({f, t}));
function chCheck() {
  const keep = ch, bad = []; chMute = true;
  try {
    if (CH.legal(CH.start()).length !== 20) bad.push('20 coups au départ');
    chReplay({level: 0, human: 'w', moves: SCHOLAR});
    if (ch.moves.length !== 7 || ch.moves.at(-1).san !== 'Dxf7#' || ch.over?.why !== 'échec et mat' || ch.over.result !== 'w') bad.push('coup du berger ' + ch.moves.map(m => m.san).join(' '));
    if (Object.keys(CH_SPR).length !== 12 || CH_ART.k.some(r => r.length !== 16) || Object.values(CH_ART).some(a => a.length !== 16 || a.some(r => r.length !== 16))) bad.push('pièces');
    chDraw();
  } catch (e) { bad.push('erreur ' + e.message); }
  ch = keep; chMute = false;
  return bad.length ? bad.join(', ') : 'ok';
}
{ const c = chCheck(); console.assert(c === 'ok', 'échecs', c); }
cv.__ch = {st: () => ch, check: chCheck, legal: () => CH.legal(ch.s), xy: chXY, SQ, W, H, PROMO, SCHOLAR,
  replay: moves => { chId++; chReplay({level: ch.level, human: ch.human, moves}); chRender(); },
  setPos: b => { chId++; ch.s = {b, w: true, c: '', ep: -1, h: 0}; ch.hist = [CH.key(ch.s)]; ch.moves = []; ch.sel = -1; ch.over = null; ch.thinking = false; ch.anim = null; ch.promo = null; chRender(); }};
const loop = () => { if (!view.classList.contains('on')) { loop.raf = 0; return; } loop.raf = requestAnimationFrame(loop); chDraw(); };
  ctx.onOpen(() => { chOpen(); if (!loop.raf) loop.raf = requestAnimationFrame(loop); });
}
