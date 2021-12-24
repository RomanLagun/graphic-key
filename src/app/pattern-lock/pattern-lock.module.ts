import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternLockComponent } from '@sc-genbank-mob/features/pattern-lock/pattern-lock.component';
import { PatternLockGridModule } from '@sc-genbank-mob/features/pattern-lock-grid/pattern-lock-grid.module';

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
