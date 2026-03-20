/// <summary>
/// 사용자가 자유롭게 기능 추가나 버그 수정을 요청할 수 있는 게시판입니다.
/// 모든 사용자가 '새 요청 작성' 버튼을 사용할 수 있습니다.
/// </summary>
import React from 'react';
import { Lightbulb, Plus, ThumbsUp, MessageCircle } from 'lucide-react';

export default function FeatureRequests() {
  const requests = [
    { id: 1, author: '김선임', title: 'Pipe 해석 결과 단면력 다이어그램 추가 요청', status: 'In Progress', upvotes: 12, comments: 3 },
    { id: 2, author: '이책임', title: '다크모드 지원해주시면 감사하겠습니다.', status: 'Under Review', upvotes: 8, comments: 1 },
    { id: 3, author: '박연구원', title: 'Truss 노드 데이터 엑셀(xlsx) 직접 업로드 기능', status: 'Planned', upvotes: 5, comments: 2 },
  ];

  const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Under Review': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Planned': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002554] flex items-center gap-3">
            <Lightbulb className="text-yellow-500" size={32} /> Feature Requests
          </h1>
          <p className="text-slate-500 mt-2">필요한 기능이나 개선사항을 제안해 주세요. 모든 사용자가 작성할 수 있습니다.</p>
        </div>
        {/* 누구나 작성 가능 */}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00E600] text-[#002554] rounded-lg text-sm font-bold hover:bg-[#00c200] transition-colors shadow-md cursor-pointer">
          <Plus size={18} /> 새 요청 작성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#00E600] transition-all cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[req.status]}`}>
                {req.status}
              </span>
              <span className="text-xs text-slate-400 font-bold">{req.author}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex-1 line-clamp-2">{req.title}</h3>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                  <ThumbsUp size={16} /> <span className="text-sm font-bold">{req.upvotes}</span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageCircle size={16} /> <span className="text-sm font-bold">{req.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
