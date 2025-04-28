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
  const totalPosters = 5;
  const imagesPerStrip = 5;

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
    if (i === 0 || i === 1 || i === 4) {
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

// Add event listener to trigger the creation after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  createRotator();

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
    if (
      current === rotataDivs[0].querySelector(".image-strip").children.length
    ) {
      current = 0; // Reset to 0 to start again seamlessly
    }
  }

  setInterval(rotateImages, 5000); // Adjust timing for your effect speed
});

// Toggle flickers + rotator
const flickers = document.querySelector(".flickers");
document.getElementById("toggle-ads").addEventListener("click", () => {
  const button = document.getElementById("toggle-ads");
  const isHidden = flickers.style.display === "none";

  flickers.style.display = isHidden ? "block" : "none";
  rotata.style.display = isHidden ? "block" : "none";

  button.innerHTML = isHidden ? "關閉廣告 ✕" : "打開廣告 ✓";
});

// OPENCALL waving
const openCallSpans = document.querySelectorAll(".open-call span");
function startWaveFlicker() {
  openCallSpans.forEach((span, index) => {
    setTimeout(() => {
      span.classList.add("flicker");
      setTimeout(() => {
        span.classList.remove("flicker");
      }, 10000);
    }, index * 1000);
  });
}
startWaveFlicker();

// SPAMMER
const phrases = [
  "來嘛來嘛",
  "經過不要放過",
  "要來嗎",
  "快來喔",
  "嗯...所以...那個...你要來嗎？",
  "好嘛～來嘛來嘛",
  "來這邊",
  "來喔來喔",
  "來來草率季",
  "一起玩一起玩",
  "蛤～來了嗎？",
  "叩叩叩...你在哪？",
  "錯過了怎麼辦QQ",
  "不來怎麼辦",
  "呦齁！這邊不錯喔！來看看",
  "是個好機會",
  "很好玩內",
  "來這邊看",
  "來來草率季喔",
  "嗨嘍世界",
];

const flickersContainer = document.getElementById("flickers");
const videoUrl = "https://youtu.be/pt0rWqLqZjE?si=odqEN4W-GnsbRYTB&t=69";

for (let i = 0; i < 30; i++) {
  const a = document.createElement("a");
  a.href = videoUrl;
  a.target = "_blank";
  a.style.position = "absolute";
  a.style.top = `${Math.random() * 100}%`;
  a.style.left = `${Math.random() * 100}%`;
  a.style.textDecoration = "none";

  const span = document.createElement("span");
  span.textContent = phrases[Math.floor(Math.random() * phrases.length)];
  span.style.animationDelay = `${Math.random() * 3}s`;
  span.style.width = "auto";
  span.style.height = "1rem";
  span.classList.add("flicker-span");

  a.appendChild(span);
  flickersContainer.appendChild(a);
}

// 關羽
function myAbout() {
  alert(
    "一年一度的獨立藝文盛會「草率季」（Taipei Art Book Fair）在今年邁入第九屆。這個自2016年起年年舉行（除2021年因疫情停辦）的文創活動，迄今仍不斷打破大眾對市集的想像。現場集結各路創作者、出版社、獨立書店與藝術家等攤位，展出各項獨立刊物、畫冊、藝術雜誌、美術書刊、特色服飾、配件、手做小物⋯⋯等極具特色的出版品與實體創作品，堪稱是年度最大攤的獨立出版創作者派對。每年為期三天的活動裡皆湧入大量人潮，集結所有熱愛設計、攝影、插畫、漫畫、印刷等不同類型的各路文青＋潮青們齊聚一堂。\nTaipei Art Book Fair is a three-day event showcases a diverse range of art books from various publishers, artists, and creators from around the globe. It's a platform for exploring and discovering unique perspectives within the world of art and creativity.\n\n- Team -\nCo-Founder: Frank Huang\nCreative Producer: A君\nCoördinator: B君、C君\nCommunication: B君、C君\nGraphic Design: D君、F君\nWebsite Design/Front-end Developer: Nai-Syuan Ye\nBack-end Developer: Po-Chun Yeh\nData Management/Assistance: Po-Yu Yeh\n"
  );
}

// 打開關起
function openThis(id) {
  id.style.display = "block";
}

function closeThis(id) {
  id.style.display = "none";
}
