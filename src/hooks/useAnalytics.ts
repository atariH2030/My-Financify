/**
 * useAnalytics Hook
 * Hook para facilitar tracking de eventos em componentes
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import analytics from '../services/analytics.service';

/**
 * Hook para tracking de eventos
 */
export function useAnalytics() {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackGAEvent: analytics.trackGAEvent.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackSignup: analytics.trackSignup.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackTransactionCreated: analytics.trackTransactionCreated.bind(analytics),
    trackGoalCreated: analytics.trackGoalCreated.bind(analytics),
    trackExport: analytics.trackExport.bind(analytics),
    trackUpgrade: analytics.trackUpgrade.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
  };
}
