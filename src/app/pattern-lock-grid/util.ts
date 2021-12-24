import { CoordinatesModel } from './model/coordinates.model';

// Вычислите расстояние между двумя точками, чтобы определить, находится ли точка a в круге b
// ax Координата X точки a
// ay Координата Y точки a
// bx Координата x центра окружности b
// by Координата y центра окружности b
// br Радиус круга b
// return Верно по кругу, иначе ложно
export function calcL (ax: number, ay: number, bx: number, by: number, br: number) {
	return br > Math.sqrt( (ax - bx) * (ax - bx) + (ay - by) * (ay - by) )
}

/**
 * Переводит координаты касания относительно экрана в координаты относительно target
 */
export function getTouchEventTargetCoordinates(event: TouchEvent, targetContainer?: HTMLElement): CoordinatesModel {
	let target: HTMLElement = targetContainer ? targetContainer : (<HTMLElement>event.changedTouches[0].target);
	const elementRect = target.getBoundingClientRect();
	return {
		top: event.changedTouches[0].clientY - elementRect.top,
		left: event.changedTouches[0].clientX - elementRect.left,
	}
}

/**
 * Переводит координаты клика относительно экрана в координаты относительно target
 */
export function getMouseEventTargetCoordinates(event: MouseEvent, targetContainer?: HTMLElement): CoordinatesModel {
	let target: HTMLElement = targetContainer ? targetContainer : (<HTMLElement>event.target);
	const elementRect = target.getBoundingClientRect();
	return {
		top: event.clientY - elementRect.top,
		left: event.clientX - elementRect.left,
	}
}
