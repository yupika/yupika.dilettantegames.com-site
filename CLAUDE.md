# CLAUDE.md

## プロジェクト概要
個人サイト (yupikaさんのホームページ) + U-REI SNS

## 技術スタック

### フロントエンド
- **フレームワーク**: SvelteKit v2.x (Svelte 5)
- **言語**: JavaScript (TypeScript型定義あり)
- **スタイリング**:
  - Tailwind CSS v3.3.3
  - DaisyUI v3.7.4
  - PostCSS v8.4.29

### バックエンド
- **ランタイム**: Bun (メイン), Node.js v18.x (互換性)
- **サーバー**: Express.js v4.18.2
- **アダプター**: @sveltejs/adapter-node
- **ポート**: 3000

### U-REI SNS
- **データベース**: SQLite (better-sqlite3)
- **認証**: Google OAuth (@auth/sveltekit)
- **画像処理**: sharp

### ビルドツール
- Vite v5.x
- Bun

## サーバー情報
- **OS**: Ubuntu 24.04 LTS
- **ユーザー**: ubuntu
- **ドメイン**: yupika.dilettantegames.net
- **URL**: https://yupika.dilettantegames.net/

## プロジェクト構造
```
/home/ubuntu/website-yupika/yupika.dilettantegames.com-site/
├── src/
│   ├── routes/
│   │   ├── +page.svelte (トップページ)
│   │   ├── +layout.svelte
│   │   ├── Header.svelte
│   │   ├── Counter.svelte
│   │   ├── about/
│   │   ├── sverdle/
│   │   └── nukadoko/
│   ├── lib/
│   ├── app.html
│   └── app.css
├── u-rei/                    # U-REI SNSサブアプリケーション
│   ├── src/
│   ├── build/
│   ├── data/                 # SQLiteデータベース
│   ├── .env                  # OAuth設定
│   └── package.json
├── nginx/                    # Nginx設定ファイル
├── mddocument/              # ドキュメント
├── server.js                # Express統合サーバー
├── start.sh                 # 起動スクリプト (Bun)
├── package.json
├── MIGRATION.md             # 移行手順
├── DEPLOYMENT.md            # デプロイメントガイド
└── svelte.config.js
```

## 主要な機能
- カウンターコンポーネント
- Sverdle (ゲーム)
- Nukadoko セクション
- U-REI SNS (内部SNS、Google OAuth認証)
- ヘルスチェックエンドポイント (`/health`)

## 開発コマンド
```bash
# メインサイト
~/.bun/bin/bun run dev       # 開発サーバー起動
~/.bun/bin/bun run build     # プロダクションビルド
~/.bun/bin/bun run preview   # プロダクションプレビュー
~/.bun/bin/bun run check     # Svelte型チェック

# U-REI
cd u-rei
~/.bun/bin/bun run dev       # 開発サーバー起動
~/.bun/bin/bun run build     # プロダクションビルド
```

## 本番サーバー起動
```bash
# 直接起動
./start.sh

# systemdサービス経由
sudo systemctl start homepage
sudo systemctl status homepage
sudo journalctl -u homepage -f
```

## デプロイメント
- Bun + Express.jsでserver.jsを起動
- ポート3000でリッスン
- Nginxでリバースプロキシ
- Let's EncryptでHTTPS化

## 重要なパス
- アプリケーション: `/home/ubuntu/website-yupika/yupika.dilettantegames.com-site`
- U-REIデータベース: `/home/ubuntu/website-yupika/yupika.dilettantegames.com-site/u-rei/data/u-rei.db`
- Nginx設定: `/etc/nginx/sites-available/`
- systemdサービス: `/etc/systemd/system/homepage.service`
