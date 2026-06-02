import { DATA, PLANS } from './data.js';
import { initChart, updateChartData } from './chart.js';
import { togglePresentation } from './present.js';

mermaid.initialize({ startOnLoad: false, theme: 'neutral', themeVariables: { fontSize: '12px' } });

// ===== State =====
let filters = {};
let currentItem = null;

// ===== Nav Tab Switching =====
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('view-' + view).classList.add('active');
        if (view === 'matrix') { updateChartData(DATA); }
        if (view === 'deps') renderDeps();
        if (view === 'cost') renderCost();
    });
});

// Presentation button
document.getElementById('btnPresent').addEventListener('click', () => togglePresentation(DATA, PLANS));

// ===== DASHBOARD =====
function renderDashboard() {
    const total = DATA.length;
    const v1 = DATA.filter(d => d.version === 'V1.0');
    const pending = DATA.filter(d => d.status === '待评估');
    const highRisk = DATA.filter(d => d.risk === 'high');
    const v1Effort = v1.reduce((s, d) => s + (d.effort || 0), 0);
    const totalMonthlyCost = DATA.reduce((s, d) => s + (d.monthlyCost || 0), 0);

    document.getElementById('dc-total').textContent = total;
    document.getElementById('dc-scope-sub').textContent = `V1.0: ${v1.length} 项 | 待评估: ${pending.length} 项`;
    document.getElementById('dc-phase').textContent = 'V1.0 评估';
    document.getElementById('dc-phase-sub').textContent = '2026 年 6-7 月交付';
    document.getElementById('dc-risk').innerHTML = `<span style="color:var(--danger)">${highRisk.length} 高</span>`;
    document.getElementById('dc-risk-sub').textContent = `${DATA.filter(d => d.risk === 'medium').length} 中 / ${DATA.filter(d => d.risk === 'low').length} 低`;
    document.getElementById('dc-budget').textContent = v1Effort > 0 ? v1Effort + ' 人天' : '待填';
    document.getElementById('dc-budget-sub').textContent = `月运营: $${totalMonthlyCost}`;

    // Pending decisions
    const pendingEl = document.getElementById('dash-pending');
    if (pending.length === 0) {
        pendingEl.innerHTML = '<div class="dash-empty">所有功能已评估</div>';
    } else {
        pendingEl.innerHTML = pending.slice(0, 8).map(d => {
            const modTag = { 智能问数: 't-red', 营销助手: 't-amber', 营销策略: 't-blue', 基础后台: 't-purple' }[d.module] || 't-gray';
            return `<div class="dash-pending-item" onclick="openSidePanel(${d.id})">
        <span class="tag ${modTag}">${d.module}</span>
        <span>${d.name}</span>
        <span class="tag t-gray">${d.version}</span>
      </div>`;
        }).join('') + (pending.length > 8 ? `<div class="dash-pending-more">还有 ${pending.length - 8} 项...</div>` : '');
    }

    // Top 3 risks
    const riskEl = document.getElementById('dash-risks');
    riskEl.innerHTML = highRisk.slice(0, 3).map(d => `
    <div class="dash-risk-item">
      <div class="dash-risk-name">${d.name}</div>
      <div class="dash-risk-desc">${d.risks.length > 0 ? d.risks[0].text : '—'}</div>
    </div>
  `).join('') || '<div class="dash-empty">无高风险项</div>';

    // Dependency status (from the keys we know)
    const depItems = [
        { name: 'Azure OpenAI 服务', field: 'dep-azure' },
        { name: 'Copilot Studio 许可', field: 'dep-copilot' },
        { name: 'CDP API 文档', field: 'dep-api' },
        { name: 'Dataverse 环境', field: 'dep-dv' },
        { name: 'CDP 数据字典', field: 'dep-dict' },
    ];
    const depsEl = document.getElementById('dash-deps');
    depsEl.innerHTML = '<div class="dash-dep-grid">' + depItems.map(dep => {
        const el = document.querySelector(`[data-field="${dep.field}"]`);
        const val = el ? el.value : '未知';
        const color = val.includes('已') ? 'var(--success)' : val.includes('待') ? 'var(--warning)' : 'var(--text-3)';
        return `<div class="dash-dep-item"><span class="dash-dep-dot" style="background:${color}"></span><span>${dep.name}</span><span class="dash-dep-val">${val}</span></div>`;
    }).join('') + '</div>';
}

// ===== COLUMN FILTERS (Excel-style) =====
function buildFilters() {
    ['module', 'priority', 'version', 'risk', 'status'].forEach(col => {
        const vals = [...new Set(DATA.map(d => d[col]))].sort();
        const container = document.getElementById('filter-' + col);
        if (!container) return;
        container.innerHTML = '&#9662;';
        container.onclick = (e) => { e.stopPropagation(); toggleFilterDD(col, vals, container); };
    });
}

function toggleFilterDD(col, values, anchor) {
    document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());
    const dd = document.createElement('div');
    dd.className = 'filter-dropdown';
    dd.onclick = e => e.stopPropagation();

    const allLabel = document.createElement('label');
    const allCb = document.createElement('input');
    allCb.type = 'checkbox';
    allCb.checked = !filters[col];
    allCb.onchange = () => { if (allCb.checked) delete filters[col]; dd.querySelectorAll('input[data-val]').forEach(c => c.checked = allCb.checked); renderTable(); };
    allLabel.append(allCb, ' 全部');
    dd.appendChild(allLabel);

    values.forEach(v => {
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.dataset.val = v;
        cb.checked = !filters[col] || filters[col].includes(v);
        cb.onchange = () => {
            const checked = [...dd.querySelectorAll('input[data-val]:checked')].map(c => c.dataset.val);
            if (checked.length === values.length) delete filters[col]; else filters[col] = checked;
            allCb.checked = checked.length === values.length;
            renderTable();
        };
        const display = col === 'risk' ? { high: '高', medium: '中', low: '低' }[v] || v : v;
        label.append(cb, ' ' + display);
        dd.appendChild(label);
    });
    anchor.closest('th').appendChild(dd);
    setTimeout(() => document.addEventListener('click', function h() { dd.remove(); document.removeEventListener('click', h); }, { once: true }), 0);
}

// ===== TABLE =====
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const filtered = DATA.filter(d => {
        for (const [col, vals] of Object.entries(filters)) { if (vals.length > 0 && !vals.includes(d[col])) return false; }
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
      <td style="text-align:center"><input class="cell-input" type="number" min="1" max="10" value="${d.impact}" style="width:36px" onclick="event.stopPropagation()" onchange="updateField(${d.id},'impact',parseInt(this.value))"></td>
      <td style="text-align:center"><input class="cell-input" type="number" min="0" value="${d.effort || ''}" placeholder="—" onclick="event.stopPropagation()" onchange="updateField(${d.id},'effort',this.valueAsNumber||null)"></td>
      <td><select class="cell-select" onclick="event.stopPropagation()" onchange="updateField(${d.id},'status',this.value)">
        ${['待评估', '已确认', '开发中', '已完成', '暂缓'].map(s => `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select></td>`;
        tr.onclick = () => openSidePanel(d.id);
        tbody.appendChild(tr);
    });
    renderDashboard();
}

// ===== SIDE PANEL =====
window.openSidePanel = function (id) {
    currentItem = DATA.find(d => d.id === id);
    if (!currentItem) return;
    const d = currentItem;
    document.getElementById('spTitle').textContent = d.name;
    document.getElementById('spTitle').oninput = function () { d.name = this.textContent; renderTable(); autoSave(); };

    const body = document.getElementById('spBody');
    body.innerHTML = `
    <div class="sp-section">
      <div class="sp-label">基本信息</div>
      <div class="sp-field">
        <span class="sp-field-label">模块</span>
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
        <span class="sp-field-label">风险</span>
        <select class="cell-select" onchange="updateField(${d.id},'risk',this.value);reopenPanel()">
          ${['high', 'medium', 'low'].map(r => `<option value="${r}" ${d.risk === r ? 'selected' : ''}>${{ high: '高', medium: '中', low: '低' }[r]}</option>`).join('')}
        </select>
        <span class="sp-field-label">影响度</span>
        <input class="cell-input" type="number" min="1" max="10" value="${d.impact}" onchange="updateField(${d.id},'impact',parseInt(this.value))">
        <span class="sp-field-label">人天</span>
        <input class="cell-input" type="number" min="0" value="${d.effort || ''}" placeholder="—" onchange="updateField(${d.id},'effort',this.valueAsNumber||null)">
        <span class="sp-field-label">月成本</span>
        <input class="cell-input" style="width:60px" type="number" min="0" value="${d.monthlyCost}" placeholder="$0" onchange="updateField(${d.id},'monthlyCost',parseInt(this.value)||0)"> <span style="font-size:11px;color:var(--text-3)">USD</span>
        <span class="sp-field-label">状态</span>
        <select class="cell-select" onchange="updateField(${d.id},'status',this.value);reopenPanel()">
          ${['待评估', '已确认', '开发中', '已完成', '暂缓'].map(s => `<option ${d.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="sp-section">
      <div class="sp-label">功能说明（原文档）</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'desc',this.textContent)">${d.desc}</div>
    </div>
    <div class="sp-section">
      <div class="sp-label">技术实现方案</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'techAnalysis',this.textContent)">${d.techAnalysis}</div>
    </div>
    <div class="sp-section">
      <div class="sp-label">技术方案分配</div>
      <div id="techAlloc"></div>
      <button class="btn" style="margin-top:8px" onclick="addTech(${d.id})">+ 添加技术</button>
    </div>
    <div class="sp-section">
      <div class="sp-label">风险点</div>
      <div id="riskList">${d.risks.length === 0 ? '<span style="font-size:12px;color:var(--text-3)">无重大风险</span>' : d.risks.map((r, i) => `<div class="sp-risk ${r.level}"><span contenteditable="true" oninput="DATA.find(x=>x.id===${d.id}).risks[${i}].text=this.textContent;autoSave()">${r.text}</span></div>`).join('')}</div>
    </div>
    <div class="sp-section">
      <div class="sp-label">决策日志</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'decisionLog',this.textContent)" style="min-height:60px">${d.decisionLog || '<span style="color:var(--text-3)">记录技术选型理由、被排除的备选方案...</span>'}</div>
    </div>
    <div class="sp-section">
      <div class="sp-label">成本说明</div>
      <div class="sp-desc editable" contenteditable="true" oninput="updateField(${d.id},'costNotes',this.textContent)" style="min-height:40px">${d.costNotes || ''}</div>
    </div>
    <div class="sp-section">
      <div class="sp-label">技术路线图</div>
      <div class="diagram-container"><div class="mermaid" id="diagramPreview"></div></div>
      <textarea class="diagram-edit" id="diagramSrc" oninput="updateDiagram(${d.id},this.value)">${d.diagram}</textarea>
      <div style="margin-top:6px;display:flex;gap:6px">
        <button class="btn" onclick="renderDiagram()">刷新预览</button>
        <button class="btn" onclick="openMermaidLive()">编辑器中打开</button>
      </div>
    </div>
    <div class="sp-section">
      <div class="sp-label">备注</div>
      <textarea class="sp-note" oninput="updateField(${d.id},'note',this.value)">${d.note}</textarea>
    </div>
  `;
    renderTechAlloc(d);
    renderDiagram();
    document.getElementById('sidePanel').classList.add('open');
    document.getElementById('spOverlay').classList.add('open');
};

window.closeSidePanel = function () {
    document.getElementById('sidePanel').classList.remove('open');
    document.getElementById('spOverlay').classList.remove('open');
    currentItem = null;
};

function reopenPanel() { if (currentItem) openSidePanel(currentItem.id); }
window.reopenPanel = reopenPanel;

// ===== Tech Allocation =====
function renderTechAlloc(d) {
    const el = document.getElementById('techAlloc');
    if (!el) return;
    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', '#8B5CF6', '#06B6D4'];
    el.innerHTML = d.techs.map((t, i) => {
        const c = colors[i % colors.length];
        return `<div class="tech-alloc-row">
      <span class="tech-alloc-name inline-edit" contenteditable="true" oninput="DATA.find(x=>x.id===${d.id}).techs[${i}].name=this.textContent;autoSave()">${t.name}</span>
      <div class="tech-alloc-bar"><div class="tech-alloc-fill" style="width:${t.pct}%;background:${c}"></div></div>
      <input class="tech-alloc-input" type="number" min="0" max="100" value="${t.pct}" onchange="updateTechPct(${d.id},${i},this.valueAsNumber)"> %
      <button class="btn" style="height:20px;padding:0 4px;font-size:10px" onclick="removeTech(${d.id},${i})">x</button>
    </div>`;
    }).join('');
}
window.updateTechPct = (id, idx, val) => { const d = DATA.find(x => x.id === id); if (d && d.techs[idx]) { d.techs[idx].pct = val; renderTechAlloc(d); autoSave(); } };
window.addTech = (id) => { const d = DATA.find(x => x.id === id); if (d) { d.techs.push({ name: '新技术', pct: 10 }); renderTechAlloc(d); autoSave(); } };
window.removeTech = (id, idx) => { const d = DATA.find(x => x.id === id); if (d) { d.techs.splice(idx, 1); renderTechAlloc(d); autoSave(); } };

// ===== Diagram =====
window.renderDiagram = async function () {
    const src = document.getElementById('diagramSrc');
    const preview = document.getElementById('diagramPreview');
    if (!src || !preview) return;
    preview.removeAttribute('data-processed');
    preview.textContent = src.value;
    try { await mermaid.run({ nodes: [preview] }); } catch (e) { preview.textContent = 'Syntax error'; }
};
window.updateDiagram = (id, val) => { const d = DATA.find(x => x.id === id); if (d) { d.diagram = val; autoSave(); } };
window.openMermaidLive = () => { const s = document.getElementById('diagramSrc'); if (s) { const e = btoa(unescape(encodeURIComponent(JSON.stringify({ code: s.value, mermaid: { theme: 'neutral' } })))); window.open('https://mermaid.live/edit#base64:' + e, '_blank'); } };

// ===== DEPENDENCY GRAPH =====
function renderDeps() {
    // Build mermaid graph
    let mmd = 'graph TD\n';
    const modStyle = { 智能问数: ':::red', 营销助手: ':::amber', 营销策略: ':::blue', 基础后台: ':::purple' };
    DATA.forEach(d => { mmd += `  n${d.id}["${d.name.substring(0, 12)}"]${modStyle[d.module] || ''}\n`; });
    DATA.forEach(d => { d.dependencies.forEach(dep => { mmd += `  n${dep} --> n${d.id}\n`; }); });
    mmd += '\nclassDef red fill:#FEE2E2,stroke:#EF4444\nclassDef amber fill:#FEF3C7,stroke:#F59E0B\nclassDef blue fill:#DBEAFE,stroke:#3B82F6\nclassDef purple fill:#F3E8FF,stroke:#8B5CF6';

    const el = document.getElementById('depGraph');
    if (el) { el.removeAttribute('data-processed'); el.textContent = mmd; mermaid.run({ nodes: [el] }); }

    // Populate selects
    const opts = DATA.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const from = document.getElementById('depFrom');
    const to = document.getElementById('depTo');
    if (from) from.innerHTML = opts;
    if (to) to.innerHTML = opts;

    // Dependency list
    const listEl = document.getElementById('depListEditor');
    if (listEl) {
        const deps = [];
        DATA.forEach(d => d.dependencies.forEach(dep => { const src = DATA.find(x => x.id === dep); deps.push({ from: src ? src.name : '?', to: d.name, fromId: dep, toId: d.id }); }));
        listEl.innerHTML = deps.length === 0 ? '<span style="font-size:12px;color:var(--text-3)">暂无依赖</span>' :
            deps.map(dep => `<div class="dep-list-item"><span>${dep.from}</span><span style="color:var(--text-3)">--></span><span>${dep.to}</span><button class="btn" style="height:20px;padding:0 4px;font-size:10px" onclick="removeDep(${dep.toId},${dep.fromId})">x</button></div>`).join('');
    }
}

window.addDependency = function () {
    const from = parseInt(document.getElementById('depFrom').value);
    const to = parseInt(document.getElementById('depTo').value);
    if (from === to) return;
    const d = DATA.find(x => x.id === to);
    if (d && !d.dependencies.includes(from)) { d.dependencies.push(from); renderDeps(); autoSave(); }
};

window.removeDep = function (toId, fromId) {
    const d = DATA.find(x => x.id === toId);
    if (d) { d.dependencies = d.dependencies.filter(x => x !== fromId); renderDeps(); autoSave(); }
};

// ===== COST VIEW =====
function renderCost() {
    const modules = ['智能问数', '营销助手', '营销策略', '基础后台'];
    const totalEffort = DATA.reduce((s, d) => s + (d.effort || 0), 0);
    const totalMonthly = DATA.reduce((s, d) => s + (d.monthlyCost || 0), 0);
    const v1Effort = DATA.filter(d => d.version === 'V1.0').reduce((s, d) => s + (d.effort || 0), 0);

    const summaryEl = document.getElementById('costSummaryCards');
    if (summaryEl) {
        summaryEl.innerHTML = `
      <div class="cost-card"><div class="cost-card-label">全版本总人天</div><div class="cost-card-val">${totalEffort || '待填'}</div></div>
      <div class="cost-card"><div class="cost-card-label">V1.0 人天</div><div class="cost-card-val">${v1Effort || '待填'}</div></div>
      <div class="cost-card"><div class="cost-card-label">月运营成本</div><div class="cost-card-val">$${totalMonthly}</div></div>
      <div class="cost-card"><div class="cost-card-label">年运营成本</div><div class="cost-card-val">$${totalMonthly * 12}</div></div>
    `;
    }

    const tbody = document.getElementById('costTableBody');
    if (!tbody) return;

    // Group by module
    let rows = '';
    modules.forEach(mod => {
        const items = DATA.filter(d => d.module === mod);
        const modEffort = items.reduce((s, d) => s + (d.effort || 0), 0);
        const modCost = items.reduce((s, d) => s + (d.monthlyCost || 0), 0);
        rows += `<tr class="cost-group-row"><td colspan="3"><b>${mod}</b></td><td style="text-align:right"><b>${modEffort || '—'}</b></td><td style="text-align:right"><b>$${modCost}</b></td><td></td></tr>`;
        items.forEach(d => {
            rows += `<tr>
        <td style="padding-left:24px">${d.name}</td>
        <td><span class="tag ${({ 智能问数: 't-red', 营销助手: 't-amber', 营销策略: 't-blue', 基础后台: 't-purple' }[d.module] || 't-gray')}">${d.module}</span></td>
        <td>${d.version}</td>
        <td style="text-align:right"><input class="cell-input" type="number" min="0" value="${d.effort || ''}" placeholder="—" onchange="updateField(${d.id},'effort',this.valueAsNumber||null);renderCost()"></td>
        <td style="text-align:right"><input class="cell-input" style="width:60px" type="number" min="0" value="${d.monthlyCost}" onchange="updateField(${d.id},'monthlyCost',parseInt(this.value)||0);renderCost()"></td>
        <td><input class="cell-input" style="width:160px;text-align:left" value="${d.costNotes}" onchange="updateField(${d.id},'costNotes',this.value)" placeholder="说明..."></td>
      </tr>`;
        });
    });
    tbody.innerHTML = rows;
}

// ===== PLANS =====
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

let activePlanIdx = 0;
let comparisonCollapsed = false;

function renderPlans() {
    const container = document.getElementById('view-plans');

    // Collapsible comparison
    const compClass = comparisonCollapsed ? 'collapsed' : '';
    let html = `
    <div class="panel" style="margin-bottom:20px">
      <div class="collapsible-header ${compClass}" onclick="toggleComparison()">
        <span class="panel-title">方案对比总览</span>
        <span class="toggle-icon">&#9660;</span>
      </div>
      <div class="collapsible-body ${compClass}" style="max-height:${comparisonCollapsed ? '0' : '500'}px">
        <div style="padding:0"><table class="rtable">
          <thead><tr><th style="width:20%">维度</th>${PLANS.map((p, i) => `<th>${p.name.split('—')[0].trim()} ${p.tag ? `<span class="tag t-green">${p.tag}</span>` : ''}</th>`).join('')}</tr></thead>
          <tbody>
            <tr><td><b>交付节奏</b></td><td>分三批次，渐进式</td><td>V1.0 一次性全量</td></tr>
            <tr><td><b>首期范围</b></td><td>智能问数 + 基础后台核心（7 项含 POC）</td><td>四模块 V1.0 全部（8+ 项）</td></tr>
            <tr><td><b>风险控制</b></td><td>先 POC 验证 NL2SQL</td><td>NL2SQL 不通影响全局</td></tr>
            <tr><td><b>适用场景</b></td><td>验证技术可行性</td><td>快速看全貌 + 团队充足</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>`;

    // Plan tabs
    html += `<div class="plan-tabs">`;
    PLANS.forEach((p, i) => {
        html += `<div class="plan-tab ${i === activePlanIdx ? 'active' : ''}" onclick="switchPlan(${i})">${p.name.split('—')[0].trim()} ${p.tag ? `<span class="plan-tag">${p.tag}</span>` : ''}</div>`;
    });
    html += `<div class="plan-tab-add" onclick="addPlan()">+ 新增方案</div></div>`;

    // Plan contents
    PLANS.forEach((p, pi) => {
        const isActive = pi === activePlanIdx;
        const taskRows = p.ganttTasks.map((t, i) => `<tr>
      <td><input class="cell-input" style="width:70px;text-align:left" value="${t.section}" onchange="updateGanttTask(${pi},${i},'section',this.value)"></td>
      <td><input class="cell-input" style="width:140px;text-align:left" value="${t.name}" onchange="updateGanttTask(${pi},${i},'name',this.value)"></td>
      <td><input class="cell-input" style="width:100px" type="date" value="${t.start}" onchange="updateGanttTask(${pi},${i},'start',this.value)"></td>
      <td><input class="cell-input" style="width:50px" type="number" min="0" value="${t.days}" onchange="updateGanttTask(${pi},${i},'days',parseInt(this.value))" ${t.milestone ? 'disabled' : ''}></td>
      <td><input type="checkbox" ${t.milestone ? 'checked' : ''} onchange="updateGanttTask(${pi},${i},'milestone',this.checked)"></td>
      <td><button class="btn" style="height:20px;padding:0 6px;font-size:10px" onclick="removeGanttTask(${pi},${i})">x</button></td>
    </tr>`).join('');

        html += `<div class="plan-content ${isActive ? 'active' : ''}" id="plan-content-${pi}">
      <div class="plan-card">
        <div class="plan-card-header">
          <h3>${p.name} ${p.tag ? `<span class="tag t-green" style="margin-left:8px">${p.tag}</span>` : ''}</h3>
          <p>${p.summary}</p>
        </div>
        <div class="plan-card-body">
          ${p.coreFeatures ? `<div class="sp-label" style="margin-bottom:12px">核心解决的功能点</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px;padding:16px;background:#FAFBFD;border-radius:8px;border:1px solid #F0F1F3">
            ${p.coreFeatures.map(f => `<div style="padding:4px 0;font-size:13px;display:flex;align-items:flex-start;gap:8px"><span style="width:7px;height:7px;border-radius:50%;background:var(--primary);margin-top:5px;flex-shrink:0"></span>${f}</div>`).join('')}
          </div>` : ''}

          <div class="sp-label" style="margin-bottom:8px">甘特图</div>
          <div style="background:#FAFBFD;border:1px solid #F0F1F3;border-radius:8px;padding:20px;margin-bottom:12px;overflow-x:auto;min-height:200px">
            <pre class="mermaid" id="gantt-${p.id}"></pre>
          </div>
          <details style="margin-bottom:20px">
            <summary style="cursor:pointer;font-size:12px;font-weight:600;color:var(--text-2);padding:8px 0">编辑甘特图数据</summary>
            <div style="background:#FAFBFD;border:1px solid #F0F1F3;border-radius:8px;padding:16px;margin-top:8px">
              <table class="rtable" style="font-size:12px"><thead><tr><th>阶段</th><th>任务</th><th>开始</th><th>天数</th><th>里程碑</th><th></th></tr></thead><tbody>${taskRows}</tbody></table>
              <div style="margin-top:12px;display:flex;gap:8px">
                <button class="btn" onclick="addGanttTask(${pi})">+ 任务</button>
                <button class="btn" style="background:var(--primary);color:#fff;border-color:var(--primary)" onclick="refreshGantt('${p.id}',${pi})">刷新甘特图</button>
              </div>
            </div>
          </details>

          <div class="sp-label" style="margin-bottom:12px">阶段规划</div>
          ${p.phases.map((ph, i) => `<div style="margin-bottom:16px;padding:14px 18px;background:#FAFBFD;border:1px solid #F0F1F3;border-radius:8px;border-left:3px solid ${['var(--danger)', 'var(--warning)', 'var(--primary)'][i] || 'var(--text-3)'}">
            <div style="font-size:14px;font-weight:600;margin-bottom:6px">${ph.name}</div>
            <ul class="plan-phase-items">${ph.items.map(it => `<li>${it}</li>`).join('')}</ul>
            <div class="plan-phase-focus" style="margin-top:6px">重点：${ph.focus}</div>
            ${ph.acceptance ? `<div style="font-size:11px;color:var(--success);margin-top:4px;font-weight:500">验收：${ph.acceptance}</div>` : ''}
          </div>`).join('')}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
            <div style="padding:16px;background:#F0FDF4;border-radius:8px;border:1px solid #D1FAE5">
              <div style="font-size:12px;font-weight:600;color:#166534;margin-bottom:8px">优势</div>
              <ul class="plan-list">${p.pros.map(t => `<li><span class="dot" style="background:var(--success)"></span>${t}</li>`).join('')}</ul>
            </div>
            <div style="padding:16px;background:#FEF2F2;border-radius:8px;border:1px solid #FECACA">
              <div style="font-size:12px;font-weight:600;color:#991B1B;margin-bottom:8px">劣势</div>
              <ul class="plan-list">${p.cons.map(t => `<li><span class="dot" style="background:var(--danger)"></span>${t}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    });

    container.innerHTML = html;

    // Render active plan's Gantt
    const activePlan = PLANS[activePlanIdx];
    if (activePlan) {
        const el = document.getElementById('gantt-' + activePlan.id);
        if (el) {
            el.textContent = ganttFromTasks(activePlan.ganttTasks, activePlan.name.split('：')[0] || activePlan.name);
            mermaid.run({ nodes: [el] });
        }
    }
}

window.switchPlan = function (idx) {
    activePlanIdx = idx;
    document.querySelectorAll('.plan-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
    document.querySelectorAll('.plan-content').forEach((c, i) => {
        c.classList.toggle('active', i === idx);
        if (i === idx) {
            const el = c.querySelector('.mermaid');
            if (el && !el.getAttribute('data-processed')) {
                const p = PLANS[idx];
                el.textContent = ganttFromTasks(p.ganttTasks, p.name.split('：')[0] || p.name);
                mermaid.run({ nodes: [el] });
            }
        }
    });
};

window.toggleComparison = function () {
    comparisonCollapsed = !comparisonCollapsed;
    const header = document.querySelector('.collapsible-header');
    const body = document.querySelector('.collapsible-body');
    if (header) header.classList.toggle('collapsed', comparisonCollapsed);
    if (body) { body.classList.toggle('collapsed', comparisonCollapsed); body.style.maxHeight = comparisonCollapsed ? '0' : '500px'; }
};

window.addPlan = function () {
    const idx = PLANS.length + 1;
    PLANS.push({
        id: 'plan-' + String.fromCharCode(96 + idx),
        name: '方案' + idx + '：自定义方案',
        tag: null,
        summary: '请填写方案描述',
        strategy: '请填写实施策略',
        coreFeatures: ['核心功能1', '核心功能2'],
        phases: [{ name: '第一阶段', items: ['待填写'], focus: '待填写', acceptance: '待填写' }],
        pros: ['待填写'],
        cons: ['待填写'],
        ganttTasks: [{ section: '第一阶段', name: '任务1', start: '2026-06-01', days: 30 }]
    });
    activePlanIdx = PLANS.length - 1;
    renderPlans();
    autoSave();
};

window.updateGanttTask = (pi, ti, f, v) => { PLANS[pi].ganttTasks[ti][f] = v; autoSave(); };
window.addGanttTask = (pi) => { PLANS[pi].ganttTasks.push({ section: '新阶段', name: '新任务', start: '2026-06-01', days: 20, milestone: false }); renderPlans(); };
window.removeGanttTask = (pi, ti) => { PLANS[pi].ganttTasks.splice(ti, 1); renderPlans(); };
window.refreshGantt = (id, pi) => { const el = document.getElementById('gantt-' + id); if (el) { el.removeAttribute('data-processed'); el.innerHTML = ''; el.textContent = ganttFromTasks(PLANS[pi].ganttTasks, PLANS[pi].name.split('：')[0] || PLANS[pi].name); mermaid.run({ nodes: [el] }); } };

// ===== Field Update =====
window.updateField = function (id, field, val) {
    const d = DATA.find(x => x.id === id);
    if (d) { d[field] = val; renderTable(); autoSave(); }
};

// ===== Add Row =====
window.addRow = function () {
    const id = Math.max(...DATA.map(d => d.id)) + 1;
    DATA.push({
        id, name: '新功能项', module: '智能问数', priority: 'P1', version: 'V1.0', risk: 'low', effort: null, status: '待评估',
        desc: '待补充', techAnalysis: '待补充', techs: [{ name: '待定', pct: 100 }], risks: [], diagram: 'graph LR\n  A[输入]-->B[处理]-->C[输出]', note: '',
        impact: 5, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: ''
    });
    renderTable();
    openSidePanel(id);
};

// ===== Save / Load / Export =====
function autoSave() { clearTimeout(window._ast); window._ast = setTimeout(saveAll, 1500); }

window.saveAll = function () {
    const saves = {
        data: DATA.map(d => ({ id: d.id, name: d.name, module: d.module, priority: d.priority, version: d.version, risk: d.risk, effort: d.effort, status: d.status, desc: d.desc, techAnalysis: d.techAnalysis, techs: d.techs, risks: d.risks, diagram: d.diagram, note: d.note, impact: d.impact, dependencies: d.dependencies, monthlyCost: d.monthlyCost, costNotes: d.costNotes, decisionLog: d.decisionLog })),
        plans: PLANS.map(p => ({ id: p.id, ganttTasks: p.ganttTasks })),
        deps: {}
    };
    document.querySelectorAll('[data-field]').forEach(el => { saves.deps[el.getAttribute('data-field')] = el.value; });
    localStorage.setItem('aeon-eval-v4', JSON.stringify(saves));
    toast('已保存');
};

window.loadAll = function () {
    const raw = localStorage.getItem('aeon-eval-v4');
    if (!raw) { toast('没有保存的数据'); return; }
    const saves = JSON.parse(raw);
    if (saves.data) saves.data.forEach(s => { const d = DATA.find(x => x.id === s.id); if (d) Object.assign(d, s); });
    if (saves.plans) saves.plans.forEach(s => { const p = PLANS.find(x => x.id === s.id); if (p && s.ganttTasks) p.ganttTasks = s.ganttTasks; });
    if (saves.deps) Object.entries(saves.deps).forEach(([k, v]) => { const el = document.querySelector(`[data-field="${k}"]`); if (el) el.value = v; });
    renderTable(); renderPlans();
    toast('已恢复');
};

window.exportJSON = function () {
    const d = { exportDate: new Date().toISOString(), project: 'AEON CDP+AI', items: DATA, plans: PLANS };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = `AEON-CDP-AI-eval-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
};

function toast(msg) {
    const t = document.createElement('div'); t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#111827;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;z-index:9999';
    document.body.appendChild(t); setTimeout(() => t.remove(), 1500);
}

// ===== Init =====
buildFilters();
renderTable();
renderPlans();
initChart(document.getElementById('matrixCanvas'), DATA, openSidePanel);
