(function(){
  const PALETTE = [
    {bg:'#e8f7ee', border:'#4ca976', text:'#21543b', badge:'#4ca976', name:''},
    {bg:'#ffe4ef', border:'#d95c96', text:'#7a1f4a', badge:'#d95c96', name:''},
    {bg:'#fff0d8', border:'#d98d2b', text:'#7a4a00', badge:'#d98d2b', name:''},
    {bg:'#f3e8ff', border:'#8b5cf6', text:'#4b2ea7', badge:'#8b5cf6', name:''},
    {bg:'#ffe4e6', border:'#ef4444', text:'#991b1b', badge:'#ef4444', name:''}
  ];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
  function paletteByIndex(i){ return PALETTE[(i-1)%PALETTE.length]; }
  function getActivityColorCSS(i){ const p=paletteByIndex(i); return `background:${p.bg};border:2px solid ${p.border};`; }
  
function syncBasicFormLayoutLikeExtra(){
  const form = document.getElementById('basicForm');
  if(!form || form.dataset.syncedLayout==='1') return;
  const fields = Array.from(form.querySelectorAll(':scope > .field'));
  if(fields.length < 12) return;
  const desired = [0,1,2,7,3,4,5,8,9,10,11,12,13,14];
  desired.forEach(i=>{ if(fields[i]) form.appendChild(fields[i]); });
  form.dataset.syncedLayout='1';
}

  function getMainFormValues(){
    return {
      name: document.getElementById('fName')?.value || '',
      phone: document.getElementById('fPhone')?.value || '',
      email: document.getElementById('fEmail')?.value || '',
      city: document.getElementById('fCity')?.value || '',
      area: document.getElementById('fArea')?.value || '',
      addr: document.getElementById('fAddr')?.value || '',
      bldg: document.getElementById('fBldg')?.value || '',
      eventType: document.getElementById('fEventType')?.value || '',
      crowd: document.getElementById('fCrowd')?.value || '',
      indoor: document.getElementById('fIndoor')?.value || '',
      truckAccess: document.getElementById('fTruckAccess')?.value || '',
      moveFloor: document.getElementById('fMoveFloor')?.value || '',
      note: document.getElementById('fNote')?.value || '',
      date: document.getElementById('fDateStart')?.value || ''
    };
  }
  
function makeExtraFormHtml(index, seed){
    const p = paletteByIndex(index);
    const uid = 'extraCard-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
    return `
      <div class="extraActivityCard" data-activity-index="${index}" data-uid="${uid}" style="${getActivityColorCSS(index)}border-radius:18px;padding:18px;margin-top:18px;box-shadow:0 8px 20px rgba(0,0,0,.05)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div class="extraCardTitle" style="font-weight:900;font-size:18px;color:${p.text}">活動${index}</div>
          <button class="btn danger extraRemoveBtn" type="button">刪除此活動</button>
        </div>
        <div class="form extraFormGrid" style="background:transparent;border:none;box-shadow:none;padding:0;margin:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px">
          <div class="field"><label>姓名 / 單位</label><input class="xName" value="${esc(seed.name||'')}"></div>
          <div class="field"><label>行動電話</label><input class="xPhone" value="${esc(seed.phone||'')}"></div>
          <div class="field"><label>Email</label><input class="xEmail" type="email" value="${esc(seed.email||'')}"></div>
          <div class="field"><label>活動類型</label><select class="xEventType"></select></div>
          <div class="field span2"><label>活動地點（縣市/區）</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><select class="xCity"></select><select class="xArea"></select></div></div>
          <div class="field span2"><label>詳細地址（路名/號）</label><input class="xAddr" value="${esc(seed.addr||'')}"></div>
          <div class="field span2"><label>大樓/棟別/樓層/入口（讓地址更清楚）</label><input class="xBldg" value="${esc(seed.bldg||'')}"></div>
          <div class="field"><label>預估人數</label><select class="xCrowd"></select></div>
          <div class="field"><label>室內 / 戶外</label><select class="xIndoor"></select></div>
          <div class="field"><label>貨車是否可以直接到達場地</label><select class="xTruckAccess"></select></div>
          <div class="field"><label>搬運方式／樓層</label><select class="xMoveFloor"></select></div>
          <div class="field span2"><label>活動日期</label><input class="xDateStart" type="date"></div>
          <div class="field span2 xPlannerWrap" style="display:none"><label>活動時間規劃</label><div class="xPlannerList planList"></div></div>
          <div class="field span2 xAddDayWrap">
            <label>連續增加天數</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
              <button class="btn xDayAddBtn" type="button">＋再增加一天</button>
              <button class="btn xDayRemoveBtn" type="button">－移除最後一天</button>
              <span class="pill xDayCountText">目前 1 天</span>
            </div>
            <input class="xDayCount" type="hidden" value="1">
            <div class="hint" style="margin-top:8px">需要幾天就往下加幾天；每一天都可以各自勾選第二場。</div>
          </div>
          <div class="field span2"><label>備註 / 需求</label><textarea class="xNote">${esc(seed.note||'')}</textarea></div>
        </div>
      </div>`;
  }

  function getExtraFormsHost(){ return document.getElementById('extraFormsHost'); }
  function getAddLauncher(){ return document.getElementById('addActivityLauncher'); }
  function currentExtraCount(){ return document.querySelectorAll('.extraActivityCard').length; }
  
function updateAddLauncher(){
    const b = getAddLauncher(); if(!b) return;
    const next = currentExtraCount()+2;
    const p = paletteByIndex(next);
    b.innerHTML = `<div style="font-size:18px;font-weight:900;margin-bottom:6px;color:${p.text}">新增活動${next}</div><div style="font-size:13px;color:#374151">按下後，會在最下方直接展開一張新的完整活動表單，並先帶入上一張已填資料。</div>`;
    b.style.background = p.bg;
    b.style.border = `2px solid ${p.border}`;
    b.style.width = '100%';
  }
  function copySeedFromPrevious(){
    const cards = document.querySelectorAll('.extraActivityCard');
    if(cards.length){
      const last = cards[cards.length-1];
      return {
        name:last.querySelector('.xName')?.value||'', phone:last.querySelector('.xPhone')?.value||'', email:last.querySelector('.xEmail')?.value||'', city:last.querySelector('.xCity')?.value||'', area:last.querySelector('.xArea')?.value||'', addr:last.querySelector('.xAddr')?.value||'', bldg:last.querySelector('.xBldg')?.value||'', eventType:last.querySelector('.xEventType')?.value||'', crowd:last.querySelector('.xCrowd')?.value||'', indoor:last.querySelector('.xIndoor')?.value||'', truckAccess:last.querySelector('.xTruckAccess')?.value||'', moveFloor:last.querySelector('.xMoveFloor')?.value||'', note:last.querySelector('.xNote')?.value||'', date:last.querySelector('.xDateStart')?.value||''
      };
    }
    return getMainFormValues();
  }
  
function extraCardDates(card){
    const ds = normalizeDateStr(card.querySelector('.xDateStart')?.value||'');
    if(!ds) return [];
    const count = Math.max(1, Number(card.querySelector('.xDayCount')?.value || 1));
    const out = [];
    for(let i=0;i<count;i++) out.push(addDays(ds, i));
    return out;
  }
  function renderExtraCardPlanner(card){
    const list = card.querySelector('.xPlannerList');
    const wrap = card.querySelector('.xPlannerWrap');
    if(!list || !wrap) return;
    const dates = extraCardDates(card);
    const idx = Number(card.dataset.activityIndex||2);
    if(!dates.length){ wrap.style.display='none'; list.innerHTML=''; return; }
    wrap.style.display='';
    const rows = dates.map((d,i)=>({ key:`${card.dataset.uid}-${d}`, title:`活動${idx} 第${i+1}天`, dateText:d, sub:'', pill:`活動${idx}` }));
    renderPlannerRows(list, rows, ()=>{});
  }
  
function bindExtraCard(card){
    card.querySelector('.xEventType').innerHTML = document.getElementById('fEventType')?.innerHTML || '<option value="">請選擇</option>';
    card.querySelector('.xCrowd').innerHTML = document.getElementById('fCrowd')?.innerHTML || '<option value="">請選擇</option>';
    card.querySelector('.xIndoor').innerHTML = document.getElementById('fIndoor')?.innerHTML || '<option value="">請選擇</option>';
    card.querySelector('.xTruckAccess').innerHTML = document.getElementById('fTruckAccess')?.innerHTML || '<option value="">請選擇</option>';
    card.querySelector('.xMoveFloor').innerHTML = document.getElementById('fMoveFloor')?.innerHTML || '<option value="">請選擇</option>';
    const td = new Date();
    const todayStr = `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,'0')}-${String(td.getDate()).padStart(2,'0')}`;
    const extraDate = card.querySelector('.xDateStart'); if(extraDate) extraDate.min = todayStr;
    const seed = copySeedFromPrevious();
    fillCityArea(card.querySelector('.xCity'), card.querySelector('.xArea'), seed.city||'台中市', seed.area||'豐原區');
    if(seed.eventType) card.querySelector('.xEventType').value = seed.eventType;
    if(seed.crowd) card.querySelector('.xCrowd').value = seed.crowd;
    if(seed.indoor) card.querySelector('.xIndoor').value = seed.indoor;
    if(seed.truckAccess) card.querySelector('.xTruckAccess').value = seed.truckAccess;
    if(seed.moveFloor) card.querySelector('.xMoveFloor').value = seed.moveFloor;
    if(seed.date) card.querySelector('.xDateStart').value = seed.date;

    const startEl = card.querySelector('.xDateStart');
    try{
      const today = todayISO();
      startEl.min = today;
      if(startEl.value && startEl.value < today){ startEl.dataset.prevPastDate = startEl.value; }
    }catch(_){ }
    const countEl = card.querySelector('.xDayCount');
    const countText = card.querySelector('.xDayCountText');
    const addBtn = card.querySelector('.xDayAddBtn');
    const removeBtn = card.querySelector('.xDayRemoveBtn');

    const sync = ()=>{
      const v = normalizeDateStr(startEl.value||'');
      const min = todayISO();
      if(v && v < min){
        startEl.value = startEl.dataset.prevPastDate || '';
        if(!startEl.value){ alert('活動日期不能選擇今天以前的日期。'); }
      }else if(v){
        delete startEl.dataset.prevPastDate;
      }
      const count = Math.max(1, Number(countEl.value || 1));
      countText.textContent = `目前 ${count} 天`;
      renderExtraCardPlanner(card);
    };

    startEl.addEventListener('change', sync);
    addBtn.addEventListener('click', ()=>{
      if(!normalizeDateStr(startEl.value||'')) return alert('請先選擇這個活動的日期。');
      countEl.value = String(Math.max(1, Number(countEl.value||1)) + 1);
      sync();
    });
    removeBtn.addEventListener('click', ()=>{
      countEl.value = String(Math.max(1, Number(countEl.value||1) - 1));
      sync();
    });
    card.querySelector('.extraRemoveBtn').addEventListener('click', ()=>{ card.remove(); reorderExtraCards(); });
    applyDateMinConstraints(card);
    sync();
  }
  
function reorderExtraCards(){
    document.querySelectorAll('.extraActivityCard').forEach((card, i)=>{
      const idx = i+2; card.dataset.activityIndex = idx;
      const p = paletteByIndex(idx);
      card.style.background = p.bg;
      card.style.border = `2px solid ${p.border}`;
      const title = card.querySelector('.extraCardTitle');
      if(title){ title.textContent = `活動${idx}`; title.style.color = p.text; }
      renderExtraCardPlanner(card);
    });
    updateAddLauncher();
  }
  function addExtraActivityCard(){
    const host = getExtraFormsHost(); if(!host) return;
    const idx = currentExtraCount()+2;
    const seed = copySeedFromPrevious();
    const tmp = document.createElement('div'); tmp.innerHTML = makeExtraFormHtml(idx, seed);
    const card = tmp.firstElementChild;
    host.appendChild(card); bindExtraCard(card); reorderExtraCards();
    card.scrollIntoView({behavior:'smooth', block:'start'});
  }

  
function humanizeStep1(){
    const basic = document.getElementById('viewBasic');
    const form = basic?.querySelector('.form');
    if(!basic || !form || document.getElementById('addActivityLauncher')) return;
    const p = paletteByIndex(1);
    form.style.background = p.bg;
    form.style.border = `2px solid ${p.border}`;
    form.style.padding = '18px';
    form.style.borderRadius = '18px';
    form.style.gridTemplateColumns = 'repeat(2,minmax(0,1fr))';
    form.style.gap = '14px';

    const firstLabel = basic.querySelector('.hd h2');
    if(firstLabel) firstLabel.textContent = '1) 活動1';

    const dateField = Array.from(form.querySelectorAll('.field.span2')).find(el => el.querySelector('#fDateStart'));
    const noteField = Array.from(form.querySelectorAll('.field.span2')).find(el => el.querySelector('#fNote'));
    const nameField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fName'));
    const phoneField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fPhone'));
    const emailField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fEmail'));
    const eventTypeField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fEventType'));
    const cityField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fCity'));
    const addrField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fAddr'));
    const bldgField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fBldg'));
    const crowdField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fCrowd'));
    const indoorField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fIndoor'));
    const truckField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fTruckAccess'));
    const moveField = Array.from(form.querySelectorAll('.field')).find(el => el.querySelector('#fMoveFloor'));
    const plannerField = document.getElementById('mainPlannerField');
    const addDayField = document.getElementById('mainAddDayWrap');
    [cityField, addrField, bldgField, dateField, plannerField, addDayField, noteField].forEach(el=>el && el.classList.add('span2'));
    [nameField,phoneField,emailField,eventTypeField,cityField,addrField,bldgField,crowdField,indoorField,truckField,moveField,dateField,plannerField,addDayField,noteField]
      .filter(Boolean).forEach(el=>form.appendChild(el));
    const dateLabel = dateField?.querySelector('label');
    if(dateLabel) dateLabel.textContent = '活動日期';
    if(plannerField){ const l=plannerField.querySelector('label'); if(l) l.textContent='活動時間規劃'; }
    if(addDayField){ const l=addDayField.querySelector('label'); if(l) l.textContent='連續增加天數'; }
    const minDate = new Date();
    const y=minDate.getFullYear(), m=String(minDate.getMonth()+1).padStart(2,'0'), d=String(minDate.getDate()).padStart(2,'0');
    const todayStr = `${y}-${m}-${d}`;
    const mainDateInput = document.getElementById('fDateStart');
    if(mainDateInput) mainDateInput.min = todayStr;
    const footer = basic.querySelector('div[style*="justify-content:flex-end"]');
    const dateInner = dateField?.querySelector('div[style*="display:grid;gap:8px"]');
    if(dateInner){
      const dateRow = dateField.querySelector('.dateRow');
      const mainWrap = document.getElementById('mainInlineWrap');
      if(dateRow && mainWrap){
        dateInner.innerHTML='';
        dateInner.appendChild(dateRow);
        dateInner.appendChild(mainWrap);
      }
    }

    const launcher = document.createElement('div');
    launcher.id = 'addActivityLauncher';
    launcher.className = 'card';
    launcher.style.cssText = 'margin-top:18px;padding:18px;border-radius:18px;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.05);width:100%';
    launcher.addEventListener('click', addExtraActivityCard);

    const host = document.createElement('div');
    host.id = 'extraFormsHost';
    host.style.marginTop = '12px';

    if(footer){
      basic.insertBefore(host, footer);
      basic.insertBefore(launcher, footer);
    }else{
      basic.appendChild(host);
      basic.appendChild(launcher);
    }
    updateAddLauncher();

    if(noteField){ noteField.style.marginBottom = '8px'; }
  }

  const _oldGetGlobalFormFromUI = window.getGlobalFormFromUI;
  window.getGlobalFormFromUI = function(){
    const g = _oldGetGlobalFormFromUI ? _oldGetGlobalFormFromUI() : {};
    return g;
  };

  window.buildUnitsFromStep1 = function(){
    const ds = normalizeDateStr(document.getElementById('fDateStart')?.value||'');
    if(!ds){ alert('請先選擇活動1日期。'); return false; }
    if(ds < todayStr()){ alert('不可以選過去的日期。'); return false; }
    state.globalForm = getGlobalFormFromUI();

    const main = createMainUnit();
    applyGlobalFormToUnit(main);
    main.form = Object.assign({}, state.globalForm || {});

    const extraCards = Array.from(document.querySelectorAll('.extraActivityCard'));
    const extraUnits = [];
    for(let i=0;i<extraCards.length;i++){
      const card = extraCards[i];
      const dates = extraCardDates(card);
      if(!dates.length){ alert(`請先填寫活動${i+2}的日期。`); return false; }
      const u = createExtraUnit({id: card.dataset.uid, date: dates[0]}, i);
      u.form = {
        name: card.querySelector('.xName')?.value?.trim() || '',
        phone: card.querySelector('.xPhone')?.value?.trim() || '',
        email: card.querySelector('.xEmail')?.value?.trim() || '',
        city: card.querySelector('.xCity')?.value || '',
        area: card.querySelector('.xArea')?.value || '',
        addr: card.querySelector('.xAddr')?.value?.trim() || '',
        bldg: card.querySelector('.xBldg')?.value?.trim() || '',
        eventType: card.querySelector('.xEventType')?.value || '',
        crowd: card.querySelector('.xCrowd')?.value || '',
        indoor: card.querySelector('.xIndoor')?.value || '',
        truckAccess: card.querySelector('.xTruckAccess')?.value || '',
        moveFloor: card.querySelector('.xMoveFloor')?.value || '',
        note: card.querySelector('.xNote')?.value?.trim() || '',
        dayNote: card.querySelector('.xNote')?.value?.trim() || ''
      };
      u.dates = dates;
      u.startDate = dates[0];
      u.endDate = dates[dates.length-1];
      u.date = dates[0];
      // sync first-day meta into legacy key for other views
      const firstKey = `${card.dataset.uid}-${dates[0]}`;
      state.planMeta[u.uid] = JSON.parse(JSON.stringify(state.planMeta[firstKey] || {start:'09:00', end:'12:00', s2On:false, s2Start:'18:00', s2End:'21:00'}));
      extraUnits.push(u);
    }
    state.units = [main, ...extraUnits];
    state.currentIndex = 0;
    return true;
  };

  // small support for extra cards in Step2/Step3 totals; keeps prior flow but allows better labels.
  window.countUnitS2Days = function(u){
    if(!u || !u.dates || !u.dates.length) return 0;
    return (u.dates||[]).reduce((n,d)=>{
      const meta = ensurePlanMeta((u.kind==='main' ? `main-${d}` : `${u.uid}-${d}`));
      return n + (meta.s2On ? 1 : 0);
    },0);
  };
  window.calcExtraTotal = function(extraUnit){
    const B = calcEquipSubtotal(extraUnit);
    const dates = (extraUnit.dates && extraUnit.dates.length) ? extraUnit.dates : [extraUnit.date];
    const N = Math.max(1, dates.filter(Boolean).length);
    let contFee = 0;
    if(N>=2) contFee += Math.round(B*0.50);
    if(N>=3) contFee += Math.round(B*0.30) * (N-2);
    let s2Count = 0;
    dates.forEach((d, i)=>{
      const key = extraUnit.dates && extraUnit.dates.length ? `${extraUnit.uid}-${d}` : extraUnit.uid;
      const meta = ensurePlanMeta(key);
      if(meta.s2On) s2Count++;
    });
    const s2Fee = Math.round(B*0.30) * s2Count;
    return {B, N, contFee, s2Count, s2Fee, total: B + contFee + s2Fee};
  };
  window.calcGrandTotal = function(){
    const units = state.units || [];
    const main = units[0];
    const mainR = main ? calcMainTotal(main) : {total:0};
    const extras = units.slice(1).map(u=>calcExtraTotal(u));
    const extraSum = extras.reduce((a,x)=>a+Number(x.total||0),0);
    return { main: mainR, extras, total: Number(mainR.total||0) + extraSum };
  };

  const _oldBuildPayload = window.buildQuotePayload_v2;
  window.buildQuotePayload_v2 = function(){
    const units = state.units || [];
    const main = units[0];
    if(!main) throw new Error('尚未建立任何項目，請先完成 Step1 並生成活動表單。');
    const sessions=[]; const g = state.globalForm || {};
    const B = calcEquipSubtotal(main); const mainItems = buildItemsForPayload_(main);
    (main.dates||[]).forEach((d,i)=>{
      const meta = ensurePlanMeta(`main-${d}`); const dayBase = calcMainDayBase_(B,i);
      sessions.push({label:`主案 Day${i+1} 第一場`,date:d,timeStart:meta.start||'',timeEnd:meta.end||'',total:dayBase,form:Object.assign({}, main.form||g,{sessionNote:(main.form&&main.form.dayNote)||''}),items:mainItems});
      if(meta.s2On) sessions.push({label:`主案 Day${i+1} 第二場`,date:d,timeStart:meta.s2Start||'',timeEnd:meta.s2End||'',total:Math.round(B*0.30),form:Object.assign({}, main.form||g,{sessionNote:(main.form&&main.form.dayNote)||''}),items:mainItems});
    });
    units.slice(1).forEach((u)=>{
      const Bx = calcEquipSubtotal(u); const items = buildItemsForPayload_(u); const dates = (u.dates&&u.dates.length)?u.dates:[u.date];
      dates.forEach((d,i)=>{
        const meta = ensurePlanMeta((u.dates&&u.dates.length)?`${u.uid}-${d}`:u.uid);
        let dayBase = Number(Bx||0); if(i===1) dayBase = Math.round(Bx*0.50); else if(i>=2) dayBase = Math.round(Bx*0.30);
        sessions.push({label:`活動 ${u.extraIndex} Day${i+1} 第一場`,date:d,timeStart:meta.start||'',timeEnd:meta.end||'',total:dayBase,form:Object.assign({}, u.form||g,{sessionNote:(u.form&&u.form.dayNote)||''}),items});
        if(meta.s2On) sessions.push({label:`活動 ${u.extraIndex} Day${i+1} 第二場`,date:d,timeStart:meta.s2Start||'',timeEnd:meta.s2End||'',total:Math.round(Bx*0.30),form:Object.assign({}, u.form||g,{sessionNote:(u.form&&u.form.dayNote)||''}),items});
      });
    });
    const baseTotal = sessions.reduce((a,s)=>a+Number(s.total||0),0);
    return { action:'submitQuote_v2', editToken: EDIT_TOKEN || '', globalForm:g, sessions:sessions, baseTotal:baseTotal, grandTotal:baseTotal, uiState:{ state:state, ui:{ fIsMultiDay:!!document.getElementById('fIsMultiDay')?.checked, globalFormNow:getGlobalFormFromUI() } } };
  };

  setTimeout(humanizeStep1, 50);
})();