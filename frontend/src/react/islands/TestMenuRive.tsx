/**
 * TestMenuRive.tsx
 * Interactive tests menu driven by test_menu.riv.
 * Listens for ViewModel1 triggers and navigates to each test route.
 */
import { useCallback } from 'react';
import {
	useRive,
	useViewModel,
	useViewModelInstance,
	useViewModelInstanceTrigger,
} from '@rive-app/react-webgl2';

const RIVE_SRC = '/test_menu.riv';
const STATE_MACHINE = 'State Machine 1';
const VIEW_MODEL = 'ViewModel1';

const TEST_ROUTES = {
	controller_pressed: '/tests/HeneveldControlllerParadigm/',
	task_switching_pressed: '/tests/TaskSwitching/',
	posner_pressed: '/tests/Posner/',
	rt_pressed: '/tests/SimpleReactionOnly/',
	go_nogo_pressed: '/tests/GoNoGo/',
} as const;

type TriggerKey = keyof typeof TEST_ROUTES;

function useTestNavigation(trigger: TriggerKey) {
	const go = useCallback(() => {
		window.location.assign(TEST_ROUTES[trigger]);
	}, [trigger]);

	return go;
}

export default function TestMenuRive() {
	const { rive, RiveComponent, setContainerRef } = useRive({
		src: RIVE_SRC,
		stateMachines: STATE_MACHINE,
		autoplay: true,
		shouldResizeCanvasToContainer: true,
	});

	const viewModel = useViewModel(rive, { name: VIEW_MODEL });
	const viewModelInstance = useViewModelInstance(viewModel, {
		useDefault: true,
		rive,
	});

	const goController = useTestNavigation('controller_pressed');
	const goTaskSwitching = useTestNavigation('task_switching_pressed');
	const goPosner = useTestNavigation('posner_pressed');
	const goRt = useTestNavigation('rt_pressed');
	const goGoNoGo = useTestNavigation('go_nogo_pressed');

	useViewModelInstanceTrigger('controller_pressed', viewModelInstance, {
		onTrigger: goController,
	});
	useViewModelInstanceTrigger('task_switching_pressed', viewModelInstance, {
		onTrigger: goTaskSwitching,
	});
	useViewModelInstanceTrigger('posner_pressed', viewModelInstance, {
		onTrigger: goPosner,
	});
	useViewModelInstanceTrigger('rt_pressed', viewModelInstance, {
		onTrigger: goRt,
	});
	useViewModelInstanceTrigger('go_nogo_pressed', viewModelInstance, {
		onTrigger: goGoNoGo,
	});

	return (
		<div ref={setContainerRef} className="tests-menu__stage" aria-label="Cognitive tests menu">
			<RiveComponent className="tests-menu__canvas" />
		</div>
	);
}
