# Implementation Guides Index

**Step-by-step guides to build the Campaign Dashboard with professional Redux architecture**

---

## 🎯 Quick Start Path

```
Guide 01 (20 min) → Guide 02 (45 min) → Guide 03 (90 min) → Guide 04 (45 min) → Guide 05 (90 min)
```

**Total Time:** ~5 hours for complete implementation

---

## 📚 Available Guides

### ✅ Guide 01: Project Setup
- **File:** `GUIDE_01_PROJECT_SETUP.md`
- **Time:** 15-20 minutes
- **What:** Initialize Vite + React project with all dependencies
- **Output:** Working dev environment with hot reload
- **Includes:** 
  - Redux Toolkit
  - React Router
  - MSW (Mock Service Worker)
  - Project structure

---

### ✅ Guide 02: Services Layer
- **File:** `GUIDE_02_SERVICES_LAYER.md`
- **Time:** 30-45 minutes
- **What:** API service with retry logic + validation layer
- **Output:** Robust API handling with security
- **Includes:** 
  - Fetch wrapper with retry
  - XSS prevention
  - Data validation
  - Error handling

---

### ⭐ Guide 03: Redux Store (Two-Slice Architecture)
- **File:** `GUIDE_03_REDUX_STORE.md`
- **Time:** 60-90 minutes
- **What:** Professional Redux with separated concerns
- **Output:** Scalable state management
- **Includes:** 
  - **`campaignsSlice`** - Campaign metadata (normalized state with byId + allIds)
  - **`dashboardSlice`** - Dashboard data + auto-refresh logic
  - Per-campaign data persistence (data doesn't reset on switch!)
  - Auto-refresh pause for inactive campaigns (performance!)
  - Memoized selectors for optimal re-rendering

**Why Two Slices?**
- ✅ Separation of concerns (campaigns vs. dashboard)
- ✅ Data persists when switching campaigns
- ✅ Inactive campaigns stop fetching automatically
- ✅ Easier to test and maintain
- ✅ Follows Redux best practices

---

### ✅ Guide 04: Components
- **File:** `GUIDE_04_COMPONENTS.md`
- **Time:** 30-45 minutes
- **What:** Reusable React components (pure/presentational)
- **Output:** Composable UI building blocks
- **Includes:** 
  - MetricCard - Display metric tiles
  - SummaryCard - Campaign overview card
  - ErrorBanner - Error states
  - Layout - Navbar with navigation

**Note:** These are pure components (no Redux) - they receive data via props.

---

### ⭐ Guide 05: Pages (Redux Integration)
- **File:** `GUIDE_05_PAGES.md`
- **Time:** 60-90 minutes
- **What:** Build main pages with Redux integration
- **Output:** Fully functional campaign dashboard
- **Includes:**
  - **CampaignListPage** - Shows all campaigns (uses campaignsSlice)
  - **DashboardPage** - Shows metrics with auto-refresh (uses both slices)
  - Auto-refresh every 5 seconds (only for active campaign)
  - Circuit breaker pattern (pause after 3 failures)
  - Data persistence across campaign switches
  - Error handling (transient + persistent)
  - Navigation between pages

**Key Features:**
- ✅ Switch campaigns → old data preserved
- ✅ Switch campaigns → old campaign stops fetching
- ✅ Professional error handling
- ✅ Loading states
- ✅ Responsive design

---

## 🏗️ Architecture Overview

### State Structure (Two Slices):

```javascript
{
  // Slice 1: Campaign Metadata
  campaigns: {
    byId: {
      1: { id: 1, name: "Red Campaign" },
      2: { id: 2, name: "Blue Campaign" }
    },
    allIds: [1, 2],
    loading: false,
    error: null
  },
  
  // Slice 2: Dashboard Data
  dashboard: {
    selectedCampaignId: 1,
    
    // Per-campaign storage - preserves data!
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
    },
    
    // Auto-refresh control - only campaign #1 active
    activeRequests: {
      1: true,   // Currently viewing - fetching
      2: false   // Not viewing - paused
    },
    
    loading: false,
    error: null,
    isAutoRefreshPaused: false
  }
}
```

---

## 🎯 Key Concepts

### 1. Normalized State (byId Pattern)
```javascript
// Why store ID in both key and value?
byId: {
  1: { id: 1, name: "Red" }  // ID appears twice
}

// Answer: O(1) lookup + complete objects
const campaign = state.byId[1];  // Returns complete object
console.log(campaign.id, campaign.name);  // Both available
```

### 2. Data Persistence
```javascript
// Switch campaigns:
dispatch(selectCampaign(2));

// Behind the scenes:
// - Campaign #1 data: PRESERVED in dataByID[1]
// - Campaign #1 auto-refresh: PAUSED
// - Campaign #2 data: Created/loaded in dataByID[2]
// - Campaign #2 auto-refresh: ACTIVATED

// Switch back:
dispatch(selectCampaign(1));

// Result: Campaign #1 data still there! 🎉
```

### 3. Auto-Refresh Management
```javascript
// Only active campaign fetches:
if (state.dashboard.activeRequests[campaignId] === true) {
  // Fetch data
} else {
  // Skip - not viewing this campaign
}
```

---

## 📋 Build Order

Follow guides in sequence:

1. **Guide 01** → Set up project
2. **Guide 02** → Build services layer
3. **Guide 03** → Set up Redux (two slices)
4. **Guide 04** → Build components
5. **Guide 05** → Build pages (connect everything)

**Why this order?** Bottom-up approach - build foundation first, then compose upwards.

---

## ✅ After Completing All Guides

You'll have:
- ✅ Professional Redux architecture (two slices)
- ✅ Data persistence across navigation
- ✅ Intelligent auto-refresh management
- ✅ Robust error handling
- ✅ Clean component architecture
- ✅ Type-safe selectors
- ✅ Production-ready patterns

---

## 🎓 What You'll Learn

### Redux Mastery:
- Normalized state (byId + allIds pattern)
- Multiple slices (separation of concerns)
- Memoized selectors (performance)
- Async thunks (side effects)
- Entity management (per-ID storage)

### React Patterns:
- Component composition
- Custom hooks
- useEffect lifecycle management
- Refs for cleanup
- Conditional rendering

### Real-World Practices:
- Circuit breaker pattern
- Request lifecycle management
- Error boundaries
- Loading states
- Optimistic updates

---

## 💬 Interview Talking Points

After completing these guides, you can confidently say:

**"I built a Redux-based dashboard with a two-slice architecture - one slice for campaign metadata using normalized state, and another for dashboard metrics with per-campaign storage. This ensures data persists when switching campaigns while auto-refresh intelligently pauses for inactive campaigns to optimize performance."**

**Interviewer reaction:** 😍 "Tell me more about your architecture decisions..."

---

## 📖 Related Documentation

### Analysis Documents:
- `DATA_PERSISTENCE_ANALYSIS.md` - Why persist data per campaign?
- `NORMALIZATION_PATTERN_ANALYSIS.md` - Why byId pattern with ID duplication?
- `COMPLETE_APPLICATION_FLOW.md` - How everything works together
- `QUICK_REFERENCE_FLOWS.md` - Visual flowcharts

### Design Documents:
- `DESIGN_SPECIFICATIONS.md` - Design decisions
- `CODE_IMPROVEMENTS_SUMMARY.md` - All improvements made
- Campaign mockups (4 HTML files)

---

## 🚀 Ready to Start?

**Begin with Guide 01:** `GUIDE_01_PROJECT_SETUP.md`

Follow the guides in order, and you'll have a professional campaign dashboard in ~5 hours! 

Good luck! 🎉
