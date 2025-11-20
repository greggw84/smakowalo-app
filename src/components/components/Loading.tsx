import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Generic loading spinner
export function LoadingSpinner({ size = 'default', className = '' }: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// Full page loading
export function PageLoading({ message = 'Ładowanie...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[var(--smakowalo-cream)] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-[var(--smakowalo-green-primary)] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  )
}

// Skeleton for product cards
export function ProductCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden">
      <div className="relative h-56 bg-gray-200 animate-pulse" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />

        <div className="flex gap-2 mb-3">
          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

// Skeleton for menu grid
export function MenuGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton for product detail page
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Hero section skeleton */}
          <Card className="overflow-hidden">
            <div className="relative h-80 lg:h-96 bg-gray-200 animate-pulse" />
            <div className="p-8">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-3/4" />

              <div className="grid grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </Card>

          {/* Instructions skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-1/3" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Inline loading for buttons
export function ButtonLoading({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

// Section loading
export function SectionLoading({
  message = 'Ładowanie...',
  height = 'h-32'
}: {
  message?: string
  height?: string
}) {
  return (
    <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
      <div className="text-center">
        <LoadingSpinner className="text-[var(--smakowalo-green-primary)] mx-auto mb-2" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}
