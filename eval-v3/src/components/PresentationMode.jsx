import { useEffect } from 'react';
import { useStore, RISK_COLORS } from '../store';

export default function PresentationMode({ onClose }) {
    const { features } = useStore();

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const totalFeatures = features.length;
    const v1Count = features.filter(f => f.version === 'V1.0').length;
    const totalEffort = features.reduce((s, f) => s + (f.effort || 0), 0);
    const highRiskCount = features.filter(f => f.risk === 'high').length;
    const pending = features.filter(f => f.status === '待评估');
    const highRisks = features.filter(f => f.risk === 'high');
    const totalMonthlyCost = features.reduce((s, f) => s + (f.monthlyCost || 0), 0);

    const modules = [...new Set(features.map(f => f.module))];
    const moduleSummary = modules.map(m => {
        const items = features.filter(f => f.module === m);
        return { module: m, count: items.length, v1: items.filter(f => f.version === 'V1.0').length };
    });

    return (
        <div className="presentation-overlay">
            <button className="presentation-close" onClick={onClose}>ESC 退出</button>

            <div className="pres-title">AEON 项目评估报告</div>

            <div className="pres-metrics">
                <div className="pres-metric">
                    <div className="pres-value">{totalFeatures}</div>
                    <div className="pres-label">功能总数</div>
                </div>
                <div className="pres-metric">
                    <div className="pres-value">{v1Count}</div>
                    <div className="pres-label">V1.0 功能</div>
                </div>
                <div className="pres-metric">
                    <div className="pres-value" style={{ color: '#F59E0B' }}>{totalEffort || '--'}</div>
                    <div className="pres-label">总工作量(人天)</div>
                </div>
                <div className="pres-metric">
                    <div className="pres-value" style={{ color: '#EF4444' }}>{highRiskCount}</div>
                    <div className="pres-label">高风险项</div>
                </div>
            </div>

            <div className="pres-section">
                <h3>模块概览</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {moduleSummary.map(m => (
                        <div key={m.module} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{m.module}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{m.count} 项功能, V1.0: {m.v1} 项</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pres-section">
                <h3>待决策项 ({pending.length})</h3>
                {pending.slice(0, 8).map(f => (
                    <div className="pres-decision-item" key={f.id}>
                        <span style={{ fontWeight: 600 }}>{f.name}</span>
                        <span style={{ marginLeft: 12, fontSize: 12, opacity: 0.6 }}>{f.module} | {f.priority} | {f.version}</span>
                    </div>
                ))}
                {pending.length > 8 && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>...还有 {pending.length - 8} 项</div>}
            </div>

            <div className="pres-section">
                <h3>高风险项</h3>
                {highRisks.map(f => (
                    <div key={f.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
                        {f.risks.filter(r => r.level === 'high').map((r, i) => (
                            <div className="pres-risk-item" key={i}>
                                <span className="pres-risk-dot" style={{ background: RISK_COLORS.high }} />
                                <span style={{ fontSize: 14 }}>{r.text}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="pres-section">
                <h3>成本概要</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 20 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>{totalMonthlyCost.toLocaleString()}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>月度运营成本</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 20 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#EF4444' }}>{(totalMonthlyCost * 12).toLocaleString()}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>年度运营成本</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
