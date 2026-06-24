import { ArrowRight } from "lucide-react";

import type { z } from "zod";
import type { caseStudyDecisionSchema } from "@/content/schemas";

type Decision = z.infer<typeof caseStudyDecisionSchema>;

export function DecisionLedger({
  decisions,
  labels,
}: {
  decisions: Decision[];
  labels: {
    decision: string;
    context: string;
    choice: string;
    consequence: string;
  };
}) {
  return (
    <ol className="divide-y divide-border/70 border-y border-border/70">
      {decisions.map((decision, index) => (
        <li
          key={`${index}-${decision.title}`}
          className="grid gap-5 py-7 first:pt-0 last:pb-0 md:grid-cols-[11rem_1fr]"
        >
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {labels.decision} {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold leading-snug text-balance">
              {decision.title}
            </h3>
          </div>
          <dl className="grid gap-4 text-sm leading-7 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                {labels.context}
              </dt>
              <dd className="mt-1 text-foreground/75">{decision.context}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                <ArrowRight aria-hidden="true" className="size-3" />
                {labels.choice}
              </dt>
              <dd className="mt-1 text-foreground">{decision.choice}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                {labels.consequence}
              </dt>
              <dd className="mt-1 text-foreground/75">
                {decision.consequence}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
