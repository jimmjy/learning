```json
{
  "campaigns": {
    // Normalized campaign metadata
    "byId": {
      "1": { "id": 1, "name": "Red Campaign", "status": "active" },
      "2": { "id": 2, "name": "Blue Campaign", "status": "active" },
      "3": { "id": 3, "name": "Green Campaign", "status": "active" }
    },
    "allIds": [1, 2, 3],

    // Request state
    "loading": false,
    "error": null
  },

  "dashboard": {
    // Currently selected campaign
    "selectedCampaignId": 1,

    // Data stored PER campaign (persists on switch!)
    "dataByID": {
      "1": {
        "totals": { "impressions": 50000, "clicks": 2500, "users": 15000 },
        "recent": { "impressions": 4500, "clicks": 225, "users": 1350 },
        "iteration": 10,
        "lastFetch": "2025-10-02T10:00:50Z"
      },
      "2": {
        "totals": { "impressions": 30000, "clicks": 1500, "users": 9000 },
        "recent": { "impressions": 3000, "clicks": 150, "users": 900 },
        "iteration": 6,
        "lastFetch": "2025-10-02T10:00:30Z"
      }
      // Campaign 3 not visited yet - no entry
    },

    // Auto-refresh control (only campaign #1 is active)
    "activeRequests": {
      "1": true, // Currently viewing - auto-refreshing
      "2": false // Not viewing - paused
    },

    // Request state
    "loading": false,
    "error": null,
    "isAutoRefreshPaused": false
  }
}
```
