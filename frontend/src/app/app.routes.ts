import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { UnitsPageComponent } from './pages/units-page.component';
import { FilesPageComponent } from './pages/files-page.component';
import { MapPageComponent } from './pages/map-page.component';
import { UnitReportPageComponent } from './pages/unit-report-page.component';
import { BackupPageComponent } from './pages/backup-page.component';
import { AtividadesAsaPageComponent } from './pages/atividades-asa-page.component';
import { ConfiguracoesGeraisPageComponent } from './pages/configuracoes-gerais-page.component';
import { UsuariosPageComponent } from './pages/usuarios-page.component';
import { EmailUnidadesPageComponent } from './pages/email-unidades-page.component';
import { AprovacaoUsuariosPageComponent } from './pages/aprovacao-usuarios-page.component';
import { PontuacaoUnidadesPageComponent } from './pages/pontuacao-unidades-page.component';
import { FotosEventosPageComponent } from './pages/fotos-eventos-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'units', component: UnitsPageComponent },
  { path: 'files', component: FilesPageComponent },
  { path: 'map', component: MapPageComponent },
  { path: 'unit-report', component: UnitReportPageComponent },
  { path: 'atividades-asa', component: AtividadesAsaPageComponent },
  { path: 'configuracoes-gerais', component: ConfiguracoesGeraisPageComponent },
  { path: 'configuracoes-gerais/usuarios', component: UsuariosPageComponent },
  { path: 'configuracoes-gerais/aprovacao-usuarios', component: AprovacaoUsuariosPageComponent },
  { path: 'configuracoes-gerais/email-unidades', component: EmailUnidadesPageComponent },
  { path: 'pontuacao-unidades', component: PontuacaoUnidadesPageComponent },
  { path: 'fotos-eventos', component: FotosEventosPageComponent },
  { path: 'backup', component: BackupPageComponent },
  { path: '**', redirectTo: 'login' }
];
