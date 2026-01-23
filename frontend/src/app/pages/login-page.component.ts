import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AppDialogComponent } from '../shared/app-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [NgIf, FormsModule, AppDialogComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  email = '';
  password = '';
  confirmarSenha = '';
  modoCadastro = false;
  dialogoEsqueciSenhaAberto = false;
  emailRecuperacao = '';
  error = '';
  carregando = false;

  constructor(private auth: AuthService, private router: Router) {}

  handleLogin(): void {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Informe e-mail e senha.';
      return;
    }
    this.carregando = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando = false;
        if (erro.status === 403) {
          const mensagemBackend = typeof erro.error === 'object' ? erro.error?.message : '';
          this.error = mensagemBackend?.trim() || 'Usuario nao autorizado. Aguarde a aprovacao do administrador.';
          return;
        }
        if (erro.status === 401) {
          this.error = 'Credenciais invalidas.';
          return;
        }
        this.error = 'Credenciais invalidas.';
      }
    });
  }

  handleCadastro(): void {
    this.error = '';
    if (!this.email || !this.password || !this.confirmarSenha) {
      this.error = 'Informe e-mail, senha e confirmacao.';
      return;
    }
    if (this.password !== this.confirmarSenha) {
      this.error = 'As senhas nao conferem.';
      return;
    }
    this.carregando = true;
    this.auth.register(this.email, this.password).subscribe({
      next: () => {
        this.carregando = false;
        this.modoCadastro = false;
        this.password = '';
        this.confirmarSenha = '';
      },
      error: () => {
        this.carregando = false;
        this.error = 'Nao foi possivel cadastrar o usuario.';
      }
    });
  }

  alternarModoCadastro(): void {
    this.modoCadastro = !this.modoCadastro;
    this.error = '';
    this.password = '';
    this.confirmarSenha = '';
  }

  abrirEsqueciSenha(): void {
    this.dialogoEsqueciSenhaAberto = true;
  }

  fecharEsqueciSenha(): void {
    this.dialogoEsqueciSenhaAberto = false;
    this.emailRecuperacao = '';
  }

  enviarRecuperacao(): void {
    this.error = '';
    if (!this.emailRecuperacao.trim()) {
      this.error = 'Informe o e-mail para recuperacao.';
      return;
    }
    this.carregando = true;
    this.auth.esqueciSenha(this.emailRecuperacao).subscribe({
      next: () => {
        this.carregando = false;
        this.dialogoEsqueciSenhaAberto = false;
        this.emailRecuperacao = '';
        this.error = 'E-mail de recuperacao enviado com sucesso.';
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando = false;
        if (erro.status === 404) {
          this.error = 'E-mail nao encontrado.';
          return;
        }
        const mensagemBackend = typeof erro.error === 'object' ? (erro.error?.message || erro.error?.mensagem) : erro.error;
        this.error = (mensagemBackend || '').toString().trim() || 'Nao foi possivel enviar o e-mail de recuperacao.';
      }
    });
  }
}
