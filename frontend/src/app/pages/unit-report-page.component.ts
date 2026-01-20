import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnidadeService, Unidade } from '../services/unidade.service';

@Component({
  selector: 'app-unit-report-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
    <div class="cabecalhoImpressao">
      <div class="flex items-start">
        <img class="logoImpressao" src="assets/logo.jpg" alt="ASA" />
        <div>
          <h1 class="tituloImpressao">Sistema ASA - Relatorio de Unidades</h1>
          <div class="metaImpressao">Listagem de unidades</div>
        </div>
      </div>
      <div class="metaImpressao">Emissao: {{ dataImpressao | date:'dd/MM/yyyy HH:mm' }}</div>
    </div>
    <h2 class="text-2xl font-bold dark:text-white mb-3">Relatorio de Unidades</h2>
    <div class="barraAcoes barraAcoesDireita mb-4">
      <button type="button" class="botaoAcao" (click)="novoCadastro()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </span>
        <span>Novo</span>
      </button>
      <button type="button" class="botaoAcao botaoPrimario" disabled>
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M5 5h12l2 2v12H5z"></path>
            <path d="M8 5v6h8V5"></path>
            <path d="M8 19v-6h8v6"></path>
          </svg>
        </span>
        <span>Salvar</span>
      </button>
      <button type="button" class="botaoAcao" (click)="buscar()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6"></circle>
            <path d="M20 20l-3-3"></path>
          </svg>
        </span>
        <span>Buscar</span>
      </button>
      <button type="button" class="botaoAcao" (click)="editarUnidadeSelecionada()" [disabled]="!unidadeSelecionada">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M4 20l4-1 9-9-3-3-9 9-1 4z"></path>
            <path d="M13 6l3 3"></path>
          </svg>
        </span>
        <span>Editar</span>
      </button>
      <button type="button" class="botaoAcao" (click)="imprimirRelatorio()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M7 7h10v4H7z"></path>
            <path d="M7 17h10v-4H7z"></path>
            <path d="M5 9V5h14v4"></path>
            <path d="M5 15v4h14v-4"></path>
          </svg>
        </span>
        <span>Imprimir</span>
      </button>
      <button type="button" class="botaoAcao botaoPerigo" (click)="excluirUnidadeSelecionada()" [disabled]="!unidadeSelecionada">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M4 7h16"></path>
            <path d="M9 7V5h6v2"></path>
            <path d="M7 7l1 12h8l1-12"></path>
            <path d="M10 11v6M14 11v6"></path>
          </svg>
        </span>
        <span>Excluir</span>
      </button>
    </div>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b">
          <th class="py-2 text-left">Unidade</th>
          <th class="py-2 text-left">Cidade/Bairro</th>
          <th class="py-2 text-left">Diretor</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of units" class="border-b" (click)="selecionarUnidade(u)" [class.linhaSelecionada]="unidadeSelecionada?.id === u.id">
          <td class="py-2">{{ u.nomeUnidade }}</td>
          <td class="py-2">{{ u.cidade }} / {{ u.bairro || '-' }}</td>
          <td class="py-2">{{ u.diretor }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div *ngIf="exibirErro" class="popupErro" role="alert">
    <div class="conteudoErro">
      <p class="mensagemErro">{{ mensagemErro }}</p>
      <button type="button" class="botaoAcao botaoPrimario" (click)="fecharErro()">Fechar</button>
    </div>
  </div>
  <div class="rodapeImpressao">
    Responsavel: ____________________________ | Sistema de Gestao ASA
  </div>
  `
})
export class UnitReportPageComponent implements OnInit {
  dataImpressao = new Date();
  units: Unidade[] = [];
  unidadeSelecionada: Unidade | null = null;
  mensagemErro = '';
  exibirErro = false;

  constructor(
    private unidadeService: UnidadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.unidadeService.listar().subscribe(units => this.units = units);
  }

  novoCadastro(): void {
    this.router.navigate(['/units']);
  }

  selecionarUnidade(unidade: Unidade): void {
    this.unidadeSelecionada = unidade;
  }

  editarUnidadeSelecionada(): void {
    if (!this.unidadeSelecionada?.id) {
      this.mostrarErro('Selecione uma unidade para editar.');
      return;
    }
    this.router.navigate(['/units'], { queryParams: { id: this.unidadeSelecionada.id } });
  }

  excluirUnidadeSelecionada(): void {
    if (!this.unidadeSelecionada?.id) {
      this.mostrarErro('Selecione uma unidade para excluir.');
      return;
    }
    if (!window.confirm('Confirma a exclusao da unidade selecionada?')) {
      return;
    }
    this.unidadeService.excluir(this.unidadeSelecionada.id).subscribe({
      next: () => {
        this.unidadeSelecionada = null;
        this.buscar();
      },
      error: () => this.mostrarErro('Nao foi possivel excluir a unidade.')
    });
  }

  imprimirRelatorio(): void {
    window.print();
  }

  mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.exibirErro = true;
  }

  fecharErro(): void {
    this.exibirErro = false;
  }
}
