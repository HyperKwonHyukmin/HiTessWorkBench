import React, { useState } from 'react';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import MyProjects from './pages/MyProjects';
import NewAnalysis from './pages/NewAnalysis';
import Layout from './components/Layout';
import { Wand2 } from 'lucide-react';
import ComponentWizard from './pages/ComponentWizard';
import { DashboardProvider } from './contexts/DashboardContext';
import InteractiveApps from './pages/InteractiveApps';

import NoticeBoard from './pages/Support/NoticeBoard';
import UserGuide from './pages/Support/UserGuide';
import TrussAnalysis from './pages/TrussAnalysis'; 

// ✅ 이름이 변경된 컴포넌트 임포트
import UserRequests from './pages/Support/UserRequests'; 

// ✅ 관리자 메뉴 2종 임포트
import UserManagement from './pages/Administration/UserManagement'; 
import SystemSettings from './pages/Administration/SystemSettings'; 

const APP_STATE = { SPLASH: 'splash', LOGIN: 'login', MAIN: 'main' };

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);
  const [history, setHistory] = useState(['Dashboard']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMenu = history[currentIndex];

  const setCurrentMenu = (menu) => {
    const newHistory = history.slice(0, currentIndex + 1);
    if (newHistory[newHistory.length - 1] !== menu) { 
      newHistory.push(menu);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };

  const goBack = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const goForward = () => { if (currentIndex < history.length - 1) setCurrentIndex(currentIndex + 1); };

  const handleSplashFinish = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentMenu('Dashboard');
      setAppState(APP_STATE.MAIN);
    } else {
      setAppState(APP_STATE.LOGIN);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAppState(APP_STATE.LOGIN);
    setHistory(['Dashboard']);
    setCurrentIndex(0);
  };

  const renderPage = () => {
    switch (currentMenu) {
      case 'Dashboard': return <Dashboard setCurrentMenu={setCurrentMenu} />;
      case 'My Project':
      case 'My Projects': return <MyProjects setCurrentMenu={setCurrentMenu} />;
      case 'New Analysis':
      case 'File-Based Analysis': return <NewAnalysis setCurrentMenu={setCurrentMenu} />;
      case 'Truss Analysis': return <TrussAnalysis setCurrentMenu={setCurrentMenu} />;
      case 'Interactive Apps': return <InteractiveApps setCurrentMenu={setCurrentMenu} />;
      case 'Component Wizard':
      case 'Simple Beam Analyzer': return <ComponentWizard />;
        
      case 'Notice & Updates': return <NoticeBoard />;
      // ✅ FeatureRequests -> UserRequests 로 변경 반영
      case 'Feature Requests': 
      case 'User Requests': return <UserRequests />;
      case 'User Guide': return <UserGuide />;
      
      // ✅ 관리자 메뉴 분리 라우팅
      case 'User Management': return <UserManagement />;
      case 'System Settings': return <SystemSettings />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="p-6 bg-slate-100 rounded-full mb-4">
              <Wand2 size={48} className="opacity-20" />
            </div>
            <p className="text-lg font-bold text-slate-600">"{currentMenu}"</p>
            <p className="text-sm">해당 페이지는 현재 시스템 최적화 및 개발 진행 중입니다.</p>
            <button 
              onClick={() => setCurrentMenu('Dashboard')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              대시보드로 돌아가기
            </button>
          </div>
        );
    }
  };

  return (
    <DashboardProvider>
      {appState === APP_STATE.SPLASH && <SplashScreen onFinish={handleSplashFinish} />}
      {appState === APP_STATE.LOGIN && <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />}
      {appState === APP_STATE.MAIN && (
        <Layout 
          onLogout={handleLogout} currentMenu={currentMenu} setCurrentMenu={setCurrentMenu}
          goBack={goBack} goForward={goForward} canGoBack={currentIndex > 0} canGoForward={currentIndex < history.length - 1}
        >
          {renderPage()}
        </Layout>
      )}
    </DashboardProvider>
  );
}

export default App;
