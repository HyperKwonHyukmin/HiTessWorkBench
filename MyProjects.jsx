import React, { useState } from 'react';
import { 
  Search, Filter, Download, FileText, 
  MoreVertical, ChevronRight, Box, 
  CheckCircle2, XCircle, Clock, AlertCircle,
  FileCode, FileBarChart, X
} from 'lucide-react';

/**
 * [Mock Data] 임의 샘플 데이터
 */
const SAMPLE_PROJECTS = [
  { 
    id: "PRJ-2024-001", 
    name: "Group Unit 권상 해석 (Block A)", 
    type: "Unit Analysis", 
    status: "Completed", 
    solver: "Nastran",
    nodes: 124500,
    elements: 98200,
    material: "AH36",
    date: "2024-02-14 14:30",
    author: "Kwon Hyuk min"
  },
  { 
    id: "PRJ-2024-002", 
    name: "Cantilever Beam Test #4", 
    type: "Component", 
    status: "Failed", 
    solver: "Abaqus",
    nodes: 5400,
    elements: 4200,
    material: "SUS304",
    date: "2024-02-13 09:15",
    author: "Hong Gil Dong"
  },
  { 
    id: "PRJ-2024-003", 
    name: "Midship Section Hull Analysis", 
    type: "Whole Ship", 
    status: "Solving", 
    solver: "Nastran",
    nodes: 1540000,
    elements: 1420000,
    material: "DH36",
    date: "2024-02-15 11:00",
    author: "Kwon Hyuk min"
  },
  { 
    id: "PRJ-2024-004", 
    name: "Engine Mount Bracket Static", 
    type: "Component", 
    status: "Completed", 
    solver: "Ansys",
    nodes: 24000,
    elements: 18500,
    material: "Cast Iron",
    date: "2024-02-10 16:45",
    author: "Kim Cheol Su"
  },
  { 
    id: "PRJ-2024-005", 
    name: "Lifting Lug Capacity Check", 
    type: "Component", 
    status: "Pending", 
    solver: "Nastran",
    nodes: 8500,
    elements: 6200,
    material: "AH32",
    date: "2024-02-16 08:20",
    author: "Kwon Hyuk min"
  },
];

/**
 * [Component] 상태 뱃지 (Status Badge)
 */
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Solving: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Pending: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const icons = {
    Completed: <CheckCircle2 size={12} className="mr-1" />,
    Solving: <Clock size={12} className="mr-1" />,
    Failed: <XCircle size={12} className="mr-1" />,
    Pending: <AlertCircle size={12} className="mr-1" />,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center w-fit ${styles[status] || styles.Pending}`}>
      {icons[status]}
      {status}
    </span>
  );
};

/**
 * [Component] 상세 보기 모달 (Detail Modal)
 */
const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="bg-[#002554] p-6 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {project.id}
              </span>
              <span className="text-blue-200 text-xs">| {project.date}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{project.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* 1. 기본 정보 그리드 */}
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Analysis Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Solver Engine</span>
              <div className="font-bold text-slate-700 flex items-center gap-2">
                <CpuIcon /> {project.solver}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Total Nodes</span>
              <div className="font-mono text-slate-700 font-bold">{project.nodes.toLocaleString()} EA</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Used Material</span>
              <div className="text-slate-700 font-bold">{project.material}</div>
            </div>
          </div>

          {/* 2. 다운로드 영역 */}
          {project.status === 'Completed' && (
            <>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Results & Reports</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileBarChart size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">Analysis Result File</p>
                      <p className="text-xs text-slate-400">Binary Output (.op2 / .odb)</p>
                    </div>
                  </div>
                  <Download size={18} className="text-slate-300 group-hover:text-blue-600" />
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">Automated Report</p>
                      <p className="text-xs text-slate-400">Engineering Summary (.pdf)</p>
                    </div>
                  </div>
                  <Download size={18} className="text-slate-300 group-hover:text-green-600" />
                </button>
              </div>
            </>
          )}

          {project.status === 'Failed' && (
             <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-red-700">Analysis Failed</h4>
                  <p className="text-xs text-red-600 mt-1">
                    Please check the log file for error details (Error Code: E5041)
                  </p>
                  <button className="mt-2 text-xs font-bold text-red-700 underline hover:text-red-900">
                    Download Log File (.f06)
                  </button>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
            Close
          </button>
          <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Open in Post-Processor
          </button>
        </div>
      </div>
    </div>
  );
};

// SVG Icon Helper
const CpuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

/**
 * =================================================================
 * [MAIN PAGE] My Projects
 * =================================================================
 */
export default function MyProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // 검색 필터링
  const filteredProjects = SAMPLE_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your structural analysis history.</p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full shadow-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-gray-300 transition-colors shadow-sm">
            <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* 2. Project List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-32">Project ID</th>
                <th className="py-4 px-6 font-semibold">Project Name</th>
                <th className="py-4 px-6 font-semibold">Type</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Last Modified</th>
                <th className="py-4 px-6 font-semibold text-center w-16">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <tr 
                    key={index}
                    onClick={() => setSelectedProject(project)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 font-bold">
                      {project.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-100 rounded text-slate-400 mr-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Box size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{project.solver}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {project.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 text-right font-mono">
                      {project.date}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <FileCode size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No projects found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 3. Detail Modal (조건부 렌더링) */}
      <ProjectDetailModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </div>
  );
}
