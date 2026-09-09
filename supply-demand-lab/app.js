/* No network requests, dependencies, tracking or persistent browser storage. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // Keep the graph and its controls together when panels stack on a phone.
  const experimentHome = $('experiment').parentElement;
  const smallScreen = matchMedia('(max-width:800px)');
  const placeControls = () => (smallScreen.matches ? $('chart-controls') : experimentHome).append($('experiment'));
  smallScreen.addEventListener('change',placeControls);
  placeControls();
  const scenarios = {
    price: {
      title:'Coffee becomes cheaper',
      story:'At $5 per cup, buyers want 50 thousand cups per day. Now consider a price of $3, with all other influences on buyers unchanged.',
      question:'How do we show the change in buyers’ behaviour?',
      choices:['Move down along the same demand curve.','Shift the demand curve to the right.','Shift the demand curve to the left.'], answer:0,
      feedback:['Yes. The coffee price changes, so quantity demanded changes along the existing curve.','More cups are wanted at the lower price, but the demand curve already describes that response. Demand has not shifted.','A lower coffee price raises quantity demanded. With other influences fixed, the demand curve stays in place.'],
      challenge:'Find how many cups buyers want at $3 and at $7. What has stayed the same?',
      explanation:'A demand curve shows how quantity demanded varies with the good’s own price, holding other influences fixed. A lower coffee price moves us down and right on this curve. It does not create a new demand curve. Only the coffee price changes, so the demand curve stays fixed.',
      transfer:'A cinema lowers its ticket price. Tastes, incomes and other prices do not change. How do we describe the buyers’ response?',
      transferChoices:['An increase in demand for cinema tickets.','An increase in quantity demanded of cinema tickets.','An increase in supply of cinema tickets.'], transferAnswer:1,
      transferFeedback:'The ticket price itself fell. Moving to a lower point on the same demand curve means quantity demanded increases. An increase in demand is different: the entire demand curve shifts right because buyers want more tickets at every possible ticket price. Here, tastes, incomes and other prices are unchanged, so the curve does not shift.'
    },
    demand: {
      title:'Tea becomes more expensive',
      story:'Suppose coffee and tea are substitutes. Tea becomes more expensive. Coffee production costs and all other influences are unchanged.',
      question:'What happens in the coffee market after it adjusts?',
      choices:['Coffee demand increases; price rises and quantity rises.','Coffee supply decreases; price rises and quantity falls.','Coffee demand stays fixed; buyers move along it.'], answer:0,
      feedback:['Yes. More buyers choose coffee at each coffee price. Demand shifts right.','The change affects buyers’ alternatives, not coffee production costs. Coffee demand increases while supply stays fixed.','Tea’s price is an outside influence on coffee demand. Coffee buyers want more at each coffee price, so the curve shifts.'],
      challenge:'Increase demand, then return its increase to zero. Explain why the new equilibrium moves along the supply curve.',
      explanation:'When tea becomes more expensive, some buyers switch to coffee. At each coffee price, quantity demanded is now higher. Coffee demand shifts right. The higher equilibrium coffee price raises quantity supplied along the unchanged supply curve. Supply itself has not increased.',
      transfer:'Cocoa becomes more expensive to produce. Demand for cocoa is unchanged. Which outcome follows?',
      transferChoices:['Supply increases; price falls and quantity rises.','Demand decreases; price falls and quantity falls.','Supply decreases; price rises and quantity falls.'], transferAnswer:2,
      transferFeedback:'Higher production costs decrease supply. The equilibrium price rises and quantity falls. Buyers respond to the higher cocoa price by moving along their unchanged demand curve. This is a decrease in quantity demanded, not a decrease in demand.'
    },
    both: {
      title:'More buyers. Higher costs.',
      story:'Tea becomes more expensive, increasing demand for coffee. At the same time, higher coffee-bean costs decrease coffee supply. We do not know how large either shift is.',
      question:'What can we predict with confidence?',
      choices:['Price rises; quantity must rise.','Price rises; quantity must fall.','Price rises; quantity can rise, fall or stay the same.'], answer:2,
      feedback:['A demand increase raises quantity, but a supply decrease lowers it. Their relative sizes determine the net change.','A supply decrease lowers quantity, but a demand increase raises it. Their relative sizes determine the net change.','Yes. Both changes raise price. Their effects on quantity oppose each other.'],
      challenge:'Keep both shifts above zero. Find all three outcomes for quantity: above 50, below 50, and exactly 50.',
      explanation:'An increase in demand raises equilibrium price and quantity. A decrease in supply raises equilibrium price but lowers quantity. Both changes raise price, so its direction is clear. Their effects on quantity oppose each other. Without knowing their sizes, quantity is indeterminate. That means there are several possible outcomes, not that quantity must stay unchanged.',
      transfer:'Demand for bicycles decreases, while improved production technology increases bicycle supply. The shift sizes are unknown. What can we predict?',
      transferChoices:['Price falls; quantity can rise, fall or stay the same.','Price falls; quantity must fall.','Price is uncertain; quantity must rise.'], transferAnswer:0,
      transferFeedback:'Both changes lower price. Lower demand reduces quantity, while increased supply raises it. Quantity therefore depends on the relative sizes of the shifts.'
    }
  };
  let current = 'price', revealed = false, presenting = false;
  const found = new Set();
  const params = new URLSearchParams(location.search);
  const money = x => '$'+x.toFixed(2);
  const num = x => Number.isInteger(x) ? String(x) : x.toFixed(1);
  function radioOptions(target, name, choices) {
    $(target).replaceChildren(...choices.map((text,i) => {
      const label=document.createElement('label'); label.className='option';
      const input=document.createElement('input'); input.type='radio'; input.name=name; input.value=i; input.required=true;
      const span=document.createElement('span'); span.textContent=text;
      label.append(input,span); return label;
    }));
  }
  function start(key, focus=false) {
    current=key; revealed=false; found.clear();
    const c=scenarios[key];
    $('case-title').textContent=c.title; $('story').textContent=c.story; $('question').textContent=c.question;
    radioOptions('choices','prediction',c.choices);
    radioOptions('transfer-choices','transfer',c.transferChoices);
    $('transfer-question').textContent=c.transfer;
    ['prediction-feedback','transfer-feedback','found'].forEach(id=>$(id).textContent='');
    $('experiment').hidden=true; $('transfer').hidden=true; $('next').hidden=true; $('advance').hidden=true;
    $('prediction-form').hidden=false; $('prediction').disabled=false;
    $('price').value=3; $('demand').value=20; $('supply').value=10;
    $('step').textContent='1 · Predict'; $('challenge').textContent=c.challenge; $('explanation').textContent=c.explanation;
    document.querySelectorAll('details').forEach(d=>d.open=false);
    document.querySelectorAll('[data-case]').forEach(b=> { if(b.dataset.case===key)b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    $('reveal').textContent=presenting?'Reveal the change':'Test my prediction';
    $('choices').hidden=presenting;
    document.querySelectorAll('#prediction input').forEach(i=>i.required=!presenting);
    render();
    if(focus){ $('case-title').tabIndex=-1; $('case-title').focus(); }
  }
  function reveal(event) {
    event.preventDefault();
    const chosen=document.querySelector('input[name=prediction]:checked');
    if(!presenting && !chosen)return;
    revealed=true;
    $('prediction-feedback').textContent=presenting?'':scenarios[current].feedback[Number(chosen.value)];
    $('prediction-form').hidden=true;
    $('step').textContent='Prediction made';
    $('experiment').hidden=false; $('transfer').hidden=presenting;
    $('price-control').hidden=current!=='price'; $('demand-control').hidden=current==='price';
    $('supply-control').hidden=current!=='both'; $('presets').hidden=current!=='both';
    $('control-note').hidden=current==='price';
    $('control-note').textContent='Shift size is measured horizontally, in thousands of cups per day at each price. Zero restores the original curve.';
    $('advance').hidden=presenting;
    render();
    const focusTarget = smallScreen.matches ? $('chart-heading') : $('experiment-title');
    focusTarget.tabIndex=-1; focusTarget.focus();
  }
  function svgEl(tag,attrs={},content='') {
    const e=document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); if(content)e.textContent=content; return e;
  }
  function render() {
    const priceCase=current==='price';
    const d=revealed&&!priceCase?Number($('demand').value):0;
    const s=revealed&&current==='both'?Number($('supply').value):0;
    const p=priceCase?(revealed?Number($('price').value):5):CoffeeModel.equilibrium(d,s).p;
    const q=priceCase?CoffeeModel.quantityDemanded(p):CoffeeModel.equilibrium(d,s).q;
    const priceDiff=p-5, quantityDiff=q-50;
    const direction = delta=>delta>0?'higher':delta<0?'lower':'unchanged';
    $('price-value').textContent=money(Number($('price').value));
    $('demand-value').textContent='+'+$('demand').value;
    $('supply-value').textContent='−'+$('supply').value;
    $('p-label').textContent=priceCase?'Coffee price':'Equilibrium price';
    $('q-label').textContent=priceCase?'Quantity demanded':'Equilibrium quantity';
    $('p-result').textContent=money(p); $('q-result').textContent=num(q);
    $('chart-heading').textContent=revealed?'Compare with the starting point':'Before the change';
    $('chart-badge').textContent=revealed?'After change':'Baseline';
    $('supply-key').hidden=priceCase;
    $('baseline-key').hidden=d===0 && s===0;
    const reading=priceCase?`At ${money(p)}, buyers want ${num(q)} thousand cups per day. This is a point on the demand curve, not necessarily an equilibrium.`:`Price is ${direction(priceDiff)}; quantity is ${direction(quantityDiff)} compared with the original equilibrium of $5 and 50 thousand cups per day.`;
    $('reading').textContent=reading;
    $('table-caption').textContent=priceCase?'Points on the same demand curve':'Market equilibria';
    const measures=[[priceCase?'Coffee price ($ per cup)':'Equilibrium price ($ per cup)',money(5),money(p)],[priceCase?'Quantity demanded (thousands/day)':'Equilibrium quantity (thousands/day)','50',num(q)]];
    $('values').replaceChildren(...measures.map(row=> {const tr=document.createElement('tr'); row.forEach((t,i)=>{const e=document.createElement(i===0?'th':'td'); if(i===0)e.scope='row'; e.textContent=t; tr.append(e);}); return tr;}));
    if(revealed && current==='both' && d>0 && s>0) {
      found.add(direction(quantityDiff));
      $('found').textContent=`Found ${found.size} of 3: ${['higher','unchanged','lower'].filter(x=>found.has(x)).join(', ')} quantity.${found.size===3?' All three are possible. Price rose in each case.':''}`;
    }
    const svg=$('chart'); svg.replaceChildren();
    const add=(tag,attrs,content)=> {const e=svgEl(tag,attrs,content); svg.append(e); return e;};
    add('title',{id:'graph-title'},priceCase?'Coffee demand curve':'Supply and demand for coffee');
    add('desc',{id:'graph-desc'},reading+(revealed&&!priceCase?` Demand shifts right by ${d} thousand cups and supply shifts left by ${s} thousand cups at each price.`:''));
    const X=q=>74+q*4.65, Y=p=>415-p*28;
    const text=(x,y,t,extra={})=>add('text',{x,y,fill:'#112c43','font-size':17,'font-family':'system-ui',...extra},t);
    const line=(x1,y1,x2,y2,attrs={})=>add('line',{x1,y1,x2,y2,stroke:'#ccd7e1','stroke-width':1,...attrs});
    for(let tick=0;tick<=100;tick+=25) {line(X(tick),Y(0),X(tick),Y(14));text(X(tick),440,String(tick),{'text-anchor':'middle'});}
    for(let tick=0;tick<=12;tick+=2) {line(X(0),Y(tick),X(100),Y(tick));text(61,Y(tick)+6,String(tick),{'text-anchor':'end'});}
    line(X(0),Y(0),X(100)+12,Y(0),{stroke:'#112c43','stroke-width':2});
    line(X(0),Y(0),X(0),Y(14),{stroke:'#112c43','stroke-width':2});
    text(75,17,'Price ($ per cup)'); text(310,480,'Quantity (thousands of cups per day)',{'text-anchor':'middle'});
    const curve=(kind,shift,before)=>{
      const demand=kind==='D', color=demand?'#aa2849':'#075ca8';
      const points=[];
      for(let qty=0;qty<=100;qty++) {const price=demand?10+shift/10-qty/10:shift/10+qty/10;if(price>=0&&price<=14)points.push(`${X(qty)},${Y(price)}`);}
      add('polyline',{points:points.join(' '),fill:'none',stroke:color,'stroke-width':before?2.5:4,...(before?{'stroke-dasharray':'8 7'}:{})});
      // Labels stay inside the plotting range; matching names carry meaning without colour.
      const lq=before?15:85, lp=demand?10+shift/10-lq/10:shift/10+lq/10;
      text(X(lq)+5,Y(lp)+(demand?24:-10),kind+(before?'0':shift===0?'0':'1'),{fill:color,'font-size':20,'font-weight':700});
    };
    if(d>0)curve('D',0,true); if(s>0)curve('S',0,true);
    curve('D',d,false); if(!priceCase)curve('S',s,false);
    if(revealed) { add('circle',{cx:X(50),cy:Y(5),r:7,fill:'white',stroke:'#42586b','stroke-width':2});text(X(50)-12,Y(5)+26,'Before',{'text-anchor':'end','font-size':16}); }
    line(X(q),Y(0),X(q),Y(p),{stroke:'#00665e','stroke-dasharray':'4 4'});
    line(X(0),Y(p),X(q),Y(p),{stroke:'#00665e','stroke-dasharray':'4 4'});
    add('circle',{cx:X(q),cy:Y(p),r:7,fill:'#00665e',stroke:'white','stroke-width':2});
    text(X(q)+12,Y(p)-14,revealed?'Now':'Start',{'font-weight':700,'font-size':17});
  }
  $('prediction-form').addEventListener('submit',reveal);
  ['price','demand','supply'].forEach(id=>$(id).addEventListener('input',render));
  document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.case,true)));
  document.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>{$('demand').value=b.dataset.d;$('supply').value=b.dataset.s;render();}));
  $('advance').addEventListener('click',()=>{
    $('transfer-heading').tabIndex=-1;
    $('transfer-heading').focus({preventScroll:true});
    $('transfer').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('restart').addEventListener('click',()=>start(current,true));
  $('transfer-form').addEventListener('submit',event=> {
    event.preventDefault(); const chosen=document.querySelector('input[name=transfer]:checked'); if(!chosen)return;
    const correct=Number(chosen.value)===scenarios[current].transferAnswer;
    $('transfer-feedback').textContent=(correct?'Correct. ':'Reconsider this. ')+scenarios[current].transferFeedback;
    $('next').hidden=!correct;
    $('next').textContent=current==='both'?'Review the first case':'Next case →';
  });
  $('next').addEventListener('click',()=>start(current==='price'?'demand':current==='demand'?'both':'price',true));
  function projection(value) {
    presenting=value; document.body.classList.toggle('present',value); $('present').setAttribute('aria-pressed',String(value));
    $('present').textContent=value?'Leave projection mode':'Projection mode'; start(current);
  }
  $('present').addEventListener('click',()=>projection(!presenting));
  if(Object.hasOwn(scenarios,params.get('case')))current=params.get('case');
  projection(params.get('mode')==='present');
})();
