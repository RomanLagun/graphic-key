import { Component, OnInit } from '@angular/core';
import { Finger } from '../finger-password/finger';

@Component({
	selector: 'app-graphic-key-auth',
	templateUrl: './graphic-key-auth.component.html',
	styleUrls: ['./graphic-key-auth.component.scss']
})
export class GraphicKeyAuthComponent implements OnInit {

	public finger: Finger | undefined;

	constructor() {
	}

	ngOnInit(): void {A
		this.finger = new Finger({
			id: 'passwordArea',
			width: 300,
			height: 300,
			bgColor: '#eee',
			lineColor: '#0089FF',
			lineSize: 5,
			errorColor: '#ff3030',
			cols: 3,
			rows: 3,
		}, (res: any) => {
			console.log('######', res)

			setTimeout(() => {
				this.finger?.drawPath(res, true);
				setTimeout(() => {
					this.finger?.reset()
				}, 300)
			}, 300)

		});
	}

}
