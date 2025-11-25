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
  hostingType?: 'netlify' | 'wpmu';
  isNetlifySub?: boolean;
  isDotCom?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortMode = 'name' | 'date' | 'domain';
type FilterMode = 'all' | 'dotcom' | 'netlify' | 'wordpress';

export default function HomePage() {
  const [sites, setSites] = useState<NetlifySite[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const SITES_PER_PAGE = 20;

  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    try {
      setLoading(true);
      const response = await fetch('/api/netlify/sites', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
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

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from UI - database exclusion confirmed
        setSites(sites.filter(site => site.id !== siteId));
      } else {
        console.error('Failed to exclude site:', data.error || data.message);
        alert(`Failed to hide site: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error excluding site:', error);
      alert('Failed to hide site. Please try again.');
    }
  }

  // Filter and sort sites
  const filteredAndSortedSites = sites
    .filter(site => {
      // Apply hosting type filter
      switch (filterMode) {
        case 'dotcom':
          if (!site.isDotCom) return false;
          break;
        case 'netlify':
          if (site.hostingType !== 'netlify') return false;
          break;
        case 'wordpress':
          if (site.hostingType !== 'wpmu') return false;
          break;
      }

      // Apply search filter
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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSites.length / SITES_PER_PAGE);
  const startIndex = (currentPage - 1) * SITES_PER_PAGE;
  const endIndex = startIndex + SITES_PER_PAGE;
  const paginatedSites = filteredAndSortedSites.slice(startIndex, endIndex);

  // Reset to page 1 when search or sort changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (mode: SortMode) => {
    setSortMode(mode);
    setCurrentPage(1);
  };

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  // Calculate counts for filter badges
  const filterCounts = {
    all: sites.length,
    dotcom: sites.filter(s => s.isDotCom).length,
    netlify: sites.filter(s => s.hostingType === 'netlify').length,
    wordpress: sites.filter(s => s.hostingType === 'wpmu').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Josh Domains</h1>
          <p className="text-muted-foreground mt-2">All of Josh's domains and websites</p>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-transparent -mb-px">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filterMode === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              All Sites
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">{filterCounts.all}</span>
            </button>
            <button
              onClick={() => handleFilterChange('dotcom')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filterMode === 'dotcom'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              .com Domains
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">{filterCounts.dotcom}</span>
            </button>
            <button
              onClick={() => handleFilterChange('netlify')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filterMode === 'netlify'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Netlify Sites
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">{filterCounts.netlify}</span>
            </button>
            <button
              onClick={() => handleFilterChange('wordpress')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filterMode === 'wordpress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              WordPress Sites
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">{filterCounts.wordpress}</span>
            </button>
          </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => handleSortChange(e.target.value as SortMode)}
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSites.length)} of {filteredAndSortedSites.length} sites
          {filteredAndSortedSites.length !== sites.length && ` (${sites.length} total)`}
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
            {paginatedSites.map(site => (
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
            {paginatedSites.map(site => (
              <SiteListItem
                key={site.id}
                site={site}
                onExclude={handleExcludeSite}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredAndSortedSites.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
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
