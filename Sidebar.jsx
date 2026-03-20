import React, { useState, useEffect } from 'react';
import { 
  Home,           // Dashboard
  UploadCloud,    // File-Based Analysis
  PenTool,        // Interactive Apps
  FolderOpen,     // My Project
  Megaphone,      // Notice & Updates
  Lightbulb,      // Feature Requests
  BookOpen,       // User Guide
  Bot,            // AI Lab Assistant (LLM 챗봇)
  Library,        // Knowledge Archive
  Settings,       // User Management
  ChevronLeft, 
  ChevronRight,
  ShieldAlert     // Admin Mode
} from 'lucide-react';

export default function Sidebar({ isCollapsed, toggleSidebar, isAdmin, currentMenu, setCurrentMenu }) {
  
  // ✅ 연구실 소속 여부를 판단할 상태 추가
  const [isResearchLab, setIsResearchLab] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // DB 스키마에 따라 department 또는 company 필드에 저장된 소속을 확인합니다.
        // 만약 필드명이 다르면 user.부서필드명 === '구조시스템연구실' 로 변경하게나.
        if (user.department === '구조시스템연구실' || user.company === '구조시스템연구실') {
          setIsResearchLab(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse user info in Sidebar:", error);
    }
  }, []);

  // ✅ 기본적으로 모두에게 보이는 메뉴 (1, 2, 3번)
  const menuItems = [
    { 
      category: "WORKBENCH", 
      items: [
        { icon: Home, label: "Dashboard" },
      ]
    },
    { 
      category: "ANALYSIS", 
      items: [
        { icon: UploadCloud, label: "File-Based Analysis" },
        { icon: PenTool, label: "Interactive Apps" },
        { icon: FolderOpen, label: "My Projects" }, 
      ]
    },
    { 
      category: "SUPPORT & COMMUNITY", 
      items: [
        { icon: Megaphone, label: "Notice & Updates" },
        { icon: Lightbulb, label: "Feature Requests" },
        { icon: BookOpen, label: "User Guide" },
      ]
    }
  ];

  // ✅ 4. RESEARCH & AI (구조시스템연구실 소속에게만 추가)
  if (isResearchLab) {
    menuItems.push({
      category: "RESEARCH & AI", 
      items: [
        { icon: Bot, label: "AI Lab Assistant" },
        { icon: Library, label: "Knowledge Archive" },
      ]
    });
  }

  // ✅ 5. ADMINISTRATION (관리자 권한이 있을 때만 추가)
  if (isAdmin) {
    menuItems.push({
      category: "ADMINISTRATION", 
      items: [
        { icon: ShieldAlert, label: "Admin Test Page" },
        { icon: Settings, label: "User Management" }
      ]
    });
  }

  return (
    <aside className={`h-full bg-[#002554] text-white flex flex-col transition-all duration-300 shadow-xl z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
      
      {/* 로고 영역 */}
      <div className="h-16 flex items-center justify-center border-b border-[#003366] relative">
        {isCollapsed ? (
          <span className="text-xl font-bold text-[#00E600]">H</span>
        ) : (
          <h1 className="text-xl font-bold tracking-wider">
            HiTESS <span className="text-[#00E600] text-sm font-light">WB</span>
          </h1>
        )}
      </div>

      {/* 메뉴 렌더링 영역 */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <div className={`px-6 mb-2 text-xs font-bold uppercase tracking-wider ${
                section.category === "ADMINISTRATION" ? "text-red-400" : "text-slate-400"
              }`}>
                {section.category}
              </div>
            )}
            <ul>
              {section.items.map((item, i) => {
                const isActive = currentMenu === item.label;

                return (
                  <li key={i}>
                    <button 
                      onClick={() => setCurrentMenu(item.label)} 
                      className={`w-full flex items-center px-4 py-3 transition-colors relative group cursor-pointer ${
                        isActive 
                          ? 'bg-[#00E600] text-[#002554] font-bold' 
                          : 'text-slate-300 hover:bg-[#003366] hover:text-white'
                      }`}
                    >
                      {isActive && isCollapsed && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E600]"></div>
                      )}
                      
                      <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                         <item.icon size={20} />
                      </div>
                      
                      {!isCollapsed && (
                        <span className="text-sm">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 접기/펴기 버튼 */}
      <div className="p-4 border-t border-[#003366] bg-[#001f45]">
        <button onClick={toggleSidebar} className="w-full flex items-center justify-center p-2 rounded bg-[#003366] hover:bg-[#004080] text-white transition-colors cursor-pointer">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
