import { ShareLink } from "../aggregates/ShareLink";

export interface ShareLinkRepository {
  salvar(shareLink: ShareLink): Promise<void>;
  obterPorToken(token: string): Promise<ShareLink | null>;
  revogar(token: string): Promise<void>;
  registrarAcesso(token: string): Promise<void>;
}
