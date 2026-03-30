# SK-EFT Hawking Radiation: Conceptual Visualizations

## 1. The Paper 1 Journey: Sound to Dissipation

This flowchart traces the complete intellectual arc of Paper 1, from physical intuition about sound waves through to the quantitative framework with dissipation.

```mermaid
flowchart LR
    A["Start:<br/>Sound in<br/>Fluid"] --> B["Linearize<br/>Equations"]
    B --> C["Acoustic<br/>Metric<br/>g_μν"]
    C --> D["Sonic<br/>Horizon<br/>c=v"]
    D --> E["Hawking<br/>Radiation<br/>T_H"]
    E --> F["Problem:<br/>Need<br/>Dissipation"]
    F --> G["SK<br/>Doubling<br/>ϕ±"]
    G --> H["Three<br/>Axioms<br/>I,II,III"]
    H --> I["Reduces<br/>to 2<br/>Parameters"]
    I --> J["δ_diss<br/>Quantified"]

    style A fill:#e1f5ff,color:#111
    style B fill:#b3e5fc,color:#111
    style C fill:#81d4fa,color:#111
    style D fill:#4fc3f7,color:#111
    style E fill:#29b6f6,color:#111
    style F fill:#ff8a80,color:#111
    style G fill:#ffd54f,color:#111
    style H fill:#ffb74d,color:#111
    style I fill:#ff9800,color:#111
    style J fill:#ff6f00,color:#fff
```

**What to look for:** This is the "story arc" of the dissipation framework. Notice how Hawking radiation (the physical effect) immediately demands accounting for dissipation (the framework problem), which SK formalism solves through field doubling and axiomatic constraints.

---

## 2. SK Contour Structure and Field Decomposition

The Keldysh contour encodes forward and backward time evolution. This diagram shows how the contour's structure maps to physical fields and dissipation content.

```mermaid
graph TB
    subgraph CONTOUR ["SK Contour Structure"]
        FWD["Forward Branch<br/>(0 → t)"]
        BWD["Backward Branch<br/>(t → 0)"]
        FWD --> BWD
    end

    subgraph FIELDS ["Field Decomposition"]
        PHI_CL["ϕ_cl = (ϕ+ + ϕ-)/2<br/>Classical Field"]
        PHI_Q["ϕ_q = ϕ+ - ϕ-<br/>Quantum Fluctuation"]
    end

    subgraph PHYSICS ["Physical Content"]
        RESP["Response Function<br/>χ(ω) from ϕ_cl - ϕ_q coupling"]
        DISS["Dissipation & Noise<br/>Im[χ] encodes both"]
    end

    CONTOUR --> FIELDS
    PHI_CL --> PHYSICS
    PHI_Q --> PHYSICS
    RESP --> DISS

    style CONTOUR fill:#fff3e0,color:#111
    style FWD fill:#ffe0b2,color:#111
    style BWD fill:#ffcc80,color:#111
    style FIELDS fill:#e0f2f1,color:#111
    style PHI_CL fill:#b2dfdb,color:#111
    style PHI_Q fill:#80cbc4,color:#111
    style PHYSICS fill:#f3e5f5,color:#111
    style RESP fill:#e1bee7,color:#111
    style DISS fill:#ce93d8,color:#111
```

**What to look for:** The contour is purely a bookkeeping device—it tracks when each field appears. The r/a decomposition (retarded/advanced) is its physical interpretation: retarded fields measure response, advanced fields are the adjoint. Dissipation enters through the non-zero commutator on the contour.

---

## 3. Three Axioms Constraining 9 Parameters to 2

This funnel diagram shows how successive physical constraints reduce degrees of freedom in the dissipative correction tensor.

```mermaid
graph TD
    START["9 Complex Coefficients<br/>(General tensor structure)"]

    AX1["Axiom I: Normalization<br/>∫dω = Correct Limit<br/>Removes 4 parameters"]
    AFTER1["5 Independent<br/>Parameters"]

    AX2["Axiom II: Positivity<br/>Dissipation Rate > 0<br/>Constrains Signs"]
    AFTER2["3-4 Effective<br/>Parameters"]

    AX3["Axiom III: KMS Relation<br/>Fluctuation-Dissipation<br/>Links Pairs"]
    AFTER3["2 Free Parameters<br/>γ₁, γ₂"]

    START --> AX1
    AX1 --> AFTER1
    AFTER1 --> AX2
    AX2 --> AFTER2
    AFTER2 --> AX3
    AX3 --> AFTER3

    style START fill:#ffcdd2,color:#111
    style AX1 fill:#ffb74d,color:#111
    style AFTER1 fill:#fff9c4,color:#111
    style AX2 fill:#ffb74d,color:#111
    style AFTER2 fill:#fff9c4,color:#111
    style AX3 fill:#ffb74d,color:#111
    style AFTER3 fill:#c8e6c9,color:#111
```

**What to look for:** Each axiom is a physical principle (conservation, stability, thermal balance). Together they form a hierarchy: axioms progressively eliminate unmeasurable or unphysical regimes. The final 2-parameter space represents the actual measurable dissipation landscape.

---

## 4. Transport Coefficient Counting: The Parity Alternation Pattern

This table shows how the transport coefficient count grows with particle number, revealing an alternating pattern tied to quantum statistics.

```mermaid
graph LR
    subgraph COUNT["Transport Counting by N"]
        N1["N=1<br/>1 coeff"]
        N2["N=2<br/>3 coeffs"]
        N3["N=3<br/>2 coeffs"]
        N4["N=4<br/>4 coeffs"]
        N5["N=5<br/>1 coeff"]
    end

    subgraph PATTERN["Parity Pattern"]
        ODD["Odd N:<br/>Fermionic<br/>Statistics"]
        EVEN["Even N:<br/>Bosonic<br/>Statistics"]
    end

    N1 --> ODD
    N3 --> ODD
    N5 --> ODD
    N2 --> EVEN
    N4 --> EVEN

    style N1 fill:#c5e1a5,color:#111
    style N2 fill:#b3e5fc,color:#111
    style N3 fill:#c5e1a5,color:#111
    style N4 fill:#b3e5fc,color:#111
    style N5 fill:#c5e1a5,color:#111
    style ODD fill:#f8bbd0,color:#111
    style EVEN fill:#b2dfdb,color:#111
```

**What to look for:** The parity alternation is not arbitrary—it reflects quantum statistics of particle-hole pairs in the superfluid. Odd-N processes involve fermionic intermediate states, even-N involve bosonic states. This signature appears throughout the spectral decomposition.

---

## 5. Acoustic Black Hole vs Schwarzschild Black Hole: Physics Comparison

Side-by-side comparison of how dissipation and quantum effects distinguish the analog system from GR black holes.

```mermaid
graph TB
    subgraph ACS ["Acoustic Black Hole<br/>(Superfluid)"]
        A_TEMP["Temperature:<br/>T ~ c_sound × Mach-drop"]
        A_HORIZ["Horizon:<br/>Vortex/Flow transition<br/>(Topological)"]
        A_BACK["Backreaction:<br/>Viscosity HEATS fluid<br/>(Dissipation dominant)"]
        A_BREAK["Breaks at:<br/>trans-sonic breakdown<br/>(Finite-lifetime effect)"]
    end

    subgraph SCHO ["Schwarzschild Black Hole<br/>(GR)"]
        S_TEMP["Temperature:<br/>T = κ/(2π)<br/>(Surface gravity)"]
        S_HORIZ["Horizon:<br/>Null surface<br/>(Causal, geometric)"]
        S_BACK["Backreaction:<br/>Hawking evaporation<br/>COOLS spacetime"]
        S_STABLE["Persists:<br/>On timescale<br/>M³ (astrophysical)"]
    end

    subgraph COMPARE ["Key Difference"]
        DISSIP["Dissipation sign:<br/>Acoustic: +Γ (heating)<br/>Schwarzschild: -Γ (cooling)"]
        STRUCTURE["Structure origin:<br/>Acoustic: Flow topology<br/>Schwarzschild: Spacetime curvature"]
    end

    A_TEMP --> COMPARE
    A_BACK --> COMPARE
    S_BACK --> COMPARE
    DISSIP --> STRUCTURE

    style ACS fill:#ffe0b2,color:#111
    style A_TEMP fill:#ffcc80,color:#111
    style A_HORIZ fill:#ffcc80,color:#111
    style A_BACK fill:#ff8a80,color:#111
    style A_BREAK fill:#ff8a80,color:#111
    style SCHO fill:#b3e5fc,color:#111
    style S_TEMP fill:#81d4fa,color:#111
    style S_HORIZ fill:#81d4fa,color:#111
    style S_BACK fill:#4fc3f7,color:#111
    style S_STABLE fill:#4fc3f7,color:#111
    style COMPARE fill:#f3e5f5,color:#111
    style DISSIP fill:#ce93d8,color:#111
    style STRUCTURE fill:#ce93d8,color:#111
```

**What to look for:** The sign of backreaction is the pivotal difference. In superfluids, dissipation heats—this is *opposite* to Hawking cooling. This reversal reveals whether the analog system maps to the Euclidean or Lorentzian sector of the gravitational partition function.

---

## 6. WKB Complex Turning Points and Stokes Connections

This diagram illustrates how complex analysis modifies the WKB approximation near sonic horizons, enabling resummation of Bogoliubov coefficients.

```mermaid
graph LR
    subgraph REAL_AXIS ["Real Axis (Momentum Space)"]
        TURNING["Real Turning<br/>Point x₀<br/>(k² = 0)"]
    end

    subgraph COMPLEX_PLANE ["Complex Plane"]
        PATH["Analytic continuation<br/>x → x + iδ"]
        COMPLEX_TP["Complex Turning<br/>Points<br/>(Stokes wedges)"]
        STOKES["Stokes Lines<br/>Connection<br/>Contours"]
    end

    subgraph SOLUTION ["WKB Solution Structure"]
        EXP1["Exponentially growing<br/>ψ ~ exp(+iS/ℏ)"]
        EXP2["Exponentially decaying<br/>ψ ~ exp(-iS/ℏ)"]
        CONNECT["Connection formula<br/>at Stokes line"]
    end

    TURNING --> PATH
    PATH --> COMPLEX_TP
    COMPLEX_TP --> STOKES
    STOKES --> SOLUTION
    EXP1 --> CONNECT
    EXP2 --> CONNECT

    style REAL_AXIS fill:#f5f5f5,color:#111
    style TURNING fill:#ffccbc,color:#111
    style COMPLEX_PLANE fill:#e1f5fe,color:#111
    style PATH fill:#b3e5fc,color:#111
    style COMPLEX_TP fill:#4fc3f7,color:#111
    style STOKES fill:#0277bd,color:#fff
    style SOLUTION fill:#fff3e0,color:#111
    style EXP1 fill:#ffb74d,color:#111
    style EXP2 fill:#ff9800,color:#111
    style CONNECT fill:#e65100,color:#fff
```

**What to look for:** The WKB method works locally (near real turning points) but breaks down across the full domain. Complex continuation reveals *where* the connection must be made (Stokes lines) and *how* (matching coefficients). This is essential for computing Bogoliubov mixing at the horizon.

---

## 7. Gauge Erasure Architecture: Symmetries Through Hydrodynamization

This flowchart shows how non-Abelian gauge symmetries are progressively eliminated as fluids thermalize, leaving only U(1) EM.

```mermaid
flowchart TD
    INPUT["Input: SU(3)×SU(2)×U(1)<br/>Full SM Gauge"]

    HYDRO["Hydrodynamization<br/>Process"]

    ERASE1["SU(3) Erasure<br/>(Color Confinement)<br/>→ Hadronization"]
    SURVIVES1["Mesons/Baryons<br/>(Composite singlets)"]

    ERASE2["SU(2) Erasure<br/>(Electroweak Symmetry<br/>Breaking)"]
    SURVIVES2["W/Z ± masses<br/>Fermion masses"]

    ERASE3["U(1) SURVIVES<br/>(Unbroken)"]
    OUTPUT["Output: U(1)_EM<br/>+ Gravity"]

    INPUT --> HYDRO
    HYDRO --> ERASE1
    ERASE1 --> SURVIVES1
    SURVIVES1 --> ERASE2
    ERASE2 --> SURVIVES2
    SURVIVES2 --> ERASE3
    ERASE3 --> OUTPUT

    style INPUT fill:#ffcdd2,color:#111
    style HYDRO fill:#fff9c4,color:#111
    style ERASE1 fill:#ffb74d,color:#111
    style SURVIVES1 fill:#c8e6c9,color:#111
    style ERASE2 fill:#ffb74d,color:#111
    style SURVIVES2 fill:#c8e6c9,color:#111
    style ERASE3 fill:#b3e5fc,color:#111
    style OUTPUT fill:#a5d6a7,color:#111
```

**What to look for:** Gauge erasure is a *topology* phenomenon, not a gauge choice. Non-Abelian charges become invisible to long-range probes after thermalization because of deconfinement and screening. U(1) survives because magnetic monopoles are absent in the SM. This determines what information reaches the hybrid architecture.

---

## 8. ADW Mode Counting: GL(4,ℝ) to Graviton Spectrum

This tree diagram shows how diffeomorphism symmetries in the ADW mechanism decompose the 16 generators of GL(4,ℝ), producing the massless graviton and massive spin-connection modes.

```mermaid
graph TD
    GL["GL(4,ℝ)<br/>16 generators"]

    DECOMP["Decomposition under<br/>SO(3,1) breaking"]

    SPINC["6 Spin-Connection<br/>Modes<br/>(w^ab)"]
    EATEN["4 Eaten Modes<br/>(by Higgs mechanism)"]
    GRAV["2 Massless<br/>Graviton Degrees<br/>(h_ij)"]
    DIRAC["4 Dirac<br/>Fermion Modes<br/>(ψ)"]

    GL --> DECOMP
    DECOMP --> SPINC
    DECOMP --> EATEN
    DECOMP --> GRAV
    DECOMP --> DIRAC

    style GL fill:#ffcdd2,color:#111
    style DECOMP fill:#fff9c4,color:#111
    style SPINC fill:#ffb74d,color:#111
    style EATEN fill:#ff9800,color:#111
    style GRAV fill:#c8e6c9,color:#111
    style DIRAC fill:#b3e5fc,color:#111
```

**What to look for:** The ADW mechanism provides the *symmetry origin* of GR. The massless 2-degree graviton emerges from the 16-dimensional coset space GL/SO(3,1). The Dirac fermions come as minimal companions. This counting is exact—no anomalies or accidental masslessness, just representation theory.

---

## 9. Three Walls Status: Current Barriers to Closure

This status board summarizes the three conceptual barriers to complete synthesis and the current understanding of each.

```mermaid
graph TB
    subgraph WALL1 ["Gauge Wall"]
        G_DESC["Can non-Abelian color/flavor<br/>emerge from superfluid order?"]
        G_STATUS["❌ IMPOSSIBLE<br/>(Topological obstruction)"]
        G_REASON["No string-net phase in<br/>3D isotropic superfluid"]
    end

    subgraph WALL2 ["Gravity Wall"]
        GR_DESC["Can GR emerge from<br/>hydrodynamics + order?"]
        GR_L1["Level 1: ✓ Metric & horizon<br/>(solved: acoustic metric)"]
        GR_L2["Level 2: ⚠ Spin-connection<br/>(partial: ADW mechanism)"]
        GR_L3["Level 3: ❓ Quantum backreaction<br/>(open: semiclassical limit)"]
    end

    subgraph WALL3 ["Chirality Wall"]
        C_DESC["Can chiral symmetries<br/>emerge from scalar order?"]
        C_STATUS_OLD["❌ BROKEN (Pre-2024)"]
        C_STATUS_NEW["⚡ CRACKING (2024+)"]
        C_EVIDENCE["Via Three-Potential Flow (TPF)<br/>Goldstone-Speedup (GS)<br/>Synthetic Magnetic Gradient (SMG)"]
    end

    G_DESC --> G_STATUS
    G_STATUS --> G_REASON

    GR_DESC --> GR_L1
    GR_L1 --> GR_L2
    GR_L2 --> GR_L3

    C_DESC --> C_STATUS_OLD
    C_STATUS_OLD --> C_STATUS_NEW
    C_STATUS_NEW --> C_EVIDENCE

    style WALL1 fill:#ffcdd2,color:#111
    style G_STATUS fill:#ef5350,color:#111
    style G_REASON fill:#c62828,color:#fff
    style WALL2 fill:#fff9c4,color:#111
    style GR_L1 fill:#c8e6c9,color:#111
    style GR_L2 fill:#ffb74d,color:#111
    style GR_L3 fill:#ffcdd2,color:#111
    style WALL3 fill:#e0f2f1,color:#111
    style C_STATUS_OLD fill:#90a4ae,color:#111
    style C_STATUS_NEW fill:#29b6f6,color:#111
    style C_EVIDENCE fill:#81d4fa,color:#111
```

**What to look for:** The gauge wall is fundamentally impassable—no exotic order can generate non-Abelian gauge fields in 3D superfluids. The gravity wall has visible progress: metrics work, spin-connections partially work, quantum effects remain open. The chirality wall is the most exciting: recent mechanisms (TPF, GS, SMG) show it can crack, enabling fermionic order from bosonic superfluids.

---

## 10. Master Classification Table: Unifying All Emergent Structures

This rich classification table maps tensor rank, topological order, and quantum statistics to specific physical systems and phenomena.

```mermaid
graph LR
    subgraph RANK ["Tensor Rank"]
        R0["Rank 0: Scalar<br/>(BEC, ³He-A order)"]
        R1["Rank 1: Vector<br/>(spin textures)"]
        R2["Rank 2: Tensor<br/>(metric, strain)"]
    end

    subgraph TOPOLOGY ["Topology & Gauge"]
        T_TRIVIAL["Trivial:<br/>U(1) phase<br/>(BEC)"]
        T_STRING["String-net:<br/>non-Abelian<br/>(Exotic)"]
        T_TOPO["Topological charge:<br/>Vortex/Monopole<br/>(³He-A)"]
    end

    subgraph STATISTICS ["Quantum Statistics"]
        S_BOSON["Bosonic modes<br/>Phonon-like"]
        S_FERMION["Fermionic modes<br/>Particle-hole"]
        S_ANYONIC["Anyonic modes<br/>Fractional statistics"]
    end

    subgraph SYSTEMS ["Physical Realizations"]
        SYS_BEC["Rb-87 BEC:<br/>Rank 0 + U(1)<br/>+ Bosonic"]
        SYS_HE3["³He-A:<br/>Rank 0 + Topological<br/>+ Fermionic"]
        SYS_ADW["ADW Mechanism:<br/>Rank 2 (metric)<br/>+ GR emergent"]
        SYS_SN["String-net phase:<br/>Rank 0 + non-Ab<br/>+ Anyonic"]
    end

    R0 --> T_TRIVIAL
    R2 --> TOPOLOGY
    TOPOLOGY --> S_BOSON
    TOPOLOGY --> S_FERMION
    S_BOSON --> SYS_BEC
    S_FERMION --> SYS_HE3
    R2 --> SYS_ADW
    T_STRING --> SYS_SN

    style RANK fill:#f3e5f5,color:#111
    style R0 fill:#e1bee7,color:#111
    style R2 fill:#ce93d8,color:#111
    style TOPOLOGY fill:#fff3e0,color:#111
    style T_TRIVIAL fill:#ffe0b2,color:#111
    style T_STRING fill:#ffcc80,color:#111
    style STATISTICS fill:#e0f2f1,color:#111
    style S_BOSON fill:#b2dfdb,color:#111
    style S_FERMION fill:#80cbc4,color:#111
    style SYSTEMS fill:#f5f5f5,color:#111
    style SYS_BEC fill:#c5e1a5,color:#111
    style SYS_HE3 fill:#b3e5fc,color:#111
    style SYS_ADW fill:#ffb74d,color:#111
    style SYS_SN fill:#a5d6a7,color:#111
```

**What to look for:** This table is the "periodic table" of quantum superfluids. Each cell intersection determines what emergent structures are possible. BEC sits in the simplest corner (scalar + U(1) + bosonic). ³He-A is richer (topological order + fermions). The ADW mechanism occupies the unique position of emergent gravity (rank-2 tensor from scalar order). String-nets would require rank-0 anyonic statistics—topologically protected but physically elusive.

---

## 11. Hybrid Architecture Three-Layer: Blocked and Open Channels

This layered diagram shows how the three-potential architecture filters quantum numbers between layers, blocking non-Abelian charges and permitting only U(1) and gravity.

```mermaid
graph TD
    subgraph LAYER1 ["Layer 1: Quantum Order<br/>(Superfluid, BEC, ³He-A)"]
        L1_COLOR["Color Charge SU(3)<br/>❌ Confined"]
        L1_FLAVOR["Flavor SU(2)<br/>❌ Screened"]
        L1_EM["Electromagnetism U(1)<br/>✓ Open"]
        L1_GRAVITY["Gravity (ADW)<br/>✓ Emergent"]
    end

    FILTER1["Hydrodynamization<br/>+ Deconfinement<br/>Filter"]

    subgraph LAYER2 ["Layer 2: Fluid Dynamics<br/>(Hydrodynamic modes)"]
        L2_COLOR["Color: Absorbed<br/>→ Glueballs"]
        L2_FLAVOR["Flavor: Absorbed<br/>→ Mixing lengths"]
        L2_EM["EM: Propagates freely<br/>(plasma response)"]
        L2_GRAVITY["Gravity: Propagates<br/>(via metric)"]
    end

    FILTER2["Decoupling Limit<br/>ω → 0 Scaling<br/>Filter"]

    subgraph LAYER3 ["Layer 3: SM + GR<br/>(Low-energy effective)"]
        L3_PHOTON["Photon γ<br/>U(1) gauge boson"]
        L3_GRAVITON["Graviton g_μν<br/>Spin-2 tensor"]
    end

    L1_COLOR --> FILTER1
    L1_FLAVOR --> FILTER1
    L1_EM --> FILTER1
    L1_GRAVITY --> FILTER1

    FILTER1 --> L2_COLOR
    FILTER1 --> L2_FLAVOR
    FILTER1 --> L2_EM
    FILTER1 --> L2_GRAVITY

    L2_EM --> FILTER2
    L2_GRAVITY --> FILTER2

    FILTER2 --> L3_PHOTON
    FILTER2 --> L3_GRAVITON

    style LAYER1 fill:#ffebee,color:#111
    style L1_COLOR fill:#ef5350,color:#111
    style L1_FLAVOR fill:#ef5350,color:#111
    style L1_EM fill:#66bb6a,color:#111
    style L1_GRAVITY fill:#66bb6a,color:#111
    style FILTER1 fill:#fff9c4,color:#111
    style LAYER2 fill:#f5f5f5,color:#111
    style L2_COLOR fill:#bdbdbd,color:#111
    style L2_FLAVOR fill:#bdbdbd,color:#111
    style L2_EM fill:#81c784,color:#111
    style L2_GRAVITY fill:#81c784,color:#111
    style FILTER2 fill:#c5cae9,color:#111
    style LAYER3 fill:#e8f5e9,color:#111
    style L3_PHOTON fill:#4caf50,color:#111
    style L3_GRAVITON fill:#4caf50,color:#111
```

**What to look for:** This is the *information flow* through the three-potential system. Quantum order contains all charges, but only U(1) and gravity are long-range. Hydrodynamization destroys non-Abelian information (confinement/screening). The final layer sees only photons and gravitons. This filtering is irreversible—no memory of color or flavor survives to the macroscopic scale.

---

## 12. Global Program Map: Papers and Knowledge Graph Integration

This overview diagram connects all 6 research papers to the underlying knowledge graph clusters, showing completion status and dependencies.

```mermaid
graph TB
    subgraph STUDIES ["Pre-Work"]
        FS["Feasibility Study<br/>SK-EFT Hawking"]
        CR["Critical Review<br/>Emergent Structures"]
    end

    subgraph PAPERS ["Main Research Papers"]
        P1["Paper 1:<br/>SK Dissipation<br/>Framework"]
        P2["Paper 2:<br/>Transport &<br/>Spectral"]
        P3["Paper 3:<br/>WKB Bogoliubov<br/>Resummation"]
        P4["Paper 4:<br/>Gauge Erasure<br/>Architecture"]
        P5["Paper 5:<br/>ADW Gravity<br/>Mechanism"]
        P6["Paper 6:<br/>Hybrid Three-Layer<br/>Synthesis"]
    end

    subgraph KNOWLEDGE ["Knowledge Graph Clusters"]
        KG1["Foundations<br/>(Mech, QM, Stat, Fluid)"]
        KG2["EFT Core<br/>(Philosophy, SoN, SSB)"]
        KG3["Analog Gravity<br/>(Metric, HR, Transonic)"]
        KG4["SK Formalism<br/>(Contour, KMS, Axioms)"]
        KG5["Phase Results<br/>(Diss, Transport, Spectral)"]
        KG6["Advanced<br/>(Gauge, Gravity, Topo, Synthesis)"]
    end

    subgraph STATUS ["Status"]
        COMPLETE["✓ Complete"]
        CONDITIONAL["⚠ Conditional"]
        OPEN["❓ Open"]
    end

    FS --> P1
    CR --> P1
    P1 --> P2
    P1 --> P3
    P2 --> P4
    P3 --> P5
    P4 --> P6
    P5 --> P6

    P1 --> KG3
    P1 --> KG4
    P2 --> KG5
    P3 --> KG5
    P4 --> KG6
    P5 --> KG6
    P6 --> KG6

    KG1 --> KG2
    KG2 --> KG3
    KG3 --> KG4
    KG4 --> KG5

    P1 --> COMPLETE
    P2 --> COMPLETE
    P3 --> CONDITIONAL
    P4 --> CONDITIONAL
    P5 --> OPEN
    P6 --> OPEN

    style STUDIES fill:#fff9c4,color:#111
    style FS fill:#ffeb3b,color:#111
    style CR fill:#ffeb3b,color:#111
    style PAPERS fill:#f3e5f5,color:#111
    style P1 fill:#e1bee7,color:#111
    style P2 fill:#ce93d8,color:#111
    style P3 fill:#ba68c8,color:#111
    style P4 fill:#ab47bc,color:#111
    style P5 fill:#9c27b0,color:#111
    style P6 fill:#7b1fa2,color:#fff
    style KNOWLEDGE fill:#e1f5fe,color:#111
    style KG1 fill:#b3e5fc,color:#111
    style KG2 fill:#81d4fa,color:#111
    style KG3 fill:#4fc3f7,color:#111
    style KG4 fill:#29b6f6,color:#111
    style KG5 fill:#0288d1,color:#fff
    style KG6 fill:#01579b,color:#fff
    style STATUS fill:#f5f5f5,color:#111
    style COMPLETE fill:#c8e6c9,color:#111
    style CONDITIONAL fill:#fff9c4,color:#111
    style OPEN fill:#ffccbc,color:#111
```

**What to look for:** The program flows left-to-right: studies → papers → knowledge synthesis. Papers 1-2 are complete (solid foundations). Papers 3-4 are conditional (depend on previous results). Papers 5-6 are open research (require novel techniques). The knowledge graph clusters align with paper content: Papers 1-2 cover SK formalism and phase results; Papers 3-5 develop advanced gauge/gravity; Paper 6 unifies all three layers.

---

## 13. BEC Experimental Landscape: Three Platforms and Measurement Capabilities

This diagram shows the three leading experimental testbeds for acoustic Hawking radiation and what each can measure.

```mermaid
graph TD
    subgraph STEINHAUER ["Steinhauer (Rb-87 BEC)<br/>Technion, Israel"]
        S_SETUP["Toroidal trap<br/>Quantum vortex"]
        S_MEASURE["✓ Hawking pairs<br/>✓ Sonic horizon<br/>✓ Temperature"]
        S_STATUS["🟢 Operational<br/>First evidence (2016)"]
    end

    subgraph HEIDELBERG ["Heidelberg (K-39 BEC)<br/>Ruprecht Karls University"]
        H_SETUP["1D lattice geometry<br/>Controlled sound velocity"]
        H_MEASURE["✓ Dispersion relation<br/>✓ Mode structure<br/>✓ Dissipation (partial)"]
        H_STATUS["🟡 Active development<br/>New techniques emerging"]
    end

    subgraph TRENTO ["Trento (Spin-sonic)<br/>University of Trento"]
        T_SETUP["Spin-1 condensate<br/>Coupled excitations"]
        T_MEASURE["✓ Spin correlations<br/>✓ Multi-mode dynamics<br/>✓ Gauge effects (goal)"]
        T_STATUS["🔵 Experimental setup<br/>Novel platform"]
    end

    subgraph NEXT ["Next-Generation Targets"]
        NEXT_DISS["Measure dissipation δ_diss<br/>directly (challenges:<br/>sub-Hz linewidth)"]
        NEXT_BOGOLIUBOV["Bogoliubov spectrum<br/>via spectroscopy<br/>(requires precision)"]
        NEXT_GAUGE["Gauge emergencies<br/>in hybrid systems<br/>(exotic order needed)"]
    end

    S_SETUP --> S_MEASURE
    S_MEASURE --> S_STATUS

    H_SETUP --> H_MEASURE
    H_MEASURE --> H_STATUS

    T_SETUP --> T_MEASURE
    T_MEASURE --> T_STATUS

    S_STATUS --> NEXT
    H_STATUS --> NEXT
    T_STATUS --> NEXT

    style STEINHAUER fill:#c8e6c9,color:#111
    style S_SETUP fill:#a5d6a7,color:#111
    style S_MEASURE fill:#81c784,color:#111
    style S_STATUS fill:#66bb6a,color:#111
    style HEIDELBERG fill:#b3e5fc,color:#111
    style H_SETUP fill:#81d4fa,color:#111
    style H_MEASURE fill:#4fc3f7,color:#111
    style H_STATUS fill:#29b6f6,color:#111
    style TRENTO fill:#ffccbc,color:#111
    style T_SETUP fill:#ffb74d,color:#111
    style T_MEASURE fill:#ff9800,color:#111
    style T_STATUS fill:#e65100,color:#fff
    style NEXT fill:#f3e5f5,color:#111
    style NEXT_DISS fill:#e1bee7,color:#111
    style NEXT_BOGOLIUBOV fill:#ce93d8,color:#111
    style NEXT_GAUGE fill:#ba68c8,color:#111
```

**What to look for:** Each platform excels at different measurements. Steinhauer's toroidal geometry directly maps to the Hawking effect. Heidelberg's lattice gives precise control over dispersion—essential for testing WKB resummation. Trento's spin-sonic system opens possibilities for gauge-emergent physics. The next-generation targets (dissipation, Bogoliubov spectrum, gauge effects) require combinations of techniques.

---

## 14. Spectral Distortion Physics: Frequency-Dependent Corrections

This diagram illustrates the origin, structure, and observability of frequency-dependent corrections to the Hawking spectrum in superfluids.

```mermaid
graph TD
    subgraph ORIGIN ["Origin of Correction"]
        CORRECTION["δ^(2)(ω) ∝ ω³<br/>Three-body dissipation"]
        SOURCE["Source:<br/>Bogoliubov pair<br/>coupling to thermal<br/>background"]
    end

    subgraph ONSHELL ["On-Shell Physics<br/>(Asymptotic modes)"]
        ASYMP["Asymptotic amplitude:<br/>Hawking rate"]
        VANISH["Correction VANISHES<br/>on-shell<br/>(by construction)"]
    end

    subgraph OFFSHELL ["Off-Shell Physics<br/>(Near horizon)"]
        NEARHORIZ["Near-horizon region:<br/>Bogoliubov modes<br/>have spectral width"]
        OFFSHELLCORR["Correction ACTIVE<br/>off-shell<br/>∝ Im[Bogoliubov]"]
    end

    subgraph OBSERVABLE ["Observable Signatures"]
        LINEWIDTH["Broadened linewidth:<br/>Δω ~ γ₁ω²"]
        NOISEFLOOR["Noise floor elevation:<br/>Above vacuum"]
        RATIO["Correction-to-signal ratio:<br/>Δ/Γ ~ ω³/ω⁴<br/>= 1/ω scaling"]
    end

    CORRECTION --> SOURCE
    SOURCE --> ASYMP
    ASYMP --> VANISH
    SOURCE --> NEARHORIZ
    NEARHORIZ --> OFFSHELLCORR
    VANISH --> ONSHELL
    OFFSHELLCORR --> OFFSHELL

    LINEWIDTH --> OBSERVABLE
    NOISEFLOOR --> OBSERVABLE
    RATIO --> OBSERVABLE

    style ORIGIN fill:#fff3e0,color:#111
    style CORRECTION fill:#ffb74d,color:#111
    style SOURCE fill:#ff9800,color:#111
    style ONSHELL fill:#e0f2f1,color:#111
    style ASYMP fill:#80cbc4,color:#111
    style VANISH fill:#4db6ac,color:#111
    style OFFSHELL fill:#fce4ec,color:#111
    style NEARHORIZ fill:#f48fb1,color:#111
    style OFFSHELLCORR fill:#ec407a,color:#111
    style OBSERVABLE fill:#f3e5f5,color:#111
    style LINEWIDTH fill:#ce93d8,color:#111
    style NOISEFLOOR fill:#ba68c8,color:#111
    style RATIO fill:#ab47bc,color:#111
```

**What to look for:** The frequency-dependent correction is *entirely off-shell*—it appears only in transient dynamics near the horizon, not in final asymptotic states. This is why it vanishes in the far-field Hawking temperature but dominates near the sonic horizon. The ω³ scaling is unique to three-body processes. The 1/ω ratio shows that dissipation becomes relatively more important at low frequencies, making low-temperature experiments crucial for observing corrections.

---

## 15. Phase 5 Complete: 429 Theorems Across 7 Papers

This diagram maps the complete program after Phase 5 — κ-scaling, categorical infrastructure, chirality formalization, and 4D MC confirmation.

```mermaid
graph TD
    subgraph KAPPA ["Wave 1: κ-Scaling + Polariton"]
        KS["κ-Scaling Discovery<br/>δ_diss ∝ κ (LINEAR)<br/>11 Lean theorems"]
        POL["Polariton Tier 1<br/>T_H ~ 0.8-4 K<br/>10^10× hotter than BEC"]
    end

    subgraph MC ["Wave 2: 4D Monte Carlo"]
        SU2["SU(2) Integration<br/>Grassmann TRG<br/>10 + 16 theorems"]
        SPLIT["4D Split Transition<br/>CONFIRMED vestigial<br/>L=4,6,8 production"]
    end

    subgraph CHIRAL ["Wave 3: Chirality Formal (Paper 7)"]
        GS["9 GS Conditions<br/>Formalized in Lean<br/>28+1 + 14+1 theorems"]
        TPF["5 TPF Violations<br/>Proved mechanically<br/>12 theorems"]
        FIRST_CHIRAL["FIRST formal verification<br/>in lattice chiral<br/>fermion literature"]
    end

    subgraph CATEGORICAL ["Wave 4: Layer 1 Categorical"]
        PIVOT["PivotalCategory<br/>FIRST-EVER in Lean<br/>18 theorems"]
        FUSION["FusionCategory<br/>FIRST-EVER anywhere<br/>44 theorems"]
        DRINFELD["Drinfeld Double<br/>FIRST-EVER in Lean<br/>15 theorems"]
        GAUGE_EM["Gauge Emergence<br/>Z(Vec_G) ≅ Rep(D(G))<br/>14 theorems"]
    end

    subgraph TOTAL ["Phase 5 Complete"]
        THEOREMS["429 theorems + 2 axioms<br/>30 Lean modules<br/>ZERO sorry"]
        TESTS_V["1001 tests<br/>ALL passing"]
        PAPERS["7 papers<br/>99 Aristotle-proved"]
    end

    KS --> POL
    SU2 --> SPLIT
    GS --> TPF
    TPF --> FIRST_CHIRAL
    PIVOT --> FUSION
    FUSION --> DRINFELD
    DRINFELD --> GAUGE_EM

    KAPPA --> TOTAL
    MC --> TOTAL
    CHIRAL --> TOTAL
    CATEGORICAL --> TOTAL

    style KAPPA fill:#2E86AB,color:#fff
    style KS fill:#2E86AB,color:#fff
    style POL fill:#2E86AB,color:#fff
    style MC fill:#A23B72,color:#fff
    style SU2 fill:#A23B72,color:#fff
    style SPLIT fill:#A23B72,color:#fff
    style CHIRAL fill:#F18F01,color:#111
    style GS fill:#F18F01,color:#111
    style TPF fill:#F18F01,color:#111
    style FIRST_CHIRAL fill:#FF6B6B,color:#111
    style CATEGORICAL fill:#4ECDC4,color:#111
    style PIVOT fill:#4ECDC4,color:#111
    style FUSION fill:#4ECDC4,color:#111
    style DRINFELD fill:#4ECDC4,color:#111
    style GAUGE_EM fill:#4ECDC4,color:#111
    style TOTAL fill:#66bb6a,color:#111
    style THEOREMS fill:#66bb6a,color:#111
    style TESTS_V fill:#66bb6a,color:#111
    style PAPERS fill:#66bb6a,color:#111
```

**What to look for:** Phase 5 doubled the theorem count (216→429) across four waves. Wave 1 discovered κ-scaling (δ_diss is LINEAR in κ, not constant) and opened the polariton platform (10^10× hotter). Wave 2 confirmed the vestigial phase via 4D MC production. Wave 3 formalized the chirality wall completely (Paper 7 — first in the lattice fermion literature). Wave 4 built Layer 1's categorical foundation with three FIRST-EVER formalizations and the gauge emergence theorem.

---

## 16. Layer 1 Categorical Infrastructure: String-Nets to Gauge Theory

This diagram shows the mathematical hierarchy connecting string-net condensation to emergent gauge theory, all formalized in Lean 4.

```mermaid
graph TD
    subgraph MATHLIB ["Existing Mathlib"]
        SEM["SemisimpleCategory<br/>(Mathlib foundation)"]
    end

    subgraph WAVE4A ["Wave 4A: Pivotal + Spherical"]
        KLIN["KLinearCategory<br/>16 theorems<br/>Schur orthogonality"]
        SPHER["SphericalCategory<br/>18 theorems<br/>FIRST PivotalCategory<br/>in any proof assistant"]
    end

    subgraph WAVE4B ["Wave 4B: Fusion"]
        FUSCAT["FusionCategory<br/>14 theorems<br/>Pentagon equation<br/>F-symbols, D²"]
        FUSEX["FusionExamples<br/>30 theorems<br/>Vec_Z2, Rep_S3<br/>Fibonacci (φ²=φ+1)"]
    end

    subgraph WAVE4C ["Wave 4C: Gauge Emergence"]
        VECG["VecG<br/>9 theorems<br/>Day convolution"]
        DRIN["DrinfeldDouble<br/>15 theorems<br/>FIRST D(G) in Lean"]
        GAUG["GaugeEmergence<br/>14 theorems<br/>Z(Vec_G) ≅ Rep(D(G))"]
        CLIM["Chirality limit:<br/>c ≡ 0 mod 8"]
    end

    SEM --> KLIN
    KLIN --> SPHER
    SPHER --> FUSCAT
    FUSCAT --> FUSEX
    FUSEX --> VECG
    VECG --> DRIN
    DRIN --> GAUG
    GAUG --> CLIM

    style MATHLIB fill:#555,color:#fff
    style SEM fill:#555,color:#fff
    style WAVE4A fill:#2E86AB,color:#fff
    style KLIN fill:#2E86AB,color:#fff
    style SPHER fill:#2E86AB,color:#fff
    style WAVE4B fill:#A23B72,color:#fff
    style FUSCAT fill:#A23B72,color:#fff
    style FUSEX fill:#A23B72,color:#fff
    style WAVE4C fill:#4ECDC4,color:#111
    style VECG fill:#4ECDC4,color:#111
    style DRIN fill:#4ECDC4,color:#111
    style GAUG fill:#4ECDC4,color:#111
    style CLIM fill:#FF6B6B,color:#111
```

**What to look for:** The hierarchy builds from Mathlib's existing category theory through three waves of new formalization. The punchline is GaugeEmergence.lean: it proves that the center of the string-net category (which classifies anyonic excitations) equals the representations of the Drinfeld double (which IS discrete gauge theory). This is the formal Layer 1 → Layer 2 connection. The chirality limitation (c ≡ 0 mod 8) shows that string-nets are intrinsically non-chiral — another face of the chirality wall.

---

## Integration Notes

These visualizations are designed to work together as a learning system:

1. **Start with the Paper 1 Journey** (Diagram 1) for narrative arc
2. **Ground in SK structure** (Diagrams 2-3) for technical foundations
3. **Explore specific mechanisms** (Diagrams 4-8) for conceptual depth
4. **Confront the open problems** (Diagram 9) to understand what's still unknown
5. **See the classification** (Diagram 10) to locate your problem in the landscape
6. **Trace the architecture** (Diagram 11) to see information flow
7. **Connect to knowledge** (Diagram 12) for integration with prerequisites
8. **Go to experiments** (Diagram 13) for testable predictions
9. **Master the details** (Diagram 14) for quantitative predictions
10. **See the complete program** (Diagram 15) for Phase 5 status and wave structure
11. **Understand Layer 1** (Diagram 16) for categorical infrastructure and gauge emergence

Cross-reference these with the dependency graph when planning study sequences. Each diagram can be printed or projected for discussion in study groups.
