document.getElementById('nextBtn').addEventListener('click', async () => {
  const output = document.getElementById('apiOutput');
  output.textContent = 'Loading...';
  try {
    const res = await fetch('/api/message');
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = 'Failed to fetch: ' + err.message;
  }
});
