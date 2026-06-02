export default function Tag({ children, bg, color }) {
    return (
        <span className="tag" style={{ background: bg || '#F3F4F6', color: color || '#6B7280' }}>
            {children}
        </span>
    );
}
