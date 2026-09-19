export function assert(condition, message) { if (!condition) throw new Error(message); }
export function payment(p, annual, months) {
  const r = annual / 1200;
  return r === 0 ? p / months : p * r / -Math.expm1(-months * Math.log1p(r));
}
export function future(p, annual, years, periods = 1, deposit = 0) {
  const r = annual / 100 / periods, n = years * periods;
  const gain = Math.expm1(n * Math.log1p(r));
  return p * (1 + gain) + deposit * (r === 0 ? n : gain / r);
}
export function date(value) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), 'Enter a complete date.');
  const d = new Date(value + 'T00:00:00Z');
  assert(Number.isFinite(+d) && d.toISOString().slice(0,10) === value && value >= '0001-01-01', 'Enter a valid date from year 0001 to 9999.');
  return d;
}
export function iso(d) { const s=d.toISOString(); assert(/^\d{4}-/.test(s) && s >= '0001-01-01', 'Result is outside years 0001–9999.'); return s.slice(0,10); }
export const days = (a,b) => (date(b)-date(a))/86400000;
export function gcd(a,b) { a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a; }
export function payoff(balance, rate, amount) {
  const r=rate/1200; assert(balance===0 || amount>balance*r, 'Payment must exceed the first month’s interest to repay this balance.');
  let total=0, months=0;
  while(balance>0 && months<12000){const due=balance*(1+r),paid=Math.min(due,amount);total+=paid;balance=due-paid;months++;}
  assert(months<12000, 'This plan takes at least 1,000 years. Increase the payment.');
  return {months,total};
}
export function format(value, precision=6) {
  if(typeof value==='string') return value;
  assert(Number.isFinite(value), 'Result exceeds the supported numeric range. Try smaller values.');
  return new Intl.NumberFormat('en', Math.abs(value)>=1e12 || (value!==0 && Math.abs(value)<10**(-precision)) ? {notation:'scientific',maximumSignificantDigits:7} : {maximumFractionDigits:precision}).format(Object.is(value,-0)?0:value);
}
export function calculate(def, raw) {
  const input={};
  for(const field of def.fields){
    const v=raw[field.key]; assert(v!==undefined && v!==null && String(v).trim()!=='', `Enter ${field.label.toLowerCase()}.`);
    if(field.type==='select'){assert(field.options.some(o=>o[0]===String(v)), `Choose a valid ${field.label.toLowerCase()}.`);input[field.key]=String(v);}
    else if(field.type==='date'){date(String(v)); input[field.key]=String(v);}
    else if(field.type==='time'){assert(/^([01]\d|2[0-3]):[0-5]\d$/.test(v),'Enter a valid time.');input[field.key]=Number(v.slice(0,2))*60+Number(v.slice(3));}
    else if(field.type==='list') {const parts=String(v).split(/[\s,]+/).filter(Boolean);assert(parts.length>0 && parts.length<=1000,'Enter between 1 and 1,000 numbers.');input[field.key]=parts.map(Number);assert(input[field.key].every(x=>Number.isFinite(x)&&Math.abs(x)<=1e12),'Use finite numbers up to one trillion.');}
    else {const n=Number(v);assert(Number.isFinite(n),`${field.label} must be a finite number.`);assert(Math.abs(n)<=1e12,`${field.label} must be no larger than one trillion.`);if(field.min!==undefined)assert(n>=field.min,`${field.label} must be at least ${field.min}.`);if(field.positive)assert(n>0,`${field.label} must be greater than zero.`);if(field.max!==undefined)assert(n<=field.max,`${field.label} must be at most ${field.max}.`);if(field.integer)assert(Number.isSafeInteger(n),`${field.label} must be a whole number.`);input[field.key]=n;}
  }
  const result=def.solve(input);
  for(const [label,value] of Object.entries(result)){assert(typeof value==='number'||typeof value==='string',`Invalid result: ${label}`);if(typeof value==='number') assert(Number.isFinite(value) && Math.abs(value)<=Number.MAX_SAFE_INTEGER,'Result is too large to report reliably. Reduce the input values.');}
  return result;
}
