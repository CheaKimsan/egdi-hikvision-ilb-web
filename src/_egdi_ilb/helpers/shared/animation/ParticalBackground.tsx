'use client'
import { useEffect, useRef } from 'react'

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        let w: number,
            h: number,
            loopId: number,
            particles: Particle[] = []

        const options = {
            // Changed to Brand Red for light backgrounds
            particleColor: 'rgba(117, 16, 29, 0.4)', // $primary with opacity
            lineColor: 'rgba(117, 16, 29, 0.15)',
            particleAmount: 40,
            defaultRadius: 2,
            variantRadius: 2,
            defaultSpeed: 0.8,
            variantSpeed: 0.8,
            linkRadius: 250,
        }

        const baseW = 2800
        const baseH = 1200
        const basePerimeter = baseW + baseH

        const rgb = options.lineColor.match(/\d+/g)

        const canvas = canvasRef.current
        const ctx: CanvasRenderingContext2D | null = canvas?.getContext('2d') || null

        if (!canvas || !ctx) return

        const resizeReset = () => {
            if (!canvas) return
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
        }

        class Particle {
            x: number
            y: number
            color: string
            radius: number
            speed: number
            directionAngle: number
            vector: { x: number; y: number }

            constructor() {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.color = options.particleColor
                this.radius = options.defaultRadius + Math.random() * options.variantRadius
                this.speed = options.defaultSpeed + Math.random() * options.variantSpeed
                this.directionAngle = Math.floor(Math.random() * 360)
                this.vector = {
                    x: Math.cos(this.directionAngle) * this.speed,
                    y: Math.sin(this.directionAngle) * this.speed,
                }
            }

            update() {
                this.border()
                this.x += this.vector.x
                this.y += this.vector.y
            }

            border() {
                if (this.x >= w || this.x <= 0) this.vector.x *= -1
                if (this.y >= h || this.y <= 0) this.vector.y *= -1
                if (this.x >= w) this.x = w
                if (this.y >= h) this.y = h
                if (this.x < 0) this.x = 0
                if (this.y < 0) this.y = 0
            }

            draw() {
                if (!ctx) return
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
                ctx.fillStyle = this.color
                ctx.fill()
            }
        }

        const initializeParticles = () => {
            const screenPerimeter = w + h
            const scale = screenPerimeter / basePerimeter

            options.particleAmount = (w + h) / 60 // Reduced density slightly for cleaner look
            options.defaultSpeed = Math.sqrt(scale) * 0.8
            options.variantSpeed = Math.sqrt(scale) * 0.8

            options.linkRadius = w / 12 + h / 6
            particles = []
            for (let i = 0; i < options.particleAmount; i++) {
                particles.push(new Particle())
            }
        }

        const checkDistance = (x1: number, y1: number, x2: number, y2: number) =>
            Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

        const linkPoints = (point: Particle, hubs: Particle[]) => {
            if (!ctx || !rgb) return
            hubs.forEach((hub) => {
                const distance = checkDistance(point.x, point.y, hub.x, hub.y)
                const opacity = 1 - distance / options.linkRadius
                if (opacity > 0) {
                    ctx.lineWidth = 0.8
                    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.5})`
                    ctx.beginPath()
                    ctx.moveTo(point.x, point.y)
                    ctx.lineTo(hub.x, hub.y)
                    ctx.stroke()
                }
            })
        }

        const drawParticles = () => {
            particles.forEach((p) => {
                p.update()
                p.draw()
            })
        }

        const drawLines = () => {
            particles.forEach((p) => linkPoints(p, particles))
        }

        const drawScene = () => {
            drawLines()
            drawParticles()
        }

        const loop = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, w, h)
            drawScene()
            loopId = requestAnimationFrame(loop)
        }

        const startAnimation = () => {
            loopId = requestAnimationFrame(loop)
        }

        // Init
        resizeReset()
        initializeParticles()
        startAnimation()
        window.addEventListener('resize', resizeReset)

        return () => {
            cancelAnimationFrame(loopId)
            window.removeEventListener('resize', resizeReset)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Crucial: lets clicks pass through to the form
                zIndex: 0
            }}
        />
    )
}

export default ParticleBackground   