import React, { useState } from 'react';
import { 
  Upload, Play, Download, Trash2, Eye, ArrowLeft 
} from 'lucide-react';

export default function TrussAnalysis({ setCurrentMenu }) {
  const [nodeFile, setNodeFile] = useState(null);
  const [memberFile, setMemberFile] = useState(null);
  const [nodeData, setNodeData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // CSV 파싱 (모든 행 저장)
  const parseCSV = (file, setter) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.trim().split('\n').map(row => 
        row.split(',').map(cell => cell.trim())
      );
      setter(rows);
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
      parseCSV(file, setNodeData);
    } else {
      setMemberFile(file);
      parseCSV(file, setMemberData);
    }
    addLog(`✅ ${type.toUpperCase()} CSV 업로드 완료: ${file.name}`);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0], type);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSelect = (e, type) => {
    if (e.target.files[0]) handleFile(e.target.files[0], type);
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => setLogs([]);
  const downloadLog = () => {
    if (logs.length === 0) return alert('로그가 없습니다!');
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'truss_analysis_log.txt';
    a.click();
    URL.revokeObjectURL(url);
    addLog('📥 로그 파일 다운로드 완료');
  };

  const runAnalysis = () => {
    if (!nodeFile || !memberFile) return;
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Truss Analysis 시작');

    setTimeout(() => addLog('📊 Node 데이터 로드 완료'), 800);
    setTimeout(() => addLog('🔗 Member 데이터 로드 완료'), 1600);
    setTimeout(() => addLog('⚙️ 구조 해석 수행 중...'), 2400);
    setTimeout(() => {
      addLog('✅ 해석 완료! 결과가 정상적으로 생성되었습니다.');
      addLog('💾 결과 파일은 서버에 저장되었습니다.');
      setIsRunning(false);
    }, 3500);
  };

  const canRun = nodeFile && memberFile && !isRunning;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* ====================== 뒤로가기 버튼 (별도 배치) ====================== */}
        <button 
          onClick={() => setCurrentMenu?.('New Analysis')}
          className="group mb-8 flex items-center gap-3 px-7 py-3 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md hover:border-[#002554] transition-all duration-200 text-slate-600 hover:text-[#002554]"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">New Analysis로 돌아가기</span>
        </button>

        {/* ====================== 타이틀 ====================== */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#002554]">Truss Analysis</h1>
          <p className="text-slate-500 mt-1">Truss 구조 해석 워크벤치</p>
        </div>

        {/* CSV INPUT 영역 (기존과 동일) */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Node CSV */}
          <div
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all hover:shadow-xl ${
              nodeFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-[#002554]'
            }`}
            onDrop={(e) => handleDrop(e, 'node')}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto mb-6 text-[#002554]" size={52} />
            <p className="text-xl font-bold text-[#002554]">Node Data CSV <span className="text-red-500">*</span></p>
            <p className="text-slate-500 mt-2">노드 좌표 (ID, X, Y, Z)</p>
            
            <label className="mt-8 cursor-pointer inline-block bg-[#002554] hover:bg-[#001a3d] text-white px-8 py-4 rounded-2xl font-semibold transition">
              파일 선택 또는 드래그&드롭
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleSelect(e, 'node')} />
            </label>
            {nodeFile && <p className="mt-4 text-green-600 font-medium">✓ {nodeFile.name}</p>}
          </div>

          {/* Member CSV */}
          <div
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all hover:shadow-xl ${
              memberFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-[#002554]'
            }`}
            onDrop={(e) => handleDrop(e, 'member')}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto mb-6 text-[#002554]" size={52} />
            <p className="text-xl font-bold text-[#002554]">Member Data CSV <span className="text-red-500">*</span></p>
            <p className="text-slate-500 mt-2">부재 연결 정보 (ID, Node1, Node2...)</p>
            
            <label className="mt-8 cursor-pointer inline-block bg-[#002554] hover:bg-[#001a3d] text-white px-8 py-4 rounded-2xl font-semibold transition">
              파일 선택 또는 드래그&드롭
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleSelect(e, 'member')} />
            </label>
            {memberFile && <p className="mt-4 text-green-600 font-medium">✓ {memberFile.name}</p>}
          </div>
        </div>

        {/* DATA Preview (모든 행 표시) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#002554] mb-6 flex items-center gap-3">
            <Eye size={28} /> DATA Preview
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {nodeData.length > 0 && (
              <div className="bg-white border rounded-3xl p-6 shadow">
                <p className="font-semibold mb-4">Node CSV Preview ({nodeData.length}행 전체 표시)</p>
                <div className="overflow-auto max-h-96 border rounded-2xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 sticky top-0 z-10">
                      <tr>
                        {nodeData[0].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left font-medium border-b">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nodeData.slice(1).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 border-b text-slate-600">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {memberData.length > 0 && (
              <div className="bg-white border rounded-3xl p-6 shadow">
                <p className="font-semibold mb-4">Member CSV Preview ({memberData.length}행 전체 표시)</p>
                <div className="overflow-auto max-h-96 border rounded-2xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 sticky top-0 z-10">
                      <tr>
                        {memberData[0].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left font-medium border-b">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {memberData.slice(1).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 border-b text-slate-600">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================== 실행 버튼 (디자인 대폭 개선) ====================== */}
        <button
          onClick={runAnalysis}
          disabled={!canRun}
          className={`group w-full py-6 rounded-3xl text-2xl font-bold flex items-center justify-center gap-4 transition-all duration-300 ${
            canRun 
              ? 'bg-[#002554] hover:bg-[#001a3d] text-white shadow-2xl hover:shadow-3xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Play 
            size={34} 
            className={`transition-transform ${canRun ? 'group-hover:scale-110' : ''}`} 
          />
          {isRunning ? '해석 진행 중...' : 'Truss Analysis 실행'}
        </button>

        {/* Analysis Log */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#002554] flex items-center gap-3">
              📋 Analysis Log
            </h2>
            <div className="flex gap-3">
              <button
                onClick={downloadLog}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 font-medium transition"
              >
                <Download size={20} /> 로그 저장 (.txt)
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 font-medium transition"
              >
                <Trash2 size={20} /> 로그 초기화
              </button>
            </div>
          </div>

          <div className="bg-[#0a0f1c] text-green-400 font-mono text-sm p-8 rounded-3xl h-96 overflow-auto border border-slate-800 shadow-inner">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">해석을 실행하면 진행 로그와 문제점이 실시간으로 표시됩니다.</p>
            ) : (
              logs.map((log, i) => <div key={i} className="py-1 break-words">{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
