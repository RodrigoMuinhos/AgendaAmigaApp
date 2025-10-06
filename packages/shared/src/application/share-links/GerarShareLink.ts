import { Clock } from "../../domain/gateways/Clock";
import { DomainEvent } from "../../domain/events/DomainEvent";
import { ShareLink, ShareLinkSnapshot } from "../../domain/aggregates/ShareLink";
import { ShareLinkRepository } from "../../domain/repositories/ShareLinkRepository";
import { EscopoCompartilhamento, TipoRecursoCompartilhado } from "../../domain/specifications/EscopoCompartilhamento";
import { TokenShare } from "../../domain/value-objects/TokenShare";

export interface GerarShareLinkEscopoItem {
  readonly tipo: TipoRecursoCompartilhado;
  readonly identificadores?: string[];
}

export interface GerarShareLinkInput {
  readonly shareLinkId: string;
  readonly tutorId: string;
  readonly token: string;
  readonly expiracao: Date | string;
  readonly escopo: GerarShareLinkEscopoItem[];
}

export interface GerarShareLinkOutput {
  readonly shareLink: ShareLinkSnapshot;
  readonly eventos: DomainEvent[];
}

export class GerarShareLink {
  constructor(private readonly shareLinkRepository: ShareLinkRepository, private readonly clock: Clock) {}

  async execute(input: GerarShareLinkInput): Promise<GerarShareLinkOutput> {
    const shareLinkId = input.shareLinkId.trim();
    const tutorId = input.tutorId.trim();

    if (!shareLinkId) {
      throw new Error("ShareLinkId obrigatorio");
    }

    if (!tutorId) {
      throw new Error("TutorId obrigatorio");
    }

    if (!input.escopo.length) {
      throw new Error("Escopo obrigatorio");
    }

    const token = TokenShare.create(input.token);
    const escopo = this.montarEscopo(input.escopo);
    const expiracao = new Date(input.expiracao);

    const shareLink = ShareLink.criar(
      {
        id: shareLinkId,
        tutorId,
        token,
        escopo,
        expiracao,
      },
      this.clock
    );

    await this.shareLinkRepository.salvar(shareLink);

    const eventos = shareLink.pullDomainEvents();

    return {
      shareLink: shareLink.snapshot,
      eventos,
    };
  }

  private montarEscopo(itens: GerarShareLinkEscopoItem[]): EscopoCompartilhamento {
    const escopo = EscopoCompartilhamento.criarVazio();

    for (const item of itens) {
      escopo.incluir(item.tipo, item.identificadores);
    }

    if (escopo.estaVazio()) {
      throw new Error("Escopo nao pode ficar vazio");
    }

    return escopo;
  }
}
