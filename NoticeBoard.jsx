/// <summary>
/// 공지사항 및 업데이트 내역을 표시하는 페이지입니다.
/// 관리자(is_admin = true)만 '새 공지 작성' 버튼에 접근할 수 있습니다.
/// </summary>
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, ChevronRight, Pin } from 'lucide-react';

export default function NoticeBoard() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsAdmin(JSON.parse(storedUser).is_admin);
    }
  }, []);

  const notices = [
    { id: 1, type: 'Update', title: 'Hi-TESS WorkBench v1.0.1 업데이트 안내', date: '2026-03-18', isPinned: true },
    { id: 2, type: 'Notice', title: '정기 서버 점검 안내 (3/22 00:00~04:00)', date: '2026-03-15', isPinned: true },
    { id: 3, type: 'Update', title: 'Truss 해석 모듈 성능 개선', date: '2026-03-10', isPinned: false },
    { id: 4, type: 'Notice', title: '신규 사용 등록 절차 변경 안내', date: '2026-03-01', isPinned: false },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002554] flex items-center gap-3">
            <Megaphone className="text-blue-500" size={32} /> Notice & Updates
          </h1>
          <p className="text-slate-500 mt-2">시스템 업데이트 내역 및 중요 공지사항을 확인하세요.</p>
        </div>
        {/* 관리자에게만 버튼 노출 */}
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#002554] text-white rounded-lg text-sm font-bold hover:bg-[#003366] transition-colors shadow-md cursor-pointer">
            <Plus size={18} /> 새 공지 작성
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex bg-slate-50 px-6 py-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-20 text-center">Type</div>
          <div className="flex-1">Title</div>
          <div className="w-32 text-center">Date</div>
        </div>
        <div className="divide-y divide-slate-100">
          {notices.map(notice => (
            <div key={notice.id} className="flex px-6 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="w-20 flex justify-center">
                {notice.isPinned ? (
                  <Pin size={16} className="text-red-500 fill-red-100" />
                ) : (
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                    notice.type === 'Update' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {notice.type}
                  </span>
                )}
              </div>
              <div className="flex-1 px-4">
                <span className={`font-bold ${notice.isPinned ? 'text-[#002554]' : 'text-slate-700'} group-hover:text-blue-600 transition-colors`}>
                  {notice.title}
                </span>
              </div>
              <div className="w-32 text-center text-sm text-slate-400 font-mono">
                {notice.date}
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
