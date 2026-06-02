const CHIP_COLORS = [
    { bg: '#EEF2FF', color: '#4F46E5' },
    { bg: '#FEF3C7', color: '#D97706' },
    { bg: '#DCFCE7', color: '#16A34A' },
    { bg: '#FEE2E2', color: '#DC2626' },
    { bg: '#E0E7FF', color: '#4338CA' },
];

export default function TechChips({ techs, max = 3 }) {
    if (!techs || techs.length === 0) return null;
    const shown = techs.slice(0, max);
    const extra = techs.length - max;
    return (
        <div className="tech-chips">
            {shown.map((t, i) => (
                <span key={i} className="tech-chip" style={CHIP_COLORS[i % CHIP_COLORS.length]}>
                    {t.name}
                </span>
            ))}
            {extra > 0 && <span className="tech-chip" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>+{extra}</span>}
        </div>
    );
}
