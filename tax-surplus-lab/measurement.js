/* Configure only after deploying and verifying the collector. No browser storage. */
(() => {
 const RELEASE='tax-2026-10-02-v4';
 const ENDPOINT='https://econ-tax-activity-counts.alex-gainer.workers.dev/event'; // Production aggregate collector.
 const route=document.body.dataset.mode;
 let seen=new Set();
 window.TaxMetrics={
  reset(){seen=new Set();},
  milestone(event){
   if(seen.has(event)) return; seen.add(event);
   if(!ENDPOINT) return;
   const payload={activity:'tax-surplus',route,release:RELEASE,event};
   fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',keepalive:true}).catch(()=>{});
  }
 };
})();
