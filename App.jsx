// 파일 위치: src/App.jsx
import React, { useState } from 'react';
// 경로가 정확해야 합니다!
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout'; // 방금 수정한 Layout 컴포넌트 불러오기

const APP_STATE = {
  SPLASH: 'splash',
  LOGIN: 'login',
  MAIN: 'main'
};

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);

  const handleSplashFinish = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAppState(APP_STATE.MAIN);
    } else {
      setAppState(APP_STATE.LOGIN);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAppState(APP_STATE.LOGIN);
  };

  return (
    <>
      {appState === APP_STATE.SPLASH && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      
      {appState === APP_STATE.LOGIN && (
        <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />
      )}

      {appState === APP_STATE.MAIN && (
        <Layout onLogout={handleLogout}>
          <Dashboard />
        </Layout>
      )}
    </>
  );
}

export default App;
