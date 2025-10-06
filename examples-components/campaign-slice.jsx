// src/store/slices/campaignsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { campaignService } from "../../services/campaignService";

// ========================================
// ASYNC THUNKS
// ========================================

/**
 * Fetch all campaigns from the API
 * Only called once when app loads
 */
export const loadCampaigns = createAsyncThunk(
  "campaigns/loadCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      return await campaignService.fetchCampaigns();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Normalized structure (Redux best practice)
  // maybe change to campaignsById
  byId: {}, // { 1: {id: 1, name: "Red"}, 2: {id: 2, name: "Blue"} }
  allIds: [], // [1, 2, 3]

  // Request state
  loading: false,
  error: null,
};

// ========================================
// SLICE
// ========================================

const campaignsSlice = createSlice({
  name: "campaigns",
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
        // Note: In dev mode, Strict Mode may cause double-renders
        // Reset ensures we start fresh each time
        state.byId = {};
        state.allIds = [];

        action.payload.forEach((campaign) => {
          state.byId[campaign.id] = campaign;

          // Defensive: Only add if not already present
          // (handles edge case of duplicate API responses)
          if (!state.allIds.includes(campaign.id)) {
            state.allIds.push(campaign.id);
          }
        });

        state.loading = false;
        state.error = null;
      })

      // Load Campaigns: Error
      .addCase(loadCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load campaigns";
      });
  },
});

export default campaignsSlice.reducer;

// ========================================
// SELECTORS
// ========================================

/**
 * Get campaigns by ID object
 * Use this for lookups: state.campaigns.byId[id]
 */
export const selectCampaignsById = (state) => state.campaigns.byId;

/**
 * Get all campaign IDs
 * Use this for iteration: allIds.map(id => byId[id])
 */
export const selectAllCampaignIds = (state) => state.campaigns.allIds;

/**
 * Get a specific campaign by ID
 * Returns the campaign object or undefined
 */
export const selectCampaignById = (state, campaignId) =>
  state.campaigns.byId[campaignId];

/**
 * Get loading state for campaign list
 */
export const selectCampaignsLoading = (state) => state.campaigns.loading;

/**
 * Get error state for campaign list
 */
export const selectCampaignsError = (state) => state.campaigns.error;
