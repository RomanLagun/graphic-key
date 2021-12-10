export class PointModel {
	x: number;
	y: number;
	r: number;
	lineColor: string;
	errorColor: string;
	bgColor: string;
	lineSize: number;
	active: boolean;
	error: boolean;

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
