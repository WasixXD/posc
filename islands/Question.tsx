import { useState } from "preact/hooks";
import { Question } from "../session/session.ts";

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
    setResponses((prev) => {
      const copy = [...prev];
      copy[cursor] = { value, tagId };
      return copy;
    });
  };

  const handle_click = async () => {
    if (cursor === questions.length - 1) {
      await fetch("/api/create/performance", {
        method: "POST",
        body: JSON.stringify({ responses, uuid }),
      });
      return;
    }
    updateCursor(cursor + 1);
  };

  const isCorrect = (value: string) => {
    return question.correct === value;
  };

  return (
    <div class="">
      <img
        src={question.question}
        alt="The question to be solved"
        width="800"
        height="400"
      />

      <div>
        {["A", "B", "C", "D", "E"].map((value) => {
          return (
            <div
              onClick={() => handle_response(value, question.tag_id)}
              className={responses[cursor]
                ? (isCorrect(value) ? "bg-[#00FF00]" : "bg-[#ff2c2c]")
                : "bg-gray-200"}
              class="p-8 m-8"
            >
              {value}
            </div>
          );
        })}
      </div>

      <button type="button" onClick={handle_click}>
        Next
      </button>
    </div>
  );
}
