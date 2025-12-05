import React from 'react';
import { DNAState } from '../types';
import { BASES, COLORS } from '../constants';

interface ControlsProps {
  state: DNAState;
  onChange: (updates: Partial<DNAState>) => void;
  onMutate: () => void;
  onResetCam: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ state, onChange, onMutate, onResetCam }) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-2xl text-white w-80 font-mono flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-green-400 tracking-wider">HELIX LAB</h1>
        <div className="h-0.5 w-full bg-gradient-to-r from-green-500 to-transparent mt-2 mb-1"></div>
        <p className="text-xs text-gray-400">Interactive DNA Sequencer</p>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <label className="text-gray-300">Length (bp)</label>
            <span className="text-green-400">{state.length}</span>
          </div>
          <input
            type="range"
            min="6"
            max="60"
            step="1"
            value={state.length}
            onChange={(e) => onChange({ length: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <label className="text-gray-300">Twist (°)</label>
            <span className="text-blue-400">{state.twist}°</span>
          </div>
          <input
            type="range"
            min="30"
            max="36"
            step="0.1"
            value={state.twist}
            onChange={(e) => onChange({ twist: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
             <label className="text-gray-300">Spin Speed</label>
             <span className="text-yellow-400">{state.spinSpeed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={state.spinSpeed}
            onChange={(e) => onChange({ spinSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onMutate}
          className="col-span-2 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 rounded-lg font-bold tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:animate-pulse">⚡</span> MUTATE
        </button>
        
        <button
          onClick={onResetCam}
          className="py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
        >
          Reset View
        </button>
        
        <button
          onClick={() => onChange({ autoSpin: !state.autoSpin })}
          className={`py-2 rounded-lg text-sm transition-colors border ${state.autoSpin ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-700 border-transparent text-gray-200 hover:bg-gray-600'}`}
        >
          {state.autoSpin ? 'Spinning' : 'Paused'}
        </button>
      </div>

      {/* Legend */}
      <div className="bg-black/30 p-3 rounded-lg">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">Base Key</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {BASES.map(base => (
            <div key={base} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: '#' + COLORS[base].getHexString() }}></div>
              <span className="text-gray-300 font-bold">{base}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};