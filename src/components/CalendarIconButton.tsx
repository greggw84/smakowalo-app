'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CalendarPlus, Loader2 } from "lucide-react"
import { downloadDeliveryCalendarEvent, type DeliveryICSOptions } from "@/lib/calendar/ics"

interface CalendarIconButtonProps {
  deliveryDate: Date
  deliveryDay?: 'tuesday' | 'thursday' | string
  planDescription?: string
  mealsCount?: number
  address?: string
  className?: string
  variant?: 'icon' | 'button'
  showTooltip?: boolean
}

/**
 * Button component for downloading delivery calendar event (.ics file)
 * Can be rendered as an icon button or a full button with label
 */
export default function CalendarIconButton({
  deliveryDate,
  deliveryDay,
  planDescription,
  mealsCount,
  address,
  className = '',
  variant = 'icon',
  showTooltip = true,
}: CalendarIconButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const options: DeliveryICSOptions = {
        deliveryDate,
        deliveryDay,
        planDescription,
        mealsCount,
        address,
      }
      
      downloadDeliveryCalendarEvent(options)
    } catch (error) {
      console.error('Error downloading calendar event:', error)
      alert('Nie udało się pobrać pliku kalendarza')
    } finally {
      setIsDownloading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors group relative ${className}`}
        title="Dodaj do kalendarza"
        aria-label="Dodaj termin dostawy do kalendarza"
      >
        {isDownloading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        ) : (
          <CalendarPlus className="w-5 h-5 text-gray-500 group-hover:text-[var(--smakowalo-green-primary)]" />
        )}
        
        {/* Tooltip */}
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Dodaj do kalendarza
          </span>
        )}
      </button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`${className}`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Pobieranie...
        </>
      ) : (
        <>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Dodaj do kalendarza
        </>
      )}
    </Button>
  )
}
