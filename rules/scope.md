# Minimal change scope

- Change only what the task requires.
- Don't refactor along the way or reformat neighboring code without asking.
- Formatter and linter hooks may update nearby formatting. Don't revert their
  automatic changes merely to minimize the diff, but inspect them before
  handing off the result.
