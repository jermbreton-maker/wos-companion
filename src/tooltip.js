/* Infobulles du site : remplacent l'infobulle native (attribut title) par une infobulle au style du site,
   aux couleurs du fond de la page ciblée. Survol (ordinateur), focus clavier, toucher (mobile).
   Les éléments peuvent aussi porter directement data-tip. */
(()=>{
const tip=document.createElement('div');
tip.className='site-tip';
tip.setAttribute('role','tooltip');
document.body.append(tip);
let target=null;

/* Couleurs selon le fond : brun (T11), clair (T12 et fenêtres à fond blanc), bleu marine ailleurs. */
const theme=el=>el.closest('#t11,#t11Picker')?'t11':el.closest('#t12,#gearDialog')?'light':'blue';
const find=node=>node?.closest?.('[title],[data-tip]');
function textOf(el){
  if(el.hasAttribute('title')){el.dataset.tip=el.getAttribute('title');el.removeAttribute('title')}
  return el.dataset.tip;
}
function place(el){
  const r=el.getBoundingClientRect();
  tip.style.left='0px';tip.style.top='0px';
  const origin=tip.getBoundingClientRect(),w=origin.width,h=origin.height;
  let x=r.left+r.width/2-w/2,y=r.top-h-8;
  x=Math.max(6,Math.min(innerWidth-w-6,x));
  if(y<6)y=r.bottom+8;
  tip.style.left=`${x-origin.left}px`;tip.style.top=`${y-origin.top}px`;
}
function show(el){
  const text=textOf(el);
  if(!text)return hide();
  target=el;
  tip.textContent=text;
  tip.dataset.theme=theme(el);
  const host=el.closest('dialog[open]')||document.body;  /* une fenêtre ouverte passe au-dessus de tout */
  if(tip.parentElement!==host)host.append(tip);
  tip.classList.add('visible');
  place(el);
}
function hide(){target=null;tip.classList.remove('visible')}

document.addEventListener('mouseover',event=>{const el=find(event.target);if(el){if(el!==target)show(el)}else if(target)hide()});
document.addEventListener('mouseout',event=>{if(!event.relatedTarget)hide()});
document.addEventListener('focusin',event=>{const el=find(event.target);el?show(el):hide()});
/* Toucher (pas de survol) : toucher un élément non interactif affiche ou masque son nom ; toucher ailleurs le masque. */
document.addEventListener('click',event=>{
  if(matchMedia('(hover:hover)').matches)return;
  const el=find(event.target);
  if(el&&!el.closest('button,a,input,select,label'))el===target?hide():show(el);
  else hide();
});
addEventListener('scroll',()=>{if(target)place(target)},{passive:true});
addEventListener('resize',hide);
document.addEventListener('close',hide,true);
})();
