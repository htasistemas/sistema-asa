import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tela-padrao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-tela-padrao.component.html',
  styleUrls: ['./app-tela-padrao.component.css']
})
export class AppTelaPadraoComponent {
  @Input() menuPai = '';
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() comentarioDidatico = '';
}
