(async () => {
  const urls = [
    '/es/dashboard',
    '/es/dashboard/owners',
    '/es/dashboard/units',
    '/es/dashboard/owners/create',
    '/es/dashboard/units/create'
  ];
  const base = 'http://localhost:3000';

  for (const u of urls) {
    try {
      const res = await fetch(base + u);
      const text = await res.text();
      console.log(`URL: ${u} STATUS: ${res.status}`);
      console.log(text.slice(0, 500).replace(/\n/g, '\n'));
      console.log('---');
    } catch (err) {
      console.error(`ERROR fetching ${u}:`, err.message || err);
    }
  }
})();
