const configuredServerUrl = process.env.OPENAPI_SERVER_URL ?? process.env.CORS_ORIGIN ?? "/api";
const openApiServerUrl =
  !configuredServerUrl || configuredServerUrl === "*" ? "/api" : configuredServerUrl;
const serverDescription =
  openApiServerUrl === "/api" ? "Ambiente local" : "Ambiente configurado";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Agenda Amiga API",
    description:
      "API responsavel por sincronizar pacientes, tratamentos, rotinas de doses e links compartilhaveis do Agenda Amiga.",
    version: "1.0.0",
  },
  servers: [
    {
      url: openApiServerUrl,
      description: serverDescription,
    },
  ],
  tags: [
    { name: "Health", description: "Verificacoes de disponibilidade" },
    { name: "Pacientes", description: "Recursos relacionados a pacientes e tutores" },
    { name: "Medicamentos", description: "Consulta e manutencao de medicamentos" },
    { name: "Doses", description: "Confirmacao de tomadas e historico" },
    { name: "Share Links", description: "Gestao de links de compartilhamento" },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", example: "Requisicao invalida" },
        },
      },
      PlanoSaude: {
        type: "object",
        properties: {
          operadora: { type: "string", example: "Unimed" },
          numeroCarteirinha: { type: "string", example: "123456789" },
          validade: { type: ["string", "null"], format: "date-time", example: "2025-12-31T00:00:00.000Z" },
          arquivado: { type: "boolean", example: false },
        },
      },
      Paciente: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tutorId: { type: "string", format: "uuid" },
          nomeCompleto: { type: "string" },
          condicoes: {
            type: "array",
            items: { type: "string" },
          },
          alergias: {
            type: "array",
            items: { type: "string" },
          },
          planoSaude: {
            allOf: [{ $ref: "#/components/schemas/PlanoSaude" }],
            nullable: true,
          },
        },
      },
      Medicamento: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          pacienteId: { type: "string", format: "uuid" },
          nome: { type: "string" },
          dosagem: { type: "number", example: 1 },
          unidadeDosagem: { type: "string", example: "MG" },
          ativo: { type: "boolean" },
          esquema: {
            type: ["object", "null"],
            properties: {
              tipo: { type: "string", example: "DIARIO_HORARIOS_FIXOS" },
            },
            nullable: true,
          },
        },
      },
      DoseLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          medicamentoId: { type: "string", format: "uuid" },
          horarioPrevisto: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["PENDENTE", "TOMADO", "ATRASADO"] },
          horarioReal: { type: ["string", "null"], format: "date-time" },
        },
      },
      DomainEvent: {
        type: "object",
        description: "Evento de dominio emitido pelo core. Estrutura pode variar conforme o caso de uso.",
        additionalProperties: true,
      },
      NovoEsquemaDose: {
        type: "object",
        required: ["tipo", "timezone", "horarios"],
        properties: {
          tipo: {
            type: "string",
            enum: ["DIARIO_HORARIOS_FIXOS", "SEMANAL_DIAS_FIXOS"],
          },
          timezone: {
            type: "string",
            example: "America/Sao_Paulo",
          },
          horarios: {
            type: "array",
            items: { type: "string", example: "08:00" },
          },
          diasDaSemana: {
            type: "array",
            items: { type: "integer", minimum: 0, maximum: 6 },
            description: "Dias da semana (0 = domingo) necessarios para esquemas semanais.",
          },
          periodo: {
            type: "object",
            properties: {
              inicio: { type: ["string", "null"], format: "date-time" },
              fim: { type: ["string", "null"], format: "date-time" },
            },
            nullable: true,
          },
        },
      },
      ConfirmarDoseRequest: {
        type: "object",
        properties: {
          instante: { type: "string", format: "date-time" },
        },
      },
      ConfirmarDoseResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PENDENTE", "TOMADO", "ATRASADO"] },
          eventos: {
            type: "array",
            items: { $ref: "#/components/schemas/DomainEvent" },
          },
        },
      },
      ShareLink: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tutorId: { type: "string", format: "uuid" },
          token: { type: "string" },
          expiracao: { type: "string", format: "date-time" },
          revogado: { type: "boolean" },
          criadoEm: { type: "string", format: "date-time" },
          escopo: {
            type: "object",
            additionalProperties: {
              anyOf: [
                { type: "array", items: { type: "string" } },
                { type: "string", enum: ["*"] },
              ],
            },
          },
        },
      },
      ShareLinkRequest: {
        type: "object",
        required: ["shareLinkId", "tutorId", "token", "expiracao", "escopo"],
        properties: {
          shareLinkId: { type: "string", format: "uuid" },
          tutorId: { type: "string", format: "uuid" },
          token: { type: "string" },
          expiracao: { type: "string", format: "date-time" },
          escopo: {
            type: "array",
            items: {
              type: "object",
              required: ["tipo"],
              properties: {
                tipo: { type: "string", example: "PACIENTES" },
                identificadores: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Requisicao invalida",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Recurso nao encontrado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica se o servico esta disponivel",
        responses: {
          200: {
            description: "Servico operando",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/tutores/{tutorId}/pacientes": {
      get: {
        tags: ["Pacientes"],
        summary: "Lista pacientes vinculados a um tutor",
        parameters: [
          {
            name: "tutorId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Pacientes encontrados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pacientes: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Paciente" },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/pacientes/{pacienteId}/medicamentos": {
      get: {
        tags: ["Medicamentos"],
        summary: "Lista medicamentos de um paciente",
        parameters: [
          {
            name: "pacienteId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Medicamentos do paciente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    medicamentos: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Medicamento" },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/medicamentos/{medicamentoId}": {
      get: {
        tags: ["Medicamentos"],
        summary: "Obtem detalhes de um medicamento",
        parameters: [
          {
            name: "medicamentoId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Detalhes do medicamento",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    medicamento: { $ref: "#/components/schemas/Medicamento" },
                  },
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/medicamentos/{medicamentoId}/dose-logs": {
      get: {
        tags: ["Medicamentos"],
        summary: "Busca historico de doses de um medicamento",
        parameters: [
          {
            name: "medicamentoId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "inicio",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "fim",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "Historico retornado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    medicamento: { $ref: "#/components/schemas/Medicamento" },
                    doseLogs: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DoseLog" },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/medicamentos/{medicamentoId}/esquema": {
      post: {
        tags: ["Medicamentos"],
        summary: "Define ou atualiza o esquema de doses",
        parameters: [
          {
            name: "medicamentoId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NovoEsquemaDose" },
            },
          },
        },
        responses: {
          200: {
            description: "Esquema atualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    medicamento: { $ref: "#/components/schemas/Medicamento" },
                    eventos: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DomainEvent" },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/dose-logs/{doseLogId}/confirmar": {
      post: {
        tags: ["Doses"],
        summary: "Confirma a tomada de uma dose",
        parameters: [
          {
            name: "doseLogId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmarDoseRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Dose confirmada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfirmarDoseResponse" },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/share-links": {
      post: {
        tags: ["Share Links"],
        summary: "Gera um novo link de compartilhamento",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShareLinkRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Link criado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    shareLink: { $ref: "#/components/schemas/ShareLink" },
                    eventos: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DomainEvent" },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
      get: {
        tags: ["Share Links"],
        summary: "Lista links de compartilhamento ativos",
        responses: {
          200: {
            description: "Links retornados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    shareLinks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ShareLink" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
