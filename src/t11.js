/* Recherche T11 : arbre façon Académie de guerre (référence : capture iPhone de l'arbre Lancier).
   Tout ce fichier ne concerne que la page #t11. */
(()=>{
const T11=window.COMPANION_DATA.t11;

/* Disposition dans un repère 1000 × 1400 (proportions de la capture de référence). */
const LAYOUT={
  squad:{x:500,y:115,size:126},
  atk:{x:290,y:300,size:126},
  def:{x:710,y:300,size:126},
  legion:{x:500,y:488,size:146,label:true},
  atk2:{x:150,y:622,size:126},
  def2:{x:850,y:622,size:126},
  helios:{x:500,y:870,size:162,label:true},
  heal:{x:175,y:1078,size:146,label:true},
  train:{x:500,y:1222,size:146,label:true},
  aid:{x:825,y:1078,size:146,label:true}
};
const VIEW={w:1000,h:1400};

/* Liaisons à angles droits, comme dans le jeu : chacune relie une recherche à celle qu'elle débloque. */
const LINKS=[
  {d:'M500 0 V115',to:'squad'},
  {d:'M500 115 H290 V300',from:'squad',to:'atk'},{d:'M500 115 H710 V300',from:'squad',to:'def'},
  {d:'M290 300 V470 H500',from:'atk',to:'legion'},{d:'M710 300 V470 H500',from:'def',to:'legion'},
  {d:'M290 300 H150 V622',from:'atk',to:'atk2'},{d:'M710 300 H850 V622',from:'def',to:'def2'},
  {d:'M500 488 V870',from:'legion',to:'helios'},
  {d:'M150 622 H280 V830 H500',from:'atk2',to:'helios'},{d:'M850 622 H720 V830 H500',from:'def2',to:'helios'},
  {d:'M500 885 H175 V1078',from:'helios',to:'heal'},{d:'M500 885 H825 V1078',from:'helios',to:'aid'},
  {d:'M500 870 V1222',from:'helios',to:'train'}
];

/* Coins des chemins coupés en biseau à 45°, comme dans le jeu (tracés écrits en angles droits : M, H, V). */
const CHAMFER=22;
function chamfer(d){
  const pts=[];let x=0,y=0;
  d.trim().split(/\s+(?=[MHV])/).forEach(cmd=>{
    const [op,...v]=cmd.split(/[\s]+|(?<=[MHV])/).filter(Boolean);
    if(op==='M'){x=+v[0];y=+v[1]}else if(op==='H')x=+v[0];else y=+v[0];
    pts.push([x,y]);
  });
  let out=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length-1;i++){
    const [ax,ay]=pts[i-1],[px,py]=pts[i],[bx,by]=pts[i+1];
    const la=Math.hypot(px-ax,py-ay),lb=Math.hypot(bx-px,by-py),c=Math.min(CHAMFER,la/2,lb/2);
    out+=` L${px-(px-ax)/la*c} ${py-(py-ay)/la*c} L${px+(bx-px)/lb*c} ${py+(by-py)/lb*c}`;
  }
  const [lx,ly]=pts[pts.length-1];
  return out+` L${lx} ${ly}`;
}

/* Icônes du jeu, extraites des captures de l'Académie (badge de niveau effacé) : assets/visuals/t11/icons/{troupe}-{recherche}.png */

const troopIds=Object.keys(T11.units);
const nodeName=(node,troop)=>(node.name||T11.names[troop][node.id]).replace('{unit}',T11.units[troop]).replace(/\bde ([AEIOUÉ])/g,'d’$1');

/* Prérequis d'une recherche pour une troupe : { niveau visé: { recherche: niveau actuel minimum } }. */
function requirements(id,troop){
  const base=T11.requires[id]||{},extra=T11.troopRequires[troop]?.[id]||{},out={};
  for(const level of new Set([...Object.keys(base),...Object.keys(extra)]))out[level]={...base[level],...extra[level]};
  return out;
}
/* Prérequis cumulés pour monter une recherche jusqu'au niveau `target`. */
function requirementsUpTo(id,troop,target){
  const needs={};
  Object.entries(requirements(id,troop)).forEach(([level,reqs])=>{
    if(Number(level)>Math.max(1,target))return;
    Object.entries(reqs).forEach(([other,min])=>needs[other]=Math.max(needs[other]||0,min));
  });
  return needs;
}
/* Une recherche est débloquée quand les niveaux actuels satisfont les prérequis de son niveau 1. */
const isUnlocked=(id,troop,levels)=>Object.entries(requirements(id,troop)[1]||{}).every(([other,min])=>levels[other].from>=min);
/* Un chemin est allumé quand la recherche de départ a le niveau requis pour débloquer la suivante. */
const isOpen=(link,troop,levels)=>!link.from||levels[link.from].from>=(requirements(link.to,troop)[1]?.[link.from]??Infinity);

/* À l'ouverture, toutes les recherches sont à 0 (actuel et objectif) : la personne saisit ses propres niveaux. */
const emptyLevels=()=>Object.fromEntries(T11.nodes.map(node=>[node.id,{from:0,to:0}]));
const t11State={troop:'lancer',levels:Object.fromEntries(troopIds.map(id=>[id,emptyLevels()])),editing:null,draft:null};

const badge=(value,max)=>value>=max?'MAX':`${value}/${max}`;
const iconImg=(id,troop)=>`<img class="t11-ico" src="assets/visuals/t11/icons/${troop}-${id}.png?v=20261014-cv" alt="" draggable="false">`;

function renderTree(){
  const tree=document.getElementById('t11Tree');
  const levels=t11State.levels[t11State.troop];
  const paths=list=>list.map(link=>`<path d="${chamfer(link.d)}"/>`).join('');
  const open=LINKS.filter(link=>isOpen(link,t11State.troop,levels));
  const links=`<svg class="t11-links" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="none" aria-hidden="true">
    <g class="t11-link-off">${paths(LINKS)}</g>
    <g class="t11-link-glow">${paths(open)}</g>
    <g class="t11-link-core">${paths(open)}</g>
    <g class="t11-link-light">${paths(open)}</g>
  </svg>`;
  const nodes=T11.nodes.map(node=>{
    const pos=LAYOUT[node.id],lvl=levels[node.id],planned=lvl.to>lvl.from,name=nodeName(node,t11State.troop);
    /* --t11-node-scale (CSS) agrandit les cases sur mobile ; les noms se décalent d'autant. */
    const style=`left:${pos.x/VIEW.w*100}%;top:${pos.y/VIEW.h*100}%;width:calc(${pos.size/VIEW.w*100}% * var(--t11-node-scale,1))`;
    const label=pos.label?`<span class="t11-label" style="left:${pos.x/VIEW.w*100}%;top:calc((${pos.y} + ${pos.size/2} * var(--t11-node-scale,1) + 14) / ${VIEW.h} * 100%)">${name}</span>`:'';
    const locked=!lvl.from&&!isUnlocked(node.id,t11State.troop,levels);
    return `<button type="button" class="t11-node${planned?' planned':''}${lvl.from>=node.max?' maxed':''}${locked?' locked':''}" data-t11-node="${node.id}" style="${style}" aria-label="${name} : niveau ${lvl.from} sur ${node.max}${planned?`, objectif ${lvl.to}`:''}${locked?', verrouillée':''}">
      ${iconImg(node.id,t11State.troop)}
      <span class="t11-badge">${badge(lvl.from,node.max)}</span>
      ${planned?`<span class="t11-target">→${lvl.to>=node.max?'MAX':lvl.to}</span>`:''}
    </button>${label}`;
  }).join('');
  tree.dataset.troop=t11State.troop;
  tree.innerHTML=links+nodes;
  tree.querySelectorAll('[data-t11-node]').forEach(button=>button.onclick=()=>openPicker(button.dataset.t11Node));
}

function renderResult(){
  const levels=t11State.levels[t11State.troop];
  let steel=0,dust=0,days=0,steps=0,researches=0;
  T11.nodes.forEach(node=>{
    const {from,to}=levels[node.id],count=Math.max(0,to-from);
    if(!count)return;
    researches++;steps+=count;
    steel+=node.cost*1000*count;
    dust+=node.cost*.62*count;
    days+=node.days*count;
  });
  /* Ressources de base : proportions de démonstration calquées sur les tables du jeu (≈ 46 viande et bois,
     9 charbon et 2,3 fer par unité d'acier) ; les vraies tables viendront en dernière étape. */
  const tiles=[
    ['dust','Poussière de cristal','assets/visuals/t11/fire-crystal-dust.png',fmt(Math.round(dust))],
    ['steel','Acier','assets/visuals/t11/steel.png',fmt(Math.round(steel))],
    ['meat','Viande','assets/visuals/furnace-materials/meat.png',fmt(Math.round(steel*46))],
    ['wood','Bois','assets/visuals/furnace-materials/wood.png',fmt(Math.round(steel*46))],
    ['coal','Charbon','assets/visuals/furnace-materials/coal.png',fmt(Math.round(steel*9.3))],
    ['iron','Fer','assets/visuals/furnace-materials/iron.png',fmt(Math.round(steel*2.3))],
    ['time','Temps','assets/visuals/furnace-materials/accelerator.png',formatFurnaceDuration(days)]
  ];
  document.getElementById('t11Result').innerHTML=`<h2>Coût de recherche</h2>
    <div class="t11-cost-grid">${tiles.map(([key,label,src,value])=>`<div class="t11-cost t11-cost-${key}"><span class="t11-cost-tile" title="${label}"><img src="${src}" alt=""></span><strong>${value}</strong><small>${label}</small></div>`).join('')}</div>
    <p class="t11-summary">${steps?`${steps} niveau${steps>1?'x':''} à rechercher sur ${researches} recherche${researches>1?'s':''}`:T11.nodes.every(node=>!levels[node.id].from&&!levels[node.id].to)?'Touche une recherche pour saisir ton niveau actuel et ton objectif.':'Tout est déjà à l’objectif.'}</p>`;
}

function render(){
  document.querySelectorAll('[data-t11-troop]').forEach(tab=>{
    const active=tab.dataset.t11Troop===t11State.troop;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',active);
  });
  renderTree();
  renderResult();
  /* L'interrupteur reflète l'état « tout à zéro » de la troupe affichée. */
  const levels=t11State.levels[t11State.troop];
  document.getElementById('t11Reset').checked=T11.nodes.every(node=>!levels[node.id].from&&!levels[node.id].to);
}

/* Fenêtre de réglage d'une recherche : niveau actuel › objectif. */
const picker=document.getElementById('t11Picker');
function syncPicker(){
  const node=T11.nodes.find(item=>item.id===t11State.editing),draft=t11State.draft;
  picker.querySelectorAll('[data-t11-field]').forEach(box=>{
    const field=box.dataset.t11Field,value=draft[field],min=field==='to'?draft.from:0;
    box.querySelector('output').textContent=badge(value,node.max);
    box.querySelector('[data-t11-step="-1"]').disabled=value<=min;
    box.querySelector('[data-t11-step="1"]').disabled=value>=node.max;
    box.querySelector('[data-t11-max]').disabled=value>=node.max;
  });
  /* Prérequis à remplir (niveaux actuels) pour atteindre l'objectif choisi. */
  const levels=t11State.levels[t11State.troop],needs=Object.entries(requirementsUpTo(node.id,t11State.troop,draft.to));
  const list=document.getElementById('t11PickerReqs');
  list.hidden=!needs.length;
  list.innerHTML=needs.length?`<small>PRÉREQUIS${draft.to>1?` JUSQU'AU NIVEAU ${draft.to}`:''}</small>`+needs.map(([other,min])=>{
    const ok=levels[other].from>=min,otherNode=T11.nodes.find(item=>item.id===other);
    return `<span class="${ok?'ok':'missing'}">${ok?'✓':'✗'} ${nodeName(otherNode,t11State.troop)} niv. ${min}</span>`;
  }).join(''):'';
}
function openPicker(id){
  const node=T11.nodes.find(item=>item.id===id);
  t11State.editing=id;
  t11State.draft={...t11State.levels[t11State.troop][id]};
  document.getElementById('t11PickerTroop').textContent=T11.units[t11State.troop].toUpperCase();
  document.getElementById('t11PickerTitle').textContent=nodeName(node,t11State.troop);
  document.getElementById('t11PickerNode').innerHTML=`<span class="t11-node t11-node-preview">${iconImg(id,t11State.troop)}</span>`;
  syncPicker();
  picker.showModal();
}
picker.querySelectorAll('[data-t11-field]').forEach(box=>{
  const field=box.dataset.t11Field;
  const set=value=>{
    const node=T11.nodes.find(item=>item.id===t11State.editing),draft=t11State.draft;
    draft[field]=Math.max(0,Math.min(node.max,value));
    if(field==='from')draft.to=Math.max(draft.to,draft.from);
    else draft.to=Math.max(draft.to,draft.from);
    syncPicker();
  };
  box.querySelectorAll('[data-t11-step]').forEach(button=>button.onclick=()=>set(t11State.draft[field]+Number(button.dataset.t11Step)));
  box.querySelector('[data-t11-max]').onclick=()=>set(Infinity);
});
/* Enregistrement immédiat au clic sur « Appliquer » (sans attendre l'événement close, qui peut arriver en retard). */
picker.querySelector('.t11-apply').addEventListener('click',event=>{
  event.preventDefault();
  if(t11State.editing){
    t11State.levels[t11State.troop][t11State.editing]={...t11State.draft};
    render();
  }
  picker.close('apply');
});
picker.addEventListener('click',event=>{if(event.target===picker)picker.close('cancel')});

document.querySelectorAll('[data-t11-troop]').forEach(tab=>tab.onclick=()=>{t11State.troop=tab.dataset.t11Troop;render()});
/* Remettre à zéro : actuel et objectif de toutes les recherches de la troupe affichée. */
document.getElementById('t11Reset').addEventListener('change',()=>{t11State.levels[t11State.troop]=emptyLevels();render()});
render();
})();
