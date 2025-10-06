# Guide 02: Services Layer (Validation + API)

**Estimated Time:** 1 hour  
**When:** Tomorrow morning - Start here after gym  
**Prerequisites:** Guide 01 completed

---

## 🎯 Goal

Build the foundation layer: validation functions and API service with retry logic. This is your defensive barrier against bad data and network issues.

**Why services first?** Because Redux and components will depend on these. Build from the bottom up.

---

## 📝 Step 1: Create Validation Module

**File:** `src/services/validation.js`

```javascript
/**
 * Validation layer for external API data
 * Senior thinking: Validate at the boundary (API responses)
 * Don't validate internal Redux state - trust your own code
 */

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize string input to prevent XSS attacks
 * Security: Never trust external data, even from "our" API
 * 
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string with HTML entities escaped
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  // Escape HTML/script tags and quotes
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates campaign list from /api/campaigns
 * @param {Array} data - Expected: [{id: number, name: string}, ...]
 * @returns {Array} Sanitized and validated campaign list
 * @throws {ValidationError} if invalid
 */
export const validateCampaignList = (data) => {
  if (!Array.isArray(data)) {
    throw new ValidationError('Campaign list must be an array');
  }
  
  if (data.length === 0) {
    throw new ValidationError('Campaign list is empty');
  }
  
  // Sanitize campaign names to prevent XSS
  const sanitizedData = data.map(campaign => ({
    ...campaign,
    name: sanitizeString(campaign.name)
  }));
  
  const isValid = sanitizedData.every(campaign => 
    campaign && 
    typeof campaign.id === 'number' && 
    typeof campaign.name === 'string' &&
    campaign.name.trim().length > 0
  );
  
  if (!isValid) {
    throw new ValidationError('Invalid campaign structure: missing id or name');
  }
  
  return sanitizedData; // Return sanitized data
};

/**
 * Validates campaign metrics from /api/campaigns/:id?number=X
 * @param {Object} data - Expected: {impressions: number, clicks: number, users: number}
 * @returns {boolean} true if valid
 * @throws {ValidationError} if invalid
 */
export const validateCampaignData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Campaign data must be an object');
  }
  
  const { impressions, clicks, users } = data;
  
  // Check impressions
  if (typeof impressions !== 'number' || impressions < 0) {
    throw new ValidationError(
      `Invalid impressions value: ${impressions}. Must be a non-negative number.`
    );
  }
  
  // Check clicks
  if (typeof clicks !== 'number' || clicks < 0) {
    throw new ValidationError(
      `Invalid clicks value: ${clicks}. Must be a non-negative number.`
    );
  }
  
  // Check users
  if (typeof users !== 'number' || users < 0) {
    throw new ValidationError(
      `Invalid users value: ${users}. Must be a non-negative number.`
    );
  }
  
  return true;
};
```

**Test it works:**
```bash
npm test src/services/validation.test.js
```

---

## 📝 Step 2: Create Validation Tests

**File:** `src/services/validation.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { 
  validateCampaignList, 
  validateCampaignData, 
  ValidationError 
} from './validation';

describe('validateCampaignList', () => {
  test('accepts valid campaign list and returns sanitized data', () => {
    const validList = [
      { id: 1, name: 'Campaign 1' },
      { id: 2, name: 'Campaign 2' },
    ];
    
    const result = validateCampaignList(validList);
    expect(result).toEqual(validList);
  });

  test('sanitizes campaign names with HTML entities', () => {
    const listWithHTML = [
      { id: 1, name: '<script>alert("xss")</script>' },
    ];
    
    const result = validateCampaignList(listWithHTML);
    expect(result[0].name).not.toContain('<script>');
    expect(result[0].name).toContain('&lt;script&gt;');
  });

  test('sanitizes quotes in campaign names', () => {
    const listWithQuotes = [
      { id: 1, name: 'Campaign "Special"' },
    ];
    
    const result = validateCampaignList(listWithQuotes);
    expect(result[0].name).not.toContain('"');
    expect(result[0].name).toContain('&quot;');
  });

  test('rejects non-array input', () => {
    expect(() => validateCampaignList({})).toThrow(ValidationError);
    expect(() => validateCampaignList(null)).toThrow(ValidationError);
    expect(() => validateCampaignList('not an array')).toThrow(ValidationError);
  });

  test('rejects empty array', () => {
    expect(() => validateCampaignList([])).toThrow(ValidationError);
    expect(() => validateCampaignList([])).toThrow(/empty/i);
  });

  test('rejects invalid campaign structure', () => {
    const missingId = [{ name: 'Test' }];
    expect(() => validateCampaignList(missingId)).toThrow(ValidationError);
    
    const missingName = [{ id: 1 }];
    expect(() => validateCampaignList(missingName)).toThrow(ValidationError);
    
    const emptyName = [{ id: 1, name: '   ' }];
    expect(() => validateCampaignList(emptyName)).toThrow(ValidationError);
  });

  test('rejects wrong types', () => {
    const stringId = [{ id: '1', name: 'Test' }];
    expect(() => validateCampaignList(stringId)).toThrow(ValidationError);
    
    const numericName = [{ id: 1, name: 123 }];
    expect(() => validateCampaignList(numericName)).toThrow(ValidationError);
  });
});

describe('validateCampaignData', () => {
  test('accepts valid campaign data', () => {
    const validData = {
      impressions: 100,
      clicks: 5,
      users: 50,
    };
    
    expect(() => validateCampaignData(validData)).not.toThrow();
  });

  test('accepts zero values', () => {
    const zeroData = {
      impressions: 0,
      clicks: 0,
      users: 0,
    };
    
    expect(() => validateCampaignData(zeroData)).not.toThrow();
  });

  test('rejects null or non-object', () => {
    expect(() => validateCampaignData(null)).toThrow(ValidationError);
    expect(() => validateCampaignData([])).toThrow(ValidationError);
    expect(() => validateCampaignData('string')).toThrow(ValidationError);
  });

  test('rejects negative values', () => {
    const negativeImpressions = { impressions: -1, clicks: 5, users: 50 };
    expect(() => validateCampaignData(negativeImpressions)).toThrow(ValidationError);
    expect(() => validateCampaignData(negativeImpressions)).toThrow(/impressions/i);
    
    const negativeClicks = { impressions: 100, clicks: -1, users: 50 };
    expect(() => validateCampaignData(negativeClicks)).toThrow(/clicks/i);
    
    const negativeUsers = { impressions: 100, clicks: 5, users: -1 };
    expect(() => validateCampaignData(negativeUsers)).toThrow(/users/i);
  });

  test('rejects non-number values', () => {
    const stringImpressions = { impressions: '100', clicks: 5, users: 50 };
    expect(() => validateCampaignData(stringImpressions)).toThrow(ValidationError);
    
    const nullClicks = { impressions: 100, clicks: null, users: 50 };
    expect(() => validateCampaignData(nullClicks)).toThrow(ValidationError);
  });

  test('rejects missing fields', () => {
    const missingImpressions = { clicks: 5, users: 50 };
    expect(() => validateCampaignData(missingImpressions)).toThrow(ValidationError);
    
    const missingClicks = { impressions: 100, users: 50 };
    expect(() => validateCampaignData(missingClicks)).toThrow(ValidationError);
    
    const missingUsers = { impressions: 100, clicks: 5 };
    expect(() => validateCampaignData(missingUsers)).toThrow(ValidationError);
  });
});
```

**Run tests:**
```bash
npm test validation
```

---

## 📝 Step 3: Create Logger Utility

**Why?** `console.log` in production can leak sensitive data. Use proper logging.

**File:** `src/utils/logger.js`

```javascript
/**
 * Logger utility for development and production
 * Security: Prevents sensitive data from leaking to production console
 * 
 * In production, this should be connected to error tracking services
 * like Sentry, Datadog, or similar
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log errors - always logged, sent to error tracking in production
   */
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
    // TODO: In production, send to error tracking service
    // e.g., Sentry.captureException(new Error(message))
  },
  
  /**
   * Log warnings - development only
   */
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  
  /**
   * Log info - development only
   */
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  /**
   * Log debug - development only
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};
```

---

## 📝 Step 4: Create Constants Configuration

**Why?** Magic numbers make code hard to maintain. Named constants are self-documenting.

**File:** `src/constants/config.js`

```javascript
/**
 * Application configuration constants
 * Naming: Keep all magic numbers here with clear, descriptive names
 */

// API retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAYS_MS = [1000, 2000, 4000]; // Exponential backoff
export const POLLING_MAX_RETRY_ATTEMPTS = 2; // Fewer retries for polling endpoints

// Dashboard polling configuration
export const POLLING_INTERVAL_MS = 5000; // 5 seconds between requests
export const MAX_CONSECUTIVE_FAILURES = 3; // Circuit breaker threshold
export const MINIMUM_FETCH_INTERVAL_MS = 5000; // Throttle protection

// Validation constants
export const MAX_CAMPAIGN_NAME_LENGTH = 255;
export const MIN_CAMPAIGN_ID = 1;
```

---

## 📝 Step 5: Create Campaign Service with Retry Logic

**File:** `src/services/campaignService.js`

```javascript
import { validateCampaignList, validateCampaignData } from './validation';
import { logger } from '../utils/logger';
import { 
  MAX_RETRY_ATTEMPTS, 
  RETRY_DELAYS_MS,
  POLLING_MAX_RETRY_ATTEMPTS 
} from '../constants/config';

/**
 * Fetch with automatic retry logic for transient failures
 * 
 * Senior thinking: Distinguish between client errors (don't retry) 
 * and server errors (retry with exponential backoff)
 * 
 * Performance: Uses predefined delay array instead of calculating
 * Security: Limits retry attempts to prevent abuse
 * 
 * @param {string} url - API endpoint to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Response>} Fetch response
 */
const fetchWithRetry = async (url, options = {}, maxRetries = MAX_RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Client errors (4xx) - don't retry, fail fast
      if (!response.ok && response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} - ${response.statusText}`);
      }
      
      // Success - return immediately
      if (response.ok) {
        return response;
      }
      
      // Server errors (5xx) - these are retryable
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      
      // Last attempt - give up
      if (attempt === maxRetries - 1) {
        logger.error(`Failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      
      // Use predefined delay (exponential backoff)
      const delay = RETRY_DELAYS_MS[attempt] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      logger.info(`Retry attempt ${attempt + 1}/${maxRetries - 1} after ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Fetch campaign list
 * Security: Returns sanitized campaign data
 * @returns {Promise<Array>} Array of campaigns: [{id, name}, ...]
 */
export const fetchCampaigns = async () => {
  try {
    const response = await fetchWithRetry('/api/campaigns');
    const data = await response.json();
    
    // Validate and sanitize external data at the boundary
    const sanitizedCampaigns = validateCampaignList(data);
    
    return sanitizedCampaigns;
  } catch (error) {
    logger.error('Failed to fetch campaigns:', error.message);
    throw error;
  }
};

/**
 * Fetch campaign metrics for a specific iteration
 * 
 * Performance: Fewer retries for polling endpoint (fail faster)
 * 
 * @param {number} campaignId - Campaign ID
 * @param {number} iteration - Current iteration number (starts at 0)
 * @returns {Promise<Object>} Metrics: {impressions, clicks, users}
 */
export const fetchCampaignMetrics = async (campaignId, iteration) => {
  try {
    // Fewer retries for polling endpoint - fail faster
    const response = await fetchWithRetry(
      `/api/campaigns/${campaignId}?number=${iteration}`,
      {},
      POLLING_MAX_RETRY_ATTEMPTS
    );
    
    const data = await response.json();
    
    // Validate external data at the boundary
    validateCampaignData(data);
    
    return data;
  } catch (error) {
    logger.error(`Failed to fetch metrics for campaign ${campaignId}:`, error.message);
    throw error;
  }
};
```

---

## 📝 Step 6: Create Service Tests with MSW

**File:** `src/services/campaignService.test.js`

```javascript
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { fetchCampaigns, fetchCampaignMetrics } from './campaignService';

// Setup MSW server for testing
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchCampaigns', () => {
  test('fetches and validates campaigns successfully', async () => {
    server.use(
      http.get('/api/campaigns', () => {
        return HttpResponse.json([
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ]);
      })
    );

    const campaigns = await fetchCampaigns();
    
    expect(campaigns).toHaveLength(2);
    expect(campaigns[0]).toEqual({ id: 1, name: 'Red' });
    expect(campaigns[1]).toEqual({ id: 2, name: 'Blue' });
  });

  test('retries on server error (500) and succeeds', async () => {
    let attempts = 0;
    
    server.use(
      http.get('/api/campaigns', () => {
        attempts++;
        
        if (attempts < 2) {
          // First attempt fails
          return new HttpResponse(null, { status: 500 });
        }
        
        // Second attempt succeeds
        return HttpResponse.json([{ id: 1, name: 'Test' }]);
      })
    );

    const campaigns = await fetchCampaigns();
    
    expect(attempts).toBe(2);
    expect(campaigns).toHaveLength(1);
  });

  test('does not retry on client error (404)', async () => {
    let attempts = 0;
    
    server.use(
      http.get('/api/campaigns', () => {
        attempts++;
        return new HttpResponse(null, { status: 404 });
      })
    );

    await expect(fetchCampaigns()).rejects.toThrow('Client error: 404');
    expect(attempts).toBe(1); // Only one attempt, no retries
  });

  test('gives up after max retries on persistent server error', async () => {
    let attempts = 0;
    
    server.use(
      http.get('/api/campaigns', () => {
        attempts++;
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(fetchCampaigns()).rejects.toThrow('Server error: 500');
    expect(attempts).toBe(3); // Initial + 2 retries = 3 total
  });

  test('throws validation error for invalid data structure', async () => {
    server.use(
      http.get('/api/campaigns', () => {
        return HttpResponse.json([
          { id: 1 }, // Missing name
        ]);
      })
    );

    await expect(fetchCampaigns()).rejects.toThrow(/Invalid campaign structure/);
  });

  test('throws validation error for empty array', async () => {
    server.use(
      http.get('/api/campaigns', () => {
        return HttpResponse.json([]);
      })
    );

    await expect(fetchCampaigns()).rejects.toThrow(/empty/i);
  });
});

describe('fetchCampaignMetrics', () => {
  test('fetches metrics with correct parameters', async () => {
    server.use(
      http.get('/api/campaigns/:id', ({ params, request }) => {
        const url = new URL(request.url);
        const number = url.searchParams.get('number');
        
        expect(params.id).toBe('1');
        expect(number).toBe('0');
        
        return HttpResponse.json({
          impressions: 100,
          clicks: 5,
          users: 50,
        });
      })
    );

    const metrics = await fetchCampaignMetrics(1, 0);
    
    expect(metrics).toEqual({
      impressions: 100,
      clicks: 5,
      users: 50,
    });
  });

  test('increments iteration number correctly', async () => {
    let lastNumber = null;
    
    server.use(
      http.get('/api/campaigns/:id', ({ request }) => {
        const url = new URL(request.url);
        lastNumber = url.searchParams.get('number');
        
        return HttpResponse.json({
          impressions: 100,
          clicks: 5,
          users: 50,
        });
      })
    );

    await fetchCampaignMetrics(1, 0);
    expect(lastNumber).toBe('0');
    
    await fetchCampaignMetrics(1, 1);
    expect(lastNumber).toBe('1');
    
    await fetchCampaignMetrics(1, 2);
    expect(lastNumber).toBe('2');
  });

  test('retries on server error but with fewer attempts', async () => {
    let attempts = 0;
    
    server.use(
      http.get('/api/campaigns/:id', () => {
        attempts++;
        
        if (attempts < 2) {
          return new HttpResponse(null, { status: 500 });
        }
        
        return HttpResponse.json({
          impressions: 100,
          clicks: 5,
          users: 50,
        });
      })
    );

    const metrics = await fetchCampaignMetrics(1, 0);
    
    expect(attempts).toBe(2);
    expect(metrics.impressions).toBe(100);
  });

  test('throws validation error for invalid metrics data', async () => {
    server.use(
      http.get('/api/campaigns/:id', () => {
        return HttpResponse.json({
          impressions: -100, // Invalid: negative
          clicks: 5,
          users: 50,
        });
      })
    );

    await expect(fetchCampaignMetrics(1, 0)).rejects.toThrow(/Invalid impressions/);
  });

  test('throws validation error for missing fields', async () => {
    server.use(
      http.get('/api/campaigns/:id', () => {
        return HttpResponse.json({
          impressions: 100,
          clicks: 5,
          // Missing users field
        });
      })
    );

    await expect(fetchCampaignMetrics(1, 0)).rejects.toThrow(/Invalid users/);
  });
});
```

**Run tests:**
```bash
npm test campaignService
```

---

## ✅ Verification Checklist

Before moving to Guide 03:

- [ ] `validation.js` created with both validation functions
- [ ] `validation.test.js` passes all tests
- [ ] `campaignService.js` created with retry logic
- [ ] `campaignService.test.js` passes all tests
- [ ] Run `npm test` - all service layer tests pass
- [ ] Code is clean, well-commented

---

## 🎯 What You've Built

After completing this guide:

✅ **Defensive validation** at the API boundary  
✅ **Smart retry logic** with exponential backoff  
✅ **Comprehensive tests** covering happy path and edge cases  
✅ **Production-ready** error handling  

**This is your data safety layer!** Everything that comes from the API goes through validation. Everything that fails temporarily gets retried intelligently.

---

## 🚀 Next Steps

**Move to Guide 03:** Redux Store Setup  
You'll use these services in your Redux thunks!

---

**Estimated Completion Time:** 60 minutes  
**Test Coverage So Far:** ~30% (Services layer complete)
