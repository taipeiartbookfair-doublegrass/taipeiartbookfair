const form = document.getElementById("BoothApplication");
const submitButton = document.getElementById("submitButton");

// Consolidate Captcha logic and shared functionality
const handleFileUpload = async (fileInput, form, submitButton, uploadUrl) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    return false;
  }

  const file = fileInput.files[0];
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    alert("File size exceeds the 8MB limit.");
    return false;
  }

  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a PDF file.");
    return false;
  }

  try {
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const inputValue = document.querySelector(
      "input[name='entry.1159390039']"
    ).value;
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[-T:.]/g, "")
      .slice(0, 14);
    const newFileName = `${inputValue}_${currentDateTime}_${file.name}`;

    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
    };
    const bodyString = new URLSearchParams(data).toString();

    const uploadRes = await fetch(uploadUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: bodyString,
    });

    const fileUrl = await uploadRes.text();
    document.getElementById("uploadedFileUrl").value = fileUrl;
    return true;
  } catch (error) {
    alert("File upload failed. Please try again.");
    return false;
  }
};

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.innerText = "Submitting...";

  const selectedBoothType = document.querySelector(
    'input[name="entry.133172086"]:checked'
  );
  let fileInput;
  if (selectedBoothType) {
    const boothValue = selectedBoothType.value;
    if (boothValue === "裝置類") {
      fileInput = document.getElementById("fileInput2");
    } else if (["創作商品", "食物酒水", "書攤"].includes(boothValue)) {
      fileInput = document.getElementById("fileInput");
    }
  }

  const uploadSuccess = await handleFileUpload(
    fileInput,
    form,
    submitButton,
    "https://script.google.com/macros/s/AKfycbwhOkLqvvuiA-QmEXbh-Oi26r2I9t8YuhWGfWF4_6LvCaSXIwanCpqEe2r371_ivMNHtg/exec"
  );

  if (uploadSuccess) {
    form.submit();
    setTimeout(() => {
      window.location.href = "../application-received.html";
    }, 3000);
  } else {
    submitButton.disabled = false;
    submitButton.innerText = "Submit";
  }
});
