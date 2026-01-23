import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';
import {
  PontuacaoUnidadesService,
  PontuacaoUnidade,
  PontuacaoAtividadeConfig
} from '../services/pontuacao-unidades.service';

@Component({
  selector: 'app-pontuacao-unidades-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './pontuacao-unidades-page.component.html',
  styleUrls: ['./pontuacao-unidades-page.component.css']
})
export class PontuacaoUnidadesPageComponent implements OnInit {
  carregando = false;
  carregandoConfiguracoes = false;
  periodoRelatorio = this.obterPeriodoAtual();
  pontuacoes: PontuacaoUnidade[] = [];
  configuracoes: PontuacaoAtividadeConfig[] = [];
  configuracoesOriginais: PontuacaoAtividadeConfig[] = [];
  mensagensErro: string[] = [];

  readonly menuPai = 'Operacional';
  readonly titulo = 'Pontuacao das unidades';
  readonly subtitulo = 'Acompanhe pontuacao mensal, selos de excelencia e trofeu anual.';
  readonly comentarioDidatico = 'ajuste os pontos por atividade e acompanhe o desempenho mensal das unidades.';

  constructor(
    private pontuacaoUnidadesService: PontuacaoUnidadesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarConfiguracoes();
    this.carregarPontuacoes();
  }

  aoBuscar(): void {
    this.carregarPontuacoes();
  }

  aoNovo(): void {
    this.periodoRelatorio = this.obterPeriodoAtual();
    this.carregarPontuacoes();
  }

  aoSalvar(): void {
    const builder = new PopupErrorBuilder();
    if (!this.periodoRelatorio?.trim()) {
      builder.adicionarMensagem('Informe o periodo.');
    }
    const invalido = this.configuracoes.some(config => config.pontos == null || config.pontos < 0);
    if (invalido) {
      builder.adicionarMensagem('Informe pontos validos para as atividades.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.carregandoConfiguracoes = true;
    this.pontuacaoUnidadesService.salvarConfiguracoes(this.configuracoes).subscribe({
      next: configuracoes => {
        this.carregandoConfiguracoes = false;
        this.configuracoes = configuracoes;
        this.configuracoesOriginais = configuracoes.map(config => ({ ...config }));
        this.carregarPontuacoes();
      },
      error: () => {
        this.carregandoConfiguracoes = false;
        this.mensagensErro = ['Nao foi possivel salvar as configuracoes de pontuacao.'];
      }
    });
  }

  aoCancelar(): void {
    this.configuracoes = this.configuracoesOriginais.map(config => ({ ...config }));
    this.carregarPontuacoes();
  }

  aoExcluir(): void {
    this.mensagensErro = ['Acao indisponivel nesta tela.'];
  }

  aoImprimir(): void {
    window.print();
  }

  aoFechar(): void {
    this.router.navigate(['/dashboard']);
  }

  carregarPontuacoes(): void {
    if (!this.periodoRelatorio?.trim()) {
      this.mensagensErro = ['Informe o periodo.'];
      return;
    }
    this.carregando = true;
    this.pontuacaoUnidadesService.listarPontuacoes(this.periodoRelatorio).subscribe({
      next: pontuacoes => {
        this.pontuacoes = pontuacoes;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar a pontuacao das unidades.'];
      }
    });
  }

  carregarConfiguracoes(): void {
    this.carregandoConfiguracoes = true;
    this.pontuacaoUnidadesService.listarConfiguracoes().subscribe({
      next: configuracoes => {
        this.configuracoes = configuracoes;
        this.configuracoesOriginais = configuracoes.map(config => ({ ...config }));
        this.carregandoConfiguracoes = false;
      },
      error: () => {
        this.carregandoConfiguracoes = false;
        this.mensagensErro = ['Nao foi possivel carregar as configuracoes de pontuacao.'];
      }
    });
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  private obterPeriodoAtual(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    return `${mes}-${ano}`;
  }
}
