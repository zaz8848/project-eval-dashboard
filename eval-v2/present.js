// Presentation Mode

let presentActive = false;
let presentData = null;

export function togglePresentation(data, plans) {
    presentActive = !presentActive;
    presentData = data;

    const el = document.getElementById('presentationOverlay');
    if (!el) return;

    if (presentActive) {
        el.innerHTML = buildPresentation(data, plans);
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
        el.querySelector('.present-close').addEventListener('click', () => togglePresentation(data, plans));
        document.addEventListener('keydown', onPresentKey);
    } else {
        el.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onPresentKey);
    }
}

function onPresentKey(e) {
    if (e.key === 'Escape') {
        togglePresentation(presentData, []);
    }
}

function buildPresentation(data, plans) {
    const total = data.length;
    const v1 = data.filter(d => d.version === 'V1.0');
    const v1Count = v1.length;
    const totalEffort = data.reduce((s, d) => s + (d.effort || 0), 0);
    const v1Effort = v1.reduce((s, d) => s + (d.effort || 0), 0);
    const totalCost = data.reduce((s, d) => s + (d.monthlyCost || 0), 0);

    const highRisk = data.filter(d => d.risk === 'high').length;
    const medRisk = data.filter(d => d.risk === 'medium').length;
    const lowRisk = data.filter(d => d.risk === 'low').length;

    const pending = data.filter(d => d.status === '\u5F85\u8BC4\u4F30');
    const confirmed = data.filter(d => d.status === '\u5DF2\u786E\u8BA4' || d.status === '\u5F00\u53D1\u4E2D');
    const done = data.filter(d => d.status === '\u5DF2\u5B8C\u6210');

    const modules = {};
    data.forEach(d => {
        if (!modules[d.module]) modules[d.module] = { count: 0, effort: 0, cost: 0 };
        modules[d.module].count++;
        modules[d.module].effort += d.effort || 0;
        modules[d.module].cost += d.monthlyCost || 0;
    });

    const topRisks = [];
    data.forEach(d => {
        d.risks.forEach(r => {
            if (r.level === 'high') topRisks.push({ feature: d.name, text: r.text });
        });
    });

    const decisions = data.filter(d => d.decisionLog && d.decisionLog.trim());

    return `
    <div class="present-container">
      <button class="present-close">ESC</button>

      <div class="present-slide">
        <div class="present-title">AEON CDP+AI</div>
        <div class="present-subtitle">\u9879\u76EE\u8BC4\u4F30\u603B\u89C8</div>
      </div>

      <div class="present-slide">
        <div class="present-section-title">\u9879\u76EE\u8303\u56F4</div>
        <div class="present-metrics">
          <div class="present-metric">
            <div class="present-metric-val">${total}</div>
            <div class="present-metric-label">\u529F\u80FD\u9879\u603B\u8BA1</div>
          </div>
          <div class="present-metric">
            <div class="present-metric-val">${v1Count}</div>
            <div class="present-metric-label">V1.0 \u8303\u56F4</div>
          </div>
          <div class="present-metric">
            <div class="present-metric-val">${v1Effort || '--'}</div>
            <div class="present-metric-label">V1.0 \u4EBA\u5929</div>
          </div>
          <div class="present-metric">
            <div class="present-metric-val">$${totalCost.toLocaleString()}</div>
            <div class="present-metric-label">\u6708\u8FD0\u8425\u6210\u672C</div>
          </div>
        </div>
      </div>

      <div class="present-slide">
        <div class="present-section-title">\u6A21\u5757\u5206\u5E03</div>
        <div class="present-table">
          <table>
            <thead><tr><th>\u6A21\u5757</th><th>\u529F\u80FD\u6570</th><th>\u603B\u4EBA\u5929</th><th>\u6708\u6210\u672C</th></tr></thead>
            <tbody>
              ${Object.entries(modules).map(([name, m]) => `
                <tr><td>${name}</td><td>${m.count}</td><td>${m.effort || '--'}</td><td>$${m.cost.toLocaleString()}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="present-slide">
        <div class="present-section-title">\u98CE\u9669\u6982\u89C8</div>
        <div class="present-metrics">
          <div class="present-metric" style="border-color:#EF4444">
            <div class="present-metric-val" style="color:#EF4444">${highRisk}</div>
            <div class="present-metric-label">\u9AD8\u98CE\u9669</div>
          </div>
          <div class="present-metric" style="border-color:#F59E0B">
            <div class="present-metric-val" style="color:#F59E0B">${medRisk}</div>
            <div class="present-metric-label">\u4E2D\u98CE\u9669</div>
          </div>
          <div class="present-metric" style="border-color:#22C55E">
            <div class="present-metric-val" style="color:#22C55E">${lowRisk}</div>
            <div class="present-metric-label">\u4F4E\u98CE\u9669</div>
          </div>
        </div>
        ${topRisks.length > 0 ? `
          <div class="present-list" style="margin-top:40px">
            <div style="font-size:18px;font-weight:600;margin-bottom:16px">\u9AD8\u98CE\u9669\u9879</div>
            ${topRisks.slice(0, 5).map(r => `
              <div class="present-list-item">
                <span style="color:#EF4444;font-weight:600">${r.feature}</span>
                <span style="color:#6B7280;margin-left:12px">${r.text}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="present-slide">
        <div class="present-section-title">\u8FDB\u5EA6\u72B6\u6001</div>
        <div class="present-metrics">
          <div class="present-metric">
            <div class="present-metric-val">${pending.length}</div>
            <div class="present-metric-label">\u5F85\u8BC4\u4F30</div>
          </div>
          <div class="present-metric">
            <div class="present-metric-val">${confirmed.length}</div>
            <div class="present-metric-label">\u5DF2\u786E\u8BA4/\u5F00\u53D1\u4E2D</div>
          </div>
          <div class="present-metric">
            <div class="present-metric-val">${done.length}</div>
            <div class="present-metric-label">\u5DF2\u5B8C\u6210</div>
          </div>
        </div>
        <div class="present-bar" style="margin-top:40px">
          <div class="present-bar-fill" style="width:${total ? (done.length / total * 100) : 0}%;background:#22C55E"></div>
          <div class="present-bar-fill" style="width:${total ? (confirmed.length / total * 100) : 0}%;background:#3B82F6"></div>
          <div class="present-bar-fill" style="width:${total ? (pending.length / total * 100) : 0}%;background:#E5E7EB"></div>
        </div>
      </div>

      ${pending.length > 0 ? `
        <div class="present-slide">
          <div class="present-section-title">\u5F85\u51B3\u7B56\u9879</div>
          <div class="present-list">
            ${pending.slice(0, 8).map(d => `
              <div class="present-list-item">
                <span style="font-weight:600">${d.name}</span>
                <span class="present-tag">${d.module}</span>
                <span class="present-tag">${d.priority}</span>
              </div>
            `).join('')}
            ${pending.length > 8 ? `<div style="color:#9CA3AF;margin-top:8px">\u53CA\u5176\u4ED6 ${pending.length - 8} \u9879...</div>` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

export function isPresentActive() { return presentActive; }
