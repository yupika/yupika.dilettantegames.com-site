import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.auth();

	if (!session) {
		redirect(303, '/login');
	}

	const user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(session.user.sub);

	if (!user || user.role !== 'admin') {
		redirect(303, '/');
	}

	const users = db.prepare(`
		SELECT id, name, icon, role, status, created_at
		FROM users
		ORDER BY created_at DESC
	`).all();

	return {
		users
	};
}

export const actions = {
	updateStatus: async ({ request, locals }) => {
		const session = await locals.auth();

		if (!session) {
			return fail(401, { error: '認証が必要です' });
		}

		const admin = db.prepare('SELECT * FROM users WHERE google_id = ?').get(session.user.sub);

		if (!admin || admin.role !== 'admin') {
			return fail(403, { error: '管理者権限が必要です' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId');
		const newStatus = formData.get('status');

		if (!userId || !newStatus) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		if (!['pending', 'active', 'banned'].includes(newStatus)) {
			return fail(400, { error: '無効なステータスです' });
		}

		// 自分自身のステータスは変更不可
		if (admin.id === userId) {
			return fail(400, { error: '自分自身のステータスは変更できません' });
		}

		db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, userId);

		return { success: true };
	},

	updateRole: async ({ request, locals }) => {
		const session = await locals.auth();

		if (!session) {
			return fail(401, { error: '認証が必要です' });
		}

		const admin = db.prepare('SELECT * FROM users WHERE google_id = ?').get(session.user.sub);

		if (!admin || admin.role !== 'admin') {
			return fail(403, { error: '管理者権限が必要です' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId');
		const newRole = formData.get('role');

		if (!userId || !newRole) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		if (!['admin', 'member'].includes(newRole)) {
			return fail(400, { error: '無効なロールです' });
		}

		// 自分自身のロールは変更不可
		if (admin.id === userId) {
			return fail(400, { error: '自分自身のロールは変更できません' });
		}

		db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);

		return { success: true };
	}
};
