import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UnidadeService } from '../services/unidade.service';
import { ReportService } from '../services/report.service';
import { AtividadeAsa, AtividadesAsaService } from '../services/atividades-asa.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./dashboard-page.component.css'],
  template: `
  <section class="paginaDashboard">
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

    <div class="cabecalhoDashboard">
      <div class="tituloDashboard">
        <h1>Dashboard de Acompanhamento de Atividades</h1>
        <span>Missao Mineira Oeste</span>
      </div>
    </div>

    <div class="topoDashboard">
      <div class="linhaTopoDashboard">
        <span class="rotuloQuantidade">Quantidade de ASAs na MMO</span>
        <span class="valorQuantidade">{{ totalUnidades }}</span>
      </div>
      <div class="seletorPeriodo">
        <select [(ngModel)]="periodoSelecionado" (ngModelChange)="atualizarResumo()">
          <option value="">Periodo do Relatorio</option>
          <option *ngFor="let periodo of periodosDisponiveis" [value]="periodo">{{ formatarPeriodo(periodo) }}</option>
        </select>
      </div>
    </div>

    <div class="gradeDashboard">
      <div class="colunaLista">
        <div class="listaAcoes">
          <div class="itemAcao" *ngFor="let item of resumoAcoes">
            <span class="rotuloAcao">{{ item.rotulo }}</span>
            <span class="valorAcao">{{ item.total }}</span>
          </div>
        </div>
      </div>

      <div class="colunaIndicadores">
        <div class="gradeIndicadoresPrincipais">
          <div class="cartaoPrincipal">
            <div class="valorPrincipal">{{ totalFamiliasAtendidas | number:'1.0-0' }}</div>
            <div class="rotuloPrincipal">Familias Atendidas</div>
          </div>
          <div class="cartaoPrincipal">
            <div class="valorPrincipal">{{ totalKilosDistribuidos | number:'1.0-0' }}</div>
            <div class="rotuloPrincipal">Kilos Distribuidos</div>
            <div class="subRotulo">aproximadamente</div>
          </div>
          <div class="cartaoPrincipal cartaoDestaque">
            <div class="valorPrincipal">{{ totalBatismos | number:'1.0-0' }}</div>
            <div class="rotuloPrincipal">Batismos pela ASA</div>
          </div>
        </div>

        <div class="gradeIndicadoresSecundarios">
          <div class="cartaoSecundario">
            <div class="valorSecundario">{{ totalUnidadesParticipantes | number:'1.0-0' }}</div>
            <div class="rotuloSecundario">Unidades Participantes</div>
            <div class="subRotulo">no periodo</div>
          </div>
          <div class="cartaoSecundario">
            <div class="valorSecundario">{{ totalVoluntarios | number:'1.0-0' }}</div>
            <div class="rotuloSecundario">Numero de Voluntarios</div>
            <div class="subRotulo">no periodo</div>
          </div>
        </div>
      </div>

      <div class="colunaGrafico">
        <div class="cartaoGrafico">
          <h3>Top 10 - Voluntarios por Unidade</h3>
          <div class="graficoBarras">
            <div class="linhaBarra" *ngFor="let item of topVoluntarios">
              <div class="barra" [style.width.%]="item.percentual">
                <span class="valorBarra">{{ item.valor }}</span>
              </div>
              <span class="rotuloBarra">{{ item.asa }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rodapeDashboard">
      <button type="button" class="botaoBaixar" (click)="imprimirTela()">Baixar</button>
    </div>

    <div class="rodapeImpressao">
      Responsavel: ____________________________ | Sistema de Gestao ASA
    </div>
  </section>
  `
})
export class DashboardPageComponent implements OnInit {
  totalUnidades = 0;
  unidadesPendencias = 0;
  unidadesDesatualizadas = 0;
  totalAcoes = 0;
  totalBeneficiarios = 0;
  indicadorSelecionado: string | null = null;
  mensagemIndicadorSelecionado = '';
  tempoAtrasoNavegacao = 180;
  totalFamiliasAtendidas = 0;
  totalKilosDistribuidos = 0;
  totalBatismos = 0;
  totalUnidadesParticipantes = 0;
  totalVoluntarios = 0;
  periodoSelecionado = '';
  periodosDisponiveis: string[] = [];
  atividades: AtividadeAsa[] = [];
  resumoAcoes: { rotulo: string; total: number }[] = [];
  topVoluntarios: { asa: string; valor: number; percentual: number }[] = [];

  constructor(
    private unidadeService: UnidadeService,
    private reportService: ReportService,
    private atividadesAsaService: AtividadesAsaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resumoAcoes = this.criarResumoInicial();
    this.unidadeService.listar().subscribe(unidades => {
      this.totalUnidades = unidades.length;
      this.unidadesPendencias = unidades.filter(unidade =>
        !unidade.telefone || !unidade.emailUnidade || !unidade.bairro || !unidade.enderecoCompleto
      ).length;
      this.unidadesDesatualizadas = unidades.filter(unidade =>
        !unidade.enderecoCompleto || !unidade.emailUnidade
      ).length;
    });
    this.atividadesAsaService.listar().subscribe(atividades => {
      this.atividades = atividades;
      this.periodosDisponiveis = this.obterPeriodosDisponiveis(atividades);
      this.periodoSelecionado = this.periodosDisponiveis[0] || '';
      this.atualizarResumo();
    }, () => {
      this.resumoAcoes = this.criarResumoInicial();
    });
    this.reportService.list().subscribe(reports => {
      this.totalAcoes = reports.length;
      this.totalBeneficiarios = reports.reduce((acc, report) => acc + (report.beneficiaries || 0), 0);
    });
  }

  imprimirTela(): void {
    window.print();
  }

  atualizarResumo(): void {
    const atividadesFiltradas = this.periodoSelecionado
      ? this.atividades.filter(atividade => atividade.periodoRelatorio === this.periodoSelecionado)
      : this.atividades;

    this.totalFamiliasAtendidas = atividadesFiltradas.reduce((acc, item) => acc + (item.familiasAtendidas || 0), 0);
    this.totalKilosDistribuidos = atividadesFiltradas.reduce((acc, item) => acc + (item.cestasBasicas19kg || 0) * 19, 0);
    this.totalBatismos = atividadesFiltradas.reduce((acc, item) => acc + (item.batismosMes || 0), 0);
    this.totalUnidadesParticipantes = new Set(atividadesFiltradas.map(item => item.asaIdentificacao)).size;
    this.totalVoluntarios = atividadesFiltradas.reduce((acc, item) => acc + (item.voluntariosAtivos || 0), 0);

    this.resumoAcoes = this.criarResumoInicial().map(item => ({
      ...item,
      total: this.calcularTotalResumo(item.rotulo, atividadesFiltradas)
    }));

    this.topVoluntarios = this.obterTopVoluntarios(atividadesFiltradas);
  }

  formatarPeriodo(periodo: string): string {
    if (!periodo) {
      return '';
    }
    const [ano, mes] = periodo.split('-');
    if (!ano || !mes) {
      return periodo;
    }
    return `${mes}/${ano}`;
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

  private obterPeriodosDisponiveis(atividades: AtividadeAsa[]): string[] {
    const periodos = Array.from(new Set(atividades.map(item => item.periodoRelatorio))).filter(Boolean);
    return periodos.sort((a, b) => b.localeCompare(a));
  }

  private criarResumoInicial(): { rotulo: string; total: number }[] {
    return [
      { rotulo: 'Estudos Biblicos', total: 0 },
      { rotulo: 'Batismos', total: 0 },
      { rotulo: 'Cestas Basicas', total: 0 },
      { rotulo: 'Pecas Distribuidas', total: 0 },
      { rotulo: 'Visita a Beneficiarios', total: 0 },
      { rotulo: 'Doacao de Sangue', total: 0 },
      { rotulo: 'Campanha do Agasalho', total: 0 },
      { rotulo: 'Feira Solidaria', total: 0 },
      { rotulo: 'Mutirao de Natal', total: 0 },
      { rotulo: 'Palestras Educativas', total: 0 },
      { rotulo: 'Cursos geracao de renda', total: 0 },
      { rotulo: 'Reuniao com equipe', total: 0 }
    ];
  }

  private calcularTotalResumo(rotulo: string, atividades: AtividadeAsa[]): number {
    switch (rotulo) {
      case 'Estudos Biblicos':
        return this.somarNumerico(atividades, 'estudosBiblicos');
      case 'Batismos':
        return this.somarNumerico(atividades, 'batismosMes');
      case 'Cestas Basicas':
        return this.somarNumerico(atividades, 'cestasBasicas19kg');
      case 'Pecas Distribuidas':
        return this.somarNumerico(atividades, 'pecasRoupasCalcados');
      case 'Visita a Beneficiarios':
        return this.somarBooleano(atividades, 'acaoVisitaBeneficiarios');
      case 'Doacao de Sangue':
        return this.somarBooleano(atividades, 'acaoDoacaoSangue');
      case 'Campanha do Agasalho':
        return this.somarBooleano(atividades, 'acaoCampanhaAgasalho');
      case 'Feira Solidaria':
        return this.somarBooleano(atividades, 'acaoFeiraSolidaria');
      case 'Mutirao de Natal':
        return this.somarBooleano(atividades, 'acaoMutiraoNatal');
      case 'Palestras Educativas':
        return this.somarBooleano(atividades, 'acaoPalestrasEducativas');
      case 'Cursos geracao de renda':
        return this.somarBooleano(atividades, 'acaoCursosGeracaoRenda');
      case 'Reuniao com equipe':
        return this.somarBooleano(atividades, 'reuniaoAvaliacaoPlanejamento');
      default:
        return 0;
    }
  }

  private somarNumerico(atividades: AtividadeAsa[], campo: keyof AtividadeAsa): number {
    return atividades.reduce((acc, item) => acc + (item[campo] as number || 0), 0);
  }

  private somarBooleano(atividades: AtividadeAsa[], campo: keyof AtividadeAsa): number {
    return atividades.reduce((acc, item) => acc + ((item[campo] as boolean) ? 1 : 0), 0);
  }

  private obterTopVoluntarios(atividades: AtividadeAsa[]): { asa: string; valor: number; percentual: number }[] {
    const mapa = new Map<string, number>();
    atividades.forEach(item => {
      const atual = mapa.get(item.asaIdentificacao) || 0;
      mapa.set(item.asaIdentificacao, atual + (item.voluntariosAtivos || 0));
    });
    const ordenado = Array.from(mapa.entries())
      .map(([asa, valor]) => ({ asa, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
    const maior = ordenado[0]?.valor || 1;
    return ordenado.map(item => ({
      ...item,
      percentual: Math.round((item.valor / maior) * 100)
    }));
  }
}
