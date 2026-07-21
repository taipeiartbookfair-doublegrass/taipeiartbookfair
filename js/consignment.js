// ── Consignment Form ──────────────────────────────────────────────────────────
const CONSIGNMENT_API_URL =
  "https://script.google.com/macros/s/AKfycbzT1DmsigwaQ6OwwpSARcJtkFH_NDRmFmXrfkG3npW3A6zz2O_1eaa7OI6zJzRYss0_/exec";

// Consent audit trail — separate spreadsheet from booth contracts
const CONSIGNMENT_CONSENT_API_URL =
  "https://script.google.com/macros/s/AKfycbxnl2fdytNjxJFmXeuT_nVmjqMQAQ91CBBBef6rgXrkOTAvBDB8X17qInVn8qGR3XqM/exec";

// User data supplied by parent dashboard via postMessage (name + email)
// unit and phone are filled by the user in the agreement modal
let _csUser = { name: "", email: "", unit: "", phone: "" };
window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "cs-user-data") {
    _csUser.name = e.data.name || "";
    _csUser.email = e.data.email || "";
  }
});

// ── Language toggle ────────────────────────────────────────────────────────────
window.setConsignmentLang = function (lang) {
  const isZh = lang === "zh";
  document.querySelectorAll(".zh").forEach((el) => {
    el.style.display = isZh ? "" : "none";
  });
  document.querySelectorAll(".en").forEach((el) => {
    el.style.display = isZh ? "none" : "";
  });
  document.querySelectorAll("[data-zh][data-en]").forEach((el) => {
    el.placeholder = isZh ? el.dataset.zh : el.dataset.en;
  });
  const btnZh = document.getElementById("consignment-lang-zh");
  const btnEn = document.getElementById("consignment-lang-en");
  if (btnZh) {
    btnZh.classList.toggle("active", isZh);
  }
  if (btnEn) {
    btnEn.classList.toggle("active", !isZh);
  }
};

function normalizeSizeValue(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  return /cm$/i.test(trimmed) ? trimmed : `${trimmed} cm`;
}

function normalizePagesValue(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  return /pages?$/i.test(trimmed) ? trimmed : `${trimmed} Pages`;
}

function attachBookUnitHandlers() {}

// ── Book entry template ────────────────────────────────────────────────────────
let bookCount = 0;

window.addConsignmentBook = function () {
  bookCount++;
  const idx = bookCount;
  const container = document.getElementById("consignment-book-list");

  const CATEGORIES = [
    "illustration&comic",
    "photography",
    "magazine",
    "art&design",
    "experimental&conceptual",
    "project&curatorial",
    "writing&literature",
  ];

  const LANGUAGES = [
    "Traditional Chinese",
    "English",
    "Japanese",
    "Korean",
    "Simplified Chinese",
    "None",
    "French",
    "German",
    "Spanish",
    "Italian",
    "Taiwanese",
    "Thai",
    "Vietnamese",
    "Danish",
    "Czech",
    "Arabic",
    "Dutch",
    "Malay",
    "Georgian",
    "Other 其他",
  ];

  const catOptions = CATEGORIES.map(
    (c) => `<option value="${c}">${c}</option>`,
  ).join("");
  const langCheckboxes =
    LANGUAGES.filter((l) => l !== "Other 其他")
      .map(
        (l) =>
          `<label class="cs-check-label"><input type="checkbox" name="lang_opt_${idx}" value="${l}"> ${l}</label>`,
      )
      .join("") +
    `<label class="cs-check-label"><input type="checkbox" name="lang_other_${idx}" value="Other 其他" onchange="var t=document.getElementById('lang-other-text-${idx}');t.style.display=this.checked?'block':'none';"> Other 其他</label>` +
    `<input type="text" id="lang-other-text-${idx}" name="lang_other_text_${idx}" placeholder="請填入 please specify" style="display:none;margin-top:4px;width:100%;box-sizing:border-box;">`;

  const div = document.createElement("div");
  div.className = "consignment-book-entry cs-book-card";
  div.id = `book-entry-${idx}`;

  div.innerHTML = `
    <div class="cs-book-card-header">
      <span class="cs-pill light" style="margin-bottom:0;">
        <span class="zh">書籍 #${idx}</span><span class="en" style="display:none;">Book #${idx}</span>
      </span>
      ${idx > 1 ? `<button type="button" class="cs-remove-btn" onclick="removeConsignmentBook(${idx})" title="Remove">✕</button>` : ""}
    </div>

    <div class="cs-field-row">
      <div class="cs-field full">
        <label class="cs-label zh">寄售單位名稱 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Brand Name <span class="cs-req">*</span></label>
        <input type="text" name="brand_${idx}" required placeholder="必填 required">
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">書名（英）<span class="cs-req">* 擇一必填</span></label>
        <label class="cs-label en" style="display:none;">Title (EN) <span class="cs-req">* At least one</span></label>
        <input type="text" name="title_en_${idx}">
      </div>
      <div class="cs-field">
        <label class="cs-label zh">書名（中）<span class="cs-req">* 擇一必填</span></label>
        <label class="cs-label en" style="display:none;">Title (ZH) <span class="cs-req">* At least one</span></label>
        <input type="text" name="title_zh_${idx}">
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">含稅定價（NTD）<span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Price (NT$) <span class="cs-req">*</span></label>
        <input type="number" name="price_${idx}" required min="0" placeholder="必填 required">
      </div>
      <div class="cs-field">
        <label class="cs-label zh">數量（本）<span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Quantity <span class="cs-req">*</span></label>
        <input type="number" name="qty_${idx}" required min="1" placeholder="必填 required">
        <div class="cs-field-hint">
          <span class="zh">可賣數量 = 寄來數量 − 1 樣書</span>
          <span class="en" style="display:none;">Sellable qty = shipped qty − 1 sample</span>
        </div>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">創作者 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Creator <span class="cs-req">*</span></label>
        <input type="text" name="creator_${idx}" required>
      </div>
      <div class="cs-field">
        <label class="cs-label zh">出版單位 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Publisher <span class="cs-req">*</span></label>
        <input type="text" name="publisher_${idx}" required>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">分類 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Category <span class="cs-req">*</span></label>
        <select name="category_${idx}" required>
          <option value="">－</option>
          ${catOptions}
        </select>
      </div>
      <div class="cs-field">
        <label class="cs-label zh">來自地區 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">From <span class="cs-req">*</span></label>
        <select name="region_${idx}" required>
          <option value="">－</option>
          <option value="Taiwan">Taiwan</option>
          <option value="Overseas">Overseas</option>
        </select>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">尺寸（cm）<span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Size (cm) <span class="cs-req">*</span></label>
        <div style="display:flex;align-items:center;gap:0.4em;">
          <input type="text" name="size_${idx}" required placeholder="長 × 寬 × 厚" data-zh="長 × 寬 × 厚" data-en="H × W × D" style="flex:1;min-width:0;">
          <span style="font-size:0.8rem;color:#888;white-space:nowrap;">cm</span>
        </div>
      </div>
      <div class="cs-field">
        <label class="cs-label zh">頁數 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Pages <span class="cs-req">*</span></label>
        <div style="display:flex;align-items:center;gap:0.4em;">
          <input type="text" inputmode="numeric" name="pages_${idx}" required placeholder="必填 required" style="flex:1;min-width:0;">
          <span style="font-size:0.8rem;color:#888;white-space:nowrap;">pages</span>
        </div>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field">
        <label class="cs-label zh">出版年（西元）<span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Publish Year <span class="cs-req">*</span></label>
        <input type="number" name="year_${idx}" required min="1900" max="2100" placeholder="e.g. 2025">
      </div>
      <div class="cs-field">
        <label class="cs-label zh">語言（可多選）</label>
        <label class="cs-label en" style="display:none;">Language (multi-select)</label>
        <div class="cs-lang-checks">${langCheckboxes}</div>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field full">
        <label class="cs-label">ISBN / ISSN</label>
        <input type="text" name="isbn_${idx}" placeholder="選填 optional">
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field full">
        <label class="cs-label zh">書籍介紹（中文）<span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Intro (Chinese) <span class="cs-req">*</span></label>
        <textarea name="intro_zh_${idx}" rows="3" required></textarea>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field full">
        <label class="cs-label zh">書籍介紹（英文）</label>
        <label class="cs-label en" style="display:none;">Intro (English)</label>
        <textarea name="intro_en_${idx}" rows="3" placeholder="選填 optional"></textarea>
      </div>
    </div>

    <div class="cs-field-row">
      <div class="cs-field full">
        <label class="cs-label zh">Google Drive 照片連結 <span class="cs-req">*</span></label>
        <label class="cs-label en" style="display:none;">Google Drive Photo Folder Link <span class="cs-req">*</span></label>
        <input type="url" name="photos_${idx}" required placeholder="https://drive.google.com/drive/folders/...">
        <div class="cs-field-hint zh">請建立一個資料夾，放入封面、封底及三張以上內頁照片，並設定「知道連結的人可以檢視」後貼上連結。</div>
        <div class="cs-field-hint en" style="display:none;">Create a folder with front cover, back cover, and 3+ interior photos. Set sharing to "Anyone with the link can view" then paste the link.</div>
      </div>
    </div>
  `;

  container.appendChild(div);
  attachBookUnitHandlers(div, idx);

  // Re-apply current language to the newly added entry
  const btnZh = document.getElementById("consignment-lang-zh");
  if (btnZh && !btnZh.classList.contains("active")) {
    setConsignmentLang("en");
  }
};

window.removeConsignmentBook = function (idx) {
  const el = document.getElementById(`book-entry-${idx}`);
  if (el) el.remove();
};

// ── Consignment consent audit trail ───────────────────────────────────────────
function saveConsignmentConsentRecord() {
  const userId = typeof getCookie === "function" ? getCookie("account") : "";
  if (!userId) return;

  fetch(CONSIGNMENT_CONSENT_API_URL, {
    redirect: "follow",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "save_consent",
      userId,
      name: _csUser.name,
      email: _csUser.email,
      unit: _csUser.unit,
      phone: _csUser.phone,
      frontendVersion: CONSIGNMENT_AGREEMENT_PDF,
    }).toString(),
  }).catch(function () {});
}

// ── Consignment Consent Modal ──────────────────────────────────────────────────
const CONSIGNMENT_AGREEMENT_PDF = "dashboard/consignment-agreement.pdf";

function openConsignmentModal() {
  const modal = document.getElementById("consignment-consent-modal");
  const nameInput = document.getElementById("consignment-modal-name");
  const emailInput = document.getElementById("consignment-modal-email");
  const unitInput = document.getElementById("consignment-modal-unit");
  const phoneInput = document.getElementById("consignment-modal-phone");
  const pdfFrame = document.getElementById("consignment-modal-pdf");
  const versionEl = document.getElementById("consignment-modal-version");
  const modalCb = document.getElementById("consignment-modal-checkbox");
  const confirmBtn = document.getElementById("consignment-modal-confirm-btn");
  const closeBtn = document.getElementById("consignment-modal-close-btn");
  const statusEl = document.getElementById("consignment-modal-status");
  if (!modal) return;

  // Fill in read-only user info from account
  if (nameInput) nameInput.value = _csUser.name;
  if (emailInput) emailInput.value = _csUser.email;

  // Restore previously entered unit/phone if modal is reopened
  if (unitInput) unitInput.value = _csUser.unit;
  if (phoneInput) phoneInput.value = _csUser.phone;

  if (pdfFrame) pdfFrame.src = CONSIGNMENT_AGREEMENT_PDF;
  if (versionEl) versionEl.textContent = CONSIGNMENT_AGREEMENT_PDF;

  // Reset modal state
  if (modalCb) {
    modalCb.checked = false;
  }
  if (statusEl) {
    statusEl.textContent = "";
  }
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.style.background = "#ccc";
    confirmBtn.style.cursor = "not-allowed";
    confirmBtn.textContent = "確認同意 Confirm";
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Checkbox toggles confirm button
  if (modalCb && confirmBtn) {
    modalCb.onchange = function () {
      confirmBtn.disabled = !modalCb.checked;
      confirmBtn.style.background = modalCb.checked ? "#000" : "#ccc";
      confirmBtn.style.cursor = modalCb.checked ? "pointer" : "not-allowed";
    };
  }

  // Confirm button
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      if (!modalCb || !modalCb.checked) return;

      const unit = unitInput ? unitInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      if (!unit || !phone) {
        if (statusEl) {
          statusEl.textContent =
            "請填寫寄售單位及電話。Please fill in organization and phone.";
        }
        return;
      }

      // Save unit and phone into user state
      _csUser.unit = unit;
      _csUser.phone = phone;

      // Mark the hidden checkbox in the form as agreed
      const formCb = document.getElementById("consignment-agree-checkbox");
      if (formCb) formCb.checked = true;

      // Log consent to consignment's own spreadsheet
      saveConsignmentConsentRecord();

      // Update UI: hide open button, show status
      const openBtn = document.getElementById("consignment-open-modal-btn");
      const statusSpan = document.getElementById("consignment-agree-status");
      if (openBtn) openBtn.style.display = "none";
      if (statusSpan) {
        const now = new Date().toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Taipei",
        });
        statusSpan.textContent = "✓ 已確認同意 Agreed (" + now + " GMT+8)";
      }

      closeConsignmentModal();
    };
  }

  // Close button + backdrop click
  if (closeBtn) closeBtn.onclick = closeConsignmentModal;
  modal.onclick = function (e) {
    if (e.target === modal) closeConsignmentModal();
  };
}

function closeConsignmentModal() {
  const modal = document.getElementById("consignment-consent-modal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

// ── Form submission ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  // Add first book entry by default
  addConsignmentBook();

  // Wire up the "Read & Confirm" button
  const openModalBtn = document.getElementById("consignment-open-modal-btn");
  if (openModalBtn)
    openModalBtn.addEventListener("click", openConsignmentModal);

  const form = document.getElementById("consignment-main-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const agreeCheck = document.getElementById("consignment-agree-checkbox");
    const finalCheck = document.getElementById("consignment-final-agree");
    const statusEl = document.getElementById("consignment-submit-status");
    const submitBtn = document.getElementById("consignment-submit-btn");

    if (!agreeCheck.checked) {
      alert(
        "請先閱讀並確認寄售合約書。\nPlease read and confirm the Consignment Agreement first.",
      );
      openConsignmentModal();
      return;
    }
    if (!finalCheck.checked) {
      alert("請確認並勾選最終聲明。\nPlease check the final declaration.");
      return;
    }

    const entries = document.querySelectorAll(".consignment-book-entry");
    if (!entries.length) {
      alert("請至少新增一本書籍。\nPlease add at least one book.");
      return;
    }

    submitBtn.disabled = true;
    statusEl.style.color = "#555";
    statusEl.textContent = "送出中… Submitting…";

    const books = [];
    let hasError = false;

    for (const entry of entries) {
      const idx = entry.id.replace("book-entry-", "");
      const get = (name) =>
        (entry.querySelector(`[name="${name}_${idx}"]`) || {}).value || "";

      const titleEn = get("title_en");
      const titleZh = get("title_zh");
      if (!titleEn && !titleZh) {
        alert(
          `書籍 #${idx}：英文書名或中文書名至少填一項。\nBook #${idx}: Please provide at least one title (EN or ZH).`,
        );
        hasError = true;
        break;
      }

      const photosLink = get("photos");
      if (!photosLink) {
        alert(
          `書籍 #${idx}：請貼上 Google Drive 照片資料夾連結。\nBook #${idx}: Please provide the Google Drive photo folder link.`,
        );
        hasError = true;
        break;
      }

      const langs = Array.from(
        entry.querySelectorAll(`[name="lang_opt_${idx}"]:checked`),
      ).map((c) => c.value);
      const otherCb = entry.querySelector(`[name="lang_other_${idx}"]`);
      const otherTxt = (
        entry.querySelector(`[name="lang_other_text_${idx}"]`) || {}
      ).value?.trim();
      if (otherCb && otherCb.checked) langs.push(otherTxt || "Other 其他");

      const rawSize = get("size");
      const rawPages = get("pages");
      if (!rawSize.trim()) {
        alert(
          `書籍 #${idx}：請填寫尺寸。
Book #${idx}: Please provide the size.`,
        );
        hasError = true;
        break;
      }
      if (
        !/^[0-9]+(?:\s*[xX×]\s*[0-9]+(?:\s*[xX×]\s*[0-9]+)?)?(?:\s*cm)?$/.test(
          rawSize.trim(),
        )
      ) {
        alert(
          `書籍 #${idx}：尺寸格式請輸入數值，例如 21 x 14 x 2。
Book #${idx}: Please enter a valid size format, e.g. 21 x 14 x 2.`,
        );
        hasError = true;
        break;
      }
      if (!/^[0-9]+(?:\s*pages?)?$/i.test(rawPages.trim())) {
        alert(
          `書籍 #${idx}：頁數請填寫正確數字。
Book #${idx}: Please enter pages as a number.`,
        );
        hasError = true;
        break;
      }

      books.push({
        brand: get("brand"),
        title_en: titleEn,
        title_zh: titleZh,
        price: get("price"),
        qty: get("qty"),
        creator: get("creator"),
        publisher: get("publisher"),
        category: get("category"),
        region: get("region"),
        size: normalizeSizeValue(rawSize),
        pages: normalizePagesValue(rawPages),
        year: get("year"),
        language: langs.join(", "),
        isbn: get("isbn"),
        intro_zh: get("intro_zh"),
        intro_en: get("intro_en"),
        photos: photosLink,
      });
    }

    if (hasError) {
      submitBtn.disabled = false;
      statusEl.textContent = "";
      return;
    }

    const message = document.getElementById("consignment-message").value.trim();
    const account = typeof getCookie === "function" ? getCookie("account") : "";

    statusEl.textContent = "送出中… Submitting…";

    try {
      const payload = new URLSearchParams({
        action: "submit_consignment",
        account,
        books: JSON.stringify(books),
        message,
        submittedAt: new Date().toISOString(),
      }).toString();

      const res = await fetch(CONSIGNMENT_API_URL, {
        redirect: "follow",
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
      });

      const text = await res.text();
      if (text.includes("error") || text.includes("Error"))
        throw new Error(text);

      statusEl.style.color = "green";
      statusEl.textContent =
        "✓ 已送出喔！請檢查信箱確認信。Submitted! Please check your email for confirmation.";
      submitBtn.disabled = false;
      form.reset();
      document.getElementById("consignment-book-list").innerHTML = "";
      bookCount = 0;
      addConsignmentBook();

      // Reset consent state
      _csUser.unit = "";
      _csUser.phone = "";
      const openBtn = document.getElementById("consignment-open-modal-btn");
      const agreeStatus = document.getElementById("consignment-agree-status");
      if (openBtn) openBtn.style.display = "";
      if (agreeStatus) agreeStatus.textContent = "";
    } catch (err) {
      statusEl.style.color = "#c00";
      statusEl.textContent = `送出失敗 Submission failed: ${err.message}`;
      submitBtn.disabled = false;
    }
  });
});
