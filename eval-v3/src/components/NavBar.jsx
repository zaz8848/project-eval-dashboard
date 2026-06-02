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
                <button className="navbar-action-btn" onClick={onImport} title="导入数据">
                    {"⬆ 导入"}
                </button>
                <button className="navbar-action-btn" onClick={onExport} title="导出数据">
                    {"⬇ 导出"}
                </button>
                <button className="navbar-present" onClick={onPresent}>
                    {"汇报模式"}
                </button>
            </div>
        </nav>
    );
}
