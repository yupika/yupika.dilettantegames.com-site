<script>
	import { base } from '$app/paths';

	let { children, data } = $props();
	const session = $derived(data.session);
</script>

<div class="app">
	<header>
		<nav>
			<a href="{base}/">U-REI</a>
			<div class="nav-links">
				<a href="{base}/">タイムライン</a>
				<a href="{base}/search">検索</a>
				{#if session}
					<span class="user-info">{session.user?.name}</span>
					<a href="{base}/login">アカウント</a>
				{:else}
					<a href="{base}/login">ログイン</a>
				{/if}
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>U-REI - みんなで育てる共有の知識空間</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem 2rem;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	nav a {
		text-decoration: none;
		color: #1f2937;
		font-weight: 500;
	}

	nav a:first-child {
		font-size: 1.5rem;
		font-weight: bold;
		color: #3b82f6;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.user-info {
		color: #6b7280;
		font-size: 0.875rem;
	}

	main {
		flex: 1;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem;
	}

	footer {
		border-top: 1px solid #e5e7eb;
		padding: 1.5rem 2rem;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		line-height: 1.5;
		color: #1f2937;
	}
</style>
