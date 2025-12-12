# U-REI SNS セットアップガイド

このガイドでは、U-REI SNSの初期セットアップを5分で完了させる手順を説明します。

## 前提条件

- Node.js v18.17.1以上がインストールされている
- Bunがインストールされている
- make, gcc-c++がインストールされている（better-sqlite3のビルド用）

## クイックスタート（5分）

### 1. 依存関係のインストール（1分）

```bash
cd u-rei
bun install
npm rebuild better-sqlite3
```

### 2. 環境変数の設定（2分）

```bash
# .envファイルを作成
cp .env.example .env

# AUTH_SECRETを生成
openssl rand -base64 32

# .envファイルを編集
nano .env
```

`.env`ファイルを以下のように編集:
```bash
GOOGLE_CLIENT_ID=（後で設定）
GOOGLE_CLIENT_SECRET=（後で設定）
AUTH_SECRET=（上で生成した値を貼り付け）
AUTH_URL=http://localhost:3000/u-rei
```

### 3. ビルド（1分）

```bash
bun run build
```

### 4. 動作確認（1分）

プロジェクトルートで統合サーバーを起動:
```bash
cd ..
node server.js
```

ブラウザで http://localhost:3000/u-rei/ にアクセス。

**注意**: Google OAuth未設定の場合、エラーが表示されますが正常です。
次のステップでOAuth設定を行います。

## Google OAuth設定（10分）

U-REI SNSを実際に使用するには、Google OAuthの設定が必要です。

### 1. Google Cloud Consoleでプロジェクト作成

1. https://console.cloud.google.com/ にアクセス
2. 「プロジェクトを選択」→「新しいプロジェクト」
3. プロジェクト名を入力（例: U-REI SNS）
4. 「作成」をクリック

### 2. OAuth同意画面の設定

1. 左メニュー → 「APIとサービス」 → 「OAuth同意画面」
2. ユーザータイプ:
   - **内部**: G Workspaceの組織内のみ
   - **外部**: 誰でもテスト可能（最初は外部を推奨）
3. 「作成」をクリック
4. アプリ情報を入力:
   ```
   アプリ名: U-REI SNS
   ユーザーサポートメール: （あなたのメールアドレス）
   アプリのロゴ: （オプション）
   承認済みドメイン: localhost（開発環境の場合は不要）
   デベロッパーの連絡先: （あなたのメールアドレス）
   ```
5. 「保存して次へ」
6. スコープ: デフォルトのまま → 「保存して次へ」
7. テストユーザー（外部の場合）: 自分のGoogleアカウントを追加
8. 「保存して次へ」 → 「ダッシュボードに戻る」

### 3. OAuth 2.0 クライアントIDの作成

1. 左メニュー → 「APIとサービス」 → 「認証情報」
2. 「認証情報を作成」 → 「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: U-REI SNS Client
5. **承認済みのリダイレクトURI**を追加:
   ```
   開発環境: http://localhost:3000/u-rei/auth/callback/google
   本番環境: http://your-domain.com/u-rei/auth/callback/google
   ```
6. 「作成」をクリック

### 4. 認証情報を.envに設定

作成後に表示される情報をコピー:
- **クライアント ID**: `xxxxx.apps.googleusercontent.com`
- **クライアント シークレット**: `GOCSPX-xxxxx`

`.env`ファイルを編集:
```bash
cd u-rei
nano .env
```

```bash
GOOGLE_CLIENT_ID=（コピーしたクライアントID）
GOOGLE_CLIENT_SECRET=（コピーしたクライアントシークレット）
AUTH_SECRET=（既に設定済み）
AUTH_URL=http://localhost:3000/u-rei
```

### 5. リビルドと再起動

```bash
# U-REIをリビルド
rm -rf build .svelte-kit
bun run build

# サーバー再起動
cd ..
# Ctrl+Cで停止して再度起動
node server.js
```

### 6. ログインテスト

1. http://localhost:3000/u-rei/ にアクセス
2. 「Googleでログイン」をクリック
3. Googleアカウントでログイン
4. 初回ログイン時は`status='pending'`で登録される

### 7. ユーザーを承認（手動）

```bash
# データベースを開く
sqlite3 u-rei/data/u-rei.db

# 登録されたユーザーを確認
SELECT id, name, google_id, status FROM users;

# ユーザーを承認（google_idを確認して実行）
UPDATE users SET status='active' WHERE google_id='あなたのgoogle_id';

# 確認
SELECT id, name, status FROM users;

# 終了
.quit
```

### 8. 再度ログイン

1. ブラウザをリロード
2. ログイン成功！
3. `/post/new`で投稿を作成してテスト

## 開発ワークフロー

### 開発サーバー起動

```bash
cd u-rei
bun run dev
```

これで http://localhost:5173/ でU-REI単体を開発できます。

**注意**: 開発サーバーではサブパス`/u-rei`がないため、
本番環境と異なる動作をする場合があります。

### 統合サーバーでテスト

```bash
# U-REIをビルド
cd u-rei
bun run build
cd ..

# 統合サーバー起動
node server.js
```

http://localhost:3000/u-rei/ でテスト。

### ホットリロード開発

SvelteKitの開発サーバーを使用すると自動リロードされます:

```bash
cd u-rei
bun run dev
```

ただし、認証やサブパス関連は統合サーバーでテストすることを推奨。

## よくある質問

### Q: 「Internal Error」が表示される

**A**: Google OAuthが未設定の可能性があります。
- `.env`のGOOGLE_CLIENT_ID/SECRETを確認
- リダイレクトURIがGoogle Cloud Consoleと一致しているか確認
- ビルド後にサーバーを再起動したか確認

### Q: ログイン後に「アカウントが承認されていません」と表示される

**A**: ユーザーのstatusが`pending`のままです。
上記「7. ユーザーを承認」の手順でstatusを`active`に変更してください。

### Q: 画像アップロードができない

**A**: 
- `u-rei/data/uploads/`ディレクトリが存在するか確認
- ファイルサイズが10MB以下か確認
- 対応形式（JPEG, PNG, GIF, WebP）か確認

### Q: データベースエラーが出る

**A**:
- `u-rei/data/`ディレクトリが存在するか確認
- 権限を確認: `chmod 755 u-rei/data`

### Q: ビルドエラー: better-sqlite3

**A**:
```bash
cd u-rei
npm rebuild better-sqlite3
bun run build
```

## 次のステップ

1. **タイムライン実装**: 投稿一覧を表示
2. **投稿詳細ページ**: 個別投稿の閲覧・編集
3. **コメント機能**: 投稿へのコメント
4. **リアクション**: 絵文字リアクション
5. **検索機能**: FTS5全文検索の実装

仕様書（`/home/alma/homepage/mddocument/U-REI_SPEC.md`）を参照してください。

## トラブルシューティング

問題が発生した場合は:

1. サーバーログを確認:
   ```bash
   # 統合サーバーの場合
   # ターミナルに直接出力される
   
   # systemdサービスの場合（本番環境）
   sudo journalctl -u svelte-homepage.service -n 50
   ```

2. ビルドをクリーンして再実行:
   ```bash
   cd u-rei
   rm -rf build .svelte-kit node_modules/.cache
   npm rebuild better-sqlite3
   bun run build
   ```

3. データベースをリセット（開発環境のみ）:
   ```bash
   rm u-rei/data/u-rei.db
   # サーバー再起動でデータベースが再作成される
   ```

4. それでも解決しない場合は、親ディレクトリの`DEPLOYMENT.md`のトラブルシューティングセクションを参照してください。

## まとめ

基本的なセットアップフロー:

1. ✅ 依存関係インストール
2. ✅ .env設定
3. ✅ ビルド
4. ✅ Google OAuth設定
5. ✅ ユーザー承認
6. ✅ ログイン成功！

これで開発を始められます。楽しいコーディングを！
