// Old react-pdf based renderer removed to avoid peer-dependency conflicts.
// This file now forwards to the PDFKit-based renderer implemented in `invoicePdf.ts`.

import { renderInvoicePdfBuffer } from './invoicePdf';

export { renderInvoicePdfBuffer };

export default renderInvoicePdfBuffer;
