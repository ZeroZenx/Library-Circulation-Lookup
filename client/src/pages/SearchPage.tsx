import { useState, useEffect } from 'react';
import { SearchParams, ItemSummary } from '../lib/types';
import { searchItems } from '../lib/api';
import SearchBar from '../components/SearchBar';
import FiltersPanel from '../components/FiltersPanel';
import ItemsTable from '../components/ItemsTable';

export default function SearchPage() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchParams>({ page: 1, pageSize: 50 });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
  });
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableItemTypes, setAvailableItemTypes] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  useEffect(() => {
    loadItems();
  }, [filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const result = await searchItems(filters);
      setItems(result.items);
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });

      // Extract unique values for filters
      const locations = new Set<string>();
      const itemTypes = new Set<string>();
      const statuses = new Set<string>();

      // We'd need to fetch all items to get unique values, but for now
      // we'll extract from current results
      result.items.forEach((item) => {
        if (item.location) locations.add(item.location);
        if (item.itemType) itemTypes.add(item.itemType);
        if (item.lastKnownStatus) statuses.add(item.lastKnownStatus);
      });

      setAvailableLocations(Array.from(locations).sort());
      setAvailableItemTypes(Array.from(itemTypes).sort());
      setAvailableStatuses(Array.from(statuses).sort());
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, q: query, page: 1 });
  };

  const handleFilterChange = (newFilters: SearchParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Items</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            availableLocations={availableLocations}
            availableItemTypes={availableItemTypes}
            availableStatuses={availableStatuses}
          />
        </div>

        <div className="lg:col-span-3">
          <ItemsTable items={items} loading={loading} />

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

