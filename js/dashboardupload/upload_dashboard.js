// 3 個 folder ID
const folderIds = {
  marketing: "1GBQiVxTbCdl-kCCMvNTc9Ejjhfsxu9ds",
  catalog: "1uE7korPZDcMRCo0nTkoiowEh3sVpw5QA",
  declaration: "11CnK9JWKistOUUf8HocJNb_lyK1WYdJp",
};

// Catalog 上傳
document
  .getElementById("uploadBtnCatalog")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("catalog-file");
    const result = await handleFileUpload(fileInput, folderIds.catalog);
    if (result) alert("Catalog uploaded successfully!");
  });

// Marketing 上傳
document
  .getElementById("uploadBtnMarketing")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("marketing-file");
    const result = await handleFileUpload(fileInput, folderIds.marketing);
    if (result) alert("Marketing material uploaded successfully!");
  });

// 綁定所有上傳按鈕
Object.keys(uploadStatusMap).forEach((key) => {
  const conf = uploadStatusMap[key];
  const btn = document.getElementById(conf.btn);
  if (btn) {
    btn.addEventListener("click", async (e) => {
      btn.disabled = true;
      const fileInput = document.getElementById(conf.file);
      const statusSpan = document.getElementById(conf.status);
      const result = await handleFileUpload(
        fileInput,
        conf.folder,
        conf.storage,
        statusSpan
      );
      alert(result ? conf.successMsg : conf.failMsg);
      // 延遲 0.5 秒再啟用
      setTimeout(() => {
        btn.disabled = false;
      }, 500);
    });
  }
});

// 精簡 handleFileUpload
const handleFileUpload = async (fileInput, folderId) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    return false;
  }

  const file = fileInput.files[0];
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("File size exceeds the 10MB limit.");
    return false;
  }

  try {
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    // 取得攤商編號
    let applicationNumber = "";
    const appNumEl = document.getElementById("application-number");
    if (appNumEl) {
      applicationNumber = appNumEl.textContent.trim();
    }

    // 組合檔名：攤商編號_日期時間_原始檔名
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[-T:.]/g, "")
      .slice(0, 14);
    const newFileName = `${applicationNumber}_${currentDateTime}_${file.name}`;

    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
      folderId: folderId,
    };

    const bodyString = new URLSearchParams(data).toString();
    const uploadRes = await fetch(
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

    await uploadRes.text();

    // 上傳成功，顯示檔名並存 localStorage
    if (statusSpan) {
      statusSpan.textContent = `Uploaded: ${file.name}`;
      statusSpan.style.color = "green";
    }
    if (storageKey) {
      localStorage.setItem(storageKey, file.name);
    }
    return true;
  } catch (error) {
    // 上傳失敗
    if (statusSpan) {
      statusSpan.textContent = "Upload failed";
      statusSpan.style.color = "red";
    }
    return false;
  }
};
