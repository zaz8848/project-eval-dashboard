import { useState, useMemo } from 'react';
import { useStore } from '../store';
import FeatureRow from './FeatureRow';
import FilterDropdown from './common/FilterDropdown';

const COLUMNS = [
    { key: 'name', label: '名称', filterable: false },
    { key: 'module', label: '模块', filterable: true },
    { key: 'priority', label: '优先级', filterable: true },
    { key: 'version', label: '版本', filterable: true },
    { key: 'risk', label: '风险', filterable: true },
    { key: 'impact', label: '影响力', filterable: false },
    { key: 'effort', label: '工作量(天)', filterable: false },
    { key: 'deadline', label: '截止日期', filterable: false },
    { key: 'urgency', label: '紧急度', filterable: false },
    { key: 'status', label: '状态', filterable: true },
    { key: 'techs', label: '技术栈', filterable: false },
];

function getUniqueValues(features, key) {
    const vals = new Set();
    features.forEach(f => { if (f[key] != null) vals.add(String(f[key])); });
    return [...vals].sort();
}

function compareFn(a, b, key, dir) {
    let va = a[key], vb = b[key];
    if (va == null) va = '';
    if (vb == null) vb = '';
    if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
    }
    va = String(va); vb = String(vb);
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
}

export default function FeatureList() {
    const { features, addFeature } = useStore();
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [filters, setFilters] = useState({});

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const setFilter = (key, values) => {
        setFilters(prev => ({ ...prev, [key]: values }));
    };

    const clearAllFilters = () => setFilters({});

    const hasFilters = Object.values(filters).some(v => v && v.length > 0);

    const filtered = useMemo(() => {
        let list = [...features];
        Object.entries(filters).forEach(([key, vals]) => {
            if (vals && vals.length > 0) {
                list = list.filter(f => vals.includes(String(f[key])));
            }
        });
        if (sortKey) {
            list.sort((a, b) => compareFn(a, b, sortKey, sortDir));
        }
        return list;
    }, [features, filters, sortKey, sortDir]);

    return (
        <div>
            <div className="clear-filters-bar">
                <div className="section-title">功能清单 ({filtered.length}/{features.length})</div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {hasFilters && (
                        <button className="btn btn-sm" onClick={clearAllFilters}>清除所有筛选</button>
                    )}
                </div>
            </div>
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {COLUMNS.map(col => (
                                <th key={col.key} onClick={() => handleSort(col.key)}>
                                    {col.label}
                                    {sortKey === col.key && <span className="sort-arrow">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>}
                                    {col.filterable && (
                                        <FilterDropdown
                                            options={getUniqueValues(features, col.key)}
                                            selected={filters[col.key] || []}
                                            onChange={(vals) => setFilter(col.key, vals)}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(f => (
                            <FeatureRow key={f.id} feature={f} />
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={addFeature}>+ 添加功能</button>
            </div>
        </div>
    );
}
