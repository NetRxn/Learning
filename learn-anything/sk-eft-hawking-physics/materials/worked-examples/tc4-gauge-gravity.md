# TC4: Gauge-Gravity Duality — Emergent Geometry from Broken Symmetries

## Overview

This worked example traces a stunning fact: **non-Abelian gauge structure cannot survive hydrodynamization, but spacetime geometry can emerge from symmetry breaking**. By understanding why color disappears while gravity appears, you'll see the deep structure of the hybrid architecture.

---

## Full Worked Solution: From Gauge Erasure to ADW Gravity

### Part A: Why Non-Abelian Gauge Charges Vanish

#### Step 1: The Physical Setup — Higher-Form Symmetries

A $k$-form symmetry is a conservation law tied to a $k$-dimensional surface. Examples:

**1-form symmetry** (tied to loops):
$$W_C = \text{Tr} \, P \exp \left( i e \oint_C A_\mu dx^\mu \right)$$

This is a **Wilson line**: the trace of a loop of gauge field. It measures whether a quark (carried around the loop) picks up a phase.

**For gauge theory**, the 1-form symmetry is the **global charge conservation**: you can't create or destroy gauge charges; you can only move them around.

> **Physical Insight**: A 1-form symmetry is a conservation law *per loop*, not globally. Imagine painting a loop on the fluid and saying "the flux through this loop is conserved." That's a 1-form symmetry.

#### Step 2: The Commutativity Constraint (Topological Fact)

Here's the crucial constraint: **Operators associated with different surfaces must commute** (if those surfaces don't intersect).

Mathematically: If $C_1$ and $C_2$ are two loops that don't link, then:
$$[W_{C_1}, W_{C_2}] = 0$$

This is not an assumption; it's a topological fact. Any violation would imply superluminal information transfer or causality violation.

#### Step 3: Why This Forbids Non-Abelian Symmetries

In a non-Abelian gauge theory like QCD with $SU(3)$ color, the generator $T^a$ (color index $a = 1, \ldots, 8$) satisfy:
$$[T^a, T^b] \neq 0$$

Different color charges don't commute.

But here's the contradiction: If $C_1$ and $C_2$ are two separate loops carrying different colors (say, one carries a red quark, the other carries a blue quark), then the operators $W_{C_1}$ and $W_{C_2}$ should **both be conserved** in an isolated system.

Yet if $[T^a, T^b] \neq 0$, then these operators don't commute, violating the topological requirement.

**Resolution**: The non-Abelian symmetry **cannot persist as a local symmetry** in the hydrodynamic (coarse-grained) regime. The color charge information is scrambled into the microscopic thermal bath.

> **Physical Insight**: Non-Abelian gauge symmetries are "fragile"—they break under coarse-graining. Only the **center of the group** survives: the elements that commute with everything. For $SU(3)$, the center is $Z_3$, a discrete group. Discrete symmetries are robust; continuous non-Abelian ones are not.

#### Step 4: U(1) Survives — The Photon Path

Electromagnetism is simpler: $U(1)$ is abelian. Wilson lines of different loops *do* commute:
$$[e^{i e Q_1}, e^{i e Q_2}] = 0$$

So the 1-form $U(1)$ symmetry survives hydrodynamization. The conserved charge is **electric charge** (and magnetically, **magnetic flux**).

In the low-energy effective theory (Layer 2), the photon emerges as the **Nambu-Goldstone boson** of a **broken magnetic 1-form symmetry**.

---

### Part B: The ADW Mechanism — Spacetime from Symmetry Breaking

#### Step 1: The Physical Setup — GL(4,R) and the Tetrad

In general relativity, the **vielbein** or **tetrad** $e^a_\mu$ encodes the relationship between tangent-space indices ($a$) and spacetime indices ($\mu$).

The tetrad has a **giant gauge symmetry**: $GL(4, \mathbb{R})$ — arbitrary invertible $4 \times 4$ matrices. This includes:
- Lorentz transformations (rotations and boosts)
- Dilations (scaling)
- Shears and squashing
- All possible linear transformations of the tangent space

**Count**: $GL(4, \mathbb{R})$ is a 16-dimensional group ($4 \times 4$ matrix = 16 parameters).

#### Step 2: The Order Parameter — Tetrad Condensation

Suppose the system condenses into a phase where the tetrad acquires a **classical expectation value**:
$$\langle e^a_\mu \rangle = e_0^a_\mu \neq 0$$

This **spontaneously breaks** $GL(4, \mathbb{R})$ down to the **Lorentz group** $SO(3,1)$:
- The Lorentz group elements preserve the metric: $g_{\mu\nu} = \eta_{ab} e^a_\mu e^b_\nu$
- Other GL(4,R) elements don't—they change the metric

> **Physical Insight**: When the tetrad condenses, spacetime "solidifies." The arbitrary linear transformations (GL(4,R)) are frozen out; only Lorentz rotations (SO(3,1)) remain as a symmetry.

#### Step 3: Counting Nambu-Goldstone Bosons

When $G$ breaks to $H$, the coset space $G/H$ parameterizes broken-symmetry directions. Each direction gets a **massless Nambu-Goldstone boson**.

$$\dim(G/H) = \dim(GL(4, \mathbb{R})) - \dim(SO(3,1)) = 16 - 6 = 10$$

**Naive expectation**: 10 massless NG bosons from GL(4,R) → SO(3,1) breaking.

But not all 10 become long-lived particles. Some are "eaten" by the Higgs mechanism (absorbed into the tetrad condensate).

#### Step 4: The Vergelis Decomposition — Which Modes Survive?

The 10 NG modes decompose under $SO(3,1)$ as:

$$10 = \underbrace{6}_{\text{spin-conn}} + \underbrace{4}_{\text{eaten}} + \underbrace{2}_{\text{massless}} + \ldots$$

- **6 modes**: Spin-connection modes (how the frame rotates spatially). These become massive—they're not propagating degrees of freedom.

- **4 modes**: Absorbed by the tetrad condensate via Higgs mechanism. These give mass to some would-be gravitons.

- **2 modes**: **Massless transverse gravitons**. These are the physical gravitational waves you measure.

> **Physical Insight**: The 2 surviving modes are the **two graviton polarizations**: plus-polarization (stretches one direction while squeezing perpendicular) and cross-polarization (rotates the stretching). These are the only gravitational waves in 4D spacetime.

#### Step 5: Why Spin-2?

The 2 massless modes transform as a **rank-2 symmetric traceless tensor** under $SO(3,1)$:
$$h_{\mu\nu} = h_{\nu\mu}, \quad h^\mu_\mu = 0$$

A rank-2 tensor in spacetime is called **spin-2**. This is because the transformation properties under spatial rotations match what we call "spin-2": an object that rotates like a double vector (tensor product of two vectors).

The metric perturbation $h_{\mu\nu}$ couples to the stress-energy tensor $T^{\mu\nu}$ (which is also rank-2). This matching is why gravity mediates forces: the tensor nature of both gravitons and stress-energy makes them couple naturally.

---

### Part C: The Four Obstacles to Including Fermions

The ADW mechanism beautifully produces gravity. But it breaks down when you try to include fermionic matter. Here are four fundamental walls:

#### Obstacle 1: The Chirality Wall

In the Standard Model, fermions are **chiral**: left-handed and right-handed components are distinct.

$$\psi_L \sim (2, 1)_{-1/2}, \quad \psi_R \sim (1, 2)_{1/2} \quad (\text{hypercharge})$$

**The problem**: When you coarse-grain from the microscopic (Layer 1) to the hydrodynamic (Layer 2) scale, left-right mixing randomizes the chirality. The distinction between $\psi_L$ and $\psi_R$ is scrambled into the thermal bath.

At the hydrodynamic level, you can only write down **vector-like** (left-right symmetric) operators. You lose the information needed to reconstruct chiral symmetry.

**Current status**: You must accept this loss. Your theory applies only to chiral-symmetric systems or to the vector part of fermionic interactions.

#### Obstacle 2: The Anomaly Wall

**Quantum anomalies** are obstructions to certain symmetries at the quantum level. The classic example: the **axial anomaly** in QED.

$$\partial_\mu j^{\mu,5} = \frac{e^2}{16\pi^2} F_{\mu\nu} \tilde{F}^{\mu\nu}$$

The divergence of the axial current is *not* zero at the quantum level—it's an anomaly.

**The problem**: In the hydrodynamic effective theory, anomalies appear as external constraints that cannot be derived from the effective action alone. If you try to couple emergent fermions to emergent gravity, you need to correctly account for which anomalies are "active."

Naive attempts lead to **inconsistent** equations of motion that violate unitarity.

**Current status**: You treat anomaly coefficients as external input from Layer 1, not as dynamical variables in Layer 2/3.

#### Obstacle 3: The Spin-Statistics Wall

Fermions satisfy **Pauli exclusion**: their wavefunctions are antisymmetric. Bosons are symmetric.

$$\psi(\mathbf{x}_1, \mathbf{x}_2) = -\psi(\mathbf{x}_2, \mathbf{x}_1)$$

**The problem**: The Nambu-Goldstone theorem requires the **order parameter** to be a Lorentz scalar (commuting field). A fermionic condensate $\langle \psi \rangle$ is not a scalar—it's a spinor, and spinors anticommute.

This breaks the standard NG argument. When fermions condense, the resulting NG modes are not simple. They **mix** with the fermionic excitations in a complicated way (Nambu-Goldstone-Higgs mixing).

**Current status**: You can use fermionic *bilinears* $\langle \bar{\psi} \psi \rangle$ (which are scalars) as order parameters, but this sacrifices direct information about the fermionic degrees of freedom.

#### Obstacle 4: The Unitarity Wall

General relativity is **non-renormalizable**. At high energies, loop diagrams generate terms with more derivatives:

$$S = \int d^4 x \sqrt{-g} \left( \frac{M_P^2}{2} R + \frac{\alpha}{M_P^2} R^2 + \frac{\beta}{M_P^2} R_{\mu\nu}^2 + \ldots \right)$$

These higher-derivative terms change the graviton propagator and introduce **ghost fields** (negative-norm states that violate unitarity).

**The problem**: If you try to derive gravity from a hydrodynamic theory coupled to fermions, quantum loops (from virtual fermions) generate these higher-derivative terms automatically. You cannot suppress them—they're generated by the theory's own quantum mechanics.

The result: **the effective theory is non-unitary** in the IR.

**Current status**: You accept that full matter-gravity coupling is unresolved. The framework works for gravity coupled only to topologically ordered matter (no dynamical fermions), or treats fermions as external probes.

---

## Self-Explanation Prompts

**On Gauge Erasure**:
1. We said non-Abelian symmetries are "fragile" under coarse-graining. But why? What's the mechanism that erases them? (Hint: think about thermalization and information scrambling.)

2. Discrete symmetries (like $Z_3$ center of $SU(3)$) survive. Why are discrete symmetries more robust than continuous ones?

3. In the hybrid architecture, you bypass the gauge erasure by routing gauge information around the hydrodynamic layer. How do you ensure the two routes stay consistent?

**On ADW Gravity**:
4. The tetrad $e^a_\mu$ is "dual" to the metric $g_{\mu\nu} = \eta_{ab} e^a_\mu e^b_\nu$. In classical GR, you can choose a Lorentz frame and work with a flat metric. Why does the tetrad become a fundamental order parameter in your theory?

5. The gap equation determines when the tetrad condenses. Can you derive a rough estimate of the critical coupling $G_c$?

6. Two graviton polarizations in 4D. Could there be a dimension where there are more or fewer? What about 2D, 5D, or 11D?

**On the Four Obstacles**:
7. Chirality is erased during coarse-graining. But the weak force *depends* on chirality. How would you describe weak interactions in your SK-EFT framework?

8. Anomalies are quantum effects. Do they persist at very low energies, or are they washed out by classical dissipation?

9. The spin-statistics theorem is sacred in QFT. Could an emergent gravity theory violate it at low energies (where gravity is classical)?

10. Unitarity violation from higher-derivative terms is a notorious problem in quantum gravity. Is your framework immune to this, or just honest about it?

---

## Connection to Project Files

- **`GaugeErasure.lean`** (11 theorems + 1 axiom): Formal proof that non-Abelian higher-form symmetries are forbidden. The proof is purely topological. The single axiom encodes the topological classification of defects.

- **`ADWMechanism.lean`** (21 theorems): Verification that breaking GL(4,R) → SO(3,1) produces 2 massless spin-2 gravitons. Includes the Higgs mechanism and the Vergeles decomposition. Phase classification (pre-geometric/condensed/broken).

- **`VestigialGravity.lean`** (18 theorems): **Paper 6 — now complete.** Formalizes the three-phase hierarchy: pre-geometric → vestigial → full tetrad. Proves that composite metric g_μν = η_ab⟨E^a_μ E^b_ν⟩ can have Lorentzian signature without coherent tetrad VEV. EP violation prediction formalized.

- **`ChiralityWall.lean`** (17 theorems): GS conditions vs TPF evasion fully classified. Three critical gaps identified and formalized.

- **Python**: `src/adw/gap_equation.py` (Coleman-Weinberg V_eff, critical coupling), `src/adw/fluctuations.py` (SSB pattern, NG modes), `src/vestigial/` (5 files: lattice_model.py, mean_field.py, monte_carlo.py, phase_diagram.py, finite_size.py).

- **Paper 5** (ADW gap equation, PRD format): Qualified positive result — nontrivial Lorentzian solution for G > G_c, 2 massless graviton modes as Higgs bosons. Four structural obstacles for emergent fermion bootstrap.

- **Paper 6** (vestigial gravity, PRD format): Lattice evidence for vestigial metric phase. Monte Carlo + mean-field confirm three-phase structure. EP violation prediction is the key experimental signature.

---

## Key Takeaways

1. **Non-Abelian gauge structure is topologically fragile.** The commutativity requirement for higher-form operators forbids non-Abelian continuous symmetries from surviving hydrodynamization.

2. **Spacetime geometry emerges from symmetry breaking.** When GL(4,R) breaks to SO(3,1), the coset space produces NG bosons. After Higgs absorption and parity constraints, 2 massless spin-2 modes remain—the graviton.

3. **There are limits to emergence.** Fermions, chirality, anomalies, and quantum unitarity impose hard walls. The framework is honest about these walls rather than pretending to solve them.

4. **The honest minimum viable system**: A fermionic superfluid with vector-like (non-chiral) interactions, coupled to emergent gravity via the ADW mechanism, correctly reproduces Hawking radiation and its dissipative corrections.

5. **Gauge-gravity duality has a microscopic mechanism.** It's not just AdS/CFT. It's the consequence of symmetry breaking when you coarse-grain from UV to IR.

---

## Further Discussion Prompts

- **Black hole microstate degeneracy**: In your theory, the entropy $S = A/4$ (area law) arises from what microscopic degeneracy?

- **Information paradox**: If information is erased by coarse-graining, does your theory predict information loss in black hole evaporation?

- **Cosmological constant**: Spacetime emerges with a metric. Does the theory predict a vacuum energy (cosmological constant)? If so, why is it tiny?

- **Dark matter**: Fermions that don't couple chirally—could they be a hidden sector that emerges as dark matter?

---

## Appendix: The Vergelis Decomposition (Sketch)

The 10 NG modes from GL(4,R)/SO(3,1) decompose into representations of SO(3,1):

| Sector | Dimension | Role | Fate |
|--------|-----------|------|------|
| Spin-connection | 6 | Rotation of frame | Become massive |
| "Eaten" by Higgs | 4 | Longitudinal gravitons | Absorbed into metric |
| Transverse gravitons | 2 | Physical waves | Massless propagation |
| (Fermionic) | (?) | Would-be spin-1/2 | Obstacles prevent |

The careful accounting of which modes survive is what makes the ADW mechanism work.

---

## Summary

Starting from GL(4,R) gauge freedom in the tetrad, you get:
- 10 NG modes from breaking to SO(3,1)
- 4 eaten by Higgs mechanism
- 6 become massive spin-connection
- 2 remain as massless gravitons

These 2 gravitons, plus the background metric structure from the condensed tetrad, give you emergent gravity coupled to a hydrodynamic fluid. Add the SK formalism for dissipation, and you can compute Hawking radiation and its corrections.

This is the heart of your SK-EFT framework.
