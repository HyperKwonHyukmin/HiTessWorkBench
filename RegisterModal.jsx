import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, UserPlus, Building, Briefcase, User, CheckCircle, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// ==========================================
// 메인 모달 컴포넌트
// ==========================================
export default function RegisterModal({ isOpen, onClose, initialEmployeeId }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    company: 'HD 현대중공업',
    position: '책임 엔지니어'
    // permissions 삭제됨
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 가입 성공 상태 관리
  const [isSuccess, setIsSuccess] = useState(false);

  // 회사 목록 데이터
  const companyOptions = ['HD 현대중공업', 'HD 현대삼호', 'HD 한국조선해양'];
  // 직위 목록 데이터
  const positionOptions = ['책임연구원', '책임엔지니어', '선임연구원', '선임엔지니어', '연구원', '엔지니어'];

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      if (initialEmployeeId) {
        setFormData(prev => ({ ...prev, employee_id: initialEmployeeId }));
      }
      setIsSuccess(false);
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen, initialEmployeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // [수정됨] 작은따옴표(') -> 백틱(`)으로 변경
      await axios.post(`${API_BASE_URL}/api/register`, formData);
      
      setIsSuccess(true);
      
    } catch (error) {
      console.error("Register Error:", error);
      if (error.response && error.response.status === 400) {
        setErrorMsg("이미 등록된 사번입니다.");
      } else {
        setErrorMsg("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        
        {/* 배경 블러 오버레이 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center pt-20">
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                
                {/* 성공 화면 */}
                {isSuccess ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-2">
                      가입 신청 완료
                    </Dialog.Title>
                    
                    <div className="mt-2 space-y-4">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        가입 신청이 성공적으로 접수되었습니다.<br/>
                        <span className="font-bold text-blue-600">관리자 승인 후</span> 시스템 이용이 가능합니다.
                      </p>
                      
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left flex items-start">
                         <ShieldCheck className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                         <div className="text-xs text-blue-700">
                            <strong>보안 안내:</strong><br/>
                            승인 처리는 담당자가 확인 후 진행하며, <br/>
                            승인 완료 시 메일로 알림이 발송될 수 있습니다.
                         </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-xl border border-transparent bg-[#008233] px-4 py-3 text-sm font-bold text-white hover:bg-[#006b29] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
                        onClick={handleClose}
                      >
                        확인 (로그인 화면으로 이동)
                      </button>
                    </div>
                  </div>
                ) : (
                
                /* 입력 폼 화면 */
                <>
                  <div className="bg-gradient-to-r from-[#002554] to-[#003366] p-6 flex justify-between items-center text-white shadow-md rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                        <UserPlus className="h-6 w-6 text-[#00E600]" />
                      </div>
                      <div>
                          <Dialog.Title as="h3" className="text-lg font-bold tracking-wide leading-none">
                          Hi-TESS Join
                          </Dialog.Title>
                          <p className="text-xs text-blue-200 mt-1 font-light">시스템 접속 권한 신청</p>
                      </div>
                    </div>
                    <button onClick={handleClose} className="text-blue-200 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors focus:outline-none cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 bg-slate-50/50 rounded-b-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {errorMsg && (
                        <div className="bg-red-50/80 text-red-600 text-sm p-3 rounded-xl border border-red-200 font-bold text-center shadow-sm animate-pulse">
                          ⚠️ {errorMsg}
                        </div>
                      )}

                      <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                          {/* 사번 */}
                          <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">사번 입력</label>
                          <div className="relative group">
                              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-[#008233]" />
                              <input
                              type="text"
                              name="employee_id"
                              required
                              value={formData.employee_id}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#008233]/50 focus:border-[#008233] outline-none transition-all font-mono text-slate-700"
                              placeholder="A123456"
                              />
                          </div>
                          </div>

                          {/* 이름 */}
                          <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">이름</label>
                          <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="block w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#008233]/50 focus:border-[#008233] outline-none transition-all text-slate-700"
                              placeholder="홍길동"
                          />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative z-10">
                        <StyledListbox
                          label="회사"
                          value={formData.company}
                          onChange={(val) => handleSelectChange('company', val)}
                          options={companyOptions}
                          icon={Building}
                          zIndex="z-50"
                        />
                        <StyledListbox
                          label="직급"
                          value={formData.position}
                          onChange={(val) => handleSelectChange('position', val)}
                          options={positionOptions}
                          icon={Briefcase}
                          zIndex="z-40"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 px-4 mt-4 bg-gradient-to-r from-[#008233] to-[#00A84D] hover:from-[#006b29] hover:to-[#008233] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isLoading ? 'Registering...' : (
                          <span className="flex items-center text-base tracking-wide">
                            Join Request <CheckCircle className="ml-2 h-5 w-5" />
                          </span>
                        )}
                      </button>

                    </form>
                  </div>
                </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// StyledListbox 컴포넌트는 변경 없음
function StyledListbox({ label, value, onChange, options, icon: Icon, zIndex = "z-10" }) {
  return (
    <div className={`relative ${zIndex}`}>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-pointer py-2.5 pl-10 pr-10 text-left bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008233]/50 focus-visible:border-[#008233] transition-all sm:text-sm hover:bg-white hover:border-gray-300 shadow-sm group">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#008233] transition-colors" aria-hidden="true" />
            </span>
            <span className="block truncate text-slate-700 font-medium">{value}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-2xl ring-1 ring-black/10 focus:outline-none sm:text-sm divide-y divide-gray-100 z-[100]">
              {options.map((option, optionIdx) => (
                <Listbox.Option key={optionIdx} className={({ active }) => `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-[#f0fdf4] text-[#008233]' : 'text-slate-900'}`} value={option}>
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>{option}</span>
                      {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#008233]"><Check className="h-4 w-4" aria-hidden="true" /></span> : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
