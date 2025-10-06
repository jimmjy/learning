# Data Persistence Analysis: Campaign Switching

**Problem:** When switching campaigns, all accumulated dashboard data is lost.

---

## 🔍 The Problem

### Current State Structure:
```javascript
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardData: {              // ❌ Single storage location
      totals: { ... },
      recent: { ... },
      iteration: 2
    }
  }
}
```

### What Happens:
```
1. View Campaign #1
   - Accumulate data over 10 iterations
   - totals: { impressions: 50000, clicks: 2500, users: 15000 }
   - iteration: 10

2. Switch to Campaign #2
   - selectCampaign(2) resets dashboardData
   - Start fresh: iteration = 0, totals = {0, 0, 0}

3. Switch back to Campaign #1
   - All previous data LOST! 
   - Must start over from iteration 0
   - User sees: 0 impressions (was 50,000)
```

---

## 💡 Solution 1: Simple (Keep Current Approach)

### Philosophy:
"Each campaign view is a fresh session. Past data doesn't matter."

### Implementation:
**No changes needed!** Current code already does this.

### Pros:
✅ Simple to implement (already done)
✅ No complex state management
✅ Predictable behavior
✅ Lower memory usage
✅ No cache invalidation concerns

### Cons:
❌ Poor UX when switching between campaigns
❌ Lose historical context
❌ Must wait for data to accumulate again
❌ Feels "broken" to users

### When to Use:
- Very simple dashboard
- Users rarely switch campaigns
- Real-time data only matters
- Limited resources/time

---

## 💡 Solution 2: Per-Campaign Storage (Better UX)

### Philosophy:
"Each campaign remembers its own accumulated data."

### New State Structure:
```javascript
{
  campaigns: {
    list: [...],
    selectedCampaignId: 1,
    dashboardDataByID: {              // ✅ Store per campaign!
      1: {                            // Campaign #1's data
        totals: { impressions: 50000, clicks: 2500, users: 15000 },
        recent: { impressions: 4500, clicks: 225, users: 1350 },
        iteration: 10,
        lastSuccessfulFetch: "2025-10-02T10:00:50Z"
      },
      2: {                            // Campaign #2's data
        totals: { impressions: 30000, clicks: 1500, users: 9000 },
        recent: { impressions: 3000, clicks: 150, users: 900 },
        iteration: 6,
        lastSuccessfulFetch: "2025-10-02T10:00:30Z"
      }
    }
  }
}
```

### Flow Example:
```
1. View Campaign #1
   - Fetch iteration 0, 1, 2, ..., 10
   - dashboardDataByID[1] accumulates data
   - totals: 50000 impressions

2. Switch to Campaign #2
   - dashboardDataByID[1] stays intact! ✅
   - Create/load dashboardDataByID[2]
   - Start from iteration 0 for Campaign #2

3. Switch back to Campaign #1
   - dashboardDataByID[1] still there! ✅
   - Resume from iteration 11 (continue where left off)
   - OR start fresh (your choice)
```

### Implementation Changes:

#### 1. Redux Slice Changes:
```javascript
// campaignsSlice.js

const initialState = {
  list: [],
  selectedCampaignId: null,
  dashboardDataByID: {},  // ✅ Changed: Store per ID
  isLoading: false,
  error: null,
  isAutoRefreshPaused: false
};

// Helper to get or create dashboard data for a campaign
const getDashboardData = (state, campaignId) => {
  if (!state.dashboardDataByID[campaignId]) {
    state.dashboardDataByID[campaignId] = {
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastSuccessfulFetch: null
    };
  }
  return state.dashboardDataByID[campaignId];
};

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    selectCampaign: (state, action) => {
      state.selectedCampaignId = action.payload;
      // ✅ Create entry if doesn't exist, but DON'T reset existing data
      getDashboardData(state, action.payload);
      state.error = null;
      state.isAutoRefreshPaused = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMetrics.fulfilled, (state, action) => {
        const campaignId = action.meta.arg.campaignId;
        const dashboardData = getDashboardData(state, campaignId);
        
        // ✅ Accumulate data for THIS campaign only
        dashboardData.totals.impressions += action.payload.impressions;
        dashboardData.totals.clicks += action.payload.clicks;
        dashboardData.totals.users += action.payload.users;
        dashboardData.recent = action.payload;
        dashboardData.iteration += 1;
        dashboardData.lastSuccessfulFetch = new Date().toISOString();
        
        state.isLoading = false;
        state.error = null;
      });
  }
});
```

#### 2. Selector Changes:
```javascript
// Before (single dashboard data)
export const selectDashboardData = (state) => state.campaigns.dashboardData;

// After (per-campaign data)
export const selectDashboardData = (state) => {
  const campaignId = state.campaigns.selectedCampaignId;
  if (!campaignId) return null;
  return state.campaigns.dashboardDataByID[campaignId] || null;
};

// Totals selector works the same (uses selectDashboardData)
export const selectTotals = createSelector(
  [selectDashboardData],
  (dashboardData) => dashboardData?.totals || { impressions: 0, clicks: 0, users: 0 }
);

// All other selectors remain unchanged!
```

#### 3. Component Changes:
```javascript
// DashboardPage.jsx - NO CHANGES NEEDED!
// Components use selectors, selectors handle the per-ID lookup

const DashboardPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  // ✅ Works the same - selectors handle the complexity
  const totals = useSelector(selectTotals);
  const recent = useSelector(selectRecent);
  
  // Rest of component unchanged...
};
```

### Pros:
✅ Better UX - switching campaigns preserves data
✅ Can resume where left off
✅ Feels more professional
✅ Users can compare campaigns by switching
✅ Minimal component changes (only Redux slice)

### Cons:
❌ Slightly more complex state management
❌ Higher memory usage (stores data for all viewed campaigns)
❌ Need to handle stale data (optional: add timestamps/TTL)
❌ More Redux code

---

## 🎯 Recommendation

### For Your Project: **Solution 2** (Per-Campaign Storage)

**Why:**
1. **Better UX** - Professional dashboards preserve state
2. **Resume capability** - Can continue from where you left off
3. **Not much harder** - Only Redux changes, components stay same
4. **Shows skill** - Demonstrates understanding of complex state management

### Decision Factors:

```
Choose Solution 1 (Simple) if:
❌ Very limited time (<2 hours left)
❌ Just need basic functionality
❌ Users will never switch campaigns
❌ Memory is severely constrained

Choose Solution 2 (Better) if:
✅ Want professional polish
✅ Have 2-4 hours for implementation
✅ Users will switch between campaigns
✅ Want to showcase Redux skills
```

---

## 🔄 Optional Enhancement: Resume vs. Restart

With Solution 2, you can choose:

### Option A: Resume (Continue Accumulating)
```javascript
// Switch back to Campaign #1
// Continue from iteration 11, 12, 13...
// Keeps accumulating totals
```

**Pros:** Never lose progress
**Cons:** Data might get very stale if campaign inactive for long time

### Option B: Restart (Fresh Start)
```javascript
selectCampaign: (state, action) => {
  state.selectedCampaignId = action.payload;
  // ✅ Always start fresh when switching
  state.dashboardDataByID[action.payload] = {
    totals: { impressions: 0, clicks: 0, users: 0 },
    recent: null,
    iteration: 0
  };
}
```

**Pros:** Always fresh data
**Cons:** Same as Solution 1 (lose data on switch)

### Option C: Hybrid (Best of Both)
```javascript
// Keep data for 5 minutes after leaving a campaign
// If you return within 5 min → Resume
// If you return after 5 min → Restart

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

selectCampaign: (state, action) => {
  const campaignId = action.payload;
  state.selectedCampaignId = campaignId;
  
  const existing = state.dashboardDataByID[campaignId];
  const now = new Date().getTime();
  const lastFetch = existing?.lastSuccessfulFetch 
    ? new Date(existing.lastSuccessfulFetch).getTime()
    : 0;
  
  // ✅ If data is fresh (< 5 min old), keep it
  // ❌ If data is stale (> 5 min old), reset
  if (!existing || (now - lastFetch > CACHE_TTL)) {
    state.dashboardDataByID[campaignId] = {
      totals: { impressions: 0, clicks: 0, users: 0 },
      recent: null,
      iteration: 0,
      lastSuccessfulFetch: null
    };
  }
}
```

**Recommendation:** Start with Option A (Resume), add Option C (TTL) if you have time.

---

## 📊 Comparison Table

| Feature | Solution 1 (Current) | Solution 2 (Per-Campaign) |
|---------|---------------------|--------------------------|
| **Complexity** | ⭐ Simple | ⭐⭐ Moderate |
| **UX Quality** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Excellent |
| **Memory Usage** | ⭐⭐⭐⭐⭐ Low | ⭐⭐⭐ Moderate |
| **Implementation Time** | ✅ 0 hours (done) | ⏱️ 1-2 hours |
| **Professional Polish** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ High |
| **State Management** | Easy | Moderate |
| **Interview Appeal** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Great |

---

## 🛠️ Implementation Plan (Solution 2)

### Step 1: Update Redux Slice (30 min)
1. Change `dashboardData` → `dashboardDataByID`
2. Add `getDashboardData` helper
3. Update all reducers to use per-ID storage
4. Update `selectCampaign` to not reset data

### Step 2: Update Selectors (15 min)
1. Modify `selectDashboardData` to lookup by ID
2. Test that all other selectors still work

### Step 3: Test (30 min)
1. Switch between campaigns
2. Verify data persists
3. Verify auto-refresh still works
4. Verify error handling still works

### Step 4: Optional Enhancements (30 min)
1. Add TTL/stale data handling
2. Add "Clear cached data" button
3. Add "Last updated X ago" per campaign

**Total Time:** 1.5-2 hours

---

## 🎯 My Recommendation

**Implement Solution 2** for these reasons:

1. **Your observation shows maturity** - You spotted a real UX issue
2. **It's not that hard** - Mostly Redux changes, minimal component impact
3. **Huge UX improvement** - Makes the app feel professional
4. **Interview talking point** - "I noticed users would lose data when switching, so I implemented per-campaign storage"
5. **Redux showcase** - Demonstrates understanding of normalized state

The implementation is straightforward and the payoff in UX is massive.

---

## 💬 What To Say in an Interview

**Interviewer:** "I see you store data per campaign. Why?"

**You:** "Great question! Initially, I had a single `dashboardData` object that reset on campaign switch. But I realized this meant users lost all accumulated metrics when switching between campaigns - which is frustrating if they're comparing performance. So I refactored to store data keyed by campaign ID. This way, when you switch back to a campaign, you immediately see the data you've already accumulated. It's a better user experience and shows the power of Redux for complex state management."

**Interviewer:** 😍 "Excellent architectural thinking!"

---

## 🚀 Final Decision

**Go with Solution 2.** The implementation is clean, the UX is vastly better, and it shows you think about user experience beyond just meeting requirements.

Want me to update Guide 03 (Redux) with the per-campaign storage implementation?
