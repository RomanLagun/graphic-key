import { NgModule } from '@angular/core';
import { GraphicKeyAuthComponent } from './graphic-key-auth.component';
import { SharedModule } from '../../shared/shared.module';
import { GraphicKeyAuthRoutingModule } from './graphic-key-auth-routing.module';


@NgModule({
	declarations: [
		GraphicKeyAuthComponent
	],
	imports: [
		SharedModule,
		GraphicKeyAuthRoutingModule
	]
})
export class GraphicKeyAuthModule {
}
