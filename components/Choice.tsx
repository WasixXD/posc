import { JSX } from "preact/jsx-runtime";

type Props = {
  value: string;
  correct: boolean;
  toShow: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function Choice(props: Props) {
  return (
    <div
      {...props}
      class="cursor-pointer flex flex-row items-center justify-between p-4 w-full rounded-box border border-base-content/5 bg-base-100 hover:scale-105 hover:shadow-lg transition-transform duration-200"
    >
      <span class="self-start">
        {props.value}
      </span>

      <span class="self-end">
        {props.toShow && (
          !props.correct
            ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                class="w-6 h-6 bg-error"
              >
                <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
              </svg>
            )
            : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                class="w-6 h-6 bg-success"
              >
                <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
              </svg>
            )
        )}
      </span>
    </div>
  );
}
