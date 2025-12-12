import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { processAndUploadImage } from '$lib/server/images';

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
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || !(file instanceof File)) {
			return json({ error: 'ファイルが見つかりません' }, { status: 400 });
		}

		// 画像処理とアップロード
		const result = await processAndUploadImage(file, user.id);

		return json({
			success: true,
			...result
		});
	} catch (error) {
		console.error('Image upload error:', error);
		return json(
			{ error: error.message || '画像のアップロードに失敗しました' },
			{ status: 500 }
		);
	}
}
