import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({ options, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggle = (val) => {
        const next = selected.includes(val)
            ? selected.filter(v => v !== val)
            : [...selected, val];
        onChange(next);
    };

    const hasFilter = selected.length > 0;

    return (
        <span className="filter-container" ref={ref}>
            <span
                className={`filter-icon${hasFilter ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            >
                &#9662;
            </span>
            {open && (
                <div className="filter-dropdown" onClick={e => e.stopPropagation()}>
                    {options.map(opt => (
                        <label key={opt} className="filter-option">
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggle(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </span>
    );
}
