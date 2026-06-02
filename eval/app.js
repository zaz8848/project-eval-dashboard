import { DATA, PLANS } from './data.js';

mermaid.initialize({ startOnLoad: false, theme: 'neutral', themeVariables: { fontSize: '12px' } });

// ===== State =====
let filters = {};
let currentItem = null;

// ===== Column Filters (Excel-style) =====
function buildFilters() {
    const cols = ['module', 'priority', 'version', 'risk', 'status'];
    cols.forEach(col => {
        const values = [...new Set(DATA.map(d => d[col]))].sort();
        const container = document.getElementById('filter-' + col);
        if (!container) return;
        container.innerHTML = '&#9662;';
        container.onclick = (e) => {
            e.stopPropagation();
            toggleFilterDropdown(col, values, container);
        };
    });
}

function toggleFilterDropdown(col, values, anchor) {
    const existing = document.querySelector('.filter-dropdown');
    if (existing) { existing.remove(); return; }

    const dd = document.createElement('div');
    dd.className = 'filter-dropdown';
    dd.onclick = e => e.stopPropagation();

    const allLabel = document.createElement('label');
    const allCb = document.createElement('input');
    allCb.type = 'checkbox';
    allCb.checked = !filters[col] || filters[col].length === 0;
    allCb.onchange = () => {
        if (allCb.checked) { delete filters[col]; }
        dd.querySelectorAll('input[data-val]').forEach(cb => cb.checked = allCb.checked);
        renderTable();
    };
    allLabel.append(allCb, ' 全部');
    dd.appendChild(allLabel);

    values.forEach(v => {
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.dataset.val = v;
        cb.checked = !filters[col] || filters[col].includes(v);
        cb.onchange = () => {
            const checked = [...dd.querySelectorAll('input[data-val]:checked')].map(c => c.dataset.val);
            if (checked.length === values.length) delete filters[col];
            else filters[col] = checked;
            allCb.checked = checked.length === values.length;
            renderTable();
        };
        const display = col === 'risk' ? { high: '高', medium: '中', low: '低' }[v] || v : v;
        label.append(cb, ' ' + display);
        dd.appendChild(label);
    });

    anchor.closest('th').appendChild(dd);
    document.addEventListener('click', function handler() {
        dd.remove();
        document.removeEventListener('click', handler);
    }, { once: false });
    setTimeout(() => {
        document.addEventListener('click', function handler2() {
            dd.remove();
            document.removeEventListener('click', handler2);
        }, { once: true });
    }, 0);
}

// ===== Render Table =====
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const filtered = DATA.filter(d => {
        for (const [col, vals] of Object.entries(filters)) {
            if (vals.length > 0 && !vals.includes(d[col])) return false;
        }
        return true;
    });

    filtered.forEach(d => {
        const modTag = { 智能问数: 't-red', 营销助手: 't-amber', 营销策略: 't-blue', 基础后台: 't-purple' }[d.module] || 't-gray';
        const verTag = { ['V1.0']: 't-green', ['V2.0']: 't-blue', ['V2.1']: 't-gray', ['远期']: 't-purple' }[d.version] || 't-gray';
        const priClass = { P0: 'pri-p0', P1: 'pri-p1', P2: 'pri-p2' }[d.priority] || 'pri-p2';
        const riskClass = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' }[d.risk];
        const riskText = { high: '高', medium: '中', low: '低' }[d.risk];

        const tr = document.createElement('tr');
        tr.className = 'row';
        tr.innerHTML = `
      <td><span class="chev">&#9654;</span></td>
      <td style="font-weight:500">${d.name}</td>
      <td><span class="tag ${modTag}">${d.module}</span></td>
      <td><div class="pri"><span class="pri-dot ${priClass}"></span>${d.priority}</div></td>
      <td><span class="tag ${verTag}">${d.version}</span></td>
      <td><div class="risk-label"><span class="risk-dot ${riskClass}"></span>${riskText}</div></td>
      <td style="text-align:center"><input class="cell-input" type="number" min="0" value="${d.effort || ''}" placeholder="—" onclick="event.stopPropagation()" onchange="updateField(${d.id},'effort',this.valueAsNumber||null)"></td>
      <td>
        <select class="cell-select" onclick="event.stopPropagation()" onchange="updateField(${d.id},'status',this.value)">
          ${['待评估', '已确认', '开发中', '已完成', '暂缓'].map(s => `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    `;
        tr.onclick = () => openSidePanel(d.id);
        tbody.appendChild(tr);
    });

    updateSummary();
}

// ===== Side Panel =====
function openSidePanel(id) {
    currentItem = DATA.find(d => d.id === id);
    if (!currentItem) return;
    const d = currentItem;

    document.getElementById('spTitle').textContent = d.name;
    document.getElementById('spTitle').oninput = function () { d.name = this.textContent; renderTable(); autoSave(); };

    const body = document.getElementById('spBody');
    body.innerHTML = `
    <!-- Metadata -->
    <div class="sp-section">
      <div class="sp-label">基本信息</div>
      <div class="sp-field">
        <span class="sp-field-label">所属模块</span>
        <select class="cell-select" onchange="updateField(${d.id},'module',this.value);reopenPanel()">
          ${['智能问数', '营销助手', '营销策略', '基础后台'].map(m => `<option ${d.module === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
        <span class="sp-field-label">优先级</span>
        <select class="cell-select" onchange="updateField(${d.id},'priority',this.value);reopenPanel()">
          ${['P0', 'P1', 'P2'].map(p => `<option ${d.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <span class="sp-field-label">版本</span>
        <select class="cell-select" onchange="updateField(${d.id},'version',this.value);reopenPanel()">
          ${['V1.0', 'V2.0', 'V2.1', '远期'].map(v => `<option ${d.version === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <span class="sp-field-label">风险等级</span>
        <select class="cell-select" onchange="updateField(${d.id},'risk',this.value);reopenPanel()">
          ${['high', 'medium', 'low'].map(r => `<option value="${r}" ${d.risk === r ? 'selected' : ''}>${{ high: '高', medium: '中', low: '低' }[r]}</option>`).join('')}
        </select>
        <span class="sp-field-label">人天</span>
        <input class="cell-input" type="number" min="0" value="${d.effort || ''}" placeholder="—" onchange="updateField(${d.id},'effort',this.valueAsNumber||null)">
        <span class="sp-field-label">状态</span>
        <select class="cell-select" onchange="updateField(${d.id},'status',this.value);reopenPanel()">
          ${['待评估', '已确认', '开发中', '已完成', '暂缓'].map(s => `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Description (original) -->
    <div class="sp-section">
      <div class="sp-label">功能说明（原文档）</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'desc',this.textContent)">${d.desc}</div>
    </div>

    <!-- Tech Analysis -->
    <div class="sp-section">
      <div class="sp-label">技术实现方案</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'techAnalysis',this.textContent)">${d.techAnalysis}</div>
    </div>

    <!-- Tech Allocation -->
    <div class="sp-section">
      <div class="sp-label">技术方案分配</div>
      <div class="tech-alloc" id="techAlloc"></div>
      <div style="margin-top:8px">
        <button class="btn" onclick="addTech(${d.id})">+ 添加技术</button>
      </div>
    </div>

    <!-- Risks -->
    <div class="sp-section">
      <div class="sp-label">风险点</div>
      <div id="riskList"></div>
    </div>

    <!-- Diagram -->
    <div class="sp-section">
      <div class="sp-label">技术路线图</div>
      <div class="diagram-container">
        <div class="mermaid" id="diagramPreview"></div>
      </div>
      <textarea class="diagram-edit" id="diagramSrc" oninput="updateDiagram(${d.id},this.value)">${d.diagram}</textarea>
      <div class="diagram-toolbar">
        <button class="btn" onclick="renderDiagram()">刷新预览</button>
        <button class="btn" onclick="openMermaidLive()">在编辑器中打开</button>
      </div>
    </div>

    <!-- Note -->
    <div class="sp-section">
      <div class="sp-label">备注</div>
      <textarea class="sp-note" oninput="updateField(${d.id},'note',this.value)">${d.note}</textarea>
    </div>
  `;

    renderTechAlloc(d);
    renderRisks(d);
    renderDiagram();

    document.getElementById('sidePanel').classList.add('open');
    document.getElementById('spOverlay').classList.add('open');
}

function closeSidePanel() {
    document.getElementById('sidePanel').classList.remove('open');
    document.getElementById('spOverlay').classList.remove('open');
    currentItem = null;
}

function reopenPanel() {
    if (currentItem) openSidePanel(currentItem.id);
}

// ===== Tech Allocation =====
function renderTechAlloc(d) {
    const container = document.getElementById('techAlloc');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', '#8B5CF6', '#06B6D4', '#EC4899'];
    d.techs.forEach((t, i) => {
        const color = colors[i % colors.length];
        const row = document.createElement('div');
        row.className = 'tech-alloc-row';
        row.innerHTML = `
      <span class="tech-alloc-name inline-edit" contenteditable="true" oninput="DATA.find(x=>x.id===${d.id}).techs[${i}].name=this.textContent;autoSave()">${t.name}</span>
      <div class="tech-alloc-bar"><div class="tech-alloc-fill" style="width:${t.pct}%;background:${color}"></div></div>
      <input class="tech-alloc-input" type="number" min="0" max="100" value="${t.pct}" onchange="updateTechPct(${d.id},${i},this.valueAsNumber)">
      <span style="font-size:11px;color:var(--text-3)">%</span>
      <button class="btn" style="height:20px;padding:0 4px;font-size:10px" onclick="removeTech(${d.id},${i})">x</button>
    `;
        container.appendChild(row);
    });
}

window.updateTechPct = function (id, idx, val) {
    const d = DATA.find(x => x.id === id);
    if (d && d.techs[idx]) { d.techs[idx].pct = val; renderTechAlloc(d); autoSave(); }
};

window.addTech = function (id) {
    const d = DATA.find(x => x.id === id);
    if (d) { d.techs.push({ name: '新技术', pct: 10 }); renderTechAlloc(d); autoSave(); }
};

window.removeTech = function (id, idx) {
    const d = DATA.find(x => x.id === id);
    if (d) { d.techs.splice(idx, 1); renderTechAlloc(d); autoSave(); }
};

// ===== Risks =====
function renderRisks(d) {
    const container = document.getElementById('riskList');
    if (!container) return;
    if (d.risks.length === 0) {
        container.innerHTML = '<div style="font-size:12px;color:var(--text-3)">无重大风险</div>';
        return;
    }
    container.innerHTML = d.risks.map((r, i) => `
    <div class="sp-risk ${r.level}">
      <span contenteditable="true" oninput="DATA.find(x=>x.id===${d.id}).risks[${i}].text=this.textContent;autoSave()">${r.text}</span>
    </div>
  `).join('');
}

// ===== Diagram =====
window.renderDiagram = async function () {
    const src = document.getElementById('diagramSrc');
    const preview = document.getElementById('diagramPreview');
    if (!src || !preview) return;
    preview.removeAttribute('data-processed');
    preview.textContent = src.value;
    try { await mermaid.run({ nodes: [preview] }); } catch (e) { preview.textContent = '语法错误: ' + e.message; }
};

window.updateDiagram = function (id, val) {
    const d = DATA.find(x => x.id === id);
    if (d) { d.diagram = val; autoSave(); }
};

window.openMermaidLive = function () {
    const src = document.getElementById('diagramSrc');
    if (src) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ code: src.value, mermaid: { theme: 'neutral' } }))));
        window.open('https://mermaid.live/edit#base64:' + encoded, '_blank');
    }
};

// ===== Field Updates =====
window.updateField = function (id, field, val) {
    const d = DATA.find(x => x.id === id);
    if (d) { d[field] = val; renderTable(); autoSave(); }
};

// ===== Summary =====
function updateSummary() {
    document.getElementById('s-total').textContent = DATA.length;
    document.getElementById('s-v1').textContent = DATA.filter(d => d.version === 'V1.0').length;
    const v1e = DATA.filter(d => d.version === 'V1.0').reduce((s, d) => s + (d.effort || 0), 0);
    document.getElementById('s-effort').textContent = v1e > 0 ? v1e : '—';
    document.getElementById('s-risk').textContent = DATA.filter(d => d.risk === 'high').length;
}

// ===== Add Row =====
window.addRow = function () {
    const id = Math.max(...DATA.map(d => d.id)) + 1;
    DATA.push({
        id, name: '新功能项', module: '智能问数', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '待补充', techAnalysis: '待补充', techs: [{ name: '待定', pct: 100 }], risks: [], diagram: 'graph LR\n  A[输入] --> B[处理] --> C[输出]', note: ''
    });
    renderTable();
    openSidePanel(id);
};

// ===== Plans View =====
function ganttFromTasks(tasks, title) {
    let mmd = `gantt\n    title ${title}\n    dateFormat YYYY-MM-DD\n    axisFormat %m月`;
    let lastSection = '';
    tasks.forEach((t, i) => {
        if (t.section !== lastSection) { mmd += `\n    section ${t.section}`; lastSection = t.section; }
        if (t.milestone) mmd += `\n    ${t.name}      :milestone, t${i}, ${t.start}, 0d`;
        else mmd += `\n    ${t.name}      :t${i}, ${t.start}, ${t.days}d`;
    });
    return mmd;
}

function renderPlans() {
    const container = document.getElementById('view-plans');

    // Comparison table
    let html = `
    <div class="panel" style="margin-bottom:20px">
      <div class="panel-header">方案对比总览</div>
      <div class="panel-body" style="padding:0">
        <table class="rtable">
          <thead><tr><th>维度</th><th>方案一：优先级驱动<br><span class="tag t-green" style="margin-left:4px">推荐</span></th><th>方案二：全量并行</th></tr></thead>
          <tbody>
            <tr><td><b>交付节奏</b></td><td>分三批次，渐进式交付</td><td>V1.0 一次性全量交付</td></tr>
            <tr><td><b>首期范围</b></td><td>智能问数 + 基础后台核心（6 项）</td><td>四模块 V1.0 全部（8+ 项）</td></tr>
            <tr><td><b>首期人天</b></td><td>较少（聚焦核心）</td><td>较多（全量并行）</td></tr>
            <tr><td><b>风险控制</b></td><td>先 POC 验证 NL2SQL，低风险</td><td>NL2SQL 不通影响全局</td></tr>
            <tr><td><b>适用场景</b></td><td>需要先验证技术可行性；微软赋能支持</td><td>客户要求快速看到全貌；团队充足</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

    // Plan cards
    html += PLANS.map((p, pi) => {
        const ganttId = 'gantt-' + p.id;
        const tableId = 'ganttTable-' + p.id;

        const taskRows = p.ganttTasks.map((t, i) => `
      <tr>
        <td><input class="cell-input" style="width:70px;text-align:left" value="${t.section}" onchange="updateGanttTask(${pi},${i},'section',this.value)"></td>
        <td><input class="cell-input" style="width:140px;text-align:left" value="${t.name}" onchange="updateGanttTask(${pi},${i},'name',this.value)"></td>
        <td><input class="cell-input" style="width:100px" type="date" value="${t.start}" onchange="updateGanttTask(${pi},${i},'start',this.value)"></td>
        <td><input class="cell-input" style="width:50px" type="number" min="0" value="${t.days}" onchange="updateGanttTask(${pi},${i},'days',parseInt(this.value))" ${t.milestone ? 'disabled' : ''}></td>
        <td><input type="checkbox" ${t.milestone ? 'checked' : ''} onchange="updateGanttTask(${pi},${i},'milestone',this.checked)"></td>
        <td><button class="btn" style="height:20px;padding:0 6px;font-size:10px" onclick="removeGanttTask(${pi},${i})">x</button></td>
      </tr>
    `).join('');

        return `
    <div class="plan-card">
      <div class="plan-card-header">
        <h3>${p.name} ${p.tag ? `<span class="tag t-green" style="margin-left:8px">${p.tag}</span>` : ''}</h3>
        <p>${p.summary}</p>
      </div>
      <div class="plan-card-body">
        <div class="sp-label">实施策略</div>
        <div class="sp-desc" style="margin-bottom:16px">${p.strategy}</div>

        <div class="sp-label">甘特图</div>
        <div class="gantt-container" style="background:#FAFAFA;border:1px solid var(--border);border-radius:6px;padding:16px;margin-bottom:8px;overflow-x:auto">
          <pre class="mermaid" id="${ganttId}"></pre>
        </div>

        <details style="margin-bottom:16px">
          <summary style="cursor:pointer;font-size:12px;font-weight:600;color:var(--text-2);padding:6px 0;">编辑甘特图数据</summary>
          <table class="rtable" id="${tableId}" style="margin-top:8px;font-size:12px">
            <thead><tr><th>阶段</th><th>任务名称</th><th>开始日期</th><th>天数</th><th>里程碑</th><th></th></tr></thead>
            <tbody>${taskRows}</tbody>
          </table>
          <div style="margin-top:8px;display:flex;gap:8px">
            <button class="btn" onclick="addGanttTask(${pi})">+ 添加任务</button>
            <button class="btn" onclick="refreshGantt('${p.id}',${pi})" style="background:var(--primary);color:#fff;border-color:var(--primary)">刷新甘特图</button>
          </div>
        </details>

        <div class="sp-label">阶段规划</div>
        ${p.phases.map((ph, i) => `
          <div class="plan-phase">
            <div class="plan-phase-name"><span class="pri-dot" style="background:${['var(--danger)', 'var(--warning)', 'var(--primary)'][i] || 'var(--text-3)'}"></span>${ph.name}</div>
            <ul class="plan-phase-items">${ph.items.map(it => `<li>${it}</li>`).join('')}</ul>
            <div class="plan-phase-focus">重点：${ph.focus}</div>
            ${ph.acceptance ? `<div style="font-size:11px;color:var(--success);margin-top:2px">验收标准：${ph.acceptance}</div>` : ''}
          </div>
        `).join('')}

        <div class="plan-pros-cons">
          <div>
            <div class="sp-label">优势</div>
            <ul class="plan-list">${p.pros.map(t => `<li><span class="dot" style="background:var(--success)"></span>${t}</li>`).join('')}</ul>
          </div>
          <div>
            <div class="sp-label">劣势</div>
            <ul class="plan-list">${p.cons.map(t => `<li><span class="dot" style="background:var(--danger)"></span>${t}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    </div>`;
    }).join('');

    container.innerHTML = html;

    // Render Gantt charts
    PLANS.forEach((p, pi) => {
        const el = document.getElementById('gantt-' + p.id);
        if (el) {
            el.textContent = ganttFromTasks(p.ganttTasks, p.name.split('：')[0] || p.name);
            mermaid.run({ nodes: [el] });
        }
    });
}

window.updateGanttTask = function (planIdx, taskIdx, field, val) {
    PLANS[planIdx].ganttTasks[taskIdx][field] = val;
    autoSave();
};

window.addGanttTask = function (planIdx) {
    PLANS[planIdx].ganttTasks.push({ section: '新阶段', name: '新任务', start: '2026-06-01', days: 20, milestone: false });
    renderPlans();
};

window.removeGanttTask = function (planIdx, taskIdx) {
    PLANS[planIdx].ganttTasks.splice(taskIdx, 1);
    renderPlans();
};

window.refreshGantt = function (planId, planIdx) {
    const el = document.getElementById('gantt-' + planId);
    if (el) {
        el.removeAttribute('data-processed');
        el.innerHTML = '';
        el.textContent = ganttFromTasks(PLANS[planIdx].ganttTasks, PLANS[planIdx].name.split('：')[0] || PLANS[planIdx].name);
        mermaid.run({ nodes: [el] });
    }
};

// ===== View Switching =====
window.switchView = function (v) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(t => t.classList.remove('active'));
    const idx = { list: 0, risks: 1, plans: 2 }[v] || 0;
    document.querySelectorAll('.nav-tab')[idx].classList.add('active');
    document.getElementById('view-' + (v === 'list' ? 'list' : v === 'risks' ? 'risks' : 'plans')).classList.add('active');
};

// ===== Save / Load / Export =====
function autoSave() {
    clearTimeout(window._ast);
    window._ast = setTimeout(saveAll, 1500);
}

window.saveAll = function () {
    const saves = {
        data: DATA.map(d => ({ id: d.id, name: d.name, module: d.module, priority: d.priority, version: d.version, risk: d.risk, effort: d.effort, status: d.status, desc: d.desc, techAnalysis: d.techAnalysis, techs: d.techs, risks: d.risks, diagram: d.diagram, note: d.note })),
        plans: PLANS.map(p => ({ id: p.id, ganttTasks: p.ganttTasks })),
        deps: {}
    };
    document.querySelectorAll('[data-field]').forEach(el => { saves.deps[el.getAttribute('data-field')] = el.value; });
    localStorage.setItem('aeon-eval-v3', JSON.stringify(saves));
    toast('已保存');
};

window.loadAll = function () {
    const raw = localStorage.getItem('aeon-eval-v3');
    if (!raw) { toast('没有保存的数据'); return; }
    const saves = JSON.parse(raw);
    if (saves.data) {
        saves.data.forEach(s => {
            const d = DATA.find(x => x.id === s.id);
            if (d) Object.assign(d, s);
        });
    }
    if (saves.plans) {
        saves.plans.forEach(s => {
            const p = PLANS.find(x => x.id === s.id);
            if (p && s.ganttTasks) p.ganttTasks = s.ganttTasks;
        });
    }
    if (saves.deps) {
        Object.entries(saves.deps).forEach(([k, v]) => { const el = document.querySelector(`[data-field="${k}"]`); if (el) el.value = v; });
    }
    renderTable();
    renderPlans();
    toast('已恢复');
};

window.exportJSON = function () {
    const d = { exportDate: new Date().toISOString(), project: 'AEON CDP+AI', items: DATA };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = `AEON-CDP-AI-eval-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
};

function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#111827;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;z-index:9999';
    document.body.appendChild(t); setTimeout(() => t.remove(), 1500);
}

// ===== Init =====
buildFilters();
renderTable();
renderPlans();
