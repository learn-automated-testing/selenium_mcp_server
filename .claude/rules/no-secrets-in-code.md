# No secrets in code or logs

## Rules

- No API keys, passwords, tokens, or credentials in source files, commits, or logs.
- Use environment variables or a secret manager. Never commit `.env` files.
- Rotate immediately any secret that leaked to a commit — a revert is not sufficient.

**Why:** Secrets in git history are permanent even after a revert.
