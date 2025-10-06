# Guide 03: Redux Store Setup

**Estimated Time:** 1.5-2 hours  
**When:** Tomorrow morning - After Guide 02  
**Prerequisites:** Guide 02 completed (services layer ready)

---

## 🎯 Goal

Build your Redux store with a campaigns slice. This is your **ONE advanced showcase** - Redux Toolkit with proper async thunks, selectors, and state management.

**Why Redux Toolkit?** Modern, less boilerplate, includes best practices built-in.

---

## 📝 Step 1: Create Redux Store Configuration

**File:** `src/store/index.js`

```javascript
import { configureStore } from '@reduxjs/toolkit';
import campaignsReducer from './campaignsSlice';

/**
 * Redux store configuration
 * Using Redux Toolkit's configureStore for automatic best practices:
 * - Redux DevTools enabled by default
 * - Thunk middleware included
 * - Immutability checks in development
 */
export const store = configureStore({
  reducer: {
    campaigns: campaignsReducer,
  },
  // Development-only middleware for catching common mistakes
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types for TypeScript users (we're not using TS, but good practice)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 📝 Step 2: Create Campaigns Slice

**File:** `src/store/campaignsSlice.js`

This is the heart of your state management. Read through carefully!

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCampaigns, fetchCampaignMetrics } from '../services/campaignService';

/**
 * Async Thunks - These handle API calls with automatic pending/fulfilled/rejected actions
 */

/**
 * Load campaign list from API
 * Dispatched on CampaignListPage mount
 */
export const loadCampaigns = createAsyncThunk(
  'campaigns/loadCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCampaigns();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Load campaign metrics for a specific iteration
 * Dispatched every 5 seconds on Dashboard
 * 
 * @param {Object} payload
 * @param {number} payload.campaignId - Campaign ID to fetch
 * @param {number} payload.iteration - Current iteration number (0, 1, 2, ...)
 */
export const loadMetrics = createAsyncThunk(
  'campaigns/loadMetrics',
  async ({ campaignId, iteration }, { rejectWithValue }) => {
    try {
      return await fetchCampaignMetrics(campaignId, iteration);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Initial State Structure
 */
const initialState = {
  // Campaign list from /api/campaigns
  list: [],
  
  // Currently selected campaign ID
  selectedCampaignId: null,
  
  // Dashboard data for selected campaign
  dashboardData: {
    totals: {
      impressions: 0,
      clicks: 0,
      users: 0,
    },
    recent: null, // Most recent API response
    iteration: 0, // Current iteration number
    lastSuccessfulFetch: null, // ISO timestamp of last successful fetch
  },
  
  // UI state
  loading: false,
  error: null,
  autoRefreshPaused: false, // Circuit breaker state
};

/**
 * Campaigns Slice
 * Handles all campaign-related state and actions
 */
const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  
  reducers: {
    /**
     * Select a campaign - resets dashboard data for new campaign
     */
    selectCampaign: (state, action) => {
      state.selectedCampaignId = action.payload;
      
      // Reset dashboard when switching campaigns
      state.dashboardData = {
        totals: { impressions: 0, clicks: 0, users: 0 },
        recent: null,
        iteration: 0,
        lastSuccessfulFetch: null,
      };
      
      state.error = null;
      state.autoRefreshPaused = false;
    },
    
    /**
     * Pause auto-refresh after consecutive failures (circuit breaker)
     */
    pauseAutoRefresh: (state) => {
      state.autoRefreshPaused = true;
    },
    
    /**
     * Resume auto-refresh (user clicked "Retry")
     */
    resumeAutoRefresh: (state) => {
      state.autoRefreshPaused = false;
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ========== Load Campaigns ==========
      .addCase(loadCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.error = null;
      })
      .addCase(loadCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // ========== Load Metrics ==========
      .addCase(loadMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMetrics.fulfilled, (state, action) => {
        state.loading = false;
        
        // Accumulate totals (key requirement!)
        state.dashboardData.totals.impressions += action.payload.impressions;
        state.dashboardData.totals.clicks += action.payload.clicks;
        state.dashboardData.totals.users += action.payload.users;
        
        // Store most recent data
        state.dashboardData.recent = action.payload;
        
        // Increment iteration for next fetch
        state.dashboardData.iteration += 1;
        
        // Track successful fetch time
        state.dashboardData.lastSuccessfulFetch = new Date().toISOString();
        
        // Clear any errors
        state.error = null;
        state.autoRefreshPaused = false;
      })
      .addCase(loadMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        
        // IMPORTANT: Don't clear data on error - keep showing last good data
        // This is a key UX decision for auto-refresh failures
      });
  },
});

// ========== Action Creators ==========
export const { 
  selectCampaign, 
  pauseAutoRefresh, 
  resumeAutoRefresh 
} = campaignsSlice.actions;

// ========== Selectors ==========

/**
 * Basic selectors for direct state access
 */
export const selectCampaignList = (state) => state.campaigns.list;

export const selectSelectedCampaignId = (state) => state.campaigns.selectedCampaignId;

export const selectDashboardData = (state) => state.campaigns.dashboardData;

export const selectLoading = (state) => state.campaigns.loading;

export const selectError = (state) => state.campaigns.error;

export const selectAutoRefreshPaused = (state) => state.campaigns.autoRefreshPaused;

/**
 * Derived selector - get selected campaign object
 */
export const selectSelectedCampaign = (state) => {
  const id = state.campaigns.selectedCampaignId;
  if (!id) return null;
  return state.campaigns.list.find(c => c.id === Number(id));
};

/**
 * Computed selector - Calculate Total CTR
 * CTR = (Total Clicks / Total Impressions) × 100
 * 
 * Senior thinking: Calculation logic in selector, not component
 * Makes it testable and reusable
 */
export const selectTotalCTR = (state) => {
  const { totals } = state.campaigns.dashboardData;
  
  // Handle division by zero
  if (totals.impressions === 0) {
    return '0.00';
  }
  
  const ctr = (totals.clicks / totals.impressions) * 100;
  return ctr.toFixed(2);
};

/**
 * Computed selector - Calculate Recent CTR
 * Uses only the most recent API response
 */
export const selectRecentCTR = (state) => {
  const { recent } = state.campaigns.dashboardData;
  
  if (!recent) {
    return '0.00';
  }
  
  // Handle division by zero
  if (recent.impressions === 0) {
    return '0.00';
  }
  
  const ctr = (recent.clicks / recent.impressions) * 100;
  return ctr.toFixed(2);
};

// Export reducer as default
export default campaignsSlice.reducer;
```

---

## 📝 Step 3: Create Redux Slice Tests

**File:** `src/store/campaignsSlice.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import campaignsReducer, {
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh,
  selectTotalCTR,
  selectRecentCTR,
  selectSelectedCampaign,
} from './campaignsSlice';

describe('campaignsSlice reducers', () => {
  const initialState = {
    list: [
      { id: 1, name: 'Campaign 1' },
      { id: 2, name: 'Campaign 2' },
    ],
    selectedCampaignId: null,
    dashboardData: {
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastSuccessfulFetch: null,
    },
    loading: false,
    error: null,
    autoRefreshPaused: false,
  };

  test('selectCampaign sets selectedCampaignId', () => {
    const action = selectCampaign(1);
    const state = campaignsReducer(initialState, action);
    
    expect(state.selectedCampaignId).toBe(1);
  });

  test('selectCampaign resets dashboard data', () => {
    const stateWithData = {
      ...initialState,
      selectedCampaignId: 1,
      dashboardData: {
        totals: { impressions: 100, clicks: 5, users: 50 },
        recent: { impressions: 10, clicks: 1, users: 5 },
        iteration: 5,
        lastSuccessfulFetch: '2025-01-01T00:00:00Z',
      },
    };
    
    const action = selectCampaign(2);
    const state = campaignsReducer(stateWithData, action);
    
    expect(state.selectedCampaignId).toBe(2);
    expect(state.dashboardData.totals.impressions).toBe(0);
    expect(state.dashboardData.recent).toBeNull();
    expect(state.dashboardData.iteration).toBe(0);
  });

  test('selectCampaign clears error state', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
      autoRefreshPaused: true,
    };
    
    const action = selectCampaign(1);
    const state = campaignsReducer(stateWithError, action);
    
    expect(state.error).toBeNull();
    expect(state.autoRefreshPaused).toBe(false);
  });

  test('pauseAutoRefresh sets autoRefreshPaused to true', () => {
    const action = pauseAutoRefresh();
    const state = campaignsReducer(initialState, action);
    
    expect(state.autoRefreshPaused).toBe(true);
  });

  test('resumeAutoRefresh resets error and unpause', () => {
    const stateWithError = {
      ...initialState,
      error: 'Connection error',
      autoRefreshPaused: true,
    };
    
    const action = resumeAutoRefresh();
    const state = campaignsReducer(stateWithError, action);
    
    expect(state.autoRefreshPaused).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('CTR selectors', () => {
  test('selectTotalCTR calculates correctly', () => {
    const state = {
      campaigns: {
        dashboardData: {
          totals: { impressions: 1000, clicks: 50, users: 0 },
        },
      },
    };
    
    const ctr = selectTotalCTR(state);
    expect(ctr).toBe('5.00'); // (50 / 1000) * 100 = 5.00%
  });

  test('selectTotalCTR handles division by zero', () => {
    const state = {
      campaigns: {
        dashboardData: {
          totals: { impressions: 0, clicks: 0, users: 0 },
        },
      },
    };
    
    const ctr = selectTotalCTR(state);
    expect(ctr).toBe('0.00');
  });

  test('selectTotalCTR formats to 2 decimal places', () => {
    const state = {
      campaigns: {
        dashboardData: {
          totals: { impressions: 1000, clicks: 33, users: 0 },
        },
      },
    };
    
    const ctr = selectTotalCTR(state);
    expect(ctr).toBe('3.30'); // (33 / 1000) * 100 = 3.30%
  });

  test('selectRecentCTR calculates from recent data', () => {
    const state = {
      campaigns: {
        dashboardData: {
          recent: { impressions: 100, clicks: 10, users: 50 },
        },
      },
    };
    
    const ctr = selectRecentCTR(state);
    expect(ctr).toBe('10.00'); // (10 / 100) * 100 = 10.00%
  });

  test('selectRecentCTR returns 0.00 when no recent data', () => {
    const state = {
      campaigns: {
        dashboardData: {
          recent: null,
        },
      },
    };
    
    const ctr = selectRecentCTR(state);
    expect(ctr).toBe('0.00');
  });

  test('selectRecentCTR handles division by zero', () => {
    const state = {
      campaigns: {
        dashboardData: {
          recent: { impressions: 0, clicks: 0, users: 0 },
        },
      },
    };
    
    const ctr = selectRecentCTR(state);
    expect(ctr).toBe('0.00');
  });
});

describe('selectSelectedCampaign', () => {
  test('returns campaign object when selected', () => {
    const state = {
      campaigns: {
        list: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
        selectedCampaignId: 1,
      },
    };
    
    const campaign = selectSelectedCampaign(state);
    expect(campaign).toEqual({ id: 1, name: 'Red' });
  });

  test('returns null when nothing selected', () => {
    const state = {
      campaigns: {
        list: [{ id: 1, name: 'Red' }],
        selectedCampaignId: null,
      },
    };
    
    const campaign = selectSelectedCampaign(state);
    expect(campaign).toBeNull();
  });

  test('handles string ID from URL params', () => {
    const state = {
      campaigns: {
        list: [{ id: 1, name: 'Red' }],
        selectedCampaignId: '1', // String from useParams
      },
    };
    
    const campaign = selectSelectedCampaign(state);
    expect(campaign).toEqual({ id: 1, name: 'Red' });
  });
});

describe('loadMetrics async thunk behavior', () => {
  test('accumulates totals across multiple fetches', () => {
    let state = {
      ...campaignsReducer(undefined, { type: 'init' }),
      selectedCampaignId: 1,
    };
    
    // First fetch
    const firstPayload = { impressions: 100, clicks: 5, users: 50 };
    state = campaignsReducer(state, {
      type: 'campaigns/loadMetrics/fulfilled',
      payload: firstPayload,
    });
    
    expect(state.dashboardData.totals.impressions).toBe(100);
    expect(state.dashboardData.totals.clicks).toBe(5);
    expect(state.dashboardData.totals.users).toBe(50);
    expect(state.dashboardData.iteration).toBe(1);
    
    // Second fetch - should accumulate
    const secondPayload = { impressions: 200, clicks: 10, users: 75 };
    state = campaignsReducer(state, {
      type: 'campaigns/loadMetrics/fulfilled',
      payload: secondPayload,
    });
    
    expect(state.dashboardData.totals.impressions).toBe(300); // 100 + 200
    expect(state.dashboardData.totals.clicks).toBe(15); // 5 + 10
    expect(state.dashboardData.totals.users).toBe(125); // 50 + 75
    expect(state.dashboardData.iteration).toBe(2);
  });

  test('keeps last good data on error', () => {
    let state = {
      ...campaignsReducer(undefined, { type: 'init' }),
      dashboardData: {
        totals: { impressions: 100, clicks: 5, users: 50 },
        recent: { impressions: 100, clicks: 5, users: 50 },
        iteration: 1,
        lastSuccessfulFetch: '2025-01-01T00:00:00Z',
      },
    };
    
    // Error occurs
    state = campaignsReducer(state, {
      type: 'campaigns/loadMetrics/rejected',
      payload: 'Network error',
    });
    
    // Data should still be there
    expect(state.dashboardData.totals.impressions).toBe(100);
    expect(state.dashboardData.recent).not.toBeNull();
    expect(state.error).toBe('Network error');
  });

  test('stores timestamp on successful fetch', () => {
    const state = campaignsReducer(undefined, {
      type: 'campaigns/loadMetrics/fulfilled',
      payload: { impressions: 100, clicks: 5, users: 50 },
    });
    
    expect(state.dashboardData.lastSuccessfulFetch).toBeTruthy();
    expect(new Date(state.dashboardData.lastSuccessfulFetch)).toBeInstanceOf(Date);
  });
});
```

**Run tests:**
```bash
npm test campaignsSlice
```

---

## ✅ Verification Checklist

Before moving to Guide 04:

- [ ] `src/store/index.js` created with store configuration
- [ ] `src/store/campaignsSlice.js` created with all reducers and selectors
- [ ] `src/store/campaignsSlice.test.js` passes all tests
- [ ] Run `npm test` - all Redux tests pass
- [ ] Understand the data flow: thunk → pending → fulfilled → state update

---

## 🎯 What You've Built

After completing this guide:

✅ **Modern Redux Toolkit store** with async thunks  
✅ **Smart state management** that accumulates totals  
✅ **Computed selectors** for CTR calculations  
✅ **Circuit breaker** logic for auto-refresh failures  
✅ **Comprehensive tests** for all business logic  

**This is your application's brain!** All state lives here, all calculations happen here.

---

## 🧠 Key Concepts to Understand

1. **Async Thunks** - Handle API calls, dispatch pending/fulfilled/rejected automatically
2. **Immutability** - Redux Toolkit uses Immer, so you can "mutate" state directly
3. **Selectors** - Functions that derive/compute data from state
4. **Why CTR is calculated in selectors** - Testable, reusable, keeps components simple

---

## 🚀 Next Steps

**Move to Guide 04:** Component Building  
Now you'll build the UI that connects to this Redux state!

---

**Estimated Completion Time:** 90-120 minutes  
**Test Coverage So Far:** ~50% (Services + Redux complete)
