"use client";
import { useEffect } from 'react';

export default function AutoPrint({ closeAfterMs = 1500 }: { closeAfterMs?: number }) {
  useEffect(() => {
    (async () => {
      try {
        // Trigger print dialog
        window.print();
      } catch (e) {
        // ignore
      }
      // Optionally close the tab after a short delay (user may prefer to keep it open)
      if (closeAfterMs && typeof window !== 'undefined') {
        setTimeout(() => {
          try { window.close(); } catch (e) { /* ignore */ }
        }, closeAfterMs);
      }
    })();
  }, [closeAfterMs]);

  return null;
}
