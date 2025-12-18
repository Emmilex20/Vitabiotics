import React, { useState, useEffect } from 'react';
import { initializePaystack } from '../utils/paystack';

const AdminPaystackDebug: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Not authenticated. Please sign in as an admin to view Paystack status.');
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      // If we got back HTML (e.g., the Vite dev server index.html), surface a helpful hint
      if (contentType.includes('text/html')) {
        const text = await res.text();
        setError('Server returned HTML instead of JSON — likely the request hit the front-end (Vite) server. Check VITE_API_URL and that the backend is running.');
        setStatus({ rawHtml: text });
        return;
      }

      // If the server returned a non-OK status, try to read the message and surface it
      if (!res.ok) {
        let errMsg = `Request failed with status ${res.status} ${res.statusText}`;
        try {
          const body = await res.json();
          if (body && body.message) errMsg = body.message;
        } catch (e) {
          // ignore JSON parse errors
        }
        setError(errMsg);
        return;
      }

      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(`Failed to fetch Paystack status: ${err?.message || 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="glass-card p-4 rounded-xl soft-shadow border border-emerald-50">
      <h3 className="text-lg font-bold mb-2">Paystack Status</h3>
      {loading ? (
        <p className="text-sm text-gray-600">Checking...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>Public key:</strong>{' '}
            <span className="font-mono ml-2 text-emerald-700">{status?.maskedPublic || 'Not Set'}</span>
          </div>
          <div>
            <strong>Secret Key Configured:</strong>{' '}
            <span className="ml-2">{status?.hasSecret ? 'Yes' : 'No'}</span>
          </div>
          {status?.initResult && (
            <div>
              <strong>Client Init:</strong>{' '}
              <span className="ml-2">Script Loaded: {status.initResult.loadedScript ? 'Yes' : 'No'} | Key OK: {status.initResult.keyOk ? 'Yes' : 'No'}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStatus()}
              className="px-3 py-2 bg-amber-400 rounded text-white font-semibold mt-2"
            >
              Reload
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  // Attempt client-side initialization (script + key validation)
                  const initResult = await initializePaystack();
                  setStatus((s: any) => ({ ...(s || {}), initialized: true, initResult }));
                } catch (err) {
                  setError('Initialize failed');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-3 py-2 bg-green-500 rounded text-white font-semibold mt-2"
            >
              Test Initialize (Client)
            </button>
          </div>
          {/* Raw response for debugging */}
          {status && (
            <div className="mt-3">
              <strong className="text-sm">Raw:</strong>
              {status.rawHtml ? (
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs max-h-48 overflow-auto">{status.rawHtml.slice(0, 2000)}</pre>
              ) : (
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs max-h-48 overflow-auto">{JSON.stringify(status, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPaystackDebug;
