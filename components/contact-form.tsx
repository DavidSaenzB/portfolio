"use client"
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const ContactForm = () => {
    const { dict } = useLanguage();
    const [status, setStatus] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus(dict.contact.statusLoading);
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        // Endpoint de Formspree 
        const endpointUrl = "https://formspree.io/f/xkoqapbd";

        try {
            const response = await fetch(endpointUrl, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                setStatus(dict.contact.statusSuccess);
                form.reset();
            } else {
                setStatus(dict.contact.statusError);
            }
        } catch (error) {
            setStatus(dict.contact.statusError);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 bg-slate-800/40 border border-slate-800 rounded-3xl shadow-xl shadow-slate-900/50">
            {/* Honeypot para evitar Spam Bots */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex flex-col gap-2">
                <label className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[0]}</label>
                <select name="servicio" required className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 outline-none focus:border-emerald-500 transition-all">
                    <option value="web">{dict.contact.formSelect[0]}</option>
                    <option value="ai">{dict.contact.formSelect[1]}</option>
                    <option value="data">{dict.contact.formSelect[2]}</option>
                    <option value="other">{dict.contact.formSelect[3]}</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[1]}</label>
                <input type="text" name="nombre" required placeholder={dict.contact.formPlaceholders[0]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[2]}</label>
                <input type="email" name="email" required placeholder={dict.contact.formPlaceholders[1]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[3]}</label>
                <textarea name="mensaje" required rows={4} placeholder={dict.contact.formPlaceholders[2]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all resize-none"></textarea>
            </div>

            <button type="submit" className="mt-4 p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25">
                {dict.contact.btnSubmit}
            </button>

            {status && <p className="text-emerald-400 text-sm font-medium mt-2">{status}</p>}
        </form>
    );
}

export default ContactForm;
