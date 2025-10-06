# Guide 04: Build Reusable Components

**Estimated Time:** 1-1.5 hours  
**When:** Tomorrow afternoon - After Guide 03  
**Prerequisites:** Guide 03 completed (Redux store ready)

---

## 🎯 Goal

Build three reusable components that will be used across pages:
1. **MetricCard** - Display individual metrics in tiles
2. **ErrorBanner** - Show error states with retry option
3. **Layout** - Navbar with navigation and campaign switcher

**Why components first?** Pages will compose these together. Build bottom-up.

---

## 📝 Step 1: Create MetricCard Component

**File:** `src/components/MetricCard.jsx`

```javascript
import { memo } from 'react';

/**
 * MetricCard - Reusable tile for displaying metrics
 * 
 * Used for all 9 dashboard tiles (totals + recent)
 * Handles loading state internally
 * 
 * Performance: Memoized to prevent unnecessary re-renders
 */
const MetricCard = memo(({ title, value, subtitle, isLoading = false }) => {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      
      <div className="metric-value">
        {isLoading ? (
          <span className="loading-spinner">Loading...</span>
        ) : (
          value
        )}
      </div>
      
      {subtitle && (
        <div className="metric-subtitle">{subtitle}</div>
      )}
    </div>
  );
});

// Display name for React DevTools
MetricCard.displayName = 'MetricCard';

export default MetricCard;
```

**Usage examples:**
```jsx
// Total metric
<MetricCard 
  title="Total Impressions" 
  value="1,234" 
  isLoading={isLoading} 
/>

// CTR with formula subtitle
<MetricCard 
  title="Total CTR" 
  value="5.00%" 
  subtitle="(Total Clicks / Total Impressions) × 100"
/>

// Recent metric (no subtitle)
<MetricCard 
  title="Recent Clicks" 
  value="42" 
/>
```

---

## 📝 Step 2: Create MetricCard Tests

**File:** `src/components/MetricCard.test.jsx`

```javascript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  test('renders title and value correctly', () => {
    render(<MetricCard title="Total Impressions" value="1,234" />);
    
    expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  test('shows loading state when isLoading prop is true', () => {
    render(
      <MetricCard 
        title="Total Clicks" 
        value="567" 
        isLoading={true} 
      />
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('567')).not.toBeInTheDocument();
  });

  test('renders subtitle when provided', () => {
    render(
      <MetricCard 
        title="Total CTR" 
        value="5.00%" 
        subtitle="(Total Clicks / Total Impressions) × 100"
      />
    );
    
    expect(screen.getByText(/total clicks \/ total impressions/i)).toBeInTheDocument();
  });

  test('does not render subtitle when not provided', () => {
    const { container } = render(
      <MetricCard title="Total Users" value="890" />
    );
    
    expect(container.querySelector('.metric-subtitle')).toBeNull();
  });

  test('handles empty string value', () => {
    render(<MetricCard title="Test" value="" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    // Empty value should render but be empty
    const valueElement = screen.getByText('Test').parentElement.querySelector('.metric-value');
    expect(valueElement).toBeInTheDocument();
  });

  test('handles zero value', () => {
    render(<MetricCard title="Total Clicks" value={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('handles formatted numbers', () => {
    render(<MetricCard title="Total Impressions" value="1,234,567" />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  test('handles percentage values', () => {
    render(<MetricCard title="CTR" value="5.42%" />);
    
    expect(screen.getByText('5.42%')).toBeInTheDocument();
  });
});
```

**Run tests:**
```bash
npm test MetricCard
```

---

## 📝 Step 3: Create ErrorBanner Component

**File:** `src/components/ErrorBanner.jsx`

```javascript
import { memo } from 'react';

/**
 * ErrorBanner - Display error states and provide retry functionality
 * 
 * Two states:
 * 1. Transient error (retrying automatically) - shows "connection issue"
 * 2. Auto-refresh paused (circuit breaker) - shows "paused" with retry button
 * 
 * Senior thinking: Keep showing last good data, don't clear the screen
 * Performance: Memoized to prevent unnecessary re-renders
 */
const ErrorBanner = memo(({ 
  error, 
  isAutoRefreshPaused, 
  lastSuccessfulFetch, 
  onRetry 
}) => {
  // Don't render if no error
  if (!error && !isAutoRefreshPaused) {
    return null;
  }
  
  /**
   * Format time since last update for user-friendly display
   */
  const getTimeSince = (timestamp) => {
    if (!timestamp) return null;
    
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <div className="error-banner">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        
        {isAutoRefreshPaused ? (
          // Circuit breaker triggered - manual retry needed
          <>
            <span className="error-message">
              Auto-refresh paused due to connection issues
            </span>
            
            {lastSuccessfulFetch && (
              <span className="error-meta">
                Last updated {getTimeSince(lastSuccessfulFetch)}
              </span>
            )}
            
            <button onClick={onRetry} className="retry-button">
              Retry Now
            </button>
          </>
        ) : error ? (
          // Transient error - retrying automatically
          <>
            <span className="error-message">
              Connection issue - retrying automatically...
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
});

// Display name for React DevTools
ErrorBanner.displayName = 'ErrorBanner';

export default ErrorBanner;
```

---

## 📝 Step 4: Create ErrorBanner Tests

**File:** `src/components/ErrorBanner.test.jsx`

```javascript
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  test('does not render when no error and not paused', () => {
    const { container } = render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={false}
        lastSuccessfulFetch={null}
        onRetry={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('shows retry message when auto-refresh is paused', () => {
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch="2025-10-02T10:00:00Z"
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/auto-refresh paused/i)).toBeInTheDocument();
    expect(screen.getByText(/connection issues/i)).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
  });

  test('shows connection issue message when error exists but not paused', () => {
    render(
      <ErrorBanner 
        error="Network error"
        isAutoRefreshPaused={false}
        lastSuccessfulFetch={null}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/connection issue/i)).toBeInTheDocument();
    expect(screen.getByText(/retrying automatically/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument(); // No retry button
  });

  test('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch="2025-10-02T10:00:00Z"
        onRetry={onRetry}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /retry now/i });
    await user.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledOnce();
  });

  test('formats time since last update - seconds', () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch={thirtySecondsAgo}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/30 seconds ago/i)).toBeInTheDocument();
  });

  test('formats time since last update - one second', () => {
    const oneSecondAgo = new Date(Date.now() - 1 * 1000).toISOString();
    
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch={oneSecondAgo}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/1 second ago/i)).toBeInTheDocument();
  });

  test('formats time since last update - minutes', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch={twoMinutesAgo}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/2 minutes ago/i)).toBeInTheDocument();
  });

  test('formats time since last update - one minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch={oneMinuteAgo}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/1 minute ago/i)).toBeInTheDocument();
  });

  test('handles null lastSuccessfulFetch gracefully', () => {
    render(
      <ErrorBanner 
        error={null}
        isAutoRefreshPaused={true}
        lastSuccessfulFetch={null}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText(/auto-refresh paused/i)).toBeInTheDocument();
    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
  });

  test('shows warning icon', () => {
    render(
      <ErrorBanner 
        error="Network error"
        autoRefreshPaused={false}
        lastSuccessfulFetch={null}
        onRetry={() => {}}
      />
    );
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
```

**Run tests:**
```bash
npm test ErrorBanner
```

---

## 📝 Step 5: Create Layout Component

**File:** `src/components/Layout.jsx`

```javascript
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCampaignList } from '../store/campaignsSlice';

/**
 * Layout - Main application wrapper with navigation
 * 
 * Features:
 * - Always shows navbar with app title
 * - On dashboard: shows "Back to Campaigns" button + campaign switcher
 * - Campaign switcher allows quick switching without full page reload
 * 
 * Senior thinking: Never have dead-end flows, always provide navigation
 */
const Layout = ({ children }) => {
  const campaigns = useSelector(selectCampaignList);
  const navigate = useNavigate();
  const { id } = useParams(); // Campaign ID from URL (if on dashboard)
  
  const handleCampaignChange = (e) => {
    const campaignId = e.target.value;
    if (campaignId) {
      navigate(`/campaign/${campaignId}`);
    }
  };
  
  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-left">
          <h1>Campaign Dashboard</h1>
        </div>
        
        <div className="navbar-right">
          {id && (
            <>
              <Link to="/" className="back-button">
                ← Back to Campaigns
              </Link>
              
              <select 
                value={id} 
                onChange={handleCampaignChange}
                className="campaign-selector"
                aria-label="Switch campaign"
              >
                <option value="">Switch Campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
```

---

## 📝 Step 6: Create Layout Tests

**File:** `src/components/Layout.test.jsx`

```javascript
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Layout from './Layout';
import campaignsReducer from '../store/campaignsSlice';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      campaigns: campaignsReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Layout', () => {
  test('renders children correctly', () => {
    const store = createMockStore({
      campaigns: { list: [], selectedCampaignId: null },
    });
    
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      store
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('shows app title in navbar', () => {
    const store = createMockStore({
      campaigns: { list: [], selectedCampaignId: null },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    expect(screen.getByText('Campaign Dashboard')).toBeInTheDocument();
  });

  test('shows back button and campaign selector when on dashboard', () => {
    const store = createMockStore({
      campaigns: {
        list: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
        selectedCampaignId: 1,
      },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    expect(screen.getByText(/back to campaigns/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('campaign selector contains all campaigns', () => {
    const store = createMockStore({
      campaigns: {
        list: [
          { id: 1, name: 'Red Campaign' },
          { id: 2, name: 'Blue Campaign' },
          { id: 3, name: 'Green Campaign' },
        ],
        selectedCampaignId: 1,
      },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    const selector = screen.getByRole('combobox');
    expect(selector).toHaveTextContent('Red Campaign');
    expect(selector).toHaveTextContent('Blue Campaign');
    expect(selector).toHaveTextContent('Green Campaign');
  });

  test('campaign selector navigates on change', async () => {
    const user = userEvent.setup();
    const store = createMockStore({
      campaigns: {
        list: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
        selectedCampaignId: 1,
      },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    const selector = screen.getByRole('combobox');
    await user.selectOptions(selector, '2');
    
    expect(mockNavigate).toHaveBeenCalledWith('/campaign/2');
  });

  test('campaign selector shows current selection', () => {
    const store = createMockStore({
      campaigns: {
        list: [
          { id: 1, name: 'Red' },
          { id: 2, name: 'Blue' },
        ],
        selectedCampaignId: 1,
      },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    const selector = screen.getByRole('combobox');
    expect(selector).toHaveValue('1');
  });

  test('back button links to home', () => {
    const store = createMockStore({
      campaigns: {
        list: [{ id: 1, name: 'Red' }],
        selectedCampaignId: 1,
      },
    });
    
    renderWithProviders(<Layout><div /></Layout>, store);
    
    const backButton = screen.getByText(/back to campaigns/i);
    expect(backButton).toHaveAttribute('href', '/');
  });
});
```

**Run tests:**
```bash
npm test Layout
```

---

## ✅ Verification Checklist

Before moving to Guide 05:

- [ ] `MetricCard.jsx` created and styled
- [ ] `MetricCard.test.jsx` passes all tests
- [ ] `ErrorBanner.jsx` created with retry logic
- [ ] `ErrorBanner.test.jsx` passes all tests
- [ ] `Layout.jsx` created with navigation
- [ ] `Layout.test.jsx` passes all tests
- [ ] Run `npm test` - all component tests pass

---

## 🎯 What You've Built

After completing this guide:

✅ **Reusable MetricCard** for all 9 dashboard tiles  
✅ **Smart ErrorBanner** with user-friendly messages  
✅ **Navigation Layout** with back button + switcher  
✅ **Comprehensive tests** for all components  

**These are your building blocks!** Pages will compose these into full screens.

---

## 🚀 Next Steps

**Move to Guide 05:** Page Components  
Now you'll build the two main pages using these components!

---

**Estimated Completion Time:** 60-90 minutes  
**Test Coverage So Far:** ~65% (Services + Redux + Components)
