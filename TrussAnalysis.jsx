import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ArrowLeft, Upload, Play, Download, Trash2, Database,
  CheckCircle, RefreshCw, FileSpreadsheet, Terminal, Layers,
  Box, GitMerge, CheckCircle2, AlertCircle, Maximize2, X, FileText
} from 'lucide-react';

export default function TrussAnalysis({ setCurrentMenu }) {
  // 상태 관리
  const [nodeFile, setNodeFile] = useState(null);
  const [memberFile, setMemberFile] = useState(null);
  const [nodeData, setNodeData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [logs, setLogs] = useState([]); // 요약 로그 (System Console)
  const [detailedLogs, setDetailedLogs] = useState([]); // 상세 로그 (Raw Data)
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('node'); 
  
  // 모달 상태
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  const logEndRef = useRef(null);

  const numNodes = nodeData.length > 1 ? nodeData.length - 1 : 0;
  const numMembers = memberData.length > 1 ? memberData.length - 1 : 0;
  const isDataReady = numNodes > 0 && numMembers > 0;

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const parseCSV = (file, setter, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.trim().split('\n')
        .filter(row => row.trim() !== '') 
        .map(row => row.split(',').map(cell => cell.trim()));
      setter(rows);
      addLog(`[DATA] ${type.toUpperCase()} 데이터 로드 완료 (${rows.length - 1}행)`, 'info');
      
      // 상세 로그에 백그라운드 작업 내역 추가 (가상)
      addDetailedLog(`READING CSV FILE: ${file.name}`);
      addDetailedLog(`PARSING ${rows.length - 1} DATA ENTRIES... OK`);
      addDetailedLog(`CHECKING DATA INTEGRITY... NO NULL VALUES FOUND.`);
    };
    reader.readAsText(file);
  };

  const handleFile = (file, type) => {
    if (!file || !file.name.endsWith('.csv')) {
      alert('CSV 파일만 업로드 가능합니다!');
      return;
    }
    if (type === 'node') {
      setNodeFile(file);
      parseCSV(file, setNodeData, type);
    } else {
      setMemberFile(file);
      parseCSV(file, setMemberData, type);
    }
    setActiveTab(type);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0], type);
  };

  // System Console용 요약 로그 추가
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, message, type }]);
  };

  // 상세 분석용 Raw 로그 추가
  const addDetailedLog = (message) => {
    const time = new Date().toISOString();
    setDetailedLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setDetailedLogs([]);
  };

  const downloadSummaryLog = () => {
    if (logs.length === 0) return alert('다운로드할 로그가 없습니다.');
    const logText = logs.map(l => `[${l.time}] ${l.message}`).join('\n');
    downloadFile(logText, `Summary_Log_${new Date().getTime()}.txt`);
  };

  const downloadDetailedLog = () => {
    if (detailedLogs.length === 0) return alert('상세 로그가 없습니다.');
    const logText = detailedLogs.join('\n');
    downloadFile(logText, `Detailed_Raw_Log_${new Date().getTime()}.out`);
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runAnalysis = () => {
    if (!nodeFile || !memberFile) return;
    setIsRunning(true);
    setLogs([]);
    setDetailedLogs([]); // 실행 시 초기화
    
    // 요약 그
    addLog('System Check OK. Preparing Truss Analysis Job...', 'info');
    
    // 상세 로그 스트림 흉내내기
    addDetailedLog('*** HITESS WORKBENCH SOLVER START ***');
    addDetailedLog(`NODES: ${numNodes}, ELEMENTS: ${numMembers}`);
    addDetailedLog('CHECKING ELEMENT CONNECTIVITY... OK');
    addDetailedLog('GENERATING DEGREES OF FREEDOM (DOF)...');

    setTimeout(() => {
      addLog('Building Global Stiffness Matrix...', 'warning');
      addDetailedLog('ASSEMBLING GLOBAL STIFFNESS MATRIX [K]...');
      for(let i=1; i<=5; i++) addDetailedLog(`  -> Matrix block ${i}/5 processed.`);
    }, 1000);

    setTimeout(() => {
      addLog('Applying Boundary Conditions...', 'warning');
      addDetailedLog('WARNING: Node 15 has rigid body motion potential. Applying weak spring.');
      addDetailedLog('APPLYING CONSTRAINTS TO MATRIX...');
    }, 2000);

    setTimeout(() => {
      addLog('Solving Linear Equations...', 'warning');
      addDetailedLog('SOLVING [K]{U} = {F} USING SPARSE DIRECT SOLVER...');
      addDetailedLog('ITERATION 1... CONVERGED.');
    }, 3000);

    setTimeout(() => {
      addLog('ANALYSIS COMPLETED SUCCESSFULLY.', 'success');
      addLog('Result files (.op2, .h5) have been generated.', 'info');
      addDetailedLog('COMPUTING STRESS/STRAIN RECOVERY...');
      addDetailedLog('MAXIMUM DISPLACEMENT: 2.35 mm at Node 42');
      addDetailedLog('MAXIMUM VON MISES STRESS: 145.2 MPa at Element 108');
      addDetailedLog('*** HITESS WORKBENCH SOLVER FINISHED NORMALLY ***');
      setIsRunning(false);
    }, 4500);
  };

  const canRun = nodeFile && memberFile && !isRunning;

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto animate-fade-in-up pb-6">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentMenu('New Analysis')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#002554] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#002554] tracking-tight">Truss Analysis Workspace</h1>
            <p className="text-sm text-slate-500 mt-1">Node 및 Member CSV 데이터를 기반으로 구조 해석을 실행합니다.</p>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* ================= LEFT PANE: Inputs & Summary ================= */}
        <div className="w-full lg:w-[400px] flex flex-col gap-5 shrink-0 overflow-y-auto pr-1 custom-scrollbar">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={16} className="text-blue-500"/> 1. Data Input
            </h3>
            <div className="space-y-4">
              <UploadDropzone type="node" title="Node Data" file={nodeFile} rowCount={numNodes} onDrop={(e) => handleDrop(e, 'node')} onChange={(e) => handleFile(e.target.files[0], 'node')} />
              <UploadDropzone type="member" title="Member Data" file={memberFile} rowCount={numMembers} onDrop={(e) => handleDrop(e, 'member')} onChange={(e) => handleFile(e.target.files[0], 'member')} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Box size={16} className="text-slate-500"/> 2. Model Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><GitMerge size={16} className="text-indigo-400" /> Total Nodes</div>
                <span className="font-mono font-bold text-[#002554]">{numNodes.toLocaleString()} EA</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><Layers size={16} className="text-cyan-400" /> Total Members</div>
                <span className="font-mono font-bold text-[#002554]">{numMembers.toLocaleString()} EA</span>
              </div>
              <div className={`mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed text-sm font-bold transition-colors ${isDataReady ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-300 text-slate-500'}`}>
                {isDataReady ? <><CheckCircle2 size={18} /> Ready to Analyze</> : <><AlertCircle size={18} /> Awaiting CSV Data</>}
              </div>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={!canRun}
            className={`mt-2 w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
              !canRun ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : isRunning ? 'bg-blue-600 text-white cursor-wait' : 'bg-[#002554] hover:bg-[#003366] text-white hover:-translate-y-1 cursor-pointer'
            }`}
          >
            {isRunning ? <RefreshCw className="animate-spin" size={24} /> : <Play size={24} fill="currentColor" />}
            {isRunning ? 'Solving...' : 'Run Truss Analysis'}
          </button>
        </div>

        {/* ================= RIGHT PANE: Preview & Console ================= */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-4 gap-2">
              <TabButton active={activeTab === 'node'} onClick={() => setActiveTab('node')} icon={Database} label="Node Preview" count={numNodes} />
              <TabButton active={activeTab === 'member'} onClick={() => setActiveTab('member')} icon={Layers} label="Member Preview" count={numMembers} />
            </div>
            <div className="flex-1 overflow-auto bg-white custom-scrollbar relative">
              {activeTab === 'node' ? <DataTable data={nodeData} emptyMsg="Node CSV 파일을 업로드하면 데이터를 미리볼 수 있습니다." /> : <DataTable data={memberData} emptyMsg="Member CSV 파일을 업로드하면 데이터를 미리볼 수 있습니다." />}
            </div>
          </div>

          {/* Execution Console */}
          <div className="h-64 bg-[#0F172A] rounded-2xl shadow-xl border border-slate-700 flex flex-col overflow-hidden shrink-0">
            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">System Console</span>
              </div>
              <div className="flex gap-3">
                {/* 상세 로그 버튼 추가 */}
                <button onClick={() => setIsLogModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold cursor-pointer bg-blue-900/30 px-2 py-1 rounded">
                  <Maximize2 size={12}/> 상세 로그 보기
                </button>
                <button onClick={downloadSummaryLog} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"><Download size={14}/> Save</button>
                <button onClick={clearLogs} className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"><Trash2 size={14}/> Clear</button>
              </div>
            </div>
            
            <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-slate-600">Waiting for analysis execution...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-[#00E600] font-bold' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'}`}>
                    <span className="text-slate-500 mr-3">[{log.time}]</span>
                    {log.message}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      </div>

      {/* ================= 상세 로그 모달 (Detailed Log Modal) ================= */}
      <Transition appear show={isLogModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsLogModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-5xl h-[80vh] flex flex-col transform overflow-hidden rounded-2xl bg-[#0F172A] text-left align-middle shadow-2xl transition-all border border-slate-700">
                  
                  {/* 모달 헤더 */}
                  <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
                    <Dialog.Title as="h3" className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="text-blue-400" /> Detailed Analysis Log (Raw)
                    </Dialog.Title>
                    <div className="flex items-center gap-4">
                      <button onClick={downloadDetailedLog} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                        <Download size={16} /> Download .out
                      </button>
                      <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  {/* 모달 바디 (로그 텍스트) */}
                  <div className="flex-1 p-6 overflow-auto bg-black font-mono text-xs text-slate-300 custom-scrollbar whitespace-pre-wrap leading-relaxed">
                    {detailedLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>No detailed logs generated yet.</p>
                      </div>
                    ) : (
                      detailedLogs.map((log, index) => {
                        // 로그 내용에 따라 색상 하이라이팅
                        let textColor = "text-slate-300";
                        if (log.includes("WARNING")) textColor = "text-yellow-400";
                        if (log.includes("ERROR") || log.includes("FATAL")) textColor = "text-red-400 font-bold";
                        if (log.includes("SUCCESSFULLY") || log.includes("NORMALLY")) textColor = "text-[#00E600] font-bold";
                        
                        return <div key={index} className={textColor}>{log}</div>;
                      })
                    )}
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}

// ================= UI Components (동일 유지) =================

function UploadDropzone({ type, title, file, rowCount, onDrop, onChange }) {
  const inputRef = useRef(null);
  const isUploaded = !!file;

  return (
    <div 
      onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
      className={`relative p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        isUploaded ? 'border-[#00E600]/50 bg-green-50/30' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
      }`}
    >
      <input type="file" accept=".csv" className="hidden" ref={inputRef} onChange={onChange} />
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${isUploaded ? 'bg-[#00E600]/20 text-[#00E600]' : 'bg-slate-100 text-slate-400'}`}>
          {isUploaded ? <FileSpreadsheet size={24} /> : <Upload size={24} />}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-bold text-slate-700">{title}</h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {isUploaded ? file.name : 'Click or drag file here'}
          </p>
        </div>
        {isUploaded && (
          <div className="text-right">
            <CheckCircle size={18} className="text-[#00E600] inline-block mb-1" />
            <p className="text-[10px] font-bold text-slate-400">{rowCount > 0 ? `${rowCount} Rows` : 'Empty'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer ${
        active ? 'bg-white text-[#002554] border-t-2 border-t-[#002554]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon size={16} /> {label}
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
        {count}
      </span>
    </button>
  );
}

function DataTable({ data, emptyMsg }) {
  if (!data || data.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
        <Database size={48} className="mb-4 opacity-20" />
        <p className="text-sm">{emptyMsg}</p>
      </div>
    );
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <table className="w-full text-left text-sm font-mono whitespace-nowrap">
      <thead className="sticky top-0 bg-white shadow-sm z-10">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-3 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50">
            {row.map((cell, j) => (
              <td key={j} className="px-6 py-2 text-slate-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
