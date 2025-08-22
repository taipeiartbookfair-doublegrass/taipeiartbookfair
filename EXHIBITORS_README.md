# 攤商名單系統使用說明

## 概述

這個攤商名單系統是為草率季 Taipei Art Book Fair 設計的，可以從 Google 試算表自動獲取攤商資訊並在網頁上動態顯示。

## 功能特色

- 🎯 **自動數據同步**: 從 Google Apps Script 試算表自動獲取攤商資訊
- 🌐 **雙語支援**: 支援中文和英文顯示
- 🔍 **搜尋功能**: 可以搜尋攤商名稱、類別或描述
- 📊 **統計資訊**: 顯示各類攤位的數量統計
- 📱 **響應式設計**: 支援各種設備尺寸
- 🖼️ **圖片展示**: 支援攤商圖片展示
- 📋 **詳細資訊**: 點擊卡片可查看詳細資訊

## 文件結構

```
├── mainpage.html          # 主頁面，包含攤商名單區塊
├── css/
│   └── exhibitors.css     # 攤商名單樣式
├── js/
│   └── exhibitors-list.js # 攤商名單邏輯
└── EXHIBITORS_README.md   # 本說明文件
```

## 試算表數據格式

系統期望從試算表獲取以下格式的數據：

### 方法 1: 直接返回攤商陣列

```json
{
  "exhibitors": [
    {
      "id": "LB001",
      "name": "草率季出版社",
      "nameEn": "TPABF Press",
      "category": "書攤",
      "categoryEn": "Book Booth",
      "description": "專注於藝術書籍出版的獨立出版社",
      "descriptionEn": "Independent publisher focusing on art books",
      "booth": "A-01",
      "image": "image/horizental/hori1.jpg"
    }
  ]
}
```

### 方法 2: 使用 success 欄位

```json
{
  "success": true,
  "exhibitors": [...]
}
```

### 方法 3: 其他可能的欄位名稱

系統會自動嘗試以下欄位名稱：

- `data`
- `vendors`
- `participants`
- `booths`

## Google Apps Script 設置

### 1. 創建新的 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點擊「新專案」
3. 重命名專案為「TPABF Exhibitors API」

### 2. 設置程式碼

```javascript
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify(getExhibitorsData())
  ).setMimeType(ContentService.MimeType.JSON);
}

function getExhibitorsData() {
  // 獲取試算表數據
  const spreadsheetId = "YOUR_SPREADSHEET_ID";
  const sheetName = "Exhibitors";

  try {
    const sheet =
      SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();

    // 假設第一行是標題
    const headers = data[0];
    const exhibitors = [];

    // 從第二行開始處理數據
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const exhibitor = {};

      // 根據標題映射數據
      headers.forEach((header, index) => {
        exhibitor[header] = row[index];
      });

      exhibitors.push(exhibitor);
    }

    return {
      success: true,
      exhibitors: exhibitors,
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}
```

### 3. 部署為網頁應用程式

1. 點擊「部署」→「新增部署」
2. 選擇「網頁應用程式」
3. 設定存取權限
4. 複製部署後的 URL

### 4. 更新 JavaScript 文件

將新的 URL 更新到 `js/exhibitors-list.js` 中的 `publishApiUrl` 變數：

```javascript
const publishApiUrl = "YOUR_NEW_DEPLOYMENT_URL";
```

## 試算表欄位建議

建議在試算表中包含以下欄位：

| 欄位名稱      | 說明         | 範例                                        |
| ------------- | ------------ | ------------------------------------------- |
| id            | 攤商編號     | LB001                                       |
| name          | 攤商中文名稱 | 草率季出版社                                |
| nameEn        | 攤商英文名稱 | TPABF Press                                 |
| category      | 攤位類別中文 | 書攤                                        |
| categoryEn    | 攤位類別英文 | Book Booth                                  |
| description   | 攤商描述中文 | 專注於藝術書籍出版的獨立出版社              |
| descriptionEn | 攤商描述英文 | Independent publisher focusing on art books |
| booth         | 攤位編號     | A-01                                        |
| image         | 圖片路徑     | image/horizental/hori1.jpg                  |

## 自訂樣式

可以通過修改 `css/exhibitors.css` 來自訂外觀：

- 修改顏色主題
- 調整卡片大小和間距
- 自訂動畫效果
- 調整響應式斷點

## 故障排除

### 1. 無法載入攤商數據

- 檢查 Google Apps Script 的部署 URL 是否正確
- 確認試算表的存取權限
- 檢查瀏覽器控制台的錯誤訊息

### 2. 圖片無法顯示

- 確認圖片路徑是否正確
- 檢查圖片檔案是否存在
- 系統會自動使用預設圖片作為備用

### 3. 語言切換不工作

- 確認 `duolanguage.js` 已正確載入
- 檢查語言切換按鈕的 ID 是否正確

## 擴展功能建議

- 添加攤商分類篩選
- 實現攤商地圖定位
- 添加攤商社交媒體連結
- 實現攤商收藏功能
- 添加攤商評價系統

## 技術支援

如有問題，請檢查：

1. 瀏覽器控制台的錯誤訊息
2. 網路請求的狀態
3. 試算表的數據格式
4. Google Apps Script 的執行日誌

## 更新日誌

- 2025-01-XX: 初始版本發布
- 支援基本的攤商展示功能
- 實現雙語切換和搜尋功能
