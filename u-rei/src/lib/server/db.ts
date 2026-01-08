import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// プロジェクトルートからの絶対パスを生成
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');
const DATABASE_PATH = process.env.DATABASE_PATH || join(projectRoot, 'data/u-rei.db');

// データベースディレクトリが存在しない場合は作成
const dbDir = dirname(DATABASE_PATH);
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

// Bunランタイムでのみbun:sqliteを使用
let Database;
if (typeof Bun !== 'undefined') {
	const bunSqlite = await import('bun:sqlite');
	Database = bunSqlite.Database;
}

export const db = Database ? new Database(DATABASE_PATH, { create: true }) : null;

// データベース初期化
export function initDatabase() {
	// WALモード有効化（パフォーマンス向上）
	db.run('PRAGMA journal_mode = WAL;');
	db.run('PRAGMA foreign_keys = ON;');

	// ユーザーテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			google_id TEXT UNIQUE NOT NULL,
			name TEXT NOT NULL,
			icon TEXT,
			role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
			status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'banned')),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// 投稿テーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS posts (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id),
			type TEXT NOT NULL CHECK (type IN ('tweet', 'diary')),
			title TEXT,
			content TEXT NOT NULL,
			visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'public')),
			view_count INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME
		);
	`);

	// 内部リンクテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS links (
			id TEXT PRIMARY KEY,
			from_type TEXT NOT NULL CHECK (from_type IN ('post', 'page', 'comment')),
			from_id TEXT NOT NULL,
			to_type TEXT CHECK (to_type IN ('post', 'page')),
			to_id TEXT,
			to_title TEXT,
			display_text TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// つぶやき→日記の関連テーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS diary_sources (
			diary_id TEXT NOT NULL REFERENCES posts(id),
			tweet_id TEXT NOT NULL REFERENCES posts(id),
			PRIMARY KEY (diary_id, tweet_id)
		);
	`);

	// コメントテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			post_id TEXT NOT NULL REFERENCES posts(id),
			user_id TEXT NOT NULL REFERENCES users(id),
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME
		);
	`);

	// リアクションテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS reactions (
			id TEXT PRIMARY KEY,
			post_id TEXT NOT NULL REFERENCES posts(id),
			user_id TEXT NOT NULL REFERENCES users(id),
			emoji TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (post_id, user_id, emoji)
		);
	`);

	// カスタム絵文字テーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS custom_emojis (
			id TEXT PRIMARY KEY,
			shortcode TEXT UNIQUE NOT NULL,
			image_path TEXT NOT NULL,
			uploaded_by TEXT NOT NULL REFERENCES users(id),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// 招待リンクテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS invites (
			id TEXT PRIMARY KEY,
			code TEXT UNIQUE NOT NULL,
			created_by TEXT NOT NULL REFERENCES users(id),
			uses_remaining INTEGER,
			expires_at DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// 独立ページテーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS pages (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id),
			slug TEXT NOT NULL,
			parent_id TEXT REFERENCES pages(id),
			title TEXT NOT NULL,
			content JSON NOT NULL,
			visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'public')),
			is_user_top BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME,
			UNIQUE (user_id, slug, parent_id)
		);
	`);

	// サイト設定テーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`);

	// 閲覧記録テーブル
	db.run(`
		CREATE TABLE IF NOT EXISTS post_views (
			post_id TEXT NOT NULL REFERENCES posts(id),
			user_id TEXT,
			ip_hash TEXT,
			viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// 全文検索用FTSテーブル
	db.run(`
		CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
			title, content, tokenize='trigram'
		);
	`);

	// インデックス作成
	createIndexes();

	console.log('Database initialized successfully');
}

function createIndexes() {
	const indexes = [
		'CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)',
		'CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type)',
		'CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility)',
		'CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)',
		'CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_type, from_id)',
		'CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_type, to_id)',
		'CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)',
		'CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id)',
		'CREATE INDEX IF NOT EXISTS idx_pages_user ON pages(user_id)',
		'CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_id)',
		'CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(user_id, slug)'
	];

	for (const index of indexes) {
		db.run(index);
	}
}

// ビルド時ではなくランタイムでのみ初期化
if (typeof Bun !== 'undefined') {
	initDatabase();
}
