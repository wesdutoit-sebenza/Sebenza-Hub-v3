declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackPageView(path?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    const pagePath = path || window.location.pathname;
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export const analytics = {
  signup: {
    started: (params?: EventParams) => trackEvent('signup_started', params),
    completed: (params?: EventParams) => trackEvent('signup_completed', params),
  },
  
  login: {
    success: (params?: EventParams) => trackEvent('login_success', params),
    returningUser: (params?: EventParams) => trackEvent('returning_user_logged_in', params),
  },
  
  profile: {
    started: (params?: EventParams) => trackEvent('profile_started', params),
    completed: (params?: EventParams) => trackEvent('profile_completed', params),
    updated: (params?: EventParams) => trackEvent('profile_updated', params),
    abandoned: (params?: EventParams) => trackEvent('profile_abandoned', params),
  },
  
  cv: {
    uploaded: (params?: EventParams) => trackEvent('cv_uploaded', params),
    parsed: (params?: EventParams) => trackEvent('cv_parsed', params),
    replaced: (params?: EventParams) => trackEvent('cv_replaced', params),
  },
  
  test: {
    started: (params?: EventParams) => trackEvent('test_started', params),
    completed: (params?: EventParams) => trackEvent('test_completed', params),
  },
  
  recruiter: {
    signup: (params?: EventParams) => trackEvent('recruiter_signup', params),
  },
  
  jobPost: {
    started: (params?: EventParams) => trackEvent('job_post_started', params),
    created: (params?: EventParams) => trackEvent('job_post_created', params),
    updated: (params?: EventParams) => trackEvent('job_post_updated', params),
    deleted: (params?: EventParams) => trackEvent('job_post_deleted', params),
    previewed: (params?: EventParams) => trackEvent('job_post_previewed', params),
    abandoned: (params?: EventParams) => trackEvent('job_post_abandoned', params),
  },
  
  job: {
    viewed: (params?: EventParams) => trackEvent('job_viewed', params),
    saved: (params?: EventParams) => trackEvent('job_saved', params),
    shared: (params?: EventParams) => trackEvent('job_shared', params),
    clickedInSearch: (params?: EventParams) => trackEvent('job_clicked_in_search', params),
  },
  
  candidate: {
    viewed: (params?: EventParams) => trackEvent('candidate_viewed', params),
    shortlisted: (params?: EventParams) => trackEvent('candidate_shortlisted', params),
    rejected: (params?: EventParams) => trackEvent('candidate_rejected', params),
  },
  
  application: {
    started: (params?: EventParams) => trackEvent('apply_started', params),
    completed: (params?: EventParams) => trackEvent('apply_completed', params),
    failed: (params?: EventParams) => trackEvent('apply_failed', params),
    statusChanged: (params?: EventParams) => trackEvent('application_status_changed', params),
  },
  
  search: {
    performed: (params?: EventParams) => trackEvent('search_performed', params),
    noResults: (params?: EventParams) => trackEvent('search_no_results', params),
    filtersApplied: (params?: EventParams) => trackEvent('filters_applied', params),
    filterRemoved: (params?: EventParams) => trackEvent('job_filter_removed', params),
    filterTabOpened: (params?: EventParams) => trackEvent('search_filter_tab_opened', params),
  },
  
  navigation: {
    pageView: (path?: string) => trackPageView(path),
    dashboardLoaded: (params?: EventParams) => trackEvent('dashboard_loaded', params),
    dashboardTimeSpent: (params?: EventParams) => trackEvent('dashboard_time_spent', params),
    navClicked: (params?: EventParams) => trackEvent('nav_clicked', params),
    paginationClicked: (params?: EventParams) => trackEvent('pagination_clicked', params),
  },
  
  billing: {
    pageOpened: (params?: EventParams) => trackEvent('billing_page_opened', params),
    pricingPageViewed: (params?: EventParams) => trackEvent('pricing_page_viewed', params),
    infoEntered: (params?: EventParams) => trackEvent('billing_info_entered', params),
  },
  
  subscription: {
    started: (params?: EventParams) => trackEvent('subscription_started', params),
    completed: (params?: EventParams) => trackEvent('subscription_completed', params),
    failed: (params?: EventParams) => trackEvent('subscription_failed', params),
  },
  
  ai: {
    matchGenerated: (params?: EventParams) => trackEvent('ai_match_generated', params),
    cvParseFailed: (params?: EventParams) => trackEvent('ai_cv_parse_failed', params),
  },
  
  system: {
    webhookFailed: (params?: EventParams) => trackEvent('webhook_failed', params),
  },
  
  document: {
    uploaded: (params?: EventParams) => trackEvent('document_uploaded', params),
    approved: (params?: EventParams) => trackEvent('document_approved', params),
  },
};

export const GA_EVENTS = [
  "page_view",
  "signup_started",
  "signup_completed",
  "login_success",
  "returning_user_logged_in",
  "profile_started",
  "profile_completed",
  "profile_updated",
  "profile_abandoned",
  "cv_uploaded",
  "cv_parsed",
  "cv_replaced",
  "test_started",
  "test_completed",
  "recruiter_signup",
  "job_post_started",
  "job_post_created",
  "job_post_updated",
  "job_post_deleted",
  "job_post_previewed",
  "job_post_abandoned",
  "candidate_viewed",
  "candidate_shortlisted",
  "candidate_rejected",
  "job_viewed",
  "job_saved",
  "job_shared",
  "job_clicked_in_search",
  "apply_started",
  "apply_completed",
  "apply_failed",
  "application_status_changed",
  "search_performed",
  "search_no_results",
  "filters_applied",
  "job_filter_removed",
  "search_filter_tab_opened",
  "dashboard_loaded",
  "dashboard_time_spent",
  "nav_clicked",
  "pagination_clicked",
  "billing_page_opened",
  "pricing_page_viewed",
  "billing_info_entered",
  "subscription_started",
  "subscription_completed",
  "subscription_failed",
  "ai_match_generated",
  "ai_cv_parse_failed",
  "webhook_failed",
  "document_uploaded",
  "document_approved"
] as const;

export function registerAllEvents(): void {
  if (typeof window !== 'undefined' && window.gtag) {
    GA_EVENTS.forEach((eventName) => {
      window.gtag('event', eventName, { seed: true });
    });
    console.log(`All ${GA_EVENTS.length} GA events fired to register.`);
  }
}
