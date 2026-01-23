import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmailService, EmailEnvio, EmailLog } from '../services/email.service';
import { Unidade, UnidadeService } from '../services/unidade.service';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';

@Component({
  selector: 'app-email-unidades-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './email-unidades-page.component.html',
  styleUrls: ['./email-unidades-page.component.css']
})
export class EmailUnidadesPageComponent implements OnInit {
  carregando = false;
  envio: EmailEnvio = this.criarEnvioVazio();
  logs: EmailLog[] = [];
  unidades: Unidade[] = [];
  cidades: string[] = [];
  regioes: string[] = [];
  distritos: string[] = [];
  mensagensErro: string[] = [];

  readonly menuPai = 'Configuracoes';
  readonly titulo = 'Email para Unidades';
  readonly subtitulo = 'Envie comunicados para as unidades com filtros por cidade, regiao e distrito.';
  readonly comentarioDidatico = 'utilize filtros antes de enviar.';

  constructor(
    private emailService: EmailService,
    private unidadeService: UnidadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.emailService.listarLogs().subscribe({
      next: logs => {
        this.logs = logs;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar o historico de emails.'];
      }
    });
    this.unidadeService.listar().subscribe({
      next: unidades => {
        this.unidades = unidades;
        this.cidades = this.extrairUnicos(unidades.map(u => u.cidade));
        this.regioes = this.extrairUnicos(unidades.map(u => u.regiao));
        this.distritos = this.extrairUnicos(unidades.map(u => u.distrito));
      }
    });
  }

  aoBuscar(): void {
    this.carregarDados();
  }

  aoNovo(): void {
    this.envio = this.criarEnvioVazio();
  }

  aoSalvar(): void {
    const builder = new PopupErrorBuilder();
    if (!this.envio.assunto?.trim()) {
      builder.adicionarMensagem('Informe o assunto.');
    }
    if (!this.envio.mensagem?.trim()) {
      builder.adicionarMensagem('Informe a mensagem.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.carregando = true;
    this.emailService.enviarParaUnidades(this.envio).subscribe({
      next: () => {
        this.envio = this.criarEnvioVazio();
        this.carregarDados();
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel enviar o email.'];
      }
    });
  }

  aoCancelar(): void {
    this.envio = this.criarEnvioVazio();
  }

  aoExcluir(): void {}

  aoImprimir(): void {
    window.print();
  }

  aoFechar(): void {
    this.router.navigate(['/configuracoes-gerais']);
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  private criarEnvioVazio(): EmailEnvio {
    return {
      assunto: '',
      mensagem: '',
      cidade: '',
      regiao: '',
      distrito: ''
    };
  }

  private extrairUnicos(valores: Array<string | undefined>): string[] {
    return Array.from(new Set(valores.filter(valor => valor && valor.trim()) as string[]))
      .sort((a, b) => a.localeCompare(b));
  }
}
