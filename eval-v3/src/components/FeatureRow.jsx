import { useState } from 'react';
import { useStore, MODULE_COLORS, RISK_COLORS } from '../store';

export default function FeatureRow({ feature }) {
    const { updateFeature } = useStore();
    const [expanded, setExpanded] = useState(false);
    const f = feature;

    const change = (field, value) => updateFeature(f.id, { [field]: value });

    const addTech = () => {
        const techs = [...(f.techs || []), { name: '新技术', pct: 10 }];
        updateFeature(f.id, { techs });
    };
    const removeTech = (idx) => {
        const techs = f.techs.filter((_, i) => i !== idx);
        updateFeature(f.id, { techs });
    };
    const updateTech = (idx, field, value) => {
        const techs = f.techs.map((t, i) => i === idx ? { ...t, [field]: value } : t);
        updateFeature(f.id, { techs });
    };

    return (
        <>
            <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
                <td style={{ fontWeight: 500, maxWidth: 200 }}>{f.name}</td>
                <td>
                    <span className="tag" style={{ background: MODULE_COLORS[f.module]?.bg, color: MODULE_COLORS[f.module]?.text }}>
                        {f.module}
                    </span>
                </td>
                <td><span style={{ fontWeight: 600, color: f.priority === 'P0' ? '#DC2626' : f.priority === 'P1' ? '#F59E0B' : '#6B7280' }}>{f.priority}</span></td>
                <td>{f.version}</td>
                <td><span className="tag" style={{ background: f.risk === 'high' ? '#FEE2E2' : f.risk === 'medium' ? '#FEF3C7' : '#DCFCE7', color: RISK_COLORS[f.risk] }}>{f.risk === 'high' ? '高' : f.risk === 'medium' ? '中' : '低'}</span></td>
                <td>
                    <input
                        className="inline-edit"
                        type="number"
                        value={f.impact || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e => change('impact', parseInt(e.target.value) || 0)}
                        min={1} max={10}
                        style={{ width: 40 }}
                    />
                </td>
                <td>
                    <input
                        className="inline-edit"
                        type="number"
                        value={f.effort ?? ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e => change('effort', e.target.value === '' ? null : parseInt(e.target.value))}
                        min={0}
                        style={{ width: 50 }}
                    />
                </td>
                <td>
                    <input
                        type="month"
                        value={f.deadline || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e => change('deadline', e.target.value || null)}
                        style={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 4px' }}
                    />
                </td>
                <td>
                    {(() => {
                        if (!f.deadline) return <span style={{ color: '#9CA3AF', fontSize: 12 }}>--</span>;
                        const [y, m] = f.deadline.split('-').map(Number);
                        const now = new Date();
                        const diffMonths = (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1));
                        if (diffMonths < 0) return <span className="tag" style={{ background: '#FEE2E2', color: '#DC2626' }}>已过期</span>;
                        if (diffMonths < 1) return <span className="tag" style={{ background: '#FEE2E2', color: '#DC2626' }}>紧急(本月)</span>;
                        if (diffMonths < 2) return <span className="tag" style={{ background: '#FEF3C7', color: '#D97706' }}>预警({diffMonths}月)</span>;
                        return <span className="tag" style={{ background: '#DCFCE7', color: '#16A34A' }}>正常({diffMonths}月)</span>;
                    })()}
                </td>
                <td>
                    <select
                        value={f.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => change('status', e.target.value)}
                        style={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 4px', background: '#fff' }}
                    >
                        <option>待评估</option>
                        <option>进行中</option>
                        <option>已完成</option>
                        <option>搁置</option>
                    </select>
                </td>
                <td>
                    <div className="tech-chips-stacked">
                        {(f.techs || []).map((t, i) => (
                            <span key={i} className="tech-chip">{t.name} ({t.pct}%)</span>
                        ))}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="expand-content">
                    <td colSpan={11} style={{ padding: 0 }}>
                        <div className="expand-grid">
                            <div>
                                <div className="expand-section">
                                    <label>功能描述</label>
                                    <textarea rows={3} value={f.desc || ''} onChange={e => change('desc', e.target.value)} />
                                </div>
                                <div className="expand-section">
                                    <label>技术分析</label>
                                    <textarea rows={3} value={f.techAnalysis || ''} onChange={e => change('techAnalysis', e.target.value)} />
                                </div>
                                <div className="expand-section">
                                    <label>技术分配</label>
                                    {(f.techs || []).map((t, i) => (
                                        <div className="tech-bar-container" key={i}>
                                            <input
                                                className="tech-bar-name"
                                                value={t.name}
                                                onChange={e => updateTech(i, 'name', e.target.value)}
                                                style={{ border: 'none', background: 'none', fontSize: 12 }}
                                            />
                                            <div className="tech-bar-track">
                                                <div className="tech-bar-fill" style={{ width: `${t.pct}%` }} />
                                            </div>
                                            <input
                                                className="tech-bar-pct"
                                                type="number"
                                                value={t.pct}
                                                onChange={e => updateTech(i, 'pct', parseInt(e.target.value) || 0)}
                                                min={0} max={100}
                                                style={{ width: 40, border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 4px', fontSize: 12, textAlign: 'right' }}
                                            />
                                            <button className="btn btn-sm btn-danger" onClick={() => removeTech(i)}>x</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-sm" onClick={addTech} style={{ marginTop: 4 }}>+ 添加技术</button>
                                </div>
                                <div className="expand-section">
                                    <label>风险项</label>
                                    {(f.risks || []).map((r, i) => (
                                        <div className="risk-item" key={i}>
                                            <span className="risk-dot" style={{ background: RISK_COLORS[r.level] || '#9CA3AF' }} />
                                            <span>{r.text}</span>
                                        </div>
                                    ))}
                                    {(!f.risks || f.risks.length === 0) && <span style={{ fontSize: 12, color: '#9CA3AF' }}>无</span>}
                                </div>
                            </div>
                            <div>
                                <div className="expand-section">
                                    <label>决策日志</label>
                                    <textarea rows={3} value={f.decisionLog || ''} onChange={e => change('decisionLog', e.target.value)} />
                                </div>
                                <div className="expand-section">
                                    <label>月度成本</label>
                                    <input type="number" value={f.monthlyCost || 0} onChange={e => change('monthlyCost', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="expand-section">
                                    <label>成本备注</label>
                                    <input type="text" value={f.costNotes || ''} onChange={e => change('costNotes', e.target.value)} />
                                </div>
                                <div className="expand-section">
                                    <label>Mermaid 图源码</label>
                                    <textarea rows={4} value={f.diagram || ''} onChange={e => change('diagram', e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                                </div>
                                <div className="expand-section">
                                    <label>备注</label>
                                    <textarea rows={2} value={f.note || ''} onChange={e => change('note', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
