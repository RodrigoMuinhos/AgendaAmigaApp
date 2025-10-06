import { DomainEvent } from "../events/DomainEvent";
import { ShareLinkAcessado } from "../events/ShareLinkAcessado";
import { ShareLinkGerado } from "../events/ShareLinkGerado";
import { EscopoCompartilhamento, TipoRecursoCompartilhado } from "../specifications/EscopoCompartilhamento";
import { Clock } from "../gateways/Clock";
import { Periodo } from "../value-objects/Periodo";
import { TokenShare } from "../value-objects/TokenShare";

export interface ShareLinkProps {
  readonly id: string;
  readonly tutorId: string;
  readonly token: TokenShare;
  readonly escopo: EscopoCompartilhamento;
  readonly expiracao: Date;
  readonly criadoEm?: Date;
  readonly revogado?: boolean;
}

export interface ShareLinkSnapshot {
  readonly id: string;
  readonly tutorId: string;
  readonly token: string;
  readonly expiracao: string;
  readonly revogado: boolean;
  readonly escopo: Record<string, string[] | "*">;
  readonly criadoEm: string;
}

export class ShareLink {
  private readonly id: string;
  private readonly tutorId: string;
  private readonly token: TokenShare;
  private readonly escopo: EscopoCompartilhamento;
  private expiracao: Date;
  private revogado: boolean;
  private readonly criadoEm: Date;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(props: ShareLinkProps) {
    this.id = props.id;
    this.tutorId = props.tutorId;
    this.token = props.token;
    this.escopo = props.escopo.clonar();
    this.expiracao = new Date(props.expiracao);
    this.revogado = props.revogado ?? false;
    this.criadoEm = props.criadoEm ? new Date(props.criadoEm) : new Date();
  }

  static criar(props: ShareLinkProps, clock: Clock): ShareLink {
    const id = props.id.trim();
    const tutorId = props.tutorId.trim();
    const expiracao = new Date(props.expiracao);

    if (!id) {
      throw new Error("ShareLink requer identificador");
    }

    if (!tutorId) {
      throw new Error("ShareLink requer tutorId");
    }

    if (Number.isNaN(expiracao.getTime())) {
      throw new Error("ShareLink requer expiracao valida");
    }

    if (expiracao.getTime() <= clock.nowUTC().getTime()) {
      throw new Error("ShareLink deve expirar no futuro");
    }

    if (props.escopo.estaVazio()) {
      throw new Error("ShareLink requer escopo nao vazio");
    }

    const instancia = new ShareLink({ ...props, id, tutorId, expiracao });
    instancia.domainEvents.push(new ShareLinkGerado({
      shareLinkId: id,
      tutorId,
      token: props.token.getValue(),
      expiracao,
    }));
    return instancia;
  }

  renovar(novaExpiracao: Date, clock: Clock) {
    if (this.revogado) {
      throw new Error("Nao e possivel renovar link revogado");
    }

    if (novaExpiracao.getTime() <= clock.nowUTC().getTime()) {
      throw new Error("Nova expiracao deve estar no futuro");
    }

    if (novaExpiracao.getTime() <= this.expiracao.getTime()) {
      throw new Error("Nova expiracao deve ser posterior a atual");
    }

    this.expiracao = new Date(novaExpiracao);
  }

  revogar() {
    this.revogado = true;
  }

  incluiNoEscopo(tipo: TipoRecursoCompartilhado, identificadores?: string[]) {
    this.escopo.incluir(tipo, identificadores);

    if (this.escopo.estaVazio()) {
      throw new Error("ShareLink nao pode ter escopo vazio");
    }
  }

  registrarAcesso(clock: Clock, metadata?: { requestId?: string }) {
    this.domainEvents.push(
      new ShareLinkAcessado({
        shareLinkId: this.id,
        tutorId: this.tutorId,
        token: this.token.getValue(),
        ocorridoEm: clock.nowUTC(),
        requestId: metadata?.requestId,
      })
    );
  }

  estaValido(clock: Clock): boolean {
    if (this.revogado) {
      return false;
    }

    return this.expiracao.getTime() > clock.nowUTC().getTime();
  }

  get snapshot(): ShareLinkSnapshot {
    return {
      id: this.id,
      tutorId: this.tutorId,
      token: this.token.getValue(),
      expiracao: this.expiracao.toISOString(),
      revogado: this.revogado,
      escopo: this.escopo.snapshot(),
      criadoEm: this.criadoEm.toISOString(),
    };
  }

  pullDomainEvents(): DomainEvent[] {
    const eventos = [...this.domainEvents];
    this.domainEvents.length = 0;
    return eventos;
  }
}
