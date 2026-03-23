/* ============================================
   AI Prompt Manager — Prompt Templates Data
   ============================================ */

const TEMPLATES = [
    // --- Coding ---
    {
        id: 'tpl-code-review',
        title: 'Code Review Assistant',
        description: 'Get a thorough code review with actionable feedback on quality, security, and performance.',
        category: 'Coding',
        icon: '🔍',
        color: '#4cc9f0',
        content: `You are a senior software engineer performing a code review. Analyze the following code and provide feedback on:

1. **Code Quality**: Readability, naming conventions, and structure
2. **Bugs & Edge Cases**: Potential issues or unhandled scenarios
3. **Performance**: Any inefficiencies or optimization opportunities
4. **Security**: Vulnerabilities or unsafe patterns
5. **Best Practices**: Suggestions aligned with industry standards

Format your response with clear sections and code examples where applicable.

Code to review:
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\``,
        tags: ['coding', 'review', 'quality']
    },
    {
        id: 'tpl-code-explain',
        title: 'Code Explainer',
        description: 'Break down complex code into simple, understandable explanations.',
        category: 'Coding',
        icon: '📖',
        color: '#4cc9f0',
        content: `Explain the following code in detail. Break it down line by line (or section by section) as if you were teaching a junior developer.

Include:
- What the overall code does (high-level summary)
- A step-by-step walkthrough of the logic
- Any important patterns or concepts being used
- Potential gotchas or tricky parts

Code:
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\``,
        tags: ['coding', 'learning', 'explanation']
    },
    {
        id: 'tpl-code-convert',
        title: 'Language Converter',
        description: 'Convert code from one programming language to another while preserving logic.',
        category: 'Coding',
        icon: '🔄',
        color: '#4cc9f0',
        content: `Convert the following code from [SOURCE LANGUAGE] to [TARGET LANGUAGE].

Requirements:
- Preserve the original logic and behavior exactly
- Use idiomatic patterns and conventions of the target language
- Include equivalent error handling
- Add brief comments explaining any non-obvious translations

Source code ([SOURCE LANGUAGE]):
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\``,
        tags: ['coding', 'conversion', 'translation']
    },
    {
        id: 'tpl-code-debug',
        title: 'Bug Detective',
        description: 'Identify and fix bugs in your code with clear explanations.',
        category: 'Coding',
        icon: '🐛',
        color: '#4cc9f0',
        content: `I have a bug in my code. Help me find and fix it.

**Language/Framework:** [e.g., Python, React, etc.]

**What should happen:**
[Describe the expected behavior]

**What actually happens:**
[Describe the actual behavior / error message]

**Code:**
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\`

Please:
1. Identify the root cause of the bug
2. Explain why it's happening
3. Provide the corrected code
4. Suggest how to prevent similar bugs in the future`,
        tags: ['coding', 'debugging', 'fix']
    },

    // --- Writing ---
    {
        id: 'tpl-write-blog',
        title: 'Blog Post Writer',
        description: 'Generate engaging, well-structured blog posts on any topic.',
        category: 'Writing',
        icon: '✍️',
        color: '#ff4d6d',
        content: `Write a comprehensive blog post about [TOPIC].

**Target audience:** [e.g., beginners, professionals, general public]
**Tone:** [e.g., conversational, professional, witty]
**Word count:** approximately [NUMBER] words

Structure:
1. A compelling headline that drives clicks
2. An engaging introduction with a hook
3. 3-5 main sections with subheadings
4. Practical examples or actionable tips in each section
5. A conclusion with a clear call-to-action

Include relevant statistics or data points where appropriate. Make it scannable with bullet points and short paragraphs.`,
        tags: ['writing', 'blog', 'content']
    },
    {
        id: 'tpl-write-email',
        title: 'Professional Email',
        description: 'Craft clear, professional emails for any business situation.',
        category: 'Writing',
        icon: '📧',
        color: '#ff4d6d',
        content: `Write a professional email for the following situation:

**Purpose:** [e.g., follow-up, request, introduction, proposal]
**Recipient:** [e.g., client, manager, team member]
**Tone:** [e.g., formal, friendly-professional, urgent]
**Key points to include:**
- [Point 1]
- [Point 2]
- [Point 3]

Requirements:
- Clear, concise subject line
- Professional greeting
- Well-structured body (no more than 3 short paragraphs)
- Specific call-to-action
- Appropriate sign-off`,
        tags: ['writing', 'email', 'business']
    },
    {
        id: 'tpl-write-summary',
        title: 'Content Summarizer',
        description: 'Condense long content into clear, actionable summaries.',
        category: 'Writing',
        icon: '📝',
        color: '#ff4d6d',
        content: `Summarize the following content concisely.

**Format:** [bullet points / executive summary / TL;DR / detailed outline]
**Length:** [1 paragraph / 5 bullet points / 200 words]
**Focus on:** [key findings / action items / main arguments / decisions needed]

Content to summarize:
"""
[PASTE YOUR CONTENT HERE]
"""

Include the most important takeaways and any action items or decisions that need to be made.`,
        tags: ['writing', 'summary', 'productivity']
    },

    // --- Analysis ---
    {
        id: 'tpl-analyze-data',
        title: 'Data Analyst',
        description: 'Get structured analysis and insights from your data.',
        category: 'Analysis',
        icon: '📊',
        color: '#118ab2',
        content: `Analyze the following data and provide insights:

**Data:**
\`\`\`
[PASTE YOUR DATA HERE - CSV, JSON, or table format]
\`\`\`

Please provide:
1. **Overview**: Key statistics and general observations
2. **Trends**: Notable patterns or trends in the data
3. **Outliers**: Any unusual or unexpected values
4. **Insights**: Actionable conclusions drawn from the analysis
5. **Recommendations**: Suggested next steps based on findings

Present the analysis in a clear, structured format with specific numbers and percentages where relevant.`,
        tags: ['analysis', 'data', 'insights']
    },
    {
        id: 'tpl-analyze-compare',
        title: 'Comparison Matrix',
        description: 'Create detailed comparisons between options, tools, or approaches.',
        category: 'Analysis',
        icon: '⚖️',
        color: '#118ab2',
        content: `Create a detailed comparison between the following options:

**Options to compare:** [Option A] vs [Option B] (vs [Option C])
**Context/Use case:** [What this comparison is for]

Compare them across these dimensions:
- Features and capabilities
- Pricing / Cost
- Ease of use / Learning curve
- Performance / Scalability
- Community / Support
- Pros and Cons of each

Present the comparison as:
1. A summary table for quick reference
2. Detailed analysis for each dimension
3. A clear recommendation based on the stated use case`,
        tags: ['analysis', 'comparison', 'decision']
    },
    {
        id: 'tpl-analyze-swot',
        title: 'SWOT Analysis',
        description: 'Generate a comprehensive SWOT analysis for any business or project.',
        category: 'Analysis',
        icon: '🎯',
        color: '#118ab2',
        content: `Perform a SWOT analysis for: [SUBJECT - company, product, project, idea]

**Context:** [Brief background information]
**Industry/Market:** [Relevant industry or market]

Provide a thorough analysis of:

**Strengths** (Internal positive factors)
- What advantages does it have?
- What does it do well?

**Weaknesses** (Internal negative factors)
- What could be improved?
- What are the limitations?

**Opportunities** (External positive factors)
- What trends could be leveraged?
- What gaps in the market exist?

**Threats** (External negative factors)
- What obstacles exist?
- What are competitors doing?

Conclude with strategic recommendations based on the analysis.`,
        tags: ['analysis', 'business', 'strategy']
    },

    // --- Creative ---
    {
        id: 'tpl-creative-story',
        title: 'Story Generator',
        description: 'Create compelling short stories with rich characters and plot.',
        category: 'Creative',
        icon: '📚',
        color: '#ffd166',
        content: `Write a short story with the following parameters:

**Genre:** [e.g., sci-fi, mystery, romance, horror, fantasy]
**Setting:** [e.g., futuristic city, medieval kingdom, modern office]
**Main character:** [Brief description]
**Theme:** [e.g., redemption, discovery, loss, triumph]
**Tone:** [e.g., dark, humorous, suspenseful, heartwarming]
**Length:** approximately [NUMBER] words

Requirements:
- A strong opening hook that grabs attention
- Well-developed characters with clear motivations
- Rising tension and a satisfying climax
- Vivid descriptions that show rather than tell
- A memorable ending (twist optional)`,
        tags: ['creative', 'story', 'fiction']
    },
    {
        id: 'tpl-creative-brainstorm',
        title: 'Idea Brainstormer',
        description: 'Generate creative ideas and innovative solutions for any challenge.',
        category: 'Creative',
        icon: '💡',
        color: '#ffd166',
        content: `Help me brainstorm ideas for: [TOPIC/CHALLENGE]

**Context:** [Any relevant background]
**Constraints:** [Budget, time, resources, etc.]
**Target audience:** [Who is this for?]

Generate ideas across these categories:
1. **Safe bets** — Proven approaches that are likely to work
2. **Creative twists** — Unique angles on existing ideas
3. **Moonshots** — Bold, ambitious ideas that could be game-changers
4. **Quick wins** — Ideas that can be implemented immediately

For each idea, provide:
- A catchy name/title
- A 2-3 sentence description
- Why it could work
- First step to get started`,
        tags: ['creative', 'brainstorm', 'innovation']
    },

    // --- Business ---
    {
        id: 'tpl-biz-pitch',
        title: 'Elevator Pitch',
        description: 'Craft a compelling pitch for your product, service, or idea.',
        category: 'Business',
        icon: '🚀',
        color: '#06d6a0',
        content: `Create a compelling elevator pitch for:

**Product/Service/Idea:** [Name and brief description]
**Target audience:** [Who are you pitching to?]
**Problem it solves:** [The pain point]
**Key differentiator:** [What makes it unique]

Generate three versions:
1. **30-second pitch** — The essential hook
2. **60-second pitch** — More detail with a story element
3. **2-minute pitch** — Full pitch with problem, solution, market, and ask

Each version should:
- Start with a compelling hook or question
- Clearly articulate the value proposition
- Include a specific call-to-action
- Be conversational, not corporate-speak`,
        tags: ['business', 'pitch', 'startup']
    },
    {
        id: 'tpl-biz-strategy',
        title: 'Strategy Document',
        description: 'Create structured strategy documents for projects or initiatives.',
        category: 'Business',
        icon: '📋',
        color: '#06d6a0',
        content: `Create a strategy document for: [PROJECT/INITIATIVE]

**Objective:** [What are we trying to achieve?]
**Timeline:** [Expected duration]
**Resources:** [Available budget, team, tools]

Include these sections:
1. **Executive Summary** — One-paragraph overview
2. **Current State** — Where we are now
3. **Goals & KPIs** — Specific, measurable targets
4. **Strategy** — The approach and key initiatives
5. **Action Plan** — Phased implementation with milestones
6. **Risks & Mitigation** — Potential challenges and solutions
7. **Success Metrics** — How we'll measure progress

Keep it concise and actionable. Use bullet points and tables where appropriate.`,
        tags: ['business', 'strategy', 'planning']
    },
    {
        id: 'tpl-biz-meeting',
        title: 'Meeting Agenda & Notes',
        description: 'Structure productive meetings with clear agendas and action items.',
        category: 'Business',
        icon: '📅',
        color: '#06d6a0',
        content: `Create a meeting agenda for: [MEETING TOPIC]

**Meeting type:** [e.g., standup, brainstorm, review, planning]
**Duration:** [e.g., 30 min, 1 hour]
**Attendees:** [Roles/names]
**Goal:** [What should be decided or accomplished by the end]

Generate:
1. **Pre-meeting prep** — What attendees should review beforehand
2. **Timed agenda** — Each item with allocated minutes
3. **Discussion prompts** — Key questions for each agenda item
4. **Action items template** — Format for capturing decisions and next steps
5. **Follow-up template** — Email summary format for after the meeting`,
        tags: ['business', 'meetings', 'productivity']
    }
];

export const TEMPLATE_CATEGORIES = [
    { id: 'all', name: 'All Templates', icon: '📦', color: '#6c63ff' },
    { id: 'Coding', name: 'Coding', icon: '💻', color: '#4cc9f0' },
    { id: 'Writing', name: 'Writing', icon: '✍️', color: '#ff4d6d' },
    { id: 'Analysis', name: 'Analysis', icon: '📊', color: '#118ab2' },
    { id: 'Creative', name: 'Creative', icon: '💡', color: '#ffd166' },
    { id: 'Business', name: 'Business', icon: '💼', color: '#06d6a0' },
];

export default TEMPLATES;
