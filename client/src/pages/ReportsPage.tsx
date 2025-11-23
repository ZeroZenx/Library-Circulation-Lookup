import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckedOutItem, CheckoutHistoryReport, ReportingStats } from '../lib/types';
import { getCheckedOutItems, getCheckoutHistory, getReportingStats } from '../lib/api';
import { formatDateTime, formatDate } from '../lib/statusHelpers';
import StatusBadge from '../components/StatusBadge';

type ReportView = 'checked-out' | 'history';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ReportView>('checked-out');
  const [checkedOutItems, setCheckedOutItems] = useState<CheckedOutItem[]>([]);
  const [historyReports, setHistoryReports] = useState<CheckoutHistoryReport[]>([]);
  const [stats, setStats] = useState<ReportingStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // History filters
  const [filters, setFilters] = useState({
    status: 'all' as 'checked-out' | 'checked-in' | 'all',
    fromDate: '',
    toDate: '',
    performedBy: '',
    itemId: '',
  });

  useEffect(() => {
    loadData();
  }, [view, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checkedOutData, historyData, statsData] = await Promise.all([
        getCheckedOutItems(),
        getCheckoutHistory(filters),
        getReportingStats(),
      ]);
      
      setCheckedOutItems(checkedOutData.items);
      setHistoryReports(historyData.reports);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      fromDate: '',
      toDate: '',
      performedBy: '',
      itemId: '',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Currently Checked Out</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCheckedOut}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Overdue (30+ days)</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdueItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Avg Days Out</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgDaysOut}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Avg Loan Duration</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgLoanDuration}</p>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setView('checked-out')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === 'checked-out'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Currently Checked Out ({checkedOutItems.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Checkout History ({historyReports.length})
          </button>
        </nav>
      </div>

      {/* Currently Checked Out View */}
      {view === 'checked-out' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading checked out items...</div>
            </div>
          ) : checkedOutItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-500">No items currently checked out</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Call Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked Out By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked Out Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Days Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkedOutItems.map((item) => (
                      <tr
                        key={item.item.id}
                        onClick={() => navigate(`/items/${item.item.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.item.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{item.item.author || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.item.callNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.checkedOutBy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(item.checkedOutAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${
                            item.daysOut > 30 ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {item.daysOut} {item.daysOut === 1 ? 'day' : 'days'}
                            {item.daysOut > 30 && ' (Overdue)'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {item.checkoutNote || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="checked-in">Checked In</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Performed By</label>
                <input
                  type="text"
                  value={filters.performedBy}
                  onChange={(e) => handleFilterChange('performedBy', e.target.value)}
                  placeholder="Search name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Item ID/Barcode</label>
                <input
                  type="text"
                  value={filters.itemId}
                  onChange={(e) => handleFilterChange('itemId', e.target.value)}
                  placeholder="Search item..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading history...</div>
            </div>
          ) : historyReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-500">No checkout history found</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Call Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked Out By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked Out Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked In By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Checked In Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Days Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyReports.map((report, idx) => (
                      <tr
                        key={`${report.item.id}-${idx}`}
                        onClick={() => navigate(`/items/${report.item.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.item.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.item.callNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.checkedOutBy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(report.checkedOutAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {report.checkedInBy || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {report.checkedInAt ? formatDateTime(report.checkedInAt) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {report.daysOut !== undefined ? `${report.daysOut} days` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {report.checkinRecord ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Returned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

