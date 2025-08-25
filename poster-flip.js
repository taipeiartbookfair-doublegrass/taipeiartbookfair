// 海報3D翻轉控制
document.addEventListener("DOMContentLoaded", function () {
  const posterContainer = document.querySelector(".poster-container");
  const posterCard = document.querySelector(".poster-card");

  console.log("Poster elements found:", { posterContainer, posterCard });

  if (posterContainer && posterCard) {
    let isFlipped = false;
    let isAnimating = false;

    // 點擊翻轉
    posterContainer.addEventListener("click", function () {
      console.log("Poster clicked, current state:", isFlipped);
      if (isAnimating) return; // 防止動畫進行中重複觸發

      isAnimating = true;
      isFlipped = !isFlipped;

      if (isFlipped) {
        posterCard.classList.add("flipped");
        posterContainer.setAttribute("data-flipped", "true");
        console.log("Flipping to back");
      } else {
        posterCard.classList.remove("flipped");
        posterContainer.setAttribute("data-flipped", "false");
        console.log("Flipping to front");
      }

      // 動畫完成後重置狀態
      setTimeout(() => {
        isAnimating = false;
        console.log("Animation completed");
      }, 800); // 與CSS transition時間一致
    });

    // 滑鼠進入時顯示提示
    posterContainer.addEventListener("mouseenter", function () {
      posterContainer.style.cursor = "pointer";
    });

    // 滑鼠離開時保持狀態
    posterContainer.addEventListener("mouseleave", function () {
      // 不重置翻轉狀態，讓使用者可以點擊翻回來
    });
  } else {
    console.error("Poster elements not found!");
  }
});
