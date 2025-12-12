import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// ストレージインターフェース
export interface Storage {
	save(file: Buffer, path: string): Promise<string>;
	delete(path: string): Promise<void>;
	getUrl(path: string): string;
}

// ローカルストレージ実装
class LocalStorage implements Storage {
	private uploadPath: string;

	constructor(basePath: string) {
		this.uploadPath = basePath;
	}

	async save(file: Buffer, path: string): Promise<string> {
		const fullPath = join(this.uploadPath, path);
		const dirPath = dirname(fullPath);

		// ディレクトリが存在しない場合は作成
		if (!existsSync(dirPath)) {
			await mkdir(dirPath, { recursive: true });
		}

		await writeFile(fullPath, file);
		return path;
	}

	async delete(path: string): Promise<void> {
		const fullPath = join(this.uploadPath, path);
		if (existsSync(fullPath)) {
			await unlink(fullPath);
		}
	}

	getUrl(path: string): string {
		// ローカルの場合は相対パス
		return `/u-rei/uploads/${path}`;
	}
}

// S3ストレージ実装（将来用のスケルトン）
class S3Storage implements Storage {
	private bucket: string;
	private region: string;
	private cdnUrl?: string;

	constructor(config: { bucket: string; region: string; cdnUrl?: string }) {
		this.bucket = config.bucket;
		this.region = config.region;
		this.cdnUrl = config.cdnUrl;
	}

	async save(file: Buffer, path: string): Promise<string> {
		// TODO: S3へのアップロード実装
		// const s3 = new S3Client({ region: this.region });
		// await s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: path, Body: file }));
		throw new Error('S3 storage not implemented yet');
	}

	async delete(path: string): Promise<void> {
		// TODO: S3からの削除実装
		throw new Error('S3 storage not implemented yet');
	}

	getUrl(path: string): string {
		// CDN URLがあればそれを使用、なければS3 URL
		if (this.cdnUrl) {
			return `${this.cdnUrl}/${path}`;
		}
		return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
	}
}

// ストレージファクトリー（環境変数で切り替え）
export function createStorage(): Storage {
	const storageType = process.env.STORAGE_TYPE || 'local';

	if (storageType === 's3') {
		return new S3Storage({
			bucket: process.env.S3_BUCKET || '',
			region: process.env.S3_REGION || 'us-east-1',
			cdnUrl: process.env.CDN_URL
		});
	}

	// デフォルトはローカルストレージ
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const projectRoot = join(__dirname, '../../..');
	const uploadPath = process.env.UPLOAD_PATH || join(projectRoot, 'data/uploads');

	return new LocalStorage(uploadPath);
}

export const storage = createStorage();
