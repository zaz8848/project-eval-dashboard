import ReactECharts from 'echarts-for-react';
import { useStore, MODULE_COLORS } from '../store';

const MODULE_SCATTER_COLORS = {
    '智能问数': '#EF4444',
    '营销助手': '#F59E0B',
    '营销策略': '#3B82F6',
    '基础后台': '#8B5CF6',
};

export default function ImpactMatrix() {
    const { features } = useStore();

    const seriesMap = {};
    features.forEach(f => {
        if (!seriesMap[f.module]) seriesMap[f.module] = [];
        seriesMap[f.module].push({
            value: [f.effort || 0, f.impact || 5],
            name: f.name,
            feature: f,
        });
    });

    const series = Object.entries(seriesMap).map(([module, data]) => ({
        name: module,
        type: 'scatter',
        data,
        symbolSize: 14,
        itemStyle: { color: MODULE_SCATTER_COLORS[module] || '#6366F1' },
        emphasis: { itemStyle: { borderColor: '#1F2937', borderWidth: 2 } },
    }));

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (p) => {
                const f = p.data.feature;
                return `<strong>${f.name}</strong><br/>模块: ${f.module}<br/>影响力: ${f.impact}<br/>工作量: ${f.effort || 0} 天<br/>优先级: ${f.priority}<br/>风险: ${f.risk}`;
            },
        },
        legend: {
            data: Object.keys(seriesMap),
            bottom: 0,
        },
        grid: { left: 60, right: 40, top: 40, bottom: 60 },
        xAxis: {
            name: '工作量 (人天)',
            nameLocation: 'center',
            nameGap: 30,
            min: 0,
        },
        yAxis: {
            name: '影响力',
            nameLocation: 'center',
            nameGap: 40,
            min: 0,
            max: 10,
        },
        graphic: [
            { type: 'text', left: '15%', top: '15%', style: { text: 'Quick Win', fill: '#22C55E', fontSize: 14, fontWeight: 600, opacity: 0.4 } },
            { type: 'text', right: '15%', top: '15%', style: { text: '战略项目', fill: '#3B82F6', fontSize: 14, fontWeight: 600, opacity: 0.4 } },
            { type: 'text', left: '15%', bottom: '25%', style: { text: '顺手做', fill: '#9CA3AF', fontSize: 14, fontWeight: 600, opacity: 0.4 } },
            { type: 'text', right: '15%', bottom: '25%', style: { text: '谨慎投入', fill: '#F59E0B', fontSize: 14, fontWeight: 600, opacity: 0.4 } },
        ],
        series,
    };

    return (
        <div>
            <div className="section-title">影响力 x 工作量 矩阵</div>
            <div className="chart-container">
                <ReactECharts option={option} style={{ height: 500 }} />
            </div>
        </div>
    );
}
