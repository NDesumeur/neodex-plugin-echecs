// Échecs : une partie d'échecs contre l'ordinateur, sept niveaux.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels, échiquier et pièces en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Échecs</span><span class="hint" id="chInfo"></span></div>
  <div class="gMain"><div class="gameBox"><canvas id="chCv" width="176" height="198"></canvas></div>
    <div class="gSide">
      <div class="row"><button class="btn main" id="chNew">NOUVELLE PARTIE</button><button class="btn" id="chUndo">ANNULER</button></div>
      <div class="row"><select class="f gSel" id="chLevel"><option value="0">Débutant</option><option value="1">Facile</option><option value="2" selected>Moyen</option><option value="3">Difficile</option><option value="4">Expert</option><option value="5">Maître</option><option value="6">Grand maître</option></select><select class="f gSel" id="chColor"><option value="w" selected>Je joue les blancs</option><option value="b">Je joue les noirs</option><option value="r">Couleur au hasard</option></select></div>
      <div class="row"><select class="f gSel" id="chMode"><option value="ia">Contre l'ordinateur</option><option value="net">À distance (par un code)</option></select></div>
      <div id="chNet" style="display:none"><div class="row"><button class="btn" id="chHost">CRÉER UNE PARTIE</button></div><div class="row"><input class="f" id="chCode" placeholder="CODE" maxlength="8" autocomplete="off" spellcheck="false" style="max-width:110px;text-transform:uppercase"><button class="btn" id="chJoin">REJOINDRE</button></div><div class="hint" id="chNetInfo"></div></div>
      <div class="sysCard"><b>PROBLÈMES</b><div class="row"><button class="btn" id="chPuz">UN PROBLÈME</button><button class="btn" id="chPuzHint">INDICE</button></div><div class="hint" id="chPuzInfo"></div></div>
      <div class="sysCard"><b>PRISES</b><div class="chTaken" id="chTakenMe"></div><div class="chTaken" id="chTakenAi"></div></div>
      <div class="sysCard"><b>COUPS</b><div id="chMoves" class="chMoves"></div></div>
      <div class="sysCard"><b>PGN</b><textarea id="chPgn" class="chPgn" rows="3" spellcheck="false" placeholder="Colle ici une partie au format PGN (notation anglaise ou française)"></textarea>
        <div class="row"><button class="btn" id="chPgnOut">COPIER LA PARTIE</button><button class="btn" id="chPgnIn">OUVRIR CE PGN</button></div></div>
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
.chPgn{width:100%;box-sizing:border-box;margin:6px 0;padding:6px;font:12px monospace;background:#05010b;color:#f4f0f8;border:2px solid var(--line2);resize:vertical}
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
  const host = ctx.host, { el, sfx, toast } = host;
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
  // les trophées de NeoDex (3.4.8 et plus) : succès et records déclarés dans plugin.json ; sur un NeoDex plus ancien, rien ne se passe
  const trophy = id => { ctx.games?.unlock(id).catch(() => {}); };
  const trophyRecord = (id, v) => { if (v != null && Number.isFinite(+v)) ctx.games?.record(id, +v).catch(() => {}); };
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
// les problèmes : 414 positions de la base libre de Lichess (CC0), choisies parmi les plus jouées et les mieux notées ; [numéro, FEN, coups UCI, classement]
// le premier coup est celui de l’adversaire, ensuite on cherche chaque coup ; ton classement monte ou descend comme aux échecs (Elo)
const CH_PUZ = [["0Evtx","6r1/pbb1k1rp/2p1p3/5p2/8/2N5/PPP2PPP/R2QR1K1 w - - 4 20","d1e2 g7g2 g1f1 g2g1",676],["0TwIx","2r3k1/6pp/p3R3/8/2pB1P2/6P1/P2n3P/6K1 w - - 1 30","e6e7 d2f3 g1f1 f3d4",721],["078kF","r7/5ppp/8/1pk5/2b5/5P2/P2R2PP/K1R5 w - - 2 32","a1b2 a8a2 b2b1 a2d2",730],["09qMn","r4rk1/p2b1p2/1qp2n1p/3p2p1/3N4/3B2PP/PPP3P1/R2Q1R1K b - - 2 17","b6d4 d3h7 g8h7 d1d4",759],["05xH6","8/6kp/1r1p1r2/R7/4p3/P1Pb2P1/3R1PB1/6K1 w - - 0 33","a5a4 b6b1 g1h2 f6h6",764],["1XFUB","5k2/4rp2/p2Q4/1p6/1Pq5/P3p2P/4R1P1/6K1 w - - 3 35","e2e3 c4c1 g1h2 c1e3",770],["125Zx","r2qr1k1/p4ppp/2Q5/8/6n1/2N5/PP3PPK/R1BR4 w - - 0 18","h2g1 d8d1 c3d1 e8e1",775],["0pc2w","r3r3/pp4pp/3p4/5k2/8/2P5/PP1PnPPP/R1B1R2K w - - 2 20","d2d4 e2g3 h2g3 e8e1",778],["05VUp","5R2/p1p3rk/8/3P2qr/8/1P1Q4/P4KP1/8 b - - 6 42","h7h6 f8h8 g7h7 h8h7",779],["1l27y","2R5/3n1k1p/3b1p2/1B1p1Pp1/1P1P4/4r1NP/2P3PK/8 w - - 1 31","b5d7 d6g3 h2g1 e3e1",782],["1dxYv","r1b1k1n1/1p3pq1/p3p3/3P4/8/2N1Q3/PP3PB1/R3K3 w Qq - 2 18","g2f3 g7g1 e1d2 g1a1",787],["0ZoP2","rn4k1/pQ5p/6p1/4q3/1P6/3p4/P4PPP/R5K1 w - - 0 20","b7a8 e5a1",789],["1YFnv","1rb3k1/pp4pP/2pp1qQ1/6b1/2PP4/P4p2/1P3PP1/3K1B1R b - - 0 24","g8h8 g6e8 f6f8 e8f8",789],["1iLXK","4r3/1p3p1k/2p2Bp1/p2b1B1q/2PP4/6Q1/PP3P1P/4R1K1 w - - 1 30","e1e8 h5d1 e8e1 d1e1",791],["0E7WM","1k2r3/2p1r1p1/p2b3p/1p2n1p1/1P6/1BP1B2P/P4PP1/3RR1K1 w - - 2 29","e3d4 e5f3 g2f3 e7e1 d1e1 e8e1",831],["02Pxu","6k1/R7/6K1/7P/8/6p1/8/7r b - - 3 58","g3g2 a7a8",847],["09vi3","1k3r2/1p2Q3/p1q4b/3p4/3P1P2/2P1N3/1P1K4/8 b - - 2 37","h6f4 e7f8 b8a7 f8f4",881],["031PB","3r2bk/R6p/6p1/6b1/P7/7P/5PP1/2R3K1 w - - 1 40","c1c7 d8d1 g1h2 g5f4 g2g3 f4c7",900],["02Jv8","1r4k1/p2R2pp/1pN1p3/8/8/8/bP3PPP/6K1 b - - 0 26","b8c8 c6e7 g8f8 e7c8",905],["0DIfp","6k1/pp3p1p/3p1Qp1/3P4/6rP/1P1b4/P1q1rP1K/2R2R2 b - - 1 29","c2d2 c1c8 e2e8 c8e8",907],["01wS5","b5rk/6p1/qNpQR2p/5p2/3P4/5P2/1P4PP/6K1 b - - 1 32","a6b6 e6h6 g7h6 d6h6",908],["0C78f","8/p5k1/1p4pp/5p2/P1pP1P2/2P4P/1PQBrqP1/1R5K w - - 0 34","b1d1 f2g2",909],["01lB9","1qkr3r/pp1b2p1/5p2/3Pn2p/2Pp1B2/P2B2P1/1Q3P1P/1R3RK1 w - - 2 21","b2d4 e5f3 g1g2 f3d4 f4b8 c8b8",913],["08cZX","6k1/pp2p2p/3p2p1/8/1P2P3/P2P2qP/5rP1/2R2QK1 b - - 6 30","f2a2 c1c8 g8g7 f1f8",924],["04tyZ","5k2/p7/1p1Q4/1P1p2p1/P2b2q1/2p4p/2B2P1P/5K2 b - - 3 49","f8e8 c2g6",931],["07xF8","8/7p/1p4p1/p1nkp3/8/P3K2P/2PB2P1/8 b - - 1 44","c5e4 c2c4 d5c4 e3e4",937],["0A2V0","6k1/5ppp/r4n2/2b5/5P2/2P1p1P1/PP2Q2P/6K1 w - - 0 33","e2a6 e3e2 g1g2 e2e1q",938],["0AJj3","2r3k1/1Rp3pp/5p2/1Q6/2nP4/2P1qPB1/6PP/6K1 w - - 1 28","g3f2 e3c1 f2e1 c1e1",939],["04PCA","8/2R4p/6pk/5p2/1rBP1KPP/4PP2/8/2r5 b - - 0 41","b4c4 g4g5 h6h5 c7h7",943],["0BJAl","8/1p1q4/k2P4/2Qp1b2/8/8/1P4P1/K4R2 w - - 1 40","c5c7 d7a4",952],["02EhR","3rk2r/pp3pp1/4p3/4P2p/q2nQ2P/P3B3/5PP1/R4RK1 w k - 0 20","e4b7 d4e2 g1h1 a4h4",957],["0AJ1B","6k1/pp3pp1/3p3P/2p4P/2Pb1P2/qP6/P1QR3N/1K2r3 w - - 0 33","d2d1 e1d1 c2d1 a3b2",957],["086ae","r2q3r/p3kppp/3bb3/1B6/8/4N3/PP1Q1PPP/R4RK1 w - - 2 19","f1e1 d6h2 g1h2 d8d2",959],["029mV","8/8/5k2/1p4p1/1R1P2K1/6R1/3r2b1/8 w - - 0 37","b4b5 d2d4 g4h5 d4h4",964],["0Awx6","1r4k1/5pqp/p1pbb1p1/2pp4/5P2/P1NP2Q1/1PP3PP/4RRK1 w - - 1 19","c3a4 g7d4 g1h1 d4a4",965],["062su","8/8/4k3/2p3R1/3bBp2/4rP1P/2P1K1P1/8 w - - 3 39","e2d2 d4c3 d2c1 e3e1",975],["0CshS","2rr2k1/p4pp1/4pq2/6p1/1P1N2P1/P2Q2P1/5PK1/R6R b - - 0 26","d8d4 d3h7 g8f8 h7h8 f8e7 h8c8",975],["0BXOg","3r2k1/Bpp2ppp/3b4/3N4/2P5/P4qPP/1P2rP2/1K1Q3R b - - 4 23","d6e5 d5e7 g8f8 d1d8",976],["001wr","r4rk1/p3ppbp/Pp1q1np1/3PpbB1/2B5/2N5/1PPQ1PPP/3RR1K1 w - - 4 18","f2f3 d6c5 g1h1 c5c4",977],["02bRz","4r1k1/3pqpp1/5r2/Q7/8/4BN2/PP3nPP/3R1K1R w - - 0 23","e3f2 e7e2 f1g1 e2d1",977],["06IK9","8/3k4/p1p2rp1/2Pp1P1p/PP2pKPP/4P3/8/6R1 w - - 0 38","g4g5 f6f5 f4g3 f5f3 g3g2 f3e3",978],["01FCo","1k2r2r/1Pp2pb1/1n1p3p/3Pq1p1/1Q1NP3/2P2P2/P4R1P/R3K3 b Q - 0 22","g7f6 d4c6 b8b7 c6e5",979],["02r27","4r3/2pqrpk1/3p2pp/p1pPb1QP/2P1P3/1P3R2/P1B3P1/5R1K w - - 0 30","f3f7 e7f7 g5g6 g7f8 g6f7 d7f7 f1f7 f8f7",981],["07ZWX","6k1/pp4p1/2p5/5r2/4n2Q/8/PPq2PPP/4R1K1 w - - 0 24","h4e4 c2f2 g1h1 f2f1 e1f1 f5f1",981],["003jb","r3kb1r/p4ppp/b1p1p3/3q4/3Q4/4BN2/PPP2PPP/R3K2R b KQkq - 0 11","c6c5 d4a4 a6b5 a4b5",982],["08yAx","r6r/pp2pp1k/3p2pP/q1pP1P2/3n4/3P4/PPP2Q2/2K3RR b - - 0 23","a5a2 f5g6 f7g6 f2f7",983],["0Corw","8/8/2k1pppp/p1P5/P2K1PPP/8/8/8 b - - 0 37","e6e5 f4e5 f6e5 d4e5 c6c5 e5f6",983],["00cud","8/5p2/6p1/1p1N1k2/1PbK4/2P3P1/8/8 b - - 0 48","c4f1 d5e3 f5e6 e3f1",984],["038La","5k1r/1p3ppp/1p4b1/nB1P2B1/1P4P1/P4P2/3r3P/1K1R3R w - - 5 26","b5d3 g6d3 b1a1 a5b3",986],["06Qtv","r1bqk1nr/ppp2p1p/6p1/3pb3/8/2N1PP2/PPP3PP/R2QKBNR w KQkq - 0 8","d1d5 e5c3 b2c3 d8d5",986],["06fev","7k/ppp3p1/5pQp/8/8/1P6/PB1q1PPP/4rRK1 w - - 4 27","b2f6 e1f1 g1f1 d2d1",986],["0CPLm","3rR1k1/p4p1p/2p3p1/8/5b2/1B5q/PPP4P/4Q1K1 b - - 7 31","d8e8 e1e8 g8g7 e8f7 g7h6 f7f4",986],["00CtS","Q5k1/5q2/p2p4/b1p1pr2/P7/6P1/4KP1R/8 b - - 3 38","g8g7 a8h8 g7g6 h8h6",987],["01Y2F","r3kb1r/pp1q1ppp/4p3/4Pn2/3pN3/2P4P/PP3RP1/R1BQ2K1 w kq - 0 15","f2f5 e6f5 e4d6 f8d6",987],["02utb","8/3b2r1/k6p/p4p2/4pr2/P5R1/1R3P1N/7K b - - 3 39","g7g3 f2g3 f4f3 h2f3",988],["07EIF","rnb1qrnk/ppp2pbp/3pp1p1/1N4B1/2PP4/4PN2/PPQ1BPPP/R4RK1 b - - 8 10","a7a6 b5c7 e8c6 c7a8",988],["09uk2","1N6/4k1p1/P2Npp1p/r3P3/8/6Pn/4K3/8 b - - 4 46","f6e5 b8c6 e7d6 c6a5",989],["0ABX8","3r2k1/p3bppp/1p1Pp3/1Q6/1P3P2/8/2q3PP/3RR1K1 b - - 0 24","d8d6 b5e8 e7f8 d1d6",993],["00fZM","5rk1/1q3r1p/3p2RQ/3p4/3B4/2P2P2/P5PP/6K1 b - - 0 30","h7g6 h6h8",994],["06umr","rn1q1rk1/p3bppp/b1p1pn2/2Pp4/3P4/P2BPN2/5PPP/RNBQ1RK1 w - - 0 11","c1d2 a6d3 d2a5 d8a5",994],["0AOVc","2RQ4/5pkp/6p1/8/4P3/7n/4rr1P/3R2K1 w - - 9 35","g1h1 f2h2",995],["0DQSo","8/1pp2Bp1/p3R2p/6q1/P3Qnk1/2P3P1/1P1r1P2/5K2 w - - 10 39","e6g6 d2d1 e4e1 d1e1",996],["0BlqB","3r1r1k/6b1/p2p4/2p1nN1Q/1p2n3/7P/PP4P1/R5K1 b - - 5 30","h8g8 f5e7",997],["0416t","7k/1Q4bp/6p1/8/8/8/5RPP/q5K1 w - - 1 27","f2f1 g7d4 g1h1 a1f1",999],["02RJ2","1rr2k2/2q5/3p1p2/p3b1p1/2BpPp1R/PP1P1P1P/2PQ1K2/6R1 b - - 0 26","g5h4 g1g8 f8e7 g8g7",1062],["02P4S","r1bq1rk1/ppp3p1/7p/4pp1Q/2PPp3/P3P1P1/1PnNKPP1/3R1B1R w - - 0 15","d4e5 d8d3",1071],["00nQp","r5k1/pp1qrppp/2nb1n2/6N1/3P1p2/2P5/PPQN2PP/R1B2RK1 w - - 4 15","d2e4 f6e4 c2e4 e7e4",1095],["008tL","8/7k/pR5p/3p4/5r2/2P1p2P/P5P1/6K1 w - - 0 40","b6a6 e3e2 a6e6 f4f1",1105],["01IFU","r1b2rk1/pp3pp1/3b3p/3Bn3/P2N1q2/2P4P/1P3PP1/RN1Q1RK1 w - - 1 17","d4e2 e5f3 g2f3 f4h2",1105],["01vYY","2b5/4qpkp/3n1bp1/3B4/3N4/5N1P/2Q2PP1/6K1 w - - 2 30","c2b3 f6d4 f3d4 e7e1",1105],["00Tya","r4rk1/6pp/1p1Bp3/p7/P1PP4/4nqP1/2QR3P/4R1K1 w - - 1 25","c2a2 f3f1 e1f1 f8f1",1115],["02IJi","3r2k1/p6p/1p1q2p1/3P1p2/8/3Q2PP/P4P2/4R1K1 b - - 1 28","d6d5 e1e8 d8e8 d3d5",1119],["02MZb","r3kbnr/1pp2ppp/p1p2q2/4p2b/4P3/3P1N1P/PPP2PP1/RNBQ1RK1 w kq - 3 8","c1g5 h5f3 g5f6 f3d1 f6g7 f8g7",1120],["01yqP","2k5/5p2/p1B2p2/8/2P1N1K1/3p2P1/PP6/5r2 w - - 0 33","c6a4 f6f5 g4h3 f5e4",1123],["01p5M","1r6/p1p2n2/1pk2Pp1/6r1/8/2N5/PPP4K/3R1R2 w - - 2 24","f1g1 b8h8",1127],["00AB1","8/7Q/3p1kp1/1p6/2b5/2P4P/5PPK/4q3 b - - 8 36","e1c3 h7h8 f6e6 h8c3",1133],["01WoU","6k1/1p4pp/p3r3/2b1r3/5N2/2P5/PP2n1PP/2B1RR1K w - - 4 26","f4e6 e2g3 h2g3 e5h5",1133],["02T47","r3k1nr/pp1qppbp/2p3p1/4B3/3P4/2N2Q2/PPP3PP/R3R1K1 b kq - 4 14","g8f6 e5f6 g7f6 f3f6",1134],["01oGn","N1b4r/pp2kppp/4p3/8/3P4/2q1P3/2pN1PPP/R1Q1KB1R w KQ - 6 19","c1a3 c3a3 a1a3 c2c1q",1137],["00iyx","2kr1b1r/pp3ppp/2p1pq2/6B1/2P3Q1/7P/P4PP1/1R3RK1 b - - 3 19","f6g6 g5d8 g6g4 h3g4",1140],["01nyk","8/1k6/1P2p1p1/2KpP3/7P/8/8/8 w - - 1 48","c5d6 d5d4 d6e6 d4d3",1140],["00Aas","3r1rk1/1p2q1pp/5p2/8/1P1n4/6Q1/PPbB1PPP/R2B1RK1 w - - 9 20","d1c2 d4e2 g1h1 e2g3 f2g3 d8d2",1145],["00fwM","Qn1qk2r/p4ppp/2p5/2bn4/4pPb1/2N5/PPPP2PP/R1B1KBNR w KQk - 1 9","h2h3 d8h4 g2g3 h4g3",1145],["01mxD","rn3rk1/p1b2ppp/1p1qp3/3p2n1/1P1P4/PN1QPN2/5PPP/R3BRK1 w - - 6 17","b4b5 g5f3 g2f3 d6h2",1147],["02Mfp","6k1/2q4p/p3p1p1/3pP3/1prP1R2/2P5/PP3QP1/6K1 b - - 3 28","b4c3 f4f8 g8g7 f2f6",1150],["01U4x","r3k2r/ppp2ppp/n3b3/1N1p1q2/3P4/1BP5/PP4PP/R1BQ3K b kq - 0 14","c7c6 b5d6 e8d7 d6f5",1151],["01q3y","rnb2r2/ppp2B1k/3p3p/2b4Q/4P3/3P4/PP1NKPPP/q7 b - - 0 14","a1b2 h5g6 h7h8 g6h6",1151],["01DHd","r1bq1rk1/pp1nb1pp/4pp2/3pP2Q/2pP4/2P1P3/PPBN2PP/R1B2RK1 b - - 1 12","g7g6 c2g6 h7g6 h5g6",1152],["01w3s","r4r1k/ppp1q1pp/6N1/5Q2/2B5/2P5/P1P2PPP/2KR4 b - - 2 21","h7g6 f5h3 e7h4 h3h4",1154],["00N3B","r2q1rk1/1bb2ppp/p1n1p3/4P3/Np1P4/1B2NP2/1P4PP/2RQ1RK1 b - - 0 20","d8d4 d1d4 c6d4 c1c7 d4b3 c7b7",1155],["0184P","1r6/3R2p1/p5kp/1p2p2N/2Pn2K1/1P6/P5PP/8 b - - 2 30","b5c4 d7g7",1155],["00Ta0","4k3/1R6/6p1/4Np1p/7P/2r3PK/5b2/8 w - - 11 47","e5g6 c3g3 h3h2 g3g6",1156],["01awh","3r3k/pQ2b1pp/8/8/2p2q1n/2B2p2/PP3P1P/1K4NN w - - 0 27","b7e7 d8d1 b1c2 f4c1",1156],["00jPw","r3r1k1/ppp2p2/1b5Q/3PP2n/2B3bq/2N5/PP4PP/R4R1K w - - 1 18","f1f7 h5g3",1158],["00ICz","2k2rr1/1p1q3p/1p2p3/1NbpQ3/P1p2P2/6P1/6KP/R4R2 b - - 0 31","f8f5 b5a7 c8d8 e5b8 d8e7 b8g8",1161],["007eS","6k1/p4p2/1p5p/4r3/P3B3/1P3P2/2PK2PP/8 w - - 0 29","d2e3 f7f5 g2g4 f5e4",1164],["014p4","3rn2r/pp1q1pkp/2n1b1p1/1Np1p3/8/4N1P1/PP1QPPBP/R2R2K1 w - - 0 18","g2c6 d7d2 d1d2 d8d2",1164],["02IiD","r4bkr/5N1p/p1q3p1/3np3/4R3/Q1P5/1P4PP/2B2R1K b - - 0 29","f8a3 f7h6 g8g7 f1f7",1165],["00Af3","8/8/2B2p1p/P4Pp1/3p1kP1/1b1Pb2P/8/4K3 b - - 0 50","f4g3 a5a6 b3c4 a6a7",1172],["01NfS","r3k2r/pp2bppp/2pQ4/2Bn4/6P1/3P4/PPP4P/1K2R1Nq b kq - 3 19","a8d8 e1e7 d5e7 d6e7",1172],["01pl8","3r4/pR1N2p1/2p2p1k/4p2p/2B1Pn1N/1P6/P1P2PPP/3R2K1 w - - 4 31","d7f6 d8d1 c4f1 f4e2 g1h1 d1f1",1174],["02BZl","2k5/2p2B2/pp3Q1p/1K2p3/1B2P3/3r1Pr1/P1q5/R2R4 w - - 0 30","b5a6 c2a4 b4a5 a4a5",1175],["01GXf","r3k2r/pR2bppp/4p3/3N4/8/8/P4PPP/4R1K1 b kq - 0 20","e7f6 d5c7 e8f8 c7a8",1178],["0284p","6k1/p5N1/6r1/1q1pp2R/4P3/4QK2/5P2/8 b - - 2 38","g8g7 e3a7 g7f6 h5f5 f6e6 a7f7",1178],["00NUS","4rk2/pbp2pp1/1p1b4/3P1q2/QPBPN3/1KP2P2/P5r1/R3R3 w - - 0 25","e4d6 f5c2 b3a3 c2b2",1180],["01J3q","r3r1k1/ppq1ppb1/2p3nN/2Pp3p/3Pn2N/1P2P2P/PB3QP1/R4RK1 b - - 9 23","g7h6 f2f7 g8h8 h4g6",1180],["00Hut","r4rk1/4p1bp/3p2p1/q1pP1P2/4QP2/4B3/1p5P/1BKR3R w - - 0 22","c1c2 a5c3",1189],["02AeY","8/4k3/4p3/p2pP3/2pPb3/2K1P1RB/PP2r3/4N3 w - - 3 54","g3g1 e2e3 c3d2 e3h3",1189],["01gkL","r1b2bkr/ppp2Np1/3pPq1p/4n3/3Q4/8/PPP2PPP/RNB1K2R w KQ - 2 12","f7h8 e5f3 g2f3 f6d4",1191],["02HLs","8/5Bk1/8/3bq3/2p5/2P2Rp1/1P4P1/5R1K w - - 1 43","f7d5 e5h5 h1g1 h5h2",1192],["02O8w","2r2rk1/5pp1/p5np/b2p4/3P4/Pq1BPN2/1PR2QPP/3R2K1 w - - 6 26","c2c8 b3d1 f2f1 d1f1 g1f1 f8c8",1192],["01bwq","r1b2k1r/pppq1ppp/1n6/1B1PQ1B1/8/2P5/P4PPP/R3K2R b KQ - 2 15","d7d6 e5e8",1193],["02TFJ","8/p5p1/4p2p/3p1k2/1n3P2/1B3KP1/P6P/8 b - - 4 42","b4d3 b3c2 f5f6 c2d3",1193],["02MML","rnb1k2r/pppp1ppp/8/4P3/2B1q3/5Nn1/PPP4P/RNBQK2R w KQkq - 2 9","e1f2 g3h1 d1h1 e4c4",1197],["013hi","2k5/bpp2B2/p1np4/4pR2/PP2P1q1/1NPP2P1/5RK1/8 b - - 6 30","a7f2 f7e6 c8d8 f5f8 d8e7 e6g4",1202],["004LZ","8/7R/5p2/p7/7P/2p5/3k2r1/1K2N3 w - - 3 48","e1g2 c3c2 b1a2 c2c1q h7d7 d2e2",1208],["00ZSd","2R5/5pk1/pb4p1/1p1q4/3P1P1p/P3r2P/1PQ3P1/3R2K1 w - - 6 45","g1h1 e3h3 h1g1 b6d4 d1d4 d5d4",1213],["00tZP","r2qk2r/1p3ppp/8/2pPPn2/1pPn2b1/3Q1NP1/PP3PBP/RN3RK1 w kq c6 0 14","d5c6 d4f3 d3f3 g4f3",1216],["00tB9","1k1r3r/1bq1b1p1/p2p4/2nBp1P1/4P3/4BP2/1PPQN3/2KR3R w - - 3 24","d5b7 c5b3 c1b1 b3d2",1219],["00TQf","4r1k1/p1R1n2p/4N3/5rK1/8/6PP/P3R3/8 w - - 3 46","g5g4 h7h5 g4h4 e7g6",1221],["009FP","r1b1k1nr/ppp2pbp/3ppqp1/8/2BnP3/N2P2QP/PPP2PP1/R1B1K2R b KQkq - 4 9","e6e5 c1g5 f6g5 g3g5",1235],["00MFe","3r3k/p5pp/2r2q2/2p4Q/8/8/P5PP/3R1R1K b - - 5 29","d8d1 h5e8 f6f8 e8f8",1238],["00H1C","r3r3/1kpRnqpp/p4p2/Qp2P2P/1N6/4Pb2/PPP3P1/2K2R2 b - - 0 22","e7c6 a5c7",1239],["00Bp0","1r2kr2/pp3p1p/2b1pn2/4N3/2P5/1N1B4/P3KP1P/6R1 b - - 4 21","f6e4 e5c6 b7c6 d3e4",1240],["00eGd","7R/8/p2kp3/2r4p/p4K2/6PP/P7/8 b - - 3 39","d6d5 h8h5 e6e5 h5e5",1240],["001Fg","2R2r1k/pQ4pp/5rp1/3B4/q2n4/7P/P4PP1/5RK1 w - - 3 30","c8c7 d4e2 g1h2 a4f4 h2h1 e2g3 f2g3 f4f1",1244],["00rva","r2qkb1r/pQpbpppp/2n2n2/1N6/2pP4/8/PP2PPPP/R1B1KBNR b KQkq - 2 7","a8b8 b5c7 d8c7 b7c7",1251],["00SyL","1rb2rk1/4bppp/p1n1p3/1p1qP3/7N/P5P1/1PQ2PBP/R1B2RK1 b - - 1 15","d5c5 c2c5 e7c5 g2c6",1257],["00G81","3r4/5k2/p4Pp1/2pK2Pp/2R5/P7/8/8 w - - 7 51","d5c5 d8c8 c5d4 c8c4 d4c4 h5h4",1268],["0040n","r7/p2k1pp1/p1p1pn2/3p4/3P4/P3PQp1/1PP2P1q/2K4R w - - 0 20","h1h2 g3h2 f3h3 f6g4",1270],["00X5w","r2q1r1k/1ppbb1pn/p1n4p/3Qpp2/B3P3/2P2N1P/PP3PP1/R1B1RNK1 w - - 2 14","f3e5 c6e5 a4d7 e5d7",1270],["00Bul","rnbqk2r/pp3ppp/5n2/3pN3/2B5/2P5/P1PPQPPP/R1B1K2R b KQkq - 1 8","d5c4 e5c6 c8e6 c6d8",1271],["00yWQ","8/5pk1/4b2p/8/2r1NKP1/4P2P/5R2/8 w - - 12 51","f4f3 e6d5 f2d2 d5e4",1271],["00qoE","1n1q2rk/p3b1p1/1pr1p1RB/2p1P3/4N3/2PP1N1P/P3B2K/6R1 b - - 0 28","g7h6 g6h6",1274],["00AdI","3r4/4kp1p/1PQ1p1p1/p3b3/1p2P2P/1P6/6PK/8 w - - 1 36","h2h3 d8d3 g2g3 d3g3 h3h2 g3c3",1284],["001xl","8/4R1k1/p5pp/3B4/5q2/8/5P1P/6K1 b - - 5 40","g7f6 e7f7 f6e5 f7f4",1289],["004mT","5Q2/8/1b1kp1p1/5p2/3p4/5qPK/7P/8 b - - 1 51","d6c6 f8a8 c6d6 a8f3",1291],["00hYk","8/8/1n4p1/4kp1p/7P/1B2KPP1/8/8 b - - 0 54","b6d5 b3d5 e5d5 e3f4",1293],["00ZeT","1Q1k4/4r3/2q4p/2p1pp1P/2Bb4/1P6/P6K/4R3 b - - 4 43","d8d7 c4b5 c6b5 b8b5",1298],["00l68","3k2Q1/q7/3pB1p1/2pP1p2/2P2P2/rp2PK1P/8/8 b - - 2 37","d8c7 g8c8 c7b6 c8c6 b6a5 c6b5",1300],["00dnp","8/Q7/7r/8/6K1/1r2k1p1/6P1/8 b - - 2 64","e3e2 a7a2 e2e3 a2b3",1302],["011Un","1k6/p2bRq2/1p1P1Pp1/2p4p/7r/5QK1/P5P1/8 b - - 7 37","h4g4 f3g4 d7g4 e7f7",1304],["015mX","r3k2r/1ppqb2p/p1b1N1p1/3pPR2/3P2Q1/2P5/PP4PP/RNB3K1 b kq - 0 14","g6f5 g4h5",1305],["00jCD","r4r1k/ppp1b1pp/3qQn2/6B1/8/2N5/PPP2PPP/R4RK1 w - - 3 14","e6b3 f6g4 g2g3 e7g5",1319],["000lC","3r3r/pQNk1ppp/1qnb1n2/1B6/8/8/PPP3PP/3R1R1K w - - 5 19","d1d6 d7d6 b7b6 a7b6",1325],["00MeO","r1b1kb1r/1p2np2/p1p4p/4PPp1/3PN3/8/PPP3PP/R1B2RK1 b kq - 0 15","c8f5 e4d6 e8d7 d6f5",1327],["00nFD","r4rk1/p1q2pb1/2p1b1pp/3np3/2B1N2P/4BP2/PPP3P1/2KRQ2R w - - 0 16","g2g4 d5e3 c4e6 e3d1",1331],["00hAC","r1b2r2/p1p1qppk/1p1pp3/3Q4/8/2P2N2/P1P2PPP/R3R1K1 b - - 0 14","c7c6 d5h5 h7g8 f3g5 e7g5 h5g5",1336],["00ZWf","r1b2bnr/ppQp3p/2n2q1k/6pP/2B1P3/3P4/PPP2PP1/RNB1K2R w KQ - 1 11","c2c3 f8d6 c7d6 f6d6",1346],["00PHg","R7/P4p2/5k1p/q5n1/5R2/7P/5PK1/8 b - - 2 46","f6e5 a8e8 e5f4 a7a8q a5a8 e8a8",1350],["00m6L","8/8/k6p/p4p1P/p1p1pP2/K1P1P3/1P6/8 w - - 1 49","a3a4 a6b6 a4a3 b6b5 a3a2 b5a4",1353],["00t2W","r3r1k1/p4ppp/2p5/5q2/2RPn3/3Q2B1/P4PPP/4R1K1 w - - 3 27","f2f3 e4g3 e1e8 a8e8 d3f5 g3f5",1355],["00sTO","4rk2/pp3pRp/3p1P2/2pP3q/2P4r/6Q1/PP3P1P/7K b - - 2 28","h5d1 h1g2 d1g4 g7g4 h4g4 g3g4",1359],["00YbZ","b6k/8/6p1/4q2p/1Q3r1P/P1N3R1/1PP3PK/8 w - - 3 35","b4b6 f4h4 h2g1 e5e1",1360],["00aDl","r5k1/1p3p2/2p1ppp1/3p4/2nP4/1QB2B1P/rPP2PP1/qNKR3R w - - 3 22","f3e2 a1b1 c1b1 a2a1",1362],["00fXd","8/Q5b1/p2kp3/1p2qpN1/1P6/P7/4nPP1/5K2 b - - 5 46","d6d5 a7c5",1364],["00g5H","2r3k1/p4pp1/1p5p/1Q6/8/5P2/qP4PP/3R2K1 b - - 3 30","a2c4 d1d8 c8d8 b5c4 d8d1 g1f2",1367],["00rNc","1q5r/p3kpp1/2Q1p2p/3pP2P/2n3P1/2N2P2/PrP5/K3R1NR w - - 0 26","g1e2 b2a2 c3a2 b8b2",1370],["0155R","4r1k1/pp2qp2/3p2pB/2nP4/P1P5/2P2R2/5QPP/4rRK1 w - - 7 24","f3f7 e1f1 g1f1 e7f7 f2f7 g8f7",1377],["00jPH","1k1r3r/1b1p1p2/p3p3/1p2Pn2/3n2Np/P1Q5/1P3PPP/1B2NRK1 w - - 2 26","b1f5 d4e2 g1h1 e2c3",1380],["00BCa","1r6/p2kp1P1/3p4/2pP4/2P2B2/pN6/5PK1/8 b - - 1 41","a3a2 b3c5 d6c5 f4b8 a2a1q g7g8q",1390],["00ouE","2r5/2r3k1/1p2pp1p/p2pQ1p1/3P4/4P1P1/PPq2P1R/KR6 w - - 0 30","e5e6 c2b1 a1b1 c7c1",1392],["012Dg","r2qkb1r/1pp2ppp/p5b1/4nP2/3p4/6N1/PPP1PP1P/R2QKBNR w KQkq - 0 12","f5g6 f8b4 c2c3 d4c3",1396],["00noA","8/1b4p1/p3p1Pr/1p1p4/3N4/2PB4/PP3k1r/1K3R2 b - - 20 41","f2e3 f1f3 e3d2 d4b3 d2e1 f3f1",1397],["00SCA","8/2Q5/2p2nk1/8/2r2K2/8/8/8 w - - 4 71","f4e5 c4e4 e5d6 f6e8 d6d7 e8c7",1400],["003S3","r4k1r/pNqnppb1/6pn/2p3Np/7P/2P2Q2/PP3PP1/R1B1K2R b KQ - 2 15","a8b8 g5e6 f8g8 e6c7",1415],["00j3i","5rk1/R5p1/5q1p/8/3p4/1P4Q1/P3rPPP/5RK1 w - - 2 38","g3g4 f6f2 f1f2 e2e1 f2f1 e1f1",1416],["0000D","5rk1/1p3ppp/pq3b2/8/8/1P1Q1N2/P4PPP/3R2K1 w - - 2 27","d3d6 f8d8 d6d8 f6d8",1433],["00IUT","1r2r1k1/ppp1q1pp/4b3/4P3/1Q1p1P2/8/P5PP/R1BR2K1 w - - 6 19","d1d4 c7c5 b4a3 c5d4 a3e7 e8e7",1442],["00JR7","r4rk1/pp2q1p1/2p1p2p/3nP1pP/3P2P1/2PQ1R2/PPB5/R5K1 b - - 1 23","f8f3 d3h7 g8f7 c2g6 f7f8 h7h8",1445],["00B3B","2K5/3P4/5b2/p1B5/P7/3k4/6p1/8 w - - 7 77","d7d8q f6d8 c8d8 d3c4",1446],["00Rmm","2rr2k1/5ppp/p7/1p1nP3/1B1P1PP1/PK5P/4R3/3R4 w - - 4 30","e2c2 c8c2 b3c2 d5e3 c2d3 e3d1",1451],["00KSB","r7/4kpRp/2p2p1P/p1P1n3/Pp6/1B6/5PP1/6K1 b - - 2 35","a8h8 f2f4 e5d7 g7f7",1464],["0054a","r1b2rk1/ppq2ppp/8/4b2Q/4R3/3B4/PP3PPP/R1B3K1 b - - 1 15","g7g6 h5e5 c7e5 e4e5",1466],["00gsT","1r3rk1/p4pp1/4p2p/1Q2Pn2/1b1P4/4BN2/q4PPP/2R2RK1 w - - 1 19","c1a1 a2a1 f1a1 b8b5",1467],["00CWE","3r4/1p4p1/2pBkbBp/p1P5/3rp3/P7/1PK2P2/4R3 b - - 1 31","e6d5 g6f7",1470],["009zS","r3r1k1/1p3p1p/p1p3p1/8/6bP/Q3b3/PP2B1P1/R3K2R w KQ - 2 20","g2g3 g4e2 e1e2 e3c5 e2f3 c5a3",1473],["005Bm","4rk2/p1q5/1p3Q1b/8/1p5N/2P1p3/P3P3/2K5 b - - 0 43","c7f7 h4g6 f8g8 f6h8",1476],["00Kbj","8/8/6p1/PR3p2/1P3k2/7P/r5P1/7K w - - 1 39","h3h4 f4g3 b5d5 a2a1 d5d1 a1d1",1481],["00AFG","r4rk1/2q2ppp/p3bp2/2P2N1Q/Ppp5/8/1PP2PPP/R2R2K1 b - - 6 21","c7c5 f5h6 g7h6 h5c5",1492],["0017R","r2qk2r/pp2ppbp/1n1p2p1/3Pn3/2P5/2NBBP1P/PP3P2/R2QK2R b KQkq - 0 12","e5c4 d3c4 b6c4 d1a4 d8d7 a4c4",1494],["00Pr6","r1b2rk1/p4ppp/2p5/6q1/2p3P1/3P1Q1P/PPP5/1K2RR2 b - - 0 17","c4d3 f3f7 f8f7 e1e8 f7f8 f1f8",1496],["00GVf","2b2k2/6q1/pn4p1/1rp2p2/8/8/1P2Q1P1/1K2R2R b - - 3 32","c8d7 h1h8 g7h8 e2e7 f8g8 e7d8",1497],["00PUc","3r3k/pp4bp/3Bn1p1/7n/8/8/PP3P1K/R4RN1 w - - 1 27","a1d1 d8d6 d1d6 g7e5 h2h1 e5d6",1503],["00LOy","5k2/1p3pp1/p3pb2/r7/2P2B2/1P6/1PR1K1PP/8 b - - 0 33","f6e5 b3b4 a5a1 f4e5",1506],["009BH","3r2k1/6p1/4Q3/4B3/1p3P2/4PKP1/3q4/8 b - - 17 51","g8h8 e6h6 h8g8 h6g7",1507],["00ofO","8/5kpp/2p2p2/P1Bpn3/1P6/7P/r4PP1/4R1K1 b - - 2 31","f7e6 f2f4 e6f5 f4e5",1507],["00QnO","1k1r1r2/pp4p1/6q1/2Qp4/5bP1/2P4p/PPN3NP/R4R1K w - - 0 30","g2f4 g6e4 h1g1 f8f4",1511],["004Ud","r1bqk2r/p3Bppp/3p4/1ppn4/4P3/4Q3/PPP2PPP/2KR1B1R b kq - 0 11","d5e7 f1b5 c8d7 d1d6 d7b5 d6d8",1513],["0068B","r1q3k1/4bppp/pp2pn2/4B3/8/2N2Q2/PPPR1PPP/6K1 b - - 0 18","f6d7 d2d7 c8d7 f3a8",1514],["00isY","rnbqkb1r/ppp3pp/5n2/3P1p2/4pB2/2N5/PP3PPP/R2QKBNR b KQkq - 0 7","f8b4 d1a4 c7c6 a4b4",1524],["00Al5","2r3k1/p2q1pbp/1p2pnp1/nB1p4/3P4/1Pr1P2P/P1QB1PP1/2R2RK1 w - - 0 19","b5d7 c3c2 d7c8 c2d2",1525],["00X2j","8/5KP1/R1k5/8/2pp4/8/8/6r1 b - - 1 50","c6c5 a6g6 g1g6 f7g6 d4d3 g7g8q",1539],["006E1","5rk1/R4pp1/1p5p/3Q4/1PPp2q1/3P2P1/5P2/4nK2 w - - 0 34","f1e1 f8e8 e1f1 g4h3 d5g2 e8e1 f1e1 h3g2",1543],["00LH7","6k1/6Bp/6pP/3q1p2/p2PnQ2/2r5/P5PK/4R3 b - - 1 39","d5d6 e1e4 d6f4 e4f4",1547],["00SU7","2rqr1k1/B2b1ppp/5n2/8/3Q4/3B4/P1P2PPP/R3R1K1 w - - 3 22","d4h4 e8e1 a1e1 d8a5 e1a1 a5a7",1549],["00gyK","5rk1/5pp1/3p3p/4p1N1/8/PR6/1p3PPP/6K1 w - - 0 33","g5e4 f8c8 g2g3 c8c1",1550],["00DkJ","3r1bnr/2p2ppp/2b5/R1k5/5P2/2N5/4N1PP/1R4K1 b - - 3 21","c5d6 b1d1 d6e7 a5e5 e7f6 d1d8",1552],["00Mbv","2k2b1r/pp3ppp/1n6/BN2p1P1/2Q1Nn1P/8/PP3P2/2KR4 b - - 0 24","b6c4 d1d8",1558],["006pe","r4r2/2q1NN2/4bQpk/2n4p/pp5P/8/1PP2PP1/2KR3R b - - 0 28","e6f7 e7f5 h6h7 f6g7",1560],["00Nf5","r1bq1rk1/pp2bppp/2pp1n2/8/5P2/5N2/PBPPB1PP/RN1Q1RK1 w - - 5 11","b1c3 d8b6 g1h1 b6b2 a1b1 b2a3",1563],["00oQO","5rk1/1p4pp/p7/3R1N2/4rn2/6KP/PPR2PP1/8 w - - 1 34","d5d4 f4e2 c2e2 e4e2",1564],["000Sa","2Q2bk1/5p1p/p5p1/2p3P1/2r1B3/7P/qPQ2P2/2K4R b - - 0 32","c4c2 e4c2 a2a1 c2b1",1565],["00b7t","r2qr1k1/pb3pp1/1p4n1/3p4/1P2p2p/P1P1N1P1/2Q1PPBP/3R1RK1 w - - 0 20","g2e4 e8e4 c2e4 d5e4 d1d8 a8d8",1567],["00m5H","8/1p5p/6p1/2P2k2/1P6/P3qp1Q/8/5K2 b - - 5 43","f5e4 h3e6 e4d4 e6e3 d4e3 b4b5 g6g5 c5c6",1567],["00huW","8/3k4/p6p/1p2Q1pP/3P2b1/1PP2qP1/P3p3/1K2R3 w - - 3 44","d4d5 f3d3 b1b2 d3d2 b2a3 d2e1",1571],["00qk4","3r4/ppN1kppp/5n2/8/1n3Nb1/4P3/1B3PPP/R3KB1R w KQ - 0 18","a1c1 b4c2 c1c2 d8d1",1571],["002Uy","8/8/1p6/k7/P1R5/1K5r/8/8 w - - 26 64","c4c3 h3c3 b3c3 a5a4 c3b2 a4b4",1573],["00BM8","r4rk1/pp2bppp/2ppnn2/8/N1P1P3/q1P4P/P2N2PB/R2Q1R1K b - - 0 16","a8d8 d2b1 a3a4 d1a4",1583],["00CMj","7R/8/8/6p1/2p1p1k1/2PbK2p/P7/8 w - - 4 71","e3f2 e4e3 f2e3 g4g3",1588],["00ieR","6k1/1p3p1p/4p1p1/1P1pP3/P7/4r3/7P/1R4K1 b - - 0 33","e3e5 a4a5 d5d4 a5a6 e5b5 b1b5",1592],["00pEZ","2kr2r1/ppq1bbBQ/2p1p3/2npP3/8/2P2N2/PPB2PPP/R4RK1 w - - 3 21","g7f6 e7f6 e5f6 g8h8",1594],["00Kia","5r1k/4n1pp/1p6/pP5Q/P2pB2K/6P1/2P4P/4q3 b - - 4 37","g7g6 h5e5 h8g8 e4d5 e7d5 e5e1",1596],["00UF4","rnbQ1b1r/pp2n2p/2p2k2/1q2p1p1/3P4/5N2/P1P2PPP/R1B1K2R b KQ - 0 13","f8g7 c1g5 f6f7 d8e7",1599],["00XTV","8/2k4p/p2p2p1/2pP1p2/2P4P/3K4/P2R1PP1/4r3 w - - 0 28","d2e2 e1e2 d3e2 c7b6 e2f3 b6a5 a2a3 a5a4",1602],["00k2Z","5rk1/8/8/p1pR4/P1Pb4/1P1p2P1/6P1/1R3K2 w - - 3 38","f1e1 d4c3 e1d1 f8f1",1607],["00JYV","r2q1rk1/p1p1bppp/2pp1nb1/4p3/4P1PN/2NP3P/PPP2PK1/R1BQ1R2 b - - 4 11","f6e4 h4g6 e4c3 g6e7 d8e7 b2c3",1612],["00lA1","r3k2r/ppp3Np/3p2pB/2b1p3/2B1P3/2NP3q/PPP2P2/R2R2K1 b - - 3 17","e8d8 h6g5 d8d7 c4e6 h3e6 g7e6",1612],["00LNH","1k2r3/pp2r2p/2pqbpp1/3n4/2BP1p2/5N1P/PPQB1PP1/1K1RR3 w - - 2 22","c4b3 e6f5 c2f5 g6f5",1622],["00n76","8/8/7p/1P1R3P/8/2k5/3p3r/3K4 w - - 3 49","b5b6 h2h1 d1e2 h1e1",1626],["00t8q","r4rk1/1pp2pbp/2n1bnp1/2q1p3/4P3/1NP2PB1/PQ4PP/1KNR1B1R b - - 0 17","c5b6 g3f2 c6d4 c3d4",1629],["00Uwn","3r1rk1/p1p2pbp/1p4p1/7n/4P3/1P2BP1q/P1B3QP/3R1R1K b - - 6 23","h3h4 e3g5 h5g3 g2g3",1631],["00eWz","4r1k1/p5bp/1q4p1/2pPrp2/1pP2N2/6PP/P4QB1/1R3RK1 w - - 2 25","f4e6 e5e6 d5e6 g7d4",1631],["00WqT","r4r2/1ppb1p2/p2p2pk/5P2/4P3/2PBB1R1/PKP2P1q/8 b - - 4 26","h6h5 d3e2 h5h4 e3g5",1635],["00hA5","6n1/2p3k1/1p1p2P1/p2P1K1P/P1P5/1P6/8/8 b - - 2 53","g8h6 f5e6 h6g8 e6d7",1637],["00ccX","r4rk1/1p1b1pbp/p1pp2p1/8/2PNq3/1P2P2P/PB1Q1PP1/R2R2K1 w - - 0 19","d2d3 e4d3 d1d3 c6c5 b2c3 c5d4",1641],["00yfI","r1b5/1p3kpp/p1nBpn2/3p4/3P4/P1NQ4/1PP1B1qP/2K2R2 w - - 2 17","d3h7 g2f1 e2f1 f6h7",1642],["00l7Y","r1b2q2/p3p1bk/2p3p1/3pn2p/8/2NB3P/PPPBQ1P1/5RK1 b - - 1 17","f8d8 e2h5 h7g8 d3g6 e5g6 h5g6",1647],["00qmI","4k3/3n3P/p2PN1K1/8/1p6/2b5/8/8 b - - 0 51","b4b3 e6g7 c3g7 g6g7",1668],["002Ua","r4rk1/pp3ppp/3p1q2/P1P1p3/2B5/2B2n2/2P2P1P/R2Q1RK1 w - - 0 16","g1h1 f6f4 d1f3 f4f3",1669],["00lIV","r2qr1k1/pb2bppp/2p2n2/3pN1B1/2P5/4P3/PPQ2PPP/3RKB1R w K - 3 13","f1e2 e7b4 e1f1 e8e5",1669],["00J1t","r1qr3k/pp3pB1/1np1pb2/8/3P3P/2N2PR1/PP1Q2P1/2KR4 b - - 0 22","f6g7 d2g5 d8g8 g5h5 g7h6 h5h6",1678],["00IUW","8/Q1p1r1kp/5pp1/3P3r/4P3/2N2bPq/PPP2R1P/5RK1 w - - 3 23","a7e3 h3g3 h2g3 h5h1",1684],["00Qqp","6k1/8/p3P1p1/8/8/2P3PP/1r5r/R3RK2 w - - 0 46","e6e7 h2h1",1684],["00tgU","r4rk1/pbpp2p1/1pn3Qp/3N4/3q1N2/3B4/PP3PPP/5RK1 b - - 5 20","c6e5 d5e7 g8h8 g6h7",1687],["006fF","r1b4r/pp1k2pp/2nb2q1/1B1p2B1/3p3Q/8/PPP2PPP/3RR1K1 b - - 5 17","h7h6 h4g4 d7c7 g5d8 h8d8 g4g6",1688],["00DII","2rr2k1/p5p1/1p5p/2pP1p1P/2q5/P4QR1/5PP1/4R1K1 b - - 3 31","c4d5 e1e8 g8f7 f3d5 d8d5 e8c8",1692],["00TRo","5q1k/2r3p1/1p2p2b/3p2NQ/3P4/1p6/5R2/6K1 b - - 1 38","f8b4 h5e8 b4f8 f2f8",1695],["00Wyh","2r5/8/8/pNp1r2p/3kNppP/1P1P4/2R2K2/8 b - - 2 42","d4d3 c2d2 d3e4 b5d6",1701],["00WlQ","2r1r1k1/pp3pp1/4bb1p/2qp4/Q7/1PNRPN2/P4PPP/3R2K1 w - - 0 19","c3d5 e6d5 a4e8 c8e8",1702],["00xHQ","1r4k1/5p1p/3R2p1/1qN5/3Qp3/7P/5PPK/1r6 b - - 0 35","b1b4 d6d8 b8d8 d4d8 g8g7 c5d7",1703],["00ZDZ","8/pp4k1/2p3p1/3nRr2/3P1Pp1/2P3K1/PP6/5R2 w - - 3 36","g3g4 f5e5 d4e5 d5e3 g4f3 e3f1",1706],["00IiM","r5k1/pp4p1/1n6/3pB3/3P2pb/2NQ1r2/PP6/2K3R1 w - - 2 24","d3f3 g4f3 g1g7 g8f8",1707],["00Ueq","r1b2rk1/pp4b1/n1pqp1Q1/4p3/2P2PP1/P2B4/1P6/R1B1K2R b KQ - 1 19","f8f6 h1h8 g8h8 g6h7",1725],["00XXM","3r1br1/Qpqk1p2/p1p1p2p/3nP3/8/2P1NP1N/PP6/1K1R3R b - - 3 25","f8e7 c3c4 b7b6 a7c7 d7c7 c4d5",1725],["00oGl","4rbk1/ppq2rpp/2p2n2/8/8/1Q2B1N1/PPP2PPP/R3R1K1 w - - 5 18","e3a7 e8e1 a1e1 c7a5 e1e2 a5a7",1727],["00Wi9","8/8/3n1P2/2k5/2pp1K2/P7/8/3B4 w - - 2 63","f4e5 d4d3 f6f7 d6f7",1737],["00mRr","8/2Q2kpp/1p1p2r1/1PnN4/2P1n3/6P1/1r3PK1/8 b - - 6 41","f7e6 c7e7 e6f5 d5e3",1742],["00IHi","8/4R3/1k6/8/p7/1p1N2P1/5KP1/r7 w - - 0 55","e7e1 a1e1 f2e1 a4a3 e1d2 a3a2 d2c3 a2a1q",1743],["00qb9","8/8/3k4/1p6/1Pp1K3/2P5/8/8 b - - 2 54","d6c6 e4e5 c6d7 e5d5",1746],["00UyQ","4r1k1/p1p2pp1/1p5p/2Q1P3/5r1q/5R2/P3B1PP/R5K1 w - - 0 22","c5c7 f4f3 g2f3 h4d4 g1g2 d4a1",1751],["00jgd","5Q2/8/8/8/pn6/k6r/8/2K5 w - - 2 83","f8d6 h3c3 c1d2 c3d3 d6d3 b4d3",1759],["00ueM","2kr4/2pR4/2P1K1P1/8/8/p3n3/8/8 b - - 1 49","a3a2 d7d8 c8d8 g6g7 a2a1q g7g8q",1761],["007en","rn3rk1/4pp1p/3p2pB/2q4P/3bP1b1/Pp2Q3/1P2B3/1K1R2NR w - - 0 20","e3d4 c5c2 b1a1 a8a3 b2a3 c2a2",1766],["00Nay","r2q1r2/ppp2pk1/3p1n2/4p1p1/2B1P3/2NP2Q1/PPP5/2K4R b - - 0 19","g7g6 g3h3 f8h8 h3f5 g6g7 f5g5",1766],["00iLe","r1b1r1k1/pp1n1pb1/3p1q1p/2pP2p1/2P1B3/4PNB1/PPQ2PPP/2KR3R w - - 1 15","h2h4 e8e4 h4g5 h6g5",1773],["00FPo","7R/1K3p2/6k1/PP4p1/8/6rp/8/8 b - - 2 47","g5g4 a5a6 h3h2 h8h2",1775],["00agR","8/5pp1/p4n1p/1p2k3/8/1PK1P3/P1B2P1P/8 w - - 2 31","h2h3 f6e4 c2e4 e5e4",1776],["00ZEc","1r3bk1/5p2/3P1qRP/r1n1p3/ppB5/P2Q1P2/1PP5/1K6 b - - 0 35","g8h7 g6g7 h7h6 d3h7",1778],["00yzd","6k1/8/4p1p1/1P5p/1B2PP2/3pb1KP/2p5/4R3 w - - 2 36","g3f3 d3d2 b4d2 e3d2 b5b6 d2e1",1780],["00IYg","r1b2r2/pp2npp1/1qn1p1k1/3pP1N1/3P3P/P7/1P1Q1PP1/RN2K2R b KQ - 0 13","f7f6 h4h5 g6h6 g5e6 h6h7 e6f8",1786],["00EgR","N2k3r/1b1n1Bpp/p7/1pb1P3/6P1/4p3/PPP4P/1K1R3R w - - 1 20","e5e6 b7h1 d1d7 d8c8 d7c7 c8b8",1788],["00FND","8/1P6/8/7p/3P4/3k1p1P/4p3/3K4 w - - 0 49","d1e1 d3e3 h3h4 f3f2",1789],["00gym","r2qkb1r/pp2pppp/3p1nb1/4n3/4P1PN/2PB3P/PP3P2/RNBQK2R b KQkq - 0 11","g6e4 d3e4 f6e4 d1a4 e5c6 a4e4",1795],["00Se9","5rk1/pp1n2r1/3p2N1/2pQ4/2P5/4P1P1/qP2KPP1/7R b - - 1 24","g7f7 g6e7 g8g7 d5g5",1803],["00kCm","2r3k1/3n1pp1/pq2r1p1/2p5/3b4/BP5P/P2N1PP1/R1Q1R1K1 w - - 0 23","a3b2 e6e1 c1e1 d4b2 d2c4 b6f6 c4b2 f6b2",1804],["00rqm","2r2r1k/3b3n/p6q/1p1nN3/7P/3P2Q1/PPP2P2/1K4RR b - - 0 30","d7f5 g3g8 f8g8 e5f7",1804],["00hSW","2R5/4b1pk/1r5p/2pPN3/1p2P3/3P4/4K1PP/8 w - - 1 39","e5d7 b4b3 d5d6 e7d6 d7b6 b3b2 b6c4 b2b1q",1807],["00zdb","2rqr1k1/pb3p2/1p4pp/n2p4/P1pRnN2/2P2N1P/BPQ2PP1/3R2K1 b - - 2 20","c8c5 d4e4 d5e4 d1d8",1816],["00008","r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24","f2g3 e6e7 b2b1 b3c1 b1c1 h6c1",1819],["00lHu","8/p7/6P1/4p3/R4pK1/1r2k2P/8/8 b - - 0 47","f4f3 g6g7 b3b8 a4a3",1826],["00MDy","8/pp6/2p1k3/2Pp2pp/1P1P1p2/P2K1P2/6PP/8 w - - 0 42","g2g3 f4g3 h2g3 h5h4 g3h4 g5h4",1833],["013Kj","2r2rk1/pp2qp2/4p3/3p2P1/3P4/P1N4Q/1PP5/1R4K1 b - - 0 30","e7g5 g1h1 g5g6 b1g1 g8g7 g1g6",1838],["00e7H","8/7p/p1p4k/1p1p4/3Qpq2/2P2NpP/PP4K1/8 w - - 0 44","f3d2 c6c5 d4c5 f4d2",1845],["00NHK","r1b2rk1/1p2b1p1/pqn1p1P1/3pP3/1P1P4/P1N1P3/6P1/R2QK2R b KQ - 0 17","c6e5 h1h8 g8h8 d1h5 h8g8 h5h7",1847],["00dqP","r1b2rk1/5p1p/p3pP2/1p1p4/5q1n/1P5P/P1P1QPB1/1K1R2R1 b - - 2 21","f4f6 g2d5 h4g6 d5a8",1848],["00dwJ","2r5/2r3k1/p1q1b1pp/3pn3/3R4/4P1N1/PQ4PP/R5K1 b - - 7 32","c6c1 a1c1 c7c1 g3f1",1852],["01Qia","1k4rr/pp3p2/b3p1q1/3p4/6R1/Q6P/PPP2PP1/4R1K1 b - - 4 27","g6c2 a3g3 e6e5 g4g8 h8g8 g3g8",1857],["0095W","8/pp1r2kp/q2P1ppb/4p3/2N1P3/1Q5P/PPR2PP1/6K1 w - - 3 32","c4e5 f6e5 c2c7 a6d6",1858],["00UI2","2r3nr/p5pp/b3kp2/3p4/4p3/BP3P2/P1PN2PP/2KR3R b - - 0 18","f6f5 f3e4 f5e4 d2e4 d5e4 d1d6 e6f7 d6a6",1860],["00yzf","3rk3/3N2R1/4P1pr/3pP3/2p5/6p1/PP6/2K5 b - - 3 29","g3g2 d7f6 e8f8 g7f7",1861],["012wW","8/8/7p/7P/2k2Kp1/6P1/8/8 b - - 5 46","c4d5 f4f5 d5d4 f5g6",1862],["01kKD","2k3rr/pp1q1p2/3p1p2/1p1N4/1P1QP2p/P4b2/2P2PPP/R4RK1 w - - 2 20","g2g3 d7h3 d4c3 c8b8 c3c7 b8a8 c7d8 g8d8",1863],["00ttk","6k1/ppqn1rp1/2p3Qp/3p1N2/3P1bP1/2P4P/PP1N1P2/R5K1 w - - 4 21","d2f3 d7f8 g6h5 g7g6",1867],["00Rue","r2qkb1r/pp1nppp1/2p2n1p/3p1b2/3P4/BP2PN2/P1P2PPP/RN1QKB1R w KQkq - 2 7","c2c4 f5b1 a1b1 d8a5 b3b4 a5a3",1868],["01Rax","6k1/1p6/p2p1N2/P1pPp3/2P1Pbp1/1P6/6K1/8 b - - 0 42","g8g7 f6e8 g7f8 e8d6",1868],["01IKl","k1r4r/2Qn1p1p/1p1Bpnp1/q7/2BP4/2P5/1PK2P1P/3R2R1 w - - 5 29","c7c8 h8c8 d1a1 c8c4 a1a5 b6a5",1869],["006om","1r3k2/5p1p/2p1pp2/P2n4/2r1N3/P4PK1/2R2P1P/2R5 b - - 9 29","c4a4 e4c5 a4a5 c5d7 f8g7 d7b8",1874],["017u3","r2qk2r/4bppp/p3bn2/1p2N3/5B2/2N5/PP3PPP/R2QR1K1 b kq - 1 19","e8g8 e5c6 d8e8 c6e7 e8e7 f4d6 e7d8 d6f8",1874],["01FId","2rr4/1Q3p1k/6pp/p4q2/8/2P1R1R1/P4PK1/8 b - - 5 38","d8d2 e3f3 d2b2 b7b2",1876],["003wQ","2r2rk1/6pp/3Q1q2/8/3N1B2/6P1/PP1K3P/R4b2 w - - 0 24","a1f1 f6d6 f4d6 f8f1",1877],["00umX","2k3rr/ppp2p2/3b1p2/2pP1q1p/2P2B2/2N2B1b/PP1Q1PP1/R3R1K1 w - - 4 19","f4d6 f5f3 e1e8 c8d7",1878],["00zI4","r2q1rk1/pb3ppp/1p2p3/2nn4/8/P1N1PN2/1P1Q1PPP/1BR1K2R b K - 1 13","c5b3 d2c2 g7g6 c2b3",1879],["01Uzs","rnbqk2r/ppp2ppp/3bpn2/8/4P3/1BN5/PPPP2PP/R1BQK1NR b KQkq - 0 6","f6e4 c3e4 d8h4 e4f2",1889],["00afi","3r2k1/1p5p/pbbqpr2/3PR3/P5p1/2B2N1P/1PQ2P1P/3R3K b - - 0 26","f6f3 e5g5 g8f8 c2h7 d6h2 h1h2 f3h3 h7h3",1890],["00Qm5","r2q1rk1/p3b1pp/2p5/4ppB1/4p1nP/2N5/PPP1QPP1/3R1RK1 b - - 8 15","d8c7 e2c4 g8h8 c3d5 c6d5 c4c7",1893],["00p93","1k1r1b1r/n1p3p1/p5p1/1pn1P3/P2B2Pq/2P2Q1P/1PB1K3/R6R b - - 0 24","c5e6 d4a7 b8a7 a4b5 d8d2 e2d2",1895],["01LIu","7k/p5p1/8/2P1p2p/6n1/PqBQ2P1/7P/6K1 w - - 3 32","c5c6 b3b6 c3d4 e5d4",1905],["01Z4Y","2r2rk1/3b1p1p/3p3P/p2Np1q1/1p2Q3/8/PPP5/1K1R3R b - - 1 23","d7f5 e4f5 g5f5 d5e7 g8h8 e7f5",1908],["01WwV","8/8/8/3KPk2/p7/1pP5/1P6/8 w - - 0 45","d5d6 a4a3 e5e6 a3b2 e6e7 b2b1q",1909],["016b0","r5k1/p2Q1pp1/1p2P1rp/2p5/P1Pp4/5q2/1P3P1P/3RRK2 b - - 0 31","g6g2 d7f7 f3f7 e6f7 g8f7 f1g2",1914],["005wy","1r6/pp2kpp1/2n1p1n1/3p2PQ/5P2/2PqP3/PP1N4/2KR3R w - - 3 27","h5h7 c6b4 c3b4 b8c8 d2c4 c8c4",1918],["00FF5","r3k3/ppp1qp2/1b1p3p/4p2r/2B1P1b1/P1PP1P2/1P4PQ/RN3R1K b q - 2 18","e7h4 c4f7 e8e7 f7h5",1919],["01Amj","8/8/8/2p1K3/p7/Bk6/8/8 w - - 1 54","a3c1 a4a3 c1a3 b3a3 e5d5 a3b4",1920],["00fba","3r2k1/p3qp1p/6p1/P7/3r4/2Q4P/n4PP1/1RR2BK1 w - - 2 31","c3c7 d4d7 c7c5 a2c1 c5e7 d7e7",1925],["00cxg","r2qk2r/1p2bpp1/p2pp3/8/4b2P/4B3/PPPQB3/2K3RR b kq - 1 17","g7g6 d2d4 e4h1 d4h8 e8d7 h8d8",1935],["00VNr","5rk1/npp3p1/p3pr1p/2b5/3NR3/4B2P/PPP2PP1/R5K1 w - - 5 22","e4e6 c5d4 e6f6 d4f6 e3a7 b7b6",1938],["00xDW","7k/5Bp1/3p3p/8/4P1n1/r1rP4/6PP/1R1R2K1 b - - 0 36","c3d3 d1d3 a3d3 f7g6",1943],["00bqJ","r7/1pp4k/p2p3p/3Ppq2/2P2bb1/1N2R3/PP1Q4/1K1N2R1 w - - 8 27","d2c2 f5c2 b1c2 g4d1 g1d1 f4e3",1951],["00eak","4r1k1/5pp1/5n1p/P5r1/7q/1QP1p1PP/1P3P2/R3RBK1 w - - 0 27","g1h2 f6g4 h2g2 g4f2",1952],["01M1X","4r3/4bpkp/3p2pN/4P1P1/1p2qn1P/5N2/1P1Q1P2/3R2K1 w - - 0 30","e5d6 e4f3 d2d4 f7f6",1957],["01UsT","r3r1k1/pp2qp1p/3b2p1/3p4/3P2n1/1PN5/PBP1BPPP/R2QK2R w KQ - 6 15","h2h3 g4f2 e1f2 e7e3 f2f1 d6g3",1974],["009XT","rn1qk2r/pp3ppp/3bp1b1/3p4/3Pn2N/3BB3/PPP2PPP/RN1Q1RK1 w kq - 4 10","h4g6 d6h2 g1h1 h7g6",1981],["00WTN","8/7R/B2k4/2pnp3/P7/3KP3/1r6/8 w - - 1 43","a6c4 e5e4 d3e4 d5f6",1994],["00dWq","2r1kb2/5p1p/p3p3/1p2P1Q1/1Pq5/P1p3P1/2P4P/2KR1R2 w - - 0 28","g5f4 f8h6 c1b1 h6f4",2007],["01pSj","8/5k2/8/2N1p1p1/1P2Pn1p/2P2P1P/5RP1/1r4K1 w - - 4 37","g1h2 f4h5 g2g3 h4g3 h2g2 g3f2",2009],["024qY","r4r1k/pp4pp/4Q1p1/2P5/3B4/2P2Pq1/P2n2P1/R4RK1 b - - 2 23","a8e8 e6d7 d2f3 f1f3 e8e1 a1e1 g3e1 g1h2",2009],["00Qog","1r3rk1/pP2qppp/1b3n2/1Q2p3/4P3/2NP1bP1/PP2NP1P/R1B2RK1 w - - 1 15","c1g5 e7e6 e2f4 e5f4",2012],["01Vce","2r4r/6b1/8/1b1pPQ1k/2p2P2/4P3/PP1B3q/2K5 b - - 7 33","h5h4 d2e1 h2g3 f5g5 h4h3 g5g3",2013],["01H6V","8/RR4pk/6r1/7p/P3KP1P/4P1P1/1pr5/8 w - - 0 50","e4f3 c2c7 b7b2 c7a7",2018],["00Yuf","5rk1/n1q2ppp/1p1bpn2/1B1p1b2/NP1P4/P3PN2/3B1PPP/3Q1RK1 w - - 0 19","b5e2 f5c2 d1a1 c2a4",2024],["00x5X","7r/Bp1k1ppp/b7/4P3/1b1N4/8/PP3rPP/R2K3R w - - 0 19","d4c2 f2d2 d1c1 h8c8 h1d1 c8c2",2024],["01oma","r4q1k/1p4pp/1n2Q1pN/p3P3/Pbp1P3/3p4/1P2B1PP/5RK1 b - - 5 25","d3e2 f1f8 a8f8 e6g8 f8g8 h6f7",2024],["02AQs","7r/6p1/Pk6/R7/1P6/8/2K5/8 w - - 1 49","a5a2 h8h2 c2b3 h2a2 b3a2 g7g5",2024],["008lc","7k/pb1qn2n/1p2R2Q/2p2p2/2Pp4/3B4/PP3PrP/4RK2 b - - 1 27","g2g7 h6g7 h8g7 e6e7 d7e7 e1e7",2031],["02Dc0","r1b2rk1/5ppp/1p3P2/p1p5/5q2/2PB3P/PPK1QP2/3R2R1 b - - 2 19","f4f6 e2e4 g7g6 e4a8",2035],["00mF3","1r6/6k1/b2p1p2/2qP1Pp1/1pP1P1P1/3Q4/3BK3/7R w - - 4 38","d3h3 c5c4 e2f2 c4e2 f2g1 e2d1",2036],["00j9Q","rnb2r1k/2q2p1p/p2p1bp1/1p2pN2/4P1QN/3B3R/PPP2PPP/R5K1 b - - 1 19","g6f5 h4f5 c8f5 g4f5",2038],["018eM","r3kb1r/1p1b1pp1/pq3p1p/3p4/3P4/2N2N2/PPP1QPPP/R3K2R b KQkq - 1 11","f8e7 e2e7 e8e7 c3d5 e7d6 d5b6",2038],["01R41","4rr1k/6bp/p1bp2p1/1p2q3/1P2PN2/2N2QP1/1BP2n1P/2K1R2R b - - 4 26","f8f4 g3f4 e5d4 c3d1",2041],["00kHM","3r1rk1/pp2npp1/1q2b2p/3p4/4n3/PBP2N1P/1P1N1PP1/R2Q1RK1 w - - 4 16","d2e4 d5e4 f3d4 d8d4",2050],["01mWJ","8/8/7p/2k1p1p1/4N1P1/r4PN1/4K3/8 b - - 1 58","c5d4 g3f5 d4c4 f5h6",2051],["02Gn8","8/8/6p1/5pkp/1Q6/P5PK/1q4P1/8 b - - 0 51","b2e5 b4h4 g5h6 h4f4 e5f4 g3f4",2057],["01g9c","r4rk1/ppq3pp/8/3pn1B1/8/3B1N1b/PP2NKPb/2RQR3 w - - 0 19","c1c7 e5g4 f2f1 f8f3",2058],["02Gyp","8/4k3/5R1K/4r1p1/6P1/8/8/8 w - - 0 63","f6f5 e5f5 g4f5 e7f6 h6h5 f6f5",2058],["02e7X","r4rk1/ppp2pb1/2qp1npp/8/2P1P3/1P3QP1/PB1N1PKP/R4R2 b - - 1 15","f6e4 b2g7 e4d2 f3c6 b7c6 g7f8 d2f1 f8h6",2064],["02j44","rn3knr/pbppq3/1p4Bp/4P1pQ/2p5/2P3N1/P4PPP/R3R1K1 b - - 1 17","b8c6 h5f3 f8g7 g3f5 g7g6 f5e7 c6e7 f3b7",2067],["02Plz","7k/q3r1b1/4N1pp/5p2/7P/1Q2P1P1/8/3R2K1 w - - 2 36","e6g7 e7e3 d1d8 e3e8 g1g2 e8d8",2068],["01jTV","2k4r/ppp3r1/3b1B2/4R3/1P2N1P1/P2P1p2/2P1n2P/5R1K b - - 4 31","d6e5 f6e5 h8h2 e5h2",2077],["02pc3","r5k1/4bppp/4p3/q2pN3/3Bn3/8/P3QPPP/2R3K1 b - - 0 23","a5a2 e2a2 a8a2 c1c8 e7f8 e5d7",2081],["02NG2","2k4r/Qp3p2/2p3pp/4q3/8/5P2/Pr3P1P/3RR2K b - - 1 25","e5c7 a7d4 h8d8 d4b2",2084],["026QC","2r5/R7/1p5p/1kq1pr2/1N1p4/P2P1p2/1PP4P/2K2Q2 b - - 0 36","c8c7 a3a4 b5b4 f1e1 c5c3 b2c3",2091],["027OD","r2q1rk1/1pp2ppp/1pp5/4B3/1P2P2n/P2P1P2/2PQ1P1P/R4K1R w - - 0 16","h1g1 f7f6 e5b2 h4f3 d2c3 f3g1",2106],["01fsb","3q1rk1/1R3ppp/r5b1/p1bN4/6P1/5N1P/P1P2P2/3QR1K1 w - - 1 18","b7d7 d8d7 d5f6 a6f6 d1d7 f6f3",2107],["00JtR","1rbk3r/3qp1b1/p3p1Bp/1N1P2p1/8/P5P1/1P2Q1P1/R3K2R w KQ - 2 23","d5e6 d7b5 e2d2 d8c7 a1c1 c7b7 g6e4 b7a7",2109],["00vuv","r3r3/2q1b1pk/p3P1Np/5Qp1/8/3p4/PPp2P2/2R1R1K1 b - - 1 30","d3d2 g6f8 h7g8 f5h7 g8f8 h7h8",2111],["00XbN","6k1/R4p1p/6P1/3p4/8/2b5/1r2rBPP/5RK1 b - - 0 26","e2f2 g6f7 g8f8 a7a8",2117],["00dt1","Q7/8/3B4/2p5/Krkn4/8/8/8 w - - 1 54","a4a3 d4b5 a3a2 b5c3 a2a1 b4b1",2117],["02ZzV","8/7b/8/p7/2BNpn2/k1K1p3/P7/8 b - - 9 58","f4d3 c4b3 e3e2 d4c2",2118],["01Xw1","r2q1r2/3b1pk1/p2p1n2/npp1pPN1/4P1PQ/PBPP3P/2P5/R4RK1 b - - 2 19","f8h8 g5e6 d7e6 h4g5 g7f8 f5e6",2137],["01PlY","r5k1/p4p1p/1p1R2nQ/4p3/1P2qn2/P7/1B3PP1/R5K1 w - - 0 24","h6g5 h7h6 g5g4 f4e2 g4e2 e4e2",2139],["01oWi","8/p7/8/1PP1p3/4K1k1/2b3P1/8/8 b - - 0 48","g4g3 b5b6 a7b6 c5c6",2140],["000qP","8/7R/8/5p2/4bk1P/8/2r2K2/6R1 w - - 7 51","f2f1 f4f3 f1e1 c2c1 e1d2 c1g1",2146],["01wOq","2r3k1/6p1/3q3p/1R1Pp2P/P1p1p3/2Q3P1/5P2/5K2 b - - 1 36","c8c5 c3b4 d6d5 b5c5",2150],["02E9M","r2qk2r/p1p2ppp/2pb1n2/3p4/2P2Qb1/1PN1P3/PB3PPP/R3KB1R w KQkq - 4 12","f4g5 h7h6 g5g7 h8h7 g7h7 f6h7",2151],["02Oxp","3q1rk1/p5pp/1p6/2rb1p2/2B1pP2/1Q6/P5PP/2RR2K1 b - - 1 23","d5c4 c1c4 d8d1 b3d1 c5c4 d1d5",2153],["00vUf","3R4/p4pkp/2p5/6p1/1P1B4/r3PP2/2r3PP/5K2 b - - 6 31","g7g6 d8d6 f7f6 d6f6 g6g7 f6c6",2159],["02FJ8","5k1r/pr2b1p1/1p1p1p1p/2nN1b2/2BB4/8/P4PPP/3RRK2 b - - 7 24","f5g6 d4c5 b6c5 c4a6",2165],["01Prl","r1bqn1k1/4prbp/p1p3p1/3p4/5P2/1BN5/PPP3PP/R1BQR1K1 b - - 1 14","d8c7 c3d5 c6d5 d1d5 e7e6 d5a8",2172],["00slx","8/6r1/3kpRp1/6Pp/3K1P1P/8/8/8 b - - 0 61","d6e7 d4e5 g7g8 f6e6 e7f7 f4f5",2178],["01RKd","8/8/r3p1R1/4K2p/5P2/5kP1/8/8 b - - 6 40","a6b6 f4f5 b6b5 e5e6",2193],["01n09","r3k2r/pB2qppp/2pp4/4n3/1B6/4P1Pb/PPPQ1P1P/R3K2R w KQkq - 0 15","d2d6 e5f3 e1e2 e7b7 e2f3 c6c5",2193],["01kad","1r5k/p4q1p/2Q2p2/4pN2/Pr2P3/1P1n3P/K1P2P2/4R2R w - - 5 27","e1b1 b4b3 b1b3 d3b4 a2b1 b4c6 b3b8 c6b8",2197],["013U2","r1b2k2/p2pbP2/1pn3pr/1P5p/2B5/P1B3N1/2P3PP/1K2R3 b - - 0 23","c6d8 e1e7 f8e7 c3b4 d7d6 b4d6",2199],["07coZ","2kr3r/2p2pp1/R2bpn2/1p3q1p/2Pn4/5B2/3N1PPP/2BQ1RK1 b - - 0 16","b5c4 d1a4 f5b5 a4b5 d4b5 f3c6",2201],["0125B","8/1p6/1Pr2P2/1Rp3K1/3p4/4k3/8/8 b - - 0 44","c6f6 g5f6 c5c4 b5e5",2202],["004Op","2kr2r1/1bp4n/1pq1p2p/p1P5/1P3B2/P6P/5RP1/RB2Q1K1 w - - 3 26","e1f1 d8d1 f1d1 g8g2 g1f1 g2g1 f1e2 g1d1",2204],["02YZG","4qB1k/pp4pp/4K3/2Q1P3/2P5/3r2PP/P7/R6R w - - 7 32","f8e7 e8d7 e6f7 d3f3",2205],["05Pl3","8/3k1r2/p6P/3p1PQ1/6P1/1r2RK2/6R1/5q2 w - - 5 53","g2f2 f1h3 f3e2 b3e3 g5e3 f7e7",2207],["06aow","2kr2r1/pp3p1p/2p5/5q2/P5p1/4Q3/1PP2P1P/3R1R1K w - - 0 23","e3a7 d8d1 f1d1 f5f3 h1g1 f3d1",2208],["05Sdi","r4r2/p1Pq2kp/1p1N4/3Qp2b/6pP/6P1/PP6/2R3K1 b - - 4 32","h5f7 d5e5 g7g8 d6f5 d7f5 e5f5",2213],["00Ac7","8/2p1pk1p/Pp4p1/8/p1P2P2/3r2P1/3PR2P/3K4 b - - 1 33","a4a3 a6a7 d3d8 e2e3 a3a2 e3a3",2219],["00LRq","1k6/1p1q4/P2p3p/1NpPpn1Q/5b2/2P3r1/1P2B1P1/R6K b - - 3 28","g3g7 a6a7 b8a8 b5c7 d7c7 h5e8 c7b8 a7b8q",2219],["03SXY","1k1rr3/5p1p/p1pq1np1/P1Pp4/3P4/3QPP2/5PRP/R3K3 b Q - 0 23","d6e7 a1b1 b8a7 b1b6",2219],["05HHX","3r2r1/p4q1k/2pp3p/4bbp1/5n2/1P2BP1P/P2Q1NPN/3R1RK1 w - - 0 27","h2g4 e5c3 e3f4 c3d2",2220],["07Oac","8/1r6/p1PBPk2/8/4p3/8/1P5P/7K b - - 0 39","b7b2 d6e5 f6e5 c6c7 b2c2 e6e7 c2c7 e7e8q",2221],["01B5q","r4rk1/1pp1np1p/p4Qp1/3P3P/P2Nq3/8/1B4R1/5B1K b - - 0 36","e7d5 f6g7 g8g7 d4f5 g7g8 f5h6",2228],["06S09","4r1k1/1pq3p1/5p1p/p1bR4/P1P1p3/1PQ5/1B3PPP/6K1 w - - 0 27","c3g3 e4e3 f2e3 e8e3",2228],["06cPX","5bk1/4rp1p/p2p1Qp1/1p1P4/8/2P1q3/PP4PP/1B3R1K w - - 8 30","f6d6 e3f2 b1d3 e7e1",2233],["05hmE","8/8/p7/3b4/1P1k1p1p/P1N2P2/5K2/8 w - - 2 42","c3d5 d4d5 f2g2 d5c4 g2h3 c4b3",2235],["03wPS","5rk1/p4r2/1pB4p/PPp1P1p1/2p3b1/2Q3P1/5q1P/1R1R3K b - - 0 34","f7f3 c3c4 g8g7 c4g4",2236],["01DT3","8/6bp/6p1/Nkp5/1p6/1Pn3P1/P4P1P/B5K1 w - - 1 28","a1c3 b4c3 a5c4 b5b4 c4e3 b4a3",2237],["01HQ8","r4rk1/pp2qppp/2pp4/4p1B1/2BnP3/P2P1b2/1PP2P2/R1Q2RK1 b - - 1 15","e7f6 g5f6 d4e2 g1h2 e2c1 f1g1",2237],["012LI","6k1/p4p1p/4bp2/1p2p3/3r4/KP1nQPN1/P5B1/8 w - - 0 33","g2f1 d4a4 b3a4 b5b4",2238],["06CPT","4r1k1/pp3ppp/2p2n2/3p1QN1/3P1r2/2P3qP/PP6/R4R1K w - - 0 23","f1f4 e8e2 f4f2 g3f2 f5f2 e2f2",2239],["01kVV","2r5/1Qpq1k1p/1p1p2p1/4pn2/3r4/4N2P/P1P2PP1/R4RK1 b - - 11 27","d4d2 e3c4 d2c2 c4b6 c8b8 b7b8",2249],["00fxc","4r2k/1pQ2p2/p4N1p/5P2/1P6/P1Pn1K2/4r3/6R1 w - - 1 36","c7f7 e8e3 f3g4 d3e5 g4h5 e2h2",2250],["00P81","6k1/5p2/4p2p/3pPP2/1R5P/7r/2B5/2b2K2 b - - 0 46","h3c3 b4b8 g8h7 f5e6 c3c2 e6e7",2267],["00ZvN","8/8/8/4kppp/8/4KPPP/8/8 b - - 0 35","f5f4 g3f4 g5f4 e3d3 e5f6 h3h4",2269],["07e02","2q2r2/3kp3/p1ppn1Q1/N1P3b1/1P6/5p1b/PB2P2P/1R1R3K w - - 0 33","e2f3 h3g2 h1g2 e6f4 g2h1 f4g6",2269],["03N7A","r3q2r/1Q4p1/p2kPp1p/3pb3/6P1/N1p5/PP6/3R1RK1 b - - 1 24","e8c6 d1d5 d6d5 f1d1 e5d4 d1d4 d5d4 b7c6",2276],["01nj2","2r2r2/6k1/p3p1bp/4P1b1/1p1P4/2P1N1B1/PP1K2P1/4R2R w - - 0 34","h1f1 b4c3 b2c3 g5e3 e1e3 f8f1",2279],["06i6v","8/6kp/2p3p1/3q4/3P4/P1PK4/1Q6/8 b - - 0 41","d5b5 b2b5 c6b5 c3c4 b5b4 a3b4",2288],["06UEH","2q5/R5pk/6rp/4P3/4N3/3P1Q1n/1PP2Pr1/5R1K w - - 0 38","e4g3 h3f4 e5e6 c8e6 f3g2 f4g2",2296],["024nn","2k5/1bp3pp/1p2p3/2n1b3/2P5/Q4rqP/PP1rB1P1/4RRBK w - - 0 25","e2f3 g3g2 f3g2 b7g2",2300],["02cM5","r1bq2k1/3p1r2/p1p1pbn1/2p2pN1/4PP1Q/2NP4/PPP4P/R1B2RK1 w - - 0 15","g5f7 f6d4 h4f2 d4f2 f1f2 g8f7",2300],["01M2U","1k5r/pp4p1/7r/3p2p1/3P2R1/2P1pP1P/PP2Bb2/K6R w - - 0 38","e2f1 h6h3 f1h3 e3e2 h1b1 h8h3",2303],["04g9x","3r3k/ppr3pp/8/1Q1pN3/P2P1PPq/7P/4R1K1/8 b - - 4 45","c7c3 e5f3 h4f6 e2e8 f6f8 e8f8",2305],["03U2Z","2k5/2p1b3/1p1p3q/pP1Pp3/P1P1Np1r/5Q2/4KPP1/6R1 b - - 0 40","h4h1 g1h1 h6h1 f3h3 h1h3 g2h3",2307],["05Jhz","8/4p3/8/k1K1Pn2/p7/2P5/8/3B4 w - - 0 54","d1a4 a5a4 c5d5 f5g7 c3c4 a4b4",2313],["07AfS","r2qr3/1bp3kp/2n2p2/3Q1P2/1bB5/2N2P2/PP4PP/R3K1NR w KQ - 1 17","g1e2 e8e2 e1e2 c6d4 e2d3 b7d5",2320],["01Tpw","r3r1k1/p4ppp/8/3Q4/3P4/Ppp2N2/K1b2PPP/3R3R w - - 0 24","a2a1 b3b2 a1a2 c2d1 h1d1 c3c2",2321],["02prq","5r2/1bq1k2Q/p3pr2/1p1n1pN1/5Pn1/8/PP4PP/3RRBK1 b - - 2 27","e7d6 e1e6 f6e6 h7c7 d6c7 g5e6 c7d7 e6f8",2331],["01zXC","8/8/4kpp1/8/5PP1/5K2/8/8 w - - 1 52","f3g3 e6d5 f4f5 g6g5 g3f3 d5d4",2334],["02Lda","2k1r3/pp3p1p/2p5/q1b1B3/3nP3/2N3QP/PP3PP1/5K1R w - - 4 20","f1g1 e8e5 g3e5 d4f3 g2f3 c5f2 g1f2 a5e5",2342],["04eZ9","4kR2/1b1pb2p/pQ2N3/4P1rq/3n3P/8/PPP3P1/R6K b - - 6 25","e7f8 b6d8 e8f7 d8f6 f7g8 f6f8",2348],["00Nhl","5r1r/pR5p/k1ppb1n1/4p1Q1/N3P3/1P1P4/P1P3PP/6K1 w - - 1 23","b7h7 g6f4 g5f4 e5f4 h7h8 f8h8",2351],["05n2Y","r7/1p4kp/1N3pp1/p1p5/8/2P5/5PPP/5NK1 b - - 1 29","a5a4 b6a8 a4a3 f1e3 a3a2 e3c2",2353],["00DZe","8/5k2/7p/p1P1bPpP/Pp2P3/1P1pBK2/8/8 w - - 1 47","e3f2 g5g4 f3e3 e5d4 e3d3 d4f2",2357],["041Ts","8/p7/2p2ppk/1q6/2nP2P1/2pR4/PP2Q3/1K6 w - - 1 34","d3h3 h6g5 b1c2 c4a3 b2a3 b5e2",2377],["061cI","8/1p1kpp2/p2p2pp/3P4/P3R3/1rr5/1P3PPP/4R1K1 b - - 1 25","b3b2 e4e7 d7c8 e7e8 c8c7 a4a5 b2b1 e1b1",2380],["05VnQ","8/8/pp1p1k1p/2pP2p1/2P1K1P1/1P5P/P7/8 w - - 0 45","e4e3 f6e5 a2a3 b6b5 e3d3 b5c4",2382],["01jCT","4r1k1/pp3ppp/8/4r3/2R5/2P2Q2/PPq2PPP/R4K2 w - - 3 23","c4c7 e5f5 f3e3 g8f8 c7c8 e8c8",2385],["06LQW","r4Bk1/pp3p2/7p/3N2p1/2BpPbbq/2P5/PPQ2KP1/R3R3 w - - 1 27","f2g1 h4h2 g1f1 h2h1 f1f2 f4g3 f2g3 h1h4",2394]];
const chFen = fen => { const [pos, side, cas, ep, h] = fen.split(' '), b = [];
  for (const c of pos.replace(/\//g, '')) if (/\d/.test(c)) b.push(...'.'.repeat(+c)); else b.push(c);
  return {b, w: side === 'w', c: cas === '-' ? '' : cas, ep: ep === '-' ? -1 : (8 - +ep[1]) * 8 + ep.charCodeAt(0) - 97, h: +h || 0}; };
const chUci = (st, u) => { const q = x => (8 - +u[x + 1]) * 8 + u.charCodeAt(x) - 97, f = q(0), t = q(2); return CH.legal(st).find(m => m.f === f && m.t === t && (m.p || '').toLowerCase() === (u[4] || '')); };
const chPs = () => { const p = gstore('chess', {}).puz ??= {r: 1200, done: {}, ok: 0, ko: 0, streak: 0, best: 0}; return p; };
const chLater = (fn, ms) => chMute ? fn() : setTimeout(fn, ms);
function chPuzPick() {  // un problème pas encore résolu, près de ton classement (un peu au hasard parmi les plus proches)
  const p = chPs(), left = CH_PUZ.map((x, i) => i).filter(i => !p.done[CH_PUZ[i][0]]), pool = (left.length ? left : CH_PUZ.map((x, i) => i)).sort((a, b) => Math.abs(CH_PUZ[a][3] - p.r) - Math.abs(CH_PUZ[b][3] - p.r)).slice(0, 8);
  return pool[Math.floor(Math.random() * pool.length)];
}
function chPuzSet(n) {  // la position du problème après ses n premiers coups
  const pz = ch.puz, s0 = chFen(CH_PUZ[pz.i][1]);
  Object.assign(ch, {s: s0, hist: [CH.key(s0)], moves: [], sel: -1, over: null, anim: null, promo: null, thinking: false});
  for (const u of pz.sol.slice(0, n)) chApply(chUci(ch.s, u), true);
  pz.k = n;
}
function chPuzStart(i = chPuzPick()) {
  chId++; const s0 = chFen(CH_PUZ[i][1]);
  ch = {s: s0, hist: [], moves: [], level: ch?.level ?? +$('chLevel').value, human: s0.w ? 'b' : 'w', sel: -1, over: null, anim: null, promo: null, puz: {i, sol: CH_PUZ[i][2].split(' '), k: 0, fail: false, scored: false}};
  chPuzSet(0); chRender();
  chLater(() => { if (ch.puz?.i === i && ch.puz.k === 0) { ch.puz.k = 1; chApply(chUci(ch.s, ch.puz.sol[0])); } }, 500);
}
function chPuzScore(win) {  // une seule fois par problème : réussi du premier coup, ou raté
  const pz = ch.puz, p = chPs(); if (pz.scored) return; pz.scored = true;
  const e = 1 / (1 + 10 ** ((CH_PUZ[pz.i][3] - p.r) / 400)); p.r = Math.round(p.r + 32 * ((win ? 1 : 0) - e));
  if (win) { p.ok++; p.streak++; p.best = Math.max(p.best, p.streak); } else { p.ko++; p.streak = 0; }
  saveGames(); chTrophies();
}
function chPuzMove(m) {  // ton coup dans un problème : le bon (ou un autre mat au dernier coup), sinon on revient en arrière
  const pz = ch.puz, u = 'abcdefgh'[m.f & 7] + (8 - (m.f >> 3)) + 'abcdefgh'[m.t & 7] + (8 - (m.t >> 3)) + (m.p || '').toLowerCase();
  const last = pz.k === pz.sol.length - 1, good = u === pz.sol[pz.k] || (last && ch.over?.why === 'échec et mat');
  if (!good) { pz.fail = true; chPuzScore(false); toast('Pas ce coup-là : cherche encore', true); beep(140, .18, 'sawtooth', 90, .05);
    const k = pz.k, i = pz.i; chLater(() => { if (ch.puz?.i === i) { chPuzSet(k); chRender(); } }, 700); return; }
  pz.k++;
  if (pz.k >= pz.sol.length) { chPs().done[CH_PUZ[pz.i][0]] = 1; if (!pz.fail) chPuzScore(true); ch.over = {result: ch.human, why: 'problème résolu'}; saveGames(); chLater(() => sfx('launch'), SLIDE); return; }
  const i = pz.i; chLater(() => { if (ch.puz?.i === i && !ch.over) { const r = chUci(ch.s, pz.sol[pz.k]); pz.k++; chApply(r); } }, 450);
}
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
// le PGN : la notation anglaise (K Q R B N) que lisent tous les sites d’échecs ; à l’ouverture on accepte aussi la française
const CH_EN = {R: 'K', D: 'Q', T: 'R', F: 'B', C: 'N'};
const chEn = san => san.replace(/^[RDTFC]/, c => CH_EN[c]).replace(/=([RDTFC])/, (_, c) => '=' + CH_EN[c]);
function chPgn() {
  const res = ch.over ? (ch.over.result === 'd' ? '1/2-1/2' : ch.over.result === 'w' ? '1-0' : '0-1') : '*', d = new Date(), you = 'Toi', ai = 'NeoDex (' + $('chLevel').options[ch.level].text + ')';
  const head = [['Event', 'Partie NeoDex'], ['Date', d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0')], ['White', ch.human === 'w' ? you : ai], ['Black', ch.human === 'w' ? ai : you], ['Result', res]].map(([k, v]) => '[' + k + ' "' + v + '"]').join('\n');
  const body = ch.moves.map((m, i) => (i % 2 ? '' : (i / 2 + 1) + '. ') + chEn(m.san)).join(' ');
  return head + '\n\n' + (body ? body + ' ' : '') + res;
}
function chPgnRead(text) {  // les coups d’un PGN, retrouvés parmi les coups permis ; null si l’un d’eux ne va pas
  let t = String(text).replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ');
  for (let k = 0; k < 20 && /\(/.test(t); k++) t = t.replace(/\([^()]*\)/g, ' ');
  const toks = t.replace(/\$\d+/g, ' ').split(/\s+/).map(x => x.replace(/^\d+\.+/, '').replace(/[+#!?]+$/, '').replace(/^0-0-0$/, 'O-O-O').replace(/^0-0$/, 'O-O')).filter(x => x && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x));
  let st = CH.start(); const out = [];
  for (const tk of toks) { const all = CH.legal(st), m = all.find(x => { const a = chSan(st, x, all).replace(/[+#]$/, ''); return a === tk || chEn(a) === tk; }); if (!m) return null; out.push({f: m.f, t: m.t, p: m.p || ''}); st = CH.make(st, m); }
  return out;
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
// à distance : deux PC, une partie par un code (ctx.room, serveur NeoDex). L'hôte a les blancs à la première partie, puis les couleurs s'échangent
// à chaque revanche ; chaque coup part à l'autre ({t:'coup', a: départ, b: arrivée, p, n}) et n'est joué que s'il est permis et à son tour
const net = {on: false, code: '', host: false, opp: '', oppId: '', next: 'w', pending: null};
const netOn = () => net.on && !!net.opp;
const netSay = t => { $('chNetInfo').textContent = t; };
function chReplay(save) {
  ch = {s: CH.start(), hist: [], moves: [], level: save.level, human: save.human, sel: -1, over: null, anim: null, promo: null, net: !!save.net};
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
  if (ch.puz) { if ((ch.s.w ? 'b' : 'w') === ch.human) chPuzMove(m); chRender(); return; }
  if (ch.net) {  // à distance : mon coup part à l'ami ; rien n'est gardé, les scores à part
    if ((ch.s.w ? 'b' : 'w') === ch.human) ctx.room.send({t: 'coup', a: m.f, b: m.t, p: m.p || '', n: ch.moves.length - 1}).catch(e => toast(e.message, true));
    if (ch.over) { const r = (gstore('chess', {}).net ??= {w: 0, l: 0, d: 0}), k = ch.over.result === 'd' ? 'd' : ch.over.result === ch.human ? 'w' : 'l'; r[k]++; setTimeout(() => sfx(k === 'w' ? 'launch' : k === 'l' ? 'error' : 'notify'), SLIDE); }
    saveGames(); chRender(); chTrophies(); setTimeout(netTry, 0); return;
  }
  const st = gstore('chess', {});
  st.save = ch.over ? null : {level: ch.level, human: ch.human, moves: ch.moves.map(({f, t, p}) => ({f, t, p}))};
  if (ch.over) {
    const r = (st['lvl' + ch.level] ??= {w: 0, l: 0, d: 0});
    const k = ch.over.result === 'd' ? 'd' : ch.over.result === ch.human ? 'w' : 'l'; r[k]++;
    setTimeout(() => sfx(k === 'w' ? 'launch' : k === 'l' ? 'error' : 'notify'), SLIDE);
  }
  saveGames(); chRender(); if (ch.over) chTrophies();
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
  if (net.on) { if (netOn()) netAgain(); return; }
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
  if (o) return o.result === 'd' ? 'Nulle' : o.result === you ? 'Tu as gagné !' : ch.net ? 'Ton ami gagne' : 'L\'ordinateur gagne';
  if (ch.net && !net.opp) return 'En attente de ton ami';
  if (ch.net && !chMyTurn()) return 'Ton ami joue';
  if (ch.puz && !chMyTurn()) return 'Le problème répond';
  if (!chMyTurn()) return 'L\'ordinateur réfléchit';
  if (ch.puz) return CH.inCheck(ch.s) ? 'Échec ! Le meilleur coup ?' : 'Trouve le meilleur coup';
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
  for (const [id, side, who] of [['chTakenMe', you, 'Toi'], ['chTakenAi', you === 'w' ? 'b' : 'w', ch.net ? 'Ton ami' : 'Ordinateur']]) {
    $(id).replaceChildren(el('span', '', who), ...taken(side).map(x => { const i = el('img'); i.src = CH_IMG[x]; i.alt = ''; return i; }));
    const d = side === you ? diff : -diff; if (d > 0) $(id).append(el('b', '', '+' + d));
  }
  const p = chPs(); $('chPuzInfo').textContent = 'Ton classement : ' + p.r + ' · ' + p.ok + (p.ok > 1 ? ' réussis, ' : ' réussi, ') + p.ko + (p.ko > 1 ? ' ratés' : ' raté') + ' · série ' + p.streak + ' (record ' + p.best + '). Problèmes tirés de la base libre de Lichess.';
  $('chPuzHint').disabled = !ch.puz || !!ch.over;
  $('chMode').value = net.on ? 'net' : 'ia'; $('chNet').style.display = net.on ? '' : 'none';
  if (ch.net) { const r = games.chess?.net || {w: 0, l: 0, d: 0}; $('chInfo').textContent = 'À distance · ' + (ch.human === 'w' ? 'tu as les blancs' : 'tu as les noirs') + ' · ' + r.w + ' victoires, ' + r.d + ' nulles, ' + r.l + ' défaites'; $('chUndo').disabled = true; return; }
  if (ch.puz) { const P = CH_PUZ[ch.puz.i]; $('chInfo').textContent = 'Problème ' + P[0] + ' · classé ' + P[3] + ' · ' + (ch.human === 'w' ? 'les blancs' : 'les noirs') + ' jouent'; $('chUndo').disabled = true; return; }
  const st = games.chess?.['lvl' + ch.level] || {w: 0, l: 0, d: 0};
  $('chInfo').textContent = 'Niveau ' + $('chLevel').options[ch.level].text + ' · ' + st.w + ' victoires, ' + st.d + ' nulles, ' + st.l + ' défaites';
  $('chUndo').disabled = ch.moves.length < (ch.human === 'w' ? 1 : 2) || ch.thinking;
}
// la souris : cliquer une pièce puis sa case, ou la faire glisser
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
const chAt = (x, y) => { const C = Math.floor((x - BX) / SQ), R = Math.floor((y - BY) / SQ); if (C < 0 || C > 7 || R < 0 || R > 7) return -1; const k = R * 8 + C; return ch?.human === 'b' ? 63 - k : k; };
cv.onpointerdown = e => {
  if (!ch || ch.over || ch.thinking || ch.anim || !chMyTurn() || ch.net && !netOn()) return;
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
$('chPuz').onclick = () => { $('chPuz').blur(); if (net.on) { netLeave(); net.on = false; } chPuzStart(); };
const netLeave = () => { if (net.code) try { ctx.room.leave().catch(() => {}); } catch {} Object.assign(net, {code: '', host: false, opp: '', oppId: '', next: 'w', pending: null}); };
function netTry() { const m = net.pending; if (!m || !ch?.net || ch.over || ch.anim || chMyTurn()) return; net.pending = null; if (m.n !== ch.moves.length) return; const mv = CH.legal(ch.s).find(x => x.f === m.a && x.t === m.b && (x.p || '') === (m.p || '')); if (mv) chApply(mv); }
function netStart(me) { chId++; net.pending = null; chReplay({level: ch?.level ?? 0, human: me, moves: [], net: true}); chRender(); netSay('Contre ' + net.opp + ' · ' + (me === 'w' ? 'tu as les blancs, tu commences' : 'tu as les noirs') + ' · code ' + net.code); }
function netWait() { chId++; chReplay({level: ch?.level ?? 0, human: 'w', moves: [], net: true}); chRender(); }
function netAgain() { if (!netOn()) return; if (net.host) { const me = net.next; net.next = me === 'w' ? 'b' : 'w'; ctx.room.send({t: 'start', you: me === 'w' ? 'b' : 'w'}).catch(() => {}); netStart(me); } else ctx.room.send({t: 'rejouer'}).catch(() => {}); }
setInterval(() => { if (net.pending) netTry(); }, 200);  // le coup de l'ami arrivé pendant que ma pièce glissait encore
ctx.room?.on(ev => {
  if (!net.on || !net.code) return;
  if (ev.t === 'arrive') {
    if (!net.host) return;
    if (net.opp) return void ctx.room.send({t: 'pleine'}, ev.id).catch(() => {});
    net.opp = ev.name || 'ton ami'; net.oppId = ev.id; sfx?.('notify'); netAgain();
  } else if (ev.t === 'part' && ev.id === net.oppId || ev.t === 'fin') {
    netSay(ev.t === 'fin' ? 'Connexion perdue avec le serveur de parties.' : 'Ton ami a quitté la partie.' + (net.host ? ' Le code reste valable : il peut revenir.' : ''));
    net.opp = ''; net.oppId = ''; if (ev.t === 'fin') net.code = ''; netWait();
  } else if (ev.t === 'msg' && ev.from === net.oppId) {
    const m = ev.data || {};
    if (m.t === 'start' && !net.host) netStart(m.you === 'b' ? 'b' : 'w');
    else if (m.t === 'rejouer' && net.host && ch.over) netAgain();
    else if (m.t === 'pleine') { netSay('Cette partie a déjà deux joueurs.'); netLeave(); }
    else if (m.t === 'coup' && Number.isInteger(m.a) && Number.isInteger(m.b) && Number.isInteger(m.n)) { net.pending = m; netTry(); }
  }
});
$('chMode').onchange = () => { $('chMode').blur(); netLeave(); net.on = $('chMode').value === 'net';
  if (net.on) { netWait(); netSay('Crée une partie et donne son code à ton ami, ou tape le sien.'); } else { ch = null; chOpen(); } };
$('chHost').onclick = async () => { $('chHost').blur();
  try { netLeave(); const r = await ctx.room.create('hôte'); Object.assign(net, {code: r.code, host: true}); netWait(); netSay('Code de la partie : ' + r.code + ' · donne-le à ton ami. En attente…'); }
  catch (e) { netSay('Impossible de créer la partie : ' + e.message); } };
$('chJoin').onclick = async () => { $('chJoin').blur();
  try { netLeave(); const r = await ctx.room.join($('chCode').value, 'invité'), host = r.joueurs.find(j => j.host);
    if (!host || r.joueurs.length > 1) { await ctx.room.leave(); return netSay(host ? 'Cette partie a déjà deux joueurs.' : 'Aucune partie avec ce code.'); }
    Object.assign(net, {code: r.code, host: false, opp: host.name || 'ton ami', oppId: host.id}); netSay('Connecté · la partie commence…'); }
  catch (e) { netSay('Impossible de rejoindre : ' + e.message); } };
$('chCode').onkeydown = e => { if (e.key === 'Enter') $('chJoin').click(); };
$('chPuzHint').onclick = () => { $('chPuzHint').blur(); const pz = ch.puz; if (!pz || ch.over || !chMyTurn()) return; pz.fail = true; chPuzScore(false); ch.sel = chUci(ch.s, pz.sol[pz.k]).f; chToc(); };  // l’indice montre la pièce à jouer, mais le problème compte comme raté
$('chPgnOut').onclick = () => { $('chPgnOut').blur(); const p = chPgn(); $('chPgn').value = p; try { navigator.clipboard?.writeText(p).catch(() => {}); } catch {} toast('Partie copiée (PGN)'); };
$('chPgnIn').onclick = () => { $('chPgnIn').blur(); if (net.on) { netLeave(); net.on = false; } const mv = chPgnRead($('chPgn').value); if (!mv || !mv.length) { toast('Ce PGN n’est pas lisible', true); return; }
  chId++; chReplay({level: ch.level, human: ch.human, moves: mv}); gstore('chess', {}).save = ch.over ? null : {level: ch.level, human: ch.human, moves: mv}; saveGames(); chRender();
  if (!ch.over && (ch.s.w ? 'w' : 'b') !== ch.human) chThink(); };
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
    const pg = chPgn(); if (!/1\. e4 e5 2\. Bc4 Nc6 3\. Qh5 Nf6 4\. Qxf7# 1-0$/.test(pg)) bad.push('PGN : ' + pg.split('\n').pop());
    const back = chPgnRead(pg); if (!back || back.map(m => m.f + '-' + m.t).join() !== SCHOLAR.map(m => m.f + '-' + m.t).join()) bad.push('PGN relu');
    if (chPgnRead('1. e4 {bien} e5 (1... c5 2. Cf3) 2. Fc4 Cc6 3. Dh5 Cf6?? 4. Dxf7# 1-0')?.length !== 7 || chPgnRead('1. e4 e5 2. Ke3') !== null || chPgnRead('1. 0-0') !== null) bad.push('PGN français');
    if (CH.key(chFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')) !== CH.key(CH.make(CH.start(), CH.legal(CH.start()).find(m => m.f === 52 && m.t === 36)))) bad.push('FEN');
    CH_PUZ.forEach(([id, fen, mv]) => { let st = chFen(fen); for (const u of mv.split(' ')) { const m = chUci(st, u); if (!m) { bad.push('problème ' + id); return; } st = CH.make(st, m); } });
    if (CH_PUZ.length < 300 || new Set(CH_PUZ.map(x => x[0])).size !== CH_PUZ.length) bad.push('liste des problèmes');
    const kp = JSON.stringify(games.chess?.puz ?? null), ks = JSON.stringify(games.chess?.save ?? null);
    const pi = CH_PUZ.findIndex(x => x[2].split(' ').length >= 4); chPuzStart(pi); const pz = ch.puz;
    if (pz.k !== 1 || (ch.s.w ? 'w' : 'b') !== ch.human) bad.push('problème : premier coup');
    const wrong = CH.legal(ch.s).find(m => 'abcdefgh'[m.f & 7] + (8 - (m.f >> 3)) + 'abcdefgh'[m.t & 7] + (8 - (m.t >> 3)) !== pz.sol[1].slice(0, 4));
    chApply(wrong); if (pz.k !== 1 || ch.moves.length !== 1 || !pz.fail) bad.push('problème : faux coup');
    while (!ch.over && pz.k < pz.sol.length) chApply(chUci(ch.s, pz.sol[pz.k]));
    if (ch.over?.why !== 'problème résolu' && ch.over?.why !== 'échec et mat') bad.push('problème : fin ' + pz.k + '/' + pz.sol.length);
    if (JSON.stringify(games.chess?.save ?? null) !== ks) bad.push('problème : partie gardée touchée');
    if (games.chess) { if (kp === 'null') delete games.chess.puz; else games.chess.puz = JSON.parse(kp); }
    chDraw();
  } catch (e) { bad.push('erreur ' + e.message); }
  ch = keep; chMute = false;
  return bad.length ? bad.join(', ') : 'ok';
}
{ const c = chCheck(); console.assert(c === 'ok', 'échecs', c); }
cv.__ch = {st: () => ch, check: chCheck, net: () => net, pgn: () => chPgn(), puz: i => chPuzStart(i), uci: u => chUci(ch.s, u), P: CH_PUZ, legal: () => CH.legal(ch.s), xy: chXY, SQ, W, H, PROMO, SCHOLAR,
  replay: moves => { chId++; chReplay({level: ch.level, human: ch.human, moves}); chRender(); },
  setPos: b => { chId++; ch.s = {b, w: true, c: '', ep: -1, h: 0}; ch.hist = [CH.key(ch.s)]; ch.moves = []; ch.sel = -1; ch.over = null; ch.thinking = false; ch.anim = null; ch.promo = null; chRender(); }};
const loop = () => { if (!view.classList.contains('on')) { loop.raf = 0; return; } loop.raf = requestAnimationFrame(loop); chDraw(); };
  // les trophées, tirés des statistiques et des records gardés (aussi à l'ouverture : ce qui a été fait avant compte)
  function chTrophies() {
    const st = games.chess || {}, p = st.puz || {}, w = i => st['lvl' + i]?.w > 0, any = k => Object.keys(st).some(x => (x.startsWith('lvl') || x === 'net') && st[x]?.[k] > 0);
    trophyRecord('classement', p.ok ? p.r : null); trophyRecord('serie', p.best || null); trophyRecord('resolus', p.ok || null);
    if (w(0) || w(1)) trophy('debutant'); if (w(2)) trophy('moyen'); if (w(3)) trophy('difficile'); if (w(4)) trophy('expert'); if (w(5)) trophy('maitre'); if (w(6)) trophy('grand-maitre');
    if (p.ok >= 1) trophy('probleme'); if (p.ok >= 25) trophy('problemes25'); if (p.ok >= 100) trophy('problemes100'); if (p.best >= 10) trophy('serie10');
    if (p.r >= 1500) trophy('classe1500'); if (p.r >= 1800) trophy('classe1800'); if (st.net?.w) trophy('net'); if (any('d')) trophy('nul');
  }
  ctx.onOpen(() => { chOpen(); if (!loop.raf) loop.raf = requestAnimationFrame(loop); chTrophies(); });
}
