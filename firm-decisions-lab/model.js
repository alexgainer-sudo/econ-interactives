/* Core schedule amounts are dollars per market day. Whole units only. */
(function (root) {
 'use strict';
 const vc=Object.freeze([0,12,22,36,56,82]);
 function schedule(price=18,fixed=30){
  if(!Number.isFinite(price)||price<0||!Number.isFinite(fixed)||fixed<0) throw new RangeError('Nonnegative finite costs and price required.');
  return vc.map((variable,q)=>Object.freeze({q,revenue:price*q,variable,fixed,total:variable+fixed,profit:price*q-variable-fixed,mc:q?variable-vc[q-1]:null}));
 }
 function best(rows){const max=Math.max(...rows.map(r=>r.profit));return rows.filter(r=>Math.abs(r.profit-max)<1e-9);}
 function renewal(price=18,fixed=30){return [...schedule(price,fixed).map(r=>({...r,key:String(r.q)})),{key:'exit',q:0,revenue:0,variable:0,fixed:0,total:0,profit:0,mc:null}];}
 const scenarios=Object.freeze([{price:18,fixed:30},{price:10,fixed:30},{price:18,fixed:30,future:true}].map(Object.freeze));
 const refundable=Object.freeze({jobs:2,price:25,variable:32,payment:24});
 const shock=Object.freeze({before:Object.freeze([-40,-15,-9,-12]),charge:16});
 function practiceAccounts(){return {refundable:{open:refundable.jobs*refundable.price-refundable.variable-refundable.payment,closed:0},shock:{before:shock.before,after:shock.before.map(p=>p-shock.charge)}};}
 const api=Object.freeze({vc,schedule,best,renewal,scenarios,refundable,shock,practiceAccounts});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FirmModel=api;
})(globalThis);
