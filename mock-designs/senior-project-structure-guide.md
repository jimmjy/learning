# Senior-Level Project Structure Guide
## Campaign Dashboard - Technical Evaluation

> **Note**: This structure demonstrates enterprise-level React architecture with Redux Toolkit, comprehensive testing, and scalable patterns suitable for a senior frontend role.

---

## 📁 Complete Project Structure

```
src/
├── main.jsx                    # Application entry point
├── App.jsx                     # Root component with router & providers
├── App.test.jsx                # App integration tests
├── index.css                   # Global styles/resets
│
├── pages/                      # Page-level route components
│   ├── CampaignListPage/
│   │   ├── CampaignListPage.jsx
│   │   ├── CampaignListPage.css
│   │   └── CampaignListPage.test.jsx
│   │
│   └── DashboardPage/
│       ├── DashboardPage.jsx
│       ├── DashboardPage.css
│       └── DashboardPage.test.jsx
│
├── components/                 # Reusable UI components
│   ├── layout/
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   └── Navbar.test.jsx
│   │   │
│   │   ├── ErrorBanner/
│   │   │   ├── ErrorBanner.jsx
│   │   │   ├── ErrorBanner.css
│   │   │   └── ErrorBanner.test.jsx
│   │   │
│   │   └── Toast/
│   │       ├── Toast.jsx
│   │       ├── Toast.css
│   │       └── Toast.test.jsx
│   │
│   ├── dashboard/
│   │   ├── MetricCard/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── MetricCard.css
│   │   │   └── MetricCard.test.jsx
│   │   │
│   │   ├── MetricsGrid/
│   │   │   ├── MetricsGrid.jsx
│   │   │   ├── MetricsGrid.css
│   │   │   └── MetricsGrid.test.jsx
│   │   │
│   │   └── DashboardHeader/
│   │       ├── DashboardHeader.jsx
│   │       ├── DashboardHeader.css
│   │       └── DashboardHeader.test.jsx
│   │
│   ├── campaigns/
│   │   ├── CampaignTable/
│   │   │   ├── CampaignTable.jsx
│   │   │   ├── CampaignTable.css
│   │   │   └── CampaignTable.test.jsx
│   │   │
│   │   ├── CampaignRow/
│   │   │   ├── CampaignRow.jsx
│   │   │   ├── CampaignRow.css
│   │   │   └── CampaignRow.test.jsx
│   │   │
│   │   └── CampaignSelector/
│   │       ├── CampaignSelector.jsx
│   │       ├── CampaignSelector.css
│   │       └── CampaignSelector.test.jsx
│   │
│   └── common/
│       ├── Loading/
│       │   ├── Loading.jsx
│       │   ├── Loading.css
│       │   └── Loading.test.jsx
│       │
│       ├── EmptyState/
│       │   ├── EmptyState.jsx
│       │   ├── EmptyState.css
│       │   └── EmptyState.test.jsx
│       │
│       └── Button/
│           ├── Button.jsx
│           ├── Button.css
│           └── Button.test.jsx
│
├── store/                      # Redux Toolkit store
│   ├── index.js                # Store configuration
│   ├── index.test.js           # Store setup tests
│   │
│   ├── slices/
│   │   ├── campaignSlice.js    # Campaign list state
│   │   ├── campaignSlice.test.js
│   │   ├── dashboardSlice.js   # Dashboard metrics state
│   │   └── dashboardSlice.test.js
│   │
│   └── middleware/
│       ├── apiMiddleware.js    # Custom API middleware (optional)
│       └── apiMiddleware.test.js
│
├── hooks/                      # Custom React hooks
│   ├── useCampaigns.js
│   ├── useCampaigns.test.js
│   ├── useCampaignData.js
│   ├── useCampaignData.test.js
│   ├── useAutoRefresh.js
│   └── useAutoRefresh.test.js
│
├── services/                   # API service layer
│   ├── api.js                  # Base API client
│   ├── api.test.js
│   ├── campaignService.js      # Campaign API calls
│   └── campaignService.test.js
│
├── utils/                      # Helper functions
│   ├── calculations.js         # CTR, accumulation logic
│   ├── calculations.test.js
│   ├── formatters.js           # Number/date formatting
│   ├── formatters.test.js
│   ├── constants.js            # App constants
│   └── validators.js           # Input validation
│
├── mocks/                      # MSW mocks (provided by test)
│   ├── browser.js
│   ├── node.js
│   ├── handlers.js
│   ├── campaign-list.js
│   └── campaign-data.js
│
├── test/                       # Test utilities
│   ├── vitest.setup.js         # Test configuration
│   ├── testUtils.jsx           # Custom render with providers
│   ├── mockData.js             # Test data fixtures
│   └── testHelpers.js          # Testing helper functions
│
└── assets/                     # Static assets
    └── react.svg
```

---

## 🏗️ Architecture Decisions

### Why Redux Toolkit for This Project?

**Technical reasons:**
1. **Demonstrates senior-level architecture** - Shows you can structure complex state
2. **Mentioned in job requirements** - Proves experience with Redux
3. **Scalability** - Shows forward thinking even if not needed now
4. **Professional patterns** - Slice pattern, async thunks, selectors

**What Redux manages:**
- Campaign list state (loading, data, errors)
- Dashboard metrics state (totals, recent, iteration count)
- Auto-refresh state (paused, retry count)
- Global error state

---

## 📦 Redux Store Structure

### Store Configuration

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from './slices/campaignSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    dashboard: dashboardReducer,
  },
  // Middleware for logging in development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow Date objects in state if needed
    }),
});

export default store;
```

### Campaign Slice

```javascript
// store/slices/campaignSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaignService';

// Async thunk for fetching campaigns
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

### Dashboard Slice

```javascript
// store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignService } from '../../services/campaignService';
import { accumulateMetrics, calculateCTR } from '../../utils/calculations';

// Async thunk for fetching dashboard data
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
    incrementRetryCount: (state) => {
      state.retryCount += 1;
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
        
        // Pause auto-refresh after 3 failures
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
  incrementRetryCount,
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

// Computed selectors
export const selectTotalCTR = (state) => {
  const { clicks, impressions } = state.dashboard.totals;
  return calculateCTR(clicks, impressions);
};

export const selectRecentCTR = (state) => {
  const { clicks, impressions } = state.dashboard.recent;
  return calculateCTR(clicks, impressions);
};
```

---

## 🧪 Testing Strategy

### Test Coverage Requirements (Senior Level)
- **Components**: 80%+ coverage
- **Hooks**: 100% coverage
- **Services**: 100% coverage
- **Utils**: 100% coverage
- **Redux Slices**: 100% coverage

### Testing Tools
- **Vitest**: Test runner (already configured)
- **React Testing Library**: Component tests
- **MSW**: API mocking (already configured)
- **@testing-library/user-event**: User interaction tests

---

## 📝 Example Test Files

### Component Test Example

```javascript
// components/dashboard/MetricCard/MetricCard.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  it('renders label and value correctly', () => {
    render(
      <MetricCard
        label="Total Impressions"
        value={1234}
        description="Sum of all impressions"
      />
    );

    expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Sum of all impressions')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    render(
      <MetricCard
        label="Total Clicks"
        error="Failed to load"
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('displays loading state with skeleton', () => {
    render(<MetricCard label="Total Users" loading />);

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('applies correct type class for styling', () => {
    const { container } = render(
      <MetricCard
        label="Total CTR"
        value={45.2}
        type="calculated"
      />
    );

    expect(container.firstChild).toHaveClass('metric-card', 'calculated');
  });

  it('formats percentage values correctly', () => {
    render(
      <MetricCard
        label="CTR"
        value={45.2}
        isPercentage
      />
    );

    expect(screen.getByText('45.2%')).toBeInTheDocument();
  });
});
```

### Redux Slice Test Example

```javascript
// store/slices/campaignSlice.test.js
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

  describe('fetchCampaigns async thunk', () => {
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

    it('selectCampaigns should return campaigns list', () => {
      expect(selectCampaigns(mockState)).toEqual(mockState.campaigns.list);
    });

    it('selectCampaignsLoading should return loading state', () => {
      expect(selectCampaignsLoading(mockState)).toBe(false);
    });

    it('selectCampaignsError should return error', () => {
      expect(selectCampaignsError(mockState)).toBeNull();
    });
  });
});
```

### Service Test Example

```javascript
// services/campaignService.test.js
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

    it('should throw error on network failure', async () => {
      server.use(
        http.get('/api/campaigns', () => {
          return HttpResponse.error();
        })
      );

      await expect(campaignService.getCampaigns()).rejects.toThrow();
    });
  });

  describe('getCampaignData', () => {
    it('should fetch campaign data with correct parameters', async () => {
      const mockData = {
        impressions: 100,
        clicks: 50,
        users: 75,
      };

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

    it('should handle 404 for invalid campaign ID', async () => {
      server.use(
        http.get('/api/campaigns/:id', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(
        campaignService.getCampaignData(999, 0)
      ).rejects.toThrow('Failed to fetch campaign data');
    });
  });
});
```

### Custom Hook Test Example

```javascript
// hooks/useCampaigns.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from '../store/slices/campaignSlice';
import { useCampaigns } from './useCampaigns';
import { server } from '../mocks/node';
import { http, HttpResponse } from 'msw';

// Helper to create test store
function createTestStore() {
  return configureStore({
    reducer: {
      campaigns: campaignReducer,
    },
  });
}

// Wrapper component with Redux Provider
function createWrapper(store) {
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useCampaigns', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should fetch campaigns on mount', async () => {
    const mockCampaigns = [
      { id: 1, name: 'Red Campaign' },
      { id: 2, name: 'Blue Campaign' },
    ];

    server.use(
      http.get('/api/campaigns', () => {
        return HttpResponse.json(mockCampaigns);
      })
    );

    const { result } = renderHook(() => useCampaigns(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaigns).toEqual(mockCampaigns);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    server.use(
      http.get('/api/campaigns', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useCampaigns(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.campaigns).toEqual([]);
  });

  it('should provide refetch function', async () => {
    const mockCampaigns = [{ id: 1, name: 'Test' }];

    server.use(
      http.get('/api/campaigns', () => {
        return HttpResponse.json(mockCampaigns);
      })
    );

    const { result } = renderHook(() => useCampaigns(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify refetch function exists
    expect(typeof result.current.refetch).toBe('function');

    // Call refetch
    result.current.refetch();

    expect(result.current.loading).toBe(true);
  });
});
```

### Utils Test Example

```javascript
// utils/calculations.test.js
import { describe, it, expect } from 'vitest';
import { calculateCTR, accumulateMetrics } from './calculations';

describe('calculations', () => {
  describe('calculateCTR', () => {
    it('should calculate CTR correctly', () => {
      expect(calculateCTR(50, 100)).toBe('50.0');
      expect(calculateCTR(25, 100)).toBe('25.0');
      expect(calculateCTR(33, 100)).toBe('33.0');
    });

    it('should return 0 when impressions is 0', () => {
      expect(calculateCTR(50, 0)).toBe('0.0');
    });

    it('should return 0 when clicks is 0', () => {
      expect(calculateCTR(0, 100)).toBe('0.0');
    });

    it('should handle decimal results', () => {
      expect(calculateCTR(1, 3)).toBe('33.3');
      expect(calculateCTR(2, 3)).toBe('66.7');
    });

    it('should round to 1 decimal place', () => {
      expect(calculateCTR(1, 6)).toBe('16.7');
      expect(calculateCTR(1, 7)).toBe('14.3');
    });
  });

  describe('accumulateMetrics', () => {
    it('should accumulate metrics correctly', () => {
      const previous = {
        impressions: 100,
        clicks: 50,
        users: 75,
      };

      const current = {
        impressions: 50,
        clicks: 25,
        users: 30,
      };

      const result = accumulateMetrics(previous, current);

      expect(result).toEqual({
        impressions: 150,
        clicks: 75,
        users: 105,
      });
    });

    it('should handle zero values', () => {
      const previous = {
        impressions: 0,
        clicks: 0,
        users: 0,
      };

      const current = {
        impressions: 100,
        clicks: 50,
        users: 75,
      };

      const result = accumulateMetrics(previous, current);

      expect(result).toEqual(current);
    });
  });
});
```

### Page Integration Test Example

```javascript
// pages/DashboardPage/DashboardPage.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from './DashboardPage';
import campaignReducer from '../../store/slices/campaignSlice';
import dashboardReducer from '../../store/slices/dashboardSlice';
import { server } from '../../mocks/node';
import { http, HttpResponse } from 'msw';

function createTestStore() {
  return configureStore({
    reducer: {
      campaigns: campaignReducer,
      dashboard: dashboardReducer,
    },
  });
}

function renderWithProviders(ui, { route = '/campaign/1' } = {}) {
  window.history.pushState({}, 'Test page', route);
  const store = createTestStore();

  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('should render dashboard with campaign data', async () => {
    const mockData = {
      impressions: 100,
      clicks: 50,
      users: 75,
    };

    server.use(
      http.get('/api/campaigns/:id', () => {
        return HttpResponse.json(mockData);
      })
    );

    renderWithProviders(<DashboardPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should display error banner on fetch failure', async () => {
    server.use(
      http.get('/api/campaigns/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should allow switching campaigns via dropdown', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/campaigns/:id', () => {
        return HttpResponse.json({ impressions: 100, clicks: 50, users: 75 });
      })
    );

    renderWithProviders(<DashboardPage />);

    const selector = await screen.findByRole('combobox');
    await user.selectOptions(selector, '2');

    // Should navigate to new campaign
    await waitFor(() => {
      expect(window.location.pathname).toBe('/campaign/2');
    });
  });

  it('should auto-refresh data every 5 seconds', async () => {
    vi.useFakeTimers();

    let callCount = 0;
    server.use(
      http.get('/api/campaigns/:id', () => {
        callCount++;
        return HttpResponse.json({
          impressions: 100 * callCount,
          clicks: 50 * callCount,
          users: 75 * callCount,
        });
      })
    );

    renderWithProviders(<DashboardPage />);

    // Initial load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);

    // Should have new data
    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
```

---

## 🔧 Implementation Examples

### Service Layer

```javascript
// services/api.js
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
    // Network error
    throw new ApiError('Network request failed', 0);
  }
}
```

```javascript
// services/campaignService.js
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

### Custom Hooks with Redux

```javascript
// hooks/useCampaigns.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampaigns,
  selectCampaigns,
  selectCampaignsLoading,
  selectCampaignsError,
} from '../store/slices/campaignSlice';

/**
 * Hook to fetch and manage campaign list
 * @returns {{
 *   campaigns: Array,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function
 * }}
 */
export function useCampaigns() {
  const dispatch = useDispatch();
  const campaigns = useSelector(selectCampaigns);
  const loading = useSelector(selectCampaignsLoading);
  const error = useSelector(selectCampaignsError);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const refetch = () => {
    dispatch(fetchCampaigns());
  };

  return {
    campaigns,
    loading,
    error,
    refetch,
  };
}
```

```javascript
// hooks/useCampaignData.js
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

/**
 * Hook to manage dashboard data with auto-refresh
 * @param {number} campaignId - Campaign ID to fetch data for
 * @returns {{
 *   totals: Object,
 *   recent: Object,
 *   totalCTR: string,
 *   recentCTR: string,
 *   iterationNumber: number,
 *   loading: boolean,
 *   error: string|null,
 *   autoRefreshPaused: boolean,
 *   retry: Function
 * }}
 */
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

  // Reset dashboard when campaign changes
  useEffect(() => {
    dispatch(resetDashboard());
    dispatch(setCampaignId(campaignId));
  }, [campaignId, dispatch]);

  // Fetch data function
  const fetchData = useCallback(() => {
    if (!autoRefreshPaused) {
      dispatch(fetchDashboardData({ campaignId, iterationNumber }));
    }
  }, [dispatch, campaignId, iterationNumber, autoRefreshPaused]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshPaused) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData, autoRefreshPaused]);

  // Manual retry function
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

### Utility Functions

```javascript
// utils/calculations.js

/**
 * Calculate Click-Through Rate
 * @param {number} clicks - Number of clicks
 * @param {number} impressions - Number of impressions
 * @returns {string} CTR as percentage with 1 decimal place
 */
export function calculateCTR(clicks, impressions) {
  if (impressions === 0) return '0.0';
  return ((clicks / impressions) * 100).toFixed(1);
}

/**
 * Accumulate metrics from previous and current data
 * @param {Object} previous - Previous totals
 * @param {Object} current - Current data
 * @returns {Object} Accumulated totals
 */
export function accumulateMetrics(previous, current) {
  return {
    impressions: previous.impressions + current.impressions,
    clicks: previous.clicks + current.clicks,
    users: previous.users + current.users,
  };
}
```

```javascript
// utils/formatters.js

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 * @param {string|number} value - Percentage value
 * @returns {string} Formatted percentage with % symbol
 */
export function formatPercentage(value) {
  return `${value}%`;
}

/**
 * Format timestamp to relative time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
}
```

```javascript
// utils/constants.js

export const REFRESH_INTERVAL = 5000; // 5 seconds
export const RETRY_DELAY = 10000; // 10 seconds
export const MAX_RETRIES = 3;

export const METRIC_TYPES = {
  TOTAL: 'total',
  RECENT: 'recent',
  CALCULATED: 'calculated',
  STATUS: 'status',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/campaign/:id',
};
```

---

## 📋 App.jsx Setup

```javascript
// App.jsx
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

## 🎯 Key Senior-Level Demonstrators

### 1. Architecture
- ✅ Proper separation of concerns (pages, components, services, state)
- ✅ Redux Toolkit with async thunks
- ✅ Selector pattern for derived state
- ✅ Service layer abstraction

### 2. Code Quality
- ✅ Comprehensive JSDoc comments
- ✅ TypeScript-style parameter documentation
- ✅ Error boundaries and error handling
- ✅ Consistent naming conventions

### 3. Testing
- ✅ 80%+ test coverage
- ✅ Unit tests for all utilities
- ✅ Component tests with React Testing Library
- ✅ Integration tests for pages
- ✅ Redux slice tests
- ✅ Custom hook tests

### 4. Performance
- ✅ Memoized selectors
- ✅ Proper cleanup in useEffect
- ✅ Optimized re-renders
- ✅ Efficient state updates

### 5. Best Practices
- ✅ async/await over promises
- ✅ Custom hooks for reusable logic
- ✅ Co-located component files
- ✅ Meaningful test descriptions
- ✅ Accessible components

---

## 📦 Package Installation

```bash
# Install Redux Toolkit
npm install @reduxjs/toolkit react-redux

# Install React Router
npm install react-router-dom

# Install testing utilities (if not already installed)
npm install -D @testing-library/user-event

# Optional: Install Redux DevTools (development only)
# Already included with Redux Toolkit
```

---

## 🚀 Development Workflow

1. **Start with structure**: Create folder structure
2. **Redux setup**: Configure store and slices
3. **Services layer**: Build API wrapper functions
4. **Utilities first**: Build and test calculation functions
5. **Build components**: Start with smallest reusable components
6. **Wire up pages**: Connect components with Redux
7. **Write tests as you go**: Don't wait until the end
8. **Integration testing**: Test full user flows

---

## 📊 Success Metrics

**For Senior-Level Evaluation:**
- [ ] All components have tests
- [ ] All hooks have tests
- [ ] All services have tests
- [ ] All utilities have tests
- [ ] Redux slices have comprehensive tests
- [ ] Test coverage > 80%
- [ ] Code is properly documented
- [ ] No console errors or warnings
- [ ] Proper error handling throughout
- [ ] Loading states implemented
- [ ] Auto-refresh works correctly
- [ ] Professional UI design
- [ ] Responsive design
- [ ] Accessible components

---

## 💡 Pro Tips

1. **Write tests first for utils** - TDD for pure functions
2. **Test Redux separately** - Don't always test through components
3. **Use data-testid sparingly** - Prefer accessible queries
4. **Mock at the service layer** - Not at the component level
5. **Test user behavior, not implementation** - Focus on what users do
6. **Keep tests readable** - Good test names are documentation
7. **Test edge cases** - Zero values, empty arrays, errors
8. **Use beforeEach for setup** - Keep tests DRY

---

This structure demonstrates enterprise-level React development suitable for a senior frontend role. The combination of Redux Toolkit, comprehensive testing, and clean architecture shows depth of knowledge and professional development practices.
