import { beforeEach, describe, expect, it, vi } from 'vitest'

import { init, track } from '@plausible-analytics/tracker'
import {
  __resetAnalyticsForTests,
  trackAboutLinkClick,
  trackAppLaunch,
  trackOpenAbout,
  trackStartScraping,
} from '@/lib/analytics'
import { appMeta } from '@/lib/meta'

const mockedInit = vi.mocked(init)
const mockedTrack = vi.mocked(track)

describe('analytics helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetAnalyticsForTests()
    ;(globalThis as any).window = {} as Window & typeof globalThis
  })

  it('initializes Plausible once and tracks app launch', () => {
    trackAppLaunch()
    expect(mockedInit).toHaveBeenCalledTimes(1)
    expect(mockedInit).toHaveBeenCalledWith({
      domain: 'ai-grab.nb.gl',
      endpoint: 'https://ap.apppro.dev/api/event',
      captureOnLocalhost: true,
    })
    expect(mockedTrack).toHaveBeenCalledWith('app-launch', {
      props: { version: `${appMeta.version}+${appMeta.commit}`, commit: appMeta.commit },
    })

    trackAppLaunch()
    expect(mockedInit).toHaveBeenCalledTimes(1)
    expect(mockedTrack).toHaveBeenCalledTimes(2)
  })

  it('tracks scraping start events', () => {
    trackStartScraping()
    expect(mockedTrack).toHaveBeenCalledWith('start-scraping', {
      props: { version: `${appMeta.version}+${appMeta.commit}`, commit: appMeta.commit },
    })
  })

  it('tracks about view entries with metadata', () => {
    trackOpenAbout()
    expect(mockedTrack).toHaveBeenCalledWith('open-about', {
      props: { version: `${appMeta.version}+${appMeta.commit}`, commit: appMeta.commit, screen: 'about' },
    })
  })

  it('tracks about link clicks with the target host', () => {
    trackAboutLinkClick('i.nb.gl')
    expect(mockedTrack).toHaveBeenCalledWith('about-link-click', {
      props: { version: `${appMeta.version}+${appMeta.commit}`, commit: appMeta.commit, target: 'i.nb.gl' },
    })
  })

  it('skips analytics when window is unavailable', () => {
    delete (globalThis as any).window
    trackAppLaunch()
    expect(mockedInit).not.toHaveBeenCalled()
    expect(mockedTrack).not.toHaveBeenCalled()
  })
})
