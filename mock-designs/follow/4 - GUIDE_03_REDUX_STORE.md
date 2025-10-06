# Guide 03: Redux Store (Two-Slice Architecture)

**Professional Redux implementation with separated concerns, per-campaign data persistence, and intelligent auto-refresh management**

---

## 🎯 Architecture Overview

We use **two separate slices** for clean separation of concerns:

1. **`campaignsSlice`** - Campaign metadata (list, names, IDs)
2. **`dashboardSlice`** - Dashboard logic (metrics, auto-refresh, UI state)

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Data persists when switching campaigns
- ✅ Auto-refresh pauses for inactive campaigns
- ✅ Normalized state structure (Redux best practice)
- ✅ Easier testing and maintenance

---

## File Structure

```
src/store/
├── store.js                  # Store configuration (combines slices)
└── slices/
    ├── campaignsSlice.js     # Campaign list + metadata
    └── dashboardSlice.js     # Dashboard data + auto-refresh logic
```

---

## 1. Store Configuration: `store.js`

```javascript
// src/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import campaignsReducer from './slices/campaignsSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    campaigns: campaignsReducer,   // Campaign metadata
    dashboard: dashboardReducer     // Dashboard logic
  },
  devTools: process.env.NODE_ENV !== 'production'
});
```

**Key Points:**
- Two separate reducers for different concerns
- DevTools enabled in development only
- Clean, simple store configuration

---

## 2. Campaigns Slice: `campaignsSlice.js`

**Purpose:** Manage campaign list and metadata ONLY

```javascript
// src/store/slices/campaignsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaignService';

// ========================================
// ASYNC THUNKS
// ========================================

/**
 * Fetch all campaigns from the API
 * Only called once when app loads
 */
export const loadCampaigns = createAsyncThunk(
  'campaigns/loadCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      return await campaignService.fetchCampaigns();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Normalized structure (Redux best practice)
  byId: {},        // { 1: {id: 1, name: "Red"}, 2: {id: 2, name: "Blue"} }
  allIds: [],      // [1, 2, 3]
  
  // Request state
  loading: false,
  error: null
};

// ========================================
// SLICE
// ========================================

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    // No custom reducers needed - all logic is in extraReducers
  },
  extraReducers: (builder) => {
    builder
      // Load Campaigns: Pending
      .addCase(loadCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Load Campaigns: Success
      .addCase(loadCampaigns.fulfilled, (state, action) => {
        // Normalize the data (store by ID for fast lookups)
        state.byId = {};
        state.allIds = [];
        
        action.payload.forEach((campaign) => {
          state.byId[campaign.id] = campaign;
          state.allIds.push(campaign.id);
        });
        
        state.loading = false;
        state.error = null;
      })
      
      // Load Campaigns: Error
      .addCase(loadCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load campaigns';
      });
  }
});

export default campaignsSlice.reducer;

// ========================================
// SELECTORS
// ========================================

/**
 * Get all campaigns as an array
 * Example: [{id: 1, name: "Red"}, {id: 2, name: "Blue"}]
 */
export const selectAllCampaigns = (state) => 
  state.campaigns.allIds.map(id => state.campaigns.byId[id]);

/**
 * Get a specific campaign by ID
 * Example: selectCampaignById(state, 1) -> {id: 1, name: "Red"}
 */
export const selectCampaignById = (state, campaignId) => 
  state.campaigns.byId[campaignId];

/**
 * Get loading state for campaign list
 */
export const selectCampaignsLoading = (state) => 
  state.campaigns.loading;

/**
 * Get error state for campaign list
 */
export const selectCampaignsError = (state) => 
  state.campaigns.error;
```

**Key Features:**
- ✅ Normalized state (`byId` + `allIds`)
- ✅ Only handles campaign metadata
- ✅ Clear loading/error states
- ✅ Simple, focused selectors

---

## 3. Dashboard Slice: `dashboardSlice.js`

**Purpose:** Manage dashboard data, metrics, and auto-refresh logic

```javascript
// src/store/slices/dashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { campaignService } from '../../services/campaignService';

// ========================================
// ASYNC THUNKS
// ========================================

/**
 * Fetch metrics for a specific campaign and iteration
 */
export const loadMetrics = createAsyncThunk(
  'dashboard/loadMetrics',
  async ({ campaignId, iteration }, { rejectWithValue }) => {
    try {
      const data = await campaignService.fetchCampaignMetrics(campaignId, iteration);
      return { campaignId, data };
    } catch (error) {
      return rejectWithValue({ campaignId, error: error.message });
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  selectedCampaignId: null,
  
  // Dashboard data stored PER campaign ID
  // Structure: dataByID[campaignId] = {
  //   totals: { impressions, clicks, users },
  //   recent: { impressions, clicks, users },
  //   iteration: number,
  //   lastFetch: ISO timestamp
  // }
  dataByID: {},
  
  // Track which campaigns are actively auto-refreshing
  // Structure: activeRequests[campaignId] = true/false
  activeRequests: {},
  
  // Request state
  loading: false,
  error: null,
  isAutoRefreshPaused: false
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get or create dashboard data structure for a campaign
 */
const getOrCreateDashboardData = (state, campaignId) => {
  if (!state.dataByID[campaignId]) {
    state.dataByID[campaignId] = {
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastFetch: null
    };
  }
  return state.dataByID[campaignId];
};

// ========================================
// SLICE
// ========================================

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /**
     * Select a campaign to view
     * - Pauses old campaign's auto-refresh
     * - Activates new campaign's auto-refresh
     * - Preserves all campaign data
     */
    selectCampaign: (state, action) => {
      const newCampaignId = action.payload;
      const oldCampaignId = state.selectedCampaignId;
      
      // Pause old campaign's requests
      if (oldCampaignId) {
        state.activeRequests[oldCampaignId] = false;
      }
      
      // Set new campaign
      state.selectedCampaignId = newCampaignId;
      
      // Activate new campaign's requests
      state.activeRequests[newCampaignId] = true;
      
      // Ensure data structure exists (but don't reset if it already exists!)
      getOrCreateDashboardData(state, newCampaignId);
      
      // Reset error state
      state.error = null;
      state.isAutoRefreshPaused = false;
    },
    
    /**
     * Pause auto-refresh (after 3 consecutive failures)
     */
    pauseAutoRefresh: (state) => {
      state.isAutoRefreshPaused = true;
      
      // Pause all active requests
      Object.keys(state.activeRequests).forEach(id => {
        state.activeRequests[id] = false;
      });
    },
    
    /**
     * Resume auto-refresh (user clicked retry)
     */
    resumeAutoRefresh: (state) => {
      state.isAutoRefreshPaused = false;
      state.error = null;
      
      // Resume only the selected campaign
      if (state.selectedCampaignId) {
        state.activeRequests[state.selectedCampaignId] = true;
      }
    },
    
    /**
     * Clear data for a specific campaign (optional feature)
     */
    clearCampaignData: (state, action) => {
      const campaignId = action.payload;
      if (state.dataByID[campaignId]) {
        delete state.dataByID[campaignId];
      }
    },
    
    /**
     * Clear all campaign data (optional feature)
     */
    clearAllCampaignData: (state) => {
      state.dataByID = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Metrics: Pending
      .addCase(loadMetrics.pending, (state) => {
        state.loading = true;
      })
      
      // Load Metrics: Success
      .addCase(loadMetrics.fulfilled, (state, action) => {
        const { campaignId, data } = action.payload;
        const dashboardData = getOrCreateDashboardData(state, campaignId);
        
        // Accumulate totals (add new data to existing totals)
        dashboardData.totals.impressions += data.impressions;
        dashboardData.totals.clicks += data.clicks;
        dashboardData.totals.users += data.users;
        
        // Update recent (replace with latest data)
        dashboardData.recent = {
          impressions: data.impressions,
          clicks: data.clicks,
          users: data.users
        };
        
        // Increment iteration
        dashboardData.iteration += 1;
        
        // Update timestamp
        dashboardData.lastFetch = new Date().toISOString();
        
        state.loading = false;
        state.error = null;
      })
      
      // Load Metrics: Error
      .addCase(loadMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch metrics';
        // NOTE: We don't clear data on error - keep showing last good data!
      });
  }
});

export const {
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh,
  clearCampaignData,
  clearAllCampaignData
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// ========================================
// SELECTORS
// ========================================

/**
 * Get the currently selected campaign ID
 */
export const selectSelectedCampaignId = (state) => 
  state.dashboard.selectedCampaignId;

/**
 * Get dashboard data for the currently selected campaign
 * Returns null if no campaign selected or no data exists
 */
export const selectDashboardData = (state) => {
  const campaignId = state.dashboard.selectedCampaignId;
  if (!campaignId) return null;
  return state.dashboard.dataByID[campaignId] || null;
};

/**
 * Get totals for the currently selected campaign
 * Memoized selector (only recalculates when dashboard data changes)
 */
export const selectTotals = createSelector(
  [selectDashboardData],
  (dashboardData) => dashboardData?.totals || { impressions: 0, clicks: 0, users: 0 }
);

/**
 * Get recent metrics for the currently selected campaign
 */
export const selectRecent = createSelector(
  [selectDashboardData],
  (dashboardData) => dashboardData?.recent || null
);

/**
 * Get iteration count for the currently selected campaign
 */
export const selectIteration = createSelector(
  [selectDashboardData],
  (dashboardData) => dashboardData?.iteration || 0
);

/**
 * Get last fetch timestamp for the currently selected campaign
 */
export const selectLastFetch = createSelector(
  [selectDashboardData],
  (dashboardData) => dashboardData?.lastFetch || null
);

/**
 * Calculate total CTR (Click-Through Rate)
 * Memoized selector - only recalculates when totals change
 */
export const selectTotalCTR = createSelector(
  [selectTotals],
  (totals) => {
    if (!totals.impressions) return 0;
    return (totals.clicks / totals.impressions) * 100;
  }
);

/**
 * Calculate recent CTR
 * Memoized selector - only recalculates when recent changes
 */
export const selectRecentCTR = createSelector(
  [selectRecent],
  (recent) => {
    if (!recent || !recent.impressions) return 0;
    return (recent.clicks / recent.impressions) * 100;
  }
);

/**
 * Check if a specific campaign is actively making requests
 */
export const selectIsActiveRequest = (state, campaignId) => 
  state.dashboard.activeRequests[campaignId] || false;

/**
 * Check if the currently selected campaign is actively making requests
 */
export const selectIsCurrentCampaignActive = createSelector(
  [selectSelectedCampaignId, (state) => state.dashboard.activeRequests],
  (campaignId, activeRequests) => {
    if (!campaignId) return false;
    return activeRequests[campaignId] || false;
  }
);

/**
 * Get loading state for metrics
 */
export const selectDashboardLoading = (state) => 
  state.dashboard.loading;

/**
 * Get error state for metrics
 */
export const selectDashboardError = (state) => 
  state.dashboard.error;

/**
 * Check if auto-refresh is paused (circuit breaker)
 */
export const selectIsAutoRefreshPaused = (state) => 
  state.dashboard.isAutoRefreshPaused;

/**
 * Get list of all campaign IDs that have data
 * Useful for showing "cached campaigns" or "recently viewed"
 */
export const selectCampaignsWithData = (state) => 
  Object.keys(state.dashboard.dataByID).map(id => parseInt(id, 10));
```

**Key Features:**
- ✅ Per-campaign data storage (`dataByID`)
- ✅ Auto-refresh control per campaign (`activeRequests`)
- ✅ Data persists when switching campaigns
- ✅ Pauses inactive campaigns automatically
- ✅ Memoized selectors for performance
- ✅ CTR calculations built into selectors

---

## 4. State Shape Reference

### Complete Redux State Tree:

```javascript
{
  campaigns: {
    // Normalized campaign metadata
    byId: {
      1: { id: 1, name: "Red Campaign", status: "active" },
      2: { id: 2, name: "Blue Campaign", status: "active" },
      3: { id: 3, name: "Green Campaign", status: "active" }
    },
    allIds: [1, 2, 3],
    
    // Request state
    loading: false,
    error: null
  },
  
  dashboard: {
    // Currently selected campaign
    selectedCampaignId: 1,
    
    // Data stored PER campaign (persists on switch!)
    dataByID: {
      1: {
        totals: { impressions: 50000, clicks: 2500, users: 15000 },
        recent: { impressions: 4500, clicks: 225, users: 1350 },
        iteration: 10,
        lastFetch: "2025-10-02T10:00:50Z"
      },
      2: {
        totals: { impressions: 30000, clicks: 1500, users: 9000 },
        recent: { impressions: 3000, clicks: 150, users: 900 },
        iteration: 6,
        lastFetch: "2025-10-02T10:00:30Z"
      }
      // Campaign 3 not visited yet - no entry
    },
    
    // Auto-refresh control (only campaign #1 is active)
    activeRequests: {
      1: true,   // Currently viewing - auto-refreshing
      2: false   // Not viewing - paused
    },
    
    // Request state
    loading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}
```

---

## 5. Usage Examples

### In Components:

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAllCampaigns,
  selectCampaignsLoading,
  selectCampaignsError 
} from '../store/slices/campaignsSlice';
import {
  selectTotals,
  selectRecent,
  selectTotalCTR,
  selectRecentCTR,
  selectCampaign
} from '../store/slices/dashboardSlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  // Get data from store
  const campaigns = useSelector(selectAllCampaigns);
  const totals = useSelector(selectTotals);
  const totalCTR = useSelector(selectTotalCTR);
  
  // Dispatch actions
  const handleSelectCampaign = (id) => {
    dispatch(selectCampaign(id));
  };
  
  return (
    <div>
      <h1>Total Impressions: {totals.impressions}</h1>
      <p>CTR: {totalCTR.toFixed(2)}%</p>
    </div>
  );
}
```

---

## 6. Key Benefits of This Architecture

### 1. Data Persistence
```javascript
// Switch from Campaign 1 to Campaign 2
dispatch(selectCampaign(2));

// Campaign 1's data is still in state!
state.dashboard.dataByID[1] // ✅ Preserved
```

### 2. Auto-Refresh Management
```javascript
// Only the selected campaign auto-refreshes
state.dashboard.activeRequests[1] = true  // Active
state.dashboard.activeRequests[2] = false // Paused
```

### 3. Separation of Concerns
```javascript
// campaigns slice: Only campaign metadata
// dashboard slice: Only dashboard logic
// No mixing!
```

### 4. Performance
```javascript
// Memoized selectors only recalculate when dependencies change
selectTotalCTR // Only recalculates when totals change
```

### 5. Testability
```javascript
// Test each slice independently
import campaignsReducer from './campaignsSlice';
import dashboardReducer from './dashboardSlice';
```

---

## 7. Testing Guide

### Testing Campaign Slice:

```javascript
import campaignsReducer, { loadCampaigns } from './campaignsSlice';

describe('campaignsSlice', () => {
  it('should handle loadCampaigns.fulfilled', () => {
    const previousState = { byId: {}, allIds: [], loading: true, error: null };
    const action = {
      type: loadCampaigns.fulfilled.type,
      payload: [
        { id: 1, name: 'Red Campaign' },
        { id: 2, name: 'Blue Campaign' }
      ]
    };
    
    const newState = campaignsReducer(previousState, action);
    
    expect(newState.byId[1]).toEqual({ id: 1, name: 'Red Campaign' });
    expect(newState.allIds).toEqual([1, 2]);
    expect(newState.loading).toBe(false);
  });
});
```

### Testing Dashboard Slice:

```javascript
import dashboardReducer, { selectCampaign, loadMetrics } from './dashboardSlice';

describe('dashboardSlice', () => {
  it('should preserve data when switching campaigns', () => {
    let state = {
      selectedCampaignId: null,
      dataByID: {},
      activeRequests: {},
      loading: false,
      error: null,
      isAutoRefreshPaused: false
    };
    
    // Select campaign 1
    state = dashboardReducer(state, selectCampaign(1));
    
    // Add some data
    state = dashboardReducer(state, {
      type: loadMetrics.fulfilled.type,
      payload: { 
        campaignId: 1, 
        data: { impressions: 1000, clicks: 50, users: 300 }
      }
    });
    
    // Switch to campaign 2
    state = dashboardReducer(state, selectCampaign(2));
    
    // Campaign 1's data should still exist!
    expect(state.dataByID[1].totals.impressions).toBe(1000);
    expect(state.activeRequests[1]).toBe(false); // Paused
    expect(state.activeRequests[2]).toBe(true);  // Active
  });
});
```

---

## 8. Common Pitfalls & Solutions

### Pitfall 1: Forgetting to Pause Old Campaign

❌ **Wrong:**
```javascript
selectCampaign: (state, action) => {
  state.selectedCampaignId = action.payload;
  // Forgot to pause old campaign - it keeps fetching!
}
```

✅ **Correct:**
```javascript
selectCampaign: (state, action) => {
  const oldId = state.selectedCampaignId;
  if (oldId) {
    state.activeRequests[oldId] = false; // Pause!
  }
  state.selectedCampaignId = action.payload;
  state.activeRequests[action.payload] = true;
}
```

### Pitfall 2: Clearing Data on Switch

❌ **Wrong:**
```javascript
selectCampaign: (state, action) => {
  state.dataByID[action.payload] = { /* reset */ }; // Lost data!
}
```

✅ **Correct:**
```javascript
selectCampaign: (state, action) => {
  getOrCreateDashboardData(state, action.payload); // Create if needed, keep if exists
}
```

### Pitfall 3: Not Checking Active State Before Fetching

❌ **Wrong:**
```javascript
// Component keeps fetching even after switching away
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(loadMetrics({ campaignId: id, iteration }));
  }, 5000);
  return () => clearInterval(interval);
}, [id]);
```

✅ **Correct:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // Check if this campaign is still active
    const isActive = store.getState().dashboard.activeRequests[id];
    if (isActive) {
      dispatch(loadMetrics({ campaignId: id, iteration }));
    }
  }, 5000);
  return () => clearInterval(interval);
}, [id]);
```

---

## 9. Next Steps

Now that Redux is set up with proper architecture:

1. ✅ Two slices created (campaigns + dashboard)
2. ✅ Data persists per campaign
3. ✅ Auto-refresh pauses for inactive campaigns
4. ✅ Clean separation of concerns

**Next: Guide 04 - Components** (using these slices)

---

## Summary

**What We Built:**
- 🏗️ Two-slice architecture (separation of concerns)
- 💾 Per-campaign data storage (no data loss)
- ⏸️ Smart auto-refresh (pause inactive campaigns)
- 🎯 Normalized state (Redux best practices)
- 🧮 Memoized selectors (performance)
- ✅ Clean, testable code

**Why This Matters:**
- Better UX (data persists)
- Better performance (no unnecessary fetches)
- Better code quality (separation of concerns)
- Better interviews (shows Redux expertise)

This is the professional way to structure Redux! 🚀
