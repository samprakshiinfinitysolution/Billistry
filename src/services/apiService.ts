import toast from "react-hot-toast";

// --- Type Definitions for API Payloads and Responses ---

/** Data required to create or update a transaction. */
export interface TransactionData {
  partyId: string;
  amount: number;
  type: 'You Gave' | 'You Got';
  description?: string;
}

/** Represents a full Transaction object from the backend. */
export interface Transaction {
  _id: string;
  amount: number;
  type: 'You Gave' | 'You Got';
  description?: string;
  date: string; // ISO date string
}

/** Represents a Party object from the backend. */
export interface Party {
  _id: string;
  partyName: string;
  mobileNumber: string;
  balance: number;
  partyType: 'Customer' | 'Supplier';
}

/** The shape of the response from the getLedger API call. */
export interface LedgerResponse {
  party: Party;
  transactions: Transaction[];
}

class ApiService {
  /**
   * Generic request handler for all API calls.
   * @param url The API endpoint URL.
   * @param options The request options (method, headers, body).
   * @returns A promise that resolves with the JSON response.
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`API Error: ${options.method || 'GET'} ${url}`, error);
      toast.error(error.message || "An unexpected error occurred.");
      throw error;
    }
  }

  // --- Party Methods ---

  /**
   * Fetches a list of parties, optionally filtered by type.
   * @param type Optional - 'Customer' or 'Supplier'.
   */
  getParties(type?: 'Customer' | 'Supplier') {
    const url = type ? `/api/parties?type=${type}` : "/api/parties";
    return this.request<{ parties: Party[] }>(url);
  }

  /**
   * Fetches a single party by its ID.
   * @param partyId The ID of the party.
   */
  getPartyById(partyId: string) {
    return this.request<LedgerResponse>(`/api/parties/${partyId}`);
  }

  /**
   * Deletes a party by its ID.
   * @param partyId The ID of the party to delete.
   */
  deleteParty(partyId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/parties/${partyId}`, { method: "DELETE" });
  }

  // --- Ledger Methods ---

  /**
   * Fetches the ledger (party details and transactions) for a specific party.
   * @param partyId The ID of the party.
   */
  getLedger(partyId: string) {
    return this.request<LedgerResponse>(`/api/parties/ledger/${partyId}`);
  }

  // --- Transaction Methods ---

  /**
   * Creates a new transaction.
   * @param data The data for the new transaction.
   * @returns The newly created transaction object from the server.
   */
  createTransaction(data: TransactionData) {
    return this.request<{ success: boolean; transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * Updates an existing transaction.
   * @param id The ID of the transaction to update.
   * @param data The partial data to update.
   */
  updateTransaction(id: string, data: Partial<TransactionData>) {
    return this.request<{ success: boolean; transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletes a transaction by its ID.
   * @param id The ID of the transaction to delete.
   */
  deleteTransaction(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/transactions/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();