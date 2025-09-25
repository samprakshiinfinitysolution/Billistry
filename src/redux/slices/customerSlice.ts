import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;


}

interface CustomerState {
  list: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  list: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchCustomers = createAsyncThunk(
  'customer/fetchAll',
  async () => {
    const res = await axios.get('/api/customers');
    return res.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (id: string) => {
    await axios.delete(`/api/customers/${id}`);
    return id;
  }
);

export const saveCustomer = createAsyncThunk(
  'customer/save',
  async (customer: Customer) => {
    if (customer._id) {
      await axios.put(`/api/customers/${customer._id}`, customer);
      return customer;
    } else {
      const res = await axios.post(`/api/customers`, customer);
      return res.data;
    }
  }
);

// Slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch';
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      })
      .addCase(saveCustomer.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.list.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.list[index] = updated;
        } else {
          state.list.push(updated);
        }
      });
  },
});

export default customerSlice.reducer;
