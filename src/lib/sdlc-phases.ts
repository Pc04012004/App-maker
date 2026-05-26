import { SDLCPhase } from "./types";

export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "requirements-analysis",
    name: "Requirements Analysis",
    description:
      "Analyze the requirement document, extract functional and non-functional requirements, identify stakeholders, and define scope.",
    icon: "ClipboardList",
    prompt: `Analyze requirements. Markdown:
- **Overview** (2 sentences)
- **Functional Reqs** (FR-001 etc.)
- **Non-Functional Reqs** (NFR-001 etc.)
- **Scope & Priorities**`,
  },
  {
    id: "system-design",
    name: "System Design",
    description:
      "Create high-level system design including system architecture, data flow diagrams, and component interactions.",
    icon: "Layout",
    prompt: `System design. Markdown:
- **Architecture** (pattern + justification)
- **Components** (name: responsibility)
- **API Endpoints** (table: method, path, purpose)
- **DB Schema** (tables + key fields)`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `Tech architecture. Markdown:
- **Stack** (frontend, backend, DB, infra)
- **Project Structure** (folder tree)
- **Dev Tools** (CI/CD, testing)`,
  },
  {
    id: "implementation-plan",
    name: "Implementation Plan",
    description:
      "Break down the project into sprints, tasks, and milestones with time estimates.",
    icon: "ListTodo",
    prompt: `Implementation plan. Markdown:
- **Sprints** (table: task, hours, role)
- **Milestones** (name + date)`,
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
    prompt: `Testing strategy. Markdown:
- **Test Cases** (table: ID, description, priority)
- **Test Code** per file:

### FILE: \`path/to/test\`
\`\`\`lang
test code
\`\`\``,
  },
  {
    id: "deployment-plan",
    name: "Deployment Plan",
    description:
      "Create deployment strategy, infrastructure setup, and go-live checklist.",
    icon: "Rocket",
    prompt: `Deployment plan. Markdown:
- **Strategy** (pick one, brief)
- **CI/CD**:

### FILE: \`Dockerfile\`
\`\`\`dockerfile
config
\`\`\`

- **Go-Live Checklist**
- **Rollback Plan**`,
  },
];
