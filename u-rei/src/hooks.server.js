import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';

export const { handle } = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
	],
	secret: AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account.provider === 'google') {
				// ユーザーがDBに存在するか確認
				const existingUser = db
					.prepare('SELECT * FROM users WHERE google_id = ?')
					.get(profile.sub);

				if (!existingUser) {
					// 新規ユーザーを作成
					const userId = crypto.randomUUID();
					db.prepare(
						`INSERT INTO users (id, google_id, name, icon, status)
						 VALUES (?, ?, ?, ?, 'pending')`
					).run(userId, profile.sub, profile.name, profile.picture);

					console.log('New user registered:', profile.email);
				}
			}
			return true;
		},
		async session({ session, token }) {
			// セッションにユーザー情報を追加
			if (token.sub) {
				const user = db
					.prepare('SELECT * FROM users WHERE google_id = ?')
					.get(token.sub);

				if (user) {
					session.user.id = user.id;
					session.user.role = user.role;
					session.user.status = user.status;
				}
			}
			return session;
		}
	}
});
