export class CanvasRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private stream: MediaStream | null = null
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) { this.canvas = canvas }

  start(fps = 60, mbps = 25) {
    this.recordedChunks = []
    this.stream = this.canvas.captureStream(fps)
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType, videoBitsPerSecond: mbps * 1e6 })
    this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.recordedChunks.push(e.data) }
    this.mediaRecorder.start()
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('Not started'))
      this.mediaRecorder.onstop = () => resolve(new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' }))
      this.mediaRecorder.stop()
      this.stream?.getTracks().forEach(t => t.stop())
    })
  }

  static download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }
}
