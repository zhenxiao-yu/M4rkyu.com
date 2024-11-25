import nimbus from "../Images/project1.png";
import bioloom from "../Images/project2.png";
import brother from "../Images/project3.png";
import madness from "../Images/project4.png";
import uistudio from "../Images/project5.png";
import resubot from "../Images/project6.png";
import pubg from "../Images/project7.png";
import m4rkdown from "../Images/project8.png";
import emptyproject from "../Images/project_null.png";

export const Project = [
    {
        id: 1,
        name: "Nimbus",
        subtitle: "Web App",
        description: "Nimbus is a modern file storage and management platform designed to make organizing, sharing, and accessing files simple and efficient. Offering secure uploads, real-time storage insights, and intuitive organization tools, it takes the headache out of file management. Built with React, Next.js, and Appwrite, Nimbus combines sleek design with seamless functionality to provide a responsive and delightful user experience.",
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
        description: "BioLoom is an AI-powered tool for crafting personalized social media bios that are equal parts creative and professional. Whether you're building a personal brand or just want to spice up your profile, BioLoom has got you covered. The app is powered by cutting-edge AI, making bio creation quick, fun, and easy. Simply answer a few questions, and let the AI work its magic to create a bio that truly represents you. Built with Next.js and a sprinkle of Tailwind CSS flair, BioLoom makes finding the perfect words a breeze.",
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
        description: "This AI-animated short film explores the profound and emotional bonds between siblings during the One-Child Policy era in 1980s Beijing. Combining physical art, stop motion techniques, and AI-generated visuals, the film is both nostalgic and visually striking. It delves into themes of family, identity, and the bittersweet realities of childhood. The project served as the final assignment for the SA2560 course at Western University and is now available to watch on YouTube.",
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
        description: "Descent Into Madness is a spine-chilling 2D roguelike horror shooter that plunges players into the nightmarish world of Karnoxia. Navigate procedurally generated mazes, battle grotesque creatures, and maintain your sanity—if you can. With heart-pounding gameplay, eerie visuals, and a storyline that keeps you on edge, this game promises a unique blend of thrill and challenge. Built with Unity and now available on PC, it’s a perfect pick for those who love adrenaline-packed gaming experiences.",
        tags: ["Unity", "Game Dev", "2D", "Roguelike", "PC", "C#", "Horror", "PVE"],
        demo: "https://markyu615.itch.io/descent-into-madness",
        github: "https://github.com/zhenxiao-yu/Descent-In-To-Madness",
        status: "Ready",
        imageUrl: madness,
        date: "March 2024"
    },
    {
        id: 5,
        name: "UI Studio",
        subtitle: "Web App",
        description: "UI Studio is a collaborative design platform that brings teams together in real-time for creative projects. Packed with features like real-time drawing, integrated chat, commenting, and cursor tracking, it’s like a playground for designers. Built with Next.js and Fabric.js, the application provides a professional yet user-friendly environment for exploring and mastering collaborative design processes. If you’ve ever wanted a tool that combines fun and productivity, UI Studio is it.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Fabric.js", "Liveblocks", "Shadcn"],
        demo: "https://ui-studio-mu.vercel.app/",
        github: "https://github.com/zhenxiao-yu/ui-studio",
        status: "Ready",
        imageUrl: uistudio,
        date: "February 2024"
    },
    {
        id: 6,
        name: "PUBG Unreal",
        subtitle: "3D Game",
        description: "This ongoing project leverages Unreal Engine 4 (UE4) and its powerful Blueprint visual scripting feature to create a single-player battle royale game inspired by PlayerUnknown's Battlegrounds (PUBG), one of the most well-known multiplayer battle royale games. The primary objective is to replicate key gameplay mechanics, such as dynamic character movement, item interaction, and realistic weapon handling, within a single-player environment. The current version focuses on core functionality and does not yet include multiplayer support.",
        tags: ["UE4", "C++", "Blueprints", "Blender", "VR", "Game Development", "3dAssets"],
        demo: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
        github: "https://github.com/zhenxiao-yu/PUBG-UNREAL",
        status: "Maintenance",
        imageUrl: pubg,
        date: "Ongoing"
    },
    {
        id: 7,
        name: "Resubot",
        subtitle: "Web App",
        description: "ResuBot is an AI-driven web application designed to revolutionize the resume and cover letter creation process, making it personalized, efficient, and accessible. By leveraging OpenAI’s GPT-3.5-turbo, ResuBot aims to address the challenges faced by job seekers in crafting tailored, professional resumes and cover letters while streamlining the overall job application process.",
        tags: ["React", "Node.js", "OpenAI", "Bulma", "Express", "MySQL", "Web App"],
        demo: "https://resubot.vercel.app",
        github: "https://github.com/zhenxiao-yu/resubot",
        status: "Ready",
        imageUrl: resubot,
        date: "May 2024"
    },
    {
        id: 8,
        name: "M4rkdown",
        subtitle: "Web App",
        description: "A lightweight and modular Markdown parser built with JavaScript/TypeScript, designed to tokenize and render Markdown syntax into structured tokens or HTML. This parser is flexible and extensible, enabling support for additional Markdown features with minimal effort.",
        tags: ["TypeScript", "HTML", "Vite", "Markdown", "DOM events", "Utility"],
        demo: "https://m4rkdown.vercel.app",
        github: "https://github.com/zhenxiao-yu/m4rkdown-editor",
        status: "Ready",
        imageUrl: m4rkdown,
        date: "October 2024"
    },
    {
        id: 9,
        name: "Web3 Ethereum Wallet",
        subtitle: "Web App",
        description: "Web3 Ethereum Wallet is a decentralized application (dApp) that allows users to securely send and manage cryptocurrency using Ethereum smart contracts. With React and TailwindCSS driving the interface, it offers a responsive and efficient way to handle blockchain transactions. Perfect for those exploring the world of decentralized finance, this project showcases the future of secure and decentralized money transfers.",
        tags: ["Web3", "Blockchain", "Solidity", "React", "TailwindCSS", "Crypto Wallet", "Smart Contracts"],
        demo: "",
        github: "https://github.com/zhenxiao-yu/web3-blockchain-app",
        status: "Maintenance",
        imageUrl: emptyproject,
        date: "Ongoing"
    },
    {
        id: 10,
        name: "Bulma E-Commerce Store",
        subtitle: "Web App",
        description: "Bulma E-Commerce Store is a React-powered online storefront designed with style and functionality in mind. Featuring a JSON Server for backend simulation and a clean aesthetic thanks to Bulma and Node SASS, this project is perfect for small businesses looking to step into the online marketplace. It’s a great example of how modern tools can create a sleek and user-friendly shopping experience.",
        tags: ["React", "JSON Server", "SASS", "Bulma", "React Router", "Custom Hooks", "E-commerce"],
        demo: "",
        github: "https://github.com/zhenxiao-yu/React-Ecommerce-Website",
        status: "Maintenance",
        imageUrl: emptyproject,
        date: "September 2023"
    }
];
