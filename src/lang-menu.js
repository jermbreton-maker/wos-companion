/* Menu des langues aux couleurs de la barre du haut. Le <select id="lang"> d'origine reste la source
   (sauvegarde, traduction) : ce menu le pilote et le cache. */
(()=>{
  const select=document.getElementById('lang'),label=select?.closest('.language');
  if(!select||!label)return;
  const NAMES={fr:'Français',en:'English',es:'Español',it:'Italiano'};
  const wrap=document.createElement('div');
  wrap.className='lang-menu';
  wrap.setAttribute('translate','no');
  wrap.innerHTML=`<button type="button" class="lang-current" aria-haspopup="listbox" aria-expanded="false" aria-label="${label.querySelector('span')?.textContent||'Langue'}"><span>${select.value.toUpperCase()}</span><i aria-hidden="true"></i></button>
    <ul class="lang-list" role="listbox" hidden>${[...select.options].map(o=>`<li role="option" tabindex="-1" data-lang="${o.value}" aria-selected="${o.value===select.value}"><b>${o.value.toUpperCase()}</b>${NAMES[o.value]||o.textContent}</li>`).join('')}</ul>`;
  label.after(wrap);
  label.hidden=true;
  const button=wrap.querySelector('.lang-current'),list=wrap.querySelector('.lang-list'),items=[...list.children];
  const open=focusSelected=>{
    list.hidden=false;button.setAttribute('aria-expanded','true');
    if(focusSelected)(items.find(li=>li.dataset.lang===select.value)||items[0]).focus();
  };
  const close=refocus=>{list.hidden=true;button.setAttribute('aria-expanded','false');if(refocus)button.focus()};
  const choose=lang=>{
    close(true);
    if(lang===select.value)return;
    select.value=lang;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  };
  button.addEventListener('click',()=>list.hidden?open(false):close(false));
  button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){e.preventDefault();open(true)}});
  list.addEventListener('click',e=>{const li=e.target.closest('[data-lang]');if(li)choose(li.dataset.lang)});
  list.addEventListener('keydown',e=>{
    const i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(i>=0)choose(items[i].dataset.lang)}
    else if(e.key==='Escape'||e.key==='Tab')close(e.key==='Escape');
  });
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))close(false)});
})();
