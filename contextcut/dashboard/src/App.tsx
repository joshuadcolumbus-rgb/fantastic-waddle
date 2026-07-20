import React, { useState } from 'react';

// Same-origin in prod (worker serves the dashboard) or Cloudflare Worker URL in dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

interface TeamConfig {
  mode: 'skeleton' | 'full-text';
  ignoreDirs: string[];
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ContextCutDashboard() {
  const [licenseKey, setLicenseKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [config, setConfig] = useState<TeamConfig>({ mode: 'skeleton', ignoreDirs: [] });
  const [newIgnore, setNewIgnore] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  // --- Authentication ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${licenseKey}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid license key');
      }

      // The worker keys teams by `id`, not `teamId`
      const { team } = await res.json();
      setTeamId(team.id);
      await fetchConfig(team.id, licenseKey);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError((err as Error).message);
    }
  };

  // --- Fetch Data ---
  const fetchConfig = async (tid: string, key: string) => {
    const res = await fetch(`${API_BASE_URL}/api/config/${tid}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    // 404 just means the team has no remote config yet — keep the skeleton default
    if (res.ok) {
      const data = await res.json();
      setConfig(data);
    }
  };

  // --- Mutations ---
  const handleSave = async () => {
    setSaveState('saving');
    try {
      const res = await fetch(`${API_BASE_URL}/api/config/${teamId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${licenseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save configuration.');
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  };

  const addIgnoreDir = (e: React.FormEvent) => {
    e.preventDefault();
    const dir = newIgnore.trim();
    if (dir && !config.ignoreDirs.includes(dir)) {
      setConfig({ ...config, ignoreDirs: [...config.ignoreDirs, dir] });
      setNewIgnore('');
    }
  };

  const removeIgnoreDir = (dir: string) => {
    setConfig({ ...config, ignoreDirs: config.ignoreDirs.filter((d) => d !== dir) });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLicenseKey('');
    setTeamId('');
    setConfig({ mode: 'skeleton', ignoreDirs: [] });
    setSaveState('idle');
  };

  // --- Views ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full border border-zinc-800 p-8">
          <h1 className="text-2xl font-bold text-white mb-2">ContextCut</h1>
          <p className="text-zinc-400 mb-8 text-sm">Enter your team license key to configure engine settings.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="cc_key_..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 outline-none focus:border-white transition-colors"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              required
            />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-white text-black font-bold p-3 hover:bg-zinc-200 transition-colors"
            >
              Authenticate &rarr;
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">ContextCut</h1>
            <p className="text-zinc-500 mt-1">Team ID: <span className="text-zinc-300">{teamId}</span></p>
          </div>
          <button onClick={handleLogout} className="text-sm text-zinc-500 hover:text-white">
            Log out
          </button>
        </header>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left Column: Core Settings */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Engine Mode</h2>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="skeleton"
                    checked={config.mode === 'skeleton'}
                    onChange={() => setConfig({ ...config, mode: 'skeleton' })}
                    className="accent-white"
                  />
                  <span>Skeleton (Max Pruning)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="full-text"
                    checked={config.mode === 'full-text'}
                    onChange={() => setConfig({ ...config, mode: 'full-text' })}
                    className="accent-white"
                  />
                  <span>Full Text</span>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Ignore Rules */}
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Ignore Directories</h2>
              <form onSubmit={addIgnoreDir} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. migrations"
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 p-2 outline-none focus:border-white text-sm"
                  value={newIgnore}
                  onChange={(e) => setNewIgnore(e.target.value)}
                />
                <button type="submit" className="bg-zinc-800 px-4 text-sm hover:bg-zinc-700">Add</button>
              </form>

              <div className="flex flex-wrap gap-2">
                {config.ignoreDirs.map(dir => (
                  <div key={dir} className="flex items-center gap-2 border border-zinc-800 px-3 py-1 bg-zinc-900/50">
                    <span className="text-sm">{dir}</span>
                    <button
                      onClick={() => removeIgnoreDir(dir)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {config.ignoreDirs.length === 0 && (
                  <p className="text-zinc-600 text-sm italic">No custom ignore rules set.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-zinc-800 flex justify-end items-center gap-4">
          {saveState === 'saved' && <span className="text-sm text-green-400">Saved</span>}
          {saveState === 'error' && <span className="text-sm text-red-400">Save failed — try again</span>}
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="bg-white text-black font-bold py-2 px-8 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Deploying...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
