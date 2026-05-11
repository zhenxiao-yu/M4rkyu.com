---
title: M4rkyu.com — Copy Voice
status: living
audience: implementation agents (Claude, Codex), reviewers, contributors writing copy
last_updated: 2026-05-11
companion: docs/FINAL_SITE_ARCHITECTURE.md, docs/UNIFIED_VISUAL_DIRECTION.md
---

# Copy Voice

The website is mainly for **social presence**, not just hiring. Copy can
be witty, dry, indie, and slightly self-aware. It must not sound like
LinkedIn, SaaS, or a "personal brand" founder page.

The sweet spot:

> witty · dry · indie · slightly weird · not "look at me I'm a genius"

---

## 1. Avoid

```
Hi, I'm Mark Yu                              (as the homepage headline)
passionate developer
innovative solutions
cutting-edge experiences
building the future
visionary
award-winning              (unless literally true)
overly serious "personal brand" language
fake humility
narcissistic mythologizing
```

If a line sounds like LinkedIn → rewrite it.
If a line sounds like a startup landing page → rewrite it.
If a line sounds like fake humility → rewrite it.
If a line sounds like ego → rewrite it.
If a line sounds like a quiet joke with taste → keep it.

---

## 2. Use

```
dry humor
small self-aware jokes
system / archive language
indie game menu energy
social-friendly short lines
clear but memorable phrasing
```

---

## 3. Canonical hero (current)

The shipped homepage hero:

**EN**
```
A decent place to put all this.

Projects, prototypes, images, and notes from Mark Yu.
```

**ZH**
```
一个还算像样的地方，放这些。

项目、原型、图像与笔记——来自 Mark Yu。
```

Both lines are intentionally understated. The headline is the joke;
the subtitle is the receipt.

---

## 4. Approved alternates

If the canonical hero needs to rotate or A/B, use one of these. Do
**not** invent new headlines without running them past the tone test
in §6.

### Headlines

```
Small tools. Strange games. Quiet frames.
A suspiciously organized pile of work.
Things I built, tuned, photographed, or overthought.
Software, games, and other bad ideas that worked.
Work from the system layer.
```

### Subtitles

```
A personal index of software, prototypes, images, and field notes from Mark Yu.
Software, games, photos, and notes — filed neatly enough to look intentional.
A living archive of interfaces, prototypes, images, and field notes.
I build interfaces, tools, and small interactive worlds — then write down what survived.
```

---

## 5. CTAs

Default labels — already on-brand:

```
Browse the work
Read the logs
Open the channel
View the archive
Enter terminal
Inspect the system
```

Banned labels (read as boring or SaaS):

```
View projects
Read blog
Contact me
Learn more
Get in touch
```

---

## 6. Tone test

Run every new line against this before merging:

```
1. Does it sound like LinkedIn?            → rewrite
2. Does it sound like a startup landing?   → rewrite
3. Does it sound like fake humility?       → rewrite
4. Does it sound like ego?                 → rewrite
5. Does it sound like a quiet joke with taste? → keep
```

A line that passes 1–4 but fails 5 is fine for utility copy (form
labels, error states). For hero, section titles, and CTAs, line 5 is
required.

---

## 7. Section titles

On-brand:

```
Selected Work
Things That Shipped
Still in the Lab
Field Notes
Visual Evidence
Current Side Quest
System Capabilities
Archive Drawer
Operator Notes
Open Channel
```

More playful (use sparingly — one per page max):

```
Proof of Work
The Lab Table
Stuff That Survived
Things With Screens
Frames I Kept
Notes From the Mess
Useful Little Machines
```

---

## 8. About page lines

The About page can be more human than the hero. On-brand examples:

```
I'm Mark Yu. I build software, make games, take photos, and over-organize everything afterward.

I'm Mark Yu, a software engineer and game developer with a habit of turning experiments into systems.

I work somewhere between production tools, game prototypes, and visual archives.

I like systems that feel good, interfaces that stay readable, and projects with a little atmosphere.

This site is where I keep the work that survived the folder named "final_final."
```

---

## 9. Chinese copy

Chinese is **hand-written**, not literal. The same voice rules apply:
dry, indie, slightly self-aware. Avoid awkward translation of English
puns — write a parallel Chinese joke instead, or drop the joke and
keep the meaning clean.

Approved current Chinese hero:

```
一个还算像样的地方，放这些。
项目、原型、图像与笔记——来自 Mark Yu。
```

Do not machine-translate. If the English line is a joke that doesn't
land in Chinese, write a different line that lands in Chinese and
matches the tone — same energy, different words.

---

## 10. Where this fits

This doc is consulted whenever copy is added or edited in:

- `messages/en.json`, `messages/zh.json`
- `src/content/**` (project descriptions, gallery captions, log titles)
- Component-level placeholder strings (empty states, error states, CTAs)
- Page-level metadata (`<title>`, OG description)

Reviewers should reject copy changes that fail the tone test in §6.
