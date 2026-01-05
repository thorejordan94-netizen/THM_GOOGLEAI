import React from 'react';
import { RoomData } from '../types';
import { Activity, Clock } from 'lucide-react';
import { CATEGORY_COLOR_MAP } from '../constants';

interface RoomListRowProps {
  room: RoomData;
  onClick: () => void;
  selectedTeamId?: string;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
}

const RoomListRowComponent: React.FC<RoomListRowProps> = ({ room, onClick, selectedTeamId = 'all', onTagClick, onToolClick }) => {
  const isComplete = room.status === 'complete' && room.metadata;
  const primaryHex = isComplete ? (CATEGORY_COLOR_MAP[room.metadata!.mainCategory] || '#64748b') : '#334155';

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
        className="group flex items-center gap-4 p-2 bg-[#0a0b10] border border-white/5 hover:bg-white/5 hover:border-white/10 cursor-pointer transition-colors"
    >
        {/* Status Indicator Bar */}
        <div className="w-1 h-8 rounded-full" style={{backgroundColor: primaryHex}}></div>

        {/* Name & Cat */}
        <div className="w-48 shrink-0 flex flex-col min-w-0">
             <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white">{room.name}</span>
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate" style={{color: isComplete ? primaryHex : undefined}}>
                 {isComplete ? room.metadata?.mainCategory : room.status}
             </span>
        </div>

        {/* Metadata Badges */}
        <div className="w-24 shrink-0 flex flex-col gap-1">
            {isComplete && (
                <>
                <span className={`text-[9px] font-bold text-center border px-1 rounded ${room.metadata!.difficulty==='Easy'?'text-emerald-500 border-emerald-500/20':'text-orange-500 border-orange-500/20'}`}>
                    {room.metadata!.difficulty}
                </span>
                <span className="text-[9px] text-slate-500 text-center font-mono">{room.metadata!.timeEstimate}</span>
                </>
            )}
        </div>

        {/* Description / Tools */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
             {isComplete ? (
                 <>
                    <p className="text-[11px] text-slate-400 truncate mb-1">{room.metadata!.summary}</p>
                    <div className="flex gap-1 overflow-hidden h-[16px]">
                        {room.metadata!.tools.slice(0, 5).map(t => (
                            <span key={t} onClick={e => {e.stopPropagation(); onToolClick && onToolClick(t)}} className="text-[9px] px-1 border border-white/10 text-slate-500 hover:text-white hover:border-white/30 transition-colors">
                                {t}
                            </span>
                        ))}
                    </div>
                 </>
             ) : (
                 <div className="h-1 bg-slate-800 rounded overflow-hidden w-24">
                     {room.status === 'analyzing' && <div className="h-full bg-emerald-500 w-1/2 animate-progress"></div>}
                 </div>
             )}
        </div>

        {/* Score */}
        {isComplete && (
            <div className={`w-12 text-right text-lg font-mono font-bold ${scoreColor}`}>
                {displayScore}
            </div>
        )}
    </div>
  );
};

export const RoomListRow = React.memo(RoomListRowComponent);
