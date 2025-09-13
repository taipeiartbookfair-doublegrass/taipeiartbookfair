# 攤商名單 API 整合說明

## 更新內容

已成功整合哥哥提供的攤商名單 API，用於抓取已錄取的攤位資料。

### API 資訊

- **URL**: `https://script.google.com/macros/s/AKfycbxF5VwhrcUjTegd3e-j7Ar7-iD8I0rhvnZNgYmXMZrApQloiqJEhXvp9XzdC1vhntJ8Cw/exec`
- **Action**: `get_accepted_booths`
- **Method**: POST
- **Content-Type**: application/json

### 請求格式

```json
{
  "action": "get_accepted_booths"
}
```

### 響應格式

```json
{
  "success": true,
  "data": {
    "total_count": 數字,
    "booths": [
      {
        "報名編號": "25-IT001",
        "品牌": "攤商名稱",
        "身份類別": "a2 Publisher/Press",
        "錄取": "1-是-1波",
        "已匯款": true,
        "同意書": true,
        "region": "JP",
        // ... 其他字段
      }
    ]
  }
}
```

### 修改的文件

- `js/exhibitors-list.js` - 更新了 API URL 和數據解析邏輯

### 功能特點

1. 自動從哥哥的 API 獲取已錄取的攤商數據
2. 根據報名編號自動分類攤位類型（書攤、創作商品攤、裝置攤、食物攤、國際攤位）
3. 顯示攤商名稱和報名編號
4. 支持流動動畫效果
5. 向後兼容舊的數據格式

### 攤位類型分類

- `LB` - 書攤 (book-booth)
- `LM` - 創作商品攤 (creative-booth)
- `LI` - 裝置攤 (installation-booth)
- `LF` - 食物酒水攤 (food-booth)
- `IT`/`IC` - 國際攤位 (international-booth)

### 使用方式

在 HTML 頁面中包含 `exhibitors-list.js` 並添加 `.exhibitors-grid` 容器即可自動載入攤商名單。

```html
<div class="exhibitors-grid"></div>
<script src="js/exhibitors-list.js"></script>
```

### 測試狀態

✅ API 連接正常  
✅ 數據解析正確  
✅ 攤位分類功能正常  
✅ 向後兼容性良好
