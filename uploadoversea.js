document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");
    const formIdInput = document.getElementById("formId");
    const categoryInput = document.getElementById("category");

    if (!fileInput.files.length) {
      alert("Please choose your file");
      return;
    }

    const file = fileInput.files[0];

    // 檢查檔案大小（限制 8MB）
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      alert("File size exceeds the 8MB limit.");
      return;
    }

    // 檢查檔案類型（限制為圖片或 PDF）
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPEG, PNG, or PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // formData.append("formId", formIdInput.value);
    // formData.append("category", categoryInput.value);

    try {
      const uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbwMLtBsAmDm-ZZYOyTXB3Cndihne_Hz76XNGJtZBFqfVgeqRs-SCJVI-p6CdvKdD4TC/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const fileUrl = await uploadRes.text(); // 回傳是純文字（網址）
      document.getElementById("uploadedFileUrl").value = fileUrl;
      console.log("上傳成功，檔案網址是：", fileUrl);

      // 🔥 這裡你可以接著把檔案網址塞到表單的某一格，或者用 entry.xxx 一起送出
    } catch (error) {
      console.error("上傳失敗：", error);
      alert("File upload failed. Please try again.");
    }
  });
