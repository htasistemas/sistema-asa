import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppDialogComponent } from '../shared/app-dialog.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';
import { FotosEventosService, FotoEventoInstituicao } from '../services/fotos-eventos.service';

@Component({
  selector: 'app-fotos-eventos-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppDialogComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './fotos-eventos-page.component.html',
  styleUrls: ['./fotos-eventos-page.component.css']
})
export class FotosEventosPageComponent implements OnInit {
  carregando = false;
  fotos: FotoEventoInstituicao[] = [];
  fotosFiltradas: FotoEventoInstituicao[] = [];
  fotoSelecionada: FotoEventoInstituicao | null = null;
  fotoEmEdicao: FotoEventoInstituicao = this.criarFotoVazia();
  termoBusca = '';
  dialogoExclusaoAberto = false;
  mensagensErro: string[] = [];

  readonly menuPai = 'Operacional';
  readonly titulo = 'Fotos de eventos';
  readonly subtitulo = 'Registre fotos dos eventos realizados pelas instituicoes.';
  readonly comentarioDidatico = 'cadastre a foto com a instituicao, evento e data para manter o historico organizado.';
  readonly imagemCapaPadrao = 'assets/capa-evento-padrao.svg';
  readonly iconeAbrirFoto = 'assets/icone-link.svg';

  constructor(private fotosEventosService: FotosEventosService, private router: Router) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.fotosEventosService.listar().subscribe({
      next: fotos => {
        this.fotos = fotos;
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar as fotos dos eventos.'];
      }
    });
  }

  aoBuscar(): void {
    this.carregarDados();
  }

  aoNovo(): void {
    this.fotoSelecionada = null;
    this.fotoEmEdicao = this.criarFotoVazia();
  }

  aoSalvar(): void {
    const builder = new PopupErrorBuilder();
    if (!this.fotoEmEdicao.nomeInstituicao?.trim()) {
      builder.adicionarMensagem('Informe a instituicao.');
    }
    if (!this.fotoEmEdicao.nomeEvento?.trim()) {
      builder.adicionarMensagem('Informe o evento.');
    }
    if (!this.fotoEmEdicao.urlFoto?.trim()) {
      builder.adicionarMensagem('Informe o link da foto.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    const requisicao = this.fotoEmEdicao.id
      ? this.fotosEventosService.atualizar(this.fotoEmEdicao)
      : this.fotosEventosService.criar(this.fotoEmEdicao);

    requisicao.subscribe({
      next: () => {
        this.fotoEmEdicao = this.criarFotoVazia();
        this.fotoSelecionada = null;
        this.carregarDados();
      },
      error: () => {
        this.mensagensErro = ['Nao foi possivel salvar a foto do evento.'];
      }
    });
  }

  aoCancelar(): void {
    this.fotoEmEdicao = this.criarFotoVazia();
    this.fotoSelecionada = null;
    this.termoBusca = '';
    this.aplicarFiltro();
  }

  aoExcluir(): void {
    if (!this.fotoSelecionada?.id) {
      this.mensagensErro = ['Selecione uma foto para excluir.'];
      return;
    }
    this.dialogoExclusaoAberto = true;
  }

  confirmarExclusao(): void {
    if (!this.fotoSelecionada?.id) {
      this.dialogoExclusaoAberto = false;
      return;
    }
    this.fotosEventosService.excluir(this.fotoSelecionada.id).subscribe({
      next: () => {
        this.dialogoExclusaoAberto = false;
        this.fotoSelecionada = null;
        this.fotoEmEdicao = this.criarFotoVazia();
        this.carregarDados();
      },
      error: () => {
        this.dialogoExclusaoAberto = false;
        this.mensagensErro = ['Nao foi possivel excluir a foto do evento.'];
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
    this.router.navigate(['/dashboard']);
  }

  selecionarFoto(foto: FotoEventoInstituicao): void {
    this.fotoSelecionada = foto;
    this.fotoEmEdicao = { ...foto };
  }

  aplicarFiltro(): void {
    const termoNormalizado = this.normalizarTexto(this.termoBusca);
    if (!termoNormalizado) {
      this.fotosFiltradas = [...this.fotos];
      return;
    }
    this.fotosFiltradas = this.fotos.filter(foto => {
      const campos = [foto.nomeInstituicao, foto.nomeEvento, foto.descricao];
      return campos.some(campo => this.normalizarTexto(campo || '').includes(termoNormalizado));
    });
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  private criarFotoVazia(): FotoEventoInstituicao {
    return {
      nomeInstituicao: '',
      nomeEvento: '',
      dataEvento: '',
      urlFoto: '',
      descricao: ''
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
