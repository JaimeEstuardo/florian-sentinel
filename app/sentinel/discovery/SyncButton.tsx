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
      
      if (data.status === "RADAR_REPORT") {
        alert(`RADAR FINALIZADO:\n- Procesados: ${data.total_parsed}\n- Nuevos hallazgos: ${data.added}\n- Ignorados (repetidos): ${data.skipped}`);
        if (data.added > 0) window.location.reload();
      } else {
        alert("Error en el radar. Revisa la conexión.");
      }
    } catch {
      alert("Error crítico de comunicación.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-white font-mono text-[10px] uppercase tracking-wid