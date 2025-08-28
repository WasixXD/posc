import { useState } from "preact/hooks";
import { Question } from "../session/session.ts";
import Choice from "../components/Choice.tsx";

interface Props {
  questions: Question[];
  uuid: string;
}

export default function QuestionIsland(props: Props) {
  const { questions, uuid } = props;
  const [cursor, updateCursor] = useState(0);
  const question = questions[cursor];

  const [responses, setResponses] = useState<object[]>([]);

  const handle_response = (value: string, tagId: number) => {
    if (responses[cursor] !== undefined) return;
    setResponses((prev) => {
      const copy = [...prev];
      copy[cursor] = { value, tagId };
      return copy;
    });
  };

  const handle_click = async () => {
    if (cursor === questions.length - 1) {
      const res = await fetch("/api/create/performance", {
        method: "POST",
        body: JSON.stringify({ responses, uuid }),
      });

      if (res.redirected) {
        const location = res.url;
        window.location.href = location;
      }
      return;
    }
    updateCursor(cursor + 1);
  };

  const isCorrect = (value: string) => {
    return question.correct === value;
  };

  return (
    <div class="flex flex-col items-center content-center justify-center">
      <div class="w-full h-[400px] flex flex-col items-center justify-center mt-8">
        <img
          src={question.question}
          alt="The question to be solved"
          class="p-4 rounded-box border border-base-content/5 bg-base-100"
          width="800"
          height="400"
        />
      </div>

      <div class="w-[800px] h-[400px] flex flex-col items-center justify-center mt-8 space-y-4">
        {["A", "B", "C", "D", "E"].map((value) => (
          <Choice
            key={value}
            value={value}
            correct={isCorrect(value)}
            toShow={responses[cursor] !== undefined}
            onClick={() => handle_response(value, question.tag_id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handle_click}
        class="btn btn-accent btn-md"
        disabled={responses[cursor] === undefined}
      >
        Next

        <span>
          <svg
            class="w-6 h-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
