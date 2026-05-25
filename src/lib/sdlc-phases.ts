import { SDLCPhase } from "./types";

export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "requirements-analysis",
    name: "Requirements Analysis",
    description:
      "Analyze the requirement document, extract functional and non-functional requirements, identify stakeholders, and define scope.",
    icon: "ClipboardList",
    prompt: `Analyze the requirement document. Output concise Markdown with these sections:
1. **Project Overview** (2-3 sentences)
2. **Functional Requirements** (numbered FR-001 etc.)
3. **Non-Functional Requirements** (numbered NFR-001 etc.)
4. **Scope** (in/out of scope)
5. **Assumptions & Constraints**
6. **Priority** (MoSCoW: Must/Should/Could/Won't)

Be concise. No filler text.`,
  },
  {
    id: "system-design",
    name: "System Design",
    description:
      "Create high-level system design including system architecture, data flow diagrams, and component interactions.",
    icon: "Layout",
    prompt: `Create a system design based on the requirements. Concise Markdown:
1. **Architecture Pattern** (with brief justification)
2. **Components** (name + responsibility, one line each)
3. **API Endpoints** (method, path, purpose — table format)
4. **Database Schema** (tables/collections with key fields)
5. **Security** (auth strategy, brief)

Be concise. No filler.`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `Define the tech architecture. Concise Markdown:
1. **Tech Stack** (Frontend, Backend, Database, Infra — one line each)
2. **Project Structure** (folder tree)
3. **Dev Tools** (CI/CD, testing, linting — brief list)
4. **Justification** (one sentence per major choice)

Be concise. No filler.`,
  },
  {
    id: "implementation-plan",
    name: "Implementation Plan",
    description:
      "Break down the project into sprints, tasks, and milestones with time estimates.",
    icon: "ListTodo",
    prompt: `Create an implementation plan. Concise Markdown:
1. **Sprints** (2-week sprints: goal + key tasks as a table with ID, task, hours, role)
2. **Milestones** (name + target date)
3. **Dependencies** (brief list of blockers)

Use tables. Be concise. No filler.`,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description:
      "Generate the actual application code based on all previous phases.",
    icon: "Code",
    prompt: `Generate the core application code. Use this exact format per file:

### FILE: \`path/to/file.ext\`
\`\`\`language
// code here
\`\`\`

Include: config files, entry points, models, API routes, key UI components.
Write clean, working code with proper error handling. No explanatory text outside code blocks.`,
  },
  {
    id: "testing-strategy",
    name: "Testing Strategy",
    description:
      "Define testing strategy, create test cases, and generate test code.",
    icon: "TestTube",
    prompt: `Create a testing strategy. Concise Markdown:
1. **Test Cases** (table: ID, description, type, priority)
2. **Test Code** — use this format per file:

### FILE: \`path/to/test.ext\`
\`\`\`language
// test code
\`\`\`

3. **Coverage Goals** (target percentages, brief)

Focus on critical paths. Be concise.`,
  },
  {
    id: "deployment-plan",
    name: "Deployment Plan",
    description:
      "Create deployment strategy, infrastructure setup, and go-live checklist.",
    icon: "Rocket",
    prompt: `Create a deployment plan. Concise Markdown:
1. **Strategy** (blue-green/canary/rolling — pick one, justify briefly)
2. **Infra** (cloud resources needed, brief list)
3. **CI/CD** — generate:

### FILE: \`.github/workflows/deploy.yml\`
\`\`\`yaml
# pipeline config
\`\`\`

### FILE: \`Dockerfile\`
\`\`\`dockerfile
# docker config
\`\`\`

4. **Go-Live Checklist** (numbered steps)
5. **Rollback Plan** (brief)

Be concise. No filler.`,
  },
];
