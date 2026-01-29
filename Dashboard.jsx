import React from 'react';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  MoreVertical, 
  Cpu, 
  HardDrive, 
  Activity,
  FileText,
  PlayCircle
} from 'lucide-react';

/**
 * 1. 통계 카드 컴포넌트
 * - 주요 지표를 직관적으로 보여줍니다.
 */
const StatCard = ({ title, value, unit, subtext, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <div className="mt-3 flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
      </div>
      <p className="mt-1 text-xs text-gray-400">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

/**
 * 2. 프로젝트 리스트 행 컴포넌트
 * - 상태(Status)에 따라 배지 색상이 변합니다.
 */
const ProjectRow = ({ id, name, type, status, date }) => {
  // 상태별 스타일 매핑
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
          <FileText size={16} className="text-slate-400 mr-2" />
          <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">
            {name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{type}</td>
      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[status] || statusStyles.Draft}`}>
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-400 text-right">{date}</td>
      <td className="py-3 px-4 text-center">
        <button className="text-gray-300 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
};

/**
 * 메인 대시보드 컴포넌트
 */
export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. 상단 환영 메시지 및 날짜 */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your analysis projects and system status.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">System Ready</p>
          <p className="text-sm text-gray-400 font-mono">v1.0.0-beta</p>
        </div>
      </div>

      {/* 2. 주요 통계 (Stats Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Projects" 
          value="12" 
          subtext="+2 this week" 
          icon={FolderOpen} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Solver" 
          value="1" 
          unit="Job Running" 
          subtext="Est. 15 min left" 
          icon={Activity} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="CPU Usage" 
          value="34" 
          unit="%" 
          subtext="8 Cores Active" 
          icon={Cpu} 
          color="bg-violet-500" 
        />
        <StatCard 
          title="Disk Space" 
          value="450" 
          unit="GB" 
          subtext="Free of 1TB" 
          icon={HardDrive} 
          color="bg-amber-500" 
        />
      </div>

      {/* 3. 퀵 액션 버튼 영역 */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 mr-2">Quick Actions:</span>
          
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium">
            <Plus size={16} />
            <span>New Analysis</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium">
            <FolderOpen size={16} />
            <span>Open Project</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
           <button className="text-sm text-slate-500 hover:text-blue-600 underline decoration-blue-200 underline-offset-4">
            Manage Solver Queue
           </button>
        </div>
      </div>

      {/* 4. 최근 프로젝트 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Clock size={18} className="mr-2 text-slate-400" />
            Recent Projects
          </h3>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition-colors">
            View All Projects
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold w-24">ID</th>
                <th className="py-3 px-4 font-semibold">Project Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Last Modified</th>
                <th className="py-3 px-4 font-semibold text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <ProjectRow 
                id="PRJ-004" 
                name="Wing_Structure_V2_Opt" 
                type="Static Structural" 
                status="Solving" 
                date="Just now" 
              />
              <ProjectRow 
                id="PRJ-003" 
                name="Landing_Gear_Assembly" 
                type="Modal Analysis" 
                status="Completed" 
                date="2 hours ago" 
              />
              <ProjectRow 
                id="PRJ-002" 
                name="Fuselage_Section_A" 
                type="Thermal Transient" 
                status="Failed" 
                date="Yesterday" 
              />
              <ProjectRow 
                id="PRJ-001" 
                name="Bracket_Optimization_Base" 
                type="Static Structural" 
                status="Draft" 
                date="3 days ago" 
              />
            </tbody>
          </table>
        </div>
        {/* 테이블 하단 페이징 영역 (예시) */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-right">
          <span className="text-xs text-gray-400">Showing 4 of 12 projects</span>
        </div>
      </div>
    </div>
  );
}
