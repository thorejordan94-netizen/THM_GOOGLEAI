
import React, { useState } from 'react';
import { Cloud, Github, Check, AlertCircle, X, Loader2 } from 'lucide-react';

interface CloudSyncModalProps {
  onSaveConfig: (token: string) => Promise<void>;
  onSyncPush: () => Promise<void>;
  onSyncPull: () => Promise<void>;
  onClose: () => void;
  hasToken: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  onSaveConfig,
  onSyncPush,
  onSyncPull,
  onClose,
  hasToken,
  isSyncing,
  lastSyncTime
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSaveConfig(token);
    } catch (err) {
      setError("Invalid Token or Network Error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 text-emerald-400">
          <Github className="w-8 h-8" />
          <div>
             <h2 className="text-xl font-bold font-mono text-white">GitHub Cloud Sync</h2>
             <p className="text-xs text-slate-400">Powered by GitHub Gists</p>
          </div>
        </div>

        {!hasToken ? (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <p className="text-sm text-slate-300">
              Enter a GitHub Personal Access Token (Classic) with <code>gist</code> scope to enable cloud storage.
            </p>
            <div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="ghp_..."
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect GitHub'}
            </button>
            <div className="text-xs text-slate-500 mt-2">
               <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline hover:text-emerald-400">
                  Generate Token Here
               </a> (Select 'gist' scope)
            </div>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-sm">
                <Check className="w-4 h-4" /> Connected to GitHub
             </div>
             
             {lastSyncTime && (
                 <p className="text-xs text-slate-500 text-center">Last synced: {lastSyncTime}</p>
             )}

             <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onSyncPull}
                  disabled={isSyncing}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 p-4 rounded-lg transition-all"
                >
                   <Cloud className={`w-6 h-6 text-blue-400 ${isSyncing ? 'animate-pulse' : ''}`} />
                   <span className="text-sm font-bold text-white">Load from Cloud</span>
                   <span className="text-[10px] text-slate-400">Overwrite local data</span>
                </button>

                <button
                  onClick={onSyncPush}
                  disabled={isSyncing}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 p-4 rounded-lg transition-all"
                >
                   <Cloud className={`w-6 h-6 text-emerald-400 ${isSyncing ? 'animate-pulse' : ''}`} />
                   <span className="text-sm font-bold text-white">Save to Cloud</span>
                   <span className="text-[10px] text-slate-400">Backup current data</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
