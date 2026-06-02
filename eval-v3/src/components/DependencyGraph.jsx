import { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { useStore, MODULE_COLORS } from '../store';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;

function getLayoutedElements(nodes, edges) {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 });
    nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach(e => g.setEdge(e.source, e.target));
    dagre.layout(g);
    const layouted = nodes.map(n => {
        const pos = g.node(n.id);
        return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
    });
    return { nodes: layouted, edges };
}

export default function DependencyGraph() {
    const { features, dependencies, addDependency, removeDependency } = useStore();
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');

    const { initialNodes, initialEdges } = useMemo(() => {
        const nodeList = features.map(f => {
            const mc = MODULE_COLORS[f.module] || { bg: '#F3F4F6', text: '#374151' };
            return {
                id: String(f.id),
                data: { label: f.name.length > 12 ? f.name.slice(0, 12) + '...' : f.name },
                style: {
                    background: mc.bg,
                    color: mc.text,
                    border: `1px solid ${mc.text}40`,
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '6px 10px',
                    width: NODE_WIDTH,
                },
                position: { x: 0, y: 0 },
            };
        });
        const edgeList = dependencies.map((d, i) => ({
            id: `e-${d.from}-${d.to}`,
            source: String(d.from),
            target: String(d.to),
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            style: { stroke: '#9CA3AF' },
        }));
        const { nodes, edges } = getLayoutedElements(nodeList, edgeList);
        return { initialNodes: nodes, initialEdges: edges };
    }, [features, dependencies]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync when dependencies change
    useMemo(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges]);

    const handleAdd = () => {
        const f = parseInt(fromId), t = parseInt(toId);
        if (f && t && f !== t) {
            addDependency(f, t);
            setFromId('');
            setToId('');
        }
    };

    const handleRemove = (from, to) => {
        removeDependency(from, to);
    };

    return (
        <div>
            <div className="section-title">依赖关系图谱</div>
            <div className="dep-controls">
                <select value={fromId} onChange={e => setFromId(e.target.value)}>
                    <option value="">前置功能...</option>
                    {features.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <span style={{ color: '#9CA3AF' }}>--&gt;</span>
                <select value={toId} onChange={e => setToId(e.target.value)}>
                    <option value="">依赖功能...</option>
                    {features.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button className="btn btn-sm btn-primary" onClick={handleAdd}>添加依赖</button>
            </div>
            {dependencies.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {dependencies.map((d, i) => {
                        const from = features.find(f => f.id === d.from);
                        const to = features.find(f => f.id === d.to);
                        return (
                            <span key={i} className="tech-chip" style={{ cursor: 'pointer' }} onClick={() => handleRemove(d.from, d.to)}>
                                {from?.name?.slice(0, 8)} → {to?.name?.slice(0, 8)} ✕
                            </span>
                        );
                    })}
                </div>
            )}
            <div className="dep-graph-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    minZoom={0.3}
                    maxZoom={2}
                >
                    <Controls />
                    <Background gap={16} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
