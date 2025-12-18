import React, { useState } from 'react';
import axios from 'axios';

export const statusBadge = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('deliv')) return 'bg-green-100 text-green-800';
  if (s.includes('transit') || s.includes('in transit')) return 'bg-amber-100 text-amber-800';
  if (s.includes('exception') || s.includes('fail')) return 'bg-red-100 text-red-800';
  return 'bg-sky-100 text-sky-800';
};

const TrackingLookupPage: React.FC = () => {
  const [tracking, setTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracking.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tracking/${encodeURIComponent(tracking.trim())}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Track your order</h2>
        <form onSubmit={handleLookup} className="flex gap-3" aria-label="Tracking lookup form">
          <label htmlFor="trackingInput" className="sr-only">Tracking number</label>
          <input id="trackingInput" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number" aria-label="Tracking number" className="flex-1 p-3 border rounded-lg" />
          <button type="submit" className="px-4 py-2 bg-vita-primary text-white rounded-lg" aria-busy={loading} aria-disabled={loading}>{loading ? 'Searching...' : 'Track'}</button>
        </form>

        <div className="mt-6">
          {loading && (
            <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-gray-600">🔎 Searching for tracking info...</div>
          )}

          {error && <div className="text-red-600" role="alert">{error}</div>}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">Tracking #: <span className="font-normal">{result.trackingNumber}</span></div>
                  <div className="text-sm text-gray-600">Carrier: {result.carrier || '—'}</div>
                  <div className="text-sm text-gray-600">Status: <span className={`inline-block px-2 py-1 rounded-full ${statusBadge(result.trackingStatus)}`}><strong>{result.trackingStatus}</strong></span></div>
                  {result.trackingUrl && <a href={result.trackingUrl} target="_blank" rel="noreferrer" className="block mt-2 text-vita-primary hover:underline">View on carrier site</a>}
                </div>

                <div className="flex-shrink-0 text-right">
                  <button onClick={() => { navigator.clipboard?.writeText(result.trackingNumber); (async()=> (await import('react-hot-toast')).default.success('Copied tracking number'))(); }} className="text-sm text-vita-primary">Copy</button>
                  <button onClick={() => { const share = async () => { try { await navigator.share?.({ title: `Tracking ${result.trackingNumber}`, text: `Track your order: ${result.trackingNumber}`, url: window.location.href }); } catch {} }; share(); }} className="ml-3 text-sm text-vita-primary">Share</button>
                </div>
              </div>

              <section aria-labelledby="timeline-heading" className="p-4 bg-white border rounded-lg">
                <h4 id="timeline-heading" className="font-semibold mb-3">Timeline</h4>
                {result.trackingHistory && result.trackingHistory.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {[...result.trackingHistory].reverse().map((t:any, idx:number) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <div className="w-10 flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusBadge(t.status)}`}>•</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</div>
                          <div className="font-medium">{t.status} {t.location ? `— ${t.location}` : ''}</div>
                          {t.message && <div className="text-gray-600">{t.message}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No tracking history available yet. Check again later or contact support for help.</div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingLookupPage;
