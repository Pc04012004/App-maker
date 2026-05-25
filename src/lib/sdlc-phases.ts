import { SDLCPhase } from "./types";

export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "requirements-analysis",
    name: "Requirements Analysis",
    description:
      "Analyze the requirement document, extract functional and non-functional requirements, identify stakeholders, and define scope.",
    icon: "ClipboardList",
    prompt: `You are a senior business analyst. Analyze the following requirement document and produce a detailed requirements analysis.

Include:
1. **Project Overview** - Brief summary of what needs to be built
2. **Functional Requirements** - Numbered list of all functional requirements (FR-001, FR-002, etc.)
3. **Non-Functional Requirements** - Performance, security, scalability, usability requirements (NFR-001, NFR-002, etc.)
4. **Stakeholders** - Identify key stakeholders and their roles
5. **Scope Definition** - What's in scope and out of scope
6. **Assumptions & Constraints** - List any assumptions and constraints
7. **Risk Assessment** - Potential risks and mitigation strategies
8. **Priority Matrix** - Categorize requirements as Must-Have, Should-Have, Could-Have, Won't-Have (MoSCoW)

Format your response in clean Markdown.`,
  },
  {
    id: "system-design",
    name: "System Design",
    description:
      "Create high-level system design including system architecture, data flow diagrams, and component interactions.",
    icon: "Layout",
    prompt: `You are a senior system architect. Based on the requirements analysis, create a comprehensive system design.

Include:
1. **System Overview** - High-level description of the system
2. **Architecture Pattern** - Chosen architecture pattern (microservices, monolithic, serverless, etc.) with justification
3. **Component Diagram** - Describe all major components and their responsibilities (use text-based diagrams)
4. **Data Flow** - How data flows through the system
5. **API Design** - Key API endpoints with methods, paths, request/response formats
6. **Database Design** - Entity descriptions, relationships, and key fields (describe tables/collections)
7. **Integration Points** - External services, third-party APIs
8. **Security Design** - Authentication, authorization, data protection strategies
9. **Scalability Considerations** - How the system will scale

Format your response in clean Markdown with clear sections.`,
  },
  {
    id: "tech-architecture",
    name: "Technical Architecture",
    description:
      "Define the technology stack, frameworks, tools, and infrastructure needed for the project.",
    icon: "Cpu",
    prompt: `You are a senior technical architect. Based on the requirements and system design, define the complete technical architecture.

Include:
1. **Technology Stack**
   - Frontend: Framework, UI library, state management
   - Backend: Language, framework, runtime
   - Database: Type (SQL/NoSQL), specific technology
   - Caching: Strategy and technology
   - Message Queue: If needed
2. **Development Tools**
   - Version control, CI/CD pipeline, testing frameworks
   - Code quality tools (linting, formatting)
   - Monitoring and logging
3. **Infrastructure**
   - Hosting/Cloud provider
   - Container orchestration
   - CDN strategy
4. **Project Structure** - Detailed folder/file structure
5. **Environment Setup** - Development, staging, production environments
6. **DevOps Pipeline** - Build, test, deploy workflow
7. **Technology Justification** - Why each technology was chosen

Format your response in clean Markdown.`,
  },
  {
    id: "implementation-plan",
    name: "Implementation Plan",
    description:
      "Break down the project into sprints, tasks, and milestones with time estimates.",
    icon: "ListTodo",
    prompt: `You are a senior project manager with technical expertise. Create a detailed implementation plan based on the requirements, system design, and technical architecture.

Include:
1. **Sprint Breakdown** - Divide work into 2-week sprints
   - Sprint goals
   - User stories with acceptance criteria
   - Story point estimates
2. **Task Breakdown** - For each sprint, list individual tasks
   - Task ID, description, estimated hours
   - Dependencies between tasks
   - Assignee role (frontend dev, backend dev, etc.)
3. **Milestones** - Key milestones with dates
4. **Critical Path** - Identify the critical path
5. **Resource Requirements** - Team composition needed
6. **Definition of Done** - What constitutes completion for each task
7. **Risk Mitigation Timeline** - When to address identified risks

Format as clean Markdown with tables where appropriate.`,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description:
      "Generate the actual application code based on all previous phases.",
    icon: "Code",
    prompt: `You are a senior full-stack developer. Based on all the previous analysis, design, architecture, and implementation plan, generate the core application code.

Generate complete, production-ready code files. For each file, use this format:

### FILE: \`path/to/file.ext\`
\`\`\`language
// file content here
\`\`\`

Include:
1. **Project Configuration** - package.json, tsconfig.json, .env.example, etc.
2. **Core Application Files** - Main entry points, routing, middleware
3. **Data Models/Schema** - Database models or type definitions
4. **API/Backend Logic** - Controllers, services, routes
5. **Frontend Components** - Key UI components
6. **Utility Functions** - Helpers, validators, formatters
7. **Configuration Files** - Docker, CI/CD, environment configs

Make sure:
- Code is clean, well-structured, and follows best practices
- Proper error handling is included
- TypeScript types are properly defined
- Comments explain complex logic only
- Files are organized according to the project structure defined earlier`,
  },
  {
    id: "testing-strategy",
    name: "Testing Strategy",
    description:
      "Define testing strategy, create test cases, and generate test code.",
    icon: "TestTube",
    prompt: `You are a senior QA engineer and test architect. Create a comprehensive testing strategy and generate test code based on the application.

Include:
1. **Testing Strategy Overview**
   - Unit testing approach
   - Integration testing approach
   - End-to-end testing approach
   - Performance testing plan
2. **Test Cases** - Detailed test cases organized by feature
   - Test ID, description, preconditions, steps, expected results
   - Priority (Critical, High, Medium, Low)
3. **Test Code** - Generate actual test files

For each test file, use this format:

### FILE: \`path/to/test.ext\`
\`\`\`language
// test content here
\`\`\`

4. **Coverage Goals** - Target coverage percentages
5. **Testing Tools** - Specific tools and frameworks for each testing type
6. **CI/CD Integration** - How tests integrate into the pipeline
7. **Test Data Strategy** - How test data will be managed

Format your response in clean Markdown.`,
  },
  {
    id: "deployment-plan",
    name: "Deployment Plan",
    description:
      "Create deployment strategy, infrastructure setup, and go-live checklist.",
    icon: "Rocket",
    prompt: `You are a senior DevOps engineer. Create a comprehensive deployment plan for taking the application to production.

Include:
1. **Deployment Strategy** - Blue-green, canary, rolling update, etc.
2. **Infrastructure Setup**
   - Cloud resources needed (with specifications)
   - Network configuration
   - Security groups/firewall rules
3. **CI/CD Pipeline Configuration**

### FILE: \`.github/workflows/deploy.yml\`
\`\`\`yaml
# CI/CD pipeline configuration
\`\`\`

4. **Docker Configuration**

### FILE: \`Dockerfile\`
\`\`\`dockerfile
# Docker configuration
\`\`\`

### FILE: \`docker-compose.yml\`
\`\`\`yaml
# Docker compose configuration
\`\`\`

5. **Environment Configuration** - Environment variables, secrets management
6. **Monitoring & Alerting** - What to monitor, alert thresholds
7. **Backup & Recovery** - Database backup strategy, disaster recovery plan
8. **Go-Live Checklist** - Step-by-step checklist for launch
9. **Rollback Plan** - How to rollback if issues arise
10. **Post-Deployment Verification** - Smoke tests, health checks

Format your response in clean Markdown.`,
  },
];
