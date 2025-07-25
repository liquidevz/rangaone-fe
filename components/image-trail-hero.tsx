// components\image-trail-hero.tsx
"use client"
import { motion, useAnimate } from "framer-motion"
import { useRef } from "react"

export const ImageTrailHero = () => {
  return (
    <>

      <MouseImageTrail
        renderImageBuffer={50}
        rotationRange={25}
        images={[
          "/imgs/active/1.png",
          "/imgs/active/2.jpg",
          "/imgs/active/3.jpg",
          "/imgs/active/4.jpg",
          "/imgs/active/5.png",
          "/imgs/active/6.png",
          "/imgs/active/7.png",
          "/imgs/active/8.png",
          "/imgs/active/9.png",
          "/imgs/active/10.png",
          "/imgs/active/11.png",
          "/imgs/active/12.jpg",
          "/imgs/active/13.png",
          "/imgs/active/14.png",
          "/imgs/active/15.png",
        ]}
      >
        <section className="h-[30rem] md:h-screen bg-[#d7faff] op w-screen overflow-hidden">
          <Copy />
          <WatermarkWrapper />
        </section>
      </MouseImageTrail>
    </>
  )
}

const Copy = () => {
  return (
    <div className="absolute bottom-8 left-4 right-0 z-[40]">
      <div className="mx-auto flex max-w-7xl items-end justify-between md:p-8">
        <div className="relative">
          {/* Simulated mist/fog glow */}
          {/* <div className="absolute -inset-10 bg-white blur-2xl rounded-full opacity-80 pointer-events-none z-[-1]" /> */}
          <img
            src="/icons/cloud.png"
            alt="Hero background"
            className="absolute -inset-10 w-full h-full object-cover rounded-full opacity-80 pointer-events-none z-[-1]"
          />

          <p className="text-[0.9rem] md:text-lg text-black font-bold mb-2">
            At RangaOne – Your Growth, Our Priority. </p>
          <h1 className="text-4xl md:text-8xl font-bold leading-tight font-times-serif text-black drop-shadow-sm">
            <span
              className="text-blue-900 drop-shadow-md"
              style={{
                WebkitTextStroke: '2px black',
                textShadow: '2px 2px 6px #000, 0 0 2px #000',
              }}
            >
              Wealth
            </span> <span className="text-3xl md:text-5xl font-semibold text-black">Isn’t Found,</span>
            <br />
            <span className="text-3xl md:text-5xl font-semibold text-black" style={{ verticalAlign: "super" }}>
              it is built with
            </span>{' '}
            <span
              className="text-blue-900 font-extrabold drop-shadow-md"
              style={{
                WebkitTextStroke: '2px black',
                textShadow: '2px 2px 6px #000, 0 0 2px #000',
              }}
            >
              Knowledge
            </span>
          </h1>
        </div>
      </div>
    </div>

  )
}

const WatermarkWrapper = () => {
  return (
    <>
      <Watermark text="Wealth Creation" />
      <Watermark text="Smart Investing" reverse />
      <Watermark text="Buy The Dip" />
      <Watermark text="Stock Market" reverse />
      <Watermark text="Wealth Creation" />
      <Watermark text="Smart Investing" reverse />
      <Watermark text="Buy The Dip" />
      <Watermark text="Stock Market" reverse />
    </>
  )
}

const Watermark = ({ reverse = false, text }: { reverse?: boolean; text: string }) => (
  <div className="flex -translate-y-12 select-none overflow-hidden">
    <TranslateWrapper reverse={reverse}>
      <span className="w-fit whitespace-nowrap text-[20vmax] font-black uppercase leading-[0.75] text-slate-300">
        {text}
      </span>
    </TranslateWrapper>
    <TranslateWrapper reverse={reverse}>
      <span className="ml-48 w-fit whitespace-nowrap text-[20vmax] font-black uppercase leading-[0.75] text-slate-300">
        {text}
      </span>
    </TranslateWrapper>
  </div>
)

const TranslateWrapper = ({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration: 75, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      className="flex"
    >
      {children}
    </motion.div>
  )
}

const MouseImageTrail = ({
  children,
  images,
  renderImageBuffer,
  rotationRange,
}: {
  children: React.ReactNode;
  images: string[];
  renderImageBuffer: number;
  rotationRange: number;
}) => {
  const [scope, animate] = useAnimate()

  const lastRenderPosition = useRef({ x: 0, y: 0 })
  const imageRenderCount = useRef(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY } = e

    const distance = calculateDistance(clientX, clientY, lastRenderPosition.current.x, lastRenderPosition.current.y)

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = clientX
      lastRenderPosition.current.y = clientY

      renderNextImage()
    }
  }

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const deltaX = x2 - x1
    const deltaY = y2 - y1

    // Using the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    return distance
  }

  const renderNextImage = () => {
    const imageIndex = imageRenderCount.current % images.length
    const selector = `[data-mouse-move-index="${imageIndex}"]`

    const el = document.querySelector(selector) as HTMLElement | null

    if (el) {
      el.style.top = `${lastRenderPosition.current.y}px`
      el.style.left = `${lastRenderPosition.current.x}px`
      el.style.zIndex = imageRenderCount.current.toString()

      const rotation = Math.random() * rotationRange

      animate(
        selector,
        {
          opacity: [0, 1],
          transform: [
            `translate(-50%, -25%) scale(0.5) ${imageIndex % 2 ? `rotate(${rotation}deg)` : `rotate(-${rotation}deg)`}`,
            `translate(-50%, -50%) scale(1) ${imageIndex % 2 ? `rotate(-${rotation}deg)` : `rotate(${rotation}deg)`}`,
          ],
        },
        { type: "spring", damping: 15, stiffness: 200 },
      )

      animate(
        selector,
        {
          opacity: [1, 0],
        },
        { ease: "linear", duration: 0.5, delay: 1 },
      )

      imageRenderCount.current = imageRenderCount.current + 1
    }
  }

  return (
    <div ref={scope} className="relative overflow-hidden" onMouseMove={handleMouseMove}>
      {children}

      {images.map((img, index) => (
        <img
          className="pointer-events-none absolute left-0 top-0 h-36 w-auto rounded-xl border-2 border-slate-900 bg-slate-800 object-cover opacity-0"
          src={img || "/placeholder.svg"}
          alt={`Mouse move image ${index}`}
          key={index}
          data-mouse-move-index={index}
          width={144}
          height={144}
        />
      ))}
    </div>
  )
}
