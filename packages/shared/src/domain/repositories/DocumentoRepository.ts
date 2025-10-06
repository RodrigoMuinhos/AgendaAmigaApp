import { Documento } from "../entities/Documento";

export interface DocumentoRepository {
  salvar(documento: Documento): Promise<void>;
  marcarCompartilhamento(documentoId: string, ativo: boolean): Promise<void>;
  listarCompartilhaveis(pacienteId: string): Promise<Documento[]>;
}
