import nimbus from "../Images/project1.png";
import bioloom from "../Images/project2.png";
import brother from "../Images/project3.png";
import madness from "../Images/project4.png";
import uistudio from "../Images/project5.png";
import resubot from "../Images/project6.png";
import pubg from "../Images/project7.png";
import m4rkdown from "../Images/project8.png";
import m4rketview from "../Images/project9.png";
import emptyproject from "../Images/project_null.png";

export const Project = [
    {
        id: 1,
        name: "Nimbus",
        subtitle: "Web App",
        description: "Nimbus is a next-generation file storage and management platform designed to streamline how users organize, share, and access their files.\n\nWith secure uploads, real-time analytics, and intuitive organizational tools, Nimbus redefines efficiency in file management. Developed with React, Next.js, and Appwrite, it delivers a responsive and polished user experience that harmonizes form and function.",
        tags: ["Cloud", "Appwrite", "TypeScript", "Next.js", "OTP", "Chart.js", "Responsive", "Shadcn"],
        demo: "https://nimbus-storage-app.vercel.app",
        github: "https://github.com/zhenxiao-yu/nimbus-storage-app",
        status: "Ready",
        imageUrl: nimbus,
        date: "November 2024"
    },
    {
        id: 2,
        name: "BioLoom",
        subtitle: "Web App",
        description: "BioLoom is an innovative AI-powered platform designed to craft personalized and professional social media bios with effortless precision.\n\nWhether you're building a personal brand or seeking to stand out online, BioLoom simplifies the process. Powered by cutting-edge AI and built with Next.js and Tailwind CSS, it offers users a seamless experience in creating bios that are both unique and impactful.",
        tags: ["Next.js", "AI", "React", "Vercel", "Tailwind CSS", "JavaScript", "Web Development"],
        demo: "https://ai-bio-generator-steel.vercel.app/",
        github: "https://github.com/zhenxiao-yu/ai-bio-generator",
        status: "Ready",
        imageUrl: bioloom,
        date: "October 2024"
    },
    {
        id: 3,
        name: "In the Silence of a Brother",
        subtitle: "AI Animated Short Film",
        description: "This AI-animated short film captures the deep emotional bonds between siblings during the One-Child Policy era in 1980s Beijing.\n\nA blend of physical art, stop-motion techniques, and AI-generated visuals results in a visually stunning and nostalgic journey. Exploring themes of family, identity, and childhood, this poignant film is both a personal and societal reflection.",
        tags: ["CapCut", "Premiere Pro", "Stable-Diffusion", "Pictory", "RunwayML"],
        demo: "https://youtu.be/tttaJabgVMw?si=RcJMkkqryKP6Vpuj",
        github: "https://github.com/zhenxiao-yu/Text-To-Video-AI",
        status: "Ready",
        imageUrl: brother,
        date: "July 2024"
    },
    {
        id: 4,
        name: "Descent Into Madness",
        subtitle: "PC Game",
        description: "Descent Into Madness is a gripping 2D roguelike horror shooter that immerses players in the nightmarish world of Karnoxia.\n\nFeaturing procedurally generated levels, grotesque adversaries, and a psychological edge, the game delivers an adrenaline-fueled experience. Built with Unity, it combines thrilling gameplay with a haunting atmosphere.",
        tags: ["Unity", "Game Dev", "2D", "Roguelike", "PC", "C#", "Horror", "PVE"],
        demo: "https://markyu615.itch.io/descent-into-madness",
        github: "https://github.com/zhenxiao-yu/Descent-In-To-Madness",
        status: "Ready",
        imageUrl: madness,
        date: "March 2024"
    },
    {
        id: 5,
        name: "M4rketView",
        subtitle: "[PC] Web App",
        description: "M4rketView is a cutting-edge cryptocurrency screener app designed for traders and investors.\n\nLeveraging the React tech stack and CoinGecko API, it provides real-time market insights, interactive table views, customizable watchlists, and advanced search tools—all wrapped in a sleek, responsive design.",
        tags: ["React", "HTML", "Tailwind CSS", "CoinGecko API", "CSS", "Chart.js", "Cryptocurrency"],
        demo: "https://m4rket-view.vercel.app",
        github: "https://github.com/zhenxiao-yu/M4rketView",
        status: "Ready",
        imageUrl: m4rketview,
        date: "November 2024"
    },
    {
        id: 6,
        name: "UI Studio",
        subtitle: "Web App",
        description: "UI Studio reimagines collaborative design by bringing teams together in an engaging, real-time creative workspace.\n\nEquipped with live drawing, integrated chat, and cursor tracking, it’s a professional-grade platform for designers to collaborate effortlessly. Built with Next.js and Fabric.js, UI Studio bridges productivity with creativity.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Fabric.js", "Liveblocks", "Shadcn"],
        demo: "https://ui-studio-mu.vercel.app/",
        github: "https://github.com/zhenxiao-yu/ui-studio",
        status: "Ready",
        imageUrl: uistudio,
        date: "February 2024"
    },
    {
        id: 7,
        name: "PUBG Unreal",
        subtitle: "3D Game",
        description: "PUBG Unreal is a single-player battle royale project built on Unreal Engine 4, inspired by PlayerUnknown's Battlegrounds.\n\nFocusing on dynamic character movement, item interaction, and realistic weapon mechanics, this project demonstrates the power of Blueprint visual scripting and sets the foundation for multiplayer development.",
        tags: ["UE4", "C++", "Blueprints", "Blender", "VR", "Game Development", "3D Assets"],
        demo: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
        github: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
        status: "Maintenance",
        imageUrl: pubg,
        date: "Ongoing"
    },
    {
        id: 8,
        name: "Resubot",
        subtitle: "Web App",
        description: "Resubot is an AI-powered resume and cover letter generator designed to make job applications effortless and tailored.\n\nLeveraging OpenAI’s GPT-3.5-turbo, it streamlines the creation of professional, personalized job documents, offering an intuitive and efficient experience for job seekers.",
        tags: ["React", "Node.js", "OpenAI", "Bulma", "Express", "MySQL", "Web App"],
        demo: "https://resubot.vercel.app",
        github: "https://github.com/zhenxiao-yu/resubot",
        status: "Ready",
        imageUrl: resubot,
        date: "May 2024"
    },
    {
        id: 9,
        name: "M4rkdown",
        subtitle: "Web App",
        description: "M4rkdown is a modular and extensible Markdown parser that simplifies the process of converting Markdown syntax into structured tokens or HTML.\n\nBuilt with TypeScript, it offers flexibility for developers seeking a lightweight and customizable parsing tool.",
        tags: ["TypeScript", "HTML", "Vite", "Markdown", "DOM events", "Utility"],
        demo: "https://m4rkdown.vercel.app",
        github: "https://github.com/zhenxiao-yu/m4rkdown-editor",
        status: "Ready",
        imageUrl: m4rkdown,
        date: "October 2024"
    },
    {
        id: 10,
        name: "Web3 Ethereum Wallet",
        subtitle: "Web App",
        description: "Web3 Ethereum Wallet empowers users to securely manage cryptocurrency transactions via Ethereum smart contracts.\n\nWith React and TailwindCSS at its core, this decentralized application provides a seamless interface for exploring decentralized finance.",
        tags: ["Web3", "Blockchain", "Solidity", "React", "TailwindCSS", "Crypto Wallet", "Smart Contracts"],
        demo: "",
        github: "https://github.com/zhenxiao-yu/web3-blockchain-app",
        status: "Maintenance",
        imageUrl: emptyproject,
        date: "Ongoing"
    },
    {
        id: 11,
        name: "Bulma E-Commerce Store",
        subtitle: "Web App",
        description: "Bulma E-Commerce Store is a modern, React-powered online storefront that blends aesthetic appeal with functional design.\n\nFeaturing a JSON server backend simulation and styled with Bulma and Node SASS, it serves as a sleek solution for small businesses entering the digital marketplace.",
        tags: ["React", "JSON Server", "SASS", "Bulma", "React Router", "Custom Hooks", "E-commerce"],
        demo: "",
        github: "https://github.com/zhenxiao-yu/React-Ecommerce-Website",
        status: "Maintenance",
        imageUrl: emptyproject,
        date: "September 2023"
    }
];

