export const actions = {
	async signout({ locals, cookies }) {
		await locals.auth().signOut();
		return { success: true };
	}
};
