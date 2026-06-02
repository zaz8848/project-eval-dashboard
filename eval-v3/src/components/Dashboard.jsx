import { useStore, MODULE_COLORS, RISK_COLORS } from '../store';

export default function Dashboard() {
    const { features } = useStore();

    const totalFeatures = features.length;
    const v1Count = features.filter(f => f.version === 'V1.0').length;
    const totalEffort = features.reduce((s, f) => s + (f.effort || 0), 0);
    const riskCount = features.filter(f => f.risk === 'high').length;
    const pending = features.filter(f => f.status === '待评估');
    const highRisk = features.filter(f => f.risk === 'high').slice(0, 3);

    return (
        <div>
            <div className="card-grid card-grid-4">
                <div className="card summary-card">
                    <div className="label">功能总数</div>
                    <div className="value">{totalFeatures}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">V1.0 功能</div>
                    <div className="value">{v1Count}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">总工作量(人天)</div>
                    <div className="value warning">{totalEffort || '--'}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">高风险项</div>
                    <div className="value danger">{riskCount}</div>
                </div>
            </div>

            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card">
                    <div className="section-title">待评估功能 ({pending.length})</div>
                    {pending.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>暂无待评估项</div>}
                    {pending.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                            <span className="tag" style={{ background: MODULE_COLORS[f.module]?.bg, color: MODULE_COLORS[f.module]?.text }}>
                                {f.module}
                            </span>
                            <span style={{ flex: 1, fontSize: 13 }}>{f.name}</span>
                            <span className="tag" style={{ background: '#F3F4F6', color: '#6B7280' }}>{f.priority}</span>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="section-title">高风险项 (Top 3)</div>
                    {highRisk.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>暂无高风险项</div>}
                    {highRisk.map(f => (
                        <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS.high, flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                            </div>
                            {f.risks.filter(r => r.level === 'high').map((r, i) => (
                                <div key={i} style={{ fontSize: 12, color: '#6B7280', paddingLeft: 16 }}>{r.text}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
