export class PopupErrorBuilder {
  private mensagens: string[] = [];

  adicionarMensagem(mensagem: string): PopupErrorBuilder {
    if (mensagem && !this.mensagens.includes(mensagem)) {
      this.mensagens.push(mensagem);
    }
    return this;
  }

  temMensagens(): boolean {
    return this.mensagens.length > 0;
  }

  construir(): string[] {
    return [...this.mensagens];
  }
}
