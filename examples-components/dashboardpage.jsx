// src/pages/DashboardPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

// Import from BOTH slices
import {
  selectCampaignsById,
  selectAllCampaignIds,
  selectCampaignById,
} from "../store/slices/campaignsSlice";

import {
  selectDashboardData,
  selectDashboardError,
  selectIsAutoRefreshPaused,
  selectIsCurrentCampaignActive,
  loadMetrics,
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh,
} from "../store/slices/dashboardSlice";

import MetricCard from "../components/MetricCard";
import SummaryCard from "../components/SummaryCard";

const DashboardPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const MAX_FAILURES = 3;

  // Get campaign metadata from campaignsSlice
  const campaignsById = useSelector(selectCampaignsById);
  const campaignIds = useSelector(selectAllCampaignIds);
  const campaign = useSelector((state) =>
    selectCampaignById(state, parseInt(id, 10)),
  );

  // Get dashboard data from dashboardSlice
  const dashboardData = useSelector(selectDashboardData);
  const error = useSelector(selectDashboardError);
  const isAutoRefreshPaused = useSelector(selectIsAutoRefreshPaused);
  const isActive = useSelector(selectIsCurrentCampaignActive);

  // Extract data from dashboardData (it's all already there!)
  const totals = dashboardData?.totals || {
    impressions: 0,
    clicks: 0,
    users: 0,
  };
  const recent = dashboardData?.recent || null;
  const iteration = dashboardData?.iteration || 0;
  const lastFetch = dashboardData?.lastFetch || null;

  // Calculate CTR in component (simple math, no need for selector)
  const totalCTR =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  const recentCTR =
    recent && recent.impressions > 0
      ? (recent.clicks / recent.impressions) * 100
      : 0;

  // Select campaign on mount or when ID changes
  useEffect(() => {
    const campaignId = parseInt(id, 10);

    // Validate campaign ID
    if (isNaN(campaignId) || campaignId <= 0) {
      console.error("Invalid campaign ID");
      navigate("/");
      return;
    }

    // Select this campaign in Redux
    // This will:
    // 1. Pause the old campaign's auto-refresh
    // 2. Set this as the selected campaign
    // 3. Activate this campaign's auto-refresh
    // 4. Create dashboard data entry if doesn't exist (but keep if exists!)
    dispatch(selectCampaign(campaignId));

    return () => {
      isMounted.current = false;
    };
  }, [id, dispatch, navigate]);

  // Initial data fetch when dashboard data becomes available
  useEffect(() => {
    if (!campaign || !dashboardData) return;

    const campaignId = parseInt(id, 10);

    // Fetch initial data (or next iteration if resuming)
    dispatch(
      loadMetrics({
        campaignId,
        iteration: dashboardData.iteration,
      }),
    );
  }, [campaign, dashboardData?.iteration, dispatch, id]);

  // Auto-refresh interval
  useEffect(() => {
    if (!campaign || !dashboardData || isAutoRefreshPaused) {
      return;
    }

    const campaignId = parseInt(id, 10);

    const intervalId = setInterval(() => {
      if (!isMounted.current) return;

      // Double-check campaign is still active before fetching
      // (could have been paused by switching campaigns)
      const state = window.store?.getState(); // this is wrong and weird
      const stillActive = state?.dashboard?.activeRequests?.[campaignId];

      if (stillActive) {
        dispatch(
          loadMetrics({
            campaignId,
            iteration: dashboardData.iteration,
          }),
        );
      }
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [campaign, dashboardData, isAutoRefreshPaused, id, dispatch]);

  // Track consecutive failures for circuit breaker
  useEffect(() => {
    if (error) {
      setConsecutiveFailures((prev) => prev + 1);
    } else {
      setConsecutiveFailures(0);
    }
  }, [error]);

  // Circuit breaker: Pause after 3 consecutive failures
  useEffect(() => {
    if (consecutiveFailures >= MAX_FAILURES && !isAutoRefreshPaused) {
      dispatch(pauseAutoRefresh());
    }
  }, [consecutiveFailures, isAutoRefreshPaused, dispatch]);

  // Handle retry button
  const handleRetry = () => {
    setConsecutiveFailures(0);
    dispatch(resumeAutoRefresh());
  };

  // Handle campaign switch from dropdown
  const handleCampaignChange = (e) => {
    const newCampaignId = parseInt(e.target.value, 10);
    navigate(`/campaign/${newCampaignId}`);
  };

  // Handle back button
  const handleBackClick = () => {
    navigate("/");
  };

  // Format last updated time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Never";
    const seconds = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000,
    );
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  };

  // Loading state (initial load)
  if (!campaign || !dashboardData) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-title">Campaign Dashboard</div>
        </div>
        <div className="navbar-right">
          <button className="back-button" onClick={handleBackClick}>
            <span className="back-arrow">←</span>
            <span>Back to Campaigns</span>
          </button>
          <span className="divider">|</span>
          <span className="selector-label">Switch Campaign:</span>
          <select
            className="campaign-selector"
            value={id}
            onChange={handleCampaignChange}
          >
            {campaignIds.map((campaignId) => {
              const c = campaignsById[campaignId];
              return (
                <option key={campaignId} value={campaignId}>
                  {c.name}
                </option>
              );
            })}
          </select>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">{campaign.name}</h1>
        <div className="dashboard-subtitle">
          {!isAutoRefreshPaused && (
            <span className="update-indicator">
              <span className="pulse"></span>
              Auto-refreshing
            </span>
          )}
          {isAutoRefreshPaused && (
            <span className="update-indicator paused">
              <span className="pause-icon">⏸</span>
              Paused
            </span>
          )}
          <span>•</span>
          <span>Last updated: {getTimeAgo(lastFetch)}</span>
        </div>
      </div>

      {/* Error Banner - Transient (< 3 failures) */}
      {error && !isAutoRefreshPaused && (
        <div className="error-banner warning">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Connection Issue</div>
            <div className="error-message">
              {error} - Retrying automatically...
            </div>
          </div>
        </div>
      )}

      {/* Error Banner - Persistent (>= 3 failures) */}
      {error && isAutoRefreshPaused && (
        <div className="error-banner danger">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Auto-refresh Paused</div>
            <div className="error-message">
              Unable to fetch latest data after multiple attempts. Last updated:{" "}
              {getTimeAgo(lastFetch)}
            </div>
          </div>
          <button className="retry-button" onClick={handleRetry}>
            Retry Now
          </button>
        </div>
      )}

      {/* Summary Card */}
      <SummaryCard
        impressions={totals.impressions}
        ctr={totalCTR}
        clicks={totals.clicks}
      />

      {/* Total Metrics Section */}
      <div className="section-header">Total Metrics</div>
      <div className="metrics-grid">
        <MetricCard
          title="Total Impressions"
          value={totals.impressions.toLocaleString()}
          subtitle="Sum of all impressions"
        />
        <MetricCard
          title="Total Clicks"
          value={totals.clicks.toLocaleString()}
          subtitle="Sum of all clicks"
        />
        <MetricCard
          title="Total Users"
          value={totals.users.toLocaleString()}
          subtitle="Sum of all users"
        />
        <MetricCard
          title="Total CTR"
          value={`${totalCTR.toFixed(2)}%`}
          subtitle="Click-through rate"
        />
        <MetricCard
          title="Current Iteration"
          value={`#${iteration}`}
          subtitle="API call count"
        />
      </div>

      {/* Recent Metrics Section */}
      {recent && (
        <>
          <div className="section-header">Recent Metrics</div>
          <div className="metrics-grid">
            <MetricCard
              title="Recent Impressions"
              value={recent.impressions.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent Clicks"
              value={recent.clicks.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent Users"
              value={recent.users.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Recent CTR"
              value={`${recentCTR.toFixed(2)}%`}
              subtitle="Latest performance"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

// url structure
http://localhost:5173/                → CampaignListPage
http://localhost:5173/campaign/1      → DashboardPage (campaign #1)
http://localhost:5173/campaign/2      → DashboardPage (campaign #2)
http://localhost:5173/anything-else   → Redirect to home
