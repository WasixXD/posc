import { Handlers } from "$fresh/server.ts";
import { Session, Sessions } from "../../../session/session.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    const deck_id = formData.get("deck_id")! as string;
    const n_questions = formData.get("n_questions")!;

    const s = new Session(deck_id);

    await s.generateQuestions(Number(n_questions));

    Sessions.set(s.session_id, s);

    return new Response(null, {
      status: 303,
      headers: {
        location: `/session/?uuid=${s.session_id}`,
      },
    });
  },
};
