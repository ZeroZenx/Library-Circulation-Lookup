import { Stats } from '../lib/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UsageChartsProps {
  stats: Stats;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function UsageCharts({ stats }: UsageChartsProps) {
  return (
    <div className="space-y-8">
      {/* Usage by Year */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Year</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.usageByYear}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Usage by Month */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.usageByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Usage by Location */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Location</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats.usageByLocation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="location" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8b5cf6" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Borrowed Titles */}
      {stats.topBorrowedTitles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Borrowed Titles</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Borrow Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topBorrowedTitles.map((title, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{title.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{title.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {title.borrowCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

