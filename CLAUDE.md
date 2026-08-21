# Global Operating Principles

Personal defaults for every Claude Code session, regardless of project (BC development, automation scripts, content tooling, personal projects). Project-level CLAUDE.md files add specifics on top of this — they don't need to repeat it.

## 1. Workflow
- Plan mode by default for anything non-trivial (3+ steps or an architectural decision). Skip it for one-line fixes.
- If something goes sideways mid-task, STOP and re-plan rather than pushing through.
- Write the spec/plan down before building — reduces back-and-forth.

## 2. Subagents
- Use subagents for research, exploration, or parallel work to keep the main context clean.
- One focused task per subagent.

## 3. Self-Improvement
- After I correct you on something, write the lesson to `tasks/lessons.md` in that project — not just in this session.
- Check `tasks/lessons.md` at the start of a session if it exists.

## 4. Verification Before Done
- Never mark something complete without proving it works (run it, check logs, show a diff).
- Ask yourself: would this pass review from a senior engineer? If not, say so before I ask.

## 5. Elegance, Balanced
- For non-trivial changes, pause once and ask "is there a cleaner way?" — but don't over-engineer simple fixes.
- If a fix feels hacky, say so explicitly rather than silently shipping it.

## 6. Autonomy on Bugs
- Given a bug report, logs, or a failing test: just fix it. Don't ask for hand-holding on the obvious steps.
- Flag it directly if something needs a decision only I can make — don't guess silently on that part.

## Task Management (for multi-step work)
- Plan first: write the plan to `tasks/todo.md`.
- Check in briefly before starting if the plan has real tradeoffs.
- Mark items complete as you go; summarize what changed at the end, not a play-by-play.

## Core Principles
- Simplicity first — smallest change that solves it.
- No band-aids — find the root cause, don't paper over it.
- Minimal blast radius — touch only what's necessary.
- If uncertain about intent, say what you assumed rather than guessing silently.

## Communication
- Direct and concise. Skip preamble and hedging.
- German or English is fine depending on context — match whatever I'm writing in.

## Project Context — GardenPlaner

Non-code content (feature docs, backlog/ideas, commercialization strategy) lives in the SecondBrain vault, not in this repo — managed via Cowork, not here:

`~/Documents/SecondBrain/01_Projekte/GardenPlaner/`
- `_GardenPlaner.md` — project overview, entry point
- `GardenPlaner-Features.md` — current feature set (replaces the old `Features.md`/`gardenplaner_analyse.md`)
- `GardenPlaner-Feature-Ideen.md` — backlog/brainstorm, tagged by commercialization path (replaces the old `Implementation.md` backlog)
- `GardenPlaner-Verkaufsstrategie.md` — go-to-market plan (B2C/B2B/SaaS), rollout phases, legal checklist

Before starting feature or roadmap work, check these notes for current priorities and context. `Issues.md` in this repo stays here — it's code-relevant (bug tracking with file:line references), not product/business content.
