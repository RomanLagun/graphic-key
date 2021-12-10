import { RouterModule, Routes } from '@angular/router';
import { PageRefConst } from '../../const/page-ref.const';
import { GraphicKeyAuthComponent } from './graphic-key-auth.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
	{
		path: '',
		component: GraphicKeyAuthComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class GraphicKeyAuthRoutingModule {}
