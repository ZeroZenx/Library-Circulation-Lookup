import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportingStats, CheckedOutItem } from '../lib/types';
import { getReportingStats, getCheckedOutItems } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/statusHelpers';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReportingStats | null>(null);
  const [checkedOutItems, setCheckedOutItems] = useState<CheckedOutItem[]>([]);
  const [overdueItems, setOverdueItems] = useState<CheckedOutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, checkedOutData] = await Promise.all([
        getReportingStats(),
        getCheckedOutItems(),
      ]);

      setStats(statsData);
      setCheckedOutItems(checkedOutData.items);
      
      // Get overdue items (items with due date that are overdue, or items out >30 days)
      const overdue = checkedOutData.items.filter(
        item => item.isOverdue || (!item.dueDate && item.daysOut > 30)
      );
      setOverdueItems(overdue);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Checked Out</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCheckedOut}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Days Out</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDaysOut}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Loan Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgLoanDuration}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overdue Items</h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All →
            </button>
          </div>
          {overdueItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No overdue items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueItems.slice(0, 5).map((item) => (
                <div
                  key={item.item.id}
                  onClick={() => navigate(`/items/${item.item.id}`)}
                  className="p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.item.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-600 mt-1">Checked out to: {item.checkedOutBy}</p>
                      {item.dueDate && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Due: {formatDate(item.dueDate)} ({item.daysOverdue} days overdue)
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-red-600">
                      {item.daysOut} days
                    </span>
                  </div>
                </div>
              ))}
              {overdueItems.length > 5 && (
                <p className="text-sm text-center text-gray-500 pt-2">
                  +{overdueItems.length - 5} more overdue items
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recently Checked Out */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recently Checked Out</h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All →
            </button>
          </div>
          {checkedOutItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items currently checked out</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkedOutItems.slice(0, 5).map((item) => (
                <div
                  key={item.item.id}
                  onClick={() => navigate(`/items/${item.item.id}`)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.item.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-600 mt-1">Checked out to: {item.checkedOutBy}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(item.checkedOutAt)}
                      </p>
                      {item.dueDate && (
                        <p className={`text-xs mt-1 font-medium ${
                          item.isOverdue ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          Due: {formatDate(item.dueDate)}
                          {item.isOverdue && ` (${item.daysOverdue} days overdue)`}
                        </p>
                      )}
                    </div>
                    {item.isOverdue ? (
                      <span className="text-xs font-medium text-red-600">Overdue</span>
                    ) : (
                      <span className="text-xs text-gray-500">{item.daysOut} days</span>
                    )}
                  </div>
                </div>
              ))}
              {checkedOutItems.length > 5 && (
                <p className="text-sm text-center text-gray-500 pt-2">
                  +{checkedOutItems.length - 5} more checked out items
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Items
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Reports
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

