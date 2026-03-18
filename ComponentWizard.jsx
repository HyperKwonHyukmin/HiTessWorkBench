import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Box, Activity, Plus, Trash2, ShieldCheck, ArrowDown, Play, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function ComponentWizard() {
  const mountRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelGroupRef = useRef(null); 

  // ==========================================
  // 1. 상태 관리
  // ==========================================
  const [beamType, setBeamType] = useState('H');
  const [params, setParams] = useState({
    length: 1000,
    dim1: 100, // Width / Dia
    dim2: 200, // Height / Thk (Tube)
    dim3: 15,  // tf
    dim4: 10,  // tw
  });

  const [loads, setLoads] = useState([{ pos: 500, mag: 2000 }]);
  const [boundaries, setBoundaries] = useState([{ pos: 0, type: 'Fix' }]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState({ maxStress: 0, maxDisp: 0, area: 0, inertia: 0 });

  // ==========================================
  // 2. 입력 검증 (Validation) 및 핸들러
  // ==========================================
  
  const handleBeamTypeChange = (e) => {
    const type = e.target.value;
    setBeamType(type);
    setShowResult(false);

    const newParams = { ...params };
    switch (type) {
      case 'BAR': newParams.dim1 = 50; newParams.dim2 = 100; break;
      case 'H':
      case 'CHAN': newParams.dim1 = 100; newParams.dim2 = 200; newParams.dim3 = 15; newParams.dim4 = 10; break;
      case 'L':
      case 'T': newParams.dim1 = 100; newParams.dim2 = 100; newParams.dim3 = 10; newParams.dim4 = 10; break;
      case 'ROD': newParams.dim1 = 100; break;
      case 'TUBE': newParams.dim1 = 100; newParams.dim2 = 20; break;
      default: break;
    }
    setParams(newParams);
  };

  const handleBoundaryPosChange = (idx, value) => {
    if (value === '') {
      const newBc = [...boundaries];
      newBc[idx].pos = '';
      setBoundaries(newBc);
      return;
    }
    let val = Number(value);
    const currentLength = Number(params.length) || 0;
    if (val > currentLength) {
      alert(`경계조건 위치(${val}mm)는 부재의 전체 길이(${currentLength}mm)를 초과할 수 없습니다.`);
      val = currentLength;
    } else if (val < 0) val = 0;

    const newBc = [...boundaries];
    newBc[idx].pos = val;
    setBoundaries(newBc);
  };

  const handleLoadPosChange = (idx, value) => {
    if (value === '') {
      const newLoads = [...loads];
      newLoads[idx].pos = '';
      setLoads(newLoads);
      return;
    }
    let val = Number(value);
    const currentLength = Number(params.length) || 0;
    if (val > currentLength) {
      alert(`하중 위치(${val}mm)는 부재의 전체 길이(${currentLength}mm)를 초과할 수 없습니다.`);
      val = currentLength;
    } else if (val < 0) val = 0;

    const newLoads = [...loads];
    newLoads[idx].pos = val;
    setLoads(newLoads);
  };

  const validateDimensions = () => {
    const length = Number(params.length) || 0;
    const dim1 = Number(params.dim1) || 0;
    const dim2 = Number(params.dim2) || 0;
    const dim3 = Number(params.dim3) || 0;
    const dim4 = Number(params.dim4) || 0;
    
    if (length <= 0) return "부재 길이는 0보다 커야 합니다.";
    if (dim1 <= 0 || dim2 <= 0) return "기본 치수(폭, 높이, 직경 등)는 0보다 커야 합니다.";

    if (beamType === 'TUBE') {
      if (dim2 >= dim1 / 2) return `TUBE의 두께(t: ${dim2})는 반경(D/2: ${dim1/2})보다 작아야 합니다.`;
    }
    if (['H', 'CHAN'].includes(beamType)) {
      if (dim3 >= dim2 / 2) return `Flange 두께(tf: ${dim3})는 전체 높이의 절반(H/2: ${dim2/2})보다 작아야 합니다.`;
      if (dim4 >= dim1) return `Web 두께(tw: ${dim4})는 전체 폭(W: ${dim1})보다 작아야 합니다.`;
    }
    if (['L', 'T'].includes(beamType)) {
      if (dim3 >= dim2) return `Flange 두께(tf: ${dim3})는 전체 높이(H: ${dim2})보다 작아야 합니다.`;
      if (dim4 >= dim1) return `Web 두께(tw: ${dim4})는 전체 폭(W: ${dim1})보다 작아야 합니다.`;
    }
    return null; 
  };

  // ==========================================
  // 3. API 통신 및 데이터 검증 (JSON Payload)
  // ==========================================
  const handleRunAnalysis = async () => {
    const errorMsg = validateDimensions();
    if (errorMsg) {
      alert(`[입력 오류]\n${errorMsg}`);
      return;
    }

    // ✅ 프론트엔드에서 서버로 넘길 데이터(JSON) 조립
    const analysisPayload = {
      beam_type: beamType, 
      dimensions: {
        length: Number(params.length) || 0,
        dim1: Number(params.dim1) || 0, 
        dim2: Number(params.dim2) || 0, 
        dim3: Number(params.dim3) || 0, 
        dim4: Number(params.dim4) || 0
      },
      boundaries: boundaries.map(b => ({ pos: Number(b.pos) || 0, type: b.type })),
      loads: loads.map(l => ({ pos: Number(l.pos) || 0, magnitude: Number(l.mag) || 0 }))
    };

    // ✅ 개발자(스승님) 검증용 모달 띄우기
    const isConfirmed = window.confirm(
      "🚀 서버로 다음 JSON 데이터를 전송합니다. 진행하시겠습니까?\n\n" + 
      JSON.stringify(analysisPayload, null, 2)
    );

    // 취소 버튼을 누르면 해석 중단
    if (!isConfirmed) return;

    setIsAnalyzing(true);
    setShowResult(false);

    try {
      // 💡 [실제 백엔드 연동 시 주석 해제] 💡
      /*
      const response = await axios.post(`${API_BASE_URL}/api/analysis/component_wizard`, analysisPayload);
      if(response.data.status === "Success") {
         setResultData(response.data.results);
         setShowResult(true);
      } else {
         alert("Nastran 해석 중 오류가 발생했습니다.");
      }
      */

      // 현재는 UI 시뮬레이션을 위해 setTimeout 사용
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResult(true);
        const areaVal = beamType === 'TUBE' ? Math.PI*(Math.pow(params.dim1/2,2) - Math.pow((params.dim1/2 - params.dim2), 2)) : params.dim1 * params.dim2;
        setResultData({
          maxStress: Math.random() * 200 + 100, 
          maxDisp: Math.random() * 20 + 5,      
          area: areaVal || 0,
          inertia: ((params.dim1 || 0) * Math.pow((params.dim2 || 0), 3)) / 12 
        });
      }, 1500);

    } catch (error) {
      console.error("Analysis Request Failed:", error);
      alert("해석 서버와 통신할 수 없습니다.");
      setIsAnalyzing(false);
    }
  };


  // ==========================================
  // 4. Three.js 렌더링 로직
  // ==========================================
  const createTextSprite = (message) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "Bold 50px Arial";
    const metrics = context.measureText(message);
    const textWidth = metrics.width;
    canvas.width = textWidth + 20;
    canvas.height = 70;
    context.font = "Bold 50px Arial";
    context.fillStyle = "rgba(255, 51, 51, 1.0)"; 
    context.textAlign = "center";
    context.fillText(message, canvas.width / 2, 50);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width * 0.4, canvas.height * 0.4, 1);
    return sprite;
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLayoutReady(true), 400); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLayoutReady || !mountRef.current) return;

    let width = mountRef.current.clientWidth || 800;
    let height = mountRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B1120); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    renderer.shadowMap.enabled = true; 
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1000, 2000, 1000);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xaabbff, 0.5);
    fillLight.position.set(-1000, 500, -1000);
    scene.add(fillLight);

    // 지우거나 텍스트 입력 중일 때 3D 엔진이 NaN 오류를 뿜지 않도록 안전하게 파싱
    const length = Number(params.length) || 0.1;
    const dim1 = Number(params.dim1) || 0.1;
    const dim2 = Number(params.dim2) || 0.1;
    const dim3 = Number(params.dim3) || 0.1;
    const dim4 = Number(params.dim4) || 0.1;

    const isCylindrical = beamType === 'ROD' || beamType === 'TUBE';
    const maxHeight = isCylindrical ? dim1 / 2 : dim2 / 2;

    const gridHelper = new THREE.GridHelper(length * 2, 40, 0x334155, 0x1e293b);
    gridHelper.position.set(0, -maxHeight - 20, 0); 
    modelGroup.add(gridHelper);

    let geometry;
    const extrudeSettings = { depth: length, bevelEnabled: false, steps: 40 };

    if (beamType === 'BAR') {
      geometry = new THREE.BoxGeometry(length, dim2, dim1, 40, 1, 1);
    } 
    else if (beamType === 'ROD') {
      geometry = new THREE.CylinderGeometry(dim1/2, dim1/2, length, 32);
      geometry.rotateZ(Math.PI / 2);
    } 
    else {
      const shape = new THREE.Shape();
      const w = dim1, h = dim2, tf = dim3, tw = dim4;

      if (beamType === 'H') {
        shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, -h/2 + tf);
        shape.lineTo(tw/2, -h/2 + tf); shape.lineTo(tw/2, h/2 - tf); shape.lineTo(w/2, h/2 - tf);
        shape.lineTo(w/2, h/2); shape.lineTo(-w/2, h/2); shape.lineTo(-w/2, h/2 - tf);
        shape.lineTo(-tw/2, h/2 - tf); shape.lineTo(-tw/2, -h/2 + tf); shape.lineTo(-w/2, -h/2 + tf);
        shape.lineTo(-w/2, -h/2);
      } 
      else if (beamType === 'L') {
        shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, -h/2 + tf);
        shape.lineTo(-w/2 + tw, -h/2 + tf); shape.lineTo(-w/2 + tw, h/2); shape.lineTo(-w/2, h/2); shape.lineTo(-w/2, -h/2);
      } 
      else if (beamType === 'T') {
        shape.moveTo(-tw/2, -h/2); shape.lineTo(tw/2, -h/2); shape.lineTo(tw/2, h/2 - tf);
        shape.lineTo(w/2, h/2 - tf); shape.lineTo(w/2, h/2); shape.lineTo(-w/2, h/2);
        shape.lineTo(-w/2, h/2 - tf); shape.lineTo(-tw/2, h/2 - tf); shape.lineTo(-tw/2, -h/2);
      } 
      else if (beamType === 'CHAN') {
        shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, -h/2 + tf); shape.lineTo(-w/2 + tw, -h/2 + tf);
        shape.lineTo(-w/2 + tw, h/2 - tf); shape.lineTo(w/2, h/2 - tf); shape.lineTo(w/2, h/2);
        shape.lineTo(-w/2, h/2); shape.lineTo(-w/2, -h/2);
      } 
      else if (beamType === 'TUBE') {
        shape.absarc(0, 0, dim1/2, 0, Math.PI * 2, false);
        const holePath = new THREE.Path();
        const innerRadius = (dim1/2) - dim2; 
        if (innerRadius > 0) {
           holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true); 
           shape.holes.push(holePath);
        }
      }

      geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center(); 
      geometry.rotateY(Math.PI / 2);
    }

    const material = new THREE.MeshStandardMaterial({
      color: showResult ? 0xffffff : 0x00E600,
      emissive: showResult ? 0x000000 : 0x001100,
      roughness: 0.3,
      metalness: 0.6,
      vertexColors: showResult,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const edges = new THREE.EdgesGeometry(geometry, 15);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
    mesh.add(line);
    modelGroup.add(mesh);

    boundaries.forEach(bc => {
      const isFix = bc.type === 'Fix';
      const bColor = isFix ? 0x3b82f6 : 0xf59e0b; 
      const coneHeight = Math.max(dim1 * 1.5, 60);
      const sphereRadius = Math.max(dim1 * 0.6, 30);
      
      const bcGeo = isFix ? new THREE.ConeGeometry(dim1*0.8, coneHeight, 16) : new THREE.SphereGeometry(sphereRadius, 32, 32);
      const bcMat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.5, metalness: 0.8 }); 
      const bcMesh = new THREE.Mesh(bcGeo, bcMat);
      
      const posVal = Number(bc.pos) || 0;
      const xPos = posVal - (length / 2); 
      const yPos = isFix ? (-maxHeight - coneHeight/2) : (-maxHeight - sphereRadius);
      bcMesh.position.set(xPos, yPos, 0);
      modelGroup.add(bcMesh);
    });

    loads.forEach(load => {
      const magVal = Number(load.mag) || 0;
      const posVal = Number(load.pos) || 0;

      const isDown = magVal > 0; 
      const arrowGroup = new THREE.Group();
      
      const baseLen = Math.max(120, Math.min(400, Math.abs(magVal) * 0.2));
      const headLen = baseLen * 0.25;
      const shaftLen = baseLen - headLen;
      const radius = baseLen * 0.05; 
      const headRadius = radius * 2.5; 

      const mat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x440000, roughness: 0.2, metalness: 0.3 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, shaftLen, 16), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(headRadius, headLen, 16), mat);
      const textLabel = createTextSprite(`${Math.abs(magVal)} N`);

      if (isDown) {
        head.position.set(0, headLen/2, 0);
        head.rotation.z = Math.PI; 
        shaft.position.set(0, headLen + shaftLen/2, 0);
        arrowGroup.position.set(posVal - length/2, maxHeight, 0);
        textLabel.position.set(0, baseLen + 30, 0); 
      } else {
        head.position.set(0, -headLen/2, 0);
        shaft.position.set(0, -(headLen + shaftLen/2), 0);
        arrowGroup.position.set(posVal - length/2, -maxHeight, 0);
        textLabel.position.set(0, -baseLen - 30, 0);
      }

      arrowGroup.add(shaft);
      arrowGroup.add(head);
      arrowGroup.add(textLabel); 
      modelGroup.add(arrowGroup);
    });

    if (showResult) {
      const positions = geometry.attributes.position;
      const colors = [];
      const colorObj = new THREE.Color();

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const normalizedX = (x + length / 2) / length;
        const displacement = Math.sin(normalizedX * Math.PI) * 50; 
        positions.setY(i, positions.getY(i) - displacement);

        const normalizedStress = Math.abs(Math.sin((x / length) * Math.PI));
        colorObj.setHSL((1 - normalizedStress) * 0.6, 1.0, 0.5);
        colors.push(colorObj.r, colorObj.g, colorObj.b);
      }
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      positions.needsUpdate = true;
    }

    const viewDist = Math.max(length, 400); 
    camera.position.set(viewDist * 0.7, viewDist * 0.5, viewDist * 0.9);
    controls.target.set(0, 0, 0);
    controls.update();

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

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update(); 
      renderer.render(scene, camera);
    };
    animate();

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
  // UI 렌더링
  // ==========================================
  const addBoundary = () => setBoundaries([...boundaries, { pos: (Number(params.length)||0) / 2, type: 'Hinge' }]);
  const removeBoundary = (index) => setBoundaries(boundaries.filter((_, i) => i !== index));
  const addLoad = () => setLoads([...loads, { pos: (Number(params.length)||0) / 2, mag: 2000 }]);
  const removeLoad = (index) => setLoads(loads.filter((_, i) => i !== index));

  return (
    <div className="grid grid-cols-[400px_1fr] w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 p-4 gap-4 animate-fade-in-up rounded-2xl shadow-inner overflow-hidden relative">
      
      {!isLayoutReady && (
        <div className="col-span-2 absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-[#00E600]">
          <RefreshCw className="animate-spin mb-4" size={48} />
          <p className="font-mono font-bold tracking-widest uppercase">Initializing 3D Engine...</p>
        </div>
      )}

      {/* 좌측 설정 패널 */}
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-slate-900 rounded-xl border border-slate-800 shadow-2xl relative z-10">
        
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 sticky top-0 z-20 backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#00E600]" /> Analysis Setup
          </h2>
        </div>

        <div className="p-5 space-y-8">
          
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xs font-bold text-[#00E600] uppercase tracking-wider flex items-center gap-2">
                <Box size={14} /> Cross Section
              </h3>
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-lg p-1 flex items-center justify-center">
                 <SectionGuide type={beamType} />
              </div>
            </div>

            <select 
              value={beamType} 
              onChange={handleBeamTypeChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-bold mb-4 outline-none focus:border-[#00E600] transition-colors cursor-pointer"
            >
              <option value="BAR">BAR (Solid Box)</option>
              <option value="H">H-Beam (I-Beam)</option>
              <option value="L">L-Beam (Angle)</option>
              <option value="T">T-Beam</option>
              <option value="CHAN">Channel (C-Shape)</option>
              <option value="ROD">ROD (Solid Cylinder)</option>
              <option value="TUBE">TUBE (Hollow Pipe)</option>
            </select>

            <div className="space-y-1">
              <InputRow label="Length (L)" value={params.length} unit="mm" onChange={(e) => setParams({...params, length: e.target.value === '' ? '' : Number(e.target.value)})} />
              
              {beamType === 'ROD' && (
                <InputRow label="Diameter (D)" value={params.dim1} unit="mm" onChange={(e) => setParams({...params, dim1: e.target.value === '' ? '' : Number(e.target.value)})} />
              )}

              {beamType === 'TUBE' && (
                <>
                  <InputRow label="Outer Dia (D)" value={params.dim1} unit="mm" onChange={(e) => setParams({...params, dim1: e.target.value === '' ? '' : Number(e.target.value)})} />
                  <InputRow label="Thickness (t)" value={params.dim2} unit="mm" onChange={(e) => setParams({...params, dim2: e.target.value === '' ? '' : Number(e.target.value)})} />
                </>
              )}

              {['BAR', 'H', 'L', 'T', 'CHAN'].includes(beamType) && (
                <>
                  <InputRow label="Width (W)" value={params.dim1} unit="mm" onChange={(e) => setParams({...params, dim1: e.target.value === '' ? '' : Number(e.target.value)})} />
                  <InputRow label="Height (H)" value={params.dim2} unit="mm" onChange={(e) => setParams({...params, dim2: e.target.value === '' ? '' : Number(e.target.value)})} />
                </>
              )}

              {['H', 'L', 'T', 'CHAN'].includes(beamType) && (
                <>
                  <InputRow label="Flange Thk (tf)" value={params.dim3} unit="mm" onChange={(e) => setParams({...params, dim3: e.target.value === '' ? '' : Number(e.target.value)})} />
                  <InputRow label="Web Thk (tw)" value={params.dim4} unit="mm" onChange={(e) => setParams({...params, dim4: e.target.value === '' ? '' : Number(e.target.value)})} />
                </>
              )}
            </div>
          </section>

          <section className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-[#00E600] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} /> Boundaries
              </h3>
              <button onClick={addBoundary} className="text-slate-400 hover:text-blue-400 transition-colors"><Plus size={16}/></button>
            </div>
            
            <div className="space-y-2">
              {boundaries.map((bc, idx) => (
                <div key={idx} className="flex gap-1 items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={bc.pos} 
                      onChange={(e) => handleBoundaryPosChange(idx, e.target.value)} 
                      className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none font-mono text-right pr-8" 
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">mm</span>
                  </div>
                  <select value={bc.type} onChange={e => {
                    const newBc = [...boundaries]; newBc[idx].type = e.target.value; setBoundaries(newBc);
                  }} className="w-24 bg-slate-800 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer">
                    <option value="Fix">Fix</option>
                    <option value="Hinge">Hinge</option>
                  </select>
                  <button onClick={() => removeBoundary(idx)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-[#00E600] uppercase tracking-wider flex items-center gap-2">
                <ArrowDown size={14} /> Static Loads
              </h3>
              <button onClick={addLoad} className="text-slate-400 hover:text-red-400 transition-colors"><Plus size={16}/></button>
            </div>
            
            <div className="space-y-2">
              {loads.map((load, idx) => (
                <div key={idx} className="flex gap-1 items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={load.pos} 
                      onChange={(e) => handleLoadPosChange(idx, e.target.value)} 
                      className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none font-mono text-right pr-8" title="Position (mm)" 
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">mm</span>
                  </div>
                  <div className="relative flex-1">
                    <input type="number" value={load.mag} onChange={e => {
                      const newLoads = [...loads]; newLoads[idx].mag = e.target.value === '' ? '' : Number(e.target.value); setLoads(newLoads);
                    }} className="w-full bg-transparent px-2 py-1 text-sm text-red-400 outline-none font-mono text-right pr-6" title="Magnitude (N)" />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">N</span>
                  </div>
                  <button onClick={() => removeLoad(idx)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
          <button 
            onClick={handleRunAnalysis}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,230,0,0.2)] hover:shadow-[0_0_25px_rgba(0,230,0,0.4)] ${
              showResult ? 'bg-emerald-600 text-white shadow-none' : 'bg-[#00E600] text-[#002554]'
            }`}
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : (showResult ? <Activity size={18} /> : <Play size={18} fill="currentColor" />)}
            {showResult ? 'Recalculate Model' : 'Run Static Analysis'}
          </button>
        </div>
      </div>

      {/* 우측 3D 캔버스 영역 */}
      <div className="relative h-full bg-black rounded-xl border border-slate-800 overflow-hidden z-0 shadow-2xl">
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-move" />
        
        {showResult && (
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-700 shadow-2xl animate-fade-in-up z-10 pointer-events-auto min-w-[200px]">
             <p className="text-xs font-bold text-[#00E600] mb-3 uppercase tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2">
               <Activity size={14}/> Result Summary
             </p>
             <div className="space-y-3 font-mono">
                <ResultRow label="Max Stress" value={resultData.maxStress.toFixed(1)} unit="MPa" color="text-red-400" />
                <ResultRow label="Max Disp." value={resultData.maxDisp.toFixed(1)} unit="mm" color="text-yellow-400" />
                <div className="h-px bg-slate-800 my-2"></div>
                <ResultRow label="Area" value={resultData.area.toFixed(0)} unit="mm²" color="text-slate-300" />
                <ResultRow label="Inertia (I)" value={resultData.inertia.toExponential(2)} unit="mm⁴" color="text-slate-300" />
             </div>
             <button onClick={() => alert("차트 보기 기능은 추후 연동됩니다.")} className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded font-bold border border-slate-600 transition-colors shadow-inner">
               View Details Chart
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

function InputRow({ label, value, unit, onChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-900 border border-transparent hover:border-slate-700 rounded p-1 transition-colors group">
      <span className="text-[11px] text-slate-400 pl-2 group-hover:text-slate-300 transition-colors w-2/5 truncate">{label}</span>
      <div className="flex items-center w-3/5 bg-slate-950 border border-slate-800 rounded px-2 focus-within:border-[#00E600] transition-colors">
        <input 
          type="number" value={value} onChange={onChange}
          className="w-full bg-transparent py-1 text-sm text-[#00E600] font-bold outline-none font-mono text-right"
        />
        <span className="text-[10px] text-slate-600 font-mono ml-1 w-6 text-right">{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit, color }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${color} text-right flex-1`}>{value} <span className="text-[10px] text-slate-500 font-normal">{unit}</span></span>
    </div>
  );
}

function SectionGuide({ type }) {
  const s = { stroke: '#475569', strokeWidth: 2, fill: 'none' };
  const t = { fill: '#00E600', fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold' };
  
  const getSvgContent = () => {
    switch (type) {
      case 'H': return (
        <>
          <path d="M 20,20 L 80,20 M 20,80 L 80,80 M 50,20 L 50,80" {...s} strokeWidth={6} />
          <text x="45" y="15" {...t}>W</text><text x="5" y="55" {...t}>H</text>
          <text x="55" y="55" {...t}>tw</text><text x="85" y="25" {...t}>tf</text>
        </>
      );
      case 'BAR': return (
        <>
          <rect x="20" y="25" width="60" height="50" {...s} fill="#1e293b" />
          <text x="45" y="15" {...t}>W</text><text x="5" y="55" {...t}>H</text>
        </>
      );
      case 'L': return (
        <>
          <path d="M 20,20 L 20,80 L 80,80" {...s} strokeWidth={8} />
          <text x="45" y="95" {...t}>W</text><text x="5" y="55" {...t}>H</text>
          <text x="25" y="45" {...t}>tw</text><text x="65" y="70" {...t}>tf</text>
        </>
      );
      case 'T': return (
        <>
          <path d="M 20,20 L 80,20 M 50,20 L 50,80" {...s} strokeWidth={8} />
          <text x="45" y="15" {...t}>W</text><text x="30" y="55" {...t}>H</text>
          <text x="55" y="55" {...t}>tw</text><text x="85" y="25" {...t}>tf</text>
        </>
      );
      case 'CHAN': return (
        <>
          <path d="M 80,20 L 20,20 L 20,80 L 80,80" {...s} strokeWidth={8} />
          <text x="45" y="15" {...t}>W</text><text x="5" y="55" {...t}>H</text>
          <text x="25" y="55" {...t}>tw</text><text x="85" y="25" {...t}>tf</text>
        </>
      );
      case 'TUBE': return (
        <>
          <circle cx="50" cy="50" r="35" {...s} />
          <circle cx="50" cy="50" r="25" {...s} />
          <text x="45" y="55" {...t}>D</text><text x="80" y="55" {...t}>t</text>
        </>
      );
      case 'ROD': return (
        <>
          <circle cx="50" cy="50" r="35" {...s} fill="#1e293b" />
          <text x="45" y="55" {...t}>D</text>
        </>
      );
      default: return null;
    }
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
      {getSvgContent()}
    </svg>
  );
}
