export async function exportElementToPdf(selector: string, filename: string) {
  if (typeof window === 'undefined') throw new Error('Client-only function');
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) throw new Error('Element not found: ' + selector);

  try {
    // Try to dynamically load html2canvas and jspdf
    const html2canvasModule = await import('html2canvas');
    const html2canvas = (html2canvasModule as any).default ?? html2canvasModule;

    // Clone the element and inline computed styles for high fidelity
    const clone = el.cloneNode(true) as HTMLElement;
    // Function to copy computed styles from source to target by building cssText
    const copyComputedStyle = (source: Element, target: HTMLElement) => {
      const computed = window.getComputedStyle(source as Element);
      try {
        // Build cssText by iterating computed properties
        let cssText = '';
        for (let i = 0; i < computed.length; i++) {
          const prop = computed[i];
          const val = computed.getPropertyValue(prop);
          const prio = computed.getPropertyPriority(prop);
          if (val) cssText += `${prop}: ${val}${prio ? ' !important' : ''}; `;
        }
        // Ensure print color adjustment so backgrounds are preserved where possible
        cssText += '-webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;';
        target.style.cssText = cssText;
      } catch (e) {
        // fallback to setting individual properties if cssText assignment fails
        const computedFallback = window.getComputedStyle(source as Element);
        for (let i = 0; i < computedFallback.length; i++) {
          const prop = computedFallback[i];
          try { (target.style as any).setProperty(prop, computedFallback.getPropertyValue(prop), computedFallback.getPropertyPriority(prop)); } catch (err) { /* ignore */ }
        }
        try { target.style.setProperty('-webkit-print-color-adjust', 'exact'); } catch (e) { /* ignore */ }
      }
    };

    const deepInlineStyles = (srcNode: Element, dstNode: Element) => {
      if (!(dstNode instanceof HTMLElement)) return;
      copyComputedStyle(srcNode, dstNode);
      const srcChildren = Array.from(srcNode.children || []);
      const dstChildren = Array.from(dstNode.children || []);
      for (let i = 0; i < srcChildren.length; i++) {
        const s = srcChildren[i] as Element;
        const d = dstChildren[i] as Element;
        if (s && d) deepInlineStyles(s, d as Element);
      }
    };

    deepInlineStyles(el, clone as Element);

    // Put clone into an offscreen container so it inherits fonts and resources
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.zIndex = '99999';
  container.appendChild(clone);
  document.body.appendChild(container);

    // Wait for fonts to be ready where supported to avoid fallback fonts in the capture
    try { if (document && (document as any).fonts && (document as any).fonts.ready) await (document as any).fonts.ready; } catch (e) { /* ignore */ }

    // Wait for images within the clone to load (helps html2canvas capture images)
    const waitForImages = async (root: HTMLElement) => {
      const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(imgs.map(img => new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth !== 0) return resolve();
        const onFinish = () => { img.removeEventListener('load', onFinish); img.removeEventListener('error', onFinish); resolve(); };
        img.addEventListener('load', onFinish);
        img.addEventListener('error', onFinish);
      })));
    };
    try { await waitForImages(clone); } catch (e) { /* ignore */ }

    // Choose a capture scale. Use devicePixelRatio where available for sharper output, but minimum 2.
    const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
    const scale = Math.max(2, Math.floor(dpr * 2));

    const canvas = await html2canvas(clone as HTMLElement, { scale, useCORS: true, allowTaint: true, backgroundColor: null });

    const imgData = canvas.toDataURL('image/png');
    const jsPDFModule = await import('jspdf');
    const jsPDF = (jsPDFModule as any).default ?? jsPDFModule;
    const pdf = new jsPDF('p', 'pt', 'a4');

    // Multi-page slicing: map canvas pixels to PDF points and split vertically into A4 pages
    const pdfWidthPts = (pdf as any).internal.pageSize.getWidth();
    const pdfHeightPts = (pdf as any).internal.pageSize.getHeight();

    const canvasWidthPx = canvas.width;
    const canvasHeightPx = canvas.height;

    // scale factor from px -> pts
    const pxToPt = pdfWidthPts / canvasWidthPx;
    const pageHeightPx = Math.floor(pdfHeightPts / pxToPt);

    let y = 0;
    while (y < canvasHeightPx) {
      const sliceHeight = Math.min(pageHeightPx, canvasHeightPx - y);
      // create a temporary canvas to hold the slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasWidthPx;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      // draw the slice from the full canvas
      ctx.drawImage(canvas, 0, y, canvasWidthPx, sliceHeight, 0, 0, canvasWidthPx, sliceHeight);

      const sliceData = sliceCanvas.toDataURL('image/png');
      const sliceHeightPts = sliceHeight * pxToPt;
      if (y > 0) pdf.addPage();
      pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidthPts, sliceHeightPts);
      y += sliceHeight;
    }
    pdf.save(filename);
    // cleanup cloned container
    try { container.remove(); } catch (e) { /* ignore */ }
  } catch (err) {
    // If any dependency is missing or conversion fails, fallback to opening a print window
    try {
      const w = window.open('', '_blank');
      if (!w) throw err;
      w.document.write('<html><head><title>Print</title></head><body>' + (el as HTMLElement).outerHTML + '</body></html>');
      w.document.close();
      w.focus();
      // give the new window a moment to render
      setTimeout(() => {
        try { w.print(); } catch (e) { /* ignore */ }
      }, 500);
    } catch (e) {
      console.error('Failed to export or print element', e);
      throw e;
    }
  }
}

export default exportElementToPdf;
