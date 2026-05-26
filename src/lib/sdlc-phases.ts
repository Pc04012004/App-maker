import { SDLCPhase } from "./types";

export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "requirements-analysis",
    name: "Requirements Analysis",
    description:
      "Analyze the requirement document, extract functional and non-functional requirements, identify stakeholders, and define scope.",
    icon: "ClipboardList",
    prompt: `Analyze the requirement document thoroughly. Markdown output:
- **Project Overview** (what exactly needs to be built)
- **Functional Requirements** (numbered FR-001 etc. — be specific to the user's request)
- **Non-Functional Requirements** (NFR-001 etc.)
- **Scope** (in/out)
- **User Stories** (As a user, I want... so that...)
- **Priority** (MoSCoW)`,
  },
  {
    id: "system-design",
    name: "System Design",
    description:
      "Create high-level system design including system architecture, data flow diagrams, and component interactions.",
    icon: "Layout",
    prompt: `Design the system to exactly match the user's requirements. Markdown:
- **Architecture** (pattern + justification for THIS specific app)
- **Components** (each component mapped to a specific user requirement)
- **API Endpoints** (table: method, path, request/response — specific to this app)
- **Data Model** (entities, fields, relationships — specific to this app)
- **UI Screens** (list each screen/page the user will see, what it contains)`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `Define tech architecture. Choose the simplest stack that works. Markdown:
- **Stack** (prefer: HTML/CSS/JS for simple apps, React for SPAs, Next.js only if needed)
- **Project Structure** (complete folder tree with every file)
- **Dependencies** (exact package names and versions)
- **How to Run** (exact commands)

IMPORTANT: For games or simple interactive apps, prefer vanilla HTML/CSS/JavaScript (single file if possible). Only use frameworks when genuinely needed.`,
  },
  {
    id: "implementation-plan",
    name: "Implementation Plan",
    description:
      "Break down the project into sprints, tasks, and milestones with time estimates.",
    icon: "ListTodo",
    prompt: `Implementation plan. Markdown:
- **Tasks** (table: ID, task, description, hours)
- **Build Order** (what to implement first, second, etc.)
- **Key Logic** (describe the core algorithm/game logic/business logic in detail)`,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description:
      "Generate the actual application code based on all previous phases.",
    icon: "Code",
    prompt: `Generate a COMPLETE, FULLY WORKING application that exactly matches the user's requirements.

CRITICAL RULES:
1. Every file must be complete — NO placeholders, NO "// TODO", NO "// add more here"
2. The app must work immediately when files are saved and opened/run
3. For web apps: generate a single index.html with embedded CSS and JS if possible
4. For games: implement ALL game mechanics described in the requirements (controls, scoring, win/lose conditions, graphics)
5. Include ALL features the user asked for — don't skip anything
6. Make it visually polished with proper styling

Format each file as:

### FILE: \`path/to/file\`
\`\`\`lang
complete working code
\`\`\`

Generate EVERY file needed. The code must be production-quality and fully functional.`,
  },
  {
    id: "testing-strategy",
    name: "Testing Strategy",
    description:
      "Define testing strategy, create test cases, and generate test code.",
    icon: "TestTube",
    prompt: `Testing strategy for this specific application. Markdown:
- **Test Cases** (table: ID, what to test, expected result, priority)
- **Manual Test Steps** (step-by-step how to verify the app works correctly)
- **Edge Cases** (what could go wrong, how the app should handle it)`,
  },
  {
    id: "deployment-plan",
    name: "Deployment Plan",
    description:
      "Create deployment strategy, infrastructure setup, and go-live checklist.",
    icon: "Rocket",
    prompt: `Deployment plan. Markdown:
- **How to Deploy** (exact steps for this specific app)
- **Go-Live Checklist** (numbered steps)
- **Environment Variables** (if any needed)`,
  },
];
