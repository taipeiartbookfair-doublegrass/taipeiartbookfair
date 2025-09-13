document.addEventListener("DOMContentLoaded", function () {
  // 选择对应的input元素
  var largeBookStalls = document.getElementById(
    "PreferredBoothType_LargeBookStalls"
  );
  var smallBookStalls = document.getElementById(
    "PreferredBoothType_SmallBookStalls"
  );
  var creativeProducts = document.getElementById(
    "PreferredBoothType_CreativeProducts"
  );
  var foodBeverages = document.getElementById(
    "PreferredBoothType_FoodBeverages"
  );
  var curation = document.getElementById("PreferredBoothType_Curation");

  // 选择对应的问题区块
  var workLinks = document.querySelectorAll(".question-WorkLinks");
  var productLinks = document.querySelectorAll(".question-ProductLinks");
  var planLinks = document.querySelectorAll(".question-PlanLinks");

  // 隐藏所有问题区块的函数，并重置input和textarea的内容
  function hideAllLinks() {
    workLinks.forEach((link) => {
      link.style.display = "none";
      link.querySelectorAll("input, textarea").forEach((input) => {
        input.value = ""; // 重置内容
        input.required = false; // 移除必填属性
      });
    });
    productLinks.forEach((link) => {
      link.style.display = "none";
      link.querySelectorAll("input, textarea").forEach((input) => {
        input.value = ""; // 重置内容
        input.required = false; // 移除必填属性
      });
    });
    planLinks.forEach((link) => {
      link.style.display = "none";
      link.querySelectorAll("input, textarea").forEach((input) => {
        input.value = ""; // 重置内容
        input.required = false; // 移除必填属性
      });
    });
  }

  // 初始化页面时隐藏所有问题区块
  hideAllLinks();

  // 添加监听器函数，用于设置显示和必填
  function setupLinkDisplay(radioElement, links, others1, others2) {
    radioElement.addEventListener("change", function () {
      if (this.checked) {
        links.forEach((link) => {
          link.style.display = "grid"; // 显示相关问题区块
          link.querySelectorAll("input, textarea").forEach((input) => {
            input.required = true; // 设置为必填
          });
        });
        others1.forEach((link) => {
          link.style.display = "none"; // 隐藏其他问题区块
          link.querySelectorAll("input, textarea").forEach((input) => {
            input.value = ""; // 重置内容
            input.required = false; // 移除必填属性
          });
        });
        others2.forEach((link) => {
          link.style.display = "none"; // 隐藏其他问题区块
          link.querySelectorAll("input, textarea").forEach((input) => {
            input.value = ""; // 重置内容
            input.required = false; // 移除必填属性
          });
        });
      }
    });
  }

  // 设置每个选项的行为
  setupLinkDisplay(largeBookStalls, workLinks, productLinks, planLinks);
  setupLinkDisplay(smallBookStalls, workLinks, productLinks, planLinks);
  setupLinkDisplay(creativeProducts, productLinks, workLinks, planLinks);
  setupLinkDisplay(foodBeverages, productLinks, workLinks, planLinks);
  setupLinkDisplay(curation, planLinks, workLinks, productLinks);
});
