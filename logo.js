/* Only the three punctuation pieces move; the approved letters stay still. */
(()=>{
const brand=document.querySelector('.brand'),parts=Object.fromEntries(['hook','dot','stem'].map(n=>[n,brand.querySelector(`[data-logo="${n}"]`)])),tilts=Object.fromEntries(['hook','stem'].map(n=>[n,brand.querySelector(`[data-tilt="${n}"]`)])),motion=matchMedia('(prefers-reduced-motion: reduce)'),key='aftershock-opening-gothic-v3';
let active=document.documentElement.classList.contains('logo-pending'),started=performance.now(),trace=[],sampleAt=-1;
const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
// Arrival, a single elastic rebound, then a small settling contact. Units are SVG units.
const keys=[[0,-160],[.43,0],[.60,5],[.76,-11],[.91,1.5],[1,0]];
function bounce(p,strength){p=clamp(p);let i=1;while(i<keys.length-1&&p>keys[i][0])i++;const a=keys[i-1],b=keys[i],k=smooth((p-a[0])/(b[0]-a[0]));const y=a[1]+(b[1]-a[1])*k;return p<.43?y:y*strength}
function paint(t){const starts={hook:0,dot:.40,stem:.80};for(const n of ['hook','dot','stem']){const local=t-starts[n];parts[n].style.visibility=active&&local<0?'hidden':'visible';parts[n].setAttribute('transform',`translate(0 ${active?bounce(local/.67,n==='dot'?.45:1):0})`)}const tilt=active?smooth((t-1.53)/.4):1;tilts.hook.setAttribute('transform',`rotate(${-15*tilt} 292.7797 35)`);tilts.stem.setAttribute('transform',`rotate(${17*tilt} 365.4197 35)`);brand.dataset.opening=String(active);brand.dataset.openingMs=String(Math.round(t*1000));if(active&&t-sampleAt>.025){sampleAt=t;trace.push({ms:Math.round(t*1000),hook:parts.hook.getAttribute('transform'),dot:parts.dot.getAttribute('transform'),stem:parts.stem.getAttribute('transform'),hookTilt:tilts.hook.getAttribute('transform'),stemTilt:tilts.stem.getAttribute('transform')})}brand.dataset.logoStage=!active?'complete':t<.4?'hook':t<.8?'dot':t<1.53?'stem':t<1.93?'tilt':'settled'}
function finish(){active=false;try{sessionStorage.setItem(key,'done')}catch{}document.documentElement.classList.remove('logo-pending');paint(2.15);brand.dataset.openingTrace=JSON.stringify(trace)}
window.logoOpening={get active(){return active},get elapsed(){return (performance.now()-started)/1700},finish,start(){if(motion.matches||document.body.classList.contains('reduce')){finish();return}started=performance.now();trace=[];sampleAt=-1;active=true;document.documentElement.classList.add('logo-pending');paint(0)}};
function tick(now){const t=(now-started)/1000;if(active&&t>=3.655)finish();else if(active)paint(t/1.7);requestAnimationFrame(tick)}
if(motion.matches||!active)finish();else paint(0);motion.addEventListener('change',e=>{if(e.matches)finish()});requestAnimationFrame(tick);
})();
