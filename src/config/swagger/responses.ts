import { OpenAPIV3 } from "openapi-types";

function createErrorResponse(
  description: string,
  status: number,
  message: string,
): OpenAPIV3.ResponseObject {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          message,
          status,
        },
      },
    },
  };
}

export const responses: OpenAPIV3.ComponentsObject["responses"] = {
  BadRequest: createErrorResponse(
    "Erro de validação",
    400,
    "Erro de validação",
  ),

  Unauthorized: createErrorResponse(
    "Não autorizado",
    401,
    "Token inválido ou não informado",
  ),

  Forbidden: createErrorResponse(
    "Acesso negado",
    403,
    "Você não tem permissão",
  ),

  NotFound: createErrorResponse(
    "Recurso não encontrado",
    404,
    "Recurso não encontrado",
  ),

  InternalServerError: createErrorResponse(
    "Erro interno do servidor",
    500,
    "Erro interno do servidor",
  ),
};
