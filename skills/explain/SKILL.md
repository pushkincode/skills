---
name: explain
description: Explain how the current project, a feature, or a code path works in plain language for a beginner. Use when the user wants to understand an existing codebase or how its parts work together.
---

# Explain the project

Help the user understand their actual project, especially code created with AI agents. Respond in the user's language. Default to a beginner-friendly explanation in chat. Answer the specific question or cover the project as a whole when no narrower scope was given. This is read-only: do not edit code, run the application, install dependencies, or create documents unless the user requests it.

## Inspect before explaining

Read the applicable project instructions. Inspect the relevant project structure, manifests, entry points, configuration and source code; for a feature, follow the relevant execution or data path across files. Use existing docs and tests as clues, but verify claims against implementation. For large repositories, sample the main components first and investigate only enough to answer; do not claim to have read every file. Avoid accessing or exposing secrets or personal data.

## Use a low-cost model throughout

Use a low-cost, capable available model for the entire workflow: project inspection, explanations, follow-up questions, and the learner's subsequent turns. If the environment can select the main model, select the least expensive suitable available option when pricing and availability are known. If the current session's model cannot be changed, explain this once and tell the user how to select an available lower-cost model or start a new session; do not pretend the current model has changed.

If a low-cost subagent can be selected, delegate bounded read-only inspection and drafting to it when useful. Supply the user's question and scope; ask for concrete file and line references, observed behavior, uncertainties, and a beginner-friendly explanation. Avoid expensive-model review, unnecessary parallel agents, and deep research. A low-cost subagent does not make the main agent or later turns low-cost; say so if relevant. Never guess prices or claim to have selected the cheapest model without reliable cost information. If the user continues with the current model, use the available capabilities honestly, without claiming the low-cost requirement is satisfied. Respect platform permissions and do not change account settings or assume access to paid models.

## Explain clearly

Start with what the project or requested feature does for its user. Describe its main parts and how they interact, then walk through one real action from beginning to end, grounded in the actual code. Explain unfamiliar terms in everyday language when first used. Use concrete, familiar analogies where they make an idea clearer, explicitly map each analogy back to the real components, and avoid suggesting that the analogy is literally how the software works.

Link or cite the most useful file paths and line numbers where available, identifying what each does. Keep code excerpts short and only when they help. Distinguish verified behavior from inference, intended behavior, incomplete code, and unknowns; do not claim a service is running or a feature works solely because its code exists. If the project is empty or contains only plans, explain what is actually present rather than inventing an implementation.

Make the answer approachable and proportionate: start with the big picture and the most important flow, not an exhaustive file-by-file tour. Let the user ask to explore any part in more detail. Create a guide file only if the user explicitly asks for one.
