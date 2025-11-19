import { init, track, type PlausibleEventOptions } from '@plausible-analytics/tracker'

const ANALYTICS_DOMAIN = 'ai-grab.nb.gl'
const ANALYTICS_ENDPOINT = 'https://ap.apppro.dev/api/event'
const ABOUT_SCREEN = 'about'

let initialized = false

const isBrowser = () => typeof window !== 'undefined'

const ensureInitialized = () => {
  if (initialized || !isBrowser()) {
    return initialized
  }

  try {
    init({
      domain: ANALYTICS_DOMAIN,
      endpoint: ANALYTICS_ENDPOINT,
      captureOnLocalhost: true,
    })
    initialized = true
  } catch (error) {
    console.warn('[analytics] failed to init Plausible tracker', error)
  }

  return initialized
}

const safeTrack = (eventName: string, options?: PlausibleEventOptions) => {
  if (!isBrowser()) return

  if (!initialized) {
    ensureInitialized()
  }

  try {
    const payload: PlausibleEventOptions = options ?? {}
    track(eventName, payload)
  } catch (error) {
    console.warn(`[analytics] failed to track event "${eventName}"`, error)
  }
}

export const trackAppLaunch = () => {
  safeTrack('app-launch')
}

export const trackStartScraping = () => {
  safeTrack('start-scraping')
}

export const trackOpenAbout = () => {
  safeTrack('open-about', { props: { screen: ABOUT_SCREEN } })
}

export const trackAboutLinkClick = (target: string) => {
  safeTrack('about-link-click', { props: { target } })
}

export const __resetAnalyticsForTests = () => {
  initialized = false
}
