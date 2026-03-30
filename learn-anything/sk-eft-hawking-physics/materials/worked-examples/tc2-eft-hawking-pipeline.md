# TC2: The EFT-to-Hawking Pipeline — From 9 Terms to the Dissipation Correction

## Overview

You have a zoo of 9 candidate terms in the Schwinger-Keldysh effective action. They seem arbitrary—different coupling strengths for different operators. But here's the miracle: **three axioms collapse them to exactly 2 free parameters**. These parameters then determine the Hawking radiation spectrum through a single formula.

This is the heart of effective field theory: **symmetry does the work**. Not experiments, not calculations—just *consistency*.

---

## Full Worked Solution: From 9 Terms to 2 Parameters

### Step 1: The Physical Setup — Write the Zoo of Terms

In the Schwinger-Keldysh formalism, a nonequilibrium system is tracked on two time contours: forward (into the future) and backward (into the past). The effective action couples the retarded and advanced fields.

For a scalar field in a thermal environment, the most general **first-order** (linear in derivatives) SK effective action is:

$$I_{\text{SK}}^{(1)} = \int dt \, d^3\mathbf{x} \left[ a_1 \partial_t \phi_R \phi_A + a_2 \partial_t \phi_A \phi_R + a_3 \nabla^2 \phi_R \phi_A + a_4 \nabla^2 \phi_A \phi_R + a_5 \phi_R \phi_A + a_6 \partial_t^2 \phi_R \phi_A + a_7 \partial_t^2 \phi_A \phi_R + a_8 (\nabla^2)^2 \phi_R \phi_A + a_9 (\nabla^2)^2 \phi_A \phi_R \right]$$

**Nine coefficients**: $a_1, \ldots, a_9$.

**What each term represents**:
- $a_1, a_2$: **First-order damping** (energy dissipation at rate $\propto a$)
- $a_3, a_4$: **Kinetic/dispersive** terms (how far and fast excitations propagate)
- $a_5$: **Contact/noise** term (quantum fluctuations)
- $a_6, a_7$: **Second-order damping** (higher-order dissipation)
- $a_8, a_9$: **High-energy dispersion** (curvature corrections)

Without constraints, this is 9 independent parameters. A nightmare for prediction.

> **Physical Insight**: The action encodes the microscopic physics (atoms colliding, quantum loops, etc.) averaged into a few effective couplings. Different microscopic theories could, in principle, give different $\{a_i\}$. But **symmetry** says: "Not so fast—only a few combinations are allowed."

---

### Step 2: Axiom 1 — Normalization: Eliminate Pure-Retarded Terms

The first axiom states: **The retarded self-energy has no bare (non-interacting) part.**

Technically: $\frac{\delta I_{\text{SK}}}{\delta \phi_A}\big|_{\phi_A=0} = 0$.

What does this mean? In the SK formalism, the retarded Green's function is computed by inverting the retarded kinetic operator. If we had terms where $\phi_R$ appears without $\phi_A$ (a "pure-retarded" sector), those terms would contribute to the bare retarded propagator. But the bare propagator should come only from the microscopic Hamiltonian, not from the effective action we're building.

**In practice**: Normalization kills terms where $\phi_R$ is differentiated and $\phi_A$ appears with no derivatives:
- Kill $a_1 \partial_t \phi_R \phi_A$ ✓
- Kill $a_3 \nabla^2 \phi_R \phi_A$ ✓
- Kill $a_5 \phi_R \phi_A$ ✓
- Kill $a_6 \partial_t^2 \phi_R \phi_A$ ✓
- Kill $a_8 (\nabla^2)^2 \phi_R \phi_A$ ✓

**Survivors**: $a_2, a_4, a_7, a_9$ (where $\phi_A$ is differentiated, not $\phi_R$).

**Remaining degrees of freedom**: 4 coefficients.

> **Physical Insight**: Normalization says: "The microscopic theory (Layer 1) provides the bare dynamics. The effective action (Layer 2) only corrects it, not replaces it." This is the essence of what makes an EFT an *effective* theory, not a fundamental one.

---

### Step 3: Axiom 2 — Positivity: Dissipation Must Be Positive

The second axiom: **Entropy increases; energy flows from hot to cold.** Formally:

$$\text{Im}(I_{\text{SK}}) \geq 0$$

The imaginary part of the action encodes dissipation. Positive imaginary part = energy is lost to the heat bath. Negative would mean energy is *gained* from nowhere—a violation of the second law.

After normalization, the remaining terms are $a_2 \partial_t \phi_A \phi_R$, $a_4 \nabla^2 \phi_A \phi_R$, $a_7 \partial_t^2 \phi_A \phi_R$, $a_9 (\nabla^2)^2 \phi_A \phi_R$.

The imaginary part involves the antisymmetric pairing of retarded and advanced fields. For dissipation to be positive:

$$a_2 > 0, \quad a_4 > 0, \quad a_7 > 0, \quad a_9 > 0$$

All couplings must be positive (at the level of sign; magnitudes are still free).

> **Physical Insight**: Positivity is not a choice—it's thermodynamics. Any system coupled to a heat bath must have positive dissipation, or it violates the second law. This is *universal*: it holds for all systems, all materials, all energies.

---

### Step 4: Axiom 3 — KMS Symmetry: The Golden Constraint

The Kubo-Martin-Schwinger (KMS) condition states: **The system is in thermal equilibrium at temperature $T = 1/\beta$.**

In the SK formalism, KMS relates the retarded and advanced propagators:
$$G_A(t, \mathbf{x}; t', \mathbf{x}') = G_R(t, \mathbf{x}; t' - i\beta, \mathbf{x}')$$

This says the advanced sector (backward in time) is a thermal continuation of the retarded sector.

**At the level of the effective action**, KMS imposes relations between the coefficients. Specifically:

- The time-derivative terms ($a_2$, $a_7$) are related to the spatial-derivative terms ($a_4$, $a_9$) via thermal scaling.
- In thermal equilibrium, the relative sizes of different dissipative channels are not arbitrary—they're fixed by thermodynamics.

The constraint reduces the 4 coefficients to a **2-parameter family**:
$$a_2 : a_4 : a_7 : a_9 = \gamma_1 : \gamma_1 c_s^2 : \gamma_2 : \gamma_2 c_s^4$$

where $\gamma_1$ and $\gamma_2$ are **two independent dimensionless couplings**, and $c_s$ is the sound speed (a background parameter, not a coupling).

**Final count**: 2 free parameters, $\gamma_1$ and $\gamma_2$.

> **Physical Insight**: KMS encodes thermodynamic balance. It says: "If dissipation happens at frequency $\omega$, it must be accompanied by noise at a rate determined by temperature." This is the **fluctuation-dissipation relation**—a universal principle that connects microscopic chaos (noise) to macroscopic dissipation (viscosity, heat conduction).

---

### Step 5: The Key Insight — Compute Modified Hawking Temperature

Now we have the constrained effective action with only 2 free parameters:

$$I_{\text{SK}} = \int dt \, d^3\mathbf{x} \left[ \gamma_1 \partial_t \phi_A \phi_R + \gamma_1 c_s^2 \nabla^2 \phi_A \phi_R + \gamma_2 \partial_t^2 \phi_A \phi_R + \gamma_2 c_s^4 \nabla^4 \phi_A \phi_R \right]$$

In an acoustic black hole (a vortex in a superfluid or a transonic flow), the **bare Hawking temperature** is determined by the horizon's surface gravity:

$$T_H = \frac{\hbar \kappa}{2\pi k_B}$$

where $\kappa = \frac{dv_0}{dx}\big|_{x_h}$ is how sharply the flow velocity changes at the horizon.

But dissipation in the fluid modifies this. The dissipative correction comes from energy loss at the horizon:

$$\Gamma_H = \text{Im}(\Sigma_R)\big|_{\text{at horizon}} \sim \gamma_1 (\text{typical energy scale})$$

The effective temperature becomes:

$$T_{\text{eff}} = T_H \left(1 + \frac{\Gamma_H}{\kappa}\right)$$

To leading order:

$$\boxed{\delta_{\text{diss}} = \frac{\Gamma_H}{\kappa} \propto \gamma_1 \kappa}$$

**Phase 5 Discovery**: The dissipative correction exhibits **LINEAR κ-scaling**, not the constant correction originally assumed. Specifically:

$$\delta_{\text{diss}} = \alpha \gamma_1 \kappa$$

where $\alpha$ is a dimensionless constant from the horizon structure. This reveals a crucial **crossover** between two regimes:

$$\kappa_{\text{cross}} = \frac{6(\gamma_1 + \gamma_2)}{\pi \xi^2}$$

where $\xi$ is the sonic healing length. The physical interpretation:

- **Dissipative-dominated regime** ($\kappa < \kappa_{\text{cross}}$): Dissipative corrections dominate the Hawking spectrum. The horizon is "gentle" and viscous effects reshape the thermal distribution.
- **Dispersive-dominated regime** ($\kappa > \kappa_{\text{cross}}$): Dispersive (higher-order) corrections dominate. The horizon is "steep" and quantum pressure effects take over.

This is the **dissipative correction to emergent gravity**: the effective temperature of Hawking radiation is shifted by an amount proportional to both the viscosity (encoded in $\gamma_1$) and the surface gravity's steepness ($\kappa$). See **KappaScaling.lean** for the formal proof of this scaling relation and regime classification (11 theorems).

---

### Step 6: Physical Interpretation — What Do $\gamma_1$ and $\gamma_2$ Mean?

**The bare Hawking temperature $T_H$:**

In pure general relativity, the Hawking formula is universal:
$$T_H = \frac{\hbar \kappa}{2\pi k_B}$$

This depends only on the horizon's geometry (surface gravity $\kappa$). A "steep" horizon (large $\kappa$) is hot; a "gentle" horizon is cool.

**The dissipation correction $\delta_{\text{diss}} = \Gamma_H / \kappa$:**

Think of a waterfall:
- **$\kappa$** measures the steepness of the cliff (how hard it is to climb out).
- **$\Gamma_H$** measures how much energy the water loses to friction with the rocks (viscous dissipation).
- **Their ratio** tells you the effective temperature of the mist at the bottom: if there's a lot of friction relative to the cliff's steepness, the mist is hotter.

**$\gamma_1$ — the first-order viscosity:**

This multiplies $\partial_t \phi_A \phi_R$, the first-order damping term. It's the "viscosity-like" coefficient—how much energy is dissipated per unit shear in the medium. For a weakly nonequilibrium fluid:

$$\Gamma_H \sim \gamma_1 \times (\text{typical phonon energy})$$

**$\gamma_2$ — the second-order correction:**

This multiplies $\partial_t^2 \phi_A \phi_R$, a higher-order damping term. It's suppressed by powers of the sound speed. For most systems, $\gamma_1 \gg \gamma_2$.

> **Physical Insight**: The hierarchy $\gamma_1 \gg \gamma_2$ reflects a separation of scales. Low-energy (long-wavelength) physics is dominated by first-order terms. Higher-order terms kick in only at higher energies, where microscopic structure becomes visible. This is the essence of the **power-counting** in effective field theory.

---

### Step 7: Experimental Platforms and Temperature Scaling

**Bose-Einstein Condensate (BEC):**

In superfluid $^4\text{He}$ or dilute atomic BECs, the Hawking temperature is set by $T_H = \hbar\kappa/(2\pi k_B)$. Typical surface gravities are $\kappa \sim 10^3$ s$^{-1}$, giving:

$$T_H \sim \frac{\hbar \times 10^3}{2\pi k_B} \sim 0.35 \, \text{nK}$$

This is extraordinarily cold—difficult to measure, because thermal noise at lab temperatures (~1 K) overwhelms the signal.

**Polariton Platforms (Tier 1):**

A remarkable new opportunity emerges in exciton-polariton condensates in semiconductors. The polariton dispersion is much *steeper* than phonon dispersion, leading to surface gravities $\kappa \sim 10^{12}$ s$^{-1}$ or higher. This increases the Hawking temperature to:

$$T_H^{\text{pol}} \sim 0.8\text{--}4 \, \text{K}$$

**This is 10$^{10}$ times hotter than BEC**, bringing Hawking radiation into the realm of standard cryogenic measurements. The κ-scaling discovery (Phase 5) shows exactly why this enhancement occurs: the dissipative correction $\delta_{\text{diss}} \propto \kappa$ also scales up, but the baseline $T_H$ grows even faster.

See **PolaritonTier1.lean** for the formal validity bounds and **src/experimental/polariton_predictions.py** for predicted spectra.

> **Experimental Outlook**: Polariton platforms transform Hawking radiation from a theoretical curiosity to an accessible quantum optics measurement. This is why Phase 5's κ-scaling is so important: it explains *why* different platforms have vastly different thermal signatures, and predicts which platforms are experimentally tractable.

---

## Self-Explanation Prompts at Each Step

**After Step 1:** Why are there 9 terms? Could there be more? Could there be fewer?

**After Step 2:** Normalization eliminates 5 of the 9 terms. Which axiom is doing the most work in constraining the action?

**After Step 3:** Positivity imposes sign constraints but not equality constraints. Why does it not directly reduce the number of free parameters?

**After Step 4:** KMS is about thermal equilibrium. Would the constraints change if the system were not in thermal equilibrium?

**After Step 5:** The effective temperature is $T_H (1 + \gamma_1 / \kappa)$. If $\gamma_1 = 0$ (no dissipation), is Hawking radiation absent? Or does it persist?

**After Step 6:** We started with 9 arbitrary parameters. Now we have 2 physical parameters ($\gamma_1$, $\gamma_2$) plus the background ($c_s$, $\kappa$). Is this reduction surprising? Is it inevitable?

---

## Fading Worked Examples (Versions 2–6)

### Version 2: Same Axioms, Different System (Fermi Liquid)

**Surface variation**: Replace the acoustic black hole with a **Fermi liquid near a Mott transition**. Instead of phonons, track fermionic quasiparticles near the chemical potential.

**Kept intact**: Steps 1–4 (the axioms are universal). Step 5 (the structure of dissipative corrections).

**Faded**: Step 6. Now $\gamma_1$ is the "scattering rate" of fermionic quasiparticles, and $\gamma_2$ is the "band curvature correction." But the physics is the same: two universal couplings constrained by symmetry.

**Insight**: The EFT axioms don't depend on whether you're studying black holes, fluids, or electronic systems. They're universal. This is why effective field theory is so powerful.

---

### Version 3: Different Axiom Ordering

**Surface variation**: Apply the axioms in a different order: KMS first, then positivity, then normalization.

**Kept intact**: The final result (2 free parameters) must be the same, no matter the order.

**Faded**: Steps 2–4 now appear in a new sequence. KMS applied first gives relations. Positivity then selects which relations are physically realized. Normalization finally removes unphysical modes.

**Why this matters**: It shows that the axioms are **commuting constraints**. The order doesn't matter—the final answer is unique. This is a sign of robustness.

---

### Version 4: Count Degrees of Freedom Without Calculation

**Surface variation**: Given the 9-term action and three axioms, count the surviving free parameters without deriving the relations.

**Faded**: Steps 2–5 become pure dimension-counting.

**Prompts**:
- Normalization is 5 equations in 9 unknowns. How many free parameters remain?
- Positivity is an inequality, not an equation. Does it reduce parameters further?
- KMS relates time-derivatives to spatial-derivatives. In a $d$-dimensional system, how many independent time-derivative structures are there? How many spatial structures? What's the constraint ratio?

**Result**: By pure counting, deduce 2 parameters survive.

---

### Version 5: Inverse Problem — Measure the Parameters

**Surface variation**: Experimentalists measure the Hawking radiation spectrum of a sonic black hole in superfluid $^4\text{He}$. Can they extract $\gamma_1$ and $\gamma_2$?

**Faded**: Steps 1–4 are omitted. You're given the formula: $T_{\text{eff}} = T_H (1 + \delta_{\text{diss}})$.

**Task**: 
- What observable reveals $T_{\text{eff}}$? (Spectrum of phonons escaping the vortex.)
- How would you extract $\gamma_1$ from the spectrum?
- What additional information ($\kappa$, $T_H$, $c_s$) do you need to know to disentangle the two parameters?

**Insight**: This connects abstract EFT to experiment. It shows that physics is testable: symmetries make predictions, and predictions are measurable.

---

### Version 6: Generalization — Non-Equilibrium Heat Bath

**Surface variation**: The system is no longer in thermal equilibrium. It's coupled to a *time-dependent* heat bath at temperature $T(t)$ that changes with time.

**Faded**: All steps are absent. You're given the three axioms and asked to generalize them.

**Task**: 
- How would you modify KMS if the temperature changes?
- Would the constraint reduce the 9 terms to 2 parameters, or more?
- Sketch the form of the effective action in the non-equilibrium case.

**Deep question**: Is thermal equilibrium *necessary* for the reduction to 2 parameters? Or is it just the simplest case?

---

## Connection to Project Files

- **`FirstOrderKMS.lean`**: Formal verification that the KMS condition is satisfied by the constrained effective action. This file is *proof* that the 2-parameter reduction is consistent.

- **`SKDoubling.lean`**: The Schwinger-Keldysh contour structure. Reading this shows exactly how retarded and advanced fields are distinct mathematical objects, and why they must satisfy KMS.

- **`HawkingCorrection.lean`**: Computation of $\delta_{\text{diss}}$ as a function of $\gamma_1$ and $\kappa$. You can verify the formula algebraically.

- **`KappaScaling.lean`** (11 theorems): Formal verification of the LINEAR κ-scaling relation for $\delta_{\text{diss}}$, the crossover formula $\kappa_{\text{cross}} = 6(\gamma_1+\gamma_2)/(\pi\xi^2)$, and classification of dissipative vs. dispersive regimes. This is the Phase 5 discovery that overturned the constant-correction assumption.

- **`PolaritonTier1.lean`** (6 theorems): Validity bounds and thermal properties for polariton platforms. Establishes that polariton Hawking temperatures reach $T_H \sim 0.8$--4 K, enabling 10$^{10}$× more accessible detection compared to BEC's ~0.35 nK.

- **`src/experimental/kappa_scaling.py`**: Platform-specific parameter sweeps for κ-scaling. Computes dissipative-to-dispersive crossover location for BEC, polariton, and flowing water systems.

- **`src/experimental/polariton_predictions.py`**: Generates Hawking radiation spectra for Tier 1 polariton platforms, showing temperature enhancement and testable deviations from BEC predictions.

---

## The KMS Counterexample Story

In your papers, you mention that formal verification *caught an error* in an earlier version. Here's the cautionary tale:

An early draft assumed that all time-derivative terms could be treated independently of spatial-derivative terms. But KMS says: they're not independent. A violation of KMS would mean the system can be excited from thermal equilibrium without absorbing energy from the heat bath—a thermodynamic impossibility.

**The error**: Assuming $a_2$ and $a_4$ were independently adjustable violates KMS. The Lean proof made this explicit, forcing a revision.

**The lesson**: Formal verification is not busy-work. It catches conceptual errors that physical intuition might miss.

---

## Key Takeaways

1. **Three axioms, one answer.** Normalization, positivity, and KMS collapse 9 terms to 2 parameters. This is not a coincidence—it's *necessary* for a consistent quantum theory.

2. **Symmetry constrains more than we realize.** Before we can write down 9 arbitrary couplings, we must first ask: which combinations are allowed by thermodynamics?

3. **Dissipation modifies Hawking radiation.** The simple formula $T_H = \kappa / 2\pi$ picks up a correction $\delta_{\text{diss}} = \Gamma_H / \kappa$ from the medium's viscosity. This is testable.

4. **EFT is predictive.** Once you know the symmetries and count the free parameters, you can make predictions—and those predictions are typically universal (independent of microscopic details).

5. **Thermal equilibrium is powerful.** KMS enforces that nonequilibrium averages are consistent with equilibrium thermodynamics. This is why temperature—a seemingly macroscopic concept—emerges naturally from the microscopic effective action.

---

## Further Discussion Prompts

- **Black hole thermodynamics**: In a real black hole, why is there no dissipation correction? (Hint: what is the "medium" around a black hole?)

- **Quantum to classical**: At high temperature, quantum effects fade. What happens to $\gamma_1$ and $\gamma_2$ in the classical limit?

- **Experiment**: Could you measure $\delta_{\text{diss}}$ in a sonic black hole? What observable? What precision would you need?

- **Beyond first-order**: We focused on first-order in derivatives. What happens at second order? Are there still 2 free parameters?

- **Universality**: Is the 2-parameter structure universal? Could a different set of axioms give a different count?

---

## Notation and Conventions

- $\phi_R, \phi_A$: Retarded and advanced fields in the SK formalism.
- $\Sigma_R, \Sigma_A$: Retarded and advanced self-energies.
- $\kappa$: Surface gravity (steepness of the horizon).
- $c_s$: Speed of sound in the background medium.
- $\Gamma_H$: Dissipation rate at the horizon.
- $T_H$: Bare Hawking temperature (from classical geometry).
- $T_{\text{eff}}$: Effective temperature including dissipative corrections.
- $\gamma_1, \gamma_2$: Two independent EFT couplings.

---

## Summary: The Pipeline from Microscopy to Hawking

$$\boxed{\text{9 candidate terms}} \xrightarrow{\text{Normalization}} \boxed{\text{4 remaining}} \xrightarrow{\text{Positivity}} \boxed{\text{4 constrained}} \xrightarrow{\text{KMS}} \boxed{\text{2 parameters}} \xrightarrow{\text{Horizon physics}} \boxed{\delta_{\text{diss}} = \Gamma_H/\kappa}$$

This pipeline shows how a simple effective theory, when constrained by symmetry, becomes predictive. The Hawking radiation spectrum is no longer a free parameter—it's fixed by the viscosity and the horizon's geometry.

This is the power of SK-EFT.
