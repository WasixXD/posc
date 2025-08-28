import { Handlers, PageProps } from "$fresh/server.ts";
import AnswerTable from "../islands/AnswerTable.tsx";
import { Question, Sessions, UserResponse } from "../session/session.ts";
import { get_all_tags, Tag } from "./api/list/tag.ts";
import Chart from "../islands/Chart.tsx";
import { useEffect } from "preact/hooks";
import HomeButton from "../islands/HomeButton.tsx";

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
    return await ctx.render({
      uuid,
      responses: s.userResponses,
      questions: s.questions,
      tags,
    });
  },
};

export default function StatisticsPage(props: PageProps<Props>) {
  const { responses, questions, tags, uuid } = props.data;

  return (
    <div class="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div class="w-full max-w-2xl">
        <AnswerTable responses={responses} questions={questions} />
      </div>

      <div class="w-full max-w-2xl max-h-2xl">
        <Chart responses={responses} questions={questions} tags={tags} />
      </div>

      <HomeButton uuid={uuid} />
    </div>
  );
}
