"use client";

interface TransactionListProps {
  transactions: any[];
  onDelete: () => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const deleteTransaction = async (id: string) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    onDelete();
  };

  return (
    <div className="mt-6 space-y-2">
      {transactions.map((t) => (
        <div key={t._id} className="flex justify-between border p-3 rounded">
          <div>
            <p className="font-semibold">{t.partyType}</p>
            <p className="text-sm text-gray-500">{t.description}</p>
          </div>
          <div className={t.type === "You Got" ? "text-green-600" : "text-red-600"}>
            ₹{t.amount}
          </div>
          <button onClick={() => deleteTransaction(t._id)} className="text-red-500">❌</button>
        </div>
   
      ))}
    </div>
  );
}
