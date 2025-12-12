import sharp from 'sharp';
import { storage } from './storage';

export interface ImageUploadResult {
	original: string;
	resized: string;
	thumbnail: string;
	originalUrl: string;
	resizedUrl: string;
	thumbnailUrl: string;
}

const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'); // 10MB
const RESIZED_MAX_WIDTH = 1920;
const RESIZED_MAX_HEIGHT = 1920;
const THUMBNAIL_SIZE = 300;

export async function processAndUploadImage(
	file: File,
	userId: string
): Promise<ImageUploadResult> {
	// ファイルサイズチェック
	if (file.size > MAX_SIZE) {
		throw new Error(`ファイルサイズが大きすぎます。${MAX_SIZE / 1024 / 1024}MB以下にしてください`);
	}

	// ファイル形式チェック
	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	if (!allowedTypes.includes(file.type)) {
		throw new Error('対応していない画像形式です（JPEG, PNG, GIF, WebPのみ）');
	}

	// ファイルをBufferに変換
	const buffer = Buffer.from(await file.arrayBuffer());

	// ユニークなファイル名生成
	const timestamp = Date.now();
	const randomId = crypto.randomUUID().split('-')[0];
	const baseName = `${userId}_${timestamp}_${randomId}`;

	// 画像処理
	const sharpInstance = sharp(buffer);
	const metadata = await sharpInstance.metadata();

	// オリジナル保存（メタデータ削除、フォーマット最適化）
	const originalBuffer = await sharp(buffer)
		.rotate() // EXIF orientationに基づいて自動回転
		.withMetadata(false) // メタデータ削除（プライバシー保護）
		.webp({ quality: 95 })
		.toBuffer();

	const originalPath = `original/${baseName}.webp`;
	await storage.save(originalBuffer, originalPath);

	// リサイズ版作成（長辺1920px）
	const resizedBuffer = await sharp(buffer)
		.rotate()
		.resize(RESIZED_MAX_WIDTH, RESIZED_MAX_HEIGHT, {
			fit: 'inside',
			withoutEnlargement: true // 元より大きくしない
		})
		.webp({ quality: 85 })
		.toBuffer();

	const resizedPath = `resized/${baseName}.webp`;
	await storage.save(resizedBuffer, resizedPath);

	// サムネイル作成（300x300、中央クロップ）
	const thumbnailBuffer = await sharp(buffer)
		.rotate()
		.resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
			fit: 'cover',
			position: 'center'
		})
		.webp({ quality: 80 })
		.toBuffer();

	const thumbnailPath = `thumbnails/${baseName}.webp`;
	await storage.save(thumbnailBuffer, thumbnailPath);

	return {
		original: originalPath,
		resized: resizedPath,
		thumbnail: thumbnailPath,
		originalUrl: storage.getUrl(originalPath),
		resizedUrl: storage.getUrl(resizedPath),
		thumbnailUrl: storage.getUrl(thumbnailPath)
	};
}

export async function deleteImage(paths: {
	original: string;
	resized: string;
	thumbnail: string;
}): Promise<void> {
	await Promise.all([
		storage.delete(paths.original),
		storage.delete(paths.resized),
		storage.delete(paths.thumbnail)
	]);
}
