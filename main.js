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
  if(!/\bmotion\b/.test(root.className))return;
  if(!window.gsap||!window.ScrollTrigger){root.classList.remove('motion');return;}
  gsap.registerPlugin(ScrollTrigger);
  var mobile=window.matchMedia('(max-width:899px)').matches, SET=mobile?'m':'d';

  // ---------- Film engine: canvas WebP sequences, progressive load ----------
  function Film(sec){
    var self=this;this.sec=sec;this.n=+sec.dataset.frames;this.name=sec.dataset.film;
    this.cv=sec.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=sec.querySelector('.film__poster');
    this.imgs=new Array(this.n);this.ok=new Uint8Array(this.n);this.cur=0;this.started=false;this.shown=false;
    this.size();
  }
  Film.prototype.src=function(i){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+SET+'/'+s+'.webp';};
  Film.prototype.size=function(){var d=Math.min(window.devicePixelRatio||1,2),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);this.draw(this.cur,true);};
  Film.prototype.start=function(){if(this.started)return;this.started=true;var self=this,order=[],seen={};
    [16,8,4,2,1].forEach(function(s){for(var i=0;i<self.n;i+=s)if(!seen[i]){seen[i]=1;order.push(i);}});
    if(!seen[self.n-1])order.splice(1,0,self.n-1);
    var k=0,live=0,MAX=6;
    function next(){while(live<MAX&&k<order.length){(function(i){live++;var im=new Image();im.decoding='async';
      im.onload=function(){self.imgs[i]=im;self.ok[i]=1;live--;if(Math.abs(i-self.cur)<=16)self.draw(self.cur,true);next();};
      im.onerror=function(){live--;next();};im.src=self.src(i);})(order[k++]);}}
    next();};
  Film.prototype.draw=function(f,force){f=Math.max(0,Math.min(this.n-1,Math.round(f)));if(f===this.cur&&!force&&this.drawn===f)return;this.cur=f;
    var i=f,j=f,im=null;while(i>=0||j<this.n){if(i>=0&&this.ok[i]){im=this.imgs[i];break;}if(j<this.n&&this.ok[j]){im=this.imgs[j];break;}i--;j++;}
    if(!im)return;var c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.drawn=f;
    if(!this.shown){this.shown=true;gsap.to(this.poster,{autoAlpha:0,duration:.6});}};

  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(s){return new Film(s);});
  window.__pcbFilms=films;
  films[0].start();
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){films.forEach(function(f){if(f.sec===e.target)f.start();});io.unobserve(e.target);}});},{rootMargin:'250% 0px'});
  films.slice(1).forEach(function(f){io.observe(f.sec);});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});},120);});

  function capIn(tl,el,at){tl.fromTo(el,{autoAlpha:0,y:40,filter:'blur(10px)'},{autoAlpha:1,y:0,filter:'blur(0px)',duration:.8,ease:'power2.out'},at);}
  function capOut(tl,el,at){tl.to(el,{autoAlpha:0,y:-40,filter:'blur(10px)',duration:.7,ease:'power2.in'},at);}

  films.forEach(function(f){
    var caps=[].slice.call(f.sec.querySelectorAll('.cap')),hero=f.name==='hero',o={f:0};
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:f.sec,start:'top top',end:'+='+(hero?420:240)+'%',pin:true,scrub:.5,anticipatePin:1,
      onUpdate:function(){f.draw(o.f);}}});
    tl.to(o,{f:f.n-1,duration:10,onUpdate:function(){f.draw(o.f);}},0);
    var bar=f.sec.querySelector('.film__progress span');if(bar)tl.to(bar,{scaleX:1,duration:10},0);
    if(hero){
      capOut(tl,caps[0],2.2);capIn(tl,caps[1],3.3);capOut(tl,caps[1],5.6);capIn(tl,caps[2],6.6);
      tl.to(f.sec.querySelector('.film__stage'),{scale:1.04,duration:10},0);
    }else if(caps.length===2){
      capIn(tl,caps[0],1);capOut(tl,caps[0],4.2);capIn(tl,caps[1],6);capOut(tl,caps[1],9.2);
    }else{
      capIn(tl,caps[0],5.5);
    }
  });

  // ---------- Section choreography ----------
  function split(el){var html=el.innerHTML;var tmp=document.createElement('div');tmp.innerHTML=html;
    function walk(node,out){[].forEach.call(node.childNodes,function(c){if(c.nodeType===3){c.textContent.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){out.appendChild(document.createTextNode(' '));return;}
        var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=p;w.appendChild(s);out.appendChild(w);});}
      else{var cl=c.cloneNode(false);out.appendChild(cl);walk(c,cl);}});}
    var frag=document.createElement('div');walk(tmp,frag);el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());el.innerHTML=frag.innerHTML;
    [].forEach.call(el.querySelectorAll('.w'),function(w){w.setAttribute('aria-hidden','true');});
    return el.querySelectorAll('.w>span');}
  [].forEach.call(document.querySelectorAll('.lines'),function(el){var ws=split(el);
    if(el.id==='hero-h'){gsap.from(ws,{yPercent:115,rotate:4,duration:1.1,ease:'expo.out',stagger:.06,delay:.15});return;}
    gsap.from(ws,{yPercent:115,rotate:3,duration:1,ease:'expo.out',stagger:.05,scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}});});
  gsap.from('.cap--hero .kicker, .cap--hero .lede, .cap--hero .btns',{y:24,autoAlpha:0,duration:1,ease:'power3.out',stagger:.12,delay:.5});
  gsap.utils.toArray('.rv').forEach(function(el){gsap.from(el,{y:34,autoAlpha:0,filter:'blur(6px)',duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});});
  // steps build themselves: cards fly in from alternating sides, then their rule draws
  var steps=gsap.utils.toArray('.step');
  var stl=gsap.timeline({scrollTrigger:{trigger:'.steps',start:'top 78%',toggleActions:'play none none reverse'}});
  steps.forEach(function(s,i){var l=s.dataset.from==='left';
    stl.from(s,{x:l?-140:140,y:30,rotate:l?-3:3,autoAlpha:0,duration:.9,ease:'expo.out'},i*.14)
       .fromTo(s,{'--s':0},{'--s':1,duration:.7,ease:'power2.inOut'},i*.14+.35)
       .from(s.children,{y:16,autoAlpha:0,duration:.6,stagger:.08,ease:'power2.out'},i*.14+.3);});
  // menu rows sweep in from both sides
  gsap.utils.toArray('.menu li').forEach(function(li,i){gsap.from(li,{x:li.dataset.from==='left'?-90:90,autoAlpha:0,duration:.9,ease:'expo.out',delay:i*.08,
    scrollTrigger:{trigger:li,start:'top 90%',toggleActions:'play none none reverse'}});});
  // photos: soft iris reveal + parallax drift
  gsap.utils.toArray('.par').forEach(function(el){var img=el.querySelector('img');
    gsap.fromTo(el,{clipPath:'inset(14% 14% 14% 14% round 6px)',scale:.94,autoAlpha:0},{clipPath:'inset(0% 0% 0% 0% round 6px)',scale:1,autoAlpha:1,duration:1.4,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}});
    gsap.fromTo(img,{yPercent:-(+el.dataset.speed||8)/2,scale:1.1},{yPercent:(+el.dataset.speed||8)/2,scale:1.1,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});});
  // hours rows stagger
  gsap.from('.hours tr',{x:40,autoAlpha:0,duration:.7,stagger:.06,ease:'power3.out',scrollTrigger:{trigger:'.hours',start:'top 85%',toggleActions:'play none none reverse'}});
  addEventListener('load',function(){ScrollTrigger.refresh();});
})();
