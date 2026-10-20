'use strict';
document.documentElement.classList.add('js');
const lang=document.documentElement.lang.startsWith('zh')?'zh':'en';
const message=(en,zh)=>lang==='zh'?zh:en;
document.querySelectorAll('[data-copy]').forEach(button=>{
  button.hidden=false;
  button.addEventListener('click',async()=>{
    const source=document.getElementById(button.dataset.copy);
    const status=document.getElementById(button.dataset.status);
    if(!source||!status)return;
    const text=source.textContent.trim();
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent=message('Copied.','已复制。');
    }catch{
      const selection=window.getSelection();
      const range=document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();selection.addRange(range);
      status.textContent=message('Copy is unavailable. Select the text above and copy it manually.','无法自动复制。请选中上方文本并手动复制。');
    }
  });
});
const form=document.querySelector('[data-publication-filter]');
if(form){
  const input=form.querySelector('input');
  const select=form.querySelector('select');
  const rows=[...document.querySelectorAll('[data-publication]')];
  const count=document.querySelector('[data-result-count]');
  const empty=document.querySelector('[data-empty]');
  const note=document.querySelector('[data-filter-note]');
  const syncLanguage=()=>{
    document.querySelectorAll('[data-language-link]').forEach(a=>{
      const url=new URL(a.href);
      url.search=location.search;url.hash=location.hash;a.href=url.href;
    });
  };
  const apply=(write=true)=>{
    const needle=input.value.trim().toLocaleLowerCase();
    const topic=select.value;
    let visible=0;
    rows.forEach(row=>{
      const found=(!needle||row.dataset.search.includes(needle))&&(!topic||row.dataset.topics.split(' ').includes(topic));
      row.hidden=!found;if(found)visible++;
    });
    document.querySelectorAll('[data-status-group]').forEach(group=>{group.hidden=![...group.querySelectorAll('[data-publication]')].some(row=>!row.hidden);});
    count.textContent=message(visible+' of '+rows.length+' publications',visible+' / '+rows.length+' 项成果');
    empty.hidden=visible!==0;
    if(write){
      const url=new URL(location.href);url.search='';
      if(needle)url.searchParams.set('q',input.value.trim());
      if(topic)url.searchParams.set('topic',topic);
      history[write==='push'?'pushState':'replaceState'](null,'',url);
    }
    syncLanguage();
  };
  const read=()=>{
    const params=new URLSearchParams(location.search);
    input.value=params.get('q')||'';
    const topic=params.get('topic')||'';
    if(topic&&![...select.options].some(o=>o.value===topic)){
      select.value='';note.textContent=message('Unknown research area. Showing all areas.','未找到该研究方向，已显示全部方向。');
    }else{select.value=topic;note.textContent='';}
    apply(false);
  };
  form.addEventListener('submit',event=>{event.preventDefault();apply('push');});
  input.addEventListener('input',()=>apply());
  select.addEventListener('change',()=>apply('push'));
  form.querySelector('[data-reset]').addEventListener('click',()=>{
    input.value='';select.value='';note.textContent='';apply('push');input.focus();
  });
  window.addEventListener('popstate',read);read();
}
