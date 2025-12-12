# U-REI 仕様書

## 概要

U-REIは「みんなで育てる共有の知識空間」をコンセプトにした、セルフホスト型のSNS。
Obsidianの知識連結機能と、Mixi的な「みんなが同じ広場にいる」SNS体験を融合させる。

### コンセプト
- 全員が同じタイムラインを見る（アルゴリズムによる分断なし）
- 投稿同士が[[リンク]]でつながり、知識のネットワークが育つ
- つぶやき（短文）と日記（長文）の文化が共存

---

## 技術スタック

```
SvelteKit 2.x + Svelte 5
Bun (ランタイム + パッケージマネージャ)
SQLite (Bunビルトインドライバ使用)
```

### デプロイ目標
```bash
# 理想のデプロイ体験
unzip u-rei.zip
cd u-rei
cp .env.example .env  # Google OAuth設定のみ編集
./start.sh            # → localhost:3000 で起動

# サブディレクトリ運用の場合
BASE_PATH=/u-rei ./start.sh
# → localhost:3000/u-rei/ で起動
```

---

## 機能仕様

### 1. ユーザー管理

#### 認証
- Google OAuth のみ（ID/パスワード管理の複雑さを排除）

#### 登録方式（管理画面で選択）
| モード | 説明 |
|--------|------|
| オープン | 誰でも登録可能 |
| 招待制 | 招待リンク経由のみ登録可能 |
| 承認制 | 登録後、管理者が承認して有効化 |

#### ユーザー属性
```
- id (UUID)
- google_id
- name (表示名、変更可能)
- icon (アップロード可能)
- role: 'admin' | 'member'
- status: 'pending' | 'active' | 'banned'
- created_at
```

---

### 2. 投稿

#### 投稿タイプ
| タイプ | 説明 | 文字数 |
|--------|------|--------|
| つぶやき (tweet) | 短文投稿 | 最大250字 |
| 日記 (diary) | 長文投稿、Markdown対応 | 無制限 |

#### 公開範囲
| 範囲 | 説明 |
|------|------|
| private | 自分のみ |
| internal | SNSメンバーのみ |
| public | ゲスト（未ログイン）にも公開 |

#### 投稿属性
```
- id (UUID)
- user_id
- type: 'tweet' | 'diary'
- title (日記のみ、任意)
- content (Markdown)
- visibility: 'private' | 'internal' | 'public'
- view_count
- created_at
- updated_at
```

---

### 3. [[内部リンク]] システム

#### 概要
Obsidian風の双方向リンクで投稿・ページ同士をつなげる。

#### リンク対象
- つぶやき
- 日記
- 独立ページ

すべてのコンテンツ種別が相互にリンク可能。

#### 入力方法（両方実装）
1. **キーボード**: `[[` 入力でモーダルが開き、検索・選択
2. **ボタン**: 📎リンクボタンタップでモーダルが開く

#### モーダルの挙動
- タイトル・本文・ユーザー名で検索
- 選択すると `[[id:abc123|表示テキスト]]` 形式で挿入
- 表示時は「表示テキスト」のみ見える
- ID管理によりタイトル変更でもリンク切れしない

#### 存在しないリンク
- `[[まだない話題]]` → クリックで新規投稿作成画面へ（タイトル自動入力）

#### バックリンク
- 投稿詳細画面に「この投稿にリンクしている投稿」一覧を表示

#### データ構造
```sql
links (
  id,
  from_type,       -- 'post' | 'page' | 'comment'
  from_id,         -- リンク元のID
  to_type,         -- 'post' | 'page' | NULL(未作成)
  to_id,           -- リンク先のID（NULLなら未作成ページ）
  to_title,        -- 未作成ページの場合のタイトル
  display_text,
  created_at
)
```

---

### 4. つぶやき → 日記まとめ機能

#### フロー
1. 日記作成画面で「つぶやきをまとめる」ボタン
2. 日付範囲・タグで自分のつぶやきを絞り込み
3. チェックして選択
4. 選択したつぶやきの内容が日記本文にインポート
5. 元のつぶやきは残る（日記から自動リンク）

#### 日記側の表示
```markdown
この日記の元になったつぶやき:
- [[id:xxx|つぶやき1]]
- [[id:yyy|つぶやき2]]
```

---

### 5. タグ

#### 形式
- `#タグ名` 形式
- 投稿本文中に記述、自動抽出

#### タグページ
- `/tags/タグ名` でそのタグがついた投稿一覧

---

### 6. リアクション

#### 絵文字リアクション
- Slack/Discord式の任意絵文字選択
- 最近使った絵文字が上部に表示
- Unicode絵文字 + カスタム絵文字

#### カスタム絵文字
- 管理者: 全体で使えるカスタム絵文字を追加可能
- ユーザー: 自分用カスタム絵文字を追加可能（全員が使える）
- 画像形式: PNG/GIF、最大256KB、64x64推奨

#### データ構造
```sql
reactions (
  id,
  post_id,
  user_id,
  emoji,           -- Unicode絵文字 or カスタム絵文字ID
  created_at
)

custom_emojis (
  id,
  shortcode,       -- :emoji_name:
  image_path,
  uploaded_by,
  created_at
)
```

---

### 7. コメント

#### 仕様
- 投稿に対してコメント可能
- コメント内でも [[リンク]] 使用可能
- Markdown対応
- 公開範囲は親投稿に従う

#### データ構造
```sql
comments (
  id,
  post_id,
  user_id,
  content,
  created_at
)
```

---

### 8. タイムライン

#### 特徴
- 全員が同じタイムラインを見る（フォロー機能なし）
- 新しい投稿が上に表示（時系列降順）
- つぶやきと日記が混在

#### フィルタリング
- タイプ: 全部 / つぶやきのみ / 日記のみ
- タグ: 特定タグで絞り込み

#### ゲスト表示
- `visibility: 'public'` の投稿のみ表示

---

### 9. 画像

#### アップロード
- 最大サイズ: 10MB
- 枚数制限: なし
- 対応形式: JPEG, PNG, GIF, WebP

#### 処理
- 自動リサイズ: 長辺最大1920px
- サムネイル自動生成: 300px
- 形式変換: WebPに最適化（オプション）

#### 保存先
```
/data/uploads/
  ├── original/
  ├── resized/
  └── thumbnails/
```

---

### 10. 検索

#### 全文検索
- SQLite FTS5 使用
- 検索対象: 投稿タイトル、本文、コメント
- 日本語対応（trigram tokenizer）

---

### 11. 閲覧数

- 投稿詳細を開くとカウントアップ
- 同一ユーザーは一定時間内は1回のみカウント
- 投稿者本人の閲覧はカウントしない

---

### 12. 管理機能

#### ダッシュボード
- ユーザー数、投稿数、アクティブユーザー統計

#### ユーザー管理
- 一覧表示
- ステータス変更 (pending → active, active → banned)
- ロール変更 (member ↔ admin)

#### 投稿管理
- 検索・一覧
- 削除（論理削除）

#### サイト設定
- 登録モード切り替え
- 招待リンク生成・管理
- サイト名、説明文

---

### 13. 独立ページ (Page)

#### 概要
WordPressの「固定ページ」に相当。タイムラインには流れず、自由なレイアウトで作成できるページ。
ユーザーのポートフォリオ、リンク集、自己紹介ページなどに使用。

#### 特徴
- ブロックエディタによる自由なレイアウト
- 階層構造（子ページ）対応
- [[リンク]]の対象になる（つぶやき・日記からもリンク可能）

#### ブロックエディタ
Editor.js または TipTap ベースで実装。

**基本ブロック**
| ブロック | 説明 |
|----------|------|
| 見出し | H1, H2, H3 |
| テキスト | リッチテキスト（太字、斜体、リンク等） |
| 画像 | 配置: 左寄せ / 中央 / 右寄せ / 全幅 |
| 区切り線 | 水平線 |

**レイアウトブロック**
| ブロック | 説明 |
|----------|------|
| カラム | 2列、3列のレイアウト |
| スペーサー | 余白調整 |

**埋め込みブロック**
| ブロック | 説明 |
|----------|------|
| 内部コンテンツ | つぶやき・日記・独立ページをカード表示 |
| 外部リンク | URL入力 → OGP取得してカード表示 |
| YouTube | 動画埋め込み |
| Twitter | ツイート埋め込み |
| Spotify | 曲/プレイリスト埋め込み |

**リンク集ブロック**
| ブロック | 説明 |
|----------|------|
| ボタンリンク | Linktree風の大きなボタン |
| アイコンリンク | SNSアイコン + リンク |

#### URL構造
```
/user/[username]/page/[slug]
/user/[username]/page/[slug]/[child-slug]

例:
/user/nakamura/page/profile
/user/nakamura/page/works
/user/nakamura/page/works/game-translations
/user/nakamura/page/links
```

#### ユーザートップページ
```
/user/[username]

デフォルト: 自動生成ページ（アイコン + 名前 + つぶやき・日記一覧）
カスタム:   任意の独立ページを指定可能（設定で変更）
```

#### 公開範囲
投稿と同様に private / internal / public から選択。

#### データ構造
```sql
pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL,
  parent_id TEXT REFERENCES pages(id),
  title TEXT NOT NULL,
  content JSON NOT NULL,  -- ブロックエディタのJSONデータ
  visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'public')),
  is_user_top BOOLEAN DEFAULT FALSE,  -- ユーザートップページに設定
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  UNIQUE (user_id, slug, parent_id)
);

-- ページ用インデックス
CREATE INDEX idx_pages_user ON pages(user_id);
CREATE INDEX idx_pages_parent ON pages(parent_id);
CREATE INDEX idx_pages_slug ON pages(user_id, slug);
```

---

### 14. 将来の拡張（v2以降）

#### ActivityPub対応
- インスタンス単位で1つのActorを持つ
- public投稿をNoteとして配信
- Mastodon等から購読可能に

#### RSS
- `/rss` で public 投稿のフィード配信

---

## 画面一覧

```
/ (タイムライン)
/login
/post/new
/post/[id]
/post/[id]/edit
/diary/new
/diary/new?from_tweets=1  (まとめ機能)
/user/[username]                    # ユーザートップ（デフォルト or カスタムページ）
/user/[username]/posts              # つぶやき・日記一覧
/user/[username]/page/new           # 独立ページ新規作成
/user/[username]/page/[slug]        # 独立ページ表示
/user/[username]/page/[slug]/edit   # 独立ページ編集
/user/[username]/page/[...slugs]    # 子ページ（階層対応）
/user/settings
/tags
/tags/[tag]
/search
/admin
/admin/users
/admin/posts
/admin/settings
/admin/emojis
/admin/invites
```

---

## ディレクトリ構成

```
u-rei/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── PostCard.svelte
│   │   │   ├── PostEditor.svelte
│   │   │   ├── LinkModal.svelte
│   │   │   ├── EmojiPicker.svelte
│   │   │   ├── ImageUploader.svelte
│   │   │   ├── Timeline.svelte
│   │   │   ├── BackLinks.svelte
│   │   │   ├── BlockEditor.svelte      # 独立ページ用ブロックエディタ
│   │   │   ├── blocks/                  # 各ブロックタイプ
│   │   │   │   ├── TextBlock.svelte
│   │   │   │   ├── HeadingBlock.svelte
│   │   │   │   ├── ImageBlock.svelte
│   │   │   │   ├── ColumnBlock.svelte
│   │   │   │   ├── EmbedBlock.svelte
│   │   │   │   ├── LinkCardBlock.svelte
│   │   │   │   └── ButtonLinkBlock.svelte
│   │   │   └── PageTree.svelte          # ページ階層ナビ
│   │   ├── server/
│   │   │   ├── db.ts
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── pages.ts                 # 独立ページ
│   │   │   ├── links.ts
│   │   │   ├── reactions.ts
│   │   │   ├── comments.ts
│   │   │   ├── search.ts
│   │   │   ├── images.ts
│   │   │   ├── ogp.ts                   # OGP取得
│   │   │   └── admin.ts
│   │   └── utils/
│   │       ├── markdown.ts
│   │       └── linkParser.ts
│   ├── routes/
│   │   ├── +page.svelte (タイムライン)
│   │   ├── +layout.svelte
│   │   ├── login/
│   │   ├── post/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── diary/
│   │   │   └── new/
│   │   ├── user/
│   │   │   ├── [username]/
│   │   │   │   ├── +page.svelte         # ユーザートップ
│   │   │   │   ├── posts/               # 投稿一覧
│   │   │   │   └── page/
│   │   │   │       ├── new/
│   │   │   │       └── [...slugs]/      # 階層対応
│   │   │   └── settings/
│   │   ├── tags/
│   │   │   └── [tag]/
│   │   ├── search/
│   │   ├── admin/
│   │   │   ├── +page.svelte
│   │   │   ├── users/
│   │   │   ├── posts/
│   │   │   ├── settings/
│   │   │   ├── emojis/
│   │   │   └── invites/
│   │   └── api/
│   │       ├── auth/
│   │       ├── posts/
│   │       ├── pages/                   # 独立ページAPI
│   │       ├── comments/
│   │       ├── reactions/
│   │       ├── links/
│   │       ├── search/
│   │       ├── upload/
│   │       ├── ogp/                     # OGP取得API
│   │       └── admin/
│   └── app.html
├── static/
├── data/               # SQLite DB + uploads (gitignore)
│   ├── u-rei.db
│   └── uploads/
├── .env.example
├── package.json
├── svelte.config.js
├── vite.config.ts
├── start.sh
└── README.md
```

---

## 環境変数 (.env)

```bash
# 必須
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# オプション
ORIGIN=http://localhost:3000
DATABASE_PATH=./data/u-rei.db
UPLOAD_PATH=./data/uploads
MAX_UPLOAD_SIZE=10485760

# サブディレクトリ運用
BASE_PATH=            # 例: /u-rei（デフォルトは空=ルート運用）
```

---

## サブディレクトリ運用

### 概要
U-REIはドメインルートだけでなく、サブディレクトリでも運用可能。

```
# ルート運用（デフォルト）
https://example.com/

# サブディレクトリ運用
https://example.com/u-rei/
https://example.com/community/sns/
```

### 設定方法

#### 1. 環境変数
```bash
BASE_PATH=/u-rei
```

#### 2. SvelteKit設定 (svelte.config.js)
```javascript
import adapter from '@sveltejs/adapter-node';

const basePath = process.env.BASE_PATH || '';

export default {
  kit: {
    adapter: adapter(),
    paths: {
      base: basePath
    }
  }
};
```

#### 3. リバースプロキシ設定例

**Nginx**
```nginx
location /u-rei/ {
    proxy_pass http://localhost:3000/u-rei/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Caddy**
```
example.com {
    handle_path /u-rei/* {
        reverse_proxy localhost:3000
    }
}
```

**Traefik (Docker)**
```yaml
labels:
  - "traefik.http.routers.u-rei.rule=Host(`example.com`) && PathPrefix(`/u-rei`)"
  - "traefik.http.middlewares.u-rei-strip.stripprefix.prefixes=/u-rei"
```

### 実装時の注意点

#### リンク生成
すべての内部リンクで `base` を使用する。

```svelte
<script>
  import { base } from '$app/paths';
</script>

<!-- ✅ 正しい -->
<a href="{base}/post/{id}">投稿を見る</a>
<img src="{base}/uploads/{path}" />

<!-- ❌ 間違い -->
<a href="/post/{id}">投稿を見る</a>
```

#### API呼び出し
```javascript
import { base } from '$app/paths';

// ✅ 正しい
fetch(`${base}/api/posts`);

// ❌ 間違い
fetch('/api/posts');
```

#### 静的ファイル
```
/static/favicon.ico
  ↓ BASE_PATH=/u-rei の場合
/u-rei/favicon.ico でアクセス可能
```

#### OAuth コールバック
Google OAuth のコールバックURLも変わるので注意。

```
# ルート運用
https://example.com/api/auth/callback/google

# サブディレクトリ運用
https://example.com/u-rei/api/auth/callback/google
```

Google Cloud Console で両方登録しておくか、環境に応じて変更する。

---

## データベーススキーマ

```sql
-- ユーザー
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'banned')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 投稿
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('tweet', 'diary')),
  title TEXT,
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'public')),
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- 内部リンク
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  from_type TEXT NOT NULL CHECK (from_type IN ('post', 'page', 'comment')),
  from_id TEXT NOT NULL,
  to_type TEXT CHECK (to_type IN ('post', 'page')),
  to_id TEXT,
  to_title TEXT,
  display_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- つぶやき→日記の関連
CREATE TABLE diary_sources (
  diary_id TEXT NOT NULL REFERENCES posts(id),
  tweet_id TEXT NOT NULL REFERENCES posts(id),
  PRIMARY KEY (diary_id, tweet_id)
);

-- コメント
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- リアクション
CREATE TABLE reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  emoji TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id, emoji)
);

-- カスタム絵文字
CREATE TABLE custom_emojis (
  id TEXT PRIMARY KEY,
  shortcode TEXT UNIQUE NOT NULL,
  image_path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 招待リンク
CREATE TABLE invites (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  uses_remaining INTEGER,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 独立ページ
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL,
  parent_id TEXT REFERENCES pages(id),
  title TEXT NOT NULL,
  content JSON NOT NULL,
  visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'public')),
  is_user_top BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  UNIQUE (user_id, slug, parent_id)
);

-- サイト設定
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 閲覧記録（カウント用）
CREATE TABLE post_views (
  post_id TEXT NOT NULL REFERENCES posts(id),
  user_id TEXT,
  ip_hash TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 全文検索用
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title, content, tokenize='trigram'
);

-- インデックス
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_links_from ON links(from_type, from_id);
CREATE INDEX idx_links_to ON links(to_type, to_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_pages_user ON pages(user_id);
CREATE INDEX idx_pages_parent ON pages(parent_id);
CREATE INDEX idx_pages_slug ON pages(user_id, slug);
```

---

## 実装優先度

### Phase 1 (MVP)
- [ ] プロジェクトセットアップ (SvelteKit + Bun + SQLite)
- [ ] Google OAuth認証
- [ ] 投稿CRUD（つぶやき・日記）
- [ ] タイムライン表示
- [ ] 画像アップロード（リサイズ・サムネイル）
- [ ] 公開範囲設定

### Phase 2
- [ ] [[内部リンク]]システム
- [ ] バックリンク表示
- [ ] タグ機能
- [ ] 全文検索

### Phase 3
- [ ] リアクション（絵文字）
- [ ] カスタム絵文字
- [ ] コメント機能
- [ ] 閲覧数カウント

### Phase 4
- [ ] つぶやき→日記まとめ
- [ ] 管理画面
- [ ] 招待リンク機能
- [ ] ユーザー設定

### Phase 5
- [ ] 独立ページ（ブロックエディタ）
- [ ] ページ階層構造
- [ ] ユーザートップページのカスタマイズ
- [ ] OGP取得・外部埋め込み

### Phase 6 (将来)
- [ ] RSS配信
- [ ] ActivityPub対応
