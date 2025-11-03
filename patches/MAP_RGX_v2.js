/* ============================================================
   KOBLLUX — Super Patch MAP_RGX_v2.js
   Markdown Action Protocol + Regex Heavy Inline Engine
   ============================================================ */

(()=>{'use strict';

/* ========= Globals ========= */
window.RenderBus = window.RenderBus || {
  _:{},
  on(e,f){ (this._[e] = this._[e] || []).push(f); },
  emit(e,p){ (this._[e]||[]).forEach(fn=>fn(p)); }
};
const toast = (m)=>window.toast ? toast(m) : console.log('⚡', m);

/* ========= BUTTON ENGINE (regex full) ========= */
function ButtonEngine(root=document){
  const RX_BTN = /\[\[btn:(?<act>[a-z0-9_-]+)(?:\|(?<label>[^\]]+))?\]\]/gi;
  root.innerHTML = root.innerHTML.replace(RX_BTN,(m,_,__,off,str)=>{
    const {groups:g} = RX_BTN.exec(m) || {groups:{act:'?',label:m}};
    return `<button class="md-btn" data-btn="${g.act}">${g.label||g.act}</button>`;
  });
}

/* ========= CALLOUT ENGINE (regex multi-line) ========= */
function CalloutEngine(root=document){
  const RX_CALL = /^::(info|warn|pulse|loop)\s*(.*)$/gim;
  root.innerHTML = root.innerHTML.replace(RX_CALL,(m,tipo,rest)=>{
    const body = rest.trim();
    return `<div class="callout ${tipo}"><span class="copy-hint">Copiar</span>${body}</div>`;
  });
}

/* ========= INLINE REGEX EXPANSION ========= */
function inlineEnhance(s){
  if(!s) return '';
  let out = s;
  // Colchetes → chips
  out = out.replace(/\[\[([^[\]]+)\]\]/g, (_,x)=>`<span class="chip-btn" data-chip="${x}">${x}</span>`);
  out = out.replace(/\[([^[\]]+)\]/g, (_,x)=>`<span class="chip" data-chip="${x}">${x}</span>`);
  // Palavra: → strong
  out = out.replace(/(^|[\s>])([A-Za-zÀ-ÿ0-9_]+):(?=\s|$)/g, '$1<strong>$2:</strong>');
  // Emojis :nome:
  out = out.replace(/:([a-z0-9_+-]+):/gi, (_,x)=>`<span class="emoji">:${x}:</span>`);
  // Inline code
  out = out.replace(/`([^`]+)`/g,'<code>$1</code>');
  // KaTeX math (inline)
  out = out.replace(/\$([^$]+)\$/g,'<span class="math">$1</span>');
  return out;
}

/* ========= IA BRIDGE (SK segura) ========= */
RenderBus.on('btn', async ({id,ctx})=>{
  const SK = localStorage.getItem('SK_INFODOSE');
  if(!SK){ alert('Cole sua SK em Configurações.'); return; }
  const map = { gerar:'complete', loop:'continue', tts:'speak' };
  const mode = map[id] || 'complete';
  const payload = {mode, section:ctx?.section||'root', text:ctx?.text||''};
  const r = await fetch('https://api.seu-backend.ai/route',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+SK},
    body:JSON.stringify(payload)
  });
  const json = await r.json().catch(()=>({output:'Erro'}));
  const div=document.createElement('div');
  div.className='callout info';
  div.textContent=json.output||'ok';
  document.activeElement?.closest('.callout,section,article')?.appendChild(div);
});

/* ========= EVENT BIND ========= */
document.addEventListener('click',e=>{
  const b=e.target.closest('.md-btn'); if(!b) return;
  const id=b.dataset.btn;
  const ctx={section:b.closest('section,article,div')?.id||null,text:getSelection()?.toString()||''};
  RenderBus.emit('btn',{id,ctx});
});

/* ========= CSS SKIN ========= */
const CSS=`
.md-btn{border:1px solid rgba(255,255,255,.18);
  background:linear-gradient(42deg,#0c1422,#0f1a2a);
  border-radius:10px;padding:8px 12px;color:var(--ink,#e8ecf6);
  cursor:pointer;transition:.25s;user-select:none}
.md-btn:hover{background:linear-gradient(42deg,#00ff99,#00ccff);color:#000}
.callout{padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;margin:8px 0;background:rgba(10,14,24,.6)}
.callout.info{border-color:#8ff5cf}
.callout.warn{border-color:#ffcf66}
.callout.pulse{border-color:#00ff99;box-shadow:0 0 0 2px rgba(0,255,153,.08) inset}
.callout.loop{border-color:#a6b1ff}
.chip,.chip-btn{display:inline-grid;place-items:center;padding:.25rem .6rem;border-radius:999px;
  background:linear-gradient(42deg,#00ff99,#00ccff);color:#000;font-weight:700;margin:.1rem .2rem;
  box-shadow:0 2px 10px rgba(0,0,0,.35);cursor:pointer;user-select:none}
`;
const s=document.createElement('style'); s.textContent=CSS; document.head.appendChild(s);

/* ========= PATCH RENDER (aplica no DOM inteiro) ========= */
function applyRGX(root=document){
  $$('p,li,blockquote',root).forEach(el=>{
    if(!el.dataset.rgxDone){ el.innerHTML=inlineEnhance(el.innerHTML); el.dataset.rgxDone='1'; }
  });
  ButtonEngine(root);
  CalloutEngine(root);
}

/* ========= INIT ========= */
document.addEventListener('DOMContentLoaded',()=>applyRGX(document));
new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>n.nodeType===1&&applyRGX(n))))
  .observe(document.body,{childList:true,subtree:true});

console.info('MAP_RGX_v2 ✅ Ativado');
})();
