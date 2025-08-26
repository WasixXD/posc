import { useState } from "preact/hooks";
import { type Deck } from "../routes/api/list/deck.ts";
import TagSelect from "../components/TagSelect.tsx";
import { type Tag } from "../routes/api/list/tag.ts";

interface Props {
  deckname: string;
  decks: Deck[];
  tags: Tag[];
}

function CreateQuestion(
  props: { decks: Deck[]; handle_submit: Function; tags: Tag[] },
) {
  return (
    <div>
      <button
        type="button"
        className="btn btn-join btn-secondary"
        onClick={() => {
          const dialog = document.getElementById("my_modal_4") as
            | HTMLDialogElement
            | null;
          dialog?.showModal();
        }}
      >
        Create Question
      </button>
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box w-full">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                const dialog = document.getElementById("my_modal_4") as
                  | HTMLDialogElement
                  | null;
                dialog?.close();
              }}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Create Question</h3>

          <form
            onSubmit={props.handle_submit}
            className="flex flex-col items-center w-full max-w-md mx-auto space-y-4"
          >
            <label htmlFor="deck_id" class="select w-full">
              <span class="label">Deck:</span>
              <select
                defaultValue="Select Deck"
                className="select"
                name="deck_id"
                required
              >
                <option>Select Deck</option>
                {props.decks.map((deck) => (
                  <option key={deck.deck_id} value={deck.deck_id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </label>

            <input
              type="file"
              class="file-input file-input-secondary w-full"
              name="file"
              required
            />

            <label htmlFor="correct" class="select w-full">
              <span class="label">Correct Answer:</span>
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
            </label>

            <TagSelect initialTags={props.tags} name="tag" />

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Create
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
function CreateDeck() {
  return (
    <div>
      <button
        type="button"
        className="btn btn-join btn-primary"
        onClick={() => {
          const dialog = document.getElementById("my_modal_3") as
            | HTMLDialogElement
            | null;
          dialog?.showModal();
        }}
      >
        Create deck
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                const dialog = document.getElementById("my_modal_3") as
                  | HTMLDialogElement
                  | null;
                dialog?.close();
              }}
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
            <label htmlFor="deck_name" class="floating-label my-8">
              <span>Deck Name</span>
              <input
                type="text"
                placeholder="MyNextExam"
                className="input input-md w-full"
                name="deck_name"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary ">Create</button>
          </form>
        </div>
      </dialog>
    </div>
  );
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
    <div class="flex flex-col justify-center items-center content-center w-full h-full">
      {showToast
        ? (
          <div class="toast toast-end">
            <div class="alert alert-info">
              <span>{props.deckname} created!</span>
            </div>
          </div>
        )
        : <div></div>}

      <div class="w-1/2">
        <h1 class="text-6xl py-8">Decks</h1>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Number of Questions</th>
                <th>Correctness</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((item) => (
                <tr key={item.deck_id}>
                  <td>{item.deck_id}</td>
                  <td>{item.name}</td>
                  <td>{item.total_questions}</td>
                  <td>{item.correctness_percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="join mt-8">
        {/* ------------------------------------------ */}
        <CreateQuestion
          decks={decks}
          handle_submit={handle_submit}
          tags={props.tags}
        />
        {/* --------------------------------------------- */}
        <CreateDeck />
        {/* ------------------------------------------ */}
        <button
          type="button"
          className="btn btn-join btn-secondary"
          onClick={() => {
            const dialog = document.getElementById("my_modal_5") as
              | HTMLDialogElement
              | null;
            dialog?.showModal();
          }}
        >
          Start Session
        </button>
        <dialog id="my_modal_5" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  const dialog = document.getElementById("my_modal_5") as
                    | HTMLDialogElement
                    | null;
                  dialog?.close();
                }}
              >
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">Start Session</h3>

            <form
              method="post"
              action="/api/create/session"
              className="flex flex-col items-center w-full space-y-4"
            >
              <label htmlFor="deck_id" class="select w-full">
                <span class="label">Deck:</span>
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

              <label htmlFor="n_questions" class="floating-label w-full">
                <input
                  type="number"
                  placeholder="Number of Questions"
                  className="input input-md w-full"
                  name="n_questions"
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary w-full">
                Start
              </button>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
}
