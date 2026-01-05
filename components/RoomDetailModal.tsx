import React from 'react';
import { RoomData, JobProfile } from '../types';
import { X, ExternalLink, Hash, PenTool, Server, Network, Database, Terminal, Laptop, Clock } from 'lucide-react';
import { JOB_PROFILES } from '../constants';

interface RoomDetailModalProps {
  room: RoomData;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
  onTagRightClick?: (tag: string) => void;
  onToolRightClick?: (tool: string) => void;
}

const parseTakeaways = (text: string) => {
    if (!text) return [];
    // Split by comma or dot followed by space, filtering empties
    return text.split(/(?:,|\. )+/).map(t => t.trim()).filter(Boolean);
};

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, onClose, onTagClick, onToolClick, onTagRightClick, onToolRightClick }) => {
  if (!room.metadata || !room.analysis) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'windowsClient': return <Laptop className="w-5 h-5" />;
      case 'windowsServer': return <Server className="w-5 h-5" />;
      case 'network': return <Network className="w-5 h-5" />;
      case 'dba': return <Database className="w-5 h-5" />;
      case 'linux': return <Terminal className="w-5 h-5" />;
      default: return <Terminal className="w-5 h-5" />;
    }
  };

  const getDifficultyBadge = (diff?: string) => {
    let classes = "bg-indigo-950 text-indigo-300 border-indigo-500/30";
    switch (diff?.toLowerCase()) {
      case 'easy': classes = "bg-emerald-950/60 text-emerald-400 border-emerald-500/50"; break;
      case 'medium': classes = "bg-yellow-950/60 text-yellow-400 border-yellow-500/50"; break;
      case 'hard': classes = "bg-orange-950/60 text-orange-400 border-orange-500/50"; break;
      case 'insane': classes = "bg-red-950/60 text-red-400 border-red-500/50"; break;
    }
    return (
        <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded border ${classes}`} title={`Difficulty: ${diff}`}>
            {diff}
        </span>
    );
  };

  const scores = room.analysis;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full p-2 transition-colors z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Room Info */}
        <div className="w-full md:w-1/3 bg-slate-950/50 p-6 md:p-8 border-r border-slate-800">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 font-mono break-words">{room.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {getDifficultyBadge(room.metadata.difficulty)}
              <span className="text-sm text-indigo-400 px-3 py-1 border border-indigo-500/30 rounded bg-indigo-500/10 font-bold uppercase tracking-wider" title="Category">
                {room.metadata.mainCategory}
              </span>
              {room.metadata.timeEstimate && (
                  <span className="text-sm text-indigo-400 px-3 py-1 border border-indigo-500/30 rounded flex items-center gap-1 font-mono" title="Time Estimate">
                    <Clock className="w-3 h-3 text-indigo-500" /> {room.metadata.timeEstimate}
                  </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              {room.metadata.description}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-2">
                <PenTool className="w-4 h-4 text-emerald-500" /> Tools & Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {room.metadata.tools.map((t, i) => (
                  <span 
                    key={i} 
                    onClick={() => onToolClick && onToolClick(t)}
                    onContextMenu={(e) => { e.preventDefault(); onToolRightClick && onToolRightClick(t); }}
                    className="text-xs bg-indigo-900/10 text-indigo-200 px-2 py-1 rounded border border-indigo-500/30 cursor-pointer hover:bg-indigo-900/30 transition-colors select-none" 
                    title={`Tool: ${t} (Right-click to exclude)`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4 text-blue-500" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {room.metadata.tags.map((t, i) => (
                  <span 
                    key={i} 
                    onClick={() => onTagClick && onTagClick(t)}
                    onContextMenu={(e) => { e.preventDefault(); onTagRightClick && onTagRightClick(t); }}
                    className="text-xs bg-slate-900 text-slate-400 border-slate-700 border rounded px-2 py-1 cursor-pointer hover:bg-slate-800 hover:text-slate-200 transition-colors select-none" 
                    title={`Tag: ${t} (Right-click to exclude)`}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
               <h4 className="text-sm font-bold text-emerald-400 mb-2">Key Takeaways</h4>
               <ul className="list-disc list-outside ml-4 space-y-1">
                 {parseTakeaways(room.metadata.keyTakeaways).map((point, idx) => (
                    <li key={idx} className="text-xs text-slate-300 leading-relaxed">
                        {point}
                    </li>
                 ))}
               </ul>
            </div>

             <a 
              href={`https://tryhackme.com/room/${room.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full gap-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-2 rounded transition-colors mt-4"
              title="Open Room on TryHackMe"
            >
              Raum Starten <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Column: Career Relevance Analysis */}
        <div className="w-full md:w-2/3 p-6 md:p-8">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <span className="bg-emerald-500 w-2 h-6 rounded-full inline-block"></span>
             Relevanz-Analyse pro Rolle
           </h3>

           <div className="grid gap-4">
             {scores.map((scoreItem) => {
               // Find static profile data
               const profile = JOB_PROFILES.find(p => p.id === scoreItem.jobId);
               if (!profile) return null;

               return (
                 <div key={scoreItem.jobId} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded-lg text-emerald-400" title={`Job Profile: ${profile.title}`}>
                         {getIcon(scoreItem.jobId)}
                       </div>
                       <div>
                         <h4 className="font-bold text-white">{profile.title}</h4>
                         <p className="text-xs text-slate-500 line-clamp-1">{profile.description}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="flex flex-col items-end">
                         <span className={`text-xl font-bold font-mono ${scoreItem.score > 3 ? 'text-emerald-400' : scoreItem.score > 1 ? 'text-yellow-400' : 'text-slate-500'}`} title="Score">
                           {scoreItem.score}/5
                         </span>
                       </div>
                     </div>
                   </div>

                   {/* Score Bar */}
                   <div className="w-full h-1.5 bg-slate-700 rounded-full mb-3 overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${scoreItem.score > 3 ? 'bg-emerald-500' : scoreItem.score > 1 ? 'bg-yellow-500' : 'bg-slate-500'}`}
                        style={{ width: `${(scoreItem.score / 5) * 100}%` }}
                     ></div>
                   </div>

                   <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded border border-slate-800/50">
                     <span className="text-emerald-500 font-bold mr-1">{'>'}</span>
                     {scoreItem.justification}
                   </p>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};