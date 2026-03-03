import React from 'react';
import { 
  Home,           // Dashboard
  FolderOpen,     // My Project
  PlusCircle,     // New Analysis
  Wand2,          // Component Wizard
  Monitor,        // Result Viewer
  FileText,       // Reports
  MoreHorizontal, // ETC
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,     // Admin Mode
  Settings
} from 'lucide-react';

/**
 * Sidebar 컴포넌트
 * @param {boolean} isCollapsed - 사이드바 접힘 상태
 * @param {function} toggleSidebar - 접힘 상태 토글 함수
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} currentMenu - 현재 활성화된 메뉴 이름
 * @param {function} setCurrentMenu - 메뉴 변경 함수
 */
export default function Sidebar({ isCollapsed, toggleSidebar, isAdmin, currentMenu, setCurrentMenu }) {
  
  // 메뉴 구조 설정
  const menuItems = [
    { 
      category: "WORKBENCH", 
      items: [
        { icon: Home, label: "Dashboard" },
        // [변경] My Project를 여기서 제거함
      ]
    },
    { 
      category: "ANALYSIS", 
      items: [
        { icon: PlusCircle, label: "New Analysis" },
        { icon: FolderOpen, label: "My Project" }, // [이동 완료] New Analysis 밑으로 이동
      ]
    },
    { 
      category: "STANDARD TOOLS", 
      items: [
        { icon: Wand2, label: "Component Wizard" },
      ]
    },
    { 
      category: "POST-PROCESS", 
      items: [
        { icon: Monitor, label: "Result Viewer" },
        { icon: FileText, label: "Reports" },
      ]
    },
    { 
      category: "SETTINGS", 
      items: [
        { icon: MoreHorizontal, label: "ETC" },
      ]
    }
  ];

  // 관리자 모드 추가
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
      <div className="h-16 flex items-center justify-center border-b border-[#003366] relative">
        {isCollapsed ? (
          <span className="text-xl font-bold text-[#00E600]">H</span>
        ) : (
          <h1 className="text-xl font-bold tracking-wider">
            HiTESS <span className="text-[#00E600] text-sm font-light">WB</span>
          </h1>
        )}
      </div>

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
                // [핵심 2] 현 선택된 메뉴인지 판별
                const isActive = currentMenu === item.label;

                return (
                  <li key={i}>
                    <button 
                      // [핵심 3] 클릭 시 currentMenu 상태 업데이트
                      onClick={() => setCurrentMenu(item.label)} 
                      className={`w-full flex items-center px-4 py-3 transition-colors relative group ${
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

      <div className="p-4 border-t border-[#003366] bg-[#001f45]">
        <button onClick={toggleSidebar} className="w-full flex items-center justify-center p-2 rounded bg-[#003366] hover:bg-[#004080] text-white transition-colors">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
