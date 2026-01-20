import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Unidade, UnidadeService } from '../services/unidade.service';

type LeafletTipo = any;

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="paginaMapa">
    <div class="topoPagina">
      <div class="linhaTopo">
        <span class="identificadorModulo">Operacional</span>
        <div class="blocoTituloDireito">
          <p class="comentarioDidatico">Visualize todas as unidades cadastradas no mapa.</p>
          <p class="subtituloPagina">Mapa geral com pins por endereco.</p>
        </div>
      </div>
      <h2 class="tituloPagina">Mapa Geral</h2>
    </div>

    <div class="cartaoFormulario">
      <div class="cabecalhoCartao">
        <h3 class="tituloSecao">Unidades no mapa</h3>
        <span class="badge">{{ unidadesFiltradas.length }} unidades</span>
      </div>
      <div class="resumoMapa">
        <div class="blocoResumo">
          <span class="rotuloResumo">Carregadas</span>
          <strong class="numeroResumo">{{ unidadesFiltradas.length }}</strong>
        </div>
        <div class="blocoResumo">
          <span class="rotuloResumo">Com endereco</span>
          <strong class="numeroResumo">{{ totalComEndereco }}</strong>
        </div>
        <div class="blocoResumo">
          <span class="rotuloResumo">Sem endereco</span>
          <strong class="numeroResumo">{{ totalSemEndereco }}</strong>
        </div>
        <div class="blocoResumo blocoResumoIncompleto">
          <span class="rotuloResumo">Incompletas</span>
          <strong class="numeroResumo">{{ totalIncompletas }}</strong>
        </div>
      </div>
    </div>

    <div class="cartaoTabela">
      <div class="cabecalhoCartao">
        <h3 class="tituloSecao">Mapa geral</h3>
        <div class="filtrosMapa">
          <input
            type="text"
            class="campoTexto campoFiltro"
            placeholder="Buscar por unidade ou cidade"
            [(ngModel)]="filtroTexto"
            (input)="aplicarFiltro()"
          />
          <button type="button" class="botaoAcao botaoSecundario" (click)="aplicarFiltro()">
            Filtrar
          </button>
        </div>
      </div>
      <div class="mapaWrapper">
        <div #mapaContainer class="mapaContainer" aria-label="Mapa das unidades"></div>
        <div class="listaUnidades">
          <div *ngFor="let unidade of unidadesFiltradas" class="itemUnidade" (click)="focarUnidade(unidade)">
            <div class="tituloUnidade">{{ unidade.nomeUnidade }}</div>
            <div class="detalhesUnidade">{{ montarEndereco(unidade) || 'Endereco nao informado' }}</div>
          </div>
          <div *ngIf="unidadesFiltradas.length === 0" class="estadoVazio">
            Nenhuma unidade encontrada com o filtro informado.
          </div>
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
    .paginaMapa {
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
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .identificadorModulo {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7b857b;
    }

    .blocoTituloDireito {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .comentarioDidatico {
      margin: 0;
      font-size: 12px;
      color: #1f5b34;
      background-color: #e7f6ed;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
      display: inline-flex;
      align-self: flex-end;
    }

    .subtituloPagina {
      margin: 0;
      color: #5f6b5f;
    }

    .tituloPagina {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
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

    .botaoPrimario {
      background-color: #2f7a45;
      color: #ffffff;
      border-color: #2f7a45;
    }

    .botaoPerigo {
      border-color: #dc2626;
      color: #dc2626;
    }

    .botaoSecundario {
      background-color: #f2f6f2;
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

    .badge {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background-color: #e5efe7;
      color: #1f5b34;
    }

    .resumoMapa {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }

    .blocoResumo {
      border: 1px solid #e4e8e4;
      border-radius: 12px;
      padding: 12px;
      background-color: #f9faf9;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      text-align: center;
    }

    .rotuloResumo {
      font-size: 12px;
      color: #7b857b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .numeroResumo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
    }

    .blocoResumoIncompleto {
      border-color: #f5c27a;
      background-color: #fff4db;
      color: #92400e;
    }

    .filtrosMapa {
      display: inline-flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
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

    .campoFiltro {
      min-width: 240px;
    }

    .mapaWrapper {
      display: grid;
      grid-template-columns: minmax(280px, 2fr) minmax(220px, 1fr);
      gap: 16px;
    }

    .mapaContainer {
      min-height: 420px;
      border-radius: 16px;
      border: 1px solid #e4e8e4;
      background: linear-gradient(135deg, #f2f6f2, #ffffff);
    }

    .listaUnidades {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 420px;
      overflow-y: auto;
    }

    .itemUnidade {
      border: 1px solid #e4e8e4;
      border-radius: 12px;
      padding: 10px 12px;
      background-color: #f9faf9;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tituloUnidade {
      font-weight: 700;
      font-size: 14px;
    }

    .detalhesUnidade {
      font-size: 12px;
      color: #6b776b;
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

      .blocoTituloDireito {
        text-align: left;
      }

      .barraAcoes {
        flex-direction: column;
        align-items: stretch;
      }

      .mapaWrapper {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MapPageComponent implements OnInit, AfterViewInit {
  @ViewChild('mapaContainer') mapaContainer?: ElementRef<HTMLDivElement>;

  unidades: Unidade[] = [];
  unidadesFiltradas: Unidade[] = [];
  filtroTexto = '';
  totalComEndereco = 0;
  totalSemEndereco = 0;
  totalIncompletas = 0;
  mensagemErro = '';
  exibirErro = false;

  private leaflet?: LeafletTipo;
  private mapa?: any;
  private grupoMarcadores?: any;

  constructor(
    private unidadeService: UnidadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscarUnidades();
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.carregarLeaflet();
      this.inicializarMapa();
    } catch {
      this.mostrarErro('Nao foi possivel carregar o mapa.');
    }
  }

  buscarUnidades(): void {
    this.unidadeService.listar().subscribe({
      next: unidades => {
        this.unidades = unidades;
        this.aplicarFiltro();
        this.atualizarContadores();
        this.atualizarMarcadores();
      },
      error: () => this.mostrarErro('Nao foi possivel carregar as unidades.')
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtroTexto.trim().toLowerCase();
    this.unidadesFiltradas = this.unidades.filter(unidade => {
      if (!texto) {
        return true;
      }
      return unidade.nomeUnidade.toLowerCase().includes(texto)
        || (unidade.cidade || '').toLowerCase().includes(texto);
    });
    this.atualizarContadores();
    this.atualizarMarcadores();
  }

  atualizarContadores(): void {
    this.totalComEndereco = this.unidadesFiltradas.filter(unidade => this.montarEndereco(unidade)).length;
    this.totalSemEndereco = this.unidadesFiltradas.length - this.totalComEndereco;
    this.totalIncompletas = this.unidadesFiltradas.filter(unidade => this.unidadeIncompleta(unidade)).length;
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

  async atualizarMarcadores(): Promise<void> {
    if (!this.mapa || !this.leaflet) {
      return;
    }
    this.removerMarcadores();
    this.grupoMarcadores = this.leaflet.layerGroup().addTo(this.mapa);

    const pontos: Array<[number, number]> = [];
    for (const unidade of this.unidadesFiltradas) {
      const endereco = this.montarEndereco(unidade);
      if (!endereco) {
        continue;
      }
      const coordenadas = await this.geocodificarEndereco(endereco);
      if (!coordenadas) {
        continue;
      }
      const marcador = this.leaflet.marker(coordenadas).bindPopup(
        `<strong>${unidade.nomeUnidade}</strong><br/>Diretor: <strong>${unidade.diretor || 'Nao informado'}</strong><br/>${endereco}`
      );
      this.grupoMarcadores.addLayer(marcador);
      pontos.push(coordenadas);
    }

    if (pontos.length > 0) {
      const bounds = this.leaflet.latLngBounds(pontos);
      this.mapa.fitBounds(bounds, { padding: [24, 24] });
    }
  }

  removerMarcadores(): void {
    if (this.grupoMarcadores) {
      this.grupoMarcadores.clearLayers();
    }
  }

  centralizarMapa(): void {
    if (this.mapa) {
      this.mapa.setView([-14.235, -51.9253], 4);
    }
  }

  limparFiltros(): void {
    this.filtroTexto = '';
    this.aplicarFiltro();
    this.atualizarMarcadores();
  }

  imprimirMapa(): void {
    window.print();
  }

  fecharTela(): void {
    this.router.navigate(['/dashboard']);
  }

  focarUnidade(unidade: Unidade): void {
    const endereco = this.montarEndereco(unidade);
    if (!endereco) {
      this.mostrarErro('Endereco nao informado para esta unidade.');
      return;
    }
    this.geocodificarEndereco(endereco).then(coordenadas => {
      if (coordenadas && this.mapa) {
        this.mapa.setView(coordenadas, 14);
      }
    }).catch(() => {
      this.mostrarErro('Nao foi possivel localizar o endereco informado.');
    });
  }

  montarEndereco(unidade: Unidade): string {
    return [unidade.enderecoCompleto, unidade.bairro, unidade.cidade]
      .filter(parte => !!parte)
      .join(', ');
  }

  private async carregarLeaflet(): Promise<void> {
    if (this.leaflet) {
      return;
    }
    const existente = document.getElementById('leaflet-script');
    if (!existente) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject();
      });
    }
    this.leaflet = (window as typeof window & { L?: LeafletTipo }).L;
  }

  private inicializarMapa(): void {
    if (!this.mapaContainer?.nativeElement || !this.leaflet) {
      return;
    }
    this.mapa = this.leaflet.map(this.mapaContainer.nativeElement).setView([-14.235, -51.9253], 4);
    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapa);
    this.atualizarMarcadores();
  }

  private async geocodificarEndereco(endereco: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    try {
      const resposta = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
      if (!resposta.ok) {
        return null;
      }
      const dados = await resposta.json() as Array<{ lat: string; lon: string }>;
      if (!dados.length) {
        return null;
      }
      return [Number(dados[0].lat), Number(dados[0].lon)];
    } catch {
      return null;
    }
  }

  mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.exibirErro = true;
  }

  fecharErro(): void {
    this.exibirErro = false;
  }
}
