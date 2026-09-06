import React, { useState, useEffect, useRef, useCallback } from 'react';

const PALETTES = {
  neon: {
    name: 'Cyber Neon',
    bg: '#0a0a1a',
    line1: 'rgba(0, 255, 255, 0.8)',
    line2: 'rgba(255, 0, 255, 0.8)',
  },
  emerald: {
    name: 'Emerald Matrix',
    bg: '#021812',
    line1: 'rgba(0, 255, 102, 0.8)',
    line2: 'rgba(0, 255, 102, 0.6)',
  },
  solar: {
    name: 'Solar Flare',
    bg: '#1a0b05',
    line1: 'rgba(255, 153, 0, 0.8)',
    line2: 'rgba(255, 51, 0, 0.8)',
  },
  monochrome: {
    name: 'Stark Contrast',
    bg: '#ffffff',
    line1: 'rgba(0, 0, 0, 0.9)',
    line2: 'rgba(0, 0, 0, 0.9)',
  }
};

const MoirePatternLab = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  const [patternType, setPatternType] = useState('lines'); // 'lines', 'circles', 'dots'
  const [density, setDensity] = useState(80);
  const [speed, setSpeed] = useState(0.005);
  const [isAnimating, setIsAnimating] = useState(true);
  const [palette, setPalette] = useState('neon');
  const [baseOffset, setBaseOffset] = useState(0);

  const drawPattern = useCallback((ctx, width, height, currentOffset) => {
    const currentPalette = PALETTES[palette];
    
    ctx.fillStyle = currentPalette.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1.5;
    
    const drawBasePattern = (color) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      
      const maxDim = Math.max(width, height) * 1.5;
      const spacing = maxDim / (density / 2);
      
      if (patternType === 'lines') {
        for (let i = -maxDim; i <= maxDim; i += spacing) {
          ctx.moveTo(-maxDim, i);
          ctx.lineTo(maxDim, i);
        }
      } else if (patternType === 'circles') {
        for (let i = spacing; i <= maxDim; i += spacing) {
          ctx.moveTo(i, 0);
          ctx.arc(0, 0, i, 0, Math.PI * 2);
        }
      } else if (patternType === 'dots') {
         for (let x = -maxDim; x <= maxDim; x += spacing) {
            for (let y = -maxDim; y <= maxDim; y += spacing) {
               ctx.moveTo(x, y);
               ctx.arc(x, y, spacing * 0.25, 0, Math.PI * 2);
            }
         }
      }
      if (patternType === 'dots') {
         ctx.fill();
      } else {
         ctx.stroke();
      }
    };

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    drawBasePattern(currentPalette.line1);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, centerY);
    
    if (patternType === 'lines') {
       ctx.rotate(currentOffset);
    } else if (patternType === 'circles') {
       const tx = Math.sin(currentOffset * 2) * (width * 0.1);
       const ty = Math.cos(currentOffset * 2) * (height * 0.1);
       ctx.translate(tx, ty);
    } else if (patternType === 'dots') {
       ctx.rotate(currentOffset * 0.5);
       ctx.translate(Math.sin(currentOffset) * 40, Math.cos(currentOffset) * 40);
    }
    
    drawBasePattern(currentPalette.line2);
    ctx.restore();

  }, [patternType, density, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!isAnimating) {
         const ctx = canvas.getContext('2d');
         drawPattern(ctx, canvas.width, canvas.height, baseOffset);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawPattern, baseOffset, isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (isAnimating) {
        timeRef.current += speed;
        drawPattern(ctx, canvas.width, canvas.height, timeRef.current);
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        drawPattern(ctx, canvas.width, canvas.height, baseOffset);
      }
    };

    if (isAnimating) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawPattern, isAnimating, baseOffset, speed]);

  return (
    <div className="flex justify-center items-center min-h-[720px] p-5 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-black rounded-2xl m-5 shadow-2xl">
      <div className="bg-slate-900/90 text-slate-100 p-6 md:p-8 rounded-2xl max-w-6xl w-full shadow-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-white/10 gap-4">
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Optical Illusion</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Moiré Pattern Lab
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore mesmerizing interference patterns through overlapping geometric structures.
            </p>
          </div>
          
          <div className="flex gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-inner">
             <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Density</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{density}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">Type</span>
              <span className="text-sm font-bold text-fuchsia-400 capitalize mt-1 block">{patternType}</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] uppercase text-slate-400 font-semibold">State</span>
              <span className={`text-sm font-semibold capitalize mt-1 block ${isAnimating ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAnimating ? 'Active' : 'Static'}
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="relative w-full h-[460px] bg-black/60 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl group">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />
          <div className="absolute top-4 left-4 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-slate-900/80 text-cyan-300 text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Interference Visualization
            </span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          
          {/* Pattern Types */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Pattern Structure
            </label>
            <div className="flex flex-col gap-2">
              {['lines', 'circles', 'dots'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPatternType(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                    patternType === type
                      ? 'bg-slate-800 border-cyan-400/50 text-cyan-300 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Density & Speed */}
          <div className="space-y-4 col-span-1 md:col-span-2 bg-slate-800/40 p-4 rounded-xl border border-white/5">
             <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Pattern Density</span>
                <span className="font-mono text-cyan-400 font-bold">{density}</span>
              </div>
              <input
                type="range"
                min="20" max="200" step="5"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">Anim Speed / Offset</span>
                <span className="font-mono text-fuchsia-400 font-bold">{speed.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.001" max="0.02" step="0.001"
                value={speed}
                onChange={(e) => {
                  setSpeed(Number(e.target.value));
                  if(!isAnimating) {
                     setBaseOffset(Number(e.target.value) * 100);
                  }
                }}
                className="w-full accent-fuchsia-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Aesthetics
            </label>
            <div className="flex flex-col gap-2">
              {Object.entries(PALETTES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPalette(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${
                    palette === key
                      ? 'bg-slate-800 border-fuchsia-400/50 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span>{val.name}</span>
                  <span
                    className="w-4 h-4 rounded-full border border-slate-900 block"
                    style={{ background: `linear-gradient(135deg, ${val.line1}, ${val.line2})` }}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action button toolbar */}
        <div className="flex flex-wrap justify-end items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsAnimating(!isAnimating);
              if (!isAnimating) timeRef.current = baseOffset;
              else setBaseOffset(timeRef.current);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 border ${
              isAnimating 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-orange-500/25 border-orange-400/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-teal-500/25 border-teal-400/30'
            }`}
          >
            {isAnimating ? (
              <>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause Animation
              </>
            ) : (
              <>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Animation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoirePatternLab;
