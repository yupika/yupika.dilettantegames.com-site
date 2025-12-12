<script>
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	let { data } = $props();
	const session = $derived(data.session);
</script>

<svelte:head>
	<title>ログイン - U-REI</title>
</svelte:head>

<div class="login-container">
	{#if session}
		<div class="logged-in">
			<h1>ログイン済み</h1>
			<p>ようこそ、{session.user?.name}さん</p>
			<p>ステータス: {session.user?.status === 'active' ? 'アクティブ' : session.user?.status === 'pending' ? '承認待ち' : 'バンされています'}</p>
			<div class="actions">
				<a href="/u-rei/" class="btn btn-primary">タイムラインへ</a>
				<form method="post" action="?/signout">
					<button type="submit" class="btn btn-secondary">ログアウト</button>
				</form>
			</div>
		</div>
	{:else}
		<div class="login-card">
			<h1>U-REIへようこそ</h1>
			<p class="subtitle">みんなで育てる共有の知識空間</p>

			<button
				onclick={() => signIn('google', { callbackUrl: '/u-rei/' })}
				class="google-btn"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
					<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
					<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
					<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
					<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
					<path fill="none" d="M0 0h48v48H0z"/>
				</svg>
				Googleでログイン
			</button>

			<div class="info">
				<p>初回ログイン時にアカウントが作成されます。</p>
				<p class="note">※承認制の場合、管理者の承認が必要です</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.login-card {
		background: white;
		border-radius: 1rem;
		padding: 3rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 400px;
		width: 100%;
		text-align: center;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		color: #1f2937;
	}

	.subtitle {
		margin: 0 0 2rem 0;
		color: #6b7280;
		font-size: 1rem;
	}

	.google-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1.5rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.google-btn:hover {
		background: #f9fafb;
		border-color: #9ca3af;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.info {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.info p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.note {
		font-size: 0.75rem !important;
		color: #9ca3af !important;
	}

	.logged-in {
		background: white;
		border-radius: 1rem;
		padding: 3rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 100%;
		text-align: center;
	}

	.logged-in h1 {
		color: #10b981;
	}

	.logged-in p {
		margin: 1rem 0;
		color: #6b7280;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		justify-content: center;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 500;
		cursor: pointer;
		border: none;
		font-size: 1rem;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}
</style>
