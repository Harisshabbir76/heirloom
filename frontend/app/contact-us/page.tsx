"use client";

import React from "react";
import Image from "next/image";
import contactBg from "../images/contact-us.png";
import stripeBg from "../images/Stripe.jpg";
import flowerImg from "../images/contact-us-flower.png";
import "../styles/contact.css";
import Marquee from "../components/Marquee";
import StoryMemories from '../components/StoryMemories';

const ContactSection: React.FC = () => {
    const [isSending, setIsSending] = React.useState(false);
    const [modal, setModal] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formEl = event.currentTarget;
        setIsSending(true);

        try {
            const formData = new FormData(formEl);
            const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
            const normalizedBase = apiBase
                .replace(/\/+$/u, '')
                .replace(/\/api$/u, '');

            const response = await fetch(`${normalizedBase}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    message: formData.get('message'),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            await response.json().catch(() => null);

            formEl.reset();
            setModal({
                type: 'success',
                message: "Your message has been sent successfully! We'll get back to you soon."
            });
        } catch (error) {
            setModal({
                type: 'error',
                message: 'Failed to send message. Please try again later.'
            });
        } finally {
            setIsSending(false);
        }
    }

    const closeModal = () => {
        setModal(null);
    };

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
                    style={{ backgroundImage: `url(${stripeBg.src})` }}
                ></div>

                {/* Content Layer */}
                <div className="contact-content">

                    {/* Headings */}
                    <div className="contact-headings-container">
                        <h2 className="contact-heading-main">
                            GET IN TOUCH
                        </h2>
                        <p className="contact-heading-sub">
                            We'd love to hear from you.
                        </p>
                    </div>

                    {/* Decorative Flower Frame
                        — width is controlled by CSS (.contact-flower-container width)
                        — height is ALWAYS auto so the image never stretches            */}
                    <div className="contact-flower-container">
                        <Image
                            src={flowerImg}
                            alt="Decorative flower frame"
                            width={130}
                            height={0}
                            className="contact-flower-img"
                            style={{ height: 'auto' }}
                        />
                    </div>

                    {/* Contact Form Card */}
                    <div className="contact-form-card">
                        {/* Intro Text */}
                        <p className="contact-form-intro">
                            WHETHER YOU HAVE A QUESTION, NEED ASSISTANCE,
                            <br className="contact-form-intro-br" />
                            OR SIMPLY WANT TO CONNECT — WE'RE HERE.
                        </p>

                        {/* Form Fields */}
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <input
                                name="firstName"
                                type="text"
                                placeholder="FIRST NAME"
                                className="contact-input !border-[2px]"
                                required
                            />
                            <input
                                name="lastName"
                                type="text"
                                placeholder="LAST NAME"
                                className="contact-input !border-[2px]"
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                className="contact-input !border-[2px]"
                                required
                            />
                            <input
                                name="phone"
                                type="tel"
                                placeholder="CONTACT NO."
                                className="contact-input !border-[2px]"
                            />
                            <textarea
                                name="message"
                                placeholder="MESSAGE"
                                className="contact-input !border-[2px] contact-textarea"
                                required
                            />

                            <button
                                type="submit"
                                className="contact-submit-btn"
                                disabled={isSending}
                            >
                                {isSending ? 'SENDING...' : 'SEND MESSAGE'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Modal Popup */}
            {modal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className={`modal-icon ${modal.type === 'success' ? 'modal-icon-success' : 'modal-icon-error'}`}>
                            {modal.type === 'success' ? '✓' : '✗'}
                        </div>
                        <h3 className="modal-title">
                            {modal.type === 'success' ? 'Success!' : 'Error!'}
                        </h3>
                        <p className="modal-message">
                            {modal.message}
                        </p>
                        <button className="modal-button" onClick={closeModal}>
                            OK
                        </button>
                    </div>
                </div>
            )}

            <Marquee />
            <StoryMemories />
        </div>
    );
};

export default ContactSection;