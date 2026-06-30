"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import {
  AutosaveSelect,
  AutosaveTags,
  AutosaveText,
  AutosaveToggle,
} from "../autosave/fields";
import type { AutosaveResult } from "../autosave/use-autosave-field";
import type { GalleryManagerItem } from "./use-collection-items-manager";

export function GalleryItemEditPanel({
  item,
  open,
  onOpenChange,
  setFields,
}: {
  item: GalleryManagerItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setFields: (
    id: string,
    patch: Record<string, unknown>,
  ) => Promise<AutosaveResult>;
}) {
  const t = useTranslations("AdminGallery");
  const tCommon = useTranslations("Common");
  if (!item) return null;

  const id = item.id;
  const save = (patch: Record<string, unknown>) => setFields(id, patch);

  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];
  const typeOptions = [
    { value: "image", label: t("itemType.image") },
    { value: "contact-sheet", label: t("itemType.contactSheet") },
    { value: "process", label: t("itemType.process") },
  ];
  const aspectOptions = ["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"].map((v) => ({
    value: v,
    label: v,
  }));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="m4-dialog-overlay fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            // Bottom sheet on phones; right-side sheet on >= sm.
            "fixed inset-x-0 bottom-0 z-50 max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border bg-popover p-5 text-popover-foreground shadow-xl focus:outline-none",
            "sm:inset-y-0 sm:bottom-auto sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[27rem] sm:max-w-[92vw] sm:rounded-none sm:rounded-l-2xl",
          )}
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted/30">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.alt || item.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold leading-tight">
                {t("panel.title")}
              </Dialog.Title>
              <Dialog.Description className="truncate text-xs text-muted-foreground">
                {item.title}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className={cn(
                "rounded-sm p-1 text-muted-foreground opacity-80 transition-opacity hover:opacity-100",
                FOCUS_RING_INSET,
              )}
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{tCommon("close")}</span>
            </Dialog.Close>
          </div>

          <div className="grid gap-4">
            <AutosaveText
              label={t("titleLabel")}
              value={item.title}
              onSave={(v) => save({ title: v })}
            />
            <AutosaveText
              label={t("altLabel")}
              value={item.alt}
              hint={t("altHint")}
              onSave={(v) => save({ alt: v })}
            />
            <AutosaveText
              label={t("captionLabel")}
              value={item.caption}
              multiline
              onSave={(v) => save({ caption: v })}
            />
            <AutosaveTags
              label={t("panel.tagsLabel")}
              value={item.tags}
              hint={t("panel.tagsHint")}
              onSave={(v) => save({ tags: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <AutosaveSelect
                label={t("statusLabel")}
                value={item.status}
                options={statusOptions}
                onSave={(v) => save({ status: v })}
              />
              <AutosaveSelect
                label={t("typeLabel")}
                value={item.type}
                options={typeOptions}
                onSave={(v) => save({ type: v })}
              />
              <AutosaveSelect
                label={t("aspectLabel")}
                value={item.aspect}
                options={aspectOptions}
                onSave={(v) => save({ aspect: v })}
              />
              <AutosaveText
                label={t("locationLabel")}
                value={item.location}
                onSave={(v) => save({ location: v })}
              />
            </div>
            <AutosaveText
              label={t("capturedAtLabel")}
              value={item.capturedAt}
              hint={t("capturedAtHint")}
              onSave={(v) => save({ capturedAt: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <AutosaveToggle
                label={t("featured")}
                value={item.featured}
                onSave={(v) => save({ featured: v })}
              />
              <AutosaveToggle
                label={t("pinned")}
                value={item.pinned}
                onSave={(v) => save({ pinned: v })}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
