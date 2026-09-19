import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../src/catalog.mjs';
import {calculate,payment,date,format} from '../src/core.mjs';
const defs=Object.fromEntries(calculators.map(c=>[c.id,c]));
const defaults=c=>Object.fromEntries(c.fields.map(f=>[f.key,f.value]));
const run=(id,input={})=>calculate(defs[id],{...defaults(defs[id]),...input});
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-8,`${a} != ${b}`);
// Independent reference expectations: one or more named results for EVERY tool.
const fixtures={
 'loan-calculator':[{p:10000,rate:5,years:5},{'Monthly payment':188.7123364401099}],
 'mortgage-calculator':[{p:100000,rate:4,years:30,extras:100},{'Principal and interest / month':477.4152954654538,'Including monthly extra costs':577.4152954654538}],
 'car-loan-calculator':[{price:25000,deposit:5000,trade:0,fees:0,rate:0,months:60},{'Monthly payment':1000/3,'Amount financed':20000}],
 'compound-interest-calculator':[{p:1000,rate:5,years:2,frequency:'1'},{'Future balance':1102.5}],
 'simple-interest-calculator':[{p:1000,rate:5,years:3},{'Interest':150,'Total':1150}],
 'investment-growth-calculator':[{p:1000,deposit:100,rate:0,years:1},{'Projected balance':2200}],
 'savings-goal-calculator':[{goal:8000,p:2000,rate:0,months:24},{'Required monthly saving':250}],
 'roi-calculator':[{cost:1000,value:1200},{'ROI (%)':20}],
 'present-value-calculator':[{value:1100,rate:10,years:1},{'Present value':1000}],
 'debt-payoff-calculator':[{balance:1000,rate:0,amount:100},{'Months to repay':10,'Total repaid':1000}],
 'loan-comparison-calculator':[{p:12000,rateA:0,rateB:0,monthsA:12,monthsB:24},{'A monthly payment':1000,'B monthly payment':500}],
 'annualized-return-calculator':[{start:100,end:121,years:2},{'Annualized return (%)':10}],
 'profit-margin-calculator':[{cost:60,price:100},{'Gross profit':40,'Margin (%)':40,'Markup (%)':200/3}],
 'markup-calculator':[{cost:80,markup:25},{'Selling price':100}],
 'break-even-calculator':[{fixed:1000,price:25,variable:15},{'Whole units to break even':100}],
 'commission-calculator':[{sales:10000,rate:5,base:1000},{'Total pay':1500}],
 'salary-hourly-calculator':[{rate:25,hours:40,weeks:52},{'Annual gross pay':52000}],
 'salary-to-hourly-calculator':[{salary:52000,hours:40,weeks:52},{'Hourly equivalent':25}],
 'net-profit-calculator':[{}, {'Net profit or loss':2500,'Net margin (%)':25}],
 'revenue-growth-calculator':[{}, {'Revenue growth (%)':25}],
 'discount-calculator':[{}, {'Sale price':80,'You save':20}],
 'unit-price-calculator':[{}, {'Package A price per unit':0.008,'Package B price per unit':0.009,'Lower unit price':'Package A'}],
 'tip-calculator':[{}, {'Total including tip':115,'Per person':57.5}],
 'vat-calculator':[{price:105,rate:5,mode:'gross'},{'Net amount':100,'VAT amount':5}],
 'sales-tax-calculator':[{}, {'Sales tax':8,'Total including tax':108}],
 'successive-discounts-calculator':[{}, {'Final price':72,'Equivalent discount (%)':28}],
 'percentage-calculator':[{}, {'Percentage of value':30,'After increase':230,'After decrease':170}],
 'percentage-change-calculator':[{}, {'Change (%)':25}],
 'percentage-of-total-calculator':[{}, {'Percentage of total (%)':12.5}],
 'average-calculator':[{}, {'Mean':25,'Sum':100,'Count':4}],
 'median-calculator':[{values:'1, 2, 100'},{'Median':2,'Range':99}],
 'ratio-calculator':[{}, {'Simplified ratio':'2:3','Common divisor':12}],
 'proportion-calculator':[{}, {'Missing x':15}],
 'fraction-calculator':[{}, {'Simplified fraction':'5/6','Decimal':5/6}],
 'power-calculator':[{}, {'Power':1024}],
 'square-root-calculator':[{}, {'Principal square root':12}],
 'quadratic-equation-calculator':[{}, {'Discriminant':1,'Root 1':2,'Root 2':1}],
 'circle-calculator':[{}, {'Area (square units)':78.53981633974483,'Circumference (units)':31.41592653589793}],
 'triangle-area-calculator':[{}, {'Area (square units)':30}],
 'pythagorean-calculator':[{}, {'Hypotenuse':5}],
 'cylinder-volume-calculator':[{}, {'Volume (cubic units)':282.7433388230814}],
 'sphere-calculator':[{}, {'Volume (cubic units)':113.09733552923255}],
 'age-calculator':[{}, {'Completed years':36}],
 'days-between-dates':[{}, {'Elapsed calendar days':31,'Inclusive count of dates':32}],
 'add-days-calculator':[{}, {'Result date':'2026-01-31'}],
 'business-days-calculator':[{}, {'Business days (excluding holidays adjustment)':5}],
 'weeks-between-dates-calculator':[{}, {'Complete weeks':4,'Remaining days':3}],
 'months-between-dates-calculator':[{}, {'Complete calendar months':2}],
 'time-duration-calculator':[{}, {'Hours and minutes':'8 h 30 min','Decimal hours':8.5}],
 'hours-worked-calculator':[{}, {'Paid hours':8}],
 'bmi-calculator':[{}, {'BMI (kg/m²)':22.857142857142858}],
 'running-pace-calculator':[{}, {'Pace (decimal min/km)':6,'Speed (km/h)':10}],
 'race-time-calculator':[{}, {'Finishing time (minutes)':60}],
 'pace-to-speed-calculator':[{}, {'Speed (km/h)':10}],
 'fuel-cost-calculator':[{}, {'Fuel needed (L)':21,'Estimated fuel cost':63}],
 'fuel-efficiency-calculator':[{}, {'Consumption (L/100 km)':7,'Economy (km/L)':100/7}],
 'mpg-converter':[{}, {'Consumption (L/100 km)':7.840486111111111}],
 'cost-per-kilometre-calculator':[{}, {'Cost per kilometre':1/3,'Annual total cost':5000}],
 'annual-fuel-cost-calculator':[{}, {'Annual fuel cost':3150,'Monthly average cost':262.5}],
 'square-footage-calculator':[{}, {'Floor area (ft²)':120,'Floor area (m²)':11.1483648}],
 'room-area-calculator':[{}, {'Area (m²)':20,'Perimeter (m)':18}],
 'room-volume-calculator':[{}, {'Room volume (m³)':50}],
 'concrete-calculator':[{}, {'Net volume (m³)':2,'With allowance (m³)':2.2}],
 'tile-calculator':[{}, {'Whole tiles to order':245}],
 'paint-calculator':[{}, {'Paint required (L)':8}],
 'flooring-calculator':[{}, {'Whole packs':11,'Material cost':550}],
 'wallpaper-calculator':[{}, {'Rolls to order':12,'Required strips':34,'Strips per roll':3}],
 'brick-calculator':[{}, {'Estimated bricks':623}],
 'gravel-calculator':[{}, {'Volume (m³)':1,'Mass (metric tonnes)':1.6}],
 'mulch-calculator':[{}, {'Volume (L)':1000,'Whole bags':20}],
 'fence-calculator':[{}, {'Panels':10,'Posts for straight run':11}],
 'electricity-cost-calculator':[{}, {'Energy (kWh)':5,'Electricity cost':1.5}],
 'monthly-appliance-cost-calculator':[{}, {'Period energy (kWh)':36,'Period cost':10.8}],
 'battery-runtime-calculator':[{}, {'Usable energy (Wh)':864,'Estimated runtime (hours)':8.64}],
 'length-converter':[{value:1,from:'ft',to:'m'},{'Converted value (m)':0.3048}],
 'weight-converter':[{value:1,from:'lb',to:'kg'},{'Converted value (kg)':0.45359237}],
 'area-converter':[{value:1,from:'acre',to:'ft²'},{'Converted value (ft²)':43560}],
 'volume-converter':[{value:1,from:'US gallon',to:'L'},{'Converted value (L)':3.785411784}],
 'speed-converter':[{value:10,from:'m/s',to:'km/h'},{'Converted value (km/h)':36}],
 'pressure-converter':[{value:1,from:'bar',to:'Pa'},{'Converted value (Pa)':100000}],
 'data-storage-converter':[{value:1,from:'GiB',to:'byte'},{'Converted value (byte)':1073741824}],
 'cooking-volume-converter':[{value:1,from:'US cup',to:'US tablespoon'},{'Converted value (US tablespoon)':16}],
 'temperature-converter':[{}, {'Temperature (°F)':68}],
 'rent-split-calculator':[{rent:6000,a:2,b:1},{'Person A rent':4000,'Person B rent':2000}],
 'rent-payment-calculator':[{}, {'Amount per payment':15000,'Monthly average':5000}],
 'recipe-scaling-calculator':[{}, {'Scale factor':1.5,'Scaled ingredient quantity':300}]
};
test('every calculator has an independent reference fixture',()=>assert.deepEqual(Object.keys(fixtures).sort(),Object.keys(defs).sort()));
for(const c of calculators){
 test(c.id+': reference example and deployable module',async()=>{const [input,expected]=fixtures[c.id],actual=run(c.id,input);for(const [k,v] of Object.entries(expected))typeof v==='number'?near(actual[k],v):assert.equal(actual[k],v);const {default:built}=await import('../assets/tools/'+c.id+'.mjs');assert.deepEqual(calculate(built,{...defaults(c),...input}),actual);});
 test(c.id+': required fields, invalid types and numeric boundaries',()=>{
  for(const f of c.fields){
   for(const empty of ['',null,undefined,'   '])assert.throws(()=>run(c.id,{[f.key]:empty}),Error);
   if(f.type==='number'){
    for(const bad of ['not a number',Infinity,-Infinity,NaN,1e100])assert.throws(()=>run(c.id,{[f.key]:bad}),Error);
    if(f.min!==undefined)assert.throws(()=>run(c.id,{[f.key]:f.min-1}),Error);
    if(f.positive)assert.throws(()=>run(c.id,{[f.key]:0}),Error);
    if(f.integer)assert.throws(()=>run(c.id,{[f.key]:1.5}),Error);
    if(f.max!==undefined)assert.throws(()=>run(c.id,{[f.key]:f.max+1}),Error);
    // All accepted or rejected edge inputs must either yield finite output or a clear error.
    for(const value of [0,-1,0.25,1e12]){try{for(const v of Object.values(run(c.id,{[f.key]:value})))assert.ok(typeof v==='string'||Number.isFinite(v));}catch(e){assert.ok(e instanceof Error&&e.message.length>5);}}
   }else if(f.type==='date')assert.throws(()=>run(c.id,{[f.key]:'2026-02-30'}));
   else if(f.type==='select')assert.throws(()=>run(c.id,{[f.key]:'invalid choice'}));
  }
 });
}
test('financial zero-rate limits, tiny rates and amortization balance',()=>{
 near(payment(1200,0,12),100);near(payment(1200,1e-10,12),100);
 let balance=10000,m=payment(balance,5,60);for(let i=0;i<60;i++)balance=balance*(1+5/1200)-m;assert.ok(Math.abs(balance)<1e-7);
 assert.throws(()=>run('debt-payoff-calculator',{balance:1000,rate:12,amount:10}),/interest/);
 // First month owes 1,010, pays 600; second month pays 410 × 1.01 = 414.10.
 near(run('debt-payoff-calculator',{balance:1000,rate:12,amount:600})['Total repaid'],1014.1);
 assert.equal(run('savings-goal-calculator',{goal:100,p:200})['Required monthly saving'],0);
 assert.match(run('profit-margin-calculator',{cost:0,price:0})['Margin (%)'],/Undefined/);
});
test('date leap years, DST-independent intervals, overnight times and weekends',()=>{
 assert.throws(()=>date('1900-02-29'));assert.equal(date('2000-02-29').getUTCDate(),29);
 assert.equal(run('days-between-dates',{start:'2026-03-07',end:'2026-03-09'})['Elapsed calendar days'],2);
 assert.equal(run('age-calculator',{birth:'2000-02-29',asof:'2025-02-28'})['Completed years'],24);
 assert.equal(run('age-calculator',{birth:'2000-02-29',asof:'2025-03-01'})['Completed years'],25);
 assert.throws(()=>run('age-calculator',{birth:'2027-01-01',asof:'2026-01-01'}));
 assert.equal(run('add-days-calculator',{start:'2024-03-01',offset:-1})['Result date'],'2024-02-29');
 assert.equal(run('time-duration-calculator',{start:'23:30',end:'01:00',next:'next'})['Decimal hours'],1.5);
 assert.throws(()=>run('hours-worked-calculator',{break:1000}));
 for(const weekend of ['sat-sun','fri-sat'])for(let offset=0;offset<14;offset++){
  const start=new Date(Date.UTC(2026,0,1+offset));for(let length=0;length<15;length++){let expected=0;for(let i=0;i<length;i++){const day=new Date(+start+i*86400000).getUTCDay();if(!(weekend==='sat-sun'?[0,6]:[5,6]).includes(day))expected++;}const end=new Date(+start+length*86400000);assert.equal(run('business-days-calculator',{start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10),weekend})['Business days (excluding holidays adjustment)'],expected);}
 }
});
test('fraction operations, signed math and degenerate quadratics',()=>{
 assert.equal(run('fraction-calculator',{op:'subtract'})['Simplified fraction'],'1/6');
 assert.equal(run('fraction-calculator',{op:'multiply'})['Simplified fraction'],'1/6');
 assert.equal(run('fraction-calculator',{op:'divide'})['Simplified fraction'],'3/2');
 assert.throws(()=>run('fraction-calculator',{op:'divide',c:0}));
 assert.equal(run('percentage-change-calculator',{old:-10,current:-5})['Change (%)'],50);
 assert.throws(()=>run('percentage-change-calculator',{old:0}));
 assert.equal(run('average-calculator',{values:'-5 0 5.5'})['Mean'],1/6);
 assert.equal(run('quadratic-equation-calculator',{a:1,b:2,c:1})['Repeated root'],-1);
 assert.equal(run('quadratic-equation-calculator',{a:1,b:0,c:1})['Roots'],'No real roots');
 assert.throws(()=>run('quadratic-equation-calculator',{a:0}));
 assert.equal(run('power-calculator',{base:-2,exponent:3})['Power'],-8);
});
test('every conversion round-trips between all available unit pairs',()=>{
 for(const c of calculators.filter(c=>c.units))for(const from of Object.keys(c.units))for(const to of Object.keys(c.units)){
  const value=Object.values(run(c.id,{value:12.345,from,to}))[0];near(Object.values(run(c.id,{value,from:to,to:from}))[0],12.345);
 }
 near(run('temperature-converter',{value:-459.67,from:'F',to:'K'})['Temperature (K)'],0);
 assert.throws(()=>run('temperature-converter',{value:-1,from:'K'}));
 assert.equal(format(0),'0');assert.match(format(1e-8),/E/);
});
