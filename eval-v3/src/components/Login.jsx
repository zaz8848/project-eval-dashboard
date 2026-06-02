import { useState } from 'react';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                sessionStorage.setItem('aeon-auth', '1');
                onLogin();
            } else {
                setError('\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
            }
            setLoading(false);
        }, 400);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: '48px 40px', width: 380,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#4F46E5', letterSpacing: 2 }}>AEON</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{"\u9879\u76ee\u8bc4\u4f30\u770b\u677f"}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{"\u8d26\u53f7"}</label>
                        <input
                            value={username} onChange={e => setUsername(e.target.value)}
                            placeholder={"\u8bf7\u8f93\u5165\u8d26\u53f7"}
                            autoFocus
                            style={{
                                width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8,
                                fontSize: 14, outline: 'none', transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366F1'}
                            onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{"\u5bc6\u7801"}</label>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder={"\u8bf7\u8f93\u5165\u5bc6\u7801"}
                            style={{
                                width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8,
                                fontSize: 14, outline: 'none', transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366F1'}
                            onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                        />
                    </div>
                    {error && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '10px 0', background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
                        color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    }}>
                        {loading ? "\u767b\u5f55\u4e2d..." : "\u767b\u5f55"}
                    </button>
                </form>
            </div>
        </div>
    );
}
