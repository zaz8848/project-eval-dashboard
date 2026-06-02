import { useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import FeatureList from './components/FeatureList';
import ImpactMatrix from './components/ImpactMatrix';
import DependencyGraph from './components/DependencyGraph';
import CostView from './components/CostView';
import PlanDesign from './components/PlanDesign';
import PresentationMode from './components/PresentationMode';
import Login from './components/Login';
import { useStore } from './store';
import './App.css';

const TABS = [
    { key: 'dashboard', label: '仪表盘' },
    { key: 'features', label: '功能清单' },
    { key: 'matrix', label: '影响力矩阵' },
    { key: 'deps', label: '依赖图谱' },
    { key: 'cost', label: '成本视图' },
    { key: 'plan', label: '方案设计' },
];

export default function App() {
    const [tab, setTab] = useState('dashboard');
    const [showPresentation, setShowPresentation] = useState(false);
    const [authed, setAuthed] = useState(() => sessionStorage.getItem('aeon-auth') === '1');
    const { exportState, importState } = useStore();

    if (!authed) return <Login onLogin={() => setAuthed(true)} />;

    return (
        <div className="app-root">
            <NavBar tabs={TABS} active={tab} onTabChange={setTab} onPresent={() => setShowPresentation(true)} onExport={exportState} onImport={importState} />
            <main className="app-main">
                {tab === 'dashboard' && <Dashboard />}
                {tab === 'features' && <FeatureList />}
                {tab === 'matrix' && <ImpactMatrix />}
                {tab === 'deps' && <DependencyGraph />}
                {tab === 'cost' && <CostView />}
                {tab === 'plan' && <PlanDesign />}
            </main>
            {showPresentation && <PresentationMode onClose={() => setShowPresentation(false)} />}
        </div>
    );
}
