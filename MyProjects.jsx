import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Search, Filter, Download, FileText, 
  MoreVertical, ChevronRight, Box, 
  CheckCircle2, XCircle, Clock, AlertCircle,
  FileCode, Database, FileOutput, X
} from 'lucide-react';

/**
 * 상태 뱃지 (Status Badge)
 */
const StatusBadge = ({ status }) => {
  const styles = {
    Success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Solving: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Pending: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const icons = {
    Success: <CheckCircle2 size={12} className="mr-1" />,
    Solving: <Clock size={12} className="mr-1" />,
    Failed: <XCircle size={12} className="mr-1" />,
    Pending: <AlertCircle size={12} className="mr-1" />,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center w-fit ${styles[status] || styles.Pending}`}>
      {icons[status] || icons.Pending}
      {status}
    </span>
  );
};

// MyProjects.jsx 의 ProjectDetailModal 컴포넌트 부분을 통째로 아래 코드로 교체

const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  // ✅ 새 창이 뜨지 않는 비동기 파일 다운로드 방식 적용
  const handleDownload = async (filePath) => {
    if (!filePath) return;
    try {
      const url = `${API_BASE_URL}/api/download?filepath=${encodeURIComponent(filePath)}`;
      const response = await axios.get(url, { responseType: 'blob' });
      
      // 경로에서 파일명만 추출
      const filename = filePath.split('\\').pop().split('/').pop();
      
      // Blob 객체를 이용한 가상 링크 클릭 (팝업 창 방지)
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // 사용 후 메모리 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="bg-[#002554] p-6 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                ID: {project.id}
              </span>
              <span className="text-blue-200 text-xs">| {new Date(project.created_at).toLocaleString()}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{project.project_name || 'Unnamed Project'}</h2>
            <p className="text-blue-200 text-xs mt-1 font-mono">{project.program_name}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Analysis Status</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Execution Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Module</span>
              <div className="font-bold text-slate-700 flex items-center gap-2">
                <Box size={16} className="text-blue-500"/> {project.program_name}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Requester ID</span>
              <div className="font-bold text-slate-700">{project.employee_id}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Execution Date</span>
              <div className="text-slate-700 font-bold text-sm">{new Date(project.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Input Files */}
          {project.input_info && Object.keys(project.input_info).length > 0 && (
            <>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 mt-4">Input Data (CSV)</h3>
              <div className="space-y-2 mb-6">
                {Object.entries(project.input_info).map(([key, path]) => (
                  <button 
                    key={key}
                    onClick={() => handleDownload(path)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Database size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-700 uppercase">{key}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-sm" title={path}>{path}</p>
                      </div>
                    </div>
                    <Download size={18} className="text-slate-300 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Result Files */}
          {project.status === 'Success' && project.result_info && Object.keys(project.result_info).length > 0 && (
            <>
              <h3 className="text-sm font-bold text-[#008233] uppercase tracking-wider mb-3">Analysis Results</h3>
              <div className="space-y-2">
                {Object.entries(project.result_info).map(([key, path]) => (
                  <button 
                    key={key}
                    onClick={() => handleDownload(path)}
                    className="w-full flex items-center justify-between p-4 border border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <FileOutput size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-700 uppercase">{key} File</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-sm">{path}</p>
                      </div>
                    </div>
                    <Download size={18} className="text-slate-300 group-hover:text-green-600" />
                  </button>
                ))}
              </div>
            </>
          )}

          {project.status === 'Failed' && (
             <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-red-700">Analysis Failed</h4>
                  <p className="text-xs text-red-600 mt-1">
                    해석 중 오류가 발생하여 결과 파일이 생성되지 않았습니다. System Console 로그를 확인해 주세요.
                  </p>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN PAGE: My Projects
 */
export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // 현재 사용자 이력 가져오기
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const employeeId = userStr ? JSON.parse(userStr).employee_id : null;
      
      if (!employeeId) {
        console.error("로그인 정보가 없습니다.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/analysis/history/${employeeId}`);
      setProjects(response.data);
    } catch (error) {
      console.error("이력 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 검색 필터링
  const filteredProjects = projects.filter(p => 
    (p.project_name && p.project_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.program_name && p.program_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your structural analysis history.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Project or Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full shadow-sm transition-all"
            />
          </div>
          <button onClick={fetchHistory} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer">
            <Filter size={16} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Project List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-20 text-center">No.</th>
                <th className="py-4 px-6 font-semibold">Project Name</th>
                <th className="py-4 px-6 font-semibold">Module (Type)</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Execution Date</th>
                <th className="py-4 px-6 font-semibold text-center w-16">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-400">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-sm font-bold">Loading Data...</p>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <tr 
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 font-bold text-center">
                      {project.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-100 rounded text-slate-400 mr-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Box size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">
                            {project.project_name || 'Unnamed Project'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {project.program_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 text-right font-mono">
                      {new Date(project.created_at).toLocaleString()}
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
                  <td colSpan="6" className="py-20 text-center text-slate-400">
                    <FileCode size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">실행된 해석 이력이 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Modal */}
      <ProjectDetailModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </div>
  );
}
