/**
 * Gx3Carousel.tsx
 * -------------------------------------------------------------
 * Horizontal photo strip with liquid auto-scroll:
 *   • Constant drift via transform (always runs once layout is known)
 *   • Wheel / page scroll adds velocity; spring returns to base speed
 *   • Click opens lightbox and pauses drift until dismissed
 * -------------------------------------------------------------
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { GX3_PHOTOS } from '../../data/studyTests';
import { prefersReducedMotion } from './SmoothScroll.client';

const BASE_SPEED = 40;
const MAX_SPEED = 320;
const WHEEL_GAIN = 1.05;
const PAGE_SCROLL_GAIN = 0.55;
/** How quickly excess speed bleeds back toward base (liquid feel). */
const SPRING = 0.038;

export default function Gx3Carousel() {
	const sectionRef = useRef<HTMLElement>(null);
	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const offsetRef = useRef(0);
	const velocityRef = useRef(BASE_SPEED);
	const setWidthRef = useRef(0);
	const rafRef = useRef(0);
	const lastTimeRef = useRef(0);
	const expandedRef = useRef(false);

	const [expandedSrc, setExpandedSrc] = useState<string | null>(null);

	const closeLightbox = useCallback(() => {
		expandedRef.current = false;
		setExpandedSrc(null);
	}, []);

	const openLightbox = useCallback((src: string) => {
		expandedRef.current = true;
		setExpandedSrc(src);
	}, []);

	useEffect(() => {
		if (!expandedSrc) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [expandedSrc, closeLightbox]);

	useEffect(() => {
		const section = sectionRef.current;
		const viewport = viewportRef.current;
		const track = trackRef.current;
		if (!section || !viewport || !track) return;

		const reduced = prefersReducedMotion();

		const measure = () => {
			const items = track.querySelectorAll('.gx3__item');
			const half = items.length / 2;
			if (half < 1) return false;
			const gap = parseFloat(getComputedStyle(track).gap) || 0;
			let w = 0;
			for (let i = 0; i < half; i++) {
				const el = items[i] as HTMLElement;
				const itemW = el.getBoundingClientRect().width || el.offsetWidth;
				w += itemW;
				if (i < half - 1) w += gap;
			}
			if (w > 0) {
				setWidthRef.current = w;
				return true;
			}
			return false;
		};

		const normalizeOffset = () => {
			const setW = setWidthRef.current;
			if (setW <= 0) return;
			while (offsetRef.current >= setW) offsetRef.current -= setW;
			while (offsetRef.current < 0) offsetRef.current += setW;
		};

		const applyTransform = () => {
			track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
		};

		const isInView = () => {
			const rect = section.getBoundingClientRect();
			return rect.top < window.innerHeight && rect.bottom > 0;
		};

		const boostVelocity = (delta: number) => {
			if (expandedRef.current || delta === 0) return;
			velocityRef.current = Math.min(MAX_SPEED, velocityRef.current + delta);
			if (velocityRef.current < BASE_SPEED) velocityRef.current = BASE_SPEED;
		};

		const onViewportWheel = (e: WheelEvent) => {
			if (expandedRef.current) return;
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (delta === 0) return;
			e.preventDefault();
			e.stopPropagation();
			boostVelocity(delta * WHEEL_GAIN);
		};

		/** Page scroll near the carousel also nudges drift speed (liquid feel). */
		const onPageWheel = (e: WheelEvent) => {
			if (expandedRef.current || !isInView()) return;
			if (viewport.contains(e.target as Node)) return;
			boostVelocity(e.deltaY * PAGE_SCROLL_GAIN);
		};

		const tick = (time: number) => {
			if (!lastTimeRef.current) lastTimeRef.current = time;
			const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
			lastTimeRef.current = time;

			if (!reduced && !expandedRef.current) {
				if (setWidthRef.current <= 0) measure();
				if (setWidthRef.current > 0) {
					velocityRef.current += (BASE_SPEED - velocityRef.current) * SPRING;
					offsetRef.current += velocityRef.current * dt;
					normalizeOffset();
					applyTransform();
				}
			}

			rafRef.current = requestAnimationFrame(tick);
		};

		// Measure immediately — item widths come from CSS, no need to wait for images.
		measure();
		requestAnimationFrame(() => {
			measure();
			applyTransform();
		});

		const ro = new ResizeObserver(() => {
			measure();
			applyTransform();
		});
		ro.observe(track);

		const imgs = Array.from(track.querySelectorAll('img'));
		imgs.forEach((img) => {
			if (!img.complete) {
				img.addEventListener('load', () => measure(), { once: true });
				img.addEventListener('error', () => measure(), { once: true });
			}
		});

		viewport.addEventListener('wheel', onViewportWheel, { passive: false });
		window.addEventListener('wheel', onPageWheel, { passive: true });
		window.addEventListener('resize', () => {
			measure();
			applyTransform();
		});
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafRef.current);
			ro.disconnect();
			viewport.removeEventListener('wheel', onViewportWheel);
			window.removeEventListener('wheel', onPageWheel);
		};
	}, []);

	const photos = [...GX3_PHOTOS, ...GX3_PHOTOS];

	return (
		<section ref={sectionRef} className="gx3" aria-labelledby="gx3-title">
			<div className="gx3__head">
				<h2 id="gx3-title">Research at GX3</h2>
				<p className="gx3__hint">Scroll · click to enlarge</p>
			</div>
			<div ref={viewportRef} className="gx3__viewport">
				<div ref={trackRef} className="gx3__track">
					{photos.map((src, i) => (
						<figure
							className="gx3__item"
							key={`${src}-${i}`}
							role="button"
							tabIndex={0}
							aria-label="Enlarge photo"
							onClick={() => openLightbox(src)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									openLightbox(src);
								}
							}}
						>
							<img
								src={src}
								alt="Research at Genesis X3"
								loading="eager"
								decoding="async"
							/>
						</figure>
					))}
				</div>
			</div>

			{expandedSrc && (
				<div
					className="gx3-lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="Enlarged photo"
					onClick={closeLightbox}
				>
					<img className="gx3-lightbox__img" src={expandedSrc} alt="Research at Genesis X3" />
				</div>
			)}
		</section>
	);
}
