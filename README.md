# 活動企劃｜設備選配與即時報價（GitHub Pages 版本）

## 你需要放到 GitHub Repo 的檔案
- `index.html`：網站主檔（已放入）
- `images/`：放你的圖片（商品/等級圖片都放這裡）

## 圖片命名規則（對應你的 Sheet 公式）
### 商品圖片
- 主圖：`商品代碼.jpg`
- 詳情圖A：`商品代碼_a.jpg`
- 詳情圖B：`商品代碼_b.jpg`

例：`stage-deck.jpg`, `stage-deck_a.jpg`, `stage-deck_b.jpg`

### 等級圖片
- 主圖：`tier_類型代碼_等級.jpg`
- 詳情圖A：`tier_類型代碼_等級_a.jpg`
- 詳情圖B：`tier_類型代碼_等級_b.jpg`

例：`tier_safety_1.jpg`, `tier_ambience_4_a.jpg`

## GitHub Pages 開啟方式
1. 建立 GitHub Repo（任意名稱）
2. 把本資料夾內容上傳到 Repo 根目錄（index.html 要在根目錄）
3. 到 Repo → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
4. 儲存後會得到網址：
   - `https://<你的帳號>.github.io/<你的repo>/`

## 重要提醒
目前 `index.html` 仍是「內建資料」版本。
下一步要把它改成「讀取 Google Sheet」（透過 Apps Script API 或發布 CSV）才會讓你在 Sheet 修改就同步到網站。
