import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageRefConst } from '../const/page-ref.const';

const routes: Routes = [
	{
		path: PageRefConst.LOGIN.name,
		loadChildren: () => import('src/app/login/login.module').then(m => m.LoginModule)
	},
	{
		path: PageRefConst.GRAPHIC_KEY_AUTH.name,
		loadChildren: () => import('src/app/graphic-key-auth/graphic-key-auth.module').then(m => m.GraphicKeyAuthModule)
	},
	{
		path: PageRefConst.EMPTY.name,
		redirectTo: PageRefConst.GRAPHIC_KEY_AUTH.name,
		pathMatch: 'full'
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
