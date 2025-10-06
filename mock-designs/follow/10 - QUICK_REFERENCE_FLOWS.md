# Quick Reference: Application Flow Diagram

**Simple visual flowcharts for all major user journeys**

---

## 🎯 Flow 1: Happy Path (Everything Works)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                           │
│                  http://localhost:5173/                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              CAMPAIGN LIST PAGE LOADS                       │
│  - Dispatch: loadCampaigns()                                │
│  - Shows: Loading spinner                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  API: GET /api/campaigns                    │
│  Response: [{ id: 1, name: "Red" }, ...]                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              VALIDATION + XSS SANITIZATION                  │
│  - Check structure ✅                                       │
│  - Sanitize names ✅                                        │
│  - Store in Redux ✅                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              USER SEES: CAMPAIGN CARDS                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ #1         │  │ #2         │  │ #3         │           │
│  │ Red        │  │ Blue       │  │ Green      │           │
│  │ Campaign   │  │ Campaign   │  │ Campaign   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
                  USER CLICKS "RED CAMPAIGN"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           NAVIGATE TO: /campaign/1                          │
│  - Dispatch: selectCampaign(1)                              │
│  - Reset dashboard state                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         FETCH INITIAL DATA (iteration 0)                    │
│  API: GET /api/campaigns/1?number=0                         │
│  Response: { impressions: 10000, clicks: 500, users: 3000 } │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              VALIDATION + STORE DATA                        │
│  - Accumulate totals: 10000, 500, 3000                     │
│  - Store recent: 10000, 500, 3000                          │
│  - Increment iteration: 0 → 1                              │
│  - Calculate CTR: 5.00%                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              USER SEES: DASHBOARD                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Campaign Performance Overview              [Live]   │   │
│  │ 10,000 impressions • 5.00% CTR • 500 clicks        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Total Metrics                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │10,000│  │  500 │  │ 5.00%│  │ 3,000│                  │
│  └──────┘  └──────┘  └──────┘  └──────┘                  │
│                                                             │
│  Recent Metrics                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │10,000│  │  500 │  │ 5.00%│  │ 3,000│                  │
│  └──────┘  └──────┘  └──────┘  └──────┘                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│          START AUTO-REFRESH (every 5 seconds)               │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   ⏰ WAIT 5 SECONDS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           FETCH NEXT DATA (iteration 1)                     │
│  API: GET /api/campaigns/1?number=1                         │
│  Response: { impressions: 12000, clicks: 600, users: 3500 } │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              ACCUMULATE DATA                                │
│  - Totals: 10k+12k=22k, 500+600=1100, 3k+3.5k=6500        │
│  - Recent: 12000, 600, 3500                                │
│  - Iteration: 1 → 2                                        │
│  - CTR: (1100/22000)*100 = 5.00%                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         UI UPDATES SMOOTHLY (no reload)                     │
│  Summary: 22,000 impressions (was 10,000)                  │
│  Total Impressions: 22,000 ⬆                               │
│  Total Clicks: 1,100 ⬆                                     │
│  Recent Impressions: 12,000 ⬆                              │
│  Recent Clicks: 600 ⬆                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   ⏰ WAIT 5 SECONDS
                           ↓
                   (Repeat forever...)
```

---

## ⚠️ Flow 2: Error Path (Things Break)

```
┌─────────────────────────────────────────────────────────────┐
│          AUTO-REFRESH FIRES (iteration 3)                   │
│  API: GET /api/campaigns/1?number=3                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              API RETURNS: 500 ERROR ❌                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              RETRY LOGIC KICKS IN                           │
│  - Wait 1 second                                            │
│  - Attempt 1: GET /api/campaigns/1?number=3 → 500 ❌        │
│  - Wait 2 seconds                                           │
│  - Attempt 2: GET /api/campaigns/1?number=3 → 500 ❌        │
│  - Give up, throw error                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              TRACK CONSECUTIVE FAILURES                     │
│  - consecutiveFailures = 1                                  │
│  - Is it >= 3? NO → Keep auto-refresh running              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         SHOW YELLOW BANNER (Transient Error)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠️ Connection issue - retrying automatically...      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Dashboard still shows last good data]                     │
│  22,000 impressions (stale but visible)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   ⏰ WAIT 5 SECONDS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              TRY AGAIN (iteration 4)                        │
│  - If success → Clear error, continue                       │
│  - If fail again → consecutiveFailures = 2                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   ⏰ WAIT 5 SECONDS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              3RD CONSECUTIVE FAILURE ❌❌❌                  │
│  - consecutiveFailures = 3                                  │
│  - TRIGGER CIRCUIT BREAKER                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         PAUSE AUTO-REFRESH (Circuit Breaker)                │
│  - Dispatch: pauseAutoRefresh()                             │
│  - Stop interval (no more auto-fetching)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│          SHOW RED BANNER (Persistent Error)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ⚠️ Auto-refresh paused due to connection issues      │  │
│  │    Last updated 2 minutes ago                        │  │
│  │                                [Retry Now] ← Button  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Dashboard still shows last good data]                     │
│  22,000 impressions (2 minutes old)                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
              USER CLICKS "RETRY NOW"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              RESUME AUTO-REFRESH                            │
│  - Dispatch: resumeAutoRefresh()                            │
│  - Reset consecutiveFailures = 0                            │
│  - Fetch immediately                                        │
│  - Restart 5-second interval                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
              If successful → Normal flow resumes
              If fails → Circuit breaker again
```

---

## 🔄 Flow 3: Campaign Switching

```
┌─────────────────────────────────────────────────────────────┐
│          USER IS VIEWING: Red Campaign (#1)                 │
│  Dashboard shows: 22,000 impressions, 1,100 clicks, etc.   │
│  Auto-refresh running (iteration 5)                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
          USER SELECTS "BLUE CAMPAIGN" FROM DROPDOWN
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              NAVIGATION: /campaign/2                        │
│  - URL changes                                              │
│  - React Router matches route                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         CLEANUP: Red Campaign Dashboard                     │
│  - Clear interval (stop auto-refresh for #1)               │
│  - Set isMounted = false (prevent stale updates)            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         INITIALIZE: Blue Campaign Dashboard                 │
│  - Dispatch: selectCampaign(2)                              │
│  - RESET state:                                             │
│    • selectedCampaignId = 2                                 │
│    • totals = { 0, 0, 0 }                                   │
│    • recent = null                                          │
│    • iteration = 0                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         FETCH: Blue Campaign Data (iteration 0)             │
│  API: GET /api/campaigns/2?number=0                         │
│  Response: { impressions: 8000, clicks: 400, users: 2500 } │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD SHOWS: Blue Campaign                 │
│  Summary: 8,000 impressions • 5.00% CTR • 400 clicks       │
│  Total Impressions: 8,000                                   │
│  (Fresh data for Blue, no trace of Red's data)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         START AUTO-REFRESH FOR BLUE CAMPAIGN                │
│  Every 5 seconds: GET /api/campaigns/2?number=X             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Flow 4: Back to Campaign List

```
┌─────────────────────────────────────────────────────────────┐
│          USER IS VIEWING: Dashboard                         │
│  Currently on: /campaign/1                                  │
│  Auto-refresh running                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
          USER CLICKS "← BACK TO CAMPAIGNS"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              NAVIGATION: /                                  │
│  - URL changes to root                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         CLEANUP: Dashboard                                  │
│  - Clear interval (stop auto-refresh)                       │
│  - Set isMounted = false                                    │
│  - Prevent memory leaks                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         RENDER: Campaign List Page                          │
│  - Campaign list ALREADY IN REDUX (cached!)                 │
│  - NO API CALL NEEDED                                       │
│  - Show cards immediately                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              USER SEES: Instant Campaign List               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ #1         │  │ #2         │  │ #3         │           │
│  │ Red        │  │ Blue       │  │ Green      │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  (No loading spinner - instant!)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree: When to Show What

```
┌──────────────────────────────────────┐
│  Is page loading for first time?    │
└──────────────────────────────────────┘
         ↙ YES           NO ↘
┌─────────────┐      ┌─────────────┐
│ Show Loading│      │ Show Content│
│   Spinner   │      │             │
└─────────────┘      └─────────────┘
                            ↓
              ┌──────────────────────────┐
              │ Does error exist?        │
              └──────────────────────────┘
                   ↙ YES        NO ↘
          ┌──────────────┐   ┌─────────┐
          │ Show Banner  │   │ No Banner│
          └──────────────┘   └─────────┘
                 ↓
    ┌────────────────────────────┐
    │ Is auto-refresh paused?    │
    └────────────────────────────┘
         ↙ YES          NO ↘
┌──────────────┐   ┌──────────────┐
│ RED Banner   │   │ YELLOW Banner│
│ + Retry Btn  │   │ (auto-retry) │
└──────────────┘   └──────────────┘
```

---

## 📦 Data Flow Summary

```
┌────────────┐
│    API     │ ← External data source (MSW mock)
└────────────┘
      ↓
┌────────────┐
│  Service   │ ← Retry logic + validation
└────────────┘
      ↓
┌────────────┐
│   Redux    │ ← Single source of truth
└────────────┘
      ↓
┌────────────┐
│ Selectors  │ ← Compute derived data (CTR)
└────────────┘
      ↓
┌────────────┐
│ Components │ ← Pure functions, read from selectors
└────────────┘
      ↓
┌────────────┐
│     UI     │ ← User sees the result
└────────────┘
```

---

## ⏱️ Timing Summary

```
EVENT                          | TIME      | ACTION
-------------------------------|-----------|---------------------------
App loads                      | 0s        | Fetch campaign list
Campaign list appears          | ~0.5s     | Render cards
User clicks campaign           | +0.1s     | Navigate to dashboard
Dashboard shows data           | +0.5s     | Initial fetch complete
Auto-refresh #1                | +5s       | Fetch iteration 1
Auto-refresh #2                | +10s      | Fetch iteration 2
Auto-refresh #3                | +15s      | Fetch iteration 3
...continues every 5s...       | ...       | ...
Error occurs                   | +30s      | Show yellow banner
Error persists (3 failures)    | +40s      | Show red banner + pause
User clicks retry              | +60s      | Resume auto-refresh
```

---

## 🎯 Key Takeaways

### ✅ Always True:
1. **Data flows one way** (API → Redux → UI)
2. **Redux is source of truth** (components never store data)
3. **Errors don't clear data** (last good data always visible)
4. **Auto-refresh is resilient** (retries then pauses)
5. **Navigation is clean** (proper cleanup prevents leaks)

### ⚠️ Edge Cases Handled:
1. API returns 500 → Retry with backoff
2. 3 consecutive failures → Pause + manual retry
3. Switch campaigns → Clean state reset
4. Navigate away → Stop intervals
5. Invalid data → Validation catches it

### 🚀 Performance Optimizations:
1. Memoized selectors → Only recalculate when needed
2. React.memo → Prevent unnecessary re-renders
3. Cached campaign list → No refetch on navigation back
4. Throttled requests → Prevent rapid-fire calls

---

**This is your complete mental model!** 🧠✨
