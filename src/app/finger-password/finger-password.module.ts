import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FingerPasswordComponent } from './finger-password.component';

@NgModule({
    declarations: [
        FingerPasswordComponent
    ],
    exports: [
        FingerPasswordComponent
    ],
    imports: [
        CommonModule
    ]
})
export class FingerPasswordModule { }
