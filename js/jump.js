document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("BoothApplication");
  var submitButton = document.getElementById("submitButton");

  if (form && submitButton) {
    form.addEventListener("submit", function (event) {
      // 防呆：送出後馬上 disable 按鈕，不要在按了啊！！！！！
      submitButton.disabled = true;
      submitButton.innerText = "送出中..."; // 如果你想讓按鈕字變成「送出中...」

      // 延遲 1.5秒，給 Google Form 時間收資料
      setTimeout(function () {
        window.location.href = "application-received.html";
      }, 3000);
    });
  }
});
