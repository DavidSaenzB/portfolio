// Contenido de la Política de Privacidad (bilingüe). La página /privacidad
// elige el idioma con useLanguage(). Documento informativo — ver disclaimer.

type Block = string | string[]; // string = párrafo; string[] = lista con viñetas
type Section = { heading: string; content: Block[] };
type PrivacyDoc = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: Section[];
  disclaimer: string;
};

export const privacyContent: { es: PrivacyDoc; en: PrivacyDoc } = {
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: 1 de agosto de 2026",
    intro: [
      "Esta Política de Privacidad describe cómo se recopilan, usan, comparten y protegen los datos personales de las personas que interactúan con el sitio web davidsaenz.dev y con su asistente virtual de WhatsApp (en adelante, «el Servicio»).",
      "Al escribir al asistente de WhatsApp o al usar el sitio, aceptas las prácticas descritas en este documento. Si no estás de acuerdo, por favor no utilices el Servicio.",
    ],
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        content: [
          "El responsable del tratamiento de tus datos es David Sáenz, desarrollador independiente (persona natural), con contacto en:",
          ["Correo electrónico: contact@davidsaenz.dev", "Sitio web: https://www.davidsaenz.dev"],
        ],
      },
      {
        heading: "2. Qué datos recopilamos",
        content: [
          "Cuando interactúas con el asistente de WhatsApp, se procesan los siguientes datos personales:",
          [
            "Tu número de teléfono de WhatsApp.",
            "Tu nombre de perfil de WhatsApp.",
            "El contenido de los mensajes que envías al asistente.",
          ],
          "Cuando navegas el sitio web, se guarda en tu navegador una preferencia local de idioma (almacenamiento local funcional). El sitio no utiliza cookies de rastreo ni herramientas de analítica publicitaria.",
          "No solicitamos ni tratamos deliberadamente datos sensibles (salud, ideología, etc.), datos de pago, ni documentos de identidad. Te pedimos que no compartas ese tipo de información por el chat.",
        ],
      },
      {
        heading: "3. Finalidad y base legal del tratamiento",
        content: [
          "Tratamos tus datos con las siguientes finalidades:",
          [
            "Operar el asistente de WhatsApp y responder tus consultas sobre los servicios ofrecidos.",
            "Mantener el contexto de la conversación durante un tiempo limitado para dar respuestas coherentes.",
            "Gestionar el interés de contacto cuando expresas que deseas contratar un servicio.",
          ],
          "Bases legales (según el Reglamento General de Protección de Datos de la UE — GDPR): (a) tu consentimiento, otorgado al iniciar voluntariamente una conversación con el asistente; y (b) el interés legítimo de atender solicitudes de contacto comercial. En Colombia, el tratamiento se realiza con tu autorización previa como titular (Ley 1581 de 2012).",
          "Puedes retirar tu consentimiento en cualquier momento (ver «Tus derechos»); esto no afecta la licitud del tratamiento previo.",
        ],
      },
      {
        heading: "4. Conservación de los datos",
        content: [
          "El historial de conversación se almacena de forma temporal para dar contexto a las respuestas y se elimina automáticamente transcurridas 24 horas (mediante un tiempo de vida —TTL— configurado en la base de datos). Después de ese plazo, el historial se borra de forma automática.",
          "No conservamos un registro permanente de las conversaciones. La entrega de los mensajes a través de WhatsApp se rige, además, por las políticas de Meta Platforms.",
        ],
      },
      {
        heading: "5. Con quién se comparten los datos (encargados del tratamiento)",
        content: [
          "Para operar el Servicio nos apoyamos en proveedores tecnológicos que actúan como encargados del tratamiento. Cada uno accede únicamente a los datos necesarios para su función:",
          [
            "Meta Platforms, Inc. (WhatsApp Business Platform): entrega y procesamiento de los mensajes de WhatsApp.",
            "Un proveedor de inteligencia artificial (modelo de lenguaje): procesa el contenido de los mensajes para generar las respuestas del asistente.",
            "Upstash, Inc.: almacenamiento temporal del historial de conversación.",
            "Vercel Inc.: alojamiento (hosting) del sitio y de la lógica del asistente.",
          ],
          "No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales o publicitarios.",
        ],
      },
      {
        heading: "6. Transferencias internacionales de datos",
        content: [
          "Algunos de nuestros proveedores procesan datos en servidores ubicados fuera de tu país de residencia, incluidos Estados Unidos y otras jurisdicciones. Al usar el Servicio, entiendes que tus datos pueden transferirse y tratarse en esos países.",
          "Procuramos trabajar con proveedores que ofrecen garantías adecuadas de protección de datos conforme a la normativa aplicable (por ejemplo, cláusulas contractuales estándar u otros mecanismos reconocidos).",
        ],
      },
      {
        heading: "7. Tus derechos (Espacio Económico Europeo / GDPR)",
        content: [
          "Si te encuentras en la UE/EEE, tienes derecho a:",
          [
            "Acceso: saber qué datos tratamos sobre ti.",
            "Rectificación: corregir datos inexactos o incompletos.",
            "Supresión («derecho al olvido»): solicitar que eliminemos tus datos.",
            "Portabilidad: recibir tus datos en un formato estructurado y de uso común.",
            "Oposición: oponerte al tratamiento basado en interés legítimo.",
            "Limitación: solicitar que restrinjamos el tratamiento en ciertos casos.",
            "Retirar el consentimiento en cualquier momento.",
          ],
          "También tienes derecho a presentar una reclamación ante la autoridad de control de protección de datos de tu país.",
        ],
      },
      {
        heading: "8. Usuarios de California (CCPA/CPRA)",
        content: [
          "Si resides en California, tienes derecho a:",
          [
            "Saber qué categorías de datos personales recopilamos y con qué fin.",
            "Solicitar la eliminación de tus datos personales.",
            "Solicitar la corrección de datos inexactos.",
            "Optar por no participar en la «venta» o «compartición» de datos personales.",
            "No ser discriminado por ejercer tus derechos.",
          ],
          "No vendemos ni compartimos tus datos personales a cambio de una contraprestación, según las definiciones de la CCPA/CPRA.",
        ],
      },
      {
        heading: "9. Usuarios en Colombia (Ley 1581 de 2012 — Habeas Data)",
        content: [
          "Como titular de los datos, la ley colombiana te reconoce el derecho a:",
          [
            "Conocer, actualizar y rectificar tus datos personales.",
            "Solicitar prueba de la autorización otorgada para el tratamiento.",
            "Ser informado sobre el uso que se da a tus datos.",
            "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.",
            "Revocar la autorización y/o solicitar la supresión de los datos cuando proceda.",
            "Acceder de forma gratuita a tus datos personales.",
          ],
          "El tratamiento de tus datos se realiza previa autorización, con la finalidad indicada en esta política. La autoridad de control en Colombia es la Superintendencia de Industria y Comercio (SIC).",
        ],
      },
      {
        heading: "10. Cómo ejercer tus derechos",
        content: [
          "Para ejercer cualquiera de los derechos anteriores, escríbenos a contact@davidsaenz.dev indicando tu solicitud y un medio para verificar tu identidad (por ejemplo, el número de WhatsApp desde el que escribiste). Atenderemos tu solicitud en los plazos que exija la normativa aplicable.",
        ],
      },
      {
        heading: "11. Seguridad",
        content: [
          "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, como la validación de la firma de los webhooks (HMAC), el cifrado en tránsito (HTTPS/TLS) y el acceso restringido a los sistemas. Ninguna transmisión por Internet o método de almacenamiento es 100% seguro, por lo que no podemos garantizar seguridad absoluta.",
        ],
      },
      {
        heading: "12. Cookies y tecnologías similares",
        content: [
          "Este sitio no utiliza cookies de rastreo, perfilado ni analítica publicitaria. Únicamente empleamos almacenamiento local (localStorage) del navegador para recordar tu preferencia de idioma; es una función técnica que no identifica a la persona ni se comparte con terceros.",
          "La aplicación de WhatsApp se rige por la política de privacidad de Meta Platforms, ajena a nuestro control.",
        ],
      },
      {
        heading: "13. Menores de edad",
        content: [
          "El Servicio está dirigido a personas mayores de edad. No recopilamos de forma consciente datos de menores. Si crees que un menor nos ha proporcionado datos personales, escríbenos a contact@davidsaenz.dev y los eliminaremos.",
        ],
      },
      {
        heading: "14. Cambios a esta política",
        content: [
          "Podemos actualizar esta Política de Privacidad para reflejar cambios en el Servicio o en la normativa. Publicaremos la versión vigente en esta misma página, con su fecha de última actualización. Te recomendamos revisarla periódicamente.",
        ],
      },
      {
        heading: "15. Contacto",
        content: [
          "Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, contáctanos en contact@davidsaenz.dev.",
        ],
      },
    ],
    disclaimer:
      "Aviso: este documento tiene carácter meramente informativo y no constituye asesoría legal. Cubre prácticas estándar de privacidad conforme a marcos internacionales de referencia, pero no sustituye la revisión de un profesional del derecho. Si el Servicio escala a una operación comercial de mayor volumen, se recomienda que un abogado especializado revise y adapte esta política.",
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: August 1, 2026",
    intro: [
      "This Privacy Policy describes how personal data is collected, used, shared, and protected for people who interact with the davidsaenz.dev website and its WhatsApp virtual assistant (the “Service”).",
      "By messaging the WhatsApp assistant or using the website, you accept the practices described in this document. If you do not agree, please do not use the Service.",
    ],
    sections: [
      {
        heading: "1. Data Controller",
        content: [
          "The controller responsible for processing your data is David Sáenz, an independent developer (natural person), reachable at:",
          ["Email: contact@davidsaenz.dev", "Website: https://www.davidsaenz.dev"],
        ],
      },
      {
        heading: "2. What data we collect",
        content: [
          "When you interact with the WhatsApp assistant, the following personal data is processed:",
          [
            "Your WhatsApp phone number.",
            "Your WhatsApp profile name.",
            "The content of the messages you send to the assistant.",
          ],
          "When you browse the website, a local language preference is stored in your browser (functional local storage). The site does not use tracking cookies or advertising analytics tools.",
          "We do not deliberately request or process sensitive data (health, beliefs, etc.), payment data, or identity documents. Please do not share such information through the chat.",
        ],
      },
      {
        heading: "3. Purpose and legal basis of processing",
        content: [
          "We process your data for the following purposes:",
          [
            "To operate the WhatsApp assistant and answer your questions about the services offered.",
            "To keep conversation context for a limited time so responses are coherent.",
            "To handle your contact interest when you express a wish to hire a service.",
          ],
          "Legal bases (under the EU General Data Protection Regulation — GDPR): (a) your consent, given when you voluntarily start a conversation with the assistant; and (b) the legitimate interest of responding to business contact requests. In Colombia, processing is carried out with your prior authorization as the data subject (Law 1581 of 2012).",
          "You may withdraw your consent at any time (see “Your rights”); this does not affect the lawfulness of prior processing.",
        ],
      },
      {
        heading: "4. Data retention",
        content: [
          "Conversation history is stored temporarily to give context to responses and is automatically deleted after 24 hours (via a time-to-live —TTL— configured in the database). After that period, the history is erased automatically.",
          "We do not keep a permanent record of conversations. Message delivery through WhatsApp is also governed by Meta Platforms' policies.",
        ],
      },
      {
        heading: "5. Who we share data with (processors)",
        content: [
          "To operate the Service we rely on technology providers acting as data processors. Each one accesses only the data needed for its function:",
          [
            "Meta Platforms, Inc. (WhatsApp Business Platform): delivery and processing of WhatsApp messages.",
            "An artificial intelligence provider (language model): processes message content to generate the assistant's responses.",
            "Upstash, Inc.: temporary storage of conversation history.",
            "Vercel Inc.: hosting of the website and the assistant's logic.",
          ],
          "We do not sell, rent, or transfer your personal data to third parties for commercial or advertising purposes.",
        ],
      },
      {
        heading: "6. International data transfers",
        content: [
          "Some of our providers process data on servers located outside your country of residence, including the United States and other jurisdictions. By using the Service, you understand that your data may be transferred to and processed in those countries.",
          "We aim to work with providers that offer adequate data-protection safeguards under applicable law (for example, standard contractual clauses or other recognized mechanisms).",
        ],
      },
      {
        heading: "7. Your rights (European Economic Area / GDPR)",
        content: [
          "If you are in the EU/EEA, you have the right to:",
          [
            "Access: know what data we process about you.",
            "Rectification: correct inaccurate or incomplete data.",
            "Erasure (“right to be forgotten”): request that we delete your data.",
            "Portability: receive your data in a structured, commonly used format.",
            "Objection: object to processing based on legitimate interest.",
            "Restriction: request that we restrict processing in certain cases.",
            "Withdraw consent at any time.",
          ],
          "You also have the right to lodge a complaint with the data-protection supervisory authority in your country.",
        ],
      },
      {
        heading: "8. California residents (CCPA/CPRA)",
        content: [
          "If you reside in California, you have the right to:",
          [
            "Know what categories of personal data we collect and why.",
            "Request deletion of your personal data.",
            "Request correction of inaccurate data.",
            "Opt out of the “sale” or “sharing” of personal data.",
            "Not be discriminated against for exercising your rights.",
          ],
          "We do not sell or share your personal data for valuable consideration, as those terms are defined under the CCPA/CPRA.",
        ],
      },
      {
        heading: "9. Colombia residents (Law 1581 of 2012 — Habeas Data)",
        content: [
          "As the data subject, Colombian law grants you the right to:",
          [
            "Know, update, and rectify your personal data.",
            "Request proof of the authorization granted for processing.",
            "Be informed about how your data is used.",
            "File complaints with the Superintendency of Industry and Commerce (SIC) for violations of the law.",
            "Revoke the authorization and/or request deletion of the data where applicable.",
            "Access your personal data free of charge.",
          ],
          "Your data is processed with prior authorization, for the purpose stated in this policy. The supervisory authority in Colombia is the Superintendency of Industry and Commerce (SIC).",
        ],
      },
      {
        heading: "10. How to exercise your rights",
        content: [
          "To exercise any of the rights above, write to contact@davidsaenz.dev stating your request and a way to verify your identity (for example, the WhatsApp number you messaged from). We will handle your request within the timeframes required by applicable law.",
        ],
      },
      {
        heading: "11. Security",
        content: [
          "We apply reasonable technical and organizational measures to protect your data, such as webhook signature validation (HMAC), encryption in transit (HTTPS/TLS), and restricted system access. No transmission over the Internet or storage method is 100% secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "12. Cookies and similar technologies",
        content: [
          "This site does not use tracking, profiling, or advertising analytics cookies. We only use the browser's local storage (localStorage) to remember your language preference; this is a technical function that does not identify the person and is not shared with third parties.",
          "The WhatsApp application is governed by Meta Platforms' own privacy policy, which is outside our control.",
        ],
      },
      {
        heading: "13. Minors",
        content: [
          "The Service is intended for adults. We do not knowingly collect data from minors. If you believe a minor has provided us with personal data, write to contact@davidsaenz.dev and we will delete it.",
        ],
      },
      {
        heading: "14. Changes to this policy",
        content: [
          "We may update this Privacy Policy to reflect changes to the Service or to the law. We will publish the current version on this page, with its last-updated date. We recommend reviewing it periodically.",
        ],
      },
      {
        heading: "15. Contact",
        content: [
          "If you have questions about this policy or about how your data is processed, contact us at contact@davidsaenz.dev.",
        ],
      },
    ],
    disclaimer:
      "Disclaimer: this document is for informational purposes only and does not constitute legal advice. It covers standard privacy practices under reference international frameworks, but it is not a substitute for review by a legal professional. If the Service scales into a higher-volume commercial operation, we recommend that a qualified attorney review and adapt this policy.",
  },
};
