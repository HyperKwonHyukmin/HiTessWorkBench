import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Box, Activity, Plus, Trash2, ShieldCheck, ArrowDown, Play, RefreshCw 
} from 'lucide-react';

export default function ComponentWizard() {
  const mountRef = useRef(null);
  
  // ✅ 1. 레이아웃 안정화 대기 상태 (앱 시작 시 버그 원천 차단)
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // ==========================================
  // 상태 관리
  // ==========================================
  const [beamType, setBeamType] = useState('BAR');
  const [params, setParams] = useState({
    length: 1000,
    dim1: 50,  
    dim2: 100, 
    dim3: 10,  
    dim4: 10,  
  });

  const [loads, setLoads] = useState([{ pos: 500, mag: 1000 }]);
  const [boundaries, setBoundaries] = useState([
    { pos: 0, type: 'Fix' },
    { pos: 1000, type: 'Hinge' }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState({ maxStress: 0, maxDisp: 0, area: 0, inertia: 0 });

  // ==========================================
  // 2. 초기 렌더링 지연 (0.4초 후 Three.js 가동)
  // ==========================================
  useEffect(() => {
    // 사용자가 원한 "전체화면" 효과를 내기 위해, HTML 레이아웃이 100% 렌더링 된 후 캔버스를 올림
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 400); // 0.4초 대기
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // 3. Three.js 렌더링 (단일 훅으로 통합 관리)
  // ==========================================
  useEffect(() => {
    // 레이아웃이 아직 준비 안 됐거나, DOM이 없으면 실행 안함
    if (!isLayoutReady || !mountRef.current) return;

    // 1) 씬 & 카메라 초기화
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); 

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;

    // 조명
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(1000, 2000, 1000);
    scene.add(sunLight);

    // 2) 모델 생성 (Model Group)
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const { length, dim1, dim2, dim3, dim4 } = params;

    // [그리드]
    const gridHelper = new THREE.GridHelper(length * 1.5, 20, 0x334155, 0x1e293b);
    gridHelper.position.set(0, -dim2 / 2 - 20, 0); // 항상 바닥 원점에 위치
    modelGroup.add(gridHelper);

    // [단면 형상]
    let geometry;
    if (beamType === 'H') {
      const shape = new THREE.Shape();
      const w = dim1, h = dim2, tw = dim4, tf = dim3;
      shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, -h/2 + tf);
      shape.lineTo(tw/2, -h/2 + tf); shape.lineTo(tw/2, h/2 - tf); shape.lineTo(w/2, h/2 - tf);
      shape.lineTo(w/2, h/2); shape.lineTo(-w/2, h/2); shape.lineTo(-w/2, h/2 - tf);
      shape.lineTo(-tw/2, h/2 - tf); shape.lineTo(-tw/2, -h/2 + tf); shape.lineTo(-w/2, -h/2 + tf);
      shape.lineTo(-w/2, -h/2);

      geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false, steps: 20 });
      geometry.center(); // 원점으로 정중앙 배치
      geometry.rotateY(Math.PI / 2);
    } else {
      geometry = new THREE.BoxGeometry(length, dim2, dim1, 20, 1, 1);
    }

    const material = new THREE.MeshPhongMaterial({
      color: showResult ? 0xffffff : 0x00E600,
      emissive: showResult ? 0x000000 : 0x003300,
      vertexColors: showResult,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // 외곽선 (Wireframe)
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true }));
    mesh.add(line);
    modelGroup.add(mesh);

    // [경계 조건]
    boundaries.forEach(bc => {
      const isFix = bc.type === 'Fix';
      const bcGeo = isFix ? new THREE.ConeGeometry(dim1*0.8, dim1*1.5, 4) : new THREE.SphereGeometry(dim1*0.6, 16, 16);
      const bcMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6 }); 
      const bcMesh = new THREE.Mesh(bcGeo, bcMat);
      
      const xPos = bc.pos - (length / 2); // 정중앙 보정
      const yPos = -dim2/2 - (isFix ? dim1*0.75 : dim1*0.6);
      bcMesh.position.set(xPos, yPos, 0);
      modelGroup.add(bcMesh);
    });

    // [하중 화살표]
    loads.forEach(load => {
      const isDown = load.mag > 0; 
      const dir = new THREE.Vector3(0, isDown ? -1 : 1, 0); 
      const xPos = load.pos - (length / 2); // 정중앙 보정
      const originY = isDown ? dim2/2 + 200 : -dim2/2 - 200; 
      const origin = new THREE.Vector3(xPos, originY, 0);
      
      const arrowLen = Math.max(50, Math.min(200, Math.abs(load.mag) * 0.1));
      const arrowHelper = new THREE.ArrowHelper(dir, origin, arrowLen, 0xff3333, arrowLen*0.3, arrowLen*0.2); 
      modelGroup.add(arrowHelper);
    });

    // [처짐 시각화]
    if (showResult) {
      const positions = geometry.attributes.position;
      const colors = [];
      const colorObj = new THREE.Color();

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const normalizedX = (x + length / 2) / length;
        const displacement = Math.pow(normalizedX, 2) * 60; 
        positions.setY(i, positions.getY(i) - displacement);

        const normalizedStress = Math.abs(Math.sin((x / length) * Math.PI));
        colorObj.setHSL((1 - normalizedStress) * 0.6, 1.0, 0.5);
        colors.push(colorObj.r, colorObj.g, colorObj.b);
      }
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      positions.needsUpdate = true;
    }

    // 3) 카메라 완벽 고정 (항상 모델을 정중앙에 꽉 차게 프레이밍)
    const viewDist = Math.max(length, 500); 
    camera.position.set(viewDist * 0.8, viewDist * 0.6, viewDist * 1.0);
    controls.target.set(0, 0, 0);
    controls.update();

    // 4) 반응형 리사이즈
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mountRef.current);

    // 5) 애니메이션 루프
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update(); 
      renderer.render(scene, camera);
    };
    animate();

    // 6) 완벽한 클린업 (메모리 누수 방지)
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (mountRef.current && renderer.domElement) {
        try { mountRef.current.removeChild(renderer.domElement); } catch(e) {}
      }
      renderer.dispose();
    };
  }, [isLayoutReady, params, beamType, loads, boundaries, showResult]);

  // ==========================================
  // UI 핸들러
  // ==========================================
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setShowResult(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
      setResultData({
        maxStress: 245.2,
        maxDisp: 15.3,
        area: params.dim1 * params.dim2,
        inertia: (params.dim1 * Math.pow(params.dim2, 3)) / 12
      });
    }, 1500);
  };

  const addBoundary = () => setBoundaries([...boundaries, { pos: params.length / 2, type: 'Hinge' }]);
  const removeBoundary = (index) => setBoundaries(boundaries.filter((_, i) => i !== index));
  const addLoad = () => setLoads([...loads, { pos: params.length / 2, mag: 1000 }]);
  const removeLoad = (index) => setLoads(loads.filter((_, i) => i !== index));

  return (
    // ✅ 핵심 수정 1: CSS Grid를 사용하여 공간 분할. flex로 인한 무한 증식 현상을 영구 차단합니다.
    // 전체 창을 무조건 꽉 채우도록 h-[calc(100vh-100px)] 부여
    <div className="grid grid-cols-[350px_1fr] w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-900 p-4 gap-4 animate-fade-in-up rounded-2xl shadow-inner overflow-hidden relative">
      
      {/* 로딩 화면: 0.4초 동안 렌더링을 잡아둠 */}
      {!isLayoutReady && (
        <div className="col-span-2 absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-[#00E600]">
          <RefreshCw className="animate-spin mb-4" size={48} />
          <p className="font-mono font-bold tracking-widest uppercase">Initializing 3D Environment...</p>
        </div>
      )}

      {/* -------------------------------------------
          좌측 설정 패널 (350px 고정)
      ------------------------------------------- */}
      <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2 z-10">
        
        <div className="bg-slate-800 rounded-2xl p-5 shadow-xl border border-slate-700 shrink-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Box size={16} className="text-[#00E600]" /> Beam Profile
          </h3>
          <select 
            value={beamType} 
            onChange={e => {setBeamType(e.target.value); setShowResult(false);}}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#00E600] font-bold mb-4 outline-none"
          >
            <option value="BAR">BAR (Solid Box)</option>
            <option value="H">H-Beam (I-Beam)</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <InputBox label="Length (L)" value={params.length} onChange={(e) => setParams({...params, length: Number(e.target.value)})} />
            <InputBox label="Width (W)" value={params.dim1} onChange={(e) => setParams({...params, dim1: Number(e.target.value)})} />
            <InputBox label="Height (H)" value={params.dim2} onChange={(e) => setParams({...params, dim2: Number(e.target.value)})} />
            {beamType === 'H' && (
              <>
                <InputBox label="Flange Thk" value={params.dim3} onChange={(e) => setParams({...params, dim3: Number(e.target.value)})} />
                <InputBox label="Web Thk" value={params.dim4} onChange={(e) => setParams({...params, dim4: Number(e.target.value)})} />
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 shadow-xl border border-slate-700 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400" /> Boundaries
            </h3>
            <button onClick={addBoundary} className="p-1 hover:bg-slate-700 rounded text-blue-400"><Plus size={16}/></button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {boundaries.map((bc, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="number" value={bc.pos} onChange={e => {
                  const newBc = [...boundaries]; newBc[idx].pos = Number(e.target.value); setBoundaries(newBc);
                }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Position" />
                <select value={bc.type} onChange={e => {
                  const newBc = [...boundaries]; newBc[idx].type = e.target.value; setBoundaries(newBc);
                }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none">
                  <option value="Fix">Fix</option>
                  <option value="Hinge">Hinge</option>
                </select>
                <button onClick={() => removeBoundary(idx)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 shadow-xl border border-slate-700 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ArrowDown size={16} className="text-red-400" /> Loads (N)
            </h3>
            <button onClick={addLoad} className="p-1 hover:bg-slate-700 rounded text-red-400"><Plus size={16}/></button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {loads.map((load, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="number" value={load.pos} onChange={e => {
                  const newLoads = [...loads]; newLoads[idx].pos = Number(e.target.value); setLoads(newLoads);
                }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Pos" />
                <input type="number" value={load.mag} onChange={e => {
                  const newLoads = [...loads]; newLoads[idx].mag = Number(e.target.value); setLoads(newLoads);
                }} className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Mag (N)" />
                <button onClick={() => removeLoad(idx)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleRunAnalysis}
          className={`w-full py-4 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 ${
            showResult ? 'bg-emerald-600 text-white' : 'bg-[#00E600] text-[#002554] hover:bg-[#00cc00]'
          }`}
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : (showResult ? <Activity size={18} /> : <Play size={18} fill="currentColor" />)}
          {showResult ? 'Recalculate' : 'Run Analysis'}
        </button>
      </div>

      {/* -------------------------------------------
          우측 3D 캔버스 영역 (나머지 영역 자동 채움)
      ------------------------------------------- */}
      <div className="relative h-full bg-black rounded-xl border border-slate-800 overflow-hidden z-0">
        
        {/* ✅ 핵심 수정 2: absolute inset-0로 부모 크기에 100% 종속시킴 */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-move" />
        
        {showResult && (
          <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md p-5 rounded-xl border border-slate-700 shadow-2xl animate-fade-in-up z-10 pointer-events-auto">
             <p className="text-xs font-bold text-[#00E600] mb-3 uppercase tracking-widest border-b border-slate-700 pb-2">Analysis Results</p>
             <div className="space-y-3 font-mono">
                <ResultRow label="Max Stress" value={resultData.maxStress.toFixed(1)} unit="MPa" color="text-red-400" />
                <ResultRow label="Max Disp." value={resultData.maxDisp.toFixed(1)} unit="mm" color="text-yellow-400" />
                <div className="h-px bg-slate-700 my-2"></div>
                <ResultRow label="Area" value={resultData.area.toFixed(0)} unit="mm²" color="text-slate-300" />
                <ResultRow label="Inertia (I)" value={resultData.inertia.toExponential(2)} unit="mm⁴" color="text-slate-300" />
             </div>
             <button onClick={() => alert("차트 보기 기능은 추후 연동됩니다.")} className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded font-bold border border-slate-600 transition-colors">
               View Shear / Moment Chart
             </button>
          </div>
        )}
      </div>

    </div>
  );
}

// ====================================================
// Helper Components
// ====================================================
function InputBox({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
      <input 
        type="number" value={value} onChange={onChange}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none focus:border-[#00E600] transition-colors"
      />
    </div>
  );
}

function ResultRow({ label, value, unit, color }) {
  return (
    <div className="flex justify-between items-center gap-6">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value} <span className="text-[10px] text-slate-500 font-normal">{unit}</span></span>
    </div>
  );
}
