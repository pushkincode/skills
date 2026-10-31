---
name: spec
description: Gather project requirements, research the problem, and produce a detailed project specification and an actionable roadmap with independent review. Use when the user asks to plan a project, write its specification, or create a roadmap from an idea.
---

# Project specification and roadmap

Turn a project idea into a detailed, evidence-based specification and an actionable roadmap. Follow the user's language for conversation and deliverables unless they request another language. Adapt depth and research to the project; do not invent facts, requirements, sources, or completed checks. This workflow plans work; do not implement the project unless separately requested.

## 1. Gather context in rounds

First inspect relevant existing project files and the user's request. Ask the user for a detailed description of the project, what they want to achieve, and any existing materials; do not ask them to repeat information already available. After their reply, ask a second round of focused questions. Continue with further rounds until there is enough information to make the core product and technical decisions, write testable requirements, and define an implementation sequence.

Ask only questions whose answers can materially change the specification, architecture, risks, or priorities. Group related questions in manageable batches; adapt follow-ups to each answer instead of using a fixed questionnaire. As applicable, establish users and their needs, desired outcomes, scope and exclusions, key flows, integrations and data, constraints, budget, operational and security needs, and launch criteria. For an existing project, inspect its architecture and conventions before proposing changes.

Separate confirmed decisions, assumptions, and unresolved questions. If the user does not know an answer, offer a practical recommendation and explain its consequences; obtain their decision when it materially changes the product. If they decline to decide or explicitly ask to proceed, record a visible assumption or open decision and its impact. Never present a guess as an agreed requirement. Do not advance past a genuinely blocking missing decision without user direction.

## 2. Research and delegation

Identify research topics from actual uncertainties and project needs, such as relevant products, technical approaches, integration documentation, or constraints. Delegate independent topics to separate research subagents in parallel when the environment permits. Give each a bounded question, the necessary project context, and a requested output: findings, primary-source links, dates when relevant, limitations, and recommendations. Do not send secrets or unnecessary private data. Collect and reconcile results in the main context; distinguish evidence from inference and flag conflicting or unverified claims. Do not claim research was performed if web access is unavailable.

When the environment exposes model selection and reliable information about available models and their cost, use the least expensive suitable available model for research and drafting. Do not guess prices or model availability or change the user's account configuration. When price information or model selection is unavailable, use the available model and state the limitation; do not describe it as the cheapest. Use the strongest suitable available model for independent review when selectable, without claiming it is the most expensive unless verified. Respect tool, access, budget, and user permissions.

If subagents are unavailable or prohibited, explain the limitation, research the topics sequentially with available tools, and label the result as non-delegated. If the user requires actual independent agents or a particular model as a condition of proceeding, ask how to continue rather than pretending the requirement was met.

## 3. Draft the specification

Delegate drafting to a low-cost suitable model when available, passing the confirmed context and research; otherwise draft in the current context and disclose the limitation. Produce a detailed, project-specific specification, proportionate to the project's complexity. Cover relevant items: problem and goals; users and roles; scope and exclusions; user journeys; functional requirements and acceptance criteria; data and integrations; architecture and technology decisions with rationale; security and privacy; reliability and operational requirements; testing; deployment; constraints; risks; assumptions; and unresolved decisions. Include sources for factual claims and do not invent precise details. Mark out-of-scope or not-yet-decided areas explicitly rather than filling sections with generic text.

## 4. Independent review and revision

When supported, start a fresh, independent reviewer subagent with no prior conversation or drafting history. Give it only the draft specification, the minimum confirmed project requirements needed to assess it, and this task: find contradictions, missing requirements, unsupported assumptions, security or operational risks, and untestable acceptance criteria; return prioritized findings with concrete fixes. Do not pass the draft author's reasoning or conclusions. A fresh context still contains the provided specification and requirements; it is not literally empty.

Use the strongest suitable available model for this review if model selection is supported. If a fresh reviewer cannot be launched, state that independent review is unavailable and perform a clearly labeled self-review; never claim independent or stronger-model review occurred. Consider each finding, apply valid corrections, explain material rejected or unresolved findings, and preserve decisions requiring the user's input. Delegate revisions to the low-cost drafting model when available.

## 5. Create the roadmap

After revising the specification, have the low-cost drafting model create a roadmap when available; otherwise use the current model and disclose the limitation. Organize it into ordered phases and numbered tasks (1.1, 1.2, 1.3, 2.1, etc.). Use Markdown checkboxes for every task and phase checkpoint, for example `- [ ] 1.1 ...` and `- [ ] Checkpoint 1: ...`. Each task should describe an actionable outcome; include dependencies, validation and acceptance checks, and explicit checkpoints with observable completion criteria. Keep all boxes unchecked unless work has actually been verified as complete. Reflect open decisions and assumptions in the plan, and make sure requirements and risks map to work or are explicitly deferred.

Save the final specification and roadmap as `SPEC.md` and `ROADMAP.md` in the project root unless the user or project conventions specify another location. Inspect existing files first; preserve existing content and user edits, and choose a non-conflicting location or agree on an update when an overwrite would lose work. Report the file paths, major assumptions and unresolved decisions, sources, review findings, and any limitations in research, delegation, model selection, or independent review.
