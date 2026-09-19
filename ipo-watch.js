(() => {
  const DATA_URL = 'ipo-data.json';
  const fmt = (v, fallback='—') => (v === null || v === undefined || v === '' ? fallback : v);
  const money = (v) => v === null || v === undefined || v === '' ? '—' : `₹${Number(v).toLocaleString('en-IN')}`;
  const pct = (v) => v === null || v === undefined || v === '' ? '—' : `${Number(v).toFixed(2)}%`;
  const dateText = (v) => v ? new Date(v).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Not updated';
  const sourceLink = (item) => item?.sourceUrl ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">Source ↗</a>` : '';

  function ipoRow(item) {
    const gmp = item.gmp !== undefined && item.gmp !== null ? money(item.gmp) : '—';
    const gmpPct = item.issuePrice ? pct((Number(item.gmp || 0) / Number(item.issuePrice)) * 100) : '—';
    return `<tr>
      <td><strong>${fmt(item.company)}</strong><small>${fmt(item.exchange, '')}${item.category ? ` · ${item.category}` : ''}</small></td>
      <td>${fmt(item.dates)}</td>
      <td>${fmt(item.priceBand || (item.issuePrice ? money(item.issuePrice) : '—'))}</td>
      <td>${fmt(item.issueSize)}</td>
      <td><strong>${gmp}</strong><small>${item.gmp !== undefined && item.gmp !== null ? gmpPct : 'Unofficial / unavailable'}</small></td>
      <td>${fmt(item.subscription)}</td>
      <td>${sourceLink(item)}</td>
    </tr>`;
  }

  function renderIpos(id, rows) {
    const body = document.querySelector(`#${id} tbody`);
    const empty = document.querySelector(`#${id}-empty`);
    if (!body) return;
    body.innerHTML = (rows || []).map(ipoRow).join('');
    if (empty) empty.hidden = (rows || []).length > 0;
  }

  function renderPerformance(rows) {
    const body = document.querySelector('#ipoPerformance tbody');
    const empty = document.querySelector('#performance-empty');
    if (!body) return;
    body.innerHTML = (rows || []).map(item => `<tr>
      <td><strong>${fmt(item.company)}</strong></td>
      <td>${money(item.issuePrice)}</td>
      <td>${money(item.listingPrice)}</td>
      <td>${money(item.currentPrice)}</td>
      <td>${pct(item.listingGainPct)}</td>
      <td>${pct(item.currentReturnPct)}</td>
      <td>${sourceLink(item)}</td>
    </tr>`).join('');
    if (empty) empty.hidden = (rows || []).length > 0;
  }

  function renderUnlisted(rows) {
    const grid = document.querySelector('#unlistedData');
    const empty = document.querySelector('#unlisted-empty');
    if (!grid) return;
    grid.innerHTML = (rows || []).map(item => `<article class="unlisted-live-card">
      <div class="live-top"><small>UNLISTED</small><span>${fmt(item.status)}</span></div>
      <h3>${fmt(item.company)}</h3>
      <div class="live-price">${money(item.referencePrice)}</div>
      <p>${fmt(item.note, 'Reference / indicative price only. Verify transaction terms before acting.')}</p>
      <div class="live-meta"><span>Updated ${dateText(item.updatedAt)}</span>${sourceLink(item)}</div>
    </article>`).join('');
    if (empty) empty.hidden = (rows || []).length > 0;
  }

  function renderMeta(meta) {
    const el = document.querySelector('#ipoLastUpdated');
    if (el) el.textContent = meta?.lastUpdated ? `Last updated ${dateText(meta.lastUpdated)}` : 'Data feed not connected';
  }

  fetch(DATA_URL, {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      renderMeta(data.meta);
      renderIpos('mainboardTable', data.mainboard);
      renderIpos('smeTable', data.sme);
      renderPerformance(data.performance);
      renderUnlisted(data.unlisted);
    })
    .catch(err => {
      console.error('Igris IPO data feed:', err);
      renderMeta(null);
      ['mainboardTable-empty','smeTable-empty','performance-empty','unlisted-empty'].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = 'Data feed unavailable. Please try again later.';
      });
    });
})();