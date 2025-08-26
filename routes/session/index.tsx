import { Handlers, PageProps } from "$fresh/server.ts";
import { Question, Sessions } from "../../session/session.ts";
import QuestionIsland from "../../islands/Question.tsx";

interface Props {
  questions: Question[];
  uuid: string;
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const params = new URL(req.url).searchParams;
    const uuid = params.get("uuid") as string;

    const s = Sessions.get(uuid)!;

    return await ctx.render({ questions: s.questions, uuid });
  },
};

export default function SessionPage(props: PageProps<Props>) {
  const { questions, uuid } = props.data;

  return (
    <div>
      <QuestionIsland
        questions={questions}
        uuid={uuid}
      />
    </div>
  );
}
