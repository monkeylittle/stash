const t=document.querySelector('.nav-toggle'),n=document.querySelector('.nav');
t&&t.addEventListener('click',()=>{const o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)});
const lb=document.querySelector('.lightbox');
if(lb){
const links=[...document.querySelectorAll('.masonry a')],
 img=lb.querySelector('.lb-stage img'),cap=lb.querySelector('.lb-cap'),strip=lb.querySelector('.lb-strip'),
 prev=lb.querySelector('.lb-prev'),next=lb.querySelector('.lb-next');
let cur=0;
// Thumbnails are built on first open (and use small data-thumb files), so merely loading
// the page doesn't fetch a second copy of every photo.
let thumbs=null;
function build(){
 thumbs=links.map((a,i)=>{
  const th=a.querySelector('img'),b=document.createElement('button');
  b.type='button';b.className='lb-thumb';b.setAttribute('aria-label','Photo '+(i+1)+' of '+links.length);
  const t=document.createElement('img');t.src=a.dataset.thumb||(th&&th.src)||a.href;t.alt='';t.loading='lazy';b.appendChild(t);
  b.addEventListener('click',()=>show(i));strip.appendChild(b);return b})}
function show(i){
 cur=(i+links.length)%links.length;
 const a=links[cur],th=a.querySelector('img');
 img.src=a.href;img.alt=th?th.alt:'';
 cap.textContent=(a.dataset.caption||'')+(links.length>1?(a.dataset.caption?'  ·  ':'')+(cur+1)+' / '+links.length:'');
 if(a.dataset.credit){const c=document.createElement('span');c.className='lb-credit';
  if(a.dataset.creditUrl){const l=document.createElement('a');l.href=a.dataset.creditUrl;l.target='_blank';l.rel='noopener noreferrer';l.textContent=a.dataset.credit;c.appendChild(l)}else c.textContent=a.dataset.credit;
  cap.appendChild(c)}
 thumbs.forEach((b,k)=>{b.classList.toggle('on',k===cur);b.setAttribute('aria-current',k===cur?'true':'false')});
 thumbs[cur].scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}
function open(i){if(!thumbs)build();lb.hidden=false;document.body.style.overflow='hidden';show(i)}
function close(){lb.hidden=true;document.body.style.overflow='';img.removeAttribute('src')}
links.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();open(i)}));
if(links.length<2){prev.hidden=next.hidden=true;strip.hidden=true}
prev.addEventListener('click',()=>show(cur-1));
next.addEventListener('click',()=>show(cur+1));
lb.querySelector('.lb-close').addEventListener('click',close);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-stage'))close()});
document.addEventListener('keydown',e=>{if(lb.hidden)return;
 if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1)});
let x0=null;
lb.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))});
}
// YouTube videos/Shorts: the player (and any Google request) loads only when tapped.
document.querySelectorAll('.yt-play').forEach(b=>b.addEventListener('click',()=>{
 const f=document.createElement('iframe');
 f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&playsinline=1&rel=0&controls=0';
 f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.title=b.getAttribute('aria-label').replace('Play video: ','');
 const w=document.createElement('div');w.className='yt-play on';w.appendChild(f);b.replaceWith(w)}));
