# Reference One-Pagers: SK-EFT Hawking Radiation

Quick-reference guides for each task class, plus a global architecture overview. Scannable format: definitions, core principles, key examples, common mistakes.

---

## REFERENCE 0: Program Overview

### Scope
The SK-EFT framework reconstructs Hawking radiation (and quantum corrections) from classical fluid dynamics using three layers:
- **Layer 1 (UV)**: Quantum order (string nets, fermions, gauge fields)
- **Layer 2 (Meso)**: Hydrodynamics (density, velocity, stress-energy)
- **Layer 3 (IR)**: Effective geometry (metric, gravitons, Hawking radiation)

### Core Principle
**Geometry is not fundamental.** It emerges from symmetry breaking (GL(4,R) → SO(3,1)) when coarse-graining captures correlations in a dissipative medium.

### Five Task Classes
1. **TC1**: Acoustic metrics from linearized Euler equations
2. **TC2**: EFT pipeline—nine terms reduce to two parameters via three axioms
3. **TC3**: Higher-order structure—transport counting via parity
4. **TC4**: Gauge erasure and ADW gravity mechanism
5. **TC5**: Complete hybrid architecture—three layers, three walls, one unified vision

### The Three Walls (Obstacles)
1. **Gauge wall**: Non-Abelian gauge structure erased in Layer 2 (topological constraint)
2. **Gravity wall**: Full matter-gravity coupling blocked by four obstacles (structural)
3. **Chirality wall**: Chiral structure scrambled in Layer 2 (thermal erasure)

### Key Results
- Hawking temperature: $T_H = \hbar \kappa / (2\pi k_B)$
- Dissipative correction: $\delta_{\text{diss}} = \Gamma_H / \kappa$ (from viscosity)
- Area law: $S = A/4$ (acoustic black hole entropy)
- Gravitons: 2 massless spin-2 modes from GL(4,R)/SO(3,1) breaking

---

## REFERENCE 1: TC1—Acoustic Metrics

### Scope
From conservation laws (continuity + Euler) to emergent curved-spacetime structure for sound wave propagation.

### Core Principles
1. **Conservation laws are universal.** Mass and momentum conservation apply to all fluids, no exceptions.
2. **Background + perturbation decomposition exposes geometry.** Freezing the steady-state flow reveals how ripples propagate in an effective curved spacetime.
3. **Sonic horizons are real causality barriers.** When flow exceeds sound speed, information cannot propagate upstream—a null surface exists.
4. **Metric signature encodes causality.** Subsonic (elliptic geometry) vs supersonic (hyperbolic/Lorentzian signature) determines local causal structure.

### Key Equations
**Continuity**: $\partial_t \rho + \nabla \cdot (\rho \mathbf{v}) = 0$

**Euler**: $\rho (\partial_t + \mathbf{v} \cdot \nabla) \mathbf{v} = -\nabla p$

**Sound speed**: $c_s^2 = dp/d\rho$ (local property of medium)

**Acoustic metric** (1D):
$$g_{\mu\nu} = \begin{pmatrix} 1 - v_0^2/c_s^2 & v_0/c_s^2 \\ v_0/c_s^2 & -1/c_s^2 \end{pmatrix}$$

**Sonic horizon**: Occurs at $v_0(x_h) = c_s$ where $\det(g) = 0$

### Three Examples in Action
1. **1D transonic flow**: $v_0(x) = v_\infty \tanh(x/L)$. Horizon at $x_h$ where $v_0 = c_s$.
2. **Radial flow around sphere**: $v_0(r) = V_\infty (1 + a^3/r^3)$. Horizon is a spherical surface.
3. **Rotating vortex**: $v_\theta(r) = \kappa / (2\pi r)$. Horizon at $r_h = \kappa / (2\pi c_s)$.

### Common Mistakes
- **Confusing local and global**: The acoustic metric is *local* (depends on background state). Don't expect it to extend beyond the linearization regime.
- **Forgetting linearization range**: Valid only if $\delta\rho/\rho_0 \ll 1$ and $\delta v / v_0 \ll 1$. Large-amplitude waves need nonlinear treatment.
- **Assuming gravity analogy is exact**: Acoustic horizons are real, but they're not black holes. No quantum gravity, no singularities.

### Practice Companion
- **Problem type**: "Sketch the acoustic metric for a given flow profile; identify where the horizon is; determine if it's Lorentzian or Riemannian."
- **Key skill**: Reading off the metric from a linearized wave equation.
- **Diagnostic**: Can you compute sound speed $c_s$ from first principles and explain why it depends on equation of state?

---

## REFERENCE 2: TC2—EFT Pipeline

### Scope
From a zoo of 9 candidate terms in the SK effective action to exactly 2 free parameters, constrained by three axioms. Maps how dissipative corrections to Hawking radiation arise.

### Core Principles
1. **Three axioms constrain the action.** Normalization (bare vs effective), positivity (dissipation), and KMS (thermal equilibrium) are universal, not approximations.
2. **Symmetry does the counting.** Once you state the symmetries, the number of free parameters is determined—no fitting.
3. **KMS ties dissipation to noise.** The fluctuation-dissipation relation locks together microscopic fluctuations and macroscopic dissipation.
4. **Hawking temperature has a dissipative correction.** $T_{\text{eff}} = T_H(1 + \Gamma_H/\kappa)$, where $\Gamma_H$ comes from viscosity.

### Key Equations
**General first-order SK action** (9 naïve terms):
$$I^{(1)} = \int dt \, d^3x \sum_{i=1}^{9} a_i (\text{term}_i)[\phi_R, \phi_A]$$

**After normalization**: 4 survivors ($a_2, a_4, a_7, a_9$)

**After positivity**: All 4 have $a_i > 0$

**After KMS**: 2-parameter family
$$a_2 : a_4 : a_7 : a_9 = \gamma_1 : \gamma_1 c_s^2 : \gamma_2 : \gamma_2 c_s^4$$

**Hawking correction formula**:
$$\delta_{\text{diss}} = \frac{\Gamma_H}{\kappa} \propto \frac{\gamma_1}{\kappa}$$

### Three Examples in Action
1. **Fermion Fermi liquid**: Apply axioms to fermionic system near Mott transition. Result: viscosity sets low-energy physics, not band structure details.
2. **Photon-coupled plasma**: U(1) symmetry survives; SU(3) color does not. The SK action for electromagnetic response is simpler (1 parameter) than full QCD.
3. **Acoustic black hole in superfluid**: Viscosity $\eta$ becomes $\gamma_1$, surface gravity $\kappa$ is determined by vortex circulation. Formula directly predicts temperature shift.

### Common Mistakes
- **Forgetting KMS is *thermal equilibrium* constraint.** If the system is not in equilibrium, KMS breaks, and you may have more free parameters.
- **Thinking dissipation is "fundamental."** Dissipation emerges from coarse-graining; microscopically, dynamics are unitary.
- **Confusing $\gamma_1$ with viscosity coefficient.** $\gamma_1$ is defined relative to SK action and carries all the dissipative physics; its relation to traditional $\eta$ depends on microscopic details.

### Practice Companion
- **Problem type**: "Given an effective action with several operators, apply axioms to count free parameters."
- **Key skill**: Identifying which terms normalization kills, then locking remaining terms via KMS.
- **Diagnostic**: Can you explain why anomaly coefficients must be treated as external input (not emergent from Layer 2)?

---

## REFERENCE 3: TC3—Higher-Order Structure

### Scope
At order $N$ in derivative expansion, parity eliminates roughly half the terms; KMS constrains the rest. Result: slow growth in free parameters ($\sim N/2$), making EFTs predictive.

### Core Principles
1. **Parity eliminates odd-parity terms.** A term $\partial^n \nabla^m$ is allowed only if the total parity is even. Spatial derivatives flip sign under inversion.
2. **The count grows like $N/2$, not $2^N$.** This slow growth is why you can do EFT at all.
3. **Even-parity partitions are generic.** For order $N$, there are roughly $\lfloor N/2 \rfloor + 1$ independent combinations of time and spatial derivatives.
4. **KMS relates different time-orders.** Higher-derivative terms are not independent once you enforce thermal equilibrium.

### Key Equations
**Parity-even derivatives at order N**:
- $(n, k)$ with $n + 2k = N$, where $n$ is number of $\partial_t$'s and $k$ counts Laplacians $\nabla^{2k}$.

**Count of independent terms**:
$$\text{count}(N) = \lfloor (N+1)/2 \rfloor + 1$$

(The "+1" includes contact/noise term.)

**Examples**:
- $N=0$: 1 parameter (contact noise)
- $N=1$: 2 parameters (viscosity + noise)
- $N=2$: 3 parameters (higher dissipation + higher dispersion + noise)
- $N=3$: 4 parameters (continues slow growth)

### Three Examples in Action
1. **Real fluid**: $\eta$ (viscosity) and $\zeta$ (bulk viscosity) dominate up to $N=2$. Higher orders (thermal conductivity, non-Newtonian effects) add ~1 parameter per order.
2. **Condensed matter**: Transport counting predicts exactly how many independent transport coefficients (Hall effect, magnetoresistance, etc.) can exist in a 2D electron gas.
3. **Relativistic plasma**: At very high temperatures, quark-gluon plasma has a specific set of transport coefficients determined by the count formula.

### Common Mistakes
- **Thinking all terms at order N are independent.** KMS locks them together; many are dependent.
- **Forgetting parity at negative orders.** Even at $N=0$, if you had a parity-breaking term, it would appear. But parity-preserving systems have only one contact term at $N=0$.
- **Confusing parity with chirality.** Parity is spatial inversion ($\mathbf{x} \to -\mathbf{x}$). Chirality is handedness (not the same).

### Practice Companion
- **Problem type**: "Enumerate all parity-even N-derivative terms; count independent parameters after KMS."
- **Key skill**: Distinguishing odd and even powers of $\nabla$.
- **Diagnostic**: Can you explain why the formula predicts that $N=1000$ adds only ~500 new degrees of freedom?

---

## REFERENCE 4: TC4—Gauge-Gravity

### Scope
Why non-Abelian gauge structure erases in Layer 2, but spacetime geometry emerges from GL(4,R) → SO(3,1) breaking. Also: four structural obstacles to full matter-gravity unification.

### Core Principles
1. **Higher-form operators must commute** (topological requirement). Non-Abelian charges don't commute, so non-Abelian continuous symmetries can't survive hydrodynamization.
2. **Only the center survives.** For $SU(3)$, the $Z_3$ center (which commutes with everything) persists as a discrete symmetry.
3. **Abelian symmetries are robust.** U(1) survives as a 1-form symmetry; photons emerge as Nambu-Goldstone bosons of broken magnetic symmetry.
4. **Tetrad condensation produces gravity.** Breaking GL(4,R) to SO(3,1) yields 10 NG modes; after Higgs absorption and gauge fixing, 2 remain (the gravitons).
5. **Four obstacles block full unification.** Chirality, anomalies, spin-statistics, unitarity—each is fundamental.

### Key Equations
**Higher-form commutativity**:
$$[U_{C_1}^{(k_1)}, U_{C_2}^{(k_2)}] = 0 \quad \text{if } \dim(C_1) + \dim(C_2) < d$$

**GL(4,R) breaking**:
$$\dim(GL(4,\mathbb{R})/SO(3,1)) = 16 - 6 = 10 \text{ NG modes}$$

**After Higgs + parity**: 2 massless gravitons (spin-2)

**Four obstacles**:
1. *Chirality wall*: Left-right asymmetry erased in Layer 2
2. *Anomaly wall*: Quantum loop anomalies not derivable from effective action
3. *Spin-statistics wall*: Fermionic statistics incompatible with NG theorem
4. *Unitarity wall*: Higher-derivative terms from quantum loops create ghosts

### Three Examples in Action
1. **SU(3) color in QCD**: Erased by coarse-graining. Only singlet observables survive in Layer 2. Handled via hybrid architecture.
2. **U(1) photon**: Survives as broken magnetic 1-form. Emerges naturally from dual photon condensate.
3. **p-wave superfluid + Diakonov gravity**: Avoids all four obstacles by using vector-like (non-chiral) fermionic pairing. Produces gravity + Hawking radiation.

### Common Mistakes
- **Confusing "erased" with "confined."** Color charges are not confined (no domain walls); they're scrambled into entropy (thermalization).
- **Thinking discrete symmetries are less important.** $Z_N$ survives and is measurable (defects, topological charge quantization).
- **Assuming one obstacle can be overcome locally.** The four obstacles are intertwined; fixing one may make another worse.

### Practice Companion
- **Problem type**: "Trace what happens to SU(3) color and U(1) charge as you coarse-grain from Layer 1 to Layer 3."
- **Key skill**: Understanding why the commutativity constraint (purely topological) forbids non-Abelian structures.
- **Diagnostic**: Can you propose a microscopic model where the tetrad *naturally* emerges as the order parameter?

---

## REFERENCE 5: TC5—Synthesis & Architecture

### Scope
Three-layer information flow. What passes through each sieve; what gets blocked and turned into entropy. Honest accounting of what works, what doesn't, what's open.

### Core Principles
1. **Each layer is an abstraction.** Layer 1 has full microscopic detail; Layer 2 loses gauge + chiral structure; Layer 3 loses dissipation mechanism.
2. **Entropy measures information loss.** At each coarse-graining, the number of distinct microstates compatible with macroscopic observables grows; entropy encodes this.
3. **Three sieves filter information.** Gauge sieve (non-Abelian erased), chiral sieve (left-right scrambled), quantum sieve (loops hidden in entropy).
4. **Three walls are fundamental.** Not technical problems to be solved, but topological/structural constraints.
5. **The honest minimum works.** p-wave superfluid with Diakonov gravity avoids the three walls and reproduces Hawking radiation + dissipative corrections.

### Key Concepts
**Information flow**:
- Layer 1 → 2: Loses SU(3) color, chirality, entanglement details. Keeps $N_f$ (fermion number), topological charges, energy-momentum.
- Layer 2 → 3: Loses dissipation mechanism (viscosity vs thermal conduction). Keeps metric structure, entropy current, conservation laws.

**Entropy accounting**:
- Layer 1: Microstate degeneracy $\Omega = e^{S_{micro}/k_B}$ from quantum mechanics
- Layer 2: Hydrodynamic entropy $S_{hydro}$ from coarse-graining over microscopic structure
- Layer 3: Black hole entropy $S_{BH} \sim A/4$ from information trapped inside horizon

**The three walls**:
1. **Gauge wall**: Topological. Non-Abelian continuous symmetries cannot be higher-form symmetries. (Commutativity constraint.)
2. **Gravity wall**: Structural. Fermions have spin-statistics that don't fit ADW mechanism. (Four obstacles.)
3. **Chirality wall**: Dynamical. Chiral asymmetry is thermalized away at mesoscopic timescales. (Scrambling.)

### Worked Example: Vortex → Hawking Radiation
- **Layer 1**: Topological defect in superfluid; fermionic Caroli-de Gennes modes; Berry phase structure.
- **Layer 1→2**: Coarse-grain core; vortex becomes point-like topological charge; fermi surface → thermal gas.
- **Layer 2**: Singular velocity field $v_\theta = \kappa/(2\pi r)$; acoustic metric $g_{tt} = c_s^2 - v^2$; horizon at $r_H = \kappa/(2\pi c_s)$.
- **Layer 2→3**: Extract metric; compute surface gravity $\kappa_{grav} = \kappa$; apply Hawking formula $T_H = \hbar \kappa / (2\pi k_B)$.
- **Layer 3**: Black hole in acoustic spacetime; Hawking radiation with dissipative correction $\delta_{\text{diss}} = (\eta \text{ term}) / \kappa$.
- **What's lost**: Detailed band structure, microscopic scattering, anomaly values, chiral structure.
- **What survives**: Circulation (conserved topological charge), Hawking temperature, area law entropy.

### Common Mistakes
- **Thinking the three walls can be breached separately.** They're not independent. Solving one typically makes another harder.
- **Confusing Layer 2→3 coarse-graining with approximation.** It's not that we're "ignoring viscosity details"—we're accepting that those details are encoded in an effective parameter.
- **Expecting the framework to describe the full Standard Model.** It doesn't (gauge wall, chirality wall). It's honest about limitations.

### Practice Companion
- **Problem type**: "Trace a physical observable through all three layers; identify where information is lost and where it goes (entropy)."
- **Key skill**: Understanding the honest minimum viable hybrid—what's proven, what's bypassed, what's open.
- **Diagnostic**: Can you sketch a different microscopic system (not p-wave superfluid) that might also produce emergent gravity? What new obstacles would appear?

---

## Global Program Overview (One-Page Version)

| Aspect | Definition | Role |
|--------|-----------|------|
| **Layer 1 (UV)** | Topological order + fermions + gauge fields | Input: microscopic quantum structure |
| **Layer 2 (Meso)** | Hydrodynamics (ρ, u, T, η) | Hub: coarse-grained, singlet-only description |
| **Layer 3 (IR)** | SK-EFT (metric, gravitons, Hawking T) | Output: emergent geometry + radiation spectrum |
| **Sieve 1→2** | Gauge sieve (non-Abelian erased) | Topological: non-Abelian 1-forms forbidden |
| **Sieve 2→3** | Dissipation sieve (mechanism hidden) | Pragmatic: keep symmetry structure, lose details |
| **Key Result** | $T_{\text{eff}} = T_H(1 + \Gamma_H/\kappa)$ | Hawking temperature has dissipative correction |
| **Five Walls** | Gauge, Gravity, Chirality (+ Four obstacles) | Honest accounting of limits |
| **Honest Minimum** | p-wave SF + Diakonov gravity | Works: reproducible, avoids walls |

**Mastery checklist**:
- [ ] Derive acoustic metric from Euler equations
- [ ] Reduce 9 SK terms to 2 parameters via three axioms
- [ ] Count parity-constrained degrees of freedom at any order N
- [ ] Explain why non-Abelian gauge structure erases (topological argument)
- [ ] Trace information flow through all three layers for a concrete example
- [ ] Identify and articulate the three walls and their nature
- [ ] Propose a microscopic system realizing the hybrid architecture

---

## How to Use These One-Pagers

1. **Before each task class**: Skim the overview to anchor scope.
2. **During practice**: Reference the equations and examples to ground your work.
3. **After struggling**: Check "Common Mistakes" to see if your error is a known pitfall.
4. **For synthesis**: Use the global overview and TC5 pager to integrate across all five classes.

These are *reference*, not lecture. They're meant to be consulted, not memorized.
