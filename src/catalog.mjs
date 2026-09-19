import {assert,payment,future,date,iso,days,gcd,payoff} from './core.mjs';
export const categories = {
 'finance':['Money & Finance','Explore borrowing, saving and investment scenarios with rates you control.'],
 'business':['Business','Understand pricing, pay, profit and the sales needed to cover your costs.'],
 'shopping':['Shopping','Compare prices, check discounts and divide everyday expenses.'],
 'math':['Math','Work through percentages, fractions, statistics and common geometry problems.'],
 'dates':['Dates & Time','Count calendar intervals and plan work hours with explicit date conventions.'],
 'fitness':['Health & Fitness','Calculate adult BMI and plan pace, distance and time.'],
 'automotive':['Automotive','Compare fuel use, estimate driving costs and plan vehicle finance.'],
 'home':['Home & Construction','Estimate areas, volumes and material quantities before ordering supplies.'],
 'energy':['Energy','Estimate electricity use and costs using your own tariffs and device ratings.'],
 'conversions':['Conversions','Convert common measurements with clearly identified units.'],
 'everyday':['Everyday Life','Plan rent payments, shared costs and practical household quantities.']
};
const num=(key,label,value=0,opts={})=>({key,label,value,type:'number',min:0,...opts});
const signed=(key,label,value=0,opts={})=>num(key,label,value,{min:undefined,...opts});
const pos=(key,label,value=1,opts={})=>num(key,label,value,{positive:true,...opts});
const count=(key,label,value=1,opts={})=>pos(key,label,value,{integer:true,...opts});
const sel=(key,label,options,value=options[0][0])=>({key,label,type:'select',options,value});
const dt=(key,label,value)=>({key,label,value,type:'date'});
const tm=(key,label,value)=>({key,label,value,type:'time'});
const rate=()=>num('rate','Annual interest rate (%)',5,{max:100});
const principal=()=>num('p','Starting amount',10000);
const years=()=>pos('years','Term (years)',5,{max:100});
export const calculators=[];
function add(id,title,category,description,fields,formula,notes,example,faq,solve,extra={}) {
 calculators.push({id,title,category,description,fields,formula,notes,example,faq,solve,...extra});
}
add('loan-calculator','Loan Calculator','finance','Estimate fixed monthly payments, total repayment and interest on an amortizing loan.',[num('p','Loan amount',10000),rate(),years()],
 'Payment = P × r ÷ (1 − (1 + r)⁻ⁿ), where r is annual interest ÷ 1,200 and n is years × 12. At zero interest, payment = P ÷ n.',
 'Monthly payments are made at the end of each month. The rate stays fixed; fees, taxes and insurance are excluded. Use a term that gives a whole number of months.',
 'A 10,000 loan over 5 years at 5% has a monthly payment of about 188.71 and total interest of 1,322.74.',
 ['Is the interest rate the same as APR?','Not necessarily. APR can incorporate fees. Enter the nominal annual interest rate quoted for the loan.'],
 x=>{assert(Number.isInteger(x.years*12),'Term must equal a whole number of months.');const m=payment(x.p,x.rate,x.years*12);return {'Monthly payment':m,'Total repayment':m*x.years*12,'Total interest':m*x.years*12-x.p};});
add('mortgage-calculator','Mortgage Calculator','finance','Estimate mortgage principal and interest plus editable monthly housing costs.',[num('p','Mortgage principal',100000),rate(),years(),num('extras','Monthly taxes, insurance and other costs',0)],
 'Monthly housing estimate = amortizing principal-and-interest payment + monthly extra costs.',
 'This is a fixed-rate loan estimate. Enter extra costs as a monthly total; down payments should already be deducted from principal. No jurisdiction-specific lending rules are assumed.',
 'At 4% for 30 years, a 100,000 mortgage costs about 477.42 per month before extra costs.',
 ['Does this include property taxes?','Only if you include them in monthly extra costs. Convert annual bills to monthly amounts first.'],
 x=>{assert(Number.isInteger(x.years*12),'Term must equal whole months.');const m=payment(x.p,x.rate,x.years*12);return {'Principal and interest / month':m,'Including monthly extra costs':m+x.extras,'Loan interest total':m*x.years*12-x.p};});
add('car-loan-calculator','Car Loan Calculator','automotive','Estimate vehicle payments after a deposit and trade-in, with optional financed fees.',[num('price','Vehicle price',25000),num('deposit','Deposit',5000),num('trade','Trade-in equity',0),num('fees','Financed fees',0),rate(),count('months','Term (months)',60,{max:1200})],
 'Amount financed = price + fees − deposit − trade-in equity. Apply the monthly amortizing payment formula to that amount.',
 'Trade-in equity means the value remaining after any old loan is settled. Enter negative equity as financed fees. Insurance and running costs are excluded.',
 'A 25,000 vehicle with a 5,000 deposit and zero interest over 60 months costs 333.33 per month.',
 ['Should I enter the full trade-in value?','Subtract any outstanding loan first, so you enter only the equity available for the new purchase.'],
 x=>{const p=x.price+x.fees-x.deposit-x.trade;assert(p>=0,'Deposit and trade-in exceed price plus fees.');const m=payment(p,x.rate,x.months);return {'Amount financed':p,'Monthly payment':m,'Total interest':m*x.months-p};});
add('compound-interest-calculator','Compound Interest Calculator','finance','Calculate balance growth with annual, monthly or daily compounding.',[principal(),rate(),num('years','Years',10,{max:100}),sel('frequency','Compounding frequency',[['1','Annually'],['12','Monthly'],['365','Daily']])],
 'Future balance = P × (1 + annual rate ÷ 100 ÷ periods)^(periods × years).',
 'The interest rate is nominal and fixed. There are no deposits, withdrawals, taxes or fees. Daily compounding uses 365 periods per year.',
 '1,000 at 5% compounded annually for 2 years becomes 1,102.50, a gain of 102.50.',
 ['Why does frequency change the result?','More frequent compounding lets interest start earning interest earlier when the nominal rate is unchanged.'],
 x=>{const v=future(x.p,x.rate,x.years,+x.frequency);return {'Future balance':v,'Interest earned':v-x.p};});
add('simple-interest-calculator','Simple Interest Calculator','finance','Find interest on principal when interest does not compound.',[principal(),rate(),num('years','Years',3,{max:100})],
 'Interest = principal × annual rate ÷ 100 × years. Total = principal + interest.',
 'Interest is calculated only on the starting principal. This does not model monthly amortizing loans or changing balances.',
 '1,000 at 5% simple interest for 3 years earns 150, giving a total of 1,150.',
 ['Can I enter part of a year?','Yes. For a six-month estimate enter 0.5 years; actual contracts may use a specific day-count basis.'],
 x=>({'Interest':x.p*x.rate/100*x.years,'Total':x.p*(1+x.rate/100*x.years)}));
add('investment-growth-calculator','Investment Growth Calculator','finance','Project a starting investment with regular end-of-month contributions.',[principal(),num('deposit','Monthly contribution',200),rate(),count('years','Years',10,{max:100})],
 'Future value = P(1 + r)ⁿ + D × ((1 + r)ⁿ − 1) ÷ r, with r = annual rate ÷ 1,200 and n = years × 12.',
 'Contributions arrive at month end. Returns are a constant hypothetical rate, not a forecast. Fees, taxes and market fluctuations are excluded.',
 'Starting with 1,000 and adding 100 monthly for a year at zero growth gives 2,200.',
 ['Are contributions invested at the start of the month?','No. This uses end-of-month contributions, so the final deposit earns no growth within the period.'],
 x=>{const v=future(x.p,x.rate,x.years,12,x.deposit),paid=x.p+x.deposit*x.years*12;return {'Projected balance':v,'Total contributed':paid,'Projected growth':v-paid};});
add('savings-goal-calculator','Savings Goal Calculator','finance','Find the monthly saving needed to reach a target balance by your chosen deadline.',[num('goal','Target balance',20000),num('p','Already saved',2000),rate(),count('months','Months to save',36,{max:1200})],
 'Monthly saving = max(0, (target − P(1+r)ⁿ) ÷ annuity factor). Annuity factor = ((1+r)ⁿ − 1) ÷ r, or n at zero interest.',
 'Deposits are made at month end and interest compounds monthly. A zero result means the starting balance alone reaches the target under the entered assumptions.',
 'To grow 2,000 to 8,000 over 24 months at zero interest, save 250 per month.',
 ['What if I already have enough saved?','The required monthly contribution is zero. This tool does not recommend withdrawing the surplus.'],
 x=>{const factor=future(0,x.rate,x.months/12,12,1),start=future(x.p,x.rate,x.months/12,12);return {'Required monthly saving':Math.max(0,(x.goal-start)/factor),'Starting savings at deadline':start};});
add('roi-calculator','ROI Calculator','finance','Calculate the percentage return and gain or loss on an investment.',[pos('cost','Amount invested',1000),num('value','Final value including distributions',1200)],
 'ROI (%) = (final value − initial investment) ÷ initial investment × 100.',
 'Include cash distributions in final value and costs in the initial amount. This is a total-period return, not an annualized return.',
 'An investment costing 1,000 with a final value of 1,200 returns 20%, or 200.',
 ['Can I compare investments held for different lengths of time?','Total ROI ignores time. Compare equal periods or use annualized return for a time-adjusted comparison.'],
 x=>({'ROI (%)':(x.value-x.cost)/x.cost*100,'Gain or loss':x.value-x.cost}));
add('present-value-calculator','Present Value Calculator','finance','Discount a future lump sum into its equivalent value today.',[num('value','Future amount',10000),rate(),num('years','Years until receipt',5,{max:100})],
 'Present value = future amount ÷ (1 + annual discount rate ÷ 100)^years.',
 'The discount rate is your assumed annual effective return or opportunity cost. The calculation models a single future payment.',
 '1,100 received in one year discounted at 10% has a present value of 1,000.',
 ['Is the discount rate an inflation forecast?','It can reflect inflation or an opportunity cost, but you must choose and enter the assumption yourself.'],
 x=>({'Present value':x.value/(1+x.rate/100)**x.years}));
add('debt-payoff-calculator','Debt Payoff Calculator','finance','Estimate months and interest needed to repay a debt with a fixed monthly payment.',[num('balance','Current balance',5000),rate(),pos('amount','Monthly payment',200)],
 'Each month: interest = balance × annual rate ÷ 1,200; new balance = balance + interest − payment. The final payment is reduced to the amount due.',
 'The rate and payment remain fixed with no new borrowing or fees. Actual credit cards may accrue interest daily. Payments that cannot cover interest are rejected.',
 'A balance of 1,000 paid at 100 per month with zero interest takes 10 months.',
 ['Why is my payment rejected?','A payment at or below monthly interest does not reduce the starting balance, so it cannot pay off the debt.'],
 x=>{const r=payoff(x.balance,x.rate,x.amount);return {'Months to repay':r.months,'Total repaid':r.total,'Total interest':r.total-x.balance};});
add('loan-comparison-calculator','Loan Comparison Calculator','finance','Compare payments and lifetime interest for two fixed-rate loan offers.',[num('p','Amount borrowed',10000),num('rateA','Offer A annual rate (%)',5,{max:100}),count('monthsA','Offer A months',60,{max:1200}),num('rateB','Offer B annual rate (%)',6,{max:100}),count('monthsB','Offer B months',48,{max:1200})],
 'Calculate each payment using the amortizing-loan formula; total interest = monthly payment × number of payments − principal.',
 'Both offers finance the same amount and exclude fees. A lower monthly payment may cost more overall if the term is longer.',
 'At zero interest, 12,000 over 12 months costs 1,000 monthly; over 24 months it costs 500 monthly. Both repay 12,000.',
 ['Which offer is better?','Compare both affordability and total cost. This mathematical comparison does not evaluate contract terms or your financial circumstances.'],
 x=>{const a=payment(x.p,x.rateA,x.monthsA),b=payment(x.p,x.rateB,x.monthsB);return {'A monthly payment':a,'B monthly payment':b,'A total interest':a*x.monthsA-x.p,'B total interest':b*x.monthsB-x.p};});
add('annualized-return-calculator','Annualized Return Calculator','finance','Convert growth between a beginning and ending value into a compound annual return.',[pos('start','Beginning value',1000),num('end','Ending value',1500),years()],
 'Annualized return (%) = ((ending value ÷ beginning value)^(1 ÷ years) − 1) × 100.',
 'Assumes no intermediate deposits or withdrawals. This is the constant yearly rate matching the endpoints, not the arithmetic average of annual returns.',
 'Growth from 100 to 121 over 2 years is a compound annual return of 10%.',
 ['Can the return be negative?','Yes. A lower ending value produces a negative rate; a total loss produces −100%.'],
 x=>({'Annualized return (%)':((x.end/x.start)**(1/x.years)-1)*100}));
add('profit-margin-calculator','Profit Margin Calculator','business','Calculate gross profit, sales margin and cost markup from cost and selling price.',[num('cost','Cost',60),num('price','Selling price',100)],
 'Profit = price − cost. Margin = profit ÷ price × 100. Markup = profit ÷ cost × 100.',
 'Margin and markup have different denominators. A zero denominator makes its percentage undefined; it is not reported as zero. This excludes overhead and tax.',
 'Cost of 60 and a price of 100 give 40 profit, 40% margin and 66.67% markup.',
 ['Why are margin and markup different?','Margin expresses profit as a share of sales. Markup expresses it as a share of the cost you paid.'],
 x=>({'Gross profit':x.price-x.cost,'Margin (%)':x.price?((x.price-x.cost)/x.price*100):'Undefined: selling price is zero','Markup (%)':x.cost?((x.price-x.cost)/x.cost*100):'Undefined: cost is zero'}));
add('markup-calculator','Markup Calculator','business','Set a selling price by adding a chosen percentage to product cost.',[num('cost','Cost',60),num('markup','Markup (%)',25)],
 'Markup amount = cost × markup ÷ 100. Price = cost + markup amount.',
 'Markup is applied to cost, not to selling price. Sales tax and overhead are not automatically included.',
 'A cost of 80 marked up by 25% gives a price of 100 and a markup amount of 20.',
 ['Does 25% markup mean 25% margin?','No. An 80 cost and 100 price have a 20% margin because profit is divided by the selling price.'],
 x=>({'Selling price':x.cost*(1+x.markup/100),'Markup amount':x.cost*x.markup/100}));
add('break-even-calculator','Break-Even Calculator','business','Find the minimum whole units needed to cover fixed and variable costs.',[num('fixed','Fixed costs',1000),pos('price','Selling price per unit',25),num('variable','Variable cost per unit',15)],
 'Contribution = price − variable cost. Break-even units = round up(fixed costs ÷ contribution).',
 'All units sell at the same price and have the same variable cost. Price must exceed variable cost. Capacity limits and step changes in costs are not modeled.',
 'Fixed costs of 1,000 and contribution of 10 per unit require 100 sales to break even.',
 ['Why round up?','A fraction of a sale cannot cover the remaining cost when you sell whole units.'],
 x=>{assert(x.price>x.variable,'Price must exceed variable cost.');const n=Math.ceil(x.fixed/(x.price-x.variable));return {'Whole units to break even':n,'Revenue at those units':n*x.price,'Contribution per unit':x.price-x.variable};});
add('commission-calculator','Commission Calculator','business','Estimate percentage commission plus an optional fixed base payment.',[num('sales','Eligible sales',10000),num('rate','Commission rate (%)',5,{max:100}),num('base','Base pay for this period',0)],
 'Commission = eligible sales × rate ÷ 100. Total pay = commission + base pay.',
 'This models one flat rate. Returns, quotas, tiered rates and tax withholding are excluded. Use the same period for sales and base pay.',
 '10,000 eligible sales at 5% earns 500 commission; with 1,000 base pay the total is 1,500.',
 ['Can I use this for a tiered plan?','Calculate each tier separately and add the amounts. A flat rate across all sales may overstate or understate a tiered commission.'],
 x=>({'Commission':x.sales*x.rate/100,'Total pay':x.base+x.sales*x.rate/100}));
add('salary-hourly-calculator','Hourly to Salary Calculator','business','Convert an hourly wage into weekly, average monthly and annual gross pay.',[num('rate','Hourly pay',25),num('hours','Paid hours per week',40,{max:168}),num('weeks','Paid weeks per year',52,{max:53})],
 'Annual pay = hourly pay × weekly hours × paid weeks. Average monthly pay = annual pay ÷ 12.',
 'Use paid weeks, including paid leave where applicable. These are gross amounts before deductions and do not apply statutory overtime rules. Any currency, including AED, works if used consistently.',
 '25 per hour for 40 hours over 52 paid weeks is 52,000 per year, or 4,333.33 per average month.',
 ['Why is monthly pay not weekly pay times four?','A year has more than 48 weeks. Dividing the annual amount by 12 gives a consistent monthly average.'],
 x=>({'Annual gross pay':x.rate*x.hours*x.weeks,'Average monthly gross pay':x.rate*x.hours*x.weeks/12,'Weekly gross pay':x.rate*x.hours}));
add('salary-to-hourly-calculator','Salary to Hourly Calculator','business','Estimate the hourly equivalent of an annual salary using your paid work schedule.',[num('salary','Annual gross salary',52000),pos('hours','Paid hours per week',40,{max:168}),pos('weeks','Paid weeks per year',52,{max:53})],
 'Hourly equivalent = annual salary ÷ (hours per week × paid weeks per year).',
 'This is an average gross equivalent, not an overtime entitlement or legal pay calculation. Use AED or another currency consistently.',
 'An annual salary of 52,000 over 40 hours and 52 weeks is equivalent to 25 per hour.',
 ['Should unpaid leave count as paid weeks?','No. Reduce paid weeks to reflect the schedule you are comparing.'],
 x=>({'Hourly equivalent':x.salary/(x.hours*x.weeks),'Monthly gross salary':x.salary/12}));
add('net-profit-calculator','Net Profit Calculator','business','Calculate profit after the business costs and tax expense you enter.',[num('revenue','Revenue',10000),num('goods','Cost of goods sold',4000),num('expenses','Other operating and financing expenses',3000),num('tax','Tax expense',500)],
 'Net profit = revenue − cost of goods sold − other expenses − tax expense.',
 'Enter expenses for the same reporting period. Tax is an input, not a calculation of legal liability. Avoid counting the same expense twice.',
 '10,000 revenue minus 4,000 goods, 3,000 other expenses and 500 tax leaves 2,500 net profit.',
 ['Is a negative result possible?','Yes. A negative result is a net loss for the period based on the costs you entered.'],
 x=>{const p=x.revenue-x.goods-x.expenses-x.tax;return {'Net profit or loss':p,'Net margin (%)':x.revenue?p/x.revenue*100:'Undefined: revenue is zero'};});
add('revenue-growth-calculator','Revenue Growth Calculator','business','Compare business revenue across two comparable reporting periods.',[pos('old','Earlier period revenue',10000),num('current','Later period revenue',12500)],
 'Revenue growth (%) = (later revenue − earlier revenue) ÷ earlier revenue × 100.',
 'Compare periods of equal length and consistent accounting treatment. The earlier revenue must be positive; this is not a profit-growth calculation.',
 'Revenue rising from 10,000 to 12,500 is an increase of 2,500, or 25%.',
 ['Can I compare a month with a full year?','The arithmetic works but the percentage is misleading. Compare equal-length periods such as the same month in successive years.'],
 x=>({'Revenue growth (%)':(x.current-x.old)/x.old*100,'Revenue difference':x.current-x.old}));
add('discount-calculator','Discount Calculator','shopping','Find the sale price and saving from a percentage discount.',[num('price','Original price',100),num('discount','Discount (%)',20,{max:100})],
 'Saving = price × discount ÷ 100. Sale price = price − saving.',
 'The discount applies once to the entered price. Taxes, shipping and coupons are excluded unless already in that price.',
 'A 20% discount on 100 saves 20 and leaves a sale price of 80.',
 ['Can a discount exceed 100%?','Not for a normal sale price. This calculator accepts discounts from 0% through 100%.'],
 x=>({'Sale price':x.price*(1-x.discount/100),'You save':x.price*x.discount/100}));
add('unit-price-calculator','Unit Price Calculator','shopping','Compare two packages by cost per matching unit of quantity.',[num('price','Package A price',6),pos('qty','Package A quantity',750),num('priceB','Package B price',9),pos('qtyB','Package B quantity',1000)],
 'Unit price = package price ÷ quantity. Compare the two unit prices in the same measurement unit.',
 'Both quantities must use the same unit, such as grams, litres or pieces. Shipping and quality differences are outside the comparison.',
 'A 750 g package costing 6 costs 0.008 per gram; a 1,000 g package costing 9 costs 0.009 per gram. Package A is cheaper per gram.',
 ['Can I compare grams with kilograms directly?','Convert both quantities to the same unit first; otherwise the unit-price comparison will be wrong.'],
 x=>({'Package A price per unit':x.price/x.qty,'Package B price per unit':x.priceB/x.qtyB,'Lower unit price':x.price/x.qty===x.priceB/x.qtyB?'Equal':x.price/x.qty<x.priceB/x.qtyB?'Package A':'Package B'}));
add('tip-calculator','Tip & Split Bill Calculator','shopping','Calculate a percentage tip and share the total equally between people.',[num('bill','Bill amount',100),num('tip','Tip (%)',15,{max:100}),count('people','People',2,{max:10000})],
 'Tip = bill × tip rate ÷ 100. Total = bill + tip. Share = total ÷ people.',
 'Shares are equal and may need a minor rounding adjustment when paid in currency. The bill is the amount you want to tip on; gratuities already charged are not detected.',
 'A bill of 100 plus a 15% tip is 115, or 57.50 each for two people.',
 ['Is the tip calculated before tax?','It is calculated on the bill amount you enter. Enter a before-tax subtotal if that is your preference.'],
 x=>({'Total including tip':x.bill*(1+x.tip/100),'Tip':x.bill*x.tip/100,'Per person':x.bill*(1+x.tip/100)/x.people}));
add('vat-calculator','VAT Calculator','business','Add VAT to a net price or extract it from a tax-inclusive total using your own rate.',[num('price','Amount',100),num('rate','VAT rate (%)',5,{max:100}),sel('mode','Amount entered',[['net','Before VAT'],['gross','Including VAT']])],
 'Gross = net × (1 + rate ÷ 100). Net = gross ÷ (1 + rate ÷ 100). VAT = gross − net.',
 'The rate is editable and this tool does not decide whether a supply is taxable, exempt or zero-rated. For UAE examples, 5% is the standard rate according to the Federal Tax Authority; confirm treatment before invoicing.',
 'At 5%, a net amount of 100 becomes 105. Extracting VAT from 105 returns net 100 and VAT 5.',
 ['Can I subtract 5% from an inclusive price?','No. Divide by 1.05 to remove 5% VAT. Subtracting 5% of the gross price removes too much.'],
 x=>{const n=x.mode==='gross'?x.price/(1+x.rate/100):x.price,g=n*(1+x.rate/100);return {'Net amount':n,'VAT amount':g-n,'Gross amount':g};},
 {sources:[['UAE Federal Tax Authority: VAT FAQ','https://tax.gov.ae/en/faq.aspx?keyword=Does+VAT+apply+to+all+goods+and+services%3F']]} );
add('sales-tax-calculator','Sales Tax Calculator','shopping','Calculate sales tax and checkout total using an editable combined tax rate.',[num('price','Taxable subtotal',100),num('rate','Combined sales tax rate (%)',8,{max:100})],
 'Sales tax = taxable subtotal × rate ÷ 100. Total = subtotal + tax.',
 'Enter the applicable combined rate yourself. Exempt items, tax holidays, shipping rules and jurisdiction-specific rounding are not determined here.',
 'A taxable subtotal of 100 at 8% sales tax adds 8, for a total of 108.',
 ['Does this find my local tax rate?','No. Use a rate from the relevant tax authority and enter only the taxable subtotal.'],
 x=>({'Sales tax':x.price*x.rate/100,'Total including tax':x.price*(1+x.rate/100)}));
add('successive-discounts-calculator','Successive Discounts Calculator','shopping','Combine two sequential discounts without incorrectly adding their percentages.',[num('price','Original price',100),num('first','First discount (%)',20,{max:100}),num('second','Second discount (%)',10,{max:100})],
 'Final price = original × (1 − first ÷ 100) × (1 − second ÷ 100).',
 'The second discount applies to the already discounted price. This assumes both promotions can be combined and excludes tax.',
 '20% off then another 10% off a price of 100 gives 72, equivalent to 28% off.',
 ['Why is 20% plus 10% not 30% off?','The second 10% is taken from 80, so it saves 8 rather than 10.'],
 x=>{const f=(1-x.first/100)*(1-x.second/100);return {'Final price':x.price*f,'Equivalent discount (%)':(1-f)*100,'Total saving':x.price*(1-f)};});
add('percentage-calculator','Percentage Calculator','math','Find a percentage of a value and the value after a percentage increase or decrease.',[signed('value','Value',200),signed('percent','Percentage (%)',15)],
 'Part = value × percentage ÷ 100. Increased value = value + part. Decreased value = value − part.',
 'Signed inputs are supported. A negative percentage reverses the direction of increase and decrease. For the percentage between two values use Percentage Change.',
 '15% of 200 is 30. Increasing 200 by 15% gives 230; decreasing it gives 170.',
 ['How do I enter fifteen percent?','Enter 15, not 0.15. The calculator divides the percentage by 100.'],
 x=>({'Percentage of value':x.value*x.percent/100,'After increase':x.value*(1+x.percent/100),'After decrease':x.value*(1-x.percent/100)}));
add('percentage-change-calculator','Percentage Change Calculator','math','Measure a relative increase or decrease between an old and new value.',[signed('old','Old value',80),signed('current','New value',100)],
 'Change (%) = (new − old) ÷ absolute value of old × 100.',
 'A zero starting value has no defined percentage change. For negative starting values we explicitly use the absolute denominator so a numerical increase stays positive.',
 'A rise from 80 to 100 is a difference of 20 and a percentage increase of 25%.',
 ['Why does reversing the values change the percentage?','The base changes. Falling from 100 to 80 is 20%, while rising from 80 to 100 is 25%.'],
 x=>{assert(x.old!==0,'Old value cannot be zero for percentage change.');return {'Change (%)':(x.current-x.old)/Math.abs(x.old)*100,'Difference':x.current-x.old};});
add('percentage-of-total-calculator','Percentage of Total Calculator','math','Find what percentage one quantity represents of a total.',[signed('part','Part',25),signed('total','Total',200)],
 'Percentage = part ÷ total × 100.',
 'The total cannot be zero. Values over 100% are possible if the part exceeds a positive total; signed values are accepted for mathematical use.',
 '25 out of 200 represents 12.5% of the total.',
 ['Can the result exceed 100%?','Yes. For example, 250 relative to a total of 200 is 125%.'],
 x=>{assert(x.total!==0,'Total cannot be zero.');return {'Percentage of total (%)':x.part/x.total*100};});
const list={key:'values',label:'Numbers (comma or space separated)',type:'list',value:'10, 20, 30, 40'};
add('average-calculator','Average Calculator','math','Calculate the arithmetic mean, sum and count of a list of numbers.',[list],
 'Mean = sum of values ÷ number of values.',
 'All values have equal weight. Use commas or spaces to separate numbers and a dot as the decimal separator; commas are not thousands separators.',
 'For 10, 20, 30 and 40, the sum is 100 and the arithmetic mean is 25.',
 ['Can I include negative numbers?','Yes. For example, −10 and 10 have an average of zero.'],
 x=>({'Mean':x.values.reduce((a,b)=>a+b,0)/x.values.length,'Sum':x.values.reduce((a,b)=>a+b,0),'Count':x.values.length}));
add('median-calculator','Median Calculator','math','Find the middle value and range of a numeric list.',[list],
 'Sort values. For an odd count, take the middle value; for an even count, average the two middle values.',
 'The median is less affected by extreme values than the mean. Enter raw observations, not frequency counts.',
 'For 1, 2 and 100, the median is 2. For 1, 2, 3 and 100 it is 2.5.',
 ['Does the input order matter?','No. Values are sorted numerically before the median is selected.'],
 x=>{const a=[...x.values].sort((a,b)=>a-b),n=a.length;return {'Median':n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,'Minimum':a[0],'Maximum':a[n-1],'Range':a[n-1]-a[0]};});
add('ratio-calculator','Ratio Simplifier','math','Reduce two whole-number quantities to their simplest ratio.',[num('a','First quantity',24,{integer:true}),num('b','Second quantity',36,{integer:true})],
 'Divide both quantities by their greatest common divisor.',
 'Use nonnegative whole numbers. Both sides cannot be zero. Decimal ratios can be multiplied by a power of ten before entry.',
 '24:36 reduces to 2:3 because both sides divide by 12.',
 ['Can one side be zero?','Yes. 0:5 reduces to 0:1, but 0:0 has no meaningful simplified ratio.'],
 x=>{const g=gcd(x.a,x.b);assert(g>0,'Both quantities cannot be zero.');return {'Simplified ratio':`${x.a/g}:${x.b/g}`,'Common divisor':g};});
add('proportion-calculator','Proportion Calculator','math','Solve the missing value in a proportion of the form a/b = c/x.',[signed('a','a',2),signed('b','b',3),signed('c','c',10)],
 'For a ÷ b = c ÷ x, cross multiplication gives x = b × c ÷ a.',
 'This solver requires a, b and c to be nonzero so both ratios have valid nonzero denominators and a unique solution.',
 'For 2/3 = 10/x, x = 3 × 10 ÷ 2 = 15.',
 ['Can I use this for recipe scaling?','Yes. Match the original and new quantities consistently on the two sides of the proportion.'],
 x=>{assert(x.a!==0&&x.b!==0&&x.c!==0,'Use nonzero a, b and c for a unique valid proportion.');return {'Missing x':x.b*x.c/x.a};});
add('fraction-calculator','Fraction Calculator','math','Add, subtract, multiply or divide two fractions and simplify the answer.',[signed('a','First numerator',1,{integer:true,max:1000000,min:-1000000}),count('b','First denominator',2,{max:1000000}),sel('op','Operation',[['add','Add'],['subtract','Subtract'],['multiply','Multiply'],['divide','Divide']]),signed('c','Second numerator',1,{integer:true,max:1000000,min:-1000000}),count('d','Second denominator',3,{max:1000000})],
 'Addition: (ad + bc)/bd. Subtraction: (ad − bc)/bd. Multiplication: ac/bd. Division: ad/bc. Reduce with the greatest common divisor.',
 'Denominators must be positive whole numbers. Put a negative sign in the numerator. Inputs are limited to one million to keep integer arithmetic exact.',
 '1/2 + 1/3 = (3 + 2)/6 = 5/6, approximately 0.833333.',
 ['Can I divide by a zero fraction?','No. A fraction with numerator zero cannot be used as the divisor.'],
 x=>{let n,d;if(x.op==='add'||x.op==='subtract'){n=x.a*x.d+(x.op==='add'?1:-1)*x.c*x.b;d=x.b*x.d;}else if(x.op==='multiply'){n=x.a*x.c;d=x.b*x.d;}else{assert(x.c!==0,'Cannot divide by a zero fraction.');n=x.a*x.d;d=x.b*x.c;}if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {'Simplified fraction':`${n/g}/${d/g}`,'Decimal':n/d};});
add('power-calculator','Power Calculator','math','Raise a number to an integer or fractional power in the real-number system.',[signed('base','Base',2),signed('exponent','Exponent',10,{min:-1000,max:1000})],
 'Result = base raised to the exponent. A negative exponent gives the reciprocal of the corresponding positive power.',
 'Zero to a nonpositive power is excluded. Negative bases require integer exponents here. Results outside reliable finite output are rejected.',
 '2 raised to 10 is 1,024; 2 raised to −3 is 0.125.',
 ['Can I calculate a root?','For a positive base, a power of 0.5 gives the square root.'],
 x=>{assert(!(x.base===0&&x.exponent<=0),'Zero requires a positive exponent.');assert(x.base>=0||Number.isInteger(x.exponent),'Negative bases require an integer exponent.');return {'Power':x.base**x.exponent};});
add('square-root-calculator','Square Root Calculator','math','Find the principal nonnegative square root of a real number.',[num('value','Number',144)],
 'The principal square root is the nonnegative number r satisfying r × r = value.',
 'Negative input requires complex numbers and is not supported here. A square-root result is distinct from the two solutions of x² = value.',
 'The principal square root of 144 is 12 because 12 × 12 = 144.',
 ['Is −12 also a square root of 144?','It squares to 144, but the square-root symbol refers to the principal, nonnegative root.'],
 x=>({'Principal square root':Math.sqrt(x.value)}));
add('quadratic-equation-calculator','Quadratic Equation Calculator','math','Solve ax² + bx + c = 0 for real roots and inspect the discriminant.',[signed('a','Coefficient a',1),signed('b','Coefficient b',-3),signed('c','Coefficient c',2)],
 'Discriminant D = b² − 4ac. Roots = (−b ± √D) ÷ 2a.',
 'Coefficient a must be nonzero. Negative discriminants have no real roots. A numerically stable equivalent formula is used to reduce cancellation for unequal roots.',
 'x² − 3x + 2 = 0 has discriminant 1 and roots 1 and 2.',
 ['What does a zero discriminant mean?','Both real roots coincide at −b/(2a), often called a repeated root.'],
 x=>{assert(x.a!==0,'Coefficient a cannot be zero for a quadratic.');const d=x.b*x.b-4*x.a*x.c;if(d<0)return {'Discriminant':d,'Roots':'No real roots'};if(d===0)return {'Discriminant':d,'Repeated root':-x.b/(2*x.a)};const q=-0.5*(x.b+(x.b>=0?1:-1)*Math.sqrt(d));return {'Discriminant':d,'Root 1':q/x.a,'Root 2':x.c/q};});
add('circle-calculator','Circle Area & Circumference Calculator','math','Calculate a circle’s area, circumference and diameter from its radius.',[num('radius','Radius (units)',5)],
 'Area = πr². Circumference = 2πr. Diameter = 2r.',
 'Use any consistent length unit. Area is reported in the corresponding squared unit; circumference and diameter use the original unit.',
 'A radius of 5 gives an area of about 78.54 square units and circumference of 31.42 units.',
 ['I have the diameter. What should I enter?','Divide the diameter by two to obtain the radius.'],
 x=>({'Area (square units)':Math.PI*x.radius**2,'Circumference (units)':2*Math.PI*x.radius,'Diameter (units)':2*x.radius}));
add('triangle-area-calculator','Triangle Area Calculator','math','Calculate triangle area from a base and its perpendicular height.',[num('base','Base (units)',10),num('height','Perpendicular height (units)',6)],
 'Triangle area = base × perpendicular height ÷ 2.',
 'Height must be measured perpendicular to the chosen base, not along a sloping side. Both lengths must use the same unit.',
 'A base of 10 and perpendicular height of 6 give an area of 30 square units.',
 ['Can the height fall outside the triangle?','Yes. For an obtuse triangle, the perpendicular height can meet an extension of the base.'],
 x=>({'Area (square units)':x.base*x.height/2}));
add('pythagorean-calculator','Pythagorean Theorem Calculator','math','Find the hypotenuse of a right triangle from its two perpendicular sides.',[pos('a','First perpendicular side',3),pos('b','Second perpendicular side',4)],
 'Hypotenuse c = √(a² + b²).',
 'This applies only to a right triangle. Enter the two sides adjacent to the right angle in the same length unit.',
 'Perpendicular sides of 3 and 4 give a hypotenuse of 5.',
 ['Does this work for every triangle?','No. The angle between the two entered sides must be exactly 90 degrees.'],
 x=>({'Hypotenuse':Math.hypot(x.a,x.b)}));
add('cylinder-volume-calculator','Cylinder Volume Calculator','math','Find the volume and total surface area of a closed circular cylinder.',[num('radius','Radius (units)',3),num('height','Height (units)',10)],
 'Volume = πr²h. Closed surface area = 2πr(r + h).',
 'The cylinder has a constant circular cross-section. Surface area includes both end circles and the curved wall. Use consistent units.',
 'Radius 3 and height 10 give a volume of about 282.74 cubic units.',
 ['Does surface area include the ends?','Yes, both circular ends are included. An open container needs a different surface-area total.'],
 x=>({'Volume (cubic units)':Math.PI*x.radius**2*x.height,'Closed surface area (square units)':2*Math.PI*x.radius*(x.radius+x.height)}));
add('sphere-calculator','Sphere Calculator','math','Calculate volume and surface area of a sphere from its radius.',[num('radius','Radius (units)',3)],
 'Volume = 4πr³ ÷ 3. Surface area = 4πr².',
 'This models a complete sphere, not a hemisphere or hollow shell. For a hollow object calculate the inner and outer volumes separately.',
 'A radius of 3 gives both a volume of about 113.10 cubic units and an area of 113.10 square units.',
 ['What if I measured the diameter?','Halve the diameter before entering the radius.'],
 x=>({'Volume (cubic units)':4*Math.PI*x.radius**3/3,'Surface area (square units)':4*Math.PI*x.radius**2}));
add('age-calculator','Age Calculator','dates','Calculate completed years of age on a date you choose.',[dt('birth','Date of birth','1990-06-15'),dt('asof','Age on date','2026-09-19')],
 'Completed years = reference year − birth year, minus one if the birthday has not yet occurred in the reference year.',
 'Future births relative to the reference date are rejected. A February 29 birthday is treated as occurring on March 1 in non-leap years; legal conventions can differ.',
 'Someone born on June 15, 1990 is 36 on September 19, 2026, and 35 on June 14, 2026.',
 ['Is this a legal age determination?','No. This uses a stated calendar convention; legal rules for leap-day birthdays or eligibility may differ.'],
 x=>{const b=date(x.birth),a=date(x.asof);assert(a>=b,'Age-on date must not be before birth.');let age=a.getUTCFullYear()-b.getUTCFullYear();if(a.getUTCMonth()<b.getUTCMonth()||(a.getUTCMonth()===b.getUTCMonth()&&a.getUTCDate()<b.getUTCDate()))age--;return {'Completed years':age,'Calendar days lived':days(x.birth,x.asof)};});
add('days-between-dates','Days Between Dates Calculator','dates','Count elapsed calendar days between two dates without daylight-saving errors.',[dt('start','Start date','2026-01-01'),dt('end','End date','2026-02-01')],
 'Elapsed days = absolute difference between UTC-midnight dates ÷ 86,400,000 milliseconds.',
 'The start day is excluded. Both dates can be reversed without changing the absolute interval. These are calendar days, not elapsed local-clock hours.',
 'January 1 to February 1, 2026 is 31 elapsed calendar days; January 1 to itself is zero.',
 ['How do I include both dates?','For an inclusive count of calendar dates, add one to the elapsed-day result.'],
 x=>({'Elapsed calendar days':Math.abs(days(x.start,x.end)),'Inclusive count of dates':Math.abs(days(x.start,x.end))+1}));
add('add-days-calculator','Add or Subtract Days Calculator','dates','Find the date a signed number of calendar days before or after a starting date.',[dt('start','Starting date','2026-01-01'),signed('offset','Days to add (negative to subtract)',30,{integer:true,min:-3650000,max:3650000})],
 'Result date = starting UTC-midnight date + signed day count × 86,400,000 milliseconds.',
 'All calendar days count, including weekends and holidays. Dates must remain within years 0001 through 9999.',
 'Adding 30 days to January 1, 2026 gives January 31, 2026. Subtracting 1 gives December 31, 2025.',
 ['Are weekends skipped?','No. Use a business-day calculation when you need to exclude weekend days.'],
 x=>({'Result date':iso(new Date(+date(x.start)+x.offset*86400000))}));
add('business-days-calculator','Business Days Calculator','dates','Count Monday–Friday dates or Sunday–Thursday dates between two calendar dates.',[dt('start','Start date (included)','2026-01-05'),dt('end','End date (excluded)','2026-01-12'),sel('weekend','Weekend days',[['sat-sun','Saturday and Sunday'],['fri-sat','Friday and Saturday']])],
 'Count five working days for each full week, then count non-weekend dates in the remaining partial week.',
 'Start is included and end is excluded. Holidays and organization-specific closures are not deducted. The weekend choice is a scheduling option, not a statement of local employment rules.',
 'Monday January 5 through Monday January 12, 2026 contains five weekdays when the end date is excluded.',
 ['Does this subtract public holidays?','No. Subtract applicable holidays yourself if they fall on otherwise counted workdays.'],
 x=>{const n=days(x.start,x.end);assert(n>=0,'End date must be on or after start date.');const weekend=x.weekend==='sat-sun'?[6,0]:[5,6];let total=Math.floor(n/7)*5;const day=date(x.start).getUTCDay();for(let i=0;i<n%7;i++)if(!weekend.includes((day+i)%7))total++;return {'Business days (excluding holidays adjustment)':total,'Calendar days':n};});
add('weeks-between-dates-calculator','Weeks Between Dates Calculator','dates','Express a calendar interval as complete weeks and remaining days.',[dt('start','Start date','2026-01-01'),dt('end','End date','2026-02-01')],
 'Complete weeks = floor(elapsed days ÷ 7). Remaining days = elapsed days modulo 7.',
 'Uses the absolute elapsed interval and excludes the starting date. A week is always seven days; this does not count ISO calendar week numbers.',
 'A 31-day interval is 4 complete weeks and 3 remaining days.',
 ['Are these calendar week numbers?','No. This divides elapsed days into seven-day groups regardless of the weekday on which you start.'],
 x=>{const n=Math.abs(days(x.start,x.end));return {'Complete weeks':Math.floor(n/7),'Remaining days':n%7,'Decimal weeks':n/7};});
add('months-between-dates-calculator','Months Between Dates Calculator','dates','Count complete calendar months using the starting day as the monthly anniversary.',[dt('start','Start date','2026-01-15'),dt('end','End date','2026-04-14')],
 'Months = (end year − start year) × 12 + end month − start month; subtract one if the end day is earlier than the start day.',
 'End must not precede start. The same day-of-month is required for a complete month; January 31 to February 28 is zero complete months under this convention.',
 'January 15 to April 14 is two complete months; through April 15 it is three.',
 ['Is every month treated as 30 days?','No. This compares calendar fields and does not convert days using an average month length.'],
 x=>{const a=date(x.start),b=date(x.end);assert(b>=a,'End date must be on or after start date.');return {'Complete calendar months':(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth()-(b.getUTCDate()<a.getUTCDate()?1:0)};});
add('time-duration-calculator','Time Duration Calculator','dates','Calculate time between two clock readings, including an overnight interval.',[tm('start','Start time','09:00'),tm('end','End time','17:30'),sel('next','End day',[['same','Same day'],['next','Next day']])],
 'Duration in minutes = end clock minutes − start clock minutes + 1,440 if the end is next day.',
 'Select next day explicitly for an overnight interval. No timezone or daylight-saving adjustment is applied; this is a clock-time calculation.',
 '09:00 to 17:30 on the same day is 8 hours 30 minutes, or 8.5 decimal hours.',
 ['What happens when start and end are equal?','Same day gives zero; next day gives 24 hours.'],
 x=>{const n=x.end-x.start+(x.next==='next'?1440:0);assert(n>=0,'End time is earlier; select next day for an overnight interval.');return {'Hours and minutes':`${Math.floor(n/60)} h ${n%60} min`,'Decimal hours':n/60,'Total minutes':n};});
add('hours-worked-calculator','Hours Worked Calculator','dates','Calculate paid work hours after an unpaid break for a same-day or overnight shift.',[tm('start','Shift start','09:00'),tm('end','Shift end','17:30'),num('break','Unpaid break (minutes)',30,{max:1440}),sel('next','End day',[['same','Same day'],['next','Next day']])],
 'Paid minutes = end − start + overnight adjustment − unpaid break. Paid hours = paid minutes ÷ 60.',
 'Break time cannot exceed the shift. This does not apply overtime, rounding policies or labor-law rules; it only calculates the entered schedule.',
 '09:00 to 17:30 with a 30-minute unpaid break is 8 paid hours.',
 ['Does the result include paid breaks?','Paid breaks are already part of the shift; enter only the time that should be deducted.'],
 x=>{const n=x.end-x.start+(x.next==='next'?1440:0);assert(n>=0,'Select next day if the shift ends after midnight.');assert(x.break<=n,'Unpaid break cannot exceed the shift.');return {'Paid hours':(n-x.break)/60,'Shift hours before break':n/60};});
add('bmi-calculator','Adult BMI Calculator','fitness','Calculate adult body mass index from weight in kilograms and height in centimetres.',[pos('weight','Weight (kg)',70,{max:1000}),pos('height','Height (cm)',175,{max:300})],
 'BMI = weight in kilograms ÷ (height in metres)².',
 'For adults 20 and older. BMI is a screening measure, not a diagnosis or a direct measure of body fat. It does not account for muscle mass, pregnancy or individual medical circumstances.',
 'At 70 kg and 175 cm, BMI = 70 ÷ 1.75² = 22.86 kg/m².',
 ['Can I use this for a child?','No. Children and teens require age- and sex-specific interpretation. This tool does not provide that assessment.'],
 x=>({'BMI (kg/m²)':x.weight/(x.height/100)**2,'Interpretation':'Screening measure only; not a diagnosis.'}),{sources:[['CDC: adult BMI','https://www.cdc.gov/bmi/adult-calculator/index.html']]});
add('running-pace-calculator','Running Pace Calculator','fitness','Find running or walking pace per kilometre and per mile from distance and time.',[pos('distance','Distance (km)',5),pos('minutes','Time (minutes)',30)],
 'Pace in minutes/km = minutes ÷ distance. Minutes/mile = minutes/km × 1.609344. Speed = distance ÷ (minutes ÷ 60).',
 'Use elapsed time or moving time consistently. Decimal minutes are not minutes-and-seconds notation: 5.5 minutes means 5 minutes 30 seconds.',
 '5 km in 30 minutes gives a pace of 6 min/km and a speed of 10 km/h.',
 ['Can I use this for walking?','Yes. The distance-time relationship is the same for walking and running.'],
 x=>({'Pace (decimal min/km)':x.minutes/x.distance,'Pace (decimal min/mile)':x.minutes/x.distance*1.609344,'Speed (km/h)':x.distance/x.minutes*60}));
add('race-time-calculator','Race Time Calculator','fitness','Estimate finishing time from a planned constant pace and event distance.',[pos('distance','Distance (km)',10),pos('pace','Pace (decimal minutes/km)',6)],
 'Finishing time in minutes = distance × pace.',
 'Assumes a constant pace without stops. It is a pacing target, not a prediction based on fitness, elevation or weather.',
 'At 6 min/km, a 10 km event takes 60 minutes, or one hour.',
 ['How do I enter 5 minutes 30 seconds per kilometre?','Enter 5.5 because 30 seconds is half a minute.'],
 x=>({'Finishing time (minutes)':x.distance*x.pace,'Finishing time (hours)':x.distance*x.pace/60}));
add('pace-to-speed-calculator','Pace to Speed Calculator','fitness','Convert a minutes-per-kilometre pace into kilometres per hour and miles per hour.',[pos('pace','Pace (decimal minutes/km)',6)],
 'Speed in km/h = 60 ÷ pace in min/km. Speed in mph = km/h ÷ 1.609344.',
 'Pace must be greater than zero. This is a unit conversion and does not estimate exercise effort or calories.',
 'A 6 min/km pace is 10 km/h, or about 6.214 mph.',
 ['Why does a lower pace number mean faster movement?','It means fewer minutes are needed to cover each kilometre.'],
 x=>({'Speed (km/h)':60/x.pace,'Speed (mph)':60/x.pace/1.609344}));
add('fuel-cost-calculator','Fuel & Trip Cost Calculator','automotive','Estimate trip fuel use and cost from distance, consumption and price per litre.',[num('distance','Trip distance (km)',300),num('consumption','Consumption (L/100 km)',7),num('price','Fuel price per litre',3)],
 'Litres used = distance × consumption ÷ 100. Cost = litres × price per litre.',
 'Enter the total trip distance, including the return journey if needed. Consumption and prices are your assumptions; tolls, parking and maintenance are excluded.',
 '300 km at 7 L/100 km uses 21 litres. At 3 per litre the fuel costs 63.',
 ['Are fuel prices updated automatically?','No. Enter the current price you expect to pay; any currency including AED can be used.'],
 x=>({'Fuel needed (L)':x.distance*x.consumption/100,'Estimated fuel cost':x.distance*x.consumption/100*x.price}));
add('fuel-efficiency-calculator','Fuel Efficiency Calculator','automotive','Calculate measured fuel economy in L/100 km, km/L and US miles per gallon.',[pos('distance','Distance driven (km)',500),pos('fuel','Fuel used (L)',35)],
 'L/100 km = litres ÷ kilometres × 100. km/L = kilometres ÷ litres. US mpg = km/L × 3.785411784 ÷ 1.609344.',
 'For a tank-to-tank estimate, compare distance since the last full fill with litres added to refill. US gallons are distinct from imperial gallons.',
 '500 km using 35 litres gives 7 L/100 km and about 14.286 km/L.',
 ['Is a lower L/100 km better?','Yes. It means fewer litres are used over the same distance; higher km/L means better economy.'],
 x=>({'Consumption (L/100 km)':x.fuel/x.distance*100,'Economy (km/L)':x.distance/x.fuel,'Economy (US mpg)':x.distance/x.fuel*3.785411784/1.609344}));
add('mpg-converter','MPG Converter','automotive','Convert US or imperial miles per gallon to litres per 100 kilometres.',[pos('mpg','Miles per gallon',30),sel('gallon','Gallon definition',[['us','US gallon'],['imperial','Imperial gallon']])],
 'L/100 km = 100 × litres per gallon ÷ (MPG × 1.609344). US gallon = 3.785411784 L; imperial gallon = 4.54609 L.',
 'Choose the gallon definition used by your source. US and UK fuel-economy figures are not directly interchangeable.',
 '30 US mpg is about 7.840 L/100 km. The same numerical imperial mpg is about 9.416 L/100 km.',
 ['Why are imperial MPG figures higher for the same car?','An imperial gallon contains more fuel than a US gallon, so the vehicle travels more miles per gallon.'],
 x=>({'Consumption (L/100 km)':100*(x.gallon==='us'?3.785411784:4.54609)/(x.mpg*1.609344)}));
add('cost-per-kilometre-calculator','Cost per Kilometre Calculator','automotive','Estimate total driving cost per kilometre from distance and annual ownership costs.',[pos('distance','Annual distance (km)',15000),num('fuel','Annual fuel cost',3000),num('other','Other annual costs',2000)],
 'Cost per kilometre = (annual fuel cost + other annual costs) ÷ annual distance.',
 'Include insurance, maintenance, depreciation and fees in other costs if you want a broader ownership estimate. Avoid double-counting loan principal and depreciation.',
 '3,000 fuel plus 2,000 other costs across 15,000 km gives about 0.3333 per km.',
 ['Does the result include depreciation?','Only if you include an annual depreciation estimate in other costs.'],
 x=>({'Cost per kilometre':(x.fuel+x.other)/x.distance,'Annual total cost':x.fuel+x.other}));
add('annual-fuel-cost-calculator','Annual Fuel Cost Calculator','automotive','Budget yearly and average monthly fuel costs from annual mileage.',[num('distance','Annual distance (km)',15000),num('consumption','Consumption (L/100 km)',7),num('price','Fuel price per litre',3)],
 'Annual fuel = annual kilometres × L/100 km ÷ 100. Annual cost = fuel × price. Monthly average = annual cost ÷ 12.',
 'Uses a constant fuel price and consumption rate. Seasonal changes, idling and unusually heavy traffic can change actual use.',
 '15,000 km at 7 L/100 km and 3 per litre costs 3,150 annually, or 262.50 per average month.',
 ['Can I use an average fuel price?','Yes. A weighted average across your expected purchases can make a more useful budget than a single-day price.'],
 x=>({'Annual fuel (L)':x.distance*x.consumption/100,'Annual fuel cost':x.distance*x.consumption/100*x.price,'Monthly average cost':x.distance*x.consumption/1200*x.price}));
add('square-footage-calculator','Square Footage Calculator','home','Find rectangular floor area in square feet and square metres.',[num('length','Length (ft)',12),num('width','Width (ft)',10)],
 'Square feet = length × width. Square metres = square feet × 0.09290304.',
 'Enter decimal feet: 6 feet 6 inches is 6.5 feet. For an irregular floor, calculate rectangles separately and add the areas without overlap.',
 'A 12 ft by 10 ft room has 120 ft² of floor area, equal to 11.1483648 m².',
 ['Does this include waste for flooring?','No. This is the measured area. Use the flooring calculator to add waste and estimate material cost.'],
 x=>({'Floor area (ft²)':x.length*x.width,'Floor area (m²)':x.length*x.width*0.09290304}));
add('room-area-calculator','Room Area & Perimeter Calculator','home','Calculate metric rectangular floor area and wall perimeter.',[num('length','Length (m)',5),num('width','Width (m)',4)],
 'Area = length × width. Perimeter = 2 × (length + width).',
 'This assumes a rectangular room. Perimeter includes doors and openings; subtract those separately when estimating skirting or trim.',
 'A 5 m by 4 m room has 20 m² of floor area and an 18 m perimeter.',
 ['How do I handle an L-shaped room?','Split it into two non-overlapping rectangles, calculate each area, and add them. Do not add their perimeters directly.'],
 x=>({'Area (m²)':x.length*x.width,'Perimeter (m)':2*(x.length+x.width)}));
add('room-volume-calculator','Room Volume Calculator','home','Estimate the internal volume of a rectangular room from three dimensions.',[num('length','Length (m)',5),num('width','Width (m)',4),num('height','Height (m)',2.5)],
 'Volume = length × width × height.',
 'Assumes a flat ceiling and vertical walls. Sloped ceilings, alcoves and furniture displacement are not included; this is not an HVAC sizing calculation.',
 'A 5 m by 4 m room with a 2.5 m ceiling has a volume of 50 m³.',
 ['Can I use the volume to choose an air conditioner?','Volume alone is insufficient. Heat gain, insulation, windows and climate also matter.'],
 x=>({'Room volume (m³)':x.length*x.width*x.height,'Floor area (m²)':x.length*x.width}));
add('concrete-calculator','Concrete Slab Calculator','home','Estimate concrete volume for a rectangular slab with an adjustable ordering allowance.',[num('length','Length (m)',5),num('width','Width (m)',4),num('depth','Thickness (cm)',10),num('waste','Extra allowance (%)',10,{max:100})],
 'Net volume = length × width × thickness ÷ 100. Order volume = net volume × (1 + allowance ÷ 100).',
 'The slab is uniform and rectangular. Allowance covers the extra quantity you choose; it does not specify structural design, reinforcement or a suitable slab thickness.',
 'A 5 m by 4 m slab, 10 cm thick, needs 2 m³ net or 2.2 m³ with 10% extra.',
 ['Does this decide the correct slab thickness?','No. Enter a thickness specified for your project; the calculator only estimates quantity.'],
 x=>({'Net volume (m³)':x.length*x.width*x.depth/100,'With allowance (m³)':x.length*x.width*x.depth/100*(1+x.waste/100)}));
add('tile-calculator','Tile Calculator','home','Estimate whole tiles needed from area, tile dimensions and a waste allowance.',[num('area','Area to tile (m²)',20),pos('length','Tile length (cm)',30),pos('width','Tile width (cm)',30),num('waste','Waste allowance (%)',10,{max:100})],
 'Tile area = length × width ÷ 10,000. Tiles = round up(area × (1 + waste ÷ 100) ÷ tile area).',
 'Uses tile face dimensions and ignores grout joints. Cuts, pattern matching, breakage and pack sizes can increase the purchase quantity.',
 '20 m² using 30 × 30 cm tiles with 10% waste requires 245 whole tiles.',
 ['Why does the estimate ignore grout?','Grout can slightly reduce the tile count, but layout and cuts usually matter more. Confirm against a scaled layout for final ordering.'],
 x=>({'Whole tiles to order':Math.ceil(x.area*(1+x.waste/100)/(x.length*x.width/10000)),'Area including waste (m²)':x.area*(1+x.waste/100)}));
add('paint-calculator','Paint Calculator','home','Estimate litres of paint for a stated area, coat count and manufacturer coverage.',[num('area','Paintable area (m²)',40),pos('coverage','Coverage per coat (m²/L)',10),count('coats','Number of coats',2,{max:20})],
 'Paint litres = paintable area × number of coats ÷ coverage per litre per coat.',
 'Subtract unpainted openings from area. Coverage depends on the surface, product and method; primer is separate unless included in your figures.',
 '40 m² with two coats at 10 m²/L requires 8 litres before extra allowance.',
 ['Should I include windows and doors?','Exclude openings you will not paint. Include doors separately if they will receive the same paint.'],
 x=>({'Paint required (L)':x.area*x.coats/x.coverage}));
add('flooring-calculator','Flooring Calculator','home','Estimate flooring purchase area and material cost including waste.',[num('area','Net floor area (m²)',20),num('waste','Waste allowance (%)',10,{max:100}),num('price','Material price per m²',25),pos('pack','Coverage per pack (m²)',2)],
 'Required area = net area × (1 + waste ÷ 100). Packs = round up(required area ÷ pack coverage). Purchase cost = packs × pack coverage × price per m².',
 'Cost reflects whole packs, not just measured area. Labor, underlay, delivery and trim are excluded. Use the manufacturer’s pack coverage.',
 '20 m² plus 10% waste is 22 m². With 2 m² packs, buy 11 packs; at 25/m² the material cost is 550.',
 ['Why can purchased area exceed the waste-adjusted area?','Flooring is often sold in full packs, so the final pack is rounded up.'],
 x=>{const area=x.area*(1+x.waste/100),packs=Math.ceil(area/x.pack);return {'Required area (m²)':area,'Whole packs':packs,'Purchased area (m²)':packs*x.pack,'Material cost':packs*x.pack*x.price};});
add('wallpaper-calculator','Wallpaper Calculator','home','Estimate wallpaper rolls using wall perimeter, height and pattern allowance.',[num('perimeter','Total wall perimeter (m)',18),pos('height','Wall height (m)',2.5),pos('width','Roll width (m)',0.53),pos('length','Roll length (m)',10),num('extra','Extra per strip for trimming/pattern (m)',0.1)],
 'Strip length = wall height + extra. Strips per roll = floor(roll length ÷ strip length). Rolls = round up(round up(perimeter ÷ roll width) ÷ strips per roll).',
 'This conservatively includes openings in the perimeter and assumes full-height strips. Enter enough extra length for trimming and pattern repeat matching.',
 'An 18 m perimeter, 2.5 m height, 0.53 × 10 m rolls and 0.1 m extra gives 34 strips, three per roll, so 12 rolls.',
 ['Why not divide wall area by roll area?','Roll offcuts may be too short for a full-height strip. Counting usable strips better reflects this waste.'],
 x=>{const per=Math.floor(x.length/(x.height+x.extra));assert(per>=1,'Roll must fit at least one full strip including allowance.');return {'Rolls to order':Math.ceil(Math.ceil(x.perimeter/x.width)/per),'Required strips':Math.ceil(x.perimeter/x.width),'Strips per roll':per};});
add('brick-calculator','Brick Calculator','home','Estimate brick count from wall area and brick face dimensions including mortar joints.',[num('area','Net wall area (m²)',10),pos('length','Brick face length (mm)',215),pos('height','Brick face height (mm)',65),num('joint','Mortar joint (mm)',10),num('waste','Waste allowance (%)',5,{max:100})],
 'Modular face area = (brick length + joint) × (brick height + joint) ÷ 1,000,000. Bricks = round up(wall area ÷ face area × allowance factor).',
 'This is a single face-area estimate. Bond, wall thickness, corners and openings affect real quantities. It is not a structural wall design.',
 'For 10 m², 215 × 65 mm brick faces, 10 mm joints and 5% waste, the estimate is 623 bricks.',
 ['Does it account for two leaves of brickwork?','No. Calculate the face area of each leaf and add the estimates if your wall requires multiple leaves.'],
 x=>({'Estimated bricks':Math.ceil(x.area/((x.length+x.joint)*(x.height+x.joint)/1e6)*(1+x.waste/100))}));
add('gravel-calculator','Gravel Calculator','home','Estimate loose gravel volume and mass using your supplier’s bulk density.',[num('area','Coverage area (m²)',20),num('depth','Depth (cm)',5),pos('density','Bulk density (kg/m³)',1600)],
 'Volume = area × depth ÷ 100. Mass = volume × bulk density.',
 'Density varies by stone, moisture and compaction. The default is an illustrative assumption; replace it with supplier data. Compaction allowance is not automatically added.',
 '20 m² at 5 cm depth is 1 m³. At an assumed 1,600 kg/m³ that is 1,600 kg or 1.6 tonnes.',
 ['Is the default density exact?','No. It is only an example; use the density of the product you are ordering.'],
 x=>({'Volume (m³)':x.area*x.depth/100,'Mass (kg)':x.area*x.depth/100*x.density,'Mass (metric tonnes)':x.area*x.depth/100*x.density/1000}));
add('mulch-calculator','Mulch Calculator','home','Estimate mulch volume and bag count from coverage area, depth and bag size.',[num('area','Coverage area (m²)',20),num('depth','Depth (cm)',5),pos('bag','Bag volume (L)',50)],
 'Volume in litres = area in m² × depth in cm × 10. Bags = round up(litres ÷ bag litres).',
 'Assumes a uniform layer and uses the stated loose bag volume. Settling, uneven ground and topping up an existing layer can change requirements.',
 '20 m² covered to 5 cm needs 1,000 L of mulch, or twenty 50 L bags.',
 ['Can I calculate only a top-up layer?','Yes. Enter the additional depth you want to add, not the total final depth.'],
 x=>({'Volume (L)':x.area*x.depth*10,'Volume (m³)':x.area*x.depth/100,'Whole bags':Math.ceil(x.area*x.depth*10/x.bag)}));
add('fence-calculator','Fence Panel Calculator','home','Estimate panels and posts for one straight fence run using a maximum panel span.',[num('length','Fence run length (m)',20),pos('span','Maximum panel span (m)',2)],
 'Panels = round up(run length ÷ maximum span). Posts = panels + 1 for a nonzero straight run.',
 'Assumes a standalone straight run with posts at both ends. Gates, corners, shared posts, foundations and structural requirements are excluded.',
 'A straight 20 m run using 2 m maximum spans requires 10 panels and 11 posts.',
 ['Can I use this for a closed loop?','A closed loop shares the end post with the start, so this straight-run post count needs adjustment.'],
 x=>{const n=Math.ceil(x.length/x.span);return {'Panels':n,'Posts for straight run':n?n+1:0,'Average span (m)':n?x.length/n:0};});
add('electricity-cost-calculator','Electricity Cost Calculator','energy','Calculate appliance electricity consumption and cost for a total number of operating hours.',[num('watts','Power (watts)',1000),num('hours','Total operating hours',5),num('price','Electricity price per kWh',0.3)],
 'Energy (kWh) = watts ÷ 1,000 × hours. Cost = energy × tariff per kWh.',
 'Power is assumed constant while operating. Use average measured power for cycling equipment. Standing charges, taxes and tiered tariffs are not added.',
 'A 1,000 W appliance running for 5 hours uses 5 kWh and costs 1.50 at 0.30/kWh.',
 ['Should I enter hours per day?','This tool expects total hours for the period. Multiply hours per day by days first, or use Monthly Appliance Cost.'],
 x=>({'Energy (kWh)':x.watts/1000*x.hours,'Electricity cost':x.watts/1000*x.hours*x.price}));
add('monthly-appliance-cost-calculator','Monthly Appliance Cost Calculator','energy','Budget appliance energy and cost using daily runtime and billing-period length.',[num('watts','Average operating power (W)',150),num('hours','Hours per day',8,{max:24}),count('days','Days in billing period',30,{max:366}),num('price','Price per kWh',0.3)],
 'Period energy = watts ÷ 1,000 × daily hours × days. Cost = energy × unit price.',
 'The billing period is editable. Nameplate maximum power may overstate consumption for a cycling appliance; measured average power is preferable.',
 '150 W for 8 hours daily over 30 days uses 36 kWh and costs 10.80 at 0.30/kWh.',
 ['Does this include fixed utility charges?','No. It estimates the variable cost attributable to this appliance.'],
 x=>({'Period energy (kWh)':x.watts/1000*x.hours*x.days,'Period cost':x.watts/1000*x.hours*x.days*x.price}));
add('battery-runtime-calculator','Battery Runtime Calculator','energy','Estimate battery runtime from capacity, voltage, usable fraction and load.',[pos('ah','Battery capacity (Ah)',100),pos('volts','Nominal voltage (V)',12),pos('load','Load power (W)',100),num('usable','Usable capacity (%)',80,{max:100}),num('efficiency','System efficiency (%)',90,{max:100})],
 'Usable energy (Wh) = Ah × volts × usable fraction × efficiency. Runtime (h) = usable energy ÷ load watts.',
 'This is an energy-budget approximation. Temperature, battery age, discharge rate, inverter idle draw and voltage cutoff can shorten runtime.',
 '100 Ah at 12 V with 80% usable capacity and 90% efficiency supplies about 864 Wh, or 8.64 hours at 100 W.',
 ['Why is this only an estimate?','Rated capacity is measured under specific conditions, and real capacity and conversion losses vary with the system.'],
 x=>({'Usable energy (Wh)':x.ah*x.volts*x.usable/100*x.efficiency/100,'Estimated runtime (hours)':x.ah*x.volts*x.usable/100*x.efficiency/100/x.load}));
const nist=['NIST: SI conversion factors','https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors'];
function converter(id,title,description,units,example,notes,min=0){
 const options=Object.keys(units).map(u=>[u,u]);
 add(id,title,'conversions',description,[num('value','Value',1,{min}),sel('from','From unit',options),sel('to','To unit',options,options[1][0])],
  'Converted value = input × source-unit factor ÷ destination-unit factor. Factors use a shared base unit.',notes,example,
  ['Why must the unit definition match?','Similar names can represent different sizes. Choose the exact unit named on your source measurement.'],
  x=>({['Converted value ('+x.to+')']:x.value*units[x.from]/units[x.to]}),{sources:[nist],units});
}
converter('length-converter','Length Converter','Convert metres, centimetres, millimetres, kilometres, inches, feet, yards and miles.',{'m':1,'cm':0.01,'mm':0.001,'km':1000,'in':0.0254,'ft':0.3048,'yd':0.9144,'mi':1609.344},'1 international foot equals exactly 0.3048 metres.','Uses the international foot and mile, not legacy US survey units. Negative values are allowed for signed displacements.',-1e12);
converter('weight-converter','Weight & Mass Converter','Convert kilograms, grams, milligrams, pounds, ounces and metric tonnes.',{'kg':1,'g':0.001,'mg':0.000001,'lb':0.45359237,'oz':0.028349523125,'tonne':1000},'1 avoirdupois pound is exactly 0.45359237 kg.','These are mass units. Pounds and ounces are avoirdupois, not troy units for precious metals. Force and mass are not interchangeable.');
converter('area-converter','Area Converter','Convert square metres, square feet, hectares, acres and square kilometres.',{'m²':1,'ft²':0.09290304,'km²':1e6,'hectare':10000,'acre':4046.8564224},'1 international acre equals 43,560 square feet or 4,046.8564224 m².','Area factors are squared length factors. Uses international feet; historical survey-acre definitions can differ.');
converter('volume-converter','Volume Converter','Convert litres, millilitres, cubic metres and explicitly named gallon units.',{'L':1,'mL':0.001,'m³':1000,'US gallon':3.785411784,'imperial gallon':4.54609,'ft³':28.316846592},'1 US liquid gallon equals 3.785411784 litres.','US liquid gallons and imperial gallons differ. This measures volume, not mass; density is needed to convert litres to kilograms.');
converter('speed-converter','Speed Converter','Convert kilometres per hour, miles per hour, metres per second and knots.',{'km/h':1,'mph':1.609344,'m/s':3.6,'knot':1.852},'10 m/s is 36 km/h; 1 knot is 1.852 km/h.','A knot is one nautical mile per hour. These are magnitudes of speed and must be nonnegative.');
converter('pressure-converter','Pressure Converter','Convert pascals, kilopascals, bar, psi and standard atmospheres.',{'Pa':1,'kPa':1000,'bar':100000,'psi':6894.757293168,'atm':101325},'1 bar equals 100,000 pascals or 100 kilopascals.','Conversions preserve the entered pressure reference. Gauge and absolute pressure differ by ambient pressure and are not automatically converted. PSI uses standard gravity.');
converter('data-storage-converter','Data Storage Converter','Convert bytes and bits using explicit decimal and binary storage prefixes.',{'byte':1,'bit':0.125,'kB':1000,'MB':1e6,'GB':1e9,'KiB':1024,'MiB':1048576,'GiB':1073741824},'1 GB is 1,000 MB, while 1 GiB is 1,024 MiB and 1,073,741,824 bytes.','Lowercase b means bits; this tool spells bit and byte out. Decimal prefixes use powers of 1,000 and binary prefixes use powers of 1,024. File-system overhead is excluded.');
converter('cooking-volume-converter','Cooking Volume Converter','Convert millilitres, US customary cups and spoons, and metric cups.',{'mL':1,'US cup':236.5882365,'US tablespoon':14.78676478125,'US teaspoon':4.92892159375,'metric cup (250 mL)':250,'metric tablespoon (15 mL)':15},'1 US customary cup equals 16 US tablespoons or about 236.588 mL.','These are volume measurements, not ingredient weights. US customary cups differ from 240 mL nutrition-label cups and 250 mL metric cups. Australian tablespoons may use 20 mL.');
add('temperature-converter','Temperature Converter','conversions','Convert Celsius, Fahrenheit and kelvin temperatures with an absolute-zero check.',[signed('value','Temperature',20),sel('from','From',[['C','Celsius'],['F','Fahrenheit'],['K','Kelvin']]),sel('to','To',[['C','Celsius'],['F','Fahrenheit'],['K','Kelvin']],'F')],
 'Celsius = (Fahrenheit − 32) × 5/9. Kelvin = Celsius + 273.15. Fahrenheit = Celsius × 9/5 + 32.',
 'This converts temperature points, not temperature differences. Values below absolute zero are rejected, allowing a small floating-point tolerance at the boundary.',
 '20°C equals 68°F and 293.15 K. Absolute zero is −273.15°C.',
 ['Is a change of 10°C the same as 10°F?','No. A temperature interval of 10°C equals 18°F; the 32-degree offset is only for temperature points.'],
 x=>{let c=x.from==='C'?x.value:x.from==='F'?(x.value-32)*5/9:x.value-273.15;assert(c>=-273.15-1e-10,'Temperature cannot be below absolute zero.');c=Math.max(c,-273.15);return {['Temperature ('+(x.to==='K'?'K':'°'+x.to)+')']:x.to==='C'?c:x.to==='F'?c*9/5+32:c+273.15};},{sources:[nist]});
add('rent-split-calculator','Rent Split Calculator','everyday','Divide rent proportionally between two people using editable shares.',[num('rent','Total rent for the period',6000),pos('a','Person A share weight',1),pos('b','Person B share weight',1)],
 'Person A pays rent × A weight ÷ (A + B weights). Person B pays the remaining rent.',
 'Weights can represent an agreed split, room size or another basis. This is a mathematical allocation, not legal tenancy advice. Enter AED or any consistent currency.',
 'Rent of 6,000 split with weights 2 and 1 assigns 4,000 to A and 2,000 to B.',
 ['Do the weights need to total 100?','No. A ratio of 2:1 gives the same result as 66:33 or 200:100.'],
 x=>({'Person A rent':x.rent*x.a/(x.a+x.b),'Person B rent':x.rent*x.b/(x.a+x.b)}));
add('rent-payment-calculator','Rent Payment Calculator','everyday','Convert an annual rental amount into equal instalments and a monthly average.',[num('annual','Annual rent',60000),count('payments','Equal payments per year',4,{max:365})],
 'Each instalment = annual rent ÷ number of payments. Monthly average = annual rent ÷ 12.',
 'Useful for comparing annual rent paid by one or several cheques, including AED budgets. Deposits, commissions, utilities and registration fees are excluded unless added separately.',
 'Annual rent of 60,000 paid in four equal instalments is 15,000 per payment and averages 5,000 per month.',
 ['Does changing the payment count change annual cost?','Not here. If a landlord quotes a different annual price for another schedule, enter that price separately.'],
 x=>({'Amount per payment':x.annual/x.payments,'Monthly average':x.annual/12}));
add('recipe-scaling-calculator','Recipe Scaling Calculator','everyday','Scale an ingredient amount when changing the number of recipe servings.',[pos('original','Original servings',4),pos('target','Target servings',6),num('amount','Original ingredient quantity',200)],
 'Scale factor = target servings ÷ original servings. New ingredient quantity = original quantity × scale factor.',
 'The output uses the same unit as the entered ingredient amount. Cooking time, pan size, seasonings and leavening may not scale linearly.',
 'Scaling a 4-serving recipe to 6 servings multiplies ingredients by 1.5, so 200 g becomes 300 g.',
 ['Should I multiply cooking time by the same factor?','No. Cooking time depends on thickness, vessel and heating conditions, so follow suitable cooking guidance.'],
 x=>({'Scale factor':x.target/x.original,'Scaled ingredient quantity':x.amount*x.target/x.original}));
// Attach shared authoritative references without duplicating page definitions.
calculators.find(c=>c.id==='data-storage-converter').sources=[['NIST: binary prefixes','https://physics.nist.gov/cuu/Units/binary.html']];
for(const id of ['loan-calculator','mortgage-calculator','car-loan-calculator','loan-comparison-calculator']){
 calculators.find(c=>c.id===id).sources=[['CFPB: fixed-rate mortgage payment method','https://www.consumerfinance.gov/ask-cfpb/how-do-mortgage-lenders-calculate-monthly-payments-en-1965/']];
}
