/**
 * useAnalytics Hook
 * Hook para facilitar tracking de eventos em componentes
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics.service';

/**
 * Hook para tracking automático de pageviews
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView({
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}

/**
 * Hook para tracking de eventos
 */
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackSignup: analytics.trackSignup.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackTransactionCreated: analytics.trackTransactionCreated.bind(analytics),
    trackGoalCreated: analytics.trackGoalCreated.bind(analytics),
    trackExport: analytics.trackExport.bind(analytics),
    trackUpgrade: analytics.trackUpgrade.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
  };
}
