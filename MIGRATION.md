# 新インスタンスへの移行手順

## 前提条件
- 新しいインスタンス（4GB RAM推奨）
- Ubuntu 24.04 LTS または同等のOS
- SSH接続可能

## 移行手順

### 1. 基本パッケージのインストール

```bash
# システムアップデート
sudo apt update && sudo apt upgrade -y

# Node.js v18のインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginxのインストール
sudo apt install -y nginx

# Gitのインストール
sudo apt install -y git

# ビルドツールのインストール
sudo apt install -y build-essential
```

### 2. Bunのインストール

```bash
# Bunをインストール
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 3. アプリケーションのセットアップ

```bash
# ホームディレクトリに移動
cd ~

# リポジトリのクローン
git clone <リポジトリURL> website-yupika

# ディレクトリに移動
cd website-yupika/yupika.dilettantegames.com-site

# 依存パッケージのインストール（メインサイト）
~/.bun/bin/bun install

# U-REIの依存パッケージのインストール
cd u-rei
~/.bun/bin/bun install
cd ..

# プロダクションビルド（メインサイト）
~/.bun/bin/bun run build

# U-REIのビルド
cd u-rei
~/.bun/bin/bun run build
cd ..
```

### 4. Nginx設定

```bash
# nginx設定ファイルをコピー
sudo cp nginx/yupika.dilettantegames.net.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/yupika.dilettantegames.net.conf /etc/nginx/sites-enabled/

# デフォルト設定を無効化（必要に応じて）
sudo rm /etc/nginx/sites-enabled/default

# 設定のテスト
sudo nginx -t

# Nginxを有効化・起動
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Systemdサービスの作成

アプリケーションを自動起動させるため、systemdサービスを作成します。

```bash
# サービスファイルを作成
sudo nano /etc/systemd/system/homepage.service
```

以下の内容を記述：

```ini
[Unit]
Description=Yupika Homepage - SvelteKit Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/website-yupika/yupika.dilettantegames.com-site
ExecStart=/home/ubuntu/.bun/bin/bun server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

サービスを有効化・起動：

```bash
# 設定の再読み込み
sudo systemctl daemon-reload

# サービスを有効化
sudo systemctl enable homepage

# サービスを起動
sudo systemctl start homepage

# ステータス確認
sudo systemctl status homepage
```

### 6. スワップファイルの作成（推奨）

メモリ不足時のバッファとして2GBのスワップを作成：

```bash
# スワップファイル作成
sudo fallocate -l 2G /swapfile

# パーミッション設定
sudo chmod 600 /swapfile

# スワップ領域としてフォーマット
sudo mkswap /swapfile

# スワップを有効化
sudo swapon /swapfile

# 再起動後も有効にする
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 7. ファイアウォール設定（必要に応じて）

```bash
# UFWが有効な場合
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 8. DNS設定の変更

1. DNSプロバイダーの管理画面にログイン
2. `yupika.dilettantegames.net` のAレコードを新インスタンスのIPアドレスに変更
3. TTLが短い場合は数分、長い場合は数時間で反映

### 9. 動作確認

```bash
# アプリケーションが起動しているか確認
sudo systemctl status homepage

# ポート3000でリッスンしているか確認
sudo ss -tlnp | grep :3000

# Nginxが起動しているか確認
sudo systemctl status nginx

# ポート80でリッスンしているか確認
sudo ss -tlnp | grep :80

# ヘルスチェック
curl http://localhost:3000/health

# Nginx経由でアクセス
curl http://localhost/
```

### 10. ログの確認

```bash
# アプリケーションログ
sudo journalctl -u homepage -f

# Nginxのアクセスログ
sudo tail -f /var/log/nginx/access.log

# Nginxのエラーログ
sudo tail -f /var/log/nginx/error.log
```

## トラブルシューティング

### アプリケーションが起動しない

```bash
# ログを確認
sudo journalctl -u homepage -n 50

# ビルドファイルが存在するか確認
ls -la /home/ubuntu/website-yupika/yupika.dilettantegames.com-site/build/

# 再ビルド
cd /home/ubuntu/website-yupika/yupika.dilettantegames.com-site
~/.bun/bin/bun run build
sudo systemctl restart homepage
```

### Nginxのエラー

```bash
# 設定のテスト
sudo nginx -t

# エラーログを確認
sudo tail -f /var/log/nginx/error.log
```

### メモリ不足

```bash
# メモリ使用状況を確認
free -h

# スワップが有効か確認
swapon --show

# プロセスのメモリ使用量を確認
ps aux --sort=-%mem | head -10
```

## 旧インスタンスからの完全移行後

移行が完了し、新インスタンスで正常に動作することを確認したら：

1. 旧インスタンスでサービスを停止
   ```bash
   # 旧インスタンスで実行
   sudo systemctl stop homepage
   pkill -f "bun server.js"
   ```

2. 数日間様子を見て問題なければ、旧インスタンスを削除

## メモ

- ドメイン: yupika.dilettantegames.net
- アプリケーションポート: 3000
- Webサーバーポート: 80/443
- ユーザー: ubuntu
- アプリケーションパス: /home/ubuntu/website-yupika/yupika.dilettantegames.com-site
