/**
 * frameLoader.ts
 * -------------------------------------------------------------
 * Helpers for preloading an ordered sequence of image frames so a
 * scroll-scrubbed canvas can draw any frame instantly (no pop-in).
 *
 * Mirrors the proven Apple AirPods technique: decode every frame
 * into an HTMLImageElement up front, then `ctx.drawImage` by index.
 * -------------------------------------------------------------
 */

export interface FrameProgress {
	loaded: number;
	total: number;
}

/**
 * Preload a list of image URLs. Calls onProgress after each decode.
 * Resolves to the decoded HTMLImageElement[] (same order as input).
 * Already-decoded images skip network (browser cache).
 */
export function preloadFrames(
	urls: string[],
	onProgress?: (p: FrameProgress) => void,
): Promise<HTMLImageElement[]> {
	const total = urls.length;
	let loaded = 0;

	return new Promise((resolve) => {
		const images: HTMLImageElement[] = new Array(total);

		if (total === 0) {
			resolve(images);
			return;
		}

		urls.forEach((url, index) => {
			const img = new Image();
			img.onload = img.onerror = () => {
				images[index] = img;
				loaded++;
				onProgress?.({ loaded, total });
				if (loaded === total) resolve(images);
			};
			img.src = url;
		});
	});
}

/** Draw a frame into a canvas, cover-fitting and accounting for DPR. */
export function drawFrame(
	canvas: HTMLCanvasElement,
	img: HTMLImageElement | undefined,
): void {
	if (!img) return;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const cw = canvas.clientWidth;
	const ch = canvas.clientHeight;
	if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
		canvas.width = cw * dpr;
		canvas.height = ch * dpr;
	}
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cw, ch);

	// Cover-fit the image into the canvas.
	const iw = img.naturalWidth || img.width;
	const ih = img.naturalHeight || img.height;
	if (!iw || !ih) return;

	const scale = Math.max(cw / iw, ch / ih);
	const dw = iw * scale;
	const dh = ih * scale;
	const dx = (cw - dw) / 2;
	const dy = (ch - dh) / 2;
	ctx.drawImage(img, dx, dy, dw, dh);
}
