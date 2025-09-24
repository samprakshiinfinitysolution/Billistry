"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HsnInput from "@/components/HsnInput";
import { CategoryCombobox } from "@/components/CategoryCombobox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useAuthGuard from "@/hooks/useAuthGuard";

interface Product {
  _id?: string;
  name: string;
  sku?: string;
  // barcode?: string;
  category?: string;
  // description?: string;
  purchasePrice?: string;
  sellingPrice: string;
  taxPercent?: string;
  hsnCode?: string;
  openingStock?: string;
  // currentStock?: string;
  lowStockAlert?: string;
  unit?: string;
}

// GST Options
export const GST_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Exempted", label: "Exempted" },
  { value: "0", label: "GST @ 0%" },
  { value: "0.1", label: "GST @ 0.1%" },
  { value: "0.25", label: "GST @ 0.25%" },
  { value: "1.5", label: "GST @ 1.5%" },
  { value: "3", label: "GST @ 3%" },
  { value: "5", label: "GST @ 5%" },
  { value: "6", label: "GST @ 6%" },
  { value: "12", label: "GST @ 12%" },
  { value: "13.8", label: "GST @ 13.8%" },
  { value: "18", label: "GST @ 18%" },
  { value: "28", label: "GST @ 28%" },
];

// const UNIT_OPTIONS = ["pcs", "kg", "liter", "pack", "box"];
export const UNIT_OPTIONS = [
  "pcs", // Piece
  "unit", // General single item
  "dozen", // 12 pcs
  "pair", // 2 pcs
  "set", // Grouped items
  "pack", // Packet
  "box", // Box
  "carton", // Carton
  "case", // Case (shipping box)
  "bundle", // Bundle
  "roll", // Roll (textiles, paper, cables)
  "sheet", // Sheet (paper, metal, glass)
  "bag", // Bag
  "bottle", // Bottle (beverages, chemicals)
  "can", // Can (drinks, paint, food)
  "tube", // Tube (cosmetics, medicines)
  "sachet", // Sachet (small packets)
  "strip", // Strip (medicine strips, labels)
  "packet", // Alternative to "pack"
  "bar", // Bar (chocolate, soap)
  "piece", // Alternative to pcs
  "item", // Generic item
];

const defaultForm: Product = {
  name: "",
  sku: "",

  // barcode: "",
  category: "",
  // description: "",
  purchasePrice: "",
  sellingPrice: "",
  taxPercent: "",
  hsnCode: "",
  openingStock: "",
  // currentStock: "",
  lowStockAlert: "",
  unit: "pcs",
};
export default function AddProduct() {
  const { user } = useAuthGuard();

  const [products, setProducts] = useState<Product[]>([]); //
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Product>(defaultForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); //
  const [loading, setLoading] = useState(false);
  const [hsn, setHsn] = useState("");
  const [category, setCategory] = useState<{
    _id: string;
    category_name: string;
  } | null>(null);

  //Form Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Search & filter
  const [search, setSearch] = useState(""); //
  const [lowStockOnly, setLowStockOnly] = useState(false); //

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/product", { credentials: "include" });
        const data = await res.json();
        if (data.success) setProducts(data.products);
        else toast.error(data.error || "Failed to load products");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    }
    loadProducts();
  }, []);

  // Reset form when dialog closes
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(defaultForm);
      setEditingProduct(null);
    }
  };

  //Fetch Category
  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const res = await fetch(`/api/category/${category}`);
        const data = await res.json();

        if (data.success && data.category) {
          setCategory(data.category.category_name);
        }
      } catch (error) {
        console.error("Error fetching category name:", error);
      }
    };

    if (category) {
      fetchCategoryName();
    }
  }, [category]);

  // Auto-generate SKU
  const generateSKU = () => {
    const random = Math.floor(Math.random() * 9000 + 1000);
    const namePart = formData.name
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 3);
    return `${namePart}-${random}`;
  };

  // Prevent negative values but allow empty string
  const handleNumberChange = (key: keyof Product, value: string) => {
    if (value === "") {
      setFormData({ ...formData, [key]: "" });
      return;
    }
    const num = Math.max(0, Number(value) || 0);
    setFormData({ ...formData, [key]: String(num) });
  };

  // Reusable function to set error for a field
  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  //Validate
  const validate = () => {
    let valid = true;
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      valid = false;
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      setErrors((prev) => ({
        ...prev,
        sellingPrice: "Selling Price must be > 0",
      }));
      valid = false;
    } else {
      setErrors((prev) => ({ ...prev, sellingPrice: "" }));
    }
    if (formData.purchasePrice && Number(formData.purchasePrice) < 0) {
      setFieldError("purchasePrice", "Purchase Price cannot be negative");
      valid = false;
    } else setFieldError("purchasePrice", "");

    if (formData.openingStock && Number(formData.openingStock) < 0) {
      setFieldError("openingStock", "Opening Stock cannot be negative");
      valid = false;
    } else {
      setFieldError("openingStock", "");
    }
    if (formData.lowStockAlert && Number(formData.lowStockAlert) < 0) {
      setFieldError("lowStockAlert", "Low Stock Alert cannot be negative");
      valid = false;
    } else {
      setFieldError("lowStockAlert", "");
    }
    if (!formData.category) {
      setFieldError("category", "Category is required");
      valid = false;
    } else {
      setFieldError("category", "");
    }
    return valid;
  };

  // Save or update product
  const handleSaveProduct = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category: category?.category_name || "",
      hsnCode: hsn,
    };
    if (validate()) {
      console.log("Form submitted", payload);
    }

    if (!formData.sku) formData.sku = generateSKU();

    setLoading(true);
    try {
      const url = editingProduct
        ? `/api/product?id=${editingProduct._id}`
        : "/api/product";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          category: category?.category_name || "",
          hsnCode: hsn,
          openingStock: formData.openingStock ?? 0,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (editingProduct) {
          setProducts(
            products.map((p) =>
              p._id === editingProduct._id ? data.product : p
            )
          );
          toast.success("Product updated successfully");
        } else {
          setProducts([...products, data.product]);
          toast.success("Product added successfully");
        }

        setFormData(defaultForm);
        setEditingProduct(null);
        setOpen(false);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setOpen(true);
  };
    const [activeForm, setActiveForm] = useState("basic"); // default form
  
    return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  setFormData(defaultForm);
                  setEditingProduct(null);
                }}
              >
                Add Product
              </Button>
            </DialogTrigger>
    
            {/* Product Form */}
            <DialogContent className="sm:max-w-max min-w-5xl max-w-lg h-[80vh] mx-auto px-6 rounded-2xl shadow-lg flex flex-col">
              <DialogHeader className="w-full text-center">
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-[25%_75%] gap-3 w-full overflow-x-hidden h-max">
                {/* Parent Left Column */}
                <div className="w-max h-max border border-gray-500 rounded-md p-4 flex flex-col gap-2">
                  <Button
                    disabled={loading}
                    onClick={() => setActiveForm("basic")}
                    className={`w-48 cursor-pointer transition-colors duration-200 ${
                      activeForm === "basic"
                        ? "bg-blue-600 text-white" // active state
                        : "bg-black text-white" // inactive state
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.7587 1H15.2413C16.0463 0.999988 16.7106 0.999977 17.2518 1.04419C17.8139 1.09012 18.3306 1.18868 18.816 1.43597C19.5686 1.81947 20.1805 2.43139 20.564 3.18404C20.723 3.49611 20.8022 3.87886 20.8511 4.20628C20.9038 4.5594 20.9366 4.96306 20.9578 5.3786C21 6.20441 21 7.15516 21 7.98533V8C21 8.55229 20.5523 9 20 9C19.4477 9 19 8.55229 19 8C19 7.15347 18.9997 6.25045 18.9604 5.48061C18.9408 5.0959 18.9122 4.7642 18.873 4.50182C18.8535 4.37119 18.833 4.26877 18.8131 4.19219C18.7943 4.11981 18.7812 4.09084 18.7814 4.09078C18.7814 4.09077 18.7816 4.0912 18.782 4.09202C18.5903 3.7157 18.2843 3.40973 17.908 3.21799C17.7516 3.1383 17.5274 3.07337 17.089 3.03755C16.6389 3.00078 16.0566 3 15.2 3H8.8C7.94342 3 7.36113 3.00078 6.91104 3.03755C6.47262 3.07337 6.24842 3.1383 6.09202 3.21799C5.7157 3.40973 5.40973 3.7157 5.21799 4.09202C5.1383 4.24842 5.07337 4.47262 5.03755 4.91104C5.00078 5.36113 5 5.94342 5 6.8V17.2C5 18.0566 5.00078 18.6389 5.03755 19.089C5.07337 19.5274 5.1383 19.7516 5.21799 19.908C5.40973 20.2843 5.7157 20.5903 6.09202 20.782C6.24843 20.8617 6.47262 20.9266 6.91101 20.9624C7.36107 20.9992 7.94333 21 8.79986 21C9.35214 21 9.79986 21.4477 9.79986 22C9.79986 22.5523 9.35214 23 8.79986 23H8.75854C7.95362 23 7.2893 23 6.74814 22.9558C6.18606 22.9099 5.66937 22.8113 5.18404 22.564C4.43139 22.1805 3.81947 21.5686 3.43597 20.816C3.18868 20.3306 3.09012 19.8139 3.04419 19.2518C2.99998 18.7106 2.99999 18.0463 3 17.2413V6.7587C2.99999 5.95373 2.99998 5.28937 3.04419 4.74817C3.09012 4.18608 3.18868 3.66937 3.43597 3.18404C3.81947 2.43139 4.43139 1.81947 5.18404 1.43597C5.66937 1.18868 6.18608 1.09012 6.74817 1.04419C7.28937 0.999977 7.95373 0.999988 8.7587 1ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55229 16.5523 9 16 9H8C7.44772 9 7 8.55229 7 8ZM7 12C7 11.4477 7.44772 11 8 11H10C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13H8C7.44772 13 7 12.5523 7 12ZM7 16C7 15.4477 7.44772 15 8 15H9C9.55229 15 10 15.4477 10 16C10 16.5523 9.55229 17 9 17H8C7.44772 17 7 16.5523 7 16Z"
                        fill="#fff"
                      ></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.195 11.0315C17.3962 10.9895 17.6038 10.9895 17.805 11.0315C18.0432 11.0812 18.2521 11.2015 18.3521 11.2591C18.3624 11.2651 18.3716 11.2704 18.3796 11.2748L22.0796 13.3604C22.088 13.3652 22.0978 13.3706 22.1089 13.3767C22.2158 13.4357 22.4368 13.5575 22.6079 13.7459C22.7517 13.9042 22.8597 14.0909 22.9256 14.2932C23.0036 14.5327 23.0013 14.7831 23.0002 14.9068C23.0001 14.9196 23 14.9311 23 14.9411V19.0589C23 19.0689 23.0001 19.0804 23.0002 19.0932C23.0013 19.2169 23.0036 19.4673 22.9256 19.7068C22.8597 19.9091 22.7517 20.0958 22.6079 20.2541C22.4368 20.4425 22.2158 20.5644 22.1089 20.6233C22.0978 20.6294 22.088 20.6348 22.0796 20.6396L18.3796 22.7252C18.3716 22.7296 18.3624 22.7349 18.3521 22.7409C18.2521 22.7985 18.0431 22.9188 17.805 22.9685C17.6038 23.0105 17.3962 23.0105 17.195 22.9685C16.9568 22.9188 16.7479 22.7985 16.6479 22.7409C16.6376 22.7349 16.6284 22.7296 16.6205 22.7252L12.9205 20.6396C12.912 20.6348 12.9022 20.6294 12.8911 20.6233C12.7842 20.5644 12.5632 20.4425 12.3921 20.2541C12.2483 20.0958 12.1403 19.9091 12.0744 19.7068C11.9964 19.4673 11.9987 19.2169 11.9998 19.0932C11.9999 19.0804 12 19.0689 12 19.0589V14.9411C12 14.9311 11.9999 14.9196 11.9998 14.9068C11.9987 14.7831 11.9964 14.5327 12.0744 14.2932C12.1403 14.0909 12.2483 13.9042 12.3921 13.7459C12.5632 13.5575 12.7842 13.4357 12.8911 13.3767C12.9022 13.3706 12.912 13.3652 12.9205 13.3604L16.6205 11.2748C16.6284 11.2704 16.6376 11.2651 16.6479 11.2591C16.7479 11.2015 16.9569 11.0812 17.195 11.0315ZM17.5 13.0749L19.9635 14.4635L17.5 15.8521L15.0365 14.4635L17.5 13.0749ZM14 16.1751V18.9523L16.5 20.3614L16.5 17.5842L14 16.1751ZM18.5 17.5842L18.5 20.3614L21 18.9523V16.1751L18.5 17.5842Z"
                        fill="#fff"
                      ></path>
                    </svg>
                    Basic Details *
                  </Button>
                  <hr />
                  <div className="flex flex-col gap-5">
                    <h3 className="px-2 text-md">Advance Details</h3>
                    <Button
                      disabled={loading}
                      onClick={() => setActiveForm("stock")}
                      className={`w-48 cursor-pointer transition-colors duration-200 ${
                        activeForm === "stock"
                          ? "bg-blue-600 text-white" // active state
                          : "bg-black text-white" // inactive state
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8.7587 1H15.2413C16.0463 0.999988 16.7106 0.999977 17.2518 1.04419C17.8139 1.09012 18.3306 1.18868 18.816 1.43597C19.5686 1.81947 20.1805 2.43139 20.564 3.18404C20.723 3.49611 20.8022 3.87886 20.8511 4.20628C20.9038 4.5594 20.9366 4.96306 20.9578 5.3786C21 6.20441 21 7.15516 21 7.98533V8C21 8.55229 20.5523 9 20 9C19.4477 9 19 8.55229 19 8C19 7.15347 18.9997 6.25045 18.9604 5.48061C18.9408 5.0959 18.9122 4.7642 18.873 4.50182C18.8535 4.37119 18.833 4.26877 18.8131 4.19219C18.7943 4.11981 18.7812 4.09084 18.7814 4.09078C18.7814 4.09077 18.7816 4.0912 18.782 4.09202C18.5903 3.7157 18.2843 3.40973 17.908 3.21799C17.7516 3.1383 17.5274 3.07337 17.089 3.03755C16.6389 3.00078 16.0566 3 15.2 3H8.8C7.94342 3 7.36113 3.00078 6.91104 3.03755C6.47262 3.07337 6.24842 3.1383 6.09202 3.21799C5.7157 3.40973 5.40973 3.7157 5.21799 4.09202C5.1383 4.24842 5.07337 4.47262 5.03755 4.91104C5.00078 5.36113 5 5.94342 5 6.8V17.2C5 18.0566 5.00078 18.6389 5.03755 19.089C5.07337 19.5274 5.1383 19.7516 5.21799 19.908C5.40973 20.2843 5.7157 20.5903 6.09202 20.782C6.24843 20.8617 6.47262 20.9266 6.91101 20.9624C7.36107 20.9992 7.94333 21 8.79986 21C9.35214 21 9.79986 21.4477 9.79986 22C9.79986 22.5523 9.35214 23 8.79986 23H8.75854C7.95362 23 7.2893 23 6.74814 22.9558C6.18606 22.9099 5.66937 22.8113 5.18404 22.564C4.43139 22.1805 3.81947 21.5686 3.43597 20.816C3.18868 20.3306 3.09012 19.8139 3.04419 19.2518C2.99998 18.7106 2.99999 18.0463 3 17.2413V6.7587C2.99999 5.95373 2.99998 5.28937 3.04419 4.74817C3.09012 4.18608 3.18868 3.66937 3.43597 3.18404C3.81947 2.43139 4.43139 1.81947 5.18404 1.43597C5.66937 1.18868 6.18608 1.09012 6.74817 1.04419C7.28937 0.999977 7.95373 0.999988 8.7587 1Z"
                          fill="#fff"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M17.195 11.0315C17.3962 10.9895 17.6038 10.9895 17.805 11.0315C18.0432 11.0812 18.2521 11.2015 18.3521 11.2591C18.3624 11.2651 18.3716 11.2704 18.3796 11.2748L22.0796 13.3604C22.088 13.3652 22.0978 13.3706 22.1089 13.3767C22.2158 13.4357 22.4368 13.5575 22.6079 13.7459C22.7517 13.9042 22.8597 14.0909 22.9256 14.2932C23.0036 14.5327 23.0013 14.7831 23.0002 14.9068C23.0001 14.9196 23 14.9311 23 14.9411V19.0589C23 19.0689 23.0001 19.0804 23.0002 19.0932C23.0013 19.2169 23.0036 19.4673 22.9256 19.7068C22.8597 19.9091 22.7517 20.0958 22.6079 20.2541C22.4368 20.4425 22.2158 20.5644 22.1089 20.6233C22.0978 20.6294 22.088 20.6348 22.0796 20.6396L18.3796 22.7252C18.3716 22.7296 18.3624 22.7349 18.3521 22.7409C18.2521 22.7985 18.0431 22.9188 17.805 22.9685C17.6038 23.0105 17.3962 23.0105 17.195 22.9685C16.9568 22.9188 16.7479 22.7985 16.6479 22.7409C16.6376 22.7349 16.6284 22.7296 16.6205 22.7252L12.9205 20.6396C12.912 20.6348 12.9022 20.6294 12.8911 20.6233C12.7842 20.5644 12.5632 20.4425 12.3921 20.2541C12.2483 20.0958 12.1403 19.9091 12.0744 19.7068C11.9964 19.4673 11.9987 19.2169 11.9998 19.0932C11.9999 19.0804 12 19.0689 12 19.0589V14.9411C12 14.9311 11.9999 14.9196 11.9998 14.9068C11.9987 14.7831 11.9964 14.5327 12.0744 14.2932C12.1403 14.0909 12.2483 13.9042 12.3921 13.7459C12.5632 13.5575 12.7842 13.4357 12.8911 13.3767C12.9022 13.3706 12.912 13.3652 12.9205 13.3604L16.6205 11.2748C16.6284 11.2704 16.6376 11.2651 16.6479 11.2591C16.7479 11.2015 16.9569 11.0812 17.195 11.0315ZM17.5 13.0749L19.9635 14.4635L17.5 15.8521L15.0365 14.4635L17.5 13.0749ZM14 16.1751V18.9523L16.5 20.3614L16.5 17.5842L14 16.1751ZM18.5 17.5842L18.5 20.3614L21 18.9523V16.1751L18.5 17.5842Z"
                          fill="#fff"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M11.5 6C11.5 5.44772 11.9477 5 12.5 5H15C15.5523 5 16 5.44772 16 6V8.5C16 9.05229 15.5523 9.5 15 9.5C14.4477 9.5 14 9.05229 14 8.5V8.41421L8.70711 13.7071C8.31658 14.0976 7.68342 14.0976 7.29289 13.7071C6.90237 13.3166 6.90237 12.6834 7.29289 12.2929L12.5858 7H12.5C11.9477 7 11.5 6.55229 11.5 6Z"
                          fill="#fff"
                        ></path>
                      </svg>
                      Stock Details
                    </Button>
                    <Button
                      disabled={loading}
                      onClick={() => setActiveForm("price")}
                      className={`w-48 cursor-pointer transition-colors duration-200 ${
                        activeForm === "price"
                          ? "bg-blue-600 text-white" // active state
                          : "bg-black text-white" // inactive state
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8.75489 1H15.2451C16.0468 0.999983 16.7151 0.999969 17.2608 1.04951C17.8319 1.10136 18.3605 1.21336 18.8546 1.49309C19.6141 1.92306 20.2127 2.59777 20.582 3.4032C20.8165 3.9145 20.9116 4.4607 20.9564 5.07067C21 5.66334 21 6.39411 21 7.29507V22C21 22.3853 20.7786 22.7363 20.431 22.9024C20.0833 23.0684 19.6712 23.02 19.3715 22.7778L17.2808 21.0884L15.4144 22.7474C15.0488 23.0723 14.5019 23.0852 14.1215 22.7778L12 21.0635L9.87852 22.7778C9.49812 23.0852 8.95118 23.0723 8.58564 22.7474L6.7192 21.0884L4.62852 22.7778C4.32884 23.02 3.9167 23.0684 3.56902 22.9024C3.22135 22.7363 3 22.3853 3 22L3 7.2951C2.99999 6.39413 2.99998 5.66335 3.04357 5.07067C3.08842 4.4607 3.18353 3.9145 3.418 3.4032C3.78735 2.59777 4.3859 1.92306 5.14536 1.49309C5.63947 1.21336 6.16809 1.10136 6.7392 1.04951C7.28492 0.999969 7.9532 0.999983 8.75489 1ZM6.92002 3.04132C6.49061 3.0803 6.27832 3.14996 6.13069 3.23353C5.76119 3.44272 5.44186 3.78788 5.23596 4.23687C5.14345 4.43861 5.07507 4.71563 5.03818 5.21734C5.00063 5.72799 5 6.38505 5 7.33333V19.9062L6.12148 19C6.50189 18.6926 7.04882 18.7054 7.41436 19.0304L9.2808 20.6894L11.3715 19C11.7381 18.7037 12.2619 18.7037 12.6285 19L14.7192 20.6894L16.5856 19.0304C16.9512 18.7054 17.4981 18.6926 17.8785 19L19 19.9062V7.33334C19 6.38505 18.9994 5.72799 18.9618 5.21734C18.9249 4.71563 18.8566 4.43861 18.764 4.23687C18.5581 3.78788 18.2388 3.44272 17.8693 3.23353C17.7217 3.14996 17.5094 3.0803 17.08 3.04132C16.6354 3.00096 16.0584 3 15.2 3H8.8C7.94161 3 7.3646 3.00096 6.92002 3.04132Z"
                          fill="#fff"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8 6C8 5.44772 8.44772 5 9 5H15C15.5523 5 16 5.44772 16 6C16 6.55229 15.5523 7 15 7H13.6207C13.736 7.25056 13.8239 7.51205 13.8858 7.77778H15C15.5523 7.77778 16 8.22549 16 8.77778C16 9.33006 15.5523 9.77778 15 9.77778H13.8858C13.7577 10.3271 13.5191 10.8583 13.1559 11.3122C12.6949 11.8885 12.0536 12.311 11.2653 12.4775L13.9727 15.3089C14.3544 15.708 14.3403 16.341 13.9411 16.7227C13.542 17.1044 12.909 17.0903 12.5273 16.6911L8.27726 12.2467C8.00054 11.9573 7.92311 11.5307 8.08046 11.1626C8.23781 10.7944 8.5996 10.5556 9 10.5556H10.5C11.0231 10.5556 11.3632 10.3516 11.5942 10.0628C11.6621 9.97794 11.7229 9.88226 11.7756 9.77778H9C8.44772 9.77778 8 9.33006 8 8.77778C8 8.22549 8.44772 7.77778 9 7.77778H11.7756C11.7229 7.6733 11.6621 7.57762 11.5942 7.49277C11.3632 7.20399 11.0231 7 10.5 7H9C8.44772 7 8 6.55229 8 6Z"
                          fill="#fff"
                        ></path>
                      </svg>
                      Price Details
                    </Button>
                  </div>
                </div>
    
                {/*  Parent Right Column */}
                {activeForm === "basic" && (
                  <div className="border border-gray-500 rounded-md grid grid-cols-1 md:grid-cols-2 gap-3 h-[55vh] min-w-[45vw] w-max overflow-y-auto">
                    <div className="space-y-4 ">
                      {/* Name */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">Name *</label>
                        <Input
                          placeholder="Product Name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
    
                            // clear error if user typed something non-empty
                            if (errors.name && e.target.value.trim() !== "") {
                              setErrors((prev) => ({ ...prev, name: "" }));
                            }
                          }}
                          className={errors.name ? "border-red-500" : ""}
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                      </div>
    
                      {/* SKU */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">SKU</label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="SKU"
                            value={formData.sku}
                            readOnly
                            required
                          />
                          {!formData._id && ( // only show button for new products
                            <Button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, sku: generateSKU() })
                              }
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>
    
                      {/* Selling Price */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Selling Price *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Selling Price"
                          value={formData.sellingPrice ?? ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              sellingPrice: e.target.value,
                            });
    
                            // clear error if user typed something non-empty
                            if (
                              errors.sellingPrice &&
                              e.target.value.trim() !== ""
                            ) {
                              setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                            }
                          }}
                          className={errors.sellingPrice ? "border-red-500" : ""}
                          required
                        />
                        {errors.sellingPrice && (
                          <p className="text-red-500 text-sm">
                            {errors.sellingPrice}
                          </p>
                        )}
                      </div>
    
                      {/* Opening Stock */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Opening Stock *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Opening Stock"
                          value={formData.openingStock || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingStock: e.target.value,
                            })
                          }
                          required
                        />
                        {errors.openingStock && (
                          <p className="text-red-500 text-sm">
                            {errors.openingStock}
                          </p>
                        )}
                      </div>
                    </div>
    
                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Category */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">Category</label>
                        <CategoryCombobox value={category} onChange={setCategory} />
                        {!category && errors.category && (
                          <p className="text-red-500 text-sm">{errors.category}</p>
                        )}
                      </div>
    
                      {/* GST */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          GST Tax Rate(%)
                        </label>
                        <Select
                          value={String(formData.taxPercent)}
                          onValueChange={(val) =>
                            setFormData({ ...formData, taxPercent: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {GST_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
    
                      {/* Unit */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Select
                          value={formData.unit}
                          onValueChange={(val) =>
                            setFormData({ ...formData, unit: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                {activeForm === "stock" && (
                  <div className="border border-gray-500 rounded-md grid grid-cols-1 md:grid-cols-2 gap-3 h-[55vh] min-w-[45vw] w-max overflow-y-scroll">
                    {}
                    {/* Left Column */}
                    <div className="space-y-4 ">
                      {/* Barcode */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Product Barcode
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Barcode"
                            value={formData.sku || ""}
                            readOnly
                          />
                          {!formData._id && ( // only show button for new products
                            <Button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, sku: generateSKU() })
                              }
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>
    
                      {/* Opening Stock */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Opening Stock *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Opening Stock"
                          value={formData.openingStock || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingStock: e.target.value,
                            })
                          }
                          required
                        />
                        {errors.openingStock && (
                          <p className="text-red-500 text-sm">
                            {errors.openingStock}
                          </p>
                        )}
                      </div>
                    </div>
    
                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* HSN */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">HSN Code</label>
                        <HsnInput value={hsn} onChange={setHsn} />
                      </div>
    
                      {/* Low Stock Alert */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Low Stock Alert
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Low Stock Alert"
                          value={formData.lowStockAlert || ""}
                          onChange={(e) =>
                            handleNumberChange("lowStockAlert", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeForm === "price" && (
                  <div className="border border-gray-500 rounded-md grid grid-cols-1 md:grid-cols-2 gap-3 h-[55vh] min-w-[45vw] w-max overflow-y-scroll">
                    <div className="space-y-4 ">
                      {/* Selling Price */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Selling Price *
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Selling Price"
                          value={formData.sellingPrice ?? ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              sellingPrice: e.target.value,
                            });
                          }}
                          required
                        />
                      </div>
    
                      {/* GST */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          GST Tax Rate(%)
                        </label>
                        <Select
                          value={String(formData.taxPercent)}
                          onValueChange={(val) =>
                            setFormData({ ...formData, taxPercent: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {GST_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
    
                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Purchase Price */}
                      <div className="flex flex-col space-y-1 p-2">
                        <label className="text-sm font-medium">
                          Purchase Price
                        </label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Purchase Price"
                          value={formData.purchasePrice ?? ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              purchasePrice: e.target.value,
                            });
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <hr />
              {/* Save & Cancel Buttons */}
              <div className="mt-2 flex justify-end gap-2">
                {/* Cancel Button */}
                <Button
                  className="w-max px-10"
                  variant="outline" // Optional: gives a subtle look
                  onClick={() => {
                    setFormData(defaultForm); // Reset form to default values
                    setEditingProduct(null); // Clear editing state
                    setOpen(false); // Close modal (if applicable)
                    setErrors({}); // Clear errors
                  }}
                  disabled={loading} // Disable if saving is in progress
                >
                  Cancel
                </Button>
    
                {/* Save/Update Button */}
                <Button
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="w-max px-20"
                >
                  {loading
                    ? editingProduct
                      ? "Updating..."
                      : "Saving..."
                    : editingProduct
                    ? "Update"
                    : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div> 
     );
}
