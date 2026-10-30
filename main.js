const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const bg=$('#bg'),mn=$('#menu');
bg.onclick=()=>{const o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.textContent=o?'✕':'☰'};
$$('#menu a').forEach(a=>a.onclick=()=>{mn.classList.remove('open');bg.setAttribute('aria-expanded',false);bg.textContent='☰'});
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}}),{threshold:.12});
$$('.rv-in').forEach(e=>io.observe(e));
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));
$$('#gal figure').forEach(f=>f.hidden=b.dataset.f!=='all'&&f.dataset.c!==b.dataset.f)});
const sc=$('#sc');$('#nx').onclick=()=>sc.scrollBy({left:350,behavior:'smooth'});$('#pv').onclick=()=>sc.scrollBy({left:-350,behavior:'smooth'});
const RESENAS=[/* Reseñas reales de Google, una por línea: {n:'Nombre',r:5,t:'Texto copiado de Google'}, */];
if(RESENAS.length){RESENAS.forEach(o=>{const a=document.createElement('article');a.className='rv';
const h=document.createElement('div');h.className='rh';const v=document.createElement('span');v.className='av';v.textContent=o.n.trim()[0].toUpperCase();
const m=document.createElement('div');const b=document.createElement('b');b.textContent=o.n;const g=document.createElement('span');g.className='tag';g.textContent='Reseña de Google';m.append(b,g);h.append(v,m);
const s=document.createElement('span');s.className='st';s.textContent='★'.repeat(o.r)+'☆'.repeat(5-o.r);
const p=document.createElement('p');p.textContent='“'+o.t+'”';a.append(h,s,p);sc.append(a)});
$('#rw').hidden=false;$('#rnote').hidden=true}
const lp=$$('.lp');
function leg(){const h=location.hash.slice(1);let o=false;lp.forEach(p=>{const on=p.id===h;p.hidden=!on;if(on){o=true;p.scrollTop=0;p.querySelector('button').focus()}});document.body.style.overflow=o?'hidden':''}
addEventListener('hashchange',leg);leg();
$$('.lp button').forEach(b=>b.onclick=()=>{history.replaceState(null,'',location.pathname+location.search);leg()});
addEventListener('keydown',e=>{const p=$('.lp:not([hidden])');if(e.key==='Escape'&&p)p.querySelector('button').click()});