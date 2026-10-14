/* Recherche T12 (Glorifié) : onglets de troupe → sous-onglets Déblocage / Arbre.
   Tout ce fichier ne concerne que la page #t12. */
(()=>{
const T12=window.COMPANION_DATA.t12;
const TROOPS=Object.keys(T12.units);
const ICON=(troop,id)=>`assets/visuals/t12/icons/${troop}-${id}.png?v=20261014`;

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
const UNLOCK={h:1300,nodes:[
  ...[0,1,2,3,4].map(i=>({id:'p'+(i+1),x:300,y:110+i*190,size:150,max:5,label:true,piece:i})),
  {id:'unit',x:300,y:1150,size:190,label:true,display:true}
],links:[
  ...[0,1,2,3].map(i=>({d:`M300 ${110+i*190} V${300+i*190}`,to:'p'+(i+2)})),
  {d:'M300 870 V1150',to:'unit'}
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
const state={troop:'infantry',view:'unlock',levels:Object.fromEntries(TROOPS.map(t=>[t,empty()])),editing:null,draft:null};
const unitUnlocked=levels=>levels.p5.from>=5;
const current=(levels,id)=>id==='unit'?(unitUnlocked(levels)?1:0):levels[id].from;
const isUnlocked=(id,levels)=>Object.entries(requirements(id)[1]||{}).every(([other,min])=>current(levels,other)>=min);
const maxOf=id=>[...UNLOCK.nodes,...TREE.nodes].find(n=>n.id===id).max;
const badge=(value,max)=>value>=max?'MAX':`${value}/${max}`;

/* ---------- Icônes des pièces de déblocage (pas de capture disponible) : pictogrammes simples ---------- */
const PIECES=[
  '<path d="M22 84V52C22 28 36 14 50 14S78 28 78 52V84Z"/><path class="t12-cut" d="M32 48H68V56H32ZM36 61H43V76H36ZM46 61H54V76H46ZM57 61H64V76H57Z"/>',
  '<path d="M14 62C14 38 30 22 50 22S86 38 86 62C76 56 64 54 50 54S24 56 14 62Z"/><path d="M22 66C30 62 40 60 50 60S70 62 78 66L72 82C66 78 58 76 50 76S34 78 28 82Z"/>',
  '<path d="M30 16H70L84 30V58C84 76 68 86 50 90C32 86 16 76 16 58V30Z"/><path class="t12-cut" d="M44 34H56V48H70V60H56V76H44V60H30V48H44Z"/>',
  '<path d="M34 12H56V58L82 66C88 68 90 74 88 80V86H22V70L34 58Z"/><path class="t12-cut" d="M38 70H82V76H38Z"/>',
  '<path d="M18 82L66 34L60 28L82 12L68 34L74 40L26 88Z"/><path d="M58 22L74 8L90 24L76 38Z"/>'
];
const pieceSvg=i=>`<svg class="t12-ico t12-ico-svg" viewBox="0 0 100 100" aria-hidden="true">${PIECES[i]}</svg>`;
const nodeArt=(node,troop)=>node.piece!==undefined?pieceSvg(node.piece):`<img class="t12-ico" src="${ICON(troop,iconId(node.id))}" alt="" draggable="false">`;

/* ---------- Rendu ---------- */
function renderTree(){
  const layout=state.view==='unlock'?UNLOCK:TREE,levels=state.levels[state.troop],troop=state.troop;
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
    const labelX=state.view==='unlock'?`left:${(node.x+node.size/2+28)/10}%;top:${node.y/layout.h*100}%`:`left:${node.x/10}%;top:${(node.y+node.size/2+16)/layout.h*100}%`;
    const label=node.label?`<span class="t12-label${state.view==='unlock'?' t12-label-side':''}" style="${labelX}">${name}</span>`:'';
    if(node.display){
      const ok=unitUnlocked(levels);
      return `<div class="t12-node t12-unit${ok?' unlocked':' locked'}" style="${pos}" data-tip="${name} : ${ok?'débloquée':'pas encore débloquée'}">${nodeArt(node,troop)}<span class="t12-badge">${ok?'✓':'🔒'}</span></div>${label}`;
    }
    const lvl=levels[node.id],planned=lvl.to>lvl.from,locked=!lvl.from&&!isUnlocked(node.id,levels);
    return `<button type="button" class="t12-node${planned?' planned':''}${locked?' locked':''}" style="${pos}" data-t12-node="${node.id}" aria-label="${name} : niveau ${lvl.from} sur ${node.max}${planned?`, objectif ${lvl.to}`:''}${locked?', verrouillée':''}">
      ${nodeArt(node,troop)}<span class="t12-badge">${badge(lvl.from,node.max)}</span>${planned?`<span class="t12-target">→${lvl.to>=node.max?'MAX':lvl.to}</span>`:''}</button>${label}`;
  }).join('');
  host.innerHTML=svg+nodes;
  host.querySelectorAll('[data-t12-node]').forEach(button=>button.onclick=()=>openPicker(button.dataset.t12Node));
}

/* Coût : déblocage (fragments, cristaux raffinés, acier — instantané) ou arbre (8 ressources). */
function renderResult(){
  const levels=state.levels[state.troop];
  let tiles;
  if(state.view==='unlock'){
    let weight=0;
    UNLOCK.nodes.forEach(node=>{if(node.display)return;const {from,to}=levels[node.id];for(let l=from+1;l<=to;l++)weight+=node.piece*5+l});
    const share=weight/325; /* répartition croissante du coût total réel sur les 25 niveaux */
    tiles=[
      ['shard','Fragment de Cristal Ardent','assets/visuals/t11/fire-crystal-shard.png?v=hd',fmt(Math.round(T12.unlockTotal.shards*share))],
      ['rfc','Cristaux raffinés','assets/visuals/furnace-materials/refined-fire-crystal.png',fmt(Math.round(T12.unlockTotal.rfc*share))],
      ['steel','Acier','assets/visuals/t11/steel.png',fmt(Math.round(T12.unlockTotal.steel*share))]
    ];
  }else{
    let steel=0,days=0;
    TREE.nodes.forEach(node=>{
      if(node.display)return;
      const cost=T12.treeCost[node.group||node.id],{from,to}=levels[node.id];
      for(let l=from+1;l<=to;l++){const k=1+l/node.max;steel+=cost.steel*1000*k;days+=cost.days*k}
    });
    tiles=[
      ['fc','Cristaux de feu','assets/visuals/furnace-materials/fire-crystal.png',fmt(Math.round(steel*.004))],
      ['rfc','Cristaux raffinés','assets/visuals/furnace-materials/refined-fire-crystal.png',fmt(Math.round(steel*.0005))],
      ['steel','Acier','assets/visuals/t11/steel.png',fmt(Math.round(steel))],
      ['meat','Viande','assets/visuals/furnace-materials/meat.png',fmt(Math.round(steel*46))],
      ['wood','Bois','assets/visuals/furnace-materials/wood.png',fmt(Math.round(steel*46))],
      ['coal','Charbon','assets/visuals/furnace-materials/coal.png',fmt(Math.round(steel*9.3))],
      ['iron','Fer','assets/visuals/furnace-materials/iron.png',fmt(Math.round(steel*2.3))],
      ['time','Accélérateurs','assets/visuals/furnace-materials/accelerator.png',formatFurnaceDuration(days)]
    ];
  }
  document.getElementById('t12Result').innerHTML=`<h2>${state.view==='unlock'?'Coût du déblocage':'Coût de recherche'}</h2>
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
  const layout=state.view==='unlock'?UNLOCK:TREE;
  document.getElementById('t12Reset').checked=layout.nodes.every(n=>n.display||(!levels[n.id].from&&!levels[n.id].to));
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
  document.getElementById('t12PickerNode').innerHTML=`<span class="t12-node t12-node-preview" data-troop="${state.troop}">${nodeArt(node,state.troop)}</span>`;
  syncPicker();picker.showModal();
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

/* ---------- Onglets et remise à zéro ---------- */
document.querySelectorAll('[data-t12-troop]').forEach(tab=>tab.onclick=()=>{state.troop=tab.dataset.t12Troop;render()});
document.querySelectorAll('[data-t12-view]').forEach(tab=>tab.onclick=()=>{state.view=tab.dataset.t12View;render()});
document.getElementById('t12Reset').addEventListener('change',()=>{
  const layout=state.view==='unlock'?UNLOCK:TREE,levels=state.levels[state.troop];
  layout.nodes.forEach(n=>{if(!n.display)levels[n.id]={from:0,to:0}});
  render();
});
render();
})();
