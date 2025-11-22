"use client";

import { ExternalLink, EyeOff } from 'lucide-react';
import { Button } from './button';

interface SiteListItemProps {
  site: {
    id: string;
    name: string;
    url: string;
    customDomain?: string;
    createdAt: string;
  };
  onExclude: (siteId: string) => void;
}

export function SiteListItem({ site, onExclude }: SiteListItemProps) {
  const displayUrl = site.customDomain || site.url;
  const createdDate = new Date(site.createdAt).toLocaleDateString();

  return (
    <div className="group flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center gap-4 min-w-0"
      >
        <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {displayUrl.replace(/^https?:\/\//, '')}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {site.customDomain && (
              <p className="text-xs text-muted-foreground truncate">
                {site.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {createdDate}
            </p>
          </div>
        </div>
      </a>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Hide "${site.name}" from this gallery?`)) {
            onExclude(site.id);
          }
        }}
        title="Hide this site"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <EyeOff className="w-4 h-4" />
      </Button>
    </div>
  );
}
