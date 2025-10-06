import { ShareLink, ShareLinkRepository, ShareLinkSnapshot } from "@agenda-amiga/shared";
import { query } from "../database";
import { mapShareLinkRowToDomain, ShareLinkRow } from "./mappers";

export class PostgresShareLinkRepository implements ShareLinkRepository {
  async salvar(shareLink: ShareLink): Promise<void> {
    const snapshot = shareLink.snapshot;

    await query(
      `
        INSERT INTO share_links (
          id,
          tutor_id,
          token,
          escopo,
          expiracao,
          revogado,
          criado_em,
          atualizado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          tutor_id = EXCLUDED.tutor_id,
          token = EXCLUDED.token,
          escopo = EXCLUDED.escopo,
          expiracao = EXCLUDED.expiracao,
          revogado = EXCLUDED.revogado,
          atualizado_em = NOW()
      `,
      [
        snapshot.id,
        snapshot.tutorId,
        snapshot.token,
        snapshot.escopo,
        new Date(snapshot.expiracao),
        snapshot.revogado,
        new Date(snapshot.criadoEm),
      ]
    );
  }

  async obterPorToken(token: string): Promise<ShareLink | null> {
    const result = await query<ShareLinkRow>(
      `
        SELECT
          id,
          tutor_id,
          token,
          escopo,
          expiracao,
          revogado,
          criado_em
        FROM share_links
        WHERE token = $1
        LIMIT 1
      `,
      [token]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapShareLinkRowToDomain(result.rows[0]);
  }

  async listarSnapshots(): Promise<ShareLinkSnapshot[]> {
    const result = await query<ShareLinkRow>(
      `
        SELECT
          id,
          tutor_id,
          token,
          escopo,
          expiracao,
          revogado,
          criado_em
        FROM share_links
        ORDER BY criado_em DESC
      `
    );

    return result.rows.map((row) => mapShareLinkRowToDomain(row).snapshot);
  }

  async revogar(token: string): Promise<void> {
    await query(
      `
        UPDATE share_links
        SET revogado = TRUE, atualizado_em = NOW()
        WHERE token = $1
      `,
      [token]
    );
  }

  async registrarAcesso(token: string): Promise<void> {
    await query(
      `
        UPDATE share_links
        SET ultimo_acesso = NOW(), atualizado_em = NOW()
        WHERE token = $1
      `,
      [token]
    );
  }
}
