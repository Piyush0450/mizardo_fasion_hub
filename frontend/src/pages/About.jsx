import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
    return (
        <div className="min-h-screen bg-brand-light-bg dark:bg-brand-black text-brand-light-text dark:text-white transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-brand-green/10 dark:bg-brand-green/5 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tighter"
                    >
                        THE <span className="text-brand-green">MIZARDO</span> STORY
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light"
                    >
                        Redefining luxury through sustainable innovation and timeless design.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Philosophy</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Founded in 2024, Mizardo emerged from a simple yet powerful idea: that luxury shouldn't come at the cost of our planet. We believe in creating pieces that not only look exceptional but also feel right.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Every stitch, every fabric, and every design decision is guided by our commitment to quality, sustainability, and ethical craftsmanship. We don't just sell clothes; we curate experiences for the modern individual who values both style and substance.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Fashion Design Studio"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-6 -right-6 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Sustainability", desc: "Eco-friendly materials and ethical production processes." },
                            { title: "Innovation", desc: "Pushing boundaries in design and textile technology." },
                            { title: "Quality", desc: "Uncompromising attention to detail in every garment." }
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="bg-white dark:bg-brand-dark p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-brand-green/50 transition-colors"
                            >
                                <h3 className="text-xl font-bold mb-4 text-brand-green">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
