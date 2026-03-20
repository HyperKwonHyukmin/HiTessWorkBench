/// <summary>
/// 플랫폼 사용법 및 도메인 지식을 제공하는 가이드 문서 페이지입니다.
/// 관리자(is_admin = true)만 문서를 편집하거나 추가할 수 있습니다.
/// </summary>
import React, { useState, useEffect } from 'react';
import { BookOpen, Edit3, Search, FileText } from 'lucide-react';

export default function UserGuide() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsAdmin(JSON.parse(storedUser).is_admin);
    }
  }, []);

  const categories = ["Getting Started", "Analysis Modules", "Result Interpretation", "Troubleshooting"];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in-up">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#002554] flex items-center gap-3">
            <BookOpen className="text-indigo-500" size={32} /> User Guide
          </h1>
          <p className="text-slate-500 mt-2">시스템 매뉴얼 및 해석 기준 가이드라인을 확인하세요.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="문서 검색..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 shadow-sm" />
          </div>
          {/* 관리자에게만 편집 권한 부여 */}
          {isAdmin && (
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-md cursor-pointer">
              <Edit3 size={18} /> 가이드 편집
            </button>
          )}
        </div>
      </div>

      {/* 가이드 레이아웃 (좌측 메뉴, 우측 콘텐츠) */}
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto shrink-0 shadow-sm">
          {categories.map((cat, idx) => (
            <button key={idx} className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${idx === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 overflow-y-auto shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <FileText size={20} /> Getting Started
          </div>
          <h2 className="text-2xl font-extrabold text-[#002554] mb-6">Hi-TESS WorkBench 시작하기</h2>
          
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="mb-4">본 가이드는 Hi-TESS WorkBench의 기본 사용법과 초기 설정 방법을 안내합니다.</p>
            <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">1. 프로젝트 생성 (New Analysis)</h3>
            <p className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              좌측 메뉴에서 <strong>File-Based Analysis</strong> 또는 <strong>Interactive Apps</strong>를 클릭하여 수행하고자 하는 해석 모듈(Truss, Beam 등)을 선택합니다. 
              자주 사용하는 모듈은 별(★) 아이콘을 클릭하여 대시보드 즐겨찾기에 추가할 수 있습니다.
            </p>
            <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">2. 파일 업로드 및 해석 실행</h3>
            <p className="mb-4">
              요구되는 CSV 형식의 파일(Node, Member 등)을 드래그 앤 드롭으로 업로드한 후, <strong>Run Analysis</strong> 버튼을 클릭합니다.
              해석은 백그라운드 서버서 비동기로 수행되며, 대시보드나 My Projects에서 진행률을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
