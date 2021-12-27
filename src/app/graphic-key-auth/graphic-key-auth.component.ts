import { Component, OnInit } from '@angular/core';
import { InputFingerPasswordConfigModel } from '../finger-password/finger-password-config.model';

@Component({
	selector: 'app-graphic-key-auth',
	templateUrl: './graphic-key-auth.component.html',
	styleUrls: ['./graphic-key-auth.component.scss']
})
export class GraphicKeyAuthComponent implements OnInit {
	public config: InputFingerPasswordConfigModel;
	public correctPath: Array<number> = [3,2,5,8,9];

	public type: string = 'CANVAS';

	constructor() {
	}

	ngOnInit(): void {
		this.config = {
			width: 300,
			height: 300,
		};
	}

	changeType(event: any): void {
		this.type = event?.detail?.value;
	}
}
