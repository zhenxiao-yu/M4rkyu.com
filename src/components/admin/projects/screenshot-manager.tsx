import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Section, Field } from "@/components/admin/form-kit";
import { ImageDropzone, type DropzoneLabels } from "@/components/admin/image-dropzone";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { cn, FOCUS_RING } from "@/lib/utils";
import {
  addProjectScreenshotAction,
  updateProjectScreenshotAction,
  deleteProjectScreenshotAction,
  reorderProjectScreenshotAction,
} from "@/lib/projects/admin";

export interface ScreenshotManagerLabels {
  title: string;
  addTitle: string;
  add: string;
  labelLabel: string;
  labelHint: string;
  captionLabel: string;
  altLabel: string;
  save: string;
  delete: string;
  deleteConfirm: string;
  moveUp: string;
  moveDown: string;
  empty: string;
  imageLabel: string;
  imageHint: string;
}

export interface ManagedScreenshot {
  id: string;
  url: string | null;
  label: string;
  caption: string;
  alt: string;
}

/**
 * Edit-page manager for a project's labeled screenshots. Each shot lives in
 * the content-images bucket; rows here upload / relabel / reorder / delete via
 * server actions that revalidate the public /work/[slug] page. Server
 * component — only the ImageDropzone child is interactive.
 */
export function ScreenshotManager({
  projectId,
  slug,
  screenshots,
  labels,
  dropzone,
}: {
  projectId: string;
  slug: string;
  screenshots: ManagedScreenshot[];
  labels: ScreenshotManagerLabels;
  dropzone: DropzoneLabels;
}) {
  return (
    <Section title={labels.title}>
      {screenshots.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="grid gap-4">
          {screenshots.map((shot, index) => (
            <li
              key={shot.id}
              className="grid gap-3 rounded-md border border-border/60 bg-background/50 p-4 sm:grid-cols-[8rem_1fr]"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-md border border-border/60 bg-muted">
                {shot.url ? (
                  <Image
                    src={shot.url}
                    alt={shot.alt || shot.label}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="grid gap-3">
                <form
                  action={updateProjectScreenshotAction}
                  className="grid gap-3"
                >
                  <input type="hidden" name="id" value={shot.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <Field
                    label={labels.labelLabel}
                    name="label"
                    defaultValue={shot.label}
                    hint={labels.labelHint}
                  />
                  <Field
                    label={labels.captionLabel}
                    name="caption"
                    defaultValue={shot.caption}
                    multiline
                    rows={2}
                  />
                  <Field
                    label={labels.altLabel}
                    name="alt"
                    defaultValue={shot.alt}
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" variant="outline">
                      {labels.save}
                    </Button>
                  </div>
                </form>

                <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                  <form action={reorderProjectScreenshotAction}>
                    <input type="hidden" name="id" value={shot.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      aria-label={labels.moveUp}
                      disabled={index === 0}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-ring/50 disabled:opacity-40",
                        FOCUS_RING,
                      )}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                  </form>
                  <form action={reorderProjectScreenshotAction}>
                    <input type="hidden" name="id" value={shot.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      aria-label={labels.moveDown}
                      disabled={index === screenshots.length - 1}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-ring/50 disabled:opacity-40",
                        FOCUS_RING,
                      )}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </form>
                  <form action={deleteProjectScreenshotAction} className="ml-auto">
                    <input type="hidden" name="id" value={shot.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <DeleteButton
                      variant="outline"
                      size="sm"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      confirmMessage={labels.deleteConfirm}
                    >
                      {labels.delete}
                    </DeleteButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add a new screenshot */}
      <form
        action={addProjectScreenshotAction}
        className="grid gap-3 rounded-md border border-dashed border-border/70 bg-background/40 p-4"
      >
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {labels.addTitle}
        </p>
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="slug" value={slug} />
        <ImageDropzone
          name="image"
          label={labels.imageLabel}
          hint={labels.imageHint}
          labels={dropzone}
          optimize
          required
        />
        <Field label={labels.labelLabel} name="label" hint={labels.labelHint} />
        <Field label={labels.captionLabel} name="caption" multiline rows={2} />
        <Field label={labels.altLabel} name="alt" />
        <div>
          <Button type="submit" size="sm">
            {labels.add}
          </Button>
        </div>
      </form>
    </Section>
  );
}
