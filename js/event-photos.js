// Event Photos 功能
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createEventPhotos() {
  const eventPhotosStrip = document.getElementById("eventPhotosStrip");
  if (!eventPhotosStrip) {
    console.log("找不到 eventPhotosStrip 元素");
    return;
  }

  const imagesPerStrip = 8; // 一次顯示8張圖片

  // 使用 horizontal 圖片作為 event photos
  const horizontalImages = Array.from(
    { length: 59 },
    (_, i) => `hori${i + 1}.jpg`
  );

  // 預先打亂圖片順序
  const shuffledImages = shuffle(horizontalImages);

  // 取出前8張圖片
  const selectedImages = shuffledImages.slice(0, imagesPerStrip);

  // 加到 event-photos-strip
  for (const src of selectedImages) {
    const img = document.createElement("img");
    img.src = `image/horizental/${src}`;
    img.alt = "Event Photo";
    eventPhotosStrip.appendChild(img);
  }

  // 複製圖片做循環效果
  eventPhotosStrip.innerHTML += eventPhotosStrip.innerHTML;

  console.log("Event Photos 已創建，共", selectedImages.length, "張圖片");
}

// 當 DOM 加載完成後執行
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM 已加載，開始創建 Event Photos");
  createEventPhotos();
});
