//--  helper fetch + token  --
// services/http.js
(function () {
  const API_BASE =
    (window.CONFIG && window.CONFIG.API_BASE) || 'http://localhost:5000/api';

  async function http(path, method = 'GET', body, options = {}) {
    const url = API_BASE + path;

    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const token = localStorage.getItem('yael_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const loader = document.getElementById('app-loader');
    if (options.showLoader && loader) loader.classList.remove('hidden');

    let res, data;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      data = await res.json().catch(() => ({}));
    } catch (e) {
      throw new Error('Impossible de joindre le serveur.');
    } finally {
      if (options.showLoader && loader) loader.classList.add('hidden');
    }

    if (!res.ok) {
      const err = new Error(data?.error || data?.message || `Erreur ${res.status}`);
      err.status = res.status;
      err.error = data?.error || data?.message;

      // Optionnel: si 401, on nettoie et on renvoie au login (sauf si désactivé)
      if (err.status === 401 && options.autoRedirect401 !== false) {
        localStorage.removeItem('yael_token');
        if (!/index\.html$/i.test(location.pathname)) {
          location.href = '../index.html';
        }
      }
      throw err;
    }

    return data;
  }

  // Helpers
  http.get    = (path, options)       => http(path, 'GET', undefined, options);
  http.post   = (path, body, options) => http(path, 'POST', body, options);
  http.put    = (path, body, options) => http(path, 'PUT', body, options);
  http.patch  = (path, body, options) => http(path, 'PATCH', body, options);
  http.delete = (path, options)       => http(path, 'DELETE', undefined, options);

  window.http = http;
})();
