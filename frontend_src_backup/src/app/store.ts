import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from '../store/slices/authSlice';
import nutritionReducer from '../store/slices/nutritionSlice';
import trainingReducer from '../store/slices/trainingSlice';
import restReducer from '../store/slices/restSlice';
import hydrationReducer from '../store/slices/hydrationSlice';
import supplementsReducer from '../store/slices/supplementsSlice';
import shoppingReducer from '../store/slices/shoppingSlice';
import notificationsReducer from '../store/slices/notificationsSlice';
import userReducer from '../store/slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  nutrition: nutritionReducer,
  training: trainingReducer,
  rest: restReducer,
  hydration: hydrationReducer,
  supplements: supplementsReducer,
  shopping: shoppingReducer,
  notifications: notificationsReducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

