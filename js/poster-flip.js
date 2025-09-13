// 海報3D翻轉控制和多海報切換
document.addEventListener("DOMContentLoaded", function () {
  const posterSection = document.querySelector(".poster-section");
  const posterContainer = document.querySelector(".poster-container");
  const posterCard = document.querySelector(".poster-card");
  const posterFront = document.querySelector(".poster-front img");
  const posterBack = document.querySelector(".poster-back img");
  const prevBtn = document.getElementById("prevPoster");
  const nextBtn = document.getElementById("nextPoster");
  const flipIndicator = document.getElementById("flipIndicator");

  console.log("Poster elements found:", {
    posterSection,
    posterContainer,
    posterCard,
    posterFront,
    posterBack,
    prevBtn,
    nextBtn,
    flipIndicator,
  });

  if (posterContainer && posterCard && posterFront && posterBack) {
    let isFlipped = false;
    let isAnimating = false;
    let currentPosterIndex = 0;

    // 海報資料陣列（之後可以擴展更多海報）
    const posters = [
      {
        front: "image/25TPABF_poster_RGB.png",
        back: "image/25TPABF_poster_RGB-2.png",
        name: "2025 TPABF Main Poster",
      },
      // 未來可以添加更多海報：
      // {
      //   front: "image/poster2_front.png",
      //   back: "image/poster2_back.png",
      //   name: "Poster 2"
      // }
    ];

    // 更新按鈕狀態
    function updateButtonStates() {
      if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPosterIndex === 0;
        nextBtn.disabled = currentPosterIndex === posters.length - 1;
      }
    }

    // 切換到指定海報
    function switchToPoster(index) {
      if (
        index >= 0 &&
        index < posters.length &&
        index !== currentPosterIndex
      ) {
        currentPosterIndex = index;
        const poster = posters[currentPosterIndex];

        // 更新海報圖片
        posterFront.src = poster.front;
        posterBack.src = poster.back;

        // 重置翻轉狀態
        isFlipped = false;
        posterCard.classList.remove("flipped");
        posterContainer.setAttribute("data-flipped", "false");

        updateButtonStates();
        console.log(`Switched to poster ${index + 1}: ${poster.name}`);
      }
    }

    // 點擊海報容器翻轉（避免控制區域觸發）
    posterContainer.addEventListener("click", function (e) {
      // 防止控制按鈕觸發翻轉（控制區域現在在外面，但保持檢查以防萬一）
      if (e.target.closest(".poster-controls") || e.target.closest(".poster-controls-wrapper")) {
        return;
      }

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

    // 上一張海報
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation(); // 防止觸發海報翻轉
        if (currentPosterIndex > 0) {
          switchToPoster(currentPosterIndex - 1);
        }
      });
    }

    // 下一張海報
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation(); // 防止觸發海報翻轉
        if (currentPosterIndex < posters.length - 1) {
          switchToPoster(currentPosterIndex + 1);
        }
      });
    }

    // 點擊中間圓圈也可以翻轉
    if (flipIndicator) {
      flipIndicator.addEventListener("click", function (e) {
        e.stopPropagation(); // 防止事件冒泡
        if (!isAnimating) {
          // 手動觸發翻轉邏輯
          isAnimating = true;
          isFlipped = !isFlipped;

          if (isFlipped) {
            posterCard.classList.add("flipped");
            posterContainer.setAttribute("data-flipped", "true");
            console.log("Flipping to back via center button");
          } else {
            posterCard.classList.remove("flipped");
            posterContainer.setAttribute("data-flipped", "false");
            console.log("Flipping to front via center button");
          }

          setTimeout(() => {
            isAnimating = false;
          }, 800);
        }
      });
    }

    // 滑鼠進入時顯示提示
    posterContainer.addEventListener("mouseenter", function () {
      posterContainer.style.cursor = "pointer";
    });

    // 滑鼠離開時保持狀態
    posterContainer.addEventListener("mouseleave", function () {
      // 不重置翻轉狀態，讓使用者可以點擊翻回來
    });

    // 初始化按鈕狀態
    updateButtonStates();
  } else {
    console.error("Poster elements not found!");
  }
});
