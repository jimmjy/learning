// src/store/slices/dashboardSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { campaignService } from "../../services/campaignService";

// ========================================
// ASYNC THUNKS
// ========================================

/**
 * Fetch metrics for a specific campaign and iteration
 */
export const loadMetrics = createAsyncThunk(
  "dashboard/loadMetrics",
  async ({ campaignId, iteration }, { rejectWithValue }) => {
    try {
      const data = await campaignService.fetchCampaignMetrics(
        campaignId,
        iteration,
      );
      return { campaignId, data };
    } catch (error) {
      return rejectWithValue({ campaignId, error: error.message });
    }
  },
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
  isAutoRefreshPaused: false,
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
      lastFetch: null,
    };
  }
  return state.dataByID[campaignId];
};

// ========================================
// SLICE
// ========================================

const dashboardSlice = createSlice({
  name: "dashboard",
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
      Object.keys(state.activeRequests).forEach((id) => {
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
    },
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
          users: data.users,
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
        state.error = action.payload?.error || "Failed to fetch metrics";
        // NOTE: We don't clear data on error - keep showing last good data!
      });
  },
});

export const {
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh,
  clearCampaignData,
  clearAllCampaignData,
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
 * Returns: { totals, recent, iteration, lastFetch } or null
 */
export const selectDashboardData = (state) => {
  const campaignId = state.dashboard.selectedCampaignId;
  if (!campaignId) return null;
  return state.dashboard.dataByID[campaignId] ?? null;
};

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
  },
);

/**
 * Get loading state for metrics
 */
export const selectDashboardLoading = (state) => state.dashboard.loading;

/**
 * Get error state for metrics
 */
export const selectDashboardError = (state) => state.dashboard.error;

/**
 * Check if auto-refresh is paused (circuit breaker)
 */
export const selectIsAutoRefreshPaused = (state) =>
  state.dashboard.isAutoRefreshPaused;

/**
 * Get list of all campaign IDs that have data
 * Useful for showing "recently viewed" campaigns
 */
export const selectCampaignsWithData = (state) =>
  Object.keys(state.dashboard.dataByID).map((id) => parseInt(id, 10));
