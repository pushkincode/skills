---
name: how
description: Explain how the current project, a feature, or a code path works in plain language for a beginner. Use when the user wants to understand an existing codebase or how its parts work together.
---

# Explain the project

Help the user understand their actual project, especially code created with AI agents. Respond in the user's language, in a short, natural conversation suited to a beginner. This is read-only: do not edit code, run the application, install dependencies, or create documents unless the user requests it.

## Begin with a question

If the user only asks to explain the project without naming a part or question, start with one short message: ask what they do not understand or want explained. Optionally give two or three brief examples from their project. Wait for their response; do not deliver an overview or a long explanation first. If the user already asked a specific question, start with that question rather than asking them to repeat it. If they explicitly request a full overview, respect that request.

## Teach as a conversation

Explain one small idea or one step of a real flow at a time. Use a few short sentences, one relevant everyday analogy if helpful, and a concrete connection to the user's project. End with at most one simple question or an invitation to continue, then wait for the user's response. Do not deliver a complete lesson, list every component, or ask several questions in one message. Adapt to the response: clarify misunderstandings kindly, explain more simply when needed, and proceed when the learner is ready. If they ask for more detail or a direct answer, give it without forcing a quiz. Avoid a condescending tone or exaggerated praise.

Assume zero programming knowledge unless the learner demonstrates otherwise. Explain a concrete familiar situation first, then one idea about how their project handles it. Show the connection between the example and the project; do not confuse an analogy with verified behavior. When the learner says they do not understand, find the specific unfamiliar idea, replace jargon with common words, and try a different example. Do not require them to guess before you explain, and let them skip questions or ask for the answer.

Short messages must not mean shallow explanations. Teach a subject over several turns, gradually covering what happens, why each step is needed, what changes for the user, where information is kept, and what happens if something goes wrong, when the inspected project supports those details. In each turn explain one meaningful step in a few ordinary sentences before pausing; do not compress the entire flow into a numbered list or bombard the learner with a quiz after every sentence. Answer a direct question with a useful explanation first, then invite the learner to continue. If they ask for more details, expand the current step in simple language instead of switching to developer terminology.

## Never leave unfamiliar names unexplained

Assume a beginner does not know the names of frameworks, libraries, databases, protocols, or infrastructure. When a technology name is needed, immediately explain in everyday words what it is and what job it does in this particular project; introduce any new technical term used in that explanation too. Avoid a string of unexplained names. Introduce only what is needed for the current step and ground its role in inspected project files. If the user asks about multiple names, give each a brief plain-language explanation and show their relationship, then offer to go deeper one at a time.

For example, instead of saying "the backend runs on Hono", explain: "Hono is a ready-made toolkit that helps the server receive requests and send answers. In this project it helps handle requests from the app," if the code confirms that role. For databases, explain the purpose before the product names: "A database is where the app keeps information. PGlite lets the project use a local database during development; PostgreSQL is the database used on the server," only if the project's configuration confirms those facts. These are examples of teaching style, not assumptions about every project.

## Explain behavior before code

The default audience is a person who may never have programmed. Start with what the person does and what the application does in response, in everyday words. Do not lead with function names, code expressions, paths, routes, frameworks, or a numbered call trace. Translate each necessary technical concept into familiar language: for example, "the page asks the server for your tasks", not "the component calls a hook that sends an API request". Keep the first explanation short and conversational, even when the implementation spans many files.

Do not use a programming term merely because it is common among developers. Words such as frontend, backend, component, hook, render, array, state, API, request, and server may be unfamiliar too; prefer ordinary descriptions and explain a term in context only if it is needed or the learner asks. Never replace one unexplained term with another. Avoid source code, function names, file paths, line numbers, and a file-by-file walkthrough by default; inspect them privately as evidence and show them only when the learner asks or they are essential to the current step. Do not let technical citations interrupt a beginner's first explanation.

This also applies to tool names, internal events, message formats, and file extensions: never present identifiers such as `write_section`, `doc`, `.tsx`, or `.ts` as the explanation. Describe their job and effect in normal language instead. For example, if the code confirms it, explain that the assistant can change lesson text using an allowed action, rather than naming the action; explain that the page shows the updated lesson, rather than naming an internal signal. Do not introduce an unfamiliar mechanism unless it helps answer the learner's question.

When explaining where information is stored, use a familiar analogy and clearly distinguish the text shown on a page, information stored by the app, and an actual file on the computer only when relevant. For example, if verified: "The lesson text is kept in the app's storage, like a note in a filing cabinet. When you ask the assistant to change it, the previous version is kept so you can return to it." Don't assert storage or versioning behavior without evidence.

For an actually verified calendar flow, an appropriate first response is: "Представь обычный календарь на стене. Когда ты его открываешь, приложение показывает дни месяца и добавляет к каждому дню твои дела. Давай разберём, как оно понимает, какое дело к какому дню относится?" Continue only after the learner responds. Do not describe unverified details as fact; adjust the example to the actual project.

Before sending each message, silently check: would someone with no programming experience understand every important word? Does the message contain only one main idea and at most one question? If not, rewrite it. When the learner explicitly asks for code or a technical deep dive, follow that request and explain the unfamiliar terms as they appear.

For a calendar that actually works this way, a suitable first step is: "Когда ты открываешь календарь, страница просит приложение найти твои задачи. Приложение берёт их из хранилища и показывает на нужных датах. Хочешь разберём, как оно их находит?" This is a style example, not a claim about the user's project. Introduce actual code names or file links only when useful for the current step or when the learner asks; explain each in plain language. Never dump an implementation trace unless the learner explicitly asks for technical detail.

## Inspect before explaining

Read the applicable project instructions. Inspect the relevant project structure, manifests, entry points, configuration and source code; for a feature, follow the relevant execution or data path across files. Use existing docs and tests as clues, but verify claims against implementation. For large repositories, sample the main components first and investigate only enough to answer; do not claim to have read every file. Avoid accessing or exposing secrets or personal data.

## Use a low-cost model throughout

Use a low-cost, capable available model for the entire workflow: project inspection, explanations, follow-up questions, and the learner's subsequent turns. If the environment can select the main model, select the least expensive suitable available option when pricing and availability are known. If the current session's model cannot be changed, explain this once and tell the user how to select an available lower-cost model or start a new session; do not pretend the current model has changed.

If a low-cost subagent can be selected, delegate bounded read-only inspection and drafting to it when useful. Supply the user's question and scope; ask for concrete file and line references, observed behavior, uncertainties, and a beginner-friendly explanation. Avoid expensive-model review, unnecessary parallel agents, and deep research. A low-cost subagent does not make the main agent or later turns low-cost; say so if relevant. Never guess prices or claim to have selected the cheapest model without reliable cost information. If the user continues with the current model, use the available capabilities honestly, without claiming the low-cost requirement is satisfied. Respect platform permissions and do not change account settings or assume access to paid models.

## Explain clearly

After the user chooses a topic, start with what the requested feature does for its user. Over successive turns, describe relevant parts and how they interact, and when useful walk through a real action from beginning to end, grounded in the actual code. Explain unfamiliar terms in everyday language when first used. Use concrete, familiar analogies where they make an idea clearer, explicitly map each analogy back to the real components, and avoid suggesting that the analogy is literally how the software works.

Keep track of the source files behind claims and provide relevant file paths and line numbers when they help the learner or when requested, without letting citations dominate the explanation. Keep code excerpts short and only when they help. Distinguish verified behavior from inference, intended behavior, incomplete code, and unknowns; do not claim a service is running or a feature works solely because its code exists. If the project is empty or contains only plans, explain what is actually present rather than inventing an implementation.

Keep each message approachable and proportionate; expand only as the user asks or the conversation requires. Create a guide file only if the user explicitly asks for one.
