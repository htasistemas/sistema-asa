import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  username = '';
  password = '';
  error = '';
  carregando = false;

  constructor(private auth: AuthService, private router: Router) {}

  handleLogin(): void {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Informe usuario e senha.';
      return;
    }
    this.carregando = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.carregando = false;
        this.error = 'Credenciais invalidas.';
      }
    });
  }
}
