import { Item, SearchParams, SearchResult, Note, Stats, CheckoutStatus, CheckoutRecord } from './types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function searchItems(params: SearchParams): Promise<SearchResult> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_BASE}/items?${queryParams.toString()}`;
  return fetchJSON<SearchResult>(url);
}

export async function getItem(id: string): Promise<Item> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}`;
  return fetchJSON<Item>(url);
}

export async function getItemNotes(id: string): Promise<Note[]> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}/notes`;
  return fetchJSON<Note[]>(url);
}

export async function addItemNote(id: string, text: string, createdBy: string): Promise<Note> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}/notes`;
  return fetchJSON<Note>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, createdBy }),
  });
}

export async function getStats(): Promise<Stats> {
  const url = `${API_BASE}/stats`;
  return fetchJSON<Stats>(url);
}

export async function getCheckoutStatus(id: string): Promise<CheckoutStatus> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}/checkout`;
  return fetchJSON<CheckoutStatus>(url);
}

export async function checkoutItem(id: string, performedBy: string, note: string): Promise<CheckoutRecord> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}/checkout`;
  return fetchJSON<CheckoutRecord>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ performedBy, note }),
  });
}

export async function checkinItem(id: string, performedBy: string, note: string): Promise<CheckoutRecord> {
  const url = `${API_BASE}/items/${encodeURIComponent(id)}/checkin`;
  return fetchJSON<CheckoutRecord>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ performedBy, note }),
  });
}

