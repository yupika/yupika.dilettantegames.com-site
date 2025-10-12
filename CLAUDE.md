# CLAUDE.md

## プロジェクト概要
個人サイト (yupikaさんのホームページ)

## 技術スタック

### フロントエンド
- **フレームワーク**: SvelteKit v1.20.4
- **言語**: JavaScript (TypeScript型定義あり)
- **スタイリング**:
  - Tailwind CSS v3.3.3
  - DaisyUI v3.7.4
  - PostCSS v8.4.29

### バックエンド
- **ランタイム**: Node.js v18.17.1
- **サーバー**: Express.js v4.18.2
- **アダプター**: @sveltejs/adapter-node
- **ポート**: 3000

### ビルドツール
- Vite v4.4.2

## サーバー情報
- **IPアドレス**: 160.248.2.200
- **ドメイン**: yupika.dilettantegames.net
- **URL**: http://yupika.dilettantegames.net/

## プロジェクト構造
```
/home/alma/homepage/
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
├── server.js (Express サーバー設定)
├── package.json
└── svelte.config.js
```

## 主要な機能
- カウンターコンポーネント
- Sverdle (ゲーム?)
- Nukadoko セクション
- ヘルスチェックエンドポイント (`/health`)

## 開発コマンド
```bash
npm run dev         # 開発サーバー起動
npm run build       # プロダクションビルド
npm run preview     # プロダクションプレビュー
npm run check       # Svelte型チェック
```

## デプロイメント
- `server.js`でExpressサーバーを起動
- ポート3000でリッスン
- AWSでのデプロイを想定 (ヘルスチェックエンドポイントあり)

## メモ
- adapter-nodeを使用してNode.js環境にデプロイ
- ビルド成果物は`build/`ディレクトリに出力
