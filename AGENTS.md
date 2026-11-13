# AGENTS.md

## Scope

Work confined to this repository. Reads, writes, and commands all stay inside the project root; anything above it is off-limits, and reaching outside it is something to ask about first.

Scratch lives in `.tmp/` at the project root — one directory, already gitignored. Every temporary artifact (drafts, generated output, debug logs, probe scripts) goes there, so the worktree ends up exactly as the user left it. Files that are part of the change itself go to their real home in the tree, not to `.tmp/`.

## Git

`main` is the protected trunk: every change reaches it through a pull request, never through a direct commit or push. Creating a branch, committing on it, pushing it, and opening the PR is the whole of your git write access — the merge belongs to the reviewer.

**Look before you write.** `git --no-pager log`, `diff`, `status`, `show`, and `branch -a` are free. Before anything that changes history, run `git --no-optional-locks status --short --branch` and `git branch --show-current`, and know which branch you are on and what is already staged.

**Never write to the trunk.** No `git commit` while on `main`/`master`, no `git push origin main`, no `--force` against a protected branch, no local `git merge` into it, no pushing tags from it, no deleting it. This holds for a one-line fix, a revert, or "just this once" — if the only way forward is a direct trunk commit, stop and say so. Treat `release/*`, `hotfix/*`, and any branch CI deploys from as protected too.

**Start from a branch.** If the work would land on a protected branch, switch first: fetch, then `git switch -c agent/<slug>` off an up-to-date `origin/main`. Name it after the change, not just the ticket — `agent/fix-login-timeout`, `agent/feat-pr-only-policy`. One logical change per branch; unrelated cleanup gets its own. Don't branch off another agent's unmerged work unless asked.

**Commit deliberately.** Stage explicit paths — `git add src/a.ts docs/b.md` — never `git add -A`, `git add .`, or `git commit -a`, which sweep in the user's in-progress edits, untracked files, and anything else lying around. Commit after validation, not before. Message in conventional form, `type(scope): imperative summary`, with a body that explains why the change is needed and which commands you ran (`npm test`, `cargo test`, `tsc --noEmit`) with their outcome. Never commit `.env`, credentials, tokens, keys, large binaries, or generated output; never pass `--no-verify` or otherwise skip hooks — fix what the hook reports, or report it. `.tmp/` stays out of every commit; if it turns out not to be ignored, that is a config change to ask about, not something to commit.

**Published history is append-only.** Once a branch is pushed, don't `amend`, `rebase`, `reset`, or `filter-branch` it; add follow-up commits instead. If a rewrite is genuinely required, ask first and use `--force-with-lease`, never bare `--force`.

**Push, then open the PR.** `git push -u origin <branch>`, then open it against `main` — `gh pr create --base main --head <branch> --title ... --body ...`, or hand over the compare URL when `gh` is missing or unauthenticated. Draft for incomplete work, ready for review otherwise. The body covers what changed and why, the files and areas touched, validation commands with their results, risk and rollback, and any follow-up left open. Reference the issue when one exists, and keep the PR short enough to review in one sitting — split it rather than bundling.

**You don't merge.** Never self-approve, never enable auto-merge, never run `gh pr merge` on your own PR, and never mark a draft ready on a reviewer's behalf. Keep the branch up to date when asked; after that the reviewer decides.

**Sync carefully.** `git fetch origin` to see remote state — not `git pull` into a branch with local commits. Rebase onto `origin/main` only when asked, or when the branch is clearly stale and the operation is clean. A conflict you did not create is reported, not negotiated.

**Destructive commands are hand-offs.** `reset --hard`, `clean -fd`, `stash`, `restore`, branch deletion, remote or config edits, and hook changes can erase work that isn't yours. Ask before any of them, even when they look harmless.

**When the push is blocked.** No credentials, no network, no write permission (fork-only repo): commit locally on the branch, prepare the PR title and body, and put the exact `git push` and PR-creation commands in your final message. Say plainly which step you could not complete.

**Final message.** Name the branch and its commits, give the PR URL or the prepared description, list what validation ran, and point the reviewer at what matters. If the PR is open, say what it is waiting on.
