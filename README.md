# PushkinCode Skills

**English** | [Русский](README.ru.md)

Skills and shared rules for working with projects. `spec` helps prepare a
specification and roadmap, while `how` explains how a project works. Shared
rules apply automatically in every project opened with the selected agent.

## Installation

Requirements: Node.js 18 or newer, npm, Git, and access to GitHub. Open a
terminal in your project directory and run:

```bash
npx github:pushkincode/skills
```

First select Russian or English, then select an agent. All subsequent prompts
and installer messages use the selected language. The global rule files are
installed in that language as well.

The installer adds skills to the current project and shared rules to the user
configuration of the selected agent:

| Agent | Project skills | Global rules |
|---|---|---|
| Codex | `.agents/skills` | `$CODEX_HOME/AGENTS.md` or `~/.codex/AGENTS.md` |
| Claude Code | `.claude/skills` | `$CLAUDE_CONFIG_DIR/rules/pushkincode` or `~/.claude/rules/pushkincode` |
| Kimi Code CLI | `.agents/skills` | `$KIMI_CODE_HOME/AGENTS.md` or `~/.kimi-code/AGENTS.md` |
| OpenCode | `.agents/skills` | `$XDG_CONFIG_HOME/opencode/AGENTS.md` or `~/.config/opencode/AGENTS.md` |

Codex, Kimi, and OpenCode receive a managed block inside the global
`AGENTS.md`; existing text outside that block is preserved. Claude Code
receives separate rule files.

In Codex, invoke skills as `$spec` and `$how`; in Claude Code, use `/spec` and
`/how`; in Kimi Code CLI, use `/skill:spec` and `/skill:how`. Start a new agent
session if newly installed skills or rules are not visible in the current one.

## Updates and safety

To update, run the same command again and select the same agents. The installer
stores hashes of installed files in:

- `.pushkincode-skills.json` for skills in the current project;
- `~/.pushkincode-rules.json` for global user rules.

If a managed file was changed or deleted manually, installation stops before
overwriting any files. Skills and rules from other sources, and text outside a
managed block, are never overwritten. Symbolic links inside installation paths
are not supported.

For non-interactive installation, specify the language and agent:

```bash
npx github:pushkincode/skills --lang en --agent codex
npx github:pushkincode/skills --lang en --agent claude
npx github:pushkincode/skills --lang en --agent kimi
npx github:pushkincode/skills --lang en --agent opencode
npx github:pushkincode/skills --lang en --agent all
```

Use `--lang ru` to install the Russian rule set and receive installer messages
in Russian.

The installer writes project skills into the directory where it is run.
Individual skill features depend on the capabilities of the selected agent and
model.
