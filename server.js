import { handler as homepageHandler } from './build/handler.js';
import { handler as ureiHandler } from './u-rei/build/handler.js';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 例えば今回作ったSvelteKitアプリと関係ない、aws用のヘルスチェックパスを作る
app.get('/health', (_, res) => {
  var param = { value: 'success' };
	res.header('Content-Type', 'application/json; charset=utf-8');
	res.send(param);
});

// U-REI SNS（サブパス /u-rei）
const ureiRouter = express.Router();
// アップロード画像を配信
ureiRouter.use('/uploads', express.static(join(__dirname, 'u-rei/data/uploads')));
// 静的ファイルを配信（CSS, JSなど）
ureiRouter.use(express.static(join(__dirname, 'u-rei/build/client')));
// SvelteKitハンドラー
ureiRouter.use(ureiHandler);
// /u-reiにマウント（Expressが自動的にパスプレフィックスを処理）
app.use('/u-rei', ureiRouter);

// 既存サイト（ルートパス）
app.use(homepageHandler);

app.listen(3000, () => {
	console.log('listening on port 3000');
	console.log('Homepage: http://localhost:3000/');
	console.log('U-REI: http://localhost:3000/u-rei/');
});