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
    root.style.setProperty('--chrome',(fh+nh)+'px');root.style.setProperty('--dpr',String(window.devicePixelRatio||1));root.style.setProperty('--flag',fh+'px');root.style.setProperty('--navh',nh+'px');}
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
  // One native tier: n = 1280x720, straight from the 720p clips and 1:1 windows of the shop's photos (nothing upscaled).
  // The canvas sits in a hard-edged 16:9 frame never wider than 1280 device pixels, so frames draw at 1.0x or less.
  // Light preview ladders (nq 640x360 every 3rd frame, nt 320x180 every 6th) land first on slow links.
  var FV='13',STEP=3;
  function cap(){return Math.min(window.devicePixelRatio||1,2);}

  // ---------- Film engine: canvas WebP sequences ----------
  // One clock: the frame index comes only from the pinned timeline's progress, so reverse scrolling restores the same frame.
  // Drawing always uses the nearest frame on hand (sharp preferred, preview if it is much closer); the poster sits under the canvas.
  // Nothing is requested before the first scroll; then a single shared queue fetches what is closest to the reader first.
  function Film(sec){
    this.sec=sec;this.box=sec.parentElement.classList.contains('pin-spacer')?sec.parentElement:sec;
    this.n=+sec.dataset.frames;this.name=sec.dataset.film;
    this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=sec.querySelector('.film__poster');
    this.cur=0;this.pf=0;this.dir=1;this.shown=false;this.set=null;this.gen=0;this.dipA=-1;this.hold=false;
    // shot changes (data-cuts = 0-based first frame of each new shot) pass behind a solid panel that wipes across the frame
    // with a hard edge, driven by the scroll position, so it reverses exactly. No fades, no dimmed frames.
    var n=this.n,self=this;this.dip=sec.querySelector('.film__dip');this.key={};this.bounds=[];
    (sec.dataset.cuts||'').split(',').forEach(function(x){if(!x)return;var i=+x;self.bounds.push(i);[i-3,i-1,i,i+3].forEach(function(k){if(k>=0&&k<n)self.key[k]=1;});});
    // real-photo frames (1-based ranges, e.g. "1-5,85-100") get the photo label instead of the AI one
    this.photo=(sec.dataset.photo||'').split(',').filter(Boolean).map(function(r){var ab=r.split('-');return [+ab[0]-1,+(ab[1]||ab[0])-1];});if(!this.photo.length)this.photo=0;this.label=sec.parentElement.querySelector('.film__label')||sec.querySelector('.film__label');this.isPhoto=false;
    this.inflight={};this.reset();this.size();
  }
  // first and last frame of the shot that frame f belongs to
  Film.prototype.shot=function(f){var lo=0,hi=this.n-1,b=this.bounds;for(var q=0;q<b.length;q++){if(b[q]<=f)lo=b[q];if(b[q]>=f){hi=b[q];break;}}return [lo,hi];};
  // wipe state: -1..1 across each cut (W frames either side). The panel enters from the left edge, covers the frame at the
  // cut, and exits off the right edge; a frame that is not on hand yet keeps the panel closed (hold).
  var WW=2.5;
  Film.prototype.setDip=function(){if(!this.dip)return;var pf=this.pf,b=this.bounds,u=null;
    for(var q=0;q<b.length;q++){var d=(pf-(b[q]-.5))/WW;if(d>-1&&d<1){u=d;break;}}
    var L=100,Rr=100;// inset left/right in %: 100/0 = hidden at left, 0/0 = covering, 0/100 = gone at right
    if(this.hold){L=0;Rr=0;}else if(u!==null){if(u<0){L=0;Rr=Math.round(-u*1000)/10;}else{Rr=0;L=Math.round(u*1000)/10;}}else{L=0;Rr=100;}
    var key=L+'/'+Rr;if(key!==this.dipA){this.dipA=key;this.dip.style.clipPath=(L===0&&Rr===100)?'inset(0 100% 0 0)':'inset(0 '+Rr+'% 0 '+L+'%)';}};
  Film.prototype.reset=function(){this.gen++;var n=this.n;this.full=new Array(n);this.lq=new Array(n);this.ok=new Uint8Array(n);this.lok=new Uint8Array(n);
    this.req=new Uint8Array(n);this.lreq=new Uint8Array(n);this.tq=new Array(n);this.tok=new Uint8Array(n);this.treq=new Uint8Array(n);this.drawn=-1;this.drawnQ='';};
  Film.prototype.pick=function(){return 'n';};
  Film.prototype.isT=function(i){return i%(STEP*2)===0||i===this.n-1||!!this.key[i];};
  Film.prototype.isL=function(i){return i%STEP===0||i===this.n-1||!!this.key[i];};
  // sharp frames are AVIF where supported (decoded from an inline 1-pixel test, no request), WebP otherwise; previews stay WebP
  var EXT='webp',avifReady=new Promise(function(res){var t=new Image();t.onload=function(){res(t.width>0);};t.onerror=function(){res(false);};t.src='data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIgAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAgAAAAIAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKm1kYXQSAAoIGAA2iAhoNCAyFBlHh4Yhh5555oAAAJBAyRxhQoFI';}).then(function(a){if(a)EXT='avif';});
  Film.prototype.src=function(i,lq){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+(lq?(lq===2?'nt':'nq'):this.set)+'/'+s+(lq?'.webp':'.'+EXT)+'?v='+FV;};
  Film.prototype.size=function(){root.style.setProperty('--dpr',String(window.devicePixelRatio||1));var d=cap(),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
    var t=this.pick();if(t!==this.set){var had=this.set;this.set=t;if(had){this.reset();this.seed();pump();}}
    this.draw(this.cur,true);};
  // the hero poster is frame 1 (already on screen for LCP), so it seeds the canvas without any frame request
  Film.prototype.seed=function(){if(this.name!=='hero'||!this.poster)return;var self=this,im=this.poster,g=this.gen;
    function use(){if(g!==self.gen||!im.naturalWidth)return;self.lq[0]=im;self.lok[0]=1;self.draw(self.cur,true);}
    if(im.complete)use();else im.addEventListener('load',use);};
  // distance in screens from the viewport (0 = on screen or pinned)
  Film.prototype.away=function(){var r=this.box.getBoundingClientRect(),h=innerHeight;return r.top>h?(r.top-h)/h:r.bottom<0?-r.bottom/h:0;};
  Film.prototype.state=function(){var im=this.drawnQ==='full'?this.full[this.drawn]:this.drawnQ==='t'?this.tq[this.drawn]:this.lq[this.drawn];
    return {name:this.name,set:this.set,n:this.n,cur:this.cur,dip:this.dipA,hold:this.hold,drawn:this.drawn,drawnQ:this.drawnQ,loaded:this.ok.reduce(function(a,b){return a+b;},0),
      previews:this.lok.reduce(function(a,b){return a+b;},0),requested:this.req.reduce(function(a,b){return a+b;},0)+this.lreq.reduce(function(a,b){return a+b;},0),
      cw:this.cv.width,ch:this.cv.height,src:im?im.naturalWidth+'x'+im.naturalHeight:null};};
  Film.prototype.draw=function(f,force){this.pf=Math.max(0,Math.min(this.n-1,+f||0));f=Math.round(this.pf);
    // real-photo stretches (the pour's opening tray shot, the hero's closing pan) are labelled as their photo, and switch back on reverse
    if(this.photo&&this.label){var ph=this.photo.some(function(r){return f>=r[0]&&f<=r[1];});if(ph!==this.isPhoto){this.isPhoto=ph;this.label.classList.toggle('is-photo',ph);}}
    this.setDip();if(f===this.cur&&!force)return;
    var now=Date.now();if(f!==this.cur){var dt=(now-(this.t0||now))/1000;if(dt>0)this.v=(this.v||0)*.5+Math.min(Math.abs(f-this.cur)/dt,240)*.5;this.t0=now;this.dir=f>this.cur?1:-1;}this.cur=f;
    // nearest sharp frame vs nearest preview; a preview wins only when it is 2+ frames closer
    // only frames from the same shot are candidates, so a missing frame never shows another scene
    var sh=this.shot(f),lo=sh[0],hi=sh[1],bf=-1,bl=-1,d;for(d=0;(f-d>=lo||f+d<=hi)&&(bf<0||bl<0);d++){
      if(bf<0){if(f-d>=lo&&this.ok[f-d])bf=f-d;else if(f+d<=hi&&this.ok[f+d])bf=f+d;}
      if(bl<0){if(f-d>=lo&&this.lok[f-d])bl=f-d;else if(f+d<=hi&&this.lok[f+d])bl=f+d;}}
    var bt=-1;for(d=0;bt<0&&(f-d>=lo||f+d<=hi)&&d<=Math.abs((bl>=0?bl:bf>=0?bf:f+1e3)-f);d++){if(f-d>=lo&&this.tok[f-d])bt=f-d;else if(f+d<=hi&&this.tok[f+d])bt=f+d;}
    // requests the reader has already scrolled well past are dropped so the link serves the frames around them now
    for(var k in this.inflight){var r=this.inflight[k];if((k-f)*this.dir<-6)r();}
    var D=function(x){return x<0?1e9:Math.abs(x-f);},at=-1,q='';
    // sharp unless a preview is 2+ frames closer; a micro preview (quick flicks only) wins only when it is 2+ frames closer still
    if(bf>=0&&D(bf)<=Math.min(D(bl),D(bt))+1.5){at=bf;q='full';}else if(bl>=0&&D(bl)<=D(bt)+1.5){at=bl;q='lq';}else if(bt>=0){at=bt;q='t';}
    var hold=at<0&&this.drawn>=0&&(this.drawn<lo||this.drawn>hi);if(hold!==this.hold){this.hold=hold;this.setDip();}
    if(at<0||(at===this.drawn&&q===this.drawnQ&&!force))return;
    var im=q==='full'?this.full[at]:q==='t'?this.tq[at]:this.lq[at];var c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.drawn=at;this.drawnQ=q;this.setDip();
    if(!this.shown){this.shown=true;gsap.set(this.poster,{autoAlpha:0});}
    pump();};
  // best next request for this film: previews first (closest to the reader), then sharp frames ahead of the scroll direction
  // lead: how far the reader will have scrubbed by the time a request lands (~0.3 s at the current scrub speed), so fast
  // scrubbing fetches where the frame index is going, not frames it is about to pass
  function score(t,lead){return t<0?1000-t:(t<lead?(lead-t)*1.5:t-lead);}
  Film.prototype.next=function(){var n=this.n,c=this.cur,dir=this.dir,best=-1,bd=1e9,lq=false,i,d,
      lead=Date.now()-(this.t0||0)>400?0:Math.min((this.v||0)*.3,15);
    // quick flick: the micro ladder (every 6th frame, ~5 KB) around where the reader is heading comes first
    if((this.v||0)>25&&lead>0){for(i=0;i<n;i++){var t=(i-c)*dir;if(t>=0&&t<=lead+12&&this.isT(i)&&!this.treq[i]&&!this.tok[i]&&!this.lok[i]&&!this.ok[i]&&!this.lreq[i]){d=score(t,lead);if(d<bd){bd=d;best=i;}}}
      if(best>=0)return {i:best,lq:2,p:bd-100};}
    for(i=0;i<n;i++){if(this.isL(i)&&!this.lreq[i]&&!this.ok[i]){d=score((i-c)*dir,lead);if(this.key[i]&&(i-c)*dir>=0)d=Math.min(d,d*.25+1);if(d<bd){bd=d;best=i;lq=true;}}}
    if(best>=0)return {i:best,lq:true,p:bd};
    for(i=0;i<n;i++){if(!this.req[i]){d=score((i-c)*dir,lead);if(d<bd){bd=d;best=i;}}}
    return best>=0?{i:best,lq:false,p:1000+bd}:null;};
  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(s){return new Film(s);});
  window.__pcbFilms=films;
  var started=false,live=0,MAX=4,NEAR=2.5;
  function fetchOne(f,i,lq){var g=f.gen,fin=false;live++;var RQ=lq===2?f.treq:lq?f.lreq:f.req;RQ[i]=1;var im=new Image();im.decoding='async';
    // abort: frees the slot and lets the frame be asked for again later
    if(lq)f.inflight[i]=function(){if(fin)return;fin=true;delete f.inflight[i];im.onload=im.onerror=null;im.src='';live--;RQ[i]=0;};
    function done(okk){if(fin)return;fin=true;if(lq)delete f.inflight[i];live--;if(g===f.gen){if(okk){if(lq===2){f.tq[i]=im;f.tok[i]=1;}else if(lq){f.lq[i]=im;f.lok[i]=1;}else{f.full[i]=im;f.ok[i]=1;}if(Math.abs(i-f.cur)<=8)f.draw(f.cur,true);}}pump();}
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

  // caption beats: a hard-edged wipe opens the panel left to right, then its words rise through a line mask in sequence;
  // the exit wipes it shut upward. Explicit from-values so reverse scrubbing restores every state exactly.
  function wordsOf(el){var big=el.querySelectorAll('.cap__big');[].forEach.call(big,function(b){if(!b.querySelector('.w'))split(b);});return el.querySelectorAll('.cap__big .w>span');}
  function capIn(tl,el,at){var ws=wordsOf(el);tl.set(el,{autoAlpha:1},at);
    tl.fromTo(el,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power4.inOut',immediateRender:false},at);
    if(ws.length)tl.fromTo(ws,{yPercent:110},{yPercent:0,duration:.45,stagger:.06,ease:'power3.out',immediateRender:false},at+.2);}
  function capOut(tl,el,at){tl.fromTo(el,{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 0% 100% 0%)',duration:.5,ease:'power3.in',immediateRender:false},at);tl.set(el,{autoAlpha:0},at+.5);}

  // the bar's BOOK A POUR fills only once the hero's own (filled) CTA has faded below half opacity: never two at once
  function heroGone(cap,st){return st.progress>.3||+gsap.getProperty(cap,'opacity')<.5||getComputedStyle(cap).visibility==='hidden';}
  films.forEach(function(f){
    var caps=[].slice.call(f.sec.querySelectorAll('.cap')),isHero=f.name==='hero',o={f:0};
    var len=isHero?480:f.name==='pour'?280:240;
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:f.sec,start:'top top',end:'+='+len+'%',pin:true,pinSpacer:f.sec.parentElement.classList.contains('pin-spacer')?f.sec.parentElement:undefined,scrub:.5,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(st){f.draw(o.f);if(isHero)ctaOut(heroGone(caps[0],st));}, onLeave:function(){if(isHero)ctaOut(true);}, onEnterBack:function(st){if(isHero)ctaOut(heroGone(caps[0],st));}}});
    // hero: the first steps through the door are slower (8 frames over the first fifth of the pin), which also gives the
    // preview ladder a head start after the first scroll; the rest of the walk-in and the side pan run at an even pace
    if(isHero){tl.to(o,{f:8,duration:2,onUpdate:function(){f.draw(o.f);}},0);tl.to(o,{f:f.n-1,duration:8,onUpdate:function(){f.draw(o.f);}},2);}
    else tl.to(o,{f:f.n-1,duration:10,onUpdate:function(){f.draw(o.f);}},0);
    if(isHero){
      capOut(tl,caps[0],1.35);capIn(tl,caps[1],3.8);// frames 1–68 walk in to the bar, 69–111 side pan to the real shelf
    }else if(f.name==='pour'){
      var st=[].slice.call(f.sec.querySelectorAll('.steps--film .step'));
      if(mobile){tl.set(caps[0],{autoAlpha:1},0);gsap.set(caps[0],{autoAlpha:1});tl.set(st[1],{autoAlpha:0},0);capOut(tl,st[0],5.6);capIn(tl,st[1],6.2);}
      else{capIn(tl,caps[0],.8);tl.set(st[1],{autoAlpha:0},0);capIn(tl,st[1],4.6);}
      // exit: after the finished candle has held, the frame wipes shut from the top with a hard edge (same clock, reversible)
      tl.fromTo(f.sec.querySelector('.film__frame'),{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(100% 0% 0% 0%)',duration:1.2,ease:'power3.inOut',immediateRender:false},10.4);
    }else{
      capIn(tl,caps[0],5.5);
    }
  });

  // ---------- Section choreography: hard-edged clip-path wipes and staggered type only (no fades, no blur) ----------
  function split(el){var tmp=document.createElement('div');tmp.innerHTML=el.innerHTML;
    function walk(node,out){[].forEach.call(node.childNodes,function(c){if(c.nodeType===3){c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){out.appendChild(document.createTextNode(' '));return;}
        var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=p;w.appendChild(s);out.appendChild(w);});}
      else{var cl=c.cloneNode(false);out.appendChild(cl);walk(c,cl);}});}
    var frag=document.createElement('div');walk(tmp,frag);var txt=el.textContent.replace(/\s+/g,' ').trim();el.innerHTML=frag.innerHTML;if(/^H[1-6]$/.test(el.tagName))el.setAttribute('aria-label',txt);else{var sr=document.createElement('span');sr.className='sr-only';sr.textContent=txt;el.appendChild(sr);}
    [].forEach.call(el.querySelectorAll('.w'),function(w){w.setAttribute('aria-hidden','true');});
    return el.querySelectorAll('.w>span');}
  [].forEach.call(document.querySelectorAll('.lines'),function(el){if(el.id==='hero-h')return;var ws=split(el);
    gsap.from(ws,{yPercent:110,duration:.8,ease:'expo.out',stagger:.04,scrollTrigger:{trigger:el,start:'top 85%',once:true}});});

  gsap.utils.toArray('.rv').forEach(function(el){gsap.fromTo(el,{clipPath:'inset(0% 0% 100% 0%)',y:18},{clipPath:'inset(0% 0% -10% 0%)',y:0,duration:.7,ease:'power4.out',clearProps:'clipPath',scrollTrigger:{trigger:el,start:'top 88%',once:true}});});
  // hero copy and CTA are never hidden: they paint with the first frame (fonts swap in on metric-matched fallbacks)
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){root.classList.add('fonts-in');});else root.classList.add('fonts-in');
  // steps slide in from alternating sides, then their rule sweeps across
  var steps=gsap.utils.toArray('.how .step');
  var stl=gsap.timeline({scrollTrigger:{trigger:'.how .steps',start:'top 80%',once:true}});
  steps.forEach(function(s,i){var l=s.dataset.from==='left';
    stl.fromTo(s,{clipPath:l?'inset(0% 100% 0% 0%)':'inset(0% 0% 0% 100%)',x:l?-40:40},{clipPath:'inset(0% 0% 0% 0%)',x:0,duration:.8,ease:'power4.inOut'},i*.12)
       .fromTo(s,{'--s':0},{'--s':1,duration:.6,ease:'power2.inOut'},i*.12+.3)
       .from(s.children,{yPercent:60,clipPath:'inset(0% 0% 100% 0%)',duration:.5,stagger:.07,ease:'power3.out',clearProps:'clipPath'},i*.12+.25);});
  // film step rules sweep in with the scrub (reversible, same clock)
  // menu rows sweep in from both sides
  gsap.utils.toArray('.menu li').forEach(function(li,i){gsap.fromTo(li,{clipPath:li.dataset.from==='left'?'inset(0% 100% 0% 0%)':'inset(0% 0% 0% 100%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.8,ease:'power4.inOut',delay:i*.07,
    scrollTrigger:{trigger:li,start:'top 90%',once:true}});});
  // photos: hard-edged wipe up inside a crisp frame
  gsap.utils.toArray('.par').forEach(function(el){var img=el.querySelector('img');
    gsap.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'power4.inOut',scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    // no zoomed parallax: the photo stays at its natural size (1.0x or less) inside its frame
  });
  // hours rows stagger
  gsap.fromTo('.hours tr',{clipPath:'inset(0% 0% 0% 100%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.6,stagger:.05,ease:'power4.inOut',scrollTrigger:{trigger:'.hours',start:'top 85%',once:true}});
  // ---------- the one-word scene: BLEND is cut out of solid amber; scrolling drives the camera through the E ----------
  var wsec=document.getElementById('blend');
  if(wsec){var svg=wsec.querySelector('.word'),wt=svg.querySelector('mask .word__t'),probe=svg.querySelector('.word__probe'),wcap=wsec.querySelector('.word__cap'),wlab=wsec.querySelector('.film__label');
    var og='800 500';try{var e=probe.getExtentOfChar(2);og=(e.x+e.width/2).toFixed(1)+' '+(e.y+e.height*.5).toFixed(1);}catch(x){}
    var wws=split(wcap.querySelector('.word__h'));
    gsap.set([wcap,wlab],{clipPath:'inset(0% 100% 0% 0%)'});
    gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:wsec,start:'top top',end:'bottom bottom',scrub:.35}})
      .fromTo(wsec.querySelector('.reel__s'),{yPercent:0},{yPercent:-(420/1140*100),duration:1,ease:'none'},0)
      .fromTo(wt,{scale:1,svgOrigin:og},{scale:60,svgOrigin:og,duration:.55,ease:'power2.in'},.05)
      .set(svg,{visibility:'hidden'},.6)
      .to(wcap,{clipPath:'inset(0% 0% 0% 0%)',duration:.12,ease:'power4.inOut'},.64)
      .fromTo(wws,{yPercent:110},{yPercent:0,duration:.12,stagger:.02,ease:'power3.out',immediateRender:false},.68)
      .to(wlab,{clipPath:'inset(0% 0% 0% 0%)',duration:.08},.66)
      .to({},{duration:.2},.8);}
  addEventListener('load',function(){chrome();ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){chrome();ScrollTrigger.refresh();});
})();
// ---------- real-photo reels: sized so the photo never shows above 1.0x (the move itself is scroll-scrubbed) ----------
(function(){
  var reels=[].slice.call(document.querySelectorAll('[data-reel]'));
  function size(){var d=window.devicePixelRatio||1;reels.forEach(function(r){r.style.setProperty('--rw',(+r.dataset.w/d).toFixed(1)+'px');});}
  size();addEventListener('resize',size);
  window.__pcbReels=function(){return reels.map(function(r){var b=r.getBoundingClientRect(),im=r.querySelector('img');return {name:r.dataset.reel,cssW:b.width,file:+r.dataset.w,scale:b.width*(window.devicePixelRatio||1)/+r.dataset.w,src:im&&im.currentSrc,ty:im&&getComputedStyle(im).transform};});};
})();
