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

/* Pictogrammes blancs (repère 100 × 100). Casque + accessoire, à la manière des icônes du jeu. */
const HELMET='<path d="M24 92V56C24 30 38 16 50 16S76 30 76 56V92Z"/><path class="t11-ico-cut" d="M33 50H67V57H33ZM37 61H43V78H37ZM47 61H53V78H47ZM57 61H63V78H57Z"/>';
const smallHelmet=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})">${HELMET}</g>`;
const ICONS={
  squad:smallHelmet(4,26,.5)+smallHelmet(46,26,.5)+smallHelmet(22,40,.62),
  atk:'<path d="M22 84L70 36L64 30L84 16L70 36L76 42L28 90Z"/><path d="M60 26L74 12L88 26L74 40Z"/>',
  def:'<path d="M50 12L82 24V48C82 70 68 84 50 92C32 84 18 70 18 48V24Z"/><path class="t11-ico-cut" d="M44 38H56V50H68V62H56V74H44V62H32V50H44Z"/>',
  legion:'<path d="M50 6C58 18 70 20 70 34C70 42 64 46 60 46C64 38 58 32 54 28C54 38 46 40 46 48C40 44 38 38 40 30C34 34 30 40 30 46C26 42 26 34 30 26C36 16 46 14 50 6Z"/>'+smallHelmet(8,40,.5)+smallHelmet(50,40,.5)+smallHelmet(25,30,.66),
  atk2:'<path d="M18 86L66 38L60 32L84 14L68 38L74 44L26 92Z"/><path d="M30 60C24 50 30 40 38 36C36 44 42 46 44 52C48 44 46 36 52 30C54 40 62 44 58 56Z"/>',
  def2:HELMET,
  helios:'<g transform="translate(-4 4) scale(.92)">'+HELMET+'</g><path d="M80 10L94 30H86V52H74V30H66Z"/>',
  heal:smallHelmet(-2,22,.78)+'<path d="M70 12H84V20H82V30C90 34 94 42 94 50C94 62 86 70 77 70S60 62 60 50C60 42 64 34 72 30V20H70Z"/><path class="t11-ico-cut" d="M66 50H88C88 58 84 64 77 64S66 58 66 50Z"/>',
  train:smallHelmet(-2,22,.78)+'<circle cx="77" cy="34" r="18"/><circle class="t11-ico-cut" cx="77" cy="34" r="11"/><circle cx="77" cy="34" r="5"/>',
  aid:smallHelmet(-2,22,.78)+'<circle cx="77" cy="34" r="19"/><path class="t11-ico-cut" d="M74 20H80V33L89 40L86 45L74 36Z"/>'
};

const troopIds=Object.keys(T11.units);
const nodeName=(node,troop)=>(node.name||T11.names[troop][node.id]).replace('{unit}',T11.units[troop]);

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
const iconSvg=id=>`<svg class="t11-ico" viewBox="0 0 100 100" aria-hidden="true">${ICONS[id]}</svg>`;

function renderTree(){
  const tree=document.getElementById('t11Tree');
  const levels=t11State.levels[t11State.troop];
  const paths=list=>list.map(link=>`<path d="${link.d}"/>`).join('');
  const open=LINKS.filter(link=>isOpen(link,t11State.troop,levels));
  const links=`<svg class="t11-links" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="none" aria-hidden="true">
    <g class="t11-link-off">${paths(LINKS)}</g>
    <g class="t11-link-glow">${paths(open)}</g>
    <g class="t11-link-core">${paths(open)}</g>
    <g class="t11-link-light">${paths(open)}</g>
  </svg>`;
  const nodes=T11.nodes.map(node=>{
    const pos=LAYOUT[node.id],lvl=levels[node.id],planned=lvl.to>lvl.from,name=nodeName(node,t11State.troop);
    const style=`left:${pos.x/VIEW.w*100}%;top:${pos.y/VIEW.h*100}%;width:${pos.size/VIEW.w*100}%`;
    const label=pos.label?`<span class="t11-label" style="left:${pos.x/VIEW.w*100}%;top:${(pos.y+pos.size/2+14)/VIEW.h*100}%">${name}</span>`:'';
    const locked=!lvl.from&&!isUnlocked(node.id,t11State.troop,levels);
    return `<button type="button" class="t11-node${planned?' planned':''}${lvl.from>=node.max?' maxed':''}${locked?' locked':''}" data-t11-node="${node.id}" style="${style}" aria-label="${name} : niveau ${lvl.from} sur ${node.max}${planned?`, objectif ${lvl.to}`:''}${locked?', verrouillée':''}">
      ${iconSvg(node.id)}
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
  let steel=0,crystals=0,days=0,steps=0,researches=0;
  T11.nodes.forEach(node=>{
    const {from,to}=levels[node.id],count=Math.max(0,to-from);
    if(!count)return;
    researches++;steps+=count;
    steel+=node.cost*1000*count;
    crystals+=node.cost*.62*count;
    days+=node.days*count;
  });
  const tiles=[
    ['steel','Acier','assets/visuals/t11/steel.png',fmt(Math.round(steel))],
    ['crystal','Cristaux de feu','assets/visuals/furnace-materials/fire-crystal.png',fmt(Math.round(crystals))],
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
  document.getElementById('t11PickerNode').innerHTML=`<span class="t11-node t11-node-preview">${iconSvg(id)}</span>`;
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
render();
})();
