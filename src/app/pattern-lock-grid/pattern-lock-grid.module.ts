import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternLockGridComponent } from './pattern-lock-grid.component';
import {SharedModule} from "../../shared/shared.module";

@NgModule({
	declarations: [
		PatternLockGridComponent
	],
	exports: [
		PatternLockGridComponent
	],
	imports: [
		CommonModule,
		SharedModule
	]
})
export class PatternLockGridModule {
}
