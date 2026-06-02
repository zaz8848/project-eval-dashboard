import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useStore } from '../store';

function buildGanttOption(tasks) {
    if (!tasks || tasks.length === 0) return null;
    const sections = [...new Set(tasks.map(t => t.section))];
    const items = [];
    tasks.forEach((t) => {
        const start = new Date(t.start).getTime();
        const end = start + (t.days || 1) * 86400000;
        items.push({
            name: t.name,
            value: [sections.indexOf(t.section), start, end, t.days],
            itemStyle: {
                color: t.milestone ? '#F59E0B' : ['#6366F1', '#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B'][sections.indexOf(t.section) % 5],
            },
        });
    });
    return {
        tooltip: { formatter: (p) => p.data.name + '<br/>' + new Date(p.data.value[1]).toLocaleDateString() + ' ~ ' + new Date(p.data.value[2]).toLocaleDateString() + '<br/>' + p.data.value[3] + ' 天' },
        grid: { left: 120, right: 30, top: 20, bottom: 30 },
        xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
        yAxis: { type: 'category', data: sections, inverse: true, axisLabel: { fontSize: 11 } },
        series: [{
            type: 'custom',
            renderItem: (params, api) => {
                const catIdx = api.value(0);
                const start = api.coord([api.value(1), catIdx]);
                const end = api.coord([api.value(2), catIdx]);
                const height = api.size([0, 1])[1] * 0.5;
                return { type: 'rect', shape: { x: start[0], y: start[1] - height / 2, width: Math.max(end[0] - start[0], 4), height }, style: api.style(), encode: { x: [1, 2], y: 0 } };
            },
            encode: { x: [1, 2], y: 0 },
            data: items,
        }],
    };
}

function getFeatureDetails(planPhases, features) {
    const result = [];
    (planPhases || []).forEach(ph => {
        (ph.items || []).forEach(itemName => {
            const f = features.find(feat => feat.name.includes(itemName) || itemName.includes(feat.name.substring(0, 8)));
            if (f) result.push({ ...f, phase: ph.name });
        });
    });
    return result;
}

const RISK_LABEL = { high: '高', medium: '中', low: '低' };
const RISK_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };
const MOD_COLOR = { '智能问数': '#EF4444', '营销助手': '#F59E0B', '营销策略': '#3B82F6', '基础后台': '#8B5CF6' };

/* ===== Hero Slide ===== */
function PlanHeroSlide({ plan, features, onUpdateTask, onUpdateFeature, onUpdatePlan }) {
    const [editingTask, setEditingTask] = useState(null);
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
    const [editingRisk, setEditingRisk] = useState(null);
    const [collapsedPhases, setCollapsedPhases] = useState({});
    const [editingFeature, setEditingFeature] = useState(null);

    const coreFeatures = plan.coreFeatures || [];
    const baseInfra = plan.baseInfra || [];
    const phaseFeatures = plan.phaseFeatures || null;
    const isMultiPhase = !!phaseFeatures;

    const allGantt = plan.ganttTasks || [];
    const allTasks = allGantt.filter(t => !t.milestone);
    const milestones = isMultiPhase ? allGantt.filter(t => t.milestone) : allGantt.filter(t => t.milestone && (t.name.includes('第一') || t.name.includes('V1')));

    const phase1Sections = new Set(['核心功能', '基础底座']);
    const displayTasks = isMultiPhase ? allTasks : allTasks.filter(t => phase1Sections.has(t.section));

    const p1Dates = displayTasks.map(t => {
        const s = new Date(t.start).getTime();
        return { start: s, end: s + t.days * 86400000 };
    });
    const calendarStart = p1Dates.length ? Math.min(...p1Dates.map(d => d.start)) : 0;
    const calendarEnd = p1Dates.length ? Math.max(...p1Dates.map(d => d.end)) : 0;
    const calendarDays = p1Dates.length ? Math.ceil((calendarEnd - calendarStart) / 86400000) : 0;

    const minDate = calendarStart;
    const maxDate = calendarEnd;
    const range = maxDate - minDate || 1;

    // Weekly ticks
    const months = [];
    if (p1Dates.length > 0) {
        const d = new Date(minDate);
        while (d.getTime() <= maxDate) {
            const pct = Math.max(0, Math.min(100, ((d.getTime() - minDate) / range) * 100));
            months.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), pct });
            d.setDate(d.getDate() + 7);
        }
    }

    const sectionOrder = [];
    const sectionMap = {};
    displayTasks.forEach(t => {
        if (!sectionMap[t.section]) { sectionMap[t.section] = []; sectionOrder.push(t.section); }
        sectionMap[t.section].push(t);
    });
    const sectionColors = { '核心功能': '#6366F1', '基础底座': '#8B5CF6', 'V1.0': '#6366F1', 'V2.0': '#3B82F6', 'V2.1': '#22C55E' };

    // Risks
    const coreRisks = [];
    const featureSources = isMultiPhase ? (phaseFeatures || []).flatMap(pf => pf.features) : coreFeatures;
    featureSources.forEach(cf => {
        const mapped = (cf.featureIds || []).map(id => features.find(f => f.id === id)).filter(Boolean);
        mapped.forEach(f => {
            (f.risks || []).filter(r => r.level === 'high').forEach(r => {
                coreRisks.push({ feature: cf.name, text: r.text, featureId: f.id });
            });
        });
    });

    const findTaskIdx = (name) => allGantt.findIndex(t => t.name === name);

    // Update a coreFeature field
    const updateCoreFeature = (cfIdx, field, value) => {
        const newCF = coreFeatures.map((cf, i) => i === cfIdx ? { ...cf, [field]: value } : cf);
        onUpdatePlan({ coreFeatures: newCF });
    };
    const addCoreFeature = () => {
        const newCF = [...coreFeatures, { name: '新功能模块', desc: '点击编辑描述', module: '智能问数', featureIds: [], ourWork: '待定', clientWork: '待定', jointWork: '待定' }];
        onUpdatePlan({ coreFeatures: newCF });
    };
    const removeCoreFeature = (cfIdx) => {
        onUpdatePlan({ coreFeatures: coreFeatures.filter((_, i) => i !== cfIdx) });
    };

    // Shared task bar renderer
    const renderTaskBar = (t, ti, left, width, row, idx, isEditing, startLabel, color) => (
        <div key={ti}
            style={{ position: 'absolute', left: left + '%', width: width + '%', top: row * 28 + 2, height: 22, zIndex: isEditing ? 10 : 1, cursor: 'grab' }}
            draggable={false}
            onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                const lane = e.currentTarget.closest('.gantt-lane');
                if (!lane) return;
                const laneRect = lane.getBoundingClientRect();
                const startX = e.clientX;
                const origStart = new Date(t.start).getTime();
                const oneDayPx = laneRect.width * (86400000 / range);
                const onMove = (ev) => {
                    const dx = ev.clientX - startX;
                    const daysDelta = Math.round(dx / oneDayPx);
                    if (daysDelta !== 0) {
                        const ns = new Date(origStart + daysDelta * 86400000);
                        onUpdateTask(idx, 'start', ns.getFullYear() + '-' + String(ns.getMonth() + 1).padStart(2, '0') + '-' + String(ns.getDate()).padStart(2, '0'));
                    }
                };
                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
                document.body.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            }}
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverPos({ x: Math.min(rect.left, window.innerWidth - 240), y: rect.bottom + 4 });
                setEditingTask(editingTask === idx ? null : idx);
            }}
        >
            <div style={{
                width: '100%', height: '100%',
                background: isEditing ? (color + '30') : (color + '15'),
                border: '1px solid ' + (isEditing ? color : color + '44'),
                borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6,
                overflow: 'hidden', pointerEvents: 'none',
            }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>{t.name}</span>
                <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 4, whiteSpace: 'nowrap' }}>{startLabel}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, color: color, paddingRight: 4, flexShrink: 0, fontWeight: 600 }}>{t.days + 'd'}</span>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                        {plan.name}
                        <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 600, color: '#6366F1' }}>
                            {displayTasks.reduce((s, t) => s + (t.days || 0) * (t.headcount || 1), 0) + ' \u4eba\u5929'}
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#4F46E5', marginTop: 2, fontWeight: 500 }}>{plan.summary}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{plan.strategy}</div>
                </div>
                {plan.tag && <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#EEF2FF', color: '#4F46E5' }}>{plan.tag}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
                {/* LEFT panel */}
                <div style={{ padding: '16px 20px', borderRight: '1px solid #E5E7EB', background: '#FAFBFC', overflowY: 'auto' }}>

                    {/* Multi-phase mode */}
                    {isMultiPhase && phaseFeatures.map((pf, pi) => {
                        const phaseColor = ['#6366F1', '#3B82F6', '#22C55E'][pi] || '#6B7280';
                        const collapsed = !!collapsedPhases[pi];
                        const toggleCollapse = () => setCollapsedPhases(prev => ({ ...prev, [pi]: !prev[pi] }));
                        return (
                            <div key={pi} style={{ marginBottom: 12 }}>
                                <div onClick={toggleCollapse} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 8, paddingBottom: 6, borderBottom: '2px solid ' + phaseColor, cursor: 'pointer', userSelect: 'none' }}>
                                    <span style={{ fontSize: 10, color: phaseColor, transition: 'transform 0.2s', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>&#9654;</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: phaseColor }}>{pf.title}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9CA3AF' }}>{pf.features.length + ' 项'}</span>
                                </div>
                                {collapsed ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 0' }}>
                                        {pf.features.map((cf, i) => (
                                            <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#F3F4F6', color: '#374151', fontWeight: 500 }}>{cf.name} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>| {cf.module}</span></span>
                                        ))}
                                    </div>
                                ) : (
                                    pf.features.map((cf, i) => {
                                        const modColor = MOD_COLOR[cf.module] || '#6366F1';
                                        return (
                                            <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < pf.features.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>

                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{cf.name}</span>
                                                    <span style={{ padding: '0 4px', borderRadius: 2, fontSize: 9, background: modColor + '15', color: modColor }}>{cf.module}</span>
                                                </div>
                                                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>{cf.desc}</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, fontSize: 9 }}>
                                                    <div style={{ color: '#4B5563' }}><span style={{ fontWeight: 600, color: '#6366F1' }}>我方</span> {cf.ourWork}</div>
                                                    <div style={{ color: '#4B5563' }}><span style={{ fontWeight: 600, color: '#D97706' }}>客户</span> {cf.clientWork}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        );
                    })}

                    {/* Single-phase mode */}
                    {!isMultiPhase && coreFeatures.map((cf, i) => {
                        const modColor = MOD_COLOR[cf.module] || '#6366F1';
                        const mapped = (cf.featureIds || []).map(id => features.find(f => f.id === id)).filter(Boolean);
                        const relTasks = displayTasks.filter(t => t.name.includes(cf.name.substring(0, 4)) || mapped.some(f => t.name.includes(f.name.substring(0, 6))));
                        const days = relTasks.reduce((s, t) => s + (t.days || 0), 0);
                        return (
                            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < coreFeatures.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', cursor: 'pointer' }} onClick={() => setEditingFeature(i)}>{cf.name}</span>
                                    {days > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', background: '#EEF2FF', padding: '1px 6px', borderRadius: 3 }}>{days + '\u5929'}</span>}
                                    <button onClick={() => setEditingFeature(i)} style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px', border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', color: '#6B7280' }}>{'\u7f16\u8f91'}</button>
                                </div>
                                <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: cf.desc }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                                    <div style={{ color: '#4B5563' }}><span style={{ fontWeight: 600, color: '#6366F1' }}>{'\u6211\u65b9'}</span> {cf.ourWork}</div>
                                    <div style={{ color: '#4B5563' }}><span style={{ fontWeight: 600, color: '#D97706' }}>{'\u5ba2\u6237'}</span> {cf.clientWork}</div>
                                </div>
                            </div>
                        );
                    })}
                    {!isMultiPhase && (
                        <button onClick={addCoreFeature} style={{ width: '100%', padding: '6px 0', border: '1px dashed #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11, color: '#6B7280', marginBottom: 12 }}>{"+ \u6dfb\u52a0\u529f\u80fd\u6a21\u5757"}</button>
                    )}

                    {/* Base infra (plan-a only) */}
                    {!isMultiPhase && baseInfra && baseInfra.length > 0 && (
                        <div style={{ background: '#F3F4F6', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>同步建设</div>
                            {baseInfra.map((b, i) => (
                                <div key={i} style={{ fontSize: 11, color: '#4B5563', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 4, height: 4, borderRadius: 1, background: '#8B5CF6', flexShrink: 0 }} />
                                    {b.name}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Risks */}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>风险项</span>
                            <button onClick={() => setEditingRisk('modal')} style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', color: '#6B7280' }}>编辑</button>
                        </div>
                        {coreRisks.length > 0 ? coreRisks.map((r, i) => (
                            <div key={i} style={{ fontSize: 10, color: '#4B5563', padding: '3px 0', lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 600 }}>{r.feature}:</span> {r.text}
                            </div>
                        )) : <div style={{ fontSize: 10, color: '#9CA3AF' }}>暂无风险项</div>}
                    </div>
                </div>

                {/* Risk edit modal */}
                {editingRisk === 'modal' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingRisk(null)}>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 20, width: 480, maxHeight: '70vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>编辑风险项</span>
                                <button onClick={() => setEditingRisk(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}>&times;</button>
                            </div>
                            {coreRisks.map((r, i) => {
                                const feat = features.find(f => f.id === r.featureId);
                                return (
                                    <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: '#FAFAFA', borderRadius: 6, position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{r.feature}</span>
                                            <button onClick={() => {
                                                if (feat) {
                                                    const newRisks = feat.risks.filter(rr => rr.text !== r.text);
                                                    onUpdateFeature(feat.id, { risks: newRisks });
                                                }
                                            }} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#9CA3AF' }}>&times;</button>
                                        </div>
                                        <textarea value={r.text} rows={2} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 8px', fontSize: 11, resize: 'vertical', fontFamily: 'inherit' }}
                                            onChange={e => {
                                                if (feat) {
                                                    const newRisks = feat.risks.map(rr => rr.text === r.text ? { ...rr, text: e.target.value } : rr);
                                                    onUpdateFeature(feat.id, { risks: newRisks });
                                                }
                                            }} />
                                    </div>
                                );
                            })}
                            {/* Add new risk */}
                            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                <select id="risk-feat-select" style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}>
                                    {featureSources.map((cf, i) => <option key={i} value={i}>{cf.name}</option>)}
                                </select>
                                <button onClick={() => {
                                    const sel = document.getElementById('risk-feat-select');
                                    const cf = featureSources[parseInt(sel.value)];
                                    if (cf) {
                                        const fids = cf.featureIds || [];
                                        const feat = fids.length > 0 ? features.find(f => f.id === fids[0]) : null;
                                        if (feat) {
                                            const newRisks = [...(feat.risks || []), { level: 'high', text: '新风险项 — 点击编辑' }];
                                            onUpdateFeature(feat.id, { risks: newRisks });
                                        }
                                    }
                                }} style={{ fontSize: 11, padding: '4px 12px', border: '1px solid #E5E7EB', borderRadius: 4, background: '#fff', cursor: 'pointer', color: '#6366F1', fontWeight: 500, whiteSpace: 'nowrap' }}>+ 添加</button>
                            </div>
                            <button onClick={() => setEditingRisk(null)} style={{ marginTop: 4, width: '100%', background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 12, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>完成</button>
                        </div>
                    </div>
                )}

                {/* RIGHT: Timeline */}
                <div style={{ padding: '16px 20px', position: 'relative', overflowX: 'auto' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 10 }}>交付时间轴（点击任务条编辑，可左右滑动）</div>
                    <div style={{ minWidth: calendarDays * 18 }}>
                        {/* Date axis */}
                        <div style={{ position: 'relative', height: 20, marginBottom: 8, borderBottom: '1px solid #E5E7EB' }}>
                            {months.map((m, i) => (
                                <div key={i} style={{ position: 'absolute', left: m.pct + '%', fontSize: 10, fontWeight: 600, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{m.label}</div>
                            ))}
                        </div>
                        {/* Timeline rendering — always use swimlanes */}
                        {sectionOrder.map((sec, si) => {
                            const secTasks = sectionMap[sec];
                            const color = sectionColors[sec] || '#6B7280';
                            return (
                                <div key={si} style={{ marginBottom: 6 }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: color, marginBottom: 4 }}>{sec}</div>
                                    <div className="gantt-lane" style={{ position: 'relative', minHeight: secTasks.length * 28 + 2, background: si % 2 === 0 ? '#FAFBFC' : '#fff', borderRadius: 4, border: '1px solid #F3F4F6' }}>
                                        {secTasks.map((t, ti) => {
                                            const s = new Date(t.start).getTime();
                                            const left = ((s - minDate) / range) * 100;
                                            const width = Math.max(5, (t.days * 86400000 / range) * 100);
                                            const idx = findTaskIdx(t.name);
                                            const isEditing = editingTask === idx;
                                            const sd = new Date(t.start);
                                            const startLabel = (sd.getMonth() + 1) + '/' + sd.getDate();
                                            return renderTaskBar(t, ti, left, width, ti, idx, isEditing, startLabel, color);
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Version region labels */}
                        {isMultiPhase && sectionOrder.filter(s => s !== '里程碑').length > 0 && (
                            <div style={{ position: 'relative', height: 20, marginTop: 6 }}>
                                {sectionOrder.filter(s => s !== '里程碑').map((sec, si) => {
                                    const secTasks = sectionMap[sec];
                                    const secStarts = secTasks.map(t => new Date(t.start).getTime());
                                    const secEnds = secTasks.map(t => new Date(t.start).getTime() + t.days * 86400000);
                                    const secLeft = ((Math.min(...secStarts) - minDate) / range) * 100;
                                    const secRight = ((Math.max(...secEnds) - minDate) / range) * 100;
                                    const color = sectionColors[sec] || '#6B7280';
                                    return (
                                        <div key={si} style={{ position: 'absolute', left: secLeft + '%', width: (secRight - secLeft) + '%', height: 16, background: color + '10', border: '1px solid ' + color + '30', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 9, fontWeight: 600, color: color }}>{sec}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {/* Milestones */}
                        {milestones.length > 0 && (
                            <div style={{ position: 'relative', height: 28, marginTop: 6, borderTop: '1px solid #E5E7EB', paddingTop: 6 }}>
                                {milestones.map((m, mi) => {
                                    const s = new Date(m.start).getTime();
                                    const left = Math.min(95, Math.max(5, ((s - minDate) / range) * 100));
                                    return (
                                        <div key={mi} style={{ position: 'absolute', left: left + '%', textAlign: 'center' }}>
                                            <div style={{ width: 8, height: 8, background: '#F59E0B', transform: 'rotate(45deg)', margin: '0 auto 2px' }} />
                                            <div style={{ fontSize: 9, color: '#6B7280', whiteSpace: 'nowrap' }}>{m.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed popover */}
            {editingTask !== null && (() => {
                const idx = editingTask;
                const t = allGantt[idx];
                if (!t) return null;
                return (
                    <>
                        <div onClick={() => setEditingTask(null)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                        <div onClick={e => e.stopPropagation()} style={{
                            position: 'fixed', left: popoverPos.x, top: popoverPos.y,
                            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                            padding: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 1000, width: 240,
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#111827' }}>{t.name}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 10, color: '#6B7280' }}>
                                    名称
                                    <input value={t.name} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 6px', fontSize: 11, marginTop: 2 }}
                                        onChange={e => onUpdateTask(idx, 'name', e.target.value)} />
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <label style={{ fontSize: 10, color: '#6B7280', flex: 1 }}>
                                        开始日期
                                        <input type="date" value={t.start} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 4px', fontSize: 11, marginTop: 2 }}
                                            onChange={e => onUpdateTask(idx, 'start', e.target.value)} />
                                    </label>
                                    <label style={{ fontSize: 10, color: '#6B7280', width: 50 }}>
                                        {"\u5929\u6570"}
                                        <input type="number" value={t.days} min={1} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 4px', fontSize: 11, textAlign: 'center', marginTop: 2 }}
                                            onChange={e => onUpdateTask(idx, 'days', parseInt(e.target.value) || 1)} />
                                    </label>
                                    <label style={{ fontSize: 10, color: '#6B7280', width: 50 }}>
                                        {"\u4eba\u6570"}
                                        <input type="number" value={t.headcount || 1} min={1} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '4px 4px', fontSize: 11, textAlign: 'center', marginTop: 2 }}
                                            onChange={e => onUpdateTask(idx, 'headcount', parseInt(e.target.value) || 1)} />
                                    </label>
                                </div>
                                <div style={{ fontSize: 10, color: '#6366F1', fontWeight: 600, textAlign: 'right' }}>
                                    {'= ' + ((t.headcount || 1) * t.days) + ' \u4eba\u5929'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button onClick={() => setEditingTask(null)} style={{ flex: 1, background: '#F3F4F6', border: 'none', borderRadius: 4, padding: '5px 0', fontSize: 11, cursor: 'pointer', color: '#374151' }}>完成</button>
                                <button onClick={() => { const tasks = plan.ganttTasks.filter((_, j) => j !== idx); onUpdateTask(-1, '_replace_all', tasks); setEditingTask(null); }} style={{ padding: '5px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: '#DC2626' }}>删除</button>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Feature edit modal */}
            {editingFeature !== null && !isMultiPhase && (() => {
                const cf = coreFeatures[editingFeature];
                if (!cf) return null;
                const modules = Object.keys(MOD_COLOR);
                const HIGHLIGHT_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6'];
                const execCmd = (cmd, val) => { document.execCommand(cmd, false, val); };
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingFeature(null)}>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 20, width: 520, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{"\u7f16\u8f91\u529f\u80fd\u6a21\u5757"}</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => { removeCoreFeature(editingFeature); setEditingFeature(null); }} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 4, background: '#FEF2F2', cursor: 'pointer', color: '#DC2626' }}>{"\u5220\u9664"}</button>
                                    <button onClick={() => setEditingFeature(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}>&times;</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <label style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                    {"\u540d\u79f0"}
                                    <input value={cf.name} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 12, marginTop: 2 }}
                                        onChange={e => updateCoreFeature(editingFeature, 'name', e.target.value)} />
                                </label>
                                <label style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                    {"\u6a21\u5757"}
                                    <select value={cf.module} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 12, marginTop: 2 }}
                                        onChange={e => updateCoreFeature(editingFeature, 'module', e.target.value)}>
                                        {modules.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </label>
                                <div style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                    {"\u63cf\u8ff0"}
                                    <div style={{ display: 'flex', gap: 3, marginTop: 4, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <button onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>B</button>
                                        <button onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', fontStyle: 'italic', fontSize: 12 }}>I</button>
                                        <button onMouseDown={e => { e.preventDefault(); execCmd('underline'); }} style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>U</button>
                                        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 2px' }} />
                                        {HIGHLIGHT_COLORS.map(c => (
                                            <button key={c} onMouseDown={e => { e.preventDefault(); execCmd('foreColor', c); }} style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + c, background: c + '20', cursor: 'pointer', flexShrink: 0 }} title={"\u6587\u5b57\u989c\u8272"} />
                                        ))}
                                        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 2px' }} />
                                        {HIGHLIGHT_COLORS.map(c => (
                                            <button key={'bg' + c} onMouseDown={e => { e.preventDefault(); execCmd('hiliteColor', c + '30'); }} style={{ width: 20, height: 20, borderRadius: 3, border: '1px solid ' + c, background: c + '30', cursor: 'pointer', flexShrink: 0, fontSize: 9, lineHeight: '18px', textAlign: 'center' }} title={"\u80cc\u666f\u8272"}>{"A"}</button>
                                        ))}
                                        <button onMouseDown={e => { e.preventDefault(); execCmd('removeFormat'); }} style={{ fontSize: 9, padding: '2px 6px', border: '1px solid #E5E7EB', borderRadius: 3, background: '#fff', cursor: 'pointer', color: '#9CA3AF', marginLeft: 'auto' }}>{"\u6e05\u9664\u683c\u5f0f"}</button>
                                    </div>
                                    <div
                                        id="cf-desc-editor"
                                        contentEditable
                                        suppressContentEditableWarning
                                        dangerouslySetInnerHTML={{ __html: cf.desc }}
                                        onBlur={e => updateCoreFeature(editingFeature, 'desc', e.currentTarget.innerHTML)}
                                        style={{ display: 'block', width: '100%', minHeight: 60, border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 12, lineHeight: 1.6, outline: 'none', background: '#fff' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <label style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                        {"\u6211\u65b9\u5de5\u4f5c"}
                                        <textarea value={cf.ourWork} rows={2} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 11, marginTop: 2, resize: 'vertical' }}
                                            onChange={e => updateCoreFeature(editingFeature, 'ourWork', e.target.value)} />
                                    </label>
                                    <label style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                        {"\u5ba2\u6237\u5de5\u4f5c"}
                                        <textarea value={cf.clientWork} rows={2} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 11, marginTop: 2, resize: 'vertical' }}
                                            onChange={e => updateCoreFeature(editingFeature, 'clientWork', e.target.value)} />
                                    </label>
                                </div>
                                <label style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                                    {"\u8054\u5408\u5de5\u4f5c"}
                                    <input value={cf.jointWork || ''} style={{ display: 'block', width: '100%', border: '1px solid #E5E7EB', borderRadius: 4, padding: '6px 8px', fontSize: 12, marginTop: 2 }}
                                        onChange={e => updateCoreFeature(editingFeature, 'jointWork', e.target.value)} />
                                </label>
                            </div>
                            <button onClick={() => setEditingFeature(null)} style={{ marginTop: 12, width: '100%', background: '#6366F1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>{"\u5b8c\u6210"}</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default function PlanDesign() {
    const { plans, features, updatePlan, addPlan, updateFeature } = useStore();
    const [activePlan, setActivePlan] = useState(plans[0]?.id || '');
    const [showComparison, setShowComparison] = useState(true);
    const [showTaskEditor, setShowTaskEditor] = useState(false);

    const plan = plans.find(p => p.id === activePlan) || plans[0];

    const updateTask = (idx, field, value) => {
        if (field === '_replace_all') {
            updatePlan(plan.id, { ganttTasks: value });
        } else {
            const tasks = plan.ganttTasks.map((t, i) => i === idx ? { ...t, [field]: value } : t);
            updatePlan(plan.id, { ganttTasks: tasks });
        }
    };

    const ganttOption = plan ? buildGanttOption(plan.ganttTasks) : null;

    return (
        <div>
            <div className="section-title">方案设计</div>

            {/* Comparison */}
            {plans.length >= 2 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showComparison ? 12 : 0 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>方案对比</span>
                        <button className="btn btn-sm" onClick={() => setShowComparison(!showComparison)}>{showComparison ? '收起' : '展开'}</button>
                    </div>
                    {showComparison && (
                        <table className="comparison-table">
                            <thead><tr><th></th>{plans.map(p => <th key={p.id}>{p.name}{p.tag ? ' [' + p.tag + ']' : ''}</th>)}</tr></thead>
                            <tbody>
                                <tr><td style={{ fontWeight: 600 }}>策略</td>{plans.map(p => <td key={p.id}>{p.strategy}</td>)}</tr>
                                <tr><td style={{ fontWeight: 600 }}>核心功能</td>{plans.map(p => <td key={p.id}>{p.phaseFeatures ? p.phaseFeatures.map(pf => pf.phase + ': ' + pf.features.length + '个').join(' / ') : (p.coreFeatures || []).map(f => typeof f === 'object' ? f.name : f).join('; ')}</td>)}</tr>
                                <tr><td style={{ fontWeight: 600 }}>阶段数</td>{plans.map(p => <td key={p.id}>{(p.phases || []).length + ' 个阶段'}</td>)}</tr>
                                <tr><td style={{ fontWeight: 600 }}>优势</td>{plans.map(p => <td key={p.id}>{(p.pros || []).join('; ')}</td>)}</tr>
                                <tr><td style={{ fontWeight: 600 }}>劣势</td>{plans.map(p => <td key={p.id}>{(p.cons || []).join('; ')}</td>)}</tr>
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="plan-tabs">
                {plans.map(p => (
                    <button key={p.id} className={'plan-tab' + (activePlan === p.id ? ' active' : '')} onClick={() => setActivePlan(p.id)}>
                        {p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name}
                        {p.tag && <span style={{ marginLeft: 6, fontSize: 10, background: '#6366F1', color: '#fff', padding: '1px 6px', borderRadius: 3 }}>{p.tag}</span>}
                    </button>
                ))}
                <button className="plan-tab plan-add-tab" onClick={addPlan}>+ 新方案</button>
            </div>

            {plan && (
                <div>
                    {/* Hero Slide */}
                    {(plan.coreFeatures || plan.phaseFeatures) && (
                        <PlanHeroSlide plan={plan} features={features} onUpdateTask={updateTask} onUpdateFeature={updateFeature} onUpdatePlan={(changes) => updatePlan(plan.id, changes)} />
                    )}

                    {/* Phases */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="section-title">阶段规划</div>
                        {(plan.phases || []).map((ph, i) => (
                            <div className="phase-card" key={i}>
                                <h4>{ph.name}</h4>
                                <div style={{ fontSize: 12, color: '#6366F1', marginBottom: 6 }}>{'重点: ' + ph.focus}</div>
                                <ul className="phase-items">{(ph.items || []).map((item, j) => <li key={j}>{item}</li>)}</ul>
                                {ph.acceptance && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>{'验收标准: ' + ph.acceptance}</div>}
                            </div>
                        ))}
                        <div className="pros-cons">
                            <div>
                                <div className="section-title">优势</div>
                                <ul className="pros-list">{(plan.pros || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
                            </div>
                            <div>
                                <div className="section-title">劣势</div>
                                <ul className="cons-list">{(plan.cons || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                            </div>
                        </div>
                    </div>

                    {/* Gantt (ECharts) */}
                    {ganttOption && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="section-title" style={{ marginBottom: 8 }}>甘特图</div>
                            <ReactECharts option={ganttOption} style={{ height: 300 }} />
                        </div>
                    )}

                    {/* Task Editor */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTaskEditor ? 12 : 0 }}>
                            <span className="section-title" style={{ margin: 0 }}>任务编辑</span>
                            <button className="btn btn-sm" onClick={() => setShowTaskEditor(!showTaskEditor)}>{showTaskEditor ? '收起' : '展开'}</button>
                        </div>
                        {showTaskEditor && plan.ganttTasks && (
                            <table className="gantt-task-table">
                                <thead><tr><th>阶段</th><th>名称</th><th>开始日期</th><th>天数</th></tr></thead>
                                <tbody>
                                    {plan.ganttTasks.map((t, i) => (
                                        <tr key={i}>
                                            <td><input value={t.section} onChange={e => updateTask(i, 'section', e.target.value)} /></td>
                                            <td><input value={t.name} onChange={e => updateTask(i, 'name', e.target.value)} /></td>
                                            <td><input type="date" value={t.start} onChange={e => updateTask(i, 'start', e.target.value)} /></td>
                                            <td><input type="number" value={t.days} onChange={e => updateTask(i, 'days', parseInt(e.target.value) || 0)} min={0} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
