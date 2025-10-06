// src/constants/routes.js

/**
 * Application route constants
 * Centralizing routes prevents typos and makes changes easier
 */

export const ROUTES = {
  HOME: "/",
  CAMPAIGN_DASHBOARD: "/campaign/:id",
  NOT_FOUND: "*",
};

/**
 * Generate campaign dashboard route
 */
export const getCampaignDashboardRoute = (campaignId) => {
  return `/campaign/${campaignId}`;
};
