import { z } from "zod";
import type { ChildProfileCreateDTO, TipoSanguineo } from "./types";

const telefoneRegex = /^\+?55?\d{10,11}$/;
const cepRegex = /^\d{5}-?\d{3}$/;

const nonFutureDate = (message: string) =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .refine((value: string) => {
      if (!value) {
        return false;
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed <= today;
    }, message);

const arquivoSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  size: z.number().nonnegative(),
});

const contatoSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  telefone: z.string().regex(telefoneRegex, "Telefone inválido"),
  relacao: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
});

const responsavelSchema = contatoSchema.extend({
  parentesco: z.string().min(2, "Informe o parentesco"),
  whatsapp: z.string().regex(telefoneRegex, "WhatsApp inválido").optional(),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido").optional(),
  rg: z.string().max(20, "RG inválido").optional(),
  dataNascimento: nonFutureDate("Data de nascimento inválida").optional(),
});

const alergiaSchema = z.object({
  nome: z.string().min(2, "Informe a alergia"),
  gravidade: z.enum(["leve", "moderada", "grave"], {
    errorMap: () => ({ message: "Selecione a gravidade" }),
  }),
});

const medicacaoSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  dose: z.string().min(1, "Informe a dose"),
  via: z.string().min(2, "Informe a via"),
  frequencia: z.string().min(2, "Informe a frequência"),
  horarioLivre: z.string().optional(),
});

const eventoClinicoSchema = z.object({
  evento: z.string().min(2, "Descreva o evento"),
  data: nonFutureDate("Data inválida").optional(),
  observacao: z.string().max(280).optional(),
});

const vacinaSchema = z.object({
  nome: z.string().min(2, "Informe a vacina"),
  data: nonFutureDate("Data inválida"),
  lote: z.string().optional(),
  reacao: z.string().max(160).optional(),
});

const medidaSchema = z.object({
  data: nonFutureDate("Data inválida"),
  pesoKg: z
    .number({ invalid_type_error: "Peso inválido" })
    .min(0, "Peso inválido")
    .max(200, "Peso inválido")
    .optional(),
  alturaCm: z
    .number({ invalid_type_error: "Altura inválida" })
    .min(0, "Altura inválida")
    .max(220, "Altura inválida")
    .optional(),
  perimetroCefalicoCm: z
    .number({ invalid_type_error: "Perímetro inválido" })
    .min(0, "Perímetro inválido")
    .max(70, "Perímetro inválido")
    .optional(),
});

const convenioSchema = z.object({
  operadora: z.string().min(2, "Informe a operadora"),
  numeroCarteirinha: z.string().min(3, "Informe a carteirinha"),
  validade: nonFutureDate("Data inválida").optional(),
  plano: z.string().optional(),
  frenteUrl: z.string().url().optional(),
  versoUrl: z.string().url().optional(),
});

const terapiaSchema = z.object({
  tipo: z.string().min(2, "Informe o tipo"),
  profissional: z.string().optional(),
  local: z.string().optional(),
  diasDaSemana: z.array(z.string()).optional(),
  observacao: z.string().max(280).optional(),
});

const atividadeSchema = z.object({
  nome: z.string().min(2, "Informe a atividade"),
  frequencia: z.string().optional(),
});

const optionalString = z.string().trim().min(1).optional();

export const childProfileSchema = z
  .object({
    avatarUrl: z.string().url().optional(),
    avatarFile: z.any().optional(),
    nomeCompleto: z.string().min(2, "Informe o nome"),
    apelido: optionalString,
    dataNascimento: nonFutureDate("Data de nascimento inválida"),
    sexo: z.enum(["feminino", "masculino", "intersexo", "outro"], {
      errorMap: () => ({ message: "Selecione o sexo" }),
    }),
    pronome: z.enum(["ele/dele", "ela/dela", "elu/delu", "outro"]).optional(),
    corRaca: optionalString,
    tipoSanguineo: z.custom<TipoSanguineo>().optional(),
    naturalidade: z
      .object({
        cidade: optionalString,
        uf: optionalString,
      })
      .optional(),
    endereco: z
      .object({
        logradouro: optionalString,
        numero: optionalString,
        bairro: optionalString,
        cidade: optionalString,
        uf: optionalString,
        cep: z.string().regex(cepRegex, "CEP inválido").optional(),
      })
      .optional(),
    contatos: z
      .object({
        principal: z.string().regex(telefoneRegex, "Telefone inválido").optional(),
        extra: z.string().regex(telefoneRegex, "Telefone inválido").optional(),
        email: z.string().email("E-mail inválido").optional(),
      })
      .optional(),
    alergias: z.array(alergiaSchema).default([]),
    condicoes: z.array(z.string()).default([]),
    medicacoesAtuais: z.array(medicacaoSchema).default([]),
    cirurgiasInternacoes: z.array(eventoClinicoSchema).default([]),
    vacinas: z.array(vacinaSchema).default([]),
    crescimento: z.array(medidaSchema).default([]),
    pediatra: z
      .object({
        nome: optionalString,
        crm: optionalString,
        celular: z.string().regex(telefoneRegex, "Telefone inválido").optional(),
        email: z.string().email("E-mail inválido").optional(),
        observacoes: z.string().max(280).optional(),
      })
      .optional(),
    preferenciasCuidados: z.string().max(500).optional(),
    responsaveis: z.array(responsavelSchema).min(1, "Inclua pelo menos um responsável"),
    emergencia: z.array(contatoSchema).min(1, "Inclua um contato de emergência"),
    autorizadosRetirada: z.array(contatoSchema).default([]),
    temConvenio: z.boolean(),
    convenio: convenioSchema.optional(),
    escola: z
      .object({
        nome: optionalString,
        serie: optionalString,
        turno: optionalString,
        contato: optionalString,
      })
      .optional(),
    rotinaSono: z
      .object({
        horaDormir: optionalString,
        horaAcordar: optionalString,
        sonecas: z.number().min(0).max(6).optional(),
        qualidadeSono: z.number().min(1).max(5).optional(),
      })
      .optional(),
    rotinaAlimentacao: z
      .object({
        restricoes: optionalString,
        preferencias: optionalString,
        aguaLitrosDia: z.number().min(0).max(5).optional(),
      })
      .optional(),
    terapias: z.array(terapiaSchema).default([]),
    atividades: z.array(atividadeSchema).default([]),
    anexos: z.array(arquivoSchema).default([]),
    anexosUploads: z.array(z.any()).optional(),
    observacoesGerais: z.string().max(2000).optional(),
    consentimentoLGPD: z
      .boolean()
      .refine((value) => value === true, {
        message: "É necessário aceitar o consentimento",
      }),
    carteirinhaFrenteFile: z.any().optional(),
    carteirinhaVersoFile: z.any().optional(),
    documentosFiles: z.array(z.any()).optional(),
  })
   .superRefine((data: { temConvenio: boolean; convenio?: unknown }, ctx: z.RefinementCtx) => {
    if (data.temConvenio && !data.convenio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["convenio"],
        message: "Informe os dados do convênio",
      });
    }
    if (!data.temConvenio && data.convenio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["convenio"],
        message: "Remova os dados do convênio ou marque que possui convênio",
      });
    }
  });

export type ChildProfileFormValues = z.infer<typeof childProfileSchema>;
export type ChildProfileDto = ChildProfileCreateDTO;

export const stepFieldPaths: Record<string, (keyof ChildProfileFormValues | string)[]> = {
  personal: [
    "nomeCompleto",
    "apelido",
    "dataNascimento",
    "sexo",
    "pronome",
    "corRaca",
    "tipoSanguineo",
    "naturalidade",
    "endereco",
    "contatos",
  ],
  medical: [
    "alergias",
    "condicoes",
    "medicacoesAtuais",
    "cirurgiasInternacoes",
    "vacinas",
    "crescimento",
    "pediatra",
    "preferenciasCuidados",
  ],
  contacts: ["responsaveis", "emergencia", "autorizadosRetirada"],
  insurance: ["temConvenio", "convenio"],
  routine: ["escola", "rotinaSono", "rotinaAlimentacao", "terapias", "atividades"],
  attachments: ["anexos", "observacoesGerais", "consentimentoLGPD"],
};
