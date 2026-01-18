 import React, { useState, useEffect, useRef } from 'react';
 import { CrossfaderCurve } from '../types';
 
 interface MixerProps {
   className?: string;
   crossfader: number;
   onCrossfaderChange: (val: number) => void;
   crossfaderCurve: CrossfaderCurve;
   onCurveChange: (curve: CrossfaderCurve) => void;
   masterVolume: number;
   onMasterVolumeChange: (val: number) => void;
   deckAVolume: number;
   onDeckAVolumeChange: (val: number) => void;
   deckBVolume: number;
   onDeckBVolumeChange: (val: number) => void;
   deckAPlaying: boolean;
   deckBPlaying: boolean;
   deckAEq: { hi: number, mid: number, low: number, filter: number };
   deckBEq: { hi: number, mid: number, low: number, filter: number };
   onDeckAEqChange: (key: string, val: number) => void;
   onDeckBEqChange: (key: string, val: number) => void;
 }
 
 const Knob: React.FC<{
   label: string,
   value: number,
   onChange: (val: number) => void,
   color: string,
   min?: number,
   max?: number,
   defaultValue?: number,
   size?: 'sm' | 'md'
 }> = ({ label, value, onChange, color, min = 0, max = 2, defaultValue = 1, size = 'md' }) => {
   const [isDragging, setIsDragging] = useState(false);
   const startY = useRef(0);
   const startVal = useRef(0);
   const activePointerId = useRef<number | null>(null);
   const knobRef = useRef<HTMLDivElement>(null);
-  const knobSize = size === 'sm' ? 'w-12 h-12' : 'w-14 h-14';
-  const innerSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
+  const lastTapRef = useRef(0);
+  const knobSize = size === 'sm' ? 'w-11 h-11' : 'w-12 h-12';
+  const innerSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
+
+  const handleDoubleTap = (event: React.PointerEvent | React.MouseEvent) => {
+    const now = Date.now();
+    if (now - lastTapRef.current < 280) {
+      event.preventDefault();
+      onChange(defaultValue);
+      lastTapRef.current = 0;
+      return true;
+    }
+    lastTapRef.current = now;
+    return false;
+  };
 
- const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
+  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
+    if (handleDoubleTap(e)) return;
     e.preventDefault();
     e.currentTarget.setPointerCapture(e.pointerId);
     activePointerId.current = e.pointerId;
     setIsDragging(true);
-   startY.current = e.clientY;
+    startY.current = e.clientY;
     startVal.current = value;
     document.body.style.cursor = 'ns-resize';
   };
 
-  const handleDoubleClick = () => onChange(defaultValue);
+  const handleDoubleClick = (e: React.MouseEvent) => {
+    e.preventDefault();
+    onChange(defaultValue);
+  };
 
   const handleWheel = (e: WheelEvent) => {
     e.preventDefault();
     const delta = e.deltaY * -0.002;
     const newVal = Math.min(max, Math.max(min, value + delta));
     onChange(newVal);
   };
 
   useEffect(() => {
     const el = knobRef.current;
     if (el) el.addEventListener('wheel', handleWheel, { passive: false });
     return () => el?.removeEventListener('wheel', handleWheel);
   }, [value, onChange, min, max]);
 
-   const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
+  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
     if (!isDragging || activePointerId.current !== e.pointerId) return;
     const deltaY = startY.current - e.clientY;
     const sensitivity = 0.007;
     const newVal = Math.min(max, Math.max(min, startVal.current + deltaY * sensitivity));
     onChange(newVal);
   };
 
   const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
     if (activePointerId.current !== e.pointerId) return;
     activePointerId.current = null;
     setIsDragging(false);
     document.body.style.cursor = 'default';
   };
 
   const rotation = ((value - min) / (max - min)) * 270 - 135;
   const progress = (value - min) / (max - min);
 
   return (
-    <div className="flex flex-col items-center gap-0 group select-none">
+    <div className="flex flex-col items-center gap-0.5 group select-none">
       <div 
         ref={knobRef}
         className={`relative ${knobSize} flex items-center justify-center cursor-ns-resize transition-transform duration-150 touch-none m3-touch touch-target ${isDragging ? 'scale-110' : ''}`}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}
         onDoubleClick={handleDoubleClick}
       >
         <svg className="w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="40" className="fill-none stroke-black/60 stroke-[8]" />
           <circle 
             cx="50" cy="50" r="40" 
             className="fill-none stroke-[10] transition-all duration-300" 
             style={{ 
               stroke: color, 
               strokeDasharray: '251.2', 
               strokeDashoffset: 251.2 - (251.2 * progress),
               opacity: isDragging ? 1 : 0.6
             }} 
           />
         </svg>
         <div 
           className={`absolute ${innerSize} bg-[#1D1B20] rounded-full border border-white/10 shadow-lg flex items-center justify-center transition-transform duration-75 pointer-events-none ${isDragging ? 'border-white/40' : ''}`}
           style={{ transform: `rotate(${rotation}deg)` }}
         >
           <div className="w-0.5 h-2.5 bg-white/60 absolute top-0.5 rounded-full" />
         </div>
       </div>
-      <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors pointer-events-none ${isDragging ? 'text-white' : 'text-gray-400 group-hover:text-white/60'}`}>{label}</span>
+      <button
+        type="button"
+        onPointerDown={handleDoubleTap}
+        onDoubleClick={handleDoubleClick}
+        className={`text-[9px] font-black uppercase tracking-tighter transition-colors px-1 py-0.5 rounded-md m3-touch ${isDragging ? 'text-white' : 'text-gray-400 group-hover:text-white/70'}`}
+        aria-label={`${label} knob`}
+      >
+        {label}
+      </button>
     </div>
   );
 };
 
 const Fader: React.FC<{
   label: string,
   value: number,
   onChange: (val: number) => void,
   color: string,
-  height?: string
-}> = ({ label, value, onChange, color, height = 'h-32' }) => {
+  height?: string,
+  defaultValue?: number
+}> = ({ label, value, onChange, color, height = 'h-24', defaultValue = 0.8 }) => {
   const faderRef = useRef<HTMLDivElement>(null);
   const activePointerId = useRef<number | null>(null);
+  const lastTapRef = useRef(0);
+
+  const handleDoubleTap = (event: React.PointerEvent | React.MouseEvent) => {
+    const now = Date.now();
+    if (now - lastTapRef.current < 280) {
+      event.preventDefault();
+      onChange(defaultValue);
+      lastTapRef.current = 0;
+      return true;
+    }
+    lastTapRef.current = now;
+    return false;
+  };
 
   const handleWheel = (e: WheelEvent) => {
     e.preventDefault();
     const delta = e.deltaY * -0.0006;
     const newVal = Math.min(1, Math.max(0, value + delta));
     onChange(newVal);
   };
 
   useEffect(() => {
     const el = faderRef.current;
     if (el) el.addEventListener('wheel', handleWheel, { passive: false });
     return () => el?.removeEventListener('wheel', handleWheel);
   }, [value, onChange]);
 
   const updateValueFromPointer = (clientY: number) => {
     const rect = faderRef.current?.getBoundingClientRect();
     if (!rect) return;
     const next = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
     onChange(next);
   };
 
   const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
+    if (handleDoubleTap(e)) return;
     e.preventDefault();
     e.currentTarget.setPointerCapture(e.pointerId);
     activePointerId.current = e.pointerId;
     updateValueFromPointer(e.clientY);
   };
 
   const handlePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
     if (activePointerId.current !== e.pointerId) return;
     updateValueFromPointer(e.clientY);
   };
 
   const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
     if (activePointerId.current !== e.pointerId) return;
     activePointerId.current = null;
   };
 
+  const handleDoubleClick = (e: React.MouseEvent) => {
+    e.preventDefault();
+    onChange(defaultValue);
+  };
+
   return (
-    <div className="flex flex-col items-center gap-2 w-full group relative">
-       <div 
-         ref={faderRef}
-            className={`${height} w-12 bg-black/40 rounded-lg relative flex items-end p-1 border border-white/5 overflow-hidden cursor-ns-resize shadow-inner touch-none m3-touch touch-target`}
-       >
-          <div 
-            className="w-full rounded transition-all duration-75" 
-            style={{ 
-              height: `${value * 100}%`,
-              backgroundColor: color,
-              boxShadow: `0 0 15px ${color}66`
-            }} 
-          />
-          <input 
-             type="range" min="0" max="1" step="0.001" value={value} 
-             onChange={(e) => onChange(parseFloat(e.target.value))} 
-             onDoubleClick={() => onChange(0.8)}
-             className="absolute inset-0 opacity-0 cursor-pointer z-20"
-             style={{ WebkitAppearance: 'slider-vertical', appearance: 'slider-vertical' as any }}
-             onPointerDown={handlePointerDown}
-             onPointerMove={handlePointerMove}
-             onPointerUp={handlePointerUp}
-             onPointerCancel={handlePointerUp}
-          />
-       </div>
-       <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${color}99` }}>{label}</label>
+    <div className="flex flex-col items-center gap-1.5 w-full group relative">
+      <div 
+        ref={faderRef}
+        className={`${height} w-full bg-black/40 rounded-lg relative flex items-end p-1 border border-white/5 overflow-hidden cursor-ns-resize shadow-inner touch-none m3-touch touch-target`}
+        onPointerDown={handleDoubleTap}
+        onDoubleClick={handleDoubleClick}
+      >
+        <div 
+          className="w-full rounded transition-all duration-75" 
+          style={{ 
+            height: `${value * 100}%`,
+            backgroundColor: color,
+            boxShadow: `0 0 15px ${color}66`
+          }} 
+        />
+        <input 
+          type="range" min="0" max="1" step="0.001" value={value} 
+          onChange={(e) => onChange(parseFloat(e.target.value))} 
+          className="absolute inset-0 opacity-0 cursor-pointer z-20"
+          style={{ WebkitAppearance: 'slider-vertical', appearance: 'slider-vertical' as any }}
+          onPointerDown={handlePointerDown}
+          onPointerMove={handlePointerMove}
+          onPointerUp={handlePointerUp}
+          onPointerCancel={handlePointerUp}
+        />
+      </div>
+      <button
+        type="button"
+        onPointerDown={handleDoubleTap}
+        onDoubleClick={handleDoubleClick}
+        className="text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded-md m3-touch"
+        style={{ color: `${color}99` }}
+        aria-label={`${label} fader`}
+      >
+        {label}
+      </button>
+    </div>
+  );
+};
+
+const HorizontalFader: React.FC<{
+  label: string,
+  value: number,
+  onChange: (val: number) => void,
+  color: string,
+  defaultValue?: number
+}> = ({ label, value, onChange, color, defaultValue = 0.8 }) => {
+  const trackRef = useRef<HTMLDivElement>(null);
+  const activePointerId = useRef<number | null>(null);
+  const lastTapRef = useRef(0);
+
+  const handleDoubleTap = (event: React.PointerEvent | React.MouseEvent) => {
+    const now = Date.now();
+    if (now - lastTapRef.current < 280) {
+      event.preventDefault();
+      onChange(defaultValue);
+      lastTapRef.current = 0;
+      return true;
+    }
+    lastTapRef.current = now;
+    return false;
+  };
+
+  const updateValueFromPointer = (clientX: number) => {
+    const rect = trackRef.current?.getBoundingClientRect();
+    if (!rect) return;
+    const next = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
+    onChange(next);
+  };
+
+  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
+    if (handleDoubleTap(e)) return;
+    e.preventDefault();
+    e.currentTarget.setPointerCapture(e.pointerId);
+    activePointerId.current = e.pointerId;
+    updateValueFromPointer(e.clientX);
+  };
+
+  const handlePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
+    if (activePointerId.current !== e.pointerId) return;
+    updateValueFromPointer(e.clientX);
+  };
+
+  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
+    if (activePointerId.current !== e.pointerId) return;
+    activePointerId.current = null;
+  };
+
+  const handleDoubleClick = (e: React.MouseEvent) => {
+    e.preventDefault();
+    onChange(defaultValue);
+  };
+
+  return (
+    <div className="flex flex-col items-center gap-1 w-full">
+      <div
+        ref={trackRef}
+        className="w-full h-4 rounded-full bg-black/40 border border-white/5 relative overflow-hidden shadow-inner touch-none m3-touch touch-target"
+        onPointerDown={handleDoubleTap}
+        onDoubleClick={handleDoubleClick}
+      >
+        <div
+          className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
+          style={{ width: `${value * 100}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}66` }}
+        />
+        <div
+          className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-white/10 pointer-events-none"
+        />
+        <div
+          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-white/40 bg-[#1D1B20] shadow"
+          style={{ left: `calc(${value * 100}% - 0.1875rem)` }}
+        />
+        <input
+          type="range" min="0" max="1" step="0.001" value={value}
+          onChange={(e) => onChange(parseFloat(e.target.value))}
+          className="absolute inset-0 opacity-0 cursor-pointer z-20"
+          onPointerDown={handlePointerDown}
+          onPointerMove={handlePointerMove}
+          onPointerUp={handlePointerUp}
+          onPointerCancel={handlePointerUp}
+        />
+      </div>
+      <button
+        type="button"
+        onPointerDown={handleDoubleTap}
+        onDoubleClick={handleDoubleClick}
+        className="text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded-md m3-touch"
+        style={{ color: `${color}99` }}
+        aria-label={`${label} fader`}
+      >
+        {label}
+      </button>
     </div>
   );
 };
 
 const Mixer: React.FC<MixerProps> = ({ 
   className,
   crossfader, onCrossfaderChange, crossfaderCurve, onCurveChange,
   masterVolume, onMasterVolumeChange, deckAVolume, onDeckAVolumeChange, deckBVolume, onDeckBVolumeChange,
   deckAPlaying, deckBPlaying,
   deckAEq, deckBEq, onDeckAEqChange, onDeckBEqChange
 }) => {
   const [cueA, setCueA] = useState(false);
   const [cueB, setCueB] = useState(false);
   const crossfaderRef = useRef<HTMLDivElement>(null);
   const crossfaderPointerId = useRef<number | null>(null);
+  const crossfaderTapRef = useRef(0);
 
   // Mouse wheel support for smooth transitions
   useEffect(() => {
     const el = crossfaderRef.current;
     if (!el) return;
 
     const handleWheel = (e: WheelEvent) => {
       e.preventDefault();
       // Professional DJ sensitivity for crossfader: refined delta multiplier for precise control
       const sensitivity = 0.0012; 
       const delta = e.deltaY * -sensitivity;
       const newVal = Math.min(1, Math.max(-1, crossfader + delta));
       onCrossfaderChange(newVal);
     };
 
     el.addEventListener('wheel', handleWheel, { passive: false });
     return () => el.removeEventListener('wheel', handleWheel);
   }, [crossfader, onCrossfaderChange]);
 
+  const handleCrossfaderDoubleTap = (event: React.PointerEvent | React.MouseEvent) => {
+    const now = Date.now();
+    if (now - crossfaderTapRef.current < 280) {
+      event.preventDefault();
+      onCrossfaderChange(0);
+      crossfaderTapRef.current = 0;
+      return true;
+    }
+    crossfaderTapRef.current = now;
+    return false;
+  };
+
   const updateCrossfaderFromPointer = (clientX: number) => {
     const rect = crossfaderRef.current?.getBoundingClientRect();
     if (!rect) return;
     const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
-    const padding = rootFont;
-    const handleWidth = rootFont * 6;
+    const padding = rootFont * 0.75;
+    const handleWidth = rootFont * 5;
     const usable = Math.max(1, rect.width - padding * 2 - handleWidth);
     const x = Math.min(Math.max(clientX - rect.left - padding - handleWidth / 2, 0), usable);
     const t = x / usable;
     const newVal = t * 2 - 1;
     onCrossfaderChange(newVal);
   };
 
   const handleCrossfaderPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
+    if (handleCrossfaderDoubleTap(e)) return;
     e.preventDefault();
     e.currentTarget.setPointerCapture(e.pointerId);
     crossfaderPointerId.current = e.pointerId;
     updateCrossfaderFromPointer(e.clientX);
   };
 
   const handleCrossfaderPointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
     if (crossfaderPointerId.current !== e.pointerId) return;
     updateCrossfaderFromPointer(e.clientX);
   };
 
   const handleCrossfaderPointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
     if (crossfaderPointerId.current !== e.pointerId) return;
     crossfaderPointerId.current = null;
   };
 
   return (
-    <div className={`m3-card h-full flex flex-col bg-[#1D1B20] shadow-2xl border-white/5 w-full max-w-[360px] md:w-[280px] shrink-0 p-3 select-none ${className ?? ''}`} role="region" aria-label="Mixer Controls">
-      <div className="flex flex-col items-center gap-0 border-b border-white/5 pb-2 mb-2">
-        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#D0BCFF]">Mixing Console</h2>
+    <div className={`m3-card flex flex-col bg-[#1D1B20] shadow-2xl border-white/5 w-full max-w-[360px] md:w-[280px] shrink-0 p-2 select-none ${className ?? ''}`} role="region" aria-label="Mixer Controls">
+      <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
+        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D0BCFF]">Mixer</h2>
+        <span className="text-[9px] text-white/40 uppercase tracking-[0.25em]">Double‑tap reset</span>
       </div>
 
-      <div className="flex-1 flex justify-between gap-1 overflow-hidden">
+      <div className="grid grid-cols-2 gap-2">
         {/* Channel A Section */}
-        <div className="flex flex-col items-center gap-3 bg-black/10 p-2 rounded-xl flex-1 border border-white/5">
-          <div className="flex flex-col items-center gap-1.5 w-full">
-            <Knob label="Trim" value={1} onChange={() => {}} color="#D0BCFF" size="sm" defaultValue={1} />
-            <div className="w-full h-px bg-white/5" />
-            <div className="flex flex-col gap-1.5">
-              <Knob label="Hi" value={deckAEq.hi} onChange={(v) => onDeckAEqChange('hi', v)} color="#D0BCFF" />
-              <Knob label="Mid" value={deckAEq.mid} onChange={(v) => onDeckAEqChange('mid', v)} color="#D0BCFF" />
-              <Knob label="Low" value={deckAEq.low} onChange={(v) => onDeckAEqChange('low', v)} color="#D0BCFF" />
-              <Knob label="Color" value={deckAEq.filter} onChange={(v) => onDeckAEqChange('filter', v)} color="#D0BCFF" min={-1} max={1} defaultValue={0} />
-            </div>
+        <div className="flex flex-col gap-2 bg-black/10 p-2 rounded-xl border border-white/5">
+          <div className="flex items-center justify-between">
+            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D0BCFF]">Deck A</span>
+            <button 
+              onClick={() => setCueA(!cueA)}
+              className={`w-10 h-10 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border m3-touch touch-target ${cueA ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-black/40 border-white/5 text-gray-200'}`}
+            >
+              Cue
+            </button>
+          </div>
+          <div className="grid grid-cols-2 gap-3 place-items-center">
+            <Knob label="Hi" value={deckAEq.hi} onChange={(v) => onDeckAEqChange('hi', v)} color="#D0BCFF" size="sm" />
+            <Knob label="Mid" value={deckAEq.mid} onChange={(v) => onDeckAEqChange('mid', v)} color="#D0BCFF" size="sm" />
+            <Knob label="Low" value={deckAEq.low} onChange={(v) => onDeckAEqChange('low', v)} color="#D0BCFF" size="sm" />
+            <Knob label="Color" value={deckAEq.filter} onChange={(v) => onDeckAEqChange('filter', v)} color="#D0BCFF" min={-1} max={1} defaultValue={0} size="sm" />
+          </div>
+          <div className="pt-1">
+            <HorizontalFader label="VOL" value={deckAVolume} onChange={onDeckAVolumeChange} color="#D0BCFF" defaultValue={0.8} />
           </div>
-
-          <button 
-            onClick={() => setCueA(!cueA)}
-            className={`w-12 h-12 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border m3-touch touch-target ${cueA ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-black/40 border-white/5 text-gray-200'}`}
-          >
-            Cue
-          </button>
-          
-          <Fader label="A" value={deckAVolume} onChange={onDeckAVolumeChange} color="#D0BCFF" />
         </div>
 
         {/* Master Section */}
-        <div className="flex flex-col items-center gap-2 py-2 px-1 w-12 bg-black/30 rounded-xl border border-white/5 mx-0.5">
-           <div className="flex flex-col gap-0.5 items-center flex-1 py-1">
-             {[...Array(20)].reverse().map((_, i) => {
-               const isActive = (deckAPlaying || deckBPlaying) && (Math.random() > (i / 20));
-               let barColor = 'bg-green-900/10';
-               if (isActive) {
-                 if (i > 16) barColor = 'bg-red-500 shadow-[0_0_6px_red]';
-                 else if (i > 12) barColor = 'bg-orange-500 shadow-[0_0_4px_orange]';
-                 else barColor = 'bg-green-500 shadow-[0_0_3px_#22c55e]';
-               }
-               return <div key={i} className={`w-2 h-0.5 rounded-[0.5px] transition-all duration-75 ${barColor}`} />;
-             })}
-           </div>
-           
-           <Fader label="MST" value={masterVolume} onChange={onMasterVolumeChange} color="#FFFFFF" height="h-24" />
-        </div>
-
         {/* Channel B Section */}
-        <div className="flex flex-col items-center gap-3 bg-black/10 p-2 rounded-xl flex-1 border border-white/5">
-          <div className="flex flex-col items-center gap-1.5 w-full">
-            <Knob label="Trim" value={1} onChange={() => {}} color="#F2B8B5" size="sm" defaultValue={1} />
-            <div className="w-full h-px bg-white/5" />
-            <div className="flex flex-col gap-1.5">
-              <Knob label="Hi" value={deckBEq.hi} onChange={(v) => onDeckBEqChange('hi', v)} color="#F2B8B5" />
-              <Knob label="Mid" value={deckBEq.mid} onChange={(v) => onDeckBEqChange('mid', v)} color="#F2B8B5" />
-              <Knob label="Low" value={deckBEq.low} onChange={(v) => onDeckBEqChange('low', v)} color="#F2B8B5" />
-              <Knob label="Color" value={deckBEq.filter} onChange={(v) => onDeckBEqChange('filter', v)} color="#F2B8B5" min={-1} max={1} defaultValue={0} />
-            </div>
+        <div className="flex flex-col gap-2 bg-black/10 p-2 rounded-xl border border-white/5">
+          <div className="flex items-center justify-between">
+            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2B8B5]">Deck B</span>
+            <button 
+              onClick={() => setCueB(!cueB)}
+              className={`w-10 h-10 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border m3-touch touch-target ${cueB ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-black/40 border-white/5 text-gray-200'}`}
+            >
+              Cue
+            </button>
           </div>
+          <div className="grid grid-cols-2 gap-3 place-items-center">
+            <Knob label="Hi" value={deckBEq.hi} onChange={(v) => onDeckBEqChange('hi', v)} color="#F2B8B5" size="sm" />
+            <Knob label="Mid" value={deckBEq.mid} onChange={(v) => onDeckBEqChange('mid', v)} color="#F2B8B5" size="sm" />
+            <Knob label="Low" value={deckBEq.low} onChange={(v) => onDeckBEqChange('low', v)} color="#F2B8B5" size="sm" />
+            <Knob label="Color" value={deckBEq.filter} onChange={(v) => onDeckBEqChange('filter', v)} color="#F2B8B5" min={-1} max={1} defaultValue={0} size="sm" />
+          </div>
+          <div className="pt-1">
+            <HorizontalFader label="VOL" value={deckBVolume} onChange={onDeckBVolumeChange} color="#F2B8B5" defaultValue={0.8} />
+          </div>
+        </div>
+      </div>
 
-          <button 
-            onClick={() => setCueB(!cueB)}
-            className={`w-12 h-12 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border m3-touch touch-target ${cueB ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-black/40 border-white/5 text-gray-200'}`}
-          >
-            Cue
-          </button>
-
-          <Fader label="B" value={deckBVolume} onChange={onDeckBVolumeChange} color="#F2B8B5" />
+      <div className="flex justify-center pt-2">
+        <div className="w-32 flex flex-col items-center gap-2">
+          <div className="flex flex-col gap-0.5 items-center">
+            {[...Array(10)].reverse().map((_, i) => {
+              const isActive = (deckAPlaying || deckBPlaying) && (Math.random() > (i / 10));
+              let barColor = 'bg-green-900/10';
+              if (isActive) {
+                if (i > 7) barColor = 'bg-red-500 shadow-[0_0_6px_red]';
+                else if (i > 5) barColor = 'bg-orange-500 shadow-[0_0_4px_orange]';
+                else barColor = 'bg-green-500 shadow-[0_0_3px_#22c55e]';
+              }
+              return <div key={i} className={`w-16 h-px rounded-full transition-all duration-75 ${barColor}`} />;
+            })}
+          </div>
+          <Knob label="MST" value={masterVolume} onChange={onMasterVolumeChange} color="#FFFFFF" min={0} max={1} defaultValue={0.9} />
         </div>
       </div>
 
-      {/* Crossfader Section - Enhanced visual design */}
-      <div className="mt-4 space-y-2 pt-2 border-t border-white/5 relative">
-        <div className="flex justify-between gap-1 p-1 bg-black/30 rounded-lg mb-1">
-          {['SMOOTH', 'CUT', 'DIP'].map(curve => (
-            <button 
-              key={curve} 
-              onClick={() => onCurveChange(curve as CrossfaderCurve)} 
-              className={`flex-1 py-2 text-[10px] font-black rounded-md transition-all m3-touch touch-target ${crossfaderCurve === curve ? 'bg-[#D0BCFF] text-black shadow-lg' : 'text-gray-200 hover:text-white'}`}
+      {/* Crossfader Section - Compact */}
+      <div className="mt-2 space-y-1.5 pt-2 border-t border-white/5 relative">
+        <div className="flex items-center justify-between gap-2 bg-black/30 rounded-xl border border-white/5 px-2 py-2">
+          <div className="flex flex-col gap-2 flex-1">
+            <div className="flex justify-between gap-1 p-1 bg-black/30 rounded-lg">
+              {['SMOOTH', 'CUT', 'DIP'].map(curve => (
+                <button 
+                  key={curve} 
+                  onClick={() => onCurveChange(curve as CrossfaderCurve)} 
+                  className={`flex-1 py-1.5 text-[9px] font-black rounded-md transition-all m3-touch touch-target ${crossfaderCurve === curve ? 'bg-[#D0BCFF] text-black shadow-lg' : 'text-gray-200 hover:text-white'}`}
+                >
+                  {curve}
+                </button>
+              ))}
+            </div>
+            <div 
+              ref={crossfaderRef}
+              className="bg-black/80 h-12 rounded-xl relative group flex items-center px-3 border border-white/10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden transition-all hover:border-white/20 touch-none"
+              onDoubleClick={(e) => {
+                e.preventDefault();
+                onCrossfaderChange(0);
+              }}
+              onPointerDown={handleCrossfaderDoubleTap}
+              title="Scroll to Mix • Double-tap to Center (50/0)"
             >
-              {curve}
-            </button>
-          ))}
-        </div>
-        
-        {/* Redesigned Professional Crossfader with tactile feel */}
-        <div 
-          ref={crossfaderRef}
-              className="bg-black/80 h-14 rounded-xl relative group flex items-center px-4 border border-white/10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden transition-all hover:border-white/20 touch-none"
-          onDoubleClick={() => onCrossfaderChange(0)}
-          title="Scroll to Mix • Double-click to Center (50/0)"
-        >
-           {/* Precision Center indicator marker */}
-           <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-6 bg-white/10 z-0 rounded-full" />
-           
-           {/* Visual track guides */}
-           <div className="absolute inset-x-8 h-[1px] bg-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
-           <div className="absolute left-10 w-[1px] h-3 bg-white/5 pointer-events-none" />
-           <div className="absolute right-10 w-[1px] h-3 bg-white/5 pointer-events-none" />
-
-           {/* Professional Aluminum-style Crossfader Handle */}
-           <div 
-             className="absolute top-1/2 -translate-y-1/2 w-24 h-12 bg-[#323038] rounded-md border border-white/20 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center transition-all duration-150 z-10 group-hover:border-[#D0BCFF]/40 active:scale-95 active:shadow-inner"
-             style={{ 
-               left: `calc(1rem + ${(crossfader + 1) / 2} * (100% - 2rem - 6rem))`,
-             }}
-           >
-             {/* Tactile Handle Ridges */}
-             <div className="flex gap-[3px]">
-               <div className="w-[1.5px] h-6 bg-black/60 rounded-full" />
-               <div className="w-[1.5px] h-6 bg-white/20 rounded-full" />
-               <div className="w-[1.5px] h-6 bg-black/60 rounded-full" />
-             </div>
-             
-             {/* Visual percentage badge (appears on hover) */}
-             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#D0BCFF] text-black text-xs font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pointer-events-none shadow-2xl border border-white/20 uppercase tracking-tighter whitespace-nowrap">
-               {Math.abs(crossfader) < 0.01 ? '50% Center' : `${Math.round(((crossfader + 1) / 2) * 100)}%`}
-             </div>
-           </div>
-
-           {/* Hidden range input for standard touch/click interactions */}
-           <input 
-             type="range" min="-1" max="1" step="0.001" value={crossfader} 
-             onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))} 
-             className="absolute inset-0 opacity-0 cursor-pointer z-20"
-              onPointerDown={handleCrossfaderPointerDown}
-             onPointerMove={handleCrossfaderPointerMove}
-             onPointerUp={handleCrossfaderPointerUp}
-             onPointerCancel={handleCrossfaderPointerUp}
-           />
-        </div>
+              <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-5 bg-white/10 z-0 rounded-full" />
+              <div className="absolute inset-x-6 h-[1px] bg-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
+
+              <div 
+                className="absolute top-1/2 -translate-y-1/2 w-20 h-10 bg-[#323038] rounded-md border border-white/20 shadow-[0_10px_18px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center transition-all duration-150 z-10 group-hover:border-[#D0BCFF]/40 active:scale-95 active:shadow-inner"
+                style={{ 
+                  left: `calc(0.75rem + ${(crossfader + 1) / 2} * (100% - 1.5rem - 5rem))`,
+                }}
+              >
+                <div className="flex gap-[3px]">
+                  <div className="w-[1.5px] h-5 bg-black/60 rounded-full" />
+                  <div className="w-[1.5px] h-5 bg-white/20 rounded-full" />
+                  <div className="w-[1.5px] h-5 bg-black/60 rounded-full" />
+                </div>
+              </div>
+
+              <input 
+                type="range" min="-1" max="1" step="0.001" value={crossfader} 
+                onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))} 
+                className="absolute inset-0 opacity-0 cursor-pointer z-20"
+                onPointerDown={handleCrossfaderPointerDown}
+                onPointerMove={handleCrossfaderPointerMove}
+                onPointerUp={handleCrossfaderPointerUp}
+                onPointerCancel={handleCrossfaderPointerUp}
+              />
+            </div>
 
-        {/* Labels below the fader as seen in screenshots */}
-        <div className="flex justify-between items-center px-1 mt-1 font-black uppercase tracking-[0.25em]">
-           <span className={`text-[10px] transition-colors ${crossfader < -0.8 ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>Deck A</span>
-           <div className="flex flex-col items-center">
-             <span className={`text-xs font-mono transition-all duration-200 ${Math.abs(crossfader) < 0.05 ? 'text-white scale-125 glow-white' : 'text-gray-400'}`}>0</span>
-             <div className={`w-1 h-1 rounded-full transition-colors ${Math.abs(crossfader) < 0.05 ? 'bg-white shadow-[0_0_5px_white]' : 'bg-transparent'}`} />
-           </div>
-           <span className={`text-[10px] transition-colors ${crossfader > 0.8 ? 'text-[#F2B8B5]' : 'text-gray-400'}`}>Deck B</span>
+            <div 
+              className="flex justify-between items-center px-1 font-black uppercase tracking-[0.2em]"
+              onPointerDown={handleCrossfaderDoubleTap}
+              onDoubleClick={(e) => {
+                e.preventDefault();
+                onCrossfaderChange(0);
+              }}
+            >
+              <span className={`text-[9px] transition-colors ${crossfader < -0.8 ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>Deck A</span>
+              <div className="flex flex-col items-center">
+                <span className={`text-[10px] font-mono transition-all duration-200 ${Math.abs(crossfader) < 0.05 ? 'text-white scale-110 glow-white' : 'text-gray-400'}`}>0</span>
+                <div className={`w-1 h-1 rounded-full transition-colors ${Math.abs(crossfader) < 0.05 ? 'bg-white shadow-[0_0_5px_white]' : 'bg-transparent'}`} />
+              </div>
+              <span className={`text-[9px] transition-colors ${crossfader > 0.8 ? 'text-[#F2B8B5]' : 'text-gray-400'}`}>Deck B</span>
+            </div>
+          </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default Mixer;
