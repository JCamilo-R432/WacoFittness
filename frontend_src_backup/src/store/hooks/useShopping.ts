import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { shoppingService } from '../../services/shoppingService';
import * as actions from '../slices/shoppingSlice';

export const useShopping = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.shopping);

  const fetchLists = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await shoppingService.getLists();
      dispatch(actions.setLists(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const createList = useCallback(async (data: any) => {
    try {
      const res = await shoppingService.createList(data);
      dispatch(actions.addList(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const completeList = useCallback(async (id: string) => {
    try {
      await shoppingService.completeList(id);
      dispatch(actions.updateListStatus({ id, status: 'completed' }));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchPantry = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await shoppingService.getPantry(params);
      dispatch(actions.setPantryItems(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchHistory = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await shoppingService.getPurchaseHistory(params);
      dispatch(actions.setPurchaseHistory(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const setActiveList = useCallback((list: any | null) => {
    dispatch(actions.setActiveList(list));
  }, [dispatch]);

  const toggleItem = useCallback(async (_listId: string, _itemId: string, _next: boolean) => {
    // Backend endpoint can be added later; optimistic UI can be handled in slice when it exists.
  }, []);

  return { ...state, fetchLists, createList, completeList, fetchPantry, fetchHistory, setActiveList, toggleItem };
};
