// Vibe Coded
"use client";

import { useEffect, useRef } from "preact/hooks";

// https://github.com/denoland/fresh_charts/blob/main/deps.ts
import * as ChartJs from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";
import { Question, UserResponse } from "../session/session.ts";
import { Tag } from "../routes/api/list/tag.ts";

interface Props {
  responses: UserResponse[];
  questions: Question[];
  tags: Tag[];
}

export default function MyChart(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stats = new Map<number, { corrects: number; errors: number }>();

  for (let i = 0; i < props.responses.length; i++) {
    const response = props.responses[i];
    const question = props.questions[i];
    if (!stats.has(response.tagId)) {
      stats.set(response.tagId, { corrects: 0, errors: 0 });
    }
    const tagStats = stats.get(response.tagId)!;
    if (response.value === question.correct) {
      tagStats.corrects++;
    } else {
      tagStats.errors++;
    }
  }

  const labels: string[] = [];
  const corrects: number[] = [];
  const errors: number[] = [];

  for (const [tagId, { corrects: c, errors: e }] of stats) {
    const tag = props.tags.find((t) => t.tag_id === tagId);
    if (!tag) continue;
    labels.push(tag.name);
    corrects.push(c);
    errors.push(e);
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new ChartJs.Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Corrects",
            data: corrects,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
          },
          {
            label: "Errors",
            data: errors,
            backgroundColor: "rgba(255, 99, 132, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" as const },
          title: { display: true, text: "Tag Performance" },
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => chart.destroy();
  }, [labels.join(","), corrects.join(","), errors.join(",")]);

  return <canvas ref={canvasRef}></canvas>;
}
