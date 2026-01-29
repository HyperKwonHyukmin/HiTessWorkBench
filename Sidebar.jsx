import React from 'react';
import { 
  Home, Box, Layers, Activity, Play, 
  Database, Settings, ChevronLeft, ChevronRight,
  FileText, Cpu, ShieldAlert // 관리자용 아이콘 추가
} from 'lucide-react';

export default function Sidebar({ isCollapsed, toggleSidebar, isAdmin }) { // [수정] isAdmin prop 추가
  
  // 기본 메뉴
  const menuItems = [
    { category: "MAIN", items: [
      { icon: Home, label: "Dashboard", active: true },
      { icon: Box, label: "Projects" },
    ]},
    { category: "PRE-PROCESS", items: [
      { icon: Layers, label: "Modeling" },
      { icon: Database, label: "Materials" },
    ]},
    { category: "SOLVER", items: [
      { icon: Cpu, label: "Job Manager" },
      { icon: Activity, label: "Monitoring" },
    ]},
    { category: "POST-PROCESS", items: [
      { icon: FileText, label: "Reports" },
    ]}
  ];

  // [수정] 관리자인 경우 메뉴 추가
  if (isAdmin) {
    menuItems.push({
      category: "ADMINISTRATION", // 관리자 전용 카테고리
      items: [
        { icon: ShieldAlert, label: "Admin Test Page" },
        { icon: Settings, label: "User Management" }
      ]
    });
  }

  return (
    <aside 
      className={`h-screen bg-[#002554] text-white flex flex-col transition-all duration-300 shadow-xl z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. 로고 영역 */}
      <div className="h-16 flex items-center justify-center border-b border-[#003366] relative">
        {isCollapsed ? (
          <span className="text-xl font-bold text-[#00E600]">H</span>
        ) : (
          <h1 className="text-xl font-bold tracking-wider">
            HiTESS <span className="text-[#00E600] text-sm font-light">WB</span>
          </h1>
        )}
      </div>

      {/* 2. 네비게이션 메뉴 */}
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
              {section.items.map((item, i) => (
                <li key={i}>
                  <button className={`w-full flex items-center px-4 py-3 transition-colors relative group ${
                    item.active 
                      ? 'bg-[#00E600] text-[#002554] font-bold' 
                      : 'text-slate-300 hover:bg-[#003366] hover:text-white'
                  }`}>
                    {item.active && isCollapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E600]"></div>
                    )}
                    
                    <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                       <item.icon size={20} />
                    </div>
                    
                    {!isCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-full top-2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* 3. 하단 설정 및 토글 버튼 */}
      <div className="p-4 border-t border-[#003366] bg-[#001f45]">
        <button 
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded bg-[#003366] hover:bg-[#004080] text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
