"use client";

import React, { useEffect, useState } from "react";
import "../styles/faq.css";
import { defaultFaqs, FaqItem, fetchSiteContent } from "../lib/siteContent";

const FAQ: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(null);
    const [faqData, setFaqData] = useState<FaqItem[]>(defaultFaqs);

    useEffect(() => {
        fetchSiteContent()
            .then((content) => setFaqData(content.faqs))
            .catch(() => setFaqData(defaultFaqs));
    }, []);

    const toggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="faq-page">
            <section className="faq-hero">
                <div className="faq-hero-overlay" />
                <div className="faq-hero-bg">
                    <img
                        src="/images/faq.jpeg"
                        alt="FAQ Hero"
                        className="faq-hero-img"
                    />
                </div>
                <div className="faq-hero-content">
                    <h1 className="faq-hero-title">FREQUENTLY ASKED QUESTIONS</h1>
                </div>
                <div className="faq-key-emblem">
                    <img
                        src="/images/faq_key.png"
                        alt="Key Emblem"
                        className="faq-key-frame"
                    />
                </div>
            </section>

            <section className="faq-accordion-section">
                <div className="faq-accordion-container">
                    {faqData.map((item, index) => {
                        const id = index + 1;
                        return (
                            <div
                                key={item._id || `${item.question}-${id}`}
                                className={`faq-accordion-item ${openId === id ? "faq-accordion-item--open" : ""}`}
                            >
                                <button
                                    className="faq-accordion-header"
                                    onClick={() => toggle(id)}
                                    aria-expanded={openId === id}
                                    type="button"
                                >
                                    <span className="faq-accordion-question">
                                        {id}. {item.question}
                                    </span>
                                    <span className="faq-accordion-icon">
                                        {openId === id ? "▲" : "▼"}
                                    </span>
                                </button>
                                {openId === id && (
                                    <div className="faq-accordion-body">
                                        <p className="faq-accordion-answer">{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="faq-contact-section">
                <div className="faq-contact-left">
                    <div className="faq-decorative-frame">
                        <img
                            src="/images/faq_frame.png"
                            alt="Decorative Frame"
                            className="faq-decorative-frame-img"
                        />
                    </div>
                </div>

                <div className="faq-contact-stripe-bg">
                    <div className="faq-mobile-frame">
                        <img
                            src="/images/faq_frame.png"
                            alt="Decorative Frame"
                            className="faq-mobile-frame-img"
                        />
                    </div>

                    <div className="faq-contact-text-block">
                        <h2 className="faq-contact-title">STILL HAVE QUESTIONS?</h2>
                        <p className="faq-contact-body">
                            WE&apos;RE HERE TO HELP - WHETHER YOU NEED ASSISTANCE WITH YOUR ORDER,
                            HAVE A QUESTION ABOUT OUR PIECES, OR SIMPLY WANT TO CONNECT.
                        </p>
                        <button className="faq-contact-btn">CONTACT US NOW</button>
                    </div>
                </div>

                <div className="faq-contact-right">
                    <img
                        src="/images/faq_product.png"
                        alt="Heirloom Product"
                        className="faq-contact-product-img"
                    />
                </div>
            </section>
        </div>
    );
};

export default FAQ;
