const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const bg=$('#bg'),mn=$('#menu');
bg.onclick=()=>{const o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.textContent=o?'✕':'☰'};
$$('#menu a').forEach(a=>a.onclick=()=>{mn.classList.remove('open');bg.setAttribute('aria-expanded',false);bg.textContent='☰'});
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}}),{threshold:.12});
$$('.rv-in').forEach(e=>io.observe(e));
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));
$$('#gal figure').forEach(f=>f.hidden=b.dataset.f!=='all'&&f.dataset.c!==b.dataset.f)});
const sc=$('#sc');$('#nx').onclick=()=>sc.scrollBy({left:350,behavior:'smooth'});$('#pv').onclick=()=>sc.scrollBy({left:-350,behavior:'smooth'});
function add(n,r,t){const a=document.createElement('article');a.className='rv m';
const s=document.createElement('span');s.className='st';s.textContent='★'.repeat(r)+'☆'.repeat(5-r);
const p=document.createElement('p');p.textContent='“'+t+'”';
const m=document.createElement('span');m.className='n';m.textContent=n;
const g=document.createElement('span');g.className='tag';g.textContent='Opinión enviada desde esta página';
a.append(s,p,m,g);$('#mine').prepend(a)}
try{JSON.parse(localStorage.getItem('belart-op')||'[]').forEach(o=>add(o.n,o.r,o.t))}catch(e){}
$('#fr').onsubmit=e=>{e.preventDefault();const n=$('#nm').value.trim(),t=$('#tx').value.trim(),c=document.querySelector('input[name=r]:checked'),N=$('#note');
if(!n||!t||!c){N.textContent='Por favor completa tu nombre, la puntuación y tu opinión.';return}
add(n,+c.value,t);
try{const l=JSON.parse(localStorage.getItem('belart-op')||'[]');l.push({n,r:+c.value,t});localStorage.setItem('belart-op',JSON.stringify(l))}catch(e){}
N.textContent='Gracias por tu opinión. Por ahora esta página no la guarda de forma permanente: solo se muestra en este navegador.';e.target.reset()};