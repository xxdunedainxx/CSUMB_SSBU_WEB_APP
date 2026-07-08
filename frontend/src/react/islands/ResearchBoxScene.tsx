/**
 * ResearchBoxScene.tsx
 * -------------------------------------------------------------
 * The cinematic hero of the Research page. A sticky canvas plays the
 * 101-frame "cardboard box opens → items fall out" sequence, scrubbed
 * 1:1 by scroll progress (GSAP ScrollTrigger, scrub). A soft radial
 * light bloom intensifies as the box opens; a vignette frames it.
 *
 * Premium feel: fade-in from poster, parallax scale on the frame,
 * and a graceful reduced-motion fallback that just shows frame 1.
 * -------------------------------------------------------------
 */
import { useEffect, useRef, useState } from 'react';
import { HERO_FRAMES } from '../../data/studyTests';
import {
	initSmoothScroll,
	gsap,
	ScrollTrigger,
	prefersReducedMotion,
} from './SmoothScroll.client';
import { preloadFrames, drawFrame } from './frameLoader';

interface Props {
	/** How many viewports of scroll the full box sequence spans. */
	scrollSpan?: number;
}

export default function ResearchBoxScene({ scrollSpan = 3 }: Props) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const stickyRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lightRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		const sticky = stickyRef.current;
		const light = lightRef.current;
		if (!canvas || !wrap || !sticky || !light) return;

		initSmoothScroll();

		let trigger: ScrollTrigger | null = null;
		let cleanup = () => {};

		(async () => {
			// Preload hero frames, drawing frame 0 as soon as it's ready.
			const images = await preloadFrames(HERO_FRAMES, (p) =>
				setProgress(p.loaded / p.total),
			);
			drawFrame(canvas, images[0]);

			// Keep pinned hero beneath overlapping page content.
			sticky.style.zIndex = '1';

			if (prefersReducedMotion()) {
				// Static: just leave frame 0 visible, keep content accessible.
				ScrollTrigger.refresh();
				return;
			}

			// Master timeline pinned to the sticky stage; scrubbed by scroll.
			const state = { frame: 0, bloom: 0 };

			const tl = gsap.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					trigger: wrap,
					start: 'top top',
					end: () => `+=${window.innerHeight * scrollSpan}`,
					scrub: 0.6,
					pin: sticky,
					anticipatePin: 1,
					pinSpacing: true,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						const idx = Math.min(
							images.length - 1,
							Math.floor(self.progress * images.length),
						);
						state.frame = idx;
						drawFrame(canvas, images[idx]);

						// Very subtle depth — no bright glare overlay.
						const bloom = Math.sin(self.progress * Math.PI);
						state.bloom = Math.max(0, Math.min(1, bloom));
						light.style.opacity = String(state.bloom * 0.12);
					},
				},
			});

			// A dummy tween is required so ScrollTrigger has a duration to scrub.
			tl.to(state, { frame: images.length - 1, duration: 1 }, 0);

			trigger = tl.scrollTrigger ?? null;

			// Redraw on resize.
			const onResize = () => drawFrame(canvas, images[state.frame]);
			window.addEventListener('resize', onResize);
			cleanup = () => {
				window.removeEventListener('resize', onResize);
				tl.kill();
			};
		})();

		return () => cleanup();
	}, [scrollSpan]);

	return (
		<section
			ref={wrapRef}
			className="box-scene"
			aria-label="Research study box opening"
		>
			<div ref={stickyRef} className="box-scene__sticky">
				<canvas ref={canvasRef} className="box-scene__canvas" />
				<div ref={lightRef} className="box-scene__bloom" />
				<div className="box-scene__vignette" />

				{progress < 1 && (
					<div className="box-scene__loader" aria-hidden="true">
						<div className="loader-bar">
							<div
								className="loader-bar__fill"
								style={{ width: `${Math.round(progress * 100)}%` }}
							/>
						</div>
					</div>
				)}

				<div className="box-scene__caption">
					<span className="eyebrow">Cal State Monterey Bay · Machek Lab</span>
				</div>
			</div>
		</section>
	);
}
