// apps/frontend/src/features/familia/cadastro/schema.ts
import { z } from "zod";
import type { ChildProfileCreateDTO, TipoSanguineo } from "./types";

// Se o backend esperar E.164 (+55...), troque para true
export const SAVE_AS_E164 = false;

const BR_DDDS = new Set([
  "11","12","13","14","15","16","17","18","19",
  "21","22","24","27","28",
  "31","32","33","34","35","37","38",
  "41","42","43","44","45","46",
  "47","48","49",
  "51","53","54","55",
  "61","62","63","64","65","66","67","68","69",
  "71","73","74","75","77","79",
  "81","82","83","84","85","86","87","88","89",
  "91","92","93","94","95","96","97","98","99",
]);

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/**
 * Validador de telefone BR:
 * - Aceita string, tira tudo que não é dígito
 * - 10 (fixo) ou 11 dígitos (celular)
 * - DDD válido
 * - Se 11 dígitos, o 3º precisa ser 9 (celular)
 * - Transforma para E.164 se SAVE_AS_E164=true
 */
export const brPhoneZ = z
  .string()
  .trim()
  .transform(onlyDigits)
  .refine((digits) => digits.length === 10 || digits.length === 11, "Telefone inválido")
  .refine((digits) => BR_DDDS.has(digits.slice(0, 2)), "Telefone inválido")
  .refine((digits) => digits.length === 10 || digits[2] === "9", "Telefone inválido")
  .transform((digits) => (SAVE_AS_E164 ? "+55" + digits : digits));

/** Aceita vazio -> undefined */
const optionalBrPhoneZ = z.union([
  z.string().pipe(brPhoneZ),
  z.literal("").transform(() => undefined),
  z.undefined(),
]);

const cepRegex = /^\d{5}-?\d{3}$/;

/** String de data não-futura (YYYY-MM-DD ou parseável via Date) */
const nonFutureDate = (message: string) =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .refine((value: string) => {
      if (!value) return false;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return false;
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
  telefone: z.string().pipe(brPhoneZ),
  relacao: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
});

const responsavelSchema = contatoSchema.extend({
  parentesco: z.string().min(2, "Informe o parentesco"),
  whatsapp: optionalBrPhoneZ,
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
  pesoKg: z.number({ invalid_type_error: "Peso inválido" }).min(0, "Peso inválido").max(200, "Peso inválido").optional(),
  alturaCm: z.number({ invalid_type_error: "Altura inválida" }).min(0, "Altura inválida").max(220, "Altura inválida").optional(),
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
  frequencia: z.string().optional(),              // será preenchida automaticamente
  diasDaSemana: z.array(z.string()).optional(),   // ⬅️ novo
  horario: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário inválido")
    .optional(),    
});

const optionalString = z.string().trim().min(1).optional();

/** === ESQUEMA RAIZ ======================================================= */
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

    contatos: z.object({
      telefonePrincipal: z.string().pipe(brPhoneZ),
      telefoneExtra: optionalBrPhoneZ,
      email: z
        .string()
        .email("E-mail inválido")
        .optional()
        .or(z.literal("").transform(() => undefined)),
    }),

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
        celular: optionalBrPhoneZ, // usa mesmo validador de telefone
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
      .refine((value) => value === true, { message: "É necessário aceitar o consentimento" }),

    carteirinhaFrenteFile: z.any().optional(),
    carteirinhaVersoFile: z.any().optional(),
    documentosFiles: z.array(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
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

/** Paths por etapa para navegação/scroll */
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
  contacts: [
    "contatos.telefonePrincipal",
    "contatos.telefoneExtra",
    "contatos.email",
    "responsaveis",
    "emergencia",
    "autorizadosRetirada",
  ],
  insurance: ["temConvenio", "convenio"],
  routine: ["escola", "rotinaSono", "rotinaAlimentacao", "terapias", "atividades"],
  attachments: ["anexos", "observacoesGerais", "consentimentoLGPD"],
};
