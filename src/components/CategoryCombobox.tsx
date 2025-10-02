"use client";

import { useState, useEffect, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Category {
  _id: string;
  category_name: string;
}
interface CategoryComboboxProps {
  value?: Category | null;
  onChange: (cat: Category | null) => void;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  value,
  onChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Fetch categories
  const fetchCategories = async (search = "") => {
    try {
      const url = search
        ? `/api/category?q=${encodeURIComponent(search)}`
        : "/api/category";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  if (value) {
    setSelected(value);
  } else {
    setSelected(null);
  }
}, [value]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCategories(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredCategories =
    query === ""
      ? categories
      : categories.filter((cat) =>
          cat.category_name.toLowerCase().includes(query.toLowerCase())
        );

  const handleCreateCategory = async () => {
    const nameToCreate = newCategory.trim() || query.trim();
    if (!nameToCreate) return;

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name: nameToCreate }),
      });
      const data = await res.json();
      if (data.success) {
        const created = Array.isArray(data.categories)
          ? data.categories[0]
          : data.categories;
        setCategories((prev) => [...prev, created]);
        setSelected(created);
        onChange(created);
        setNewCategory("");
        setOpen(false);
        setQuery("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearSelection = () => {
    setSelected(null);
    onChange(null);
  };

  return (
    <div className="w-full relative">
      <Combobox
        value={selected}
        onChange={(cat: Category) => {
          setSelected(cat);
          onChange(cat);
        }}
      >
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg border bg-white text-left shadow-md focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm flex items-center">
            <Combobox.Input
              className="w-full border-none py-1.5 pl-3 pr-10 text-sm leading-5 focus:ring-0"
              displayValue={(cat: Category) => cat?.category_name || ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Select or search category..."
            />

            {/* Arrow or Clear */}
            {selected ? (
              <button
                onClick={clearSelection}
                className="absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                ×
              </button>
            ) : (
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                ▾
              </Combobox.Button>
            )}
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {filteredCategories.map((cat) => (
                <Combobox.Option
                  key={cat._id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-indigo-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={cat}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {cat.category_name}
                    </span>
                  )}
                </Combobox.Option>
              ))}

              {/* Always show Add Category button */}
              <div className="px-4 py-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className="w-full border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600"
                >
                  + Add Category
                </Button>
              </div>
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {/* Modal for creating category */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Category Name"
            value={newCategory || query}
            onChange={(e) => setNewCategory(e.target.value)}
            className="mb-1"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};