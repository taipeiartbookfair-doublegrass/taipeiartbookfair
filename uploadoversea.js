document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");

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

    try {
      const uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbwMLtBsAmDm-ZZYOyTXB3Cndihne_Hz76XNGJtZBFqfVgeqRs-SCJVI-p6CdvKdD4TC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": file.type, // 這裡加上正確的 Content-Type
          },
          body: file, // 直接傳檔案，不用 FormData
        }
      );

      const fileUrl = await uploadRes.text();
      document.getElementById("uploadedFileUrl").value = fileUrl;
      console.log("上傳成功，檔案網址是：", fileUrl);
    } catch (error) {
      console.error("上傳失敗：", error);
      alert("File upload failed. Please try again.");
    }
  });
