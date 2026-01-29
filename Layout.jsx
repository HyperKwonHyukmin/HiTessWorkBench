import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, LogOut } from 'lucide-react'; // LogOut 아이콘 추가

export default function Layout({ children, onLogout }) { // [수정] onLogout prop 받기
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 사용자 정보 상태 (isAdmin 추가)
  const [userInfo, setUserInfo] = useState({ 
    name: '', 
    position: '', 
    isAdmin: false 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo({
        name: parsedUser.name || 'Unknown',
        position: parsedUser.position || 'Engineer',
        isAdmin: parsedUser.is_admin || false // [중요] DB에서 가져온 관리자 여부 확인
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* [수정] Sidebar에 isAdmin 정보 전달 */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isAdmin={userInfo.isAdmin}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 헤더 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          
          <h2 className="text-lg font-bold text-slate-800">
            Workbench Dashboard
          </h2>

          <div className="flex items-center space-x-4">
            {/* 검색창 */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-transparent focus-within:border-blue-500 transition-all">
              <Search size={16} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-transparent border-none outline-none text-sm text-slate-700 w-48 placeholder:text-gray-400"
              />
            </div>

            {/* 알림 */}
            <button className="relative p-2 text-gray-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            {/* 사용자 프로필 영역 */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors mr-2">
                <div className="w-8 h-8 bg-[#002554] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm relative">
                  {userInfo.name ? userInfo.name.charAt(0) : 'U'}
                  {/* [추가] 관리자일 경우 프로필에 작은 표시 (선택사항) */}
                  {userInfo.isAdmin && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div className="ml-2 hidden md:block text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-700">{userInfo.name}</p>
                    {/* [추가] 관리자 배지 표시 */}
                    {userInfo.isAdmin && (
                      <span className="bg-red-100 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-200">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{userInfo.position}</p>
                </div>
              </div>

              {/* [추가] 로그아웃 버튼 */}
              <button 
                onClick={onLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
