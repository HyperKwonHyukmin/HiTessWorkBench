import React, { useState } from 'react';
import { 
  Network,      // Truss 구조 해석용 아이콘
  Ruler,        // 1D Beam 구조 해석용 아이콘
  Combine,
  Layers, 
  Ship, 
  Activity, 
  ArrowRight, 
  Info,
  Zap,
  ShieldCheck,
  Compass

} from 'lucide-react';

/**
 * [Component] 해석 선택 카드
 */
const AnalysisCard = ({ title, description, icon: Icon, color, tags, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col h-full animate-fade-in-up"
  >
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

// ----------------------------------------------------------------------
// [Data] 해석 종류별 데이터 정의
// ----------------------------------------------------------------------
const ANALYSIS_DATA = [
  {
    category: "Truss",
    title: "Truss Model Builder",
    description: "Truss 설계 정보를 활용하여 Truss의 구조 해석 모델을 구축합니다.",
    icon: Layers,
    color: "bg-cyan-600",
    tags: ["Truss", "ModelBuilder"],
    type: "Component"
  },
  {
    category: "1D Beam",
    title: "1D Beam 구조 해석",
    description: "단순 보(Beam) 구조물에 대한 응력 및 처짐을 빠르게 평가합니다.",
    icon: Ruler,
    color: "bg-cyan-600",
    tags: ["1D Element", "Bending", "Shear"],
    type: "Component"
  },
  {
    category: "권상",
    title: "Group & Unit 권상 구조 해석",
    description: "Group 및 Module Unit 권상 시, 구조적 안전성을 검토합니다.",
    icon: Layers,
    color: "bg-emerald-600",
    tags: ["Unit", "Block", "Local Strength"],
    type: "Block"
  },
  {
    category: "Pipe",
    title: "Pipe 구조 해석",
    description: "배관 시스템 구조 해석을 수행합니다.",
    icon: Activity,
    color: "bg-indigo-600",
    tags: ["Pipe", "Foundation", "Vibration"],
    type: "System"
  },
  {
    category: "Global",
    title: "Whole Ship Analysis",
    description: "선박 전체에 대한 전역 강도 및 항해 조건별 응답을 해석합니다.",
    icon: Ship,
    color: "bg-slate-800",
    tags: ["Global", "Hull Girder", "Full Ship"],
    type: "Global"
  },
  {
    category: "ETC",
    title: "Optimization",
    description: "중량 절감 및 구조 효율성 극대화를 위한 최적화 프로세스를 진행합니다.",
    icon: ShieldCheck,
    color: "bg-orange-600",
    tags: ["Weight", "Topology", "Sensitivity"],
    type: "Optimization"
  }
];

// 필터링할 대분류 탭 목록
const CATEGORIES = ["All", "Truss", "1D Beam", "권상", "Pipe", "Global", "ETC"];

export default function NewAnalysis({ setCurrentMenu }) {
  const [activeCategory, setActiveCategory] = useState("All");

  // 매개변수 이름을 'categoryTitle'로 정의합니다.
  const handleStart = (categoryTitle) => {
    // Truss 구조 해석 카드를 클릭한 경우
    if (categoryTitle === "Truss Model Builder") {
      setCurrentMenu('Truss Analysis');
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
        <p className="text-slate-500 mt-2">수행하고자 하는 해석의 대상과 유형을 선택하십시오.</p>
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
            // [수정] cursor-pointer 클래스 추가
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
            onClick={() => handleStart(item.title)} // <-- item.title 전달로 변경
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
        <button className="md:ml-auto px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          View Guide
        </button>
      </div>

    </div>
  );
}
