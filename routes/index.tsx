import Home from "../islands/Home.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Deck, get_all_decks } from "./api/list/deck.ts";

interface Props {
  deckname: string;
  decks: Deck[];
}
export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const deckname = url.searchParams.get("deckname");

    const decks = await get_all_decks();

    return await ctx.render({ deckname, decks });
  },
};
export default function Page({ data }: PageProps<Props>) {
  const { deckname, decks } = data;

  return (
    <div>
      <Home deckname={deckname} decks={decks} />
    </div>
  );
}
