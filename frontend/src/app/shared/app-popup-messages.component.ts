import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-popup-messages.component.html',
  styleUrls: ['./app-popup-messages.component.css']
})
export class AppPopupMessagesComponent {
  @Input() mensagens: string[] = [];
  @Input() titulo = 'Atenção';
  @Output() fechar = new EventEmitter<void>();

  aoFechar(): void {
    this.fechar.emit();
  }
}
