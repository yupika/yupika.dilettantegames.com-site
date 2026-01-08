<script>
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';

	let { data } = $props();

	function getStatusBadge(status) {
		switch (status) {
			case 'active': return { text: 'アクティブ', class: 'badge-active' };
			case 'pending': return { text: '承認待ち', class: 'badge-pending' };
			case 'banned': return { text: 'バン', class: 'badge-banned' };
			default: return { text: '不明', class: 'badge-unknown' };
		}
	}

	function getRoleBadge(role) {
		return role === 'admin'
			? { text: '管理者', class: 'badge-admin' }
			: { text: 'メンバー', class: 'badge-member' };
	}

	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleString('ja-JP');
	}
</script>

<svelte:head>
	<title>管理画面 - U-REI</title>
</svelte:head>

<div class="admin-container">
	<div class="admin-header">
		<h1>管理画面</h1>
		<a href="{base}/" class="btn btn-secondary">タイムラインへ戻る</a>
	</div>

	<section class="user-section">
		<h2>ユーザー管理</h2>
		<p class="user-count">登録ユーザー: {data.users.length}人</p>

		<div class="user-list">
			{#each data.users as user}
				<div class="user-card">
					<div class="user-info">
						{#if user.icon}
							<img src={user.icon} alt={user.name} class="avatar" />
						{:else}
							<div class="avatar-placeholder">{user.name?.charAt(0) || '?'}</div>
						{/if}
						<div class="user-details">
							<span class="user-name">{user.name}</span>
							<span class="user-id">ID: {user.id.slice(0, 8)}...</span>
							<span class="user-date">登録: {formatDate(user.created_at)}</span>
						</div>
					</div>

					<div class="user-badges">
						<span class="badge {getRoleBadge(user.role).class}">{getRoleBadge(user.role).text}</span>
						<span class="badge {getStatusBadge(user.status).class}">{getStatusBadge(user.status).text}</span>
					</div>

					<div class="user-actions">
						<form method="post" action="?/updateStatus" use:enhance>
							<input type="hidden" name="userId" value={user.id} />
							<select name="status" onchange="this.form.submit()">
								<option value="pending" selected={user.status === 'pending'}>承認待ち</option>
								<option value="active" selected={user.status === 'active'}>アクティブ</option>
								<option value="banned" selected={user.status === 'banned'}>バン</option>
							</select>
						</form>

						<form method="post" action="?/updateRole" use:enhance>
							<input type="hidden" name="userId" value={user.id} />
							<select name="role" onchange="this.form.submit()">
								<option value="member" selected={user.role === 'member'}>メンバー</option>
								<option value="admin" selected={user.role === 'admin'}>管理者</option>
							</select>
						</form>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.admin-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
	}

	h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.user-count {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		text-decoration: none;
		font-weight: 500;
		cursor: pointer;
		border: none;
		font-size: 0.875rem;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}

	.user-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.user-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 200px;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #3b82f6;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.25rem;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.user-name {
		font-weight: 600;
		color: #1f2937;
	}

	.user-id, .user-date {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.user-badges {
		display: flex;
		gap: 0.5rem;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge-active {
		background: #d1fae5;
		color: #065f46;
	}

	.badge-pending {
		background: #fef3c7;
		color: #92400e;
	}

	.badge-banned {
		background: #fee2e2;
		color: #991b1b;
	}

	.badge-admin {
		background: #dbeafe;
		color: #1e40af;
	}

	.badge-member {
		background: #f3f4f6;
		color: #4b5563;
	}

	.user-actions {
		display: flex;
		gap: 0.5rem;
	}

	.user-actions select {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: white;
		cursor: pointer;
	}

	.user-actions select:hover {
		border-color: #9ca3af;
	}
</style>
