const toggle = document.getElementById('sidebar-toggle');
const container = document.querySelector('.dashboard-container');
toggle.addEventListener('click', () => {
  container.classList.toggle('collapsed');
  toggle.classList.toggle('open');
});
