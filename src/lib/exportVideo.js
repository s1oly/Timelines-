import { getMedia } from './db.js'
import { DEFAULT_ACCENT } from './accent.js'

const W = 1280
const H = 720
const SLIDE_MS = 3500
const FADE_MS = 400
const FPS = 30

const slugify = (name) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'timeline'

function hexToRgb(hex) {
  const c = hex.replace('#', '')
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) }
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ')
  let line = ''
  const lines = []
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = word }
    else line = test
  }
  if (line) lines.push(line)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH))
  return lines.length
}

async function loadImageFromBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

function drawBg(ctx, accent) {
  const { r, g, b } = hexToRgb(accent)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, W, H)
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.65)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.18)`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

function fitImage(ctx, img, x, y, maxW, maxH) {
  const aspect = img.width / img.height
  let w, h
  if (aspect > maxW / maxH) { w = maxW; h = maxW / aspect }
  else { h = maxH; w = maxH * aspect }
  const ix = x + (maxW - w) / 2
  const iy = y + (maxH - h) / 2
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(ix, iy, w, h, 14)
  ctx.clip()
  ctx.drawImage(img, ix, iy, w, h)
  ctx.restore()
}

function drawCover(ctx, timeline, coverImg, accent) {
  drawBg(ctx, accent)
  const pad = 72
  if (coverImg) {
    fitImage(ctx, coverImg, pad, pad, W * 0.44, H - pad * 2)
    const tx = W * 0.52
    let y = H / 2 - 70
    ctx.textAlign = 'left'
    ctx.fillStyle = accent
    ctx.font = 'bold 13px system-ui,sans-serif'
    ctx.fillText('TIMELINE', tx, y)
    y += 32
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 50px system-ui,sans-serif'
    const lines = wrapText(ctx, timeline.name, tx, y, W * 0.42, 58)
    if (timeline.cover?.subtitle) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '20px system-ui,sans-serif'
      wrapText(ctx, timeline.cover.subtitle, tx, y + lines * 58 + 18, W * 0.42, 28)
    }
  } else {
    ctx.textAlign = 'center'
    let y = H / 2 - 80
    ctx.fillStyle = accent
    ctx.font = 'bold 13px system-ui,sans-serif'
    ctx.fillText('TIMELINE', W / 2, y)
    y += 36
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 62px system-ui,sans-serif'
    const lines = wrapText(ctx, timeline.name, W / 2, y, W * 0.75, 72)
    if (timeline.cover?.subtitle) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '22px system-ui,sans-serif'
      wrapText(ctx, timeline.cover.subtitle, W / 2, y + lines * 72 + 22, W * 0.65, 30)
    }
  }
}

function drawMoment(ctx, moment, mediaImg, accent) {
  drawBg(ctx, accent)
  const pad = 72
  const hasMedia = Boolean(mediaImg)
  const textX = hasMedia ? W * 0.53 : W / 2
  const textMaxW = hasMedia ? W * 0.42 : W * 0.72
  const align = hasMedia ? 'left' : 'center'

  if (hasMedia) fitImage(ctx, mediaImg, pad, pad, W * 0.44, H - pad * 2)

  let y = H / 2 - 110

  ctx.textAlign = align
  ctx.fillStyle = accent
  ctx.font = 'bold 12px system-ui,sans-serif'
  const dateStr = new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()
  ctx.fillText(dateStr, textX, y)
  y += 28

  if (moment.isMilestone) {
    ctx.font = 'bold 11px system-ui,sans-serif'
    const label = '★ MILESTONE'
    const bw = ctx.measureText(label).width + 20
    const bx = align === 'center' ? textX - bw / 2 : textX
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.roundRect(bx, y - 12, bw, 20, 10)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.fillText(label, bx + 10, y + 2)
    ctx.textAlign = align
    y += 28
  }

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px system-ui,sans-serif'
  const titleLines = wrapText(ctx, moment.title, textX, y, textMaxW, 46)
  y += titleLines * 46 + 14

  if (moment.description) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '17px system-ui,sans-serif'
    const descLines = wrapText(ctx, moment.description, textX, y, textMaxW, 25)
    y += descLines * 25 + 18
  }

  if (moment.tags?.length) {
    ctx.font = 'bold 11px system-ui,sans-serif'
    const tagWidths = moment.tags.map((t) => ctx.measureText(t).width + 20)
    const totalW = tagWidths.reduce((a, b) => a + b, 0) + (moment.tags.length - 1) * 8
    let tx = align === 'center' ? textX - totalW / 2 : textX
    moment.tags.forEach((tag, i) => {
      const tw = tagWidths[i]
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath()
      ctx.roundRect(tx, y - 11, tw, 20, 10)
      ctx.fill()
      ctx.fillStyle = '#e2e8f0'
      ctx.textAlign = 'left'
      ctx.fillText(tag, tx + 10, y + 3)
      tx += tw + 8
    })
  }
}

function applyFade(ctx, alpha) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  ctx.fillRect(0, 0, W, H)
}

export async function exportVideo(timeline, moments, onProgress) {
  const accent = timeline.accentColor ?? DEFAULT_ACCENT

  const coverImg = timeline.cover?.mediaId
    ? await getMedia(timeline.cover.mediaId).then((b) => (b ? loadImageFromBlob(b) : null))
    : null

  const momentImgs = await Promise.all(
    moments.map(async (m) => {
      if (!m.mediaId || m.mediaType === 'video') return null
      const blob = await getMedia(m.mediaId)
      return blob ? loadImageFromBlob(blob) : null
    })
  )

  const slides = [
    { draw: (ctx) => drawCover(ctx, timeline, coverImg, accent) },
    ...moments.map((m, i) => ({ draw: (ctx) => drawMoment(ctx, m, momentImgs[i], accent) })),
  ]

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'

  const stream = canvas.captureStream(FPS)
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugify(timeline.name)}.webm`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      resolve()
    }

    recorder.start()

    let slideIndex = 0
    let slideStart = performance.now()

    const tick = (now) => {
      if (slideIndex >= slides.length) { recorder.stop(); return }

      const elapsed = now - slideStart
      slides[slideIndex].draw(ctx)

      if (elapsed < FADE_MS) {
        applyFade(ctx, 1 - elapsed / FADE_MS)
      } else if (elapsed > SLIDE_MS - FADE_MS) {
        applyFade(ctx, (elapsed - (SLIDE_MS - FADE_MS)) / FADE_MS)
      }

      onProgress?.((slideIndex + Math.min(elapsed / SLIDE_MS, 1)) / slides.length)

      if (elapsed >= SLIDE_MS) { slideIndex++; slideStart = now }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  })
}
