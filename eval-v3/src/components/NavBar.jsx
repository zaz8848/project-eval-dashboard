export default function NavBar({ tabs, active, onTabChange, onPresent, onExport, onImport }) {
    return (
        <nav className="navbar">
            <div className="navbar-logo">AEON</div>
            <div className="navbar-tabs">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        className={"navbar-tab" + (active === t.key ? ' active' : '')}
                        onClick={() => onTabChange(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="navbar-actions">
                <button className="navbar-action-btn" onClick={onImport} title="\u5bfc\u5165\u6570\u636e">
                    \u2b06 \u5bfc\u5165
                </button>
                <button className="navbar-action-btn" onClick={onExport} title="\u5bfc\u51fa\u6570\u636e">
                    \u2b07 \u5bfc\u51fa
                </button>
                <button className="navbar-present" onClick={onPresent}>
                    \u6c47\u62a5\u6a21\u5f0f
                </button>
            </div>
        </nav>
    );
}
