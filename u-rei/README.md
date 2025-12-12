# U-REI SNS

U-REIは内部SNS・日記システムです。Google OAuthで認証を行い、承認されたユーザーのみがアクセスできます。

## 機能

### 実装済み
- ✅ Google OAuth 2.0認証
- ✅ ユーザー管理（pending/active/banned）
- ✅ SQLiteデータベース（better-sqlite3）
- ✅ データベーススキーマ（FTS5全文検索対応）
- ✅ 画像アップロード（Sharp処理）
  - オリジナル（WebP 95%品質）
  - リサイズ版（1920px、WebP 85%品質）
  - サムネイル（300x300、WebP 80%品質）
- ✅ ストレージ抽象化（ローカル/S3対応設計）
- ✅ 投稿API（POST /api/posts）
- ✅ 画像アップロードAPI（POST /api/upload）
- ✅ 投稿作成UI（/post/new）

### 未実装（仕様書参照）
- ⏳ タイムライン表示
- ⏳ 投稿詳細・編集・削除
- ⏳ コメント機能
- ⏳ リアクション機能
- ⏳ 内部リンク機能
- ⏳ 全文検索
- ⏳ カスタム絵文字
- ⏳ 独立ページ機能
- ⏳ 招待リンク機能
- ⏳ 管理画面

## 技術スタック

- **フロントエンド**: SvelteKit 2.x + Svelte 5（Runes API）
- **データベース**: SQLite + better-sqlite3
  - WALモード有効
  - FTS5全文検索
  - Foreign Keys有効
- **認証**: @auth/sveltekit + Google OAuth 2.0
- **画像処理**: Sharp
  - WebP変換
  - EXIF削除（プライバシー保護）
  - 自動回転
  - リサイズ・サムネイル生成
- **ストレージ**: 
  - 現在: ローカルファイルシステム
  - 将来: AWS S3（実装準備済み）

## ディレクトリ構造

```
u-rei/
├── src/
│   ├── routes/              # SvelteKitルート
│   │   ├── +page.svelte    # ホーム（未実装）
│   │   ├── +layout.server.js  # レイアウトサーバーロード
│   │   ├── login/          # ログインページ
│   │   ├── post/           # 投稿関連ページ
│   │   │   └── new/        # 新規投稿
│   │   └── api/            # APIエンドポイント
│   │       ├── posts/      # 投稿API
│   │       └── upload/     # 画像アップロードAPI
│   ├── lib/
│   │   ├── components/     # Svelteコンポーネント
│   │   │   └── ImageUploader.svelte  # 画像アップローダー
│   │   └── server/         # サーバーサイドコード
│   │       ├── db.ts       # データベース初期化
│   │       ├── images.ts   # 画像処理
│   │       └── storage.ts  # ストレージ抽象化
│   └── hooks.server.js     # SvelteKit hooks（認証）
├── data/                    # データディレクトリ
│   ├── u-rei.db            # SQLiteデータベース
│   └── uploads/            # アップロード画像
│       ├── original/       # オリジナル画像
│       ├── resized/        # リサイズ画像
│       └── thumbnails/     # サムネイル
├── .env                     # 環境変数
├── package.json
├── svelte.config.js
├── vite.config.ts
└── README.md               # このファイル
```

## データベーススキーマ

### users（ユーザー）
- id: TEXT PRIMARY KEY
- google_id: TEXT UNIQUE
- name: TEXT
- icon: TEXT
- role: 'admin' | 'member'
- status: 'pending' | 'active' | 'banned'
- created_at: DATETIME

### posts（投稿）
- id: TEXT PRIMARY KEY
- user_id: TEXT (FK)
- type: 'tweet' | 'diary'
- title: TEXT (日記のみ)
- content: TEXT
- visibility: 'private' | 'internal' | 'public'
- view_count: INTEGER
- created_at: DATETIME
- updated_at: DATETIME
- deleted_at: DATETIME

### links（内部リンク）
- from_type, from_id: リンク元
- to_type, to_id: リンク先
- display_text: 表示テキスト

### diary_sources（日記の元ツイート）
- diary_id: TEXT (FK)
- tweet_id: TEXT (FK)

### comments（コメント）
- id, post_id, user_id, content
- created_at, deleted_at

### reactions（リアクション）
- id, post_id, user_id, emoji
- UNIQUE(post_id, user_id, emoji)

### custom_emojis（カスタム絵文字）
- id, shortcode, image_path, uploaded_by

### invites（招待リンク）
- id, code, created_by
- uses_remaining, expires_at

### pages（独立ページ）
- id, user_id, slug, parent_id
- title, content (JSON), visibility
- is_user_top: ユーザーのトップページか

### posts_fts（全文検索）
- FTS5仮想テーブル（trigram）
- title, content

## 環境変数

`.env`ファイルで以下を設定:

```bash
# Google OAuth認証情報
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Auth.js
AUTH_SECRET=random_secret_32_chars
AUTH_URL=http://your-domain.com/u-rei

# オプション
DATABASE_PATH=./data/u-rei.db  # デフォルト
UPLOAD_PATH=./data/uploads     # デフォルト
MAX_UPLOAD_SIZE=10485760       # 10MB（デフォルト）
STORAGE_TYPE=local             # local | s3
```

## 開発

### 開発サーバー起動
```bash
bun run dev
```

アクセス: http://localhost:5173/

### ビルド
```bash
bun run build
```

### プレビュー
```bash
bun run preview
```

## 画像処理フロー

1. ユーザーがファイル選択
2. クライアント→サーバー（FormData）
3. サーバー側処理:
   - ファイルサイズチェック（MAX_UPLOAD_SIZE）
   - ファイル形式チェック（JPEG, PNG, GIF, WebP）
   - Sharp処理:
     - オリジナル: メタデータ削除、WebP 95%
     - リサイズ: 1920px以内、WebP 85%
     - サムネイル: 300x300切り抜き、WebP 80%
   - ストレージ保存
4. URL生成して返却

## ストレージ

### ローカルストレージ（現在）
- `data/uploads/`以下に保存
- `/u-rei/uploads/`でHTTP配信（Expressの静的ファイル）

### S3ストレージ（将来）
- `lib/server/storage.ts`のS3Storageクラスを実装
- 環境変数で切り替え: `STORAGE_TYPE=s3`
- 必要な環境変数:
  ```
  S3_BUCKET=your-bucket
  S3_REGION=us-east-1
  CDN_URL=https://cdn.example.com  # オプション
  ```

## 認証フロー

1. ユーザーが`/u-rei/`にアクセス
2. 未認証→ログインページ（/login）にリダイレクト
3. 「Googleでログイン」ボタン→OAuth開始
4. Google認証成功→コールバック
5. hooks.server.jsで処理:
   - ユーザーがDB未登録→status='pending'で作成
   - ユーザーが登録済み→statusチェック
6. status='active'なら継続、それ以外はエラー

## ユーザー承認フロー

新規ユーザーは自動的に`status='pending'`で登録されます。
管理者が承認するまでアクセスできません。

### 手動承認（現在）
```bash
sqlite3 data/u-rei.db
UPDATE users SET status='active' WHERE google_id='<google_id>';
```

### 管理画面（未実装）
将来的に管理画面から承認操作を行えるようにする予定。

## API仕様

### POST /api/posts
新規投稿作成

**リクエスト**:
```json
{
  "type": "tweet" | "diary",
  "title": "タイトル（日記のみ）",
  "content": "本文",
  "visibility": "private" | "internal" | "public",
  "images": [
    {
      "original": "path/to/original.webp",
      "resized": "path/to/resized.webp",
      "thumbnail": "path/to/thumbnail.webp",
      "originalUrl": "/u-rei/uploads/...",
      "resizedUrl": "/u-rei/uploads/...",
      "thumbnailUrl": "/u-rei/uploads/..."
    }
  ]
}
```

**レスポンス**:
```json
{
  "success": true,
  "id": "post-uuid",
  "type": "tweet",
  "title": null,
  "content": "本文",
  "visibility": "internal",
  "created_at": "2025-12-11T07:00:00.000Z"
}
```

### POST /api/upload
画像アップロード

**リクエスト**: `multipart/form-data`
- `file`: 画像ファイル

**レスポンス**:
```json
{
  "success": true,
  "original": "original/user_timestamp_id.webp",
  "resized": "resized/user_timestamp_id.webp",
  "thumbnail": "thumbnails/user_timestamp_id.webp",
  "originalUrl": "/u-rei/uploads/original/...",
  "resizedUrl": "/u-rei/uploads/resized/...",
  "thumbnailUrl": "/u-rei/uploads/thumbnails/..."
}
```

## トラブルシューティング

### OAuth認証エラー
- `.env`のGOOGLE_CLIENT_ID/SECRETを確認
- Google Cloud ConsoleのリダイレクトURIを確認
- AUTH_URLが本番ドメインと一致しているか確認

### データベースエラー
- `data/`ディレクトリが存在するか確認
- 権限を確認: `chmod 755 data/`

### 画像アップロードエラー
- `data/uploads/`ディレクトリが存在するか確認
- ファイルサイズ制限（10MB）を確認
- 対応形式: JPEG, PNG, GIF, WebP

## 仕様書

詳細な仕様は`/home/alma/homepage/mddocument/U-REI_SPEC.md`を参照してください。

## ライセンス

プライベートプロジェクト
