"use client"
import { useId, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Status = 'idle' | 'sending' | 'success' | 'error';

const ContactForm = () => {
    const { dict } = useLanguage();
    const [status, setStatus] = useState<Status>('idle');
    // Unique ids so each <label> points at its control (htmlFor).
    const id = useId();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('sending');
        
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
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    }

    const message = status === 'success' ? dict.contact.statusSuccess : status === 'error' ? dict.contact.statusError : '';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 bg-slate-800/40 border border-slate-800 rounded-3xl shadow-xl shadow-slate-900/50">
            {/* Honeypot para evitar Spam Bots */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-servicio`} className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[0]}</label>
                <select id={`${id}-servicio`} name="servicio" required className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 outline-none focus:border-emerald-500 transition-all">
                    <option value="web">{dict.contact.formSelect[0]}</option>
                    <option value="ai">{dict.contact.formSelect[1]}</option>
                    <option value="data">{dict.contact.formSelect[2]}</option>
                    <option value="other">{dict.contact.formSelect[3]}</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-nombre`} className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[1]}</label>
                <input id={`${id}-nombre`} type="text" name="nombre" required placeholder={dict.contact.formPlaceholders[0]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-email`} className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[2]}</label>
                <input id={`${id}-email`} type="email" name="email" required placeholder={dict.contact.formPlaceholders[1]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-mensaje`} className="text-slate-300 font-semibold text-sm">{dict.contact.formLabels[3]}</label>
                <textarea id={`${id}-mensaje`} name="mensaje" required rows={4} placeholder={dict.contact.formPlaceholders[2]} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all resize-none"></textarea>
            </div>

            {/* The status region is always rendered (live regions must exist before their text changes); while
                empty it takes no space, so the idle form keeps its layout. */}
            <div className="mt-4">
                <button type="submit" disabled={status === 'sending'} className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-wait disabled:hover:bg-emerald-600">
                    {status === 'sending' ? dict.contact.btnSending : dict.contact.btnSubmit}
                </button>
                <p role="status" className={`text-sm font-medium mt-4 empty:mt-0 ${status === 'error' ? 'text-amber-400' : 'text-emerald-400'}`}>{message}</p>
            </div>
        </form>
    );
}

export default ContactForm;
