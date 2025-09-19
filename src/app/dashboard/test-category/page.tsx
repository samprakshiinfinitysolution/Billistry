"use client";

import { useState } from "react";
import { CategoryCombobox } from "@/components/CategoryCombobox";
import { Button } from "@/components/ui/button";

export default function TestCategoryPage() {
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = () => {
    if (!categoryId) return alert("Please select or add a category!");
    alert(`Selected Category ID: ${categoryId}`);
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Test Category Combobox</h1>

      {/* Combined dropdown + search + add category */}
      <CategoryCombobox value={categoryId} onChange={setCategoryId} />

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

// 'use client';

// import { useState } from "react";
// import HsnInput from "@/components/HsnInput";

// export default function ProductForm() {
//   const [hsn, setHsn] = useState("");

//   return (
//     <div className="space-y-4 p-5">
//       <h2 className="text-lg font-bold">Add Product</h2>
//       <HsnInput value={hsn} onChange={setHsn} />
//       <div>Selected HSN: {hsn}</div>
//     </div>
//   );
// }
