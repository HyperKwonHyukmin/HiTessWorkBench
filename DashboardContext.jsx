import React, { createContext, useState, useEffect, useContext } from 'react';
import { Layers, Ruler, Ship, Activity, ShieldCheck } from 'lucide-react';

// 1. 해석 모듈 기본 데이터 (NewAnalysis와 Dashboard가 모두 사용하기 위해 여기서 관리)
export const ANALYSIS_DATA = [
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
    description: "Group 및 Module Unit 권상 시, 구조적 안성을 검토합니다.",
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

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  // 2. 실시간 통계 상태
  const [stats, setStats] = useState({
    activeTasks: 1,
    runningOnServer: 8,
    monthlyUsage: 42
  });

  // 3. 즐겨찾기 상태 (타이틀만 배열로 저장)
  const [favorites, setFavorites] = useState(["1D Beam 구조 해석"]);

  // 4. 실시간 통계 시뮬레이션 (실제 백엔드 API 연동 전까지 5초마다 변동)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeTasks: Math.floor(Math.random() * 5) + 1,
        runningOnServer: Math.floor(Math.random() * 15),
        monthlyUsage: prev.monthlyUsage + Math.floor(Math.random() * 2)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 5. 즐겨찾기 토글 함수
  const toggleFavorite = (title) => {
    setFavorites(prev => 
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <DashboardContext.Provider value={{ stats, favorites, toggleFavorite }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
