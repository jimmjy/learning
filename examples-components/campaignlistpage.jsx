// src/pages/CampaignListPage.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCampaignsById,
  selectAllCampaignIds,
  selectCampaignsLoading,
  selectCampaignsError,
  loadCampaigns,
} from "../store/slices/campaignsSlice";

const CampaignListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux (campaignsSlice only)
  const campaignsById = useSelector(selectCampaignsById);
  const campaignIds = useSelector(selectAllCampaignIds);
  const isLoading = useSelector(selectCampaignsLoading);
  const error = useSelector(selectCampaignsError);

  // Load campaigns on mount
  useEffect(() => {
    dispatch(loadCampaigns());
  }, [dispatch]);

  // Handle campaign click
  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Handle retry
  const handleRetry = () => {
    dispatch(loadCampaigns());
  };

  // Loading state
  if (isLoading && campaignIds.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Error state (full-page error)
  if (error && campaignIds.length === 0) {
    return (
      <div className="page-container">
        <div className="error-state-card">
          <div className="error-state-icon">⚠️</div>
          <div className="error-state-title">Failed to Load Campaigns</div>
          <div className="error-state-description">
            We couldn't load your campaigns. This might be a temporary
            connection issue.
          </div>
          <button className="retry-button" onClick={handleRetry}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state - show campaign grid
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campaign Dashboard</h1>
        <p className="page-subtitle">
          Select a campaign to view detailed metrics
        </p>
      </div>

      {/* Show error banner if error but we have cached campaigns */}
      {error && campaignIds.length > 0 && (
        <div className="error-banner warning">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-title">Update Failed</div>
            <div className="error-message">
              Couldn't refresh campaign list. Showing cached data.
            </div>
          </div>
          <button className="retry-button-small" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      <div className="campaigns-grid">
        {campaignIds.map((id) => {
          const campaign = campaignsById[id];
          return (
            <div
              key={id}
              className="campaign-card"
              onClick={() => handleCampaignClick(id)}
            >
              <div className="campaign-id">#{campaign.id}</div>
              <div className="campaign-name">{campaign.name}</div>
              <div className="campaign-status">Active</div>
              <div className="campaign-arrow">→</div>
            </div>
          );
        })}
      </div>

      {campaignIds.length === 0 && !isLoading && !error && (
        <div className="empty-state">
          <p>No campaigns available</p>
        </div>
      )}
    </div>
  );
};

export default CampaignListPage;
