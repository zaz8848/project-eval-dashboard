const fs = require('fs');
const path = 'src/components/PlanDesign.jsx';
let c = fs.readFileSync(path, 'utf8');

// PowerShell Set-Content converted backticks to spaces
// We need to find template literal patterns and restore backticks
// Pattern: some prop/var = space${...}...space  should be `${...}...`

// Known patterns to fix - replace specific corrupted patterns
const fixes = [
    // left: `${...}%`  -> space was eaten
    [/left: \$\{([^}]+)\}%/g, 'left: `${$1}%`'],
    [/width: \$\{([^}]+)\}%/g, 'width: `${$1}%`'],
    [/transform: translateX\(-50%\)/g, "transform: 'translateX(-50%)'"],

    // Actually let me just find ALL places where ` was lost
    // The pattern is: some string boundary followed by ${
];

// Better approach: scan for ${ not inside backtick-delimited strings
// and reconstruct. But this is complex.

// Simplest: just find and replace specific known corrupted lines
const replacements = {
    // tooltip formatter
    "{ formatter: (p) => `": "{ formatter: (p) => `",

    // Fix: the backtick issue is that PowerShell replaced ` with nothing/space
    // Let me find pairs and fix them
};

// Actually, the real issue is simpler: PowerShell's Set-Content stripped backticks
// because backtick is PowerShell's escape char. Let me find all broken template strings.

// Strategy: find lines with ${ that are NOT inside a proper template literal
let lines = c.split('\n');
let fixed = 0;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Pattern 1: property: space${expr}...endquote  (backtick was space)
    // e.g., left:  ${left}%  should be left: `${left}%`
    line = line.replace(/:\s+\$\{([^}]+)\}([^'"`,;}\s]*)/g, (match, expr, rest) => {
        // Check if this is already in a template literal
        if (match.includes('`')) return match;
        fixed++;
        return `: \`\${${expr}}${rest}\``;
    });

    // Pattern 2: = space${expr}  (assignment)
    line = line.replace(/=\s+\$\{([^}]+)\}/g, (match, expr) => {
        if (match.includes('`')) return match;
        // Don't fix JSX expressions
        if (match.includes('=>')) return match;
        return match; // skip for now, too risky
    });

    lines[i] = line;
}

console.log(`Fixed ${fixed} template literal issues`);

// Also fix specific known corrupted Chinese text
let result = lines.join('\n');
result = result.replace(/澶ー/g, '天`');
result = result.replace(/鏈坄/g, '月`');

fs.writeFileSync(path, result, 'utf8');
console.log('Done');
