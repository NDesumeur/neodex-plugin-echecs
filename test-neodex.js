// lancé par le test « local » de NeoDex : la vérification interne (règles, coup du berger, pièces), un coup au clic, un coup glissé,
// la réponse de l'ordinateur, la promotion choisie sur l'échiquier, le mat, annuler et la place prise (avec NEO_SHOTS : des images du jeu)
module.exports = async ({ pj, js, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('chCv').__ch, ch = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('chCv').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'echecs-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  // un évènement du pointeur au milieu d'une case (ou en x, y du canevas)
  const ev = (type, at) => pj(`(() => { const T = document.getElementById('chCv').__ch, c = document.getElementById('chCv'), r = c.getBoundingClientRect(), p = ${JSON.stringify(at)};
    const [x, y] = typeof p === 'number' ? T.xy(p).map(v => v + T.SQ / 2) : p;
    c.dispatchEvent(new PointerEvent('${type}', {bubbles: true, pointerId: 1, clientX: r.left + x / T.W * r.width, clientY: r.top + y / T.H * r.height})); return 0; })()`);
  const tap = async i => { await ev('pointerdown', i); await ev('pointerup', i); await sleep(60); };
  const pick = (id, v) => pj(`(() => { const s = document.getElementById('${id}'); s.value = '${v}'; s.dispatchEvent(new Event('change')); return 0; })()`);
  const idle = async () => { for (let i = 0; i < 50 && await C('return ch.thinking || !!ch.anim;'); i++) await sleep(150); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  const keep = await C('return ch.level + "|" + document.getElementById("chColor").value;');
  await pick('chLevel', '0'); await pick('chColor', 'w'); await sleep(150); await shot('0-depart');
  // e2-e4 au clic : la pièce puis la case
  await tap(52); if (await C('return ch.sel;') !== 52) throw new Error('le clic ne choisit pas le pion');
  await shot('1-choix'); await tap(36); await sleep(60); await shot('2-glisse');
  await idle(); if (await C('return ch.moves.length + "|" + ch.moves[0].san;') !== '2|e4') throw new Error('e4 puis la réponse : ' + await C('return ch.moves.map(m => m.san).join(" ");'));
  // Cg1-f3 en glissant la pièce
  await ev('pointerdown', 62); await ev('pointermove', 54); await ev('pointermove', 45); await sleep(50); await shot('3-tenu'); await ev('pointerup', 45); await sleep(60);
  await idle(); if (await C('return ch.moves[2]?.san;') !== 'Cf3') throw new Error('le cavalier glissé : ' + await C('return ch.moves.map(m => m.san).join(" ");'));
  // la promotion : un pion blanc en a7, on choisit la tour
  await C(`const b = Array(64).fill('.'); b[8] = 'P'; b[60] = 'K'; b[23] = 'k'; T.setPos(b); return 0;`);
  await tap(8); await tap(0); await sleep(60);
  if (await C('return ch.promo ? ch.promo.length : 0;') !== 4) throw new Error('le choix de la promotion devait s\'ouvrir');
  await shot('4-promotion');
  await C('return 0;'); const P = await C('return T.PROMO;');
  await ev('pointerdown', [P.x + P.w * 1.5, P.y + P.w / 2]); await sleep(60);
  if (await C('return ch.s.b[0];') !== 'R') throw new Error('la tour devait être choisie : ' + await C('return ch.s.b[0];'));
  await idle();
  // le mat du berger, rejoué
  await C('T.replay(T.SCHOLAR); return 0;'); await sleep(200);
  if (await C('return ch.over && ch.over.why;') !== 'échec et mat') throw new Error('le coup du berger devait mater'); await shot('5-mat');
  // annuler, puis une nouvelle partie
  await pj(`document.getElementById('chNew').click(), 0`); await sleep(100); await tap(51); await tap(35); await idle();
  await pj(`document.getElementById('chUndo').click(), 0`); await sleep(100);
  if (await C('return ch.moves.length;') !== 0) throw new Error('annuler devait revenir au début');
  const [lv, col] = keep.split('|'); await pick('chLevel', lv); await pick('chColor', col);
  // le PGN : la partie copiée en notation anglaise, puis un PGN en notation française rouvert (l'ordinateur reprend la main)
  await pj(`(() => { const T = document.getElementById('chCv').__ch; T.replay(T.SCHOLAR); return 0; })()`); await sleep(200);
  await pj(`document.getElementById('chPgnOut').click(), 0`); const pg = await pj(`document.getElementById('chPgn').value`);
  if (!pg.endsWith('4. Qxf7# 1-0') || !pg.startsWith('[Event ')) throw new Error('PGN copié : ' + pg);
  await pj(`(() => { document.getElementById('chPgn').value = '[Event "x"] 1. e4 e5 2. Cf3'; document.getElementById('chPgnIn').click(); return 0; })()`); await sleep(1500);
  const pr = await pj(`(() => { const c = document.getElementById('chCv').__ch.st(); return c.moves.map(m => m.san).join(' '); })()`);
  if (!pr.startsWith('e4 e5 Cf3') || pr.split(' ').length !== 4) throw new Error('PGN rouvert : ' + pr);
  // un problème Lichess : l'adversaire joue son coup, un faux coup est refusé, puis la solution jouée au clic jusqu'au bout
  await C('T.puz(T.P.findIndex(x => x[2].split(" ").length >= 4)); return 0;'); await sleep(1200);
  const pz0 = await C('return ch.puz.k + "|" + ch.moves.length;'); if (pz0 !== '1|1') throw new Error('problème : le premier coup de l’adversaire ' + pz0);
  await shot('6-probleme');
  const sq = u => (8 - +u[1]) * 8 + u.charCodeAt(0) - 97;
  for (let n = 0; n < 6 && !(await C('return !!ch.over;')); n++) {
    const u = await C('return ch.puz.sol[ch.puz.k];'); await tap(sq(u.slice(0, 2))); await tap(sq(u.slice(2, 4)));
    if (await C('return !!ch.promo;')) await C('T.st().promo = null; return 0;');
    await sleep(900);
  }
  const pz1 = await C('return (ch.over && ch.over.why) + "|" + ch.puz.fail;'); if (!/^(problème résolu|échec et mat)\|false$/.test(pz1)) throw new Error('problème : ' + pz1);
  await shot('7-resolu');
  if (!/1 réussi,/.test(await pj(`document.getElementById('chPuzInfo').textContent`))) throw new Error('problème : compte des réussis ' + await pj(`document.getElementById('chPuzInfo').textContent`));
  await pj(`document.getElementById('chNew').click(), 0`); await sleep(300);
  // à distance : un faux serveur de parties dans la page de NeoDex ; l'hôte a les blancs, e4 part, e5 de l'ami est joué à son tour
  await js(`(() => { window.__RealWS ??= WebSocket; window.WebSocket = class { constructor(u) { this.url = u; this.sent = []; this.readyState = 1; window.__fakeWs = this;
    setTimeout(() => this.onmessage?.({data: JSON.stringify({t: 'bienvenue', id: 'moi', host: true, joueurs: []})}), 50); }
    send(d) { this.sent.push(d); } close() { this.readyState = 3; } }; return 0; })()`);
  const sent = () => js(`__fakeWs.sent.map(s => JSON.parse(s).data)`), from = d => js(`__fakeWs.onmessage({data: JSON.stringify({t: 'msg', from: 'ami', data: ${JSON.stringify(d)}})}), 0`);
  await pick('chMode', 'net'); await pj(`document.getElementById('chHost').click(), 0`); await sleep(600);
  if (!/^[A-Z0-9]{6}$/.test(await C('return T.net().code;'))) throw new Error('création de partie : ' + await pj(`document.getElementById('chNetInfo').textContent`));
  await tap(52); await tap(36); await sleep(200); if (await C('return ch.moves.length;') !== 0) throw new Error('un coup joué avant l’arrivée de l’ami');
  await js(`__fakeWs.onmessage({data: JSON.stringify({t: 'arrive', id: 'ami', name: 'invité'})}), 0`); await sleep(600);
  if (!(await sent()).some(m => m?.t === 'start' && m.you === 'b')) throw new Error('annonce du début : ' + JSON.stringify(await sent()));
  await tap(52); await tap(36); await sleep(500);
  const nmv = (await sent()).filter(m => m?.t === 'coup'); if (nmv.length !== 1 || nmv[0].a !== 52 || nmv[0].b !== 36 || nmv[0].n !== 0) throw new Error('mon coup envoyé : ' + JSON.stringify(nmv));
  await from({t: 'coup', a: 12, b: 20, n: 5}); await sleep(200); if (await C('return ch.moves.length;') !== 1) throw new Error('un coup de l’ami hors de son tour accepté');
  await from({t: 'coup', a: 12, b: 28, p: '', n: 1}); await sleep(600);
  if (await C('return ch.moves.map(m => m.san).join(" ");') !== 'e4 e5') throw new Error("coup de l'ami : " + await C('return ch.moves.map(m => m.san).join(" ");'));
  await shot('8-a-distance');
  await js(`__fakeWs.onmessage({data: JSON.stringify({t: 'part', id: 'ami'})}), 0`); await sleep(200);
  if (!/a quitté/.test(await pj(`document.getElementById('chNetInfo').textContent`))) throw new Error("départ de l'ami");
  await pick('chMode', 'ia'); await js(`window.WebSocket = window.__RealWS, 0`); await sleep(300);
  if (await C('return !!ch.net + "|" + T.net().on;') !== 'false|false') throw new Error('retour contre l’ordinateur');
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  const L = await pj(`(() => { const r = document.getElementById('chCv').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('chCv').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 320) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'vérification ok · coup au clic · coup glissé · réponse · promotion · mat · annuler · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
