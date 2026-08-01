import type { Metadata } from "next";
import PrivacyContent from "@/components/privacy-content";

export const metadata: Metadata = {
  title: "Política de Privacidad — David Sáenz",
  description:
    "Política de privacidad del sitio davidsaenz.dev y su asistente de WhatsApp: qué datos se tratan, con quién se comparten, cuánto se retienen y tus derechos.",
};

const PrivacyPage = () => <PrivacyContent />;

export default PrivacyPage;
