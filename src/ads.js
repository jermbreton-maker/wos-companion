/* Emplacements publicitaires (maquette avec annonces fictives, visuels dans assets/ads/).
   L'affichage selon l'écran est géré par src/ads.css. */
(()=>{
const slot=(cls,file,w,h,alt)=>{
  const el=document.createElement('aside');
  el.className=`ad-slot ${cls}`;
  el.setAttribute('aria-label','Publicité');
  el.innerHTML=`<small>Publicité</small><img src="assets/ads/${file}" width="${w}" height="${h}" alt="${alt}" loading="lazy">`;
  return el;
};

/* Ordinateur : un bandeau vertical de chaque côté (160×600, ou 300×600 sur grand écran). */
[['left','thermoplaid','Thermo’Plaid (annonce fictive)'],['right','aurora','Aurora Voyages (annonce fictive)']].forEach(([side,name,alt])=>{
  const rail=document.createElement('div');
  rail.className=`ad-rail ad-rail-${side}`;
  rail.append(slot('ad-rail-narrow',`${name}-160x600.svg`,160,600,alt),slot('ad-rail-wide',`${name}-300x600.svg`,300,600,alt));
  document.body.append(rail);
});

/* Mobile : bannière sous le menu du haut, sur toutes les pages. */
document.querySelector('main').prepend(slot('ad-mobile-top','chocolat-320x50.svg',320,50,'Chocolat Givré (annonce fictive)'));

/* Mobile : pavé sous le panneau Coût de chaque page (sous le panneau principal pour T12). */
['#furnaceResult','#chiefResult','#charmResult','#t11Result','#t12 .t12-page-panel'].forEach(selector=>{
  document.querySelector(selector)?.after(slot('ad-mobile-mrec','aurora-300x250.svg',300,250,'Aurora Voyages (annonce fictive)'));
});
})();
