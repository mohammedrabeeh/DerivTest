import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  symbolsData: [],
  marketData: [],
  filteredData: [],
  selectedSubMarket: '',
}

// Reducer function
export const marketSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Prepare the symbol data in the required format and save to store.
    setMarketIndices: (state, action) => {
      const data = action.payload?.sort((a, b) => a.display_order - b.display_order);
      const updatedData = data.map(market => ({
        ...market,
        lastPrice: "-",
        histChange: "-",
        histLowPrice: "-",
        histHighPrice: "-"
      }));
      state.symbolsData = updatedData;
      state.filteredData = updatedData;
      const marketData = data.reduce((acc, obj) => {
        const { market, market_display_name, submarket, submarket_display_name } = obj;
        const existingMarketObj = acc.find(marketObj => marketObj.market === market);
        
        if (existingMarketObj) {
          // market already exists in accumulator array
          const existingSubmarketObj = existingMarketObj.subMarket.find(submarketObj => submarketObj.submarket === submarket);
          if (!existingSubmarketObj) {
            existingMarketObj.subMarket.push({
              submarket,
              submarket_display_name
            });
          }
        } else {
          // market doesn't exist in accumulator array, so add a new object
          acc.push({
            market,
            market_display_name,
            subMarket: [{
              submarket,
              submarket_display_name
            }]
          });
        }
        
        return acc;
      }, []);      
      state.marketData = marketData;
      state.filteredData = state.symbolsData.filter((x) => (x.market === marketData[0].market && x.submarket === marketData[0].subMarket[0].submarket));
      state.selectedSubMarket = marketData[0].subMarket[0].submarket;
    },
    // Filter data based on market and submarket
    filterMarketIndices: (state, action) => {
      const data = action.payload;
      state.filteredData = state.symbolsData.filter((x) => (x.market === data.market && x.submarket === data.submarket));
      state.selectedSubMarket = data.submarket;
    },
    // Update symbol with received price
    updateMarketPrice: (state, action) => {
      const data = action.payload;
      const updatedData = state.symbolsData.map(item => {
        if (item?.symbol === data?.symbol) {
          return {
            ...item,
            lastPrice: data.quote,
          };
        }
        return item;
      });
      state.symbolsData = updatedData;
      const updatedfilteredData = state.filteredData.map(item => {
        if (item?.symbol === data?.symbol) {
          return {
            ...item,
            lastPrice: data.quote,
          };
        }
        return item;
      });
      state.filteredData = updatedfilteredData;
    },
    // Update symbol with historical price
    updateHistoryPrice: (state, action) => {
      const data = action.payload;
      const updatedData = state.symbolsData.map(item => {
        if (item?.symbol === data?.symbol) {
          return {
            ...item,
            histLowPrice: data.candles[0]?.low,
            histHighPrice: data.candles[0]?.high,
            histChange: data.candles[0]?.high - data.candles[0]?.low,
          };
        }
        return item;
      });
      state.symbolsData = updatedData;
      const updatedfilteredData = state.filteredData.map(item => {
        if (item?.symbol === data?.symbol) {
          return {
            ...item,
            histLowPrice: data.candles[0]?.low,
            histHighPrice: data.candles[0]?.high,
            histChange: data.candles[0]?.high - data.candles[0]?.low,
          };
        }
        return item;
      });
      state.filteredData = updatedfilteredData;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setMarketIndices, filterMarketIndices, updateMarketPrice, updateHistoryPrice } = marketSlice.actions

export default marketSlice.reducer