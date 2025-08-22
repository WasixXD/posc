import { useEffect, useState } from "preact/hooks";
import { Deck } from "../routes/api/list/deck.ts";

interface Props {
  deckname: string;
  decks: Deck[];
}
export default function Home(props: Props) {
  const deckname = props.deckname ?? "";
  const [showToast, updateShow] = useState(deckname !== "");

  if (showToast) {
    setTimeout(() => {
      updateShow(false);
    }, 5000);
  }

  return (
    <div>
      {props.decks[0].deck_id}
      {showToast
        ? (
          <div class="toast toast-end">
            <div class="alert alert-info">
              <span>{props.deckname} created!</span>
            </div>
          </div>
        )
        : <div></div>}
      <button
        type="button"
        className="btn"
        onClick={() =>
          globalThis.document.getElementById("my_modal_3")!.showModal()}
      >
        Create deck
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Create Deck</h3>

          <form
            method="post"
            action="/api/create/deck"
            className="flex flex-col align-center"
          >
            <input
              type="text"
              placeholder="Deck name"
              className="input my-8 w-full"
              name="deck_name"
              required
            />

            <button type="submit" className="btn btn-primary ">Create</button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
