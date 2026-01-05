import React from 'react';
import { RoomData, JobProfile } from '../types';
import { X, ExternalLink, Clock, Activity, Cpu, Box, Hash } from 'lucide-react';
import { JOB_PROFILES } from '../constants';

interface RoomDetailPanelProps {
  room: RoomData | null;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
}

export const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ room, onClose, onTagClick, onToolClick }) => {
  if (!room || !room.metadata || !room.analysis) return null;

  const parseTakeaways = (text: string) => text.split(/(?:,|\. )+/).map(t => t.trim()).filter(Boolean);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-[#0a0b10] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/20">
            <h2 className="font-bold text-white text-lg truncate flex-1 font-mono" title={room.name}>{room.name}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white ml-4"><X className="w-5 h-5"/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            
            {/* Meta Badges */}
            <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{room.metadata.difficulty}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{room.metadata.mainCategory}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 flex items-center gap-1"><Clock className="w-3 h-3"/> {room.metadata.timeEstimate}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed font-light">
                {room.metadata.description}
            </p>

            {/* Scores */}
            <div>
                <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3 flex items-center gap-2"><Activity className="w-3 h-3"/> Job Relevance</h3>
                <div className="space-y-2">
                    {room.analysis.map(score => {
                        const job = JOB_PROFILES.find(j => j.id === score.jobId);
                        const isHigh = score.score > 3;
                        return (
                            <div key={score.jobId} className="bg-white/[0.03] border border-white/5 rounded p-2 hover:bg-white/[0.05] transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-300">{job?.title}</span>
                                    <span className={`text-sm font-mono font-bold ${isHigh ? 'text-emerald-400' : 'text-slate-500'}`}>{score.score}/5</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : 'bg-slate-600'}`} style={{width: `${(score.score/5)*100}%`}}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">{score.justification}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Takeaways */}
            <div className="bg-emerald-900/5 border-l-2 border-emerald-500 pl-4 py-2">
                <h3 className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-2">Key Takeaways</h3>
                <ul className="list-disc list-outside ml-3 space-y-1">
                    {parseTakeaways(room.metadata.keyTakeaways).map((k, i) => (
                        <li key={i} className="text-xs text-slate-300">{k}</li>
                    ))}
                </ul>
            </div>

            {/* Tags/Tools */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                     <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><Cpu className="w-3 h-3"/> Tools</h4>
                     <div className="flex flex-wrap gap-1">
                        {room.metadata.tools.map(t => (
                            <button key={t} onClick={() => onToolClick && onToolClick(t)} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300 rounded hover:border-emerald-500 hover:text-emerald-400 transition-colors">{t}</button>
                        ))}
                     </div>
                </div>
                <div>
                     <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><Hash className="w-3 h-3"/> Tags</h4>
                     <div className="flex flex-wrap gap-1">
                        {room.metadata.tags.map(t => (
                            <button key={t} onClick={() => onTagClick && onTagClick(t)} className="text-[10px] px-2 py-0.5 bg-transparent border border-white/10 text-slate-500 rounded hover:bg-white/5 hover:text-slate-300 transition-colors">#{t}</button>
                        ))}
                     </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
            <a href={`https://tryhackme.com/room/${room.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded transition-colors shadow-lg shadow-emerald-900/20">
                INITIALIZE ROOM <ExternalLink className="w-4 h-4 ml-2"/>
            </a>
        </div>
    </div>
  );
};
