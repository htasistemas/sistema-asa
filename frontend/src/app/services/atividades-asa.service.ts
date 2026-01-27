import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AtividadeAsa {
  id?: number;
  asaIdentificacao: string;
  periodoRelatorio: string;
  diretorNome: string;
  telefoneContato: string;
  possuiInstagram: boolean;
  possuiEmailProprio: boolean;
  possuiUniformeOficial: boolean;
  possuiNovoManualAsa: boolean;
  possuiLivroBeneficenciaSocial: boolean;
  emailOficial?: string;
  acaoVisitaBeneficiarios: boolean;
  acaoRecoltaDonativos: boolean;
  acaoDoacaoSangue: boolean;
  acaoCampanhaAgasalho: boolean;
  acaoFeiraSolidaria: boolean;
  acaoPalestrasEducativas: boolean;
  acaoCursosGeracaoRenda: boolean;
  acaoMutiraoNatal: boolean;
  familiasAtendidas: number;
  cestasBasicas19kg: number;
  pecasRoupasCalcados: number;
  voluntariosAtivos: number;
  estudosBiblicos: number;
  batismosMes: number;
  reuniaoAvaliacaoPlanejamento: boolean;
  assistenciaAlimentos: boolean;
  assistenciaRoupas: boolean;
  assistenciaMoveis: boolean;
  assistenciaLimpezaHigiene: boolean;
  assistenciaConstrucao: boolean;
  assistenciaMaterialEscolar: boolean;
  assistenciaMedicamentos: boolean;
  assistenciaAtendimentoSaude: boolean;
  assistenciaMutiroes: boolean;
  assistenciaOutras?: string;
  desenvolvimentoCapacitacaoProfissional: boolean;
  desenvolvimentoCurriculoOrientacao: boolean;
  desenvolvimentoCursoIdioma: boolean;
  desenvolvimentoCursoInformatica: boolean;
  desenvolvimentoCursosGeracaoRenda: boolean;
  desenvolvimentoAdministracaoFinanceiraLar: boolean;
  desenvolvimentoDeixarFumarBeber: boolean;
  desenvolvimentoPrevencaoDrogas: boolean;
  desenvolvimentoHabitosSaudaveis: boolean;
  desenvolvimentoEducacaoSexual: boolean;
  desenvolvimentoEducacaoFilhos: boolean;
  desenvolvimentoAproveitamentoAlimentos: boolean;
  desenvolvimentoAlfabetizacaoAdultos: boolean;
  desenvolvimentoOutras?: string;
  avaliacaoRelatorio: number;
}

export interface ImportacaoAtividadeResposta {
  totalLinhas: number;
  importados: number;
  atualizados: number;
  ignorados: number;
  ignoradosDuplicidade: number;
  mensagens: string[];
}

@Injectable({ providedIn: 'root' })
export class AtividadesAsaService {
  private apiUrl = 'http://localhost:8080/api/atividades-asa';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listar(): Observable<AtividadeAsa[]> {
    return this.http.get<AtividadeAsa[]>(this.apiUrl, this.obterOpcoesAutorizacao());
  }

  criar(atividade: AtividadeAsa): Observable<AtividadeAsa> {
    return this.http.post<AtividadeAsa>(this.apiUrl, atividade, this.obterOpcoesAutorizacao());
  }

  atualizar(atividade: AtividadeAsa): Observable<AtividadeAsa> {
    return this.http.put<AtividadeAsa>(`${this.apiUrl}/${atividade.id}`, atividade, this.obterOpcoesAutorizacao());
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.obterOpcoesAutorizacao());
  }

  importarGoogleForms(arquivo: File, periodoRelatorio: string): Observable<ImportacaoAtividadeResposta> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('periodoRelatorio', periodoRelatorio);
    return this.http.post<ImportacaoAtividadeResposta>(
      `${this.apiUrl}/importacao-google-forms`,
      formData,
      this.obterOpcoesAutorizacao()
    );
  }

  private obterOpcoesAutorizacao(): { headers?: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) {
      return {};
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
