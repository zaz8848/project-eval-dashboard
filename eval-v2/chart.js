// Impact-Effort Matrix Chart (Canvas-based)

const MODULE_COLORS = {
    '智能问数': '#EF4444',
    '营销助手': '#F59E0B',
    '营销策略': '#3B82F6',
    '基础后台': '#8B5CF6',
};

let chartCanvas, chartCtx;
let chartData = [];
let hoveredDot = null;
let chartBounds = { left: 80, top: 40, right: 40, bottom: 60 };
let editingDot = null;

export function initChart(canvas, data, onSelect) {
    chartCanvas = canvas;
    chartCtx = canvas.getContext('2d');
    chartData = data;
    chartCanvas._onSelect = onSelect;

    const resize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = Math.max(500, rect.height) * devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = Math.max(500, rect.height) + 'px';
        chartCtx.scale(devicePixelRatio, devicePixelRatio);
        drawChart();
    };

    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onChartClick);
    canvas.addEventListener('mouseleave', () => { hoveredDot = null; drawChart(); canvas.style.cursor = 'default'; });
}

export function updateChartData(data) {
    chartData = data;
    drawChart();
}

function getPlotArea() {
    const w = chartCanvas.width / devicePixelRatio;
    const h = chartCanvas.height / devicePixelRatio;
    return {
        x: chartBounds.left,
        y: chartBounds.top,
        w: w - chartBounds.left - chartBounds.right,
        h: h - chartBounds.top - chartBounds.bottom
    };
}

function getMaxEffort() {
    const efforts = chartData.filter(d => d.effort > 0).map(d => d.effort);
    return efforts.length ? Math.ceil(Math.max(...efforts) / 10) * 10 + 10 : 100;
}

function dataToPx(d) {
    const area = getPlotArea();
    const maxEffort = getMaxEffort();
    const effort = d.effort || 0;
    const x = area.x + (effort / maxEffort) * area.w;
    const y = area.y + area.h - ((d.impact || 5) / 10) * area.h;
    return { x, y };
}

function drawChart() {
    if (!chartCtx) return;
    const w = chartCanvas.width / devicePixelRatio;
    const h = chartCanvas.height / devicePixelRatio;
    const ctx = chartCtx;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const area = getPlotArea();
    const maxEffort = getMaxEffort();
    const midX = area.x + area.w / 2;
    const midY = area.y + area.h / 2;

    // Quadrant backgrounds
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#22C55E'; ctx.fillRect(area.x, area.y, area.w / 2, area.h / 2); // Quick Win
    ctx.fillStyle = '#3B82F6'; ctx.fillRect(midX, area.y, area.w / 2, area.h / 2); // Strategic
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(area.x, midY, area.w / 2, area.h / 2); // Easy
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(midX, midY, area.w / 2, area.h / 2); // Careful
    ctx.globalAlpha = 1;

    // Quadrant labels
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.fillText('Quick Win', area.x + area.w * 0.25, area.y + 20);
    ctx.fillText('\u6218\u7565\u9879\u76EE', midX + area.w * 0.25, area.y + 20);
    ctx.fillText('\u987A\u624B\u505A', area.x + area.w * 0.25, midY + 20);
    ctx.fillText('\u8C28\u614E\u6295\u5165', midX + area.w * 0.25, midY + 20);

    // Dashed center lines
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX, area.y); ctx.lineTo(midX, area.y + area.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(area.x, midY); ctx.lineTo(area.x + area.w, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(area.x, area.y); ctx.lineTo(area.x, area.y + area.h); ctx.lineTo(area.x + area.w, area.y + area.h);
    ctx.stroke();

    // Grid lines + labels
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i += 2) {
        const y = area.y + area.h - (i / 10) * area.h;
        ctx.fillText(String(i), area.x - 8, y + 3);
        if (i > 0 && i < 10) {
            ctx.strokeStyle = '#F3F4F6';
            ctx.beginPath(); ctx.moveTo(area.x, y); ctx.lineTo(area.x + area.w, y); ctx.stroke();
        }
    }

    ctx.textAlign = 'center';
    const step = maxEffort <= 50 ? 10 : maxEffort <= 100 ? 20 : 50;
    for (let e = 0; e <= maxEffort; e += step) {
        const x = area.x + (e / maxEffort) * area.w;
        ctx.fillText(String(e), x, area.y + area.h + 16);
        if (e > 0) {
            ctx.strokeStyle = '#F3F4F6';
            ctx.beginPath(); ctx.moveTo(x, area.y); ctx.lineTo(x, area.y + area.h); ctx.stroke();
        }
    }

    // Axis labels
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    ctx.fillText('\u4EBA\u5929 (Effort)', area.x + area.w / 2, area.y + area.h + 40);
    ctx.save();
    ctx.translate(16, area.y + area.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('\u5F71\u54CD\u5206 (Impact)', 0, 0);
    ctx.restore();

    // Dots
    chartData.forEach(d => {
        const pos = dataToPx(d);
        const color = MODULE_COLORS[d.module] || '#6B7280';
        const r = hoveredDot === d.id ? 9 : 7;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);

        if (!d.effort) {
            // Hollow circle for no-effort items
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fill();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Priority indicator
        if (d.priority === 'P0') {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r + 3, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });

    // Tooltip
    if (hoveredDot !== null) {
        const d = chartData.find(x => x.id === hoveredDot);
        if (d) {
            const pos = dataToPx(d);
            const label = `${d.name}`;
            const sub = `${d.module} | ${d.priority} | \u5F71\u54CD:${d.impact} | \u4EBA\u5929:${d.effort || '-'}`;

            ctx.font = '600 12px -apple-system, sans-serif';
            const tw1 = ctx.measureText(label).width;
            ctx.font = '11px -apple-system, sans-serif';
            const tw2 = ctx.measureText(sub).width;
            const tw = Math.max(tw1, tw2) + 20;
            const th = 44;

            let tx = pos.x - tw / 2;
            let ty = pos.y - th - 14;
            if (tx < 4) tx = 4;
            if (tx + tw > w - 4) tx = w - 4 - tw;
            if (ty < 4) ty = pos.y + 16;

            ctx.fillStyle = '#111827';
            ctx.globalAlpha = 0.92;
            roundRect(ctx, tx, ty, tw, th, 6);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#fff';
            ctx.font = '600 12px -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, tx + 10, ty + 18);
            ctx.font = '11px -apple-system, sans-serif';
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText(sub, tx + 10, ty + 34);
        }
    }

    // Legend
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    let lx = area.x;
    Object.entries(MODULE_COLORS).forEach(([name, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(lx + 5, h - 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6B7280';
        ctx.fillText(name, lx + 14, h - 8);
        lx += ctx.measureText(name).width + 28;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function hitTest(mx, my) {
    for (let i = chartData.length - 1; i >= 0; i--) {
        const d = chartData[i];
        const pos = dataToPx(d);
        const dx = mx - pos.x;
        const dy = my - pos.y;
        if (dx * dx + dy * dy <= 100) return d;
    }
    return null;
}

function onMouseMove(e) {
    const rect = chartCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    const prevHover = hoveredDot;
    hoveredDot = hit ? hit.id : null;
    chartCanvas.style.cursor = hit ? 'pointer' : 'default';
    if (hoveredDot !== prevHover) drawChart();
}

function onChartClick(e) {
    const rect = chartCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    if (hit && chartCanvas._onSelect) {
        chartCanvas._onSelect(hit.id);
    }
}
