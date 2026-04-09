# AI Agent Instructions

**Chat language**: Russian (all conversations with AI agents must be in Russian).
**File content language**: English (all source code, docs, and config files must be in English).

## Mandatory Rules

1. **Version Bump**: After any tracked change (source, config, docs), run:
   ```bash
   npm run bump:build -- --desc "short description"
   ```
2. **Docs Sync**: After changing source files, update relevant docs in `docs/`.
3. **Temporary Files**: Only create temp files in `tmp/`. Remove them after commit.
4. **Architecture**: Follow Clean/DDD boundaries — no business logic in `presentation/`.
5. **Commit**: Every bump creates a commit. Do not push manually; let the bump script handle commits.
