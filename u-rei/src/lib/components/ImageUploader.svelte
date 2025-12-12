<script>
	import { base } from '$app/paths';

	let { onUpload, multiple = false } = $props();

	let uploading = $state(false);
	let error = $state('');
	let uploadedImages = $state([]);

	async function handleFileSelect(e) {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		error = '';
		uploading = true;

		try {
			const uploads = [];

			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch(`${base}/api/upload`, {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					const result = await response.json();
					throw new Error(result.error || 'アップロードに失敗しました');
				}

				const result = await response.json();
				uploads.push(result);
			}

			uploadedImages = [...uploadedImages, ...uploads];
			if (onUpload) {
				onUpload(multiple ? uploadedImages : uploadedImages[0]);
			}
		} catch (err) {
			error = err.message;
			console.error('Upload error:', err);
		} finally {
			uploading = false;
		}
	}

	function removeImage(index) {
		uploadedImages = uploadedImages.filter((_, i) => i !== index);
		if (onUpload) {
			onUpload(multiple ? uploadedImages : null);
		}
	}
</script>

<div class="image-uploader">
	<input
		type="file"
		accept="image/jpeg,image/png,image/gif,image/webp"
		{multiple}
		onchange={handleFileSelect}
		disabled={uploading}
		id="file-input"
		class="file-input"
	/>

	<label for="file-input" class="upload-button" class:disabled={uploading}>
		{#if uploading}
			⏳ アップロード中...
		{:else}
			📷 画像を選択
		{/if}
	</label>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	{#if uploadedImages.length > 0}
		<div class="preview-grid">
			{#each uploadedImages as image, index}
				<div class="preview-item">
					<img src={image.thumbnailUrl} alt="アップロード画像" />
					<button type="button" onclick={() => removeImage(index)} class="remove-btn">
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.image-uploader {
		margin: 1rem 0;
	}

	.file-input {
		display: none;
	}

	.upload-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #3b82f6;
		color: white;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.upload-button:hover {
		background: #2563eb;
	}

	.upload-button.disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.error {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.preview-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.preview-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2rem;
		height: 2rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		line-height: 1;
	}

	.remove-btn:hover {
		background: rgba(0, 0, 0, 0.9);
	}
</style>
