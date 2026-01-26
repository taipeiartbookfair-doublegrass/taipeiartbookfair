/**
 * 首頁內容控制腳本
 * 從 Google Spreadsheet 獲取內容並更新頁面元素
 * 
 * 試算表格式：
 * - name: 欄位名稱（如"按鈕名稱"）
 * - id: 對應的 HTML id（如"ticket-button"）
 * - content: 內容
 */

// API URL - 請替換為您的 Google Apps Script Web App URL
const INDEX_CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbxGy6StTnQw2PPv0yOjftfsXTDhn1G4SPXeYc6OCQdmjl8O5PsOKRQ3-xjrF4bWMyxk/exec";
/**
 * 從 API 獲取試算表資料
 */
async function fetchIndexContent() {
  try {
    const response = await fetch(`${INDEX_CONTENT_API_URL}?sheet=index_content`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 處理不同的 API 回應格式
    let items = [];
    if (data.items) {
      items = data.items;
    } else if (data.rows) {
      items = data.rows;
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data.data && Array.isArray(data.data)) {
      items = data.data;
    }
    
    return items;
  } catch (error) {
    console.error("獲取首頁內容失敗:", error);
    return [];
  }
}

/**
 * 更新頁面元素
 * @param {Array} items - 從 API 獲取的資料陣列
 */
function updatePageElements(items) {
  if (!items || items.length === 0) {
    console.warn("沒有資料可更新");
    return;
  }

  // 建立 id 到資料的映射（處理相同 id 但不同 name 的情況）
  const dataMap = {};
  items.forEach(item => {
    const id = item.id || item['id'];
    const name = (item.name || item['name'] || '').toLowerCase();
    const content = item.content || item['content'];
    
    if (id && content) {
      if (!dataMap[id]) {
        dataMap[id] = {};
      }
      
      // 根據 name 判斷是文字還是連結
      if (name.includes('連結') || name.includes('link') || name === '連結') {
        dataMap[id].link = content;
      } else if (name.includes('按鈕') || name.includes('button') || name.includes('名稱') || name === '按鈕名稱') {
        dataMap[id].text = content;
      } else {
        // 預設為文字內容
        dataMap[id].content = content;
      }
    }
  });

  // 更新每個元素
  Object.keys(dataMap).forEach(id => {
    const item = dataMap[id];
    const element = document.getElementById(id);

    if (!element) {
      console.warn(`找不到 id 為 "${id}" 的元素`);
      return;
    }

    // 根據元素類型更新內容
    if (id === 'ticket-button') {
      // 按鈕：更新文字和連結
      if (item.text) {
        element.textContent = item.text;
      }
      if (item.link) {
        // 處理特殊格式：如果連結是 "-- ticketvisit.html"，只取 "ticketvisit.html"
        let link = item.link.trim();
        if (link.startsWith('-- ')) {
          link = link.substring(3).trim();
        }
        // 如果連結是 "ticketvisit.html"，保持相對路徑
        // 如果是完整 URL，直接使用
        if (link.startsWith('http://') || link.startsWith('https://')) {
          element.href = link;
        } else {
          element.href = link;
        }
      }
    } else if (id.startsWith('banner-content-')) {
      // Banner 內容：更新 HTML（保留 dot 樣式）
      const content = item.content || '';
      if (!content) {
        console.warn(`id 為 "${id}" 的項目沒有內容`);
        return;
      }
      
      let htmlContent = content;
      
      // 如果內容不包含 dot，自動添加
      if (!htmlContent.includes('<span class="dot">')) {
        // 根據 id 決定 dot 顏色
        const dotColor = id === 'banner-content-1'
          ? ''
          : 'style="background-color: blueviolet"';
        // 將內容分段，每段前面加上 dot
        const segments = htmlContent.split(/\s{2,}|\n/).filter(s => s.trim());
        htmlContent = segments
          .map((segment, index) => {
            // 第一段用普通 dot，其他用指定顏色
            const currentDotColor =
              (index === 0 && id === 'banner-content-1') ? '' : dotColor;
            return `<span class="dot" ${currentDotColor}></span> ${segment.trim()}`;
          })
          .join(' ');
      }

      // 🔁 重複多輪，避免跑完變空白
      const repeatCount = 4; // 覺得還短可以調大
      const repeated = Array(repeatCount).fill(htmlContent).join(' ');

      element.innerHTML = repeated;
    } else {
      // 其他元素：更新文字內容
      const content = item.content || item.text || '';
      if (!content) {
        console.warn(`id 為 "${id}" 的項目沒有內容`);
        return;
      }
      
      // 如果元素是 input 或 textarea，更新 value
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = content;
      } else {
        // 其他元素更新 innerHTML（支援 HTML 格式）
        element.innerHTML = content;
      }
    }

    console.log(`已更新 id 為 "${id}" 的元素`);
  });
}

/**
 * 初始化：載入並更新頁面內容
 */
async function initIndexContent() {
  console.log("開始載入首頁內容...");
  
  const items = await fetchIndexContent();
  
  if (items.length > 0) {
    updatePageElements(items);
    console.log(`成功載入並更新 ${items.length} 個元素`);
  } else {
    console.warn("沒有載入到任何內容，使用預設內容");
  }
}

// 頁面載入完成後執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIndexContent);
} else {
  // DOM 已經載入完成
  initIndexContent();
}

