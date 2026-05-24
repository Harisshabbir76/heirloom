'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '../../../../../styles/Dashboard.css';
import '../../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../../../components/DashboardSidebar';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import {
    OurStoryImage,
    defaultOurStoryImages,
    fetchSiteContent,
    getApiBase,
    ourStoryImageSlots,
} from '../../../../../lib/siteContent';

type UploadSlot = OurStoryImage & {
    file?: File;
    previewUrl?: string;
};

const sections = [
    {
        title: 'Our Story Hero',
        description: 'Upload the main hero background image for the Our Story page.',
        keys: ['hero'],
    },
    {
        title: 'Our Story Images',
        description: 'These replace the key, big box, small box, key chain, and ring images in the Our Story section.',
        keys: ['key', 'box1', 'box2', 'keychain', 'ring'],
    },
    {
        title: 'Story Details Images',
        description: 'These replace the gloves, bell, and necklace images in the Story Details section.',
        keys: ['gloves', 'bell', 'necklace'],
    },
    {
        title: 'Story Memories Images',
        description: 'Images appear from left to right as 1, 2, 3, 4, 5, and 6.',
        keys: ['memory1', 'memory2', 'memory3', 'memory4', 'memory5', 'memory6'],
    },
];

function mergeSlots(savedImages: OurStoryImage[]): UploadSlot[] {
    const savedByKey = new Map(savedImages.map((image) => [image.key, image]));
    return ourStoryImageSlots.map((slot) => ({
        ...slot,
        image: savedByKey.get(slot.key)?.image,
    }));
}

export default function OurStoryDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [images, setImages] = useState<UploadSlot[]>(defaultOurStoryImages);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState<{ show: boolean; success: boolean; message: string }>({
        show: false,
        success: false,
        message: '',
    });

    useEffect(() => {
        const load = async () => {
            const access = await hasDashboardAccess();
            if (!access.allowed) {
                router.replace('/404');
                setIsAuthorized(false);
                return;
            }

            setIsAuthorized(true);
            try {
                const content = await fetchSiteContent();
                setImages(mergeSlots(content.ourStoryImages));
            } catch {
                setImages(defaultOurStoryImages);
            }
        };

        load();
    }, [router]);

    const imagesByKey = useMemo(() => new Map(images.map((image) => [image.key, image])), [images]);

    const updateFile = (key: string, file?: File) => {
        setImages((current) => current.map((image) => {
            if (image.key !== key) return image;
            if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);

            return {
                ...image,
                file,
                previewUrl: file ? URL.createObjectURL(file) : undefined,
            };
        }));
    };

    const saveImages = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            images.forEach((image) => {
                if (image.file) {
                    formData.append(image.key, image.file);
                }
            });
            formData.append('existingImages', JSON.stringify(images.map((image) => ({
                key: image.key,
                label: image.label,
                image: image.image,
            }))));

            const response = await fetch(`${getApiBase()}/api/site-content/our-story`, {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save images');
            }

            setImages(mergeSlots(result.data));
            setModal({ show: true, success: true, message: 'Our Story images saved successfully!' });
        } catch {
            setModal({ show: true, success: false, message: 'Failed to save Our Story images.' });
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
                    <h1 className="dashboard-title">Our Story</h1>
                    <p className="dashboard-kicker">Upload replacement images for each Our Story page placement.</p>
                </div>
                <button type="button" className="add-btn" onClick={saveImages} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Our Story'}
                </button>
            </header>

            <section className="content-editor">
                {sections.map((section) => (
                    <article className="content-card" key={section.title}>
                        <div className="content-card__header">
                            <div>
                                <h2 className="content-card__title">{section.title}</h2>
                                <p className="content-muted">{section.description}</p>
                            </div>
                        </div>

                        <div className="content-upload-grid">
                            {section.keys.map((key) => {
                                const image = imagesByKey.get(key);
                                const previewUrl = image?.previewUrl || image?.image?.url;

                                return (
                                    <label className="memory-upload" key={key}>
                                        <span className="memory-upload__label">{image?.label || key}</span>
                                        <span className="memory-upload__box">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt={image?.label || key} />
                                            ) : (
                                                <span className="memory-upload__placeholder">{image?.label || key}</span>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => updateFile(key, event.target.files?.[0])}
                                            />
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </article>
                ))}

                <div className="content-actions">
                    <button type="button" className="add-btn" onClick={saveImages} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Our Story'}
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
