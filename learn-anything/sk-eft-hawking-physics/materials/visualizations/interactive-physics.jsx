'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, RotateCcw, Lock } from 'lucide-react';

// ============================================================================
// Tab 1: Acoustic Metric & Light Cones
// ============================================================================

function AcousticMetricTab() {
  const [velocity, setVelocity] = useState(0.5);
  const soundSpeed = 1.0; // normalized
  const ratio = velocity / soundSpeed;
  const isSonic = ratio >= 0.95;
  const isSupersonic = ratio > 1.05;

  // Generate light cones at different positions
  const lightCones = [0.2, 0.4, 0.6, 0.8].map((xPos) => {
    const tilt = Math.min(velocity / soundSpeed, 2) * 25; // tilt angle
    return { xPos, tilt };
  });

  // Color gradient based on flow
  const getColor = (x) => {
    const flowAtX = velocity * (1 - x * 0.3); // constriction effect
    if (flowAtX < soundSpeed * 0.7) return '#3b82f6'; // blue
    if (flowAtX < soundSpeed * 0.95) return '#60a5fa'; // light blue
    if (Math.abs(flowAtX - soundSpeed) < 0.1) return '#ffffff'; // white (horizon)
    return '#ef4444'; // red
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Sonic Horizon Formation</h3>
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Nozzle Flow Velocity: {velocity.toFixed(2)} (c_s = 1.0)
          </label>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={velocity}
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <svg
        width="100%"
        height="400"
        viewBox="0 0 800 400"
        className="border border-gray-600 rounded bg-slate-900"
      >
        {/* Background */}
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#flowGradient)" />

        {/* Nozzle walls */}
        <path d={`M 0 ${200 - 80 * (1 - velocity * 0.3)} L 800 ${200 - 40 * (1 - velocity * 0.3)}`} stroke="#666" strokeWidth="2" fill="none" />
        <path d={`M 0 ${200 + 80 * (1 - velocity * 0.3)} L 800 ${200 + 40 * (1 - velocity * 0.3)}`} stroke="#666" strokeWidth="2" fill="none" />

        {/* Sonic horizon line */}
        {velocity > soundSpeed * 0.8 && (
          <line x1={400} y1="0" x2="400" y2="400" stroke="#fbbf24" strokeWidth="3" strokeDasharray="5,5" opacity="0.7" />
        )}

        {/* Light cones */}
        {lightCones.map((cone, i) => {
          const color = getColor(cone.xPos);
          const x = cone.xPos * 800;
          const baseY = 200;
          const height = 60;
          const tiltX = (cone.tilt / 25) * 40;

          return (
            <g key={i}>
              {/* Past light cone */}
              <polygon
                points={`${x},${baseY} ${x - height - tiltX},${baseY - height} ${x + height - tiltX},${baseY - height}`}
                fill={color}
                opacity="0.3"
                stroke={color}
                strokeWidth="2"
              />
              {/* Future light cone */}
              <polygon
                points={`${x},${baseY} ${x - height + tiltX},${baseY + height} ${x + height + tiltX},${baseY + height}`}
                fill={color}
                opacity="0.3"
                stroke={color}
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Arrow showing flow direction */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#88ccff" />
          </marker>
        </defs>
        <line x1="50" y1="350" x2="150" y2="350" stroke="#88ccff" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="100" y="375" textAnchor="middle" fill="#88ccff" fontSize="12">
          Flow →
        </text>
      </svg>

      {/* Status annotation */}
      <div className={`p-4 rounded border-l-4 ${isSonic ? 'border-yellow-500 bg-yellow-900/30' : 'border-blue-500 bg-blue-900/30'}`}>
        <p className="text-white font-semibold">
          {isSupersonic
            ? '🔴 Supersonic: Sound cannot escape upstream. Acoustic black hole forms.'
            : isSonic
              ? '⚠️ At sonic horizon: v = c_s. Critical threshold reached.'
              : '🔵 Subsonic: Sound can propagate in all directions.'}
        </p>
        <p className="text-sm text-gray-300 mt-1">
          Current ratio v/c_s = {ratio.toFixed(2)} {ratio > 1 && '(SUPERSONIC)'}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 2: Axiom Funnel
// ============================================================================

function AxiomFunnelTab() {
  const [step, setStep] = useState(0);
  const terms = [
    { id: 1, label: 'σ₀', remains: true },
    { id: 2, label: 'σ₁', remains: true },
    { id: 3, label: 'σ₂', remains: true },
    { id: 4, label: 'σ₃', remains: false },
    { id: 5, label: 'σ₄', remains: false },
    { id: 6, label: 'σ₅', remains: false },
    { id: 7, label: 'σ₆', remains: false },
    { id: 8, label: 'σ₇', remains: true },
    { id: 9, label: 'σ₈', remains: true },
  ];

  const explanations = [
    'Nine candidate SK terms span the most general operator basis.',
    'Axiom I (Normalization): ⟨1⟩ = 1 eliminates 4 terms. 5 remain.',
    'Axiom II (Positivity): σᵢ > 0 for physical states constrains signs. ~3 effective.',
    'Axiom III (KMS): Thermal equilibrium locks ratios. 2 free parameters emerge.',
  ];

  const termCounts = ['9 terms', '5 terms', '3-4 effective', '2 free parameters'];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Axiom Constraints on SK Terms</h3>

      {/* Term boxes grid */}
      <div className="grid grid-cols-5 gap-3 p-4 bg-slate-800 rounded">
        {terms.map((term) => {
          const isEliminatedAtStep = step === 1 && !term.remains && term.id > 3 && term.id < 8;
          const isConstrainedAtStep = step === 2 && !term.remains;
          const isHighlightedAtStep = step >= 3 && term.id < 3;

          return (
            <div
              key={term.id}
              className={`p-3 rounded border-2 transition-all duration-500 ${
                isHighlightedAtStep
                  ? 'border-green-400 bg-green-900/50 scale-110'
                  : isEliminatedAtStep || isConstrainedAtStep
                    ? 'border-red-400 bg-red-900/20 opacity-30 scale-90'
                    : 'border-blue-400 bg-blue-900/30'
              }`}
            >
              <p className="text-white font-bold text-center">{term.label}</p>
            </div>
          );
        })}
      </div>

      {/* Term count indicator */}
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-400">{termCounts[step]}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          <RotateCcw size={16} className="inline mr-2" />
          Reset
        </button>
        <button
          onClick={() => setStep(Math.min(step + 1, 3))}
          disabled={step >= 3}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded transition flex items-center justify-center"
        >
          Next Axiom <ChevronRight size={16} className="ml-2" />
        </button>
      </div>

      {/* Explanation panel */}
      <div className="p-4 bg-slate-800 rounded border-l-4 border-purple-500">
        <p className="text-white font-semibold mb-2">{['Start', 'Axiom I: Normalization', 'Axiom II: Positivity', 'Axiom III: KMS'][step]}</p>
        <p className="text-gray-300 text-sm">{explanations[step]}</p>
      </div>

      {/* Physics insight */}
      <div className="p-4 bg-slate-900 rounded border border-gray-600">
        <p className="text-sm text-gray-300">
          <span className="text-green-400 font-semibold">Physics Insight:</span> Each axiom is a physical law applied to the SK formalism. The funnel shows how fundamental principles eliminate redundancy, leaving only the essential degrees of freedom that encode the true physics of Hawking radiation.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 3: Three Walls Assessment
// ============================================================================

function ThreeWallsTab() {
  const [selectedWall, setSelectedWall] = useState(null);
  const [hoverCrack, setHoverCrack] = useState(false);

  const walls = [
    {
      id: 'gauge',
      name: 'Gauge Wall',
      height: 0.7,
      color: '#ef4444',
      status: 'Structurally Impossible',
      detail: 'Anomaly from the fluid layer. Would require canceling cross-scale contributions.',
      confidence: 0.95,
    },
    {
      id: 'gravity',
      name: 'Gravity Wall',
      height: 0.55,
      color: '#f59e0b',
      status: 'Multiple Doors Possible',
      detail: 'Level 3 (geometric) most promising. Requires embedding beyond WKB.',
      confidence: 0.6,
      doors: 3,
    },
    {
      id: 'chirality',
      name: 'Chirality Wall',
      height: 0.8,
      color: '#ef4444',
      status: 'Cracking Under Scrutiny',
      detail: 'Violation depends on precise treatment of anomalies. Recent progress in Papers 5-6.',
      confidence: 0.4,
      cracked: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Three Structural Walls</h3>

      {/* Walls visualization */}
      <svg
        width="100%"
        height="350"
        viewBox="0 0 900 350"
        className="border border-gray-600 rounded bg-slate-900"
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#444" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="900" height="350" fill="url(#grid)" opacity="0.3" />

        {/* Walls */}
        {walls.map((wall, idx) => {
          const x = 150 + idx * 250;
          const baseY = 300;
          const wallHeight = wall.height * 250;

          return (
            <g key={wall.id} onClick={() => setSelectedWall(wall.id)} className="cursor-pointer">
              {/* Wall body */}
              <rect
                x={x - 40}
                y={baseY - wallHeight}
                width="80"
                height={wallHeight}
                fill={wall.color}
                opacity="0.6"
                stroke={wall.color}
                strokeWidth="2"
              />

              {/* Doors (gravity wall only) */}
              {wall.doors &&
                [0.25, 0.5, 0.75].map((pos, i) => (
                  <rect
                    key={i}
                    x={x - 25}
                    y={baseY - wallHeight * pos - 15}
                    width="50"
                    height="30"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    rx="2"
                  />
                ))}

              {/* Cracks (chirality wall) */}
              {wall.cracked && (
                <>
                  <path
                    d={`M ${x - 35} ${baseY - wallHeight * 0.3} Q ${x - 10} ${baseY - wallHeight * 0.5} ${x + 15} ${baseY - wallHeight * 0.7}`}
                    stroke="#fbbf24"
                    strokeWidth={hoverCrack ? 3 : 2}
                    fill="none"
                    className="transition-all"
                  />
                  <path
                    d={`M ${x} ${baseY - wallHeight * 0.4} Q ${x + 15} ${baseY - wallHeight * 0.6} ${x + 30} ${baseY - wallHeight * 0.8}`}
                    stroke="#fbbf24"
                    strokeWidth={hoverCrack ? 3 : 2}
                    fill="none"
                    className="transition-all"
                  />
                </>
              )}

              {/* Label */}
              <text x={x} y={baseY + 25} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                {wall.name}
              </text>

              {/* Confidence meter */}
              <rect x={x - 40} y={baseY + 50} width="80" height="8" fill="#333" rx="2" />
              <rect x={x - 40} y={baseY + 50} width={80 * wall.confidence} height="8" fill={wall.color} rx="2" />
              <text x={x} y={baseY + 70} textAnchor="middle" fill="#aaa" fontSize="11">
                {(wall.confidence * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected wall detail */}
      {selectedWall && (
        <div className="p-4 bg-slate-800 rounded border-l-4 border-blue-500 animate-in">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">
              {walls.find((w) => w.id === selectedWall)?.name}
            </h4>
            <p className="text-gray-300 text-sm mb-2">
              {walls.find((w) => w.id === selectedWall)?.detail}
            </p>
            <p className="text-yellow-400 text-sm font-semibold">
              Status: {walls.find((w) => w.id === selectedWall)?.status}
            </p>
          </div>
        </div>
      )}

      {/* Hover hint for chirality */}
      <button
        onMouseEnter={() => setHoverCrack(true)}
        onMouseLeave={() => setHoverCrack(false)}
        className="text-sm text-gray-400 hover:text-gray-300 transition"
      >
        Hover over the Chirality Wall to see developing fractures...
      </button>
    </div>
  );
}

// ============================================================================
// Tab 4: Research Program Map
// ============================================================================

function ResearchMapTab() {
  const [selectedPaper, setSelectedPaper] = useState(null);

  const papers = [
    {
      id: 1,
      title: 'First-Order Correction',
      color: '#10b981',
      status: 'complete',
      x: 100,
      y: 100,
      results: 'Leading correction to Hawking rate',
      theorems: 3,
      addresses: ['Gauge Wall'],
    },
    {
      id: 2,
      title: 'Second-Order Correction',
      color: '#10b981',
      status: 'complete',
      x: 300,
      y: 100,
      results: 'Next-to-leading order terms',
      theorems: 5,
      addresses: ['Gauge Wall'],
    },
    {
      id: 3,
      title: 'Gauge Erasure',
      color: '#10b981',
      status: 'complete',
      x: 100,
      y: 280,
      results: 'Redundancy elimination',
      theorems: 4,
      addresses: ['Gauge Wall'],
    },
    {
      id: 4,
      title: 'WKB Exact',
      color: '#eab308',
      status: 'in-progress',
      x: 500,
      y: 100,
      results: 'All-orders resummation',
      theorems: 2,
      addresses: ['Gravity Wall'],
    },
    {
      id: 5,
      title: 'Anomaly Dwarf Wave',
      color: '#eab308',
      status: 'in-progress',
      x: 300,
      y: 280,
      results: 'Wave packet dynamics',
      theorems: 4,
      addresses: ['Chirality Wall'],
    },
    {
      id: 6,
      title: 'Vestigial',
      color: '#6b7280',
      status: 'conditional',
      x: 500,
      y: 280,
      results: 'Emergent structure',
      theorems: 1,
      addresses: ['Gravity Wall', 'Chirality Wall'],
    },
  ];

  const edges = [
    { from: 1, to: 2, type: 'extends', label: 'extends' },
    { from: 2, to: 4, type: 'uses', label: 'uses' },
    { from: 1, to: 3, type: 'branches', label: 'branches' },
    { from: 3, to: 5, type: 'uses', label: 'uses' },
    { from: 5, to: 6, type: 'extends', label: 'extends' },
  ];

  const statusColor = {
    complete: '#10b981',
    'in-progress': '#eab308',
    conditional: '#6b7280',
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Research Program Dependencies</h3>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-gray-300">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-gray-300">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500" />
          <span className="text-gray-300">Conditional</span>
        </div>
      </div>

      {/* Network diagram */}
      <svg
        width="100%"
        height="420"
        viewBox="0 0 700 400"
        className="border border-gray-600 rounded bg-slate-900"
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromPaper = papers.find((p) => p.id === edge.from);
          const toPaper = papers.find((p) => p.id === edge.to);
          const strokeDash =
            edge.type === 'extends' ? '0' : edge.type === 'uses' ? '5,5' : '2,2';

          return (
            <g key={i}>
              <line
                x1={fromPaper.x + 40}
                y1={fromPaper.y + 40}
                x2={toPaper.x - 40}
                y2={toPaper.y - 40}
                stroke="#666"
                strokeWidth="2"
                strokeDasharray={strokeDash}
              />
            </g>
          );
        })}

        {/* Paper nodes */}
        {papers.map((paper) => (
          <g
            key={paper.id}
            onClick={() => setSelectedPaper(paper.id)}
            className="cursor-pointer"
          >
            <circle
              cx={paper.x + 40}
              cy={paper.y + 40}
              r="35"
              fill={paper.color}
              opacity={selectedPaper === paper.id ? 1 : 0.7}
              stroke={selectedPaper === paper.id ? '#fff' : paper.color}
              strokeWidth={selectedPaper === paper.id ? 3 : 1}
              className="transition-all hover:opacity-100"
            />
            <text
              x={paper.x + 40}
              y={paper.y + 50}
              textAnchor="middle"
              fill="#000"
              fontSize="11"
              fontWeight="bold"
              className="pointer-events-none"
            >
              P{paper.id}
            </text>

            {/* Label below */}
            <foreignObject x={paper.x - 30} y={paper.y + 85} width="140" height="40">
              <div className="text-xs text-center text-gray-300 leading-tight pointer-events-none">
                {paper.title}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* Paper details */}
      {selectedPaper && (
        <div className="p-4 bg-slate-800 rounded border-l-4 border-blue-500">
          {(() => {
            const paper = papers.find((p) => p.id === selectedPaper);
            return (
              <>
                <h4 className="text-lg font-bold text-white mb-2">Paper {paper.id}: {paper.title}</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-semibold text-green-400">Key Result:</span> {paper.results}</p>
                  <p><span className="font-semibold text-green-400">Theorems:</span> {paper.theorems}</p>
                  <p><span className="font-semibold text-green-400">Addresses:</span> {paper.addresses.join(', ')}</p>
                  <p className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      paper.status === 'complete' ? 'bg-green-900/50 text-green-300' :
                      paper.status === 'in-progress' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-gray-900/50 text-gray-300'
                    }`}>
                      {paper.status === 'complete' ? '✓ Complete' :
                       paper.status === 'in-progress' ? '⧗ In Progress' :
                       '⊗ Conditional'}
                    </span>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function InteractivePhysics() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Acoustic Metric & Light Cones', component: AcousticMetricTab },
    { name: 'Axiom Funnel', component: AxiomFunnelTab },
    { name: 'Three Walls', component: ThreeWallsTab },
    { name: 'Research Map', component: ResearchMapTab },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SK-EFT Hawking Radiation
          </h1>
          <p className="text-gray-400">Interactive Visualization & Curriculum</p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded transition-all ${
                activeTab === idx
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <ActiveComponent />
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          Interactive physics visualization for SK-EFT Hawking Radiation Research Program
        </div>
      </div>
    </div>
  );
}
