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
    prompt: `Generate code. Format per file:

### FILE: \`path/to/file\`
\`\`\`lang
code
\`\`\`

Include config, entry points, models, routes, UI. No explanations.`,
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
