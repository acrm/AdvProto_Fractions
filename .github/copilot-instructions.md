# GitHub Copilot Instructions

**Chat language**: Russian.
**File content language**: English.

## Workflow

1. All AI chat must be in Russian.
2. Source code and documentation must be in English.
3. After each tracked change, bump the version:
   ```bash
   npm run bump:build -- --desc "description"
   ```
4. Sync docs after source changes.
5. Temporary files go in `tmp/` only. Clean up after use.
6. Follow Clean/DDD architecture boundaries strictly.
