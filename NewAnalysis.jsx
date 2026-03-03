import React from 'react';
import { 
  Box, 
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
    className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col h-full"
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
      Start Setup <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
    </div>
  </div>
);

export default function NewAnalysis() {
  
  const handleStart = (type) => {
    alert(`${type} 해석 설정을 시작합니다.`);
    // 추후 세부 설정 페이지로 이동하는 로직 추가
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Section */}
      <div className="mb-10 text-center md:text-left">
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

      {/* 3. 해석 카테고리 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Category 1: Component Level */}
        <AnalysisCard 
          title="Truss 구조 해석"
          description="Truss의 Leg Lifting 상황에서 구조 해석을 수행합니다."
          icon={Box}
          color="bg-blue-600"
          tags={["Beam", "Bracket", "Joint"]}
          onClick={() => handleStart('Component')}
        />

        {/* Category 2: Unit & Block Level */}
        <AnalysisCard 
          title="Group & Unit 권상 구조 해석"
          description="Group 및 Module Unit 권상 시, 구조적 안전성을 검토합니다."
          icon={Layers}
          color="bg-emerald-600"
          tags={["Unit", "Block", "Local Strength"]}
          onClick={() => handleStart('Block')}
        />

        {/* Category 3: System & Equipment */}
        <AnalysisCard 
          title="Pipe 구조 해석"
          description="배관 시스템 구조 해석을 수행합니다."
          icon={Activity}
          color="bg-indigo-600"
          tags={["Pipe", "Foundation", "Vibration"]}
          onClick={() => handleStart('System')}
        />

        {/* Category 4: Global Ship Analysis */}
        <AnalysisCard 
          title="Whole Ship Analysis"
          description="선박 전체에 대한 전역 강도 및 항해 조건별 응답을 해석합니다."
          icon={Ship}
          color="bg-slate-800"
          tags={["Global", "Hull Girder", "Full Ship"]}
          onClick={() => handleStart('Global')}
        />

        {/* Category 5: Optimization Task */}
        <AnalysisCard 
          title="Optimization"
          description="중량 절감 및 구조 효율성 극대화를 위한 최적화 프로세스를 진행합니다."
          icon={ShieldCheck}
          color="bg-orange-600"
          tags={["Weight", "Topology", "Sensitivity"]}
          onClick={() => handleStart('Optimization')}
        />
      </div>

      {/* 4. 도움말 영역 */}
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
