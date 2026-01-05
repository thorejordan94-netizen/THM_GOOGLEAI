import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, PenTool, X } from 'lucide-react';
import { CLUSTERS } from '../constants';

interface FilterSidebarProps {
  allTags: string[]; allTools: string[];
  selectedTags: string[]; selectedTools: string[]; excludedTags: string[]; excludedTools: string[];
  onToggleTag: (t: string) => void; onToggleTool: (t: string) => void;
  onExcludeTag: (t: string) => void; onExcludeTool: (t: string) => void;
  onClear: () => void;
  isOpen: boolean; onClose: () => void;
  selectedCategory: string | null; onSelectCategory: (c: string | null) => void;
}

const CATEGORY_MAP: Record<string, string> = {
    red: 'Offensive', blue: 'Defense', purple: 'Win/AD', emerald: 'Linux', 
    cyan: 'Network', orange: 'Web', pink: 'Malware', sky: 'Cloud'
};

const CompactSection: React.FC<{
    title: string; items: string[]; selected: string[]; excluded: string[];
    onToggle: (i: string) => void; onExclude: (i: string) => void;
}> = ({ title, items, selected, excluded, onToggle, onExclude }) => {
    const [open, setOpen] = useState(false);
    const visible = open ? items : items.slice(0, 10);
    
    if (items.length === 0) return null;

    return (
        <div className="mb-4">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 mb-2 hover:text-white w-full">
                {open ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                {title} <span className="ml-auto bg-white/5 px-1.5 rounded">{items.length}</span>
            </button>
            <div className="flex flex-wrap gap-1 pl-1">
                {visible.map(item => {
                    const isSel = selected.includes(item);
                    const isExc = excluded.includes(item);
                    return (
                        <button
                            key={item}
                            onClick={() => onToggle(item)}
                            onContextMenu={(e) => {e.preventDefault(); onExclude(item)}}
                            className={`
                                text-[9px] px-1.5 py-0.5 rounded border transition-all select-none
                                ${isSel ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 
                                  isExc ? 'bg-red-900/30 text-red-500 border-red-900 line-through' :
                                  'bg-white/5 border-transparent text-slate-400 hover:border-white/20 hover:text-slate-200'}
                            `}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = (props) => {
  const hasActive = props.selectedTags.length > 0 || props.selectedTools.length > 0 || props.selectedCategory;

  return (
    <div>
        {hasActive && (
            <button onClick={props.onClear} className="w-full text-center text-[10px] text-red-400 border border-red-500/20 bg-red-500/5 py-1 mb-4 rounded hover:bg-red-500/10 transition-colors uppercase font-bold">
                Clear Filters
            </button>
        )}

        {/* Mini Category Grid */}
        <div className="mb-4">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Domain</h4>
            <div className="grid grid-cols-2 gap-1">
                {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => props.onSelectCategory(props.selectedCategory === key ? null : key)}
                        className={`text-[9px] py-1 border rounded text-center transition-colors ${props.selectedCategory === key ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>

        <CompactSection 
            title="Tools" items={props.allTools} 
            selected={props.selectedTools} excluded={props.excludedTools}
            onToggle={props.onToggleTool} onExclude={props.onExcludeTool}
        />
        
        <CompactSection 
            title="Tags" items={props.allTags} 
            selected={props.selectedTags} excluded={props.excludedTags}
            onToggle={props.onToggleTag} onExclude={props.onExcludeTag}
        />
    </div>
  );
};
