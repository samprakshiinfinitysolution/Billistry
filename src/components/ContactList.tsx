// components/ContactList.tsx
import { useEffect, useState } from "react";

export default function ContactList({ onSelect }: { onSelect: (type: string, id: string) => void }) {
  const [contacts, setContacts] = useState<{ customers: any[], suppliers: any[] }>({ customers: [], suppliers: [] });

  useEffect(() => {
    fetch("/api/contacts")
      .then(res => res.json())
      .then(data => setContacts(data));
  }, []);

  return (
    <div className="flex gap-4">
      <div>
        <h2 className="font-bold">Customers</h2>
        {contacts.customers.map(c => (
          <div key={c._id} onClick={() => onSelect("customer", c._id)} className="cursor-pointer p-2 border">
            {c.name}
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-bold">Suppliers</h2>
        {contacts.suppliers.map(s => (
          <div key={s._id} onClick={() => onSelect("supplier", s._id)} className="cursor-pointer p-2 border">
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
