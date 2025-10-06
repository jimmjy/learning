# Guide 05: Build Pages (Two-Slice Redux)

**Build CampaignListPage and DashboardPage using the two-slice Redux architecture**

---

## 🎯 Overview

We'll build two main pages:
1. **CampaignListPage** - Shows list of campaigns (uses `campaignsSlice`)
2. **DashboardPage** - Shows metrics for selected campaign (uses both slices)

Both pages connect to Redux and use the components from Guide 04.

---

## File Structure

```
src/pages/
├── CampaignListPage.jsx    # Campaign list + navigation
└── DashboardPage.jsx        # Dashboard with auto-refresh
```

---

## 1. CampaignListPage

**Purpose:** Display all campaigns as clickable cards

**Redux Connection:**
- Uses `campaignsSlice` only
- Loads campaigns on mount
- Navigates to dashboard on click

### Implementation:

```javascript
// src/pages/CampaignListPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectAllCampaigns,
  selectCampaignsLoading,
  selectCampaignsError,
  loadCampaigns
} from '../store/slices/campaignsSlice';

const CampaignListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get data from Redux (campaignsSlice only)
  const campaigns = useSelector(selectAllCampaigns);
  const isLoading = useSelector(selectCampaignsLoading);
  const error = useSelector(selectCampaignsError);
  
  // Load campaigns on mount
  useEffect(() => {
    dispatch(loadCampaigns());
  }, [dispatch]);
  
  // Handle campaign click
  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };
  
  // Handle retry
  const handleRetry = () => {
    dispatch(loadCampaigns());
  };
  
  // Loading state
  if (isLoading && campaigns.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }
  
  // Error state (full-page error)
  if (error && campaigns.length === 0) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <div className="error-state-icon">⚠️</div>
          <div className="error-state-title">Failed to Load Campaigns</div>
          <div className="error-state-description">
            We couldn't load your campaigns. This might be a temporary connection issue.
          </div>
          <button className="retry-button" onClick={handleRetry}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Success state - show campaign grid
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campaign Dashboard</h1>
        <p className="page-subtitle">Select a campaign to view detailed metrics</p>
      </div>
      
      {/* Show error banner if error but we have cached campaigns */}
      {error && campaigns.length > 0 && (
        <div className="error-banner warning">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Update Failed</div>
            <div className="error-message">
              Couldn't refresh campaign list. Showing cached data.
            </div>
          </div>
          <button className="retry-button-small" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      
      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="campaign-card"
            onClick={() => handleCampaignClick(campaign.id)}
          >
            <div className="campaign-id">#{campaign.id}</div>
            <div className="campaign-name">{campaign.name}</div>
            <div className="campaign-status">Active</div>
            <div className="campaign-arrow">→</div>
          </div>
        ))}
      </div>
      
      {campaigns.length === 0 && !isLoading && !error && (
        <div className="empty-state">
          <p>No campaigns available</p>
        </div>
      )}
    </div>
  );
};

export default CampaignListPage;
```

---

## 2. DashboardPage

**Purpose:** Display metrics for selected campaign with auto-refresh

**Redux Connection:**
- Uses `campaignsSlice` for campaign metadata
- Uses `dashboardSlice` for metrics and auto-refresh
- Manages auto-refresh interval
- Implements circuit breaker (pause after 3 failures)

### Implementation:

```javascript
// src/pages/DashboardPage.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

// Import from BOTH slices
import { 
  selectAllCampaigns,
  selectCampaignById 
} from '../store/slices/campaignsSlice';

import {
  selectDashboardData,
  selectTotals,
  selectRecent,
  selectTotalCTR,
  selectRecentCTR,
  selectIteration,
  selectLastFetch,
  selectDashboardError,
  selectIsAutoRefreshPaused,
  selectIsCurrentCampaignActive,
  loadMetrics,
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh
} from '../store/slices/dashboardSlice';

import MetricCard from '../components/MetricCard';
import SummaryCard from '../components/SummaryCard';

const DashboardPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const MAX_FAILURES = 3;
  
  // Get campaign metadata from campaignsSlice
  const campaigns = useSelector(selectAllCampaigns);
  const campaign = useSelector((state) => 
    selectCampaignById(state, parseInt(id, 10))
  );
  
  // Get dashboard data from dashboardSlice
  const dashboardData = useSelector(selectDashboardData);
  const totals = useSelector(selectTotals);
  const recent = useSelector(selectRecent);
  const totalCTR = useSelector(selectTotalCTR);
  const recentCTR = useSelector(selectRecentCTR);
  const iteration = useSelector(selectIteration);
  const lastFetch = useSelector(selectLastFetch);
  const error = useSelector(selectDashboardError);
  const isAutoRefreshPaused = useSelector(selectIsAutoRefreshPaused);
  const isActive = useSelector(selectIsCurrentCampaignActive);
  
  // Select campaign on mount or when ID changes
  useEffect(() => {
    const campaignId = parseInt(id, 10);
    
    // Validate campaign ID
    if (isNaN(campaignId) || campaignId <= 0) {
      console.error('Invalid campaign ID');
      navigate('/');
      return;
    }
    
    // Select this campaign in Redux
    // This will:
    // 1. Pause the old campaign's auto-refresh
    // 2. Set this as the selected campaign
    // 3. Activate this campaign's auto-refresh
    // 4. Create dashboard data entry if doesn't exist (but keep if exists!)
    dispatch(selectCampaign(campaignId));
    
    return () => {
      isMounted.current = false;
    };
  }, [id, dispatch, navigate]);
  
  // Initial data fetch when dashboard data becomes available
  useEffect(() => {
    if (!campaign || !dashboardData) return;
    
    const campaignId = parseInt(id, 10);
    
    // Fetch initial data (or next iteration if resuming)
    dispatch(loadMetrics({
      campaignId,
      iteration: dashboardData.iteration
    }));
  }, [campaign, dashboardData?.iteration, dispatch, id]);
  
  // Auto-refresh interval
  useEffect(() => {
    if (!campaign || !dashboardData || isAutoRefreshPaused) {
      return;
    }
    
    const campaignId = parseInt(id, 10);
    
    const intervalId = setInterval(() => {
      if (!isMounted.current) return;
      
      // Double-check campaign is still active before fetching
      // (could have been paused by switching campaigns)
      const state = window.store?.getState();
      const stillActive = state?.dashboard?.activeRequests?.[campaignId];
      
      if (stillActive) {
        dispatch(loadMetrics({
          campaignId,
          iteration: dashboardData.iteration
        }));
      }
    }, 5000); // Every 5 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [campaign, dashboardData, isAutoRefreshPaused, id, dispatch]);
  
  // Track consecutive failures for circuit breaker
  useEffect(() => {
    if (error) {
      setConsecutiveFailures((prev) => prev + 1);
    } else {
      setConsecutiveFailures(0);
    }
  }, [error]);
  
  // Circuit breaker: Pause after 3 consecutive failures
  useEffect(() => {
    if (consecutiveFailures >= MAX_FAILURES && !isAutoRefreshPaused) {
      dispatch(pauseAutoRefresh());
    }
  }, [consecutiveFailures, isAutoRefreshPaused, dispatch]);
  
  // Handle retry button
  const handleRetry = () => {
    setConsecutiveFailures(0);
    dispatch(resumeAutoRefresh());
  };
  
  // Handle campaign switch from dropdown
  const handleCampaignChange = (e) => {
    const newCampaignId = parseInt(e.target.value, 10);
    navigate(`/campaign/${newCampaignId}`);
  };
  
  // Handle back button
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Format last updated time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };
  
  // Loading state (initial load)
  if (!campaign || !dashboardData) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Render dashboard
  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-title">Campaign Dashboard</div>
        </div>
        <div className="navbar-right">
          <button className="back-button" onClick={handleBackClick}>
            <span className="back-arrow">←</span>
            <span>Back to Campaigns</span>
          </button>
          <span className="divider">|</span>
          <span className="selector-label">Switch Campaign:</span>
          <select 
            className="campaign-selector"
            value={id}
            onChange={handleCampaignChange}
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </nav>
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">{campaign.name}</h1>
        <div className="dashboard-subtitle">
          {!isAutoRefreshPaused && (
            <span className="update-indicator">
              <span className="pulse"></span>
              Auto-refreshing
            </span>
          )}
          {isAutoRefreshPaused && (
            <span className="update-indicator paused">
              <span className="pause-icon">⏸</span>
              Paused
            </span>
          )}
          <span>•</span>
          <span>Last updated: {getTimeAgo(lastFetch)}</span>
        </div>
      </div>
      
      {/* Error Banner - Transient (< 3 failures) */}
      {error && !isAutoRefreshPaused && (
        <div className="error-banner warning">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Connection Issue</div>
            <div className="error-message">
              {error} - Retrying automatically...
            </div>
          </div>
        </div>
      )}
      
      {/* Error Banner - Persistent (>= 3 failures) */}
      {error && isAutoRefreshPaused && (
        <div className="error-banner danger">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Auto-refresh Paused</div>
            <div className="error-message">
              Unable to fetch latest data after multiple attempts. 
              Last updated: {getTimeAgo(lastFetch)}
            </div>
          </div>
          <button className="retry-button" onClick={handleRetry}>
            Retry Now
          </button>
        </div>
      )}
      
      {/* Summary Card */}
      <SummaryCard
        impressions={totals.impressions}
        ctr={totalCTR}
        clicks={totals.clicks}
      />
      
      {/* Total Metrics Section */}
      <div className="section-header">Total Metrics</div>
      <div className="metrics-grid">
        <MetricCard
          title="Total Impressions"
          value={totals.impressions.toLocaleString()}
          subtitle="Sum of all impressions"
        />
        <MetricCard
          title="Total Clicks"
          value={totals.clicks.toLocaleString()}
          subtitle="Sum of all clicks"
        />
        <MetricCard
          title="Total Users"
          value={totals.users.toLocaleString()}
          subtitle="Sum of all users"
        />
        <MetricCard
          title="Total CTR"
          value={`${totalCTR.toFixed(2)}%`}
          subtitle="Click-through rate"
        />
        <MetricCard
          title="Current Iteration"
          value={`#${iteration}`}
          subtitle="API call count"
        />
      </div>
      
      {/* Recent Metrics Section */}
      {recent && (
        <>
          <div className="section-header">Recent Metrics</div>
          <div className="metrics-grid">
            <MetricCard
              title="Recent Impressions"
              value={recent.impressions.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent Clicks"
              value={recent.clicks.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent Users"
              value={recent.users.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent CTR"
              value={`${recentCTR.toFixed(2)}%`}
              subtitle="Latest performance"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
```

---

## 3. Key Features Explained

### A. Campaign Selection (Automatic Pause/Resume)

```javascript
// When component mounts or ID changes
dispatch(selectCampaign(campaignId));

// This Redux action:
// 1. Pauses old campaign: activeRequests[oldId] = false
// 2. Sets new selected: selectedCampaignId = newId
// 3. Activates new campaign: activeRequests[newId] = true
// 4. Preserves old campaign's data (doesn't reset!)
```

**Result:** Only one campaign fetches at a time, but all data is preserved!

---

### B. Auto-Refresh with Active Check

```javascript
const intervalId = setInterval(() => {
  // Double-check campaign is still active
  const stillActive = state?.dashboard?.activeRequests?.[campaignId];
  
  if (stillActive) {
    dispatch(loadMetrics({ campaignId, iteration }));
  }
  // If not active, skip - campaign was switched away
}, 5000);
```

**Why the check?** If user switches campaigns mid-interval, we don't want the old campaign to fetch one last time.

---

### C. Circuit Breaker (Pause After 3 Failures)

```javascript
// Track failures
useEffect(() => {
  if (error) {
    setConsecutiveFailures((prev) => prev + 1);
  } else {
    setConsecutiveFailures(0);  // Reset on success
  }
}, [error]);

// Pause after 3 failures
useEffect(() => {
  if (consecutiveFailures >= 3 && !isAutoRefreshPaused) {
    dispatch(pauseAutoRefresh());
  }
}, [consecutiveFailures, isAutoRefreshPaused, dispatch]);
```

**Result:** Don't hammer a failing API. Let user manually retry.

---

### D. Data Persistence

```javascript
// Switch to Campaign #2
navigate('/campaign/2');

// Behind the scenes:
// - Old campaign (#1) data stays in state: dataByID[1] = { ... }
// - New campaign (#2) gets its own entry: dataByID[2] = { ... }

// Switch back to Campaign #1
navigate('/campaign/1');

// Campaign #1's data is still there!
// - totals: 50,000 impressions (preserved!)
// - iteration: 10 (continue from where left off)
```

**Result:** Professional UX - no data loss!

---

## 4. Component Flow Summary

### CampaignListPage:
```
Mount
  ↓
Dispatch loadCampaigns()
  ↓
Show loading spinner
  ↓
API returns data
  ↓
Show campaign grid
  ↓
User clicks campaign
  ↓
Navigate to /campaign/:id
```

### DashboardPage:
```
Mount with ID from URL
  ↓
Dispatch selectCampaign(id)
  ↓
Redux: Pause old, activate new
  ↓
Fetch initial data (iteration 0 or resume)
  ↓
Show dashboard
  ↓
Start 5-second interval
  ↓
Every 5s: Check if active → Fetch next iteration
  ↓
Accumulate totals, update recent
  ↓
Re-render with new data
  ↓
On error: Track failures → Pause after 3
  ↓
On unmount: Clear interval
```

---

## 5. Testing Checklist

### CampaignListPage:
- [ ] Shows loading spinner on initial load
- [ ] Shows campaign cards after loading
- [ ] Clicking campaign navigates to dashboard
- [ ] Shows error state if API fails
- [ ] Retry button works

### DashboardPage:
- [ ] Shows campaign name in header
- [ ] Initial data fetches correctly
- [ ] Auto-refresh works (every 5 seconds)
- [ ] Totals accumulate over time
- [ ] Recent updates with latest data
- [ ] CTR calculates correctly
- [ ] Switching campaigns preserves old data ⭐
- [ ] Old campaign stops fetching when switched away ⭐
- [ ] Error banner shows on transient error
- [ ] Circuit breaker activates after 3 failures
- [ ] Retry button resumes auto-refresh
- [ ] Back button returns to campaign list
- [ ] Dropdown switches campaigns correctly

---

## 6. Common Issues & Solutions

### Issue: "Auto-refresh keeps running after switching campaigns"

**Solution:** Make sure you're checking `activeRequests` in the interval:
```javascript
const stillActive = state?.dashboard?.activeRequests?.[campaignId];
if (stillActive) {
  dispatch(loadMetrics({ ... }));
}
```

### Issue: "Data resets when switching back to a campaign"

**Solution:** Check your `selectCampaign` reducer - it should use `getOrCreateDashboardData`, not reset unconditionally.

### Issue: "Cannot read property 'iteration' of undefined"

**Solution:** Dashboard data might not exist yet. Add null check:
```javascript
if (!dashboardData) return;
```

---

## 7. Next Steps

With Guide 05 complete, you have:
- ✅ CampaignListPage (shows campaigns)
- ✅ DashboardPage (shows metrics with auto-refresh)
- ✅ Per-campaign data persistence
- ✅ Auto-refresh pause for inactive campaigns
- ✅ Error handling with circuit breaker

**Next:** Guide 06 - Routing (connect pages with React Router)

---

## Summary

**What We Built:**
- 📄 CampaignListPage - Uses `campaignsSlice`
- 📊 DashboardPage - Uses both slices
- 🔄 Auto-refresh with intelligent pausing
- 💾 Data persistence across switches
- ⚠️ Error handling with circuit breaker
- 🎯 Professional UX patterns

This is production-grade React + Redux! 🚀
