import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppTelaPadraoComponent } from '../shared/app-tela-padrao.component';
import { AppBarraAcoesCrudComponent } from '../shared/app-barra-acoes-crud.component';
import { AppPopupMessagesComponent } from '../shared/app-popup-messages.component';
import { PopupErrorBuilder } from '../shared/popup-error.builder';
import { ConfiguracaoGeral, ConfiguracoesGeraisService } from '../services/configuracoes-gerais.service';

@Component({
  selector: 'app-configuracoes-gerais-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppTelaPadraoComponent, AppBarraAcoesCrudComponent, AppPopupMessagesComponent],
  templateUrl: './configuracoes-gerais-page.component.html',
  styleUrls: ['./configuracoes-gerais-page.component.css']
})
export class ConfiguracoesGeraisPageComponent implements OnInit {
  readonly menuPai = 'Configuracoes';
  readonly titulo = 'Configuracoes Gerais';
  readonly subtitulo = 'Controle de versao e historico de alteracoes do sistema.';
  readonly comentarioDidatico = 'registre versao, data/hora e mudancas.';

  versaoAtual = '1.00.0';
  historicoVersoes: ConfiguracaoGeral[] = [];
  novaVersao: ConfiguracaoGeral = this.criarRegistroVazio();
  mensagensErro: string[] = [];
  carregando = false;

  constructor(private configuracoesGeraisService: ConfiguracoesGeraisService) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  aoBuscar(): void {
    this.carregarHistorico();
  }

  aoNovo(): void {
    this.novaVersao = this.criarRegistroVazio();
  }

  aoSalvar(): void {
    const builder = new PopupErrorBuilder();
    if (!this.novaVersao.versao.trim()) {
      builder.adicionarMensagem('Informe a versao no formato 1.00.0.');
    } else if (!this.validarFormatoVersao(this.novaVersao.versao)) {
      builder.adicionarMensagem('Formato de versao invalido. Use 1.00.0.');
    } else if (!this.validarSequencia(this.novaVersao.versao)) {
      builder.adicionarMensagem('A versao deve incrementar apenas o ultimo grupo.');
    }
    if (!this.novaVersao.dataHora.trim()) {
      builder.adicionarMensagem('Informe a data e hora.');
    }
    if (!this.novaVersao.mudancas.trim()) {
      builder.adicionarMensagem('Informe as mudancas.');
    }
    if (builder.temMensagens()) {
      this.mensagensErro = builder.construir();
      return;
    }

    this.configuracoesGeraisService.criar(this.novaVersao).subscribe({
      next: () => {
        this.novaVersao = this.criarRegistroVazio();
        this.carregarHistorico();
      },
      error: () => {
        this.mensagensErro = ['Nao foi possivel salvar a versao.'];
      }
    });
  }

  aoCancelar(): void {
    this.novaVersao = this.criarRegistroVazio();
  }

  aoExcluir(): void {
    if (this.historicoVersoes.length === 0) {
      this.mensagensErro = ['Nao ha registros para excluir.'];
      return;
    }
    const registro = this.historicoVersoes[0];
    if (!registro.id) {
      this.mensagensErro = ['Nao foi possivel excluir o registro.'];
      return;
    }
    this.configuracoesGeraisService.excluir(registro.id).subscribe({
      next: () => this.carregarHistorico(),
      error: () => {
        this.mensagensErro = ['Nao foi possivel excluir o registro.'];
      }
    });
  }

  aoImprimir(): void {
    window.print();
  }

  aoFechar(): void {}

  limparMensagens(): void {
    this.mensagensErro = [];
  }

  definirDataHoraAtual(): void {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.novaVersao.dataHora = `${data} ${hora}`;
  }

  private carregarHistorico(): void {
    this.carregando = true;
    this.configuracoesGeraisService.listar().subscribe({
      next: historico => {
        this.historicoVersoes = historico;
        this.versaoAtual = this.historicoVersoes[0]?.versao || '1.00.0';
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mensagensErro = ['Nao foi possivel carregar o historico.'];
      }
    });
  }

  private validarFormatoVersao(versao: string): boolean {
    return /^\d+\.\d{2}\.\d+$/.test(versao);
  }

  private validarSequencia(versao: string): boolean {
    const ultima = this.historicoVersoes[0]?.versao;
    if (!ultima) {
      return true;
    }
    const partesNova = versao.split('.').map(Number);
    const partesUltima = ultima.split('.').map(Number);
    if (partesNova.length !== 3 || partesUltima.length !== 3) {
      return false;
    }
    return partesNova[0] === partesUltima[0]
      && partesNova[1] === partesUltima[1]
      && partesNova[2] === partesUltima[2] + 1;
  }

  private criarRegistroVazio(): ConfiguracaoGeral {
    return {
      versao: '',
      dataHora: '',
      mudancas: ''
    };
  }
}
