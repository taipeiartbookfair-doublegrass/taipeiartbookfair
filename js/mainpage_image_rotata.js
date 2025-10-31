const imageFiles = [
  "001.jpg",
  "002.jpg",
  "003.jpg",
  "004.jpg",
  "005.jpg",
  "006.jpg",
  "007.jpg",
  "008.jpg",
  "009.jpg",
  "010.jpg",
  "011.jpg",
  "012.jpg",
  "013.jpg",
  "014.jpg",
  "015.jpg",
  "016.jpg",
  "017.jpg",
  "018.jpg",
  "019.jpg",
  "020.jpg",
  "021.jpg",
  "023.jpg",
  "024.jpg",
  "025.jpg",
  "026.jpg",
  "027.jpg",
  "028.jpg",
  "029.jpg",
  "030.jpg",
];

function shuffle(array) {
  const arr = array.slice(); // 複製一個新的，不會改到原本的
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 隨機一個 0～i 的數字
    [arr[i], arr[j]] = [arr[j], arr[i]]; // 交換位置
  }
  return arr;
}

function createRotator() {
  const rotata = document.getElementById("rotata");

  // 檢查元素是否存在
  if (!rotata) {
    console.warn("rotata 元素未找到，跳過 createRotator 函數");
    return;
  }

  console.log("rotata 元素找到，開始創建 rotator");

  const totalPosters = 3;
  const imagesPerStrip = 3;

  // 分開 horizontal 和 vertical 的檔名
  const horizontalImages = Array.from(
    { length: 59 },
    (_, i) => `hori${i + 1}.jpg`
  );
  const verticalImages = Array.from(
    { length: 35 },
    (_, i) => `verti${i + 1}.jpg`
  );

  // 預先打亂
  const shuffledHorizontal = shuffle(horizontalImages);
  const shuffledVertical = shuffle(verticalImages);

  for (let i = 0; i < totalPosters; i++) {
    const posterRotator = document.createElement("div");
    posterRotator.classList.add("poster-rotator");

    const imageStrip = document.createElement("div");
    imageStrip.classList.add("image-strip");

    // 第幾個 rotator 決定抓哪個資料夾
    let sourceImages, folder;
    if (i === 1 || i === 2) {
      sourceImages = shuffledHorizontal;
      folder = "horizental"; // 注意你的資料夾拼字
    } else {
      sourceImages = shuffledVertical;
      folder = "vertical";
    }

    // 取出5張
    const start = (i * imagesPerStrip) % sourceImages.length;
    let selectedImages = sourceImages.slice(start, start + imagesPerStrip);

    // 補滿
    if (selectedImages.length < imagesPerStrip) {
      selectedImages = selectedImages.concat(
        shuffle(sourceImages).slice(0, imagesPerStrip - selectedImages.length)
      );
    }

    // 加到 image-strip
    for (const src of selectedImages) {
      const img = document.createElement("img");
      img.src = `image/${folder}/${src}`;
      console.log(`添加圖片: ${img.src}`);
      imageStrip.appendChild(img);
    }
    imageStrip.innerHTML += imageStrip.innerHTML;
    // 複製第一張做循環
    const firstImgClone = imageStrip.firstElementChild.cloneNode(true);
    imageStrip.appendChild(firstImgClone);

    posterRotator.appendChild(imageStrip);
    rotata.appendChild(posterRotator);
  }
}

function createEventPhotos() {
  const eventPhotosStrip = document.getElementById("eventPhotosStrip");

  // 檢查元素是否存在
  if (!eventPhotosStrip) {
    console.warn("eventPhotosStrip 元素未找到，跳過 createEventPhotos 函數");
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
}

// Add event listener to trigger the creation after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  createRotator();
  createEventPhotos();

  // Adjust timing for smoother transitions
  const rotataDivs = document.querySelectorAll(".poster-rotator");
  let current = 0;

  function rotateImages() {
    rotataDivs.forEach((rotator) => {
      const strips = rotator.querySelectorAll(".image-strip");
      strips.forEach((strip) => {
        const totalWidth = strip.scrollWidth; // Full width of the strip
        const totalImages = strip.children.length;
        const stepSize = totalWidth / totalImages; // Width of each image strip step
        const moveX = current * stepSize; // Move the strip to the right

        // Apply smooth animation
        strip.style.transition = "transform 5s linear";
        strip.style.transform = `translateX(-${moveX}px)`; // Move images to the left by "moveX" value
      });
    });

    // Increment to move to the next image position
    current++;
    // Use a fixed number instead of depending on the first rotator
    if (current === 3) {
      current = 0; // Reset to 0 to start again seamlessly
    }
  }

  setInterval(rotateImages, 5000); // Adjust timing for your effect speed
});
