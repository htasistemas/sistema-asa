import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barra-acoes-crud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-barra-acoes-crud.component.html',
  styleUrls: ['./app-barra-acoes-crud.component.css']
})
export class AppBarraAcoesCrudComponent {
  @Input() desabilitarBuscar = false;
  @Input() desabilitarNovo = false;
  @Input() desabilitarSalvar = false;
  @Input() desabilitarCancelar = false;
  @Input() desabilitarExcluir = false;
  @Input() desabilitarImprimir = false;
  @Input() desabilitarFechar = false;

  @Output() buscar = new EventEmitter<void>();
  @Output() novo = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() excluir = new EventEmitter<void>();
  @Output() imprimir = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();
}
