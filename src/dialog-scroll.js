/* Fenêtres de sélection (dialog) : à la fermeture, la page reste à l'endroit où la fenêtre a été ouverte.
   Sur mobile, le retour du focus et le défilement « fluide » du site renvoyaient en haut de page. */
(()=>{
const open=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(){
  /* les sélecteurs qui figent déjà la page (body.level-picker-open) gèrent eux-mêmes leur retour */
  if(!document.body.classList.contains('level-picker-open'))this.dataset.pageY=scrollY;
  return open.apply(this,arguments);
};
document.addEventListener('close',event=>{
  const dialog=event.target;
  if(!(dialog instanceof HTMLDialogElement)||dialog.dataset.pageY===undefined)return;
  const y=+dialog.dataset.pageY;delete dialog.dataset.pageY;
  const back=()=>{if(Math.abs(scrollY-y)>1)scrollTo({top:y,behavior:'instant'})};
  back();requestAnimationFrame(back);setTimeout(back,120);
},true);
})();
