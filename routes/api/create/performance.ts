import { Handlers } from "$fresh/server.ts";
import { Sessions } from "../../../session/session.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.text();
    const { responses, uuid } = JSON.parse(body);

    const s = Sessions.get(uuid)!;

    await s.updatePerformance(responses);

    return new Response(null, {
      status: 303,
      headers: {
        location: `/statistics?uuid=${uuid}`,
      },
    });
  },
};
