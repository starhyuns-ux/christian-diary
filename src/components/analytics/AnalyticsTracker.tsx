'use client'

import { useEffect } from 'react'
import { logVisit } from '@/lib/analytics'

export default function AnalyticsTracker() {
  useEffect(() => {
    logVisit()
  }, [])

  return null
}
