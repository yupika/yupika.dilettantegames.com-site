import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST({ request, locals }) {
	const session = await locals.auth();

	if (!session || !session.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// ユーザー情報を取得
	const user = db
		.prepare('SELECT * FROM users WHERE google_id = ?')
		.get(session.user.sub);

	if (!user || user.status !== 'active') {
		return json({ error: 'アカウントが承認されていません' }, { status: 403 });
	}

	try {
		const data = await request.json();
		const { type, title, content, visibility } = data;

		// バリデーション
		if (!type || !content) {
			return json({ error: '必須項目が不足しています' }, { status: 400 });
		}

		if (!['tweet', 'diary'].includes(type)) {
			return json({ error: '無効な投稿タイプです' }, { status: 400 });
		}

		if (!['private', 'internal', 'public'].includes(visibility)) {
			return json({ error: '無効な公開範囲です' }, { status: 400 });
		}

		if (type === 'tweet' && content.length > 250) {
			return json({ error: 'つぶやきは250文字以内にしてください' }, { status: 400 });
		}

		// 投稿を作成
		const postId = crypto.randomUUID();
		const now = new Date().toISOString();

		db.prepare(
			`INSERT INTO posts (id, user_id, type, title, content, visibility, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		).run(postId, user.id, type, title || null, content, visibility, now, now);

		// 作成した投稿を取得
		const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);

		return json({ success: true, ...post }, { status: 201 });
	} catch (error) {
		console.error('Post creation error:', error);
		return json({ error: '投稿の作成に失敗しました' }, { status: 500 });
	}
}

export async function GET({ url }) {
	try {
		const type = url.searchParams.get('type');
		const visibility = url.searchParams.get('visibility');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		let query = `
			SELECT posts.*, users.name as user_name, users.icon as user_icon
			FROM posts
			JOIN users ON posts.user_id = users.id
			WHERE posts.deleted_at IS NULL
		`;
		const params = [];

		if (type) {
			query += ' AND posts.type = ?';
			params.push(type);
		}

		if (visibility) {
			query += ' AND posts.visibility = ?';
			params.push(visibility);
		}

		query += ' ORDER BY posts.created_at DESC LIMIT ? OFFSET ?';
		params.push(limit, offset);

		const posts = db.prepare(query).all(...params);

		return json({ success: true, posts });
	} catch (error) {
		console.error('Posts fetch error:', error);
		return json({ error: '投稿の取得に失敗しました' }, { status: 500 });
	}
}
