import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-dialog.component.html',
  styleUrls: ['./app-dialog.component.css']
})
export class AppDialogComponent {
  @Input() titulo = '';
  @Input() mensagem = '';
  @Input() confirmarTexto = 'Confirmar';
  @Input() cancelarTexto = 'Cancelar';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  aoCancelar(): void {
    this.cancelar.emit();
  }

  aoConfirmar(): void {
    this.confirmar.emit();
  }
}
