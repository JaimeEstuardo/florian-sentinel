// app/sentinel/discovery/SyncButton.tsx
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
      
      if (data.status === "SCAN_COMPLETE") {
        alert(`Escaneo completado: ${data.new_items} nuevos ítems encontrados.`);
        window.location.reload();
      } else {
        alert("El radar no encontró novedades en este barrido.");
      }
    } catch (error) {
      alert("Error de conexión con el radar.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[#008ed6] transition-all disabled:opacity-50 shadow-lg"
    >
      {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
      {syncing ? "Escaneando..." : "Sincronizar Radar"}
    </button>
  );
}