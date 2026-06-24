"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

const ease = [0.2, 0.7, 0.2, 1] as const

const container = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      delayChildren: delay,
      staggerChildren: 0.08,
    },
  }),
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

type StaggerTag = "div" | "ol" | "ul" | "section"

interface StaggerProps {
  children: React.ReactNode
  delay?: number
  className?: string
  once?: boolean
  /**
   * Render tag for the staggered container. Defaults to `"div"`.
   * Use `"ol"` / `"ul"` when the staggered children are list rows
   * so the resulting DOM stays semantically valid.
   */
  as?: StaggerTag
}

export function Stagger({
  children,
  delay = 0,
  className,
  once = true,
  as = "div",
}: StaggerProps) {
  const ref = useRef<HTMLElement | null>(null)
  const isInView = useInView(ref, { once, margin: "-80px 0px" })
  const Comp = motion[as] as typeof motion.div
  const reduce = useReducedMotion()

  // Reduced motion: render the settled state — no variants/initial/animate, so
  // children sit at their natural opacity:1 / y:0 (mirrors CinematicReveal).
  if (reduce) {
    return (
      <Comp ref={ref as React.Ref<HTMLDivElement>} className={cn(className)}>
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
      className={cn(className)}
    >
      {children}
    </Comp>
  )
}

type StaggerItemTag = "div" | "li"

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  as?: StaggerItemTag
}) {
  const Comp = motion[as] as typeof motion.div
  const reduce = useReducedMotion()
  if (reduce) {
    return <Comp className={cn(className)}>{children}</Comp>
  }
  return (
    <Comp variants={item} className={cn(className)}>
      {children}
    </Comp>
  )
}
