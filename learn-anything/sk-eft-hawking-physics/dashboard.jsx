import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BookOpen,
  Target,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const SkEftHawkingDashboard = () => {
  // Knowledge node data
  const knowledgeNodes = [
    // Foundations (4 nodes)
    { id: 'vertex-lagrangian-mechanics', name: 'Lagrangian Mechanics', cluster: 'foundations', mastery: 0.35 },
    { id: 'vertex-quantum-mechanics', name: 'Quantum Mechanics', cluster: 'foundations', mastery: 0.45 },
    { id: 'vertex-statistical-mechanics', name: 'Statistical Mechanics', cluster: 'foundations', mastery: 0.30 },
    { id: 'vertex-fluid-dynamics', name: 'Fluid Dynamics', cluster: 'foundations', mastery: 0.50 },

    // EFT Core (3 nodes)
    { id: 'vertex-eft-philosophy', name: 'EFT Philosophy', cluster: 'eft-core', mastery: 0.55 },
    { id: 'vertex-son-superfluid-eft', name: "Son's L=P(X)", cluster: 'eft-core', mastery: 0.50 },
    { id: 'vertex-spontaneous-symmetry-breaking', name: 'SSB & Goldstone', cluster: 'eft-core', mastery: 0.45 },

    // Condensed Matter (2 nodes)
    { id: 'vertex-bec-physics', name: 'BEC Physics', cluster: 'condensed-matter', mastery: 0.55 },
    { id: 'vertex-volovik-he3', name: 'Volovik He-3', cluster: 'condensed-matter', mastery: 0.40 },

    // Analog Gravity (4 nodes)
    { id: 'vertex-acoustic-metric', name: 'Acoustic Metric', cluster: 'analog-gravity', mastery: 0.55 },
    { id: 'vertex-hawking-radiation', name: 'Hawking Radiation', cluster: 'analog-gravity', mastery: 0.55 },
    { id: 'vertex-transonic-backgrounds', name: 'Transonic Flows', cluster: 'analog-gravity', mastery: 0.60 },
    { id: 'vertex-bogoliubov-coefficients', name: 'Bogoliubov Coefficients', cluster: 'analog-gravity', mastery: 0.45 },

    // SK Formalism (3 nodes)
    { id: 'vertex-sk-contour', name: 'SK Contour', cluster: 'sk-formalism', mastery: 0.50 },
    { id: 'vertex-kms-fdr', name: 'KMS & FDR', cluster: 'sk-formalism', mastery: 0.50 },
    { id: 'vertex-sk-axioms', name: 'SK Axioms', cluster: 'sk-formalism', mastery: 0.50 },

    // Phase 1-2 Results (4 nodes)
    { id: 'vertex-dissipative-correction', name: 'Dissipative Correction', cluster: 'phase1-2-results', mastery: 0.60 },
    { id: 'vertex-transport-counting', name: 'Transport Counting', cluster: 'phase1-2-results', mastery: 0.50 },
    { id: 'vertex-spectral-distortion', name: 'Spectral Distortion', cluster: 'phase1-2-results', mastery: 0.45 },
    { id: 'vertex-cgl-derivation', name: 'CGL Derivation', cluster: 'phase1-2-results', mastery: 0.45 },

    // Phase 3 WKB (2 nodes)
    { id: 'vertex-wkb-connection', name: 'WKB Connection', cluster: 'phase3-wkb', mastery: 0.45 },
    { id: 'vertex-backreaction', name: 'Backreaction', cluster: 'phase3-wkb', mastery: 0.35 },

    // Gauge Structure (2 nodes)
    { id: 'vertex-higher-form-symmetries', name: 'Higher-Form Symmetries', cluster: 'gauge-structure', mastery: 0.40 },
    { id: 'vertex-gauge-erasure', name: 'Gauge Erasure', cluster: 'gauge-structure', mastery: 0.55 },

    // Emergent Gravity (3 nodes)
    { id: 'vertex-adw-mechanism', name: 'ADW Mechanism', cluster: 'emergent-gravity', mastery: 0.50 },
    { id: 'vertex-vestigial-gravity', name: 'Vestigial Gravity', cluster: 'emergent-gravity', mastery: 0.45 },
    { id: 'vertex-coleman-weinberg', name: 'Coleman-Weinberg', cluster: 'emergent-gravity', mastery: 0.35 },

    // Fracton Topological (2 nodes)
    { id: 'vertex-fracton-hydro', name: 'Fracton Hydro', cluster: 'fracton-topological', mastery: 0.40 },
    { id: 'vertex-string-nets', name: 'String-Nets', cluster: 'fracton-topological', mastery: 0.30 },

    // Synthesis (4 nodes)
    { id: 'vertex-three-walls', name: 'Three Walls', cluster: 'synthesis', mastery: 0.65 },
    { id: 'vertex-chirality-wall', name: 'Chirality Wall', cluster: 'synthesis', mastery: 0.45 },
    { id: 'vertex-experimental-landscape', name: 'Experimental Landscape', cluster: 'synthesis', mastery: 0.55 },
    { id: 'vertex-hybrid-architecture', name: 'Hybrid Architecture', cluster: 'synthesis', mastery: 0.65 },

    // Methodology (1 node)
    { id: 'vertex-lean-verification', name: 'Lean Verification', cluster: 'methodology', mastery: 0.80 },
  ];

  // Task classes data
  const taskClasses = [
    {
      id: 'tc1',
      name: 'Physical Foundations',
      weeks: 'Weeks 1-5',
      progress: 0,
      status: 'NOT STARTED',
    },
    {
      id: 'tc2',
      name: 'EFT-to-Hawking Pipeline',
      weeks: 'Weeks 5-10',
      progress: 0,
      status: 'NOT STARTED',
    },
    {
      id: 'tc3',
      name: 'Higher-Order Extensions',
      weeks: 'Weeks 10-16',
      progress: 0,
      status: 'NOT STARTED',
    },
    {
      id: 'tc4',
      name: 'Gauge Structure & Emergent Gravity',
      weeks: 'Weeks 16-24',
      progress: 0,
      status: 'NOT STARTED',
    },
    {
      id: 'tc5',
      name: 'Synthesis',
      weeks: 'Weeks 24-32',
      progress: 0,
      status: 'NOT STARTED',
    },
  ];

  // Cluster definitions
  const clusterDisplayNames = {
    'foundations': 'Foundations',
    'eft-core': 'EFT Core',
    'condensed-matter': 'Condensed Matter',
    'analog-gravity': 'Analog Gravity',
    'sk-formalism': 'SK Formalism',
    'phase1-2-results': 'Phase 1-2 Results',
    'phase3-wkb': 'Phase 3 WKB',
    'gauge-structure': 'Gauge Structure',
    'emergent-gravity': 'Emergent Gravity',
    'fracton-topological': 'Fracton Topological',
    'synthesis': 'Synthesis',
    'methodology': 'Methodology',
  };

  // Get mastery color
  const getMasteryColor = (mastery) => {
    if (mastery >= 0.90) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: '#22c55e' };
    if (mastery >= 0.70) return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: '#3b82f6' };
    if (mastery >= 0.40) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: '#eab308' };
    if (mastery >= 0.10) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: '#f97316' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: '#d1d5db' };
  };

  // Group nodes by cluster
  const nodesByCluster = useMemo(() => {
    const grouped = {};
    knowledgeNodes.forEach((node) => {
      if (!grouped[node.cluster]) {
        grouped[node.cluster] = [];
      }
      grouped[node.cluster].push(node);
    });
    return grouped;
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const masteredCount = knowledgeNodes.filter(n => n.mastery >= 0.90).length;
    const proficientCount = knowledgeNodes.filter(n => n.mastery >= 0.70 && n.mastery < 0.90).length;
    const familiarCount = knowledgeNodes.filter(n => n.mastery >= 0.40 && n.mastery < 0.70).length;
    const attemptedCount = knowledgeNodes.filter(n => n.mastery >= 0.10 && n.mastery < 0.40).length;
    const notStartedCount = knowledgeNodes.filter(n => n.mastery < 0.10).length;

    return {
      mastered: masteredCount,
      proficient: proficientCount,
      familiar: familiarCount,
      attempted: attemptedCount,
      notStarted: notStartedCount,
      coverage: ((proficientCount * 0.85 + familiarCount * 0.55 + attemptedCount * 0.25) / knowledgeNodes.length * 100).toFixed(1),
    };
  }, []);

  // Pie chart data
  const masteryDistribution = [
    { name: 'Mastered', value: metrics.mastered, fill: '#22c55e' },
    { name: 'Proficient', value: metrics.proficient, fill: '#3b82f6' },
    { name: 'Familiar', value: metrics.familiar, fill: '#eab308' },
    { name: 'Attempted', value: metrics.attempted, fill: '#f97316' },
    { name: 'Not Started', value: metrics.notStarted, fill: '#d1d5db' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              SK-EFT Hawking Physics — Learning Dashboard
            </h1>
          </div>
          <p className="text-lg text-slate-600 italic ml-11">
            Identity frame: Becoming a theoretical physicist
          </p>
        </div>

        {/* Key Metrics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Mastered</p>
                  <p className="text-3xl font-bold text-green-600">{metrics.mastered}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Proficient</p>
                  <p className="text-3xl font-bold text-blue-600">{metrics.proficient}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Familiar</p>
                  <p className="text-3xl font-bold text-yellow-600">{metrics.familiar}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Attempted</p>
                  <p className="text-3xl font-bold text-orange-600">{metrics.attempted}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Mastery Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Mastery Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={masteryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {masteryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coverage and Session Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Coverage</p>
            <p className="text-3xl font-bold text-indigo-600">{metrics.coverage}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Total Sessions Planned</p>
            <p className="text-3xl font-bold text-slate-900">155</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Sessions Completed</p>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Current Task Class</p>
            <p className="text-lg font-bold text-slate-900">TC1</p>
            <p className="text-xs text-slate-500">Physical Foundations</p>
          </div>
        </div>

        {/* Curriculum Roadmap */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Curriculum Roadmap</h2>
          </div>
          <div className="space-y-6">
            {taskClasses.map((tc) => (
              <div key={tc.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{tc.name}</h3>
                    <p className="text-sm text-slate-500">{tc.weeks}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tc.progress === 0
                      ? 'bg-gray-100 text-gray-700'
                      : tc.progress < 0.5
                      ? 'bg-yellow-100 text-yellow-700'
                      : tc.progress < 1
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {tc.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      tc.progress === 0
                        ? 'bg-gray-400'
                        : tc.progress < 0.5
                        ? 'bg-yellow-500'
                        : tc.progress < 1
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${tc.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Map */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Knowledge Map</h2>
          </div>
          <div className="space-y-8">
            {Object.entries(nodesByCluster).map(([cluster, nodes]) => (
              <div key={cluster}>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-indigo-200">
                  {clusterDisplayNames[cluster]}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {nodes.map((node) => {
                    const colors = getMasteryColor(node.mastery);
                    return (
                      <div
                        key={node.id}
                        className={`${colors.bg} ${colors.text} border-2 ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow duration-200`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold leading-tight">{node.name}</p>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-0.5"
                            style={{ backgroundColor: colors.dot }}
                          />
                        </div>
                        <div className="text-xs font-medium opacity-75">
                          {(node.mastery * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Next Steps</h2>
          </div>
          <p className="text-lg font-semibold">
            Epitome Session — The Paper 1 Journey
          </p>
          <p className="text-indigo-100 mt-2">
            Begin your exploration of the foundational concepts that bridge EFT theory and Hawking physics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkEftHawkingDashboard;
