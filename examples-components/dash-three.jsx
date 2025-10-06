// src/pages/DashboardPage.jsx
// ✅ CLEANED UP - No unused variables

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

// Import from campaignsSlice
import {
  selectCampaignsById,
  selectAllCampaignIds,
  selectCampaignById,
} from "../store/slices/campaignsSlice";

// Import from dashboardSlice
import {
  selectDashboardData,
  selectTotals,
  selectRecent,
  loadMetrics,
  selectCampaign,
  pauseAutoRefresh,
  resumeAutoRefresh,
  resetCampaignData,
} from "../store/slices/dashboardSlice";

import MetricCard from "../components/MetricCard";
import SummaryCard from "../components/SummaryCard";

const DashboardPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ========================================
  // REFS - For setInterval (avoids stale closure)
  // ========================================

  const iterationRef = useRef(0);
  const isPausedRef = useRef(false);

  // ========================================
  // LOCAL STATE - Circuit breaker
  // ========================================

  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const MAX_FAILURES = 3;

  // ========================================
  // SELECTORS - Get data from Redux
  // ========================================

  // Campaign metadata
  const campaignsById = useSelector(selectCampaignsById);
  const campaignIds = useSelector(selectAllCampaignIds);
  const campaign = useSelector((state) =>
    selectCampaignById(state, parseInt(id, 10)),
  );

  // Dashboard data
  const dashboardData = useSelector(selectDashboardData);
  const totals = useSelector(selectTotals);
  const recent = useSelector(selectRecent);

  // Dashboard state
  const isAutoRefreshPaused = useSelector(
    (state) => state.dashboard.isAutoRefreshPaused,
  );
  const error = useSelector((state) => state.dashboard.error);

  // Extract iteration for display
  const iteration = dashboardData?.iteration ?? 0;

  // ========================================
  // CALCULATED VALUES
  // ========================================

  const totalCTR =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  const recentCTR =
    recent && recent.impressions > 0
      ? (recent.clicks / recent.impressions) * 100
      : 0;

  // ========================================
  // EFFECTS - Update refs when Redux changes
  // ========================================

  useEffect(() => {
    iterationRef.current = dashboardData?.iteration ?? 0;
  }, [dashboardData?.iteration]);

  useEffect(() => {
    isPausedRef.current = isAutoRefreshPaused;
  }, [isAutoRefreshPaused]);

  // ========================================
  // EFFECTS - Mount: Reset, select, fetch
  // ========================================

  useEffect(() => {
    const campaignId = parseInt(id, 10);

    if (isNaN(campaignId) || campaignId <= 0) {
      console.error("Invalid campaign ID");
      navigate("/");
      return;
    }

    // 1. Reset campaign data (iteration = 0)
    dispatch(resetCampaignData(campaignId));

    // 2. Select campaign
    dispatch(selectCampaign(campaignId));

    // 3. Fetch initial data
    dispatch(loadMetrics({ campaignId, iteration: 0 }));
  }, [id, dispatch, navigate]);

  // ========================================
  // EFFECTS - Auto-refresh interval
  // ========================================

  useEffect(() => {
    if (!campaign) return;

    const campaignId = parseInt(id, 10);

    const intervalId = setInterval(() => {
      if (!isPausedRef.current) {
        dispatch(
          loadMetrics({
            campaignId,
            iteration: iterationRef.current,
          }),
        );
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [campaign, id, dispatch]);

  // ========================================
  // EFFECTS - Circuit breaker
  // ========================================

  // Track failures
  useEffect(() => {
    if (error) {
      setConsecutiveFailures((prev) => prev + 1);
    } else {
      setConsecutiveFailures(0);
    }
  }, [error]);

  // Pause after 3 failures
  useEffect(() => {
    if (consecutiveFailures >= MAX_FAILURES && !isAutoRefreshPaused) {
      dispatch(pauseAutoRefresh());
    }
  }, [consecutiveFailures, isAutoRefreshPaused, dispatch]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleRetry = () => {
    setConsecutiveFailures(0);
    dispatch(resumeAutoRefresh());
  };

  const handleCampaignChange = (e) => {
    const newCampaignId = parseInt(e.target.value, 10);
    navigate(`/campaign/${newCampaignId}`);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  // ========================================
  // LOADING STATE
  // ========================================

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

  // ========================================
  // RENDER
  // ========================================

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
          {isAutoRefreshPaused ? (
            <span className="update-indicator paused">
              <span className="pause-icon">⏸</span>
              Paused
            </span>
          ) : (
            <span className="update-indicator">
              <span className="pulse"></span>
              Live
            </span>
          )}
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
              Unable to fetch latest data after multiple attempts.
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
          title="Current Number"
          value={`#${iteration}`}
          subtitle="Iteration/pull count"
        />
      </div>

      {/* Recent Metrics Section */}
      {recent && (
        <>
          <div className="section-header">Recent Metrics</div>
          <div className="metrics-grid">
            <MetricCard
              title="Most Recent Impressions"
              value={recent.impressions.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Most Recent Clicks"
              value={recent.clicks.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Most Recent Users"
              value={recent.users.toLocaleString()}
              subtitle="From last fetch"
            />
            <MetricCard
              title="Most Recent CTR"
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
