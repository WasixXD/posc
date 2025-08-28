import { Handlers, PageProps } from "$fresh/server.ts";
import AnswerTable from "../islands/AnswerTable.tsx";
import { Question, Sessions, UserResponse } from "../session/session.ts";
import { get_all_tags, Tag } from "./api/list/tag.ts";
import Chart from "../islands/Chart.tsx";

interface Props {
  uuid: string;
  responses: UserResponse[];
  questions: Question[];
  tags: Tag[];
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const params = new URL(req.url).searchParams;

    const uuid = params.get("uuid")!;
    const s = Sessions.get(uuid)!;
    const tags = await get_all_tags();
    return ctx.render({
      uuid,
      responses: s.userResponses,
      questions: s.questions,
      tags,
    });
  },
};

export default function StatisticsPage(props: PageProps<Props>) {
  const { responses, questions, tags } = props.data;
  return (
    <div class="flex items-center justify-center">
      <div class="w-1/2">
        <AnswerTable responses={responses} questions={questions} />
      </div>

      <div class="charts w-1/2">
        <Chart responses={responses} questions={questions} tags={tags} />
      </div>
    </div>
  );
}
