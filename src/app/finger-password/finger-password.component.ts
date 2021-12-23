import { AfterViewInit, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { FingerPasswordConfigModel, InputFingerPasswordConfigModel } from './finger-password-config.model';
import { PointModel } from './point.model';
import { CoordinatesModel } from './coordinates.model';
import { calcL, getTouchEventTargetCoordinates } from '../util/util';
import { DOCUMENT } from '@angular/common';
import { DEFAULT_CONFIG_CONST } from './default-config.const';
import { asyncScheduler } from 'rxjs';

@Component({
	selector: 'app-finger-password',
	templateUrl: './finger-password.component.html',
	styleUrls: ['./finger-password.component.css']
})
export class FingerPasswordComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly CANVAS_PARENT_ID: string = 'passwordArea';
	private _config: FingerPasswordConfigModel;

	@Input() correctPath: Array<number>; // path to compare with entered to show error
	@Input() errorShowInterval: number = 500; // time in milliseconds to show error state
	@Input() set config(value: InputFingerPasswordConfigModel) {
		this._config = {
			...this._config,
			...value,
		}
	};

	get config(): FingerPasswordConfigModel {
		return this._config;
	}

	@Output() readonly successPasswordEntered: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();
	@Output() readonly errorPasswordEntered: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();

	//-------------------------------------------------
	private start: boolean;
	private pointRadius: number;
	private points: Array<PointModel>;
	private path: Array<number>;
	private ctx: any;

	private touchStartUnsubscribe: Function;
	private touchMoveUnsubscribe: Function;
	private touchEndUnsubscribe: Function;
	//-------------------------------------------------

	constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {
		this._config = DEFAULT_CONFIG_CONST;
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.initFingerPassword();
	}

	ngOnDestroy(): void {
		this.removeTouchListeners();
	}

	/** region Init canvas properties */

	private initFingerPassword(): void {
		this.start = false; // is drawing began
		this.pointRadius = this.initRoundR();
		this.points = this.initPoints();
		this.path = [];
		this.ctx = this.initCanvas();
		this.drawBG();
		this.drawPoint();
	}

	/**
	 * Reset current state
	 */
	private reset(): void {
		this.points.forEach((e: any) => {
			e.active = false;
			e.error = false;
		});
		this.start = false;
		this.path = [];
		this.ctx.clearRect(0, 0, this.config.width, this.config.height);
		this.drawBG();
		this.drawPoint();
	}

	/**
	 * Init canvas
	 */
	private initCanvas(): CanvasRenderingContext2D | null {
		let box = this.document.getElementById(this.CANVAS_PARENT_ID);
		let canvas = this.document.createElement('canvas');
		canvas.width = this.config.width;
		canvas.height = this.config.height;
		// listeners
		this.touchStartUnsubscribe = this.renderer.listen(canvas, 'touchstart', this.onTouchStart.bind(this));
		this.touchMoveUnsubscribe = this.renderer.listen(canvas, 'touchmove', this.onTouchMove.bind(this));
		this.touchEndUnsubscribe = this.renderer.listen(canvas, 'touchend', this.onTouchEnd.bind(this));

		box?.appendChild(canvas);
		return canvas.getContext("2d");
	}

	/**
	 * Init points radius
	 */
	private initRoundR(): number {
		let wr = this.config.width / (this.config.columns * 3 - 1) / 1.1;
		let hr = this.config.height / (this.config.rows * 3 - 1) / 1.1;
		return wr > hr ? hr : wr
	}

	/**
	 * Init point of grid
	 */
	private initPoints(): Array<PointModel> {
		let diffX = (this.config.width - (this.config.columns * this.pointRadius * 2)) / (this.config.columns - 1); // Расстояние между столбцами
		let diffY = (this.config.height - (this.config.rows * this.pointRadius * 2)) / (this.config.rows - 1); // Межстрочный интервал
		let len = this.config.columns * this.config.rows;
		let cols = this.config.columns;
		let arr = [];
		for (let i = 0; i < len; i++) {
			let obj: PointModel = new PointModel();
			obj.x = (i % cols) * (diffX + 2 * this.pointRadius) + this.pointRadius;
			obj.y = Math.floor(i / cols) * (diffY + 2 * this.pointRadius) + this.pointRadius;
			obj.r = this.pointRadius;
			obj.lineColor = this.config.lineColor;
			obj.errorColor = this.config.errorColor;
			obj.bgColor = this.config.bgColor;
			obj.lineSize = this.config.lineWidth;
			obj.active = false;
			obj.error = false;
			arr.push(obj)
		}
		return arr;
	}

	/** endregion */

	/** region touch events handlers */

	/**
	 * First finger touch handler
	 */
	onTouchStart(e: TouchEvent): void {
		const targetCoords: CoordinatesModel = getTouchEventTargetCoordinates(e);

		let index = this.points.findIndex((p: any) => calcL(targetCoords.left, targetCoords.top, p.x, p.y, p.r));
		if (index > -1) {
			this.path = [index + 1];
			this.drawPath(this.path);
			this.drawPoint();
		}
		this.start = true;
	}

	/**
	 * Finger movement handler
	 */
	onTouchMove(e: TouchEvent): void {
		if (!this.start) {
			return;
		}

		const targetCoords: CoordinatesModel = getTouchEventTargetCoordinates(e);

		let index = this.points.findIndex((p: any) => calcL(targetCoords.left, targetCoords.top, p.x, p.y, p.r));
		if (index > -1 && !this.points[index].active) {
			if (this.path.length > 0) {
				this.checkAndFillSkippedPoints(this.path[this.path.length - 1] - 1, index);
			}
			this.path.push(index + 1);
		}
		this.ctx.clearRect(0, 0, this.config.width, this.config.height);

		// redrawing
		this.drawBG();
		this.drawLine(targetCoords.left, targetCoords.top);
		this.drawPath(this.path);
		this.drawPoint();
	}

	/**
	 * Finger removing from screen handler
	 */
	onTouchEnd(): void {
		if (this.start) {
			if (!this.correctPath || this.checkPath(this.path)) {
				this.successPasswordEntered.emit(this.path);
			} else {
				const errorPath = [...this.path];
				this.errorPasswordEntered.emit(errorPath);
				// async to prevent zero repainting
				asyncScheduler.schedule(() => {
					this.drawResult(errorPath, true);
					setTimeout(() => {
						this.reset();
					}, this.errorShowInterval)
				}, 0)
			}
		}
		this.path = [];
		this.reset();
	}

	/** endregion */

	/** region Draw methods */

	/**
	 * Drawing result of interaction
	 * @param arr - path to draw
	 * @param error - error state
	 */
	private drawResult(arr: Array<number>, error: boolean): void {
		this.drawBG();
		this.drawPath(arr, error);
		this.drawPoint();
	}

	/**
	 * Drawing background
	 */
	private drawBG(): void {
		this.ctx.fillStyle = this.config.bgColor;
		this.ctx.fillRect(0, 0, this.config.width, this.config.height);
	}

	/**
	 * Drawing all points of grid
	 */
	private drawPoint(): void {
		this.points.forEach((point: PointModel) => {
			this.drawSinglePoint(this.ctx, point)
		})
	}

	/**
	 * Drawing path
	 * @param arr - path to draw
	 * @param error - error state
	 */
	private drawPath(arr: Array<number>, error?: boolean): void {
		if (!arr || !arr.length) {
			return;
		}
		this.path = arr;
		let len = arr.length;
		this.ctx.moveTo(this.points[arr[0] - 1].x, this.points[arr[0] - 1].y);
		for (let i = 1; i < len ; i++) {
			this.ctx.lineTo(this.points[arr[i] - 1].x, this.points[arr[i] - 1].y);
		}
		this.ctx.lineWidth = this.config.lineWidth;
		this.ctx.strokeStyle = error ? this.config.errorColor :this.config.lineColor;
		this.ctx.stroke();

		arr.forEach((e: number) => {
			this.points[e - 1].active = true
			if (error) {
				this.points[e - 1].error = true
			}
		});
	}

	/**
	 * Draw line from last point of current path to current finger position
	 */
	private drawLine(toX: number, toY: number): void {
		if (!this.path.length) {
			return;
		}
		let index = this.path[this.path.length - 1] - 1;
		let x = this.points[index].x;
		let y = this.points[index].y;
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(toX, toY);
		this.ctx.lineWidth = this.config.lineWidth;
		this.ctx.strokeStyle = this.config.lineColor;
		this.ctx.stroke();
	}

	/**
	 * Draw single point of grid
	 */
	private drawSinglePoint(ctx: any, config: PointModel): void {
		let color = config.error ? config.errorColor : config.lineColor;
		this.ctx.beginPath();
		this.ctx.arc(config.x, config.y, config.r - config.lineSize, 0, Math.PI * 2);
		this.ctx.fillStyle = config.bgColor;
		this.ctx.fill();
		this.ctx.lineWidth = config.lineSize
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
		if (config.active) {
			this.ctx.beginPath();
			this.ctx.arc(config.x, config.y, config.r / 3, 0, Math.PI * 2)
			this.ctx.fillStyle = color;
			this.ctx.fill();
		}
	}

	/** endregion */

	checkPath(path: Array<number>): boolean {
		if (path && path?.length > 0 && this.correctPath && this.correctPath?.length > 0) {
			if (path?.length !== this.correctPath?.length) {
				return false;
			}
			let res = true;
			path.forEach((item: number, index: number) => {
				if (item !== this.correctPath[index]) {
					res = false;
				}
			});
			return res;
		}
		return false;
	}

	/**
	 * Checks if points were skipped and fill them
	 */
	checkAndFillSkippedPoints(prev: number, current: number): any {
		const cols: number = this.config.columns;

		// CASE: points in same row
		if (Math.trunc(prev / cols) === Math.trunc(current / cols)) {
			if (prev > current) {
				for (let i = prev - 1; i > current; i--) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			} else {
				for (let i = prev + 1; i < current; i++) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}
			return;
		}

		// CASE: points in same column
		if (prev % cols === current % cols) {
			if (prev > current) {
				for (let i = prev - cols; i > current; i -= cols) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			} else {
				for (let i = prev + cols; i < current; i += cols) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}
			return;
		}

		// CASE: points in same diagonal
		if (Math.abs((prev % cols) - (current % cols)) === Math.abs(Math.trunc(prev / cols) - Math.trunc(current / cols))) {
			// bottom-right -> top-left
			if (prev > current && prev % cols > current % cols) {
				for (let i = prev - (cols + 1); i > current; i -= (cols + 1)) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}

			// bottom-left -> top-right
			if (prev > current && prev % cols < current % cols) {
				for (let i = prev - (cols - 1); i > current; i -= (cols - 1)) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}

			// top-left -> bottom-right
			if (prev < current && prev % cols < current % cols) {
				for (let i = prev + (cols + 1); i < current; i += (cols + 1)) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}

			// top-right -> bottom-left
			if (prev < current && prev % cols > current % cols) {
				for (let i = prev + (cols - 1); i < current; i += (cols - 1)) {
					if (!this.points[i].active) {
						this.path.push(i + 1);
					}
				}
			}
			return;
		}
	}

	private removeTouchListeners(): void {
		this.touchStartUnsubscribe();
		this.touchMoveUnsubscribe();
		this.touchEndUnsubscribe();
	}
}
