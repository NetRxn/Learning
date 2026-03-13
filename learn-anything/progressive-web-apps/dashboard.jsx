import { useState, useMemo } from "react";
import { BookOpen, Target, Brain, TrendingUp, ChevronDown, ChevronRight, Clock, Zap, CheckCircle2, Circle, AlertTriangle, ArrowRight } from "lucide-react";

const MASTERY_COLORS = {
  mastered: { bg: "#22c55e", text: "#fff", label: "Mastered" },
  proficient: { bg: "#3b82f6", text: "#fff", label: "Proficient" },
  familiar: { bg: "#eab308", text: "#000", label: "Familiar" },
  attempted: { bg: "#f97316", text: "#fff", label: "Attempted" },
  not_started: { bg: "#d1d5db", text: "#374151", label: "Not Started" },
};

const vertices = [
  { id: "http-cache", name: "HTTP Caching", mastery: 0.60, cat: "familiar", cluster: "Caching Foundations" },
  { id: "browser-req", name: "Browser Request Lifecycle", mastery: 0.55, cat: "familiar", cluster: "Caching Foundations" },
  { id: "security", name: "HTTPS & SW Security", mastery: 0.40, cat: "familiar", cluster: "Caching Foundations" },
  { id: "sw-lifecycle", name: "SW Lifecycle", mastery: 0.65, cat: "familiar", cluster: "Service Worker Core" },
  { id: "cache-api", name: "Cache API & Storage", mastery: 0.60, cat: "familiar", cluster: "Service Worker Core" },
  { id: "update-flow", name: "Update Flow Design", mastery: 0.55, cat: "familiar", cluster: "Service Worker Core" },
  { id: "strategy", name: "Strategy Selection", mastery: 0.60, cat: "familiar", cluster: "Caching Strategy" },
  { id: "sw-cdn", name: "SW + CDN Interaction", mastery: 0.60, cat: "familiar", cluster: "Caching Strategy" },
  { id: "sw-http", name: "SW + HTTP Alignment", mastery: 0.55, cat: "familiar", cluster: "Caching Strategy" },
  { id: "offline", name: "Offline Strategy", mastery: 0.65, cat: "familiar", cluster: "Architectural Decisions" },
  { id: "fitness", name: "PWA Fitness Eval", mastery: 0.60, cat: "familiar", cluster: "Architectural Decisions" },
  { id: "migration", name: "Migration Cost", mastery: 0.55, cat: "familiar", cluster: "Architectural Decisions" },
  { id: "htmx", name: "htmx-PWA Tension", mastery: 0.25, cat: "attempted", cluster: "Architectural Decisions" },
  { id: "platform", name: "Platform Constraints", mastery: 0.05, cat: "not_started", cluster: "Architectural Decisions" },
  { id: "anti-pattern", name: "Anti-Pattern Detection", mastery: 0.40, cat: "familiar", cluster: "Quality & Tooling" },
  { id: "workbox", name: "Workbox & Serwist", mastery: 0.55, cat: "familiar", cluster: "Quality & Tooling" },
  { id: "perf", name: "Performance Budgeting", mastery: 0.15, cat: "attempted", cluster: "Quality & Tooling" },
  { id: "manifest", name: "Web App Manifest", mastery: 0.10, cat: "attempted", cluster: "PWA Shell" },
  { id: "app-shell", name: "App Shell Pattern", mastery: 0.05, cat: "not_started", cluster: "PWA Shell" },
  { id: "bg-sync", name: "Background Sync", mastery: 0.35, cat: "attempted", cluster: "Advanced" },
  { id: "push", name: "Push Notifications", mastery: 0.10, cat: "attempted", cluster: "Advanced" },
  { id: "wasm", name: "WASM in PWA", mastery: 0.15, cat: "attempted", cluster: "Advanced" },
];

const taskClasses = [
  { id: "tc-1", name: "The PWA Mental Model", level: 1, status: "passed", completion: 1.0 },
  { id: "tc-2", name: "Caching Strategy & Layers", level: 2, status: "in_progress", completion: 0.65, gate: "Session 4" },
  { id: "tc-3", name: "Architectural Decisions", level: 3, status: "locked", completion: 0.0 },
  { id: "tc-4", name: "Code Quality & Anti-Patterns", level: 4, status: "locked", completion: 0.0 },
  { id: "tc-5", name: "Advanced & Coached Judgment", level: 5, status: "locked", completion: 0.0 },
];

const sessions = [
  { id: 1, date: "Mar 9", duration: 45, template: "Concept Intro", topics: "SW mental model, offline strategy, StudyElf fitness eval, standalone\u2192export discovery", transitions: 5 },
  { id: 2, date: "Mar 10", duration: 40, template: "Concept Intro", topics: "SW lifecycle phases, 5 caching strategies mapped to StudyElf, CDN vs SW caching, offline flashcard scenario", transitions: 4 },
  { id: 3, date: "Mar 10", duration: 45, template: "Completion Task", topics: "Three-layer cache model, fetch cache:reload, cache versioning, Serwist migration plan, update flow design", transitions: 6 },
];

function MasteryBar({ value, color, height = 4 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb", height }}>
      <div className="rounded-full transition-all duration-500" style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color, height }} />
    </div>
  );
}

function GraphNode({ vertex, isSelected, onClick }) {
  const color = MASTERY_COLORS[vertex.cat];
  const pct = Math.round(vertex.mastery * 100);
  return (
    <button
      onClick={() => onClick(vertex)}
      className="rounded-lg p-2 text-left transition-all duration-200 border-2 min-w-0"
      style={{
        backgroundColor: color.bg + "18",
        borderColor: isSelected ? color.bg : color.bg + "40",
        boxShadow: isSelected ? `0 0 0 2px ${color.bg}40` : "none",
      }}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-xs font-medium truncate" style={{ color: "#1f2937" }}>{vertex.name}</span>
        <span className="text-xs font-bold flex-shrink-0" style={{ color: color.bg }}>{pct}%</span>
      </div>
      <MasteryBar value={vertex.mastery} color={color.bg} />
    </button>
  );
}

function ClusterGroup({ name, verts, selectedVertex, onSelect }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-1">{name}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {verts.map(v => <GraphNode key={v.id} vertex={v} isSelected={selectedVertex?.id === v.id} onClick={onSelect} />)}
      </div>
    </div>
  );
}

export default function PWADashboard() {
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [showSessions, setShowSessions] = useState(false);

  const clusters = useMemo(() => {
    const map = {};
    vertices.forEach(v => {
      if (!map[v.cluster]) map[v.cluster] = [];
      map[v.cluster].push(v);
    });
    return Object.entries(map);
  }, []);

  const metrics = useMemo(() => {
    const cats = { mastered: 0, proficient: 0, familiar: 0, attempted: 0, not_started: 0 };
    vertices.forEach(v => cats[v.cat]++);
    const avgMastery = vertices.reduce((s, v) => s + v.mastery, 0) / vertices.length;
    return { cats, avgMastery };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={24} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Progressive Web Apps</h1>
        </div>
        <p className="text-sm text-gray-500">Learning journey — 3 sessions, Day 2</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Avg Mastery</div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.avgMastery * 100)}%</div>
          <MasteryBar value={metrics.avgMastery} color="#3b82f6" />
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Delayed Retention</div>
          <div className="text-2xl font-bold text-green-600">100%</div>
          <div className="text-xs text-gray-400">6/6 probes correct</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Components</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{metrics.cats.familiar}</span>
            <span className="text-sm text-gray-400">/ {vertices.length} familiar+</span>
          </div>
          <div className="text-xs text-gray-400">{metrics.cats.attempted} attempted, {metrics.cats.not_started} not started</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Velocity</div>
          <div className="flex items-center gap-1">
            <TrendingUp size={20} className="text-green-500" />
            <span className="text-lg font-bold text-green-600">Ahead</span>
          </div>
          <div className="text-xs text-gray-400">TC-1 done in 2 sessions</div>
        </div>
      </div>

      {/* Main: Graph + Sidebar */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <BookOpen size={14} /> Knowledge Map
            </h2>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {Object.entries(MASTERY_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.bg }} />
                  <span className="text-gray-500">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
          {clusters.map(([name, verts]) => (
            <ClusterGroup key={name} name={name} verts={verts} selectedVertex={selectedVertex} onSelect={setSelectedVertex} />
          ))}
          {selectedVertex && (
            <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">{selectedVertex.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                  backgroundColor: MASTERY_COLORS[selectedVertex.cat].bg + "20",
                  color: MASTERY_COLORS[selectedVertex.cat].bg
                }}>
                  {Math.round(selectedVertex.mastery * 100)}% — {MASTERY_COLORS[selectedVertex.cat].label}
                </span>
              </div>
              <MasteryBar value={selectedVertex.mastery} color={MASTERY_COLORS[selectedVertex.cat].bg} height={6} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Curriculum */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3">
              <Target size={14} /> Curriculum
            </h2>
            <div className="space-y-2">
              {taskClasses.map(tc => {
                const statusColor = tc.status === "passed" ? "#22c55e" : tc.status === "in_progress" ? "#eab308" : "#d1d5db";
                const StatusIcon = tc.status === "passed" ? CheckCircle2 : tc.status === "in_progress" ? Target : Circle;
                return (
                  <div key={tc.id} className="flex items-center gap-2">
                    <StatusIcon size={16} color={statusColor} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${tc.status === "locked" ? "text-gray-400" : "text-gray-800"}`}>
                          TC-{tc.level}: {tc.name}
                        </span>
                        <span className="text-xs text-gray-500">{Math.round(tc.completion * 100)}%</span>
                      </div>
                      <MasteryBar value={tc.completion} color={statusColor} height={3} />
                      {tc.gate && tc.status === "in_progress" && (
                        <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                          <AlertTriangle size={10} /> Gate: {tc.gate}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Session */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
            <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5 mb-2">
              <Zap size={14} /> Next: Mastery Gate
            </h2>
            <div className="text-xs text-amber-700 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <ArrowRight size={10} className="mt-0.5 flex-shrink-0" />
                <span><strong>Cold Recall</strong> — Three-layer model, versioning</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ArrowRight size={10} className="mt-0.5 flex-shrink-0" />
                <span><strong>Novel App</strong> — Design caching from scratch</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ArrowRight size={10} className="mt-0.5 flex-shrink-0" />
                <span><strong>Explain</strong> — SW update lifecycle</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-amber-600">
              Pass → TC-3: Architectural Decisions
            </div>
          </div>

          {/* Self Assessment */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1">Self-Assessment</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">3.5</span>
              <span className="text-xs text-gray-400">/5</span>
            </div>
            <div className="text-xs text-green-600">Well-calibrated</div>
          </div>
        </div>
      </div>

      {/* Mastery Distribution Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Mastery Distribution</h2>
        <div className="flex items-end gap-1 h-16">
          {[...vertices]
            .sort((a, b) => b.mastery - a.mastery)
            .map(v => (
              <div key={v.id} className="flex-1">
                <div
                  className="w-full rounded-t cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    height: `${Math.max(v.mastery * 64, 2)}px`,
                    backgroundColor: MASTERY_COLORS[v.cat].bg,
                  }}
                  onClick={() => setSelectedVertex(v)}
                  title={`${v.name}: ${Math.round(v.mastery * 100)}%`}
                />
              </div>
            ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Highest</span>
          <span>22 components</span>
          <span>Lowest</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <button onClick={() => setShowSessions(!showSessions)} className="flex items-center gap-1.5 w-full text-left">
          {showSessions ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Clock size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Session History</span>
          <span className="text-xs text-gray-400 ml-auto">3 sessions, 130 min</span>
        </button>
        {showSessions && (
          <div className="mt-3 space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">Session {s.id}</span>
                    <span className="text-xs text-gray-500">{s.date}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{s.template}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{s.duration}min</span>
                    <span className="text-green-600">{s.transitions} mastery transitions</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">{s.topics}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-xs text-gray-400">Updated after Session 3 — March 10, 2026</div>
    </div>
  );
}
