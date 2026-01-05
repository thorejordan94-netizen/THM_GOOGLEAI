import React from 'react';
import { RoomData } from '../types';
import { CATEGORY_COLOR_MAP } from '../constants';
import { Activity, Clock, Layers, Bug, Lock, Boxes, KeyRound, Cloud, Globe, Fingerprint, Flame, Shield, Network, Terminal, Code2 } from 'lucide-react';

interface RoomCardProps {
  room: RoomData;
  onClick: () => void;
  selectedTeamId?: string;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
}

// Optimized helper: Direct color map lookup for icon coloring
const getIconColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('web')) return 'text-orange-400';
    if (c.includes('network')) return 'text-cyan-400';
    if (c.includes('windows')) return 'text-purple-400';
    if (c.includes('linux')) return 'text-emerald-400';
    if (c.includes('red') || c.includes('offensive')) return 'text-red-400';
    return 'text-slate-400';
};

const RoomCardComponent: React.FC<RoomCardProps> = ({ room, onClick, selectedTeamId = 'all', onTagClick, onToolClick }) => {
  const isComplete = room.status === 'complete' && room.metadata;
  const primaryHex = isComplete && CATEGORY_COLOR_MAP[room.metadata!.mainCategory] 
    ? CATEGORY_COLOR_MAP[room.metadata!.mainCategory] 
    : '#94a3b8';

  let displayScore = 0;
  if (room.analysis) {
    displayScore = selectedTeamId === 'all' 
        ? room.analysis.reduce((sum, item) => sum + item.score, 0)
        : room.analysis.find(a => a.jobId === selectedTeamId)?.score || 0;
  }

  const scoreColor = displayScore > (selectedTeamId === 'all' ? 20 : 4) ? 'text-emerald-400' 
                   : displayScore > (selectedTeamId === 'all' ? 10 : 2) ? 'text-yellow-400' 
                   : 'text-slate-600';

  return (
    <div 
        onClick={onClick}
        className="relative bg-[#0a0b10] border border-white/5 hover:border-[var(--hex)] transition-colors duration-200 cursor-pointer overflow-hidden group flex flex-col h-[160px]"
        style={{ '--hex': primaryHex } as React.CSSProperties}
    >
        {/* Top Bar: Name + Score */}
        <div className="flex justify-between items-start p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 min-w-0">
                <div className={`w-1.5 h-8 rounded-sm ${isComplete ? '' : 'animate-pulse bg-slate-800'}`} style={{backgroundColor: isComplete ? primaryHex : undefined}}></div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider leading-none truncate">
                        {isComplete ? room.metadata?.mainCategory : 'PENDING'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 truncate leading-tight group-hover:text-white transition-colors" title={room.name}>
                        {room.name}
                    </h3>
                </div>
            </div>
            {isComplete && (
                <div className={`text-xl font-mono font-bold leading-none ${scoreColor}`}>
                    {displayScore}
                </div>
            )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-3 flex flex-col min-h-0 relative">
            {isComplete ? (
                <>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-auto">
                        {room.metadata!.summary || room.metadata!.description}
                    </p>
                    
                    {/* Compact Footer Info */}
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {room.metadata!.timeEstimate}</span>
                            <span className={`uppercase font-bold ${room.metadata!.difficulty === 'Easy' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {room.metadata!.difficulty}
                            </span>
                        </div>
                        
                        {/* Dense Tool/Tag List */}
                        <div className="flex flex-wrap gap-1 h-[20px] overflow-hidden mask-fade-bottom">
                            {room.metadata!.tools.slice(0, 4).map(t => (
                                <span key={t} onClick={e => {e.stopPropagation(); onToolClick && onToolClick(t)}} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] text-slate-300 hover:border-[var(--hex)] hover:text-[var(--hex)] transition-colors">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
                    {room.status === 'analyzing' ? (
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Activity className="w-6 h-6 text-slate-600" />
                    )}
                    <span className="text-[9px] uppercase tracking-widest text-slate-500">{room.status}</span>
                </div>
            )}
        </div>
    </div>
  );
};

export const RoomCard = React.memo(RoomCardComponent);
