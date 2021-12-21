// finger password
import { PointModel } from './point.model';
import {calcL} from "../util/util";

export class Finger {
	private config: any;
	private callback: any;
	private start: boolean;
	private r: any;
	private points: any;
	private path: Array<any>;
	private ctx: any;

	// base config, callback path array at the end of drawing
	constructor (Config: any, callback: any) {
		// default config
		this.config = {
			id: 'canvas', // parent element id
			width: 600, // width
			height: 600, // height
			bgColor: '#eee', // background color
			lineColor: '#0089FF', // line color
			lineSize: 3, // line thickness
			errorColor: '#f56c6c', // error color
			cols: 3, // columns number
			rows: 3, // rows number
		};
		this.callback = callback;

		this.start = false; // is drawing began

		// assign custom config
		Object.assign(this.config, Config);

		// start radius ???
		this.r = this.initRoundR();

		// init points
		this.points = this.initPoints();

		// path
		this.path = [];

		// create canvas element
		this.ctx = this.initCanvas()

		// image background
		this.drawBG()

		// draw points
		this.drawPoint()
	}

	// canvas initialization
	initCanvas () {
		let box = document.getElementById(this.config.id);
		let canvas = document.createElement('canvas');
		canvas.width = this.config.width;
		canvas.height = this.config.height;
		// listeners
		canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
		canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
		window.addEventListener('touchend', this.onTouchEnd.bind(this)); // to listen if user releases mouse/finger out of canvas
		box?.appendChild(canvas);
		return canvas.getContext("2d")
	}

	// init point radius
	initRoundR () {
		let wr = this.config.width / (this.config.cols * 3 - 1);
		let hr = this.config.height / (this.config.rows * 3 - 1);
		return wr > hr ? hr : wr
	}

	// init points centers
	initPoints () {
		let diffX = (this.config.width - (this.config.cols * this.r * 2)) / (this.config.cols - 1) // Расстояние между столбцами
		let diffY = (this.config.height - (this.config.rows * this.r * 2)) / (this.config.rows - 1) // Межстрочный интервал
		let len = this.config.cols * this.config.rows
		let cols = this.config.cols
		let arr = []
		for (let i = 0; i < len; i++) {
			let obj: PointModel = new PointModel();
			obj.x = (i % cols) * (diffX + 2 * this.r) + this.r // Координата x ==> (i% cols) - значение отклонения ==> (diffX + 2 * this.r) - содержание отклонения, соответственно, сколько кругов и сколько интервалов
			obj.y = Math.floor(i / cols) * (diffY + 2 * this.r) + this.r
			obj.r = this.r
			obj.lineColor = this.config.lineColor
			obj.errorColor = this.config.errorColor
			obj.bgColor = this.config.bgColor
			obj.lineSize = this.config.lineSize
			obj.active = false
			obj.error = false
			arr.push(obj)
		}
		return arr
	}

	// background
	drawBG () {
		this.ctx.fillStyle = this.config.bgColor
		this.ctx.fillRect(0, 0, this.config.width, this.config.height);
	}

	// point
	drawPoint () {
		this.points.forEach((e: any) => {
			new Point(this.ctx, e)
		})

	}

	// Result drawing
	// arr [] drawed path   error - error state
	drawResult (arr: any, error: any) {
		this.drawBG();
		this.drawPath(arr, error);
		this.drawPoint();
	}

	// drawing path
	// arr [] drawed path   error - error state
	drawPath (arr: any, error?: any) {
		if (!arr || !arr.length) return
		this.path = arr
		let len = arr.length
		this.ctx.moveTo(this.points[arr[0] - 1].x, this.points[arr[0] - 1].y)
		for (let i = 1; i < len ; i++) {
			this.ctx.lineTo(this.points[arr[i] - 1].x, this.points[arr[i] - 1].y)
		}
		this.ctx.lineWidth = this.config.lineSize
		this.ctx.strokeStyle = error ? this.config.errorColor :this.config.lineColor
		this.ctx.stroke()

		arr.forEach((e: any) => {

			this.points[e - 1].active = true
			if (error) {
				this.points[e - 1].error = true
			}
		})
	}

	// start moving finger
	onTouchStart (e: any) {
		let index = this.points.findIndex((p: any) => calcL(e.offsetX, e.offsetY, p.x, p.y, p.r))
		if (index > -1) {
			this.path = [index + 1]
			this.drawPath(this.path)
			this.drawPoint()
		}
		this.start = true
	}

	// finger movement
	onTouchMove (e: TouchEvent) {
		if (!this.start) {
			return;
		}
		console.log('!!!!!', e.changedTouches[0], this.points)
		let index = this.points.findIndex((p: any) => calcL(e.changedTouches[0].clientX, e.changedTouches[0].clientY, p.x, p.y, p.r))
		console.log('MOVE', e, this.start, index, this.points[index])
		if (index > -1 && !this.points[index].active) {
			this.path.push(index + 1)
		}
		this.ctx.clearRect(0, 0, this.config.width, this.config.height)
		// redrawing
		this.drawBG()
		this.drawLine(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
		this.drawPath(this.path)
		this.drawPoint()
	}

	drawLine (toX: any, toY: any) {
		console.log('PATH', this.path)
		if (!this.path.length) {
			return;
		}
		let index = this.path[this.path.length - 1] - 1
		let x = this.points[index].x
		let y = this.points[index].y
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(toX, toY)
		this.ctx.lineWidth = this.config.lineSize
		this.ctx.strokeStyle = this.config.lineColor
		this.ctx.stroke()
	}

	// finger remove from screen
	onTouchEnd () {
		if (this.start) {
			this.callback(this.path)
		}
		this.path = []
		this.reset()
	}


	// reset settings
	reset () {
		this.points.forEach((e: any) => {
			e.active = false
			e.error = false
		})
		this.start = false
		this.path = []
		this.ctx.clearRect(0, 0, this.config.width, this.config.height)
		this.drawBG()
		this.drawPoint()
	}
}


// 原点类

export class Point {

	private ctx: any;
	private config: any;

	constructor (ctx: any, Config: any) {

		this.ctx = ctx

		// 基础配置
		this.config = {
			x: 0, // Координата центра x
			y: 0, // Координата Y центра
			r: 0, // radius
			lineColor: '#0089FF', // line color
			bgColor: '#eee', // background color
			errorColor: '', // error color
			active: false, // point checked
			error: false, // point in error state
		}

		Object.assign(this.config, Config)
		this.drawPoint()

	}

	drawPoint () {
		let color = this.config.error ? this.config.errorColor : this.config.lineColor;
		this.ctx.beginPath();
		this.ctx.arc(this.config.x, this.config.y, this.config.r - this.config.lineSize, 0, Math.PI * 2)
		this.ctx.fillStyle = this.config.bgColor
		this.ctx.fill()
		this.ctx.lineWidth = this.config.lineSize
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
		if (this.config.active) {
			this.ctx.beginPath();
			this.ctx.arc(this.config.x, this.config.y, this.config.r / 3, 0, Math.PI * 2)
			this.ctx.fillStyle = color;
			this.ctx.fill();
		}
	}

}



