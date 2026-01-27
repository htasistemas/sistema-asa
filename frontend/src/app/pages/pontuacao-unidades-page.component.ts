import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  pontuacoesMensais: {
    nomeUnidade: string;
    pontosPorMes: number[];
    totalAno: number;
  }[] = [];
  configuracoes: PontuacaoAtividadeConfig[] = [];
  configuracoesOriginais: PontuacaoAtividadeConfig[] = [];
  mensagensErro: string[] = [];
  anoReferencia = 2026;
  mesesAno = this.criarMesesAno();
  mesesPontuacao = this.criarMesesAno();
  mapaSelosPorUnidade = new Map<string, boolean[]>();
  abaAtiva: 'pontuacao' | 'selos' | 'configuracoes' = 'pontuacao';

  readonly urlImagemSelo = 'assets/selo-qualidade.svg';

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
    this.anoReferencia = 2026;
    this.pontuacaoUnidadesService.listarPontuacoes(this.periodoRelatorio).subscribe({
      next: pontuacoes => {
        this.pontuacoes = pontuacoes;
        this.carregando = false;
        this.carregarSelosAno();
        this.carregarPontuacoesMensais();
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

  obterSelosDaUnidade(nomeUnidade: string): boolean[] {
    const selos = this.mapaSelosPorUnidade.get(nomeUnidade);
    if (selos) {
      return selos;
    }
    const vazio = new Array(this.mesesAno.length).fill(false);
    this.mapaSelosPorUnidade.set(nomeUnidade, vazio);
    return vazio;
  }

  private obterPeriodoAtual(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    return `${mes}-${ano}`;
  }

  private carregarSelosAno(): void {
    this.pontuacaoUnidadesService
      .listarPontuacoes('01-2026')
      .pipe(catchError(() => of([] as PontuacaoUnidade[])))
      .subscribe({
        next: pontuacoesJaneiro => {
          const mapa = new Map<string, boolean[]>();
          pontuacoesJaneiro.forEach(pontuacao => {
            const selos = new Array(this.mesesAno.length).fill(false);
            selos[0] = this.temDadosParaSelo(pontuacao);
            mapa.set(pontuacao.nomeUnidade, selos);
          });
          this.mapaSelosPorUnidade = mapa;
        },
        error: () => {
          this.mapaSelosPorUnidade = new Map();
        }
      });
  }

  private carregarPontuacoesMensais(): void {
    const periodo = '01-2026';
    this.pontuacaoUnidadesService
      .listarPontuacoes(periodo)
      .pipe(catchError(() => of([] as PontuacaoUnidade[])))
      .subscribe({
        next: pontuacoesMes => {
          const linhas = pontuacoesMes.map(pontuacao => {
            const pontosPorMes = new Array(this.mesesPontuacao.length).fill(0);
            pontosPorMes[0] = pontuacao.pontosTotal ?? 0;
            const totalAno = pontosPorMes.reduce((acc, valor) => acc + (valor || 0), 0);
            return { nomeUnidade: pontuacao.nomeUnidade, pontosPorMes, totalAno };
          });

          this.pontuacoesMensais = linhas.sort((a, b) => {
            if (b.totalAno !== a.totalAno) {
              return b.totalAno - a.totalAno;
            }
            return a.nomeUnidade.localeCompare(b.nomeUnidade);
          });
        },
        error: () => {
          this.pontuacoesMensais = [];
        }
      });
  }

  private temDadosParaSelo(pontuacao: PontuacaoUnidade): boolean {
    return (pontuacao.pontosTotal ?? 0) > 0 || pontuacao.seloExcelencia === true;
  }

  private extrairAno(periodo: string): number {
    return 2026;
  }

  private criarMesesAno(): { valor: string; rotulo: string }[] {
    return [
      { valor: '01', rotulo: 'Jan' },
      { valor: '02', rotulo: 'Fev' },
      { valor: '03', rotulo: 'Mar' },
      { valor: '04', rotulo: 'Abr' },
      { valor: '05', rotulo: 'Mai' },
      { valor: '06', rotulo: 'Jun' },
      { valor: '07', rotulo: 'Jul' },
      { valor: '08', rotulo: 'Ago' },
      { valor: '09', rotulo: 'Set' },
      { valor: '10', rotulo: 'Out' },
      { valor: '11', rotulo: 'Nov' },
      { valor: '12', rotulo: 'Dez' }
    ];
  }
}
