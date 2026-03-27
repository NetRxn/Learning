# SK-EFT Hawking Radiation — Worked Examples with Backward Fading

## Overview

This directory contains three comprehensive worked examples designed for **discussion-based learning** of SK-EFT Hawking radiation research (6 papers, 216+ Lean theorems). Each file addresses a Task Class (TC) with:

- **One full worked solution** (complete derivation + physical intuition)
- **Six fading versions** (progressively less scaffolding)
- **Self-explanation prompts** (discussion starters at each step)
- **Key takeaways** (conceptual insights)
- **Further discussion prompts** (open-ended questions)

The learner is assumed to have structural familiarity with the papers but needs **Feynman-level physical intuition** and prefers to learn through discussion, not exam-style problems. Time budget: 30–60 min/day.

---

## Files

### 1. `tc1-foundations.md` — Physical Foundations
**Focus:** How does curved spacetime geometry emerge from fluid dynamics?

**Representative Problem:** Derive the acoustic metric from linearized Euler equations for a 1D transonic flow, and explain physically why Lorentzian signature emerges.

**Key Insight:** When a fluid flow exceeds the sound speed, the governing equations naturally produce a Lorentzian metric with an event horizon-like structure. Causality changes at the sonic point.

**Structure:**
- Step 1: Continuity + momentum conservation (master equations)
- Step 2: Decompose into background flow + perturbations
- Step 3: Linearize (drop second-order terms)
- Step 4: Derive the wave equation
- Step 5: Read off the acoustic metric
- Step 6: Interpret why Lorentzian signature emerges

**Fading Versions:**
- V2: 1D→conical flow (same physics, different geometry)
- V3: Barotropic→ideal gas with temperature (different equation of state)
- V4: 1D→3D without detailed calculation (conceptual reasoning)
- V5: Metric given; deduce Hawking analogue (intuition jump)
- V6: Design your own flow (open-ended challenge)

**Length:** 324 lines (≈20 min full read, ≈5-10 min per fading version)

---

### 2. `tc2-eft-hawking-pipeline.md` — EFT-to-Hawking Pipeline
**Focus:** How do symmetries constrain effective actions?

**Representative Problem:** Starting from 9 candidate first-order SK terms, show how three axioms (normalization, positivity, KMS) constrain to exactly 2 free parameters, and derive δ_diss = Γ_H/κ.

**Key Insight:** Fundamental symmetries (not experimental fitting) reduce a large space of possibilities to a tightly constrained effective action. The dissipative correction to Hawking temperature emerges naturally.

**Structure:**
- Step 1: Write the general 9-term SK effective action
- Step 2: Normalization eliminates pure-retarded terms (5→4 params)
- Step 3: Positivity constrains signs of dissipation (4 params, constraints)
- Step 4: KMS symmetry relates retarded/advanced sectors (→2 free params)
- Step 5: Compute effective Hawking temperature
- Step 6: Physical interpretation (what each parameter means)

**Fading Versions:**
- V2: Same story, Fermi liquid system (universal axioms)
- V3: Different axiom ordering (shows axioms aren't sequential)
- V4: Parameter counting without explicit calculation (dimension analysis)
- V5: Inverse problem—infer parameters from measurements (experiment)
- V6: Generalization to external bath at different temperature (open-ended)

**Length:** 310 lines (≈20 min full read, ≈5-10 min per fading version)

---

### 3. `tc3-higher-order.md` — Higher-Order Extensions
**Focus:** Why does the transport coefficient count follow a simple formula?

**Representative Problem:** Derive count(N) = ⌊(N+1)/2⌋ + 1 and explain why parity determines the pattern.

**Key Insight:** Parity symmetry forbids odd-spatial-derivative terms, cutting the number of possible terms roughly in half at each order. The counting is universal across all physical systems.

**Structure:**
- Step 1: Enumerate all N-derivative terms in SK action
- Step 2: Normalization kills half the terms
- Step 3: KMS constraints relate retarded/advanced
- Step 4: Count independent parameters after KMS
- Step 5: Explain why parity determines the pattern
- Step 6: Verify against N=1 (2 coeff) and N=2 (3 coeff)

**Fading Versions:**
- V2: Transport coefficients in plasma physics (universal formula)
- V3: Parity constraint visualized (draw real-space structures)
- V4: Combinatorial counting (count without enumeration)
- V5: Predicting coefficients from formula alone
- V6: Generalization to continuous symmetries (rotational, gauge)

**Length:** 468 lines (≈25 min full read, ≈5-10 min per fading version)

---

## How to Use These Materials

### For a Single 30-Min Session
1. Read **one full worked solution** (15 min).
2. Review **one or two fading versions** (10 min).
3. Discuss **one self-explanation prompt** (5 min).

### For a 60-Min Session
1. Read **one full worked solution** (20 min).
2. Work through **two fading versions** (20 min).
3. Discuss **3–4 self-explanation prompts + one further discussion prompt** (20 min).

### For a Multi-Day Learning Arc
**Day 1:** TC1 full solution + versions 2–3.  
**Day 2:** TC1 versions 4–6 + TC2 full solution.  
**Day 3:** TC2 versions 2–4 + TC3 full solution.  
**Day 4:** TC3 versions 2–6 + discussion synthesis.  

### For Discussion-Based Learning
Rather than solving problems independently, use the prompts as conversation starters:
- **Self-explanation prompts:** "What would happen if...?"
- **Further discussion prompts:** "Could the system ever...?" / "Why does the formula...?"
- **Fading versions:** "How would the argument change if...?"

The goal is to build intuition through dialogue, not calculation.

---

## Design Principles

### 1. **Full Solution First, Then Fading**
Each file begins with a complete worked example. The derivation is detailed, motivated at every step (asking "why?"), and written in Feynman style (simple words, visual language, conceptual clarity). Fading versions remove scaffolding progressively, forcing the learner to reconstruct reasoning.

### 2. **Backward Fading (Intermediate = 1 Step Removed)**
Fading strategy: V2 removes the last step, V3 removes step 5 and fades step 6, etc. Each version is 1-2 steps simpler than the previous, ensuring smooth progression.

### 3. **Surface Feature Variation**
Fading versions change surface features (different physical system, different equation, different parametrization) while keeping core structure intact. This builds transfer learning: students learn to recognize the same mathematical structure in different contexts.

### 4. **Feynman-Level Physical Intuition**
Every step includes a "Why?" box explaining the conceptual reason, not just the mathematical procedure. Emphasis on:
- **Visualization** (sonic horizons, causal structure, phase diagrams)
- **Intuitive language** (barriers, flows, energy loss)
- **Minimal jargon** (explain every specialized term on first use)

### 5. **Discussion-Based, Not Exam-Style**
No right/wrong answers. Prompts are open-ended:
- "Can you explain in your own words...?"
- "What would break if...?"
- "Could a system ever...?"
- "Is there a deeper reason...?"

The learner (author of 6 papers) is expected to generate novel insights, not regurgitate formulas.

---

## Learning Objectives

After completing these worked examples, you should be able to:

### TC1
- Explain how parity and causality determine whether a metric is Lorentzian or Riemannian.
- Sketch a transonic flow and identify the sonic horizon.
- Derive the acoustic metric from first principles for a custom flow geometry.

### TC2
- List the three fundamental axioms (normalization, positivity, KMS) and explain each.
- Count the free parameters in a SK effective action given the axioms.
- Compute the dissipative correction to Hawking temperature.

### TC3
- Explain why odd-parity terms vanish in parity-invariant theories.
- Derive the transport coefficient counting formula for any order N.
- Predict how many independent parameters survive in a higher-order EFT.

### Cross-Cutting
- Recognize the same mathematical structures across different physical systems.
- Use dimensional analysis and symmetry to constrain effective actions.
- Translate between abstract axioms (KMS, normalization) and physical quantities (temperature, viscosity).

---

## About the 6 Papers and 216+ Theorems

These worked examples are designed to illuminate the conceptual core of SK-EFT Hawking radiation research. The 216+ Lean theorems in the 6 papers formalize every step shown here:

- **Theorem:** The acoustic metric has Lorentzian signature when v₀ > c_s. (→ Step 6, TC1)
- **Theorem:** Normalization eliminates pure-retarded terms. (→ Step 2, TC2)
- **Theorem:** KMS forces exactly 2 free parameters at first order. (→ Step 4, TC2)
- **Theorem:** Parity forbids odd-spatial-derivative terms. (→ Step 5, TC3)
- **Theorem:** count(N) = ⌊(N+1)/2⌋ + 1. (→ Step 4, TC3)

These worked examples are the conceptual scaffolding; the papers provide formal proofs.

---

## Tips for Effective Learning

1. **Read the full solution aloud.** Hearing yourself speak the math aloud builds intuition faster than silent reading.

2. **Pause at each step.** Before moving to the next step, close the document and explain the current step to yourself or a colleague.

3. **Sketch diagrams.** For TC1 (flows), draw the background flow v₀(x), the sonic point, and the horizon. For TC2 (EFT), sketch the 9-term action and cross out terms as axioms eliminate them.

4. **Flip between the paper and this file.** The worked example is a conceptual map; the paper is the detailed terrain. Use this file to orient yourself, then dive into the proofs.

5. **Use fading versions for transfer.** After mastering TC1-foundations, rederive it for a 3D flow (V4) or a different EOS (V3). Test your understanding by generating new variants.

6. **Discuss with the community.** The further discussion prompts are open research questions. Bring them to seminars or discussions with colleagues.

---

## File Structure Summary

| File | Lines | Task Class | Focus | Key Formula |
|------|-------|-----------|-------|-------------|
| tc1-foundations.md | 324 | 1 | Acoustic metrics | $g_{\mu\nu}$ signature |
| tc2-eft-hawking-pipeline.md | 310 | 2 | EFT constraints | $\delta_{\text{diss}} = \Gamma_H/\kappa$ |
| tc3-higher-order.md | 468 | 3 | Transport counting | $\text{count}(N) = \lfloor(N+1)/2\rfloor + 1$ |

**Total: 1,102 lines of worked examples + 6 fading versions per file = comprehensive curriculum.**

---

## Contact & Feedback

These materials are designed for a learner with papers already written and theorems already proved. The goal is to illuminate the "why" behind the "what." If you have feedback on pacing, clarity, or coverage, please note it. This curriculum will evolve with your learning.

---

**Last Updated:** 2026-03-26  
**Designed for:** SK-EFT Hawking Radiation Physics Program  
**Learning Model:** Discussion-based, 30–60 min/day, Feynman-style intuition  

