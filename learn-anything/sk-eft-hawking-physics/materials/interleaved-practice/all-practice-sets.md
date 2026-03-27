# Interleaved Practice Sets: SK-EFT Hawking Radiation

## Overview

Five practice sets, one per task class. Each set: 25% current topic, 75% spaced review from earlier classes. Problems are **interleaved** (no two consecutive problems use the same strategy) and include **discrimination pairs** (similar surface, different deep structure).

Target accuracy: 75–85% for an intermediate learner.

---

## Practice Set 1: After TC1 (Acoustic Metrics)

### 1.1: Derivation — Continuity Equation
**Strategy**: Apply conservation of mass to a fluid element.

A fluid with density $\rho(x,t)$ and velocity $v(x,t)$ satisfies mass conservation. Write the continuity equation in 1D. (Hint: mass in − mass out = rate of density increase.)

**Solution sketch**: $\partial_t \rho + \partial_x(\rho v) = 0$. This says: time-rate of density + divergence of mass flux = 0.

---

### 1.2: Discrimination Pair — Subsonic vs Supersonic
**Strategy**: Distinguish causal structure by comparing flow to sound speed.

**Part A:** At a point in a fluid where $v = 0.9 c_s$ (subsonic), can an upstream-propagating sound wave escape downwind, upwind, or both?

**Part B:** At a point where $v = 1.1 c_s$ (supersonic), can an upstream-propagating sound wave escape?

**Solution sketch**: 
Part A: Upstream speed (in lab frame) = $c_s - v = 0.1 c_s > 0$. Waves propagate upstream. (Both directions possible in subsonic region.)
Part B: Upstream speed = $c_s - v = -0.1 c_s < 0$. Waves cannot go upstream; they're swept downstream. (Only one causal direction—like a black hole horizon.)

---

### 1.3: Conceptual — Acoustic Metric Signature
**Strategy**: Connect sign of metric determinant to causal structure.

For the acoustic metric $g_{tt} = 1 - v^2/c_s^2$ and $g_{xx} = -1/c_s^2$, when does the determinant vanish? What is the physical meaning?

**Solution sketch**: $\det g = -(1 - v^2/c_s^2)/c_s^2 = 0$ when $v = c_s$ (sonic point). This is the **null surface** (event horizon analog) where causal structure becomes degenerate.

---

### 1.4: Spaced Review — Lagrangian Mechanics
**Strategy**: (Review TC0) Build action from Lagrangian.

A particle with mass $m$ in a potential $V(x)$ has Lagrangian $L = \frac{1}{2}m\dot{x}^2 - V(x)$. Derive the equation of motion using the Euler-Lagrange equation.

**Solution sketch**: $\frac{d}{dt}\frac{\partial L}{\partial \dot{x}} - \frac{\partial L}{\partial x} = 0$ gives $m\ddot{x} + \frac{dV}{dx} = 0$ (Newton's law).

---

### 1.5: Spaced Review — Quantum Mechanics
**Strategy**: (Review TC0) Uncertainty principle as tool for estimation.

A particle confined to a region of size $L$ has momentum uncertainty $\Delta p \sim \hbar / L$. Estimate its kinetic energy.

**Solution sketch**: $E_{kin} \sim (\Delta p)^2/(2m) \sim \hbar^2/(mL^2)$. This is the zero-point energy set by quantum confinement.

---

### 1.6: Application — Speed of Sound
**Strategy**: Connect microscopic to macroscopic.

For an ideal gas with pressure $P = nk_B T$ (n = number density) and density $\rho = nm$ (m = mass per particle), compute the sound speed $c_s = \sqrt{dP/d\rho}$.

**Solution sketch**: $dP/d\rho = (dP/dn) / (d\rho/dn) = k_B T / m$. So $c_s = \sqrt{k_B T / m}$—sound speed depends on temperature and particle mass.

---

## Practice Set 2: After TC2 (EFT Pipeline)

### 2.1: Conceptual — Schwinger-Keldysh Contour
**Strategy**: Understand why two time contours are needed.

In standard QFT, you use time-ordered products and retarded/advanced propagators. Why do you need *both* the forward and backward contours in the SK formalism?

**Solution sketch**: The forward contour evolves your system; the backward contour "undoes" the evolution, letting you compute expectation values at all intermediate times. This is necessary for tracking *nonequilibrium* dynamics.

---

### 2.2: Discrimination Pair — Retarded vs Advanced
**Strategy**: Distinguish causality directions.

**Part A:** The retarded Green's function $G_R(t, t') = 0$ for $t < t'$ (future doesn't affect past). Write this condition formally.

**Part B:** The advanced Green's function $G_A(t, t') = 0$ for $t > t'$ (past doesn't affect future). Is this physical? Which one do you use for computing response to an external drive?

**Solution sketch**: 
Part A: $G_R$ is causal (future can't affect past).
Part B: $G_A$ is anti-causal (it's the time-reversed version). You use $G_R$ for response to a drive (cause → effect).

---

### 2.3: Derivation — KMS Condition
**Strategy**: Apply thermal equilibrium constraint.

In thermal equilibrium at temperature $T = 1/\beta$, the Kubo-Martin-Schwinger condition relates advanced and retarded propagators. State the condition and explain why it's valid.

**Solution sketch**: $G_A(\omega) = G_R(\omega - i/\beta)$. This says the advanced sector is a thermal continuation of the retarded sector—a consequence of time-translation symmetry at equilibrium.

---

### 2.4: Spaced Review — Fourier Transform
**Strategy**: (Review) Convert between time and frequency domains.

A retarded Green's function in time is $G_R(t) = -i\Theta(t) e^{-i\omega_0 t}$ (unit step, damping). Compute $G_R(\omega)$ (Fourier transform).

**Solution sketch**: $G_R(\omega) = \int_0^\infty dt \, e^{i\omega t} e^{-i\omega_0 t} = 1/(\omega - \omega_0 + i\epsilon)$ (pole at $\omega_0$, infinitesimal damping).

---

### 2.5: Spaced Review — Thermodynamics
**Strategy**: (Review) Free energy and phase transitions.

At a first-order phase transition, the free energy $F(T)$ is non-analytic (not smooth). Sketch $F(T)$ near the transition. Where are the two phases?

**Solution sketch**: Two minima of equal depth at the transition temperature. Below $T_c$, one is global minimum (ordered phase); above, the other (disordered phase).

---

### 2.6: Application — Hawking Temperature Formula
**Strategy**: Dimensional analysis to find scaling.

The Hawking temperature of a black hole depends on surface gravity $\kappa$ (dimension: 1/time). Using only dimensional analysis, propose the form $T_H \sim f(\hbar, k_B, \kappa)$.

**Solution sketch**: $[T_H] = \text{energy}$. We have $[\hbar] = \text{energy} \cdot \text{time}$, $[k_B] = \text{energy}/\text{temperature}$, $[\kappa] = 1/\text{time}$. Combine: $T_H \sim \hbar \kappa / k_B$ (matches Hawking formula exactly!).

---

## Practice Set 3: After TC3 (Higher-Order Structure)

### 3.1: Counting — Derivative Orders
**Strategy**: Apply parity and KMS to count free parameters.

At order N=2 (second derivatives in the effective action), how many independent transport coefficients survive after normalization, positivity, and KMS?

**Solution sketch**: Parity-even terms at N=2: $(\partial_t^2)$ and $(\nabla^4)$. That's 2 candidates. After KMS locks them together thermodynamically, roughly 1-2 independent parameters remain (plus the contact term). Total: ~2-3.

---

### 3.2: Discrimination Pair — Even vs Odd Parity
**Strategy**: Distinguish which terms are allowed.

**Part A:** A term $\partial_x \phi$ is odd under parity. Can it appear in a parity-invariant Lagrangian density?

**Part B:** A term $\partial_x^2 \phi$ is even under parity. Can it appear?

**Solution sketch**:
Part A: No. An odd-parity operator needs an odd-parity coefficient, but couplings are parity-neutral. Forbidden.
Part B: Yes. Both operator and coupling are even, so the product is even. Allowed.

---

### 3.3: Conceptual — Transport Coefficients
**Strategy**: Connect microscopic to macroscopic.

The shear viscosity $\eta$ measures how much momentum is transported across a velocity shear. In kinetic theory, $\eta \sim n v_{th} \lambda$ (number density × thermal velocity × mean free path). How does $\eta$ change with temperature?

**Solution sketch**: $v_{th} \propto \sqrt{T}$, but $\lambda$ decreases with T (more collisions). Typical scaling: $\eta \propto T^{1/2}$ (T-dependent part from velocity dominate) or $\eta \propto T^{3/2}$ (from viscosity definition in kinetic theory).

---

### 3.4: Spaced Review — Dispersion Relations
**Strategy**: (Review) Connect frequency to wavenumber.

For a wave in a dispersive medium, $\omega(k) = \sqrt{k^2 + m^2}$ (relativistic). Compute the phase velocity $v_{ph} = \omega/k$ and group velocity $v_g = d\omega/dk$.

**Solution sketch**: $v_{ph} = \sqrt{1 + m^2/k^2}$ (approaches 1 as $k \to \infty$). $v_g = k/\sqrt{k^2+m^2}$ (approaches 0 as $k \to 0$). Both < speed of light, as required.

---

### 3.5: Spaced Review — Dimensional Analysis
**Strategy**: (Review) Guess functional form from dimensions.

A system has length scale $L$, energy scale $E$, and temperature $T$. Propose a formula for the entropy density $s$ (entropy per unit volume). (Hint: entropy is dimensionless relative to $k_B$.)

**Solution sketch**: $s \sim k_B (E/L^3) / T$ or similar. The exact prefactor depends on the system, but dimensional analysis constrains the form.

---

### 3.6: Application — Viscous Corrections
**Strategy**: Use power-counting to estimate corrections.

In a viscous fluid, corrections to the sound speed go as $\delta c_s / c_s \sim \eta / (\rho c_s L)$ (rough estimate). For water at room temperature ($\eta \sim 10^{-3}$ Pa·s, $\rho \sim 10^3$ kg/m³, $c_s \sim 1500$ m/s, $L \sim 1$ cm), estimate the correction.

**Solution sketch**: $\delta c_s / c_s \sim 10^{-3} / (10^3 \times 1500 \times 0.01) \sim 10^{-10}$ (tiny!). Viscosity barely affects sound speed in liquids.

---

## Practice Set 4: After TC4 (Gauge-Gravity)

### 4.1: Conceptual — Gauge Redundancy
**Strategy**: Count physical degrees of freedom.

Maxwell theory has 4 components of $A_\mu$ but 1 gauge freedom. Tetrads have 16 components of $e^a_\mu$ but 6 gauge freedoms (Lorentz rotations + boosts). How many physical d.o.f. remain in each?

**Solution sketch**: Maxwell: 4 − 1 = 3 (two polarizations + one longitudinal). Tetrad: 16 − 6 = 10 (but after Higgs, only 2 graviton polarizations survive).

---

### 4.2: Discrimination Pair — Abelian vs Non-Abelian
**Strategy**: Distinguish robust from fragile symmetries.

**Part A:** U(1) charges (electric charge) can be assigned independently to different particles and still conserve total charge. Is the symmetry Abelian?

**Part B:** SU(3) color charges must satisfy $[T^a, T^b] \neq 0$. Can different quarks have independent color labels while conserving total color?

**Solution sketch**:
Part A: Yes, U(1) is Abelian. Charges commute.
Part B: No, SU(3) is non-Abelian. The color constraint is non-local and mixes different quarks. Only singlet combinations are stable.

---

### 4.3: Derivation — ADW Mechanism
**Strategy**: Count Nambu-Goldstone modes.

GL(4,R) has dimension 16. SO(3,1) has dimension 6. When GL(4,R) breaks to SO(3,1), how many massless NG modes are produced (before Higgs absorption)?

**Solution sketch**: Coset dimension = 16 − 6 = 10 NG modes. After absorbing 4 into the tetrad condensate and 6 into the spin-connection, 2 remain (the gravitons).

---

### 4.4: Spaced Review — Symmetry Breaking
**Strategy**: (Review) Apply Nambu-Goldstone theorem.

When a continuous global symmetry $G$ breaks to a subgroup $H$, one NG boson appears for each broken generator. For $SU(2) \to U(1)$, how many generators are broken?

**Solution sketch**: $SU(2)$ has 3 generators (the Pauli matrices). $U(1)$ has 1 generator. So 3 − 1 = 2 generators are broken, giving 2 NG bosons (like $\pi^±$ in chiral symmetry breaking).

---

### 4.5: Spaced Review — Representation Theory
**Strategy**: (Review) Classify excitations by symmetry.

Under $SO(3,1)$ (Lorentz group), a rank-2 symmetric traceless tensor has how many independent components?

**Solution sketch**: $4 \times 4$ symmetric matrix has $4 \times 5 / 2 = 10$ components. Traceless subtracts 1 ($\text{Tr} = 0$). Gives 9 components, but 4 are constrained by on-shell condition in 4D, leaving 2 physical graviton polarizations.

---

### 4.6: Application — Graviton Mass and Coupling
**Strategy**: Dimensional analysis for gravitational strength.

The Planck mass $M_P \sim \sqrt{\hbar c / G_N}$ sets the gravitational scale. If emergent gravity comes from a superfluid with density $\rho$ and sound speed $c_s$, propose a formula relating $M_P$ to fluid parameters.

**Solution sketch**: $M_P^2 \sim \rho c_s^3 / \text{(some dimensionless coupling)}$. The exact formula depends on how tightly the tetrad couples to density.

---

## Practice Set 5: Synthesis (All Tasks)

### 5.1: Integration — From String Nets to Hawking Radiation
**Strategy**: Trace one observable through all three layers.

A string-net ground state (Layer 1) has topological order (anyon degeneracy). After coarse-graining to hydrodynamics (Layer 2), what happens to the anyonic information? In the SK-EFT (Layer 3), how does this emerge as geometry?

**Solution sketch**: Anyonic statistics → topological charge conservation (1-form symmetry) → survives to Layer 2 as charge density → in Layer 3, couples to emergent U(1) photon. Color information is lost (Wall 1).

---

### 5.2: Discrimination Pair — Fundamental vs Emergent
**Strategy**: Distinguish what's put in vs what comes out.

**Part A:** In general relativity, does the metric $g_{\mu\nu}$ obey Einstein equations, or are Einstein equations derived from the metric?

**Part B:** In your SK-EFT framework, does the metric emerge from hydrodynamics, or is it assumed?

**Solution sketch**:
Part A: Einstein equations are the definition—the metric satisfies them by construction (GR is geometric, no dynamical origin for metric).
Part B: Metric emerges from ADW breaking of GL(4,R) → SO(3,1) (metric is derived from correlations).

---

### 5.3: Synthesis — Design a Hybrid System
**Strategy**: Propose a microscopic model that realizes the three-layer structure.

Specify a model (e.g., "fermionic superfluid with p-wave pairing") that exhibits:
1. Layer 1: Topological order or rich quantum structure
2. Layer 2: Hydrodynamic description
3. Layer 3: Emergent gravity + Hawking radiation

Identify what information is lost at each transition.

**Solution sketch**: p-wave superfluid: Layer 1 has Fermi surface + superfluid order. Layer 2 is Landau two-fluid (normal + superfluid components). Layer 3 has emergent metric from phase gradients (Diakonov) and Hawking radiation from vortex dissipation. Lost: microscopic band structure (1→2), dissipation mechanism (2→3).

---

### 5.4: Discrimination Pair — Different Mechanisms, Same Phenomenon
**Strategy**: Distinguish how different systems produce superficially similar phenomena.

**Part A:** In Schwinger pair creation near a black hole, electron-positron pairs are created from vacuum. Where does the energy come from?

**Part B:** In acoustic Hawking radiation, phonon pairs are created near a sonic horizon. Where does the energy come from?

**Solution sketch**:
Part A: Energy comes from the gravitational field (spacetime geometry changes).
Part B: Energy comes from dissipation in the fluid (viscosity converts kinetic energy into heat and phonons).
*Deep observation*: The two mechanisms are different (gravity vs viscosity), but produce identical spectra due to universality of Hawking effect.

---

### 5.5: Synthesis — Critical Review
**Strategy**: Assess what works, what doesn't, what's honest.

For each of the three walls (Gauge, Gravity, Chirality):
- What is *proven* to be impossible?
- What is *circumvented* using the hybrid architecture?
- What remains *genuinely open*?

**Solution sketch**: 
**Gauge wall** (proven impossible): Non-Abelian continuous symmetries cannot survive Layer 2. (Topological constraint.)
(Circumvented): Route SU(3) separately; don't try to describe it in hydrodynamics.
(Open): Can you extract color information from black hole entropy?

**Gravity wall** (proven impossible): Cannot couple dynamical fermions to emergent gravity without violating four obstacles. (Structural constraint.)
(Circumvented): Use p-wave (non-chiral) superfluid; treat fermions as probes.
(Open): Is one of the four obstacles fundamentally surmountable, or is this the limit of emergent spacetime?

**Chirality wall** (proven impossible): Chiral structure erased in Layer 2. (Thermal scrambling.)
(Circumvented): Restrict to chiral-symmetric theories.
(Open): Could "chiral hydrodynamics" preserve handedness? Has this been explored?

---

## Interleaving Strategy: Why This Works

**Within each set**:
- Problems are *shuffled* by strategy (not organized by topic). This forces you to identify which technique applies.
- Discrimination pairs reveal when surface similarity hides deep difference.
- Spaced review prevents forgetting prior concepts.

**Across sets**:
- Each set assumes mastery of its TC but reviews earlier material.
- Difficulty ramps: foundational → core → synthesis.
- The final synthesis problem in Set 5 models the research-level integration you'll need.

**Target accuracy**: 75–85% means
- Straightforward applications: 80–90% success (you've got this)
- Transfer/discrimination: 60–70% success (you're pushed beyond comfort zone, but not overwhelmed)
- Synthesis: 50–70% success (requires creative integration)

This calibration makes struggle productive: you're challenged without being defeated.

---

## How to Use These Sets

1. **Attempt problems without looking ahead.** Your first wrong answer is your teacher.
2. **After solving, review the solution sketch.** Where did you diverge?
3. **For discrimination pairs, explain in writing why Part A and Part B are different.** This forces deep encoding.
4. **After each set, try the synthesis problem from a later set.** This reveals what you've actually integrated.

These sets are designed for **self-teaching with feedback**, not for external grading. Use them to build fluency and detect gaps before they compound.
