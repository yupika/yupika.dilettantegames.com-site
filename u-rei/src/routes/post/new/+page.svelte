<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let { data } = $props();
	const session = $derived(data.session);

	let content = $state('');
	let visibility = $state('internal');
	let isSubmitting = $state(false);
	let error = $state('');

	async function handleSubmit(e) {
		e.preventDefault();

		if (!session) {
			error = 'ログインが必要です';
			return;
		}

		if (session.user.status !== 'active') {
			error = 'アカウントが承認されていません';
			return;
		}

		if (!content.trim()) {
			error = '内容を入力してください';
			return;
		}

		if (content.length > 250) {
			error = 'つぶやきは250文字以内にしてください';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const response = await fetch(`${base}/api/posts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: 'tweet',
					content,
					visibility
				})
			});

			if (response.ok) {
				const result = await response.json();
				goto(`${base}/post/${result.id}`);
			} else {
				const result = await response.json();
				error = result.error || '投稿に失敗しました';
			}
		} catch (err) {
			error = 'エラーが発生しました';
			console.error(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>つぶやく - U-REI</title>
</svelte:head>

<div class="container">
	{#if !session}
		<div class="error-card">
			<h2>ログインが必要です</h2>
			<p>つぶやくにはログインしてください</p>
			<a href="{base}/login" class="btn btn-primary">ログイン</a>
		</div>
	{:else if session.user.status !== 'active'}
		<div class="error-card">
			<h2>アカウント承認待ち</h2>
			<p>管理者の承認をお待ちください</p>
		</div>
	{:else}
		<div class="post-form">
			<h1>つぶやく</h1>

			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<textarea
						bind:value={content}
						placeholder="今何してる？"
						maxlength="250"
						rows="6"
						class="content-input"
					></textarea>
					<div class="char-count" class:warning={content.length > 200}>
						{content.length} / 250
					</div>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<div class="form-group">
					<label>公開範囲</label>
					<div class="visibility-options">
						<label>
							<input type="radio" bind:group={visibility} value="private" />
							<span>自分のみ</span>
						</label>
						<label>
							<input type="radio" bind:group={visibility} value="internal" />
							<span>メンバーのみ</span>
						</label>
						<label>
							<input type="radio" bind:group={visibility} value="public" />
							<span>全体公開</span>
						</label>
					</div>
				</div>

				<div class="actions">
					<a href="{base}/" class="btn btn-secondary">キャンセル</a>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={isSubmitting || !content.trim()}
					>
						{isSubmitting ? '投稿中...' : 'つぶやく'}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.post-form {
		background: white;
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0 0 1.5rem 0;
		font-size: 1.75rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #374151;
	}

	.content-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
	}

	.content-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.char-count {
		text-align: right;
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.5rem;
	}

	.char-count.warning {
		color: #ef4444;
	}

	.visibility-options {
		display: flex;
		gap: 1rem;
	}

	.visibility-options label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: normal;
	}

	.error {
		padding: 0.75rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}

	.error-card {
		background: white;
		border-radius: 0.5rem;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.error-card h2 {
		margin: 0 0 1rem 0;
		color: #ef4444;
	}

	.error-card p {
		margin: 0 0 1.5rem 0;
		color: #6b7280;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		text-decoration: none;
		display: inline-block;
		font-size: 1rem;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}
</style>
