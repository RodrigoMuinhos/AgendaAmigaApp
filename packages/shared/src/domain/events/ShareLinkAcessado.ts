import { DomainEvent } from "./DomainEvent";

export interface ShareLinkAcessadoPayload {
  readonly shareLinkId: string;
  readonly tutorId: string;
  readonly token: string;
  readonly ocorridoEm: Date;
  readonly requestId?: string;
}

export class ShareLinkAcessado implements DomainEvent {
  readonly name = "ShareLinkAcessado";
  readonly occurredAt: Date;
  readonly shareLinkId: string;
  readonly tutorId: string;
  readonly token: string;
  readonly requestId?: string;

  constructor(payload: ShareLinkAcessadoPayload) {
    this.shareLinkId = payload.shareLinkId;
    this.tutorId = payload.tutorId;
    this.token = payload.token;
    this.requestId = payload.requestId;
    this.occurredAt = new Date(payload.ocorridoEm);
  }
}
