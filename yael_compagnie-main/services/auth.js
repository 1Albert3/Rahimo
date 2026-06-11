//--  login / logout / helpers  --

window.auth = {
  async login(credentials) {
    return await window.http('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  logout() {
    localStorage.removeItem(window.TOKEN_KEY);
    localStorage.removeItem(window.USER_EMAIL_KEY);
    window.location.href = window.location.origin + '/index.html';

  },
  isLoggedIn() {
    return !!localStorage.getItem(window.TOKEN_KEY);
  },
  getEmail() {
    return localStorage.getItem(window.USER_EMAIL_KEY);
  }
};
