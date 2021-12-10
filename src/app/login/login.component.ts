import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageRefConst } from '../../const/page-ref.const';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	// public loginForm: FormGroup;

	constructor(private fb: FormBuilder, private router: Router) {
	}

	ngOnInit(): void {
		// this.loginForm = this.fb.group({
		// 	login: this.fb.control('', [
		// 		Validators.required
		// 	]),
		// 	password: this.fb.control('', [
		// 		Validators.required
		// 	])
		// });
	}

	loginAction(): void {
		console.log('LOGIN')
		this.router.navigate([PageRefConst.GRAPHIC_KEY_AUTH.link]);
	}

}
