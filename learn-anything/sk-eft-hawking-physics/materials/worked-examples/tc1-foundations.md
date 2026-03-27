# TC1: Physical Foundations — Acoustic Metrics from Fluid Dynamics

## Overview

Sound travels through fluids. But what if the relationship between sound propagation and spacetime geometry runs *deeper* than we imagined? This worked example traces the mathematical path from conservation laws (continuity and momentum) through linearization to the discovery of an **acoustic metric**—a curved-spacetime structure that emerges from the simplest fluid dynamics.

By the end, you'll understand why **causality and geometry are inseparable**, and why a sonic horizon (where the flow speed equals the sound speed) is every bit as impenetrable as an event horizon in general relativity.

---

## Full Worked Solution: Acoustic Metric from Linearized Euler Equations

### Step 1: The Physical Setup — Fluid Conservation Laws

Before we can discover hidden geometry, we need to state the constraints that govern all fluids.

**The Continuity Equation** (conservation of mass):
$$\partial_t \rho + \nabla \cdot (\rho \mathbf{v}) = 0$$

where $\rho(t, \mathbf{x})$ is the mass density and $\mathbf{v}(t, \mathbf{x})$ is the velocity field.

**The Euler Equation** (Newton's second law for a fluid element):
$$\rho (\partial_t + \mathbf{v} \cdot \nabla) \mathbf{v} = -\nabla p$$

where $p = p(\rho)$ is the pressure (assuming barotropic flow: pressure depends only on density, not temperature).

> **Physical Insight**: The continuity equation says: "Mass in = mass out." The Euler equation says: "Force causes acceleration." These are not assumptions; they are the *definition* of what we mean by a fluid. Everything else follows from these two universal principles.

---

### Step 2: The Key Insight — Decompose into Background Plus Perturbations

The magic move: **separate the flow into a steady background plus small ripples**. This is where the geometry hides.

Let:
$$\rho(t, \mathbf{x}) = \rho_0(\mathbf{x}) + \delta\rho(t, \mathbf{x})$$
$$\mathbf{v}(t, \mathbf{x}) = \mathbf{v}_0(\mathbf{x}) + \delta\mathbf{v}(t, \mathbf{x})$$
$$p(t, \mathbf{x}) = p_0(\mathbf{x}) + \delta p(t, \mathbf{x})$$

The **background** $(\rho_0, \mathbf{v}_0, p_0)$ is steady-state: $\partial_t \rho_0 = 0$ and $\rho_0 \nabla \cdot \mathbf{v}_0 = 0$. It satisfies the equations exactly, independently of time.

The **perturbations** $(\delta\rho, \delta\mathbf{v}, \delta p)$ are small and carry all the wave information.

The **local sound speed** in the background is:
$$c_s^2(\mathbf{x}) = \frac{dp}{d\rho}\bigg|_{\rho_0}$$

This is a property of the medium: how quickly pressure responds to density changes.

> **Physical Insight**: The background does the hard work. It creates the stage (the geometry). Perturbations play on that stage. By freezing the background and studying how waves propagate, we expose the geometric structure hidden in the equations.

---

### Step 3: Linearization — Drop Second-Order Terms

Substitute the decomposition into the continuity and Euler equations. Products of two small quantities (like $\delta\mathbf{v} \cdot \nabla \delta\mathbf{v}$) are second-order and drop out.

**Continuity, linearized:**
$$\partial_t \delta\rho + \rho_0 \nabla \cdot \delta\mathbf{v} + \delta\mathbf{v} \cdot \nabla\rho_0 = 0$$

**Euler, linearized:**
$$\rho_0 (\partial_t + \mathbf{v}_0 \cdot \nabla) \delta\mathbf{v} = -\nabla \delta p$$

Using the relation $\delta p = c_s^2 \delta\rho$:
$$\rho_0 (\partial_t + \mathbf{v}_0 \cdot \nabla) \delta\mathbf{v} = -c_s^2 \nabla \delta\rho$$

> **Physical Insight**: Linearization is not just a mathematical trick. It isolates the *kinematic* structure—how the geometry determines wave motion—from the *dynamic* details of what the waves actually do. This is why linearized hydrodynamics is so powerful: it reveals universal structure.

---

### Step 4: Working Through It — 1D Wave Equation

For clarity, specialize to **1D flow** along the $x$-direction. The background velocity is $v_0(x)$, the background density is $\rho_0(x)$, and both are independent of time.

**Continuity (1D):**
$$\partial_t \delta\rho + \rho_0 \partial_x \delta v + \delta v \partial_x \rho_0 = 0$$

**Euler (1D):**
$$\rho_0 (\partial_t + v_0 \partial_x) \delta v = -c_s^2 \partial_x \delta\rho$$

From the Euler equation:
$$\partial_x \delta v = -\frac{1}{\rho_0 c_s^2} (\partial_t + v_0 \partial_x) \delta v$$

For a uniform background ($\partial_x \rho_0 = 0$), the continuity equation becomes:
$$\partial_t \delta\rho = -\rho_0 \partial_x \delta v$$

Differentiate with respect to time:
$$\partial_t^2 \delta\rho = -\rho_0 \partial_t \partial_x \delta v = -\rho_0 \partial_x (\partial_t \delta v)$$

From Euler, $\partial_t \delta v = -(1/\rho_0)[c_s^2 \partial_x \delta\rho + v_0 \partial_x \partial_t \delta v]$. Rearranging:

$$(\partial_t + v_0 \partial_x) \partial_t \delta\rho = c_s^2 \partial_x^2 \delta\rho$$

Expand the left side:
$$\partial_t^2 \delta\rho + v_0 \partial_x \partial_t \delta\rho = c_s^2 \partial_x^2 \delta\rho$$

Rearrange:
$$\partial_t^2 \delta\rho + v_0 \partial_x \partial_t \delta\rho - c_s^2 \partial_x^2 \delta\rho = 0$$

This is the **wave equation in a moving medium**.

---

### Step 5: The Punchline — Identify the Acoustic Metric

The equation we derived:
$$\partial_t^2 \delta\rho + v_0 \partial_x \partial_t \delta\rho - c_s^2 \partial_x^2 \delta\rho = 0$$

can be rewritten in the form:
$$\partial_t^2 \delta\rho + 2v_0 \partial_t \partial_x \delta\rho + (v_0^2 - c_s^2) \partial_x^2 \delta\rho = 0$$

This matches the **wave equation on a curved spacetime**:
$$g^{\mu\nu} \partial_\mu \partial_\nu \delta\rho = 0$$

where the **contravariant metric** is:
$$g^{\mu\nu} = \begin{pmatrix} 1 & v_0 \\ v_0 & v_0^2 - c_s^2 \end{pmatrix}$$

By inverting (with determinant $-c_s^2$), the **covariant metric** is:
$$g_{\mu\nu} = \frac{1}{-c_s^2}\begin{pmatrix} v_0^2 - c_s^2 & -v_0 \\ -v_0 & 1 \end{pmatrix}$$

or equivalently:
$$g_{\mu\nu} = \begin{pmatrix} 1 - v_0^2/c_s^2 & v_0/c_s^2 \\ v_0/c_s^2 & -1/c_s^2 \end{pmatrix}$$

**This is the acoustic metric.** Sound waves in the fluid obey the equations of a scalar field propagating in curved spacetime.

> **Physical Insight**: The metric encodes *causality*. At each point in space, there's a speed of sound $c_s$. In the lab frame, this speed is modified by the flow: $c_s^+ = c_s + v_0$ (downstream) and $c_s^- = c_s - v_0$ (upstream). If $v_0 > c_s$ anywhere (supersonic flow), the metric signature flips at that point—creating a null surface analogous to an event horizon.

---

### Step 6: Physical Interpretation — Causality and Horizons

Here's the profound part: **when the flow speed exceeds the sound speed, causality changes**.

**Subsonic regime** ($v_0 < c_s$):
- Sound can propagate both upstream and downstream.
- Information can flow in both directions.
- The metric has signature $(-,+)$ (one timelike, one spacelike direction).
- Geometry is Riemannian (non-hyperbolic).

**Supersonic regime** ($v_0 > c_s$):
- Sound cannot propagate against the flow. An upstream-moving wave is swept downstream.
- A disturbance created at point $x$ cannot reach any point upstream—they are causally disconnected.
- The metric signature changes. At the sonic point $v_0 = c_s$, the metric determinant vanishes, creating a **null surface**.
- Geometry is Lorentzian (hyperbolic), locally similar to the structure near a black hole.

**The Sonic Horizon**: The surface where $v_0(x_h) = c_s$ is analogous to an event horizon. No signal can climb back upstream. Everything that crosses is irreversibly swept downstream.

This is *not* relativity. It's pure fluid mechanics. Yet the causal structure is identical in form.

> **Physical Insight**: Geometry is *not fundamental*. It's the *shape of causality*. Whenever you have a medium with wave propagation, and whenever that medium has barriers (speed limits), you get geometric structure. Gravity might work the same way: spacetime geometry emerges from the causal structure of the quantum vacuum or some other medium.

---

## Self-Explanation Prompts at Each Step

**After Step 1:** Why do we need *both* the continuity and Euler equations? What would happen if we only had one?

**After Step 2:** The background flow is "steady-state," meaning time-independent. But how was this background created? Are we assuming it was set up long ago and is now stable?

**After Step 3:** When we drop second-order terms, we lose information. Under what condition is this approximation good? (Hint: what must be true about $\delta\rho / \rho_0$ and $\delta v / v_0$?)

**After Step 4:** The term $v_0 \partial_x \partial_t \delta\rho$ is odd—it mixes time and space derivatives. Physically, what does this represent? What happens if $v_0 = 0$ (no flow)?

**After Step 5:** We "identified" a metric from the wave equation. But how do we *know* this metric is the right interpretation? Could we interpret the same equation differently?

**After Step 6:** In a transonic flow, there's a point where $v_0 = c_s$. What happens to the acoustic metric *exactly at this point*? (Hint: what is $\det g$?)

---

## Fading Worked Examples (Versions 2–6)

Each version keeps the same *conceptual flow* but varies the *context* or *level of detail*. After mastering the full version, attempt these to see how robust your understanding is.

### Version 2: Radial Flow Around a Sphere

**Surface variation**: Replace 1D uniform flow with radial flow around a conical obstacle in 2D or 3D.

**New context**: The background velocity $v_0(r)$ depends on radius (spherical coordinates). From potential flow theory: $v_0(r) = V_\infty (1 + a^3/r^3)$ (incompressible analogue).

**Kept intact**: Steps 1–3 (conservation laws and linearization are universal). Step 4 (deriving the wave equation, but now in spherical coordinates). Step 5 (reading off the metric).

**New complexity**: The acoustic metric now depends on both $r$ and angle $\theta$. The sonic surface is not a plane but a sphere where $v_0(r_h) = c_s$.

**Payoff**: You see that geometry is not limited to 1D. The sonic surface becomes a *ball* in 3D—a causal boundary that has spatial extent and curvature.

---

### Version 3: Non-Barotropic Flow (Temperature Matters)

**Surface variation**: Relax the barotropic assumption. Now pressure depends on both density and temperature: $p = p(\rho, T)$.

**New context**: The sound speed is $c_s^2 = (\partial p/\partial \rho)|_T + (\partial p/\partial T)|_\rho (\partial T/\partial \rho)|_s$. In addition to the continuity and Euler equations, we have an energy equation for temperature.

**Kept intact**: Steps 1–2 (same conservation laws). Step 3 (linearization, but now you have an extra equation for $\delta T$).

**Faded**: Step 4 (the wave equation is now a coupled system for $\delta\rho$ and $\delta T$). Step 5 (the metric involves both variables).

**Insight**: Temperature gradients modify the effective sound speed. A hotter fluid has a larger $c_s$, so the horizon shifts outward. This shows that geometry is *dynamical*—it changes as the thermodynamic state changes.

---

### Version 4: Three Dimensions Without Derivation

**Surface variation**: Write down the 3D acoustic metric directly (given as a black box).

**Faded**: Steps 1–4 are omitted. You're given the result and asked to *interpret* it.

**New task**: "The acoustic metric in 3D with an axisymmetric flow $v_0 = v_0(r, z)$ is..." (provided). 

- Where is the sonic surface?
- What is the causal structure on that surface?
- How many transverse (propagation) directions exist at the horizon?

**Why fading this way**: Once you've derived the metric once, you can read off properties from it without re-deriving. This trains the skill of "given a metric, extract physics."

---

### Version 5: From Acoustic Metric to Hawking Analogue

**Surface variation**: Take the acoustic metric as *given*. Now reason about *thermodynamics*.

**Faded**: Steps 1–4 are gone. You start with: "A transonic flow has a sonic surface at $x = 0$ with surface gravity $\kappa = dv/dx|_{x=0}$. The acoustic metric is..."

**New task**: 
- By analogy with general relativity, what is the "Hawking temperature" of this sonic horizon?
- If the flow dissipates energy (viscosity), what happens to the horizon?
- Is there a minimum-energy state?

**Why this fading**: It bridges from pure classical hydrodynamics to the thermodynamic properties we associate with black holes. You're no longer deriving; you're applying analogies.

---

### Version 6: Design Your Own Transonic Flow

**Surface variation**: Open-ended design task.

**Faded**: All scaffolding is removed. You're given only the definition: "A sonic horizon is a null surface where the metric signature flips."

**Your task**:
- Design a flow velocity profile $v_0(x)$ that has a sonic horizon at $x = 0$.
- Compute the acoustic metric and verify that $\det(g_{\mu\nu}) = 0$ at the horizon.
- Sketch the light-cone structure (which directions are causal at different locations).
- Propose an experiment to detect the "causal trapping" of sound waves.

**Minimal guidance**: You must identify what constraints $v_0(x)$ must satisfy and verify them yourself.

---

## Connection to Project Files

Your project includes these implementations:

- **`transonic_background.py`**: Computes $v_0(x)$ and $c_s(x)$ for various flow profiles (Gaussian, step-function, realistic aerodynamic shapes). Use this to test your understanding of where horizons appear.

- **`AcousticMetric.lean`**: Formal verification that the metric satisfies Einstein-like equations. Reading this will show you exactly which properties are *provable* vs. *assumed*.

- **`FirstOrderKMS.lean`**: The Schwinger-Keldysh structure enforcing that dissipation is thermodynamically consistent. This is the bridge from classical hydrodynamics to quantum corrections.

---

## Key Takeaways

1. **Geometry is not fundamental.** It emerges from the structure of wave propagation in a medium.

2. **Causality determines geometry.** When the flow velocity matches the wave speed, causal connectivity changes abruptly. This is encoded in the metric.

3. **Sonic horizons are real.** Sound cannot escape a supersonic flow region, just as light cannot escape a black hole.

4. **Linearization is powerful.** By freezing the background and studying small ripples, we expose universal structure that would be hidden in the nonlinear equations.

5. **Feynman's intuition is correct.** "Maybe the universe is made of something else." Here, we see spacetime-like geometry emerging from a fluid—a "something else."

---

## Further Discussion Prompts

- **Entropy**: If a sonic horizon traps sound waves, does it have thermodynamic properties? What would temperature mean in a purely classical fluid?

- **Nonlinearity**: We linearized the equations. Where does linearization break down? Are there effects of large-amplitude perturbations that change the causal structure?

- **Dimension**: How would the acoustic metric change in 2D? In higher dimensions? Is the causal structure dimension-dependent?

- **Quantum effects**: In a real fluid, there are no true point particles—only quanta of the fluid (phonons). How does quantization change the picture? Does it modify the effective metric?

- **Experimental test**: Could you actually measure the "Hawking radiation" of a sonic horizon in the lab? What observable would you look for?

---

## Appendix: Notation and Conventions

- $\rho_0, \mathbf{v}_0, p_0$: Background fields (steady, time-independent)
- $\delta\rho, \delta\mathbf{v}, \delta p$: Perturbations (small, carry wave info)
- $c_s = \sqrt{dp/d\rho}$: Local sound speed
- $g_{\mu\nu}$: Covariant metric tensor (what you measure)
- $g^{\mu\nu}$: Contravariant metric (appears in wave equations)
- $(t, x)$ in 1D; $(\mu, \nu) \in \{0, 1\}$ for timelike and spacelike
- Signature convention: $(-,+,+,+)$ in 4D; $(-,+)$ in 1+1D

---

## Summary: From First Principles to Geometry

| Step | Input | Process | Output |
|------|-------|---------|--------|
| 1 | Fluid properties | Apply Newton + conservation | Continuity + Euler equations |
| 2 | Physical setup | Separate background + perturbations | Uncouple fast from slow dynamics |
| 3 | Approximate | Drop second-order terms | Linearized equations |
| 4 | Manipulate | Combine continuity + momentum | Single wave equation |
| 5 | Interpret | Read off metric from wave operator | Acoustic geometry |
| 6 | Analyze | Study causality structure | Sonic horizons and causal trapping |

Each step is reversible—if you understand the metric, you can work backward to the conservation laws.
