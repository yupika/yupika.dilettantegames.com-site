# CLAUDE.md - U-REI SNS

## 概要
内部SNS・日記システム。Google OAuth認証、承認制。

## 技術スタック
- SvelteKit 2.x + Svelte 5 (Runes API)
- SQLite + bun:sqlite (WAL, FTS5)
- @auth/sveltekit + Google OAuth 2.0
- Sharp (画像処理)

## 開発コマンド
```bash
bun run setup              # 初期セットアップ（対話的）
bun run dev                # 開発サーバー (localhost:5678)
bun run build              # ビルド
bun run check              # 型チェック
```

## 初期セットアップ
```bash
cd u-rei
bun run setup
```
対話的に以下を設定:
- Google OAuth認証情報
- 本番環境URL
- 開発ポート番号
- 初期管理者メールアドレス
- AUTH_SECRET（自動生成）

## 重要なパス
```
u-rei/
├── src/
│   ├── routes/
│   │   ├── api/posts/      # 投稿API
│   │   ├── api/upload/     # 画像アップロードAPI
│   │   ├── admin/          # 管理画面
│   │   ├── login/          # ログインページ
│   │   └── post/new/       # 新規投稿UI
│   ├── lib/server/
│   │   ├── db.ts           # DB初期化・スキーマ
│   │   ├── images.ts       # 画像処理 (Sharp)
│   │   └── storage.ts      # ストレージ抽象化
│   └── hooks.server.js     # 認証フック（ADMIN_EMAILS対応）
├── scripts/
│   └── setup.js            # セットアップスクリプト
├── data/
│   ├── u-rei.db            # SQLiteデータベース
│   └── uploads/            # 画像ストレージ
└── .env                    # 環境設定
```

## 実装状況
### 完了
- Google OAuth認証
- ユーザー管理 (pending/active/banned)
- 投稿API (POST/GET /api/posts)
- 画像アップロード (WebP変換、リサイズ、サムネイル)
- 新規投稿UI
- タイムライン表示
- 管理画面 (/admin)
  - ユーザー一覧
  - ステータス変更 (pending/active/banned)
  - ロール変更 (member/admin)
- セットアップスクリプト (bun run setup)
- 初期管理者自動設定 (ADMIN_EMAILS)

### 未実装
- 投稿詳細・編集・削除
- コメント・リアクション
- 全文検索UI
- Obsidian風リンク機能

## データベース操作
```bash
# Bunで確認（sqlite3コマンドがない環境用）
bun -e "
import { Database } from 'bun:sqlite';
const db = new Database('./data/u-rei.db');
console.log(db.prepare('SELECT * FROM users').all());
"

# ユーザー承認（直接DB操作）
bun -e "
import { Database } from 'bun:sqlite';
const db = new Database('./data/u-rei.db');
db.prepare('UPDATE users SET status=?, role=? WHERE id=?').run('active', 'admin', 'USER_ID');
"
```

## 環境変数 (.env)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Auth.js
AUTH_SECRET=xxx
AUTH_URL=http://localhost:5678      # 開発時
# AUTH_URL=https://example.com/u-rei  # 本番時

# 初期管理者（カンマ区切りで複数可）
ADMIN_EMAILS=admin@example.com

# ストレージ
STORAGE_TYPE=local
```

## Google OAuth設定
Google Cloud Console で以下を登録:

**承認済みの JavaScript 生成元:**
- http://localhost:5678
- https://yupika.dilettantegames.net

**承認済みのリダイレクトURI:**
- http://localhost:5678/auth/callback/google
- https://yupika.dilettantegames.net/u-rei/auth/callback/google

## 親プロジェクトとの統合
- 親の `server.js` から `/u-rei/*` でプロキシ
- 静的ファイル: `/u-rei/uploads/` → `data/uploads/`
- 本番デプロイ時は `AUTH_URL` を本番URLに切り替え

## 仕様書
詳細: `../mddocument/U-REI_SPEC.md`
