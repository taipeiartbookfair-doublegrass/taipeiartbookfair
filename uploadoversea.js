document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");
    const formIdInput = document.getElementById("formId");
    const categoryInput = document.getElementById("category");

    if (!fileInput.files.length) {
      alert("請先選擇檔案");
      return;
    }

    console.log(fileInput.files); // 檢查檔案是否正確選擇

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("formId", formIdInput.value);
    formData.append("category", categoryInput.value);

    try {
      const uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbxr_kswfFo24yC-9GlxkvO7nq3Z1MPpqMc2xdjKtL33N8UcLBzEKhPLbjowb23klY45/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const fileUrl = await uploadRes.text(); // 回傳是純文字（網址）
      document.getElementById("uploadedFileUrl").value = fileUrl;
      console.log("上傳成功，檔案網址是：", fileUrl);
    } catch (error) {
      console.error("上傳失敗：", error);
    }
  });
