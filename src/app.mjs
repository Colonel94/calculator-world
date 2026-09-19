import {calculate,format} from './core.mjs';
import {track,initIntegrations} from './integrations.mjs';
initIntegrations();
const search=document.querySelector('#search');
if(search){
 const cards=[...document.querySelectorAll('[data-search]')],status=document.querySelector('#search-status'),empty=document.querySelector('#no-results');
 search.addEventListener('input',()=>{const words=search.value.toLowerCase().trim().split(/\s+/);let count=0;for(const card of cards){card.hidden=!words.every(w=>card.dataset.search.includes(w));if(!card.hidden)count++;}status.textContent=`${count} calculator${count===1?'':'s'} found`;empty.hidden=count!==0;});
 search.addEventListener('change',()=>track('search',{result_count:cards.filter(c=>!c.hidden).length}));
}
const id=document.body.dataset.calculator;
if(id){
 const form=document.querySelector('form'),result=document.querySelector('#result'),error=document.querySelector('#form-error');
 try{
  const {default:def}=await import(`./tools/${id}.mjs`);
  let used=false,timer;
  const run=(explicit=false)=>{
   try{
    const values=Object.fromEntries(new FormData(form)),out=calculate(def,values);
    error.hidden=true;error.textContent='';for(const el of form.elements)el.removeAttribute('aria-invalid');
    result.replaceChildren();const title=document.createElement('h2');title.textContent='Your result';result.append(title);
    const precision=['finance','business','shopping'].includes(def.category)&&id!=='unit-price-calculator'?2:6;
    const list=document.createElement('dl');for(const [label,value] of Object.entries(out)){const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=format(value,precision);list.append(term,detail);}result.append(list);
    if(explicit)track('calculator_use',{calculator_id:id});
   }catch(e){error.hidden=false;error.textContent=e.message;result.textContent='Check your inputs to calculate an updated result.';for(const el of form.elements){if(el.name)el.setAttribute('aria-invalid',el.validity.valid?'false':'true');}if(explicit){const invalid=[...form.elements].find(el=>el.name&&!el.validity.valid);invalid?.focus();}}
  };
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);used=true;run(true);});
  form.addEventListener('input',()=>{if(used){clearTimeout(timer);result.textContent='Updating result…';timer=setTimeout(()=>run(),250);}});
  form.addEventListener('reset',()=>{clearTimeout(timer);used=false;error.hidden=true;error.textContent='';for(const el of form.elements)el.removeAttribute('aria-invalid');result.textContent='Example values restored. Select Calculate to use them.';});
  document.querySelectorAll('.card a').forEach(a=>a.addEventListener('click',()=>track('related_calculator_click',{calculator_id:id,target:a.getAttribute('href').split('/').pop()})));
 }catch{error.hidden=false;error.textContent='The calculator could not load. Refresh the page and try again. The formula and example remain available below.';}
}
