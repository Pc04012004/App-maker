from __future__ import annotations

import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.phases import SDLC_PHASES
from backend.app.schemas import DeployRequest, DeployResponse, SDLCRequest, SDLCResponse

try:
    import certifi
except ImportError:
    certifi = None


def load_local_env() -> None:
    root = Path(__file__).resolve().parents[2]
    env_paths = [
        root / ".env.local",
        root / ".env",
        root / "frontend" / ".env.local",
        root / "frontend" / ".env",
    ]

    for path in env_paths:
        if not path.exists():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            if key and key not in os.environ:
                os.environ[key] = value.strip().strip('"').strip("'")


load_local_env()

app = FastAPI(title="App Maker API")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_URL = os.getenv(
    "GROQ_API_URL",
    "https://api.groq.com/openai/v1/chat/completions",
)
VERCEL_DEPLOY_API_URL = os.getenv(
    "VERCEL_DEPLOY_API_URL",
    "https://api.vercel.com/v13/deployments",
)
CODE_GEN_MODEL = os.getenv("GROQ_CODE_MODEL", "llama-3.3-70b-versatile")
DEFAULT_MODEL = os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")
CODE_GEN_MAX_TOKENS = int(os.getenv("GROQ_CODE_MAX_TOKENS", "8000"))
DEFAULT_MAX_TOKENS = int(os.getenv("GROQ_DEFAULT_MAX_TOKENS", "5000"))
MAX_RETRIES = 3
RETRY_DELAY_MS = 1500


def https_context() -> ssl.SSLContext:
    if certifi is not None:
        return ssl.create_default_context(cafile=certifi.where())
    return ssl.create_default_context()


def sleep_ms(milliseconds: int) -> None:
    time.sleep(milliseconds / 1000)


def parse_json_response(raw_body: str) -> Dict[str, Any]:
    if not raw_body.strip():
        return {}
    try:
        payload = json.loads(raw_body)
        return payload if isinstance(payload, dict) else {}
    except json.JSONDecodeError:
        return {"message": raw_body.strip()}


def response_error_message(payload: Dict[str, Any], fallback: str) -> str:
    error = payload.get("error")
    if isinstance(error, dict):
        message = error.get("message")
        if isinstance(message, str) and message.strip():
            return message
    if isinstance(error, str) and error.strip():
        return error
    message = payload.get("message")
    if isinstance(message, str) and message.strip():
        return message
    return fallback


def unique_items(items: List[str]) -> List[str]:
    seen = set()
    unique: List[str] = []
    for item in items:
        value = item.strip()
        if value and value not in seen:
            seen.add(value)
            unique.append(value)
    return unique


def csv_env(name: str, default: List[str]) -> List[str]:
    raw_value = os.getenv(name, "")
    values = [item.strip() for item in raw_value.split(",") if item.strip()]
    return unique_items(values or default)


def configured_secret(name: str) -> Optional[str]:
    value = os.getenv(name, "").strip()
    if not value:
        return None

    lowered = value.lower()
    placeholder_markers = ("your_", "_here", "placeholder", "replace_me")
    if any(marker in lowered for marker in placeholder_markers):
        return None

    return value


def retry_after_ms(headers: Dict[str, str], fallback_ms: int) -> int:
    retry_after = headers.get("Retry-After") or headers.get("retry-after")
    if not retry_after:
        return fallback_ms

    try:
        return int(float(retry_after)) * 1000
    except ValueError:
        return fallback_ms


def post_json_once(
    url: str,
    payload: Dict[str, Any],
    headers: Dict[str, str],
) -> Tuple[int, Dict[str, Any], Dict[str, str]]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "SDLCFlow/1.0 (+https://localhost)",
            **headers,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=120,
            context=https_context(),
        ) as response:
            raw_body = response.read().decode("utf-8")
            return response.status, parse_json_response(raw_body), dict(response.headers)
    except urllib.error.HTTPError as error:
        raw_body = error.read().decode("utf-8")
        return error.code, parse_json_response(raw_body), dict(error.headers or {})
    except urllib.error.URLError as error:
        return 500, {"error": str(error)}, {}


def truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else f"{text[:limit]}..."


def extract_requirement_bullets(requirement_document: str) -> List[str]:
    bullets: List[str] = []
    for line in requirement_document.splitlines():
        stripped = line.strip("-• \t")
        if line.lstrip().startswith(("-", "•")) and stripped:
            bullets.append(stripped)
    return bullets


def build_fallback_content(
    phase_id: str,
    requirement_document: str,
    previous_context: str,
) -> str:
    bullets = extract_requirement_bullets(requirement_document)
    top_requirements = bullets[:5] if bullets else [
        "Capture the core user flow from the requirement document.",
        "Define the minimum viable feature set.",
        "Keep the implementation simple, responsive, and production-oriented.",
    ]
    requirement_summary = "\n".join(f"- {item}" for item in top_requirements)

    if phase_id == "requirements-analysis":
        return (
            "## Overview\n"
            "This project describes a software solution derived from the provided requirements.\n\n"
            "## Functional Requirements\n"
            f"{requirement_summary}\n\n"
            "## Non-Functional Requirements\n"
            "- Responsive UI\n"
            "- Reliable error handling\n"
            "- Maintainable code structure\n\n"
            "## Scope & Priorities\n"
            "- Prioritize the core user journey first.\n"
            "- Keep integrations isolated behind simple interfaces.\n"
        )

    if phase_id == "system-design":
        return (
            "## Architecture\n"
            "A simple client-server design with a React frontend and a Python API backend.\n\n"
            "## Components\n"
            "- Frontend: requirement input, phase navigation, document rendering.\n"
            "- Backend: SDLC generation, deployment orchestration, environment checks.\n\n"
            "## API Endpoints\n"
            "| Method | Path | Purpose |\n"
            "| --- | --- | --- |\n"
            "| GET | /config | Report environment readiness |\n"
            "| POST | /sdlc | Generate the next SDLC phase |\n"
            "| POST | /deploy | Send generated files to Vercel |\n\n"
            "## DB Schema\n"
            "- No database required for the current version.\n"
        )

    if phase_id == "tech-architecture":
        return (
            "## Stack\n"
            "- Frontend: React, Next.js, TypeScript\n"
            "- Backend: FastAPI, Python 3.8+\n"
            "- Styling: Tailwind CSS\n\n"
            "## Project Structure\n"
            "- frontend/ - React app\n"
            "- backend/ - Python API\n\n"
            "## Dev Tools\n"
            "- ESLint for frontend validation\n"
            "- Uvicorn for backend serving\n"
        )

    if phase_id == "implementation-plan":
        return (
            "## Sprints\n"
            "| Task | Hours | Role |\n"
            "| --- | ---: | --- |\n"
            "| Requirements analysis | 4 | Product / backend |\n"
            "| System design | 6 | Full stack |\n"
            "| Implementation | 16 | Frontend / backend |\n"
            "| Testing and polish | 6 | QA / full stack |\n\n"
            "## Milestones\n"
            "- M1: Requirements finalized\n"
            "- M2: System design approved\n"
            "- M3: Feature-complete build\n"
        )

    if phase_id == "code-generation":
        summary = requirement_summary or "- Core application flow\n- Responsive UI\n- Stable API integration"
        context_block = previous_context.strip()
        return f"""### FILE: `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated App</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: #e2e8f0;
    }}
    .card {{
      width: min(720px, calc(100vw - 2rem));
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35);
    }}
    h1 {{ margin-top: 0; }}
    pre {{
      white-space: pre-wrap;
      background: rgba(30, 41, 59, 0.8);
      padding: 16px;
      border-radius: 16px;
      overflow: auto;
    }}
  </style>
</head>
<body>
  <main class="card">
    <h1>Generated Application Shell</h1>
    <p>This fallback is shown because the model endpoint is unavailable. It keeps the flow working while you configure Groq.</p>
    <h2>Requirements</h2>
    <pre>{summary}</pre>
    {f"<h2>Previous Context</h2><pre>{context_block}</pre>" if context_block else ""}
  </main>
</body>
</html>
```
"""

    if phase_id == "testing-strategy":
        return (
            "## Test Cases\n"
            "| ID | Description | Priority |\n"
            "| --- | --- | --- |\n"
            "| TC-001 | Verify input submission | High |\n"
            "| TC-002 | Verify phase generation | High |\n"
            "| TC-003 | Verify download/deploy actions | Medium |\n\n"
            "## Test Code\n"
            "### FILE: `tests/smoke.test.ts`\n"
            "```ts\n"
            "describe('smoke', () => { it('loads', () => expect(true).toBe(true)); });\n"
            "```\n"
        )

    if phase_id == "deployment-plan":
        return (
            "## Strategy\n"
            "Deploy the React frontend separately and keep the Python backend as the API layer.\n\n"
            "## CI/CD\n"
            "- Run lint and build on every push.\n"
            "- Deploy frontend and backend from their respective pipelines.\n\n"
            "## Go-Live Checklist\n"
            "- Confirm environment variables.\n"
            "- Verify API responses.\n"
            "- Smoke test the generated output.\n\n"
            "## Rollback Plan\n"
            "- Revert the last release and redeploy the previous stable version.\n"
        )

    return (
        "## Output\n"
        f"{requirement_summary}\n\n"
        "## Notes\n"
        "- Fallback content was generated because the model endpoint was unavailable.\n"
    )


def find_phase(phase_id: str) -> Optional[Dict[str, Any]]:
    for phase in SDLC_PHASES:
        if phase["id"] == phase_id:
            return phase
    return None


def build_previous_context(request_body: SDLCRequest, is_code_gen: bool) -> str:
    if is_code_gen:
        context_parts: List[str] = []
        for previous in [phase for phase in request_body.previousPhases if phase.approved]:
            definition = find_phase(previous.phaseId)
            text = previous.editedContent or previous.content
            limit = 3200 if previous.phaseId == "implementation-plan" else 1800
            context_parts.append(
                f"## {definition['name'] if definition else previous.phaseId}\n"
                f"{truncate(text, limit)}"
            )
        return "\n\n".join(context_parts)

    if not request_body.previousPhases:
        return ""

    last_phase = request_body.previousPhases[-1]
    definition = find_phase(last_phase.phaseId)
    last_content = last_phase.editedContent or last_phase.content
    return (
        f"## {definition['name'] if definition else last_phase.phaseId}\n"
        f"{truncate(last_content, 1600)}"
    )


def build_system_prompt(is_code_gen: bool) -> str:
    if is_code_gen:
        return (
            "You are an expert frontend developer. Create complete, polished, production-quality code. "
            "Never omit logic, never use placeholders, and always provide a single fully working file."
        )

    return (
        "You are a principal software architect and senior technical writer. "
        "Write detailed, professional, implementation-ready Markdown. Derive every section from the "
        "provided requirement document and approved prior phase context. Preserve the user's domain, "
        "features, constraints, and terminology. If a detail is missing, state a reasonable assumption "
        "or open question instead of inventing unsupported facts. Do not expand scope beyond explicit "
        "or directly implied requirements. Use concrete IDs, acceptance criteria, risks, dependencies, "
        "and priorities. Avoid vague filler and broken Markdown tables."
    )


def call_groq_with_retry(
    api_key: str,
    models: List[str],
    system_prompt: str,
    user_message: str,
    max_tokens: int,
    temperature: float,
) -> Tuple[str, Optional[str]]:
    last_error = ""

    for model in unique_items(models):
        for attempt in range(MAX_RETRIES):
            status, data, headers = post_json_once(
                GROQ_API_URL,
                {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
                {"Authorization": f"Bearer {api_key}"},
            )

            if status == 200:
                choices = data.get("choices")
                if isinstance(choices, list) and choices:
                    message = choices[0].get("message", {})
                    content = message.get("content") if isinstance(message, dict) else ""
                    if isinstance(content, str) and content.strip():
                        return content, None
                last_error = f"Groq returned an empty response for {model}."
                if attempt < MAX_RETRIES - 1:
                    sleep_ms(RETRY_DELAY_MS)
                continue

            last_error = response_error_message(data, f"Groq API error: {status}")
            if status in {429, 500, 502, 503} and attempt < MAX_RETRIES - 1:
                sleep_ms(retry_after_ms(headers, RETRY_DELAY_MS * (attempt + 1)))
                continue

            if status in {400, 404} and "model" in last_error.lower():
                break

            if 400 <= status < 500 and status != 429:
                return "", last_error

            if attempt < MAX_RETRIES - 1:
                sleep_ms(RETRY_DELAY_MS * (attempt + 1))

    return "", last_error or "Failed after multiple retries."


def normalize_file_path(file_path: str) -> str:
    parts: List[str] = []
    for segment in file_path.replace("\\", "/").split("/"):
        if not segment or segment == ".":
            continue
        if segment == "..":
            continue
        parts.append(segment)
    return "/".join(parts) or "index.html"


def ensure_index_html(files: List[Dict[str, str]]) -> List[Dict[str, str]]:
    has_index = any(
        file["path"] in {"index.html", "./index.html", "/index.html"}
        for file in files
    )
    if has_index:
        return files

    html_file = next((file for file in files if file["path"].endswith(".html")), None)
    if html_file:
        return [{"path": "index.html", "content": html_file["content"]}, *files]

    js_files = [file for file in files if file["path"].endswith((".js", ".ts"))]
    css_files = [file for file in files if file["path"].endswith(".css")]
    script_tags = "\n".join(
        f"<script>\n{file['content']}\n</script>" for file in js_files
    )
    style_tags = "\n".join(f"<style>\n{file['content']}\n</style>" for file in css_files)
    app_name = "Generated Application" if files else "SDLCFlow Application"

    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{app_name}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e293b;
    }}
    .container {{
      max-width: 600px;
      margin: 2rem;
      background: white;
      border-radius: 1rem;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      text-align: center;
    }}
    h1 {{ font-size: 1.75rem; margin-bottom: 1rem; color: #1e293b; }}
    p {{ color: #64748b; margin-bottom: 1.5rem; line-height: 1.6; }}
    .badge {{
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }}
  </style>
  {style_tags}
</head>
<body>
  <div class="container">
    <div class="badge">SDLCFlow</div>
    <h1 style="margin-top:1.5rem">{app_name}</h1>
    <p>Your application has been generated and deployed successfully.</p>
    <div id="app"></div>
  </div>
  {script_tags}
</body>
</html>"""

    return [{"path": "index.html", "content": index_html}, *files]


def sanitize_project_name(project_name: str) -> str:
    sanitized = re.sub(r"[^a-z0-9-]", "-", project_name.lower())
    sanitized = re.sub(r"-+", "-", sanitized).strip("-")
    return sanitized[:52] or "sdlc-app"


def json_error(message: str, status_code: int) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=status_code)


@app.get("/config")
def get_config() -> Dict[str, bool]:
    return {
        "hasApiKey": bool(configured_secret("GROQ_API_KEY")),
        "hasVercelToken": bool(configured_secret("VERCEL_TOKEN")),
    }


@app.post("/sdlc", response_model=SDLCResponse)
def create_sdlc_phase(request_body: SDLCRequest) -> SDLCResponse:
    api_key = request_body.apiKey or configured_secret("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Groq API key is required.")

    phase = find_phase(request_body.phaseId)
    if not phase:
        raise HTTPException(status_code=400, detail="Invalid phase ID.")

    is_code_gen = request_body.phaseId == "code-generation"
    models = csv_env(
        "GROQ_CODE_MODELS" if is_code_gen else "GROQ_DEFAULT_MODELS",
        [CODE_GEN_MODEL, DEFAULT_MODEL, FALLBACK_MODEL]
        if is_code_gen
        else [DEFAULT_MODEL, FALLBACK_MODEL],
    )
    max_tokens = CODE_GEN_MAX_TOKENS if is_code_gen else DEFAULT_MAX_TOKENS
    req_limit = 8000 if is_code_gen else 7000
    req_summary = truncate(request_body.requirementDocument, req_limit)
    previous_context = build_previous_context(request_body, is_code_gen)
    system_prompt = build_system_prompt(is_code_gen)

    user_message = (
        "Use the following original requirement document as the primary source of truth.\n\n"
        f"## Original Requirement Document\n{req_summary}"
    )
    if previous_context:
        user_message += f"\n\n## Approved Previous Phase Context\n{previous_context}"
    user_message += f"\n\n## Required Output Instructions\n{phase['prompt']}"

    content, error = call_groq_with_retry(
        api_key,
        models,
        system_prompt,
        user_message,
        max_tokens,
        0.25 if is_code_gen else 0.1,
    )

    if error:
        return SDLCResponse(content="", error=error)

    return SDLCResponse(content=content)


@app.post("/deploy", response_model=DeployResponse)
def deploy_to_vercel(request_body: DeployRequest) -> DeployResponse:
    try:
        token = request_body.vercelToken or configured_secret("VERCEL_TOKEN")
        if not token:
            return json_error(
                "Vercel API token is required. Set VERCEL_TOKEN in the root .env file or enter it in the UI.",
                400,
            )

        if not request_body.files:
            return json_error("No files to deploy.", 400)

        files = [
            {"path": normalize_file_path(file.path), "content": file.content}
            for file in request_body.files
            if file.content and file.content.strip()
        ]
        if not files:
            return json_error("All files were empty after processing.", 400)

        files = ensure_index_html(files)
        vercel_files = [
            {"file": file["path"], "data": file["content"], "encoding": "utf-8"}
            for file in files
        ]
        sanitized_name = sanitize_project_name(request_body.projectName)

        last_error = ""
        for attempt in range(MAX_RETRIES):
            status, data, headers = post_json_once(
                VERCEL_DEPLOY_API_URL,
                {
                    "name": sanitized_name,
                    "files": vercel_files,
                    "target": "production",
                    "projectSettings": {"framework": None},
                },
                {"Authorization": f"Bearer {token}"},
            )

            if 200 <= status < 300:
                deployment_url = str(data.get("url", "")).strip()
                if not deployment_url:
                    return json_error("Vercel deployment succeeded but returned no URL.", 502)
                return DeployResponse(
                    url=deployment_url
                    if deployment_url.startswith("https://")
                    else f"https://{deployment_url}",
                    deploymentId=str(data.get("id", "")),
                    readyState=str(data.get("readyState", "")),
                )

            last_error = response_error_message(data, f"Vercel API error: {status}")
            if status in {429, 500, 502, 503} and attempt < MAX_RETRIES - 1:
                retry_after = headers.get("Retry-After") or headers.get("retry-after")
                wait_ms = (
                    int(float(retry_after)) * 1000
                    if retry_after
                    else 2000 * (attempt + 1)
                )
                sleep_ms(wait_ms)
                continue

            return json_error(last_error, status)

        return json_error(
            last_error or "Deployment failed after multiple retries.",
            500,
        )
    except Exception as exc:  # noqa: BLE001
        return json_error(f"Deployment failed: {exc}", 500)
