'use client';

import React, { useState } from 'react';
import '../styles/ProductFaqs.css';

const faqs = [
    {
        question: 'WHAT MATERIALS ARE USED IN YOUR JEWELRY BOXES?',
        answer: 'OUR JEWELRY BOXES ARE CRAFTED WITH CAREFULLY SELECTED WOOD, SOFT VELVET LINING, AND STRUCTURED COMPARTMENTS DESIGNED TO PROTECT YOUR PIECES.',
    },
    {
        question: 'ARE YOUR JEWELRY BOXES SUITABLE FOR TRAVEL?',
        answer: 'YES, OUR DESIGNS ARE STRUCTURED AND COMPACT, MAKING THEM SUITABLE FOR BOTH EVERYDAY USE AND TRAVEL, WHILE KEEPING YOUR PIECES SECURE.',
    },
    {
        question: 'HOW MANY DESIGNS DO YOU OFFER?',
        answer: 'WE OFFER A CURATED SELECTION OF DESIGNS, WITH OPTIONS THAT MAY VARY BY SIZE, FABRIC COLOR, AND INTERIOR DETAIL.',
    },
    {
        question: 'DO YOU OFFER INTERNATIONAL SHIPPING?',
        answer: 'YES, INTERNATIONAL SHIPPING OPTIONS ARE AVAILABLE AND CAN BE CONFIRMED DURING CHECKOUT.',
    },
];

const ProductFaqs: React.FC = () => {
    const [openQuestion, setOpenQuestion] = useState<string | null>('ARE YOUR JEWELRY BOXES SUITABLE FOR TRAVEL?');

    return (
        <section className="product-faqs">
            <div className="product-faqs__inner">
                <h2 className="product-faqs__title">FREQUENTLY ASKED QUESTIONS</h2>

                <div className="product-faqs__list">
                    {faqs.map((faq) => (
                        <div className="product-faqs__item" key={faq.question}>
                            <button
                                className="product-faqs__question"
                                type="button"
                                onClick={() => setOpenQuestion((current) => current === faq.question ? null : faq.question)}
                                aria-expanded={openQuestion === faq.question}
                            >
                                <span>{faq.question}</span>
                                <span aria-hidden="true">{openQuestion === faq.question ? '-' : '+'}</span>
                            </button>
                            {openQuestion === faq.question && (
                                <p className="product-faqs__answer">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductFaqs;
