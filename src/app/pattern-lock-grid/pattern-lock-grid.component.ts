import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnInit,
	Output,
	Renderer2,
	ViewChild
} from '@angular/core';
import {InputPatternLockGridConfigModel, PatternLockGridConfigModel} from './model/pattern-lock-grid-config.model';
import {PointModel} from './model/point.model';
import {CoordinatesModel} from './model/coordinates.model';
import {DOCUMENT} from '@angular/common';
import {DEFAULT_CONFIG_CONST} from './default-config.const';
import {fromEvent} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {LineModel} from "./model/line.model";
import {calcL, getMouseEventTargetCoordinates, getTouchEventTargetCoordinates} from "./util";

@UntilDestroy()
@Component({
	selector: 'sc-ion-pattern-lock-grid',
	templateUrl: './pattern-lock-grid.component.html',
	styleUrls: ['./pattern-lock-grid.component.scss']
})
export class PatternLockGridComponent implements OnInit, AfterViewInit {
	private _config: PatternLockGridConfigModel;
	private pointDetectionAreaMultiplier: number = 3;

	@Input() correctPath: Array<number>; // path to compare with entered to show error
	@Input() errorShowInterval: number = 500; // time in milliseconds to show error state
	// @ts-ignore
	@Input() set config(value: InputPatternLockGridConfigModel) {
		this._config = {
			...this._config,
			...value,
		}
	};

	// @ts-ignore
	get config(): PatternLockGridConfigModel {
		return this._config;
	}

	@Output() readonly successPasswordEntered: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();
	@Output() readonly errorPasswordEntered: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();
	@Output() readonly pointToPathAdded: EventEmitter<number> = new EventEmitter<number>();

	//-------------------------------------------------
	private start: boolean;
	public pointRadius: number;
	public points: Array<PointModel>;
	public lines: Array<LineModel>;
	private path: Array<number>;

	public currentControlPositionLine: LineModel; // line from last path point to current position
	//-------------------------------------------------

	@ViewChild('patternLockSvg', {read: ElementRef}) patternLockSvg: ElementRef;

	constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document, private cdr: ChangeDetectorRef) {
		this._config = DEFAULT_CONFIG_CONST;
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.initFingerPassword();
	}

	/** region Init canvas properties */

	private initFingerPassword(): void {
		this.start = false; // is drawing began
		this.pointRadius = this.initRoundR();
		this.points = this.initPoints();
		this.path = [];
		this.lines = [];
		// @ts-ignore
		this.currentControlPositionLine = undefined;

		this.subscribeDOMEvents();
		this.cdr.detectChanges();
	}

	/**
	 * Reset current state
	 */
	private reset(): void {
		this.points.forEach((e: PointModel) => {
			e.active = false;
			e.error = false;
		});
		this.start = false;
		this.path = [];
		this.lines = [];
		// @ts-ignore
		this.currentControlPositionLine = undefined;
		this.cdr.detectChanges();
	}

	/**
	 * Subscribe to events
	 */
	private subscribeDOMEvents(): void {
		const svgElement = this.patternLockSvg.nativeElement;

		// @ts-ignore
		fromEvent(svgElement, 'touchstart').pipe(untilDestroyed(this)).subscribe((event: TouchEvent) => this.onTouchStart(event));

		// @ts-ignore
		fromEvent(svgElement, 'touchmove').pipe(untilDestroyed(this)).subscribe((event: TouchEvent) => this.onTouchMove(event));

		fromEvent(window, 'touchend')
			.pipe(untilDestroyed(this))
			.subscribe(_ => this.onTouchEnd());

		// @ts-ignore
		fromEvent(svgElement, 'mousedown').pipe(untilDestroyed(this)).subscribe((event: MouseEvent) => this.onMouseDown(event));

		// @ts-ignore
		fromEvent(svgElement, 'mousemove').pipe(untilDestroyed(this)).subscribe((event: MouseEvent) => this.onMouseMove(event));

		fromEvent(window, 'mouseup')
			.pipe(untilDestroyed(this))
			.subscribe(_ => this.onMouseUp());
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
		// ToDo (lahun - 24.12.2021) - Add points size and radius calculations depends on container size
		let diffX = (this.config.width - (this.config.columns * this.pointRadius * 2)) / (this.config.columns - 1); // Расстояние между столбцами
		let diffY = (this.config.height - (this.config.rows * this.pointRadius * 2)) / (this.config.rows - 1); // Межстрочный интервал
		let len = this.config.columns * this.config.rows;
		let cols = this.config.columns;
		let arr = [];
		for (let i = 0; i < len; i++) {
			let obj: PointModel = new PointModel();
			obj.x = (i % cols) * (diffX + 2 * this.pointRadius) + this.pointRadius;
			obj.y = Math.floor(i / cols) * (diffY + 2 * this.pointRadius) + this.pointRadius;
			obj.r = 10; //this.pointRadius - 5;
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
	private onTouchStart(e: TouchEvent): void {
		const targetCoords: CoordinatesModel = getTouchEventTargetCoordinates(e, this.patternLockSvg.nativeElement);

		this.startControlMovement(targetCoords);
	}

	/**
	 * Finger movement handler
	 */
	private onTouchMove(e: TouchEvent): void {
		e?.stopPropagation();
		const targetCoords: CoordinatesModel = getTouchEventTargetCoordinates(e, this.patternLockSvg.nativeElement);

		this.moveControl(targetCoords);
	}

	/**
	 * Finger removing from screen handler
	 */
	private onTouchEnd(): void {
		this.endControlMovement();
	}

	/** endregion */

	/** region Mouse events */
	private onMouseDown(e: MouseEvent): void {
		const targetCoords: CoordinatesModel = getMouseEventTargetCoordinates(e);

		this.startControlMovement(targetCoords);
	}

	private onMouseMove(e: MouseEvent) {
		e?.stopPropagation();
		const targetCoords: CoordinatesModel = getMouseEventTargetCoordinates(e);

		this.moveControl(targetCoords);
	}

	private onMouseUp(): void {
		this.endControlMovement();
	}

	/** endregion */

	/** region Event handlers common logic */

	/**
	 * Handle path drawing start
	 */
	private startControlMovement(targetCoords: CoordinatesModel): void {
		let index = this.points.findIndex((p: any) => calcL(targetCoords.left, targetCoords.top, p.x, p.y, p.r * this.pointDetectionAreaMultiplier));
		if (index > -1) {
			this.path = [index + 1];
			this.updatePointsStatus(this.path)
			this.start = true;
		}
	}

	/**
	 * Handle path drawing
	 */
	private moveControl(targetCoords: CoordinatesModel): void {
		if (!this.start) {
			return;
		}

		let index = this.points.findIndex((p: any) => calcL(targetCoords.left, targetCoords.top, p.x, p.y, p.r * this.pointDetectionAreaMultiplier));
		if (index > -1 && !this.points[index].active) {
			if (this.path.length > 0) {
				this.checkAndFillSkippedPoints(this.path[this.path.length - 1] - 1, index);
			}
			this.addPointToPath(index);
		}

		this.currentControlPositionLine = new LineModel({
			beginX: this.points[this.path[this.path.length - 1] - 1].x,
			beginY: this.points[this.path[this.path.length - 1] - 1].y,
			endX: targetCoords.left,
			endY: targetCoords.top,
			lineColor: this.config.lineColor,
			lineSize: this.config.lineWidth,
		});
		this.cdr.detectChanges();
	}

	/**
	 * Handle end path drawing
	 */
	private endControlMovement(): void {
		if (this.start) {
			if (!this.correctPath || this.checkPath(this.path)) {
				this.successPasswordEntered.emit(this.path);
			} else {
				const errorPath = [...this.path];
				this.errorPasswordEntered.emit(errorPath);
				this.reset();
				this.drawResult(errorPath, true);
				setTimeout(() => {
					this.reset();
				}, this.errorShowInterval);
			}
		}
	}

	/** endregion */

	/** region Draw methods */

	/**
	 * Drawing result of interaction
	 * @param arr - path to draw
	 * @param error - error state
	 */
	private drawResult(arr: Array<number>, error: boolean): void {
		this.lines = [];
		arr.reduce((prev: number, current: number) => {
			this.lines.push(new LineModel({
				beginX: this.points[prev - 1].x,
				beginY: this.points[prev - 1].y,
				endX: this.points[current - 1].x,
				endY: this.points[current - 1].y,
				lineColor: error ? this.config.errorColor : this.config.lineColor,
				lineSize: this.config.lineWidth,
			}));
			return current;
		});
		this.updatePointsStatus(arr, error);

		this.cdr.detectChanges();
	}

	/** endregion */

	private checkPath(path: Array<number>): boolean {
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
	 * Checks if points were skipped and fill them.
	 * Cases by diagonal direction
	 */
	private checkAndFillSkippedPoints(prev: number, current: number): any {
		const cols: number = this.config.columns;

		// CASE: points in same row
		if (Math.trunc(prev / cols) === Math.trunc(current / cols)) {
			if (prev > current) {
				for (let i = prev - 1; i > current; i--) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			} else {
				for (let i = prev + 1; i < current; i++) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}
		}

		// CASE: points in same column
		if (prev % cols === current % cols) {
			if (prev > current) {
				for (let i = prev - cols; i > current; i -= cols) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			} else {
				for (let i = prev + cols; i < current; i += cols) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}
		}

		// CASE: points in same diagonal
		if (Math.abs((prev % cols) - (current % cols)) === Math.abs(Math.trunc(prev / cols) - Math.trunc(current / cols))) {
			// bottom-right -> top-left
			if (prev > current && prev % cols > current % cols) {
				for (let i = prev - (cols + 1); i > current; i -= (cols + 1)) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}

			// bottom-left -> top-right
			if (prev > current && prev % cols < current % cols) {
				for (let i = prev - (cols - 1); i > current; i -= (cols - 1)) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}

			// top-left -> bottom-right
			if (prev < current && prev % cols < current % cols) {
				for (let i = prev + (cols + 1); i < current; i += (cols + 1)) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}

			// top-right -> bottom-left
			if (prev < current && prev % cols > current % cols) {
				for (let i = prev + (cols - 1); i < current; i += (cols - 1)) {
					if (!this.points[i].active) {
						this.addPointToPath(i);
					}
				}
				return;
			}
		}
	}

	/**
	 * Add point to currentPath
	 */
	private addPointToPath(index: number): void {
		const begin = this.points[this.path[this.path.length - 1] - 1];
		const end = this.points[index];

		this.path.push(index + 1);
		this.lines.push(new LineModel({
			beginX: begin.x,
			beginY: begin.y,
			endX: end.x,
			endY: end.y,
			lineColor: this.config.lineColor,
			lineSize: this.config.lineWidth,
		}));
		this.points[index].active = true;
		this.cdr.detectChanges();
		this.pointToPathAdded.emit(index + 1);
	}

	/**
	 * Update points active and error status
	 */
	private updatePointsStatus(arr: Array<number>, error?: boolean): void {
		arr.forEach((e: number) => {
			this.points[e - 1].active = true
			if (error) {
				this.points[e - 1].error = true
			}
		});
	}
}
