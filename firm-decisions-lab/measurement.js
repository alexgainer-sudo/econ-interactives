/* Anonymous aggregate counts only. No browser storage or answer payloads. */
(() => {
 const ENDPOINT='https://econ-firm-activity-counts.alex-gainer.workers.dev/event';
 const release='firm-2026-10-30-v2';
 let seen=new Set();
 window.FirmMetrics={reset(){seen=new Set();},milestone(event){
  if(!['activity_start','activity_complete'].includes(event)||seen.has(event))return;
  seen.add(event);
  if(!ENDPOINT)return;
  fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,
   body:JSON.stringify({activity:'firm-decisions',route:document.body.dataset.mode,release,event})}).catch(()=>{});
 }};
})();
