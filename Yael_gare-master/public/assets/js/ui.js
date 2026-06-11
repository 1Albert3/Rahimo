// ui.js
window.Toast = (function(){
  const icons = {
    success:'<i class="fas fa-check"></i>',
    error:'<i class="fas fa-times"></i>',
    warning:'<i class="fas fa-exclamation"></i>',
    info:'<i class="fas fa-info"></i>',
  };
  function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
  function show({type='info',title='',message=''}) {
    const container = document.getElementById('toast-container') || (()=>{const c=document.createElement('div');c.id='toast-container';c.className='toast-container';document.body.appendChild(c);return c})();
    const node = el(`
      <div class="toast-item toast-${type}">
        <div class="icon">${icons[type]||icons.info}</div>
        <div class="content"><div class="title">${title||''}</div><div class="message">${message||''}</div></div>
        <button class="close" aria-label="Fermer">&times;</button>
      </div>
    `);
    const remove=()=>{node.style.opacity='0';node.style.transform='translateY(6px)';setTimeout(()=>node.remove(),180);};
    node.querySelector('.close').addEventListener('click', remove);
    container.appendChild(node);
    setTimeout(remove, 4000);
  }
  return { show };
})();

window.Dialog = (function(){
  function confirm({title='Confirmer', message='Voulez-vous continuer ?', confirmText='Oui', cancelText='Annuler'}){
    return new Promise(resolve=>{
      const wrap = document.createElement('div');
      wrap.className='dialog-overlay';
      wrap.innerHTML = `
        <div class="dialog" role="dialog" aria-modal="true">
          <div class="dialog-header">
            <div class="icon"><i class="fas fa-exclamation"></i></div>
            <h3 class="dialog-title">${title}</h3>
          </div>
          <div class="dialog-body">${message}</div>
          <div class="dialog-footer">
            <button class="dialog-btn dialog-cancel">${cancelText}</button>
            <button class="dialog-btn dialog-confirm">${confirmText}</button>
          </div>
        </div>`;
      document.body.appendChild(wrap);
      const close = ok => { wrap.remove(); resolve(ok); };
      wrap.addEventListener('click', e => { if(e.target===wrap) close(false); });
      wrap.querySelector('.dialog-cancel').addEventListener('click', ()=>close(false));
      wrap.querySelector('.dialog-confirm').addEventListener('click', ()=>close(true));
    });
  }
  return { confirm };
})();
