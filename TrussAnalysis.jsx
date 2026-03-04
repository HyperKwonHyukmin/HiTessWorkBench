import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Upload, FileSpreadsheet, Play, 
  Activity, CheckCircle, AlertCircle, RefreshCw, 
  Database, Settings, ChevronRight
} from 'lucide-react';

export default function TrussAnalysis({ setCurrentMenu }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0: 대기, 1: 업로드완료, 2: 해석중, 3: 완료
  const fileInputRef = useRef(null);

  // [Mock] 해석 설정 파라미터
  const [params, setParams] = useState({
    solver: 'Nastran',
    material: 'Steel (Structural)',
    unit: 'mm / N / MPa'
  });

  // 파일 업로드 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setIsUploading(true);
      // 가상의 업로드 딜레이
      setTimeout(() => {
        setFile(selectedFile);
        setIsUploading(false);
        setAnalysisStep(1);
      }, 800);
    } else {
      alert("CSV 파일만 업로드 가능합니다.");
    }
  };

  // 해석 실행 핸들러
  const handleRunAnalysis = () => {
    if (!file) return alert("먼저 CSV 데이터를 업로드해주세요.");
    
    setIsAnalyzing(true);
    setAnalysisStep(2);

    // 가상의 해석 프로세스 진행
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStep(3);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 h-full flex flex-col animate-fade-in-up">
      
      {/* 1. 상단 헤더 및 뒤로가기 */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentMenu('New Analysis')}
          className="p-2 bg-white border border-gray-200 rounded-lg text-slate-500 hover:text-[#002554] hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#002554] flex items-center gap-2">
            Truss Model Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">Truss 설계 정보를 활용하여 Truss의 구조 해석 모델을 구축합니다.</p>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 (2단 분리) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* 좌측: 입력 및 설정 패널 */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* CSV 업로드 카드 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database size={18} className="text-blue-500"/> CSV Input
            </h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
              />
              
              {isUploading ? (
                <RefreshCw className="animate-spin text-blue-500 mb-3" size={32} />
              ) : file ? (
                <FileSpreadsheet className="text-green-500 mb-3" size={32} />
              ) : (
                <Upload className="text-slate-400 mb-3" size={32} />
              )}
              
              <p className="text-sm font-bold text-slate-700">
                {file ? file.name : "클릭하여 CSV 파일 업로드"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {file ? "데이터 로드 완료" : "Nodes & Elements 정의 파일 (.csv)"}
              </p>
            </div>
          </div>

          {/* 해석 설정 카드 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings size={18} className="text-slate-500"/> Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Solver Engine</label>
                <select 
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                  value={params.solver}
                  onChange={(e) => setParams({...params, solver: e.target.value})}
                >
                  <option>Nastran</option>
                  <option>OptiStruct</option>
                  <option>Abaqus</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Material Property</label>
                <select 
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                >
                  <option>Steel (Structural) - AH36</option>
                  <option>High Tensile Steel - DH36</option>
                  <option>Aluminum Alloy</option>
                </select>
              </div>
            </div>
          </div>

          {/* 실행 버튼 */}
          <button 
            onClick={handleRunAnalysis}
            disabled={!file || isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-lg ${
              !file 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : isAnalyzing 
                  ? 'bg-blue-600 text-white cursor-wait'
                  : 'bg-[#002554] hover:bg-[#003366] text-white hover:-translate-y-1'
            }`}
          >
            {isAnalyzing ? (
              <><RefreshCw className="animate-spin" size={20} /> Solving...</>
            ) : analysisStep === 3 ? (
              <><CheckCircle size={20} className="text-[#00E600]" /> Analysis Complete</>
            ) : (
              <><Play size={20} fill="currentColor" /> Run Simulation</>
            )}
          </button>
        </div>

        {/* 우측: 데이터 뷰어 및 콘솔 영역 */}
        <div className="w-full lg:w-2/3 bg-[#0F172A] rounded-2xl shadow-xl border border-slate-700 flex flex-col overflow-hidden relative">
          
          {/* 상태 바 */}
          <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
             <div className="flex items-center gap-2">
               <span className="flex h-3 w-3 relative">
                 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${analysisStep === 2 ? 'bg-[#00E600]' : 'hidden'}`}></span>
                 <span className={`relative inline-flex rounded-full h-3 w-3 ${analysisStep === 0 ? 'bg-slate-500' : analysisStep === 2 ? 'bg-[#00E600]' : 'bg-blue-500'}`}></span>
               </span>
               <span className="text-xs font-mono text-slate-300">
                 {analysisStep === 0 ? 'Awaiting Data...' : analysisStep === 1 ? 'Ready to Solve' : analysisStep === 2 ? 'Engine Running' : 'Process Finished'}
               </span>
             </div>
             <div className="text-xs text-slate-500 font-mono">Job ID: {file ? 'TRUSS-2026-001' : 'NONE'}</div>
          </div>

          {/* 뷰어 영역 (Mock 데이터 시각화) */}
          <div className="flex-1 p-6 relative">
             {analysisStep === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="font-mono text-sm">No workspace data. Upload CSV to preview.</p>
               </div>
             )}

             {analysisStep > 0 && (
               <div className="h-full flex flex-col">
                 <h4 className="text-[#00E600] text-xs font-bold uppercase tracking-widest mb-3">Data Preview</h4>
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-1 flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full text-left text-xs font-mono text-slate-300">
                     <thead className="bg-slate-800 text-slate-400 sticky top-0">
                       <tr>
                         <th className="p-2">ID</th>
                         <th className="p-2">Type</th>
                         <th className="p-2">X</th>
                         <th className="p-2">Y</th>
                         <th className="p-2">Z</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700/50">
                       <tr><td className="p-2">1</td><td className="p-2">GRID</td><td className="p-2">0.0</td><td className="p-2">0.0</td><td className="p-2">0.0</td></tr>
                       <tr><td className="p-2">2</td><td className="p-2">GRID</td><td className="p-2">1500.0</td><td className="p-2">0.0</td><td className="p-2">0.0</td></tr>
                       <tr><td className="p-2">3</td><td className="p-2">GRID</td><td className="p-2">750.0</td><td className="p-2">1000.0</td><td className="p-2">0.0</td></tr>
                       <tr><td className="p-2 text-[#00E600]">101</td><td className="p-2 text-[#00E600]">CBAR</td><td colSpan="3" className="p-2 opacity-50">Node 1 - Node 2</td></tr>
                       <tr><td className="p-2 text-[#00E600]">102</td><td className="p-2 text-[#00E600]">CBAR</td><td colSpan="3" className="p-2 opacity-50">Node 2 - Node 3</td></tr>
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
          </div>

          {/* 로그 콘솔 */}
          <div className="h-48 bg-black border-t border-slate-700 p-4 font-mono text-xs overflow-y-auto">
            <p className="text-slate-500">{'>'} HiTESS Subsystem Initialized.</p>
            {analysisStep >= 1 && <p className="text-blue-400">{'>'} CSV Data parsed successfully. (Nodes: 3, Elements: 2)</p>}
            {analysisStep >= 2 && <p className="text-yellow-400">{'>'} Submitting job to {params.solver} solver...</p>}
            {analysisStep >= 3 && (
              <>
                <p className="text-slate-300">{'>'} Matrix decomposition complete.</p>
                <p className="text-[#00E600] font-bold mt-2">{'>'} SOLUTION COMPLETED SUCCESSFULLY.</p>
                <p className="text-slate-400">{'>'} Max displacement: 2.41mm / Max Stress: 112.5 MPa</p>
                <button 
                  onClick={() => setCurrentMenu('Result Viewer')}
                  className="mt-3 flex items-center text-[#002554] bg-[#00E600] hover:bg-green-400 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                >
                  View Results in Post-Processor <ChevronRight size={14} className="ml-1"/>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
