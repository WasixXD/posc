import { Handlers, PageProps } from "$fresh/server.ts";

interface Props {
  uuid: string;
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const params = new URL(req.url).searchParams;
    const uuid = params.get("uuid");

    return await ctx.render({ uuid });
  },
};

export default function Session(props: PageProps<Props>) {
  const { uuid } = props.data;

  return (
    <div>
      {uuid}
    </div>
  );
}
