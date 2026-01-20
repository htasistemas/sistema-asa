import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { UnitsPageComponent } from './pages/units-page.component';
import { FilesPageComponent } from './pages/files-page.component';
import { MapPageComponent } from './pages/map-page.component';
import { UnitReportPageComponent } from './pages/unit-report-page.component';
import { BackupPageComponent } from './pages/backup-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'units', component: UnitsPageComponent },
  { path: 'files', component: FilesPageComponent },
  { path: 'map', component: MapPageComponent },
  { path: 'unit-report', component: UnitReportPageComponent },
  { path: 'backup', component: BackupPageComponent },
  { path: '**', redirectTo: 'login' }
];
