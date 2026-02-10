import React, { useState } from 'react';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

const APP_STATE = {
  SPLASH: 'splash',
  LOGIN: 'login',
  MAIN: 'main'
};

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 세션 정보 삭제 (사번 저장 기능인 savedEmployeeId는 남겨둠)
    localStorage.removeItem('user');
    setAppState(APP_STATE.LOGIN);
  };

  return (
    <>
      {/* 1. Splash */}
      {appState === APP_STATE.SPLASH && (
        <SplashScreen onFinish={() => setAppState(APP_STATE.LOGIN)} />
      )}
      
      {/* 2. Login */}
      {appState === APP_STATE.LOGIN && (
        <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />
      )}

      {/* 3. Main */}
      {appState === APP_STATE.MAIN && (
        // [수정] onLogout prop 전달
        <Layout onLogout={handleLogout}>
          <Dashboard />
        </Layout>
      )}
    </>
  );
}

export default App;
