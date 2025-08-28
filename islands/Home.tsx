import { useEffect, useRef, useState } from "preact/hooks";
import { type Deck } from "../routes/api/list/deck.ts";
import TagSelect from "../components/TagSelect.tsx";
import { type Tag } from "../routes/api/list/tag.ts";

interface Props {
  deckname: string;
  decks: Deck[];
  tags: Tag[];
}

// Vibe Coded Component
function CreateQuestion(
  props: { decks: Deck[]; handle_submit: Function; tags: Tag[] },
) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        if (fileInputRef.current) {
          // Create a new FileList-like object
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }
      }
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedFile(file);
            if (fileInputRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            }
            break;
          }
        }
      }
    }
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      setSelectedFile(target.files[0]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "v") {
        const modal = document.getElementById(
          "my_modal_4",
        ) as HTMLDialogElement;
        if (modal?.open) {
          // Allow paste event to be handled by handlePaste
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div>
      <button
        type="button"
        className="btn btn-soft btn-join btn-secondary"
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
            <label htmlFor="deck_id" className="select w-full">
              <span className="label">Deck:</span>
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

            <div
              className={`relative w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="file-input file-input-secondary w-full opacity-0 absolute inset-0 cursor-pointer"
                name="file"
                accept="image/*"
                required
                onChange={handleFileChange}
              />
              <div className="pointer-events-none">
                {selectedFile
                  ? (
                    <div className="text-sm">
                      <p className="font-medium text-green-600">
                        ✓ {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        File selected ({(selectedFile.size / 1024 / 1024)
                          .toFixed(2)} MB)
                      </p>
                    </div>
                  )
                  : (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Upload Question Image</p>
                      <p className="mt-1">
                        Click to browse, drag & drop, or Ctrl+V to paste from
                        clipboard
                      </p>
                      <p className="text-xs mt-2">
                        Supports: PNG, JPG, GIF, WebP
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <label htmlFor="correct" className="select w-full">
              <span className="label">Correct Answer:</span>
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
        className="btn btn-soft btn-join btn-primary"
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
          className="btn btn-soft btn-join btn-secondary"
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
