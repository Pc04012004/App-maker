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
- **Data Model** (entities, fields, relationships — specific to this app)
- **UI Design** (describe each screen: layout, colors, fonts, animations, user interactions — make it BEAUTIFUL)`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `Define tech architecture. Markdown:
- **Stack**: ALWAYS use vanilla HTML + CSS + JavaScript in a SINGLE index.html file. No frameworks, no npm, no build tools.
- **File Structure**: Just one file: index.html
- **How to Run**: Open index.html in a browser

IMPORTANT: The entire application MUST be a single self-contained index.html file with embedded CSS and JavaScript. This ensures it works everywhere with zero setup. No React, no Node.js, no build steps.`,
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
- **Key Logic** (describe the core algorithm/game logic/business logic in full detail — this will guide code generation)`,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description:
      "Generate the actual application code based on all previous phases.",
    icon: "Code",
    prompt: `Generate a COMPLETE, FULLY WORKING, BEAUTIFUL application as a SINGLE index.html file.

CRITICAL RULES:
1. Output EXACTLY ONE file: index.html — with ALL CSS in <style> and ALL JavaScript in <script>
2. The app must work IMMEDIATELY when opened in any browser — no build steps, no dependencies
3. NO placeholders, NO "// TODO", NO "// add more here", NO incomplete functions
4. Implement EVERY feature the user asked for — do not skip anything
5. For games: implement ALL mechanics (controls, physics, scoring, win/lose, restart, sound effects via Web Audio API)
6. For apps: implement ALL CRUD operations, state management, data persistence (localStorage), form validation

BEAUTIFUL UI REQUIREMENTS:
- Use modern CSS: gradients, box-shadows, border-radius, smooth transitions, animations
- Use a professional color palette (not plain black/white)
- Add hover effects on interactive elements
- Use CSS Grid or Flexbox for layouts
- Make it responsive (works on mobile and desktop)
- Add subtle animations (fade-in, slide, scale) for polish
- Use clean typography with proper font sizes and spacing
- If it's a game: use HTML5 Canvas with smooth animations at 60fps

Format:

### FILE: \`index.html\`
\`\`\`html
<!DOCTYPE html>
<html>
... complete working code ...
</html>
\`\`\`

The output must be a single, self-contained, production-quality HTML file that looks professional and works perfectly.`,
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
- **How to Deploy** (this is a single HTML file — just upload/host it)
- **Go-Live Checklist** (numbered steps)`,
  },
];
