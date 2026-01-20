import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnidadeService, Unidade } from '../services/unidade.service';
import { AppDialogComponent } from '../shared/app-dialog.component';

@Component({
  selector: 'app-units-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppDialogComponent],
  templateUrl: './units-page.component.html',
  styleUrls: ['./units-page.component.css']
})
export class UnitsPageComponent implements OnInit {
  dataImpressao = new Date();
  unidades: Unidade[] = [];
  unidadesFiltradas: Unidade[] = [];
  filtroAtivo = '';
  novaUnidade: Unidade = {
    nomeUnidade: '',
    diretor: '',
    telefone: '',
    bairro: '',
    cidade: '',
    regiao: '',
    distrito: '',
    emailUnidade: '',
    enderecoCompleto: '',
    anoEleicao: undefined
  };
  unidadeSelecionada: Unidade | null = null;
  mensagemErro = '';
  exibirErro = false;
  mostrarFormulario = false;
  mostrarFiltroBusca = false;
  termoBusca = '';
  filtroBusca = 'geral';
  dialogoExclusaoAberto = false;
  unidadeParaExcluir: Unidade | null = null;
  dialogoPendenciasAberto = false;
  unidadePendencias: Unidade | null = null;
  mensagemPendencias = '';
  opcoesBusca = [
    { valor: 'geral', rotulo: 'Geral' },
    { valor: 'unidade', rotulo: 'Unidade' },
    { valor: 'bairro', rotulo: 'Bairro' },
    { valor: 'cidade', rotulo: 'Cidade' },
    { valor: 'regiao', rotulo: 'Região' },
    { valor: 'distrito', rotulo: 'Distrito' },
    { valor: 'status', rotulo: 'Status' },
    { valor: 'anoEleicao', rotulo: 'Ano Eleição' }
  ];
  regioes = [
    'Triângulo Norte',
    'Triângulo Sul',
    'Alto Paranaíba',
    'Centro Oeste',
    'Sudoeste'
  ];

  constructor(
    private unidadeService: UnidadeService,
    private rota: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregar();
    this.rota.queryParamMap.subscribe(params => {
      const id = params.get('id');
      const filtro = params.get('filtro');
      this.filtroAtivo = filtro || '';
      this.aplicarFiltro();
      if (!id) {
        return;
      }
      const idNumerico = Number(id);
      if (Number.isNaN(idNumerico)) {
        return;
      }
      this.unidadeService.buscarPorId(idNumerico).subscribe({
        next: unidade => {
          this.unidadeSelecionada = unidade;
          this.novaUnidade = { ...unidade };
          this.mostrarFormulario = true;
        },
        error: () => this.mostrarErro('Nao foi possivel carregar a unidade selecionada.')
      });
    });
  }

  carregar(): void {
    this.unidadeService.listar().subscribe({
      next: unidades => {
        this.unidades = unidades;
        this.aplicarFiltro();
        this.aplicarBusca();
      },
      error: () => this.mostrarErro('Nao foi possivel buscar as unidades cadastradas.')
    });
  }

  iniciarNovaUnidade(): void {
    this.novaUnidade = {
      nomeUnidade: '',
      diretor: '',
      telefone: '',
      bairro: '',
      cidade: '',
      regiao: '',
      distrito: '',
      emailUnidade: '',
      enderecoCompleto: '',
      anoEleicao: undefined
    };
    this.unidadeSelecionada = null;
    this.mostrarFormulario = true;
  }

  salvarUnidade(): void {
    this.formatarNomeUnidade();
    this.formatarDiretor();
    this.aplicarMascaraTelefone();
    if (!this.validarEmailUnidade()) {
      return;
    }
    if (!this.validarCamposObrigatorios()) {
      this.mostrarErro('Preencha todos os campos obrigatorios antes de salvar.');
      return;
    }
    const payload: Unidade = {
      ...this.novaUnidade,
      id: this.unidadeSelecionada?.id
    };
    const requisicao = payload.id
      ? this.unidadeService.atualizar(payload)
      : this.unidadeService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.iniciarNovaUnidade();
        this.carregar();
        this.mostrarFormulario = false;
      },
      error: () => this.mostrarErro('Nao foi possivel salvar a unidade. Tente novamente.')
    });
  }

  excluirUnidade(id: number): void {
    this.unidadeService.excluir(id).subscribe({
      next: () => this.carregar(),
      error: () => this.mostrarErro('Nao foi possivel excluir a unidade.')
    });
  }

  confirmarExclusao(unidade: Unidade): void {
    if (!unidade.id) {
      return;
    }
    this.unidadeParaExcluir = unidade;
    this.dialogoExclusaoAberto = true;
  }

  cancelarExclusao(): void {
    this.dialogoExclusaoAberto = false;
    this.unidadeParaExcluir = null;
  }

  confirmarExclusaoDialogo(): void {
    if (!this.unidadeParaExcluir?.id) {
      this.cancelarExclusao();
      return;
    }
    this.excluirUnidade(this.unidadeParaExcluir.id);
    this.cancelarExclusao();
  }

  abrirPendencias(unidade: Unidade): void {
    this.unidadePendencias = unidade;
    const pendencias = this.obterPendenciasUnidade(unidade);
    if (pendencias.length === 0) {
      this.mensagemPendencias = 'Nenhuma pendencia encontrada para esta unidade.';
    } else {
      this.mensagemPendencias = `Campos pendentes: ${pendencias.join(', ')}`;
    }
    this.dialogoPendenciasAberto = true;
  }

  fecharPendencias(): void {
    this.dialogoPendenciasAberto = false;
    this.unidadePendencias = null;
    this.mensagemPendencias = '';
  }

  private obterPendenciasUnidade(unidade: Unidade): string[] {
    const pendencias: string[] = [];
    if (!unidade.nomeUnidade) pendencias.push('Nome da unidade');
    if (!unidade.diretor) pendencias.push('Diretor(a)');
    if (!unidade.telefone) pendencias.push('Telefone');
    if (!unidade.bairro) pendencias.push('Bairro');
    if (!unidade.cidade) pendencias.push('Cidade');
    if (!unidade.regiao) pendencias.push('Região');
    if (!unidade.distrito) pendencias.push('Distrito');
    if (!unidade.emailUnidade) pendencias.push('E-mail');
    if (!unidade.enderecoCompleto) pendencias.push('Endereço');
    if (!unidade.anoEleicao) pendencias.push('Ano eleição');
    return pendencias;
  }

  selecionarUnidade(unidade: Unidade): void {
    this.unidadeSelecionada = unidade;
    this.novaUnidade = { ...unidade };
  }

  editarUnidadeSelecionada(): void {
    if (!this.unidadeSelecionada) {
      this.mostrarErro('Selecione uma unidade para editar.');
      return;
    }
    this.novaUnidade = { ...this.unidadeSelecionada };
    this.mostrarFormulario = true;
  }

  editarUnidadeDireto(unidade: Unidade): void {
    this.unidadeSelecionada = unidade;
    this.novaUnidade = { ...unidade };
    this.mostrarFormulario = true;
  }

  excluirUnidadeSelecionada(): void {
    if (!this.unidadeSelecionada?.id) {
      this.mostrarErro('Selecione uma unidade para excluir.');
      return;
    }
    if (!window.confirm('Confirma a exclusao da unidade selecionada?')) {
      return;
    }
    this.excluirUnidade(this.unidadeSelecionada.id);
    this.unidadeSelecionada = null;
  }

  imprimirCadastro(): void {
    window.print();
  }

  validarCamposObrigatorios(): boolean {
    return !!(
      this.novaUnidade.nomeUnidade
      && this.novaUnidade.diretor
      && this.novaUnidade.cidade
      && this.novaUnidade.anoEleicao
    );
  }

  anoEleicaoInvalido(): boolean {
    return !!this.novaUnidade.anoEleicao && this.novaUnidade.anoEleicao < 2026;
  }

  obterStatusUnidade(unidade: Unidade): 'ATIVO' | 'INCOMPLETO' | 'BLOQUEADO' | 'DESATUALIZADO' {
    if (this.unidadeDesatualizada(unidade)) {
      return 'DESATUALIZADO';
    }
    const incompleto = this.unidadeIncompleta(unidade);
    if (incompleto) {
      return 'INCOMPLETO';
    }
    if (unidade.anoEleicao && unidade.anoEleicao < 2026) {
      return 'BLOQUEADO';
    }
    return 'ATIVO';
  }

  unidadeIncompleta(unidade: Unidade): boolean {
    return !unidade.nomeUnidade
      || !unidade.diretor
      || !unidade.telefone
      || !unidade.bairro
      || !unidade.cidade
      || !unidade.emailUnidade
      || !unidade.enderecoCompleto
      || !unidade.anoEleicao;
  }

  unidadeDesatualizada(unidade: Unidade): boolean {
    const dataBaseTexto = unidade.dataAtualizacao || unidade.dataCriacao;
    if (!dataBaseTexto) {
      return true;
    }
    const dataBase = new Date(dataBaseTexto);
    if (Number.isNaN(dataBase.getTime())) {
      return true;
    }
    const hoje = new Date();
    const limite = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
    return dataBase < limite;
  }

  aoDigitarNomeUnidade(evento: Event): void {
    const input = evento.target as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const valorFormatado = this.obterNomeUnidadeFormatado(input.value);
    this.aplicarValorFormatado(input, valorFormatado);
    this.novaUnidade.nomeUnidade = valorFormatado;
  }

  aoDigitarDiretor(evento: Event): void {
    const input = evento.target as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const valorFormatado = this.formatarTituloPreservandoEspacos(input.value);
    this.aplicarValorFormatado(input, valorFormatado);
    this.novaUnidade.diretor = valorFormatado;
  }

  aoDigitarTextoTitulo(evento: Event, campo: 'enderecoCompleto' | 'bairro' | 'cidade' | 'distrito'): void {
    const elemento = evento.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!elemento) {
      return;
    }
    const valorFormatado = this.formatarTituloPreservandoEspacos(elemento.value);
    this.aplicarValorFormatado(elemento, valorFormatado);
    this.novaUnidade[campo] = valorFormatado;
  }

  formatarNomeUnidade(): void {
    const valorFormatado = this.obterNomeUnidadeFormatado(this.novaUnidade.nomeUnidade || '');
    this.novaUnidade.nomeUnidade = valorFormatado;
  }

  formatarDiretor(): void {
    const valorFormatado = this.formatarTituloPreservandoEspacos(this.novaUnidade.diretor || '');
    this.novaUnidade.diretor = valorFormatado;
  }

  aplicarMascaraTelefone(): void {
    const valor = this.novaUnidade.telefone || '';
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (!digitos) {
      this.novaUnidade.telefone = '';
      return;
    }
    const ddd = digitos.slice(0, 2);
    const parteUm = digitos.length > 10 ? digitos.slice(2, 7) : digitos.slice(2, 6);
    const parteDois = digitos.length > 10 ? digitos.slice(7, 11) : digitos.slice(6, 10);
    const numeroFormatado = parteDois
      ? `(${ddd}) ${parteUm}-${parteDois}`
      : `(${ddd}) ${parteUm}`;
    this.novaUnidade.telefone = numeroFormatado;
  }

  validarEmailUnidade(): boolean {
    const email = this.novaUnidade.emailUnidade?.trim();
    if (!email) {
      return true;
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      this.mostrarErro('Informe um e-mail valido para a unidade.');
      return false;
    }
    return true;
  }

  private obterNomeUnidadeFormatado(valor: string): string {
    const valorSemEspacoInicial = valor.replace(/^\s+/, '');
    if (!valorSemEspacoInicial) {
      return 'ASA';
    }
    const valorSemPrefixo = valorSemEspacoInicial.toUpperCase().startsWith('ASA')
      ? valorSemEspacoInicial.slice(3)
      : valorSemEspacoInicial;
    const nomeFormatado = this.formatarTituloPreservandoEspacos(valorSemPrefixo);
    const nomeSemEspacoInicial = nomeFormatado.replace(/^\s+/, '');
    return nomeSemEspacoInicial ? `ASA ${nomeSemEspacoInicial}` : 'ASA';
  }

  private aplicarValorFormatado(
    elemento: HTMLInputElement | HTMLTextAreaElement,
    valorFormatado: string
  ): void {
    if (elemento.value === valorFormatado) {
      return;
    }
    const posicaoCursor = elemento.selectionStart ?? elemento.value.length;
    const distanciaFim = elemento.value.length - posicaoCursor;
    elemento.value = valorFormatado;
    const novaPosicao = Math.max(valorFormatado.length - distanciaFim, 0);
    elemento.setSelectionRange(novaPosicao, novaPosicao);
  }

  private formatarTituloPreservandoEspacos(valor: string): string {
    return valor
      .split(/(\s+)/)
      .map(parte => {
        if (/^\s+$/.test(parte)) {
          return parte;
        }
        const texto = parte.toLowerCase();
        return texto.charAt(0).toUpperCase() + texto.slice(1);
      })
      .join('');
  }

  abrirLocalizacao(): void {
    const partesEndereco = [
      this.novaUnidade.enderecoCompleto,
      this.novaUnidade.bairro,
      this.novaUnidade.cidade
    ].filter(Boolean);

    if (partesEndereco.length === 0) {
      this.mostrarErro('Informe o endereco antes de abrir o mapa.');
      return;
    }

    const endereco = encodeURIComponent(partesEndereco.join(', '));
    window.open(`https://www.google.com/maps/search/?api=1&query=${endereco}`, '_blank');
  }

  mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.exibirErro = true;
  }

  fecharErro(): void {
    this.exibirErro = false;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
  }

  aplicarFiltro(): void {
    if (!this.filtroAtivo) {
      this.unidadesFiltradas = [...this.unidades];
      return;
    }

    if (this.filtroAtivo === 'pendencias') {
      this.unidadesFiltradas = this.unidades.filter(unidade =>
        !unidade.telefone || !unidade.emailUnidade || !unidade.bairro || !unidade.enderecoCompleto
      );
      return;
    }

    if (this.filtroAtivo === 'desatualizadas') {
      this.unidadesFiltradas = this.unidades.filter(unidade =>
        !unidade.enderecoCompleto || !unidade.emailUnidade
      );
      return;
    }

    this.unidadesFiltradas = [...this.unidades];
  }

  alternarFiltroBusca(): void {
    this.mostrarFiltroBusca = !this.mostrarFiltroBusca;
  }

  aplicarBusca(): void {
    const termoNormalizado = this.normalizarTexto(this.termoBusca);
    if (!termoNormalizado) {
      return;
    }

    this.unidadesFiltradas = this.unidadesFiltradas.filter(unidade => {
      switch (this.filtroBusca) {
        case 'unidade':
          return this.normalizarTexto(unidade.nomeUnidade).includes(termoNormalizado);
        case 'bairro':
          return this.normalizarTexto(unidade.bairro).includes(termoNormalizado);
        case 'cidade':
          return this.normalizarTexto(unidade.cidade).includes(termoNormalizado);
        case 'regiao':
          return this.normalizarTexto(unidade.regiao).includes(termoNormalizado);
        case 'distrito':
          return this.normalizarTexto(unidade.distrito).includes(termoNormalizado);
        case 'status':
          return this.normalizarTexto(this.obterStatusUnidade(unidade)).includes(termoNormalizado);
        case 'anoEleicao':
          return String(unidade.anoEleicao || '').includes(termoNormalizado);
        default:
          return this.normalizarTexto(
            [
              unidade.nomeUnidade,
              unidade.diretor,
              unidade.telefone,
              unidade.bairro,
              unidade.cidade,
              unidade.regiao,
              unidade.distrito,
              unidade.emailUnidade
            ].filter(Boolean).join(' ')
          ).includes(termoNormalizado);
      }
    });
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.filtroBusca = 'geral';
    this.aplicarFiltro();
  }

  private normalizarTexto(valor?: string | null): string {
    return (valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
