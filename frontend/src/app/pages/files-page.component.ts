import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService, FileResource } from '../services/file.service';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="paginaArquivos">
    <div class="topoPagina">
      <div class="linhaTopo">
        <span class="identificadorModulo">Arquivos</span>
        <p class="subtituloPagina">Gerencie links e informacoes dos arquivos no Google Drive.</p>
      </div>
      <h2 class="tituloPagina">Cadastro de arquivos</h2>
    </div>

    <div class="barraAcoes">
      <button type="button" class="botaoAcao" (click)="iniciarNovoArquivo()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </span>
        <span>Novo</span>
      </button>
      <button type="button" class="botaoAcao botaoPrimario" (click)="salvarArquivo()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M5 5h12l2 2v12H5z"></path>
            <path d="M8 5v6h8V5"></path>
            <path d="M8 19v-6h8v6"></path>
          </svg>
        </span>
        <span>Salvar</span>
      </button>
      <button type="button" class="botaoAcao" (click)="buscarArquivos()">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6"></circle>
            <path d="M20 20l-3-3"></path>
          </svg>
        </span>
        <span>Buscar</span>
      </button>
      <button type="button" class="botaoAcao" [disabled]="!arquivoSelecionado">
        <span class="iconeAcao" aria-hidden="true">
          <svg class="iconeSvg" viewBox="0 0 24 24">
            <path d="M4 20l4-1 9-9-3-3-9 9-1 4z"></path>
            <path d="M13 6l3 3"></path>
          </svg>
        </span>
        <span>Editar</span>
      </button>
      <button type="button" class="botaoAcao" [disabled]="!arquivoSelecionado">
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
      <button type="button" class="botaoAcao botaoPerigo" [disabled]="!arquivoSelecionado" (click)="excluirSelecionado()">
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

    <div class="cartaoFormulario">
      <div class="cabecalhoCartao">
        <h3 class="tituloSecao">Informacoes do arquivo</h3>
        <div class="indicadores">
          <span class="badge">{{ arquivosFiltrados.length }} arquivos</span>
          <span class="badge badgeSecundario">Drive</span>
        </div>
      </div>
      <form class="formularioArquivo">
        <div class="linhaFormulario">
          <label class="rotuloCampo" for="nomeArquivo">Nome do arquivo <span class="campoObrigatorio">*</span></label>
          <input
            id="nomeArquivo"
            name="nomeArquivo"
            type="text"
            class="campoTexto"
            placeholder="Digite o nome do arquivo"
            [(ngModel)]="novoArquivo.name"
            required
          />
        </div>
        <div class="linhaFormulario">
          <label class="rotuloCampo" for="categoriaArquivo">Categoria <span class="campoObrigatorio">*</span></label>
          <select
            id="categoriaArquivo"
            name="categoriaArquivo"
            class="campoTexto"
            [(ngModel)]="novoArquivo.category"
          >
            <option *ngFor="let categoria of categorias" [ngValue]="categoria">{{ categoria }}</option>
          </select>
        </div>
        <div class="linhaFormulario">
          <label class="rotuloCampo" for="dataArquivo">Data do arquivo</label>
          <input
            id="dataArquivo"
            name="dataArquivo"
            type="date"
            class="campoTexto"
            [(ngModel)]="novoArquivo.date"
          />
        </div>
        <div class="linhaFormulario">
          <label class="rotuloCampo" for="linkArquivo">Link do Google Drive <span class="campoObrigatorio">*</span></label>
          <input
            id="linkArquivo"
            name="linkArquivo"
            type="url"
            class="campoTexto"
            placeholder="https://drive.google.com/..."
            [(ngModel)]="novoArquivo.url"
            required
          />
        </div>
      </form>
    </div>

    <div class="cartaoTabela">
      <div class="cabecalhoCartao">
        <h3 class="tituloSecao">Arquivos cadastrados</h3>
        <div class="filtrosArquivo">
          <input
            type="text"
            class="campoTexto campoFiltro"
            placeholder="Buscar por nome ou categoria"
            [(ngModel)]="filtroTexto"
            (input)="aplicarFiltro()"
            name="filtroTexto"
          />
          <select
            class="campoTexto campoFiltro"
            [(ngModel)]="filtroCategoria"
            (change)="aplicarFiltro()"
            name="filtroCategoria"
          >
            <option value="">Todas as categorias</option>
            <option *ngFor="let categoria of categorias" [ngValue]="categoria">{{ categoria }}</option>
          </select>
        </div>
      </div>
      <div class="listaArquivos">
        <div
          *ngFor="let arquivo of arquivosFiltrados"
          class="cartaoArquivo"
          (click)="selecionarArquivo(arquivo)"
          [class.cartaoArquivoSelecionado]="arquivoSelecionado?.id === arquivo.id"
        >
          <div class="cartaoArquivoTopo">
            <div class="infoArquivo">
              <h4 class="nomeArquivo">{{ formatarNomeArquivo(arquivo.name) }}</h4>
            <div class="metaArquivo">
              <span>{{ arquivo.category }}</span>
              <span class="chipTipoArquivo">
                <span class="iconeTipo" [ngSwitch]="obterTipoArquivo(arquivo.url)">
                  <svg *ngSwitchCase="'PDF'" class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h7l4 4v14H7z"></path>
                    <path d="M14 3v5h5"></path>
                  </svg>
                  <svg *ngSwitchCase="'JPG'" class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M7 14l3-3 4 4 3-2 3 3"></path>
                    <circle cx="8" cy="9" r="1.5"></circle>
                  </svg>
                  <svg *ngSwitchCase="'PNG'" class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M7 14l3-3 4 4 3-2 3 3"></path>
                    <circle cx="8" cy="9" r="1.5"></circle>
                  </svg>
                  <svg *ngSwitchCase="'DOC'" class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h7l4 4v14H7z"></path>
                    <path d="M9 12h6"></path>
                    <path d="M9 16h6"></path>
                    <path d="M9 8h3"></path>
                  </svg>
                  <svg *ngSwitchCase="'XLS'" class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M8 4v16"></path>
                    <path d="M13 4v16"></path>
                  </svg>
                  <svg *ngSwitchDefault class="iconeSvg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h7l4 4v14H7z"></path>
                    <path d="M14 3v5h5"></path>
                  </svg>
                </span>
                {{ obterTipoArquivo(arquivo.url) }}
              </span>
              <span *ngIf="arquivo.date">{{ formatarData(arquivo.date) }}</span>
            </div>
            </div>
            <div class="acoesArquivo">
              <span class="badge badgeSuave">Drive</span>
              <a class="botaoAcao botaoAcaoCompacto" [href]="arquivo.url" target="_blank" rel="noopener">
                <span class="iconeAcao" aria-hidden="true">
                  <svg class="iconeSvg" viewBox="0 0 24 24">
                    <path d="M14 3h7v7"></path>
                    <path d="M10 14L21 3"></path>
                    <path d="M5 7v14h14v-5"></path>
                  </svg>
                </span>
                <span>Abrir</span>
              </a>
              <button type="button" class="botaoAcao botaoAcaoCompacto" (click)="copiarLink(arquivo.url); $event.stopPropagation();">
                <span class="iconeAcao" aria-hidden="true">
                  <svg class="iconeSvg" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                    <rect x="3" y="3" width="13" height="13" rx="2"></rect>
                  </svg>
                </span>
                <span>Copiar link</span>
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="arquivosFiltrados.length === 0" class="estadoVazio">
          <p>Nenhum arquivo encontrado. Ajuste os filtros ou cadastre um novo.</p>
        </div>
      </div>
    </div>

    <div *ngIf="exibirErro" class="popupErro" role="alert">
      <div class="conteudoErro">
        <p class="mensagemErro">{{ mensagemErro }}</p>
        <button type="button" class="botaoAcao botaoPrimario" (click)="fecharErro()">Fechar</button>
      </div>
    </div>
  </section>
  `,
  styles: [`
    .paginaArquivos {
      display: flex;
      flex-direction: column;
      gap: 20px;
      color: #1f2a1f;
    }

    .topoPagina {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .linhaTopo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .identificadorModulo {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7b857b;
    }

    .tituloPagina {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .subtituloPagina {
      margin: 0;
      color: #5f6b5f;
      text-align: right;
    }

    .barraAcoes {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .botaoAcao {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #d8ddd8;
      background-color: #ffffff;
      color: #2e3a2e;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    }

    .botaoAcao:hover {
      border-color: #2f7a45;
    }

    .botaoAcao:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: none;
    }

    .botaoPrimario {
      background-color: #2f7a45;
      color: #ffffff;
      border-color: #2f7a45;
    }

    .botaoPerigo {
      border-color: #dc2626;
      color: #dc2626;
    }

    .iconeAcao {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border-radius: 6px;
      background-color: rgba(47, 122, 69, 0.1);
    }

    .iconeSvg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
    }

    .cartaoFormulario,
    .cartaoTabela {
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e1e5e1;
      padding: 20px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
    }

    .cabecalhoCartao {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .tituloSecao {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    .indicadores {
      display: inline-flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background-color: #e5efe7;
      color: #1f5b34;
    }

    .badgeSecundario {
      background-color: #e9eef2;
      color: #355066;
    }

    .badgeSuave {
      background-color: #edf3ed;
      color: #2f7a45;
      font-weight: 600;
    }

    .formularioArquivo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .linhaFormulario {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rotuloCampo {
      font-size: 13px;
      color: #3a463a;
    }

    .campoObrigatorio {
      color: #b91c1c;
    }

    .campoTexto {
      border: 1px solid #d8ddd8;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
    }

    .campoTexto:focus {
      outline: none;
      border-color: #2f7a45;
      box-shadow: 0 0 0 3px rgba(47, 122, 69, 0.15);
    }

    .filtrosArquivo {
      display: inline-flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .campoFiltro {
      min-width: 220px;
    }

    .listaArquivos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .cartaoArquivo {
      border: 1px solid #e4e8e4;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: pointer;
      background: linear-gradient(140deg, #ffffff 20%, #f6faf7 100%);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .cartaoArquivo:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 18px rgba(47, 122, 69, 0.12);
    }

    .cartaoArquivoSelecionado {
      border-color: #2f7a45;
      box-shadow: 0 0 0 2px rgba(47, 122, 69, 0.2);
    }

    .cartaoArquivoTopo {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }

    .infoArquivo {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nomeArquivo {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1f2a1f;
    }

    .metaArquivo {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: #6b776b;
    }

    .chipTipoArquivo {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      background-color: #eef4ef;
      color: #2e3a2e;
      font-weight: 600;
    }

    .iconeTipo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }

    .acoesArquivo {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: nowrap;
      justify-content: flex-end;
    }

    .botaoAcaoCompacto {
      padding: 6px 10px;
      font-size: 12px;
      box-shadow: none;
    }

    .estadoVazio {
      text-align: center;
      color: #7b857b;
      padding: 16px;
    }

    .popupErro {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.35);
      padding: 20px;
    }

    .conteudoErro {
      background-color: #ffffff;
      border-radius: 16px;
      padding: 24px;
      max-width: 360px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mensagemErro {
      margin: 0;
      color: #b91c1c;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .linhaTopo {
        flex-direction: column;
        align-items: flex-start;
      }

      .subtituloPagina {
        text-align: left;
      }

      .barraAcoes {
        flex-direction: column;
        align-items: stretch;
      }

      .acoesArquivo {
        width: 100%;
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 6px;
      }

      .botaoAcaoCompacto {
        flex: 0 0 auto;
      }

    }
  `]
})
export class FilesPageComponent implements OnInit {
  arquivos: FileResource[] = [];
  arquivosFiltrados: FileResource[] = [];
  categorias = ['Documentos', 'Planilhas', 'Relatorios', 'Apresentacoes', 'Manuais', 'Outros'];
  filtroTexto = '';
  filtroCategoria = '';
  arquivoSelecionado: FileResource | null = null;
  novoArquivo: FileResource = { name: '', category: 'Documentos', url: '' };
  mensagemErro = '';
  exibirErro = false;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.fileService.list().subscribe(arquivos => {
      this.arquivos = arquivos;
      this.aplicarFiltro();
    });
  }

  iniciarNovoArquivo(): void {
    this.novoArquivo = { name: '', category: 'Documentos', url: '' };
    this.arquivoSelecionado = null;
  }

  salvarArquivo(): void {
    if (!this.validarArquivo()) {
      return;
    }
    this.fileService.create(this.novoArquivo).subscribe(() => {
      this.iniciarNovoArquivo();
      this.carregar();
    });
  }

  excluirSelecionado(): void {
    if (!this.arquivoSelecionado?.id) {
      return;
    }
    this.excluirArquivo(this.arquivoSelecionado.id);
    this.arquivoSelecionado = null;
  }

  excluirArquivo(id: number): void {
    this.fileService.delete(id).subscribe(() => this.carregar());
  }

  selecionarArquivo(arquivo: FileResource): void {
    this.arquivoSelecionado = arquivo;
    this.novoArquivo = { ...arquivo };
  }

  buscarArquivos(): void {
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    const texto = this.filtroTexto.trim().toLowerCase();
    this.arquivosFiltrados = this.arquivos.filter(arquivo => {
      const combinaTexto = !texto
        || arquivo.name.toLowerCase().includes(texto)
        || arquivo.category.toLowerCase().includes(texto);
      const combinaCategoria = !this.filtroCategoria || arquivo.category === this.filtroCategoria;
      return combinaTexto && combinaCategoria;
    });
  }

  validarArquivo(): boolean {
    if (!this.novoArquivo.name || !this.novoArquivo.category || !this.novoArquivo.url) {
      this.mostrarErro('Preencha todos os campos obrigatorios antes de salvar.');
      return false;
    }
    if (!this.validarLinkDrive(this.novoArquivo.url)) {
      this.mostrarErro('Informe um link valido do Google Drive.');
      return false;
    }
    return true;
  }

  validarLinkDrive(link: string): boolean {
    const linkNormalizado = link.trim().toLowerCase();
    return linkNormalizado.includes('drive.google.com');
  }

  copiarLink(link: string): void {
    if (!navigator.clipboard) {
      this.mostrarErro('Copie manualmente o link do arquivo.');
      return;
    }
    navigator.clipboard.writeText(link).catch(() => {
      this.mostrarErro('Nao foi possivel copiar o link.');
    });
  }

  formatarData(dataTexto: string): string {
    const data = new Date(dataTexto);
    if (Number.isNaN(data.getTime())) {
      return dataTexto;
    }
    return data.toLocaleDateString('pt-BR');
  }

  obterTipoArquivo(link: string): string {
    if (!link) {
      return 'Outro';
    }
    const semQuery = link.split('?')[0];
    const partes = semQuery.split('.');
    if (partes.length < 2) {
      return 'Outro';
    }
    const extensao = partes[partes.length - 1].toLowerCase();
    if (extensao === 'pdf') {
      return 'PDF';
    }
    if (extensao === 'jpg' || extensao === 'jpeg') {
      return 'JPG';
    }
    if (extensao === 'png') {
      return 'PNG';
    }
    if (extensao === 'doc' || extensao === 'docx') {
      return 'DOC';
    }
    if (extensao === 'xls' || extensao === 'xlsx') {
      return 'XLS';
    }
    return extensao.toUpperCase();
  }

  formatarNomeArquivo(nome: string): string {
    if (!nome) {
      return '';
    }
    return nome.replace(/\/file\/d\/[^/]+\/view/gi, '').replace(/\s+/g, ' ').trim();
  }


  mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.exibirErro = true;
  }

  fecharErro(): void {
    this.exibirErro = false;
  }
}
