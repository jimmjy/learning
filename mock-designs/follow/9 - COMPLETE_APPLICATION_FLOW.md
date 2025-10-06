# Complete Application Flow - Campaign Dashboard

**A comprehensive walkthrough of every user journey, data flow, and error state**

---

## 🗺️ Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Flow 1: Campaign List Page](#flow-1-campaign-list-page)
3. [Flow 2: Dashboard Page - Success](#flow-2-dashboard-page-success)
4. [Flow 3: Dashboard Page - Auto-Refresh](#flow-3-dashboard-page-auto-refresh)
5. [Flow 4: Error Handling](#flow-4-error-handling)
6. [Flow 5: Navigation & Switching](#flow-5-navigation--switching)
7. [Redux State Changes](#redux-state-changes)
8. [API Call Sequences](#api-call-sequences)

---

## 🏗️ High-Level Architecture

### The Stack:
```
┌─────────────────────────────────────────┐
│          User Interface (React)         │
│  - CampaignListPage                     │
│  - DashboardPage                        │
│  - Components (MetricCard, etc.)        │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Redux Store (State Manager)      │
│  - campaignsSlice                       │
│  - Selectors (CTR calculations)         │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Services Layer                  │
│  - campaignService (API calls + retry)  │
│  - validation (XSS prevention)          │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           Mock API (MSW)                │
│  - GET /api/campaigns                   │
│  - GET /api/campaigns/:id?number=X      │
└─────────────────────────────────────────┘
```

---

## 📊 Flow 1: Campaign List Page

### **User Journey: Landing on the App**

```
USER ACTION: Opens http://localhost:5173/
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. App.jsx renders                                       │
│    - React Router matches "/" route                      │
│    - Renders <CampaignListPage />                        │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. CampaignListPage mounts                               │
│    - useEffect runs on mount                             │
│    - Dispatch: loadCampaigns() thunk                     │
│    - State: isLoading = true                             │
│    - UI: Shows loading spinner                           │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Redux Thunk: loadCampaigns()                          │
│    - Calls: campaignService.fetchCampaigns()             │
│    - Service makes: GET /api/campaigns                   │
└──────────────────────────────────────────────────────────┘
                    ↓
         ┌──────────────────┐
         │  SUCCESS or FAIL? │
         └──────────────────┘
          ↙              ↘
    SUCCESS              FAILURE
        ↓                   ↓
```

### **Success Path:**

```
┌──────────────────────────────────────────────────────────┐
│ 4a. API Response: 200 OK                                 │
│     [                                                    │
│       { id: 1, name: "Red Campaign" },                   │
│       { id: 2, name: "Blue Campaign" }                   │
│     ]                                                    │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5a. Validation: validateCampaignList(data)               │
│     - Check: Is array? ✅                                │
│     - Check: Has items? ✅                               │
│     - Check: Each has id + name? ✅                      │
│     - Sanitize: XSS prevention on names                  │
│     - Return: Cleaned data                               │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6a. Redux: loadCampaigns.fulfilled                       │
│     - State update:                                      │
│       • list = [{id: 1, name: "Red"}, ...]               │
│       • isLoading = false                                │
│       • error = null                                     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 7a. UI Re-renders                                        │
│     - Hide loading spinner                               │
│     - Show campaign cards (grid)                         │
│     - Each card clickable                                │
│     - Hover effects active                               │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 8a. USER SEES: Grid of campaign cards                    │
│                                                          │
│     ┌──────────────┐  ┌──────────────┐                 │
│     │ #1           │  │ #2           │                 │
│     │ Red Campaign │  │ Blue Campaign│                 │
│     │ [Active]     │  │ [Active]     │                 │
│     └──────────────┘  └──────────────┘                 │
└──────────────────────────────────────────────────────────┘
```

### **Failure Path:**

```
┌──────────────────────────────────────────────────────────┐
│ 4b. API Response: 500 Server Error                       │
│     OR Network timeout                                   │
│     OR Invalid JSON                                      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5b. Service: fetchWithRetry()                            │
│     - Attempt 1: Failed ❌                               │
│     - Wait 1 second                                      │
│     - Attempt 2: Failed ❌                               │
│     - Wait 2 seconds                                     │
│     - Attempt 3: Failed ❌                               │
│     - Give up, throw error                               │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6b. Redux: loadCampaigns.rejected                        │
│     - State update:                                      │
│       • list = []                                        │
│       • isLoading = false                                │
│       • error = "Failed to fetch campaigns"              │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 7b. UI Re-renders                                        │
│     - Hide loading spinner                               │
│     - Show error state component                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 8b. USER SEES: Error State                               │
│                                                          │
│         ⚠️                                               │
│     Failed to Load Campaigns                             │
│     We couldn't load your campaigns.                     │
│     This might be a temporary connection issue.          │
│                                                          │
│         [🔄 Try Again]                                   │
│                                                          │
│ USER ACTION: Clicks "Try Again"                          │
│            → Go back to step 2 (retry)                   │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Flow 2: Dashboard Page - Success

### **User Journey: Clicking a Campaign**

```
USER ACTION: Clicks "Red Campaign" card
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Navigation                                            │
│    - React Router: navigate('/campaign/1')               │
│    - URL changes to: /campaign/1                         │
│    - <DashboardPage /> renders                           │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. DashboardPage mounts                                  │
│    - useParams: { id: "1" }                              │
│    - Validate ID: Is positive integer? ✅                │
│    - Dispatch: selectCampaign(1)                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Redux: selectCampaign(1)                              │
│    - State update:                                       │
│      • selectedCampaignId = 1                            │
│      • dashboardData = RESET to initial                  │
│        - totals: { impressions: 0, clicks: 0, users: 0 } │
│        - recent: null                                    │
│        - iteration: 0                                    │
│      • error = null                                      │
│      • isAutoRefreshPaused = false                       │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. useEffect #1: Initial Data Fetch                      │
│    - Dependency: [campaign, iteration]                   │
│    - Dispatch: loadMetrics({                             │
│        campaignId: 1,                                    │
│        iteration: 0  ← First fetch                       │
│      })                                                  │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Redux Thunk: loadMetrics()                            │
│    - Calls: campaignService.fetchCampaignMetrics(1, 0)   │
│    - Service makes: GET /api/campaigns/1?number=0        │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6. API Response: 200 OK                                  │
│    {                                                     │
│      impressions: 10000,                                 │
│      clicks: 500,                                        │
│      users: 3000                                         │
│    }                                                     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 7. Validation: validateCampaignData(data)                │
│    - Check: Has impressions? ✅                          │
│    - Check: Has clicks? ✅                               │
│    - Check: Has users? ✅                                │
│    - Check: All >= 0? ✅                                 │
│    - Return: Valid data                                  │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 8. Redux: loadMetrics.fulfilled                          │
│    - State update:                                       │
│      • totals.impressions += 10000  → 10000              │
│      • totals.clicks += 500         → 500                │
│      • totals.users += 3000         → 3000               │
│      • recent = { impressions: 10000, clicks: 500, ... } │
│      • iteration += 1               → 1                  │
│      • lastSuccessfulFetch = "2025-10-02T10:00:00Z"      │
│      • isLoading = false                                 │
│      • error = null                                      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 9. Selectors Calculate CTR                               │
│    - selectTotalCTR:                                     │
│      (500 / 10000) * 100 = 5.00%                         │
│    - selectRecentCTR:                                    │
│      (500 / 10000) * 100 = 5.00%                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 10. UI Re-renders with Data                              │
│     - Summary Card shows: 10000 impressions, 5.00% CTR   │
│     - Total Metrics (4 tiles):                           │
│       • Total Impressions: 10,000                        │
│       • Total Clicks: 500                                │
│       • Total CTR: 5.00%                                 │
│       • Total Users: 3,000                               │
│     - Recent Metrics (4 tiles):                          │
│       • Recent Impressions: 10,000                       │
│       • Recent Clicks: 500                               │
│       • Recent CTR: 5.00%                                │
│       • Recent Users: 3,000                              │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 11. USER SEES: Full Dashboard                            │
│                                                          │
│     [Summary Card - Blue gradient]                       │
│     10,000 impressions • 5.00% CTR • 500 clicks          │
│                                                          │
│     Total Metrics                                        │
│     [10,000]  [500]  [5.00%]  [3,000]                   │
│                                                          │
│     Recent Metrics                                       │
│     [10,000]  [500]  [5.00%]  [3,000]                   │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 12. useEffect #2: Setup Auto-Refresh                     │
│     - Set interval: every 5 seconds                      │
│     - Interval will dispatch loadMetrics() automatically │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Flow 3: Dashboard Page - Auto-Refresh

### **Automatic Background Updates (Every 5 Seconds)**

```
┌──────────────────────────────────────────────────────────┐
│ TIME: 5 seconds pass                                     │
│ TRIGGER: setInterval fires                               │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Auto-Refresh: Fetch Next Iteration                    │
│    - Current iteration: 1 (from Redux)                   │
│    - Dispatch: loadMetrics({                             │
│        campaignId: 1,                                    │
│        iteration: 1  ← Incremented                       │
│      })                                                  │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Service: GET /api/campaigns/1?number=1                │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. API Response: 200 OK                                  │
│    {                                                     │
│      impressions: 12000,  ← New data for iteration 1     │
│      clicks: 600,                                        │
│      users: 3500                                         │
│    }                                                     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Redux: loadMetrics.fulfilled                          │
│    - State update (ACCUMULATE):                          │
│      • totals.impressions += 12000  → 22000 (10k + 12k)  │
│      • totals.clicks += 600         → 1100 (500 + 600)   │
│      • totals.users += 3500         → 6500 (3k + 3.5k)   │
│      • recent = { impressions: 12000, clicks: 600, ... } │
│      • iteration += 1               → 2                  │
│      • lastSuccessfulFetch = "2025-10-02T10:00:05Z"      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Selectors Recalculate                                 │
│    - selectTotalCTR:                                     │
│      (1100 / 22000) * 100 = 5.00%  ← Same CTR            │
│    - selectRecentCTR:                                    │
│      (600 / 12000) * 100 = 5.00%   ← Same CTR            │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6. UI Smoothly Updates                                   │
│    - Numbers change (no flash)                           │
│    - Summary Card:                                       │
│      22,000 impressions (was 10,000)                     │
│    - Total Impressions: 22,000 (was 10,000)              │
│    - Total Clicks: 1,100 (was 500)                       │
│    - Recent Impressions: 12,000 (was 10,000)             │
│    - Recent Clicks: 600 (was 500)                        │
│    - "Last updated: Just now"                            │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 7. USER SEES: Live Updating Numbers                      │
│    - Numbers increment smoothly                          │
│    - Green "Auto-refreshing" badge pulses                │
│    - No page reload                                      │
│    - No loading spinners                                 │
└──────────────────────────────────────────────────────────┘
                    ↓
            Wait 5 seconds...
                    ↓
           Repeat from step 1
       (with iteration = 2, then 3, etc.)
```

---

## 📊 Flow 4: Error Handling

### **Scenario A: Transient Error (Auto-Retry)**

```
┌──────────────────────────────────────────────────────────┐
│ TIME: 15 seconds in (iteration 3)                        │
│ TRIGGER: Auto-refresh fires                              │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Service: GET /api/campaigns/1?number=3                │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. API Response: 500 Server Error ❌                     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Service: fetchWithRetry()                             │
│    - Attempt 1: Failed ❌                                │
│    - Wait 1 second                                       │
│    - Attempt 2: Success ✅ (transient error)             │
│    - Return data                                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Redux: loadMetrics.fulfilled                          │
│    - Data accumulated as normal                          │
│    - User never knew there was an error!                 │
└──────────────────────────────────────────────────────────┘
```

### **Scenario B: Persistent Error (First Failure)**

```
┌──────────────────────────────────────────────────────────┐
│ 1. Service: All 2 retry attempts fail                    │
│    - Throw error                                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Redux: loadMetrics.rejected                           │
│    - State update:                                       │
│      • error = "Failed to fetch metrics"                 │
│      • isLoading = false                                 │
│      • isAutoRefreshPaused = false (not yet)             │
│      • IMPORTANT: Keep totals/recent (don't clear!)      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. useEffect: Track consecutive failures                 │
│    - consecutiveFailures = 1                             │
│    - < 3 failures → Keep auto-refresh running            │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. UI Shows: Transient Error Banner (Yellow)             │
│                                                          │
│    ┌────────────────────────────────────────────────┐   │
│    │ ⚠️ Connection issue - retrying automatically... │   │
│    └────────────────────────────────────────────────┘   │
│                                                          │
│    [Data still visible below - not cleared]              │
│    Summary Card: 22,000 impressions (stale but shown)    │
│    Metrics: All visible                                  │
└──────────────────────────────────────────────────────────┘
                    ↓
            Wait 5 seconds...
                    ↓
         Try again (iteration 4)
```

### **Scenario C: Circuit Breaker (3 Consecutive Failures)**

```
┌──────────────────────────────────────────────────────────┐
│ SITUATION: 3rd consecutive failure                       │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. useEffect: Check failure count                        │
│    - consecutiveFailures = 3                             │
│    - >= MAX_FAILURES (3) → Trigger circuit breaker       │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Dispatch: pauseAutoRefresh()                          │
│    - State update:                                       │
│      • isAutoRefreshPaused = true                        │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. useEffect: Stop interval                              │
│    - clearInterval(intervalId)                           │
│    - Auto-refresh STOPPED                                │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. UI Shows: Persistent Error Banner (Red)               │
│                                                          │
│    ┌────────────────────────────────────────────────┐   │
│    │ ⚠️ Auto-refresh paused due to connection issues│   │
│    │    Last updated 2 minutes ago                  │   │
│    │                          [Retry Now] ←Button   │   │
│    └────────────────────────────────────────────────┘   │
│                                                          │
│    [Data still visible - showing last good data]         │
│    Summary Card: 22,000 impressions (stale but shown)    │
│    Metrics: All visible (2 minutes old)                  │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ USER ACTION: Clicks "Retry Now"                          │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Dispatch: resumeAutoRefresh()                         │
│    - State update:                                       │
│      • isAutoRefreshPaused = false                       │
│      • error = null                                      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6. useEffect: Restart auto-refresh                       │
│    - Reset consecutive failures to 0                     │
│    - Fetch immediately                                   │
│    - Start 5-second interval again                       │
└──────────────────────────────────────────────────────────┘
                    ↓
         If successful → Resume normal flow
         If fails again → Back to circuit breaker
```

---

## 📊 Flow 5: Navigation & Switching

### **Scenario A: Switch Campaigns (Dropdown)**

```
USER ACTION: Selects "Blue Campaign" from dropdown
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Event: onChange handler                               │
│    - Navigate to: /campaign/2                            │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. useEffect: Detects route change                       │
│    - useParams: { id: "2" }                              │
│    - Cleanup: Clear previous interval                    │
│    - Dispatch: selectCampaign(2)                         │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Redux: selectCampaign(2)                              │
│    - RESET dashboard:                                    │
│      • selectedCampaignId = 2                            │
│      • totals = { impressions: 0, clicks: 0, users: 0 }  │
│      • recent = null                                     │
│      • iteration = 0                                     │
│      • error = null                                      │
└──────────────────────────────────────────────────────────┘
                    ↓
            Start fresh from Flow 2
            (Initial data fetch for campaign 2)
```

### **Scenario B: Back to Campaign List**

```
USER ACTION: Clicks "← Back to Campaigns"
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Navigation: navigate('/')                             │
│    - URL changes to: /                                   │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. DashboardPage: useEffect cleanup                      │
│    - Clear interval (stop auto-refresh)                  │
│    - isMounted = false (prevent state updates)           │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. CampaignListPage renders                              │
│    - Campaign list still in Redux (cached!)              │
│    - No API call needed (already have data)              │
│    - Shows campaign cards immediately                    │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ USER SEES: Instant list (no loading)                     │
│    - Smooth transition                                   │
│    - No flicker                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🗃️ Redux State Changes

### **Complete State Timeline:**

```javascript
// INITIAL STATE (app starts)
{
  campaigns: {
    list: [],
    selectedCampaignId: null,
    dashboardData: {
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastSuccessfulFetch: null
    },
    isLoading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: loadCampaigns() dispatched
{
  campaigns: {
    list: [],
    selectedCampaignId: null,
    dashboardData: { ... },
    isLoading: true,  // ← Changed
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: loadCampaigns.fulfilled
{
  campaigns: {
    list: [                           // ← Changed
      { id: 1, name: "Red Campaign" },
      { id: 2, name: "Blue Campaign" }
    ],
    selectedCampaignId: null,
    dashboardData: { ... },
    isLoading: false,                 // ← Changed
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: selectCampaign(1)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,            // ← Changed
    dashboardData: {                  // ← Reset
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastSuccessfulFetch: null
    },
    isLoading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: loadMetrics.fulfilled (iteration 0)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: {
      totals: {                       // ← Accumulated
        impressions: 10000,
        clicks: 500,
        users: 3000
      },
      recent: {                       // ← Updated
        impressions: 10000,
        clicks: 500,
        users: 3000
      },
      iteration: 1,                   // ← Incremented
      lastSuccessfulFetch: "2025-10-02T10:00:00Z"  // ← Updated
    },
    isLoading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: loadMetrics.fulfilled (iteration 1)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: {
      totals: {                       // ← Accumulated again
        impressions: 22000,           // 10000 + 12000
        clicks: 1100,                 // 500 + 600
        users: 6500                   // 3000 + 3500
      },
      recent: {                       // ← Updated to latest
        impressions: 12000,
        clicks: 600,
        users: 3500
      },
      iteration: 2,                   // ← Incremented
      lastSuccessfulFetch: "2025-10-02T10:00:05Z"  // ← Updated
    },
    isLoading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}

// AFTER: loadMetrics.rejected (error)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: {
      totals: {                       // ← NOT CLEARED (important!)
        impressions: 22000,
        clicks: 1100,
        users: 6500
      },
      recent: {                       // ← NOT CLEARED
        impressions: 12000,
        clicks: 600,
        users: 3500
      },
      iteration: 2,                   // ← Not incremented
      lastSuccessfulFetch: "2025-10-02T10:00:05Z"  // ← Old timestamp
    },
    isLoading: false,
    error: "Failed to fetch metrics",  // ← Error set
    isAutoRefreshPaused: false         // ← Not paused yet (< 3 fails)
  }
}

// AFTER: pauseAutoRefresh() (3 consecutive failures)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: { ... },            // ← Data still there
    isLoading: false,
    error: "Failed to fetch metrics",
    isAutoRefreshPaused: true          // ← Now paused
  }
}

// AFTER: resumeAutoRefresh() (user clicked retry)
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: { ... },
    isLoading: false,
    error: null,                       // ← Cleared
    isAutoRefreshPaused: false         // ← Unpaused
  }
}
```

---

## 🔄 API Call Sequences

### **Sequence 1: App Initialization**

```
Time    | Action              | API Call                    | Redux State
--------|---------------------|-----------------------------|-----------------
0s      | App loads           | -                           | Initial state
0.1s    | List page mounts    | GET /api/campaigns          | isLoading: true
0.5s    | Response received   | -                           | list: [...]
```

### **Sequence 2: Dashboard Auto-Refresh**

```
Time    | Action              | API Call                        | Iteration
--------|---------------------|---------------------------------|-----------
0s      | Dashboard mounts    | GET /api/campaigns/1?number=0   | 0 → 1
5s      | Auto-refresh #1     | GET /api/campaigns/1?number=1   | 1 → 2
10s     | Auto-refresh #2     | GET /api/campaigns/1?number=2   | 2 → 3
15s     | Auto-refresh #3     | GET /api/campaigns/1?number=3   | 3 → 4
20s     | Auto-refresh #4     | GET /api/campaigns/1?number=4   | 4 → 5
...     | (continues)         | ...                             | ...
```

### **Sequence 3: Error with Retries**

```
Time    | Action                      | Result
--------|-----------------------------|-----------------
15s     | Auto-refresh fires          | -
15.0s   | GET /api/campaigns/1?n=3    | 500 Error ❌
16.0s   | Retry attempt 1 (wait 1s)   | 500 Error ❌
18.0s   | Retry attempt 2 (wait 2s)   | Give up
18.0s   | Show error banner           | User sees yellow banner
20s     | Auto-refresh tries again    | (continues trying)
```

---

## ✅ Summary: Complete Flow

### **Key Principles:**

1. **Data flows one direction:** UI → Redux → Service → API
2. **State is source of truth:** Components read from Redux, never store their own data
3. **Errors don't break flow:** Last good data always visible
4. **Auto-refresh is resilient:** Retries transient errors, pauses after persistent failures
5. **Navigation is clean:** Proper cleanup prevents memory leaks
6. **Validation at boundary:** All external data validated before entering Redux

### **The Three Main Loops:**

1. **Initial Load Loop:** User opens app → Fetch campaigns → Show list
2. **Dashboard Loop:** Select campaign → Fetch data → Show metrics → Auto-refresh every 5s
3. **Error Recovery Loop:** Failure detected → Retry → If persistent, pause → User retries → Resume

---

**This is the complete flow! Every state, every error, every transition.** 🚀
