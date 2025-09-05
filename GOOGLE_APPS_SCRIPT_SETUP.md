# Google Apps Script API 設定指南

## 問題診斷

目前遇到的問題：

1. **NetworkError**: CORS 政策阻止了跨域請求
2. **API 回應格式**: 需要確保回應格式正確

## 解決方案

### 1. API 狀態確認

**好消息**：你哥的 Google Apps Script 是完全正常運作的！

從 Postman 測試結果可以看出：

- API 正確回傳書籍資料
- 資料格式完全正確：`{success: true, message: "Get random info success", data: {records: [...]}}`
- 每本書都有 `照片` 欄位，包含多張照片的 URL

**問題診斷**：問題出在 CORS 政策。Postman 不會受到 CORS 限制，但瀏覽器會阻止跨域請求。

**解決方案**：JavaScript 已經修改為使用 POST 方法，符合你哥的 Router 設計。

### 2. 確保回應格式

根據你提供的 `Book` 類別，API 應該回傳：

```json
{
  "success": true,
  "message": "Get random info success",
  "data": {
    "records": [
      {
        "書名": "範例書籍",
        "作者": "作者名稱",
        "出版社": "出版社名稱",
        "照片": "https://example.com/image.jpg",
        "相片＊": "https://example.com/image2.jpg"
      }
    ]
  }
}
```

### 3. 測試 API

可以使用以下 URL 測試：

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=get_random_info&randomCount=1
```

### 4. 部署設定

**重要**：需要重新部署 Google Apps Script！

1. **刪除現有部署**：

   - 在 Google Apps Script 編輯器中，點擊「部署」→「管理部署」
   - 刪除現有的部署

2. **重新部署**：

   - 點擊「部署」→「新增部署作業」
   - **類型**: 網頁應用程式
   - **執行身分**: 我
   - **存取權限**: 任何人
   - **版本**: 新增版本
   - 點擊「部署」

3. **複製新的部署 URL**：
   - 部署完成後，複製新的 URL
   - 更新 JavaScript 中的 API URL

### 5. 常見問題解決

**問題 1: 重定向循環**

- 確保刪除舊部署並重新部署
- 確保 `doGet` 函數已正確修改

**問題 2: CORS 錯誤**

- 確保部署設定中「存取權限」設為「任何人」
- 確保使用正確的部署 URL

**問題 3: 權限錯誤**

- 確保 Google Sheets 的權限設定正確
- 確保 Google Apps Script 有權限存取 Google Sheets

## 目前的備用方案

如果 API 暫時無法使用，JavaScript 會自動使用測試資料，確保網站正常運作。

## 欄位對應

JavaScript 會尋找以下欄位來顯示圖片：

- `照片`
- `相片＊`

建議在 Google Sheets 中使用 `照片` 作為主要欄位名稱。
