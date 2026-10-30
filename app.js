const $=s=>document.querySelector(s),dialog=$('#detail');let filter='all',onlySaved=false,saved=[];
try{const value=JSON.parse(localStorage.getItem('aftershock-favorites')||'[]');if(Array.isArray(value))saved=value.filter(id=>tools.some(t=>t.id===id))}catch{}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function categoryNames(t){return [...new Set([t.subject,...(t.categories||[])].filter(Boolean))]}
function gradeRank(t){const match=(t.grade||'').match(/([1-6])학년/);return match?Number(match[1]):0}
function selectTools(items,{category='all',grade='all',query='',onlySaved=false,saved=[]}={}){
 const q=query.trim().toLocaleLowerCase('ko');
 const list=items.filter(t=>(category==='all'||categoryNames(t).includes(category))&&(!onlySaved||saved.includes(t.id))&&(grade==='all'||t.allGrades===true||(t.grade||'').includes(grade))&&(!q||[t.name,t.summary,...categoryNames(t),t.topic||'',t.grade||'',t.purpose||''].join(' ').toLocaleLowerCase('ko').includes(q)));
 if(category!=='all')list.sort((a,b)=>gradeRank(a)-gradeRank(b));
 return list;
}
function metadata(t){return [...categoryNames(t),t.topic,t.grade].filter(Boolean).map((label,i)=>`${i?'<span aria-hidden="true">·</span>':''}<span${i===0?' class="subject"':''}>${escapeHTML(label)}</span>`).join('')}
function route(){const key=location.hash.slice(1),page=['tools','contact'].includes(key)?key:'home';document.querySelectorAll('main.page').forEach(el=>el.hidden=el.id!==page);document.querySelectorAll('nav a').forEach(el=>{el.classList.toggle('active',el.dataset.page===page);if(el.dataset.page===page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});if(dialog.open)dialog.close();if(key==='about')requestAnimationFrame(()=>$('#about').scrollIntoView());else window.scrollTo({top:0,behavior:'instant'});document.title=({home:'김여진의 수업 노트',tools:'만든 도구',contact:'함께하기'})[page]+' · aftersh0.0ck'}
function card(t,featured=false){
 const image=`<img src="${t.image}" alt="${escapeHTML(t.name)} 실제 화면" loading="lazy">`;
 const thumbnail=t.viewOnly?`<a class="tool-shot" href="${t.url}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(t.name)} 앱 둘러보기">${image}</a>`:`<button class="tool-shot" data-open="${t.id}" aria-label="${escapeHTML(t.name)} 소개 보기">${image}</button>`;
 const action=t.viewOnly?'앱 둘러보기':t.kind==='project'?'프로젝트 보기':'도구 사용하기';
 return `<article class="tool-card">${thumbnail}<button class="favorite" data-star="${t.id}" aria-label="${escapeHTML(t.name)} 모아두기" aria-pressed="${saved.includes(t.id)}"><svg class="favorite-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.67 6.26.91-4.53 4.42 1.07 6.24L12 17.3l-5.6 2.94 1.07-6.24L2.94 9.58l6.26-.91Z"/></svg></button><div class="card-body"><div class="card-meta">${metadata(t)}</div><h3>${escapeHTML(t.name)}</h3><p>${escapeHTML(t.summary)}</p><div class="card-actions"><a href="${t.url}" target="_blank" rel="noopener noreferrer">${action} ↗</a>${t.viewOnly?'':`<button data-open="${t.id}">${t.kind==='project'?'프로젝트 이야기 보기':'수업 이야기 보기'} →</button>`}</div>${featured?`<div class="featured-note">${t.id==='mixed-fraction-pizza'?'“왜 이렇게 약분하면 안 될까?”':'“어떻게 배열하는 게 좋을까?”'}</div>`:''}</div></article>`;
}
function render(){
 const list=selectTools(tools,{category:filter,grade:$('#grade').value,query:$('#search').value,onlySaved,saved});
 $('#cards').innerHTML=list.map(t=>card(t)).join('');
 $('#featured').innerHTML=['mixed-fraction-pizza','jangheung-fraction'].map(id=>card(tools.find(t=>t.id===id),true)).join('');
 $('#count').textContent=(onlySaved?'모아둔 도구':'도구')+' '+list.length+'개';$('#empty').hidden=list.length>0;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 $('#saved-filter').setAttribute('aria-pressed',String(onlySaved));
}
function showTool(id){
 const t=tools.find(t=>t.id===id);if(!t||t.viewOnly)return;
 const descriptionHeading=t.kind==='project'?'프로젝트 소개':'수업에서 돕고 싶은 것';
 const action=t.kind==='project'?'프로젝트 보기':'도구 사용하기';
 $('#detail-content').innerHTML=`<img class="detail-cover" src="${t.image}" alt="${escapeHTML(t.name)} 실제 화면"><div class="detail-body"><p class="eyebrow">${escapeHTML([...categoryNames(t),t.topic,t.grade].filter(Boolean).join(' · '))}</p><h2 id="detail-title">${escapeHTML(t.name)}</h2><p>${escapeHTML(t.summary)}</p>${t.purpose?`<h3>${descriptionHeading}</h3><p>${escapeHTML(t.purpose)}</p>`:''}${t.flow?.length?`<h3>이렇게 활용합니다</h3><ol class="detail-flow">${t.flow.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ol>`:''}${t.usageNote?`<h3>이용 안내</h3><p>${escapeHTML(t.usageNote)}</p>`:''}${t.technology?.length?`<p class="detail-tech">제작 도구 · ${t.technology.map(escapeHTML).join(' / ')}</p>`:''}<div class="detail-links"><a class="button primary" href="${t.url}" target="_blank" rel="noopener noreferrer">${action} ↗</a>${t.source?`<a class="quiet-link" href="${t.source}" target="_blank" rel="noopener noreferrer">${escapeHTML(t.sourceLabel||'블로그 원문')} ↗</a>`:''}</div></div>`;
 dialog.showModal();dialog.scrollTop=0;
}

document.addEventListener('click',e=>{const star=e.target.closest('[data-star]');if(star){const id=star.dataset.star;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];try{localStorage.setItem('aftershock-favorites',JSON.stringify(saved))}catch{}render();return}const internal=e.target.closest('a[href^="#"]');if(internal&&internal.getAttribute('href')===location.hash){e.preventDefault();route()}const open=e.target.closest('[data-open]');if(open)showTool(open.dataset.open)});
$('#search').addEventListener('input',render);$('#grade').addEventListener('change',render);document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});$('#saved-filter').onclick=()=>{onlySaved=!onlySaved;render()};$('#reset-filters').onclick=()=>{filter='all';onlySaved=false;$('#search').value='';$('#grade').value='all';render();$('#search').focus()};$('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
let noticeTimer;
document.querySelectorAll('[data-copy-email]').forEach(button=>button.onclick=async()=>{let message;try{await navigator.clipboard.writeText('duwlsey@gmail.com');message='이메일 주소를 복사했습니다.'}catch{message='duwlsey@gmail.com 주소를 직접 복사해 주세요.'}$('#copy-status').textContent=message;$('#site-notice').textContent=message;$('#site-notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#site-notice').hidden=true,2800)});
window.addEventListener('hashchange',route);render();route();

