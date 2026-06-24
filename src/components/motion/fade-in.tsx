"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

const directionOffset = {
  up:    { y: 24, x: 0 },
  down:  { y: -24, x: 0 },
  left:  { y: 24, x: 0 },
  right: { y: 24, x: 0 },
  none:  { y: 0, x: 0 },
}

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: keyof typeof directionOffset
  className?: string
  once?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-80px 0px" })
  const offset = directionOffset[direction]
  const reduce = useReducedMotion()

  // Reduced motion: render the settled content, no opacity/translate tween.
  if (reduce) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration,
        delay,
        ease: [0.2, 0.7, 0.2, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
