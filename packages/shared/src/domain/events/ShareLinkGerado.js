"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareLinkGerado = void 0;
class ShareLinkGerado {
    constructor(payload) {
        this.name = "ShareLinkGerado";
        this.shareLinkId = payload.shareLinkId;
        this.tutorId = payload.tutorId;
        this.token = payload.token;
        this.expiracao = new Date(payload.expiracao);
        this.occurredAt = new Date();
    }
}
exports.ShareLinkGerado = ShareLinkGerado;
