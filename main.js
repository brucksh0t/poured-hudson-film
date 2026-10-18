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
  var FV='4',TIERS=[{k:'d',h:1080},{k:'x',h:1440}];
  function cap(){return Math.min(window.devicePixelRatio||1,2);}

  // ---------- Film engine: canvas WebP sequences, progressive load ----------
  // Frame index always comes from the pinned timeline's progress (one source of truth), so reverse scrolling
  // restores the same frame. Missing frames fall back to the nearest loaded one; if none load, the poster stays.
  function Film(sec){
    this.sec=sec;this.n=+sec.dataset.frames;this.name=sec.dataset.film;
    this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=sec.querySelector('.film__poster');
    this.cur=0;this.phase=0;this.shown=false;this.set=null;this.gen=0;this.reset();this.size();
  }
  Film.prototype.reset=function(){this.gen++;this.imgs=new Array(this.n);this.ok=new Uint8Array(this.n);this.req=new Uint8Array(this.n);this.drawn=-1;};
  Film.prototype.pick=function(){if(mobile)return 'm';var c=this.cv,need=Math.max((c.clientWidth||innerWidth)*cap()/16*9,(c.clientHeight||innerHeight)*cap()),t=TIERS[0];
    for(var i=0;i<TIERS.length;i++){t=TIERS[i];if(t.h>=need*.9)break;}return t.k;};
  Film.prototype.src=function(i){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+this.set+'/'+s+'.webp?v='+FV;};
  Film.prototype.size=function(){var d=cap(),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
    var t=this.pick();if(t!==this.set){var had=this.set,ph=this.phase;this.set=t;if(had){this.reset();this.phase=0;if(ph)this.load(ph);}}
    this.draw(this.cur,true);};
  // phase 1: first 8 frames + every 8th + last (enough to scrub coarsely); phase 2: everything else
  Film.prototype.load=function(ph){if(ph<=this.phase)return;this.phase=ph;var self=this,order=[],g=this.gen,n=this.n;
    function add(i){if(i>=0&&i<n&&!self.req[i]){self.req[i]=1;order.push(i);}}
    for(var i=0;i<Math.min(8,n);i++)add(i);for(i=0;i<n;i+=8)add(i);add(n-1);
    if(ph>1)[4,2,1].forEach(function(s){for(var i=0;i<n;i+=s)add(i);});
    var k=0,live=0,MAX=6;
    function next(){if(g!==self.gen)return;while(live<MAX&&k<order.length){(function(i){live++;var im=new Image();im.decoding='async';
      im.onload=function(){if(g!==self.gen)return;self.imgs[i]=im;self.ok[i]=1;live--;if(Math.abs(i-self.cur)<=16)self.draw(self.cur,true);next();};
      im.onerror=function(){live--;self.req[i]=0;next();};im.src=self.src(i);})(order[k++]);}}
    next();};
  Film.prototype.state=function(){var im=this.imgs[this.drawn];return {name:this.name,set:this.set,n:this.n,cur:this.cur,drawn:this.drawn,loaded:this.ok.reduce(function(a,b){return a+b;},0),cw:this.cv.width,ch:this.cv.height,src:im?im.naturalWidth+'x'+im.naturalHeight:null};};
  Film.prototype.draw=function(f,force){f=Math.max(0,Math.min(this.n-1,Math.round(f)));if(f===this.cur&&!force&&this.drawn===f)return;this.cur=f;
    var i=f,j=f,im=null,at=-1;while(i>=0||j<this.n){if(i>=0&&this.ok[i]){im=this.imgs[i];at=i;break;}if(j<this.n&&this.ok[j]){im=this.imgs[j];at=j;break;}i--;j++;}
    if(!im)return;var c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.drawn=at;
    if(!this.shown){this.shown=true;gsap.to(this.poster,{autoAlpha:0,duration:.4});}};

  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(s){return new Film(s);});
  window.__pcbFilms=films;
  // keep the first screen light: hero phase 1 after load, the rest on first scroll or after idle
  var hero=films[0];
    // first screen stays light: the poster is the first frame; hero frames start on first scroll/touch or 2.5 s after load
  function heroAll(){hero.load(1);hero.load(2);removeEventListener('scroll',heroAll);removeEventListener('touchstart',heroAll);}
  function afterLoad(){addEventListener('scroll',heroAll,{passive:true});addEventListener('touchstart',heroAll,{passive:true});setTimeout(heroAll,2500);}
  if(document.readyState==='complete')afterLoad();else addEventListener('load',afterLoad);
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){films.forEach(function(f){if(f.sec===e.target){f.load(1);f.load(2);}});io.unobserve(e.target);}});},{rootMargin:'250% 0px'});
  films.slice(1).forEach(function(f){io.observe(f.sec);});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});},120);});

  // crisp caption beats: opacity + short rise, no blur; fully opaque at rest
  function capIn(tl,el,at){tl.fromTo(el,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},at);}
  function capOut(tl,el,at){tl.to(el,{autoAlpha:0,y:-20,duration:.5,ease:'power2.in'},at);}

  films.forEach(function(f){
    var caps=[].slice.call(f.sec.querySelectorAll('.cap')),isHero=f.name==='hero',o={f:0};
    var len=isHero?320:f.name==='pour'?280:240;
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:f.sec,start:'top top',end:'+='+len+'%',pin:true,pinSpacer:f.sec.parentElement.classList.contains('pin-spacer')?f.sec.parentElement:undefined,scrub:.5,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(st){f.draw(o.f);if(isHero)ctaOut(st.progress>.2);}, onLeave:function(){if(isHero)ctaOut(true);}, onEnterBack:function(st){if(isHero)ctaOut(st.progress>.2);}}});
    tl.to(o,{f:f.n-1,duration:10,onUpdate:function(){f.draw(o.f);}},0);
    if(isHero){
      capOut(tl,caps[0],2.2);capIn(tl,caps[1],6.2);
    }else if(f.name==='pour'){
      var st=[].slice.call(f.sec.querySelectorAll('.steps--film .step'));
      capIn(tl,caps[0],2.6);
      if(mobile){tl.set(st[1],{autoAlpha:0},0);capOut(tl,st[0],5.6);capIn(tl,st[1],6.2);}
      else{tl.fromTo(st[1],{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},4.6);}
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
  var heroWords=null;
  [].forEach.call(document.querySelectorAll('.lines'),function(el){var ws=split(el);
    if(el.id==='hero-h'){heroWords=ws;return;}
    gsap.from(ws,{yPercent:110,duration:.8,ease:'expo.out',stagger:.04,scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}});});

  gsap.utils.toArray('.rv').forEach(function(el){gsap.from(el,{y:24,autoAlpha:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});});
  var introd=false;function intro(){if(introd)return;introd=true;root.classList.add('fonts-in');
    var tl=gsap.timeline();if(heroWords)tl.from(heroWords,{yPercent:110,duration:.7,ease:'expo.out',stagger:.04},0);
    tl.from('.cap--hero .kicker, .cap--hero .lede, .cap--hero .today__row, .cap--hero .btns',{y:18,autoAlpha:0,duration:.55,ease:'power3.out',stagger:.07},.12);}
  // wait for the (non-blocking) font stylesheet, then the three faces used above the fold
  (function(){setTimeout(intro,2500);var ln=document.querySelector('link[rel=stylesheet][href*="fonts.googleapis"]');
    function faces(){if(!document.fonts||!document.fonts.load)return intro();
      Promise.all(['600 1em "Cormorant Garamond"','italic 500 1em "Cormorant Garamond"','400 1em Karla','600 1em Karla'].map(function(f){return document.fonts.load(f);})).then(intro,intro);}
    if(!ln||ln.media==='all')faces();else ln.addEventListener('load',function(){setTimeout(faces,0);});})();
  // steps slide in from alternating sides, then their rule sweeps across
  var steps=gsap.utils.toArray('.how .step');
  var stl=gsap.timeline({scrollTrigger:{trigger:'.how .steps',start:'top 80%',toggleActions:'play none none reverse'}});
  steps.forEach(function(s,i){var l=s.dataset.from==='left';
    stl.from(s,{x:l?-60:60,autoAlpha:0,duration:.8,ease:'expo.out'},i*.12)
       .fromTo(s,{'--s':0},{'--s':1,duration:.6,ease:'power2.inOut'},i*.12+.3)
       .from(s.children,{y:14,autoAlpha:0,duration:.5,stagger:.07,ease:'power2.out'},i*.12+.25);});
  // film step rules sweep in with the scrub (reversible, same clock)
  // menu rows sweep in from both sides
  gsap.utils.toArray('.menu li').forEach(function(li,i){gsap.from(li,{x:li.dataset.from==='left'?-48:48,autoAlpha:0,duration:.8,ease:'expo.out',delay:i*.07,
    scrollTrigger:{trigger:li,start:'top 90%',toggleActions:'play none none reverse'}});});
  // photos: soft iris reveal + gentle parallax drift (scale 1.06 keeps the drift inside the frame)
  gsap.utils.toArray('.par').forEach(function(el){var img=el.querySelector('img');
    gsap.fromTo(el,{clipPath:'inset(12% 12% 12% 12% round 6px)',autoAlpha:0},{clipPath:'inset(0% 0% 0% 0% round 6px)',autoAlpha:1,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}});
    gsap.fromTo(img,{yPercent:-(+el.dataset.speed||8)/3,scale:1.06},{yPercent:(+el.dataset.speed||8)/3,scale:1.06,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});});
  // hours rows stagger
  gsap.from('.hours tr',{x:32,autoAlpha:0,duration:.6,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'.hours',start:'top 85%',toggleActions:'play none none reverse'}});
  addEventListener('load',function(){chrome();ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){chrome();ScrollTrigger.refresh();});
})();
