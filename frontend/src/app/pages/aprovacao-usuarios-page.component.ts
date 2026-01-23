import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService, Usuario } from '../services/usuarios.service';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';

@Component({
  selector: 'app-aprovacao-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './aprovacao-usuarios-page.component.html',
  styleUrls: ['./aprovacao-usuarios-page.component.css']
})
export class AprovacaoUsuariosPageComponent implements OnInit {
  carregando = false;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  usuarioEmEdicao: Usuario = this.criarUsuarioVazio();
  termoBusca = '';
  mensagensErro: string[] = [];

  readonly menuPai = 'Configuracoes';
  readonly titulo = 'Aprovacao de Usuarios';
  readonly subtitulo = 'Autorize o acesso de usuarios cadastrados no sistema.';
  readonly comentarioDidatico = 'aprove apenas usuarios com cadastro validado.';

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
    if (!this.usuarioEmEdicao.id) {
      builder.adicionarMensagem('Selecione um usuario para aprovar.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.usuariosService.atualizar(this.usuarioEmEdicao).subscribe({
      next: () => {
        this.usuarioSelecionado = null;
        this.usuarioEmEdicao = this.criarUsuarioVazio();
        this.carregarDados();
      },
      error: () => {
        this.mensagensErro = ['Nao foi possivel salvar a aprovacao.'];
      }
    });
  }

  aoCancelar(): void {
    this.usuarioSelecionado = null;
    this.usuarioEmEdicao = this.criarUsuarioVazio();
    this.termoBusca = '';
    this.aplicarFiltro();
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
    const usuariosPendentes = this.usuarios.filter(usuario => !usuario.aprovado);
    if (!termoNormalizado) {
      this.usuariosFiltrados = [...usuariosPendentes];
      return;
    }
    this.usuariosFiltrados = usuariosPendentes.filter(usuario => {
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
      role: '',
      active: true,
      aprovado: false,
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
