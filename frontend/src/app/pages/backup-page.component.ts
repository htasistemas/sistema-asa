import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackupService } from '../services/backup.service';

@Component({
  selector: 'app-backup-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup-page.component.html',
  styleUrls: ['./backup-page.component.css']
})
export class BackupPageComponent {
  carregandoBackup = false;
  carregandoRestauracao = false;
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  arquivoSelecionado: File | null = null;

  constructor(private backupService: BackupService) {}

  selecionarArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement | null;
    const arquivo = input?.files?.[0] || null;
    this.arquivoSelecionado = arquivo;
  }

  baixarBackup(): void {
    this.limparMensagem();
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
        this.definirMensagem('Backup gerado com sucesso.', 'sucesso');
      },
      error: () => {
        this.carregandoBackup = false;
        this.definirMensagem('Nao foi possivel gerar o backup.', 'erro');
      }
    });
  }

  restaurarBackup(): void {
    this.limparMensagem();
    if (!this.arquivoSelecionado) {
      this.definirMensagem('Selecione um arquivo de backup para restaurar.', 'erro');
      return;
    }
    this.carregandoRestauracao = true;
    this.backupService.restaurarBackup(this.arquivoSelecionado).subscribe({
      next: resposta => {
        this.carregandoRestauracao = false;
        this.definirMensagem(resposta.mensagem || 'Backup restaurado com sucesso.', 'sucesso');
      },
      error: () => {
        this.carregandoRestauracao = false;
        this.definirMensagem('Nao foi possivel restaurar o backup.', 'erro');
      }
    });
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

  private definirMensagem(mensagem: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
  }

  private limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
}
