// src/App.jsx
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

  return (
    <>
      {/* 1. Splash: 전체 화면 (Layout 없음) */}
      {appState === APP_STATE.SPLASH && (
        <SplashScreen onFinish={() => setAppState(APP_STATE.LOGIN)} />
      )}
      
      {/* 2. Login: 전체 화면, 2분할 레이아웃 (Layout 없음) */}
      {appState === APP_STATE.LOGIN && (
        <LoginScreen onLoginSuccess={() => setAppState(APP_STATE.MAIN)} />
      )}

      {/* 3. Main: 여기서부터 'Layout(사이드바)'이 감싸줍니다. */}
      {appState === APP_STATE.MAIN && (
        <Layout>
          <Dashboard />
        </Layout>
      )}
    </>
  );
}

export default App;
