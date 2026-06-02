import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { DATA, PLANS } from './data';

const STORAGE_KEY = 'aeon-eval-v3';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved data with defaults to handle new fields
      const features = DATA.map(d => {
        const saved = parsed.features?.find(f => f.id === d.id);
        return saved ? { ...d, ...saved } : { ...d };
      });
      // Include any features added by user that aren't in defaults
      const defaultIds = new Set(DATA.map(d => d.id));
      const userAdded = (parsed.features || []).filter(f => !defaultIds.has(f.id));
      return {
        features: [...features, ...userAdded],
        plans: parsed.plans || PLANS.map(p => ({ ...p })),
        dependencies: parsed.dependencies || buildDeps(features),
      };
    }
  } catch (e) { /* ignore */ }
  const features = DATA.map(d => ({ ...d }));
  return {
    features,
    plans: PLANS.map(p => ({ ...p })),
    dependencies: buildDeps(features),
  };
}

function buildDeps(features) {
  const deps = [];
  features.forEach(f => {
    (f.dependencies || []).forEach(depId => {
      deps.push({ from: depId, to: f.id });
    });
  });
  return deps;
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FEATURE': {
      const features = state.features.map(f =>
        f.id === action.id ? { ...f, ...action.changes } : f
      );
      return { ...state, features };
    }
    case 'ADD_FEATURE': {
      const maxId = Math.max(0, ...state.features.map(f => f.id));
      const newFeature = {
        id: maxId + 1, name: '新功能', module: '智能问数', priority: 'P2', version: 'V1.0',
        risk: 'low', effort: null, status: '待评估', deadline: null,
        desc: '', techAnalysis: '', techs: [], risks: [], diagram: '', note: '',
        impact: 5, dependencies: [], monthlyCost: 0, costNotes: '', decisionLog: '',
      };
      return { ...state, features: [...state.features, newFeature] };
    }
    case 'ADD_DEPENDENCY': {
      const exists = state.dependencies.some(d => d.from === action.from && d.to === action.to);
      if (exists || action.from === action.to) return state;
      const deps = [...state.dependencies, { from: action.from, to: action.to }];
      const features = state.features.map(f => {
        if (f.id === action.to) {
          const newDeps = [...new Set([...(f.dependencies || []), action.from])];
          return { ...f, dependencies: newDeps };
        }
        return f;
      });
      return { ...state, dependencies: deps, features };
    }
    case 'REMOVE_DEPENDENCY': {
      const deps = state.dependencies.filter(d => !(d.from === action.from && d.to === action.to));
      const features = state.features.map(f => {
        if (f.id === action.to) {
          return { ...f, dependencies: (f.dependencies || []).filter(id => id !== action.from) };
        }
        return f;
      });
      return { ...state, dependencies: deps, features };
    }
    case 'UPDATE_PLAN': {
      const plans = state.plans.map(p =>
        p.id === action.id ? { ...p, ...action.changes } : p
      );
      return { ...state, plans };
    }
    case 'ADD_PLAN': {
      const newPlan = {
        id: `plan-${Date.now()}`, name: '新方案', tag: null,
        summary: '', strategy: '', coreFeatures: [],
        phases: [{ name: '第一阶段', items: [], focus: '', acceptance: '' }],
        pros: [], cons: [], ganttTasks: [],
      };
      return { ...state, plans: [...state.plans, newPlan] };
    }
    case 'IMPORT_STATE': {
      return action.state;
    }
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateFeature = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_FEATURE', id, changes });
  }, []);

  const addFeature = useCallback(() => {
    dispatch({ type: 'ADD_FEATURE' });
  }, []);

  const addDependency = useCallback((from, to) => {
    dispatch({ type: 'ADD_DEPENDENCY', from, to });
  }, []);

  const removeDependency = useCallback((from, to) => {
    dispatch({ type: 'REMOVE_DEPENDENCY', from, to });
  }, []);

  const updatePlan = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_PLAN', id, changes });
  }, []);

  const addPlan = useCallback(() => {
    dispatch({ type: 'ADD_PLAN' });
  }, []);

  const exportState = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeon-eval-data-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importState = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.features && parsed.plans) {
            dispatch({ type: 'IMPORT_STATE', state: parsed });
          } else {
            alert('JSON \u6587\u4ef6\u683c\u5f0f\u4e0d\u6b63\u786e\uff0c\u7f3a\u5c11 features \u6216 plans');
          }
        } catch {
          alert('\u65e0\u6cd5\u89e3\u6790 JSON \u6587\u4ef6');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <StoreContext.Provider value={{
      ...state, updateFeature, addFeature, addDependency, removeDependency, updatePlan, addPlan, exportState, importState
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export const MODULE_COLORS = {
  '智能问数': { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  '营销助手': { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  '营销策略': { bg: '#DBEAFE', text: '#2563EB', dot: '#3B82F6' },
  '基础后台': { bg: '#EDE9FE', text: '#7C3AED', dot: '#8B5CF6' },
};

export const PRIORITY_COLORS = {
  P0: '#DC2626', P1: '#F59E0B', P2: '#6B7280',
};

export const RISK_COLORS = {
  high: '#DC2626', medium: '#F59E0B', low: '#22C55E',
};

export function computeUrgency(deadline) {
  if (!deadline) return null;
  const [y, m] = deadline.split('-').map(Number);
  const now = new Date();
  const diffMonths = (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1));
  if (diffMonths < 0) return { label: '已过期', color: '#DC2626', months: diffMonths };
  if (diffMonths < 1) return { label: '紧急', color: '#DC2626', months: diffMonths };
  if (diffMonths < 2) return { label: '预警', color: '#F59E0B', months: diffMonths };
  return { label: '正常', color: '#22C55E', months: diffMonths };
}
