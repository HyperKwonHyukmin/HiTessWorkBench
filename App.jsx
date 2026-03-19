import React, { useState } from 'react';
// 페이지 컴포넌트 임포트
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import MyProjects from './pages/MyProjects';
import NewAnalysis from './pages/NewAnalysis';
import Layout from './components/Layout';
import { Wand2 } from 'lucide-react';
import ComponentWizard from './pages/ComponentWizard';
import { DashboardProvider } from './contexts/DashboardContext';

// 앱의 전체 단계 정의
const APP_STATE = {
  SPLASH: 'splash',
  LOGIN: 'login',
  MAIN: 'main'
};

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);
  
  // ✅ [수정됨] 단일 메뉴 상태를 히스토리 스택으로 확장
  const [history, setHistory] = useState(['Dashboard']);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 현재 화면은 히스토리 배열의 현재 인덱스에 위치한 메뉴
  const currentMenu = history[currentIndex];

  /**
   * 메뉴 이동 함수 (새로운 히스토리 추가)
   */
  const setCurrentMenu = (menu) => {
    // 현재 위치 이후의 미래 히스토리가 있다면 잘라내고 새 메뉴를 푸시
    const newHistory = history.slice(0, currentIndex + 1);
    
    // 연속해서 동일한 메뉴로 이동하는 것은 방지
    if (newHistory[newHistory.length - 1] !== menu) { 
      newHistory.push(menu);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };

  // ✅ 뒤로 가기 함수
  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // ✅ 앞으로 가기 함수
  const goForward = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(currentIndex + 1);
  };

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
    // 로그아웃 시 히스토리 초기화
    setHistory(['Dashboard']);
    setCurrentIndex(0);
  };

  const renderPage = () => {
    switch (currentMenu) {
      case 'Dashboard':
        return <Dashboard setCurrentMenu={setCurrentMenu} />;
      case 'My Project':
        return <MyProjects />;
      case 'New Analysis':
        return <NewAnalysis setCurrentMenu={setCurrentMenu} />;
      case 'Component Wizard': 
        return <ComponentWizard />;
      // Truss Analysis가 있으면 추가
      // case 'Truss Analysis': return <TrussAnalysis setCurrentMenu={setCurrentMenu} />;
      
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
              className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        );
    }
  };

  return (
    <DashboardProvider>
      {appState === APP_STATE.SPLASH && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      
      {appState === APP_STATE.LOGIN && (
        <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />
      )}

      {appState === APP_STATE.MAIN && (
        <Layout 
          onLogout={handleLogout} 
          currentMenu={currentMenu} 
          setCurrentMenu={setCurrentMenu}
          // ✅ Layout에 뒤로가기/앞으로가기 상태와 함수 전달
          goBack={goBack}
          goForward={goForward}
          canGoBack={currentIndex > 0}
          canGoForward={currentIndex < history.length - 1}
        >
          {renderPage()}
        </Layout>
      )}
    </DashboardProvider>
  );
}

export default App;
