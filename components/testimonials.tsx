import { dataTestimonials } from '@/data';
import Image from 'next/image';

const Testimonials = () => {
    return (
        <div className="flex flex-col mt-24 mb-32">
            <h2 className="text-3xl font-bold md:text-5xl text-center md:text-left mb-6">
                Lo que dicen mis <span className="text-emerald-500">clientes</span>
            </h2>
            <div className="grid max-w-6xl gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3 mt-8">
                {dataTestimonials.map((data) => (
                    <div key={data.id} className="p-6 transition-all duration-300 rounded-3xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 shadow-xl cursor-default flex flex-col justify-between">
                        <p className="text-slate-300 mb-6 italic">"{data.description}"</p>
                        <div className="flex items-center gap-4 mt-auto">
                            <Image src={data.imageUrl} alt={data.name} width={50} height={50} className="rounded-full" />
                            <h4 className="font-bold text-white">{data.name}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonials;
