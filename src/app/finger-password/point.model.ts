export class PointModel {
	x: number; // Координата центра x
	y: number; // Координата Y центра
	r: number; // радиус точки
	lineColor: string; // цвет линий
	errorColor: string; // цвет в состоянии ошибки
	bgColor: string; // цвет фона точки
	lineSize: number; // толщина линий
	active: boolean; // точка в текущем пути
	error: boolean; // точка в ошибочном пути

	constructor(obj?: any) {
		this.x = obj?.x;
		this.y = obj?.y;
		this.r = obj?.r;
		this.lineColor = obj?.lineColor;
		this.errorColor = obj?.errorColor;
		this.bgColor = obj?.bgColor;
		this.lineSize = obj?.lineSize;
		this.active = obj?.active;
		this.error = obj?.error;
	}
}
