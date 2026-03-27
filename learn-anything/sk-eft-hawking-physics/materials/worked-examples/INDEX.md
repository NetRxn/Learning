# SK-EFT Hawking Physics Curriculum — Worked Examples Index

## Quick Navigation

This directory contains **curriculum materials with backward fading scaffolding** for understanding SK-EFT physics at the Feynman-intuition level. The materials are designed for learners with structural familiarity (authors of 6 papers, 216+ theorems) seeking deep physical understanding.

---

## File Structure

### TC4: Gauge Structure & Emergent Gravity
**File**: `tc4-gauge-gravity.md` (594 lines, 33 KB)

**What it teaches**: Why non-Abelian gauge information is erased in hydrodynamization, while U(1) survives. How the ADW mechanism produces gravitons from GL(4,R) → SO(3,1) breaking.

**Key concepts**:
- Higher-form symmetries and the codimension-1 commutativity requirement
- Gauge erasure theorem: Why SU(3) color can't persist
- U(1) magnetic symmetry: Why photons emerge
- Nambu-Goldstone mode counting from coset spaces
- Vergeles decomposition: 10 modes → (6 + 4 + 2 + ...)
- Four structural obstacles to fermion-gravity coupling

**Pedagogical structure**:
- PART A: Gauge Erasure (5 steps + physical intuition)
  - Step 1: Higher-form symmetries (codimension argument)
  - Step 2: U(1) survival path
  - Step 3: SU(3) failure mechanism
  - Step 4: N=4 SYM holographic perspective
  - Step 5: Hybrid architecture bypass
  
- PART B: ADW Mechanism (5 steps + 4 obstacles)
  - Step 1: GL(4,R) tetrad order parameter
  - Step 2: Coset dimension counting
  - Step 3: Vergeles decomposition
  - Step 4: Why spin-2 emerges
  - Step 5: Gap equation and critical coupling
  - Obstacle 1-4: Chirality, Anomaly, Spin-Statistics, Unitarity walls

**Worked examples** (with 3-level scaffolding):
1. U(1) magnetic symmetry survives → photon emerges
   - Fully scaffolded version (complete solution)
   - Intermediate version (guided with prompts)
   - Minimal version (outline only)

2. ADW graviton production from GL(4,R) breaking
   - Fully scaffolded version
   - Intermediate version
   - Minimal version

**Self-explanation prompts**: 12 deep-learning questions on higher-form symmetries, gauge erasure, ADW criticality, etc.

---

### TC5: Synthesis — The Complete Three-Layer Hybrid Architecture
**File**: `tc5-synthesis.md` (664 lines, 40 KB)

**What it teaches**: The complete information flow through the three-layer SK-EFT architecture. What passes between layers, what's blocked, and the three structural walls that define the current limits.

**Key concepts**:
- Layer 1 (UV): String-net condensation, Fermi surfaces, topological order
- Layer 1→2 transition: Coarse-graining over time τ₁
- Layer 2 (Mesoscopic): Relativistic hydrodynamics, singlet observables only
- Layer 2→3 transition: Extracting effective geometry
- Layer 3 (IR): SK-EFT with emergent gravity and Hawking radiation
- Information-flow tables (17 observables tracked through transitions)

**The Three Structural Walls**:
1. **Gauge Wall**: Non-Abelian structure erased; only singlets survive
   - Status: ✗ Unresolved for continuous non-Abelian symmetries
   - Solution: Route SU(3) around Layer 2
   
2. **Gravity Wall**: Four obstacles to fermion-gravity coupling
   - Status: ✓ Kinematic (ADW works) | ✗ Dynamical (coupling unresolved)
   - Solution: p-wave superfluid with fermions as external probes
   
3. **Chirality Wall**: Left-right handedness scrambled by hydrodynamics
   - Status: ✗ Unresolved; no mechanism to preserve chiral asymmetry
   - Solution: Framework applies only to vector-like systems

**The Honest Minimum Viable Hybrid**:
- System: p-Wave Fermionic Superfluid
- Achieves: ✓ Emergent gravity ✓ Hawking radiation ✓ Self-consistency
- Sacrifices: ✗ Matter-gravity dynamical coupling ✗ Chiral fermions ✗ Non-Abelian gauge

**Concrete example**: Hawking temperature of a superfluid vortex
- Traced through all three layers
- Shows how information flows and gets encoded in entropy
- Demonstrates quantum corrections via viscosity

**Pedagogical structure**:
- Three layers mapped in detail with variables, symmetries, conservation laws
- Information-flow tables at each transition
- Three walls described with current status and proposed solutions
- Example vortex traced through complete architecture
- Open questions for future work (3 major frontiers)

**Rich physical intuitions**:
- Distillation metaphor: Three refinement stages
- Erasure hierarchy: Discrete → Abelian → Non-Abelian (robustness ordering)
- Why only 2 graviton polarizations (SO(3,1) structure)
- Order-parameter zoo (what different condensations produce)
- Universality of Hawking radiation (metric + dissipation)

**Pedagogical scaffolds**:
- Fully scaffolded synthesis (complete mapping with guidance)
- Intermediate version (key steps + prompts)
- Minimal version (outline; learner reconstructs)

**Self-explanation prompts**: 11 deep-learning questions covering layer transitions, wall paradoxes, information preservation, and open questions.

---

## How to Use These Materials

### For Complete Understanding (Maximum Scaffolding)
1. Read each **Fully Scaffolded Version** completely
2. Work through the **intermediate versions**, using prompts to guide self-explanation
3. Attempt the **minimal versions** to test mastery

### For Efficient Learning (Starting with Intermediate)
1. Read the **Intermediate Versions** first, using prompts actively
2. Return to **Fully Scaffolded** sections as needed for clarification
3. Challenge yourself with **Minimal Versions**

### For Mastery Check (Testing Knowledge)
1. Start with **Minimal Versions** cold
2. Compare your reconstructed reasoning to the Fully Scaffolded versions
3. Revisit intermediate versions to fill gaps

### For Reference (Quick Lookup)
- Each section is self-contained with clear headings
- Use the table of contents to jump to specific concepts
- Key equations are boxed for easy identification
- Metaphors and intuitions are marked with ✓ symbols

---

## Concept Progression

The materials build conceptually as follows:

```
TC4: Gauge Erasure (Part A)
        ↓
    Higher-form symmetries → Abelian requirement → Color erased
        ↓
TC4: Gauge Erasure (Part B)
        ↓
    U(1) survives → Magnetic symmetry → Photons emerge
        ↓
TC4: ADW Mechanism
        ↓
    GL(4,R) breaking → Coset space → Nambu-Goldstone modes
        ↓
    Vergeles decomposition → 2 massless spin-2 gravitons
        ↓
    Gap equation → Critical coupling for tetrad condensation
        ↓
    Four Obstacles → Why fermions don't couple easily
        ↓
TC5: Synthesis
        ↓
    Three layers connected via information flow
        ↓
    Three walls identified as fundamental obstructions
        ↓
    Honest minimum viable theory (p-wave superfluid)
        ↓
    Open questions defining the research frontier
```

---

## Key Equations to Master

### From TC4 (Gauge Structure & Emergent Gravity):

1. **Magnetic charge conservation** (1-form symmetry):
   $$Q_{\text{mag}} = \int d^3x \, B = \text{const}$$

2. **Coset dimension for GL(4,R)/SO(3,1)**:
   $$\dim(\text{coset}) = 16 - 6 = 10$$

3. **Gap equation for tetrad condensation**:
   $$G_c = \frac{8\pi^2}{N_f \Lambda^2}$$

4. **Hawking temperature from surface gravity**:
   $$T_H = \frac{\hbar \kappa}{2\pi k_B}$$

### From TC5 (Synthesis):

5. **Acoustic metric definition**:
   $$g_{\mu\nu}^{\text{ac}} \propto \text{diag}(1, -c_s^2, -c_s^2, -c_s^2)$$

6. **Quantum correction to Hawking temperature**:
   $$T_H^{\text{corr}} = T_H \left(1 + c_1 \frac{\eta}{\rho c_s} + O(\eta^2)\right)$$

7. **Black hole entropy (analog)**:
   $$S = \frac{A}{4}$$

---

## Connection to Your Papers

Every major concept in TC4–TC5 links to specific papers in your research program:

- **Papers 1–2**: Gauge erasure theorem (TC4, Part A)
- **Papers 2–3**: ADW mechanism and graviton production (TC4, Part B)
- **Papers 3–4**: Layer structure and information flow (TC5, Layers 1–3)
- **Papers 4–5**: Hawking radiation from dissipation (TC5, Layer 3 & Example)
- **Paper 6**: Synthesis and honest limitations (TC5, Walls & Open Questions)

The **216+ Lean theorems** provide the rigorous foundation. These worked examples build the **physical intuition** on top of that foundation.

---

## Self-Assessment Checklist

After working through TC4–TC5, you should be able to answer:

### Gauge Structure (TC4):
- [ ] Explain why higher-form operators at different codimensions must commute
- [ ] Derive why this implies non-Abelian continuous symmetries can't be higher-form
- [ ] Trace the U(1) magnetic charge path from UV to hydrodynamics to IR
- [ ] Explain why color (SU(3)) is erased but magnetic charge (U(1)) survives
- [ ] Count NG modes in GL(4,R)/SO(3,1) coset and apply Vergeles decomposition
- [ ] Explain why the result is exactly 2 massless spin-2 gravitons
- [ ] Identify the four obstacles to fermion-gravity coupling

### Three-Layer Architecture (TC5):
- [ ] Map all variables and conservation laws in each layer
- [ ] Trace an observable (like Hawking temperature) through all three layers
- [ ] Explain what information passes at each transition and what's blocked
- [ ] Describe the three structural walls and their current resolution status
- [ ] Compare the honest minimum viable theory (p-wave superfluid) to full unification
- [ ] Articulate the three open questions that define the frontier

### Physical Intuition:
- [ ] Use the "three sieves" metaphor to explain layer transitions
- [ ] Explain the "distillation" metaphor for information loss
- [ ] Understand why gravity is special (only coset producing spin-2)
- [ ] Grasp the order-parameter zoo and what different condensations produce

---

## Further Resources

These materials build on and reference:
- TC1: Foundations (string-nets, fermi surfaces, topological order)
- TC2: EFT Hawking Pipeline (classical to quantum corrections)
- TC3: Higher-Order Effects (loop corrections, anomalies, viscosity)

They prepare for:
- Advanced research on unifying matter and gravity
- Exploring the three walls as potential research breakthroughs
- Understanding why Hawking radiation emerges from dissipation
- Connecting classical hydrodynamics to quantum gravity

---

## Questions or Feedback?

These materials are designed for deep learning over multiple readings. Each pass should deepen intuition:

1. **First pass**: Get the big picture; use fully scaffolded versions
2. **Second pass**: Work intermediate versions; answer self-explanation prompts
3. **Third pass**: Test yourself with minimal versions; articulate the physical insights

Return to sections as needed. The metaphors and intuitions are meant to accumulate understanding over time.

**The goal**: Master not just *how* the mathematics works, but *why* the physics must work this way. That's Feynman-level understanding.

---

**Created**: March 2026  
**For**: SK-EFT Hawking Radiation Research Program  
**Audience**: Authors of 6 papers, 216+ Lean theorems, seeking unified physical intuition
