import { SDLCPhase } from "./types";

export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "requirements-analysis",
    name: "Requirements Analysis",
    description:
      "Analyze the requirement document, extract functional and non-functional requirements, identify stakeholders, and define scope.",
    icon: "ClipboardList",
    prompt: `Write a professional Requirements Analysis document in Markdown for the exact product described by the user.

Your job is to extract and clarify requirements, not invent a larger product. If the source requirement is short, produce a complete but tightly scoped document by turning only directly implied behavior into requirements. Put uncertain details under Assumptions or Open Questions instead of making them functional requirements.

Include these sections:
- **Project Overview**: summarize only the requested product, target user, and purpose in 1-2 short paragraphs.
- **Requirement Interpretation**: state what is explicitly requested, what is directly implied, and what is not specified.
- **Functional Requirements**: use IDs like FR-001. For each item include requirement statement, user story, and acceptance criteria.
- **Non-Functional Requirements**: use IDs like NFR-001. Include only reasonable baseline qualities for this scope; label measurable targets as assumptions when not provided.
- **Scope**: separate in-scope and out-of-scope items. Put related but unrequested features out of scope.
- **User Stories**: use IDs like US-001 with actor, goal, and benefit.
- **Priority (MoSCoW)**: prioritize only listed requirements.
- **Assumptions**: list assumptions required to proceed because the input did not specify them.
- **Open Questions**: list decisions the user must confirm before design or implementation.
- **Risks and Dependencies**: include only risks/dependencies that follow from the actual scope.

Rules:
- Do not add features like authentication, dashboards, filters, comments, sharing, real third-party integrations, databases, cloud infrastructure, or analytics unless explicitly requested or unavoidable.
- Do not assume a real platform API integration from a brand name. If the user says "Facebook app", distinguish between "Facebook-like app" and "real Facebook API integration" as an Open Question unless explicit.
- Do not create requirements for "view liked posts", filtering, or social visibility unless the source asks for them.
- If "like a post" is requested, "unlike/toggle like" may be included only as directly implied behavior needed to prevent duplicate likes.
- Break broad explicit features into necessary user-visible requirements. For example, "buy and sell stocks" implies viewing available stocks, entering quantity, transaction validation, and portfolio/holding updates.
- Treat every explicitly requested feature as Must-Have unless the user gives a different priority. Supporting implied requirements may also be Must-Have when the explicit feature cannot work without them.
- Do not narrow a requested feature without evidence. For example, "stock graphs" means graphs for relevant stocks generally, not only stocks in the user's portfolio.
- Do not describe real-time data, live trading, brokerage execution, or real market accuracy as requirements unless explicitly requested. Put those items in Open Questions.
- Phrase risks carefully. If simulated data is assumed, warn that users may mistake simulated data for real market data rather than claiming the app causes poor investment decisions.
- Keep Markdown formatting clean. Do not create broken tables with multiline acceptance criteria. Prefer a compact table for ID/statement/priority and bullet lists under each requirement for acceptance criteria.
- Make the document professional, specific, and implementation-ready without scope creep.`,
  },
  {
    id: "system-design",
    name: "System Design",
    description:
      "Create high-level system design including system architecture, data flow diagrams, and component interactions.",
    icon: "Layout",
    prompt: `Write a detailed system design document in Markdown based on the approved requirements.

Include these sections:
- **Architecture**: choose an architecture pattern and justify it.
- **Component Breakdown**: name each component and describe its responsibility.
- **Data Flow**: explain how data moves through the system.
- **API Endpoints**: table with method, path, request, and purpose.
- **Data Model**: tables/collections, key fields, and relationships.
- **Error Handling**: how failures are surfaced and recovered from.
- **Security Considerations**: auth, validation, secrets, and exposure risks.
- **Operational Notes**: logging, monitoring, deployment assumptions, and scalability constraints.

Be concrete, implementation-oriented, and tied to the exact product requirements. Avoid generic architecture filler.`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `Write a detailed technical architecture document in Markdown.

Include these sections:
- **Stack**: frontend, backend, database, deployment, and tooling choices.
- **Project Structure**: folder tree with rationale for each major directory.
- **Environment Variables**: list required config values and their purpose.
- **Development Workflow**: local run steps, conventions, and handoff points.
- **Quality Tooling**: linting, formatting, testing, and CI/CD.
- **Scalability Notes**: how the architecture will support future growth.
- **Integration Contracts**: external APIs, auth providers, storage services, and failure behavior.

Use precise choices that fit the requested product. Explain why each choice is appropriate.`,
  },
  {
    id: "implementation-plan",
    name: "Implementation Plan",
    description:
      "Break down the project into sprints, tasks, and milestones with time estimates.",
    icon: "ListTodo",
    prompt: `Write a detailed implementation plan in Markdown.

Include these sections:
- **Delivery Approach**: summarize the build strategy and sequencing.
- **Sprints**: table with sprint, task, estimate, owner, dependency, and deliverable.
- **Milestones**: clear checkpoints with exit criteria.
- **Risks**: likely blockers and how to mitigate them.
- **Acceptance Criteria**: what must be true before release.
- **Definition of Done**: code, test, security, documentation, and deployment readiness.

Make the plan realistic, actionable, and detailed.`,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description:
      "Generate the actual application code based on all previous phases.",
    icon: "Code",
    prompt: `You are an expert frontend developer. Generate a COMPLETE, FULLY WORKING, SINGLE-FILE web application as one index.html file.

CRITICAL RULES — you MUST follow every one:

1. **Output EXACTLY ONE file** named index.html. All CSS and JavaScript MUST be inline (inside <style> and <script> tags). Do NOT reference any external files.

2. **The app MUST be fully functional.** All buttons, forms, inputs, navigation, and interactive elements MUST work. Wire up every event handler. Implement actual logic — not placeholders, not TODO comments, not "coming soon".

3. **Use stunning, modern UI design:**
   - Use a sophisticated color palette with gradients (e.g., linear-gradient with indigo/purple/blue tones)
   - Add smooth CSS transitions and subtle animations (hover effects, fade-ins, slide-ins)
   - Use CSS Grid and Flexbox for pixel-perfect responsive layouts
   - Include box-shadows, rounded corners (border-radius), and modern spacing
   - Use a clean sans-serif font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
   - Ensure mobile responsive design with @media queries
   - Add a polished header/nav bar with the app name
   - Include proper form styling with focus states and validation feedback
   - Use icon entities or simple SVG icons where appropriate

4. **Data persistence:** Use localStorage to save and load data so the app works across page refreshes.

5. **Structure your code cleanly:** Use well-named functions, clear variable names, and organized sections in the HTML.

6. **Output format — use EXACTLY this:**

### FILE: \`index.html\`
\`\`\`html
<!DOCTYPE html>
<html lang="en">
...complete working code here...
</html>
\`\`\`

Do NOT output multiple files. Do NOT add any explanation text before or after the code. Do NOT use markdown outside the file block. The ENTIRE application must be in this single index.html file.`,
  },
  {
    id: "testing-strategy",
    name: "Testing Strategy",
    description:
      "Define testing strategy, create test cases, and generate test code.",
    icon: "TestTube",
    prompt: `Write a detailed testing strategy in Markdown.

Include these sections:
- **Test Pyramid**: unit, integration, and end-to-end coverage.
- **Test Cases**: table with ID, feature, scenario, preconditions, steps, expected result, and priority.
- **Automation Approach**: how tests run locally and in CI.
- **Quality Gates**: coverage, linting, and build criteria.
- **Manual QA Checklist**: high-value human verification flows.
- **Test Code** per file:

### FILE: \`path/to/test\`
\`\`\`lang
test code
\`\`\`

Use realistic tests for the requested product and make them easy to run.`,
  },
  {
    id: "deployment-plan",
    name: "Deployment Plan",
    description:
      "Create deployment strategy, infrastructure setup, and go-live checklist.",
    icon: "Rocket",
    prompt: `Write a detailed deployment plan in Markdown.

Include these sections:
- **Strategy**: choose a deployment approach and justify it.
- **Environments**: local, staging, and production expectations.
- **CI/CD**: describe the pipeline and release flow.
- **Monitoring and Rollback**: observability, alerts, and recovery.
- **Go-Live Checklist**: concrete launch steps.
- **Rollback Plan**: exact steps to revert a broken release.
- **Environment Variables and Secrets**: production values required and where they are configured.

### FILE: \`Dockerfile\`
\`\`\`dockerfile
config
\`\`\`

Make it production-minded and specific.`,
  },
];
