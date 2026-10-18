// Poured Candle Bar concept. Status: "Hudson 2026 Summer Hours" as posted on pouredcandlebar.com (checked Oct 12, 2026), America/New_York.
// Preview: ?now=2026-10-16T18:00
(function(){
  var H={0:[660,1080],1:[720,1080],4:[720,1140],5:[720,1200],6:[660,1200]};
  var N=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var TEL=' Call to confirm: <a href="tel:+15183033878">(518) 303-3878</a>';
  function t(m){var h=Math.floor(m/60),mm=m%60;return (h%12||12)+(mm?':'+(mm<10?'0':'')+mm:'')+(h>=12?' PM':' AM');}
  function now(){var q=new URLSearchParams(location.search).get('now'),m=q&&q.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/);
    if(m)return {day:new Date(Date.UTC(+m[1],m[2]-1,+m[3])).getUTCDay(),min:+m[4]*60+ +m[5]};
    var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
    return {day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),min:(+p.hour%24)*60+ +p.minute};}
  // Neutral status only (posted hours are labeled summer hours, unconfirmed). Never red.
  function compute(n){var h=H[n.day];
    if(h)return {c:'neutral',t:'Posted hours today ('+N[n.day].slice(0,3)+'): '+t(h[0])+'–'+t(h[1])+' (listed as summer hours).'};
    return {c:'neutral',t:'Not on posted hours today ('+N[n.day].slice(0,3)+'; listed as summer hours).'};}
  var n=now(),r=compute(n),row=document.querySelector('[data-status]');
  if(row){row.querySelector('.dot').className='dot dot--'+r.c;row.querySelector('[data-text]').innerHTML=r.t+TEL;}
  var tr=document.querySelector('[data-hours] tr[data-day="'+n.day+'"]');if(tr){tr.classList.add('is-today');tr.querySelector('th').insertAdjacentHTML('beforeend',' <span class="tag">· today</span>');}
  window.__pcb={compute:compute};

  var root=document.documentElement;
  // chrome height (flag + sticky nav) so the first screen can be laid out above the fold
  function chrome(){var f=document.querySelector('.flag'),nv=document.querySelector('.nav'),fh=f?f.offsetHeight:0,nh=nv?nv.offsetHeight:0;
    root.style.setProperty('--chrome',(fh+nh)+'px');root.style.setProperty('--flag',fh+'px');root.style.setProperty('--navh',nh+'px');}
  chrome();addEventListener('resize',chrome);
  // One filled BOOK A POUR per screen: header/bar CTA shows only once the hero CTA has left the screen.
  function ctaOut(v){root.classList.toggle('cta-out',!!v);}
  var motion=/\bmotion\b/.test(root.className)&&window.gsap&&window.ScrollTrigger;
  if(!motion){
    root.classList.remove('motion');
    var hb=document.querySelector('.cap--hero .btns');
    if(hb&&'IntersectionObserver' in window)new IntersectionObserver(function(es){ctaOut(!es[0].isIntersecting);}).observe(hb);else ctaOut(true);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var mobile=window.matchMedia('(max-width:899px)').matches;
  // Tiers (2x upscales of the 720p clips): m = 1080x1440 portrait crop for phones,
  // d = 1920x1080, x = 2560x1440 for large or high-DPR desktop screens. Picked from canvas CSS size x DPR.
  // Each tier has a light preview ladder (mq 360x480 / dq 480x270, every 3rd frame) that lands first on slow links;
  // the sharp frame replaces it as soon as it arrives.
  var FV='6',TIERS=[{k:'d',h:1080},{k:'x',h:1440}],STEP=3;
  function cap(){return Math.min(window.devicePixelRatio||1,2);}

  // ---------- Film engine: canvas WebP sequences ----------
  // One clock: the frame index comes only from the pinned timeline's progress, so reverse scrolling restores the same frame.
  // Drawing always uses the nearest frame on hand (sharp preferred, preview if it is much closer); the poster sits under the canvas.
  // Nothing is requested before the first scroll; then a single shared queue fetches what is closest to the reader first.
  function Film(sec){
    this.sec=sec;this.box=sec.parentElement.classList.contains('pin-spacer')?sec.parentElement:sec;
    this.n=+sec.dataset.frames;this.name=sec.dataset.film;
    this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=sec.querySelector('.film__poster');
    this.cur=0;this.dir=1;this.shown=false;this.set=null;this.gen=0;this.reset();this.size();
  }
  Film.prototype.reset=function(){this.gen++;var n=this.n;this.full=new Array(n);this.lq=new Array(n);this.ok=new Uint8Array(n);this.lok=new Uint8Array(n);
    this.req=new Uint8Array(n);this.lreq=new Uint8Array(n);this.drawn=-1;this.drawnQ='';};
  Film.prototype.pick=function(){if(mobile)return 'm';var c=this.cv,need=Math.max((c.clientWidth||innerWidth)*cap()/16*9,(c.clientHeight||innerHeight)*cap()),t=TIERS[0];
    for(var i=0;i<TIERS.length;i++){t=TIERS[i];if(t.h>=need*.9)break;}return t.k;};
  Film.prototype.isL=function(i){return i%STEP===0||i===this.n-1;};
  // sharp frames are AVIF where supported (decoded from an inline 1-pixel test, no request), WebP otherwise; previews stay WebP
  var EXT='webp',avifReady=new Promise(function(res){var t=new Image();t.onload=function(){res(t.width>0);};t.onerror=function(){res(false);};t.src='data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIgAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAgAAAAIAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKm1kYXQSAAoIGAA2iAhoNCAyFBlHh4Yhh5555oAAAJBAyRxhQoFI';}).then(function(a){if(a)EXT='avif';});
  Film.prototype.src=function(i,lq){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+(lq?(this.set==='m'?'mq':'dq'):this.set)+'/'+s+(lq?'.webp':'.'+EXT)+'?v='+FV;};
  Film.prototype.size=function(){var d=cap(),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
    var t=this.pick();if(t!==this.set){var had=this.set;this.set=t;if(had){this.reset();this.seed();pump();}}
    this.draw(this.cur,true);};
  // the hero poster is frame 1 (already on screen for LCP), so it seeds the canvas without any frame request
  Film.prototype.seed=function(){if(this.name!=='hero'||!this.poster)return;var self=this,im=this.poster,g=this.gen;
    function use(){if(g!==self.gen||!im.naturalWidth)return;self.lq[0]=im;self.lok[0]=1;self.draw(self.cur,true);}
    if(im.complete)use();else im.addEventListener('load',use);};
  // distance in screens from the viewport (0 = on screen or pinned)
  Film.prototype.away=function(){var r=this.box.getBoundingClientRect(),h=innerHeight;return r.top>h?(r.top-h)/h:r.bottom<0?-r.bottom/h:0;};
  Film.prototype.state=function(){var im=this.drawnQ==='full'?this.full[this.drawn]:this.lq[this.drawn];
    return {name:this.name,set:this.set,n:this.n,cur:this.cur,drawn:this.drawn,drawnQ:this.drawnQ,loaded:this.ok.reduce(function(a,b){return a+b;},0),
      previews:this.lok.reduce(function(a,b){return a+b;},0),requested:this.req.reduce(function(a,b){return a+b;},0)+this.lreq.reduce(function(a,b){return a+b;},0),
      cw:this.cv.width,ch:this.cv.height,src:im?im.naturalWidth+'x'+im.naturalHeight:null};};
  Film.prototype.draw=function(f,force){f=Math.max(0,Math.min(this.n-1,Math.round(f)));if(f===this.cur&&!force)return;
    var now=Date.now();if(f!==this.cur){var dt=(now-(this.t0||now))/1000;if(dt>0)this.v=(this.v||0)*.5+Math.min(Math.abs(f-this.cur)/dt,240)*.5;this.t0=now;this.dir=f>this.cur?1:-1;}this.cur=f;
    // nearest sharp frame vs nearest preview; a preview wins only when it is 2+ frames closer
    var bf=-1,bl=-1,d;for(d=0;d<this.n&&(bf<0||bl<0);d++){
      if(bf<0){if(f-d>=0&&this.ok[f-d])bf=f-d;else if(f+d<this.n&&this.ok[f+d])bf=f+d;}
      if(bl<0){if(f-d>=0&&this.lok[f-d])bl=f-d;else if(f+d<this.n&&this.lok[f+d])bl=f+d;}}
    var at=-1,q='';if(bf>=0&&(bl<0||Math.abs(bf-f)<=Math.abs(bl-f)+1.5)){at=bf;q='full';}else if(bl>=0){at=bl;q='lq';}
    if(at<0||(at===this.drawn&&q===this.drawnQ&&!force))return;
    var im=q==='full'?this.full[at]:this.lq[at];var c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.drawn=at;this.drawnQ=q;
    if(!this.shown){this.shown=true;gsap.to(this.poster,{autoAlpha:0,duration:.4});}
    pump();};
  // best next request for this film: previews first (closest to the reader), then sharp frames ahead of the scroll direction
  // lead: how far the reader will have scrubbed by the time a request lands (~0.3 s at the current scrub speed), so fast
  // scrubbing fetches where the frame index is going, not frames it is about to pass
  function score(t,lead){return t<0?1000-t:(t<lead?(lead-t)*1.5:t-lead);}
  Film.prototype.next=function(){var n=this.n,c=this.cur,dir=this.dir,best=-1,bd=1e9,lq=false,i,d,
      lead=Date.now()-(this.t0||0)>400?0:Math.min((this.v||0)*.3,15);
    for(i=0;i<n;i++){if(this.isL(i)&&!this.lreq[i]&&!this.ok[i]){d=score((i-c)*dir,lead);if(d<bd){bd=d;best=i;lq=true;}}}
    if(best>=0)return {i:best,lq:true,p:bd};
    for(i=0;i<n;i++){if(!this.req[i]){d=score((i-c)*dir,lead);if(d<bd){bd=d;best=i;}}}
    return best>=0?{i:best,lq:false,p:1000+bd}:null;};
  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(s){return new Film(s);});
  window.__pcbFilms=films;
  var started=false,live=0,MAX=4,NEAR=2.5;
  function fetchOne(f,i,lq){var g=f.gen;live++;(lq?f.lreq:f.req)[i]=1;var im=new Image();im.decoding='async';
    function done(okk){live--;if(g===f.gen){if(okk){if(lq){f.lq[i]=im;f.lok[i]=1;}else{f.full[i]=im;f.ok[i]=1;}if(Math.abs(i-f.cur)<=8)f.draw(f.cur,true);}}pump();}
    im.onload=function(){(im.decode?im.decode():Promise.resolve()).then(function(){done(true);},function(){done(true);});};
    im.onerror=function(){done(false);};// a failed frame is not retried; drawing falls back to its neighbours and the poster
    im.src=f.src(i,lq);}
  var pumping=false;
  function pump(){if(!started||pumping)return;pumping=true;
    for(;;){var best=null,bp=1e18;
      for(var k=0;k<films.length;k++){var f=films[k],a=f.away();if(a>NEAR)continue;var c=f.next();if(!c)continue;
        // previews of every nearby film outrank sharp frames; within a class, the film closest to the reader wins
        var p=(c.lq?0:1e6)+a*1e4+c.p;if(p<bp){bp=p;best={f:f,c:c};}}
      // previews go three at a time so the next one lands fast on a slow link; sharp frames use more parallel requests
      if(!best||live>=(best.c.lq?3:MAX))break;fetchOne(best.f,best.c.i,best.c.lq);}
    pumping=false;}
  films.forEach(function(f){f.seed();});
  // no frame requests until the reader scrolls
  function go(){if(started)return;started=true;['scroll','wheel','touchmove','keydown'].forEach(function(e){removeEventListener(e,go);});avifReady.then(pump);}
  ['scroll','wheel','touchmove','keydown'].forEach(function(e){addEventListener(e,go,{passive:true});});
  var sq=0;addEventListener('scroll',function(){if(sq)return;sq=requestAnimationFrame(function(){sq=0;pump();});},{passive:true});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});},120);});

  // crisp caption beats: opacity + short rise, no blur; fully opaque at rest
  function capIn(tl,el,at){tl.fromTo(el,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},at);}
  // explicit from-values: the scrubbed timeline never captures a pre-reveal (hidden) state, so reverse always restores opacity 1
  function capOut(tl,el,at){tl.fromTo(el,{autoAlpha:1,y:0},{autoAlpha:0,y:-20,duration:.5,ease:'power2.in',immediateRender:false},at);}

  films.forEach(function(f){
    var caps=[].slice.call(f.sec.querySelectorAll('.cap')),isHero=f.name==='hero',o={f:0};
    var len=isHero?520:f.name==='pour'?280:240;
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:f.sec,start:'top top',end:'+='+len+'%',pin:true,pinSpacer:f.sec.parentElement.classList.contains('pin-spacer')?f.sec.parentElement:undefined,scrub:.5,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(st){f.draw(o.f);if(isHero)ctaOut(st.progress>.12);}, onLeave:function(){if(isHero)ctaOut(true);}, onEnterBack:function(st){if(isHero)ctaOut(st.progress>.12);}}});
    // hero: the first steps through the door are slower (8 frames over the first fifth of the pin), which also gives the
    // preview ladder a head start after the first scroll; the rest of the walk-in and the side pan run at an even pace
    if(isHero){tl.to(o,{f:8,duration:2,onUpdate:function(){f.draw(o.f);}},0);tl.to(o,{f:f.n-1,duration:8,onUpdate:function(){f.draw(o.f);}},2);}
    else tl.to(o,{f:f.n-1,duration:10,onUpdate:function(){f.draw(o.f);}},0);
    if(isHero){
      capOut(tl,caps[0],1.35);capIn(tl,caps[1],3.8);// frames 1–68 walk in to the bar, 69–111 side pan to the real shelf
    }else if(f.name==='pour'){
      var st=[].slice.call(f.sec.querySelectorAll('.steps--film .step'));
      if(mobile){tl.set(caps[0],{autoAlpha:1},0);gsap.set(caps[0],{autoAlpha:1});tl.set(st[1],{autoAlpha:0},0);capOut(tl,st[0],5.6);capIn(tl,st[1],6.2);}
      else{capIn(tl,caps[0],.8);tl.fromTo(st[1],{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},4.6);}
      // resolve the exit: after the finished candle has held, the footage settles into the dark page (same clock, reversible),
      // so the pin never releases on a cropped bright jar arc
      tl.to(f.sec.querySelector('.film__stage'),{opacity:.18,duration:1.4,ease:'power1.inOut'},10.4);
      tl.to(f.sec.querySelector('.film__label'),{opacity:0,duration:.6},10.9);
    }else{
      capIn(tl,caps[0],5.5);
    }
  });

  // ---------- Section choreography (crisp: transform + opacity only, no blur) ----------
  function split(el){var tmp=document.createElement('div');tmp.innerHTML=el.innerHTML;
    function walk(node,out){[].forEach.call(node.childNodes,function(c){if(c.nodeType===3){c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){out.appendChild(document.createTextNode(' '));return;}
        var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=p;w.appendChild(s);out.appendChild(w);});}
      else{var cl=c.cloneNode(false);out.appendChild(cl);walk(c,cl);}});}
    var frag=document.createElement('div');walk(tmp,frag);el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());el.innerHTML=frag.innerHTML;
    [].forEach.call(el.querySelectorAll('.w'),function(w){w.setAttribute('aria-hidden','true');});
    return el.querySelectorAll('.w>span');}
  [].forEach.call(document.querySelectorAll('.lines'),function(el){if(el.id==='hero-h')return;var ws=split(el);
    gsap.from(ws,{yPercent:110,duration:.8,ease:'expo.out',stagger:.04,scrollTrigger:{trigger:el,start:'top 85%',once:true}});});

  gsap.utils.toArray('.rv').forEach(function(el){gsap.from(el,{y:24,autoAlpha:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});});
  // hero copy and CTA are never hidden: they paint with the first frame (fonts swap in on metric-matched fallbacks)
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){root.classList.add('fonts-in');});else root.classList.add('fonts-in');
  // steps slide in from alternating sides, then their rule sweeps across
  var steps=gsap.utils.toArray('.how .step');
  var stl=gsap.timeline({scrollTrigger:{trigger:'.how .steps',start:'top 80%',once:true}});
  steps.forEach(function(s,i){var l=s.dataset.from==='left';
    stl.from(s,{x:l?-60:60,autoAlpha:0,duration:.8,ease:'expo.out'},i*.12)
       .fromTo(s,{'--s':0},{'--s':1,duration:.6,ease:'power2.inOut'},i*.12+.3)
       .from(s.children,{y:14,autoAlpha:0,duration:.5,stagger:.07,ease:'power2.out'},i*.12+.25);});
  // film step rules sweep in with the scrub (reversible, same clock)
  // menu rows sweep in from both sides
  gsap.utils.toArray('.menu li').forEach(function(li,i){gsap.from(li,{x:li.dataset.from==='left'?-48:48,autoAlpha:0,duration:.8,ease:'expo.out',delay:i*.07,
    scrollTrigger:{trigger:li,start:'top 90%',once:true}});});
  // photos: soft iris reveal + gentle parallax drift (scale 1.06 keeps the drift inside the frame)
  gsap.utils.toArray('.par').forEach(function(el){var img=el.querySelector('img');
    gsap.fromTo(el,{clipPath:'inset(12% 12% 12% 12% round 6px)',autoAlpha:0},{clipPath:'inset(0% 0% 0% 0% round 6px)',autoAlpha:1,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    gsap.fromTo(img,{yPercent:-(+el.dataset.speed||8)/3,scale:1.06},{yPercent:(+el.dataset.speed||8)/3,scale:1.06,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});});
  // hours rows stagger
  gsap.from('.hours tr',{x:32,autoAlpha:0,duration:.6,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'.hours',start:'top 85%',once:true}});
  addEventListener('load',function(){chrome();ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){chrome();ScrollTrigger.refresh();});
})();
