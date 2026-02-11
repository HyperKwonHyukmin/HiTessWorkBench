import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar'; // Sidebar 컴포넌트 불러오기
import { LogOut, User, Bell, Search, Menu } from 'lucide-react';

export default function Layout({ children, onLogout }) {
  // 사이드바 접힘/펼침 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 로그인한 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: 'User',
    position: 'Engineer',
    is_admin: false
  });

  // 컴포넌트 로드 시 로컬 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user info:", error);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        isAdmin={userInfo.is_admin} 
      />

      {/* 2. 우측 메인 영역 (헤더 + 콘텐츠) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* 2-1. 상단 헤더 (Top Bar) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          
          {/* 좌측: 타이틀 또는 검색바 */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-700 hidden md:block">
              Workbench
            </h2>
            {/* 검색바 예시 (기능은 없음) */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
              />
            </div>
          </div>

          {/* 우측: 알림, 사용자 정보, 로그아웃 */}
          <div className="flex items-center gap-4">
            
            {/* 알림 버튼 */}
            <button className="p-2 text-gray-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* 구분선 */}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* 사용자 프로필 */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{userInfo.name}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{userInfo.position}</p>
              </div>
              <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 text-blue-700">
                <User size={18} />
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <button 
              onClick={onLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all tooltip"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* 2-2. 실제 페이지 콘텐츠 (Dashboard 등) */}
        {/* overflow-y-auto: 이 영역만 스크롤됨 */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8F9FC]">
          {children}
        </main>

      </div>
    </div>
  );
}
