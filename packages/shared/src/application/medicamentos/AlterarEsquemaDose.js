"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterarEsquemaDose = void 0;
const EsquemaDose_1 = require("../../domain/entities/EsquemaDose");
const DoseHorario_1 = require("../../domain/value-objects/DoseHorario");
const Periodo_1 = require("../../domain/value-objects/Periodo");
class AlterarEsquemaDose {
    constructor(medicamentoRepository, clock) {
        this.medicamentoRepository = medicamentoRepository;
        this.clock = clock;
    }
    async execute({ medicamentoId, esquema }) {
        const id = medicamentoId.trim();
        if (!id) {
            throw new Error("MedicamentoId obrigatorio");
        }
        const medicamento = await this.medicamentoRepository.obterPorId(id);
        if (!medicamento) {
            throw new Error("Medicamento nao encontrado");
        }
        const novoEsquema = this.criarEsquema(esquema);
        medicamento.definirEsquema(novoEsquema);
        await this.medicamentoRepository.salvar(medicamento);
        const eventos = medicamento.pullDomainEvents();
        return {
            medicamento: medicamento.snapshot,
            eventos,
        };
    }
    criarEsquema(dto) {
        const horarios = dto.horarios.map((horario) => DoseHorario_1.DoseHorario.create(horario));
        const periodo = dto.periodo
            ? Periodo_1.Periodo.create({
                inicio: dto.periodo.inicio ? new Date(dto.periodo.inicio) : undefined,
                fim: dto.periodo.fim ? new Date(dto.periodo.fim) : undefined,
            })
            : undefined;
        switch (dto.tipo) {
            case "DIARIO_HORARIOS_FIXOS":
                return new EsquemaDose_1.EsquemaDoseDiario({ horarios, timezone: dto.timezone, periodo });
            case "SEMANAL_DIAS_FIXOS": {
                const props = {
                    horarios,
                    timezone: dto.timezone,
                    periodo,
                    diasDaSemana: dto.diasDaSemana ?? [],
                };
                return new EsquemaDose_1.EsquemaDoseSemanal(props);
            }
            default:
                throw new Error(`Recorrencia de dose nao suportada: ${dto.tipo}`);
        }
    }
}
exports.AlterarEsquemaDose = AlterarEsquemaDose;
