"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import contactBg from "../images/contact-us.png";
import stripeBg from "../images/Stripe.jpg";
import flowerImg from "../images/contact-us-flower.png";
import "../styles/contact.css";
import Marquee from "../components/Marquee";
import StoryMemories from '../components/StoryMemories';

const ContactSection: React.FC = () => {
    return (
        <div>
            <section className="contact-section">

                {/* Background Layer - Top Dark Image */}
                <div className="contact-bg-top">
                    <Image
                        src={contactBg}
                        alt="Contact background"
                        fill
                        className="contact-image"
                        priority
                    />
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                </div>

                {/* Background Layer - Bottom Striped Pattern */}
                <div
                    className="contact-bg-bottom"
                    style={{
                        backgroundImage: `url(${stripeBg.src})`,
                    }}
                ></div>

                {/* Content Layer */}
                <div className="contact-content">
                    {/* Headings */}
                    <motion.div
                        className="contact-headings-container"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="contact-heading-main ">
                            GET IN TOUCH
                        </h2>
                        <p className="contact-heading-sub ">
                            We’d love to hear from you.
                        </p>
                    </motion.div>

                    {/* Decorative Flower Frame */}
                    <motion.div
                        className="contact-flower-container"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <Image
                            src={flowerImg}
                            alt="Decorative flower frame"
                            width={130}
                            className="contact-flower-img"
                        />
                    </motion.div>

                    {/* Contact Form Card */}
                    <motion.div
                        className="contact-form-card"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        {/* Intro Text */}
                        <p className="contact-form-intro">
                            WHETHER YOU HAVE A QUESTION, NEED ASSISTANCE,
                            <br className="contact-form-intro-br" />
                            OR SIMPLY WANT TO CONNECT — WE’RE HERE.
                        </p>

                        {/* Form Fields */}
                        <form className="contact-form">
                            <input
                                type="text"
                                placeholder="FIRST NAME"
                                className="contact-input !border-[2px]"
                            />
                            <input
                                type="text"
                                placeholder="LAST NAME"
                                className="contact-input !border-[2px]"
                            />
                            <input
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                className="contact-input !border-[2px]"
                            />
                            <input
                                type="tel"
                                placeholder="CONTACT NO."
                                className="contact-input !border-[2px]"
                            />
                            <textarea
                                placeholder="MESSAGE"
                                className="contact-input !border-[2px] contact-textarea"
                            />

                            <button
                                type="submit"
                                className="contact-submit-btn"
                            >
                                SEND MESSAGE
                            </button>
                        </form>
                    </motion.div>

                </div>
            </section>

            <Marquee />
            <StoryMemories />
        </div>

    );
};

export default ContactSection;
