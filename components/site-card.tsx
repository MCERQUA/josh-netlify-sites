"use client";

import { useState } from 'react';
import { EyeOff, RefreshCw, Camera } from 'lucide-react';
import { Button } from './button';

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    url: string;
    screenshotUrl: string;
    fallbackScreenshots?: string[];
    customDomain?: string;
    createdAt: string;
    hasStoredScreenshot?: boolean;
    screenshotUpdatedAt?: string;
  };
  onExclude: (siteId: string) => void;
  onRefreshScreenshot?: (siteId: string) => Promise<string | null>;
}

export function SiteCard({ site, onExclude, onRefreshScreenshot }: SiteCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentScreenshotUrl, setCurrentScreenshotUrl] = useState(site.screenshotUrl);

  const displayUrl = site.customDomain || site.url;

  // Get current screenshot URL to try
  const currentScreenshot = site.fallbackScreenshots?.[currentScreenshotIndex] || currentScreenshotUrl;

  // Try next fallback screenshot when current one fails
  const handleImageError = () => {
    if (site.fallbackScreenshots && currentScreenshotIndex < site.fallbackScreenshots.length - 1) {
      setCurrentScreenshotIndex(currentScreenshotIndex + 1);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Retry loading screenshot
  const handleRetry = () => {
    setImageError(false);
    setImageLoading(true);
    setCurrentScreenshotIndex(0);
  };

  // Refresh screenshot from API
  const handleRefreshScreenshot = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (onRefreshScreenshot) {
        const newUrl = await onRefreshScreenshot(site.id);
        if (newUrl) {
          setCurrentScreenshotUrl(newUrl);
          setImageError(false);
          setImageLoading(true);
          setCurrentScreenshotIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to refresh screenshot:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Screenshot */}
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[16/10] bg-muted relative overflow-hidden"
      >
        {/* Loading State */}
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            <div className="text-xs text-muted-foreground">Loading...</div>
          </div>
        )}

        {/* Image */}
        {!imageError && (
          <img
            src={currentScreenshot}
            alt={`Screenshot of ${site.name}`}
            className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            onError={handleImageError}
            onLoad={() => setImageLoading(false)}
            loading="lazy"
          />
        )}

        {/* Error State with Retry */}
        {imageError && (
          <div
            className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRetry();
            }}
          >
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Click to retry</p>
              <p className="text-xs opacity-60 mt-1">Screenshot failed</p>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        {!imageError && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        )}
      </a>

      {/* URL */}
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 hover:bg-accent transition-colors"
      >
        <p className="text-sm font-medium text-foreground truncate">
          {displayUrl.replace(/^https?:\/\//, '')}
        </p>
        {site.customDomain && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {site.name}
          </p>
        )}
      </a>

      {/* Actions - appear on hover */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-2">
          {onRefreshScreenshot && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRefreshScreenshot}
              disabled={isRefreshing}
              title="Refresh screenshot"
              className="h-8 w-8 p-0"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Hide "${site.name}" from this gallery?`)) {
                onExclude(site.id);
              }
            }}
            title="Hide this site"
            className="h-8 w-8 p-0"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
