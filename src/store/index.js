import { configureStore } from '@reduxjs/toolkit'
import marketReducer from './marketSlice'
 
export const store = configureStore({
  reducer: {
    market: marketReducer,
  }
})