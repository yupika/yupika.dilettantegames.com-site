# Yupika's Homepage & U-REI SNS

このリポジトリは2つのSvelteKitアプリケーションを統合したプロジェクトです：

- **メインサイト** (`/`): yupikaの個人ホームページ
- **U-REI SNS** (`/u-rei`): 内部SNS・日記システム

## プロジェクト構成

```
homepage/
├── src/                    # メインサイトのソースコード
├── static/                 # メインサイトの静的ファイル
├── build/                  # メインサイトのビルド成果物
├── u-rei/                  # U-REI SNSアプリケーション
│   ├── src/               # U-REIのソースコード
│   ├── build/             # U-REIのビルド成果物
│   ├── data/              # データベース・アップロード画像
│   └── README.md          # U-REI詳細ドキュメント
├── server.js              # Expressサーバー（両アプリを統合）
├── package.json           # メインサイトの依存関係
├── DEPLOYMENT.md          # デプロイメントガイド
└── README.md              # このファイル
```

## 技術スタック

### メインサイト
- **フレームワーク**: SvelteKit 1.x
- **ランタイム**: Node.js v18.17.1
- **アダプター**: @sveltejs/adapter-node
- **スタイリング**: Tailwind CSS, DaisyUI

### U-REI SNS
- **フレームワーク**: SvelteKit 2.x + Svelte 5
- **データベース**: SQLite (better-sqlite3)
- **認証**: Google OAuth 2.0 (@auth/sveltekit)
- **画像処理**: Sharp
- **ストレージ**: ローカル (S3移行予定)

### 統合サーバー
- **フレームワーク**: Express.js
- **ポート**: 3000
- **プロセス管理**: systemd

## クイックスタート

### 前提条件
- Node.js v18.17.1以上
- npm または bun
- make, gcc-c++ (better-sqlite3コンパイル用)

### 開発環境のセットアップ

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd homepage
```

2. **依存関係のインストール**
```bash
# メインサイト
npm install

# U-REI SNS
cd u-rei
bun install
cd ..
```

3. **環境変数の設定**

U-REIの`.env`ファイルを作成:
```bash
cd u-rei
cp .env.example .env
# .envを編集してGoogle OAuth認証情報を設定
```

4. **ビルド**
```bash
# メインサイト
npm run build

# U-REI SNS
cd u-rei
bun run build
cd ..
```

5. **開発サーバー起動**
```bash
node server.js
```

アクセス:
- メインサイト: http://localhost:3000/
- U-REI SNS: http://localhost:3000/u-rei/

## デプロイメント

本番環境へのデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 本番環境デプロイガイド
- [u-rei/README.md](./u-rei/README.md) - U-REI SNS詳細ドキュメント
- [u-rei/SETUP.md](./u-rei/SETUP.md) - U-REI初期セットアップガイド

## 主要コマンド

### メインサイト
```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run preview  # ビルドプレビュー
```

### U-REI SNS
```bash
cd u-rei
bun run dev      # 開発サーバー起動
bun run build    # プロダクションビルド
```

### 統合サーバー
```bash
node server.js   # 両アプリを統合して起動
```

## トラブルシューティング

### ビルドエラー
- `better-sqlite3`のエラー: `npm rebuild better-sqlite3`を実行
- SELinuxエラー: バイナリを`/usr/local/bin/`に配置

### データベースエラー
- ディレクトリが存在しない: `mkdir -p u-rei/data`を実行
- 権限エラー: `chmod 755 u-rei/data`を実行

### OAuth認証エラー
- `.env`ファイルの設定を確認
- Google Cloud ConsoleでリダイレクトURIを確認
- systemdサービスファイルの環境変数を確認

## ライセンス

プライベートプロジェクト

## 作者

yupika
