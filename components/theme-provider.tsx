'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: light;
        }
        .dark {
          color-scheme: dark;
        }
      `}</style>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </>
  )
}
