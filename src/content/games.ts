import { gameSchema } from "./schemas";

export const games = [
  {
    title: "Descent Into Madness",
    slug: "descent-into-madness",
    engine: "Unity 2022.3",
    year: "2024",
    status: "ready",
    pitch:
      "A playable 2D pixel-art roguelike shooter built around escalating runs, compact combat arenas, and the pressure to descend one room further.",
    role: "Solo developer: gameplay systems, C# scripting, pixel-art integration, balancing, and itch.io release.",
    notes: [
      "Encounter and spawn logic is data-driven so run pacing can change without rewriting combat code.",
      "Movement, combat, encounter flow, and HUD responsibilities stay separated across focused Unity systems.",
      "The public itch.io build turned internal tuning assumptions into concrete player-facing finish work.",
    ],
    cover: {
      src: "/project-covers/descent-into-madness.svg",
      alt: "Descent Into Madness pixel dungeon promotional cover",
    },
    platforms: ["Windows", "itch.io"],
    pillars: [
      "Run-based progression with escalating combat pressure",
      "Pixel-art enemies, rooms, and effects",
      "Responsive twin-stick-style shooting",
      "A downloadable public build",
    ],
    postmortem:
      "The prototype proved that roguelike tension comes from encounter pacing and readable threat escalation, not simply adding more enemies. Publishing early also exposed the difference between a working Unity scene and a build another person can actually understand and play.",
    outcome:
      "A shipped itch.io prototype and a practical study in combat feel, run pacing, and the unglamorous finish work required to release a game.",
    buildLinks: [
      {
        label: "Play on itch.io",
        url: "https://markyu615.itch.io/descent-into-madness",
      },
      {
        label: "Source",
        url: "https://github.com/zhenxiao-yu/Descent-In-To-Madness",
      },
    ],
    translations: {
      zh: {
        pitch:
          "一款已发布的 2D 像素风 Roguelike 射击游戏，围绕逐步升级的关卡、紧凑战斗场景，以及再深入一层的压力展开。",
        role: "独立开发：玩法系统、C# 脚本、像素美术整合、平衡与 itch.io 发布。",
        outcome:
          "一个已在 itch.io 发布的原型，也是一次关于战斗手感、局内节奏与游戏发布收尾工作的实践。",
      },
    },
  },
  {
    title: "Unreal Battle Royale Prototype",
    slug: "pubg-unreal",
    engine: "Unreal Engine 4",
    year: "2021",
    status: "ready",
    pitch:
      "A Blueprint-driven battle-royale systems prototype covering inventory, pickups, weapon handling, player state, and match scaffolding.",
    role: "Solo developer: gameplay architecture, Blueprint scripting, systems integration, and technical documentation.",
    notes: [
      "Inventory and weapon systems are componentized so pickups, equipment, and player state do not collapse into one Blueprint graph.",
      "Blueprints keep iteration fast while C++ remains available for systems that need stronger performance or boundaries.",
      "The repository has become a useful public reference, with 11 stars and 11 forks at the time of this case-study update.",
    ],
    cover: {
      src: "/project-covers/unreal-battle-royale.svg",
      alt: "Unreal battle-royale safe-zone map promotional cover",
    },
    platforms: ["Windows", "Unreal Editor"],
    pillars: [
      "Inventory and pickup flow",
      "Weapon handling and switching",
      "Blueprint-first gameplay architecture",
      "Battle-royale match-system exploration",
    ],
    postmortem:
      "The biggest lesson was architectural: visual scripting is excellent for iteration, but large systems still need clear ownership, reusable components, and disciplined graph boundaries.",
    outcome:
      "An archived but substantial Unreal Engine systems study whose public repository continues to attract developers exploring Blueprint-driven battle-royale mechanics.",
    buildLinks: [
      {
        label: "Source",
        url: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
      },
    ],
    translations: {
      zh: {
        title: "虚幻引擎大逃杀原型",
        pitch:
          "一个以蓝图驱动的大逃杀系统原型，涵盖背包、拾取、武器操作、玩家状态与对局框架。",
        role: "独立开发：玩法架构、蓝图脚本、系统整合与技术文档。",
        outcome:
          "一个已归档但内容扎实的虚幻引擎系统研究项目，其公开仓库仍在帮助探索蓝图大逃杀机制的开发者。",
      },
    },
  },
  {
    title: "LAST KERNEL",
    slug: "last-kernel",
    engine: "Unity 6.4",
    year: "2026",
    status: "ready",
    pitch:
      "An in-development cyberpunk survival strategy game: stack cards into a colony by day, then watch the system defend itself through deterministic auto-battler nights.",
    role: "Solo game developer: systems design, C# architecture, editor tooling, localization, UI, and game direction.",
    notes: [
      "ScriptableObjects hold card, pack, recipe, quest, and encounter data while plain C# services own the rules.",
      "The day-to-night loop separates player planning from deterministic hands-off combat, making preparation the primary skill.",
      "Runtime-switchable English and Simplified Chinese localization is built into the project instead of deferred until release.",
      "A custom project validator checks missing references, duplicate IDs, and invalid data after structural changes.",
    ],
    cover: {
      src: "/project-covers/last-kernel-key-art.webp",
      alt: "Promotional key art for LAST KERNEL showing a cyberpunk card colony defending against a night attack",
      width: 1586,
      height: 992,
    },
    platforms: ["Windows", "Mobile target"],
    pillars: [
      "Card-stacking colony simulation during the day phase",
      "Deterministic auto-battler defense during the night phase",
      "Data-driven cards, recipes, packs, quests, and encounters",
      "Event-driven UI with bilingual runtime localization",
    ],
    postmortem:
      "LAST KERNEL is not a released game yet, but it has moved well beyond a reserved concept. The current codebase contains the core run-state, card, crafting, combat, defense, quest, localization, audio, and UI layers needed for a real vertical slice. The next risk is content and tuning, not whether the architecture exists.",
    outcome:
      "A substantial Unity 6.4 production foundation for a system-driven strategy game, with a documented architecture and public source repository ready for continued vertical-slice work.",
    buildLinks: [
      {
        label: "Source",
        url: "https://github.com/zhenxiao-yu/LAST_KERNEL",
      },
    ],
    translations: {
      zh: {
        pitch:
          "一款开发中的赛博朋克生存策略游戏：白天通过卡牌堆叠建设殖民地，夜晚则观察这套系统在确定性的自动战斗中自我防守。",
        role: "独立游戏开发：系统设计、C# 架构、编辑器工具、本地化、界面与游戏方向。",
        postmortem:
          "LAST KERNEL 尚未正式发布，但它已经远远超出预留概念阶段。当前代码库包含完整垂直切片所需的局内状态、卡牌、合成、战斗、防御、任务、本地化、音频与界面层。下一阶段的主要风险是内容与调优，而不是架构是否存在。",
        outcome:
          "一个扎实的 Unity 6.4 系统策略游戏制作基础，拥有清晰文档与公开源码，可继续推进到完整垂直切片。",
      },
    },
  },
].map((game) => gameSchema.parse(game));

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}
