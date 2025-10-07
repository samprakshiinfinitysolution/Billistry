"use client";

import { useState } from "react";
import { CategoryCombobox, Category } from "@/components/CategoryCombobox";
import { Button } from "@/components/ui/button";

export default function TestCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null);

  const handleSubmit = () => {
    if (!category) {
      alert("Please select or add a category!");
      return;
    }
    // Now you have access to the full category object
    alert(
      `Selected Category ID: ${category._id}\nSelected Category Name: ${category.category_name}`
    );
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Test Category Combobox</h1>

      {/* Combined dropdown + search + add category */}
      <CategoryCombobox value={category} onChange={setCategory} />

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
