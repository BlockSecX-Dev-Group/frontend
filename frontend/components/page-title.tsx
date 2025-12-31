"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PageTitleProps {
  title: string
  subtitle?: string | ReactNode
  align?: "left" | "center"
  className?: string
  showIcon?: boolean
}

export function PageTitle({
  title,
  subtitle,
  align = "left",
  className,
  showIcon = false
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "space-y-4 mb-8 md:mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        {showIcon && (
          <Image
            src="/icon_in_white.png"
            alt="Icon"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <div className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {subtitle}
        </div>
      )}
    </div>
  )
}
