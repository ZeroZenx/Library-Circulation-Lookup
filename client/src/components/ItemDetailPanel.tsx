import { Item, Transaction } from '../lib/types';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateTime } from '../lib/statusHelpers';

interface ItemDetailPanelProps {
  item: Item;
}

export default function ItemDetailPanel({ item }: ItemDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.title || 'Untitled'}</h2>
        <p className="text-gray-600">{item.author || 'Unknown Author'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-gray-500">Barcode</label>
          <p className="text-sm text-gray-900 mt-1">{item.barcode}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Call Number</label>
          <p className="text-sm text-gray-900 mt-1">{item.callNumber || 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Location</label>
          <p className="text-sm text-gray-900 mt-1">{item.location || 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Item Type</label>
          <p className="text-sm text-gray-900 mt-1">{item.itemType || 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <StatusBadge status={item.lastKnownStatus} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Transaction Count</label>
          <p className="text-sm text-gray-900 mt-1">{item.transactionCount}</p>
        </div>
      </div>

      {item.lastTransactionDate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Last Transaction</h3>
          <p className="text-sm text-gray-600">{formatDateTime(item.lastTransactionDate)}</p>
        </div>
      )}

      {item.transactions && item.transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patron ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {item.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(transaction.transactionDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.transactionType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.patronId || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.location || 'N/A'}
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

