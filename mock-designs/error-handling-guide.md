# Error Handling Strategy

## Error Types & Responses

### 1. **Initial Load Failure (Campaign List)**
**When**: `/api/campaigns` fails on page load

**Response**:
- Show full-page error state with message
- "Failed to load campaigns" title
- Retry button
- Keep layout intact (navbar still visible)

**User Action**: Click "Retry" to attempt reload

---

### 2. **Initial Load Failure (Dashboard)**
**When**: First `/api/campaigns/:cid?number=0` fails

**Response**:
- Show error banner at top of page
- Keep dashboard layout visible but empty
- Show retry button in banner
- Don't show stale/placeholder data

**User Action**: 
- Click "Retry" to attempt reload
- Use "Back to Campaigns" to exit

---

### 3. **Auto-Refresh Failure (Dashboard)**
**When**: Subsequent fetches fail (number=1, 2, 3...)

**Response**:
- **Keep showing last successful data** (important!)
- Show warning banner: "Auto-refresh paused"
- Show timestamp of last successful update
- Automatically retry in background
- Show toast notification (non-intrusive)

**User Action**:
- Can continue viewing stale data
- Manual retry button available
- Auto-retries happen every 10 seconds

**Why this approach?**
- Don't punish users for temporary network blips
- They can still see historical data
- Non-disruptive user experience

---

### 4. **Campaign Not Found**
**When**: Navigate to `/campaign/999` (invalid ID)

**Response**:
- Show empty state with search icon
- "Campaign Not Found" message
- Explain that campaign doesn't exist or was removed
- "Back to Campaigns" button

**User Action**: Return to campaign list

---

### 5. **Network Timeout**
**When**: Request takes >10 seconds

**Response**:
- Treat as failure
- Show error banner
- Give option to retry
- Consider connection quality indicator

---

### 6. **No Campaigns (Empty State)**
**When**: API returns empty array `[]`

**Response**:
- Show empty state (not an error!)
- "No Campaigns Yet" message
- Friendly icon
- Refresh button (in case it's a data sync issue)

**This is different from an error** - it's a valid response

---

## Error UI Patterns

### A. Error Banner (Top of Page)
**Use for**: Critical errors that need immediate attention

**Features**:
- Red left border (error) or orange (warning)
- Clear title and description
- Action buttons (Retry, Dismiss)
- Dismissible (user can close)

**Example**:
```
⚠️ Failed to load campaign data
   Unable to connect to the server...
   [Retry] [Dismiss]
```

---

### B. Empty State Card
**Use for**: Missing or invalid data

**Features**:
- Large centered icon (emoji or SVG)
- Clear title
- Helpful description
- Primary action button

**Example**:
```
     🔍
Campaign Not Found
The campaign you're looking for doesn't exist...
[Back to Campaigns]
```

---

### C. Inline Error (Metric Card)
**Use for**: Partial data failures

**Features**:
- Card turns light red background
- Shows "⚠️ Error" instead of value
- Keeps card structure
- Other cards still show valid data

**Example**:
```
┌──────────────────┐
│ TOTAL CLICKS     │
│ ⚠️ Error         │
│ Failed to load   │
└──────────────────┘
```

---

### D. Toast Notification
**Use for**: Background errors, auto-retry status

**Features**:
- Bottom-right corner
- Auto-dismiss after 5 seconds
- Shows retry countdown
- Non-blocking

**Example**:
```
  ❌ Failed to update
     Retrying in 5 seconds...
```

---

### E. Loading Skeleton
**Use for**: While fetching data

**Features**:
- Animated placeholder
- Shows card structure
- Gray shimmer effect
- Same size as real content

---

## Implementation Guidelines

### Retry Logic
```javascript
// Exponential backoff for retries
attempt 1: retry immediately
attempt 2: retry after 5 seconds
attempt 3: retry after 10 seconds
attempt 4: retry after 30 seconds
attempt 5+: stop auto-retry, manual only
```

### Auto-Refresh Behavior
```javascript
// Dashboard auto-refresh
success: continue every 5 seconds
failure: 
  - keep old data visible
  - show warning banner
  - auto-retry after 10 seconds
  - after 3 failures, pause auto-refresh
  - show "Paused" status with manual retry
```

### Error Messages

**DO:**
- Be specific about what failed
- Suggest next steps
- Use friendly, human language
- Provide retry options
- Show when data is stale

**DON'T:**
- Show technical error codes to users
- Blame the user
- Use vague messages like "Something went wrong"
- Leave users stuck with no action
- Hide that an error occurred

**Good examples:**
- ✅ "Unable to connect to the server. Please check your internet connection."
- ✅ "This campaign no longer exists. It may have been deleted."
- ✅ "Auto-refresh paused due to connection issues. Showing data from 2 minutes ago."

**Bad examples:**
- ❌ "Error 500"
- ❌ "Failed"
- ❌ "Something went wrong"
- ❌ "Network error occurred"

---

## Priority Guide

**Critical (Must handle):**
1. Initial load failures - both pages
2. Campaign not found
3. Network disconnection during auto-refresh

**Important (Should handle):**
4. Timeout errors
5. Empty states (no campaigns)
6. Partial data failures

**Nice to have:**
7. Network quality indicators
8. Retry count limits
9. Offline mode detection

---

## Testing Scenarios

Test these cases:
1. Disconnect WiFi → try to load page
2. Disconnect WiFi → let dashboard auto-refresh fail
3. Navigate to `/campaign/99999` (invalid ID)
4. Slow 3G connection (timeout)
5. Server returns empty array
6. Server returns 500 error
7. One metric fails, others succeed (partial failure)

---

## State Management

```javascript
// Dashboard error state
{
  hasError: boolean,
  errorType: 'network' | 'not-found' | 'timeout' | null,
  errorMessage: string,
  lastSuccessfulFetch: timestamp,
  retryCount: number,
  isRetrying: boolean,
  autoRefreshPaused: boolean
}
```

Keep track of:
- Error type
- When it occurred
- How many retries attempted
- Last successful data fetch
- Whether to show old data vs empty state
