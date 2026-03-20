import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  PlayCircle, MoreVertical, Activity, FileText, Layers,
  Server, BarChart3, CheckCircle2, ArrowUpRight, Megaphone, Star, CalendarDays, Database
} from 'lucide-react';
import { useDashboard, ANALYSIS_DATA } from '../contexts/DashboardContext';

// ---------------------------------------------------------
// UI Helper Components
// ---------------------------------------------------------
const EngineeringStatCard = ({ title, titleKo, value, subtext, icon: Icon, color }) => (
  <div className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
      <ArrowUpRight size={18} />
    </div>
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-[11px] text-gray-400 font-bold mt-0.5 mb-2">{titleKo}</p>
      <div className="mt-1 flex items-center space-x-2">
        <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</span>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-400">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
      <Icon size={22} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

const NoticeBanner = () => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm mb-6 relative overflow-hidden">
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
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-extrabold uppercase tracking-wide">Important</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">Hi-TESS WorkBench 개발 진행 중입니다.</p>
      </div>
    </div>
  </div>
);

const FavoriteCard = ({ title, icon: Icon, color, desc, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 hover:-translate-y-1 transition-all group w-full text-center h-full relative overflow-hidden cursor-pointer">
    <div className="absolute top-3 right-3 text-yellow-400">
      <Star size={16} fill="currentColor" />
    </div>
    <div className={`p-4 rounded-full ${color} text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon size={28} />
    </div>
    <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
    <p className="text-xs text-gray-400 mt-1 truncate max-w-full px-2">{desc}</p>
  </button>
);

const ProjectRow = ({ id, name, type, status, date }) => {
  const statusStyles = {
    Success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Failed: 'bg-red-100 text-red-700 border-red-200',
    Draft: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4 font-mono text-xs text-gray-500 text-center">{id}</td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <FileText size={16} className="text-slate-400 mr-2 group-hover:text-blue-600 transition-colors" />
          <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
            {name || 'Unnamed Project'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 font-mono">
        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{type}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyles[status] || statusStyles.Draft}`}>
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400 text-right">{new Date(date).toLocaleString()}</td>
      <td className="py-3 px-4 text-center">
        <button className="text-gray-300 hover:text-gray-600 cursor-pointer"><MoreVertical size={16} /></button>
      </td>
    </tr>
  );
};

// ---------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ---------------------------------------------------------
export default function Dashboard({ setCurrentMenu }) {
  const { favorites } = useDashboard();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queueStatus, setQueueStatus] = useState({ running: 0, pending: 0, limit: 2 });

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/system/queue-status`);
        setQueueStatus(res.data);
      } catch (error) {
        console.error("Queue Status fetch error", error);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const employeeId = userStr ? JSON.parse(userStr).employee_id : null;
        if (!employeeId) return;

        const response = await axios.get(`${API_BASE_URL}/api/analysis/history/${employeeId}`);
        const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProjects(sortedData);
      } catch (error) {
        console.error("이력 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalExecutions = projects.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyUsageCount = projects.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const handleFavoriteClick = (title) => {
      if (title === "Truss Model Builder") {
        setCurrentMenu('Truss Analysis');
      } else if (title === "Simple Beam Analyzer") {
        // ✅ "1D Beam 구조 해석" 대신 바뀐 타이틀로 라우팅
        setCurrentMenu('Simple Beam Analyzer'); 
      } else {
        alert(`[안내] ${title} 기능은 현재 준비 중입니다.`);
      }
    };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-fade-in-up">
      
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workbench Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Check your simulation status and system resources.</p>
        </div>
        <div className="text-right">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
             Engine Connected
           </span>
        </div>
      </div>

      {/* ✅ [수정됨] 통계 카드를 3개로 늘리고 1/3 로 분할 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        
        {/* ✅ [신규] 해석 서버 큐(Queue) 모니터링 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Server size={100} />
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-500" /> Analysis Server Load
          </h3>
          <p className="text-[11px] text-gray-400 font-bold mb-2">현재 서버 구동 현황</p>
          
          <div className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
            {queueStatus.running} <span className="text-sm text-slate-400 font-medium">/ {queueStatus.limit} Running</span>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full transition-all duration-500 ${queueStatus.running >= queueStatus.limit ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(queueStatus.running / queueStatus.limit) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <Activity size={14} className={queueStatus.pending > 0 ? "text-orange-500" : "text-slate-400"} />
            대기 중인 큐: 
            <span className={queueStatus.pending > 0 ? "text-orange-600" : "text-slate-500"}>
              {queueStatus.pending} 건
            </span>
          </div>
        </div>
        {/* ✅ (신규 카드 끝) */}

        <EngineeringStatCard 
          title="Monthly Usage" 
          titleKo="이번 달 사용량"
          value={`${monthlyUsageCount} 건`} 
          subtext="Executions this month" 
          icon={CalendarDays} 
          color="bg-indigo-500"
        />
        <EngineeringStatCard 
          title="Total Projects" 
          titleKo="총 해석 수행 건수"
          value={`${totalExecutions} 건`}
          subtext="Accumulated Executions" 
          icon={Database} 
          color="bg-blue-500"
        />
      </div>

      <NoticeBanner />

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Star size={16} className="text-yellow-500" fill="currentColor" /> My Favorites
        </h2>
        
        {favorites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-slate-400 text-sm shadow-sm flex flex-col items-center">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Star size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-500 mb-1">즐겨찾기 항목이 없습니다.</p>
            <p>New Analysis 메뉴에서 자주 사용하는 해석에 별(★)을 눌러 대시보드에 추가해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map(favTitle => {
              const analysisInfo = ANALYSIS_DATA.find(a => a.title === favTitle);
              if (!analysisInfo) return null;

              return (
                <FavoriteCard 
                  key={favTitle}
                  title={analysisInfo.title} 
                  desc={analysisInfo.description} 
                  icon={analysisInfo.icon} 
                  color={analysisInfo.color} 
                  onClick={() => handleFavoriteClick(analysisInfo.title)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} /> Recent Projects
          </h2>
          <button 
            onClick={() => setCurrentMenu('My Project')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View All History →
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold w-24 text-center">ID</th>
                  <th className="py-3 px-4 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Module (Type)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Execution Date</th>
                  <th className="py-3 px-4 font-semibold text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 text-sm">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                      <p>Loading History...</p>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 text-sm">
                      수행된 프로젝트 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  projects.slice(0, 5).map((project) => (
                    <ProjectRow 
                      key={project.id}
                      id={project.id} 
                      name={project.project_name} 
                      type={project.program_name} 
                      status={project.status} 
                      date={project.created_at} 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
