# Data Validation Strategy Guide
## Senior-Level Data Validation for Campaign Dashboard

---

## 🎯 Why Validation Matters (Senior Level)

### Production-Ready Code Requires:
1. **Type safety** - Prevent runtime errors from bad data
2. **Data integrity** - Ensure calculations use valid inputs
3. **Error messaging** - Clear feedback for debugging
4. **Edge case handling** - Zero values, negatives, NaN, undefined
5. **API response validation** - Don't trust external data
6. **User input validation** - Sanitize before processing

---

## 📋 Validation Strategy

### Where to Validate:
```
API Response → Service Layer → Redux State → Components
     ✓              ✓              ✓            ✓
```

**Validate at every boundary!**

---

## 🛠️ Implementation

### 1. Validation Utilities

**File: `src/utils/validators.js`**

```javascript
/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Check if value is a valid number (not NaN, not Infinity)
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isValidNumber(value) {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    isFinite(value)
  );
}

/**
 * Check if value is a non-negative number
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isNonNegativeNumber(value) {
  return isValidNumber(value) && value >= 0;
}

/**
 * Check if value is a positive number
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if value is a valid integer
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isValidInteger(value) {
  return isValidNumber(value) && Number.isInteger(value);
}

/**
 * Check if value is a non-empty string
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate campaign object structure
 * @param {*} campaign - Campaign object to validate
 * @throws {ValidationError} If campaign is invalid
 * @returns {boolean} True if valid
 */
export function validateCampaign(campaign) {
  if (!campaign || typeof campaign !== 'object') {
    throw new ValidationError('Campaign must be an object');
  }

  if (!isValidInteger(campaign.id) || campaign.id <= 0) {
    throw new ValidationError(
      'Campaign ID must be a positive integer',
      'id'
    );
  }

  if (!isNonEmptyString(campaign.name)) {
    throw new ValidationError(
      'Campaign name must be a non-empty string',
      'name'
    );
  }

  return true;
}

/**
 * Validate campaign metrics object
 * @param {*} metrics - Metrics object to validate
 * @throws {ValidationError} If metrics are invalid
 * @returns {boolean} True if valid
 */
export function validateMetrics(metrics) {
  if (!metrics || typeof metrics !== 'object') {
    throw new ValidationError('Metrics must be an object');
  }

  // Required fields
  const requiredFields = ['impressions', 'clicks', 'users'];
  
  for (const field of requiredFields) {
    if (!(field in metrics)) {
      throw new ValidationError(
        `Missing required field: ${field}`,
        field
      );
    }

    if (!isNonNegativeNumber(metrics[field])) {
      throw new ValidationError(
        `${field} must be a non-negative number`,
        field
      );
    }
  }

  // Business rule: clicks cannot exceed impressions
  if (metrics.clicks > metrics.impressions) {
    throw new ValidationError(
      'Clicks cannot exceed impressions',
      'clicks'
    );
  }

  return true;
}

/**
 * Validate campaign ID parameter
 * @param {*} campaignId - Campaign ID to validate
 * @throws {ValidationError} If invalid
 * @returns {number} Validated campaign ID
 */
export function validateCampaignId(campaignId) {
  // Handle string IDs from URL params
  const numericId = typeof campaignId === 'string' 
    ? parseInt(campaignId, 10) 
    : campaignId;

  if (!isValidInteger(numericId) || numericId <= 0) {
    throw new ValidationError(
      'Campaign ID must be a positive integer',
      'campaignId'
    );
  }

  return numericId;
}

/**
 * Validate iteration number
 * @param {*} iterationNumber - Iteration number to validate
 * @throws {ValidationError} If invalid
 * @returns {number} Validated iteration number
 */
export function validateIterationNumber(iterationNumber) {
  if (!isValidInteger(iterationNumber) || iterationNumber < 0) {
    throw new ValidationError(
      'Iteration number must be a non-negative integer',
      'iterationNumber'
    );
  }

  return iterationNumber;
}

/**
 * Sanitize and validate API response for campaign list
 * @param {*} response - API response to validate
 * @throws {ValidationError} If response is invalid
 * @returns {Array} Validated campaigns array
 */
export function validateCampaignListResponse(response) {
  if (!Array.isArray(response)) {
    throw new ValidationError('Campaign list must be an array');
  }

  // Validate each campaign
  return response.map((campaign, index) => {
    try {
      validateCampaign(campaign);
      return campaign;
    } catch (error) {
      throw new ValidationError(
        `Invalid campaign at index ${index}: ${error.message}`,
        `campaigns[${index}]`
      );
    }
  });
}

/**
 * Sanitize and validate API response for campaign metrics
 * @param {*} response - API response to validate
 * @throws {ValidationError} If response is invalid
 * @returns {Object} Validated metrics object
 */
export function validateMetricsResponse(response) {
  validateMetrics(response);
  return response;
}

/**
 * Safe number parsing with default fallback
 * @param {*} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default
 */
export function safeParseNumber(value, defaultValue = 0) {
  const parsed = Number(value);
  return isValidNumber(parsed) ? parsed : defaultValue;
}

/**
 * Safe integer parsing with default fallback
 * @param {*} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed integer or default
 */
export function safeParseInt(value, defaultValue = 0) {
  const parsed = parseInt(value, 10);
  return isValidInteger(parsed) ? parsed : defaultValue;
}
```

---

### 2. Enhanced Calculations with Validation

**File: `src/utils/calculations.js`**

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
    // Return previous state if accumulation fails
    return previous;
  }
}
```

---

### 3. Enhanced Formatters with Validation

**File: `src/utils/formatters.js`**

```javascript
import { isValidNumber, isNonNegativeNumber, ValidationError } from './validators';

/**
 * Format number with commas with validation
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 * @throws {ValidationError} If input is invalid
 */
export function formatNumber(num) {
  if (!isValidNumber(num)) {
    throw new ValidationError(
      'Input must be a valid number',
      'num'
    );
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
  const numericValue = typeof value === 'string' 
    ? parseFloat(value) 
    : value;

  if (!isValidNumber(numericValue)) {
    throw new ValidationError(
      'Percentage value must be a valid number',
      'value'
    );
  }

  if (numericValue < 0 || numericValue > 100) {
    throw new ValidationError(
      'Percentage must be between 0 and 100',
      'value'
    );
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
  const date = timestamp instanceof Date 
    ? timestamp 
    : new Date(timestamp);

  if (isNaN(date.getTime())) {
    throw new ValidationError(
      'Invalid timestamp provided',
      'timestamp'
    );
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Validate that timestamp is not in the future
  if (diffInSeconds < 0) {
    throw new ValidationError(
      'Timestamp cannot be in the future',
      'timestamp'
    );
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

---

### 4. Enhanced Service Layer with Validation

**File: `src/services/campaignService.js`**

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
      
      // Validate response structure
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
      // Validate inputs before making request
      const validCampaignId = validateCampaignId(campaignId);
      const validIterationNumber = validateIterationNumber(iterationNumber);

      const response = await fetchAPI(
        `/campaigns/${validCampaignId}?number=${validIterationNumber}`
      );

      // Validate response structure
      const validatedMetrics = validateMetricsResponse(response);

      return validatedMetrics;
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      throw new Error('Failed to fetch campaign data');
    }
  },
};
```

---

### 5. Comprehensive Test Suite

**File: `src/utils/validators.test.js`**

```javascript
import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  isValidNumber,
  isNonNegativeNumber,
  isPositiveNumber,
  isValidInteger,
  isNonEmptyString,
  validateCampaign,
  validateMetrics,
  validateCampaignId,
  validateIterationNumber,
  validateCampaignListResponse,
  validateMetricsResponse,
  safeParseNumber,
  safeParseInt,
} from './validators';

describe('validators', () => {
  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(42)).toBe(true);
      expect(isValidNumber(-10)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
      expect(isValidNumber('42')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    it('should return true for non-negative numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(42)).toBe(true);
      expect(isNonNegativeNumber(0.5)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
      expect(isNonNegativeNumber(-0.1)).toBe(false);
    });

    it('should return false for invalid values', () => {
      expect(isNonNegativeNumber(NaN)).toBe(false);
      expect(isNonNegativeNumber('42')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(42)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
    });

    it('should return false for zero and negative', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
    });
  });

  describe('isValidInteger', () => {
    it('should return true for integers', () => {
      expect(isValidInteger(0)).toBe(true);
      expect(isValidInteger(42)).toBe(true);
      expect(isValidInteger(-10)).toBe(true);
    });

    it('should return false for non-integers', () => {
      expect(isValidInteger(3.14)).toBe(false);
      expect(isValidInteger(NaN)).toBe(false);
      expect(isValidInteger('42')).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('  test  ')).toBe(true);
    });

    it('should return false for empty or invalid', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(42)).toBe(false);
    });
  });

  describe('validateCampaign', () => {
    it('should validate correct campaign object', () => {
      const campaign = { id: 1, name: 'Test Campaign' };
      expect(() => validateCampaign(campaign)).not.toThrow();
    });

    it('should throw for invalid campaign object', () => {
      expect(() => validateCampaign(null)).toThrow(ValidationError);
      expect(() => validateCampaign('not an object')).toThrow(ValidationError);
    });

    it('should throw for invalid id', () => {
      expect(() => validateCampaign({ id: 0, name: 'Test' })).toThrow(
        ValidationError
      );
      expect(() => validateCampaign({ id: -1, name: 'Test' })).toThrow(
        ValidationError
      );
      expect(() => validateCampaign({ id: 'invalid', name: 'Test' })).toThrow(
        ValidationError
      );
    });

    it('should throw for invalid name', () => {
      expect(() => validateCampaign({ id: 1, name: '' })).toThrow(
        ValidationError
      );
      expect(() => validateCampaign({ id: 1, name: '   ' })).toThrow(
        ValidationError
      );
      expect(() => validateCampaign({ id: 1, name: 123 })).toThrow(
        ValidationError
      );
    });
  });

  describe('validateMetrics', () => {
    it('should validate correct metrics object', () => {
      const metrics = { impressions: 100, clicks: 50, users: 75 };
      expect(() => validateMetrics(metrics)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      expect(() => validateMetrics({ impressions: 100, clicks: 50 })).toThrow(
        ValidationError
      );
    });

    it('should throw for negative values', () => {
      expect(() =>
        validateMetrics({ impressions: -1, clicks: 50, users: 75 })
      ).toThrow(ValidationError);
    });

    it('should throw for invalid types', () => {
      expect(() =>
        validateMetrics({ impressions: '100', clicks: 50, users: 75 })
      ).toThrow(ValidationError);
    });

    it('should throw when clicks exceed impressions', () => {
      expect(() =>
        validateMetrics({ impressions: 50, clicks: 100, users: 75 })
      ).toThrow(ValidationError);
    });

    it('should allow clicks equal to impressions', () => {
      const metrics = { impressions: 100, clicks: 100, users: 75 };
      expect(() => validateMetrics(metrics)).not.toThrow();
    });
  });

  describe('validateCampaignId', () => {
    it('should validate and return valid campaign IDs', () => {
      expect(validateCampaignId(1)).toBe(1);
      expect(validateCampaignId(999)).toBe(999);
      expect(validateCampaignId('1')).toBe(1); // String conversion
    });

    it('should throw for invalid campaign IDs', () => {
      expect(() => validateCampaignId(0)).toThrow(ValidationError);
      expect(() => validateCampaignId(-1)).toThrow(ValidationError);
      expect(() => validateCampaignId('invalid')).toThrow(ValidationError);
      expect(() => validateCampaignId(3.14)).toThrow(ValidationError);
    });
  });

  describe('validateIterationNumber', () => {
    it('should validate valid iteration numbers', () => {
      expect(validateIterationNumber(0)).toBe(0);
      expect(validateIterationNumber(10)).toBe(10);
    });

    it('should throw for invalid iteration numbers', () => {
      expect(() => validateIterationNumber(-1)).toThrow(ValidationError);
      expect(() => validateIterationNumber(3.14)).toThrow(ValidationError);
      expect(() => validateIterationNumber('5')).toThrow(ValidationError);
    });
  });

  describe('validateCampaignListResponse', () => {
    it('should validate correct campaign list', () => {
      const campaigns = [
        { id: 1, name: 'Red' },
        { id: 2, name: 'Blue' },
      ];
      expect(() => validateCampaignListResponse(campaigns)).not.toThrow();
    });

    it('should throw for non-array response', () => {
      expect(() => validateCampaignListResponse('not an array')).toThrow(
        ValidationError
      );
    });

    it('should throw for invalid campaign in list', () => {
      const campaigns = [
        { id: 1, name: 'Red' },
        { id: 'invalid', name: 'Blue' },
      ];
      expect(() => validateCampaignListResponse(campaigns)).toThrow(
        ValidationError
      );
    });
  });

  describe('validateMetricsResponse', () => {
    it('should validate correct metrics response', () => {
      const metrics = { impressions: 100, clicks: 50, users: 75 };
      expect(() => validateMetricsResponse(metrics)).not.toThrow();
    });

    it('should throw for invalid metrics', () => {
      const invalidMetrics = { impressions: 50, clicks: 100, users: 75 };
      expect(() => validateMetricsResponse(invalidMetrics)).toThrow(
        ValidationError
      );
    });
  });

  describe('safeParseNumber', () => {
    it('should parse valid numbers', () => {
      expect(safeParseNumber('42')).toBe(42);
      expect(safeParseNumber(42)).toBe(42);
      expect(safeParseNumber('3.14')).toBe(3.14);
    });

    it('should return default for invalid values', () => {
      expect(safeParseNumber('invalid')).toBe(0);
      expect(safeParseNumber('invalid', 99)).toBe(99);
      expect(safeParseNumber(null, 10)).toBe(10);
    });
  });

  describe('safeParseInt', () => {
    it('should parse valid integers', () => {
      expect(safeParseInt('42')).toBe(42);
      expect(safeParseInt(42)).toBe(42);
    });

    it('should return default for invalid values', () => {
      expect(safeParseInt('invalid')).toBe(0);
      expect(safeParseInt('3.14')).toBe(3); // parseInt behavior
      expect(safeParseInt(null, 10)).toBe(10);
    });
  });
});
```

**File: `src/utils/calculations.test.js`** (Enhanced)

```javascript
import { describe, it, expect } from 'vitest';
import { calculateCTR, safeCalculateCTR, accumulateMetrics, safeAccumulateMetrics } from './calculations';
import { ValidationError } from './validators';

describe('calculations', () => {
  describe('calculateCTR', () => {
    it('should calculate CTR correctly', () => {
      expect(calculateCTR(50, 100)).toBe('50.0');
      expect(calculateCTR(25, 100)).toBe('25.0');
      expect(calculateCTR(33, 100)).toBe('33.0');
    });

    it('should return 0 when impressions is 0', () => {
      expect(calculateCTR(0, 0)).toBe('0.0');
    });

    it('should handle decimal results', () => {
      expect(calculateCTR(1, 3)).toBe('33.3');
      expect(calculateCTR(2, 3)).toBe('66.7');
    });

    it('should throw ValidationError for invalid inputs', () => {
      expect(() => calculateCTR(-1, 100)).toThrow(ValidationError);
      expect(() => calculateCTR(50, -100)).toThrow(ValidationError);
      expect(() => calculateCTR('50', 100)).toThrow(ValidationError);
      expect(() => calculateCTR(50, '100')).toThrow(ValidationError);
      expect(() => calculateCTR(NaN, 100)).toThrow(ValidationError);
    });

    it('should throw when clicks exceed impressions', () => {
      expect(() => calculateCTR(150, 100)).toThrow(ValidationError);
    });
  });

  describe('safeCalculateCTR', () => {
    it('should return CTR for valid inputs', () => {
      expect(safeCalculateCTR(50, 100)).toBe('50.0');
    });

    it('should return default value for invalid inputs', () => {
      expect(safeCalculateCTR(-1, 100)).toBe('0.0');
      expect(safeCalculateCTR(NaN, 100, 'N/A')).toBe('N/A');
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
      const previous = { impressions: 100, clicks: 50 }; // Missing users
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
      const current = null; // Invalid
      const result = safeAccumulateMetrics(previous, current);

      expect(result).toEqual(previous);
    });
  });
});
```

---

## 🎯 Validation Strategy Summary

### Layer 1: API Service
- Validate inputs before making requests
- Validate API responses before returning
- Catch malformed data early

### Layer 2: Redux State
- Validate data before storing in state
- Use safe functions in reducers
- Prevent corrupted state

### Layer 3: Components
- Validate props with PropTypes (optional)
- Use safe formatters for display
- Handle edge cases gracefully

### Layer 4: Utils
- All calculation functions validate inputs
- Provide both strict and safe versions
- Throw meaningful errors

---

## 📋 Best Practices

### DO:
✅ Validate at every boundary
✅ Throw specific ValidationError with field names
✅ Provide safe alternatives for non-critical paths
✅ Log validation failures for debugging
✅ Test edge cases (zero, negative, NaN, undefined)
✅ Validate business rules (clicks ≤ impressions)

### DON'T:
❌ Trust API responses without validation
❌ Use silent failures (always log errors)
❌ Skip validation in production
❌ Ignore TypeScript warnings (if using TS)
❌ Validate too late (validate early)

---

## 🧪 Test Coverage Goals

- **Validators**: 100% coverage
- **Calculations**: 100% coverage  
- **Formatters**: 100% coverage
- **Services**: 100% coverage (with validation)

Test every validation path, every error case, every edge case.

---

This validation strategy demonstrates senior-level thinking: defensive programming, comprehensive error handling, and production-ready code.
