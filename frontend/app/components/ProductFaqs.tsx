'use client';

import React, { useEffect, useState } from 'react';
import '../styles/ProductFaqs.css';
import { defaultFaqs, FaqItem, fetchSiteContent } from '../lib/siteContent';

type ProductFaqsProps = {
    placement?: 'product' | 'shop';
};

const isVisibleForPlacement = (faq: FaqItem, placement: ProductFaqsProps['placement']) => (
    placement === 'shop' ? faq.showOnShopPage : faq.showOnProductPage
);

const ProductFaqs: React.FC<ProductFaqsProps> = ({ placement = 'product' }) => {
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs.filter((faq) => isVisibleForPlacement(faq, placement)));

    useEffect(() => {
        fetchSiteContent()
            .then((content) => {
                setFaqs(content.faqs.filter((faq) => isVisibleForPlacement(faq, placement)));
            })
            .catch(() => setFaqs(defaultFaqs.filter((faq) => isVisibleForPlacement(faq, placement))));
    }, [placement]);

    if (faqs.length === 0) {
        return null;
    }

    return (
        <section className="product-faqs">
            <div className="product-faqs__inner">
                <h2 className="product-faqs__title">FREQUENTLY ASKED QUESTIONS</h2>

                <div className="product-faqs__list">
                    {faqs.map((faq) => (
                        <div className="product-faqs__item" key={faq._id || faq.question}>
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
