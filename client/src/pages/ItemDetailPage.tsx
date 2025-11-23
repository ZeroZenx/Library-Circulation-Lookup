import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item } from '../lib/types';
import { getItem } from '../lib/api';
import ItemDetailPanel from '../components/ItemDetailPanel';
import NotesPanel from '../components/NotesPanel';
import CheckoutPanel from '../components/CheckoutPanel';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getItem(id!);
      setItem(data);
    } catch (err) {
      setError('Failed to load item');
      console.error('Error loading item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading item details...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Item not found'}</div>
        <button
          onClick={() => navigate('/search')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/search')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ItemDetailPanel item={item} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <CheckoutPanel itemId={item.id} onUpdate={loadItem} />
          <NotesPanel itemId={item.id} />
        </div>
      </div>
    </div>
  );
}

