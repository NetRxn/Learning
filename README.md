# Learning

Personal learning workspace powered by the [learn-anything](https://github.com/NetRxn/learn-anything) Claude Code plugin.

## What This Is

This repo is the **runtime workspace** where the learn-anything plugin stores all generated state and materials. Each skill I'm learning gets its own directory under `learn-anything/` containing pipeline artifacts (assessments, knowledge graphs, curricula, SRS cards, training materials) and Anki exports.

Although it's a public repo, the content generated is uniquely tailored to me, so I don't expect it to be broadly useful to others. The main purpose of making it public is to share the learn-anything plugin's capabilities and provide a reference for how it structures data and materials. 

The plugin itself lives in a separate repo — this repo is purely the working data it produces and operates on.

## Structure

```
learn-anything/
  active-skill.json          # tracks which skill is currently active
  <skill-slug>/              # one directory per skill being learned
    domain-assessment.json   # skill classification + learner profile
    skill-dossier.json       # decomposed sub-skills + dependency graph
    knowledge-graph.json     # dual-layer graph (skill deps + learner mastery)
    learning-plan.json       # sequenced curriculum with timelines
    srs-cards.json           # flashcards (exportable to Anki)
    progress.json            # training session history + mastery tracking
    *.apkg                   # Anki deck exports
    materials/               # generated exercises, worked examples, references
```

## Usage

Open this workspace (or a multi-root workspace that includes it) with the learn-anything plugin installed, then:

- **`/learn <topic>`** — start learning something new or resume an existing skill
- **`/train`** — jump into a training session for the active skill

The plugin's orchestrator handles everything else — routing through the pipeline, generating materials, tracking progress, and adapting to mastery level.

## Dependencies

- **Python 3.14+** with `genanki` — used by the Material Forge skill to export SRS cards as `.apkg` files for Anki import (optional)
- **Anki** (optional) — for spaced repetition review outside of Claude sessions
