# External Resources for SK-EFT Hawking Radiation Physics

*Curated recommendations aligned with the 5-task-class curriculum. Prioritized for self-teaching with a Feynman-style intuition-first approach.*

---

## TC1: Physical Foundations

### Books
- **Feynman Lectures on Physics, Vol. I & II** — The gold standard for physical intuition. Especially Ch. 19 (action principle), Vol. I Ch. 39-41 (stat mech), Vol. III Ch. 1-3 (path integrals). Free at feynmanlectures.caltech.edu
- **Landau & Lifshitz, Fluid Mechanics** — The clearest derivation of the Euler equations from conservation laws. Dense but reward-per-page is extraordinary. §1-5 for foundations, §64-65 for sound waves
- **Kardar, Statistical Physics of Particles** — Modern stat mech with the best treatment of temperature-as-derivative and FDR. Ch. 1-4 for foundations
- **Altland & Simons, Condensed Matter Field Theory** — Path integrals done right, with the connection to stat mech made explicit. Ch. 3-4 for SSB and Goldstone theorem

### Video
- **Susskind's Statistical Mechanics lectures** (Stanford, YouTube) — Builds from first principles, excellent for the "why" of temperature and entropy
- **Tong's QFT lectures** (Cambridge, YouTube + notes at damtp.cam.ac.uk/user/tong/) — Free lecture notes that are the best single resource for QFT foundations with physical insight
- **PBS Space Time: Sound** — Quick visual introduction to how sound waves emerge from molecular dynamics

### Key Papers
- Khesin, Misiołek, Modin (2018) "Geometry of the Madelung transform" — The Kähler morphism proof. arXiv:1807.07172
- Kambe (2010) "On Fluid Maxwell Equations" — The fluid-EM analogy derivation

---

## TC2: The EFT-to-Hawking Pipeline

### Books
- **Burgess, Introduction to Effective Field Theory** (Cambridge, 2020) — The best single book on EFT philosophy. Ch. 1-2 for the conceptual foundation, Ch. 11 for gravitational EFT
- **Mukhanov & Winitzki, Introduction to Quantum Effects in Gravity** — The clearest derivation of Hawking radiation from first principles. Free draft online. Ch. 7-9
- **Barceló, Liberati, Visser, "Analogue Gravity"** — Living Reviews in Relativity (2011). The definitive review of analog gravity. Free. 150 pages covering everything from acoustic metrics to experimental proposals

### Video
- **Jacobson's "Black Hole Thermodynamics" lectures** — Perimeter Institute, available on PIRSA. The master explains Hawking radiation physically
- **Tong's Kinetic Theory lectures** — damtp.cam.ac.uk, excellent on transport and dissipation

### Key Papers
- Son (2002) "Low-energy quantum effective action for relativistic superfluids" — The L=P(X) paper. arXiv:hep-ph/0204199
- Unruh (1981) "Experimental Black-Hole Evaporation?" — The original acoustic metric paper. PRL 46, 1351
- Visser (1998) "Acoustic black holes: horizons, ergospheres and Hawking radiation" — CQG 15, 1767
- Crossley, Glorioso, Liu (2017) "Effective field theory of dissipative fluids" — The CGL formalism. arXiv:1511.03646

---

## TC3: Higher-Order & Non-Perturbative Extensions

### Books
- **Bender & Orszag, Advanced Mathematical Methods for Scientists and Engineers** — The best book for WKB methods. Ch. 10 for WKB, including complex turning points and Stokes lines
- **Heading, An Introduction to Phase-Integral Methods** — Deep treatment of the connection formula problem
- **Coutant & Parentani, "Black hole radiation with short distance dispersion"** — Key paper on dispersive corrections to Hawking radiation

### Video
- **Dunne's "Resurgence and Trans-series" lectures** (Schladming 2015) — Advanced but excellent on the physical meaning of WKB and complex saddles

### Key Papers
- Steinhauer (2016) "Observation of quantum Hawking radiation and its entanglement" — Nature Physics 12, 959. The BEC Hawking observation
- Balbinot et al. (2025) — Backreaction in analog BHs. Shows acoustic BHs cool toward extremality
- Steinhauer (2022) "Confirmation of stimulated Hawking radiation" — PRD 106, 102007

---

## TC4: Gauge Structure & Emergent Gravity

### Books
- **Volovik, The Universe in a Helium Droplet** (Oxford, 2009) — The bible of emergent spacetime from condensed matter. Ch. 7-9 for emergent fermions/gauge, Ch. 10-12 for emergent gravity. Essential reading
- **McGreevy, "Generalized Symmetries in Condensed Matter"** — Annual Reviews 2023. Best review of higher-form symmetries accessible to non-experts
- **Diakonov (2011) "Towards lattice-regularized Quantum Gravity"** — The ADW paper. arXiv:1109.0091

### Video
- **Wen's "Topological Order" lectures** (Perimeter, PIRSA) — The originator explains string-net condensation
- **Sachdev's "Quantum Phase Transitions" lectures** — For the condensed matter perspective on emergent gauge fields

### Key Papers
- Eling (2023) "A gauge theory for 3+1D incompressible Euler equations" — The BF gauge theory. arXiv:2310.12475
- Vergeles (2025) — Unitarity proof for ADW lattice gravity. PRD 112
- Grozdanov, Hofman, Iqbal (2017) "Generalized global symmetries and dissipative magnetohydrodynamics" — The 1-form Goldstone mechanism. arXiv:1610.07392
- Torrieri (2020) "The non-Abelian Clebsch representation..." — Why non-Abelian fluid gauge fails

---

## TC5: Synthesis & Big Picture

### Books
- **Levin & Wen (2005) "String-net condensation"** — PRB 71, 045110. The original paper, remarkably readable
- **Pretko (2017) "Emergent gravity of fractons"** — The fracton-gravity connection. arXiv:1702.07613
- **Thorngren, Preskill, Fidkowski (2026) "Symmetry Disentangler"** — The chirality wall breakthrough. January 2026

### Review Articles
- **Grosfeld & Stern, "Electronic Analogs of Quantum Optics"** — For the condensed matter perspective on the broader program
- **Hasenfratz & Witzel (2025)** — SMG at 16 Weyl fermions. The chirality wall's most important numerical result

### Community
- **Analog Gravity community**: The annual "Analogue Gravity" workshop series (Trieste, SISSA). Active researchers include Barceló, Liberati, Visser, Steinhauer, Carusotto
- **HepLean/PhysLean community**: GitHub discussions at github.com/HEPLean/PhysLean. For formal verification questions
- **Fracton community**: Papers primarily on arXiv cond-mat.str-el. Key groups: Pretko, Radzihovsky, Hermele (Colorado); Seiberg, Shao (IAS)
- **BEC analog gravity labs**: Steinhauer (Technion), Oberthaler (Heidelberg), Carusotto (Trento), Steinhauer (Nature Physics 2016)

### Tools
- **Lean 4 + Mathlib4** — Formal verification. lake build, leanproject.org
- **Aristotle prover** — Your own automated theorem prover for Lean
- **Python scientific stack** — NumPy, SciPy, Plotly for computational physics
- **Anki** — Spaced repetition for the SRS flashcard deck

---

## How to Use This List

**Week 1-5 (TC1):** Start with Feynman Lectures for intuition, Kardar Ch. 1-4 for stat mech depth. Watch Susskind's stat mech lectures during commute/exercise.

**Week 5-10 (TC2):** Read Burgess Ch. 1-2 for EFT philosophy. Read the Barceló-Liberati-Visser review for analog gravity context. Read the CGL paper when you reach the SK formalism sessions.

**Week 10-16 (TC3):** Bender & Orszag Ch. 10 for WKB methods. Read Steinhauer papers alongside the experimental sessions.

**Week 16-24 (TC4):** Volovik's Helium Droplet book is essential — read Ch. 7-12 across these weeks. Read the gauge erasure papers alongside the sessions.

**Week 24-32 (TC5):** Levin-Wen paper for string-nets. The Thorngren-Preskill-Fidkowski paper for chirality. This is where the big picture comes together.
