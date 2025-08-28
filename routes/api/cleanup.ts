import { Handlers } from "$fresh/server.ts";
import { Sessions } from "../../session/session.ts";

export const handler: Handlers = {
  DELETE(req) {
    try {
      const params = new URL(req.url).searchParams;
      const uuid = params.get("uuid");

      if (!uuid) {
        return new Response("UUID não fornecido", { status: 400 });
      }

      if (Sessions.has(uuid)) {
        Sessions.delete(uuid);
        console.log(`Sessão ${uuid} deletada com sucesso`);
        return new Response("Sessão deletada com sucesso", { status: 200 });
      } else {
        console.log(`Sessão ${uuid} não encontrada`);
        return new Response("Sessão não encontrada", { status: 404 });
      }
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
      return new Response("Erro interno do servidor", { status: 500 });
    }
  },
};
