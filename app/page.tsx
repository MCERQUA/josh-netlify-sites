"use client";

import { useState, useEffect } from 'react';
import { SiteCard } from '@/components/site-card';
import { SiteListItem } from '@/components/site-list-item';
import { Button } from '@/components/button';
import { Grid3x3, List, Loader2, Search } from 'lucide-react';

interface NetlifySite {
  id: string;
  name: string;
  url: string;
  screenshotUrl: string;
  fallbackScreenshots?: string[];
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';
type SortMode = 'name' | 'date' | 'domain';

export default function HomePage() {
  const [sites, setSites] = useState<NetlifySite[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    try {
      setLoading(true);
      const response = await fetch('/api/netlify/sites');
      const data = await response.json();

      if (data.success) {
        setSites(data.sites);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExcludeSite(siteId: string) {
    try {
      const response = await fetch('/api/netlify/exclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId })
      });

      if (response.ok) {
        // Remove from UI
        setSites(sites.filter(site => site.id !== siteId));
      }
    } catch (error) {
      console.error('Error excluding site:', error);
    }
  }

  // Filter and sort sites
  const filteredAndSortedSites = sites
    .filter(site => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const url = (site.customDomain || site.url).toLowerCase();
      const name = site.name.toLowerCase();
      return url.includes(query) || name.includes(query);
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'domain':
          const urlA = (a.customDomain || a.url).toLowerCase();
          const urlB = (b.customDomain || b.url).toLowerCase();
          return urlA.localeCompare(urlB);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Netlify Domains Showcase</h1>
          <p className="text-muted-foreground mt-2">A gallery of all our Netlify-hosted websites</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="domain">Sort by Domain</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedSites.length} of {sites.length} sites
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedSites.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                onExclude={handleExcludeSite}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && (
          <div className="space-y-2">
            {filteredAndSortedSites.map(site => (
              <SiteListItem
                key={site.id}
                site={site}
                onExclude={handleExcludeSite}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedSites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No sites match your search' : 'No sites found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
