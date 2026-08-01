import { BookText, CodeSquare, HomeIcon, UserRound, Linkedin, Twitter, Rss, Twitch, Youtube, Computer, Cpu, Bot, Database, BarChart, Eye, Github, Mail, Phone, Speech } from "lucide-react";

export const socialNetworks = [
    {
        id: 1,
        logo: <Github size={30} strokeWidth={1} />,
        src: "https://github.com/DavidSaenzB",
    },
    {
        id: 2,
        logo: <Linkedin size={30} strokeWidth={1} />,
        src: "https://www.linkedin.com/in/david-saenz-bolivar",
    },
    {
        id: 3,
        logo: <Mail size={30} strokeWidth={1} />,
        src: "mailto:hire@davidsaenz.dev",
    }
];


export const itemsNavbar = [
    {
        id: 1,
        title: "Home",
        icon: <HomeIcon size={25} color="#fff" strokeWidth={1} />,
        link: "/",
    },
    {
        id: 2,
        title: "User",
        icon: <UserRound size={25} color="#fff" strokeWidth={1} />,
        link: "/about-me",
    },
    {
        id: 3,
        title: "Book",
        icon: <BookText size={25} color="#fff" strokeWidth={1} />,
        link: "/services",
    },
    {
        id: 4,
        title: "Target",
        icon: <CodeSquare size={25} color="#fff" strokeWidth={1} />,
        link: "/portfolio",
    },
    {
        id: 5,
        title: "Contact",
        icon: <Speech size={25} color="#fff" strokeWidth={1} />,
        link: "/contact",
    },
];

export const dataAboutPage = [
    {
        id: 1,
        title: "Junior Software Engineer",
        subtitle: "Open Democracy — Remoto",
        description: "Desarrollo de software bajo contrato temporal, construyendo y manteniendo soluciones web para la organización.",
        date: "Ene 2026 - Actualidad",
    },
    {
        id: 2,
        title: "Junior Software Engineer",
        subtitle: "Joy Marketing — Worldwide — Remoto",
        description: "Desarrollo de software a jornada parcial, creando y manteniendo aplicaciones web y soluciones digitales.",
        date: "Dic 2024 - Actualidad",
    },
    {
        id: 3,
        title: "Bootcamp Inteligencia Artificial",
        subtitle: "Universidad San Buenaventura & MinTIC Colombia",
        description: "Formación intensiva en Inteligencia Artificial y programación con Python. Talento Tech Valle.",
        date: "Nov 2025",
    },
    {
        id: 4,
        title: "Introducción a la Ciberseguridad",
        subtitle: "Cisco Networking Academy",
        description: "Fundamentos de ciberseguridad, amenazas y vulnerabilidades comunes, estrategias de protección en línea y prácticas de seguridad organizacional.",
        date: "Oct 2025",
    },
    {
        id: 5,
        title: "Bootcamp Full-Stack Developer",
        subtitle: "SoyHenry, Argentina",
        description: "Formación inmersiva en desarrollo web moderno (Frontend & Backend) con tecnologías como React, Node.js y Bases de Datos.",
        date: "Graduado",
    },
    {
        id: 6,
        title: "Líder de Procesos TI & Analista Administrativo",
        subtitle: "Radiologia Diagnostica Bolivar SAS",
        description: "Optimización de flujos de trabajo TI, automatización de tareas y metodologías Lean/Agile. Gestión de presupuestos, sistemas de calidad y liderazgo de un equipo administrativo de 5 personas.",
        date: "Sep 2014 - Mar 2024",
    },
    {
        id: 7,
        title: "Gerente Administrativo",
        subtitle: "Inversiones Chulquin Zomac SAS",
        description: "Administración integral de producción de café de especialidad. Coordinación de certificaciones (Rainforest, UTZ, FairTrade), análisis financiero y software contable.",
        date: "Jun 2013 - Jun 2022",
    },
    {
        id: 8,
        title: "Administrador de Empresas",
        subtitle: "Universidad de San Buenaventura Cali",
        description: "Título profesional universitario (Bachelor's Degree in Business Administration).",
        date: "Jun 2016",
    },
]

export const dataCounter = [
    {
        id: 0,
        endCounter: 10,
        text: "Años de experiencia laboral",
        lineRight: true,
        lineRightMobile: true,
    },
    {
        id: 1,
        endCounter: 63,
        text: "Proyectos Full-Stack",
        lineRight: true,
        lineRightMobile: false,
    },
    {
        id: 2,
        endCounter: 5,
        text: "Certificaciones (Dev & IA)",
        lineRight: false,
        lineRightMobile: true,
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