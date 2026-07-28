"use client";
import React, { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sentinel/sync');
      const data = await res.json();
      
      if (data.status === "CURATION_COMPLETE" || data.status === "OK") {
        alert(`RADAR FINALIZADO:\n- Nuevos activos: ${data.new_assets || 0}\n- Ruido filtrado: ${data.noise_filtered || 0}`);
        window.location.reload();
      } else {
        alert("El radar no encontró activos de alta prioridad en este momento.");
      }
    } catch (error) {
      console.error("SYNC_ERROR", error);
      alert("Error crítico de comunicación con el radar.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-[#008ed6] transition-all disabled:opacity-50 shadow-lg border border-slate-800"
    >
      {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
      {syncing ? "ESCANEANDO..." : "SINCRONIZAR RADAR"}
    </button>
  );
}