import { NgModule } from '@angular/core';
import { GraphicKeyAuthComponent } from './graphic-key-auth.component';
import { SharedModule } from '../../shared/shared.module';
import { GraphicKeyAuthRoutingModule } from './graphic-key-auth-routing.module';
import { FingerPasswordModule } from '../finger-password/finger-password.module';
import {PatternLockModule} from "../pattern-lock/pattern-lock.module";


@NgModule({
	declarations: [
		GraphicKeyAuthComponent
	],
    imports: [
        SharedModule,
        GraphicKeyAuthRoutingModule,
        FingerPasswordModule,
		PatternLockModule
    ]
})
export class GraphicKeyAuthModule {
}
