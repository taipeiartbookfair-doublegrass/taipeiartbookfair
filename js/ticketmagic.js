// 依 spreadsheet 的 tickets sheet 動態產生票卡並控制狀態
(function () {
  const API_URL = "https://script.google.com/macros/s/AKfycbzj0helq04_cDIwtASoLNwQIvTjC5Jt8KBgtD5yUmdj8wkqLnsgwTWx52qub4LKsklj/exec"; 

  async function fetchTickets() {
    try {
      const res = await fetch(`${API_URL}?sheet=tickets`, { cache: "no-store" });
      const json = await res.json();
      return json.items || json.rows || [];
    } catch (e) {
      console.error("fetchTickets error", e);
      return [];
    }
  }

    function slugify(s) {
    return String(s || '').toLowerCase().trim()
        .replace(/[^\w\-]+/g, '-').replace(/\-+/g,'-').replace(/(^\-|\-$)/g,'');
    }

   function createCard(item) {
  const ticketType = (item.ticket_type && String(item.ticket_type).trim()) ||
                      (item.name_en || item.name_zh || item['票券名稱(英)'] || item['票券名稱(中)']) ||
                      ('ticket-' + Math.random().toString(36).slice(2,8));
  const dataType = slugify(ticketType);

  const nameZh = String(item.name_zh || item['票券名稱(中)'] || '').trim();
  const nameEn = String(item.name_en || item['票券名稱(英)'] || '').trim();
  const price = String(item.price || item['購票金額'] || '').trim();
  const quantityRaw = (item.quantity || item['限量張數'] || '');
  const quantity = (quantityRaw !== null && quantityRaw !== undefined && String(quantityRaw).trim() !== '') ? String(quantityRaw).trim() : '';

  const desc = String(item.short_desc_zh ||item['票券說明(中)'] || '').trim();
  const descEn = String(item.short_desc_en || item['票券說明(英)'] || '').trim();

  const link = String(item.purchase_link || item['購票連結'] || '').trim();
  const bg = String(item.bg_color || item['背景顏色'] || '').trim();
  const startIso = String(item.start_iso || item['開始時間ISO格式'] || '').trim();
  const endIso = String(item.end_iso || item['結束時間ISO格式'] || '').trim();
  const soldRaw = item.sold || item['是否完售'];
  const sold = soldRaw === true || soldRaw === 'TRUE' || soldRaw === 'true';

  function formatPeriodPair(sIso, eIso) {
    if (!sIso || !eIso) return { zh: '', en: '' };
    const s = new Date(sIso);
    const e = new Date(eIso);
    if (isNaN(s) || isNaN(e)) return { zh: '', en: '' };
    const zhStart = `${s.getFullYear()}/${String(s.getMonth()+1).padStart(2,'0')}/${String(s.getDate()).padStart(2,'0')}`;
    const zhEnd = `${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,'0')}/${String(e.getDate()).padStart(2,'0')}`;
    const enStart = s.toLocaleString('en-US', { month: 'numeric', day: 'numeric'});
    const enEnd = e.toLocaleString('en-US', { month: 'numeric', day: 'numeric'});
    return {
      zh: `販售日期：${zhStart} - ${zhEnd}`,
      en: `Sale Period: ${enStart} – ${enEnd}`
    };
  }

  const periodText = formatPeriodPair(startIso, endIso);

  const dataTypeLower = String(dataType).toLowerCase();
  const isOnsite = dataTypeLower.includes('onsite') || dataTypeLower.includes('on-site') ||
                   String(nameZh).indexOf('現場') !== -1 || String(nameEn).toLowerCase().indexOf('on-site') !== -1 || String(nameEn).toLowerCase().indexOf('onsite') !== -1;

  const card = document.createElement('div');
  card.className = 'ticket-card';
  card.setAttribute('data-ticket-type', dataType);
  if (sold) card.setAttribute('data-sold', 'true');
  if (startIso) card.dataset.startIso = startIso;
  if (endIso) card.dataset.endIso = endIso;
  if (link) card.dataset.link = link;
  if (bg) card.style.backgroundColor = bg;

  const h3 = document.createElement('h3');
  h3.className = 'ticket-title';
  h3.setAttribute('data-zh', nameZh);
  h3.setAttribute('data-en', nameEn);
  h3.innerHTML = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? (nameEn || nameZh) : (nameZh || nameEn);
  card.appendChild(h3);

  const priceEl = document.createElement('div');
  priceEl.className = 'ticket-price';
  priceEl.setAttribute('data-zh', price);
  priceEl.setAttribute('data-en', price);
  priceEl.textContent = price || '';
  card.appendChild(priceEl);

  const periodEl = document.createElement('div');
  periodEl.className = 'ticket-period';
  periodEl.setAttribute('data-zh', periodText.zh);
  periodEl.setAttribute('data-en', periodText.en);
  periodEl.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? periodText.en : periodText.zh;
  card.appendChild(periodEl);

  // 只有 quantity 有值時才顯示限量資訊；若空白（無限量）則不產生該元素
  if (quantity) {
    const qEl = document.createElement('div');
    qEl.className = 'ticket-limit';
    qEl.setAttribute('data-zh', `限量 ${quantity} 張`);
    qEl.setAttribute('data-en', `Limited to ${quantity} tickets`);
    qEl.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? `Limited to ${quantity} tickets` : `限量 ${quantity} 張`;
    card.appendChild(qEl);
  }

  if (desc || descEn) {
    const p = document.createElement('p');
    p.className = 'ticket-desc';
    p.setAttribute('data-zh', desc);
    p.setAttribute('data-en', descEn);
    const isEN = document.documentElement.lang && document.documentElement.lang.startsWith('en');
    const content = isEN ? (descEn || desc) : (desc || descEn);
    p.innerHTML = String(content || '').replace(/\n/g, '<br>');
    card.appendChild(p);
  }

  const status = document.createElement('div');
  status.className = isOnsite ? 'ticket-status onsite' : 'ticket-status unavailable';
  status.setAttribute('data-zh', isOnsite ? '現場購買' : '未開放');
  status.setAttribute('data-en', isOnsite ? 'On-site Purchase' : 'Not Yet Available');
  status.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? status.getAttribute('data-en') : status.getAttribute('data-zh');
  card.appendChild(status);

  // 不產生按鈕（button）給 onsite
  if (!isOnsite) {
    const a = document.createElement('a');
    a.className = 'ticket-btn unavailable';
    a.setAttribute('target', '_blank');
    a.setAttribute('data-zh', '立即購票');
    a.setAttribute('data-en', 'Buy Now');
    a.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? 'Buy Now' : '立即購票';
    if (link) a.href = link;
    // 若已完售，初始化時就標記為完售
    if (sold) {
      a.classList.remove('available');
      a.classList.add('unavailable');
      a.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? 'Sold Out' : '完售';
      a.style.pointerEvents = 'none';
      if (a.href) a.removeAttribute('href');
      status.className = 'ticket-status unavailable';
      status.setAttribute('data-zh', '完售');
      status.setAttribute('data-en', 'Sold Out');
      status.textContent = document.documentElement.lang && document.documentElement.lang.startsWith('en') ? 'Sold Out' : '完售';
    }
    card.appendChild(a);
  }

  return card;
}

// updateStatuses：同步寬鬆的 onsite 判斷
function updateStatuses() {
  const now = new Date();
  const isEN = document.documentElement.lang && document.documentElement.lang.startsWith('en');
  document.querySelectorAll('.ticket-card').forEach(card => {
    const start = card.dataset.startIso ? new Date(card.dataset.startIso) : null;
    const end = card.dataset.endIso ? new Date(card.dataset.endIso) : null;
    const statusEl = card.querySelector('.ticket-status');
    const btn = card.querySelector('.ticket-btn');
    const type = (card.getAttribute('data-ticket-type') || '').toLowerCase();
    const title = (card.querySelector('.ticket-title') && card.querySelector('.ticket-title').textContent) || '';

  const isOnsiteCard = type.includes('onsite') || type.includes('on-site') || title.indexOf('現場') !== -1 || title.toLowerCase().indexOf('on-site') !== -1 || title.toLowerCase().indexOf('onsite') !== -1;

  // 從 dataset 或屬性重新讀取 sold 狀態（由 createCard 設定）
  const soldAttr = card.getAttribute('data-sold');
  const isSold = soldAttr === 'true' || soldAttr === 'TRUE';

  if (isOnsiteCard) {
      if (statusEl) {
        statusEl.className = 'ticket-status onsite';
        statusEl.setAttribute('data-zh', '現場購買');
        statusEl.setAttribute('data-en', 'On-site Purchase');
        statusEl.textContent = isEN ? 'On-site Purchase' : '現場購買';
      }
      if (btn) btn.remove();
      return;
    }

    // 完售優先於時間判斷
    if (isSold) {
      if (statusEl) {
        statusEl.className = 'ticket-status unavailable';
        statusEl.setAttribute('data-zh', '完售');
        statusEl.setAttribute('data-en', 'Sold Out');
        statusEl.textContent = isEN ? 'Sold Out' : '完售';
      }
      if (btn) {
        btn.classList.remove('available');
        btn.classList.add('unavailable');
        btn.textContent = isEN ? 'Sold Out' : '完售';
        btn.style.pointerEvents = 'none';
        if (btn.href) btn.removeAttribute('href');
      }
      return;
    }

    const available = start && end && now >= start && now <= end;

    if (available) {
      if (statusEl) {
        statusEl.className = 'ticket-status available';
        statusEl.setAttribute('data-zh', '開放中');
        statusEl.setAttribute('data-en', 'Available');
        statusEl.textContent = isEN ? 'Available' : '開放中';
      }
      if (btn) {
        btn.classList.remove('unavailable'); btn.classList.add('available');
        btn.textContent = isEN ? (btn.getAttribute('data-en') || 'Buy Now') : (btn.getAttribute('data-zh') || '立即購票');
        btn.style.pointerEvents = '';
        if (card.dataset.link) btn.href = card.dataset.link;
      }
    } else {
      if (statusEl) {
        statusEl.className = 'ticket-status unavailable';
        statusEl.setAttribute('data-zh', '未開放');
        statusEl.setAttribute('data-en', 'Not Yet Available');
        statusEl.textContent = isEN ? 'Not Yet Available' : '未開放';
      }
      if (btn) {
        btn.classList.remove('available'); btn.classList.add('unavailable');
        btn.textContent = isEN ? 'Not Available' : '未開放';
        btn.style.pointerEvents = 'none';
        if (btn.href) btn.removeAttribute('href');
      }
    }

    const periodEl = card.querySelector('.ticket-period');
    if (periodEl) {
      const zh = periodEl.getAttribute('data-zh') || '';
      const en = periodEl.getAttribute('data-en') || '';
      periodEl.textContent = isEN ? (en || zh) : (zh || en);
    }
  });
}

  async function render() {
    const items = await fetchTickets();
    const grid = document.querySelector('.tickets-grid');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(item => {
      const card = createCard(item);
      grid.appendChild(card);
    });
    updateStatuses();
  }

  // expose update function for page to call
  window.applyTicketsFromSheet = render;
  window.updateTicketStatusFromDOM = updateStatuses;

  document.addEventListener('DOMContentLoaded', function () {
    render();
    // re-check statuses every minute (optional)
    setInterval(updateStatuses, 60 * 1000);
  });
})();