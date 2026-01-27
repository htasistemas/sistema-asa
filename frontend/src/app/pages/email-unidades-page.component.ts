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

interface ModeloEmailPredefinido {
  id: string;
  titulo: string;
  assunto: string;
  mensagem: string;
}

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
  modeloSelecionadoId = '';

  readonly menuPai = 'Configuracoes';
  readonly titulo = 'Email para Unidades';
  readonly subtitulo = 'Envie comunicados para as unidades com filtros por cidade, regiao e distrito.';
  readonly comentarioDidatico = 'utilize filtros antes de enviar.';
  readonly modelosEmail: ModeloEmailPredefinido[] = [
    {
      id: 'relatorio-mensal',
      titulo: 'Solicitacao de relatorio mensal',
      assunto: 'ASA - Envio do Relatorio Mensal',
      mensagem:
        'Ola Diretor ASA.\n\n' +
        'Solicitamos o envio do Relatorio Mensal da unidade referente ao periodo vigente.\n\n' +
        'Para abrir e enviar o relatorio, acesse o link:\n' +
        'https://forms.gle/nd3fTrb9x4pVMB9f8\n\n' +
        'Por favor, realizem o envio ate a data combinada.\n\n' +
        'Caso voce ja tenha enviado o relatorio, desconsidere esta mensagem.\n\n' +
        'Atenciosamente,\n' +
        'Coordenacao ASA'
    },
    {
      id: 'prazo-final-relatorio',
      titulo: 'Prazo final para relatorio',
      assunto: 'ASA - Prazo Final do Relatorio Mensal',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Este e um lembrete: o prazo final para envio do Relatorio Mensal esta se aproximando.\n\n' +
        'Por favor, encaminhem o relatorio ate a data limite definida pela coordenacao.\n\n' +
        'Atenciosamente,\n' +
        'Coordenacao ASA'
    },
    {
      id: 'pendencias-unidade',
      titulo: 'Pendencias da unidade',
      assunto: 'ASA - Pendencias da Unidade',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Identificamos pendencias no envio de informacoes da unidade.\n\n' +
        'Por favor, retornem este e-mail com a atualizacao o quanto antes.\n\n' +
        'Atenciosamente,\n' +
        'Coordenacao ASA'
    },
    {
      id: 'whatsapp-exclusivo',
      titulo: 'WhatsApp exclusivo ASA',
      assunto: 'ASA - Uso do WhatsApp Oficial',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Reforcamos que as mensagens enviadas pelo WhatsApp oficial devem ser de uso exclusivo da ASA (comunicados, organizacao e atividades da unidade).\n\n' +
        'Evitem conteudos pessoais, correntes e assuntos fora do contexto ministerial.\n\n' +
        'Obrigado pela colaboracao.\n' +
        'Coordenacao ASA'
    },
    {
      id: 'confirmacao-recebimento',
      titulo: 'Confirmacao de recebimento',
      assunto: 'ASA - Confirmacao de Recebimento',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Por gentileza, confirmem o recebimento desta mensagem com um "OK".\n\n' +
        'Coordenacao ASA'
    },
    {
      id: 'atualizacao-cadastral',
      titulo: 'Atualizacao cadastral',
      assunto: 'ASA - Atualizacao Cadastral da Unidade',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Solicitamos a atualizacao dos dados cadastrais da unidade (responsavel, contato, e-mail e cidade).\n\n' +
        'Respondam este e-mail com os dados atualizados.\n\n' +
        'Coordenacao ASA'
    },
    {
      id: 'envio-evidencias',
      titulo: 'Envio de evidencias das acoes',
      assunto: 'ASA - Envio de Evidencias das Acoes',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Solicitamos o envio de evidencias das acoes realizadas (fotos e breve descricao), para registro e acompanhamento.\n\n' +
        'Obrigado.\n' +
        'Coordenacao ASA'
    },
    {
      id: 'convocacao-reuniao',
      titulo: 'Convocacao para reuniao',
      assunto: 'ASA - Convocacao para Reuniao',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Convocamos os responsaveis da unidade para reuniao de alinhamento.\n\n' +
        'Respondam este e-mail confirmando presenca e disponibilidade.\n\n' +
        'Coordenacao ASA'
    },
    {
      id: 'agradecimento-apoio',
      titulo: 'Agradecimento pelo apoio',
      assunto: 'ASA - Agradecimento pelo Apoio da Unidade',
      mensagem:
        'Ola, equipe ASA.\n\n' +
        'Registramos nosso agradecimento pelo apoio, envolvimento e compromisso da unidade nas acoes recentes.\n\n' +
        'Seguimos juntos no cuidado e servico.\n\n' +
        'Com gratidao,\n' +
        'Coordenacao ASA'
    }
  ];

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
    this.modeloSelecionadoId = '';
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
        this.modeloSelecionadoId = '';
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
    this.modeloSelecionadoId = '';
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

  aoSelecionarModelo(): void {
    if (!this.modeloSelecionadoId) {
      return;
    }
    const modelo = this.modelosEmail.find(item => item.id === this.modeloSelecionadoId);
    if (!modelo) {
      return;
    }
    this.envio = {
      ...this.envio,
      assunto: modelo.assunto,
      mensagem: modelo.mensagem
    };
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
