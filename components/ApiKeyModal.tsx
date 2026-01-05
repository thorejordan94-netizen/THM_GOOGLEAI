import React, { useState } from 'react';
import { Key, X, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string, model: string) => void;
  onClose?: () => void;
  initialModel?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, initialModel = "gemini-3-flash-preview" }) => {
  const [inputKey, setInputKey] = useState('');
  const [inputModel, setInputModel] = useState(initialModel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim(), inputModel.trim() || "gemini-3-flash-preview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        )}
        <div className="flex items-center gap-3 mb-4 text-emerald-400">
          <Key className="w-6 h-6" />
          <h2 className="text-xl font-bold font-mono">System Config</h2>
        </div>
        <p className="text-slate-300 mb-6 text-sm">
          Configure the AI model and access credentials. The application requires a Google Gemini API Key with Search Grounding enabled.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-mono text-slate-400 mb-1 uppercase tracking-wider">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-mono text-sm"
              placeholder="AIzaSy..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-mono text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2">
               Target Model <Cpu className="w-3 h-3" />
            </label>
            <input
              type="text"
              value={inputModel}
              onChange={(e) => setInputModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-mono text-sm"
              placeholder="e.g. gemini-3-flash-preview"
              required
            />
             <p className="text-[10px] text-slate-500 mt-1">Recommended: gemini-3-flash-preview</p>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            Initialize System
          </button>
        </form>
        <p className="mt-4 text-[10px] text-slate-500 text-center">
          Credentials are stored in session memory only.
        </p>
      </div>
    </div>
  );
};