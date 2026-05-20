"use client";

import React, { useState } from "react";
import "../styles/faq.css";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "WHAT MATERIALS ARE USED IN YOUR JEWELRY BOXES?",
        answer:
            "Our jewelry boxes are crafted using premium materials including velvet-lined interiors, sturdy wood composites, and hand-finished exteriors. Each piece is carefully selected to ensure durability and elegance that stands the test of time.",
    },
    {
        id: 2,
        question: "ARE YOUR JEWELRY BOXES SUITABLE FOR TRAVEL?",
        answer:
            "YES, OUR DESIGNS ARE STRUCTURED AND COMPACT, MAKING THEM SUITABLE FOR BOTH EVERYDAY USE AND TRAVEL, WHILE KEEPING YOUR PIECES SECURE.",
    },
    {
        id: 3,
        question: "HOW MANY DESIGNS DO YOU OFFER?",
        answer:
            "We offer a curated collection of designs that blend timeless elegance with modern sensibility. Each season brings new additions to our collection while honoring our classic signature pieces.",
    },
    {
        id: 4,
        question: "DO YOU OFFER INTERNATIONAL SHIPPING?",
        answer:
            "Yes, we ship worldwide. International shipping rates and delivery times vary by destination. All orders are carefully packaged to ensure your pieces arrive in perfect condition.",
    },
    {
        id: 5,
        question: "CAN I RETURN OR EXCHANGE MY ORDER?",
        answer:
            "We accept returns and exchanges within 14 days of delivery, provided the item is in its original condition and packaging. Please contact us to initiate the process.",
    },
    {
        id: 6,
        question: "IS THIS SUITABLE AS A GIFT?",
        answer:
            "Absolutely. Our jewelry boxes make exceptional gifts. We offer complimentary gift wrapping and can include a personalized note with your order. Simply add your message at checkout.",
    },
    {
        id: 7,
        question: "HOW DO I CARE FOR MY JEWELRY BOX?",
        answer:
            "To maintain your jewelry box, wipe the exterior with a soft dry cloth. Avoid exposure to direct sunlight, moisture, and harsh chemicals. The interior velvet can be gently brushed to remove dust.",
    },
];

const FAQ: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(2);

    const toggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="faq-page">
            {/* Hero Section */}
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

            {/* FAQ Accordion Section */}
            <section className="faq-accordion-section">
                <div className="faq-accordion-container">
                    {faqData.map((item) => (
                        <div
                            key={item.id}
                            className={`faq-accordion-item ${openId === item.id ? "faq-accordion-item--open" : ""}`}
                        >
                            <button
                                className="faq-accordion-header"
                                onClick={() => toggle(item.id)}
                                aria-expanded={openId === item.id}
                                type="button"
                            >
                                <span className="faq-accordion-question">
                                    {item.id}. {item.question}
                                </span>
                                <span className="faq-accordion-icon">
                                    {openId === item.id ? "▲" : "▼"}
                                </span>
                            </button>
                            {openId === item.id && (
                                <div className="faq-accordion-body">
                                    <p className="faq-accordion-answer">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Still Have Questions Section */}
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
                    {/* Mobile Frame - only visible on mobile devices */}
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
                            WE'RE HERE TO HELP — WHETHER YOU NEED ASSISTANCE WITH YOUR ORDER,
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