import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService, Usuario } from '../services/usuarios.service';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppDialogComponent } from '../shared/app-dialog.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppDialogComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css']
})
export class UsuariosPageComponent implements OnInit {
  carregando = false;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  usuarioEmEdicao: Usuario = this.criarUsuarioVazio();
  termoBusca = '';
  dialogoExclusaoAberto = false;
  mensagensErro: string[] = [];

  readonly menuPai = 'Configuracoes';
  readonly titulo = 'Usuarios do Sistema';
  readonly subtitulo = 'Gerencie os usuarios que podem acessar o sistema.';
  readonly comentarioDidatico = 'mantenha emails e perfis atualizados.';

  readonly perfis = ['ADMIN', 'OPERADOR'];

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.usuariosService.listar().subscribe({
      next: usuarios => {
        this.usuarios = usuarios;
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar os usuarios.'];
      }
    });
  }

  aoBuscar(): void {
    this.carregarDados();
  }

  aoNovo(): void {
    this.usuarioSelecionado = null;
    this.usuarioEmEdicao = this.criarUsuarioVazio();
  }

  aoSalvar(): void {
    const builder = new PopupErrorBuilder();
    if (!this.usuarioEmEdicao.email?.trim()) {
      builder.adicionarMensagem('Informe o e-mail.');
    }
    if (!this.usuarioEmEdicao.role?.trim()) {
      builder.adicionarMensagem('Informe o perfil.');
    }
    if (!this.usuarioSelecionado && !this.usuarioEmEdicao.senha?.trim()) {
      builder.adicionarMensagem('Informe a senha.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    const requisicao = this.usuarioEmEdicao.id
      ? this.usuariosService.atualizar(this.usuarioEmEdicao)
      : this.usuariosService.criar(this.usuarioEmEdicao);

    requisicao.subscribe({
      next: () => {
        this.usuarioEmEdicao = this.criarUsuarioVazio();
        this.usuarioSelecionado = null;
        this.carregarDados();
      },
      error: () => {
        this.mensagensErro = ['Nao foi possivel salvar o usuario.'];
      }
    });
  }

  aoCancelar(): void {
    this.usuarioEmEdicao = this.criarUsuarioVazio();
    this.usuarioSelecionado = null;
    this.termoBusca = '';
    this.aplicarFiltro();
  }

  aoExcluir(): void {
    if (!this.usuarioSelecionado?.id) {
      this.mensagensErro = ['Selecione um usuario para excluir.'];
      return;
    }
    this.dialogoExclusaoAberto = true;
  }

  confirmarExclusao(): void {
    if (!this.usuarioSelecionado?.id) {
      this.dialogoExclusaoAberto = false;
      return;
    }
    this.usuariosService.excluir(this.usuarioSelecionado.id).subscribe({
      next: () => {
        this.dialogoExclusaoAberto = false;
        this.usuarioSelecionado = null;
        this.usuarioEmEdicao = this.criarUsuarioVazio();
        this.carregarDados();
      },
      error: () => {
        this.dialogoExclusaoAberto = false;
        this.mensagensErro = ['Nao foi possivel excluir o usuario.'];
      }
    });
  }

  cancelarExclusao(): void {
    this.dialogoExclusaoAberto = false;
  }

  aoImprimir(): void {
    window.print();
  }

  aoFechar(): void {
    this.router.navigate(['/configuracoes-gerais']);
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    this.usuarioEmEdicao = { ...usuario, senha: '' };
  }

  aplicarFiltro(): void {
    const termoNormalizado = this.normalizarTexto(this.termoBusca);
    if (!termoNormalizado) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const campos = [usuario.email, usuario.role];
      return campos.some(campo => this.normalizarTexto(campo || '').includes(termoNormalizado));
    });
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  private criarUsuarioVazio(): Usuario {
    return {
      email: '',
      role: 'ADMIN',
      active: true,
      aprovado: true,
      senha: ''
    };
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
