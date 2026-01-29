import React, { useState } from 'react';
import { User, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import logoCI from '../assets/images/HHI_white2_ko.png';
import RegisterModal from '../components/RegisterModal';

// 배경 이미지
const structureBgUrl = "https://images.unsplash.com/photo-1553653841-453082536a9d?q=80&w=1000&auto=format&fit=crop";

export default function LoginScreen({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 모달 열림/닫힘 상태 관리
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // 입력값 변경 핸들러 (디버깅용 로그 포함)
  const handleInputChange = (e) => {
    setEmployeeId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 로그인 API 호출
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        employee_id: employeeId
      });

      console.log('Login Success:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      onLoginSuccess(); // 메인 화면으로 이동

    } catch (error) {
      console.error('Login Error:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMsg("등록되지 않은 사번입니다.");
        } 
        else if (error.response.status === 403) {
          setErrorMsg("PENDING_APPROVAL"); // 승인 대기 상태
        }
        else {
          setErrorMsg(`로그인 오류: ${error.response.status}`);
        }
      } else if (error.request) {
        setErrorMsg("서버에 접속할 수 없습니다.");
      } else {
        setErrorMsg("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-brand-gray font-sans overflow-hidden relative">
      
      {/* 1. 좌측 브랜딩 패널 (w-1/3) */}
      <div className="hidden lg:flex w-1/3 relative flex-col p-12 text-white overflow-hidden" style={{ backgroundColor: '#002554' }}>
        
        {/* 배경 이미지 (z-0) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={structureBgUrl} alt="Structure" className="w-full h-full object-cover opacity-50 mix-blend-overlay grayscale contrast-125 transform scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#002554]/90 via-[#002554]/40 to-[#002554]/90"></div>
        </div>

        {/* 중앙 컨텐츠 영역 (z-10) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pointer-events-none">
           <div className="mb-8">
             <img src={logoCI} alt="HD Hyundai CI" className="h-10 w-auto object-contain" />
           </div>
           <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-md">
            HiTESS <br/> <span style={{ color: '#00E600' }}>WorkBench</span>
          </h1>
          <div className="h-1.5 w-20 bg-[#008233] mt-8 rounded-full"></div>
        </div>

        {/* 하단 Footer 텍스트 */}
        <div className="relative z-10 mt-auto pointer-events-none">
           <h3 className="text-lg font-bold mb-2 text-white">System Solution Team</h3>
           <p className="text-gray-300 text-xs font-light leading-relaxed">Structural System Research Department<br/>Hyundai Maritime Research Institute</p>
        </div>
      </div>

      {/* 2. 우측 로그인 폼 (z-50: 최상단 배치로 입력 보장) */}
      <div className="flex-1 flex flex-col justify-center items-center p-10 bg-white shadow-xl relative z-50">
        <div className="w-full max-w-sm space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Hi-TESS Access</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">사번을 입력하여 접속하십시오.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 에러 및 상태 메시지 */}
            {errorMsg && (
              <div className={`p-4 rounded-lg border flex items-start animate-pulse ${
                errorMsg === "PENDING_APPROVAL" 
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700" 
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {errorMsg === "PENDING_APPROVAL" ? (
                  <Clock className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  {errorMsg === "PENDING_APPROVAL" ? (
                    <div>
                      <span className="font-bold block text-sm">승인 대기 중입니다.</span>
                      <span className="text-xs opacity-90">관리자 승인 후 접속 가능합니다.</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold block">{errorMsg}</span>
                  )}

                  {errorMsg.includes("등록되지 않은") && (
                     <button 
                       type="button"
                       onClick={() => setIsRegisterOpen(true)}
                       className="mt-2 w-full py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded transition-colors cursor-pointer"
                     >
                       신규 회원가입 진행하기
                     </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#003087] uppercase mb-2">Employee ID</label>
                <div className="relative group z-10"> {/* 입력창 그룹 z-index 추가 */}
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#008233] transition-colors z-20" />
                  <input
                    type="text"
                    required
                    autoFocus // 화면 로딩 시 자동 포커스
                    className="block w-full pl-10 pr-3 py-4 border-2 border-gray-200 rounded-lg focus:border-[#008233] focus:ring-0 outline-none transition-all text-slate-800 text-lg font-medium placeholder:text-base placeholder:font-normal relative z-10 bg-transparent"
                    placeholder="사번 입력"
                    value={employeeId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 text-sm font-bold rounded-lg text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 mt-4 cursor-pointer relative z-10"
              style={{ backgroundColor: isLoading ? '#9ca3af' : '#008233' }}
            >
              {isLoading ? (
                <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>Checking Info...</span>
              ) : (
                <span className="flex items-center text-base tracking-widest">ACCESS WORKBENCH <ArrowRight className="ml-2 h-5 w-5" /></span>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
             계정이 없으신가요? 
             <button 
               onClick={() => setIsRegisterOpen(true)}
               className="ml-2 font-bold text-[#003087] hover:underline cursor-pointer"
             >
               신규 등록
             </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
             <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
                <ShieldCheck size={14} /> <span>© 2026 Kwon Hyuk min . All rights reserved.</span>
             </div>
          </div>
        </div>
        
        {/* 회원가입 모달 */}
        <RegisterModal 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)} 
          initialEmployeeId={employeeId}
        />

      </div>
    </div>
  );
}
