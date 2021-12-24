export class LineModel {
	beginX: number;
	beginY: number;
	endX: number;
	endY: number;

	lineColor: string; // цвет линий
	lineSize: number; // толщина линий

	constructor(obj?: any) {
		this.beginX = obj?.beginX;
		this.beginY = obj?.beginY;
		this.endX = obj?.endX;
		this.endY = obj?.endY;
		this.lineColor = obj?.lineColor;
		this.lineSize = obj?.lineSize;
	}
}
