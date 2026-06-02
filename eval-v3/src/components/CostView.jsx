import { useStore, MODULE_COLORS } from '../store';

export default function CostView() {
    const { features, updateFeature } = useStore();

    const totalEffort = features.reduce((s, f) => s + (f.effort || 0), 0);
    const v1Effort = features.filter(f => f.version === 'V1.0').reduce((s, f) => s + (f.effort || 0), 0);
    const totalMonthlyCost = features.reduce((s, f) => s + (f.monthlyCost || 0), 0);
    const annualCost = totalMonthlyCost * 12;

    const modules = [...new Set(features.map(f => f.module))];

    return (
        <div>
            <div className="card-grid card-grid-4" style={{ marginBottom: 20 }}>
                <div className="card summary-card">
                    <div className="label">总工作量(人天)</div>
                    <div className="value">{totalEffort || '--'}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">V1.0 工作量</div>
                    <div className="value">{v1Effort || '--'}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">月度运营成本</div>
                    <div className="value warning">{totalMonthlyCost.toLocaleString()}</div>
                </div>
                <div className="card summary-card">
                    <div className="label">年度运营成本</div>
                    <div className="value danger">{annualCost.toLocaleString()}</div>
                </div>
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>功能名称</th>
                            <th>版本</th>
                            <th>工作量(天)</th>
                            <th>月度成本</th>
                            <th>成本备注</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map(mod => {
                            const items = features.filter(f => f.module === mod);
                            const mc = MODULE_COLORS[mod] || {};
                            const modEffort = items.reduce((s, f) => s + (f.effort || 0), 0);
                            const modCost = items.reduce((s, f) => s + (f.monthlyCost || 0), 0);
                            return [
                                <tr key={`h-${mod}`} className="cost-group-header">
                                    <td colSpan={2}>
                                        <span className="tag" style={{ background: mc.bg, color: mc.text, marginRight: 8 }}>{mod}</span>
                                        ({items.length} 项)
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{modEffort || '--'}</td>
                                    <td style={{ fontWeight: 600 }}>{modCost.toLocaleString()}</td>
                                    <td></td>
                                </tr>,
                                ...items.map(f => (
                                    <tr key={f.id}>
                                        <td style={{ paddingLeft: 24 }}>{f.name}</td>
                                        <td>{f.version}</td>
                                        <td>
                                            <input
                                                className="inline-edit"
                                                type="number"
                                                value={f.effort ?? ''}
                                                onChange={e => updateFeature(f.id, { effort: e.target.value === '' ? null : parseInt(e.target.value) })}
                                                style={{ width: 60 }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="inline-edit"
                                                type="number"
                                                value={f.monthlyCost || 0}
                                                onChange={e => updateFeature(f.id, { monthlyCost: parseInt(e.target.value) || 0 })}
                                                style={{ width: 80 }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="inline-edit"
                                                type="text"
                                                value={f.costNotes || ''}
                                                onChange={e => updateFeature(f.id, { costNotes: e.target.value })}
                                                style={{ width: '100%', textAlign: 'left' }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ];
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
