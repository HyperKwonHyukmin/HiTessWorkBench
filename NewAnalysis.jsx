import React, { useState } from 'react';
import { 
  ArrowRight, 
  Info,
  Zap,
  ShieldCheck,
  Compass,
  Star // ✅ 즐겨찾기 별 아이콘 추가
} from 'lucide-react';

// ✅ 전역 상태(Context) 및 메타데이터 임포트
// (주의: 이전 가이드에서 생성한 DashboardContext.jsx 파일 위치에 맞게 경로를 조정하게)
import { useDashboard, ANALYSIS_DATA } from '../contexts/DashboardContext'; 

/**
 * [Component] 해석 선택 카드 (즐겨찾기 토글 기능 포함)
 */
const AnalysisCard = ({ title, description, icon: Icon, color, tags, isFav, onToggleFav, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col h-full animate-fade-in-up"
  >
    {/* ✅ 즐겨찾기(Star) 버튼 영역 */}
    <button 
      onClick={(e) => {
        e.stopPropagation(); // 부모(카드)의 onClick 이벤트(페이지 이동)가 실행되지 않도록 이벤트 버블링 방지
        onToggleFav();
      }}
      className="absolute top-6 right-6 z-10 text-slate-300 hover:scale-110 transition-transform outline-none cursor-pointer"
      title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
    >
      <Star 
        size={24} 
        fill={isFav ? "#eab308" : "transparent"} // 활성화 시 노란색 채우기
        color={isFav ? "#eab308" : "currentColor"} // 활성화 시 테두리 노란색
      />
    </button>

    {/* 상단 아이콘 영역 */}
    <div className={`w-14 h-14 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className={`${color.replace('bg-', 'text-')}`} size={28} />
    </div>

    {/* 텍스트 영역 */}
    <div className="flex-1">
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        {description}
      </p>

      {/* 태그 영역 */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* 화살표 버튼 */}
    <div className="mt-8 flex items-center text-blue-600 font-bold text-sm">
      Start <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
    </div>
  </div>
);

// 필터링할 대분류 탭 목록
const CATEGORIES = ["All", "Truss", "1D Beam", "권상", "Pipe", "Global", "ETC"];

export default function NewAnalysis({ setCurrentMenu }) {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // ✅ Context API에서 즐겨찾기 상태와 토글 함수 꺼내기
  const { favorites, toggleFavorite } = useDashboard();

  const handleStart = (categoryTitle) => {
    if (categoryTitle === "Truss Model Builder") {
      setCurrentMenu('Truss Analysis');
    } else if (categoryTitle === "1D Beam 구조 해석") {
      // 1D Beam 구조 해석 클릭 시 Component Wizard로 이동하도록 매핑
      setCurrentMenu('Component Wizard'); 
    } else {
      alert(`${categoryTitle} 해석 설정 시작합니다.`);
    }
  };

  // 현재 활성화된 카테고리에 맞춰 데이터 필터링
  const filteredAnalyses = activeCategory === "All" 
    ? ANALYSIS_DATA 
    : ANALYSIS_DATA.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create New Analysis</h1>
        <p className="text-slate-500 mt-2">수행하고자 하는 해석의 대상과 유형을 택하십시오.</p>
      </div>

      {/* 2. 안내 배너 */}
      <div className="bg-blue-600 rounded-2xl p-6 mb-10 text-white flex items-center justify-between shadow-lg shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap size={20} className="text-yellow-300" />
            Quick Start Tip
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            간단한 빔(Beam)이나 정반(Plate) 해석은 <strong className="text-white">Standard Tools &gt; Component Wizard</strong>를 이용하면 더 빠릅니다.
          </p>
        </div>
        <Compass size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
      </div>

      {/* 3. 카테고리 필터 탭 (대분류) */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-200 pb-5">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`cursor-pointer px-6 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all duration-200 ${
              activeCategory === category
                ? 'bg-[#002554] text-white shadow-md border border-[#002554]'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 shadow-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 4. 해석 카테고리 그리드 (필터링된 결과 렌더링) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAnalyses.map((item, index) => (
          <AnalysisCard 
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            color={item.color}
            tags={item.tags}
            // ✅ 재 아이템의 타이틀이 favorites 배열에 있으면 true
            isFav={favorites.includes(item.title)} 
            // ✅ 별 클릭 시 실행될 토글 함수 연결
            onToggleFav={() => toggleFavorite(item.title)} 
            onClick={() => handleStart(item.title)} 
          />
        ))}
      </div>

      {/* 5. 도움말 영역 */}
      <div className="mt-16 bg-slate-100 rounded-2xl p-8 border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-white rounded-full shadow-sm text-blue-600">
          <Info size={32} />
        </div>
        <div>
          <h3 className="font-bold text-slate-700">도움이 필요하신가요?</h3>
          <p className="text-sm text-slate-500 mt-1">
            해석 유형 선택이 어렵다면 사내 기술 표준 가이드를 참고하거나 시스템 솔루션 팀에 문의하십시오.
          </p>
        </div>
        <button className="md:ml-auto px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          View Guide
        </button>
      </div>

    </div>
  );
}
