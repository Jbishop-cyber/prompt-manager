/* ============================================
   AI Prompt Manager — Prompt Analyzer
   ============================================
   Real-time heuristic scoring for prompt quality.
   Scores 5 dimensions: Specificity, Role, Format,
   Constraints, and Examples.
   ============================================ */

const CRITERIA = [
    {
        id: 'role',
        label: 'Role Assignment',
        icon: '🎭',
        color: '#a78bfa',
        check(text) {
            const lower = text.toLowerCase();
            const patterns = [
                /you are (a|an)\s/i,
                /act as (a|an)?\s/i,
                /role:/i,
                /persona:/i,
                /imagine you('re| are)\s/i,
                /as (a|an) .*(expert|specialist|consultant|analyst|engineer|writer|editor|manager|assistant|advisor)/i,
                /pretend (you're|you are)/i,
            ];
            const found = patterns.filter(p => p.test(text)).length;
            if (found >= 2) return { score: 100, feedback: 'Strong role assigned' };
            if (found === 1) return { score: 70, feedback: 'Role detected — add more persona detail' };
            // Check if there's at least a "you" addressing
            if (/\byou\b/i.test(lower)) return { score: 30, feedback: 'Addresses "you" but no explicit role' };
            return { score: 0, feedback: 'Add a role: "You are a [expert] in [domain]"' };
        },
    },
    {
        id: 'specificity',
        label: 'Specificity',
        icon: '🎯',
        color: '#6c63ff',
        check(text) {
            let score = 0;
            const lower = text.toLowerCase();
            const wordCount = text.trim().split(/\s+/).length;

            // Length bonus
            if (wordCount > 100) score += 25;
            else if (wordCount > 50) score += 15;
            else if (wordCount > 20) score += 8;

            // Specific numbers/quantities
            if (/\b\d+\s*(word|sentence|paragraph|point|item|step|minute|section|example)/i.test(text)) score += 20;

            // Named entities / domain terms (uppercase words that aren't sentence starters)
            const domainTerms = text.match(/(?<=[.!?\n]\s*)\b[a-z].*?\b[A-Z][a-z]+/g);
            if (domainTerms && domainTerms.length > 0) score += 10;

            // Placeholder variables like {topic}
            if (/\{[^}]+\}/.test(text) || /\[.+?\]/.test(text)) score += 15;

            // Target audience
            if (/target(ing|ed)?\s*(audience|reader|user|customer)/i.test(lower) || /for\s+(beginner|expert|developer|manager|student)/i.test(lower)) score += 15;

            // Tone/style specification
            if (/tone:|style:|voice:|manner:|approach:/i.test(lower) || /\b(professional|casual|formal|friendly|technical|concise|detailed|conversational)\b/i.test(lower)) score += 15;

            score = Math.min(100, score);
            if (score >= 70) return { score, feedback: 'Good specificity — prompt is detailed' };
            if (score >= 40) return { score, feedback: 'Add more specific details — quantities, audience, examples' };
            return { score, feedback: 'Too vague — specify what, who, how, and how much' };
        },
    },
    {
        id: 'format',
        label: 'Output Format',
        icon: '📊',
        color: '#38bdf8',
        check(text) {
            let score = 0;
            const lower = text.toLowerCase();

            // Explicit format instructions
            if (/format|structure|organize|layout|present/i.test(lower)) score += 20;

            // Bullet/numbered list mentions
            if (/bullet|numbered|list|point/i.test(lower) || /^\s*[-•*]\s/m.test(text) || /^\s*\d+[.)]\s/m.test(text)) score += 20;

            // Markdown mentions
            if (/markdown|heading|header|bold|italic|code block|table/i.test(lower)) score += 20;

            // Section/structure references
            if (/section|part|chapter|step|phase/i.test(lower)) score += 15;

            // JSON/XML/specific format
            if (/\bjson\b|\bxml\b|\bcsv\b|\byaml\b|\bhtml\b/i.test(lower)) score += 25;

            // Pattern: "Format your response as..."
            if (/format (your|the) (response|output|answer)/i.test(lower)) score += 20;

            score = Math.min(100, score);
            if (score >= 60) return { score, feedback: 'Output format is well defined' };
            if (score >= 30) return { score, feedback: 'Format partially specified — be more explicit' };
            return { score, feedback: 'Define how to structure the output (list, JSON, sections)' };
        },
    },
    {
        id: 'constraints',
        label: 'Constraints',
        icon: '🚧',
        color: '#fbbf24',
        check(text) {
            let score = 0;
            const lower = text.toLowerCase();

            // Word/length limits
            if (/\b(under|within|maximum|max|limit|no more than|at most|at least|minimum)\s*\d/i.test(lower)) score += 25;
            if (/\b\d+\s*(word|character|sentence|paragraph|page|token)/i.test(lower)) score += 20;

            // Avoid/don't/exclude
            if (/\b(avoid|don'?t|do not|never|exclude|refrain|without|skip)\b/i.test(lower)) score += 20;

            // Must/should/always
            if (/\b(must|should|always|ensure|make sure|require|important|necessary)\b/i.test(lower)) score += 15;

            // Rules keyword
            if (/\b(rules?|constraints?|guidelines?|requirements?|criteria|boundaries|limitations?)\b:/i.test(lower)) score += 20;

            score = Math.min(100, score);
            if (score >= 60) return { score, feedback: 'Good constraints set — boundaries are clear' };
            if (score >= 30) return { score, feedback: 'Some constraints found — add word limits or exclusions' };
            return { score, feedback: 'Add constraints: word limits, what to avoid, must-haves' };
        },
    },
    {
        id: 'examples',
        label: 'Examples',
        icon: '💡',
        color: '#34d399',
        check(text) {
            let score = 0;
            const lower = text.toLowerCase();

            // Explicit example keywords
            if (/\b(example|sample|instance|illustration|demonstration)\b/i.test(lower)) score += 30;

            // Example blocks (quotes, triple backticks, indented)
            if (/"""[\s\S]*?"""|```[\s\S]*?```|'''/m.test(text)) score += 40;

            // "For example" / "e.g." / "such as"
            if (/for example|e\.g\.|such as|like this|here'?s (a|an|one)/i.test(lower)) score += 25;

            // Input/Output patterns
            if (/\b(input|output|expected|desired|result|sample)\s*:/i.test(lower)) score += 25;

            score = Math.min(100, score);
            if (score >= 60) return { score, feedback: 'Examples included — great for guiding the model' };
            if (score >= 25) return { score, feedback: 'Some example patterns found — add concrete samples' };
            return { score, feedback: 'Add 1-2 examples of the desired output' };
        },
    },
];

/**
 * Analyze a prompt and return scores for each dimension.
 * @param {string} text - The prompt content
 * @returns {{ overall: number, criteria: Array<{id, label, icon, color, score, feedback}> }}
 */
export function analyzePrompt(text) {
    if (!text || !text.trim()) {
        return {
            overall: 0,
            grade: 'N/A',
            criteria: CRITERIA.map(c => ({
                id: c.id,
                label: c.label,
                icon: c.icon,
                color: c.color,
                score: 0,
                feedback: c.check('').feedback,
            })),
        };
    }

    const results = CRITERIA.map(c => {
        const result = c.check(text);
        return {
            id: c.id,
            label: c.label,
            icon: c.icon,
            color: c.color,
            score: result.score,
            feedback: result.feedback,
        };
    });

    const overall = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    let grade;
    if (overall >= 80) grade = 'A';
    else if (overall >= 60) grade = 'B';
    else if (overall >= 40) grade = 'C';
    else if (overall >= 20) grade = 'D';
    else grade = 'F';

    return { overall, grade, criteria: results };
}

/**
 * Render the analyzer panel HTML
 * @param {{ overall, grade, criteria }} analysis
 * @returns {string} HTML string
 */
export function renderAnalyzerHTML(analysis) {
    const gradeColor = getGradeColor(analysis.grade);

    return `
    <div class="refinement-section analyzer-section animate-slide-right">
      <div class="refinement-section-title">📈 Prompt Score</div>

      <div class="analyzer-overall">
        <div class="analyzer-ring" style="--progress:${analysis.overall};--ring-color:${gradeColor}">
          <div class="analyzer-ring-inner">
            <span class="analyzer-grade">${analysis.grade}</span>
            <span class="analyzer-percent">${analysis.overall}%</span>
          </div>
        </div>
      </div>

      <div class="analyzer-criteria">
        ${analysis.criteria.map(c => `
          <div class="analyzer-criterion">
            <div class="analyzer-criterion-header">
              <span>${c.icon} ${c.label}</span>
              <span class="analyzer-criterion-score" style="color:${c.color}">${c.score}%</span>
            </div>
            <div class="analyzer-bar-track">
              <div class="analyzer-bar-fill" style="width:${c.score}%;background:${c.color}"></div>
            </div>
            <div class="analyzer-criterion-feedback">${c.feedback}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getGradeColor(grade) {
    switch (grade) {
        case 'A': return '#34d399';
        case 'B': return '#38bdf8';
        case 'C': return '#fbbf24';
        case 'D': return '#f97316';
        case 'F': return '#f87171';
        default: return '#6b7394';
    }
}
