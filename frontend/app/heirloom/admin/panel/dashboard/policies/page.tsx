'use client';

import React, { useEffect, useState } from 'react';
import '../../../../../styles/Dashboard.css';
import '../../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../../../components/DashboardSidebar';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import { defaultLegalPolicies, fetchSiteContent, getApiBase, LegalPolicy } from '../../../../../lib/siteContent';

export default function PoliciesDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [policies, setPolicies] = useState<LegalPolicy[]>(defaultLegalPolicies);
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
                setPolicies(content.legalPolicies);
            } catch {
                setPolicies(defaultLegalPolicies);
            }
        };

        load();
    }, [router]);

    const updatePolicy = (policyIndex: number, patch: Partial<LegalPolicy>) => {
        setPolicies((current) => current.map((policy, index) => (
            index === policyIndex ? { ...policy, ...patch } : policy
        )));
    };

    const updateSection = (policyIndex: number, sectionIndex: number, patch: { heading?: string; paragraphsText?: string }) => {
        setPolicies((current) => current.map((policy, index) => {
            if (index !== policyIndex) return policy;
            return {
                ...policy,
                sections: policy.sections.map((section, innerIndex) => {
                    if (innerIndex !== sectionIndex) return section;
                    return {
                        ...section,
                        heading: patch.heading ?? section.heading,
                        paragraphs: patch.paragraphsText !== undefined
                            ? patch.paragraphsText.split('\n\n').map((paragraph) => paragraph.trim()).filter(Boolean)
                            : section.paragraphs,
                    };
                }),
            };
        }));
    };

    const addSection = (policyIndex: number) => {
        setPolicies((current) => current.map((policy, index) => (
            index === policyIndex
                ? { ...policy, sections: [...policy.sections, { heading: '', paragraphs: [''] }] }
                : policy
        )));
    };

    const removeSection = (policyIndex: number, sectionIndex: number) => {
        setPolicies((current) => current.map((policy, index) => (
            index === policyIndex
                ? { ...policy, sections: policy.sections.filter((_, innerIndex) => innerIndex !== sectionIndex) }
                : policy
        )));
    };

    const savePolicies = async () => {
        setSaving(true);
        try {
            const base = getApiBase();
            const response = await fetch(`${base}/api/site-content/legal`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ legalPolicies: policies }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error('Failed to save');
            setPolicies(result.data);
            setModal({ show: true, success: true, message: 'Policies saved successfully!' });
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
                    <h1 className="dashboard-title">POLICIES</h1>
                    <p className="dashboard-kicker">Edit the text shown on the legal page.</p>
                </div>
                <button type="button" className="add-btn" onClick={savePolicies} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Policies'}
                </button>
            </header>

            <section className="content-editor">
                {policies.map((policy, policyIndex) => (
                    <article className="content-card" key={policy._id || policy.key}>
                        <div className="content-card__header">
                            <h2 className="content-card__title">{policy.title || `Policy ${policyIndex + 1}`}</h2>
                        </div>

                        <div className="content-grid">
                            <div className="content-field">
                                <label>Accordion Title</label>
                                <input
                                    value={policy.title}
                                    onChange={(event) => updatePolicy(policyIndex, { title: event.target.value })}
                                />
                            </div>
                            <div className="content-field">
                                <label>Key</label>
                                <input
                                    value={policy.key}
                                    onChange={(event) => updatePolicy(policyIndex, { key: event.target.value })}
                                />
                            </div>
                            <div className="content-field full-width">
                                <label>Intro Text</label>
                                <textarea
                                    value={policy.intro}
                                    onChange={(event) => updatePolicy(policyIndex, { intro: event.target.value })}
                                />
                            </div>
                        </div>

                        <div className="content-section-list" style={{ marginTop: 18 }}>
                            {policy.sections.map((section, sectionIndex) => (
                                <div className="content-section-card" key={section._id || sectionIndex}>
                                    <div className="content-card__header">
                                        <h3 className="section-title" style={{ margin: 0 }}>Section {sectionIndex + 1}</h3>
                                        <button type="button" className="edit-link" onClick={() => removeSection(policyIndex, sectionIndex)}>
                                            Remove
                                        </button>
                                    </div>
                                    <div className="content-grid">
                                        <div className="content-field full-width">
                                            <label>Heading</label>
                                            <input
                                                value={section.heading}
                                                onChange={(event) => updateSection(policyIndex, sectionIndex, { heading: event.target.value })}
                                            />
                                        </div>
                                        <div className="content-field full-width">
                                            <label>Paragraphs</label>
                                            <textarea
                                                value={section.paragraphs.join('\n\n')}
                                                onChange={(event) => updateSection(policyIndex, sectionIndex, { paragraphsText: event.target.value })}
                                            />
                                            <p className="content-muted">Use a blank line between paragraphs. Single line breaks stay inside the same paragraph.</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="add-btn" style={{ marginTop: 16 }} onClick={() => addSection(policyIndex)}>
                            + Add Section
                        </button>
                    </article>
                ))}
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
