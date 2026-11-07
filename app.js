 'use strict';
const root=document.documentElement;
root.classList.add('js');
const scene=document.querySelector('.unfold-scene'),stage=document.querySelector('.stage');
const object=document.querySelector('.photo-object'),slices=[...document.querySelectorAll('.slice')],images=slices.map(s=>s.querySelector('img'));
const copy=document.querySelector('.hero-copy'),invite=document.querySelector('.scroll-invite'),note=document.querySelector('.study-note'),caption=document.querySelector('.reveal-caption'),toggle=document.querySelector('.motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
let raf=0,start=0,ready=false,userMotion=true,metrics=null,lastP=-1,lastFold=-1,measureQueued=false;
function measure(){
 measureQueued=false;
 const w=document.documentElement.clientWidth,h=stage.clientHeight;
 const readable=copy.offsetHeight>Math.max(680,innerHeight)*.34||document.querySelector('.header').offsetHeight>118||innerHeight<620;
 root.classList.toggle('readable-layout',readable);
 const active=ready&&!reduced.matches&&userMotion&&!readable;
 root.classList.toggle('motion',active);
 toggle.hidden=!ready;toggle.setAttribute('aria-pressed',String(active));toggle.textContent=reduced.matches?'Animation réduite (système)':readable?'Animation réduite (lecture)':userMotion?'Animation activée':'Animation désactivée';toggle.disabled=reduced.matches||readable;
 const height=stage.clientHeight;
 metrics={w,h:height,top:scene.getBoundingClientRect().top+scrollY,range:Math.max(1,scene.offsetHeight-height),sx:w>=760?.56:.88,sy:w>=760?.40:.46,y:w>=760?.38:.34};
 const raw=height*4/3;
 for(const img of images){img.style.width=raw+'px';img.style.height=height+'px';}
 lastP=-1;lastFold=-1;
 if(active)requestPaint();else{cancelAnimationFrame(raf);raf=0;reset();}
}
function scheduleMeasure(){if(!measureQueued){measureQueued=true;requestAnimationFrame(measure);}}
function reset(){object.style.transform='';for(const s of slices){s.style.transform='';s.querySelector('.fold-shade').style.opacity='';}for(const i of images){i.style.transform='';i.style.width='400%';i.style.height='100%';}copy.style.transform='';copy.style.visibility='';invite.style.visibility='';note.style.visibility='';caption.style.transform='';stage.dataset.progress='0';}
function paint(now){
 raf=0;if(!root.classList.contains('motion')||!metrics)return;
 const m=metrics,p=clamp((scrollY-m.top)/m.range),entry=clamp((now-start)/1450),fold=(28+23*Math.pow(1-entry,3))*(1-p);
 if(p!==lastP||fold!==lastFold){
  const sx=m.sx+(1-m.sx)*p,sy=m.sy+(1-m.sy)*p,x=m.w*(1-sx)/2,y=m.h*m.y*(1-p),angle=-8*(1-p);
  object.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale3d(${sx},${sy},1)`;
  const raw=m.h*4/3,q=Math.max(sx*m.w/raw,sy),ix=q/sx,iy=q/sy;
  slices.forEach((s,i)=>{s.style.transform=`rotateY(${i%2?-fold:fold}deg)`;images[i].style.transform=`translate3d(${(m.w-raw*ix)/2-i*m.w/4}px,${(m.h-m.h*iy)/2}px,0) scale3d(${ix},${iy},1)`;s.querySelector('.fold-shade').style.opacity=i%2?String(.23*(1-p)):'0';});
  copy.style.transform='translate3d(0,0,0)';copy.style.visibility=p<.16?'visible':'hidden';invite.style.visibility=p<.12?'visible':'hidden';note.style.visibility=p<.12?'visible':'hidden';caption.style.transform=`translate3d(0,${100*(1-clamp((p-.73)/.27))}%,0)`;
  stage.dataset.progress=p.toFixed(4);stage.dataset.fold=fold.toFixed(3);lastP=p;lastFold=fold;
 }
 if(entry<1)raf=requestAnimationFrame(paint);
}
function requestPaint(){if(!raf&&root.classList.contains('motion'))raf=requestAnimationFrame(paint);}
addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',scheduleMeasure,{passive:true});
reduced.addEventListener('change',scheduleMeasure);
toggle.addEventListener('click',()=>{userMotion=!userMotion;measure();toggle.focus({preventScroll:true});toggle.scrollIntoView({block:'nearest',behavior:'instant'});});
new ResizeObserver(scheduleMeasure).observe(copy);
new ResizeObserver(scheduleMeasure).observe(document.querySelector('.header'));
Promise.all([document.fonts.ready,...images.map(i=>i.decode().catch(()=>{}))]).then(()=>{ready=true;start=performance.now();measure();});
const gardens={
 terrasse:{image:'mb-09.webp',alt:'Terrasse bois au bord d’une piscine, avec fauteuils et jardin en arrière-plan.',title:'Une pièce, sans plafond.',description:'Le bois rejoint le bassin. Une terrasse accueille les fauteuils, à deux pas du jardin.',prompt:'Je souhaite aménager une terrasse ou les abords d’une piscine. '},
 limites:{image:'mb-02-crop.webp',alt:'Courbe entre pelouse, gravier clair et ardoise, devant une haie et des arbustes.',title:'Une limite peut prendre la courbe.',description:'Le gazon, le gravier et l’ardoise suivent une même ligne. Les arbustes occupent leur place, sans fermer le jardin.',prompt:'Je souhaite travailler les limites, les haies ou le gazon du jardin. '},
 entree:{image:'mb-03.webp',alt:'Cour en gravier au pied d’une maison, bordée d’arbres et de plantations.',title:'Rentrer chez soi, autrement.',description:'La cour relie la maison aux arbres. Le gravier laisse les passages ouverts, les bordures dessinent les espaces plantés.',prompt:'Je souhaite aménager une entrée ou une allée. '}
};
const byId=id=>document.getElementById(id);let selected='terrasse';
for(const button of document.querySelectorAll('[data-garden]'))button.addEventListener('click',()=>{
 selected=button.dataset.garden;const g=gardens[selected];for(const b of document.querySelectorAll('[data-garden]'))b.setAttribute('aria-pressed',String(button===b));
 const stem=g.image.replace('.webp',''),max=stem==='mb-09'?1280:1200;byId('garden-image').srcset=`assets/${stem}-640.webp 640w, assets/${stem}-960.webp 960w, assets/${stem}-${max}.webp ${max}w`;byId('garden-image').src='assets/'+stem+'-960.webp';byId('garden-image').alt=g.alt;byId('garden-title').textContent=g.title;byId('garden-description').textContent=g.description;byId('garden-status').textContent='Réalisation affichée : '+button.textContent;
});
byId('garden-to-form').addEventListener('click',()=>{if(!byId('projet').value.trim())byId('projet').value=gardens[selected].prompt;});
byId('quote-form').addEventListener('submit',event=>{
 event.preventDefault();let first=null;const values={commune:byId('commune').value.trim(),projet:byId('projet').value.trim(),retour:byId('retour').value.trim()};
 const empty={commune:'Indiquez une commune, sans adresse exacte.',projet:'Décrivez votre projet en quelques mots.',retour:'Indiquez un téléphone ou un e-mail de démonstration.'};
 for(const key of Object.keys(values)){
  let message=values[key]?'':empty[key];
  const validContact=byId('contact-kind').value==='tel'?/^\+?[\d\s().-]{8,22}$/.test(values.retour)&&values.retour.replace(/\D/g,'').length>=8:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.retour);
  if(key==='retour'&&values[key]&&!validContact)message='Utilisez un e-mail valide ou un téléphone (démonstration).';
  byId(key+'-error').textContent=message;byId(key).setAttribute('aria-invalid',String(!!message));if(message&&!first)first=byId(key);
 }
 if(first){byId('form-result').hidden=true;first.focus();return;}
 byId('summary').replaceChildren();for(const [label,value] of [['Commune',values.commune],['Projet',values.projet],['Coordonnée',values.retour],['Prénom',byId('prenom').value.trim()]])if(value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;byId('summary').append(dt,dd);}
 byId('form-result').hidden=false;byId('form-result').focus();
});
byId('edit-request').addEventListener('click',()=>{byId('form-result').hidden=true;byId('commune').focus();});
byId('contact-kind').addEventListener('change',()=>{const tel=byId('contact-kind').value==='tel',input=byId('retour');input.type=tel?'tel':'email';input.autocomplete=tel?'tel':'email';input.inputMode=tel?'tel':'email';input.placeholder=tel?'Démo : 06 00 00 00 00':'Démo : exemple@exemple.fr';byId('contact-label').textContent=tel?'Votre téléphone':'Votre e-mail';input.value='';input.removeAttribute('aria-invalid');byId('retour-error').textContent='';});
document.querySelector('.prepare').type='submit';

document.querySelector('.prepare').disabled=false;document.getElementById('contact-kind').disabled=false;
