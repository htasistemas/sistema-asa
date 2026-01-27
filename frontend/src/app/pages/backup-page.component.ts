import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackupLog, BackupService } from '../services/backup.service';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';

@Component({
  selector: 'app-backup-page',
  standalone: true,
  imports: [
    CommonModule,
    AppTelaPadraoComponent,
    AppBarraAcoesCrudComponent,
    AppPopupMessagesComponent
  ],
  templateUrl: './backup-page.component.html',
  styleUrls: ['./backup-page.component.css']
})
export class BackupPageComponent implements OnInit {
  carregando = false;
  carregandoBackup = false;
  carregandoRestauracao = false;
  carregandoTeste = false;
  arquivoSelecionado: File | null = null;
  logs: BackupLog[] = [];
  mensagensErro: string[] = [];

  readonly menuPai = 'Operacional';
  readonly titulo = 'Backup e Restauracao';
  readonly subtitulo = 'Gere backups, teste a restauracao e acompanhe o historico de execucoes.';
  readonly comentarioDidatico = 'sempre teste antes de restaurar em producao.';

  constructor(private backupService: BackupService, private router: Router) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.backupService.listarLogs().subscribe({
      next: logs => {
        this.logs = logs;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar o historico de backups.'];
      }
    });
  }

  selecionarArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement | null;
    const arquivo = input?.files?.[0] || null;
    this.arquivoSelecionado = arquivo;
  }

  aoBuscar(): void {
    this.carregarDados();
  }

  aoNovo(): void {
    this.arquivoSelecionado = null;
  }

  aoSalvar(): void {
    this.carregandoBackup = true;
    this.backupService.baixarBackup().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-asa-${this.gerarData()}.sql`;
        link.click();
        URL.revokeObjectURL(url);
        this.carregandoBackup = false;
        this.carregarDados();
      },
      error: () => {
        this.carregandoBackup = false;
        this.mensagensErro = ['Nao foi possivel gerar o backup.'];
      }
    });
  }

  aoCancelar(): void {
    this.arquivoSelecionado = null;
  }

  aoExcluir(): void {}

  aoImprimir(): void {
    window.print();
  }

  aoFechar(): void {
    this.router.navigate(['/configuracoes-gerais']);
  }

  testarRestauracao(): void {
    const builder = new PopupErrorBuilder();
    if (!this.arquivoSelecionado) {
      builder.adicionarMensagem('Selecione um arquivo de backup para testar a restauracao.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.carregandoTeste = true;
    const arquivo = this.arquivoSelecionado as File;
    this.backupService.testarBackup(arquivo).subscribe({
      next: () => {
        this.carregandoTeste = false;
        this.carregarDados();
      },
      error: () => {
        this.carregandoTeste = false;
        this.mensagensErro = ['Nao foi possivel testar a restauracao do backup.'];
      }
    });
  }

  restaurarBackup(): void {
    const builder = new PopupErrorBuilder();
    if (!this.arquivoSelecionado) {
      builder.adicionarMensagem('Selecione um arquivo de backup para restaurar.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.carregandoRestauracao = true;
    const arquivo = this.arquivoSelecionado as File;
    this.backupService.restaurarBackup(arquivo).subscribe({
      next: () => {
        this.carregandoRestauracao = false;
        this.carregarDados();
      },
      error: () => {
        this.carregandoRestauracao = false;
        this.mensagensErro = ['Nao foi possivel restaurar o backup.'];
      }
    });
  }

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  formatarTamanho(tamanhoBytes?: number): string {
    if (!tamanhoBytes || tamanhoBytes <= 0) {
      return '-';
    }
    if (tamanhoBytes < 1024) {
      return `${tamanhoBytes} B`;
    }
    const tamanhoKb = tamanhoBytes / 1024;
    if (tamanhoKb < 1024) {
      return `${tamanhoKb.toFixed(1)} KB`;
    }
    const tamanhoMb = tamanhoKb / 1024;
    return `${tamanhoMb.toFixed(1)} MB`;
  }

  private gerarData(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    return `${ano}${mes}${dia}-${hora}${minuto}`;
  }
}
