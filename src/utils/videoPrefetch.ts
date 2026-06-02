const warmedVideos = new Map<string, HTMLVideoElement>()

const prefetchContainerId = 'storefeed-prefetch-root'

function getPrefetchContainer(): HTMLElement {
  let container = document.getElementById(prefetchContainerId)
  if (!container) {
    container = document.createElement('div')
    container.id = prefetchContainerId
    container.setAttribute('aria-hidden', 'true')
    container.style.cssText =
      'position:fixed;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;'
    document.body.appendChild(container)
  }
  return container
}

function warmVideoMetadata(src: string) {
  if (!src || warmedVideos.has(src)) return

  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  video.src = src
  video.tabIndex = -1
  video.setAttribute('aria-hidden', 'true')
  getPrefetchContainer().appendChild(video)
  warmedVideos.set(src, video)
}

function releaseWarmedVideo(src: string) {
  const video = warmedVideos.get(src)
  if (!video) return

  video.pause()
  video.removeAttribute('src')
  video.load()
  video.remove()
  warmedVideos.delete(src)
}

/** Prefetch metadata for the next clip only — active clip is loaded by VideoPlayer. */
export function prefetchFeedClips(
  videoSources: string[],
  activeIndex: number,
) {
  const keepSrc = videoSources[activeIndex + 1]
  if (keepSrc) {
    warmVideoMetadata(keepSrc)
  }

  warmedVideos.forEach((_video, src) => {
    if (src !== keepSrc) {
      releaseWarmedVideo(src)
    }
  })
}

export function clearVideoPrefetch() {
  warmedVideos.forEach((_video, src) => {
    releaseWarmedVideo(src)
  })
  warmedVideos.clear()
  document.getElementById(prefetchContainerId)?.remove()
}
