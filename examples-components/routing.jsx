// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import CampaignListPage from "./pages/CampaignListPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home - Campaign List */}
        <Route path={ROUTES.HOME} element={<CampaignListPage />} />

        {/* Campaign Dashboard - Dynamic ID */}
        <Route path={ROUTES.CAMPAIGN_DASHBOARD} element={<DashboardPage />} />

        {/* 404 - Redirect to Home */}
        <Route
          path={ROUTES.NOT_FOUND}
          element={<Navigate to={ROUTES.HOME} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
