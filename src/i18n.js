/* Traduction de l'affichage (dictionnaires src/i18n-<langue>.js, générés depuis i18n/lexique.xlsx).
   Le site est écrit et calcule en français ; en français cette couche ne fait rien. Dans une autre langue,
   elle remplace les textes affichés (texte, aria-label, title, data-tip, alt, placeholder) au fur et à mesure
   des rendus, sans toucher aux données ni aux calculs. Un texte absent du lexique reste en français.
   Changer de langue enregistre la sélection (src/save.js) puis recharge la page. */
(()=>{
  const select=document.getElementById('lang');
  const lang=select?.value||'fr';
  window.I18N={lang,setLang(next){
    if(next===lang)return;
    if(select)select.value=next;
    try{window.WOSSave?.flush()}catch(error){}
    /* on revient ensuite sur la même page, à la même hauteur */
    try{sessionStorage.setItem('wos-lang-return',JSON.stringify({view:document.querySelector('.view.active')?.id,y:Math.round(scrollY)}))}catch(error){}
    document.documentElement.classList.add('lang-leaving');
    setTimeout(()=>location.reload(),150);
  }};
  let back=null;
  try{back=JSON.parse(sessionStorage.getItem('wos-lang-return'));sessionStorage.removeItem('wos-lang-return')}catch(error){}
  if(back){
    /* la hauteur est réappliquée pendant le chargement (images, rendus), sauf si la personne fait défiler entre-temps */
    let touched=false;
    ['wheel','touchstart','keydown'].forEach(type=>addEventListener(type,()=>{touched=true},{once:true,passive:true}));
    const toY=()=>{if(!touched&&back.y)scrollTo({top:back.y,behavior:'instant'})};
    /* bascule immédiate sur la page d'origine (le HTML est déjà là), sans la remontée en haut de la navigation */
    const view=back.view&&document.getElementById(back.view)?.classList.contains('view')?back.view:null;
    if(view)document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===view));
    const root=document.documentElement;
    const reveal=()=>{
      if(!root.classList.contains('lang-returning'))return;
      root.classList.add('lang-revealing');root.classList.remove('lang-returning','lang-returning-away');
      setTimeout(()=>root.classList.remove('lang-revealing'),350);
    };
    setTimeout(reveal,1500);                                     // filet de sécurité
    document.addEventListener('DOMContentLoaded',()=>{
      if(view){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===view));if(typeof window.syncNav==='function')window.syncNav(view)}
      toY();
      requestAnimationFrame(()=>{toY();reveal()});
    },{once:true});
    addEventListener('load',()=>{toY();[150,400,800].forEach(ms=>setTimeout(toY,ms))},{once:true});
  }
  const dict=window.I18N_DICT?.[lang];
  if(lang==='fr'||!dict)return;
  document.documentElement.lang=lang;

  const exact=new Map(Object.entries(dict.exact));
  /* Morceaux de phrase du lexique (« , verrouillée ») : aussi utilisables sans leur ponctuation de tête. */
  for(const [fr,tr] of [...exact]){const m=fr.match(/^[,·:]\s+(.+)$/);if(m&&!exact.has(m[1]))exact.set(m[1],tr.replace(/^[,·:]\s+/,''))}
  const upper=new Map([...exact].map(([fr,tr])=>[fr.toLocaleUpperCase('fr'),tr.toLocaleUpperCase(lang)]));
  /* Modèles « {nom} : niveau {from} sur {max} » : variables consécutives fusionnées, valeurs traduites à leur tour. */
  const templates=dict.templates.map(([fr,tr])=>{
    const parts=fr.replace(/(\{[^}]+\})+/g,'\u0000').split('\u0000');
    const source=new RegExp('^'+parts.map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('(.*?)')+'$');
    return {source,target:tr.replace(/(\{[^}]+\})+/g,'\u0000').split('\u0000')};
  });
  const SEPARATORS=[[' · ',' · '],[' : ',': '],[', ',', '],[' › ',' › '],[' → ',' → ']];
  const DURATION=/^\d+ (J|h|min|s)( \d+ (J|h|min|s))?$/;
  const cache=new Map();
  /* Virgule décimale dans les langues qui l'utilisent (comme dans le jeu) : « 2.16K » → « 2,16K ». */
  const COMMA=['es','it'].includes(lang);

  function translate(text,depth=0){
    if(COMMA&&/^\d+\.\d+[KMB]?$/.test(text))return text.replace('.',',');
    if(!text||depth>6||!/[A-Za-zÀ-ÿ]/.test(text))return text;
    if(cache.has(text))return cache.get(text);
    const out=lookup(text,depth);
    if(cache.size>5000)cache.clear();
    cache.set(text,out);
    return out;
  }
  function lookup(text,depth){
    if(exact.has(text))return exact.get(text);
    if(upper.has(text))return upper.get(text);
    if(DURATION.test(text))return text.replace(/ J\b/g,' d');
    const mark=text.match(/^([✓✗•]\s*)(.+)$/);                   // « ✗ Vision de Cristal niv. 7 » : symbole mis de côté
    if(mark)return mark[1]+translate(mark[2],depth+1);
    for(const {source,target} of templates){
      const m=text.match(source);
      if(m&&target.length===m.length)return target.map((piece,i)=>i?keepSpace(m[i],depth)+piece:piece).join('');
    }
    for(const [sep,trSep] of SEPARATORS){
      if(text.includes(sep)){
        const pieces=text.split(sep),done=pieces.map(p=>translate(p,depth+1));
        if(done.some((p,i)=>p!==pieces[i]))return done.join(trSep);
      }
    }
    let m=text.match(/^(.*\S)(\s*★+.*)$/);                       // « Mythique ★★ », « Légendaire ★ · 2/4 »
    if(m){const head=translate(m[1],depth+1);if(head!==m[1])return head+m[2]}
    m=text.match(/^(.*\S) (I{1,3})$/);                           // « Lames Brûlantes II »
    if(m){const head=translate(m[1],depth+1);if(head!==m[1])return head+' '+m[2]}
    m=text.match(/^(.*?)(\d.*)$/);                               // « Niv. 8 », « Chaudière FC6 », « Recherches T11 »
    if(m&&m[1]){const head=translate(m[1].trimEnd(),depth+1);if(head!==m[1].trimEnd())return head+m[1].slice(m[1].trimEnd().length)+m[2]}
    m=text.match(/^(.*?)(\s*[:,.!?…]+)$/);                       // ponctuation finale
    if(m&&m[1]){const head=translate(m[1],depth+1);if(head!==m[1])return head+m[2]}
    return text;
  }

  /* Valeur insérée dans un modèle : traduite sans perdre ses espaces de bord. */
  function keepSpace(value,depth){
    const core=value.trim();
    return core?value.replace(core,translate(core,depth+1)):value;
  }
  const ATTRS=['aria-label','title','data-tip','alt','placeholder'];
  const SKIP=new Set(['SCRIPT','STYLE','OPTION']);
  function textNode(node){
    const parent=node.parentNode;
    if(!parent||SKIP.has(parent.nodeName))return;
    const raw=node.nodeValue,core=raw.trim();
    if(!core)return;
    const done=translate(core);
    if(done!==core){node.nodeValue=raw.replace(core,done);fitLater(parent)}
  }
  function element(el){
    for(const name of ATTRS){
      const value=el.getAttribute(name);
      if(value){const done=translate(value);if(done!==value)el.setAttribute(name,done)}
    }
  }
  function walk(root){
    if(root.nodeType===3){textNode(root);return}
    if(root.nodeType!==1||SKIP.has(root.nodeName))return;
    element(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){if(node.nodeType===3)textNode(node);else if(!SKIP.has(node.nodeName))element(node)}
  }
  /* Texte traduit plus long que la zone prévue : police réduite au plus juste (par pas de 3 %, jusqu'à 72 %)
     pour qu'il tienne sans déborder. Seuls les éléments traduits sont concernés : le français ne bouge jamais. */
  const fitted=new Set(),pending=new Set();let fitTimer=0;
  function fitLater(el){if(el&&el.nodeType===1){pending.add(el);clearTimeout(fitTimer);fitTimer=setTimeout(fitPending,60)}}
  /* Dans une zone qui défile (menu du haut en mobile), dépasser est voulu : on n'y touche pas. */
  function inScroller(el){
    for(let a=el.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a).overflowX;if((o==='auto'||o==='scroll')&&a.scrollWidth>a.clientWidth+1)return true}
    return false;
  }
  function overflows(el){
    const box=el.getBoundingClientRect();
    if(!box.width||inScroller(el))return false;
    if(el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflowX!=='visible')return true;
    const holder=el.parentElement;if(!holder)return false;
    const h=holder.getBoundingClientRect(),cs=getComputedStyle(holder);
    return box.right>h.right-parseFloat(cs.paddingRight)+1||box.left<h.left+parseFloat(cs.paddingLeft)-1||el.scrollWidth>Math.ceil(box.width)+1;
  }
  function fit(el){
    if(!el.isConnected)return;
    if(el.dataset.i18nFont){el.style.fontSize='';delete el.dataset.i18nFont}
    if(!overflows(el))return;
    const base=parseFloat(getComputedStyle(el).fontSize);
    for(let k=.97;k>=.72;k-=.03){
      el.style.fontSize=(base*k).toFixed(2)+'px';el.dataset.i18nFont='1';
      if(!overflows(el))break;
    }
    fitted.add(el);
  }
  function fitPending(){const list=[...pending];pending.clear();list.forEach(el=>{fitted.add(el);fit(el)})}
  const refitAll=()=>{fitted.forEach(el=>{if(el.isConnected)pending.add(el);else fitted.delete(el)});clearTimeout(fitTimer);fitTimer=setTimeout(fitPending,80)};
  addEventListener('resize',refitAll);
  document.addEventListener('click',()=>setTimeout(refitAll,120),true);
  walk(document.body);
  new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='childList')r.addedNodes.forEach(walk);
      else if(r.type==='characterData')textNode(r.target);
      else element(r.target);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
})();
