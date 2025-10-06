"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareLinkAcessado = void 0;
class ShareLinkAcessado {
    constructor(payload) {
        this.name = "ShareLinkAcessado";
        this.shareLinkId = payload.shareLinkId;
        this.tutorId = payload.tutorId;
        this.token = payload.token;
        this.requestId = payload.requestId;
        this.occurredAt = new Date(payload.ocorridoEm);
    }
}
exports.ShareLinkAcessado = ShareLinkAcessado;
