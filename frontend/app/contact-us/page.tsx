"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import contactBg from "../images/contact-us.png";
import stripeBg from "../images/Stripe.jpg";
import flowerImg from "../images/contact-us-flower.png";

const ContactSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-[1150px] flex flex-col items-center justify-center overflow-hidden pt-32 pb-24 md:py-0">
            {/* Background Layer - Top Dark Image */}
            <div className="absolute top-0 left-0 w-full h-[60%] md:h-[65%] z-0">
                <Image
                    src={contactBg}
                    alt="Contact background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/50 z-10"></div>
            </div>

            {/* Background Layer - Bottom Striped Pattern */}
            <div
                className="absolute bottom-0 left-0 w-full h-[40%] md:h-[35%] z-0"
                style={{
                    backgroundImage: `url(${stripeBg.src})`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "auto",
                }}
            ></div>

            {/* Content Layer */}
            <div className="relative z-20 w-full flex flex-col items-center px-4">
                {/* Headings */}
                <motion.div
                    className="text-center mb-6 md:mb-8 mt-12 md:mt-24"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2
                        className="font-[family-name:var(--font-cormorant)] text-[38px] md:text-[55px] text-[#E6DDD7] mb-0"
                        style={{ letterSpacing: "0.08em" }}
                    >
                        GET IN TOUCH
                    </h2>
                    <p className="font-[family-name:var(--font-pinyon)] text-[32px] md:text-[46px] text-[#E6DDD7] -mt-2 md:-mt-4">
                        We’d love to hear from you.
                    </p>
                </motion.div>

                {/* Decorative Flower Frame */}
                <motion.div
                    className="z-30 relative -mb-[75px] drop-shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <Image
                        src={flowerImg}
                        alt="Decorative flower frame"
                        width={130}
                        className="w-[110px] md:w-[130px]"
                    />
                </motion.div>

                {/* Contact Form Card */}
                <motion.div
                    className="bg-[#E8E1DB] w-full max-w-[650px] px-6 py-12 md:px-14 md:py-16 flex flex-col items-center shadow-md relative z-20 pt-24 md:pt-28"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                    {/* Intro Text */}
                    <p
                        className="font-[family-name:var(--font-cormorant)] text-[#826060] text-center text-[13px] md:text-[15px] leading-[1.8] mb-10 max-w-[480px] uppercase"
                        style={{ letterSpacing: "0.1em" }}
                    >
                        WHETHER YOU HAVE A QUESTION, NEED ASSISTANCE,
                        <br className="hidden md:block" />
                        OR SIMPLY WANT TO CONNECT — WE’RE HERE.
                    </p>

                    {/* Form Fields */}
                    <form className="w-full flex flex-col gap-5">
                        <input
                            type="text"
                            placeholder="FIRST NAME"
                            className="w-full h-[42px] bg-transparent border border-[#B89C9C] px-4 font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] text-[#5A3D3D] placeholder:text-[#A88C8C] placeholder:uppercase focus:outline-none focus:border-[#826060] focus:ring-0 transition-colors rounded-none"
                        />
                        <input
                            type="text"
                            placeholder="LAST NAME"
                            className="w-full h-[42px] bg-transparent border border-[#B89C9C] px-4 font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] text-[#5A3D3D] placeholder:text-[#A88C8C] placeholder:uppercase focus:outline-none focus:border-[#826060] focus:ring-0 transition-colors rounded-none"
                        />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full h-[42px] bg-transparent border border-[#B89C9C] px-4 font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] text-[#5A3D3D] placeholder:text-[#A88C8C] placeholder:uppercase focus:outline-none focus:border-[#826060] focus:ring-0 transition-colors rounded-none"
                        />
                        <input
                            type="tel"
                            placeholder="CONTACT NO."
                            className="w-full h-[42px] bg-transparent border border-[#B89C9C] px-4 font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] text-[#5A3D3D] placeholder:text-[#A88C8C] placeholder:uppercase focus:outline-none focus:border-[#826060] focus:ring-0 transition-colors rounded-none"
                        />
                        <textarea
                            placeholder="MESSAGE"
                            className="w-full h-[150px] bg-transparent border border-[#B89C9C] px-4 py-3 font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] text-[#5A3D3D] placeholder:text-[#A88C8C] placeholder:uppercase focus:outline-none focus:border-[#826060] focus:ring-0 transition-colors rounded-none resize-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-[#4A0008] text-[#fffdf7] font-[family-name:var(--font-hanken)] font-light text-[14px] md:text-[15px] h-[46px] mt-4 hover:bg-[#6A0A16] transition-colors duration-500 ease-in-out rounded-none uppercase flex items-center justify-center"
                            style={{ letterSpacing: "0.15em" }}
                        >
                            SEND MESSAGE
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;
