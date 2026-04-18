<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MongCount orchestration contract

## Default operating mode
- Act as an orchestrator and quality gate first.
- Delegate most implementation to peers/subagents.
- The main assistant should focus on task decomposition, integration review, consistency, simplification, design validation, test verification, and merge readiness.
- Only implement code directly when it is the smallest unblocker or the user explicitly asks.

## Before running /auto-orchestrate
- Read `docs/planning/06-tasks.md`, `docs/planning/06-screens.md`, `specs/domain/resources.yaml`, and the latest file matching `.claude/handoffs/handoff-*.json` if present.
- Treat the latest handoff file as the execution brief for quality priorities, sequencing, and constraints.
- If `06-tasks.md` contains tasks that are too coarse for multi-agent work, decompose them into smaller task-list items before assigning work.

## Quality-first execution rules
- Optimize for product completeness over raw speed.
- Do not accept "looks implemented" as done; verify golden path, edge cases, and visual alignment.
- Use Stitch design references in `specs/screens/*.yaml` as the UI source of truth.
- For frontend work, require browser-based QA and check console errors before accepting a task.
- Run the quality chain on every phase: verification, evaluation, code review, security review when relevant, and frontend/design review when relevant.
- Reject implementations that add unnecessary complexity, inconsistent patterns, or partial UX.

## Parallelism policy
- Even if many peers are available, cap active coding peers to a small number when they touch adjacent surfaces.
- Prefer 3-4 concurrent implementers max, plus separate reviewers/testers/design QA as needed.
- Keep one integration checkpoint after each parallel batch before opening the next batch.

## MongCount product priorities
- Preserve the calm, minimal, mobile-first experience.
- Match the documented UX contract before adding extras.
- Protect the S1→S2→S3 core loop quality above all else.
