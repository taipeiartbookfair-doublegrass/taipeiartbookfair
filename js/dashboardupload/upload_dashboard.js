// 舊 API：負責主試算表的讀寫（同意書打勾、匯款狀態等），不要動
const uploadApiUrl =
  "https://script.google.com/macros/s/AKfycbyRV_uiklsvHWPeBblxTz47OlTnQ-IeKIxifYZ1D-8ZzHdljVMEbXwsKGO84Agon7mU8g/exec";

// 檔案上傳 API：catalog / marketing 上傳到 Google Drive
const fileUploadApiUrl =
  "https://script.google.com/macros/s/AKfycbytwthS-PvDMUZ5iRFCtDnowgcrrtsbeyjlohpOQNpiUyTnGo0YT77eSKz9ILOp9X_i/exec";

// 新 API：只負責寫入 consent audit trail（電子簽章法留存）
const consentApiUrl =
  "https://script.google.com/macros/s/AKfycbxQqppVyIedlyrGFVDrEwmo0qjFeCvVS4VlPrrTLArszrj0i2-9mtfMTP8zASRwBp9l4g/exec";

// ★ 每次換同意書 PDF 時只改這一行（檔名即版本號）。Apps Script 不需要動。
const DECLARATION_PDF_FILENAME = "exhibitor-declaration-2026v2.pdf";

// 將 clickwrap 同意紀錄送至後端並寫入 audit trail
async function saveConsentToAPI() {
  const userId = account || "";
  const nameEl = document.getElementById("contact-person");
  const emailEl = document.getElementById("email");
  const name = nameEl ? nameEl.textContent.trim() : "";
  const email = emailEl ? emailEl.textContent.trim() : "";

  console.log("[consent] 準備送出 audit trail", {
    userId,
    name,
    email,
    version: DECLARATION_PDF_FILENAME,
  });

  if (!userId || !email) {
    console.warn("[consent] 缺少 userId 或 email，略過");
    return;
  }

  try {
    const params = new URLSearchParams({
      action: "save_consent",
      userId,
      name,
      email,
      frontendVersion: DECLARATION_PDF_FILENAME,
    }).toString();

    console.log("[consent] 打 API:", consentApiUrl);
    const res = await fetch(consentApiUrl, {
      redirect: "follow",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    console.log("[consent] HTTP status:", res.status);
    const text = await res.text();
    console.log("[consent] 回應內容:", text);

    const data = JSON.parse(text);
    if (data.success) {
      console.log("[consent] ✓ audit trail 寫入成功", data);
    } else {
      console.warn("[consent] ✗ 後端回傳失敗：", data.message);
    }
  } catch (err) {
    console.error("[consent] fetch 錯誤：", err);
  }
}

// account 已由 dashboard-basic.js 宣告為全域變數，此處不重複宣告

// 3 個 folder ID
const folderIds = {
  marketing: "1GBQiVxTbCdl-kCCMvNTc9Ejjhfsxu9ds",
  catalog: "1uE7korPZDcMRCo0nTkoiowEh3sVpw5QA",
};

// 共用顯示與 localStorage key
const uploadStatusMap = {
  catalog: {
    btn: "uploadBtnCatalog",
    file: "catalog-file",
    status: "catalog-upload-status",
    storage: "catalog-uploaded-filename",
    storageTime: "catalog-uploaded-time",
    folder: folderIds.catalog,
    successMsg: "草率簿檔案上傳成功 Catalog uploaded successfully!",
    failMsg: "草率簿檔案上傳失敗 Upload failed.",
    typeName: "草率簿檔案",
    typeNameEn: "Catalog file",
    apiField: "草率簿", // 試算表中的欄位名稱
  },
  marketing: {
    btn: "uploadBtnMarketing",
    file: "marketing-file",
    status: "marketing-upload-status",
    storage: "marketing-uploaded-filename",
    storageTime: "marketing-uploaded-time",
    folder: folderIds.marketing,
    successMsg:
      "行銷素材檔案上傳成功 Marketing material uploaded successfully!",
    failMsg: "行銷素材檔案上傳失敗 Upload failed.",
    typeName: "行銷素材檔案",
    typeNameEn: "Marketing material",
    apiField: "行銷素材", // 試算表中的欄位名稱
  },
  declaration: {
    btn: "confirmBtnDeclaration",
    file: null,
    status: "declaration-upload-status",
    storage: "declaration-uploaded-filename",
    storageTime: "declaration-uploaded-time",
    folder: null,
    successMsg: "",
    failMsg: "",
    typeName: "同意書",
    typeNameEn: "Declaration",
    apiField: "同意書",
  },
};

// 顯示勾勾圖示的函數
function showCheckmark(btn, conf) {
  // 檢查是否已經有勾勾圖示
  const existingCheckmark = btn.parentElement.querySelector(
    `.upload-checkmark-${conf.btn}`,
  );
  if (existingCheckmark) {
    // 如果已經存在，觸發動畫
    existingCheckmark.classList.remove("checkmark-animate");
    setTimeout(() => {
      existingCheckmark.classList.add("checkmark-animate");
    }, 10);
    return;
  }

  // 創建勾勾圖示元素
  const checkmark = document.createElement("span");
  checkmark.className = `upload-checkmark upload-checkmark-${conf.btn}`;
  checkmark.innerHTML = "✓";
  checkmark.style.cssText = `
    display: inline-block;
    margin-left: 0.5em;
    color: #28a745;
    font-size: 1.8em;
    font-weight: bold;
    line-height: 1;
    vertical-align: middle;
    opacity: 0;
    transform: scale(0) rotate(-45deg);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-shadow: 0 0 3px rgba(40, 167, 69, 0.5);
  `;

  // 插入到按鈕後面
  btn.parentElement.insertBefore(checkmark, btn.nextSibling);

  // 觸發動畫（先放大再恢復，有彈性效果）
  setTimeout(() => {
    checkmark.style.opacity = "1";
    checkmark.style.transform = "scale(1.2) rotate(0deg)";
    checkmark.classList.add("checkmark-animate");

    // 再稍微縮小到正常大小，形成彈性效果
    setTimeout(() => {
      checkmark.style.transform = "scale(1) rotate(0deg)";
    }, 200);
  }, 10);
}

// 移除勾勾圖示的函數
function removeCheckmark(btn, conf) {
  const checkmark = btn.parentElement.querySelector(
    `.upload-checkmark-${conf.btn}`,
  );
  if (checkmark) {
    checkmark.style.opacity = "0";
    checkmark.style.transform = "scale(0)";
    setTimeout(() => {
      if (checkmark.parentElement) {
        checkmark.remove();
      }
    }, 300);
  }
}

// 更新試算表的布林值
async function updateSpreadsheetStatus(apiField, value) {
  if (!account || !apiField) {
    console.warn("無法更新試算表：缺少 account 或 apiField");
    return false;
  }

  try {
    const params = new URLSearchParams({
      action: "update_dashboard_info",
      account: account,
      [apiField]: value ? "true" : "false", // 轉換為字串
    }).toString();

    // 使用主 API URL，因為 uploadApiUrl 可能沒有 update_dashboard_info 處理器
    const mainApiUrl =
      "https://script.google.com/macros/s/AKfycbyRV_uiklsvHWPeBblxTz47OlTnQ-IeKIxifYZ1D-8ZzHdljVMEbXwsKGO84Agon7mU8g/exec";
    const updateRes = await fetch(mainApiUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await updateRes.json();
    if (data.success) {
      console.log(`成功更新試算表欄位 ${apiField} 為 ${value}`);
      return true;
    } else {
      console.warn(`更新試算表失敗：${data.message || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    console.error(`更新試算表時發生錯誤：`, error);
    return false;
  }
}

// 從 API 獲取上傳狀態並顯示勾勾
async function loadUploadStatusFromAPI() {
  if (!account) {
    console.warn("無法從 API 載入狀態：缺少 account");
    return;
  }

  try {
    const params = new URLSearchParams({
      action: "get_dashboard_info",
      account: account,
    }).toString();

    const res = await fetch(uploadApiUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: params,
    });

    const data = await res.json();
    if (data.success && data.data) {
      const apiData = data.data;

      // 同意書：特別處理 checkbox 狀態
      const declarationConf = uploadStatusMap.declaration;
      const declarationAgreed = !!apiData[declarationConf.apiField];
      const checkbox = document.getElementById("declaration-agree-checkbox");
      const confirmBtn = document.getElementById("confirmBtnDeclaration");
      const declarationStatus = document.getElementById(declarationConf.status);
      const declarationBtn = document.getElementById(declarationConf.btn);

      if (declarationAgreed) {
        if (checkbox) {
          checkbox.checked = true;
          checkbox.disabled = true;
        }
        if (confirmBtn) confirmBtn.style.display = "none";
        // 隱藏開啟 modal 的按鈕
        const openModalBtn = document.getElementById(
          "declaration-open-modal-btn",
        );
        if (openModalBtn) openModalBtn.style.display = "none";
        if (declarationStatus) {
          declarationStatus.textContent = "✓ 已確認同意 Agreed";
          declarationStatus.style.color = "green";
          declarationStatus.style.fontSize = "0.8em";
          declarationStatus.style.marginTop = "0.3rem";
        }
        if (declarationBtn) showCheckmark(declarationBtn, declarationConf);
      }

      // 檢查其他上傳類型（排除 declaration）
      Object.keys(uploadStatusMap).forEach((key) => {
        if (key === "declaration") return;
        const conf = uploadStatusMap[key];
        const btn = document.getElementById(conf.btn);
        const statusSpan = document.getElementById(conf.status);

        if (!conf.apiField) return;

        const isUploaded = !!apiData[conf.apiField];

        if (isUploaded && btn) {
          showCheckmark(btn, conf);

          if (statusSpan) {
            const filename = localStorage.getItem(conf.storage);
            const uploadTimeString = localStorage.getItem(conf.storageTime);

            if (filename) {
              let displayTime = "";
              if (uploadTimeString) {
                const parts = uploadTimeString.split("|");
                displayTime = parts[0] || uploadTimeString;
              }

              statusSpan.textContent = displayTime
                ? `✓ 已上傳 Uploaded: ${filename} (${displayTime})`
                : `✓ 已上傳 Uploaded: ${filename}`;
              statusSpan.style.color = "green";
              statusSpan.style.fontSize = "0.8em";
              statusSpan.style.marginTop = "0.3rem";
            } else {
              statusSpan.textContent = "✓ 已上傳 Uploaded";
              statusSpan.style.color = "green";
              statusSpan.style.fontSize = "0.8em";
              statusSpan.style.marginTop = "0.3rem";
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("從 API 載入上傳狀態時發生錯誤：", error);
  }
}

// 同意書：點擊按鈕開啟 modal，modal 確認後永久鎖定
(function setupDeclarationModal() {
  const openBtn = document.getElementById("declaration-open-modal-btn");
  const mainCheckbox = document.getElementById("declaration-agree-checkbox");
  const statusSpan = document.getElementById("declaration-upload-status");
  const conf = uploadStatusMap.declaration;

  if (!openBtn) return;

  openBtn.addEventListener("click", function () {
    openConsentModal();
  });

  function openConsentModal() {
    const modal = document.getElementById("consent-modal");
    const nameInput = document.getElementById("consent-modal-name");
    const emailInput = document.getElementById("consent-modal-email");
    const modalCb = document.getElementById("consent-modal-checkbox");
    const confirmBtn = document.getElementById("consent-modal-confirm-btn");
    const closeBtn = document.getElementById("consent-modal-close-btn");
    const modalStatus = document.getElementById("consent-modal-status");

    if (!modal) return;

    // 從頁面 DOM 抓登入者資料（由 dashboard-basic.js 填入）
    const nameEl = document.getElementById("contact-person");
    const emailEl = document.getElementById("email");
    if (nameInput) nameInput.value = nameEl ? nameEl.textContent.trim() : "";
    if (emailInput)
      emailInput.value = emailEl ? emailEl.textContent.trim() : "";

    // 顯示版本號
    // 動態設定 PDF src（版本號即檔名）
    const pdfFrame = document.getElementById("consent-modal-pdf");
    if (pdfFrame) pdfFrame.src = "dashboard/" + DECLARATION_PDF_FILENAME;

    const versionEl = document.getElementById("consent-modal-version");
    if (versionEl) versionEl.textContent = DECLARATION_PDF_FILENAME;

    // 重置 modal 狀態
    if (modalCb) {
      modalCb.checked = false;
    }
    if (modalStatus) {
      modalStatus.textContent = "";
    }
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.style.background = "#ccc";
      confirmBtn.style.cursor = "not-allowed";
      confirmBtn.textContent = "確認同意 Confirm";
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // modal checkbox → 啟用/停用確認按鈕
    if (modalCb && confirmBtn) {
      modalCb.onchange = function () {
        confirmBtn.disabled = !modalCb.checked;
        confirmBtn.style.background = modalCb.checked ? "#000" : "#ccc";
        confirmBtn.style.cursor = modalCb.checked ? "pointer" : "not-allowed";
      };
    }

    // 關閉按鈕
    if (closeBtn) closeBtn.onclick = closeModal;

    // 點 modal 背景關閉
    modal.onclick = function (e) {
      if (e.target === modal) closeModal();
    };

    // 確認按鈕
    if (confirmBtn) {
      confirmBtn.onclick = async function () {
        if (!modalCb || !modalCb.checked) return;

        confirmBtn.disabled = true;
        confirmBtn.textContent = "處理中 Processing...";
        if (modalStatus) {
          modalStatus.textContent = "";
        }

        const ok = await updateSpreadsheetStatus(conf.apiField, true);

        if (ok) {
          const now = new Date();
          const uploadTime = now.toLocaleString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Taipei",
          }) + " (GMT+8)";

          // 主頁面狀態更新：隱藏按鈕、顯示完成訊息
          if (openBtn) openBtn.style.display = "none";
          if (mainCheckbox) {
            mainCheckbox.checked = true;
            mainCheckbox.disabled = true;
          }

          // 同步更新上方參展資格區的 check-declaration
          const checkDeclaration = document.getElementById("check-declaration");
          if (checkDeclaration) checkDeclaration.checked = true;

          if (statusSpan) {
            statusSpan.textContent = `✓ 已確認同意 Agreed (${uploadTime})`;
            statusSpan.style.color = "green";
          }

          // 觸發 agreement-section 的 Completed overlay
          const section = document.getElementById("agreement-section");
          if (section && !section.querySelector(".overlay-completed")) {
            section.style.position = "relative";
            section.style.overflow = "hidden";
            section.style.pointerEvents = "none";
            const overlay = document.createElement("div");
            overlay.className = "overlay-completed";
            overlay.textContent = "Completed";
            section.appendChild(overlay);
            setTimeout(() => overlay.classList.add("active"), 10);
          }

          localStorage.setItem(conf.storage, "agreed");
          localStorage.setItem(
            conf.storageTime,
            `${uploadTime}|${now.toISOString()}`,
          );

          // Audit trail（fire-and-forget，不影響 UI）
          saveConsentToAPI();

          closeModal();
        } else {
          if (modalStatus) {
            modalStatus.textContent =
              "確認失敗，請稍後再試。Failed to confirm.";
          }
          confirmBtn.disabled = false;
          confirmBtn.textContent = "確認同意 Confirm";
          if (modalCb) {
            confirmBtn.style.background = modalCb.checked ? "#000" : "#ccc";
            confirmBtn.style.cursor = modalCb.checked
              ? "pointer"
              : "not-allowed";
          }
        }
      };
    }
  }

  function closeModal() {
    const modal = document.getElementById("consent-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
  }
})();

// 綁定上傳按鈕（排除 declaration，由 checkbox 流程處理）
Object.keys(uploadStatusMap).forEach((key) => {
  if (key === "declaration") return;
  const conf = uploadStatusMap[key];
  const btn = document.getElementById(conf.btn);
  if (btn) {
    btn.addEventListener("click", async (e) => {
      btn.disabled = true;
      // 移除舊的勾勾（如果有的話）
      removeCheckmark(btn, conf);

      const fileInput = document.getElementById(conf.file);
      const statusSpan = document.getElementById(conf.status);
      const uploadResult = await handleFileUpload(
        fileInput,
        conf.folder,
        conf.storage,
        conf.storageTime,
        statusSpan,
        conf.typeName,
        conf.typeNameEn,
      );

      // 顯示詳細的成功/失敗訊息
      if (uploadResult.success) {
        // 顯示勾勾圖示
        showCheckmark(btn, conf);

        // 更新試算表的布林值
        if (conf.apiField) {
          updateSpreadsheetStatus(conf.apiField, true).catch((error) => {
            console.error(`更新試算表失敗：`, error);
          });
        }

        const file = fileInput.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const successDetail = `${conf.successMsg}\n${file.name} (${fileSizeMB} MB)\n${uploadResult.uploadTime}\n\n請截圖保留此頁面作為憑證。\nPlease screenshot this page as proof.`;
        alert(successDetail);
      } else {
        alert(uploadResult.errorMessage || conf.failMsg);
      }

      // 延遲 0.5 秒再啟用
      setTimeout(() => {
        btn.disabled = false;
      }, 500);
    });
  }
});

// 上傳成功後顯示狀態，並存進 localStorage
const handleFileUpload = async (
  fileInput,
  folderId,
  storageKey,
  storageTimeKey,
  statusSpan,
  typeName,
  typeNameEn,
) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return {
      success: false,
      errorMessage: "請先選擇檔案 Please select a file first.",
    };
  }

  const file = fileInput.files[0];
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  const isMarketing = folderId === folderIds.marketing;
  const isCatalog = folderId === folderIds.catalog;

  if (isMarketing) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".zip")) {
      return {
        success: false,
        errorMessage: `僅限上傳 ZIP 檔 Only ZIP is accepted.\n\n檔案 Filename: ${file.name}\n請將行銷素材打包為副檔名 .zip 的單一壓縮檔後再上傳。\nPlease upload a single .zip archive only.`,
      };
    }
    const marketingMaxBytes = 20 * 1024 * 1024;
    if (file.size > marketingMaxBytes) {
      return {
        success: false,
        errorMessage: `檔案超過 20MB File exceeds 20 MB.\n\n檔案 Filename: ${file.name}\n大小 Size: ${fileSizeMB} MB\n行銷素材上限為 20MB（與報名說明一致）。\nMarketing ZIP must be 20 MB or smaller.`,
      };
    }
  } else if (isCatalog) {
    const catalogMaxBytes = 50 * 1024 * 1024;
    if (file.size > catalogMaxBytes) {
      return {
        success: false,
        errorMessage: `檔案大小超過限制 File size exceeds limit.\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 限制 Limit: 50 MB\n\n請壓縮檔案後再試。\nPlease compress the file and try again.`,
      };
    }
  } else {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        errorMessage: `檔案大小超過限制 File size exceeds limit.\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 限制 Limit: 50 MB\n\n請壓縮檔案後再試。\nPlease compress the file and try again.`,
      };
    }
  }

  let errorStep = "";

  try {
    // 步驟 1: 讀取檔案
    errorStep = "讀取檔案 Reading file";
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result.split(",")[1];
          if (!result) {
            reject(new Error("無法讀取檔案內容 Unable to read file content"));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`檔案讀取錯誤 File read error: ${e.message}`));
        }
      };
      reader.onerror = (error) => {
        reject(
          new Error(
            `檔案讀取失敗 File read failed: ${error.message || "Unknown error"}`,
          ),
        );
      };
      reader.readAsDataURL(file);
    });

    // 步驟 2: 取得攤商編號
    errorStep = "取得攤商編號 Getting application number";
    let applicationNumber = "";
    const appNumEl = document.getElementById("application-number");
    if (appNumEl) {
      applicationNumber = appNumEl.textContent.trim();
    }
    if (!applicationNumber) {
      return {
        success: false,
        errorMessage: `無法取得攤商編號 Unable to get application number.\n\n請確認您已正確登入，並重新整理頁面後再試。\nPlease make sure you are logged in correctly and refresh the page before trying again.`,
      };
    }

    // 步驟 3: 決定檔案類型
    errorStep = "準備上傳資料 Preparing upload data";
    let fileType = "";
    if (folderId === folderIds.declaration) fileType = "declaration";
    else if (folderId === folderIds.catalog) fileType = "catalog";
    else if (folderId === folderIds.marketing) fileType = "marketing";

    // 組合檔名：攤商編號_檔案類型_原始檔名
    const newFileName = `${applicationNumber}_${fileType}_${file.name}`;

    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
      folderId: folderId,
    };

    const bodyString = new URLSearchParams(data).toString();

    // 步驟 4: 上傳到伺服器
    errorStep = "上傳到伺服器 Uploading to server";
    let uploadRes;
    try {
      uploadRes = await fetch(fileUploadApiUrl, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: bodyString,
      });
    } catch (fetchError) {
      // 網路錯誤
      if (
        fetchError.name === "TypeError" &&
        fetchError.message.includes("fetch")
      ) {
        return {
          success: false,
          errorMessage: `網路連線錯誤 Network connection error.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${fetchError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n可能原因 Possible causes:\n1. 網路連線不穩定 Unstable network connection\n2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n3. 伺服器暫時無法連線 Server temporarily unavailable\n\n建議 Solutions:\n- 檢查網路連線 Check network connection\n- 稍後再試 Try again later\n- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`,
        };
      }
      throw fetchError;
    }

    // 檢查 HTTP 狀態碼
    if (!uploadRes.ok) {
      const statusText = uploadRes.statusText || "Unknown";
      return {
        success: false,
        errorMessage: `伺服器回應錯誤 Server response error.\n\n錯誤詳情 Error Details:\n- HTTP 狀態碼 HTTP Status: ${uploadRes.status} ${statusText}\n- 步驟 Step: ${errorStep}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試，或聯繫我們。\nPlease try again later or contact us.`,
      };
    }

    // 步驟 5: 讀取回應內容
    errorStep = "處理伺服器回應 Processing server response";
    let responseText = "";
    try {
      responseText = await uploadRes.text();
    } catch (textError) {
      return {
        success: false,
        errorMessage: `無法讀取伺服器回應 Unable to read server response.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${textError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試。\nPlease try again later.`,
      };
    }

    // 檢查回應內容是否包含錯誤訊息
    if (
      responseText.toLowerCase().includes("error") ||
      responseText.toLowerCase().includes("失敗") ||
      responseText.toLowerCase().includes("fail")
    ) {
      return {
        success: false,
        errorMessage: `上傳失敗 Upload failed.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 伺服器回應 Server Response: ${responseText.substring(0, 200)}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請檢查檔案格式是否正確，或聯繫我們。\nPlease check if the file format is correct, or contact us.`,
      };
    }

    // 上傳成功，顯示檔名並存 localStorage
    const now = new Date();
    const uploadTime = now.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Taipei",
    }) + " (GMT+8)";
    // 儲存 ISO 時間戳記以便檢查過期
    const uploadTimestamp = now.toISOString();

    if (statusSpan) {
      statusSpan.textContent = `✓ 已上傳 Uploaded: ${file.name} (${uploadTime})`;
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }

    // 存 localStorage（包含檔名、顯示時間和時間戳記）
    if (storageKey) {
      localStorage.setItem(storageKey, file.name);
    }
    if (storageTimeKey) {
      // 儲存格式：顯示時間|ISO時間戳記
      localStorage.setItem(storageTimeKey, `${uploadTime}|${uploadTimestamp}`);
    }

    return {
      success: true,
      uploadTime: uploadTime,
      fileName: file.name,
    };
  } catch (error) {
    // 上傳失敗 - 詳細錯誤訊息
    let errorMessage = `${typeName}上傳失敗 ${typeNameEn} upload failed.\n\n`;
    errorMessage += `錯誤詳情 Error Details:\n`;
    errorMessage += `- 步驟 Step: ${errorStep}\n`;
    errorMessage += `- 錯誤類型 Error Type: ${error.name || "Unknown"}\n`;
    errorMessage += `- 錯誤訊息 Error Message: ${error.message || "Unknown error"}\n`;
    errorMessage += `- 檔案資訊 File Info:\n`;
    errorMessage += `  - 檔名 Filename: ${file.name}\n`;
    errorMessage += `  - 大小 Size: ${fileSizeMB} MB\n`;
    errorMessage += `  - 類型 Type: ${file.type || "Unknown"}\n\n`;

    // 根據錯誤類型提供建議
    if (
      error.name === "NetworkError" ||
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage += `可能原因 Possible causes:\n`;
      errorMessage += `1. 網路連線不穩定 Unstable network connection\n`;
      errorMessage += `2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n`;
      errorMessage += `3. 伺服器暫時無法連線 Server temporarily unavailable\n\n`;
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 檢查網路連線 Check network connection\n`;
      errorMessage += `- 稍後再試 Try again later\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    } else if (
      error.message.includes("read") ||
      error.message.includes("FileReader")
    ) {
      errorMessage += `可能原因 Possible causes:\n`;
      errorMessage += `1. 檔案損壞或格式不正確 File corrupted or incorrect format\n`;
      errorMessage += `2. 檔案過大 File too large\n`;
      errorMessage += `3. 瀏覽器不支援此檔案類型 Browser doesn't support this file type\n\n`;
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 檢查檔案是否完整 Check if file is complete\n`;
      errorMessage += `- 嘗試使用其他檔案格式 Try a different file format\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    } else {
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 重新整理頁面後再試 Refresh the page and try again\n`;
      errorMessage += `- 檢查檔案格式是否正確 Check if file format is correct\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    }

    // 更新狀態顯示
    if (statusSpan) {
      statusSpan.textContent = `✗ 上傳失敗 Upload failed (${errorStep})`;
      statusSpan.style.color = "red";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }

    return {
      success: false,
      errorMessage: errorMessage,
    };
  }
};

// 檢查上傳狀態是否過期
function isUploadStatusExpired(uploadTimeString) {
  if (!uploadTimeString) return true;

  // 解析時間戳記（格式：顯示時間|ISO時間戳記）
  const parts = uploadTimeString.split("|");
  let uploadDate;

  if (parts.length === 2) {
    // 有 ISO 時間戳記
    uploadDate = new Date(parts[1]);
  } else {
    // 舊格式，嘗試解析顯示時間
    // 格式：2025/01/15 14:30:25
    try {
      uploadDate = new Date(uploadTimeString.replace(/\//g, "-"));
    } catch (e) {
      // 無法解析，視為過期
      return true;
    }
  }

  if (isNaN(uploadDate.getTime())) {
    // 無效日期，視為過期
    return true;
  }

  const now = new Date();

  // 檢查：超過 6 個月就清除
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (uploadDate < sixMonthsAgo) {
    return true;
  }

  return false;
}

// 頁面載入時自動顯示 localStorage 狀態和從 API 獲取狀態
window.addEventListener("DOMContentLoaded", async function () {
  // 先從 API 獲取狀態（如果有 account）
  if (account) {
    await loadUploadStatusFromAPI();
  }

  // 然後檢查 localStorage（作為備用，排除 declaration）
  Object.keys(uploadStatusMap).forEach((key) => {
    if (key === "declaration") return;
    const conf = uploadStatusMap[key];
    const statusSpan = document.getElementById(conf.status);
    const btn = document.getElementById(conf.btn);
    const filename = localStorage.getItem(conf.storage);
    const uploadTimeString = localStorage.getItem(conf.storageTime);

    // 檢查是否過期
    if (uploadTimeString && isUploadStatusExpired(uploadTimeString)) {
      localStorage.removeItem(conf.storage);
      localStorage.removeItem(conf.storageTime);
      if (statusSpan) {
        statusSpan.textContent = "";
        statusSpan.style.color = "";
        statusSpan.style.fontSize = "";
        statusSpan.style.marginTop = "";
      }
      if (btn) removeCheckmark(btn, conf);
      return;
    }

    if (statusSpan && filename) {
      let displayTime = "";
      if (uploadTimeString) {
        const parts = uploadTimeString.split("|");
        displayTime = parts[0] || uploadTimeString;
      }

      statusSpan.textContent = displayTime
        ? `✓ 已上傳 Uploaded: ${filename} (${displayTime})`
        : `✓ 已上傳 Uploaded: ${filename}`;
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";

      if (btn) showCheckmark(btn, conf);
    }
  });
});
