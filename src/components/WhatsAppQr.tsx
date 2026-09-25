import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

type WhatsAppQrProps = {
  url: string
  size?: number
}

export default function WhatsAppQr({ url, size = 160 }: WhatsAppQrProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      color: { dark: '#16363A', light: '#FFFFFF' },
    })
      .then(() => {
        if (!cancelled) setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [url, size])

  if (error) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="whatsapp-qr"
      role="img"
      aria-label="QR code — scan with your phone's camera to open WhatsApp"
    />
  )
}
