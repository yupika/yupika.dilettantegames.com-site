<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>U-REI - タイムライン</title>
	<meta name="description" content="みんなで育てる共有の知識空間" />
</svelte:head>

<div class="timeline">
	<div class="timeline-header">
		<h1>タイムライン</h1>
		<div class="actions">
			<a href="{base}/post/new" class="btn btn-primary">つぶやく</a>
			<a href="{base}/diary/new" class="btn btn-secondary">日記を書く</a>
		</div>
	</div>

	<div class="filters">
		<button class="filter-btn active">すべて</button>
		<button class="filter-btn">つぶやき</button>
		<button class="filter-btn">日記</button>
	</div>

	<div class="posts">
		{#if data.posts && data.posts.length > 0}
			{#each data.posts as post}
				<article class="post-card">
					<div class="post-header">
						<div class="user-info">
							{#if post.user_icon}
								<img src={post.user_icon} alt={post.user_name} class="avatar" />
							{:else}
								<div class="avatar-placeholder">{post.user_name?.charAt(0) || '?'}</div>
							{/if}
							<div class="user-details">
								<span class="user-name">{post.user_name}</span>
								<span class="post-time">{new Date(post.created_at).toLocaleString('ja-JP')}</span>
							</div>
						</div>
						<span class="post-type" class:tweet={post.type === 'tweet'} class:diary={post.type === 'diary'}>
							{post.type === 'tweet' ? 'つぶやき' : '日記'}
						</span>
					</div>

					{#if post.title}
						<h3 class="post-title">{post.title}</h3>
					{/if}

					<div class="post-content">
						{post.content}
					</div>

					<div class="post-footer">
						<span class="visibility">{post.visibility === 'public' ? '🌐 全体公開' : post.visibility === 'internal' ? '👥 メンバーのみ' : '🔒 自分のみ'}</span>
						<a href="{base}/post/{post.id}" class="view-link">詳細を見る →</a>
					</div>
				</article>
			{/each}
		{:else}
			<p class="empty-state">まだ投稿がありません。最初の投稿をしてみましょう！</p>
		{/if}
	</div>
</div>

<style>
	.timeline {
		max-width: 800px;
		margin: 0 auto;
	}

	.timeline-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: bold;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
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

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-secondary {
		background-color: #10b981;
		color: white;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.filter-btn {
		padding: 0.5rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		color: #6b7280;
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		background-color: #f3f4f6;
	}

	.filter-btn.active {
		color: #3b82f6;
		font-weight: 600;
		background-color: #eff6ff;
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.user-info {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #3b82f6;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name {
		font-weight: 600;
		color: #1f2937;
	}

	.post-time {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.post-type {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.post-type.tweet {
		background: #dbeafe;
		color: #1e40af;
	}

	.post-type.diary {
		background: #d1fae5;
		color: #065f46;
	}

	.post-title {
		margin: 0 0 0.75rem 0;
		font-size: 1.25rem;
		color: #1f2937;
	}

	.post-content {
		color: #374151;
		line-height: 1.6;
		white-space: pre-wrap;
		margin-bottom: 1rem;
	}

	.post-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.visibility {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.view-link {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.view-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #9ca3af;
	}
</style>
