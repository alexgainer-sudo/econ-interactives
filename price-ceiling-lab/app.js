/* All learner state is local to this page. No requests, storage or analytics. */
(() => {
  'use strict';
  const M = CeilingMarket;
  const $ = id => document.getElementById(id);
  const lecture = document.body.dataset.mode === 'lecture';
  const money = n => `$${n.toFixed(2)}`;
  const fixed = M.market(3.5);
  let matched = false;
  function feedback(id, text, good) {
    const target = $(id);
    target.textContent = text;
    target.className = `feedback ${good ? 'good' : 'retry'}`;
  }
  function stage(n) {
    for (let i = 0; i < 4; i++) $(`stage-${i}`).hidden = i !== n;
    for (let i = 0; i < 3; i++) {
      const step = $(`step-${i}`);
      if (i === Math.min(n, 2)) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    }
    const heading = $(`stage-${n}`).querySelector('h2');
    heading.focus();
    heading.scrollIntoView({block:'start', behavior:'instant'});
  }
  $('large').addEventListener('click', () => {
    const on = document.documentElement.classList.toggle('large');
    $('large').setAttribute('aria-pressed', String(on));
  });
  $('restart').addEventListener('click', () => {
    document.querySelectorAll('form').forEach(f => f.reset());
    $('trade-form').querySelector('fieldset').disabled = false;
    $('trade-form').querySelector('button').hidden = false;
    matched = false;
    ['to-market','trade-result','to-transfer','complete'].forEach(id => $(id).hidden = true);
    const initial = {
      'seller-feedback':'Choose the sellers, then check your decisions. There is no penalty for trying again.',
      'trade-feedback':'Make your prediction before matching the market.',
      'nonbinding-feedback':'A maximum is a limit on what sellers may charge. Does it require them to charge that amount?',
      'transfer-feedback':'Use the two sides of the market to explain your choice.'
    };
    Object.entries(initial).forEach(([id,text]) => { $(id).textContent = text; $(id).className='feedback'; });
    $('ceiling').value = '3.5';
    $('explore-details').open = false;
    tokens(false); renderGraph(); stage(0);
  });
  $('seller-form').addEventListener('change', () => {
    $('to-market').hidden = true;
    $('seller-feedback').className = 'feedback';
    $('seller-feedback').textContent = 'Check your revised decisions to continue.';
  });
  $('seller-form').addEventListener('submit', event => {
    event.preventDefault();
    const selected = [...document.querySelectorAll('input[name=seller]:checked')].map(x=>Number(x.value));
    const losing = selected.filter(i => M.costs[i] > fixed.price);
    const missing = M.costs.map((c,i)=>c < fixed.price && !selected.includes(i) ? i : -1).filter(i=>i>=0);
    const correct = losing.length === 0 && missing.length === 0;
    if (correct) {
      feedback('seller-feedback','Yes. The $2 and $3 sellers cover their costs. Every other box costs more than $3.50 to prepare. Only 2 sellers offer a box.',true);
    } else if (losing.length) {
      const i=losing[0];
      feedback('seller-feedback',`Seller ${i+1} would receive $3.50 but incur ${money(M.costs[i])} in costs, losing ${money(M.costs[i]-3.5)}. They can avoid that loss by not making the box. Reconsider your selections.`,false);
    } else {
      const i=missing[0];
      feedback('seller-feedback',`Seller ${i+1} can prepare a box for ${money(M.costs[i])} and sell it for $3.50. That covers the cost, including their time. Are any willing sellers missing?`,false);
    }
    $('to-market').hidden = !correct;
  });
  $('to-market').addEventListener('click',()=>stage(1));
  function tokens(revealed) {
    for (const [id, data, type] of [['buyer-tokens',M.values,'buyer'],['seller-tokens',M.costs,'supplier']]) {
      $(id).replaceChildren(...data.map((v,i)=>{
        const willing=type==='buyer'?v>3.5:v<3.5;
        const waiting=revealed && type==='buyer' && willing && i>=fixed.trades;
        const card=document.createElement('div');
        card.className=`token ${waiting?'waiting':willing?type:''}`;
        const title=document.createElement('strong');title.textContent=money(v);
        const label=document.createElement('span');
        label.textContent=waiting?'No box':revealed&&willing?'Trades':willing?'Willing':'Sits out';
        card.append(title,label);return card;
      }));
    }
  }
  $('trade-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(matched) return;
    const selected=new FormData(event.currentTarget).get('trades');
    if(!selected){feedback('trade-feedback','Choose how many boxes you think will actually be bought and sold.',false);return;}
    const correct=Number(selected)===fixed.trades;
    const reason=selected==='6'?'Six counts the buyers who want a box, but there are only two boxes to buy.':selected==='4'?'Four was the original quantity. At the lower price, two of those sellers no longer cover their costs.':'Yes. Each offered box finds a buyer, so two purchases happen.';
    feedback('trade-feedback',reason,correct);
    $('trade-result').hidden=false;matched=true;tokens(true);
    $('trade-form').querySelector('fieldset').disabled=true;
    $('trade-form').querySelector('button').hidden=true;
    $('trade-feedback').tabIndex=-1;$('trade-feedback').focus();
  });
  $('to-summary').addEventListener('click',()=>{
    $('lecture-finish').hidden=!lecture;
    $('practice-continue').hidden=lecture;
    $('practice-tests').hidden=lecture;
    $('explore-details').open=!lecture;
    stage(2);
  });
  $('nonbinding-form').addEventListener('submit',event=>{
    event.preventDefault();
    const a=new FormData(event.currentTarget).get('nonbinding');
    if(!a){feedback('nonbinding-feedback','Choose the price you expect buyers to pay.',false);return;}
    const good=a==='market';
    feedback('nonbinding-feedback', good?'Yes. The $7.50 ceiling permits the original $5.50 price. It does not require a price increase. Four boxes are still traded.':'A ceiling is a maximum, not a required price. The original $5.50 price is legal under a $7.50 ceiling. Reconsider which price clears the market.',good);
    $('to-transfer').hidden=!good;
  });
  $('nonbinding-form').addEventListener('change',()=>{
    $('to-transfer').hidden=true;
    $('nonbinding-feedback').className='feedback';
    $('nonbinding-feedback').textContent='Check your revised price prediction.';
  });
  $('to-transfer').addEventListener('click',()=>stage(3));
  $('transfer-form').addEventListener('submit',event=>{
    event.preventDefault();
    const a=new FormData(event.currentTarget).get('transfer');
    const answers={
      demand:'Twelve is quantity demanded. Customers cannot buy twelve repairs when shops offer only five. Try again.',
      shortage:'Seven is the shortage: twelve wanted minus five offered. It counts unmet demand, not completed repairs. Try again.',
      supply:'Correct. All five offered repairs find customers, so five repairs happen, down from eight. Seven willing customers go without.',
      baseline:'Eight was the quantity before the policy. With the binding ceiling, shops now offer only five repairs. Try again.'
    };
    feedback('transfer-feedback',answers[a]||'Choose a prediction and explanation.',a==='supply');
    $('complete').hidden=a!=='supply';
  });
  $('transfer-form').addEventListener('change',()=>{
    $('complete').hidden=true;
    $('transfer-feedback').className='feedback';
    $('transfer-feedback').textContent='Check your revised prediction and explanation.';
  });
  $('back-explore').addEventListener('click',()=>stage(2));
  function svg(tag,attrs,text) {
    const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs||{}).forEach(([k,v])=>node.setAttribute(k,v));
    if(text!==undefined) node.textContent=text;
    return node;
  }
  function renderGraph(){
    const r=M.market(Number($('ceiling').value));
    $('cap-output').textContent=money(r.ceiling);
    $('ceiling').setAttribute('aria-valuetext',money(r.ceiling));
    const graph=$('chart');
    const desc=`At a ${money(r.ceiling)} ceiling, price is ${money(r.price)}. Quantity demanded ${r.demanded}, supplied ${r.supplied}, traded ${r.trades}, shortage ${r.shortage}.`;
    graph.replaceChildren(svg('title',{id:'chart-title'},'Supply, demand and the price ceiling'),svg('desc',{id:'chart-desc'},desc));
    const add=(tag,attrs,t)=>graph.append(svg(tag,attrs,t));
    const x=q=>66+q*62, y=p=>348-p*29;
    for(let p=0;p<=10;p+=2){add('line',{x1:x(0),y1:y(p),x2:x(8),y2:y(p),stroke:'#e0e4db'});add('text',{x:52,y:y(p)+5,'text-anchor':'end'},`$${p}`);}
    add('line',{x1:x(0),y1:y(0),x2:x(8),y2:y(0),stroke:'#53615c'});
    for(let q=0;q<=8;q+=2) add('text',{x:x(q),y:373,'text-anchor':'middle'},q);
    add('text',{x:66,y:28},'Price per lunch box');add('text',{x:315,y:408,'text-anchor':'middle'},'Lunch boxes per day');
    for(const [values,klass] of [[M.costs,'supply'],[M.values,'demand']]){
      let d=`M ${x(0)} ${y(values[0])}`;
      values.forEach((p,i)=>{if(i)d+=` V ${y(p)}`;d+=` H ${x(i+1)}`;});
      add('path',{d,class:klass});
    }
    add('line',{x1:x(0),x2:608,y1:y(r.ceiling),y2:y(r.ceiling),class:'ceiling'});
    add('text',{x:607,y:y(r.ceiling)-9,'text-anchor':'end',style:'fill:#ab431f'},`Cap ${money(r.ceiling)}`);
    if(!r.binding){add('line',{x1:x(0),x2:x(4),y1:y(5.5),y2:y(5.5),stroke:'#53615c','stroke-dasharray':'3 4'});}
    add('rect',{x:x(0),y:336,width:r.trades*62,height:12,fill:'#17634e',opacity:'.22'});
    for(const [q,color] of [[r.supplied,'#17634e'],[r.demanded,'#245b8e']]){
      add('line',{x1:x(q),x2:x(q),y1:y(r.price),y2:y(0),stroke:color,'stroke-dasharray':'3 4'});
      add('circle',{cx:x(q),cy:y(r.price),r:5,fill:color,stroke:'#fff', 'stroke-width':1.5});
    }
    const readout=$('market-readout');readout.replaceChildren();
    const title=document.createElement('strong');
    title.textContent=r.binding?'Binding ceiling':r.ceiling===5.5?'At the starting market price':'Nonbinding ceiling';
    const p=document.createElement('p');
    p.textContent=r.binding?`${r.demanded} buyers want boxes. ${r.supplied} sellers offer boxes. ${r.trades} boxes trade at ${money(r.price)}; ${r.shortage} willing buyers go without.`:`The legal maximum does not force the price up. The starting price of $5.50 remains legal: 4 buyers and 4 sellers trade, with no shortage.`;
    readout.append(title,p);
    for(const [id,v]of[['price',money(r.price)],['demand',r.demanded],['supply',r.supplied],['trades',r.trades],['shortage',r.shortage]])$(`table-${id}`).textContent=v;
  }
  $('ceiling').addEventListener('input',renderGraph);
  tokens(false);renderGraph();
  // Last initialization step: do not accept actions until every handler is ready.
  document.querySelectorAll('button').forEach(button=>{button.disabled=false;});
})();
