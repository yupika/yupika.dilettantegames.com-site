# 新インスタンスへの移行手順

## 前提条件
- 新しいインスタンス（4GB RAM推奨）
- AlmaLinux 9 または同等のOS
- SSH接続可能

## 移行手順

### 1. 基本パッケージのインストール

```bash
# システムアップデート
sudo dnf update -y

# Node.js v18のインストール
sudo dnf module reset nodejs -y
sudo dnf module install nodejs:18 -y

# Nginxのインストール
sudo dnf install -y nginx

# Gitのインストール
sudo dnf install -y git
```

### 2. アプリケーションのセットアップ

```bash
# ホームディレクトリに移動
cd ~

# リポジトリのクローン
git clone <リポジトリURL> homepage

# ディレクトリに移動
cd homepage

# 依存パッケージのインストール
npm install

# プロダクションビルド
npm run build
```

### 3. Nginx設定

```bash
# nginx設定ファイルをコピー
sudo cp nginx/yupika.dilettantegames.net.conf /etc/nginx/conf.d/

# 設定のテスト
sudo nginx -t

# Nginxを有効化・起動
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Systemdサービスの作成

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
User=alma
WorkingDirectory=/home/alma/homepage
ExecStart=/usr/bin/node server.js
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

### 5. スワップファイルの作成（推奨）

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

### 6. ファイアウォール設定（必要に応じて）

```bash
# HTTP (80) とHTTPS (443) を許可
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 7. DNS設定の変更

1. DNSプロバイダーの管理画面にログイン
2. `yupika.dilettantegames.net` のAレコードを新インスタンスのIPアドレスに変更
3. TTLが短い場合は数分、長い場合は数時間で反映

### 8. 動作確認

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

### 9. ログの確認

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
ls -la /home/alma/homepage/build/

# 再ビルド
cd /home/alma/homepage
npm run build
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
   pkill -f "node server.js"
   ```

2. 数日間様子を見て問題なければ、旧インスタンスを削除

## メモ

- 現在のIPアドレス（旧）: 160.248.2.200
- ドメイン: yupika.dilettantegames.net
- アプリケーションポート: 3000
- Webサーバーポート: 80
