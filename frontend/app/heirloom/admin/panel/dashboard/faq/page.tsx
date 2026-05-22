'use client';

import React, { useEffect, useState } from 'react';
import '../../../../../styles/Dashboard.css';
import '../../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../../../components/DashboardSidebar';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import { defaultFaqs, FaqItem, fetchSiteContent, getApiBase } from '../../../../../lib/siteContent';

export default function FaqDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState<{ show: boolean; success: boolean; message: string }>({
        show: false,
        success: false,
        message: '',
    });

    useEffect(() => {
        const load = async () => {
            const allowed = await hasDashboardAccess();
            if (!allowed) {
                router.replace('/404');
                setIsAuthorized(false);
                return;
            }

            setIsAuthorized(true);
            try {
                const content = await fetchSiteContent();
                setFaqs(content.faqs);
            } catch {
                setFaqs(defaultFaqs);
            }
        };

        load();
    }, [router]);

    const updateFaq = (index: number, patch: Partial<FaqItem>) => {
        setFaqs((current) => current.map((faq, faqIndex) => (
            faqIndex === index ? { ...faq, ...patch } : faq
        )));
    };

    const addFaq = () => {
        setFaqs((current) => [...current, { question: '', answer: '', showOnProductPage: false, showOnShopPage: false }]);
    };

    const removeFaq = (index: number) => {
        setFaqs((current) => current.filter((_, faqIndex) => faqIndex !== index));
    };

    const saveFaqs = async () => {
        setSaving(true);
        try {
            const base = getApiBase();
            const response = await fetch(`${base}/api/site-content/faqs`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ faqs }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error('Failed to save');
            setFaqs(result.data);
            setModal({ show: true, success: true, message: 'FAQs saved successfully!' });
        } catch {
            setModal({ show: true, success: false, message: 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    if (isAuthorized === false || isAuthorized === null) {
        return <div className="dashboard-container" />;
    }

    return (
        <div className="dashboard-container">
            <DashboardSidebar />
            <header className="dashboard-header content-dashboard-header">
                <div>
                    <h1 className="dashboard-title">FAQ</h1>
                    <p className="dashboard-kicker">Edit FAQ page questions and choose which appear on product and shop pages.</p>
                </div>
                <button type="button" className="add-btn" onClick={saveFaqs} disabled={saving}>
                    {saving ? 'Saving...' : 'Save FAQs'}
                </button>
            </header>

            <section className="content-editor">
                {faqs.map((faq, index) => (
                    <article className="content-card" key={faq._id || index}>
                        <div className="content-card__header">
                            <h2 className="content-card__title">Question {index + 1}</h2>
                            <button type="button" className="edit-link" onClick={() => removeFaq(index)}>
                                Remove
                            </button>
                        </div>
                        <div className="content-grid">
                            <div className="content-field full-width">
                                <label>Question</label>
                                <input
                                    value={faq.question}
                                    onChange={(event) => updateFaq(index, { question: event.target.value })}
                                />
                            </div>
                            <div className="content-field full-width">
                                <label>Answer</label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(event) => updateFaq(index, { answer: event.target.value })}
                                />
                            </div>
                            <label className="content-checkbox">
                                <input
                                    type="checkbox"
                                    checked={Boolean(faq.showOnProductPage)}
                                    onChange={(event) => updateFaq(index, { showOnProductPage: event.target.checked })}
                                />
                                <span>Show on product page</span>
                            </label>
                            <label className="content-checkbox">
                                <input
                                    type="checkbox"
                                    checked={Boolean(faq.showOnShopPage)}
                                    onChange={(event) => updateFaq(index, { showOnShopPage: event.target.checked })}
                                />
                                <span>Show on shop page</span>
                            </label>
                        </div>
                    </article>
                ))}

                <div className="content-actions">
                    <button type="button" className="add-btn" onClick={addFaq}>+ Add Question</button>
                    <button type="button" className="add-btn" onClick={saveFaqs} disabled={saving}>
                        {saving ? 'Saving...' : 'Save FAQs'}
                    </button>
                </div>
            </section>
            {modal.show && (
                <div className="modal-overlay" onClick={() => setModal({ show: false, success: modal.success, message: '' })}>
                    <div className="modal-container" onClick={(event) => event.stopPropagation()}>
                        <div className={`modal-icon ${modal.success ? 'modal-icon-success' : 'modal-icon-error'}`}>
                            {modal.success ? 'OK' : '!'}
                        </div>
                        <h3 className="modal-title">{modal.success ? 'Success!' : 'Error!'}</h3>
                        <p className="modal-message">{modal.message}</p>
                        <button className="modal-button" onClick={() => setModal({ show: false, success: modal.success, message: '' })}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
