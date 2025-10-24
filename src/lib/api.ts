export const fetchInvoices = async () => {
  const res = await fetch('/api/invoices');
  return res.json();
};

export const createInvoice = async (invoice: any) => {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  return res.json();
};
