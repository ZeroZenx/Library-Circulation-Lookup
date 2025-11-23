/**
 * Status badge color mapping
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Likely available':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Likely on loan':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Lost':
    case 'Missing':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Withdrawn':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Formats a date string for display
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date and time string for display
 */
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

