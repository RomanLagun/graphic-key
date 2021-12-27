import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
// import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import {InputPatternLockGridConfigModel} from "../pattern-lock-grid/model/pattern-lock-grid-config.model";

@Component({
	selector: 'sc-ion-pattern-lock',
	templateUrl: './pattern-lock.component.html',
	styleUrls: ['./pattern-lock.component.scss'],
})
export class PatternLockComponent implements OnInit, AfterViewInit {
	public config: InputPatternLockGridConfigModel;

	constructor(private element: ElementRef) {
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		// ToDo (lahun - 24.12.2021) - calculate pattern lock config by element width
		setTimeout(() => {
			console.log(this.element.nativeElement.parentNode.clientWidth, this.element.nativeElement.clientWidth);
			this.config = {
				width: 300
			}
		}, 0)
	}

	pointToPathAdded(): void {
		// this.vibration.vibrate(100);
	}
}
