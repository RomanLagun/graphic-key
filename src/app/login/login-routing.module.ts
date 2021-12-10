import { RouterModule, Routes } from '@angular/router';
import { PageRefConst } from '../../const/page-ref.const';
import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
	{
		path: PageRefConst.EMPTY.name,
		component: LoginComponent,
	}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoginRoutingModule {}
