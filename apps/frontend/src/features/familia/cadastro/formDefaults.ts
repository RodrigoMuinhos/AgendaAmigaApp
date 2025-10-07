import type { ChildProfileCreateDTO } from "./types";
import type { ChildProfileFormValues } from "./schema";
import { SAVE_AS_E164 } from "./schema";

export const defaultProfileValues: ChildProfileFormValues = {
  avatarUrl: undefined,
  avatarFile: undefined,
  nomeCompleto: "",
  apelido: undefined,
  dataNascimento: "",
  sexo: "feminino",
  pronome: "ela/dela",
  corRaca: undefined,
  tipoSanguineo: undefined,
  naturalidade: { cidade: undefined, uf: undefined },
  endereco: {
    logradouro: undefined,
    numero: undefined,
    bairro: undefined,
    cidade: undefined,
    uf: undefined,
    cep: undefined,
  },
  contatos: { telefonePrincipal: "", telefoneExtra: "", email: undefined },
  alergias: [],
  condicoes: [],
  medicacoesAtuais: [],
  cirurgiasInternacoes: [],
  vacinas: [],
  crescimento: [],
  pediatra: { nome: undefined, crm: undefined, celular: undefined, email: undefined, observacoes: undefined },
  preferenciasCuidados: undefined,
  responsaveis: [
    {
      nome: "",
      telefone: "",
      parentesco: "",
      email: undefined,
      relacao: undefined,
      whatsapp: undefined,
      cpf: undefined,
      rg: undefined,
      dataNascimento: undefined,
    },
  ],
  emergencia: [
    {
      nome: "",
      telefone: "",
      relacao: undefined,
      email: undefined,
    },
  ],
  autorizadosRetirada: [],
  temConvenio: false,
  convenio: undefined,
  escola: { nome: undefined, serie: undefined, turno: undefined, contato: undefined },
  rotinaSono: { horaDormir: undefined, horaAcordar: undefined, sonecas: undefined, qualidadeSono: undefined },
  rotinaAlimentacao: { restricoes: undefined, preferencias: undefined, aguaLitrosDia: undefined },
  terapias: [],
  atividades: [],
  anexos: [],
  anexosUploads: [],
  observacoesGerais: undefined,
  consentimentoLGPD: false,
  carteirinhaFrenteFile: undefined,
  carteirinhaVersoFile: undefined,
  documentosFiles: [],
};

export const mapFormToDto = (values: ChildProfileFormValues): ChildProfileCreateDTO => {
  const alergias = (values.alergias ?? []).filter((item) => Boolean(item?.nome));
  const condicoes = (values.condicoes ?? []).filter((item) => item.trim().length > 0);
  const medicacoes = (values.medicacoesAtuais ?? []).filter((item) => item.nome.trim().length > 0);
  const cirurgias = (values.cirurgiasInternacoes ?? []).filter((item) => item.evento.trim().length > 0);
  const vacinas = (values.vacinas ?? []).filter((item) => item.nome.trim().length > 0);
  const autorizados = (values.autorizadosRetirada ?? []).filter((item) => item.nome.trim().length > 0);
  const terapias = (values.terapias ?? []).filter((item) => item.tipo.trim().length > 0);
  const atividades = (values.atividades ?? []).filter((item) => item.nome.trim().length > 0);

  const formatPhoneForDto = (phone?: string) => {
    if (!phone) {
      return undefined;
    }
    if (SAVE_AS_E164) {
      return phone;
    }
    if (phone.startsWith("+55")) {
      return phone;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (!digitsOnly) {
      return undefined;
    }
    return "+55" + digitsOnly;
  };

  const contatos = {
    telefonePrincipal: formatPhoneForDto(values.contatos.telefonePrincipal)!,
    telefoneExtra: formatPhoneForDto(values.contatos.telefoneExtra),
    email: values.contatos.email,
  };

  return {
    avatarUrl: values.avatarUrl,
    nomeCompleto: values.nomeCompleto,
    apelido: values.apelido,
    dataNascimento: values.dataNascimento,
    sexo: values.sexo,
    pronome: values.pronome,
    corRaca: values.corRaca,
    tipoSanguineo: values.tipoSanguineo,
    naturalidade: values.naturalidade,
    endereco: values.endereco,
    contatos,
    alergias,
    condicoes,
    medicacoesAtuais: medicacoes,
    cirurgiasInternacoes: cirurgias,
    vacinas,
    crescimento: values.crescimento,
    pediatra: values.pediatra,
    preferenciasCuidados: values.preferenciasCuidados,
    responsaveis: values.responsaveis,
    emergencia: values.emergencia,
    autorizadosRetirada: autorizados,
    temConvenio: values.temConvenio,
    convenio: values.temConvenio ? values.convenio : undefined,
    escola: values.escola,
    rotinaSono: values.rotinaSono,
    rotinaAlimentacao: values.rotinaAlimentacao,
    terapias,
    atividades,
    anexos: values.anexos ?? [],
    observacoesGerais: values.observacoesGerais,
    consentimentoLGPD: values.consentimentoLGPD,
  };
};
