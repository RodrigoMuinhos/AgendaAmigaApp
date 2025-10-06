"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareLink = void 0;
const ShareLinkAcessado_1 = require("../events/ShareLinkAcessado");
const ShareLinkGerado_1 = require("../events/ShareLinkGerado");
class ShareLink {
    constructor(props) {
        this.domainEvents = [];
        this.id = props.id;
        this.tutorId = props.tutorId;
        this.token = props.token;
        this.escopo = props.escopo.clonar();
        this.expiracao = new Date(props.expiracao);
        this.revogado = props.revogado ?? false;
        this.criadoEm = props.criadoEm ? new Date(props.criadoEm) : new Date();
    }
    static criar(props, clock) {
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
        instancia.domainEvents.push(new ShareLinkGerado_1.ShareLinkGerado({
            shareLinkId: id,
            tutorId,
            token: props.token.getValue(),
            expiracao,
        }));
        return instancia;
    }
    renovar(novaExpiracao, clock) {
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
    incluiNoEscopo(tipo, identificadores) {
        this.escopo.incluir(tipo, identificadores);
        if (this.escopo.estaVazio()) {
            throw new Error("ShareLink nao pode ter escopo vazio");
        }
    }
    registrarAcesso(clock, metadata) {
        this.domainEvents.push(new ShareLinkAcessado_1.ShareLinkAcessado({
            shareLinkId: this.id,
            tutorId: this.tutorId,
            token: this.token.getValue(),
            ocorridoEm: clock.nowUTC(),
            requestId: metadata?.requestId,
        }));
    }
    estaValido(clock) {
        if (this.revogado) {
            return false;
        }
        return this.expiracao.getTime() > clock.nowUTC().getTime();
    }
    get snapshot() {
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
    pullDomainEvents() {
        const eventos = [...this.domainEvents];
        this.domainEvents.length = 0;
        return eventos;
    }
}
exports.ShareLink = ShareLink;
