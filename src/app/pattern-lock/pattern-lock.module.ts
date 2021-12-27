import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PatternLockComponent} from "./pattern-lock.component";
import {PatternLockGridModule} from "../pattern-lock-grid/pattern-lock-grid.module";

@NgModule({
	declarations: [PatternLockComponent],
	imports: [
		CommonModule,
		PatternLockGridModule

	],
	exports: [PatternLockComponent]
})
export class PatternLockModule {
}
