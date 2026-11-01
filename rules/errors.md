# Error handling

- Check errors and edge cases at the start of the function with guard clauses.
- Use early `return` for error branches; don't nest `if` deeply.
- Keep the happy path at the end for readability.
- Don't swallow errors. Return or propagate them to the caller.
- Log an error at the system boundary where it is handled. Don't log the same
  error repeatedly at every layer.
