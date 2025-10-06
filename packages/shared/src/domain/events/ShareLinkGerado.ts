import { DomainEvent } from "./DomainEvent";

export interface ShareLinkGeradoPayload {
  readonly shareLinkId: string;
  readonly tutorId: string;
  readonly token: string;
  readonly expiracao: Date;
}

export class ShareLinkGerado implements DomainEvent {
  readonly name = "ShareLinkGerado";
  readonly occurredAt: Date;
  readonly shareLinkId: string;
  readonly tutorId: string;
  readonly token: string;
  readonly expiracao: Date;

  constructor(payload: ShareLinkGeradoPayload) {
    this.shareLinkId = payload.shareLinkId;
    this.tutorId = payload.tutorId;
    this.token = payload.token;
    this.expiracao = new Date(payload.expiracao);
    this.occurredAt = new Date();
  }
}
