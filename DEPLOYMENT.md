# デプロイメントガイド

このガイドでは、本番環境へのデプロイ手順を初見の方でも理解できるように詳しく説明します。

## 目次

1. [サーバー要件](#サーバー要件)
2. [初回デプロイ手順](#初回デプロイ手順)
3. [Google OAuth設定](#google-oauth設定)
4. [systemdサービス設定](#systemdサービス設定)
5. [更新・再デプロイ](#更新再デプロイ)
6. [トラブルシューティング](#トラブルシューティング)

## サーバー要件

### 必須環境
- **OS**: Ubuntu 24.04 LTS / Ubuntu 22.04 LTS
- **Node.js**: v18.17.1以上
- **Bun**: 最新版
- **メモリ**: 1GB以上推奨
- **ディスク**: 5GB以上の空き容量
- **ポート**: 3000番ポート（内部）

### 必要なツール
```bash
# システムアップデート
sudo apt update && sudo apt upgrade -y

# ビルドツールのインストール
sudo apt install -y build-essential git curl

# Node.jsのインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Bunのインストール
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

## 初回デプロイ手順

### ステップ 1: リポジトリのクローン

```bash
cd ~
git clone <repository-url> website-yupika
cd website-yupika/yupika.dilettantegames.com-site
```

### ステップ 2: 依存関係のインストール

```bash
# メインサイトの依存関係
~/.bun/bin/bun install

# U-REIの依存関係
cd u-rei
~/.bun/bin/bun install
cd ..
```

### ステップ 3: better-sqlite3のビルド

```bash
cd u-rei
npm rebuild better-sqlite3
cd ..
```

### ステップ 4: 環境変数の設定

U-REIの`.env`ファイルを作成:

```bash
cd u-rei
cat > .env << 'ENVEOF'
# Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Auth.js secret (以下のコマンドで生成)
AUTH_SECRET=generate-this-with-openssl

# Auth URL (本番環境のURL)
AUTH_URL=https://yupika.dilettantegames.net/u-rei
ENVEOF

# AUTH_SECRETを生成
openssl rand -base64 32
# ↑この出力を.envファイルのAUTH_SECRETに貼り付ける
```

**重要**: Google OAuth設定については[Google OAuth設定](#google-oauth設定)セクションを参照してください。

### ステップ 5: ビルド

```bash
# メインサイトのビルド
~/.bun/bin/bun run build

# U-REIのビルド
cd u-rei
~/.bun/bin/bun run build
cd ..
```

### ステップ 6: systemdサービスの設定

詳細は[systemdサービス設定](#systemdサービス設定)セクションを参照してください。

### ステップ 7: サービスの起動

```bash
sudo systemctl daemon-reload
sudo systemctl enable homepage.service
sudo systemctl start homepage.service
sudo systemctl status homepage.service
```

### ステップ 8: 動作確認

```bash
# メインサイト
curl http://localhost:3000/

# U-REI SNS
curl http://localhost:3000/u-rei/

# ログ確認
sudo journalctl -u homepage.service -f
```

## Google OAuth設定

U-REI SNSはGoogle OAuthで認証を行います。以下の手順で設定してください。

### 1. Google Cloud Consoleでプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名を入力（例: "U-REI SNS"）

### 2. OAuth同意画面の設定

1. 左メニュー → 「APIとサービス」 → 「OAuth同意画面」
2. ユーザータイプ: **内部** または **外部** を選択
3. アプリ情報を入力:
   - アプリ名: U-REI SNS
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
4. スコープ: デフォルトのまま（email, profile, openid）
5. 保存して続行

### 3. OAuth 2.0 クライアントIDの作成

1. 左メニュー → 「APIとサービス」 → 「認証情報」
2. 「認証情報を作成」 → 「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: U-REI SNS Client
5. 承認済みのリダイレクトURIを追加:
   ```
   https://yupika.dilettantegames.net/u-rei/auth/callback/google
   ```
   ※本番環境のドメインに合わせて変更してください
6. 「作成」をクリック

### 4. 認証情報の保存

作成後に表示される**クライアントID**と**クライアントシークレット**をコピーして、
`/home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/.env`ファイルに貼り付けます。

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. systemdサービスにも環境変数を設定

`/etc/systemd/system/homepage.service`ファイルにも同じ認証情報を設定します（後述）。

## systemdサービス設定

systemdサービスファイルを作成して、アプリケーションを自動起動・管理します。

### サービスファイルの作成

```bash
sudo nano /etc/systemd/system/homepage.service
```

以下の内容を貼り付けます：

```ini
[Unit]
Description=Yupika Homepage & U-REI SNS
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/website-yupika/yupika.dilettantegames.com-site
Environment="NODE_ENV=production"
Environment="GOOGLE_CLIENT_ID=あなたのクライアントID"
Environment="GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット"
Environment="AUTH_SECRET=生成したシークレット"
Environment="AUTH_URL=https://yupika.dilettantegames.net/u-rei"
ExecStart=/home/ubuntu/.bun/bin/bun server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=homepage

[Install]
WantedBy=multi-user.target
```

**重要**: 以下の値を実際の値に置き換えてください：
- `User`: 実行ユーザー名（現在の例では`ubuntu`）
- `WorkingDirectory`: プロジェクトのパス
- `GOOGLE_CLIENT_ID`: Google OAuthクライアントID
- `GOOGLE_CLIENT_SECRET`: Google OAuthクライアントシークレット
- `AUTH_SECRET`: OpenSSLで生成したランダムな文字列
- `AUTH_URL`: 本番環境のU-REI URL

### サービスの有効化と起動

```bash
# systemdに変更を反映
sudo systemctl daemon-reload

# サービスを有効化（自動起動設定）
sudo systemctl enable homepage.service

# サービスを起動
sudo systemctl start homepage.service

# ステータス確認
sudo systemctl status homepage.service
```

### サービスの管理コマンド

```bash
# サービスの再起動
sudo systemctl restart homepage.service

# サービスの停止
sudo systemctl stop homepage.service

# ログの確認
sudo journalctl -u homepage.service -n 50

# ログをリアルタイムで監視
sudo journalctl -u homepage.service -f
```

## 更新・再デプロイ

コードを更新した後の再デプロイ手順です。

### ステップ 1: 最新コードの取得

```bash
cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site
git pull origin main
```

### ステップ 2: 依存関係の更新（必要な場合）

```bash
# メインサイト
~/.bun/bin/bun install

# U-REI
cd u-rei
~/.bun/bin/bun install
npm rebuild better-sqlite3
cd ..
```

### ステップ 3: リビルド

```bash
# メインサイト
~/.bun/bin/bun run build

# U-REI
cd u-rei
rm -rf build .svelte-kit
~/.bun/bin/bun run build
cd ..
```

### ステップ 4: サービス再起動

```bash
sudo systemctl restart homepage.service
sudo systemctl status homepage.service
```

### ステップ 5: 動作確認

```bash
# HTTPレスポンスの確認
curl -I http://localhost:3000/
curl -I http://localhost:3000/u-rei/

# ログ確認
sudo journalctl -u homepage.service -n 20
```

## トラブルシューティング

### サービスが起動しない

**症状**: `systemctl status`で`failed`と表示される

**確認事項**:
```bash
# ログを確認
sudo journalctl -u homepage.service -n 50 --no-pager

# ビルドファイルの存在確認
ls -la /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/build/
ls -la /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/build/

# Bunバイナリの確認
~/.bun/bin/bun --version

# 権限確認
ls -la /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/server.js
```

**解決方法**:
1. ログで具体的なエラーを確認
2. ビルドが正常に完了しているか確認
3. 環境変数が正しく設定されているか確認

### better-sqlite3エラー

**症状**: `Cannot find module 'better-sqlite3'`やバインディングエラー

**解決方法**:
```bash
cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei
npm rebuild better-sqlite3
cd ..
sudo systemctl restart homepage.service
```

### データベースエラー

**症状**: `Cannot open database because the directory does not exist`

**解決方法**:
```bash
mkdir -p /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/data
chmod 755 /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/data
sudo systemctl restart homepage.service
```

### OAuth認証エラー

**症状**: U-REIにアクセスすると500エラー、ログに`TypeError: basePath?.replace is not a function`

**解決方法**:
1. `.env`ファイルの確認:
   ```bash
   cat /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/.env
   ```

2. systemdサービスファイルの環境変数確認:
   ```bash
   sudo cat /etc/systemd/system/homepage.service | grep Environment
   ```

3. Google Cloud Consoleでリダイレクト URIを確認:
   - `https://your-domain.com/u-rei/auth/callback/google`が正しく設定されているか

4. 環境変数を修正した後は必ずリビルド:
   ```bash
   cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei
   rm -rf build .svelte-kit
   ~/.bun/bin/bun run build
   cd ..
   sudo systemctl daemon-reload
   sudo systemctl restart homepage.service
   ```

### ポート3000が使用中

**症状**: `EADDRINUSE: address already in use`

**解決方法**:
```bash
# ポート3000を使用しているプロセスを確認
sudo lsof -i :3000

# 必要に応じてプロセスを停止
sudo kill <PID>

# またはsystemdサービスを停止
sudo systemctl stop homepage.service
```

## リバースプロキシの設定（Nginx）

本番環境では通常、Nginxをリバースプロキシとして使用します。

### Nginxのインストール

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Nginx設定例

```bash
sudo nano /etc/nginx/sites-available/homepage.conf
```

```nginx
server {
    listen 80;
    server_name yupika.dilettantegames.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/homepage.conf /etc/nginx/sites-enabled/

# 設定のテスト
sudo nginx -t

# Nginx再起動
sudo systemctl restart nginx
```

## HTTPS化（Let's Encrypt）

Let's Encryptの無料SSL証明書を使ってHTTPS化します。

### 1. certbotのインストール

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. ファイアウォールでHTTPSを許可

```bash
sudo ufw allow 'Nginx Full'
```

### 3. SSL証明書の取得

```bash
sudo certbot --nginx -d yupika.dilettantegames.net \
  --email yupika.iris@gmail.com \
  --agree-tos \
  --non-interactive
```

certbotがNginx設定を自動的に更新し、HTTPSが有効になります。

### 4. 自動更新の有効化

Let's Encrypt証明書は90日で期限切れになります。自動更新を有効にします：

```bash
# 自動更新タイマーを開始
sudo systemctl start certbot.timer
sudo systemctl enable certbot.timer

# タイマーの確認
sudo systemctl list-timers | grep certbot
```

### 5. 動作確認

```bash
# HTTPS接続の確認
curl -I https://yupika.dilettantegames.net/

# 証明書の確認
sudo certbot certificates
```

### 6. HTTPからHTTPSへのリダイレクト

certbotが自動で設定しますが、手動で確認・設定する場合：

```nginx
server {
    listen 80;
    server_name yupika.dilettantegames.net;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yupika.dilettantegames.net;

    ssl_certificate /etc/letsencrypt/live/yupika.dilettantegames.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yupika.dilettantegames.net/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. OAuth設定の更新（重要）

HTTPS化後、Google OAuthのリダイレクトURIを更新する必要があります：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 「APIとサービス」→「認証情報」→ OAuth クライアントIDを編集
3. リダイレクトURIを更新：
   ```
   https://yupika.dilettantegames.net/u-rei/auth/callback/google
   ```
4. `.env`と`systemdサービス`の`AUTH_URL`を更新：
   ```
   AUTH_URL=https://yupika.dilettantegames.net/u-rei
   ```
5. U-REIをリビルドしてサービス再起動：
   ```bash
   cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei
   rm -rf build .svelte-kit
   ~/.bun/bin/bun run build
   cd ..
   sudo systemctl daemon-reload
   sudo systemctl restart homepage.service
   ```

## セキュリティ考慮事項

1. **環境変数の保護**
   ```bash
   chmod 600 /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/.env
   sudo chmod 600 /etc/systemd/system/homepage.service
   ```

2. **ファイアウォール設定**
   ```bash
   # UFWの有効化
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

3. **定期的なアップデート**
   ```bash
   # システムパッケージの更新
   sudo apt update && sudo apt upgrade -y

   # Bunパッケージの更新
   cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site
   ~/.bun/bin/bun update
   cd u-rei
   ~/.bun/bin/bun update
   ```

## バックアップ

### データベースのバックアップ

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_PATH="/home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/data/u-rei.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/u-rei_${DATE}.db
echo "Backup created: $BACKUP_DIR/u-rei_${DATE}.db"

# 7日以上古いバックアップを削除
find $BACKUP_DIR -name "u-rei_*.db" -mtime +7 -delete
```

### cronでの自動バックアップ

```bash
# crontabを編集
crontab -e

# 毎日午前3時にバックアップ
0 3 * * * /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/backup.sh
```

## まとめ

基本的なデプロイフロー:

1. サーバー環境の準備
2. リポジトリのクローン
3. 依存関係のインストール
4. Google OAuth設定
5. 環境変数の設定
6. ビルド
7. systemdサービス設定
8. サービス起動・確認

問題が発生した場合は、まずログを確認してください：
```bash
sudo journalctl -u homepage.service -n 100 --no-pager
```

それでも解決しない場合は、トラブルシューティングセクションを参照してください。
