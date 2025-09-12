// src/redux/slices/supplierSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Supplier {
  _id?: string;
  name: string;
  email: string;
  phone: string;


}

interface SupplierState {
  data: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplierState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch suppliers
export const fetchSuppliers = createAsyncThunk("supplier/fetch", async () => {
  const res = await axios.get("/api/suppliers");
  return res.data;
});

// Delete supplier
export const deleteSupplier = createAsyncThunk("supplier/delete", async (_id: string) => {
  await axios.delete(`/api/suppliers/${_id}`);
  return _id;
});

// Add or update supplier
export const saveSupplier = createAsyncThunk(
  "supplier/save",
  async (supplier: Supplier, { dispatch }) => {
    if (supplier._id) {
      const res = await axios.put(`/api/suppliers/${supplier._id}`, supplier);
      return res.data;
    } else {
      const res = await axios.post("/api/suppliers", supplier);
      return res.data;
    }
  }
);

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<Supplier[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load";
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.data = state.data.filter((s) => s._id !== action.payload);
      })
      .addCase(saveSupplier.fulfilled, (state, action) => {
        const idx = state.data.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) {
          state.data[idx] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      });
  },
});

export default supplierSlice.reducer;
