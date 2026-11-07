'use strict';
const root=document.documentElement;
root.classList.add('js');
const scene=document.querySelector('.unfold-scene');
const stage=document.querySelector('.stage');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let raf=0,start=performance.now(),introDone=false;
const clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
function paint(now){
 raf=0;if(reduced.matches)return;
 const range=scene.offsetHeight-stage.offsetHeight;
 const p=clamp(-scene.getBoundingClientRect().top/range);
 const entrance=clamp((now-start)/1450);const ease=1-Math.pow(1-entrance,3);
 stage.style.setProperty('--p',p.toFixed(4));stage.style.setProperty('--fold',((28+(1-ease)*23)*(1-p)).toFixed(3)+'deg');
 if(entrance<1)raf=requestAnimationFrame(paint);else introDone=true;
}
function requestPaint(){if(!raf&&!reduced.matches)raf=requestAnimationFrame(paint);}
function setMotion(){root.classList.toggle('motion',!reduced.matches);if(reduced.matches){cancelAnimationFrame(raf);raf=0;stage.style.removeProperty('--p');stage.style.removeProperty('--fold');}else{start=performance.now();introDone=false;requestPaint();}}
addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint,{passive:true});reduced.addEventListener('change',setMotion);setMotion();
const gardens={
 terrasse:{image:'mb-09.webp',alt:'Terrasse bois au bord d’une piscine, avec fauteuils et jardin en arrière-plan.',title:'Une pièce, sans plafond.',description:'Le bois rejoint le bassin. Une terrasse accueille les fauteuils, à deux pas du jardin.',prompt:'Je souhaite aménager une terrasse ou les abords d’une piscine. '},
 limites:{image:'mb-02-crop.webp',alt:'Courbe entre pelouse, gravier clair et ardoise, devant une haie et des arbustes.',title:'Une limite peut prendre la courbe.',description:'Le gazon, le gravier et l’ardoise suivent une même ligne. Les arbustes occupent leur place, sans fermer le jardin.',prompt:'Je souhaite travailler les limites, les haies ou le gazon du jardin. '},
 entree:{image:'mb-03.webp',alt:'Cour en gravier au pied d’une maison, bordée d’arbres et de plantations.',title:'Rentrer chez soi, autrement.',description:'La cour relie la maison aux arbres. Le gravier laisse les passages ouverts, les bordures dessinent les espaces plantés.',prompt:'Je souhaite aménager une entrée ou une allée. '}
};
const byId=id=>document.getElementById(id);let selected='terrasse';
for(const button of document.querySelectorAll('[data-garden]'))button.addEventListener('click',()=>{
 selected=button.dataset.garden;const g=gardens[selected];for(const b of document.querySelectorAll('[data-garden]'))b.setAttribute('aria-pressed',String(button===b));
 byId('garden-image').src='assets/'+g.image;byId('garden-image').alt=g.alt;byId('garden-title').textContent=g.title;byId('garden-description').textContent=g.description;byId('garden-status').textContent='Réalisation affichée : '+button.textContent;
});
byId('garden-to-form').addEventListener('click',()=>{if(!byId('projet').value.trim())byId('projet').value=gardens[selected].prompt;});
byId('quote-form').addEventListener('submit',event=>{
 event.preventDefault();let first=null;const values={commune:byId('commune').value.trim(),projet:byId('projet').value.trim(),retour:byId('retour').value.trim()};
 const empty={commune:'Indiquez une commune, sans adresse exacte.',projet:'Décrivez votre projet en quelques mots.',retour:'Indiquez un téléphone ou un e-mail de démonstration.'};
 for(const key of Object.keys(values)){
  let message=values[key]?'':empty[key];
  if(key==='retour'&&values[key]&&!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[key])||/^\+?[\d\s().-]{8,22}$/.test(values[key])&&values[key].replace(/\D/g,'').length>=8))message='Utilisez un e-mail valide ou un téléphone (démonstration).';
  byId(key+'-error').textContent=message;byId(key).setAttribute('aria-invalid',String(!!message));if(message&&!first)first=byId(key);
 }
 if(first){byId('form-result').hidden=true;first.focus();return;}
 byId('summary').replaceChildren();for(const [label,value] of [['Commune',values.commune],['Projet',values.projet],['Coordonnée',values.retour],['Prénom',byId('prenom').value.trim()]])if(value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;byId('summary').append(dt,dd);}
 byId('form-result').hidden=false;byId('form-result').focus();
});
byId('edit-request').addEventListener('click',()=>{byId('form-result').hidden=true;byId('commune').focus();});
document.querySelector('.prepare').type='submit';
