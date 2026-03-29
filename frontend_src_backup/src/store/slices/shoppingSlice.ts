import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList, PantryItem, PurchaseHistory } from '../../types/models.types';

interface ShoppingState {
  lists: ShoppingList[];
  activeList: ShoppingList | null;
  pantryItems: PantryItem[];
  purchaseHistory: PurchaseHistory[];
  loading: boolean;
  error: string | null;
}

const initialState: ShoppingState = {
  lists: [],
  activeList: null,
  pantryItems: [],
  purchaseHistory: [],
  loading: false,
  error: null,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setLists(state, action: PayloadAction<ShoppingList[]>) {
      state.lists = action.payload;
      state.loading = false;
    },
    addList(state, action: PayloadAction<ShoppingList>) {
      state.lists.unshift(action.payload);
    },
    setActiveList(state, action: PayloadAction<ShoppingList | null>) {
      state.activeList = action.payload;
    },
    updateListStatus(state, action: PayloadAction<{ id: string; status: ShoppingList['status'] }>) {
      const list = state.lists.find((l) => l.id === action.payload.id);
      if (list) list.status = action.payload.status;
    },
    setPantryItems(state, action: PayloadAction<PantryItem[]>) {
      state.pantryItems = action.payload;
      state.loading = false;
    },
    setPurchaseHistory(state, action: PayloadAction<PurchaseHistory[]>) {
      state.purchaseHistory = action.payload;
      state.loading = false;
    },
    resetShopping() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setLists, addList, setActiveList,
  updateListStatus, setPantryItems, setPurchaseHistory, resetShopping,
} = shoppingSlice.actions;

export default shoppingSlice.reducer;
