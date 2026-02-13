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

// 앱의 전체 단계 정의
const APP_STATE = {
  SPLASH: 'splash',
  LOGIN: 'login',
  MAIN: 'main'
};

function App() {
  // 1. 앱 진행 상태 (스플래시 -> 로그인 -> 메인)
  const [appState, setAppState] = useState(APP_STATE.SPLASH);
  
  // 2. 메인 화면 내부의 현재 활성화된 메뉴 상태
  const [currentMenu, setCurrentMenu] = useState('Dashboard');

  /**
   * 스플래시 화면 종료 후 처리
   * 로컬 스토리지에 유저 정보가 있으면 바로 메인으로, 없으면 로그인으로 이동
   */
  const handleSplashFinish = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentMenu('Dashboard');
      setAppState(APP_STATE.MAIN);
    } else {
      setAppState(APP_STATE.LOGIN);
    }
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    setAppState(APP_STATE.LOGIN);
    setCurrentMenu('Dashboard'); // 로그아웃 시 메뉴 초기화
  };

  /**
   * 메뉴에 따른 실제 페이지 컴포넌트 렌더링 함수
   */
  const renderPage = () => {
    switch (currentMenu) {
      case 'Dashboard':
        return <Dashboard />;
      case 'My Project':
        return <MyProjects />;
      case 'New Analysis':
        return <NewAnalysis />;
      case 'Component Wizard': 
        return <ComponentWizard />;
      
      // 아직 구현되지 않은 페이지들을 위한 공통 가이드 화면
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
    <>
      {/* 1단계: 스플래시 화면 */}
      {appState === APP_STATE.SPLASH && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      
      {/* 2단계: 로그인 화면 */}
      {appState === APP_STATE.LOGIN && (
        <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />
      )}

      {/* 3단계: 메인 워크벤치 화면 (레이아웃 적용) */}
      {appState === APP_STATE.MAIN && (
        <Layout 
          onLogout={handleLogout} 
          currentMenu={currentMenu} 
          setCurrentMenu={setCurrentMenu}
        >
          {/* 현재 메뉴 상태에 맞는 페이지 출력 */}
          {renderPage()}
        </Layout>
      )}
    </>
  );
}

export default App;
