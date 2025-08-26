import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.text();
    const { responses, uuid } = JSON.parse(body);
    return new Response(null, {
      status: 303,
      headers: {
        location: `/performance?uuid=${uuid}}`,
      },
    });
  },
};
