import { useState } from "preact/hooks";
import { type Deck } from "../routes/api/list/deck.ts";
import TagSelect from "../components/TagSelect.tsx";
import { type Tag } from "../routes/api/list/tag.ts";

interface Props {
  deckname: string;
  decks: Deck[];
  tags: Tag[];
}
export default function Home(props: Props) {
  const deckname = props.deckname ?? "";
  const [decks, updateDecks] = useState(props.decks);
  const [showToast, updateShow] = useState(deckname !== "");

  if (showToast) {
    setTimeout(() => {
      updateShow(false);
    }, 5000);
  }

  const handle_submit = async (e: Event) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    const formData = new FormData(form);

    await fetch("/api/create/question", {
      method: "POST",
      body: formData,
    });

    const result = await fetch("/api/list/deck");
    const response = await result.json();

    updateDecks(response);
  };

  return (
    <div>
      <div>
        Decks
        {decks.map((item) => (
          <div key={item.deck_id}>{item.name} | {item.total_questions}</div>
        ))}
      </div>
      {showToast
        ? (
          <div class="toast toast-end">
            <div class="alert alert-info">
              <span>{props.deckname} created!</span>
            </div>
          </div>
        )
        : <div></div>}
      {/* ------------------------------------------ */}
      <button
        type="button"
        className="btn"
        onClick={() => document.getElementById("my_modal_3").showModal()}
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
      {/* --------------------------------------------- */}
      <button
        type="button"
        className="btn"
        onClick={() => document.getElementById("my_modal_4").showModal()}
      >
        Create Question
      </button>
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Create Question</h3>

          <form
            onSubmit={handle_submit}
            className="flex flex-col align-center"
          >
            <label htmlFor="deck_id">
              Deck:
              <select
                defaultValue="Select Deck"
                className="select"
                name="deck_id"
                required
              >
                <option>Select Deck</option>
                {decks.map((deck) => (
                  <option key={deck.deck_id} value={deck.deck_id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="file"
              class="file-input file-input-secondary"
              name="file"
              required
            />

            <label htmlFor="correct">Correct:</label>
            <select
              defaultValue="Correct answer"
              className="select"
              name="correct"
              required
            >
              <option disabled>Correct answer</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>E</option>
            </select>

            <TagSelect initialTags={props.tags} name="tag" />

            <button
              type="submit"
              className="btn btn-primary "
            >
              Create
            </button>
          </form>
        </div>
      </dialog>

      {/* ------------------------------------------ */}
      <button
        type="button"
        className="btn"
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Start Session
      </button>
      <dialog id="my_modal_5" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Start Session</h3>

          <form
            method="post"
            action="/api/create/deck"
            className="flex flex-col align-center"
          >
            <label htmlFor="deck_id">
              Deck:
            </label>
            <select
              defaultValue="Select Deck"
              className="select"
              name="deck_id"
              required
            >
              <option>Select Deck</option>
              {decks.map((deck) => (
                <option key={deck.deck_id} value={deck.deck_id}>
                  {deck.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Number of Questions"
              className="input my-8 w-full"
              name="n_questions"
              required
            />

            <button type="submit" className="btn btn-primary">Start</button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
