/* Recherche T12 (Glorifié) : onglets de troupe → sous-onglets Déblocage / Arbre.
   Tout ce fichier ne concerne que la page #t12. */
(()=>{
const T12=window.COMPANION_DATA.t12;
const TROOPS=Object.keys(T12.units);
const ICON=(troop,id)=>`assets/visuals/t12/icons/${troop}-${id}.png?v=20261015n`;

/* ---------- Structure des deux vues (repère 1000 × hauteur) ---------- */
const COLS=[114,371,628,884];
const TREE={h:2480,nodes:[
  {id:'unit',x:500,y:139,size:190,label:true,display:true},
  ...['a','b','c','d'].map((k,i)=>({id:'m1'+k,x:COLS[i],y:439,size:150,max:20,group:'m1',line:i})),
  {id:'elite',x:500,y:751,size:180,max:3,label:true},
  {id:'heal',x:371,y:1059,size:150,max:10},
  {id:'aid',x:628,y:1059,size:150,max:10},
  {id:'train',x:500,y:1384,size:150,max:10},
  ...['a','b','c','d'].map((k,i)=>({id:'m2'+k,x:COLS[i],y:1681,size:150,max:50,group:'m2',line:i})),
  {id:'dom',x:500,y:1975,size:160,max:15,label:true},
  ...['a','b','c','d'].map((k,i)=>({id:'m3'+k,x:COLS[i],y:2311,size:150,max:50,group:'m3',line:i}))
],links:[
  ...COLS.map((x,i)=>({d:`M500 139 V285 H${x} V439`,to:'m1'+'abcd'[i]})),
  ...COLS.map(x=>({d:`M${x} 439 V599 H500 V751`,to:'elite'})),
  {d:'M500 751 V907 H371 V1059',to:'heal'},{d:'M500 751 V907 H628 V1059',to:'aid'},
  {d:'M371 1059 V1216 H500 V1384',to:'train'},{d:'M628 1059 V1216 H500 V1384',to:'train'},
  ...COLS.map((x,i)=>({d:`M500 1384 V1530 H${x} V1681`,to:'m2'+'abcd'[i]})),
  ...COLS.map(x=>({d:`M${x} 1681 V1840 H500 V1975`,to:'dom'})),
  ...COLS.map((x,i)=>({d:`M500 1975 V2149 H${x} V2311`,to:'m3'+'abcd'[i]}))
]};
const UNLOCK={h:1400,nodes:[
  ...[0,1,2,3,4].map(i=>({id:'p'+(i+1),x:300,y:120+i*215,size:180,max:5,label:true,piece:i})),
  {id:'unit',x:300,y:1260,size:200,label:true,display:true}
],links:[
  ...[0,1,2,3].map(i=>({d:`M300 ${120+i*215} V${335+i*215}`,to:'p'+(i+2)})),
  {d:'M300 980 V1260',to:'unit'}
]};

/* ---------- Noms ---------- */
function nodeName(id,troop){
  if(id==='unit')return T12.units[troop];
  if(/^p\d$/.test(id))return T12.unlock[troop][+id[1]-1];
  if(/^m[123]/.test(id))return `${T12.molten[troop]['abcd'.indexOf(id[2])]} ${['I','II','III'][+id[1]-1]}`;
  if(id==='elite')return T12.elite[troop];
  if(id==='dom')return T12.dom;
  return T12.support[id][troop];
}
const iconId=id=>/^m[123]/.test(id)?'m1'+id[2]:id;

/* ---------- Prérequis : niveau visé → { recherche: niveau actuel minimum } ---------- */
const lines=g=>['a','b','c','d'].map(k=>g+k);
const all=(ids,min)=>Object.fromEntries(ids.map(id=>[id,min]));
function requirements(id){
  if(/^p[2-5]$/.test(id))return{1:{['p'+(+id[1]-1)]:5}};
  if(/^m1/.test(id))return{1:{unit:1}};
  if(id==='elite')return{1:all(lines('m1'),5),2:all(lines('m1'),10),3:all(lines('m1'),15)};
  if(id==='heal'||id==='aid')return{1:{elite:1}};
  if(id==='train')return{1:{heal:1,aid:1}};
  if(/^m2/.test(id))return{1:{elite:1},15:{elite:2},30:{elite:3}};
  if(id==='dom')return{1:all(lines('m2'),30),6:all(lines('m2'),40),11:all(lines('m2'),50)};
  if(/^m3/.test(id))return{1:{dom:15}};
  return{};
}
function requirementsUpTo(id,target){
  const needs={};
  Object.entries(requirements(id)).forEach(([level,reqs])=>{
    if(+level>Math.max(1,target))return;
    Object.entries(reqs).forEach(([other,min])=>needs[other]=Math.max(needs[other]||0,min));
  });
  return needs;
}

/* ---------- État ---------- */
const empty=()=>{const out={};[...UNLOCK.nodes,...TREE.nodes].forEach(n=>{if(!n.display)out[n.id]={from:0,to:0}});return out};
const state={troop:'infantry',view:'unlock',levels:Object.fromEntries(TROOPS.map(t=>[t,empty()])),piece:Object.fromEntries(TROOPS.map(t=>[t,'p1'])),editing:null,draft:null};
const unitUnlocked=levels=>levels.p5.from>=5;
const current=(levels,id)=>id==='unit'?(unitUnlocked(levels)?1:0):levels[id].from;
const isUnlocked=(id,levels)=>Object.entries(requirements(id)[1]||{}).every(([other,min])=>current(levels,other)>=min);
const maxOf=id=>[...UNLOCK.nodes,...TREE.nodes].find(n=>n.id===id).max;
const badge=(value,max)=>value>=max?'MAX':`${value}/${max}`;

const nodeArt=(node,troop)=>`<img class="t12-ico" src="${ICON(troop,iconId(node.id))}" alt="" draggable="false">`;

/* ---------- Rendu ---------- */
let usingKeyboard=false;
addEventListener('keydown',()=>{usingKeyboard=true},true);
addEventListener('pointerdown',()=>{usingKeyboard=false},true);
function renderTree(){
  /* le contenu est redessiné à chaque clic : on garde la position de défilement (sinon saut de page sur mobile) */
  /* focus rendu seulement au clavier : au toucher (iPhone), le focus reste sur un ancien médaillon et le lui rendre faisait sauter la page */
  const keepY=scrollY,keepFocus=usingKeyboard&&document.activeElement?.closest?.('#t12Tree')?focusKey(document.activeElement):null;
  if(!usingKeyboard&&document.activeElement?.closest?.('#t12Tree'))document.activeElement.blur();
  drawTree();
  if(scrollY!==keepY)scrollTo({top:keepY,behavior:'instant'});
  requestAnimationFrame(()=>{if(scrollY!==keepY)scrollTo({top:keepY,behavior:'instant'})});  /* certains navigateurs mobiles recalent après coup */
  if(keepFocus)document.querySelector(keepFocus)?.focus({preventScroll:true});
}
/* clé pour retrouver le bouton qui avait le focus après le redessin */
function focusKey(el){
  const box=el.closest('[data-t12-forge-field]'),piece=el.closest('[data-t12-piece]'),node=el.closest('[data-t12-node]');
  if(box&&el.dataset.d)return `[data-t12-forge-field="${box.dataset.t12ForgeField}"] [data-d="${el.dataset.d}"]`;
  if(el.dataset.t12All)return `[data-t12-all="${el.dataset.t12All}"]`;
  if(piece)return `[data-t12-piece="${piece.dataset.t12Piece}"]`;
  if(node)return `[data-t12-node="${node.dataset.t12Node}"]`;
  return null;
}
function drawTree(){
  /* interrupteur et coût total peuvent être dans la forge : on les remet à leur place avant de redessiner */
  T12_BOARD.after(T12_ACTIONS);T12_ACTIONS.after(T12_RESULT);
  T12_ACTIONS.hidden=state.view==='unlock';  /* en Déblocage, « Tout au max » est dans les encadrés Actuel / Objectif */
  if(state.view==='unlock')return renderForge();
  const layout=TREE,levels=state.levels[state.troop],troop=state.troop;
  const host=document.getElementById('t12Tree');
  host.style.aspectRatio=`1000/${layout.h}`;
  host.dataset.troop=troop;host.dataset.view=state.view;
  const lit=link=>link.to==='unit'?unitUnlocked(levels):isUnlocked(link.to,levels);
  const paths=list=>list.map(link=>`<path d="${link.d}"/>`).join('');
  const on=layout.links.filter(lit);
  const svg=`<svg class="t12-links" viewBox="0 0 1000 ${layout.h}" preserveAspectRatio="none" aria-hidden="true">
    <g class="t12-link-off">${paths(layout.links)}</g><g class="t12-link-glow">${paths(on)}</g><g class="t12-link-core">${paths(on)}</g><g class="t12-link-light">${paths(on)}</g></svg>`;
  const nodes=layout.nodes.map(node=>{
    const name=nodeName(node.id,troop),pos=`left:${node.x/10}%;top:${node.y/layout.h*100}%;width:${node.size/10}%`;
    const label=node.label?`<span class="t12-label" style="left:${node.x/10}%;top:${(node.y+node.size/2+16)/layout.h*100}%">${name}</span>`:'';
    if(node.display){
      const ok=unitUnlocked(levels);
      return `<div class="t12-node t12-big t12-unit${ok?' unlocked':' locked'}" style="${pos}" data-tip="${name} : ${ok?'débloquée':'pas encore débloquée'}">${nodeArt(node,troop)}<span class="t12-badge">${ok?'✓':'🔒'}</span></div>${label}`;
    }
    const lvl=levels[node.id],planned=lvl.to>lvl.from,locked=!lvl.from&&!isUnlocked(node.id,levels);
    return `<button type="button" class="t12-node${node.id==='elite'?' t12-big':''}${planned?' planned':''}${locked?' locked':''}" style="${pos}" data-t12-node="${node.id}" aria-label="${name} : niveau ${lvl.from} sur ${node.max}${planned?`, objectif ${lvl.to}`:''}${locked?', verrouillée':''}">
      ${nodeArt(node,troop)}<span class="t12-badge">${badge(lvl.from,node.max)}</span>${planned?`<span class="t12-target">→${lvl.to>=node.max?'MAX':lvl.to}</span>`:''}</button>${label}`;
  }).join('');
  host.classList.remove('t12-forge-host');
  host.innerHTML=svg+nodes;
  host.querySelectorAll('[data-t12-node]').forEach(button=>button.onclick=()=>openPicker(button.dataset.t12Node));
}

/* ---------- Déblocage : écran de forge du jeu (rendu 3D, rangée des 5 pièces, détails de la pièce choisie) ---------- */
const RENDER=(troop,id)=>`assets/visuals/t12/pieces/${troop}-${id}.png?v=20261014d`;
const TROOP_NOUN={infantry:'Infanterie',lancer:'Lancier',marksman:'Tireur'};
const pieceIndex=id=>+id[1]-1;
const pieceLocked=(levels,id)=>id!=='p1'&&!levels[id].from&&levels['p'+pieceIndex(id)].from<5;
/* Jauge des 5 niveaux : arc de cercle de 5 cases jointives au-dessus du médaillon (repère centré, médaillon de rayon 50). */
const arcPoint=(r,deg)=>{const a=(deg-90)*Math.PI/180;return`${(r*Math.cos(a)).toFixed(2)} ${(r*Math.sin(a)).toFixed(2)}`};
const sector=(r1,r2,a0,a1)=>`M${arcPoint(r2,a0)}A${r2} ${r2} 0 0 1 ${arcPoint(r2,a1)}L${arcPoint(r1,a1)}A${r1} ${r1} 0 0 0 ${arcPoint(r1,a0)}Z`;
/* comme dans le jeu : le cadre part du bord du médaillon (rayon 50), les cases forment la bande haute */
const GAUGE_SPAN=100,GAUGE_FRAME=sector(48,80,-GAUGE_SPAN/2,GAUGE_SPAN/2);
const GAUGE_CELLS=[0,1,2,3,4].map(k=>{const step=(GAUGE_SPAN-7)/5,a0=-GAUGE_SPAN/2+3.5+k*step;return sector(59,77,a0+1.4,a0+step-1.4)});
/* Coudes d'arrivée (gauche) et de sortie (droite) du tuyau : traits superposés pour le volume, trou dans le panneau. */
const PIPE_LAYERS={lit:['#8e3410',44,'#e2682a',36,'#ffae48',22,'#ffe08e',8],off:['#0e1528',44,'#1f2c4a',36,'#2e4068',20,'#45598a',7]};
function elbow(side,lit){
  const d=side==='inlet'?'M60 22H44A22 22 0 0 0 22 44V84':'M0 22H16A22 22 0 0 1 38 44V84',x=side==='inlet'?22:38,L=PIPE_LAYERS[lit?'lit':'off'];
  const strokes=[0,2,4,6].map(i=>`<path d="${d}" stroke="${L[i]}" stroke-width="${L[i+1]}"/>`).join('');
  return `<span class="t12-forge-elbow t12-forge-${side}${lit?' lit':''}" aria-hidden="true"><svg viewBox="0 0 60 100"><ellipse class="t12-socket" cx="${x}" cy="88" rx="30" ry="11"/><g fill="none">${strokes}</g></svg></span>`;
}
const num=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
/* Éclairs autour du personnage débloqué (comme dans le jeu) : zigzags anguleux rouge-orange à cœur jaune, avec une branche.
   Ils partent du bord de la silhouette de CHAQUE personnage (points calculés par tools/t12-unit-bolt-spots.py)
   et filent vers l'extérieur ; tracés une fois (aléatoire figé), ils crépitent chacun à son rythme. */
const BOLT_SPOTS={"infantry": {"ratio": 0.9893, "spots": [[0.121, 0.42, -90], [0.143, 0.325, -75], [0.17, 0.216, -58], [0.227, 0.098, -40], [0.397, 0.109, -18], [0.536, 0.004, 5], [0.661, 0.077, 25], [0.727, 0.193, 45], [0.736, 0.284, 60]]}, "lancer": {"ratio": 0.5804, "spots": [[0.132, 0.58, -125], [0.095, 0.441, -95], [0.04, 0.268, -62], [0.111, 0.0, -30], [0.529, 0.286, 0], [0.649, 0.296, 30], [0.735, 0.355, 62], [0.963, 0.441, 95], [0.938, 0.586, 125]]}, "marksman": {"ratio": 0.6214, "spots": [[0.164, 0.509, -125], [0.02, 0.438, -95], [0.014, 0.302, -62], [0.138, 0.17, -30], [0.368, 0.011, 0], [0.578, 0.193, 30], [0.678, 0.316, 62], [0.917, 0.448, 95], [0.945, 0.67, 125]]}};
const BOLT_SCALE={infantry:.84,lancer:1.2,marksman:1};
const BOLTS=Object.fromEntries(Object.entries(BOLT_SPOTS).map(([troop,{ratio,spots}],t)=>{
  let seed=11+t*7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  /* même longueur d'éclair à l'écran pour les 3 : on compense l'échelle d'affichage de chaque personnage (--unit-scale du CSS) */
  const W=1000,H=Math.round(W/ratio),len=H*.26/(BOLT_SCALE[troop]||1);
  const zigzag=(x,y,dir,len,steps)=>{
    /* segments de longueurs inégales, cassures franches à gauche ou à droite (jamais de retour en arrière) */
    const pts=[[x,y]];
    for(let i=0;i<steps;i++){
      const ang=dir+(rnd()-.5)*110,l=len/steps*(.45+rnd()*1.1),a=(ang-90)*Math.PI/180;
      x+=Math.cos(a)*l;y+=Math.sin(a)*l;pts.push([x,y]);
    }
    return pts;
  };
  const d=pts=>'M'+pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L');
  const paths=spots.map(([fx,fy,dir],k)=>{
    const main=zigzag(fx*W,fy*H,dir,len*(.8+rnd()*.4),7+Math.floor(rnd()*4)),fork=main[3],branch=zigzag(fork[0],fork[1],dir+(rnd()<.5?-55:55),len*.4,4);
    const path=d(main)+d(branch);
    return `<g style="animation-delay:${(k*.41%2.4).toFixed(2)}s;animation-duration:${(1.7+rnd()*1.3).toFixed(2)}s"><path class="b-glow" d="${path}"/><path class="b-mid" d="${path}"/><path class="b-core" d="${path}"/></g>`;
  }).join('');
  return [troop,`<svg class="t12-unit-bolts" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`];
}));
/* Cadenas du jeu (corps crème, anse épaisse, trou de serrure) ; ouvert = anse relevée d'un côté. */
/* ouvert : l'anse pivote vers l'extérieur, la branche libre passe de l'autre côté, hors du corps */
const LOCK=open=>{const sh=open?'M17 13V8A5 5 0 0 1 27 8V10':'M7 13V8A5 5 0 0 1 17 8V13';return `<svg class="t12-lock${open?' open':''}" viewBox="0 0 ${open?30:24} 28" aria-hidden="true"><path class="l-shackle-o" d="${sh}"/><path class="l-shackle" d="${sh}"/><rect class="l-body" x="3" y="12" width="18" height="14" rx="3.5"/><circle class="l-hole" cx="12" cy="18" r="2.1"/><rect class="l-hole" x="11" y="18.5" width="2" height="4.5" rx="1"/></svg>`};
const T12_ACTIONS=document.querySelector('#t12 .t12-actions'),T12_RESULT=document.getElementById('t12Result'),T12_BOARD=document.querySelector('#t12 .t12-board');
let advanceTimer=null;
const revealPending={};  /* troupe dont la dernière pièce vient d'être terminée : personnage affiché après 2 s */
const UNIT_ART=troop=>`assets/visuals/t12/units/${troop}.png?v=20261015`;
function renderForge(){
  const troop=state.troop,levels=state.levels[troop],host=document.getElementById('t12Tree');
  const id=state.piece[troop],lvl=levels[id],i=pieceIndex(id),stat=T12.unlockStats[i];
  const target=lvl.to>lvl.from?lvl.to:Math.min(lvl.from+1,5),maxed=lvl.from>=5&&lvl.to<=lvl.from;
  host.style.aspectRatio='';host.dataset.troop=troop;host.dataset.view='unlock';host.classList.add('t12-forge-host');
  const done=UNLOCK.nodes.filter(n=>!n.display&&levels[n.id].from>=5).length,unit=unitUnlocked(levels);
  /* les 5 pièces au max : le personnage glorifié apparaît dans un halo doré */
  const showUnit=done===5&&!revealPending[troop];
  /* cases allumées = lave jaune ; la lueur grandit avec le nombre de cases (--lava de 0 à 1) */
  const gauge=`<svg class="t12-forge-gauge" viewBox="-100 -100 200 200" style="--lava:${lvl.from/5}" aria-hidden="true"><defs><radialGradient id="t12Lava" cx="0" cy="0" r="77" gradientUnits="userSpaceOnUse"><stop offset=".76" stop-color="#ffc21e"/><stop offset=".86" stop-color="#ffe94a"/><stop offset=".93" stop-color="#fff7a8"/><stop offset="1" stop-color="#ffd02a"/></radialGradient><radialGradient id="t12Frame" cx="0" cy="0" r="80" gradientUnits="userSpaceOnUse"><stop offset=".6" stop-color="#c8641a"/><stop offset=".7" stop-color="#f08e24"/><stop offset=".86" stop-color="#ffb43c"/><stop offset="1" stop-color="#e07a1c"/></radialGradient><linearGradient id="t12Shine" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-60 0;110 0;110 0" keyTimes="0;.6;1" dur="2.8s" repeatCount="indefinite"/></linearGradient></defs><path class="t12-gauge-frame" d="${GAUGE_FRAME}"/><g class="t12-gauge-lava">${GAUGE_CELLS.map((d,k)=>`<path class="t12-gauge-cell${k<lvl.from?' on':k<lvl.to?' plan':''}${k===lvl.from-1?' front':''}" d="${d}"/>`).join('')}</g><g class="t12-gauge-shine">${GAUGE_CELLS.slice(0,lvl.from).map(d=>`<path d="${d}"/>`).join('')}</g></svg>`;
  const row=UNLOCK.nodes.filter(n=>!n.display).map((n,k)=>{
    const l=levels[n.id],locked=pieceLocked(levels,n.id),sel=n.id===id,name=nodeName(n.id,troop);
    const cls=['t12-forge-piece',sel&&'sel',l.from>=5&&'done',locked&&'locked',l.to>l.from&&'planned'].filter(Boolean).join(' ');
    const pipe=k?`<i class="t12-forge-pipe${levels['p'+k].from>=5?' lit':''}" aria-hidden="true"></i>`:'';
    return `${pipe}<button type="button" class="${cls}" data-t12-piece="${n.id}" aria-pressed="${sel}" aria-label="${name} : niveau ${l.from} sur 5${locked?', verrouillée':''}" data-tip="${name}">${sel?gauge:''}<span class="t12-forge-disc"><img src="${ICON(troop,l.from>=5?n.id:n.id+'-cut')}" alt="" draggable="false">${locked?`<span class="t12-forge-lock">${LOCK(false)}</span>`:''}</span>${l.to>l.from?`<span class="t12-target">→${l.to>=5?'MAX':l.to}</span>`:''}</button>`;
  }).join('');
  const gainTo=maxed?lvl.from:target;
  const statLine=(label,step,unit)=>`<div><span>${label}</span><b>${num(lvl.from*step)}${unit}${gainTo>lvl.from?`<em>+${num((gainTo-lvl.from)*step)}${unit}</em>`:''}</b></div>`;
  const statLabel=i?`${stat.label} ${TROOP_NOUN[troop]==='Infanterie'?"de l'Infanterie":`du ${TROOP_NOUN[troop]}`}`:'Capacité de déploiement des troupes';
  const pieces=UNLOCK.nodes.filter(n=>!n.display);
  const allMax={from:pieces.every(n=>levels[n.id].from>=5),to:pieces.every(n=>levels[n.id].to>=5)};
  /* Actuel et Objectif : un encadré chacun (réglage de la pièce + « Tout au max » pour les 5 pièces) */
  const stepper=(field,label,value,min)=>`<div class="t12-forge-box" data-t12-forge-field="${field}"><small>${label}</small>
    <div class="t12-forge-step"><button type="button" data-d="-1" ${value<=min?'disabled':''} aria-label="${label} : moins 1">−</button><output>${value}</output><button type="button" data-d="1" ${value>=5?'disabled':''} aria-label="${label} : plus 1">+</button><button type="button" class="t12-forge-max" data-d="5" ${value>=5?'disabled':''} aria-label="${label} : niveau max">MAX</button></div>
    <label class="select-all-charms charm-bulk-select t12-forge-all"><input type="checkbox" data-t12-all="${field}" ${allMax[field]?'checked':''}><span class="bulk-toggle" aria-hidden="true"><i></i></span><span>Tout au max</span></label></div>`;
  host.innerHTML=`<div class="t12-forge">
    <div class="t12-forge-stage${showUnit?' unit':''}">${showUnit
      ?`<span class="t12-unit-figure">${BOLTS[troop]}<img class="t12-forge-art t12-unit-art" src="${UNIT_ART(troop)}" alt="${T12.units[troop]}" draggable="false"></span>
        <div class="t12-unit-banner" role="status"><b>${T12.units[troop]} ${LOCK(true)}</b><small>L'arbre de recherche est accessible</small></div>`
      :`<img class="t12-forge-art" src="${RENDER(troop,id)}" alt="${nodeName(id,troop)}" draggable="false">`}
      ${showUnit?'':`<span class="t12-forge-unit">${LOCK(false)} ${T12.units[troop]} · ${done}/5 pièces</span>`}</div>
    <div class="t12-forge-row">${elbow('inlet',true)}${row}${elbow('outlet',unit)}</div>
    <div class="t12-forge-panel">
      <div class="t12-forge-head"><h3>${nodeName(id,troop)}</h3><span class="t12-forge-lv">Niv. ${lvl.from}${maxed?' · MAX':`<i>➜</i>${target}`}</span></div>
      <div class="t12-forge-stats">${statLine(statLabel,stat.step,stat.unit)}${statLine('Puissance',i?150000:180000,'')}</div>
      <div class="t12-forge-set">${stepper('from','Actuel',lvl.from,0)}${stepper('to','Objectif',lvl.to,lvl.from)}</div>
    </div></div>`;
  host.querySelector('.t12-forge').append(T12_RESULT);  /* coût total dans le même encadrement que la forge */
  host.querySelectorAll('[data-t12-all]').forEach(box=>box.onchange=()=>{
    const field=box.dataset.t12All,on=box.checked;
    pieces.forEach(n=>{const l=levels[n.id];
      if(field==='from'){l.from=on?5:0;l.to=Math.max(l.to,l.from)}else l.to=on?5:l.from;
    });
    clearTimeout(advanceTimer);delete revealPending[troop];
    render();
  });
  host.querySelectorAll('[data-t12-piece]').forEach(b=>b.onclick=()=>{state.piece[troop]=b.dataset.t12Piece;render()});
  host.querySelectorAll('[data-t12-forge-field]').forEach(box=>{
    const field=box.dataset.t12ForgeField;
    box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
      const d=+b.dataset.d,l=levels[id];
      l[field]=Math.max(0,Math.min(5,d===5?5:l[field]+d));l.to=Math.max(l.to,l.from);
      clearTimeout(advanceTimer);
      /* pièce terminée : on laisse 1 s pour voir la jauge pleine, puis on passe à la suivante */
      const allDone=UNLOCK.nodes.every(n=>n.display||levels[n.id].from>=5);
      if(field==='from'&&l.from>=5&&allDone&&!revealPending[troop]){
        revealPending[troop]=true;
        setTimeout(()=>{delete revealPending[troop];if(state.view==='unlock'&&state.troop===troop)render()},2000);
      }
      if(field==='from'&&l.from>=5&&pieceIndex(id)<4)advanceTimer=setTimeout(()=>{
        if(state.view==='unlock'&&state.troop===troop&&state.piece[troop]===id&&levels[id].from>=5){state.piece[troop]='p'+(pieceIndex(id)+2);render()}
      },1000);
      render();
    });
  });
}

/* Coût : déblocage (fragments, cristaux raffinés, acier — instantané) ou arbre (8 ressources). */
function renderResult(){
  const levels=state.levels[state.troop];
  let tiles;
  if(state.view==='unlock'){
    const C=T12.unlockCost;let rfc=0,steel=0;
    UNLOCK.nodes.forEach(node=>{
      if(node.display)return;
      const kind=node.piece?1:0,{from,to}=levels[node.id];
      for(let l=from;l<to;l++){rfc+=C.rfc[kind][l];steel+=C.rfc[kind][l]*C.steelPerRfc[kind]}
    });
    tiles=[
      ['shard','Fragment de Cristal Ardent','assets/visuals/t11/fire-crystal-shard.png?v=hd',fmt(rfc*C.shardsPerRfc)],
      ['rfc','Cristaux raffinés','assets/visuals/furnace-materials/refined-fire-crystal.png',fmt(rfc)],
      ['steel','Acier','assets/visuals/t11/steel.png',fmt(steel)]
    ];
  }else{
    let steel=0,days=0;
    TREE.nodes.forEach(node=>{
      if(node.display)return;
      const cost=T12.treeCost[node.group||node.id],{from,to}=levels[node.id];
      for(let l=from+1;l<=to;l++){const k=1+l/node.max;steel+=cost.steel*1000*k;days+=cost.days*k}
    });
    tiles=[
      ['shard','Fragment de Cristal Ardent','assets/visuals/t11/fire-crystal-shard.png?v=hd',fmt(Math.round(steel*.004))],
      ['rfc','Cristaux raffinés','assets/visuals/furnace-materials/refined-fire-crystal.png',fmt(Math.round(steel*.0005))],
      ['steel','Acier','assets/visuals/t11/steel.png',fmt(Math.round(steel))],
      ['meat','Viande','assets/visuals/furnace-materials/meat.png',fmt(Math.round(steel*46))],
      ['wood','Bois','assets/visuals/furnace-materials/wood.png',fmt(Math.round(steel*46))],
      ['coal','Charbon','assets/visuals/furnace-materials/coal.png',fmt(Math.round(steel*9.3))],
      ['iron','Fer','assets/visuals/furnace-materials/iron.png',fmt(Math.round(steel*2.3))],
      ['time','Accélérateurs','assets/visuals/furnace-materials/accelerator.png',formatFurnaceDuration(days)]
    ];
  }
  document.getElementById('t12Result').innerHTML=`<h2>${state.view==='unlock'?'Coût total du déblocage':'Coût de recherche'}</h2>
    <div class="t12-cost-grid">${tiles.map(([key,label,src,value])=>`<div class="t12-cost t12-cost-${key}" tabindex="0" data-tip="${label}" aria-label="${label} : ${value}"><span class="t12-cost-tile"><img src="${src}" alt=""></span><strong>${value}</strong></div>`).join('')}</div>`;
}

function render(){
  const levels=state.levels[state.troop];
  document.querySelectorAll('[data-t12-troop]').forEach(tab=>{const on=tab.dataset.t12Troop===state.troop;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',on)});
  document.querySelectorAll('[data-t12-view]').forEach(tab=>{const on=tab.dataset.t12View===state.view;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',on)});
  const done=[1,2,3,4,5].filter(i=>levels['p'+i].from>=5).length;
  document.getElementById('t12UnlockState').textContent=done===5?'✓':`${done}/5`;
  document.getElementById('t12Banner').hidden=state.view!=='tree'||unitUnlocked(levels);
  renderTree();
  renderResult();
  document.getElementById('t12Reset').checked=TREE.nodes.every(n=>n.display||(!levels[n.id].from&&!levels[n.id].to));
}

/* ---------- Fenêtre de réglage ---------- */
const picker=document.getElementById('t12Picker');
function syncPicker(){
  const id=state.editing,max=maxOf(id),draft=state.draft,levels=state.levels[state.troop];
  picker.classList.toggle('t12-long',max>=20);
  picker.querySelectorAll('[data-t12-field]').forEach(box=>{
    const field=box.dataset.t12Field,value=draft[field],min=field==='to'?draft.from:0;
    box.querySelector('output').textContent=badge(value,max);
    box.querySelectorAll('[data-t12-step]').forEach(b=>{const step=+b.dataset.t12Step;b.disabled=step<0?value<=min:value>=max});
    box.querySelector('[data-t12-max]').disabled=value>=max;
  });
  /* niveau affiché sur l'icône, comme dans l'arbre : il masque aussi la zone retouchée où était le badge du jeu */
  const pb=document.getElementById('t12PickerBadge');if(pb)pb.textContent=badge(draft.from,max);
  const needs=Object.entries(requirementsUpTo(id,draft.to)),list=document.getElementById('t12PickerReqs');
  list.hidden=!needs.length;
  list.innerHTML=needs.length?`<small>PRÉREQUIS${draft.to>1?` JUSQU'AU NIVEAU ${draft.to}`:''}</small>`+needs.map(([other,min])=>{
    const ok=current(levels,other)>=min,label=other==='unit'?`${T12.units[state.troop]} débloquée`:`${nodeName(other,state.troop)} niv. ${min}`;
    return `<span class="${ok?'ok':'missing'}">${ok?'✓':'✗'} ${label}</span>`;
  }).join(''):'';
}
function openPicker(id){
  const node=[...UNLOCK.nodes,...TREE.nodes].find(n=>n.id===id);
  state.editing=id;state.draft={...state.levels[state.troop][id]};
  document.getElementById('t12PickerTroop').textContent=T12.units[state.troop].toUpperCase();
  document.getElementById('t12PickerTitle').textContent=nodeName(id,state.troop);
  document.getElementById('t12PickerNode').innerHTML=`<span class="t12-node t12-node-preview${id==='elite'?' t12-big':''}" data-troop="${state.troop}">${nodeArt(node,state.troop)}<span class="t12-badge" id="t12PickerBadge"></span></span>`;
  syncPicker();lockLevelPickerBackground();picker.showModal();  /* page figée derrière la fenêtre (comme Chaudière, Équipement, Talismans) */
}
picker.querySelectorAll('[data-t12-field]').forEach(box=>{
  const field=box.dataset.t12Field;
  const set=value=>{const max=maxOf(state.editing),d=state.draft;d[field]=Math.max(0,Math.min(max,value));d.to=Math.max(d.to,d.from);syncPicker()};
  box.querySelectorAll('[data-t12-step]').forEach(b=>b.onclick=()=>set(state.draft[field]+ +b.dataset.t12Step));
  box.querySelector('[data-t12-max]').onclick=()=>set(Infinity);
});
picker.querySelector('.t12-apply').addEventListener('click',event=>{
  event.preventDefault();
  if(state.editing){state.levels[state.troop][state.editing]={...state.draft};render()}
  picker.close('apply');
});
picker.addEventListener('click',event=>{if(event.target===picker)picker.close('cancel')});
picker.addEventListener('close',unlockLevelPickerBackground);

/* ---------- Onglets et remise à zéro ---------- */
document.querySelectorAll('[data-t12-troop]').forEach(tab=>tab.onclick=()=>{state.troop=tab.dataset.t12Troop;render()});
document.querySelectorAll('[data-t12-view]').forEach(tab=>tab.onclick=()=>{state.view=tab.dataset.t12View;render()});
document.getElementById('t12Reset').addEventListener('change',()=>{
  const levels=state.levels[state.troop];
  TREE.nodes.forEach(n=>{if(!n.display)levels[n.id]={from:0,to:0}});
  render();
});
render();
})();
