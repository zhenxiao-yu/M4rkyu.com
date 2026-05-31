---
title: shadcn/ui v4 — full reference + M4rkyu mapping
status: living
audience: implementation agents (Claude, Codex), human reviewers
last_updated: 2026-05-11
companion_to: docs/UI_LIBRARY_STRATEGY.md
---

# shadcn/ui v4 — Full Reference + M4rkyu Mapping

> **Thesis.** shadcn/ui doesn't look ugly because the primitives are
> ugly. It looks ugly when AI composes the primitives at the atom level
> while the official docs/site composes them through *blocks*,
> *complete page examples*, and a handful of **opinionated compositional
> tricks** (data-slot selectors, container queries, `Field`/`Item`/
> `Empty` semantics, ButtonGroup nesting). This doc is the M4rkyu-
> specific reference for those tricks.
>
> The companion doc [UI_LIBRARY_STRATEGY.md](UI_LIBRARY_STRATEGY.md)
> defines *which* UI sources we draw from. **This** doc defines *how*
> to compose shadcn v4 once we've drawn from it.
>
> **Route note:** the `/portal` slots referenced below are historical —
> `/portal` is not in the current app tree. Read them as design intent,
> not a live route.

## Why this doc exists

A WeChat / Twitter thread (May 2026) circulated the diagnosis that
prompted this audit:

- shadcn/ui's marketing site looks polished. Vibe-coded apps built on
  shadcn look like prototypes.
- Difference: the marketing site uses **variant combinations**, **block
  composition**, and **state-driven layouts** through container queries
  + `data-slot` selectors. AI typically composes at the atom level.
- Fix: clone the shadcn v4 site source and have a tool (Claude / Cursor
  / whatever) produce a structured reference doc that lists primitives
  by full path, then catalogs the blocks + complete page examples + the
  composition patterns. Then use that reference when generating UI.

This file is that reference, scoped to M4rkyu's surfaces.

**Source cloned at:** `h:/Github/shadcn-ui-source/` (shallow clone of
`shadcn-ui/ui` `main`). The v4 site app lives at
`h:/Github/shadcn-ui-source/apps/v4/`.

## Table of contents

1. [Source map](#1-source-map)
2. [Primitive inventory and the M4rkyu gap](#2-primitive-inventory-and-the-m4rkyu-gap)
3. [Composition patterns — the toolkit](#3-composition-patterns--the-toolkit)
4. [Block catalog](#4-block-catalog)
5. [Complete page examples](#5-complete-page-examples)
6. [M4rkyu page mapping](#6-m4rkyu-page-mapping)
7. [Recommended action list](#7-recommended-action-list)

---

## 1. Source map

The v4 app under `apps/v4/` is a real Next.js site, and every demo,
block, and full-page example is committed there. Useful entry points:

| Purpose | Path |
|---|---|
| All primitives (57) | `h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/ui/` |
| Per-primitive demos (~235) | `h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/examples/` |
| Composable blocks (28) | `h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/blocks/` |
| Chart variants (70) | `h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/charts/` |
| Complete page examples (5) | `h:/Github/shadcn-ui-source/apps/v4/app/(app)/examples/` |
| Docs site routes | `h:/Github/shadcn-ui-source/apps/v4/app/(app)/docs/` |
| Tailwind tokens / theme | `h:/Github/shadcn-ui-source/apps/v4/app/globals.css` |

When you want to lift a pattern, open the primitive *and* the demo file.
The demo is where the composition tricks live; the primitive alone is
just the slot definition.

---

## 2. Primitive inventory and the M4rkyu gap

### 2.1 Inventory

shadcn v4 ships **57 primitives** in `registry/new-york-v4/ui/`. M4rkyu
currently has **16** at [src/components/ui/](../src/components/ui/).
The 41-primitive gap is the surface area an engineer could pull from
when composing — most relevant to M4rkyu's surfaces are tagged
**[fits]** below.

| Primitive | M4rkyu has it? | M4rkyu fit | Source path |
|---|---|---|---|
| accordion | ❌ | medium — for FAQ-style sections on /about or /contact | `ui/accordion.tsx` |
| alert | ❌ | medium — could replace ad-hoc warning copy | `ui/alert.tsx` |
| alert-dialog | ❌ | low — we have `Dialog`, no destructive flows yet | `ui/alert-dialog.tsx` |
| aspect-ratio | ❌ | **[fits]** — gallery covers, video frames | `ui/aspect-ratio.tsx` |
| avatar | ❌ | **[fits]** — author bylines, comment cards, timeline | `ui/avatar.tsx` |
| badge | ✅ | already in use | `src/components/ui/badge.tsx` |
| breadcrumb | ❌ | **[fits]** — inner routes (`/work/[slug]`, `/archive/[collection]`, `/logs/[slug]`, `/games/[slug]`) | `ui/breadcrumb.tsx` |
| **button-group** (v4) | ❌ | **[fits]** — filter toolbars, split buttons, action clusters | `ui/button-group.tsx` |
| button | ✅ | already in use | `src/components/ui/button.tsx` |
| calendar | ❌ | low — no date picker needed | `ui/calendar.tsx` |
| card | ✅ | **needs upgrade** — see §2.2 | `src/components/ui/card.tsx` |
| carousel | ❌ | **[fits]** — /media reels, /archive frame strips | `ui/carousel.tsx` |
| chart | ❌ | low — portfolio doesn't show metrics | `ui/chart.tsx` |
| checkbox | ❌ | low — no settings UI | `ui/checkbox.tsx` |
| collapsible | ✅ | already in use | `src/components/ui/collapsible.tsx` |
| combobox | ❌ | medium — tag/category autocomplete on /work and /resources | `ui/combobox.tsx` |
| command | ✅ | already in use (cmd+k) | `src/components/ui/command.tsx` |
| context-menu | ❌ | low — no desktop-app patterns | `ui/context-menu.tsx` |
| dialog | ✅ | already in use | `src/components/ui/dialog.tsx` |
| direction | ❌ | low — we're LTR for both locales | `ui/direction.tsx` |
| drawer | ❌ | **[fits]** — mobile preview / lightbox / archive details | `ui/drawer.tsx` |
| dropdown-menu | ❌ | **[fits]** — header notification bell groups, row actions on /work index | `ui/dropdown-menu.tsx` |
| **empty** (v4) | ❌ | **[fits]** — replaces our custom `EmptyArchiveState` | `ui/empty.tsx` |
| **field** (v4) | ❌ | **[fits]** — contact form (replaces `FormField` wrapper) | `ui/field.tsx` |
| form | ❌ | medium — we use RHF directly; `Form` adds RHF context bindings | `ui/form.tsx` |
| hover-card | ❌ | **[fits]** — project preview on hover from /work index | `ui/hover-card.tsx` |
| **input-group** (v4) | ❌ | **[fits]** — search inputs with leading icon (replaces our `relative span` workaround on /work and /resources) | `ui/input-group.tsx` |
| input-otp | ❌ | low — no auth flow | `ui/input-otp.tsx` |
| input | ✅ | already in use | `src/components/ui/input.tsx` |
| **item** (v4) | ❌ | **[fits]** — perfect for /logs timeline, /resources rows, /about timeline, status pulse | `ui/item.tsx` |
| **kbd** (v4) | ❌ | **[fits]** — Cmd+K hints, palette shortcut display | `ui/kbd.tsx` |
| label | ❌ | medium — pairs with `Field`; our form uses RHF-driven labels | `ui/label.tsx` |
| menubar | ❌ | low — desktop-app pattern | `ui/menubar.tsx` |
| native-select | ❌ | low — we use `Select` | `ui/native-select.tsx` |
| navigation-menu | ✅ | already in use | `src/components/ui/navigation-menu.tsx` |
| pagination | ❌ | medium — /logs and /work when content grows | `ui/pagination.tsx` |
| popover | ❌ | medium — could replace some custom dropdowns | `ui/popover.tsx` |
| progress | ❌ | low — could show content-coverage but optional | `ui/progress.tsx` |
| radio-group | ❌ | low — no settings UI | `ui/radio-group.tsx` |
| resizable | ❌ | low — no split-pane UI | `ui/resizable.tsx` |
| scroll-area | ❌ | **[fits]** — long dropdowns, mobile nav | `ui/scroll-area.tsx` |
| select | ✅ | already in use | `src/components/ui/select.tsx` |
| separator | ❌ | medium — between sections (we use `border-b` ad-hoc) | `ui/separator.tsx` |
| sheet | ✅ | already in use (mobile nav) | `src/components/ui/sheet.tsx` |
| sidebar | ❌ | optional — we deliberately chose bento dock, see §6 | `ui/sidebar.tsx` |
| skeleton | ❌ | **[fits]** — `loading.tsx` files currently render raw divs | `ui/skeleton.tsx` |
| slider | ❌ | low — no parameter UI | `ui/slider.tsx` |
| sonner | ✅ | already in use | `src/components/ui/sonner.tsx` |
| **spinner** (v4) | ❌ | medium — form submit pending, lazy-loaded sections | `ui/spinner.tsx` |
| switch | ❌ | low — no settings UI | `ui/switch.tsx` |
| table | ❌ | low — portfolio doesn't use tables | `ui/table.tsx` |
| tabs | ✅ | already in use | `src/components/ui/tabs.tsx` |
| textarea | ❌ | medium — pairs with `Field`; we use raw `<textarea>` | `ui/textarea.tsx` |
| toggle-group | ❌ | **[fits]** — filter chips on /work and /resources (replaces `Button > Badge` pattern) | `ui/toggle-group.tsx` |
| toggle | ❌ | medium — single-toggle chips | `ui/toggle.tsx` |
| tooltip | ✅ | already in use | `src/components/ui/tooltip.tsx` |

**Highest-value additions for M4rkyu** (the "if you only add 8" set,
ordered by ROI):

1. `field` + `label` + `textarea` — rewrites contact form into the v4
   idiom, gets accessibility wins for free.
2. `item` + `item-group` + `item-separator` — replaces three custom
   list patterns (logs timeline, resources rows, about timeline).
3. `empty` — replaces the custom `EmptyArchiveState`.
4. `breadcrumb` — every detail route currently lacks one.
5. `input-group` — replaces the `relative span` + absolute icon hack
   used in /work and /resources search.
6. `toggle-group` + `toggle` — replaces the `Button > Badge` filter
   chip pattern.
7. `kbd` — for the Cmd+K hint in `CommandPaletteTrigger`.
8. `skeleton` — for the `loading.tsx` files.

### 2.2 Card needs a v4 upgrade

M4rkyu's [src/components/ui/card.tsx](../src/components/ui/card.tsx) is
a v3-era port. The v4 Card at
`h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/ui/card.tsx`
adds three things we use poorly:

| Slot / feature | Why it matters |
|---|---|
| `data-slot="card-..."` attributes on every part | Lets you write `*:data-[slot=card]:bg-gradient-to-t` and reach every Card child from the parent without per-card classes. Used in [dashboard section cards](#511-dashboard) to apply a gradient + shadow with one selector. |
| `CardAction` slot in `CardHeader` | Top-right action area that auto-grids when present (`has-data-[slot=card-action]:grid-cols-[1fr_auto]`). Replaces every `<div className="flex justify-between">` we wrote inside CardHeader. |
| `@container/card` container query root | Sub-card text resize at e.g. `@[250px]/card:text-3xl` — the card responds to its own width, not viewport. KPI digits stay readable when a card sits in a narrow column. |

M4rkyu currently writes the section card pattern like:

```tsx
<CardHeader>
  <div className="flex items-center justify-between gap-2">
    <Badge>...</Badge>
    <ArrowUpRight />
  </div>
  <CardTitle>...</CardTitle>
</CardHeader>
```

The v4 idiom is:

```tsx
<CardHeader>
  <CardDescription>...</CardDescription>
  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    ...
  </CardTitle>
  <CardAction>
    <Badge variant="outline">
      <IconTrendingUp />
      +12.5%
    </Badge>
  </CardAction>
</CardHeader>
```

The v4 version is more semantic, automatically responsive, and lets
parent grids drive child styling.

---

## 3. Composition patterns — the toolkit

This is the section the WeChat thread is pointing at: the small set of
compositional tricks that make shadcn-the-site look polished. Each
pattern lists the primitives, the canonical demo path, and a short
code shape.

### 3.1 Cards and section grids

#### Card + Action + container query

`Card + CardHeader + CardDescription + CardTitle + CardAction + CardFooter`

Source: `apps/v4/app/(app)/examples/dashboard/components/section-cards.tsx`

Why this beats naive `Card`: parent grid hits every card via
`*:data-[slot=card]:bg-gradient-to-t`; each card is its own container
(`@container/card`); the title resizes when the *card* is wider than
250px, regardless of viewport.

```tsx
<div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
  <Card className="@container/card">
    <CardHeader>
      <CardDescription>Total Revenue</CardDescription>
      <CardTitle className="text-2xl tabular-nums @[250px]/card:text-3xl">
        $1,250.00
      </CardTitle>
      <CardAction>
        <Badge variant="outline">
          <IconTrendingUp /> +12.5%
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <div className="line-clamp-1 font-medium">Trending up</div>
      <div className="text-muted-foreground">Last 6 months</div>
    </CardFooter>
  </Card>
</div>
```

#### Card with form & action link

`Card + CardHeader + CardAction + CardContent + CardFooter + Label + Input`

Source: `examples/card-demo.tsx`

`CardAction` slot positions a link button (e.g. "Sign Up") top-right of
the header without manual flex; `CardFooter` with `flex-col gap-2`
stacks primary/secondary CTAs on mobile.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardAction>
      <Button variant="link">Sign Up</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex-col gap-2">
    <Button className="w-full">Login</Button>
  </CardFooter>
</Card>
```

### 3.2 Inputs and forms

#### InputGroup with leading icon

`InputGroup + InputGroupInput + InputGroupAddon (align="inline-start")`

Source: `examples/input-group-icon.tsx`

Replaces the relative-span + absolutely-positioned-Search-icon idiom in
[work/_client.tsx](../src/app/[locale]/work/_client.tsx) and
[resources/_client.tsx](../src/app/[locale]/resources/_client.tsx). The
addon click bubbles focus to the input (`input-group.tsx` line 72).

```tsx
<InputGroup>
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search projects..." />
</InputGroup>
```

#### InputGroup with trailing addons + tooltip

`InputGroup + InputGroupInput + InputGroupAddon (inline-end) + InputGroupButton + Tooltip`

Source: `examples/input-group-demo.tsx`

Multiple trailing addons stack with no collision; `InputGroupButton
size="icon-xs"` matches input height; tooltip wraps the button for
context.

```tsx
<InputGroup>
  <InputGroupInput placeholder="example.com" />
  <InputGroupAddon>
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <InputGroupAddon align="inline-end">
    <Tooltip>
      <TooltipTrigger asChild>
        <InputGroupButton size="icon-xs">
          <IconInfoCircle />
        </InputGroupButton>
      </TooltipTrigger>
      <TooltipContent>Hint text</TooltipContent>
    </Tooltip>
  </InputGroupAddon>
</InputGroup>
```

#### InputGroup with textarea + character counter

`InputGroup + InputGroupTextarea + InputGroupAddon (block-end) + InputGroupText`

Source: `examples/form-next-demo.tsx`

The textarea lives inside the group; the counter pins to bottom-right
via `align="block-end"`. Replaces our custom textarea in the contact
form.

```tsx
<InputGroup>
  <InputGroupTextarea name="description" rows={6} />
  <InputGroupAddon align="block-end">
    <InputGroupText className="tabular-nums">
      {len}/100 characters
    </InputGroupText>
  </InputGroupAddon>
</InputGroup>
```

#### InputGroup with spinner (loading state)

`InputGroup + InputGroupInput + InputGroupAddon + Spinner`

Source: `examples/input-group-spinner.tsx`

Disabled state via `data-disabled` on the group; the spinner sits in
the trailing addon. Pattern is perfect for an async-validate input
(e.g. "checking slug availability...").

#### Field + FieldGroup + FieldDescription

`FieldSet + FieldGroup + Field + FieldLabel + Input + FieldDescription`

Source: `examples/field-input.tsx` and `examples/field-demo.tsx`

The v4 `Field` system is what we should rebuild the contact form on.
It carries:

- `FieldSet` → semantic `<fieldset>` root for a form section
- `FieldLegend` → labelled section heading
- `FieldGroup` → spacing container, supports container queries
- `Field` → row, has `orientation="vertical | horizontal | responsive"`
- `FieldLabel` / `FieldTitle` → linked to control via `htmlFor`
- `FieldDescription` → secondary helper text below input
- `FieldError` → red `role="alert"` text below input
- `FieldSeparator` → optional "Or" divider with text

```tsx
<FieldSet>
  <FieldLegend>Account</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" />
      <FieldDescription>Choose a unique username.</FieldDescription>
    </Field>
  </FieldGroup>
</FieldSet>
```

#### Field with horizontal checkbox/radio

`Field (orientation="horizontal") + Checkbox + FieldLabel`

Source: `examples/field-checkbox.tsx`

`orientation="horizontal"` aligns control + label inline; `font-normal`
on `FieldLabel` keeps it visually subordinate.

```tsx
<Field orientation="horizontal">
  <Checkbox id="terms" />
  <FieldLabel htmlFor="terms" className="font-normal">
    I agree to the terms
  </FieldLabel>
</Field>
```

#### Form + Field + InputGroup + Server Action

`Form + FieldGroup + Field + InputGroup + Spinner + FieldError`

Source: `examples/form-next-demo.tsx`

`useActionState` drives pending state; `data-invalid` on `Field`
shifts the label/border to destructive colors; `FieldError` renders
the validation message.

```tsx
<Form action={formAction}>
  <FieldGroup>
    <Field data-invalid={!!state.errors?.title}>
      <FieldLabel htmlFor="title">Title</FieldLabel>
      <Input id="title" name="title" />
      {state.errors?.title && (
        <FieldError>{state.errors.title[0]}</FieldError>
      )}
    </Field>
  </FieldGroup>
  <Button type="submit" disabled={pending}>
    {pending && <Spinner />}
    Submit
  </Button>
</Form>
```

### 3.3 Buttons and toolbars

#### ButtonGroup — basic horizontal

`ButtonGroup + Button (multiple)`

Source: `ui/button-group.tsx` + `examples/button-group-demo.tsx`

Children inherit `rounded-l-none` / `rounded-r-none` on internal
borders via the parent's `[&>*:not(:first-child)]` selector — you get a
unified pill without setting any per-button classes.

```tsx
<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Middle</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>
```

#### ButtonGroup — split (button + dropdown)

`ButtonGroup + Button + ButtonGroupSeparator + Button (icon)`

Source: `examples/button-group-split.tsx`

`ButtonGroupSeparator` is a visual divider; both halves share `variant`.

```tsx
<ButtonGroup>
  <Button variant="secondary">Save</Button>
  <ButtonGroupSeparator />
  <Button size="icon" variant="secondary">
    <IconPlus />
  </Button>
</ButtonGroup>
```

#### ButtonGroup — nested segments

`ButtonGroup (outer) + ButtonGroup (multiple inner)`

Source: `examples/button-group-demo.tsx`

Nested `ButtonGroup`s create *segments* with a small gap between them
(`has-[>[data-slot=button-group]]:gap-2`). Use for grouping
related-but-distinct actions (back/forward · archive · snooze).

```tsx
<ButtonGroup>
  <ButtonGroup className="hidden sm:flex">
    <Button size="icon" variant="outline"><ArrowLeft /></Button>
    <Button size="icon" variant="outline"><ArrowRight /></Button>
  </ButtonGroup>
  <ButtonGroup>
    <Button variant="outline">Archive</Button>
  </ButtonGroup>
  <ButtonGroup>
    <Button variant="outline">Snooze</Button>
    <Button size="icon" variant="outline"><MoreHorizontal /></Button>
  </ButtonGroup>
</ButtonGroup>
```

#### ButtonGroup + InputGroup composer

`ButtonGroup (outer, full-radius) + Button + InputGroup + InputGroupAddon`

Source: `examples/button-group-input-group.tsx`

Sets `[--radius:9999rem]` on the outer group → pill-shaped composer.
The plus icon and message input share one rounded shell; voice-toggle
button inside the input addon uses `data-active` for state.

```tsx
<ButtonGroup className="[--radius:9999rem]">
  <ButtonGroup>
    <Button size="icon" variant="outline"><PlusIcon /></Button>
  </ButtonGroup>
  <ButtonGroup>
    <InputGroup>
      <InputGroupInput placeholder="Send a message..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" data-active={voiceOn}>
          <AudioLinesIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </ButtonGroup>
</ButtonGroup>
```

#### ToggleGroup — filter chips

`ToggleGroup + ToggleGroupItem`

Source: `examples/toggle-group-demo.tsx`

`type="single"` for radio-like behavior; `type="multiple"` for
checkboxes; `variant="outline"` applies to every item; ARIA roles
managed automatically. Replaces the `Button > Badge` + `aria-pressed`
chip pattern in [work/_client.tsx](../src/app/[locale]/work/_client.tsx)
and [resources/_client.tsx](../src/app/[locale]/resources/_client.tsx).

```tsx
<ToggleGroup type="single" variant="outline" value={category} onValueChange={setCategory}>
  <ToggleGroupItem value="">All</ToggleGroupItem>
  <ToggleGroupItem value="web-app">Web App</ToggleGroupItem>
  <ToggleGroupItem value="game-dev">Game Dev</ToggleGroupItem>
</ToggleGroup>
```

### 3.4 Lists and rows — the Item primitive

The `Item` primitive (v4) is one of the highest-value additions for
M4rkyu. Three M4rkyu surfaces are list-shaped and would benefit:

- /logs timeline rows
- /resources cards (could become rows or stay cards — both work)
- /about timeline
- /portal shell-slot tiles

#### Item — title + description + action

`Item (variant="outline") + ItemContent + ItemTitle + ItemDescription + ItemActions`

Source: `examples/item-demo.tsx`

```tsx
<Item variant="outline">
  <ItemContent>
    <ItemTitle>Project name</ItemTitle>
    <ItemDescription>One-line pitch describing the project.</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="outline" size="sm">Open</Button>
  </ItemActions>
</Item>
```

#### Item — avatar + clickable row

`Item (asChild) + ItemMedia + Avatar + ItemContent + ItemTitle + ItemActions`

Source: `examples/item-avatar.tsx`

`asChild` lets the whole row be a link. `ItemMedia` controls avatar
sizing; `ItemActions` carries the trailing icon. Maps directly onto a
"recent posts" / "team members" / "writing pulse" row.

```tsx
<Item variant="outline" asChild>
  <a href="/logs/post-slug">
    <ItemMedia>
      <Avatar className="size-10">
        <AvatarImage src={post.coverImage} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </ItemMedia>
    <ItemContent>
      <ItemTitle>{post.title}</ItemTitle>
      <ItemDescription>{post.publishedAt} · {post.readingTime} min</ItemDescription>
    </ItemContent>
    <ItemActions>
      <ArrowRightIcon className="size-4" />
    </ItemActions>
  </a>
</Item>
```

#### Item — spinner row (loading state)

`Item (variant="muted") + ItemMedia + Spinner + ItemContent + ItemTitle`

Source: `examples/spinner-demo.tsx`

A "processing..." row inside a list. Pattern is reusable for any async
operation embedded in a list view.

#### ItemGroup — list with separators

`ItemGroup + Item (multiple) + ItemSeparator`

Source: `ui/item.tsx` line 8

`ItemGroup` adds `role="list"` for screen readers; `ItemSeparator`
inserts a thin horizontal line. Cleaner than the `<details>` pattern in
[work/_client.tsx](../src/app/[locale]/work/_client.tsx) for collapsed
draft lists.

### 3.5 Empty states

#### Empty — icon + title + description + actions

`Empty + EmptyHeader + EmptyMedia (variant="icon") + EmptyTitle + EmptyDescription + EmptyContent`

Source: `examples/empty-demo.tsx`

Replaces M4rkyu's custom `EmptyArchiveState` component. The variant
system + slot layout matches the rest of the v4 vocabulary, and
`text-balance` is already applied at the root.

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <IconFolderCode />
    </EmptyMedia>
    <EmptyTitle>No projects yet</EmptyTitle>
    <EmptyDescription>
      Add your first case study to populate this archive.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add case study</Button>
  </EmptyContent>
</Empty>
```

#### Empty — avatar-stack variant

`Empty + EmptyHeader + EmptyMedia (no variant) + Avatar group + EmptyTitle + EmptyContent`

Source: `examples/empty-avatar-group.tsx`

Replaces a "no team members yet" type empty state with avatar
placeholders.

### 3.6 Feedback, dialogs, drawers

#### Alert — icon + title + description

`Alert + (icon) + AlertTitle + AlertDescription`

Source: `examples/alert-demo.tsx`

`variant="destructive"` for errors; nested `<ul>` allowed in
`AlertDescription`.

#### Dialog vs Drawer — same shape, different breakpoint

`Dialog`, `Drawer` (Vaul) — Sources: `examples/dialog-demo.tsx`,
`examples/drawer-demo.tsx`

`Drawer` slides up from the bottom; pattern is to use a `useIsMobile()`
hook + switch between `Dialog` and `Drawer` for the same content. The
breadcrumb-responsive demo at `examples/breadcrumb-responsive.tsx` is
the canonical example.

```tsx
{isDesktop ? (
  <Dialog>...</Dialog>
) : (
  <Drawer>...</Drawer>
)}
```

#### Sonner toast with action

`Button + toast()` from `sonner`

Source: `examples/sonner-demo.tsx`

```tsx
toast("Saved.", {
  description: "Your changes have been applied.",
  action: { label: "Undo", onClick: () => revert() },
})
```

### 3.7 Navigation

#### Breadcrumb — responsive with ellipsis

`Breadcrumb + BreadcrumbList + BreadcrumbItem + BreadcrumbLink + BreadcrumbSeparator + BreadcrumbEllipsis + DropdownMenu (desktop) / Drawer (mobile)`

Source: `examples/breadcrumb-responsive.tsx`

Uses `useMediaQuery` to swap the truncation UI between dropdown
(desktop) and drawer (mobile). Every detail route on M4rkyu
(`/work/[slug]`, `/archive/[collection]`, `/logs/[slug]`,
`/games/[slug]`) is currently missing breadcrumbs.

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/work">Work</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      {/* DropdownMenu on desktop / Drawer on mobile when truncating */}
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{project.title}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

#### Breadcrumb with dropdown actions

`Breadcrumb + BreadcrumbItem + DropdownMenu + DropdownMenuContent`

Source: `examples/breadcrumb-dropdown.tsx`

Mid-breadcrumb dropdown to switch between sibling routes. Useful for
`/archive/[collection]` where a viewer might want to jump to another
collection without backing up.

#### NavigationMenu with multi-column content

`NavigationMenu + NavigationMenuList + NavigationMenuItem + NavigationMenuTrigger + NavigationMenuContent + NavigationMenuLink`

Source: `examples/navigation-menu-demo.tsx`

M4rkyu has `NavigationMenu` imported but uses a custom bento dock for
the desktop nav. If we ever want the "mega menu with featured item +
two-column link grid" pattern (like shadcn's own docs nav), this is the
shape:

```tsx
<NavigationMenuContent>
  <ul className="grid gap-2 md:w-[500px] md:grid-cols-2">
    <li className="row-span-3">
      <NavigationMenuLink asChild>
        <a className="flex h-full flex-col justify-end rounded-md bg-gradient-to-b p-6">
          <div className="mb-2 text-lg font-medium">Featured item</div>
        </a>
      </NavigationMenuLink>
    </li>
    <ListItem href="/sub-1" title="Sub item">Description</ListItem>
  </ul>
</NavigationMenuContent>
```

### 3.8 Modals, pop-ups, peek

#### HoverCard — profile preview

`HoverCard + HoverCardTrigger (asChild link) + HoverCardContent (w-80) + Avatar + content`

Source: `examples/hover-card-demo.tsx`

Hover a link → small profile/preview card. Maps onto:

- Hover a project title in /logs → show project card preview
- Hover the dev.to byline → show author hover-card
- Hover an `@mention` in a future comment system

#### Popover — grid form (inline editor)

`Popover + PopoverTrigger + PopoverContent + Label + Input`

Source: `examples/popover-demo.tsx`

Quick-edit inline. Pattern is identical to `Dialog` but anchored to a
trigger.

#### Combobox — searchable select

`Popover + PopoverTrigger (Button role="combobox") + Command + CommandInput + CommandList + CommandEmpty + CommandGroup + CommandItem`

Source: `examples/combobox-demo.tsx`

Built from `Command` (which we already use for cmd+k). Replaces our
year-select on /work with one that filters as you type — useful when
the year list grows past ~10.

### 3.9 Display

#### Avatar with fallback

`Avatar + AvatarImage + AvatarFallback`

Source: `examples/avatar-demo.tsx`

```tsx
<Avatar>
  <AvatarImage src="..." alt="@name" />
  <AvatarFallback>MN</AvatarFallback>
</Avatar>
```

Stacked avatars: `flex -space-x-2 *:data-[slot=avatar]:ring-2
*:data-[slot=avatar]:ring-background`.

#### Badge variants + numeric pill

`Badge` with `variant` + className overrides

Source: `examples/badge-demo.tsx`

Numeric pill: `className="h-5 min-w-5 rounded-full px-1 tabular-nums"`.
Use for the unread count on the [NotificationBell](../src/components/system/notification-bell.tsx).

#### Skeleton card

`Skeleton` divs

Source: `examples/skeleton-card.tsx`

Replaces the bare placeholders in M4rkyu's `loading.tsx` files.

```tsx
<div className="flex flex-col space-y-3">
  <Skeleton className="h-[125px] w-[250px] rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

#### Kbd / KbdGroup — shortcut display

`KbdGroup + Kbd (multiple)`

Source: `examples/kbd-demo.tsx`

Maps onto the `⌘K` hint inside
[CommandPaletteTrigger](../src/components/system/command-palette-trigger.tsx).

```tsx
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

#### Pagination

`Pagination + PaginationContent + PaginationItem + PaginationLink + PaginationPrevious + PaginationNext + PaginationEllipsis`

Source: `examples/pagination-demo.tsx`

For /logs and /work when content grows past a single screen.

#### Carousel

`Carousel + CarouselContent + CarouselItem + CarouselPrevious + CarouselNext`

Source: `examples/carousel-demo.tsx`

Reels on /media; "saved frames" rail on /archive; "related work" rail
at the bottom of a project detail page.

#### ScrollArea + Separator

Source: `examples/scroll-area-demo.tsx`

Long lists inside fixed-height containers — long tag lists in a
filter dropdown, long author bios in a sidebar.

### 3.10 Accordion

`Accordion + AccordionItem + AccordionTrigger + AccordionContent`

Source: `examples/accordion-demo.tsx`

`type="single" collapsible` for FAQ-style sections. Useful for
/contact's "services" cards (currently rendered as 4 stacked Cards).

---

## 4. Block catalog

Blocks live at
`h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/blocks/`.
They're whole-section compositions you can lift verbatim. 28 total.

### 4.1 Dashboard (1 block)

#### `dashboard-01`

Path: `blocks/dashboard-01/`

A full app shell: sidebar + sticky header + section cards + interactive
area chart + drag-reorderable data table. Five distinct sub-components:
`app-sidebar.tsx`, `site-header.tsx`, `section-cards.tsx`,
`chart-area-interactive.tsx`, `data-table.tsx`.

Composition: `<SidebarProvider>` → `<AppSidebar variant="inset">` +
`<SidebarInset>` → `<SiteHeader>` + `SectionCards` +
`ChartAreaInteractive` + `DataTable`.

Non-obvious tricks:
- Custom `--sidebar-width` and `--header-height` set on
  `SidebarProvider` via `style={{ ... } as CSSProperties}` (lines 18–20)
- `collapsible="offcanvas"` for mobile (line 155)
- `data-[slot=sidebar-menu-button]:p-1.5!` to tweak just one slot's
  padding without per-button classes (line 161)

### 4.2 Sidebar variants (16 blocks)

For M4rkyu specifically, **we don't use shadcn's `Sidebar`** — the
floating bento dock is a deliberate creative choice. The list below is
for reference if we ever need a sidebar elsewhere (Storybook chrome,
admin tooling, future writing surface).

#### `sidebar-01`
Path: `blocks/sidebar-01/`. Grouped nav with version switcher +
search form. `SidebarGroup` + `SidebarGroupLabel` +
`SidebarGroupContent`. No collapsible.

#### `sidebar-02`
Path: `blocks/sidebar-02/`. Like 01, but each group wrapped in
`<Collapsible defaultOpen>`. ChevronRight rotates via
`group-data-[state=open]/collapsible:rotate-90`.

#### `sidebar-03`
Path: `blocks/sidebar-03/`. Nested submenu via `SidebarMenuSub` +
`SidebarMenuSubButton`. No collapse — submenus always visible.

#### `sidebar-04`
Path: `blocks/sidebar-04/`. Floating variant: `variant="floating"`,
`--sidebar-width: 19rem`. Submenus indented with `ml-0 border-l-0
px-1.5` instead of a border-line.

#### `sidebar-05`
Path: `blocks/sidebar-05/`. Collapsible groups with Plus/Minus toggle
icons. `<Plus className="group-data-[state=open]/collapsible:hidden">`
+ matching Minus.

#### `sidebar-06`
Path: `blocks/sidebar-06/`. Dropdown menus replace nested submenus.
`DropdownMenu` wraps each `SidebarMenuButton`; responsive side via
`isMobile ? "bottom" : "right"`.

#### `sidebar-07`
Path: `blocks/sidebar-07/`. Icon-only collapse via
`collapsible="icon"`. Most-cited reference because of the
`useSidebar()` hook + the "team switcher" pattern.

#### `sidebar-08`
Path: `blocks/sidebar-08/`. Inset variant. Secondary nav pushed to
bottom via `className="mt-auto"`.

#### `sidebar-09`
Path: `blocks/sidebar-09/`. **Two side-by-side sidebars** — narrow
icon sidebar + wide content sidebar with mail list. Pattern:
`className="*:data-[sidebar=sidebar]:flex-row"` on the outer wrapper
makes the two `<Sidebar>` elements stack horizontally.

#### `sidebar-10`
Path: `blocks/sidebar-10/`. Team switcher + favorites + nested
workspaces + secondary nav. `NavMain` items support `badge: "10"` for
unread counts.

#### `sidebar-11`
Path: `blocks/sidebar-11/`. File tree — recursive `Tree` component
toggling between File and Folder icons. `SidebarMenuBadge` shows
git-style state markers (M, U).

#### `sidebar-12`
Path: `blocks/sidebar-12/`. Calendar widget in the sidebar +
`NavUser` in footer. Sticky header above with breadcrumb.

#### `sidebar-13`
Path: `blocks/sidebar-13/`. **Sidebar inside a Dialog modal** — a
settings modal with a left nav. `<Dialog>` → `<SidebarProvider
className="items-start">` → `<Sidebar>` + main content. Sidebar
hidden below md.

#### `sidebar-14`
Path: `blocks/sidebar-14/`. Right-aligned sidebar via `side="right"`.
SidebarTrigger rotated 180°: `-mr-1 ml-auto rotate-180`.

#### `sidebar-15`
Path: `blocks/sidebar-15/`. **Dual symmetric sidebars** —
`SidebarLeft` + `SidebarInset` + `SidebarRight`. Central content
`max-w-3xl`.

#### `sidebar-16`
Path: `blocks/sidebar-16/`. Sticky site header *above* the sidebar.
`SidebarProvider` wrapping a flex-col → `SiteHeader` first → sidebar
+ content. Sidebar height: `top-(--header-height)
h-[calc(100svh-var(--header-height))]!`.

### 4.3 Auth flows (10 blocks)

These are the most M4rkyu-adjacent because /contact is shaped like a
mini auth surface (form + brand split-screen).

#### `login-01`
Path: `blocks/login-01/`. Minimal card-centered form. Email +
password + Google button. Uses the new `Field` / `FieldGroup` /
`FieldLabel` slots.

#### `login-02`
Path: `blocks/login-02/`. Two-column split-screen. Left form, right
cover image. `grid min-h-svh lg:grid-cols-2`. Image styled
`dark:brightness-[0.2] dark:grayscale`.

#### `login-03`
Path: `blocks/login-03/`. Muted background, centered card. Social
buttons primary, email/password below. `FieldSeparator` styled
`*:data-[slot=field-separator-content]:bg-card` (override needed when
inside a Card).

#### `login-04`
Path: `blocks/login-04/`. Card with split-screen interior. `<Card
className="overflow-hidden p-0">` + `<CardContent className="grid p-0
md:grid-cols-2">`. Three social buttons (Apple, Google, Meta) in 3-col
grid.

#### `login-05`
Path: `blocks/login-05/`. Minimal email-only (passwordless flow).
Social buttons in 2-col grid.

#### `signup-01` through `signup-05`
Paths: `blocks/signup-01/` through `signup-05/`. Mirror of the login
blocks with name/email/password/confirm fields and a "Sign in" link
swap.

### 4.4 The composition lesson from the auth blocks

Every block above uses the same primitive set —
`Field` / `FieldGroup` / `FieldLabel` / `FieldSeparator` /
`FieldDescription` / `Card` / `Button` — but each block is *visually*
distinct because of the **outer layout grid** (centered card vs split
screen vs muted bg vs full-bleed card). The blocks are the right
mental model for "how to compose a screen" — the primitives are the
right mental model for "what slots to populate". M4rkyu currently has
the primitives but not the block-level idiom.

---

## 5. Complete page examples

These are entire pages, not blocks. They live at
`h:/Github/shadcn-ui-source/apps/v4/app/(app)/examples/`. Five total.

### 5.1 Dashboard

Path: `app/(app)/examples/dashboard/`

Files:
- `page.tsx` (shell orchestrator)
- `data.json` (KPI seed data)
- `components/app-sidebar.tsx`
- `components/site-header.tsx`
- `components/section-cards.tsx`
- `components/chart-area-interactive.tsx`
- `components/data-table.tsx`
- `components/nav-main.tsx`
- `components/nav-documents.tsx`
- `components/nav-secondary.tsx`
- `components/nav-user.tsx`

#### 5.1.1 Page shell

```tsx
<SidebarProvider
  style={{
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12 + 1px)",
  } as React.CSSProperties}
>
  <AppSidebar variant="inset" />
  <SidebarInset>
    <SiteHeader />
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6"><ChartAreaInteractive /></div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  </SidebarInset>
</SidebarProvider>
```

The `@container/main` on the inner div is critical — every nested grid
queries against this container instead of the viewport. That's how
`section-cards.tsx` gets `@xl/main:grid-cols-2 @5xl/main:grid-cols-4`
to respond to the *content area*, not the *page*.

#### 5.1.2 SiteHeader

Sticky via `bg-background/90` + `backdrop-blur`. Height bound to the
CSS var: `h-(--header-height)`. Hides "Quick Create" button below sm.

#### 5.1.3 SectionCards

4-up KPI cards. See §3.1 for the composition. The selector
`*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs`
applies a gradient + shadow to every Card child of the grid with no
per-card class.

#### 5.1.4 ChartAreaInteractive

Client component. State: `timeRange = "7d" | "30d" | "90d"`. Uses
`useIsMobile()` to hide chart below md. ToggleGroup hidden below 767px,
Select shown — same data, two control surfaces.

#### 5.1.5 DataTable

The heaviest component in the example. Combines:

- TanStack `useReactTable` for state
- dnd-kit `useSortable` for row reorder
- Inline editable cells (Input fields inside cells; submit on blur via
  toast)
- Tabs wrapping the table for "Outline / Past Performance / Key
  Personnel / Focus Documents"
- Sticky table header: `<TableHeader className="sticky top-0 z-10
  bg-muted">`
- Mobile-aware pagination: first/last buttons hidden below lg

For M4rkyu we likely never need this complexity at once, but the
*sticky-header + pagination + view-options* composition is reusable
piecemeal.

### 5.2 Tasks

Path: `app/(app)/examples/tasks/`

The cleanest data-table example. Files:

- `page.tsx` (RSC reads `tasks.json`, validates with
  `z.array(taskSchema)`, renders `<DataTable data={tasks}
  columns={columns} />`)
- `components/columns.tsx` — `ColumnDef<Task>[]` with 6 columns
- `components/data-table.tsx` — generic `<DataTable<TData, TValue>>`
  wrapper
- `components/data-table-toolbar.tsx` — search input + faceted filters
  + reset + view options + add button
- `components/data-table-pagination.tsx` — selection count + page size
  + page nav
- `components/data-table-column-header.tsx` — sortable header with
  dropdown (asc / desc / hide column)
- `components/data-table-row-actions.tsx` — per-row dropdown (edit /
  copy / favorite / labels submenu / delete)
- `components/data-table-view-options.tsx` — column visibility toggle
- `components/data-table-faceted-filter.tsx` — Popover + Command
  filter with facet counts via
  `column?.getFacetedUniqueValues()`

Key trick: **the table is generic** (`<TData, TValue>`) and every
piece is decoupled. Filters, pagination, column controls all hang off
the same `table` instance via TanStack's methods. This is the right
shape for a future M4rkyu "all projects" admin view if we ever need
sortable / filterable lists at scale.

### 5.3 Authentication

Path: `app/(app)/examples/authentication/`

Split-screen: left brand panel (`bg-primary/5`, logo + testimonial
blockquote at bottom), right form card (max-w 350px). The
`UserAuthForm` is built from `FieldGroup` + two Fields + a
`FieldSeparator` ("Or continue with") + OAuth button.

Pattern lifts directly onto M4rkyu's [/contact](../src/app/[locale]/contact/page.tsx)
which already has a 2-column grid: services on the left, form on the
right. We could:

1. Replace the services grid of `Card`s with `Item`s in an `ItemGroup`
2. Rebuild the contact form's `FormField` wrapper as `Field` +
   `FieldLabel` + `FieldDescription` + `FieldError`
3. Add `FieldSeparator` between the form and the "or email directly"
   link

### 5.4 Playground

Path: `app/(app)/examples/playground/`

Two-column tools UI: a tab strip + textarea on the left, parameter
controls on the right (model selector, temperature slider, max-length
slider, top-p slider). Each parameter wraps `Label + Slider` in a
`HoverCard` so hovering the label shows an explanation.

Composition that ports well to M4rkyu: hover-card-wrapped labels are a
clean way to explain content metadata without cluttering the visible
copy. For example, on /work index, hovering the year filter could show
"What I shipped this year" via HoverCard.

Other tricks:
- `PresetSelector` — Popover + Command combobox grouped by category
- `ModelSelector` — Popover + Command with HoverCard peek synced via a
  custom `useMutationObserver` hook on `aria-selected`
- Tab content uses different grid shapes per mode (single textarea vs
  2-col edit-output)

### 5.5 RTL

Path: `app/(app)/examples/rtl/`

Wrapper renders `<DirectionProvider direction="rtl">` + a
`LanguageProvider`. Inner components render with `dir="rtl"`. Useful
for M4rkyu only if we ever add an Arabic / Hebrew locale — currently
both en and zh are LTR.

---

## 6. M4rkyu page mapping

This is the prescriptive section. For each route in M4rkyu, current
composition vs the shadcn v4 pattern that fits.

### 6.1 Home — `/`

**Status:** mostly bespoke (deliberate). Cinematic hero, photo stack,
custom CommandHero, signals band, capabilities spine, status pulse,
featured projects grid, writing pulse, tools strip, gallery preview,
media lane, closing CTA.

**Closest shadcn parallel:** marketing-site landing page. No 1-to-1
block exists — composed from many of the primitives.

| Surface | Current | Suggested |
|---|---|---|
| Hero brief panel ([command-hero.tsx](../src/components/sections/command-hero.tsx)) | `BlurFade > BentoTilt > CursorRadial > PixelPanel + BorderBeam` — strong | Keep. Consider adding `@container/card` for sub-card resize. |
| Status pulse row ([status-pulse-row.tsx](../src/components/sections/status-pulse-row.tsx)) | Custom row | Replace with `ItemGroup` of three `Item`s (ItemMedia variant="icon" + ItemContent + ItemActions) |
| Writing pulse ([writing-pulse-row.tsx](../src/components/sections/writing-pulse-row.tsx)) | Custom 2-up | `Item` variant rows or keep custom for visual variety |
| Featured projects grid | `MissionModuleCard` × 3 | Could borrow `@container/card` + `CardAction` for the cover-trend slot |
| Tools / resources strip | `ResourcePreviewCard` × 3 in `Stagger` grid | Same as above, or `Item variant="outline"` rows for compactness |
| Closing CTA ([closing-cta-strip.tsx](../src/components/sections/closing-cta-strip.tsx)) | Custom | Keep |

### 6.2 /work index

**Closest shadcn parallel:** `apps/v4/app/(app)/examples/tasks/`
(filterable list, but ours is card-based not table-based).

| Surface | Current | Suggested shadcn pattern |
|---|---|---|
| Hero with "archive status" right Card | `<Card>` with custom header | `Card + CardAction` (move `archiveStatus` count badge to `CardAction`) — §3.1 |
| Filter chips | `Button > Badge variant="success/outline"` with `aria-pressed` | `ToggleGroup type="single" variant="outline"` — §3.3 |
| Year `Select` | shadcn `Select` ✅ | Keep |
| Search input with `relative span` + abs icon | Custom | `InputGroup + InputGroupAddon` — §3.2 |
| Drafts `<details>` collapsible | Native HTML | `Collapsible` primitive (already in repo) or `Accordion type="single"` |
| Project card grid | `ProjectCard` in deck-reveal | Keep — bespoke is fine, but consider `@container/card` to let titles resize when the grid breaks to 2-col |
| Project preview on hover | None | Add `HoverCard` — §3.8 |

### 6.3 /work/[slug] detail

**Closest shadcn parallel:** docs page (`apps/v4/app/(app)/docs/`).

| Surface | Current | Suggested |
|---|---|---|
| Top of page | (assumed) hero + body | Add `Breadcrumb` responsive variant — §3.7 |
| Hero media | (assumed) image / video | Wrap in `AspectRatio` to lock layout |
| Related projects rail (if any) | (assumed) | `Carousel` with project cards — §3.9 |

### 6.4 /archive index

**Closest shadcn parallel:** none — bespoke contact-sheet grid. Don't
shadcn-ify; the photographic grid is the wow factor (per
`docs/FINAL_SITE_ARCHITECTURE.md` §5.4).

| Surface | Current | Suggested |
|---|---|---|
| Hero | `SectionHeading` + metadata strip | Replace inline link "view saved" with `Item` row for hierarchy, or keep |
| Frames grid (`GalleryGrid`) | Custom | Keep |
| Collections rail | `CollectionRailCard` × 3 | Could rebuild with `Card + CardAction` for the count badge — §3.1 |

### 6.5 /archive/[collection]

| Surface | Suggested |
|---|---|
| Top of page | Add `Breadcrumb` (Archive → {collection name}) |
| Lightbox dialog | Already custom; consider `Drawer` on mobile + `Dialog` on desktop, switch via `useIsMobile()` — §3.6 |

### 6.6 /logs index

**Closest shadcn parallel:** none direct; closest is a docs/blog index.

| Surface | Current | Suggested |
|---|---|---|
| Hero with "archive status" Card | Same shape as /work | `CardAction` for the post count — §3.1 |
| Pinned post (`PinnedPostCard`) | Custom | `Item asChild` (link) + `ItemMedia variant="image"` + `ItemContent` + `ItemActions` — §3.4 |
| Timeline (`BlogTimeline`) | Custom | `ItemGroup` of `Item asChild` rows with `ItemSeparator` between — §3.4 |

### 6.7 /logs/[slug] detail

| Surface | Suggested |
|---|---|
| Top of page | Add responsive `Breadcrumb` — §3.7 |
| Author byline (if any) | `Avatar + AvatarImage + AvatarFallback` + `HoverCard` peek with author bio |
| Reading metadata (date · reading time · tags) | `KbdGroup` (not literally — borrow the inline-pill aesthetic via `Badge`s in `BadgeGroup` shape) |

### 6.8 /games index

Same shape as /work index. Same recommendations apply: `CardAction`,
`ToggleGroup` if/when filters are added, `Item` rows if you ever want a
compact alternate view.

### 6.9 /games/[slug] detail

Add `Breadcrumb`. Consider `Carousel` for screenshot reels if any.

### 6.10 /resources index

**Closest shadcn parallel:** docs sidebar / list of links (e.g.
`apps/v4/app/(app)/docs/` block index).

| Surface | Current | Suggested |
|---|---|---|
| Filter chips | `Button > Badge` | `ToggleGroup type="single"` — §3.3 |
| Search input | `relative span` + abs icon | `InputGroup` — §3.2 |
| Resource cards | `Card` grid (3-col) with 3 badges + body + outline link | Same Card, but use `CardAction` for the "Visit" outline button — §3.1. Or convert to `Item` rows for higher density. |
| Empty state | `EmptyArchiveState` | `Empty + EmptyHeader + EmptyMedia + EmptyTitle + EmptyDescription` — §3.5 |

### 6.11 /contact

**Closest shadcn parallel:** `app/(app)/examples/authentication/`
(split-screen with form on one side).

| Surface | Current | Suggested |
|---|---|---|
| Hero | `SectionHeading` only | Keep |
| Services grid (left col) | 4 `Card`s with double Badge header | `Item variant="outline"` rows in `ItemGroup`, or `Accordion` if collapsible — §3.4 / §3.10. Move status `Badge` into `ItemActions`. |
| Form (right col) | `Card` wrapping custom `FormField` × 4 + textarea + honeypot + turnstile + 2 buttons | Replace `FormField` with `Field` + `FieldLabel` + `FieldDescription` + `FieldError`. Wrap form in `FieldGroup`. Replace textarea with `InputGroup + InputGroupTextarea + InputGroupAddon (block-end)` if we ever want a character counter. — §3.2 |
| Submit button | `Button` + Send icon | `Button` with `<Spinner />` when `submitting` — §3.2 |
| Honeypot field | Hidden `<input>` | Keep — semantic |

### 6.12 /about

**Closest shadcn parallel:** marketing about page; loosely the
authentication block's brand panel pattern.

| Surface | Current | Suggested |
|---|---|---|
| Hero (text + portrait placeholder) | 2-col grid | Wrap portrait in `AspectRatio` |
| Profile card | `Card` | Keep |
| Values list (numbered) | Custom `grid grid-cols-[2rem_1fr]` | `ItemGroup` of `Item`s with `ItemMedia variant="icon"` showing the number — §3.4 |
| Timeline | Custom `border-l-2` rail | `ItemGroup` with `ItemMedia variant="icon"` (dot) + `ItemSeparator` |

### 6.13 /portal

**Closest shadcn parallel:** loosely the playground page (split shell)
with much heavier theming.

| Surface | Current | Suggested |
|---|---|---|
| Boot shell card | Custom `Card` with `ShineBorder` | Keep |
| Three slot tiles ("caseStudies", "gallery", "media") | Custom div grid | `Empty` per slot — §3.5; or `Item variant="outline"` rows with `ItemTitle` + `ItemDescription` + `ItemActions` for "pending" badge |

### 6.14 /media

| Surface | Current | Suggested |
|---|---|---|
| Hero | 2-col grid with PlaceholderVideo | Keep, wrap video in `AspectRatio` |
| Media grid | `Card`s with badges | `CardAction` for status badge — §3.1 |
| Reel placeholders | Static `PlaceholderImage` grid | `Carousel` once real reels exist — §3.9 |

### 6.15 Header / global chrome

**Status:** intentionally bespoke (bento dock).
[Header](../src/components/layout/header.tsx) does NOT use
`Sidebar` / `NavigationMenu`. That's a creative call we're keeping.

Optional borrows:

- The `⌘K` hint inside [CommandPaletteTrigger](../src/components/system/command-palette-trigger.tsx)
  could use `Kbd + Kbd` for the shortcut display — §3.9
- The notification bell unread count could use the `Badge`
  numeric-pill pattern from §3.9
- The mobile nav `Sheet` (we have it) could lean into `SheetHeader` /
  `SheetFooter` semantic slots if it doesn't already — §3.6

### 6.16 loading.tsx files

Every route has a `loading.tsx`. Replace any bare div placeholders with
`Skeleton` per §3.9. Example for `/work/loading.tsx`:

```tsx
<div className="flex flex-col space-y-3">
  <Skeleton className="h-[125px] w-full rounded-xl" />
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

---

## 7. Recommended action list

The actionable shortlist, ordered by ROI. Each item should be a
single small PR.

### Phase A — primitives to add (additive, no breaking changes)

1. Add `Field`, `FieldGroup`, `FieldSet`, `FieldLabel`,
   `FieldDescription`, `FieldError`, `FieldSeparator` →
   `src/components/ui/field.tsx`. Source: `ui/field.tsx` in shadcn v4.
2. Add `Label` → `src/components/ui/label.tsx`. Required by `Field`.
3. Add `Textarea` → `src/components/ui/textarea.tsx`.
4. Add `Item`, `ItemGroup`, `ItemMedia`, `ItemContent`, `ItemTitle`,
   `ItemDescription`, `ItemActions`, `ItemSeparator` →
   `src/components/ui/item.tsx`.
5. Add `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`,
   `EmptyDescription`, `EmptyContent` → `src/components/ui/empty.tsx`.
6. Add `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`,
   `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`,
   `BreadcrumbEllipsis` → `src/components/ui/breadcrumb.tsx`.
7. Add `InputGroup`, `InputGroupInput`, `InputGroupTextarea`,
   `InputGroupAddon`, `InputGroupButton`, `InputGroupText` →
   `src/components/ui/input-group.tsx`. Required: `Separator`.
8. Add `ToggleGroup`, `ToggleGroupItem`, `Toggle` →
   `src/components/ui/toggle-group.tsx` + `src/components/ui/toggle.tsx`.
9. Add `Kbd`, `KbdGroup` → `src/components/ui/kbd.tsx`.
10. Add `Skeleton` → `src/components/ui/skeleton.tsx`.
11. Add `Avatar`, `AvatarImage`, `AvatarFallback` →
    `src/components/ui/avatar.tsx`.
12. Add `Separator` → `src/components/ui/separator.tsx` (required by
    `Field`, `InputGroup`, `Item`).
13. Add `Spinner` → `src/components/ui/spinner.tsx`.
14. Upgrade `Card` to v4 shape: add `CardAction` export, switch to
    `data-slot` attributes, add `gap-6 py-6` + container-query support.
    Breaking-change-flavored — check usages first.

### Phase B — wire new primitives into the worst-fit surfaces

1. **Contact form rewrite** ([contact/_contact-form.tsx](../src/app/[locale]/contact/_contact-form.tsx)) → use `Field` / `FieldGroup` / `FieldLabel` / `FieldDescription` / `FieldError` / `Textarea` / `Spinner`. RHF integration stays; the wrapper is just slot semantics.
2. **Search inputs** ([work/_client.tsx](../src/app/[locale]/work/_client.tsx), [resources/_client.tsx](../src/app/[locale]/resources/_client.tsx)) → swap `relative span + absolute Search` for `InputGroup + InputGroupAddon + InputGroupInput`.
3. **Filter chips** (same files) → swap `Button > Badge` + `aria-pressed` for `ToggleGroup type="single" variant="outline"`.
4. **Logs timeline** ([logs/_client.tsx](../src/app/[locale]/logs/_client.tsx)) → rebuild `BlogTimeline` rows on `Item asChild` + `ItemMedia` + `ItemContent`.
5. **About timeline** ([about/page.tsx](../src/app/[locale]/about/page.tsx)) → rebuild the `border-l-2` rail on `ItemGroup` + `ItemSeparator`.
6. **Empty states** → replace `EmptyArchiveState` callers with `Empty` slots. Audit current callers: resources, archive, logs.
7. **Loading states** → upgrade `loading.tsx` files to use `Skeleton`.

### Phase C — new affordances

1. **Breadcrumbs on detail routes** — `/work/[slug]`, `/archive/[collection]`, `/logs/[slug]`, `/games/[slug]`. Use the responsive variant (Dropdown on desktop, Drawer on mobile).
2. **Project hover preview on /work** — `HoverCard` with project cover + 1-line pitch.
3. **Kbd hint inside CommandPaletteTrigger** — replace the inline `<kbd>` (if any) with `Kbd + Kbd` group.
4. **Notification numeric pill** — apply the badge numeric-pill class
   to the unread count inside [NotificationBell](../src/components/system/notification-bell.tsx).

### Phase D — block-level borrows (optional, lower priority)

1. **/contact split-screen polish** — borrow `apps/v4/app/(app)/examples/authentication/page.tsx` layout idiom (testimonial blockquote at the bottom of one column, form card on the other). Already conceptually similar; tighten the spacing + the `FieldSeparator` "Or email directly" divider.
2. **Section cards on home** — borrow the container-query selectors
   from `dashboard/components/section-cards.tsx` so featured-project /
   tool / writing tiles resize their titles when the grid breaks.
3. **DataTable (only if needed)** — borrow the tasks-example shape if
   `/work` ever needs sortable / filterable / paginated columns. Not
   needed today.

### Constraints to keep in mind

- M4rkyu's `next.config.ts` overrides are load-bearing on Windows (see
  memory). Don't touch when adding primitives.
- Every new component should also get a Storybook story per the
  existing convention.
- Phase A is purely additive — no risk to existing pages until Phase B
  wires them in.
- Phase B touches client islands but not server components, so it
  won't change the static-vs-dynamic split of any route.
- i18n parity: nothing in Phase A or Phase B adds new strings, so
  `messages/en.json` and `messages/zh.json` stay in sync.

---

## 8. How to use this doc

When generating UI for M4rkyu:

1. Identify the surface in §6.
2. Pick the suggested shadcn pattern from §3 (composition patterns).
3. Open the canonical demo at the cited source path. The path is real
   on this machine — `h:/Github/shadcn-ui-source/...`.
4. Lift the slot structure. Don't paraphrase from training data.
5. Adapt to M4rkyu's tokens / locale / theme without changing the slot
   structure or the data-slot attribute names.

When asked "what's the right way to compose X with shadcn", search
this doc first. If the answer isn't here, open the relevant demo file
in `h:/Github/shadcn-ui-source/apps/v4/registry/new-york-v4/examples/`
and update §3 with the new pattern.

When in doubt, the `data-slot` attribute is the contract. Anything you
add downstream — gradients, container queries, selector-based padding —
should hang off `data-slot=...`, not off ad-hoc classes.
