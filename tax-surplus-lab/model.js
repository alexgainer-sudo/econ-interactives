/* Whole-unit competitive market. All dollar accounts derive from these schedules. */
(function(root){
'use strict';
const values=Object.freeze([12,10,8,6]), costs=Object.freeze([2,4,5,5]);
const settings=Object.freeze([{tax:0,buyer:5.5},{tax:0.5,buyer:5.75},{tax:4,buyer:8.5},{tax:11,buyer:12.5}].map(Object.freeze));
function market(tax){
 const setting=settings.find(s=>s.tax===tax); if(!setting) throw new RangeError('Unsupported tax');
 const buyer=setting.buyer, seller=buyer-tax;
 const demand=values.filter(v=>v>buyer).length, supply=costs.filter(c=>c<seller).length;
 if(demand!==supply) throw new Error('Prices must clear the discrete market');
 const rows=values.map((value,i)=>{const traded=i<demand;return Object.freeze({unit:i+1,value,cost:costs[i],gain:value-costs[i],traded,cs:traded?value-buyer:0,ps:traded?seller-costs[i]:0,revenue:traded?tax:0,lost:traded?0:value-costs[i]});});
 const sum=k=>rows.reduce((a,r)=>a+r[k],0);
 return Object.freeze({tax,buyer,seller,demand,supply,trades:demand,rows:Object.freeze(rows),cs:sum('cs'),ps:sum('ps'),revenue:sum('revenue'),dwl:sum('lost'),total:sum('cs')+sum('ps')+sum('revenue'),potential:sum('gain')});
}
const practice=Object.freeze({values:Object.freeze([15,9]),costs:Object.freeze([6,7]),tax:3,buyer:9.5,seller:6.5});
function practiceAccount(){const cs=practice.values[0]-practice.buyer, ps=practice.seller-practice.costs[0], revenue=practice.tax, lost=practice.values[1]-practice.costs[1];return Object.freeze({...practice,cs,ps,revenue,lost,gain:cs+ps+revenue});}
const api=Object.freeze({values,costs,settings,market,practiceAccount});
if(typeof module!=='undefined'&&module.exports) module.exports=api;else root.TaxMarket=api;
})(globalThis);
