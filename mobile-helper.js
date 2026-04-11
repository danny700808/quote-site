(function(){
  function onReady(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }
  onReady(function(){
    const hiddenCss = document.createElement('style');
    hiddenCss.textContent = `
      #mainSequentialControls{margin-top:10px;padding:10px;border:1px dashed var(--line);border-radius:12px;background:#fff;}
      #mainSequentialControls .btn{min-width:132px}
    `;
    document.head.appendChild(hiddenCss);

    function getCountHidden(){
      let el = document.getElementById('mainDayCountHidden');
      if(!el){
        el = document.createElement('input');
        el.type = 'hidden';
        el.id = 'mainDayCountHidden';
        el.value = '1';
        (document.getElementById('fDateEnd')?.parentElement || document.body).appendChild(el);
      }
      return el;
    }

    function norm(v){ return window.normalizeDateStr ? window.normalizeDateStr(v||'') : (v||''); }

    function setCount(n){
      const el = getCountHidden();
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      const count = ds ? Math.max(1, Number(n||1)) : 0;
      el.value = String(count);
      syncLegacyFields();
      const pill = document.querySelector('#mainSequentialControls .pill');
      if(pill) pill.textContent = `目前 ${count || 0} 天`;
    }

    function getCount(){
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      if(!ds) return 0;
      return Math.max(1, Number(getCountHidden().value || 1));
    }

    function syncLegacyFields(){
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      const count = ds ? Math.max(1, Number(getCountHidden().value || 1)) : 0;
      const multi = document.getElementById('fIsMultiDay');
      const endEl = document.getElementById('fDateEnd');
      const mirror = document.getElementById('fDateStartMirror');
      if(multi) multi.checked = count > 1;
      if(mirror) mirror.value = ds || '';
      if(endEl){
        endEl.value = (ds && count > 1 && window.addDays) ? window.addDays(ds, count - 1) : '';
      }
    }

    function syncCountFromInputs(){
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      if(!ds){ setCount(0); return; }
      const end = norm(document.getElementById('fDateEnd')?.value || '');
      if(end && window.listDatesBetween){
        const arr = window.listDatesBetween(ds, end) || [];
        setCount(arr.length || 1);
      }else{
        setCount(1);
      }
    }

    window.getMainDates = function(){
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      if(!ds) return [];
      const count = Math.max(1, Number(getCountHidden().value || 1));
      const out = [];
      for(let i=0;i<count;i++) out.push(window.addDays ? window.addDays(ds, i) : ds);
      syncLegacyFields();
      return out;
    };

    function attachSequentialControls(dates){
      const planner = document.getElementById('mainInlinePlanner');
      if(!planner) return;
      let controls = document.getElementById('mainSequentialControls');
      if(!controls){
        controls = document.createElement('div');
        controls.id = 'mainSequentialControls';
        planner.after(controls);
      }
      const count = dates.length;
      controls.innerHTML = `
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn" id="mainAddDayBtn_v2" type="button">＋再增加一天</button>
          ${count > 1 ? '<button class="btn" id="mainRemoveDayBtn_v2" type="button">－移除最後一天</button>' : ''}
          <span class="pill">目前 ${count} 天</span>
        </div>
      `;
      controls.querySelector('#mainAddDayBtn_v2')?.addEventListener('click', ()=>{
        const ds = norm(document.getElementById('fDateStart')?.value || '');
        if(!ds) return alert('請先選擇活動1日期。');
        setCount(getCount() + 1);
        window.renderMainInline?.();
      });
      controls.querySelector('#mainRemoveDayBtn_v2')?.addEventListener('click', ()=>{
        const ds = norm(document.getElementById('fDateStart')?.value || '');
        if(!ds) return;
        setCount(Math.max(1, getCount() - 1));
        window.renderMainInline?.();
      });
    }

    window.renderMainInline = function(){
      const ds = norm(document.getElementById('fDateStart')?.value || '');
      const wrap = document.getElementById('mainInlineWrap');
      const list = document.getElementById('mainInlinePlanner');
      const plannerField = document.getElementById('mainPlannerField');
      const addWrap = document.getElementById('mainAddDayWrap');
      if(!wrap || !list) return;
      if(!ds){
        if(plannerField) plannerField.style.display = 'none';
        if(addWrap) addWrap.style.display = 'none';
        wrap.style.display = 'none';
        list.innerHTML = '';
        const ctrl = document.getElementById('mainSequentialControls'); if(ctrl) ctrl.innerHTML = '';
        setCount(0);
        return;
      }
      if(getCount() < 1) setCount(1); else syncLegacyFields();
      const dates = window.getMainDates();
      if(plannerField) plannerField.style.display = 'block';
      if(addWrap) addWrap.style.display = 'block';
      wrap.style.display = 'block';
      const rows = dates.map((d,i)=>({
        key: `main-${d}`,
        title: `活動1｜第${i+1}天`,
        dateText: d,
        sub: '',
        pill: ''
      }));
      window.renderPlannerRows?.(list, rows, ()=>{
        if(window.state && window.state.units && window.state.units.length){
          window.renderDayCards?.();
          window.renderIfEditingMain?.();
        }
      });
      attachSequentialControls(dates);
    };

    function patchDateField(){
      const startEl = document.getElementById('fDateStart');
      if(!startEl) return;
      try{
        const today = todayISO();
        startEl.min = today;
        if(startEl.value && startEl.value < today){ startEl.dataset.prevPastDate = startEl.value; }
      }catch(_){ }
      startEl.addEventListener('change', ()=>{
        const v = norm(startEl.value);
        const today = todayISO();
        if(v && v < today){
          startEl.value = startEl.dataset.prevPastDate || '';
          if(!startEl.value){ alert('活動日期不能選擇今天以前的日期。'); }
        }else if(v){
          delete startEl.dataset.prevPastDate;
        }
        const hasDate = !!norm(startEl.value);
        if(hasDate && getCount() < 1) setCount(1);
        if(!hasDate) setCount(0);
        window.renderMainInline?.();
      });
    }

    syncCountFromInputs();
    patchDateField();
    applyDateMinConstraints(document);
    setTimeout(()=>{ syncCountFromInputs(); applyDateMinConstraints(document); window.renderMainInline?.(); }, 120);
    setTimeout(()=>{ syncCountFromInputs(); applyDateMinConstraints(document); window.renderMainInline?.(); }, 400);
  });
})();