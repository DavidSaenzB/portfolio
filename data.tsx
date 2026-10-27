import { BookText, CodeSquare, HomeIcon, UserRound, Linkedin, Twitter, Rss, Twitch, Youtube, Computer, Cpu, Bot, Database, BarChart, Eye, Github, Mail, Phone, Speech } from "lucide-react";

// `label` is the accessible name of the icon-only links (brand names, same in both languages).
export const socialNetworks = [
    {
        id: 1,
        label: "GitHub",
        logo: <Github size={30} strokeWidth={1} />,
        src: "https://github.com/DavidSaenzB",
    },
    {
        id: 2,
        label: "LinkedIn",
        logo: <Linkedin size={30} strokeWidth={1} />,
        src: "https://www.linkedin.com/in/david-saenz-bolivar",
    },
    {
        id: 3,
        label: "Email",
        logo: <Mail size={30} strokeWidth={1} />,
        src: "mailto:hire@davidsaenz.dev",
    }
];


// Dock items. `key` is the label in locales (nav.*) and, except for "home", the id of the Home section
// the link scrolls to; `page` is the standalone route that also marks the item as active.
export const itemsNavbar = [
    {
        id: 1,
        key: "home",
        icon: <HomeIcon size={25} color="#fff" strokeWidth={1} />,
        link: "/",
        page: "/",
    },
    {
        id: 2,
        key: "about",
        icon: <UserRound size={25} color="#fff" strokeWidth={1} />,
        link: "/#about",
        page: "/about-me",
    },
    {
        id: 3,
        key: "services",
        icon: <BookText size={25} color="#fff" strokeWidth={1} />,
        link: "/#services",
        page: "/services",
    },
    {
        id: 4,
        key: "work",
        icon: <CodeSquare size={25} color="#fff" strokeWidth={1} />,
        link: "/#work",
        page: "/portfolio",
    },
    {
        id: 5,
        key: "contact",
        icon: <Speech size={25} color="#fff" strokeWidth={1} />,
        link: "/#contact",
        page: "/contact",
    },
] as const;

// Labels live in locales (about.counters), in the same order.
export const dataCounter = [
    {
        id: 0,
        endCounter: 10,
    },
    {
        id: 1,
        endCounter: 63,
    },
    {
        id: 2,
        endCounter: 4,
    },
];

export const serviceData = [
    {
        icon: <Computer />,
        title: "Desarrollo de MVPs con IA",
        description: "Creación iterativa de productos web y desarrollo ágil de MVPs apoyados en inteligencia artificial para validar ideas y escalar rápidamente.",
    },
    {
        icon: <Cpu />,
        title: "Machine & Deep Learning",
        description: "Construcción, entrenamiento y evaluación de redes neuronales y modelos de algoritmos usando Python, TensorFlow y Keras.",
    },
    {
        icon: <Bot />,
        title: "Automatizaciones con IA",
        description: "Optimización de procesos operativos mediante la integración de IA, agentes autónomos y flujos de trabajo inteligentes.",
    },
    {
        icon: <Database />,
        title: "Análisis y Limpieza de Datos",
        description: "Preparación profunda de datos. Implementación de algoritmos de regresión lineal, clasificación e interpretación valiosa de resultados.",
    },
    {
        icon: <Eye />,
        title: "Visión Artificial & PLN",
        description: "Desarrollo de sistemas avanzados de visión por computadora y procesamiento de lenguaje natural (PLN) para análisis de texto e imagen.",
    },
    {
        icon: <CodeSquare />,
        title: "Desarrollo de Páginas Web",
        description: "Diseño y desarrollo de sitios web a medida, con arquitecturas modernas, interfaces dinámicas y un enfoque total en la experiencia del usuario (UX/UI).",
    },
];

export const dataPortfolio = [
    {
        id: 1,
        image: "/thoraxai.png",
        urlGithub: "https://github.com/DavidSaenzB",
        urlDemo: "https://thoraxai-murex.vercel.app/",
    },
    {
        id: 2,
        image: "/pynova.png",
        urlGithub: "https://github.com/DavidSaenzB",
        urlDemo: "https://pynova.dev/",
    },
    {
        id: 3,
        image: "/spark-dating.png",
        urlGithub: "https://github.com/DavidSaenzB/spark-dating",
        urlDemo: "https://spark-dating-mvp.vercel.app/",
    },
    {
        id: 4,
        image: "/auditai.png",
        urlGithub: "https://github.com/DavidSaenzB",
        urlDemo: "https://auditai-gamma.vercel.app",
    },
    {
        id: 5,
        image: "/davidsaenz.png",
        urlGithub: "https://github.com/DavidSaenzB",
        urlDemo: "https://www.davidsaenz.dev",
    },
];