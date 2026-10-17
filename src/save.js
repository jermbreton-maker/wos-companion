/* Sauvegarde automatique des sélections (localStorage, aucune interface).
   Chaque calculateur se déclare avec WOSSave.register(nom,{get,set}) juste avant son premier rendu :
   - set(données) restaure ses sélections enregistrées (valeurs vérifiées, les invalides sont ignorées) ;
   - get() renvoie ses sélections actuelles (jamais de coûts : ils sont toujours recalculés).
   L'écriture suit les interactions de la personne (clic, saisie, fermeture de fenêtre), une fois les
   gestionnaires existants exécutés, et seulement si le contenu a changé. Rien n'est écrit au chargement. */
(()=>{
  const KEY='whiteout-companion:save',VERSION=1,modules={};
  let saved=null,lastWritten=null,dirty=false,timer=0;
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const data=JSON.parse(raw);
      if(data&&typeof data==='object'&&data.modules&&typeof data.modules==='object'&&!Array.isArray(data.modules))saved=data;
      lastWritten=raw;
    }
  }catch(error){saved=null}

  const int=(value,min,max)=>Number.isInteger(value)&&value>=min&&value<=max;
  /* Niveaux {troupe:{recherche:{from,to}}} : on ne reprend que les recherches qui existent encore,
     bornées au niveau max actuel (objectif jamais sous le niveau actuel). */
  const restoreLevels=(data,target,maxOf)=>{
    if(!data||typeof data!=='object')return;
    Object.keys(target).forEach(troop=>{
      const troopData=data[troop];
      if(!troopData||typeof troopData!=='object')return;
      Object.keys(target[troop]).forEach(id=>{
        const entry=troopData[id],max=maxOf(id);
        if(!entry||!Number.isInteger(max)||!Number.isInteger(entry.from))return;
        const from=Math.max(0,Math.min(max,entry.from)),to=Number.isInteger(entry.to)?Math.max(from,Math.min(max,entry.to)):from;
        target[troop][id]={from,to};
      });
    });
  };
  /* Niveau repéré par son libellé (stable si la liste évolue), sinon par sa position si elle existe encore. */
  const levelIndex=(entry,labels)=>{
    if(!entry||typeof entry!=='object')return -1;
    if(int(entry.index,0,labels.length-1)&&labels[entry.index]===entry.label)return entry.index;
    const byLabel=typeof entry.label==='string'?labels.indexOf(entry.label):-1;
    return byLabel>=0?byLabel:(int(entry.index,0,labels.length-1)?entry.index:-1);
  };
  const levelRef=(index,labels)=>({label:labels[index],index});

  function snapshot(){
    const out={version:VERSION,modules:{...(saved?.modules||{})}};
    Object.entries(modules).forEach(([name,module])=>{try{out.modules[name]=module.get()}catch(error){}});
    const lang=document.getElementById('lang');
    if(lang)out.lang=lang.value;
    return out;
  }
  function write(){
    clearTimeout(timer);
    if(!dirty)return;
    dirty=false;
    let raw;
    try{raw=JSON.stringify(snapshot())}catch(error){return}
    if(raw===lastWritten)return;
    try{localStorage.setItem(KEY,raw);lastWritten=raw}catch(error){}
  }
  function schedule(){dirty=true;clearTimeout(timer);timer=setTimeout(write,200)}
  ['click','change','input','pointerup','keyup'].forEach(type=>document.addEventListener(type,schedule,true));
  document.addEventListener('close',schedule,true);
  addEventListener('pagehide',write);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)write()});

  /* Langue choisie : remise dans le sélecteur sans déclencher son action. */
  const lang=document.getElementById('lang');
  if(lang&&typeof saved?.lang==='string'&&[...lang.options].some(option=>option.value===saved.lang))lang.value=saved.lang;

  window.WOSSave={
    register(name,{get,set}){
      modules[name]={get};
      const data=saved?.modules?.[name];
      if(data===undefined)return;
      try{set(data)}catch(error){}
    },
    flush(){dirty=true;write()},
    restoreLevels,levelIndex,levelRef
  };
})();
