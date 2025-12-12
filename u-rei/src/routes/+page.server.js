import { db } from '$lib/server/db';

export async function load({ locals }) {
	const session = await locals.auth();

	try {
		// ログインしていない場合はpublic投稿のみ表示
		let query = `
			SELECT posts.*, users.name as user_name, users.icon as user_icon
			FROM posts
			JOIN users ON posts.user_id = users.id
			WHERE posts.deleted_at IS NULL
		`;

		if (!session || !session.user) {
			query += ' AND posts.visibility = "public"';
		} else {
			// ログインしている場合は、public + internal + 自分のprivateを表示
			const user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(session.user.sub);
			if (user) {
				query += ` AND (posts.visibility IN ("public", "internal") OR (posts.visibility = "private" AND posts.user_id = "${user.id}"))`;
			} else {
				query += ' AND posts.visibility = "public"';
			}
		}

		query += ' ORDER BY posts.created_at DESC LIMIT 50';

		const posts = db.prepare(query).all();

		return {
			posts
		};
	} catch (error) {
		console.error('Timeline load error:', error);
		return {
			posts: []
		};
	}
}
