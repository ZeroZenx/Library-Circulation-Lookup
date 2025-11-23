import { useState, useEffect, FormEvent } from 'react';
import { CheckoutStatus, CheckoutRecord } from '../lib/types';
import { getCheckoutStatus, checkoutItem, checkinItem } from '../lib/api';
import { formatDateTime } from '../lib/statusHelpers';

interface CheckoutPanelProps {
  itemId: string;
  onUpdate?: () => void;
}

export default function CheckoutPanel({ itemId, onUpdate }: CheckoutPanelProps) {
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'checkout' | 'checkin' | null>(null);
  const [formData, setFormData] = useState({ performedBy: '', note: '' });

  useEffect(() => {
    loadStatus();
  }, [itemId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await getCheckoutStatus(itemId);
      setStatus(data);
    } catch (error) {
      console.error('Error loading checkout status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.performedBy.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      if (action === 'checkout') {
        await checkoutItem(itemId, formData.performedBy, formData.note);
      } else if (action === 'checkin') {
        await checkinItem(itemId, formData.performedBy, formData.note);
      }
      setFormData({ performedBy: '', note: '' });
      setAction(null);
      await loadStatus();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error performing checkout action:', error);
      alert(error.message || 'Failed to perform action. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkout Status</h3>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const isCheckedOut = status?.isCheckedOut || false;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkout Status</h3>

      {/* Current Status */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${
        isCheckedOut 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              isCheckedOut ? 'text-red-800' : 'text-green-800'
            }`}>
              {isCheckedOut ? 'Checked Out' : 'Available'}
            </p>
            {isCheckedOut && status?.checkedOutBy && (
              <div className="mt-2 text-sm text-red-700">
                <p>Checked out by: <strong>{status.checkedOutBy}</strong></p>
                {status.checkedOutAt && (
                  <p className="text-xs mt-1">On: {formatDateTime(status.checkedOutAt)}</p>
                )}
                {status.checkoutNote && (
                  <p className="text-xs mt-1 italic">Note: {status.checkoutNote}</p>
                )}
              </div>
            )}
          </div>
          {!action && (
            <div className="flex space-x-2">
              {!isCheckedOut ? (
                <button
                  onClick={() => setAction('checkout')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Check Out
                </button>
              ) : (
                <button
                  onClick={() => setAction('checkin')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Check In
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout/Checkin Form */}
      {action && (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === 'checkout' ? 'Who is checking this out?' : 'Who is checking this in?'}
            </label>
            <input
              type="text"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this checkout/checkin"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting || !formData.performedBy.trim()}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                action === 'checkout'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {submitting ? 'Processing...' : action === 'checkout' ? 'Check Out' : 'Check In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAction(null);
                setFormData({ performedBy: '', note: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Checkout History */}
      {status?.history && status.history.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Checkout History</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {status.history.map((record) => (
              <div
                key={record.id}
                className={`p-3 rounded border text-sm ${
                  record.action === 'CHECKOUT'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {record.action === 'CHECKOUT' ? 'Checked Out' : 'Checked In'}
                    </p>
                    <p className="text-xs mt-1">By: {record.performedBy}</p>
                    {record.note && (
                      <p className="text-xs mt-1 italic">Note: {record.note}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(record.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

