import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AtividadeAsa,
  AtividadesAsaService,
  ImportacaoAtividadeResposta
} from '../services/atividades-asa.service';
import { Unidade, UnidadeService } from '../services/unidade.service';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppDialogComponent } from '../shared/app-dialog.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';

type CampoEstruturaAsa =
  | 'possuiInstagram'
  | 'possuiEmailProprio'
  | 'possuiUniformeOficial'
  | 'possuiNovoManualAsa'
  | 'possuiLivroBeneficenciaSocial';

type CampoAcoesMes =
  | 'acaoVisitaBeneficiarios'
  | 'acaoRecoltaDonativos'
  | 'acaoDoacaoSangue'
  | 'acaoCampanhaAgasalho'
  | 'acaoFeiraSolidaria'
  | 'acaoPalestrasEducativas'
  | 'acaoCursosGeracaoRenda'
  | 'acaoMutiraoNatal';

type CampoAssistencia =
  | 'assistenciaAlimentos'
  | 'assistenciaRoupas'
  | 'assistenciaMoveis'
  | 'assistenciaLimpezaHigiene'
  | 'assistenciaConstrucao'
  | 'assistenciaMaterialEscolar'
  | 'assistenciaMedicamentos'
  | 'assistenciaAtendimentoSaude'
  | 'assistenciaMutiroes';

type CampoDesenvolvimento =
  | 'desenvolvimentoCapacitacaoProfissional'
  | 'desenvolvimentoCurriculoOrientacao'
  | 'desenvolvimentoCursoIdioma'
  | 'desenvolvimentoCursoInformatica'
  | 'desenvolvimentoCursosGeracaoRenda'
  | 'desenvolvimentoAdministracaoFinanceiraLar'
  | 'desenvolvimentoDeixarFumarBeber'
  | 'desenvolvimentoPrevencaoDrogas'
  | 'desenvolvimentoHabitosSaudaveis'
  | 'desenvolvimentoEducacaoSexual'
  | 'desenvolvimentoEducacaoFilhos'
  | 'desenvolvimentoAproveitamentoAlimentos'
  | 'desenvolvimentoAlfabetizacaoAdultos';

interface ItemGrade<T> {
  rotulo: string;
  campo: T;
}

@Component({
  selector: 'app-atividades-asa-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppDialogComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './atividades-asa-page.component.html',
  styleUrls: ['./atividades-asa-page.component.css']
})
export class AtividadesAsaPageComponent implements OnInit {
  carregando = false;
  importando = false;
  atividades: AtividadeAsa[] = [];
  atividadesFiltradas: AtividadeAsa[] = [];
  atividadeSelecionada: AtividadeAsa | null = null;
  atividadeEmEdicao: AtividadeAsa = this.criarAtividadeVazia();
  termoBusca = '';
  dialogoExclusaoAberto = false;
  mensagensErro: string[] = [];
  mesSelecionado: number | null = null;
  anoSelecionado: number | null = null;
  unidades: Unidade[] = [];
  mapaUnidades = new Map<string, Unidade>();
  abaAtiva: 'cadastro' | 'acoes' = 'cadastro';
  arquivoImportacao: File | null = null;
  resumoImportacao: ImportacaoAtividadeResposta | null = null;
  mesImportacao: number | null = null;
  anoImportacao: number | null = null;

  readonly menuPai = 'Operacional';
  readonly titulo = 'Atividades da ASA';
  readonly subtitulo = 'Controle do relatorio mensal de atividades.';
  readonly comentarioDidatico = 'preencha os dados conforme o relatorio mensal.';

  readonly opcoesAsa = [
    'ASA Alto Umuarama – Uberlândia',
    'ASA Bela Vista – Canápolis',
    'ASA Boa Vista – Araxá',
    'ASA Buritis – Uberlândia',
    'ASA Canaã – Uberlândia',
    'ASA Canaã – Juatuba',
    'ASA Central – Uberlândia',
    'ASA Central – Mateus Leme',
    'ASA Central – Capinópolis',
    'ASA Central – Patos de Minas',
    'ASA Cristo Redentor – Patos de Minas',
    'ASA Divinópolis – Divinópolis',
    'ASA Dom Almir – Uberlândia',
    'ASA Esplanada – Divinópolis',
    'ASA Frutal – Frutal',
    'ASA Glória – Uberlândia',
    'ASA Industrial – Uberlândia',
    'ASA Ipanema – Uberlândia',
    'ASA Jaraguá – Uberlândia',
    'ASA Jardim Brasília – Uberlândia',
    'ASA Jardim das Palmeiras – Uberlândia',
    'ASA Jardim Finotti – Uberlândia',
    'ASA Joana D’Arc – Uberlândia',
    'ASA Luizote de Freitas – Uberlândia',
    'ASA Mansour – Uberlândia',
    'ASA Monte Carmelo – Monte Carmelo',
    'ASA Morada da Colina – Uberlândia',
    'ASA Morada Nova – Uberlândia',
    'ASA Morumbi – Uberlândia',
    'ASA Nova Serrana – Nova Serrana',
    'ASA Panorama – Uberlândia',
    'ASA Pequis – Uberlândia',
    'ASA Jorge de Paula – Canápolis',
    'ASA Minas Gerais – Uberlândia',
    'ASA Roosevelt – Uberlândia',
    'ASA Santa Mônica – Uberlândia',
    'ASA São Gabriel – Uberlândia',
    'ASA São Sebastião – Araguari',
    'ASA Shopping Park – Uberlândia',
    'ASA Tibery – Uberlândia',
    'ASA Tocantins – Uberlândia'
  ];

  readonly meses = [
    { valor: 1, rotulo: 'Janeiro' },
    { valor: 2, rotulo: 'Fevereiro' },
    { valor: 3, rotulo: 'Março' },
    { valor: 4, rotulo: 'Abril' },
    { valor: 5, rotulo: 'Maio' },
    { valor: 6, rotulo: 'Junho' },
    { valor: 7, rotulo: 'Julho' },
    { valor: 8, rotulo: 'Agosto' },
    { valor: 9, rotulo: 'Setembro' },
    { valor: 10, rotulo: 'Outubro' },
    { valor: 11, rotulo: 'Novembro' },
    { valor: 12, rotulo: 'Dezembro' }
  ];
  readonly anos = this.gerarAnos(2000, 5);

  readonly itensEstrutura: ItemGrade<CampoEstruturaAsa>[] = [
    { rotulo: 'Instagram', campo: 'possuiInstagram' },
    { rotulo: 'Email próprio', campo: 'possuiEmailProprio' },
    { rotulo: 'Uniforme Oficial', campo: 'possuiUniformeOficial' },
    { rotulo: 'Novo Manual da ASA', campo: 'possuiNovoManualAsa' },
    { rotulo: 'Livro “Beneficência Social”', campo: 'possuiLivroBeneficenciaSocial' }
  ];

  readonly itensAcoesMes: ItemGrade<CampoAcoesMes>[] = [
    { rotulo: 'Visita a beneficiários', campo: 'acaoVisitaBeneficiarios' },
    { rotulo: 'Recolta de Donativos (R$)', campo: 'acaoRecoltaDonativos' },
    { rotulo: 'Doação de Sangue', campo: 'acaoDoacaoSangue' },
    { rotulo: 'Campanha do Agasalho', campo: 'acaoCampanhaAgasalho' },
    { rotulo: 'Feira Solidária', campo: 'acaoFeiraSolidaria' },
    { rotulo: 'Palestras Educativas', campo: 'acaoPalestrasEducativas' },
    { rotulo: 'Cursos para geração de renda', campo: 'acaoCursosGeracaoRenda' },
    { rotulo: 'Mutirão de Natal', campo: 'acaoMutiraoNatal' }
  ];

  readonly itensAssistencia: ItemGrade<CampoAssistencia>[] = [
    { rotulo: 'Distribuição de alimentos (cestas ou sopas)', campo: 'assistenciaAlimentos' },
    { rotulo: 'Distribuição de roupas, calçados, cobertores e colchões', campo: 'assistenciaRoupas' },
    { rotulo: 'Distribuição de móveis e utensílios domésticos', campo: 'assistenciaMoveis' },
    { rotulo: 'Distribuição de produtos de limpeza e higiene pessoal', campo: 'assistenciaLimpezaHigiene' },
    { rotulo: 'Distribuição de material de construção', campo: 'assistenciaConstrucao' },
    { rotulo: 'Distribuição de material escolar', campo: 'assistenciaMaterialEscolar' },
    { rotulo: 'Distribuição de medicamentos', campo: 'assistenciaMedicamentos' },
    { rotulo: 'Atendimento médico, odontológico, psicológico e espiritual', campo: 'assistenciaAtendimentoSaude' },
    { rotulo: 'Mutirões e dias de atendimento à comunidade', campo: 'assistenciaMutiroes' }
  ];

  readonly itensDesenvolvimento: ItemGrade<CampoDesenvolvimento>[] = [
    { rotulo: 'Cursos de capacitação profissional', campo: 'desenvolvimentoCapacitacaoProfissional' },
    { rotulo: 'Elaboração de currículo e orientação vocacional', campo: 'desenvolvimentoCurriculoOrientacao' },
    { rotulo: 'Curso de idioma', campo: 'desenvolvimentoCursoIdioma' },
    { rotulo: 'Curso de informática', campo: 'desenvolvimentoCursoInformatica' },
    { rotulo: 'Cursos de geração de renda', campo: 'desenvolvimentoCursosGeracaoRenda' },
    { rotulo: 'Curso de administração financeira do lar', campo: 'desenvolvimentoAdministracaoFinanceiraLar' },
    { rotulo: 'Curso “Como deixar de fumar e beber”', campo: 'desenvolvimentoDeixarFumarBeber' },
    { rotulo: 'Curso de prevenção de uso de drogas', campo: 'desenvolvimentoPrevencaoDrogas' },
    { rotulo: 'Curso de hábitos de vida saudáveis', campo: 'desenvolvimentoHabitosSaudaveis' },
    { rotulo: 'Educação sexual', campo: 'desenvolvimentoEducacaoSexual' },
    { rotulo: 'Educação dos filhos', campo: 'desenvolvimentoEducacaoFilhos' },
    { rotulo: 'Curso de aproveitamento de alimentos', campo: 'desenvolvimentoAproveitamentoAlimentos' },
    { rotulo: 'Curso de alfabetização de adultos', campo: 'desenvolvimentoAlfabetizacaoAdultos' }
  ];

  constructor(
    private atividadesAsaService: AtividadesAsaService,
    private unidadeService: UnidadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.atividadesAsaService.listar().subscribe({
      next: atividades => {
        this.atividades = atividades;
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar os registros.'];
      }
    });
    this.unidadeService.listar().subscribe({
      next: unidades => {
        this.unidades = unidades;
        this.mapaUnidades = new Map(
          unidades.map(unidade => [this.normalizarTexto(unidade.nomeUnidade || ''), unidade])
        );
      }
    });
  }

  aoBuscar(): void {
    this.carregarDados();
  }

  aoSelecionarArquivoImportacao(evento: Event): void {
    const input = evento.target as HTMLInputElement | null;
    const arquivo = input?.files?.item(0) ?? null;
    this.arquivoImportacao = arquivo;
  }

  aoImportarGoogleForms(): void {
    const periodoImportacao = this.obterPeriodoImportacao();
    if (!this.arquivoImportacao) {
      const builder = new PopupErrorBuilder();
      builder.adicionarMensagem('Selecione um arquivo CSV exportado do Google Forms.');
      this.mensagensErro = builder.construir();
      return;
    }
    if (!periodoImportacao) {
      const builder = new PopupErrorBuilder();
      builder.adicionarMensagem('Informe o periodo do relatorio para importacao.');
      this.mensagensErro = builder.construir();
      return;
    }

    this.importando = true;
    this.resumoImportacao = null;
    this.atividadesAsaService.importarGoogleForms(this.arquivoImportacao, periodoImportacao).subscribe({
      next: resumo => {
        this.importando = false;
        this.resumoImportacao = resumo;
        if (resumo.mensagens?.length) {
          this.mensagensErro = [...resumo.mensagens];
        }
        this.carregarDados();
      },
      error: () => {
        this.importando = false;
        const builder = new PopupErrorBuilder();
        builder.adicionarMensagem('Nao foi possivel importar o arquivo CSV.');
        this.mensagensErro = builder.construir();
      }
    });
  }

  aoNovo(): void {
    this.atividadeSelecionada = null;
    this.atividadeEmEdicao = this.criarAtividadeVazia();
    this.mesSelecionado = null;
    this.anoSelecionado = null;
    this.sincronizarPeriodoSelecionado();
  }

  aoSalvar(): void {
    this.atualizarPeriodoRelatorio();
    const builder = new PopupErrorBuilder();
    if (!this.atividadeEmEdicao.asaIdentificacao) {
      builder.adicionarMensagem('Selecione a ASA.');
    }
    if (!this.atividadeEmEdicao.periodoRelatorio) {
      builder.adicionarMensagem('Informe o período do relatório.');
    }
    if (!this.atividadeEmEdicao.diretorNome.trim()) {
      builder.adicionarMensagem('Informe o nome do diretor(a).');
    }
    if (!this.atividadeEmEdicao.telefoneContato.trim()) {
      builder.adicionarMensagem('Informe o telefone para contato.');
    }
    if (this.atividadeEmEdicao.familiasAtendidas === null) {
      builder.adicionarMensagem('Informe quantas famílias foram atendidas.');
    }
    if (this.atividadeEmEdicao.cestasBasicas19kg === null) {
      builder.adicionarMensagem('Informe quantas cestas básicas foram distribuídas.');
    }
    if (this.atividadeEmEdicao.pecasRoupasCalcados === null) {
      builder.adicionarMensagem('Informe a quantidade de peças distribuídas.');
    }
    if (this.atividadeEmEdicao.voluntariosAtivos === null) {
      builder.adicionarMensagem('Informe o número de voluntários ativos.');
    }
    if (this.atividadeEmEdicao.estudosBiblicos === null) {
      builder.adicionarMensagem('Informe a quantidade de estudos bíblicos.');
    }
    if (this.atividadeEmEdicao.batismosMes === null) {
      builder.adicionarMensagem('Informe a quantidade de batismos no mês.');
    }
    if (this.atividadeEmEdicao.avaliacaoRelatorio === null) {
      builder.adicionarMensagem('Informe a avaliação do relatório.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    const atividadeParaSalvar: AtividadeAsa = {
      ...this.atividadeEmEdicao,
      asaIdentificacao: this.obterNomeUnidadePadrao(this.atividadeEmEdicao.asaIdentificacao)
    };

    if (!atividadeParaSalvar.id) {
      const existente = this.localizarAtividadeExistente(
        atividadeParaSalvar.asaIdentificacao,
        atividadeParaSalvar.periodoRelatorio
      );
      if (existente) {
        this.atividadeEmEdicao = { ...existente, ...atividadeParaSalvar, id: existente.id };
        atividadeParaSalvar.id = existente.id;
      }
    }

    const requisicao = atividadeParaSalvar.id
      ? this.atividadesAsaService.atualizar(atividadeParaSalvar)
      : this.atividadesAsaService.criar(atividadeParaSalvar);

    requisicao.subscribe({
      next: () => {
        this.atividadeEmEdicao = this.criarAtividadeVazia();
        this.atividadeSelecionada = null;
        this.carregarDados();
      },
      error: () => {
        this.mensagensErro = ['Nao foi possivel salvar o registro.'];
      }
    });
  }

  aoCancelar(): void {
    this.atividadeEmEdicao = this.criarAtividadeVazia();
    this.atividadeSelecionada = null;
    this.termoBusca = '';
    this.aplicarFiltro();
    this.mesSelecionado = null;
    this.anoSelecionado = null;
  }

  aoExcluir(): void {
    if (!this.atividadeSelecionada?.id) {
      this.mensagensErro = ['Selecione um registro para excluir.'];
      return;
    }
    this.dialogoExclusaoAberto = true;
  }

  confirmarExclusao(): void {
    if (!this.atividadeSelecionada?.id) {
      this.dialogoExclusaoAberto = false;
      return;
    }
    this.atividadesAsaService.excluir(this.atividadeSelecionada.id).subscribe({
      next: () => {
        this.dialogoExclusaoAberto = false;
        this.atividadeSelecionada = null;
        this.atividadeEmEdicao = this.criarAtividadeVazia();
        this.carregarDados();
      },
      error: () => {
        this.dialogoExclusaoAberto = false;
        this.mensagensErro = ['Nao foi possivel excluir o registro.'];
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

  selecionarAtividade(atividade: AtividadeAsa): void {
    this.atividadeSelecionada = atividade;
    this.atividadeEmEdicao = { ...atividade };
    this.sincronizarPeriodoSelecionado();
  }

  aplicarFiltro(): void {
    const termoNormalizado = this.normalizarTexto(this.termoBusca);
    if (!termoNormalizado) {
      this.atividadesFiltradas = [...this.atividades];
      return;
    }
    this.atividadesFiltradas = this.atividades.filter(atividade => {
      const campos = [
        atividade.asaIdentificacao,
        this.formatarPeriodoRelatorio(atividade.periodoRelatorio),
        atividade.diretorNome
      ];
      return campos.some(campo => this.normalizarTexto(campo || '').includes(termoNormalizado));
    });
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  atualizarValorBooleano(campo: CampoEstruturaAsa | CampoAcoesMes | CampoAssistencia | CampoDesenvolvimento, valor: boolean): void {
    this.atividadeEmEdicao = {
      ...this.atividadeEmEdicao,
      [campo]: valor
    };
  }

  obterValorBooleano(campo: CampoEstruturaAsa | CampoAcoesMes | CampoAssistencia | CampoDesenvolvimento): boolean {
    return Boolean(this.atividadeEmEdicao[campo]);
  }

  aoSelecionarAsa(): void {
    const chaveCompleta = this.normalizarTexto(this.atividadeEmEdicao.asaIdentificacao);
    const chaveSimples = this.normalizarTexto(this.extrairNomeAsa(this.atividadeEmEdicao.asaIdentificacao));
    const unidade = this.mapaUnidades.get(chaveCompleta) || this.mapaUnidades.get(chaveSimples);
    if (!unidade) {
      return;
    }
    this.atividadeEmEdicao = {
      ...this.atividadeEmEdicao,
      diretorNome: unidade.diretor || this.atividadeEmEdicao.diretorNome,
      telefoneContato: unidade.telefone || this.atividadeEmEdicao.telefoneContato
    };
    this.aplicarAtividadeExistenteSeHouver();
  }

  definirPeriodoRelatorio(mes: number, ano: number): void {
    this.mesSelecionado = mes || null;
    this.anoSelecionado = ano || null;
    this.atualizarPeriodoRelatorio();
    this.aplicarAtividadeExistenteSeHouver();
  }

  obterMesSelecionado(): number | null {
    return this.mesSelecionado;
  }

  obterAnoSelecionado(): number | null {
    return this.anoSelecionado;
  }

  obterPeriodoSelecionado(): { mes: number; ano: number } | null {
    const partes = this.atividadeEmEdicao.periodoRelatorio.split('-');
    if (partes.length !== 2) {
      return null;
    }
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    if (!ano || !mes) {
      return null;
    }
    return { mes, ano };
  }

  formatarPeriodoRelatorio(periodo: string): string {
    const partes = periodo.split('-');
    if (partes.length !== 2) {
      return periodo;
    }
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    if (!ano || !mes) {
      return periodo;
    }
    return `${String(mes).padStart(2, '0')}/${ano}`;
  }

  obterResumoAcoes(tipo: 'mensal' | 'bimestral' | 'semestral' | 'anual'): { rotulo: string; total: number }[] {
    const periodo = this.obterPeriodoSelecionado();
    if (!periodo) {
      return [];
    }
    const atividadesFiltradas = this.filtrarPorPeriodo(tipo, periodo.mes, periodo.ano);
    const mapa = new Map<string, number>();
    const acoes = [
      { rotulo: 'Visita a beneficiários', campo: 'acaoVisitaBeneficiarios' as const },
      { rotulo: 'Recolta de Donativos (R$)', campo: 'acaoRecoltaDonativos' as const },
      { rotulo: 'Doação de Sangue', campo: 'acaoDoacaoSangue' as const },
      { rotulo: 'Campanha do Agasalho', campo: 'acaoCampanhaAgasalho' as const },
      { rotulo: 'Feira Solidária', campo: 'acaoFeiraSolidaria' as const },
      { rotulo: 'Palestras Educativas', campo: 'acaoPalestrasEducativas' as const },
      { rotulo: 'Cursos para geração de renda', campo: 'acaoCursosGeracaoRenda' as const },
      { rotulo: 'Mutirão de Natal', campo: 'acaoMutiraoNatal' as const },
      { rotulo: 'Distribuição de alimentos (cestas ou sopas)', campo: 'assistenciaAlimentos' as const },
      { rotulo: 'Distribuição de roupas, calçados, cobertores e colchões', campo: 'assistenciaRoupas' as const },
      { rotulo: 'Distribuição de móveis e utensílios domésticos', campo: 'assistenciaMoveis' as const },
      { rotulo: 'Distribuição de produtos de limpeza e higiene pessoal', campo: 'assistenciaLimpezaHigiene' as const },
      { rotulo: 'Distribuição de material de construção', campo: 'assistenciaConstrucao' as const },
      { rotulo: 'Distribuição de material escolar', campo: 'assistenciaMaterialEscolar' as const },
      { rotulo: 'Distribuição de medicamentos', campo: 'assistenciaMedicamentos' as const },
      { rotulo: 'Atendimento médico, odontológico, psicológico e espiritual', campo: 'assistenciaAtendimentoSaude' as const },
      { rotulo: 'Mutirões e dias de atendimento à comunidade', campo: 'assistenciaMutiroes' as const },
      { rotulo: 'Cursos de capacitação profissional', campo: 'desenvolvimentoCapacitacaoProfissional' as const },
      { rotulo: 'Elaboração de currículo e orientação vocacional', campo: 'desenvolvimentoCurriculoOrientacao' as const },
      { rotulo: 'Curso de idioma', campo: 'desenvolvimentoCursoIdioma' as const },
      { rotulo: 'Curso de informática', campo: 'desenvolvimentoCursoInformatica' as const },
      { rotulo: 'Cursos de geração de renda', campo: 'desenvolvimentoCursosGeracaoRenda' as const },
      { rotulo: 'Curso de administração financeira do lar', campo: 'desenvolvimentoAdministracaoFinanceiraLar' as const },
      { rotulo: 'Curso “Como deixar de fumar e beber”', campo: 'desenvolvimentoDeixarFumarBeber' as const },
      { rotulo: 'Curso de prevenção de uso de drogas', campo: 'desenvolvimentoPrevencaoDrogas' as const },
      { rotulo: 'Curso de hábitos de vida saudáveis', campo: 'desenvolvimentoHabitosSaudaveis' as const },
      { rotulo: 'Educação sexual', campo: 'desenvolvimentoEducacaoSexual' as const },
      { rotulo: 'Educação dos filhos', campo: 'desenvolvimentoEducacaoFilhos' as const },
      { rotulo: 'Curso de aproveitamento de alimentos', campo: 'desenvolvimentoAproveitamentoAlimentos' as const },
      { rotulo: 'Curso de alfabetização de adultos', campo: 'desenvolvimentoAlfabetizacaoAdultos' as const }
    ];
    acoes.forEach(acao => mapa.set(acao.rotulo, 0));
    atividadesFiltradas.forEach(atividade => {
      acoes.forEach(acao => {
        if (atividade[acao.campo]) {
          mapa.set(acao.rotulo, (mapa.get(acao.rotulo) || 0) + 1);
        }
      });
    });
    return Array.from(mapa.entries()).map(([rotulo, total]) => ({ rotulo, total }));
  }

  private filtrarPorPeriodo(tipo: 'mensal' | 'bimestral' | 'semestral' | 'anual', mes: number, ano: number): AtividadeAsa[] {
    return this.atividades.filter(atividade => {
      const partes = atividade.periodoRelatorio.split('-');
      if (partes.length !== 2) {
        return false;
      }
      const anoAtividade = Number(partes[0]);
      const mesAtividade = Number(partes[1]);
      if (!anoAtividade || !mesAtividade) {
        return false;
      }
      if (tipo === 'mensal') {
        return anoAtividade === ano && mesAtividade === mes;
      }
      if (tipo === 'bimestral') {
        const inicioBimestre = Math.floor((mes - 1) / 2) * 2 + 1;
        return anoAtividade === ano && mesAtividade >= inicioBimestre && mesAtividade <= inicioBimestre + 1;
      }
      if (tipo === 'semestral') {
        const inicioSemestre = mes <= 6 ? 1 : 7;
        return anoAtividade === ano && mesAtividade >= inicioSemestre && mesAtividade <= inicioSemestre + 5;
      }
      return anoAtividade === ano;
    });
  }

  private criarAtividadeVazia(): AtividadeAsa {
    return {
      asaIdentificacao: '',
      periodoRelatorio: '',
      diretorNome: '',
      telefoneContato: '',
      possuiInstagram: false,
      possuiEmailProprio: false,
      possuiUniformeOficial: false,
      possuiNovoManualAsa: false,
      possuiLivroBeneficenciaSocial: false,
      emailOficial: '',
      acaoVisitaBeneficiarios: false,
      acaoRecoltaDonativos: false,
      acaoDoacaoSangue: false,
      acaoCampanhaAgasalho: false,
      acaoFeiraSolidaria: false,
      acaoPalestrasEducativas: false,
      acaoCursosGeracaoRenda: false,
      acaoMutiraoNatal: false,
      familiasAtendidas: 0,
      cestasBasicas19kg: 0,
      pecasRoupasCalcados: 0,
      voluntariosAtivos: 0,
      estudosBiblicos: 0,
      batismosMes: 0,
      reuniaoAvaliacaoPlanejamento: false,
      assistenciaAlimentos: false,
      assistenciaRoupas: false,
      assistenciaMoveis: false,
      assistenciaLimpezaHigiene: false,
      assistenciaConstrucao: false,
      assistenciaMaterialEscolar: false,
      assistenciaMedicamentos: false,
      assistenciaAtendimentoSaude: false,
      assistenciaMutiroes: false,
      assistenciaOutras: '',
      desenvolvimentoCapacitacaoProfissional: false,
      desenvolvimentoCurriculoOrientacao: false,
      desenvolvimentoCursoIdioma: false,
      desenvolvimentoCursoInformatica: false,
      desenvolvimentoCursosGeracaoRenda: false,
      desenvolvimentoAdministracaoFinanceiraLar: false,
      desenvolvimentoDeixarFumarBeber: false,
      desenvolvimentoPrevencaoDrogas: false,
      desenvolvimentoHabitosSaudaveis: false,
      desenvolvimentoEducacaoSexual: false,
      desenvolvimentoEducacaoFilhos: false,
      desenvolvimentoAproveitamentoAlimentos: false,
      desenvolvimentoAlfabetizacaoAdultos: false,
      desenvolvimentoOutras: '',
      avaliacaoRelatorio: 1
    };
  }

  private obterPeriodoImportacao(): string | null {
    if (!this.anoImportacao || !this.mesImportacao) {
      return null;
    }
    return `${this.anoImportacao}-${String(this.mesImportacao).padStart(2, '0')}`;
  }

  private gerarAnos(inicio: number, anosAFrente: number): number[] {
    const anoAtual = new Date().getFullYear();
    const fim = anoAtual + anosAFrente;
    const anos: number[] = [];
    for (let ano = inicio; ano <= fim; ano += 1) {
      anos.push(ano);
    }
    return anos;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private extrairNomeAsa(asa: string): string {
    const semPrefixo = asa.replace(/^ASA\\s+/i, '');
    const partes = semPrefixo.split('–');
    return partes[0]?.trim() || semPrefixo.trim();
  }

  private atualizarPeriodoRelatorio(): void {
    if (!this.mesSelecionado || !this.anoSelecionado) {
      this.atividadeEmEdicao.periodoRelatorio = '';
      return;
    }
    this.atividadeEmEdicao.periodoRelatorio = `${this.anoSelecionado}-${String(this.mesSelecionado).padStart(2, '0')}`;
  }

  private sincronizarPeriodoSelecionado(): void {
    const periodo = this.obterPeriodoSelecionado();
    this.mesSelecionado = periodo?.mes || null;
    this.anoSelecionado = periodo?.ano || null;
  }

  private aplicarAtividadeExistenteSeHouver(): void {
    if (!this.atividadeEmEdicao.asaIdentificacao || !this.atividadeEmEdicao.periodoRelatorio) {
      return;
    }
    const existente = this.localizarAtividadeExistente(
      this.atividadeEmEdicao.asaIdentificacao,
      this.atividadeEmEdicao.periodoRelatorio
    );
    if (existente && existente.id !== this.atividadeEmEdicao.id) {
      this.atividadeSelecionada = existente;
      this.atividadeEmEdicao = { ...existente };
      this.sincronizarPeriodoSelecionado();
      return;
    }
    if (!existente && this.atividadeEmEdicao.id) {
      this.prepararNovoRelatorioMes();
    }
  }

  private localizarAtividadeExistente(asaIdentificacao: string, periodoRelatorio: string): AtividadeAsa | null {
    const asaNormalizada = this.normalizarTexto(asaIdentificacao);
    const periodoNormalizado = periodoRelatorio.trim();
    return (
      this.atividades.find(atividade => {
        const mesmaAsa = this.normalizarTexto(atividade.asaIdentificacao) === asaNormalizada;
        return mesmaAsa && atividade.periodoRelatorio === periodoNormalizado;
      }) || null
    );
  }

  private obterNomeUnidadePadrao(asaIdentificacao: string): string {
    const chaveCompleta = this.normalizarTexto(asaIdentificacao || '');
    const chaveSimples = this.normalizarTexto(this.extrairNomeAsa(asaIdentificacao || ''));
    const unidade = this.mapaUnidades.get(chaveCompleta) || this.mapaUnidades.get(chaveSimples);
    return unidade?.nomeUnidade || asaIdentificacao;
  }

  private prepararNovoRelatorioMes(): void {
    const asaIdentificacao = this.atividadeEmEdicao.asaIdentificacao;
    const periodoRelatorio = this.atividadeEmEdicao.periodoRelatorio;
    const diretorNome = this.atividadeEmEdicao.diretorNome;
    const telefoneContato = this.atividadeEmEdicao.telefoneContato;
    this.atividadeSelecionada = null;
    this.atividadeEmEdicao = {
      ...this.criarAtividadeVazia(),
      asaIdentificacao,
      periodoRelatorio,
      diretorNome,
      telefoneContato
    };
    this.sincronizarPeriodoSelecionado();
  }
}
