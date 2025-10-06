"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GerarShareLink = void 0;
const ShareLink_1 = require("../../domain/aggregates/ShareLink");
const EscopoCompartilhamento_1 = require("../../domain/specifications/EscopoCompartilhamento");
const TokenShare_1 = require("../../domain/value-objects/TokenShare");
class GerarShareLink {
    constructor(shareLinkRepository, clock) {
        this.shareLinkRepository = shareLinkRepository;
        this.clock = clock;
    }
    async execute(input) {
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
        const token = TokenShare_1.TokenShare.create(input.token);
        const escopo = this.montarEscopo(input.escopo);
        const expiracao = new Date(input.expiracao);
        const shareLink = ShareLink_1.ShareLink.criar({
            id: shareLinkId,
            tutorId,
            token,
            escopo,
            expiracao,
        }, this.clock);
        await this.shareLinkRepository.salvar(shareLink);
        const eventos = shareLink.pullDomainEvents();
        return {
            shareLink: shareLink.snapshot,
            eventos,
        };
    }
    montarEscopo(itens) {
        const escopo = EscopoCompartilhamento_1.EscopoCompartilhamento.criarVazio();
        for (const item of itens) {
            escopo.incluir(item.tipo, item.identificadores);
        }
        if (escopo.estaVazio()) {
            throw new Error("Escopo nao pode ficar vazio");
        }
        return escopo;
    }
}
exports.GerarShareLink = GerarShareLink;
