// API URL（直接使用 URL 字串，避免與 dashboard-basic.js 中的 apiUrl 重複宣告）
const uploadApiUrl = "https://script.google.com/macros/s/AKfycbxOxo-ZzjkkDlkIyCNlmFgYfPhpLOHQr3278Mv36PJrM_jdb_RsaG42hwM23Cp7b7onBw/exec";

// 獲取 account（從 cookie）
const uploadAccount = getCookie("account");

// 3 個 folder ID
const folderIds = {
  marketing: "1GBQiVxTbCdl-kCCMvNTc9Ejjhfsxu9ds",
  catalog: "1uE7korPZDcMRCo0nTkoiowEh3sVpw5QA",
  declaration: "11CnK9JWKistOUUf8HocJNb_lyK1WYdJp",
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
    btn: "uploadBtnDeclaration",
    file: "declaration-file",
    status: "declaration-upload-status",
    storage: "declaration-uploaded-filename",
    storageTime: "declaration-uploaded-time",
    folder: folderIds.declaration,
    successMsg: "上傳成功！我們將盡快完成審核。\nUpload successful! We'll review your submission shortly.",
    failMsg: "同意書檔案上傳失敗 Upload failed.",
    typeName: "同意書檔案",
    typeNameEn: "Declaration file",
    apiField: "同意書", // 試算表中的欄位名稱
  },
};

// 顯示勾勾圖示的函數
function showCheckmark(btn, conf) {
  // 先找包含按鈕的 td（如 catalog-upload-td / material-download-td）
  const td = btn.closest("td") || btn.parentElement;
  if (!td) {
    // fallback: 原本行為（在按鈕旁插入）
    const existingCheckmark = btn.parentElement.querySelector(`.upload-checkmark-${conf.btn}`);
    if (existingCheckmark) {
      existingCheckmark.classList.remove("checkmark-animate");
      setTimeout(() => existingCheckmark.classList.add("checkmark-animate"), 10);
      return;
    }
    const checkmark = document.createElement("span");
    checkmark.className = `upload-checkmark upload-checkmark-${conf.btn}`;
    checkmark.innerHTML = "（已上傳 Uploaded）";
    btn.parentElement.insertBefore(checkmark, btn.nextSibling);
    return;
  }

  // 設定 td 背景與文字色（保持明顯）
  td.style.transition = "background-color 0.3s ease, color 0.3s ease";
  td.style.backgroundColor = "forestgreen";
  td.style.color = "white";

  // 如果已經有狀態文字，重新觸發動畫即可
  let existing = td.querySelector(`.upload-status-text-${conf.btn}`);
  if (existing) {
    existing.style.opacity = "0";
    // force reflow
    void existing.offsetWidth;
    existing.style.opacity = "1";
    return;
  }

  // 建立顯示文字，並放在 td 裡面、在 .ddl（若存在）之前
  const statusSpan = document.createElement("span");
  statusSpan.className = `upload-status-text upload-status-text-${conf.btn}`;
  statusSpan.textContent = "（已上傳Uploaded）";
  statusSpan.style.cssText = `
    margin-top: 0.3rem;
    color: lightgreen;
    display:block;
    background-color: blue;
    text-align: center;
  `;

  // 嘗試插入到 ddl 上方（確保顯示在原內容下面、ddl 之上）
  const ddlInsideTd = td.querySelector(".ddl");
  if (ddlInsideTd) {
    td.insertBefore(statusSpan, ddlInsideTd);
  } else {
    // 沒有 ddl 時放在按鈕區塊後面
    td.appendChild(statusSpan);
  }

  // 觸發進場動畫
  setTimeout(() => {
    statusSpan.style.opacity = "1";
    statusSpan.style.transform = "translateY(0)";
  }, 10);
}

// 移除勾勾/已上傳文字的函數（還原背景）
function removeCheckmark(btn, conf) {
  const td = btn.closest("td") || btn.parentElement;
  if (!td) {
    const checkmark = btn.parentElement.querySelector(`.upload-checkmark-${conf.btn}`);
    if (checkmark) {
      checkmark.style.opacity = "0";
      checkmark.style.transform = "scale(0)";
      setTimeout(() => {
        if (checkmark.parentElement) checkmark.parentElement.removeChild(checkmark);
      }, 300);
    }
    return;
  }

  const statusSpan = td.querySelector(`.upload-status-text-${conf.btn}`);
  if (statusSpan) {
    statusSpan.style.opacity = "0";
    statusSpan.style.transform = "translateY(-6px)";
    setTimeout(() => {
      if (statusSpan.parentElement) statusSpan.parentElement.removeChild(statusSpan);
      // 如果沒有其他成功標示，還原背景色與文字色
      td.style.backgroundColor = "";
      td.style.color = "";
    }, 300);
  } else {
    // 仍嘗試還原背景
    td.style.backgroundColor = "";
    td.style.color = "";
  }
}

// 更新試算表的布林值
async function updateSpreadsheetStatus(apiField, value) {
  if (!uploadAccount || !apiField) {
    console.warn("無法更新試算表：缺少 account 或 apiField");
    return false;
  }

  try {
    const params = new URLSearchParams({
      action: "update_dashboard_info",
      account: account,
      [apiField]: value ? "true" : "false", // 轉換為字串
    }).toString();

    const updateRes = await fetch(uploadApiUrl, {
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
  if (!uploadAccount) {
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
      
      // 檢查每個上傳類型
      Object.keys(uploadStatusMap).forEach((key) => {
        const conf = uploadStatusMap[key];
        const btn = document.getElementById(conf.btn);
        const statusSpan = document.getElementById(conf.status);
        
        if (!conf.apiField) return; // 如果沒有 apiField，跳過
        
        // 從 API 獲取狀態（布林值）
        const isUploaded = !!apiData[conf.apiField];
        
        if (isUploaded && btn) {
          // 顯示勾勾
          showCheckmark(btn, conf);
          
          // 如果有 statusSpan，也更新狀態文字
          if (statusSpan) {
            // 嘗試從 localStorage 獲取檔名和時間
            const filename = localStorage.getItem(conf.storage);
            const uploadTimeString = localStorage.getItem(conf.storageTime);
            
            if (filename) {
              let displayTime = "";
              if (uploadTimeString) {
                const parts = uploadTimeString.split("|");
                displayTime = parts[0] || uploadTimeString;
              }
              
              if (displayTime) {
                statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename} (${displayTime})`;
              } else {
                statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename}`;
              }
              statusSpan.style.color = "green";
              statusSpan.style.fontSize = "0.8em";
              statusSpan.style.marginTop = "0.3rem";
            } else {
              // 如果沒有 localStorage，只顯示已上傳
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

// 綁定所有上傳按鈕
Object.keys(uploadStatusMap).forEach((key) => {
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
        conf.typeNameEn
      );
      
      // 顯示詳細的成功/失敗訊息
      if (uploadResult.success) {
        // 顯示勾勾圖示
        showCheckmark(btn, conf);
        
        // 更新試算表的布林值
        if (conf.apiField) {
          updateSpreadsheetStatus(conf.apiField, true).catch((error) => {
            console.error(`更新試算表失敗：`, error);
            // 即使更新失敗也不影響用戶體驗，只記錄錯誤
          });
        }
        
        const file = fileInput.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const successDetail = `${conf.successMsg}\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 上傳時間 Upload Time: ${uploadResult.uploadTime}\n\n請保留此頁面截圖作為上傳憑證。\nPlease keep a screenshot of this page as proof of upload.\n\n重新登入後，若狀態消失，請檢查瀏覽器是否清除了快取。\nIf the status disappears after re-login, please check if your browser cleared the cache.`;
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
  typeNameEn
) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return {
      success: false,
      errorMessage: "請先選擇檔案 Please select a file first."
    };
  }

  const file = fileInput.files[0];
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  
  // 檢查檔案大小（設定 50MB 限制）
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      errorMessage: `檔案大小超過限制 File size exceeds limit.\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 限制 Limit: 50 MB\n\n請壓縮檔案後再試。\nPlease compress the file and try again.`
    };
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
        reject(new Error(`檔案讀取失敗 File read failed: ${error.message || "Unknown error"}`));
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
        errorMessage: `無法取得攤商編號 Unable to get application number.\n\n請確認您已正確登入，並重新整理頁面後再試。\nPlease make sure you are logged in correctly and refresh the page before trying again.`
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
      uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbwB6gvxUJA-_i-1oWuZnya0YHoa4nwv8bioZUjZAaGvf-ibqGpyNcujUL6LEowwqN1s/exec",
        {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: bodyString,
        }
      );
    } catch (fetchError) {
      // 網路錯誤
      if (fetchError.name === "TypeError" && fetchError.message.includes("fetch")) {
        return {
          success: false,
          errorMessage: `網路連線錯誤 Network connection error.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${fetchError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n可能原因 Possible causes:\n1. 網路連線不穩定 Unstable network connection\n2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n3. 伺服器暫時無法連線 Server temporarily unavailable\n\n建議 Solutions:\n- 檢查網路連線 Check network connection\n- 稍後再試 Try again later\n- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`
        };
      }
      throw fetchError;
    }

    // 檢查 HTTP 狀態碼
    if (!uploadRes.ok) {
      const statusText = uploadRes.statusText || "Unknown";
      return {
        success: false,
        errorMessage: `伺服器回應錯誤 Server response error.\n\n錯誤詳情 Error Details:\n- HTTP 狀態碼 HTTP Status: ${uploadRes.status} ${statusText}\n- 步驟 Step: ${errorStep}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試，或聯繫我們。\nPlease try again later or contact us.`
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
        errorMessage: `無法讀取伺服器回應 Unable to read server response.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${textError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試。\nPlease try again later.`
      };
    }

    // 檢查回應內容是否包含錯誤訊息
    if (responseText.toLowerCase().includes("error") || 
        responseText.toLowerCase().includes("失敗") ||
        responseText.toLowerCase().includes("fail")) {
      return {
        success: false,
        errorMessage: `上傳失敗 Upload failed.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 伺服器回應 Server Response: ${responseText.substring(0, 200)}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請檢查檔案格式是否正確，或聯繫我們。\nPlease check if the file format is correct, or contact us.`
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
      second: "2-digit"
    });
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
      fileName: file.name
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
    if (error.name === "NetworkError" || error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage += `可能原因 Possible causes:\n`;
      errorMessage += `1. 網路連線不穩定 Unstable network connection\n`;
      errorMessage += `2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n`;
      errorMessage += `3. 伺服器暫時無法連線 Server temporarily unavailable\n\n`;
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 檢查網路連線 Check network connection\n`;
      errorMessage += `- 稍後再試 Try again later\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    } else if (error.message.includes("read") || error.message.includes("FileReader")) {
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
      errorMessage: errorMessage
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
  if (uploadAccount) {
    await loadUploadStatusFromAPI();
  }
  
  // 然後檢查 localStorage（作為備用）
  Object.keys(uploadStatusMap).forEach((key) => {
    const conf = uploadStatusMap[key];
    const statusSpan = document.getElementById(conf.status);
    const btn = document.getElementById(conf.btn);
    const filename = localStorage.getItem(conf.storage);
    const uploadTimeString = localStorage.getItem(conf.storageTime);
    
    // 檢查是否過期
    if (uploadTimeString && isUploadStatusExpired(uploadTimeString)) {
      // 過期了，清除 localStorage
      localStorage.removeItem(conf.storage);
      localStorage.removeItem(conf.storageTime);
      if (statusSpan) {
        statusSpan.textContent = "";
        statusSpan.style.color = "";
        statusSpan.style.fontSize = "";
        statusSpan.style.marginTop = "";
      }
      // 移除勾勾圖示
      if (btn) {
        removeCheckmark(btn, conf);
      }
      return;
    }
    
    if (statusSpan && filename) {
      // 解析顯示時間
      let displayTime = "";
      if (uploadTimeString) {
        const parts = uploadTimeString.split("|");
        displayTime = parts[0] || uploadTimeString;
      }
      
      if (displayTime) {
        statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename} (${displayTime})`;
      } else {
        statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename}`;
      }
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
      
      // 顯示勾勾圖示
      if (btn) {
        showCheckmark(btn, conf);
      }
    }
  });
});
