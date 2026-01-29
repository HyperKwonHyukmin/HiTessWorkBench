import React, { useState } from 'react';
import { User, Lock, ArrowRight, Anchor, ShieldCheck } from 'lucide-react';
const structureBgUrl = "https://images.unsplash.com/photo-1553653841-453082536a9d?q=80&w=1000&auto=format&fit=crop"; // 예시: 조선소/도크 이미지
import logoCI from '../assets/images/HHI_white2_ko.png';
import axios from 'axios';



export default function LoginScreen({ onLoginSuccess }) {
  // [수정 1] 비밀번호 상태 삭제, 사번만 남김
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); // 에러 메시지 초기화

    try {
      // [수정 2] 실제 백엔드 API 호출 (포트 8000)
      // 비밀번호 없이 employee_id만 보냅니다.
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        employee_id: employeeId
      });

      // 성공 시 (200 OK)
      console.log('Login Success:', response.data);
      
      // 사용자 정보를 브라우저 저장소에 저장 (새로고침 해도 유지되도록)
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // 메인 화면으로 이동
      onLoginSuccess();

    } catch (error) {
      console.error('Login Error:', error);
      
      // [수정 3] 에러 유형별 메시지 분기 처리
      if (error.response) {
        // 서버가 응답은 줬는데 에러인 경우
        if (error.response.status === 404) {
          setErrorMsg("등록되지 않은 사번입니다. 회원가입이 필요합니다.");
        } else {
          setErrorMsg(`로그인 오류: ${error.response.status}`);
        }
      } else if (error.request) {
        // 서버로 요청을 보냈으나 응답이 없는 경우 (서버 꺼짐, 네트워크 문제)
        setErrorMsg("서버에 접속할 수 없습니다. 백엔드가 실행 중인지 확인하세요.");
      } else {
        // 기타 에러
        setErrorMsg("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-brand-gray font-sans overflow-hidden">
      
      {/* 1. 좌측 브랜딩 패널 (디자인 유지) */}
      <div className="hidden lg:flex w-5/12 relative flex-col justify-between p-12 text-white" style={{ backgroundColor: '#002554' }}>
        
        {/* 배경 이미지 오버레이 */}
        <div className="absolute inset-0 z-0">
          <img 
            src={structureBgUrl} 
            alt="Structure" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay grayscale contrast-125 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#002554]/90 via-[#002554]/40 to-[#002554]/90"></div>
        </div>

        {/* 로고 영역 */}
        <div className="relative z-10 mt-6">
           <div className="mb-8">
             <img src={logoCI} alt="HD Hyundai CI" className="h-12 w-auto object-contain" />
           </div>
           <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-md">
            HiTESS <br/>
            <span style={{ color: '#00E600' }}>WorkBench</span>
          </h1>
          <div className="h-1.5 w-24 bg-[#008233] mt-8 rounded-full"></div>
        </div>

        {/* 하단 텍스트 */}
        <div className="relative z-10 mb-6">
           <h3 className="text-xl font-bold mb-2 text-white">Future Builder</h3>
           <p className="text-gray-300 text-sm font-light leading-relaxed">
            Integrated Structural Analysis System<br/>
            Global R&D Center
          </p>
        </div>
      </div>

      {/* 2. 우측 로그인 폼 */}
      <div className="flex-1 flex flex-col justify-center items-center p-10 bg-white z-20 shadow-xl">
        <div className="w-full max-w-sm space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Engineer Access</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              사번을 입력하여 접속하십시오.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 에러 메시지 출력 영역 */}
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200 font-bold flex items-center animate-pulse">
                <AlertCircle className="mr-2 h-5 w-5" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-5">
              {/* 사번 입력 필드 */}
              <div>
                <label className="block text-xs font-bold text-[#003087] uppercase mb-2">Employee ID</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#008233] transition-colors" />
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-4 border-2 border-gray-200 rounded-lg focus:border-[#008233] focus:ring-0 outline-none transition-all text-slate-800 text-lg font-medium placeholder:text-base placeholder:font-normal"
                    placeholder="사번 입력 (예: A476854)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
              </div>
              {/* 비밀번호 입력 필드는 완전히 삭제되었습니다. */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 text-sm font-bold rounded-lg text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 mt-4"
              style={{ backgroundColor: isLoading ? '#9ca3af' : '#008233' }}
            >
              {isLoading ? (
                <span className="flex items-center">
                   {/* 로딩 스피너 */}
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Checking Info...
                </span>
              ) : (
                <span className="flex items-center text-base tracking-widest">
                  ACCESS WORKBENCH <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
             <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
                <ShieldCheck size={14} />
                <span>Internal System Only</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
