import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { LoginPageComponent } from './pages/login-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, LoginPageComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  darkMode = false;
  menuUnidadesAberto = false;
  menuOperacionalAberto = false;
  menuConfiguracoesAberto = false;

  get estaNaTelaLogin(): boolean {
    return this.router.url === '/login';
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    const root = document.documentElement;
    if (this.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  alternarMenuUnidades(): void {
    this.menuUnidadesAberto = !this.menuUnidadesAberto;
    if (this.menuUnidadesAberto) {
      this.menuOperacionalAberto = false;
    }
  }

  alternarMenuOperacional(): void {
    this.menuOperacionalAberto = !this.menuOperacionalAberto;
    if (this.menuOperacionalAberto) {
      this.menuUnidadesAberto = false;
      this.menuConfiguracoesAberto = false;
    }
  }

  alternarMenuConfiguracoes(): void {
    this.menuConfiguracoesAberto = !this.menuConfiguracoesAberto;
    if (this.menuConfiguracoesAberto) {
      this.menuUnidadesAberto = false;
      this.menuOperacionalAberto = false;
    }
  }

  fecharMenus(): void {
    this.menuUnidadesAberto = false;
    this.menuOperacionalAberto = false;
    this.menuConfiguracoesAberto = false;
  }

  @HostListener('document:click', ['$event'])
  fecharMenusAoClicarFora(event: MouseEvent): void {
    const alvo = event.target as HTMLElement | null;
    if (!alvo) {
      return;
    }
    if (alvo.closest('.menuDropdown')) {
      return;
    }
    this.fecharMenus();
  }
}
