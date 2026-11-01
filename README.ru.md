# PushkinCode Skills

[English](README.md) | **Русский**

Навыки и общие правила для работы с проектами. `spec` помогает подготовить
спецификацию и дорожную карту, `how` — разобраться в устройстве проекта. Общие
правила автоматически применяются во всех проектах выбранного агента.

## Установка

Нужны Node.js 18 или новее, npm, Git и доступ к GitHub. Откройте терминал в
папке проекта и выполните одну команду:

```bash
npx github:pushkincode/skills
```

Сначала выберите русский или английский язык, затем агента. Все дальнейшие
вопросы и сообщения установщика будут показаны на выбранном языке. Глобальные
правила также установятся на этом языке.

Установщик добавит навыки в текущий проект и общие правила в пользовательскую
конфигурацию выбранного агента:

| Агент | Навыки проекта | Глобальные правила |
|---|---|---|
| Codex | `.agents/skills` | `$CODEX_HOME/AGENTS.md` или `~/.codex/AGENTS.md` |
| Claude Code | `.claude/skills` | `$CLAUDE_CONFIG_DIR/rules/pushkincode` или `~/.claude/rules/pushkincode` |
| Kimi Code CLI | `.agents/skills` | `$KIMI_CODE_HOME/AGENTS.md` или `~/.kimi-code/AGENTS.md` |
| OpenCode | `.agents/skills` | `$XDG_CONFIG_HOME/opencode/AGENTS.md` или `~/.config/opencode/AGENTS.md` |

Codex, Kimi и OpenCode получают управляемый блок внутри глобального
`AGENTS.md`; существующий текст вне этого блока сохраняется. Claude Code
получает отдельные файлы правил.

В Codex навыки вызываются как `$spec` и `$how`, в Claude Code — `/spec` и
`/how`, в Kimi Code CLI — `/skill:spec` и `/skill:how`. Если навыки или правила
не появились в текущей сессии, начните новую.

## Обновление и безопасность

Для обновления повторите команду и выберите тех же агентов. Установщик хранит
хеши установленных файлов:

- `.pushkincode-skills.json` — навыки текущего проекта;
- `~/.pushkincode-rules.json` — глобальные правила пользователя.

Если управляемый файл был изменён или удалён вручную, установка остановится до
перезаписи любых файлов. Чужие навыки, правила и текст вне управляемого блока
не перезаписываются. Символические ссылки внутри путей установки не
поддерживаются.

Для неинтерактивного запуска укажите язык и агента:

```bash
npx github:pushkincode/skills --lang ru --agent codex
npx github:pushkincode/skills --lang ru --agent claude
npx github:pushkincode/skills --lang ru --agent kimi
npx github:pushkincode/skills --lang ru --agent opencode
npx github:pushkincode/skills --lang ru --agent all
```

Для английской версии используйте `--lang en`.

Установщик работает с навыками в папке, из которой запущен. Доступность
отдельных функций навыков зависит от возможностей агента и модели.
