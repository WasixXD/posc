import Home from "../islands/Home.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Deck, get_all_decks } from "./api/list/deck.ts";
import { get_all_tags, Tag } from "./api/list/tag.ts";
import { Sessions } from "../session/session.ts";

interface Props {
  deckname: string;
  decks: Deck[];
  tags: Tag[];
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const deckname = url.searchParams.get("deckname");

    const decks = await get_all_decks();
    const tags = await get_all_tags();

    return await ctx.render({ deckname, decks, tags });
  },
};
export default function Page({ data }: PageProps<Props>) {
  const { deckname, decks, tags } = data;

  return (
    <div>
      <Home deckname={deckname} decks={decks} tags={tags} />
    </div>
  );
}
