---
name: Taxi B&B deploy path (GitHub → Railway)
description: How to push the Taxi B&B repo to GitHub so Railway auto-deploys, incl. lost-SSH-key recovery and the LFS pre-push hook gotcha
---

# Deploying Taxi B&B: push to GitHub `main` → Railway auto-builds

**Rule:** The live site deploys via GitHub. Pushing to `main` of `github.com/fpissaip-source/Taxibbessen` triggers a Railway build (~3-5 min). There is no other deploy trigger.

# Recovering push access after an environment reset

**Rule:** Replit environment resets WIPE `~/.ssh/` — any manually-created deploy key (earlier sessions used `~/.ssh/taxibb_key`) is gone and cannot be recovered. The repo's GitHub remote allows anonymous READ (`ls-remote` works) but NOT push (HTTPS password auth is disabled by GitHub).

**Why:** Don't waste time hunting for the old key or assuming the Replit-managed `subrepl-*` remote can push — its read worked but push returned "Invalid username or token. Password authentication is not supported."

**How to apply:** Use the **GitHub integration** instead of asking the user for a token/key:
1. `searchIntegrations("github")` → propose `connector:ccfg_github_...` via `proposeIntegration` (one-tap OAuth, scopes include `repo`). This exits the agent loop AND triggers the turn-end checkpoint that commits your working changes — so by the time you push next loop, your edits are already committed.
2. After connect, in code_execution: `const token = (await listConnections('github'))[0].settings.access_token;` (never print it).
3. Push via a credential helper that reads the token from an env var (keeps it out of argv/logs), and scrub the token from any console output:
   ```js
   const helper = `!f() { echo "username=x-access-token"; echo "password=$GH_TOKEN"; }; f`;
   cp.execSync(`git -c credential.helper='${helper}' push --no-verify https://github.com/fpissaip-source/Taxibbessen.git HEAD:main 2>&1`,
     { cwd:'/home/runner/workspace', env:{...process.env, GH_TOKEN: token}, encoding:'utf8' });
   ```

# Git LFS pre-push hook blocks the push (git-lfs not installed)

**Rule:** The repo has a `pre-push` hook for Git LFS, but `git-lfs` is NOT on PATH in the Replit env, so a normal push fails: "This repository is configured for Git LFS but 'git-lfs' was not found... failed to push some refs." Use `git push --no-verify` to skip the hook.

**Why:** Only ONE file is LFS-tracked — `taxi_public.tar.gz` (an old build tarball, per `.gitattributes`). Code/image commits never touch it, so there are no LFS blobs to upload and skipping the hook is safe. Installing git-lfs also works but is slower/unnecessary.

**How to apply:** Before relying on `--no-verify`, confirm your push range doesn't modify LFS-tracked files (`git diff <remote-main>..HEAD --stat` — only `taxi_public.tar.gz` is LFS). If it ever does, install git-lfs instead of skipping.

# Note: main agent cannot `git commit`

**Rule:** Main agent is blocked from running `git commit` directly; rely on the turn-end auto-checkpoint to commit working-tree changes, then `git push` (no force) on a later loop. `git add`/`push`/`ls-remote` are allowed.
