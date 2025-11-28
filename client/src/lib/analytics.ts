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

export const analytics = {
  signup: {
    started: (params?: EventParams) => trackEvent('signup_started', params),
    completed: (params?: EventParams) => trackEvent('signup_completed', params),
  },
  
  login: {
    success: (params?: EventParams) => trackEvent('login_success', params),
  },
  
  profile: {
    started: (params?: EventParams) => trackEvent('profile_started', params),
    completed: (params?: EventParams) => trackEvent('profile_completed', params),
    updated: (params?: EventParams) => trackEvent('profile_updated', params),
  },
  
  cv: {
    uploaded: (params?: EventParams) => trackEvent('cv_uploaded', params),
    parsed: (params?: EventParams) => trackEvent('cv_parsed', params),
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
  },
  
  job: {
    viewed: (params?: EventParams) => trackEvent('job_viewed', params),
    saved: (params?: EventParams) => trackEvent('job_saved', params),
    shared: (params?: EventParams) => trackEvent('job_shared', params),
  },
  
  candidate: {
    viewed: (params?: EventParams) => trackEvent('candidate_viewed', params),
  },
  
  application: {
    started: (params?: EventParams) => trackEvent('apply_started', params),
    completed: (params?: EventParams) => trackEvent('apply_completed', params),
    failed: (params?: EventParams) => trackEvent('apply_failed', params),
    statusChanged: (params?: EventParams) => trackEvent('application_status_changed', params),
  },
  
  search: {
    performed: (params?: EventParams) => trackEvent('search_performed', params),
    filtersApplied: (params?: EventParams) => trackEvent('filters_applied', params),
  },
  
  navigation: {
    dashboardLoaded: (params?: EventParams) => trackEvent('dashboard_loaded', params),
    navClicked: (params?: EventParams) => trackEvent('nav_clicked', params),
  },
  
  billing: {
    pageOpened: (params?: EventParams) => trackEvent('billing_page_opened', params),
  },
  
  subscription: {
    started: (params?: EventParams) => trackEvent('subscription_started', params),
    completed: (params?: EventParams) => trackEvent('subscription_completed', params),
    failed: (params?: EventParams) => trackEvent('subscription_failed', params),
  },
};

export const GA_EVENTS = [
  "signup_started",
  "signup_completed",
  "login_success",
  "profile_started",
  "profile_completed",
  "cv_uploaded",
  "cv_parsed",
  "test_started",
  "test_completed",
  "profile_updated",
  "recruiter_signup",
  "job_post_started",
  "job_post_created",
  "job_post_updated",
  "job_post_deleted",
  "candidate_viewed",
  "job_viewed",
  "job_saved",
  "job_shared",
  "apply_started",
  "apply_completed",
  "apply_failed",
  "application_status_changed",
  "search_performed",
  "filters_applied",
  "dashboard_loaded",
  "nav_clicked",
  "billing_page_opened",
  "subscription_started",
  "subscription_completed",
  "subscription_failed"
] as const;

export function registerAllEvents(): void {
  if (typeof window !== 'undefined' && window.gtag) {
    GA_EVENTS.forEach((eventName) => {
      window.gtag('event', eventName, { seed: true });
    });
    console.log('All GA events fired to register.');
  }
}
