---
name: explain
description: Explain how the current project, a feature, or a code path works in plain language for a beginner. Use when the user wants to understand an existing codebase or how its parts work together.
---

# Explain the project

Help the user understand their actual project, especially code created with AI agents. Respond in the user's language. Default to a beginner-friendly explanation in chat. Answer the specific question or cover the project as a whole when no narrower scope was given. This is read-only: do not edit code, run the application, install dependencies, or create documents unless the user requests it.

## Inspect before explaining

Read the applicable project instructions. Inspect the relevant project structure, manifests, entry points, configuration and source code; for a feature, follow the relevant execution or data path across files. Use existing docs and tests as clues, but verify claims against implementation. For large repositories, sample the main components first and investigate only enough to answer; do not claim to have read every file. Avoid accessing or exposing secrets or personal data.

If subagent delegation and model selection are available and permitted, delegate the code inspection and first explanation to the least expensive suitable available model whose availability and pricing can be verified. Give it the user's question and a bounded scope; request concrete file and line references, observed behavior, uncertainties, and a beginner-friendly explanation. Verify key claims against the files before reporting. Never guess model prices or claim the cheapest model was used without evidence; model selection may not be available in the current environment. If delegation or selection is unavailable, investigate using the current agent and briefly disclose the limitation instead of blocking or claiming delegation took place. Do not alter user settings or assume access to paid models.

## Explain clearly

Start with what the project or requested feature does for its user. Describe its main parts and how they interact, then walk through one real action from beginning to end, grounded in the actual code. Explain unfamiliar terms in everyday language when first used. Use concrete, familiar analogies where they make an idea clearer, explicitly map each analogy back to the real components, and avoid suggesting that the analogy is literally how the software works.

Link or cite the most useful file paths and line numbers where available, identifying what each does. Keep code excerpts short and only when they help. Distinguish verified behavior from inference, intended behavior, incomplete code, and unknowns; do not claim a service is running or a feature works solely because its code exists. If the project is empty or contains only plans, explain what is actually present rather than inventing an implementation.

Make the answer approachable and proportionate: start with the big picture and the most important flow, not an exhaustive file-by-file tour. Let the user ask to explore any part in more detail. Create a guide file only if the user explicitly asks for one.
