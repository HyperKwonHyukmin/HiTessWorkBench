import React, { createContext, useState, useEffect, useContext } from 'react';
import { Layers, Ruler, Ship, Activity, ShieldCheck, Box, Square } from 'lucide-react';

// ✅ 'mode' 속성을 추가하여 File-Based와 Interactive를 구분
export const ANALYSIS_DATA = [
  // --- [1] File-Based Analysis (기존 파일 업로드 방식) ---
  {
    mode: "File",
    category: "Truss",
    title: "Truss Model Builder",
    description: "Truss 설계 정보를 활용하여 Truss의 구조 해석 모델을 구축합니다.",
    icon: Layers,
    color: "bg-cyan-600",
    tags: ["Truss", "ModelBuilder"]
  },
  {
    mode: "File",
    category: "권상",
    title: "Group & Unit 권상 구조 해석",
    description: "Group 및 Module Unit 권상 시, 구조적 안전성을 검토합니다.",
    icon: Layers,
    color: "bg-emerald-600",
    tags: ["Unit", "Block", "Local Strength"]
  },
  {
    mode: "File",
    category: "Pipe",
    title: "Pipe 구조 해석",
    description: "배관 시스템 구조 해석을 수행합니다.",
    icon: Activity,
    color: "bg-indigo-600",
    tags: ["Pipe", "Foundation", "Vibration"]
  },
  {
    mode: "File",
    category: "Global",
    title: "Whole Ship Analysis",
    description: "선박 전체에 대한 전역 강도 및 항해 조건별 응답을 해석합니다.",
    icon: Ship,
    color: "bg-slate-800",
    tags: ["Global", "Hull Girder", "Full Ship"]
  },
  {
    mode: "File",
    category: "ETC",
    title: "Optimization",
    description: "중량 절감 및 구조 효율성 극대화를 위한 최적화 프로세스를 진행합니다.",
    icon: ShieldCheck,
    color: "bg-orange-600",
    tags: ["Weight", "Topology", "Sensitivity"]
  },

  // --- [2] Interactive Apps (웹 기반 템플릿 방식) ---
  {
    mode: "Interactive",
    category: "1D Beam",
    title: "Simple Beam Analyzer", // ✅ 기존 Component Wizard
    description: "단면 형상과 치수를 직접 입력하여 단순 보(Beam)의 응력 및 처짐을 즉각 평가합니다.",
    icon: Ruler,
    color: "bg-blue-600",
    tags: ["1D Element", "Bending", "Real-time"]
  },
  {
    mode: "Interactive",
    category: "Lifting",
    title: "Lifting Lug Evaluator",
    description: "Lifting Lug의 치수와 하중을 입력하여 러그 구조 강도를 즉각 평가합니다.",
    icon: Box,
    color: "bg-emerald-600",
    tags: ["Lug", "Lifting", "Real-time"]
  },
  {
    mode: "Interactive",
    category: "Plate",
    title: "2D Plate Analyzer",
    description: "평판의 두께와 보강재를 설정하여 좌굴 및 국부 강도를 평가합니다.",
    icon: Square,
    color: "bg-indigo-600",
    tags: ["Plate", "Buckling", "Real-time"]
  }
];

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [stats, setStats] = useState({ activeTasks: 1, runningOnServer: 8, monthlyUsage: 42 });
  
  // ✅ 기본 즐겨찾기에 Simple Beam Analyzer 추가
  const [favorites, setFavorites] = useState(["Simple Beam Analyzer", "Truss Model Builder"]); 

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

  const toggleFavorite = (title) => {
    setFavorites(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <DashboardContext.Provider value={{ stats, favorites, toggleFavorite }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
