/**
 * LandingTestStage.tsx
 * Scroll-driven test storytelling aligned to each text panel's center.
 *
 * Per test i:
 *   • Approaching center → scrub IN(i) on canvas
 *   • At center       → loop video / static hold
 *   • Leaving toward next → scrub OUT(i) then IN(i+1)
 */
import { useEffect, useRef, useState } from 'react';
import { STUDY_TESTS } from '../../data/studyTests';
import {
	initSmoothScroll,
	ScrollTrigger,
	prefersReducedMotion,
} from './SmoothScroll.client';
import { preloadFrames, drawFrame } from './frameLoader';

const FRAME_COUNT = 31;
/** Snap when within this many transition frames of a hold point. */
const SNAP_FRAME_THRESHOLD = 10;

function clamp01(v: number) {
	return Math.max(0, Math.min(1, v));
}

/** Scroll Y where the panel's vertical center meets the viewport center. */
function panelHoldScrollY(panel: HTMLElement): number {
	const rect = panel.getBoundingClientRect();
	const scrollY = window.scrollY || document.documentElement.scrollTop;
	const panelCenter = scrollY + rect.top + rect.height / 2;
	return panelCenter - window.innerHeight / 2;
}

export default function LandingTestStage() {
	const sectionRef = useRef<HTMLElement>(null);
	const panelRefs = useRef<(HTMLElement | null)[]>([]);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const posterRef = useRef<HTMLImageElement>(null);

	const [activeIndex, setActiveIndex] = useState(-1);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const section = sectionRef.current;
		const canvas = canvasRef.current;
		const video = videoRef.current;
		const poster = posterRef.current;
		if (!section || !canvas || !video || !poster) return;

		initSmoothScroll();

		const reduced = prefersReducedMotion();
		const tests = STUDY_TESTS;
		const N = tests.length;

		const allFrameUrls: string[] = [];
		const perTestFrames: (HTMLImageElement[] | null)[] = tests.map((t) => {
			if (t.assets.inFrames && t.assets.outFrames) {
				allFrameUrls.push(...t.assets.outFrames, ...t.assets.inFrames);
				return null;
			}
			return null;
		});

		let cleanup = () => {};
		let holdScrollYs: number[] = [];

		const recomputeHolds = () => {
			holdScrollYs = panelRefs.current
				.filter((p): p is HTMLElement => !!p)
				.map((panel) => panelHoldScrollY(panel));
		};

		(async () => {
			const decoded = await preloadFrames(allFrameUrls, () => {});
			let cursor = 0;
			tests.forEach((t, i) => {
				if (t.assets.inFrames && t.assets.outFrames) {
					const outN = t.assets.outFrames.length;
					const inN = t.assets.inFrames.length;
					perTestFrames[i] = [
						...decoded.slice(cursor, cursor + outN),
						...decoded.slice(cursor + outN, cursor + outN + inN),
					];
					cursor += outN + inN;
				}
			});
			setReady(true);

			let active = -1;

			const hideAll = () => {
				canvas.style.opacity = '0';
				video.style.opacity = '0';
				poster.style.opacity = '0';
			};

			const showTest = (i: number) => {
				const t = tests[i];
				if (!t) return;
				if (active !== i) {
					active = i;
					setActiveIndex(i);
				}
				canvas.style.opacity = '0';
				if (t.assets.videoWebm || t.assets.videoMp4) {
					poster.style.opacity = '0';
					video.style.opacity = '1';
					const newSrc = t.assets.videoWebm ?? t.assets.videoMp4!;
					const curSrc = video.querySelector('source')?.getAttribute('src');
					if (curSrc !== newSrc) {
						video.querySelectorAll('source').forEach((s) => s.remove());
						if (t.assets.videoWebm) {
							const webm = document.createElement('source');
							webm.src = t.assets.videoWebm;
							webm.type = 'video/webm';
							video.appendChild(webm);
						}
						if (t.assets.videoMp4) {
							const mp4 = document.createElement('source');
							mp4.src = t.assets.videoMp4;
							mp4.type = 'video/mp4';
							video.appendChild(mp4);
						}
						video.load();
					}
					video.play().catch(() => {});
				} else if (t.assets.staticImage) {
					video.style.opacity = '0';
					video.pause?.();
					poster.src = t.assets.staticImage;
					poster.style.opacity = '1';
				}
			};

			const scrub = (i: number, kind: 'out' | 'in', frac: number) => {
				const framesForTest = perTestFrames[i];
				if (!framesForTest) return;
				const t = tests[i];
				const list = kind === 'out' ? t.assets.outFrames! : t.assets.inFrames!;
				const startIdx = kind === 'out' ? 0 : t.assets.outFrames!.length;
				const idx = Math.min(
					list.length - 1,
					Math.max(0, Math.floor(frac * list.length)),
				);
				drawFrame(canvas, framesForTest[startIdx + idx]);
				canvas.style.opacity = '1';
				video.style.opacity = '0';
				poster.style.opacity = '0';
			};

			// Idle until user scrolls into the section — first IN frame as preview.
			hideAll();
			const firstFrames = perTestFrames[0];
			const outLen = tests[0]?.assets.outFrames?.length ?? 0;
			if (firstFrames && outLen > 0) {
				drawFrame(canvas, firstFrames[outLen]);
				canvas.style.opacity = '1';
			}

			const triggers: ScrollTrigger[] = [];

			const updateFromScroll = (scrollY: number) => {
				recomputeHolds();
				if (holdScrollYs.length < N) return;

				const holdBand = window.innerHeight * 0.06;

				for (let i = 0; i < N; i++) {
					if (Math.abs(scrollY - holdScrollYs[i]) <= holdBand) {
						showTest(i);
						return;
					}
				}

				// Before first hold — scrub IN for test 0.
				if (scrollY < holdScrollYs[0] - holdBand) {
					const end = holdScrollYs[0] - holdBand;
					const start = end - window.innerHeight * 0.85;
					const t = clamp01((scrollY - start) / (end - start));
					scrub(0, 'in', t);
					return;
				}

				// Between consecutive holds — OUT then IN.
				for (let i = 0; i < N - 1; i++) {
					const from = holdScrollYs[i] + holdBand;
					const to = holdScrollYs[i + 1] - holdBand;
					if (scrollY >= from && scrollY <= to) {
						const mid = (from + to) / 2;
						if (scrollY < mid) {
							scrub(i, 'out', clamp01((scrollY - from) / (mid - from)));
						} else {
							scrub(i + 1, 'in', clamp01((scrollY - mid) / (to - mid)));
						}
						return;
					}
				}

				// After last hold.
				if (scrollY > holdScrollYs[N - 1] + holdBand) {
					showTest(N - 1);
				}
			};

			const master = ScrollTrigger.create({
				trigger: section,
				start: 'top bottom',
				end: 'bottom top',
				onUpdate: (self) => updateFromScroll(self.scroll()),
			});
			triggers.push(master);

			// Panel-centered active state for text opacity.
			panelRefs.current.forEach((panel, i) => {
				if (!panel) return;
				const t = ScrollTrigger.create({
					trigger: panel,
					start: 'top 55%',
					end: 'bottom 45%',
					onEnter: () => setActiveIndex(i),
					onEnterBack: () => setActiveIndex(i),
				});
				triggers.push(t);
			});

			// Snap to nearest hold when within 10-frame threshold of a transition.
			if (!reduced) {
				const snapTrigger = ScrollTrigger.create({
					start: 0,
					end: 'max',
					snap: {
						snapTo: (scrollY: number) => {
							recomputeHolds();
							if (holdScrollYs.length === 0) return scrollY;

							const sectionTop = holdScrollYs[0] - window.innerHeight;
							const sectionEnd = holdScrollYs[holdScrollYs.length - 1] + window.innerHeight;
							if (scrollY < sectionTop || scrollY > sectionEnd) {
								return scrollY;
							}

							let nearest = scrollY;
							let nearestDist = Infinity;

							for (let i = 0; i < holdScrollYs.length; i++) {
								const hold = holdScrollYs[i];
								const dist = Math.abs(scrollY - hold);
								const next = holdScrollYs[i + 1];
								const prev = holdScrollYs[i - 1];
								const halfGap = next != null
									? (next - hold) / 2
									: prev != null
										? (hold - prev) / 2
										: window.innerHeight * 0.5;
								const threshold = halfGap * (SNAP_FRAME_THRESHOLD / FRAME_COUNT);

								if (dist <= threshold && dist < nearestDist) {
									nearestDist = dist;
									nearest = hold;
								}
							}

							return nearest;
						},
						duration: { min: 0.2, max: 0.5 },
						delay: 0.08,
						ease: 'power2.inOut',
					},
				});
				triggers.push(snapTrigger);
			}

			const onRefresh = () => {
				recomputeHolds();
				updateFromScroll(master.scroll());
			};
			ScrollTrigger.addEventListener('refresh', onRefresh);
			recomputeHolds();
			ScrollTrigger.refresh();
			updateFromScroll(window.scrollY || document.documentElement.scrollTop);

			cleanup = () => {
				ScrollTrigger.removeEventListener('refresh', onRefresh);
				triggers.forEach((t) => t.kill());
			};

			if (reduced) {
				showTest(0);
				setActiveIndex(0);
			}
		})();

		return () => cleanup();
	}, []);

	return (
		<section ref={sectionRef} className="test-stage" aria-label="The study's tests">
			<div className="test-stage__text">
				{STUDY_TESTS.map((t, i) => (
					<article
						key={t.id}
						ref={(el) => {
							panelRefs.current[i] = el;
						}}
						className="test-stage__panel"
						data-active={i === activeIndex ? 'true' : 'false'}
					>
						<span className="test-stage__num">
							{String(i + 1).padStart(2, '0')} / {String(STUDY_TESTS.length).padStart(2, '0')}
						</span>
						<h3 className="test-stage__title">{t.title}</h3>
						<p className="test-stage__measures">{t.measures}</p>
						<p className="test-stage__desc">{t.description}</p>
					</article>
				))}
			</div>

			<div className="test-stage__stage">
				<div className="test-stage__viewport">
					<video
						ref={videoRef}
						className="test-stage__video"
						muted
						loop
						playsInline
						preload="auto"
					/>
					<img ref={posterRef} className="test-stage__poster" alt="" aria-hidden="true" />
					<canvas ref={canvasRef} className="test-stage__canvas" />

					{!ready && (
						<div className="test-stage__loading" aria-hidden="true">
							<div className="loader-bar">
								<div className="loader-bar__fill" style={{ width: '40%' }} />
							</div>
						</div>
					)}
				</div>

				<div className="test-stage__rail" aria-hidden="true">
					{STUDY_TESTS.map((t, i) => (
						<span
							key={t.id}
							className="test-stage__dot"
							data-active={i === activeIndex ? 'true' : 'false'}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
