document.addEventListener("DOMContentLoaded", function () {
  // 是否參與過
  var yesRadio = document.getElementById("participatedin_Yes");
  var firstTimeRadio = document.getElementById("participatedin_Firsttime");
  var participatedYearsDivs = document.querySelectorAll(
    ".question-ParticipatedYears"
  );

  function toggleVisibility(show) {
    participatedYearsDivs.forEach(function (div) {
      div.style.display = show ? "grid" : "none";
      if (!show) {
        // 重置选择状态
        div
          .querySelectorAll('input[type="checkbox"], input[type="radio"]')
          .forEach(function (input) {
            input.checked = false;
          });
      }
    });
  }

  toggleVisibility(false);

  yesRadio.addEventListener("change", function () {
    if (this.checked) {
      toggleVisibility(true);
    }
  });

  firstTimeRadio.addEventListener("change", function () {
    if (this.checked) {
      toggleVisibility(false);
    }
  });

  // Promotion Content 同意與不同意
  var agreeRadio = document.getElementById("PromotionContent_Agree");
  var disagreeRadio = document.getElementById("PromotionContent_Disagree");
  var infoDivs = document.querySelectorAll(".question-InsufficientInformation");
  var insufficientInfoAgree = document.getElementById(
    "InsufficientInformation_Agree"
  );
  var insufficientInfoDisagree = document.getElementById(
    "InsufficientInformation_Disagree"
  );

  function toggleInfoVisibility(show) {
    infoDivs.forEach(function (div) {
      div.style.display = show ? "grid" : "none";
      if (!show) {
        // 重置选择状态
        div
          .querySelectorAll('input[type="checkbox"], input[type="radio"]')
          .forEach(function (input) {
            input.checked = false;
          });
      }
    });
  }

  function toggleRequiredState(required) {
    insufficientInfoAgree.required = required;
    insufficientInfoDisagree.required = required;
  }

  // 初始化时设置为隐藏并移除 required 属性
  toggleInfoVisibility(false);
  toggleRequiredState(false);

  agreeRadio.addEventListener("change", function () {
    if (this.checked) {
      toggleInfoVisibility(true);
      toggleRequiredState(true); // 设置为必填
    }
  });

  disagreeRadio.addEventListener("change", function () {
    if (this.checked) {
      toggleInfoVisibility(false);
      toggleRequiredState(false); // 移除必填
    }
  });
});
