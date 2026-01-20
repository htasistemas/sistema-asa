import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnidadeService } from '../services/unidade.service';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./dashboard-page.component.css'],
  template: `
  <section class="paginaDashboard">
    <div class="cabecalhoImpressao">
      <div class="flex items-start">
        <img class="logoImpressao" src="assets/logo.jpg" alt="ASA" />
        <div>
          <h1 class="tituloImpressao">Sistema ASA - Dashboard</h1>
          <div class="metaImpressao">Indicadores gerais</div>
        </div>
      </div>
      <div class="metaImpressao">Emissao: {{ dataImpressao | date:'dd/MM/yyyy HH:mm' }}</div>
    </div>

    <div class="topoPagina">
      <div class="linhaTopo">
        <span class="identificadorModulo">Painel</span>
        <p class="subtituloPagina">Visao integrada dos indicadores mais importantes do sistema.</p>
      </div>
      <h2 class="tituloPagina">Dashboard</h2>
    </div>

    <div class="gradeIndicadores">
      <button
        type="button"
        class="cartaoIndicador corVerde"
        [class.ativo]="indicadorSelecionado === 'unidades'"
        (click)="definirIndicadorSelecionado('unidades')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Unidades cadastradas</span>
          <span class="seloIndicador">Ativo</span>
        </div>
        <div class="valorIndicador">{{ totalUnidades }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Pendencias: {{ unidadesPendencias }}</span>
          <span class="variacaoIndicador">{{ obterPercentual(unidadesPendencias, totalUnidades) | number:'1.0-0' }}%</span>
        </div>
      </button>

      <button
        type="button"
        class="cartaoIndicador corAmarela"
        [class.ativo]="indicadorSelecionado === 'pendencias'"
        (click)="definirIndicadorSelecionado('pendencias')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Unidades com pendencias</span>
          <span class="seloIndicador">Atencao</span>
        </div>
        <div class="valorIndicador">{{ unidadesPendencias }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Total analisado</span>
          <span class="variacaoIndicador">{{ totalUnidades }}</span>
        </div>
      </button>

      <button
        type="button"
        class="cartaoIndicador corVermelha"
        [class.ativo]="indicadorSelecionado === 'desatualizadas'"
        (click)="definirIndicadorSelecionado('desatualizadas')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Unidades desatualizadas</span>
          <span class="seloIndicador">Critico</span>
        </div>
        <div class="valorIndicador">{{ unidadesDesatualizadas }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Pendencias graves</span>
          <span class="variacaoIndicador">{{ obterPercentual(unidadesDesatualizadas, totalUnidades) | number:'1.0-0' }}%</span>
        </div>
      </button>

      <button
        type="button"
        class="cartaoIndicador corVerdeEscuro"
        [class.ativo]="indicadorSelecionado === 'investimentos'"
        (click)="definirIndicadorSelecionado('investimentos')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Investimentos</span>
          <span class="seloIndicador">Financeiro</span>
        </div>
        <div class="valorIndicador">R$ {{ totalInvestimentos | number:'1.2-2' }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Acoes registradas</span>
          <span class="variacaoIndicador">{{ totalAcoes }}</span>
        </div>
      </button>

      <button
        type="button"
        class="cartaoIndicador corAzul"
        [class.ativo]="indicadorSelecionado === 'acoes'"
        (click)="definirIndicadorSelecionado('acoes')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Acoes realizadas</span>
          <span class="seloIndicador">Operacao</span>
        </div>
        <div class="valorIndicador">{{ totalAcoes }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Media por unidade</span>
          <span class="variacaoIndicador">{{ obterMedia(totalAcoes, totalUnidades) | number:'1.1-1' }}</span>
        </div>
      </button>

      <button
        type="button"
        class="cartaoIndicador corRoxa"
        [class.ativo]="indicadorSelecionado === 'beneficiarios'"
        (click)="definirIndicadorSelecionado('beneficiarios')"
      >
        <div class="cabecalhoIndicador">
          <span class="tituloIndicador">Pessoas atendidas</span>
          <span class="seloIndicador">Impacto</span>
        </div>
        <div class="valorIndicador">{{ totalBeneficiarios }}</div>
        <div class="detalheIndicador">
          <span class="descricaoIndicador">Media por acao</span>
          <span class="variacaoIndicador">{{ obterMedia(totalBeneficiarios, totalAcoes) | number:'1.1-1' }}</span>
        </div>
      </button>
    </div>

    <div class="painelDetalheIndicador" *ngIf="mensagemIndicadorSelecionado">
      <div class="tituloDetalheIndicador">Detalhe do indicador</div>
      <p class="textoDetalheIndicador">{{ mensagemIndicadorSelecionado }}</p>
    </div>

    <div class="rodapeImpressao">
      Responsavel: ____________________________ | Sistema de Gestao ASA
    </div>
  </section>
  `
})
export class DashboardPageComponent implements OnInit {
  dataImpressao = new Date();
  totalUnidades = 0;
  unidadesPendencias = 0;
  unidadesDesatualizadas = 0;
  totalInvestimentos = 0;
  totalAcoes = 0;
  totalBeneficiarios = 0;
  indicadorSelecionado: string | null = null;
  mensagemIndicadorSelecionado = '';
  tempoAtrasoNavegacao = 180;

  constructor(
    private unidadeService: UnidadeService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.unidadeService.listar().subscribe(unidades => {
      this.totalUnidades = unidades.length;
      this.unidadesPendencias = unidades.filter(unidade =>
        !unidade.telefone || !unidade.emailUnidade || !unidade.bairro || !unidade.enderecoCompleto
      ).length;
      this.unidadesDesatualizadas = unidades.filter(unidade =>
        !unidade.enderecoCompleto || !unidade.emailUnidade
      ).length;
    });
    this.reportService.list().subscribe(reports => {
      this.totalAcoes = reports.length;
      this.totalInvestimentos = reports.reduce((acc, report) => acc + (report.value || 0), 0);
      this.totalBeneficiarios = reports.reduce((acc, report) => acc + (report.beneficiaries || 0), 0);
    });
  }

  imprimirTela(): void {
    window.print();
  }

  definirIndicadorSelecionado(tipoIndicador: string): void {
    this.indicadorSelecionado = tipoIndicador;
    this.mensagemIndicadorSelecionado = this.obterMensagemIndicador(tipoIndicador);
    window.setTimeout(() => this.navegarParaIndicador(tipoIndicador), this.tempoAtrasoNavegacao);
  }

  obterPercentual(parte: number, total: number): number {
    if (!total) {
      return 0;
    }
    return (parte / total) * 100;
  }

  obterMedia(valor: number, total: number): number {
    if (!total) {
      return 0;
    }
    return valor / total;
  }

  obterMensagemIndicador(tipoIndicador: string): string {
    const mensagens: Record<string, string> = {
      unidades: 'Resumo das unidades cadastradas com foco em pendencias e consistencia cadastral.',
      pendencias: 'Pendencias identificadas que exigem revisao de telefone, e-mail e endereco.',
      desatualizadas: 'Unidades sem dados essenciais atualizados. Priorize a validacao das informacoes.',
      investimentos: 'Total consolidado de investimentos com base nos relatorios enviados.',
      acoes: 'Quantidade de acoes realizadas registradas pelas unidades.',
      beneficiarios: 'Impacto social medido pelo total de pessoas atendidas.'
    };

    return mensagens[tipoIndicador] || '';
  }

  navegarParaIndicador(tipoIndicador: string): void {
    const rotas: Record<string, { caminho: string; parametros?: Record<string, string> }> = {
      unidades: { caminho: '/units' },
      pendencias: { caminho: '/units', parametros: { filtro: 'pendencias' } },
      desatualizadas: { caminho: '/units', parametros: { filtro: 'desatualizadas' } },
      investimentos: { caminho: '/unit-report' },
      acoes: { caminho: '/unit-report' },
      beneficiarios: { caminho: '/unit-report' }
    };

    const destino = rotas[tipoIndicador];
    if (!destino) {
      return;
    }

    this.router.navigate([destino.caminho], { queryParams: destino.parametros });
  }
}
