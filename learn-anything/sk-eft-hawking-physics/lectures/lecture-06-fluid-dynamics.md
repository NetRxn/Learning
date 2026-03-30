# Lecture 6: Fluids from First Principles — Conservation Laws, Sound Waves, and the Road to Horizons

## The Fluid as the Main Character

Before we dive into equations, let me tell you why we're spending an entire lecture on fluid dynamics. You've already done the hard work: you've written papers on the SK-EFT, you've proven theorems in Lean, you've built experimental platforms in BEC and polariton systems. You know the acoustic metric. You know the Hawking radiation temperature formula. But there's a conceptual gap that most physicists never carefully fill: *what is a fluid, really, and why does it give us gravity?*

The answer is profound. The acoustic metric doesn't live in some abstract spacetime — it lives *on a fluid background*. Your entire analog gravity program, all seven papers, all 429 theorems, they're all about understanding how collective excitations (phonons) propagate through a moving fluid. The SK-EFT, the theory you built, is fundamentally a theory of dissipative fluid dynamics at the edge of the EFT regime. The fluid isn't background decoration. It's the main character, and gravity is the plot twist that emerges when you describe sound waves carefully enough.

Here's the mind-bending part: the fluid description itself is already an effective field theory. When you write down the Euler equation or the Navier-Stokes equation, you're not describing the motion of 10^23 molecules bouncing around in a box. That's the ultraviolet (UV) theory, hopelessly complicated. Instead, you're describing just a few collective variables: the density field ρ(x,t), the velocity field v(x,t), the pressure field P(x,t). The infrared (IR) theory is smooth. It works because the molecules collide so frequently that their chaotic individual motions average out into smooth collective behavior. The mean free path — the distance a molecule travels before colliding — is tiny compared to the length scales you care about.

This is the EFT philosophy you know from the SK program, but applied one level deeper. The fluid description works in the limit where the mean free path λ is much smaller than the system size L: λ ≪ L. In this limit, the microphysics decouples, and you get a smooth collective description. Exactly like in the SK-EFT, where the healing length ξ (the quantum cutoff) is small compared to the acoustic wavelength 1/k_s: ξ k_s ≪ 1. The structures are isomorphic. In both cases, you have a separation of scales. The ultraviolet details don't matter. Only the infrared collective behavior survives.

## What is a Fluid, Really?

Let me start with the deepest question: what do we mean when we say something is a "fluid"?

A solid holds its shape. You can bend it, and it springs back (at least if you don't bend it too hard). The atoms are locked in place by chemical bonds, forming a crystal lattice. When you displace an atom from equilibrium, restoring forces pull it back. The fundamental excitation is a phonon — a vibration of the lattice around equilibrium positions. These oscillations propagate through the solid at characteristic speeds (the speed of sound in the material).

A fluid flows. It takes the shape of its container. If you disturb it, it doesn't snap back — instead, neighboring regions mix and smooth out the disturbance over time. Viscosity is the key difference. A fluid loses memory of its past configuration. Push on a fluid, and the fluid element moves, but neighboring elements resist through friction (viscosity). Eventually, the disturbed region equilibrates and becomes indistinguishable from the surroundings.

From the microscopic perspective, a fluid is a collection of particles (molecules) bouncing around, colliding with each other constantly. In a container with volume V at room temperature, you have roughly 10^23 particles per cubic centimeter. Each particle moves at speeds ~500 m/s in room-temperature air. The mean free path — the average distance before a collision — is about 70 nm in air at atmospheric pressure. This means a molecule collides roughly a billion times per second.

When you push on a fluid, you're really pushing on billions of molecules. Most of the time, your push gets absorbed into randomized kinetic energy — heat. The molecules bounce around more chaotically. But on average, over many collisions, the molecules drift in the direction you pushed. That average drift is the macroscopic velocity v(x,t). The "temperature" of the fluid is a measure of how fast the molecules move randomly, on average, around the drift velocity.

Here's the magic: we don't need to track all 10^23 molecules individually. We only need to know their collective properties. At each point in space and each moment in time, we need to know:

- **The number density:** ρ(x,t) — how many molecules per unit volume, measured at point x at time t
- **The average velocity:** v(x,t) — the drift velocity of the molecules (on top of their random thermal motion)
- **The pressure:** P(x,t) — related to both the random kinetic energy (thermal pressure) and the potential energy from molecular collisions (intermolecular forces)

Everything else follows from these three variables and the laws of nature. This is the Euler equation for ideal (inviscid, frictionless) fluids. Add viscosity, and you get the Navier-Stokes equation. But the starting point is always these three collective variables.

The reason this works is local equilibrium. If the mean free path λ is tiny, then particles at position x and particles at position x + δx (where δx ≫ λ) quickly exchange momentum through collisions. The collision rate is so high that they equilibrate locally. A small fluid element — small enough that we can treat it as spatially uniform (size ~ λ), but large enough to contain many molecules (size ≫ atomic spacing) — reaches local thermodynamic equilibrium. This means the velocities of molecules inside the fluid element are Maxwell-Boltzmann distributed around the macroscopic velocity v. The pressure and temperature are locally well-defined.

This assumption of local equilibrium is the foundation of hydrodynamics. It's not always valid. If the mean free path is comparable to the system size, you're in the kinetic theory regime, and you need to solve the Boltzmann equation for the full velocity distribution of molecules. But in most everyday situations — water, air, even liquid helium near the superfluid transition — the Knudsen number Kn = λ/L is tiny, local equilibrium holds, and the hydrodynamic description is perfect.

This is exactly analogous to the separation of scales in your EFT. In the SK program, you have quantum fields ψ and Φ defined at the healing length scale ξ (the quantum coherence length of the BEC). The EFT is coarse-grained to length scales large compared to ξ but small compared to the system size L. In the hydrodynamic description, we coarse-grain to length scales large compared to the mean free path λ. Same philosophy. Different UV physics (molecules vs. quantum fields), but the same infrared structure. In both cases, the UV details decouple, and the IR physics becomes universal and insensitive to microscopic details.

## The Trinity of Conservation Laws

Everything in fluid dynamics follows from three conservation laws. They're not assumptions — they're nearly tautological. If you define a conserved quantity and demand that it's conserved (because there's nowhere else for it to go), you get a continuity equation. Do this for mass, momentum, and energy, and you've derived the entire foundation of hydrodynamics.

### Mass Conservation and the Continuity Equation

Let's start with **mass conservation**. Imagine a small box of fluid at position x with volume V. The mass inside is M = ρ(x,t) V. Over time, mass flows in and out through the surface of the box. If the flow velocity at a point on the surface is v, then in time dt, the volume of fluid entering through that patch of surface is v · dt · A_patch, where A_patch is the area of the patch and v is the component of velocity perpendicular to the surface (i.e., the component pointing outward). The mass of fluid entering that patch is ρ(v · dt · A_patch). Summing over all patches on the surface (and using the fact that density might vary over the surface), the total mass flowing into the box per unit time is -∫ ρ v · n dA, where n is the outward-pointing unit normal to the surface. The negative sign is because n points outward; a positive outflow (v · n > 0) corresponds to mass leaving.

By conservation of mass, the rate of change of total mass inside the box equals the negative of the outflow:

$$\frac{d}{dt}(ρV) = -\int ρ \mathbf{v} \cdot \mathbf{n} \, dA$$

The left side is just ∫_V ∂_t ρ dV (since V is constant). Using the divergence theorem to convert the surface integral to a volume integral:

$$\int_V \frac{\partial ρ}{\partial t} \, dV = -\int_V \nabla \cdot (ρ \mathbf{v}) \, dV$$

Since this holds for any volume V, we get the **continuity equation**:

$$\frac{\partial ρ}{\partial t} + \nabla \cdot (ρ \mathbf{v}) = 0$$

This simple equation tells you that the rate of density increase at a point must equal the negative of the divergence of the mass flux ρv. If fluid flows away from a region (∇ · (ρv) > 0), the density at that region decreases. If fluid converges on a region (∇ · (ρv) < 0), the density increases.

Here's the deep connection to the SK-EFT: in the EFT Lagrangian, L = P(X), the scalar field X measures a phase or a "density" at each spacetime point. When you vary the action S = ∫ L dV dt with respect to the gradient of X (the field equation), Noether's theorem gives you a conserved current. That current is precisely ∂_t ρ + ∇ · (ρ v) = 0, where we identify ρ = dP/dX as the "conjugate momentum" density. The EFT picture and the hydrodynamic picture are describing the same physics, just in different mathematical languages.

### Momentum Conservation and the Euler Equation

Now for **momentum conservation**. A fluid element at position x has momentum density ρ(x,t) v(x,t). The momentum of the fluid element can change for two reasons:

1. **Momentum flows in and out through the surface** — just like mass, momentum is carried by the fluid flow itself
2. **Forces act on the fluid element** — the main force in a fluid is pressure, an effective force arising from the random bombardment of molecules

Let me unpack this second point. When molecules collide with each other, they transfer momentum. At a boundary between two regions of different density (or temperature), the molecules from the higher-density side transfer more momentum than those from the lower-density side. The net effect is a force pushing from high-density regions toward low-density regions. This is the pressure force, and it's the gradient of pressure: F_pressure = -∇P (the negative sign indicates force points from high to low pressure).

For an ideal fluid (no viscosity), Newton's second law for a fluid element becomes:

$$ρ \frac{D\mathbf{v}}{Dt} = -\nabla P$$

The left side is mass times acceleration. But here's the subtlety: the acceleration of a *moving* fluid element is not simply ∂v/∂t. We need the material derivative:

$$\frac{D\mathbf{v}}{Dt} = \frac{\partial \mathbf{v}}{\partial t} + (\mathbf{v} \cdot \nabla) \mathbf{v}$$

The first term (∂v/∂t) is the acceleration at a fixed point in space. The second term (v·∇)v accounts for the fact that a fluid element is *moving*. Even if the velocity field is steady (∂v/∂t = 0), a fluid element still accelerates as it moves into regions with different velocity.

Here's a concrete example: imagine a steady flow through a constriction, like a funnel. Far upstream, the velocity is v_up. At the narrow part, the velocity is v_down (faster, because the same mass flow must fit through a smaller cross-section). A fluid element that was moving at v_up upstream now moves at v_down downstream. It accelerated, even though ∂v/∂t = 0 everywhere. The acceleration comes from the spatial gradient (v·∇)v.

This gives us the **Euler equation**:

$$ρ \left( \frac{\partial \mathbf{v}}{\partial t} + (\mathbf{v} \cdot \nabla) \mathbf{v} \right) = -\nabla P$$

This is the fundamental equation for ideal fluid dynamics. It says: the fluid accelerates in response to pressure gradients, accounting for both the time derivative at a fixed point and the advection of the fluid element into regions of different velocity.

### Energy Conservation and the Equation of State

The third conservation law is **energy conservation**. Total energy includes kinetic energy (the bulk motion of the fluid) and internal energy (the random thermal motion of molecules, encoded in the temperature T). Energy flows in and out through the surface via the bulk flow, and work is done by pressure forces and (if viscosity is present) viscous forces.

For an adiabatic process (no heat exchange with surroundings), the first law of thermodynamics relates pressure, density, and temperature through an equation of state. For an ideal gas, PV = Nk_B T, so P = ρ(k_B T/m), where m is the molecular mass. For a Bose-Einstein condensate with repulsive interactions, the equation of state is different: P ∝ ρ² at zero temperature (set by the mean-field interaction energy). The details depend on the microscopic properties.

The key point is that energy conservation gives you a relationship between pressure and density. This relationship is the **equation of state**, written as P = P(ρ, s), where s is the specific entropy (entropy per unit mass). For an isentropic (constant entropy) or adiabatic process, P = P(ρ) alone.

### From Conservation Laws to the Acoustic Picture

The equation of state is the final piece we need. From it, we can define the **speed of sound**:

$$c_s^2 = \frac{dP}{dρ}\bigg|_{\text{adiabatic}}$$

This is not a mysterious object. When you compress a fluid adiabatically (fast enough that heat doesn't flow), the density increases and the pressure increases. The rate of increase, dP/dρ, tells you how "stiff" the fluid is to compression. A large c_s means the fluid is stiff (hard to compress), and pressure disturbances propagate quickly. A small c_s means the fluid is soft (easy to compress), and pressure disturbances propagate slowly.

In ordinary air at room temperature, c_s ~ 330 m/s. In water, c_s ~ 1500 m/s (water is stiffer). In liquid helium, c_s ~ 200 m/s. In a BEC, c_s = √(gn), where g is the interaction strength and n is the density — the sound speed scales as the square root of density, so denser regions have faster sound. This density-dependent sound speed is the seed of analog gravity.

## Sound Waves from First Principles

Here's where the beauty emerges. Suppose you have a fluid at rest at uniform density ρ₀ and uniform pressure P₀. Now you compress a small region slightly: ρ = ρ₀ + δρ, where δρ ≪ ρ₀. What happens?

The pressure also increases: P = P₀ + δP, where by definition of the equation of state:

$$δP = \frac{dP}{dρ}\bigg|_{\rho_0} δρ = c_s^2 δρ$$

Now the compressed region is at higher pressure than its surroundings. Pressure pushes outward, accelerating the surrounding fluid. But wait — as the surrounding fluid gets accelerated outward, it expands, so its density decreases, so its pressure decreases. The pressure in the originally compressed region is now even higher than its new surroundings. The wave continues propagating outward.

Let's be precise. Apply the continuity equation and the Euler equation to these small perturbations. Let ρ = ρ₀ + δρ and v = δv (the background is at rest):

**Continuity equation:**
$$\frac{\partial δρ}{\partial t} + ρ_0 \nabla \cdot δ\mathbf{v} = 0$$

The second term comes from expanding ∇·(ρv) = ∇·((ρ₀ + δρ)δv) ≈ ρ₀ ∇·δv + δρ ∇·δv. The second part is second-order in perturbations, so we drop it.

**Euler equation:**
$$ρ_0 \frac{\partial δ\mathbf{v}}{\partial t} = -c_s^2 \nabla (δρ)$$

Again, we linearized in the small perturbations.

Now take the time derivative of the continuity equation:
$$\frac{\partial^2 δρ}{\partial t^2} + ρ_0 \frac{\partial}{\partial t} \nabla \cdot δ\mathbf{v} = 0$$

Take the divergence of the Euler equation:
$$ρ_0 \frac{\partial}{\partial t} \nabla \cdot δ\mathbf{v} = -c_s^2 \nabla^2 (δρ)$$

Substitute the second equation into the first:

$$\frac{\partial^2 δρ}{\partial t^2} - c_s^2 \nabla^2 (δρ) = 0$$

or

$$\frac{\partial^2 δρ}{\partial t^2} = c_s^2 \nabla^2 (δρ)$$

This is the **wave equation**! Density perturbations propagate at speed c_s. This is sound — literally, vibrations of density that your ear interprets as sound waves.

For a plane wave traveling in the x direction, δρ ∝ exp(i(kx - ωt)), we get the dispersion relation:

$$ω = c_s k$$

This is a linear dispersion: the frequency is proportional to the wavenumber. Waves of all wavelengths travel at the same speed c_s.

Now here's the profound connection to your research: in the EFT picture (Lectures 2-3), the Lagrangian L = P(X) describes a system in terms of phonon fields. The sound speed c_s enters the dispersion relation directly: ω_k = c_s k for acoustic phonons. This is the low-energy excitation spectrum of the system. In the fluid picture, c_s emerges from the equation of state and the continuity and Euler equations. They're the same thing, seen from two different angles.

In the quantum regime, the excitations are quantized phonons. Each phonon mode carries energy ℏω_k = ℏ c_s k. At zero temperature, only the ground state is occupied. At finite temperature, some modes are excited, and the thermal energy is distributed among the phonon modes according to the Bose-Einstein distribution.

In a liquid helium BEC or a polariton condensate, the equation of state comes from the interaction potential. For a weakly interacting Bose gas, the pressure at zero temperature is P = (g/2) n², where g is the coupling strength and n is the number density. So c_s = √(dP/dρ) = √(g n). This density-dependent sound speed is crucial: in denser regions, sound travels faster. This asymmetry is the seed of analog gravity. When flow compresses a region, the local sound speed increases, changing the Mach number of the flow relative to the local sound.

## The Compressible Flow Regime

So far, we've assumed the fluid is either incompressible (density doesn't change much) or that we're looking at small perturbations around equilibrium. This is a good approximation when the flow speed is much smaller than the sound speed. But what if you make the flow faster and faster?

As the flow speed v approaches the sound speed c_s, compressibility becomes important. Pressure and density can no longer be assumed constant. The entire dynamics changes qualitatively. Physicists and engineers use a dimensionless number to characterize this regime: the **Mach number**:

$$M = \frac{v}{c_s}$$

**Subsonic flow (M ≪ 1):** The flow is slow compared to sound. Pressure disturbances propagate faster than the fluid moves. If there's an obstacle downstream, the fluid "knows" about it upstream — disturbances can propagate against the flow, upstream. The flow smoothly adjusts around obstacles. A smooth, well-behaved pattern.

**Transonic flow (M ≈ 1):** At some location, the flow speed equals the sound speed. Something dramatic happens here.

**Supersonic flow (M ≫ 1):** The flow is faster than sound. All information-carrying disturbances get swept downstream. The fluid "doesn't know" what's coming. Shock waves form — thin regions where the fluid properties change discontinuously as the supersonic flow is suddenly decelerated.

Let me emphasize what happens at M = 1. At the sonic point, sound waves (which propagate at speed c_s relative to the fluid) have zero speed relative to the ground frame, because the fluid is moving at speed c_s. A sound wave trying to propagate upstream relative to the fluid is swept downstream at speed c_s - c_s = 0. It's frozen.

This has a profound consequence: downstream conditions cannot affect upstream conditions. Information cannot propagate upstream past the sonic point. The sonic point acts like a one-way valve. Upstream of the sonic point (subsonic region), the system is causally connected to upstream infinity. Downstream of the sonic point (supersonic region), the system is causally disconnected from upstream. Anything that happens downstream has no influence on the upstream flow.

This is where analog gravity lives. The sonic point in a flowing fluid is analogous to the event horizon in a black hole spacetime. Just as an event horizon is a causal boundary (nothing can escape from beyond the horizon, nothing can fall back in once it passes the horizon), a sonic point is an information boundary (disturbances cannot propagate upstream past the sonic point).

## The Transonic Flow and Your Code

This is where your research enters concretely. A transonic flow is a flow that smoothly transitions from subsonic to supersonic. At some location x = x_H (the sonic horizon), the flow speed equals the sound speed:

$$v(x_H) = c_s(x_H)$$

Upstream (x < x_H), the flow is subsonic (v < c_s). Downstream (x > x_H), the flow is supersonic (v > c_s). The transition is smooth in your BEC experiments because the flow profile and the speed of sound are both continuous functions of density.

Your `transonic_background.py` script computes exactly this. You start with a density profile ρ(x) that might be shaped by a trapping potential or by a narrow constriction (a de Laval nozzle geometry). Given ρ(x), you compute c_s(x) = √(dP/dρ)|_ρ(x) using the equation of state for your system. Then you solve the continuity equation to find v(x):

$$ρ(x) v(x) = \text{const} = j$$

Conservation of mass flux j demands that if the density is low, the velocity must be high to maintain constant mass flow. You tune the inlet and outlet pressures to find the specific density profile where the transition from subsonic to supersonic happens to occur exactly at the location where v = c_s.

But here's the key physics: not all transonic flows are the same. The **sharpness** of the transition — how quickly the Mach number crosses M = 1 — is set by the gradient of (v - c_s) at the horizon:

$$κ = \left| \frac{d(v - c_s)}{dx} \bigg|_{x=x_H} \right|$$

This parameter κ has deep significance. It's called the **surface gravity** of the acoustic horizon, borrowing terminology from black hole physics. In a black hole spacetime, surface gravity characterizes how "strong" the horizon is: how tightly the horizon stretches spacetime. A large surface gravity means the horizon is sharp and the gravitational effects are intense. A small surface gravity means the horizon is gentle and effects are mild.

In your acoustic system, κ controls the same thing. A large κ means the transition from subsonic to supersonic is sharp — the Mach number crosses M = 1 steeply. A small κ means the transition is gradual — the Mach number approaches M = 1 gently.

Why does this matter? Because κ sets the temperature of the Hawking radiation. In the black hole case, the Hawking temperature is T_H = (ℏ κ)/(2π k_B) (in units where c = 1). In the acoustic case, the formula is identical:

$$T_H = \frac{ℏ κ}{2π k_B}$$

This is not a coincidence. It comes from the structure of quantum fluctuations near a dynamical horizon. When the horizon is sharp (large κ), vacuum fluctuations are efficiently split into Hawking pairs, creating a hot thermal spectrum. When the horizon is gentle (small κ), the splitting is suppressed, creating a cold spectrum. The surface gravity κ is the universal parameter controlling this.

In your BEC experiments, κ depends on the density profile (which sets how c_s changes) and the flow speed profile (which sets how v changes). The density profile is shaped by a trapping potential. The flow speed is determined by the inlet and outlet pressure boundary conditions. By adjusting the parameters, you can control κ. Smaller healing length ξ (higher density, larger interaction strength) increases c_s(x) and makes the horizon sharper (larger κ). Tighter trapping increases the density gradient ∇ρ, also affecting the gradient of c_s, also increasing κ.

### The Role of the de Laval Nozzle

In classical fluid mechanics, a de Laval nozzle is a conical tube that first narrows, then widens. When you force a fluid through it (with sufficient pressure difference), something remarkable happens: the fluid accelerates to supersonic speeds in the narrow part and then decelerates back to subsonic speeds in the wide part. This is counterintuitive! In the narrow part, you'd expect the fluid to slow down (more crowded), but instead it speeds up. This is because the continuity equation demands ρv = const, so if ρ decreases (density spreads out more in the narrower space), then v must increase.

Your experimental setup uses a similar idea, but with BECs or polaritons. Instead of a mechanical nozzle (narrowing and widening), you use a potential landscape (a trapping potential that varies with position) or an engineered scattering region that creates a density profile mimicking a nozzle. The dense region acts like the narrow part, and transonic flow emerges naturally.

The advantage of using a potential-based nozzle is that you can tune it smoothly. You can make the transition sharp or gentle, create strong or weak horizons, all by adjusting the trap shape or the scattering region.

### Platform-Specific Details

Your code likely needs to handle two very different experimental platforms:

**BEC platform:** Temperature ~ 100 nK, density ~ 10^15 atoms/cm³, healing length ξ ~ 100 nm, sound speed c_s ~ 1 mm/s. The atoms are strongly coupled to each other (weak-interaction limit gives c_s ∝ √n). The environment is very cold, so viscosity (arising from atom-atom collisions) is extremely low. The system is nearly a perfect fluid.

**Polariton platform:** Temperature ~ 10 K (10^10 times hotter), density ~ 10^11 polaritons/cm³, healing length ~ 1 μm (larger because coupling is weaker), sound speed ~ 100 μm/s or higher. Polaritons are photon-exciton hybrids created in semiconductor microcavities. They're much more loosely bound than atoms, so the coupling is weaker and the healing length is larger. Importantly, polaritons have finite lifetimes (picoseconds to nanoseconds, depending on the cavity design). They decay back into photons and excitons, creating an effective "dissipation" or "viscosity" in the hydrodynamic description. This makes the polariton platform intrinsically more dissipative.

For each platform, your code must:
1. Set the equation of state P(ρ) correctly (quadratic for weakly interacting BECs, different form for polaritons with possible power-law or polynomial corrections)
2. Compute c_s(x) from the density profile using dP/dρ
3. Solve for v(x) using mass conservation
4. Find the sonic point x_H where v(x_H) = c_s(x_H)
5. Compute κ = |d(v - c_s)/dx|_{x=x_H}

The κ value is what you then use in Papers 4-7 to compute the Hawking temperature, the dissipative corrections, and the observable signatures.

## The Molecular Picture of Viscosity

So far, we've treated fluids as ideal — frictionless. But real fluids have viscosity. Viscosity is friction — a fluid element moving through a slower fluid loses momentum. Where does this come from at the microscopic level?

Picture a thin layer of fast-moving fluid (say, velocity v₀ + Δv) sliding over a slower-moving layer beneath it (velocity v₀). The fast-moving molecules in the upper layer are hotter — they're moving faster on average. The slow-moving molecules in the lower layer are cooler — they're moving slower on average. What happens at the interface?

Fast molecules diffuse downward, crossing the boundary and colliding with slow molecules. These fast molecules transfer some of their excess momentum to the slow molecules, speeding them up. Simultaneously, slow molecules diffuse upward, crossing the boundary and colliding with fast molecules. These slow molecules slow down the fast molecules by momentum transfer.

The net effect: momentum is transferred from the fast layer to the slow layer. The fast layer loses momentum and decelerates. The slow layer gains momentum and accelerates. They both approach a common velocity.

This momentum transfer manifests as a **friction force** or **shear stress**. Consider two parallel layers separated by a distance dy in the y direction. The shear stress (force per unit area) acting between them is proportional to the velocity gradient:

$$τ_{xy} = η \frac{dv_x}{dy}$$

Here, η is the **shear viscosity**, a property of the fluid that depends on molecular properties: the molecular mass m, the typical molecular speed v_th ~ √(k_B T / m), and the collision cross-section σ. From kinetic theory:

$$η ≈ \frac{m v_th}{σ^2} ≈ \frac{\sqrt{m k_B T}}{σ^2}$$

A thick, honey-like fluid has large η because the molecules are large (large σ) or move slowly (low T). A thin, water-like fluid has smaller η. In air, η is tiny (air molecules are small) — we usually treat air as nearly inviscid.

The temperature dependence is counterintuitive: **for gases, viscosity increases with temperature**. Hotter molecules move faster and transfer momentum more effectively, leading to greater viscous friction. For liquids, viscosity decreases with temperature (honey is thinner when warm). The microscopic reason is different — for liquids, viscosity is dominated by the attractive forces between molecules, which weaken at higher temperatures, reducing the "stickiness."

Viscosity is a **transport coefficient**: it emerges from the microscopic dynamics and characterizes how momentum (and heat, and particles) diffuse through the fluid. In a dilute gas, you can compute η from first principles using the Boltzmann equation. In a dense liquid or BEC, you often need to measure η experimentally or compute it using more sophisticated methods.

### Viscosity in BECs and Polaritons

In a BEC, the "molecules" are atoms, and the effective cross-section comes from the s-wave scattering length a_s. The effective temperature is much lower than the chemical energy. The result is that BECs are nearly perfect fluids with very low viscosity — much lower than ordinary liquids or gases. This makes BECs ideal platforms for studying the hydrodynamic EFT, because dissipative corrections are small and controllable.

In polariton systems, the situation is different. Polaritons have finite lifetimes — they decay back into their constituent photons and excitons. This decay acts like an effective "collision" with the vacuum. From the hydrodynamic perspective, a decaying particle is like a particle that collides and equilibrates very quickly. The effective viscosity is higher. Moreover, the dissipation is fundamentally quantum-mechanical — it comes from energy decay, not molecular viscosity in the classical sense.

## The Navier-Stokes Equation and Dissipation

Add viscous forces to the Euler equation, and you get the **Navier-Stokes equation**:

$$ρ \frac{D\mathbf{v}}{Dt} = -\nabla P + η \nabla^2 \mathbf{v} + \left(ζ + \frac{η}{3}\right) \nabla (\nabla \cdot \mathbf{v})$$

The first new term, η∇²v, is **shear viscosity** — it acts to smooth out velocity gradients, like diffusion of momentum. High velocity gradients create high stresses, which accelerate the fluid back toward uniform motion.

The second term, (ζ + η/3)∇(∇·v), is **bulk viscosity** — it damps compression and expansion of the fluid. The notation is ζ + η/3 because it's standard to write this combination (it appears in the energy dissipation). When a fluid element is compressed (∇·v < 0), this term creates an outward pressure that resists the compression. When a fluid element expands (∇·v > 0), this term creates an inward pressure that resists the expansion.

Together, the viscous terms represent **dissipation**: kinetic energy is converted to heat. Energy that was in organized bulk motion gets randomized into thermal motion.

### The Viscous Stress Tensor

To understand viscosity more deeply, it's useful to think in terms of the full **viscous stress tensor** σ^μν. In a Newtonian fluid (a fluid where the stress is linear in the velocity gradients), the stress tensor can be written:

$$σ^{μν} = 2η \left( \partial^μ u^ν - \frac{1}{3} g^{μν} \partial_λ u^λ \right) + ζ g^{μν} \partial_λ u^λ$$

where u^ν is the four-velocity of the fluid (in relativistic notation), g^{μν} is the metric, and η and ζ are the shear and bulk viscosity coefficients.

This decomposition separates the viscous stress into two parts:
- A **deviatoric part** (the first term): acts to resist shear — differences in flow velocity between nearby layers
- A **spherical part** (the second term): acts to resist bulk compression/expansion

Why does this matter? Because in your SK-EFT, the transport coefficients γ₁ and γ₂ that appear in the dissipative action are related to these viscosities:

$$γ_1 ≈ η, \quad γ_2 ≈ ζ + \frac{η}{3}$$

These are phenomenological parameters in the EFT that control how much dissipation affects the Hawking spectrum.

### Connection to Entropy Production

In the SK-EFT, viscosity enters through the second law of thermodynamics. The first law (energy conservation) is a symmetry — you derive it from varying the action. But the second law (entropy must increase) is not a symmetry. Viscous dissipation increases entropy.

The entropy production rate (entropy increase per unit time) in a dissipative fluid is:

$$\dot{S} = \int d^3x \, \frac{1}{T} \left[ γ_1 \left( \frac{\partial v_i}{\partial x_j} - \frac{1}{3} \delta_{ij} \frac{\partial v_k}{\partial x_k} \right)^2 + γ_2 \left( \frac{\partial v_k}{\partial x_k} \right)^2 \right]$$

where T is the local temperature. This says that entropy increases proportionally to the square of velocity gradients, with coefficients γ₁ and γ₂. Strong shear (large spatial gradients of velocity) or strong compression/expansion creates entropy.

At the acoustic horizon, where the velocity gradients are large (the flow transitions sharply from subsonic to supersonic), entropy production is significant. The SK-EFT includes these dissipative corrections to capture this effect on the Hawking radiation spectrum.

## The Reynolds Number and the Laminar Regime

Not all flows are the same. Some are smooth and orderly (laminar), others are chaotic and turbulent. The transition between these regimes is characterized by the **Reynolds number**:

$$Re = \frac{ρ v L}{η}$$

Here, L is a characteristic length scale (the size of an obstacle, the width of a channel, the thickness of a boundary layer). The Reynolds number compares two competing effects:

- **Inertia:** ρ (∇v)² ~ ρ v²/L (the momentum transferred by the flow when it encounters an obstacle)
- **Viscosity:** η ∇²v ~ η v/L² (the momentum diffused by viscosity over the same distance)

Their ratio is Re ∝ (ρ v²/L) / (η v/L²) = ρ v L / η. This is a dimensionless measure of which effect wins.

**When Re ≪ 1 (low Reynolds number):** Viscosity dominates. A small sphere moving through honey hardly disturbs the fluid — the flow around it is smooth and laminar, beautifully described by the Stokes equation. The fluid "resists" the motion uniformly.

**When Re ≫ 1 (high Reynolds number):** Inertia dominates. The flow is fast enough and the fluid is thick enough (or viscosity is small enough) that momentum "inertia" overwhelms viscous dissipation. Small perturbations grow into larger and larger eddies. The flow becomes turbulent. The Navier-Stokes equation supports chaotic, time-dependent solutions. Predicting the flow requires either very precise initial conditions or accepting that it's fundamentally turbulent.

For your acoustic horizon experiments, you care deeply about this. The EFT description — smooth hydrodynamics with well-defined acoustic excitations — breaks down if the flow is turbulent. Turbulence would create noise, randomize the phonon modes, destroy the coherence you need to observe Hawking radiation. Fortunately, BEC experiments are designed to operate in the laminar regime.

For a BEC in a 1D channel with healing length ξ and effective sound speed c_s, the effective Reynolds number is roughly:

$$Re_{\text{eff}} ~ \frac{ρ v ξ}{η}$$

In the weak-interaction limit, η is small (the fluid is nearly perfect, approaching an ideal gas), so Re_eff can be large. But because the characteristic length scale is the healing length ξ (which is microscopic), the flow can remain laminar even with sizeable Re_eff. The EFT is valid as long as ξ is the smallest length scale, and perturbations at scales larger than ξ evolve hydrodynamically.

In the polariton platform, the situation is more delicate. Polaritons are much more loosely bound than atoms. Their effective viscosity is higher (due to finite lifetime, which acts like rapid collision with the vacuum), and their sound speed might be lower. The effective Reynolds number might be smaller, pushing toward the viscous regime. But the trade-off is that the healing length is much larger (weaker binding), and the frequencies are much higher (10^10 times higher than in BECs). The regime where the hydrodynamic EFT is valid is narrower, but it's still achievable if you tune carefully.

## The Surface Gravity and the Crossover Formula

Here's where all the pieces come together. At a sonic horizon in transonic flow, the surface gravity κ controls several key properties:

**Hawking temperature:** The spectrum of Hawking radiation is approximately thermal, with temperature:

$$T_H = \frac{ℏ κ}{2π k_B}$$

A sharper horizon (larger κ) produces a hotter Hawking spectrum, easier to detect. A gentler horizon (smaller κ) produces a colder, harder-to-detect spectrum.

**Dissipative damping rate:** Viscous and bulk dissipation near the horizon damp out Hawking modes. The damping rate (inverse lifetime of a mode) scales as:

$$Γ ~ \frac{γ κ}{c_s}$$

where γ = γ₁ or γ₂ is the relevant transport coefficient (depending on whether you're looking at shear or bulk modes). Stronger dissipation (larger γ) or sharper horizon (larger κ) increases damping.

**The crossover formula:** In your Paper 1, you derived that the crossover between different Hawking regimes (underdamped, critically damped, overdamped) occurs when the damping rate equals the temperature-set scale:

$$Γ ≈ T_H$$

Setting the damping rate equal to the temperature and solving for κ gives:

$$κ_{\text{cross}} ~ \frac{γ}{c_s ξ^2}$$

The exact coefficient depends on the geometry and the specific mode, but the scaling is universal. This is the key result of Paper 1.

**Physical interpretation:** When κ ≫ κ_cross, the horizon is sharp enough that the Hawking effect dominates — the underdamped regime. The Hawking spectrum is clean and nearly thermal, with minimal dissipative broadening.

When κ ≪ κ_cross, dissipation is so strong that quantum effects are washed out — the overdamped regime. The Hawking signal is broadened and suppressed. In the limit of very strong dissipation, the spectrum is not thermal anymore; it's dominated by the incoherent decay of modes.

The crossover happens when κ ~ κ_cross. This is the sweet spot: the Hawking effect is still significant, but dissipation is observable.

**Why this matters:** The crossover formula involves the transport coefficient γ (viscosity or bulk dissipation), the sound speed c_s (from the equation of state), and the healing length ξ (the UV cutoff of the EFT). This combination makes physical sense:
- **Large viscosity (large γ):** Requires a sharper horizon (larger κ) to overcome dissipation
- **Small sound speed (small c_s):** Horizons are less pronounced (slower information propagation), harder to observe
- **Large healing length (large ξ):** EFT coarse-grained to larger scales, microscopic structure persists longer, harder to achieve clean separation of scales

### Platform Comparison

**BEC experiments:** ℏ ~ 10^-34 J·s, k_B ~ 10^-23 J/K, typical κ ~ 0.01 to 1 s^-1. This gives:

$$T_H ~ \frac{10^{-34} × 1}{2π × 10^{-23}} ~ 10^{-12} \text{ K}$$

This is extraordinarily cold — nearly impossible to measure with ordinary thermometry. But the Hawking radiation still exists. You observe it indirectly through its effect on the phonon correlation functions and spectrum.

Fortunately, κ_cross for BECs is also very small (because viscosity γ is tiny in nearly-perfect fluids). So κ and κ_cross are comparable, and you're often in the crossover regime where both Hawking effects and dissipative corrections are observable. This is why your seven papers carefully balance the Hawking signal against dissipative corrections.

**Polariton experiments:** Temperature ~10 K (10^10 times hotter than BECs), so T_H could be ~10^-2 K or higher — measurable, but still cold. The advantage is detectability.

The disadvantage is in the crossover formula. Polaritons have higher effective viscosity γ (shorter lifetime), comparable or lower sound speed c_s (looser binding), and larger healing length ξ (weaker coupling). This all pushes κ_cross to larger values. The prediction is that κ_cross for polaritons might be 100 to 10^6 times larger than for BECs.

This means reaching the underdamped regime (κ ≫ κ_cross) is harder in polaritons. You're pushed further into the overdamped regime where dissipation suppresses the Hawking signal. But the advantage is that you can measure T_H more directly, and the dissipative effects are observable and interesting in their own right.

This is the central motivation for the SK-EFT. It tells you exactly how much suppression to expect due to dissipation, and how to account for it in extracting the fundamental Hawking signal.

## Connecting the Fluid and EFT Pictures

Here's the deepest insight we can extract from this lecture. The fluid description (Euler equation, Navier-Stokes, continuity equation, equation of state) and the EFT description (effective action L, Noether currents, transport coefficients) are not two competing theories. They're the same physics described at different levels of abstraction.

**From the EFT perspective:** Start with the effective action for hydrodynamics and dissipation:

$$S = \int d^4 x \, [L_0(ρ, ∂ρ, ∂v) + L_{\text{diss}}(∂v)]$$

The first part, L₀, includes the ideal (inviscid) Lagrangian density for hydrodynamics. It's a function of the density field ρ and its spacetime derivatives, and the velocity field v and its derivatives. A common form is:

$$L_0 = -ε(ρ, s) + \left( \frac{∂ε}{∂ρ} - μ \right) ρ$$

where ε is the energy density, s is the entropy density, and μ is the chemical potential.

The second part, L_diss, includes dissipative corrections. It depends on velocity gradients (which create shear and bulk viscous stress) but not on higher derivatives (to keep the action local and renormalizable to lowest order).

Now vary this action with respect to ρ:

$$\frac{δS}{δρ} = 0 \quad \Rightarrow \quad \frac{∂ρ}{∂t} + \nabla \cdot (ρ \mathbf{v}) = 0$$

This is the continuity equation — mass conservation. Vary with respect to v:

$$\frac{δS}{δ\mathbf{v}} = 0 \quad \Rightarrow \quad ρ \frac{D\mathbf{v}}{Dt} = -\nabla P + η \nabla^2 \mathbf{v} + \left(ζ + \frac{η}{3}\right) \nabla (\nabla \cdot \mathbf{v})$$

This is the Navier-Stokes equation. The connection is **Noether's theorem**: symmetries of the action become conservation laws for the equations of motion.

**From the hydrodynamic perspective:** Start with the Navier-Stokes equation as an empirical law, and you can reverse-engineer the action. The action is not unique — there are many effective actions that give the same equations of motion — but they all have the same long-wavelength, low-frequency limit. The action principle is a more efficient way to organize the physics and systematically include corrections.

**Why both languages matter:** The fluid description is more intuitive. You can visualize molecules, pressure forces, velocity gradients. The equations are easier to solve numerically for specific geometries.

The EFT description is more powerful. It systematically includes corrections (higher-derivative terms, operator mixing). It connects to field theory and quantum mechanics. It makes the separation of scales manifest. It tells you which approximations are valid and where they break down.

In the SK-EFT, you use both languages. Papers 1-3 work with the action and Noether currents (EFT language), proving theorems about what dissipative corrections must look like and how they affect the Hawking spectrum. Papers 4-7 work with flow profiles, sonic horizons, and spectral densities (fluid language), computing observable signatures in specific experimental geometries. The Lean theorems prove that both descriptions are consistent — they give the same physics.

## The Acoustic Metric and Tilted Sound Cones

Now here's the connection to the acoustic metric — the preview of Lecture 7. In an ordinary, uniform, static fluid, sound waves propagate isotropically. A wavefront expands spherically from a point source at speed c_s.

But in a *moving* fluid, something changes. Imagine sound emitted from a source in a flowing fluid. In the reference frame of the fluid (moving with velocity v), sound still expands spherically at speed c_s. But in the lab frame, the sound cones are tilted. Upstream-going sound is slowed down: it propagates at speed c_s - v relative to the ground. Downstream-going sound is sped up: it propagates at speed c_s + v relative to the ground.

This tilting of sound cones is captured mathematically by the **acoustic metric**. In the lab frame, the effective geometry experienced by sound waves is not Euclidean. Instead, it's described by an effective Riemannian metric:

$$g_{\mu\nu} dx^μ dx^ν = -c_s^2 \left( 1 - \frac{v^2}{c_s^2} \right) (dt)^2 + 2 \mathbf{v} \cdot d\mathbf{x} \, dt + (d\mathbf{x})^2$$

or in 1+1 dimensions:

$$g_{\mu\nu} dx^μ dx^ν = -c_s^2 \left( 1 - \frac{v^2}{c_s^2} \right) (dt)^2 + 2 v(t,x) dx \, dt + (dx)^2$$

This metric is not the spacetime metric of general relativity. It's an effective metric that describes how acoustic excitations (phonons) propagate through the moving fluid.

**The key insight:** The acoustic metric has the same structure as the spacetime metric in a black hole geometry. The component g_{00} ~ (1 - v²/c_s²) vanishes at the horizon, where v = c_s. This is the same structure as the Schwarzschild metric g_{00} ~ (1 - 2M/r), which vanishes at the event horizon r = 2M.

This similarity is not accidental. It's a deep consequence of the structure of wave equations in moving media. Hawking's insight was that this analogy isn't just mathematical — it's physical. The Hawking effect, discovered in the context of gravity, applies to any system where waves propagate on a metric background with a horizon.

In your transonic fluid, the acoustic metric has a horizon at x = x_H where v(x_H) = c_s(x_H). Just like in a black hole spacetime, nothing can escape from beyond the horizon. But unlike a black hole, the horizon is made of fluid — it's a dynamical object that can be created or destroyed by changing the flow.

In Lecture 7, we'll dive deep into this metric structure and show explicitly how Hawking radiation emerges from quantum fluctuations in the fluid field, interacting with the acoustic horizon.

## Sound, Shadows, and Hawking Radiation

Let me bring this full circle. In an ordinary fluid, sound waves are just density fluctuations. They propagate at speed c_s, get absorbed by viscosity, scatter off obstacles, and gradually dissipate. There's nothing exotic happening.

But in a *transonic* fluid, something quantum-like emerges. Imagine a sound wave (a phonon) traveling upstream from the sonic horizon. It approaches the horizon from the supersonic region. Can it cross over and escape to the subsonic region? Let's think about this carefully.

In the supersonic region downstream of the horizon, sound waves are swept along with the flow. A sound wave trying to travel upstream (against the flow direction, at speed c_s relative to the fluid) is carried downstream by the bulk flow (speed v). The net speed relative to the ground is v - c_s > 0 (since v > c_s in the supersonic region). So the sound wave can't make progress upstream. It's trapped.

Now add quantum mechanics. In a real BEC or polariton fluid, the quantum vacuum isn't truly empty — it's filled with zero-point fluctuations. These fluctuations have energy (the zero-point energy ℏω/2 per mode), and they can interact with the acoustic horizon. Just as Hawking showed for black holes, quantum vacuum fluctuations near an event horizon can be split: one part escapes as radiation, the other part falls in. The same happens at an acoustic horizon.

Here's the mechanism: a vacuum fluctuation near the horizon has two possible outcomes. In one scenario, the positive-energy part crosses the horizon and the negative-energy part escapes to infinity as Hawking radiation. In the other scenario, the negative-energy part crosses the horizon and the positive-energy part escapes. Due to quantum entanglement, the vacuum fluctuation is split stochastically between these two outcomes. The result is a thermal spectrum of outgoing radiation, with temperature T_H ∝ κ.

The difference from an event horizon in black hole spacetime is dissipation. In curved spacetime, the vacuum is fundamental and eternal. Hawking radiation is created at the horizon and escapes to infinity, carrying away energy from the black hole. In a fluid, there's molecular motion underneath — viscosity, entropy production. The dissipation is real and measurable.

In the underdamped regime (κ ≫ κ_cross), dissipation is weak enough that the Hawking signal survives and can be observed. In the overdamped regime (κ ≪ κ_cross), viscous damping washes out the Hawking effect before it can escape the horizon.

The surface gravity κ controls how sharply the horizon "cuts" through quantum fluctuations. A sharper horizon means vacuum fluctuations are more efficiently split into Hawking pairs, creating a hotter and more robust spectrum. A gentler horizon means the split is suppressed, and the Hawking effect is weak.

And the crossover formula κ_cross tells you when dissipation becomes dominant. This crossover separates the regime where Hawking radiation is the main effect (underdamped) from the regime where dissipation dominates (overdamped). Understanding this crossover is understanding when and where you can observe quantum radiation from a classical fluid — which is precisely what your seven papers are about.

## Retrieval Questions

1. **Continuity equation derivation:** Starting from the conservation of mass in a fixed volume, derive the continuity equation ∂_t ρ + ∇·(ρv) = 0 by considering mass flow through the surface of a fluid element. What Noether symmetry in the EFT action produces this equation?

2. **Sound speed from thermodynamics:** For an adiabatic process in an ideal gas, P ∝ ρ^γ. Show that the sound speed is c_s = √(γ P/ρ). For a weakly interacting Bose gas at zero temperature, P ∝ ρ². What is c_s as a function of density?

3. **Material derivative intuition:** Explain physically why the acceleration of a fluid element includes the term (v·∇)v in addition to ∂v/∂t. Give a concrete example of a flow where ∂v/∂t = 0 everywhere but fluid elements still accelerate.

4. **Transonic flow and surface gravity:** In your `transonic_background.py`, you compute a density profile ρ(x) and then find the sonic point where v(x_H) = c_s(x_H). Explain physically why the horizon location changes if you vary the inlet pressure. What happens to κ = |d(v - c_s)/dx|_{x=x_H} if you increase the flow speed while keeping the density profile fixed?

5. **Reynolds number and the EFT validity:** For a BEC with healing length ξ = 100 nm, density n = 10^15 cm^-3, effective viscosity η ~ ℏn, and typical flow speed v ~ 0.1 c_s, estimate the Reynolds number. Is the flow laminar? If so, is the hydrodynamic EFT valid?

6. **Viscosity temperature dependence:** Explain microscopically (in terms of molecular motion and collisions) why viscosity increases with temperature in gases but decreases in liquids. Then connect this to the SK-EFT: how does the temperature dependence of γ affect the crossover formula κ_cross?

7. **Polariton vs. BEC platforms:** Polaritons are 10^10 times hotter than typical BEC experiments, but they have much shorter lifetimes (higher dissipation). Using the crossover formula κ_cross ~ γ/(c_s ξ²), explain why the Hawking effect might be harder to observe in polaritons. What experimental or theoretical approaches might compensate?

8. **The acoustic metric from hydrodynamics:** In the EFT language, phonons propagate on an acoustic metric g_μν. In the fluid language, they propagate according to the wave equation ∂²δρ/∂t² = c_s² ∇² δρ. For a 1D flow with velocity v(x), show explicitly how the acoustic metric g_μν = diag(-c_s²(1 - v²/c_s²), ...) emerges from linearizing the continuity and Euler equations.

9. **Hawking temperature and horizon sharpness:** The Hawking temperature T_H = ℏκ/(2πk_B) depends on surface gravity κ. Explain physically why a sharper horizon (larger κ) produces a hotter spectrum. What is the quantum mechanical origin of this relationship?

10. **Viscous damping vs. Hawking signal:** In the underdamped regime, the Hawking signal dominates over dissipation. In the overdamped regime, dissipation dominates. What is the physical meaning of the crossover condition Γ ≈ T_H, where Γ is the damping rate and T_H is the Hawking temperature? Why does this condition determine κ_cross?

## Conclusion: The Fluid as the Foundation

We've come a long way from molecules bouncing around to acoustic horizons and Hawking radiation. But the journey is essential. Without understanding fluids deeply — not just as a collection of empirical rules, but as an EFT emergent from microscopics — you can't truly understand analog gravity.

The key conceptual move is this: we don't need to know about every atom. A few collective variables (ρ, v) are enough, provided the mean free path is small compared to the system size. This is the same move you make in the SK-EFT: you don't need to know the microscopic details. A few collective variables (the phonon modes, the acoustic metric) are enough, provided the healing length is small compared to the wavelengths you care about.

Fluids are already effective field theories. And once you see that, everything else follows. Conservation laws are Noether currents. Hydrodynamic equations are equations of motion from an action. Transport coefficients are low-energy constants that you measure or compute from microscopic physics. Sound waves are the IR excitations. And when you have a transonic flow, something profound happens: the sound waves see a horizon, just like light sees a black hole. The Hawking effect emerges, not from quantum gravity, but from the interplay of quantum mechanics and fluid dynamics.

The fluid is the main character we've been following all along. It's not background decoration for your SK-EFT. It *is* the SK-EFT. Understanding the fluid, understanding sound waves, understanding transonic flow and sonic horizons — this is understanding the foundation of your entire research program.

In Lecture 7, we'll step back and ask the big question: what have we learned by treating the fluid as an EFT? How does the EFT perspective let us see physics that the traditional hydrodynamic picture obscures? And what does it mean to have a theory that works across scales, from the quantum vacuum to the horizon to the thermodynamic limits? That's the power of effective field theory thinking.
