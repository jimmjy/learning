# Build Order Guide - Campaign Dashboard
## Strategic Development Plan for Senior-Level Technical Evaluation

---

## 🎯 Overview

This guide provides a strategic, step-by-step approach to building the Campaign Dashboard. The order is designed to:
- Build confidence with quick wins
- Test as you go (not at the end)
- Catch integration issues early
- Demonstrate architectural thinking
- Maximize code quality and test coverage

**Total Estimated Time: 8-12 hours**

---

## 📋 Pre-Build Checklist

### Install Dependencies
```bash
# Core dependencies
npm install @reduxjs/toolkit react-redux react-router-dom

# Testing utilities (if not already installed)
npm install -D @testing-library/user-event
```

### Create Folder Structure
```bash
# Create all necessary folders upfront
mkdir -p src/utils
mkdir -p src/services
mkdir -p src/store/slices
mkdir -p src/hooks
mkdir -p src/pages/CampaignListPage
mkdir -p src/pages/DashboardPage
mkdir -p src/components/common/Loading
mkdir -p src/components/common/Button
mkdir -p src/components/common/EmptyState
mkdir -p src/components/layout/Navbar
mkdir -p src/components/layout/ErrorBanner
mkdir -p src/components/campaigns/CampaignTable
mkdir -p src/components/campaigns/CampaignRow
mkdir -p src/components/campaigns/CampaignSelector
mkdir -p src/components/dashboard/MetricCard
mkdir -p src/components/dashboard/MetricsGrid
mkdir -p src/components/dashboard/DashboardHeader
mkdir -p src/test
```

---

## 🏗️ Phase 1: Foundation (2.5-3.5 hours)
**Goal: Build the "plumbing" - the parts everything else depends on**

⭐ **CRITICAL FOR SENIOR LEVEL**: Phase 1 now includes comprehensive data validation. This demonstrates:
- Production-ready thinking
- Defensive programming
- Data integrity concerns
- Business rule enforcement
- Edge case handling

**Time adjustment**: Added ~45 minutes for validators, but saves debugging time later!

### Step 1: Constants (5 minutes)
**File: `src/utils/constants.js`**

```javascript
export const REFRESH_INTERVAL = 5000; // 5 seconds
export const RETRY_DELAY = 10000; // 10 seconds
export const MAX_RETRIES = 3;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/campaign/:id',
};

export const METRIC_TYPES = {
  TOTAL: 'total',
  RECENT: 'recent',
  CALCULATED: 'calculated',
  STATUS: 'status',
};
```

**No test needed** - just constants

---

### Step 2: Validators (45 minutes) ⭐ NEW - CRITICAL FOR SENIOR LEVEL
**File: `src/utils/validators.js`**

See the complete implementation in `data-validation-guide.md`. This includes:
- Type checking functions (isValidNumber, isNonNegativeNumber, etc.)
- ValidationError class
- Campaign validation
- Metrics validation with business rules
- API response validators
- Safe parsing utilities

**File: `src/utils/validators.test.js`**

Complete test suite from `data-validation-guide.md` with 30+ test cases covering:
- All type checking functions
- Edge cases (NaN, Infinity, null, undefined, negative values)
- Business rule validation (clicks ≤ impressions)
- Error messages and field tracking
- Safe parsing functions

**Test it:**
```bash
npm test validators.test.js
```

✅ **Checkpoint: You should have 30+ passing validator tests**

**Why this is critical:** Demonstrates senior-level defensive programming and production-ready thinking. Validation prevents runtime errors and shows you don't trust external data.

---

### Step 3: Calculations Utility (20 minutes)
**File: `src/utils/calculations.js`**

**UPDATED VERSION WITH VALIDATION:**

```javascript
import { isNonNegativeNumber, ValidationError } from './validators';

/**
 * Calculate Click-Through Rate with validation
 * @param {number} clicks - Number of clicks
 * @param {number} impressions - Number of impressions
 * @returns {string} CTR as percentage with 1 decimal place
 * @throws {ValidationError} If inputs are invalid
 */
export function calculateCTR(clicks, impressions) {
  // Validate inputs
  if (!isNonNegativeNumber(clicks)) {
    throw new ValidationError(
      'Clicks must be a non-negative number',
      'clicks'
    );
  }

  if (!isNonNegativeNumber(impressions)) {
    throw new ValidationError(
      'Impressions must be a non-negative number',
      'impressions'
    );
  }

  // Business rule validation
  if (clicks > impressions) {
    throw new ValidationError(
      'Clicks cannot exceed impressions',
      'clicks'
    );
  }

  // Handle edge case: zero impressions
  if (impressions === 0) {
    return '0.0';
  }

  const ctr = (clicks / impressions) * 100;
  return ctr.toFixed(1);
}

/**
 * Safe CTR calculation that returns default on error
 * @param {number} clicks - Number of clicks
 * @param {number} impressions - Number of impressions
 * @param {string} defaultValue - Default value on error
 * @returns {string} CTR or default value
 */
export function safeCalculateCTR(clicks, impressions, defaultValue = '0.0') {
  try {
    return calculateCTR(clicks, impressions);
  } catch (error) {
    console.warn('CTR calculation failed:', error.message);
    return defaultValue;
  }
}

/**
 * Accumulate metrics from previous and current data with validation
 * @param {Object} previous - Previous totals
 * @param {Object} current - Current data
 * @returns {Object} Accumulated totals
 * @throws {ValidationError} If inputs are invalid
 */
export function accumulateMetrics(previous, current) {
  // Validate structure
  if (!previous || typeof previous !== 'object') {
    throw new ValidationError('Previous metrics must be an object');
  }

  if (!current || typeof current !== 'object') {
    throw new ValidationError('Current metrics must be an object');
  }

  // Validate required fields
  const requiredFields = ['impressions', 'clicks', 'users'];
  
  for (const field of requiredFields) {
    if (!isNonNegativeNumber(previous[field])) {
      throw new ValidationError(
        `Previous ${field} must be a non-negative number`,
        `previous.${field}`
      );
    }

    if (!isNonNegativeNumber(current[field])) {
      throw new ValidationError(
        `Current ${field} must be a non-negative number`,
        `current.${field}`
      );
    }
  }

  return {
    impressions: previous.impressions + current.impressions,
    clicks: previous.clicks + current.clicks,
    users: previous.users + current.users,
  };
}

/**
 * Safe accumulate metrics that handles errors gracefully
 * @param {Object} previous - Previous totals
 * @param {Object} current - Current data
 * @returns {Object} Accumulated totals or previous on error
 */
export function safeAccumulateMetrics(previous, current) {
  try {
    return accumulateMetrics(previous, current);
  } catch (error) {
    console.warn('Metric accumulation failed:', error.message);
    return previous;
  }
}
```

**File: `src/utils/calculations.test.js`**

**ENHANCED VERSION WITH VALIDATION TESTS:**

```javascript
import { describe, it, expect } from 'vitest';
import { 
  calculateCTR, 
  safeCalculateCTR, 
  accumulateMetrics, 
  safeAccumulateMetrics 
} from './calculations';
import { ValidationError } from './validators';

describe('calculations', () => {
  describe('calculateCTR', () => {
    it('should calculate CTR correctly', () => {
      expect(calculateCTR(50, 100)).toBe('50.0');
      expect(calculateCTR(25, 100)).toBe('25.0');
    });

    it('should return 0 when impressions is 0', () => {
      expect(calculateCTR(0, 0)).toBe('0.0');
    });

    it('should handle decimal results', () => {
      expect(calculateCTR(1, 3)).toBe('33.3');
    });

    it('should throw ValidationError for invalid inputs', () => {
      expect(() => calculateCTR(-1, 100)).toThrow(ValidationError);
      expect(() => calculateCTR(50, -100)).toThrow(ValidationError);
      expect(() => calculateCTR('50', 100)).toThrow(ValidationError);
      expect(() => calculateCTR(NaN, 100)).toThrow(ValidationError);
    });

    it('should throw when clicks exceed impressions', () => {
      expect(() => calculateCTR(150, 100)).toThrow(ValidationError);
      expect(() => calculateCTR(150, 100)).toThrow('Clicks cannot exceed impressions');
    });
  });

  describe('safeCalculateCTR', () => {
    it('should return CTR for valid inputs', () => {
      expect(safeCalculateCTR(50, 100)).toBe('50.0');
    });

    it('should return default value for invalid inputs', () => {
      expect(safeCalculateCTR(-1, 100)).toBe('0.0');
      expect(safeCalculateCTR(NaN, 100, 'N/A')).toBe('N/A');
      expect(safeCalculateCTR(150, 100)).toBe('0.0');
    });
  });

  describe('accumulateMetrics', () => {
    it('should accumulate metrics correctly', () => {
      const previous = { impressions: 100, clicks: 50, users: 75 };
      const current = { impressions: 50, clicks: 25, users: 30 };
      const result = accumulateMetrics(previous, current);

      expect(result).toEqual({
        impressions: 150,
        clicks: 75,
        users: 105,
      });
    });

    it('should handle zero values', () => {
      const previous = { impressions: 0, clicks: 0, users: 0 };
      const current = { impressions: 100, clicks: 50, users: 75 };
      const result = accumulateMetrics(previous, current);

      expect(result).toEqual(current);
    });

    it('should throw ValidationError for invalid structure', () => {
      expect(() => accumulateMetrics(null, {})).toThrow(ValidationError);
      expect(() => accumulateMetrics({}, null)).toThrow(ValidationError);
    });

    it('should throw for missing fields', () => {
      const previous = { impressions: 100, clicks: 50 };
      const current = { impressions: 50, clicks: 25, users: 30 };
      expect(() => accumulateMetrics(previous, current)).toThrow(ValidationError);
    });

    it('should throw for negative values', () => {
      const previous = { impressions: -100, clicks: 50, users: 75 };
      const current = { impressions: 50, clicks: 25, users: 30 };
      expect(() => accumulateMetrics(previous, current)).toThrow(ValidationError);
    });
  });

  describe('safeAccumulateMetrics', () => {
    it('should accumulate for valid inputs', () => {
      const previous = { impressions: 100, clicks: 50, users: 75 };
      const current = { impressions: 50, clicks: 25, users: 30 };
      const result = safeAccumulateMetrics(previous, current);

      expect(result).toEqual({
        impressions: 150,
        clicks: 75,
        users: 105,
      });
    });

    it('should return previous state on error', () => {
      const previous = { impressions: 100, clicks: 50, users: 75 };
      const current = null;
      const result = safeAccumulateMetrics(previous, current);

      expect(result).toEqual(previous);
    });
  });
});
```

**Test it:**
```bash
npm test calculations.test.js
```

✅ **Checkpoint: You should have 15+ passing tests for calculations**

---

### Step 4: Formatters Utility (15 minutes)
**File: `src/utils/formatters.js`**

**UPDATED VERSION WITH VALIDATION:**

```javascript
import { isValidNumber, ValidationError } from './validators';

/**
 * Format number with commas with validation
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 * @throws {ValidationError} If input is invalid
 */
export function formatNumber(num) {
  if (!isValidNumber(num)) {
    throw new ValidationError('Input must be a valid number', 'num');
  }
  return num.toLocaleString('en-US');
}

/**
 * Safe number formatting with default fallback
 * @param {*} num - Number to format
 * @param {string} defaultValue - Default value if formatting fails
 * @returns {string} Formatted number or default
 */
export function safeFormatNumber(num, defaultValue = '0') {
  try {
    return formatNumber(num);
  } catch (error) {
    console.warn('Number formatting failed:', error.message);
    return defaultValue;
  }
}

/**
 * Format percentage with validation
 * @param {string|number} value - Percentage value
 * @returns {string} Formatted percentage with % symbol
 * @throws {ValidationError} If input is invalid
 */
export function formatPercentage(value) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (!isValidNumber(numericValue)) {
    throw new ValidationError('Percentage value must be a valid number', 'value');
  }

  if (numericValue < 0 || numericValue > 100) {
    throw new ValidationError('Percentage must be between 0 and 100', 'value');
  }

  return `${numericValue}%`;
}

/**
 * Safe percentage formatting
 * @param {*} value - Percentage value
 * @param {string} defaultValue - Default value if formatting fails
 * @returns {string} Formatted percentage or default
 */
export function safeFormatPercentage(value, defaultValue = '0.0%') {
  try {
    return formatPercentage(value);
  } catch (error) {
    console.warn('Percentage formatting failed:', error.message);
    return defaultValue;
  }
}

/**
 * Format timestamp to relative time with validation
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Relative time string
 * @throws {ValidationError} If timestamp is invalid
 */
export function formatRelativeTime(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid timestamp provided', 'timestamp');
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) {
    throw new ValidationError('Timestamp cannot be in the future', 'timestamp');
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
}

/**
 * Safe relative time formatting
 * @param {*} timestamp - Timestamp to format
 * @param {string} defaultValue - Default value if formatting fails
 * @returns {string} Formatted time or default
 */
export function safeFormatRelativeTime(timestamp, defaultValue = 'Unknown') {
  try {
    return formatRelativeTime(timestamp);
  } catch (error) {
    console.warn('Relative time formatting failed:', error.message);
    return defaultValue;
  }
}
```

**File: `src/utils/formatters.test.js`**

**ENHANCED VERSION WITH VALIDATION TESTS:**

```javascript
import { describe, it, expect } from 'vitest';
import { 
  formatNumber, 
  safeFormatNumber,
  formatPercentage, 
  safeFormatPercentage,
  formatRelativeTime,
  safeFormatRelativeTime 
} from './formatters';
import { ValidationError } from './validators';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should throw ValidationError for invalid inputs', () => {
      expect(() => formatNumber('invalid')).toThrow(ValidationError);
      expect(() => formatNumber(NaN)).toThrow(ValidationError);
      expect(() => formatNumber(Infinity)).toThrow(ValidationError);
    });
  });

  describe('safeFormatNumber', () => {
    it('should format valid numbers', () => {
      expect(safeFormatNumber(1234)).toBe('1,234');
    });

    it('should return default for invalid inputs', () => {
      expect(safeFormatNumber(NaN)).toBe('0');
      expect(safeFormatNumber('invalid', 'N/A')).toBe('N/A');
    });
  });

  describe('formatPercentage', () => {
    it('should add % symbol', () => {
      expect(formatPercentage(45.2)).toBe('45.2%');
      expect(formatPercentage('45.2')).toBe('45.2%');
    });

    it('should throw for invalid numbers', () => {
      expect(() => formatPercentage('invalid')).toThrow(ValidationError);
      expect(() => formatPercentage(NaN)).toThrow(ValidationError);
    });

    it('should throw for out of range values', () => {
      expect(() => formatPercentage(-1)).toThrow(ValidationError);
      expect(() => formatPercentage(101)).toThrow(ValidationError);
    });

    it('should allow edge values', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });
  });

  describe('safeFormatPercentage', () => {
    it('should format valid percentages', () => {
      expect(safeFormatPercentage(45.2)).toBe('45.2%');
    });

    it('should return default for invalid inputs', () => {
      expect(safeFormatPercentage(-1)).toBe('0.0%');
      expect(safeFormatPercentage(NaN, 'N/A')).toBe('N/A');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format seconds correctly', () => {
      const timestamp = new Date(Date.now() - 30000).toISOString();
      expect(formatRelativeTime(timestamp)).toBe('30 seconds ago');
    });

    it('should format minutes correctly', () => {
      const timestamp = new Date(Date.now() - 120000).toISOString();
      expect(formatRelativeTime(timestamp)).toBe('2 minutes ago');
    });

    it('should handle Date objects', () => {
      const date = new Date(Date.now() - 60000);
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });

    it('should throw for invalid timestamps', () => {
      expect(() => formatRelativeTime('invalid')).toThrow(ValidationError);
      expect(() => formatRelativeTime(null)).toThrow(ValidationError);
    });

    it('should throw for future timestamps', () => {
      const future = new Date(Date.now() + 60000).toISOString();
      expect(() => formatRelativeTime(future)).toThrow(ValidationError);
    });
  });

  describe('safeFormatRelativeTime', () => {
    it('should format valid timestamps', () => {
      const timestamp = new Date(Date.now() - 30000).toISOString();
      expect(safeFormatRelativeTime(timestamp)).toBe('30 seconds ago');
    });

    it('should return default for invalid inputs', () => {
      expect(safeFormatRelativeTime('invalid')).toBe('Unknown');
      expect(safeFormatRelativeTime(null, 'N/A')).toBe('N/A');
    });
  });
});
```

✅ **Checkpoint: Utils complete with 50+ total passing tests**

**Why this matters:** The "safe" versions ensure your UI never crashes from bad data, while strict versions catch data integrity issues early. This is production-ready code.

---

### Step 5: API Service Layer (30 minutes)
**File: `src/services/api.js`**

```javascript
const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network request failed', 0);
  }
}
```

**File: `src/services/campaignService.js`**

**UPDATED VERSION WITH VALIDATION:**

```javascript
import { fetchAPI } from './api';
import {
  validateCampaignId,
  validateIterationNumber,
  validateCampaignListResponse,
  validateMetricsResponse,
} from '../utils/validators';

export const campaignService = {
  /**
   * Fetch all campaigns with response validation
   * @returns {Promise<Array<{id: number, name: string}>>}
   * @throws {Error} If request fails or response is invalid
   */
  getCampaigns: async () => {
    try {
      const response = await fetchAPI('/campaigns');
      
      // Validate response structure and data
      const validatedCampaigns = validateCampaignListResponse(response);
      
      return validatedCampaigns;
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }
  },

  /**
   * Fetch campaign data with input and response validation
   * @param {number|string} campaignId - Campaign ID
   * @param {number} iterationNumber - Current iteration number
   * @returns {Promise<{impressions: number, clicks: number, users: number}>}
   * @throws {Error} If inputs invalid, request fails, or response invalid
   */
  getCampaignData: async (campaignId, iterationNumber) => {
    try {
      // Validate inputs BEFORE making request
      const validCampaignId = validateCampaignId(campaignId);
      const validIterationNumber = validateIterationNumber(iterationNumber);

      const response = await fetchAPI(
        `/campaigns/${validCampaignId}?number=${validIterationNumber}`
      );

      // Validate response structure and business rules
      const validatedMetrics = validateMetricsResponse(response);

      return validatedMetrics;
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      throw new Error('Failed to fetch campaign data');
    }
  },
};
```

**File: `src/services/campaignService.test.js`**

**ENHANCED VERSION WITH VALIDATION TESTS:**
**File: `src/services/api.js`**

```javascript
const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network request failed', 0);
  }
}
```

**File: `src/services/campaignService.js`**

```javascript
import { fetchAPI } from './api';

export const campaignService = {
  /**
   * Fetch all campaigns
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  getCampaigns: async () => {
    try {
      return await fetchAPI('/campaigns');
    } catch (error) {
      throw new Error('Failed to fetch campaigns');
    }
  },

  /**
   * Fetch campaign data for specific iteration
   * @param {number} campaignId - Campaign ID
   * @param {number} iterationNumber - Current iteration number
   * @returns {Promise<{impressions: number, clicks: number, users: number}>}
   */
  getCampaignData: async (campaignId, iterationNumber) => {
    try {
      return await fetchAPI(
        `/campaigns/${campaignId}?number=${iterationNumber}`
      );
    } catch (error) {
      throw new Error('Failed to fetch campaign data');
    }
  },
};
```

**File: `src/services/campaignService.test.js`**

```javascript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { campaignService } from './campaignService';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('campaignService', () => {
  describe('getCampaigns', () => {
    it('should fetch campaigns successfully', async () => {
      const mockCampaigns = [
        { id: 1, name: 'Red Campaign' },
        { id: 2, name: 'Blue Campaign' },
      ];

      server.use(
        http.get('/api/campaigns', () => {
          return HttpResponse.json(mockCampaigns);
        })
      );

      const campaigns = await campaignService.getCampaigns();
      expect(campaigns).toEqual(mockCampaigns);
    });

    it('should throw error on failed request', async () => {
      server.use(
        http.get('/api/campaigns', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(campaignService.getCampaigns()).rejects.toThrow(
        'Failed to fetch campaigns'
      );
    });
  });

  describe('getCampaignData', () => {
    it('should fetch campaign data with correct parameters', async () => {
      const mockData = { impressions: 100, clicks: 50, users: 75 };

      server.use(
        http.get('/api/campaigns/:id', ({ request, params }) => {
          const url = new URL(request.url);
          expect(params.id).toBe('1');
          expect(url.searchParams.get('number')).toBe('5');
          return HttpResponse.json(mockData);
        })
      );

      const data = await campaignService.getCampaignData(1, 5);
      expect(data).toEqual(mockData);
    });
  });
});
```

✅ **Checkpoint: Services complete with ~15 total passing tests**

---

### Step 5: Redux Store Setup (45 minutes)
**File: `src/store/index.js`**

```javascript
import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from './slices/campaignSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
```

**File: `src/store/slices/campaignSlice.js`**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaignService';

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      const data = await campaignService.getCampaigns();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = campaignSlice.actions;
export default campaignSlice.reducer;

// Selectors
export const selectCampaigns = (state) => state.campaigns.list;
export const selectCampaignsLoading = (state) => state.campaigns.loading;
export const selectCampaignsError = (state) => state.campaigns.error;
```

**File: `src/store/slices/campaignSlice.test.js`**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import campaignReducer, {
  fetchCampaigns,
  clearError,
  selectCampaigns,
  selectCampaignsLoading,
  selectCampaignsError,
} from './campaignSlice';

describe('campaignSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      list: [],
      loading: false,
      error: null,
    };
  });

  it('should return initial state', () => {
    expect(campaignReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = campaignReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });

  describe('fetchCampaigns', () => {
    it('should set loading to true when pending', () => {
      const action = { type: fetchCampaigns.pending.type };
      const state = campaignReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set campaigns when fulfilled', () => {
      const campaigns = [
        { id: 1, name: 'Red Campaign' },
        { id: 2, name: 'Blue Campaign' },
      ];
      const action = {
        type: fetchCampaigns.fulfilled.type,
        payload: campaigns,
      };
      const state = campaignReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(campaigns);
      expect(state.error).toBeNull();
    });

    it('should set error when rejected', () => {
      const errorMessage = 'Failed to fetch campaigns';
      const action = {
        type: fetchCampaigns.rejected.type,
        payload: errorMessage,
      };
      const state = campaignReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('selectors', () => {
    const mockState = {
      campaigns: {
        list: [{ id: 1, name: 'Test' }],
        loading: false,
        error: null,
      },
    };

    it('should select campaigns list', () => {
      expect(selectCampaigns(mockState)).toEqual(mockState.campaigns.list);
    });

    it('should select loading state', () => {
      expect(selectCampaignsLoading(mockState)).toBe(false);
    });

    it('should select error', () => {
      expect(selectCampaignsError(mockState)).toBeNull();
    });
  });
});
```

**File: `src/store/slices/dashboardSlice.js`**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaignService';
import { accumulateMetrics, calculateCTR } from '../../utils/calculations';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ campaignId, iterationNumber }, { rejectWithValue }) => {
    try {
      const data = await campaignService.getCampaignData(
        campaignId,
        iterationNumber
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    campaignId: null,
    iterationNumber: 0,
    totals: {
      impressions: 0,
      clicks: 0,
      users: 0,
    },
    recent: {
      impressions: 0,
      clicks: 0,
      users: 0,
    },
    loading: false,
    error: null,
    lastUpdate: null,
    autoRefreshPaused: false,
    retryCount: 0,
  },
  reducers: {
    resetDashboard: (state) => {
      state.iterationNumber = 0;
      state.totals = { impressions: 0, clicks: 0, users: 0 };
      state.recent = { impressions: 0, clicks: 0, users: 0 };
      state.error = null;
      state.autoRefreshPaused = false;
      state.retryCount = 0;
    },
    setCampaignId: (state, action) => {
      state.campaignId = action.payload;
    },
    pauseAutoRefresh: (state) => {
      state.autoRefreshPaused = true;
    },
    resumeAutoRefresh: (state) => {
      state.autoRefreshPaused = false;
      state.retryCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.recent = action.payload;
        state.totals = accumulateMetrics(state.totals, action.payload);
        state.iterationNumber += 1;
        state.lastUpdate = new Date().toISOString();
        state.error = null;
        state.retryCount = 0;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.retryCount += 1;
        
        if (state.retryCount >= 3) {
          state.autoRefreshPaused = true;
        }
      });
  },
});

export const {
  resetDashboard,
  setCampaignId,
  pauseAutoRefresh,
  resumeAutoRefresh,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardTotals = (state) => state.dashboard.totals;
export const selectDashboardRecent = (state) => state.dashboard.recent;
export const selectIterationNumber = (state) => state.dashboard.iterationNumber;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectLastUpdate = (state) => state.dashboard.lastUpdate;
export const selectAutoRefreshPaused = (state) => state.dashboard.autoRefreshPaused;

export const selectTotalCTR = (state) => {
  const { clicks, impressions } = state.dashboard.totals;
  return calculateCTR(clicks, impressions);
};

export const selectRecentCTR = (state) => {
  const { clicks, impressions } = state.dashboard.recent;
  return calculateCTR(clicks, impressions);
};
```

**Write similar tests for dashboardSlice** (follow campaignSlice.test.js pattern)

✅ **Checkpoint: Foundation complete! ~25+ passing tests**

---

## 🎨 Phase 2: Basic UI Components (2-3 hours)
**Goal: Get something visible on screen**

### Step 6: App.jsx Setup (15 minutes)
**File: `src/App.jsx`**

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import CampaignListPage from './pages/CampaignListPage/CampaignListPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CampaignListPage />} />
          <Route path="/campaign/:id" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
```

---

### Step 7: Simple Common Components (1 hour)

**File: `src/components/common/Loading/Loading.jsx`**

```javascript
import React from 'react';
import './Loading.css';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" data-testid="loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}
```

**File: `src/components/common/Loading/Loading.css`**

```css
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #6e6e73;
  font-size: 0.95rem;
}
```

**File: `src/components/common/Loading/Loading.test.jsx`**

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('renders with default message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<Loading message="Fetching campaigns..." />);
    expect(screen.getByText('Fetching campaigns...')).toBeInTheDocument();
  });

  it('renders spinner', () => {
    render(<Loading />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
```

**File: `src/components/common/EmptyState/EmptyState.jsx`**

```javascript
import React from 'react';
import './EmptyState.css';

export default function EmptyState({ 
  icon = '📊', 
  title, 
  description, 
  action 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && (
        <div className="empty-state-action">{action}</div>
      )}
    </div>
  );
}
```

**Write CSS and tests for EmptyState** (similar pattern to Loading)

**File: `src/components/common/Button/Button.jsx`**

```javascript
import React from 'react';
import './Button.css';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button'
}) {
  return (
    <button
      type={type}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Write CSS and tests for Button**

---

### Step 8: Error Banner Component (30 minutes)

**File: `src/components/layout/ErrorBanner/ErrorBanner.jsx`**

```javascript
import React from 'react';
import Button from '../../common/Button/Button';
import './ErrorBanner.css';

export default function ErrorBanner({ 
  title, 
  message, 
  onRetry, 
  onDismiss,
  type = 'error' 
}) {
  return (
    <div className={`error-banner error-banner-${type}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <div className="error-title">{title}</div>
        <div className="error-message">{message}</div>
      </div>
      <div className="error-actions">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button onClick={onDismiss} variant="secondary">
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Write CSS and tests**

✅ **Checkpoint: Basic components done, ready to build pages**

---

## 📄 Phase 3: Campaign List Page (1-2 hours)
**Goal: Get first page working end-to-end**

### Step 9: Campaign Table Component (45 minutes)

**File: `src/components/campaigns/CampaignTable/CampaignTable.jsx`**

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CampaignTable.css';

export default function CampaignTable({ campaigns }) {
  const navigate = useNavigate();

  const handleRowClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <div className="campaign-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Campaign Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              onClick={() => handleRowClick(campaign.id)}
              className="campaign-row"
            >
              <td>
                <span className="campaign-id">
                  {String(campaign.id).padStart(2, '0')}
                </span>
              </td>
              <td>
                <span className="campaign-name">{campaign.name}</span>
              </td>
              <td>
                <span className="arrow">→</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Apply professional CSS from mockup, write tests**

---

### Step 10: Campaign List Page (45 minutes)

**File: `src/pages/CampaignListPage/CampaignListPage.jsx`**

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampaigns,
  selectCampaigns,
  selectCampaignsLoading,
  selectCampaignsError,
} from '../../store/slices/campaignSlice';
import CampaignTable from '../../components/campaigns/CampaignTable/CampaignTable';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ErrorBanner from '../../components/layout/ErrorBanner/ErrorBanner';
import Button from '../../components/common/Button/Button';
import './CampaignListPage.css';

export default function CampaignListPage() {
  const dispatch = useDispatch();
  const campaigns = useSelector(selectCampaigns);
  const loading = useSelector(selectCampaignsLoading);
  const error = useSelector(selectCampaignsError);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchCampaigns());
  };

  if (loading && campaigns.length === 0) {
    return <Loading message="Loading campaigns..." />;
  }

  if (error) {
    return (
      <div className="campaign-list-page">
        <div className="header">
          <h1>Campaign Dashboard</h1>
          <p>Performance analytics and insights for your advertising campaigns</p>
        </div>
        <ErrorBanner
          title="Failed to load campaigns"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="campaign-list-page">
        <div className="header">
          <h1>Campaign Dashboard</h1>
          <p>Performance analytics and insights for your advertising campaigns</p>
        </div>
        <EmptyState
          title="No Campaigns Yet"
          description="There are no campaigns to display."
          action={<Button onClick={handleRetry}>Refresh</Button>}
        />
      </div>
    );
  }

  return (
    <div className="campaign-list-page">
      <div className="header">
        <h1>Campaign Dashboard</h1>
        <p>Performance analytics and insights for your advertising campaigns</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Campaigns</h2>
          <p>Select a campaign to view detailed metrics</p>
        </div>
        <CampaignTable campaigns={campaigns} />
      </div>
    </div>
  );
}
```

**Apply professional CSS, write integration tests**

✅ **Checkpoint: Run `npm start` - you should see campaign list working!**

---

## 📊 Phase 4: Dashboard Page (3-4 hours)
**Goal: Build complex dashboard with auto-refresh**

### Step 11: Metric Card Component (45 minutes)

**File: `src/components/dashboard/MetricCard/MetricCard.jsx`**

```javascript
import React from 'react';
import { formatNumber, formatPercentage } from '../../../utils/formatters';
import './MetricCard.css';

export default function MetricCard({
  label,
  value,
  description,
  type = 'default',
  isPercentage = false,
  isNumber = false,
  loading = false,
  error = null,
}) {
  const formattedValue = isPercentage 
    ? formatPercentage(value) 
    : formatNumber(value);

  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-label">{label}</div>
      
      {loading ? (
        <div className="skeleton" data-testid="skeleton-loader">
          <div className="skeleton-value"></div>
        </div>
      ) : error ? (
        <div className="metric-error">
          <span className="error-icon">⚠️</span>
          <span>Error</span>
        </div>
      ) : (
        <div className={`metric-value ${isPercentage ? 'percentage' : ''} ${isNumber ? 'number' : ''}`}>
          {formattedValue}
        </div>
      )}
      
      {description && (
        <div className="metric-description">{description}</div>
      )}
    </div>
  );
}
```

**Apply professional CSS with color-coded borders, write tests**

---

### Step 12: Dashboard Components (1 hour)

Build:
- `MetricsGrid.jsx` - Container for metric cards
- `DashboardHeader.jsx` - Header with campaign name and update status
- `Navbar.jsx` - Navigation with back button and campaign selector

**Write tests for each**

---

### Step 13: Custom Hook for Dashboard Data (45 minutes)

**File: `src/hooks/useCampaignData.js`**

```javascript
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardData,
  resetDashboard,
  setCampaignId,
  resumeAutoRefresh,
  selectDashboardTotals,
  selectDashboardRecent,
  selectIterationNumber,
  selectDashboardLoading,
  selectDashboardError,
  selectAutoRefreshPaused,
  selectTotalCTR,
  selectRecentCTR,
} from '../store/slices/dashboardSlice';
import { REFRESH_INTERVAL } from '../utils/constants';

export function useCampaignData(campaignId) {
  const dispatch = useDispatch();
  
  const totals = useSelector(selectDashboardTotals);
  const recent = useSelector(selectDashboardRecent);
  const totalCTR = useSelector(selectTotalCTR);
  const recentCTR = useSelector(selectRecentCTR);
  const iterationNumber = useSelector(selectIterationNumber);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const autoRefreshPaused = useSelector(selectAutoRefreshPaused);

  useEffect(() => {
    dispatch(resetDashboard());
    dispatch(setCampaignId(campaignId));
  }, [campaignId, dispatch]);

  const fetchData = useCallback(() => {
    if (!autoRefreshPaused) {
      dispatch(fetchDashboardData({ campaignId, iterationNumber }));
    }
  }, [dispatch, campaignId, iterationNumber, autoRefreshPaused]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefreshPaused) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData, autoRefreshPaused]);

  const retry = useCallback(() => {
    dispatch(resumeAutoRefresh());
    fetchData();
  }, [dispatch, fetchData]);

  return {
    totals,
    recent,
    totalCTR,
    recentCTR,
    iterationNumber,
    loading,
    error,
    autoRefreshPaused,
    retry,
  };
}
```

**Write comprehensive tests**

---

### Step 14: Dashboard Page (1 hour)

**File: `src/pages/DashboardPage/DashboardPage.jsx`**

```javascript
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignData } from '../../hooks/useCampaignData';
import Navbar from '../../components/layout/Navbar/Navbar';
import DashboardHeader from '../../components/dashboard/DashboardHeader/DashboardHeader';
import MetricsGrid from '../../components/dashboard/MetricsGrid/MetricsGrid';
import MetricCard from '../../components/dashboard/MetricCard/MetricCard';
import ErrorBanner from '../../components/layout/ErrorBanner/ErrorBanner';
import Loading from '../../components/common/Loading/Loading';
import './DashboardPage.css';

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    totals,
    recent,
    totalCTR,
    recentCTR,
    iterationNumber,
    loading,
    error,
    autoRefreshPaused,
    retry,
  } = useCampaignData(id);

  const handleBack = () => {
    navigate('/');
  };

  if (loading && iterationNumber === 0) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <Navbar 
        onBack={handleBack}
        currentCampaignId={id}
      />

      {error && (
        <ErrorBanner
          type={autoRefreshPaused ? 'error' : 'warning'}
          title={autoRefreshPaused ? 'Auto-refresh paused' : 'Update failed'}
          message={error}
          onRetry={retry}
        />
      )}

      <DashboardHeader 
        campaignName={`Campaign ${id}`}
        autoRefreshPaused={autoRefreshPaused}
      />

      <div className="section-header">Cumulative Metrics</div>
      <MetricsGrid>
        <MetricCard
          label="Total Impressions"
          value={totals.impressions}
          description="Sum of all impressions"
          type="total"
        />
        <MetricCard
          label="Total Clicks"
          value={totals.clicks}
          description="Sum of all clicks"
          type="total"
        />
        <MetricCard
          label="Total Users"
          value={totals.users}
          description="Sum of all users"
          type="total"
        />
        <MetricCard
          label="Total CTR"
          value={totalCTR}
          description="Click-through rate"
          type="calculated"
          isPercentage
        />
        <MetricCard
          label="Current Iteration"
          value={iterationNumber}
          description="API call count"
          type="status"
          isNumber
        />
      </MetricsGrid>

      <div className="section-header">Most Recent Data</div>
      <MetricsGrid>
        <MetricCard
          label="Recent Impressions"
          value={recent.impressions}
          description="Latest data point"
          type="recent"
        />
        <MetricCard
          label="Recent Clicks"
          value={recent.clicks}
          description="Latest data point"
          type="recent"
        />
        <MetricCard
          label="Recent Users"
          value={recent.users}
          description="Latest data point"
          type="recent"
        />
        <MetricCard
          label="Recent CTR"
          value={recentCTR}
          description="Latest click-through rate"
          type="recent"
          isPercentage
        />
      </MetricsGrid>
    </div>
  );
}
```

**Apply professional CSS, write integration tests**

✅ **Checkpoint: Full dashboard working with auto-refresh!**

---

## 🎨 Phase 5: Polish & Testing (2-3 hours)

### Step 15: Apply Professional Styling (1-2 hours)
- Use CSS from mockups we created
- Ensure responsive design
- Add hover states and transitions
- Test on different screen sizes

### Step 16: Complete Test Coverage (1 hour)
- Run `npm test -- --coverage`
- Fill in any missing tests
- Aim for 80%+ coverage
- Test edge cases

### Step 17: Final QA (30 minutes)
- Test all user flows manually
- Check error states
- Verify auto-refresh works
- Test campaign switching
- Check back button navigation

---

## ✅ Final Checklist

### Functionality
- [ ] Campaign list displays and is clickable
- [ ] Dashboard shows 9 metric tiles
- [ ] Auto-refresh works every 5 seconds
- [ ] Totals accumulate correctly
- [ ] Recent shows latest values only
- [ ] CTR calculates correctly
- [ ] Campaign switcher works
- [ ] Back button works
- [ ] Error states display correctly
- [ ] Loading states show

### Code Quality
- [ ] All utils have tests
- [ ] All services have tests
- [ ] All Redux slices have tests
- [ ] All components have tests
- [ ] Custom hooks have tests
- [ ] Test coverage > 80%
- [ ] No console errors
- [ ] No ESLint warnings
- [ ] Code is well-commented
- [ ] Functions have JSDoc

### Design
- [ ] Professional appearance
- [ ] Consistent spacing
- [ ] Clean typography
- [ ] Proper color scheme
- [ ] Responsive design
- [ ] Smooth transitions
- [ ] Accessible (keyboard nav works)

---

## 💡 Time Management Tips

### If you have 8 hours:
- **Phase 1**: 2.5 hours
- **Phase 2**: 2 hours
- **Phase 3**: 1.5 hours
- **Phase 4**: 2 hours
- Skip complex error states, focus on core functionality

### If you have 10 hours:
- Follow the guide as written
- Include all error handling
- Polish styling thoroughly

### If you have 12 hours:
- Add toast notifications
- Add loading skeletons
- Comprehensive error handling
- Perfect test coverage

---

## 🚨 Common Pitfalls to Avoid

1. **Don't start with UI** - Build foundation first
2. **Don't skip tests** - Write as you go
3. **Don't over-engineer** - Start simple, enhance later
4. **Don't forget cleanup** - Clear intervals in useEffect
5. **Don't ignore errors** - Handle them gracefully
6. **Don't rush styling** - Professional appearance matters
7. **Don't forget responsiveness** - Test mobile view
8. **Don't skip documentation** - Comment complex logic

---

## 🎯 Success Indicators

You're on track if:
- ✅ Tests pass after each step
- ✅ Coverage increases steadily
- ✅ No console errors
- ✅ Each piece works before moving on
- ✅ Code is readable and organized
- ✅ Commits are logical and frequent

---

## 📝 Git Commit Strategy

Commit after completing each major step:
```bash
git commit -m "feat: add calculation utilities with tests"
git commit -m "feat: implement campaign service layer"
git commit -m "feat: setup Redux store with campaign slice"
git commit -m "feat: add campaign list page with table component"
git commit -m "feat: implement dashboard with auto-refresh"
git commit -m "style: apply professional CSS to all components"
git commit -m "test: achieve 80%+ test coverage"
```

---

## 🎓 What This Demonstrates (Senior Level)

1. **Architecture** - Clean separation, scalable structure
2. **State Management** - Redux Toolkit, proper patterns
3. **Testing** - Comprehensive, professional approach
4. **Code Quality** - Documentation, organization, clarity
5. **Problem Solving** - Auto-refresh, accumulation logic
6. **UX Thinking** - Error handling, loading states
7. **Professional Standards** - CSS, accessibility, polish

---

**You've got this! Start with Step 1 and build methodically. Good luck! 🚀**
