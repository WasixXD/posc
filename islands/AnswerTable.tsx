import { Question, UserResponse } from "../session/session.ts";

interface Props {
  responses: UserResponse[];
  questions: Question[];
}

export default function AnswerTable(props: Props) {
  const { responses, questions } = props;
  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Your Answer</th>
            <th>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response, idx) => {
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{response.value}</td>
                <td>{questions[idx].correct}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
