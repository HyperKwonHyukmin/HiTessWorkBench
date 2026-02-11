import React from 'react';
import { 
  Play, 
  FolderOpen, 
  Clock, 
  MoreVertical, 
  Cpu, 
  HardDrive, 
  Activity,
  FileText,
  Layers,
  Thermometer,
  Wind,
  Server,
  BarChart3,
  CheckCircle2,
  PlayCircle,
  ArrowUpRight,
  Megaphone, 
  Star
} from 'lucide-react';

/**
 * [Row 1] 상단 주요 통계 카드
 */
const EngineeringStatCard = ({ title, titleKo, value, subtext, icon: Icon, color, trend, onClick }) => (
  <div 
    onClick={onClick}
    className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between 
    hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
  >
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
      <ArrowUpRight size={18} />
    </div>

    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-[11px] text-gray-400 font-bold mt-0.5 mb-2">
        {titleKo}
      </p>

      <div className="mt-1 flex items-center space-x-2">
        <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</span>
      </div>
      
      <p className={`mt-1 text-xs font-medium ${trend === 'warning' ? 'text-red-500' : 'text-slate-400'}`}>
        {subtext}
      </p>
    </div>

    <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
      <Icon size={22} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

/**
 * [Row 2] 관리자 공지사항 (Notice) - 닫기 버튼 제거됨
 */
const NoticeBanner = () => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm mb-6 relative overflow-hidden">
    {/* 배경 데코레이션 */}
    <div className="absolute -right-6 -top-6 text-blue-100 opacity-50 rotate-12">
      <Megaphone size={120} />
    </div>

    <div className="flex items-start gap-4 relative z-10 w-full">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
        <Megaphone size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          System Development Notice
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-extrabold uppercase tracking-wide">
            Important
          </span>
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Hi-TESS WorkBench 개발 진행 중입니다
        </p>
      </div>
    </div>
  </div>
);

/**
 * [Row 3] 즐겨찾기 카드 (Favorites)
 */
const FavoriteCard = ({ title, icon: Icon, color, desc }) => (
  <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 hover:-translate-y-1 transition-all group w-full text-center h-full relative overflow-hidden">
    {/* 즐겨찾기 별 아이콘 */}
    <div className="absolute top-3 right-3 text-yellow-400">
      <Star size={16} fill="currentColor" />
    </div>

    <div className={`p-4 rounded-full ${color} text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon size={28} />
    </div>
    <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
    <p className="text-xs text-gray-400 mt-1">{desc}</p>
  </button>
);

/**
 * [Row 4] 최근 프로젝트 리스트
 */
const ProjectRow = ({ id, name, type, status, date }) => {
  const statusStyles = {
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Solving: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
    Failed: 'bg-red-100 text-red-700 border-red-200',
    Draft: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4 font-mono text-xs text-gray-500">{id}</td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <FileText size={16} className="text-slate-400 mr-2 group-hover:text-blue-600 transition-colors" />
          <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">
            {name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 font-mono bg-slate-100 rounded inline-block mt-2 mx-4">{type}</td>
      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[status] || statusStyles.Draft}`}>
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400 text-right">{date}</td>
      <td className="py-3 px-4 text-center">
        <button className="text-gray-300 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
};

export default function Dashboard() {
  
  const handleNavigation = (path) => {
    alert(`이동합니다: ${path}`);
  };

  const projects = [
    { id: "PRJ-004", name: "Group Unit 권상 해석", type: "Unit", status: "Solving", date: "Just now" },
    { id: "PRJ-003", name: "Group Unit 권상 해석", type: "Unit", status: "Completed", date: "2h ago" },
    { id: "PRJ-002", name: "Truss 구조 해석", type: "Truss", status: "Failed", date: "Yesterday" },
    { id: "PRJ-001", name: "Truss 구조 해석", type: "Truss", status: "Completed", date: "3 days ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. Header Area */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workbench Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Check your simulation status and system resources.</p>
        </div>
        <div className="text-right">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
             Engine Connected
           </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* [Row 1] Key Engineering Stats (주요 통계) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        
        {/* Stat 1: My Current Job */}
        <EngineeringStatCard 
          title="My Current Job" 
          titleKo="내 작업 현황"
          value={
            <div className="flex items-center text-blue-600">
               <span className="relative flex h-3 w-3 mr-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
               </span>
               Running
            </div>
          }
          subtext="Group Unit 권상 해석" 
          icon={Server} 
          color="bg-blue-500"
          onClick={() => handleNavigation('/solver/job-manager')}
        />
        
        {/* Stat 2: Server Status */}
        <EngineeringStatCard 
          title="Server Status"
          titleKo="서버 내 진행 중 해석(건)" 
          value="8 Jobs" 
          subtext="Total Active Processes" 
          icon={Activity} 
          color="bg-emerald-500"
          onClick={() => handleNavigation('/solver/monitoring')}
        />

        {/* Stat 3: Monthly Usage */}
        <EngineeringStatCard 
          title="Monthly Usage" 
          titleKo="월간 사용량"
          value="42 Runs" 
          subtext="Total Executions" 
          icon={PlayCircle} 
          color="bg-indigo-500"
          onClick={() => handleNavigation('/post-process/reports')}
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* [Row 2] Admin Notice (관리자 공지사항) - 닫기 버튼 없음 */}
      {/* ----------------------------------------------------------------- */}
      <NoticeBanner />

      {/* ----------------------------------------------------------------- */}
      {/* [Row 3] Favorites (즐겨찾기) - 전체 너비 사용 */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Star size={16} className="text-yellow-500" fill="currentColor" /> Favorites
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FavoriteCard 
            title="Beam" 
            desc="Static / Transient" 
            icon={Layers} 
            color="bg-blue-600" 
          />
          <FavoriteCard 
            title="Truss" 
            desc="Heat Transfer" 
            icon={Thermometer} 
            color="bg-red-500" 
          />
          <FavoriteCard 
            title="Module" 
            desc="Fluid Dynamics" 
            icon={Wind} 
            color="bg-cyan-500" 
          />
          <FavoriteCard 
            title="Module" 
            desc="Load .wbpj" 
            icon={FolderOpen} 
            color="bg-slate-500" 
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* [Row 4] Recent Projects (최근 프로젝트) */}
      {/* ----------------------------------------------------------------- */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock size={16} /> Recent Projects
        </h2>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold w-24">ID</th>
                  <th className="py-3 px-4 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Modified</th>
                  <th className="py-3 px-4 font-semibold text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project, index) => (
                  <ProjectRow 
                    key={index}
                    id={project.id} 
                    name={project.name} 
                    type={project.type} 
                    status={project.status} 
                    date={project.date} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
