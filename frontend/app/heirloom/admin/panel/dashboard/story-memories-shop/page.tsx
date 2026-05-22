'use client';

import React, { useEffect, useState } from 'react';
import '../../../../../styles/Dashboard.css';
import '../../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../../../components/DashboardSidebar';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import {
    defaultStoryMemoryShopImages,
    fetchSiteContent,
    getApiBase,
    StoryMemoryShopImage,
} from '../../../../../lib/siteContent';

export default function StoryMemoriesShopDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [images, setImages] = useState<StoryMemoryShopImage[]>(defaultStoryMemoryShopImages);
    const [files, setFiles] = useState<(File | null)[]>(Array.from({ length: 6 }, () => null));
    const [previews, setPreviews] = useState<string[]>(defaultStoryMemoryShopImages.map((item) => item.image?.url || ''));
    const [saving, setSaving] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
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
                const nextImages = Array.from({ length: 6 }, (_, index) => ({
                    label: `Image ${index + 1}`,
                    image: content.storyMemoryShopImages[index]?.image || defaultStoryMemoryShopImages[index]?.image,
                }));
                setImages(nextImages);
                setPreviews(nextImages.map((item) => item.image?.url || ''));
            } catch {
                setImages(defaultStoryMemoryShopImages);
                setPreviews(defaultStoryMemoryShopImages.map((item) => item.image?.url || ''));
            }
        };

        load();
    }, [router]);

    const selectFile = (index: number, file: File | undefined) => {
        if (!file) return;
        setFiles((current) => current.map((item, itemIndex) => (itemIndex === index ? file : item)));
        setPreviews((current) => current.map((item, itemIndex) => (
            itemIndex === index ? URL.createObjectURL(file) : item
        )));
    };

    const handleDrop = (index: number, event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDraggingIndex(null);
        selectFile(index, event.dataTransfer.files?.[0]);
    };

    const saveImages = async () => {
        setSaving(true);
        try {
            const base = getApiBase();
            const data = new FormData();
            data.append('existingImages', JSON.stringify(images));
            files.forEach((file, index) => {
                if (file) data.append(`image_${index}`, file);
            });

            const response = await fetch(`${base}/api/site-content/story-memory-shop`, {
                method: 'PUT',
                credentials: 'include',
                body: data,
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error('Failed to save');

            const nextImages = Array.from({ length: 6 }, (_, index) => ({
                label: `Image ${index + 1}`,
                image: result.data[index]?.image || defaultStoryMemoryShopImages[index]?.image,
            }));
            setImages(nextImages);
            setFiles(Array.from({ length: 6 }, () => null));
            setPreviews(nextImages.map((item) => item.image?.url || ''));
            setModal({ show: true, success: true, message: 'Story memories shop images saved successfully!' });
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
                    <h1 className="dashboard-title">STORY MEMORIES SHOP</h1>
                    <p className="dashboard-kicker">Upload the six images shown in the story memories shop component.</p>
                </div>
                <button type="button" className="add-btn" onClick={saveImages} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Images'}
                </button>
            </header>

            <section className="content-card">
                <div className="content-upload-grid">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div className="memory-upload" key={index}>
                            <span className="memory-upload__label">Image {index + 1}</span>
                            <label
                                className={`memory-upload__box ${draggingIndex === index ? 'is-dragging' : ''}`}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setDraggingIndex(index);
                                }}
                                onDragLeave={() => setDraggingIndex(null)}
                                onDrop={(event) => handleDrop(index, event)}
                            >
                                {previews[index] ? (
                                    <img src={previews[index]} alt={`Image ${index + 1} preview`} />
                                ) : (
                                    <span className="memory-upload__placeholder">Drop or upload image</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => selectFile(index, event.target.files?.[0])}
                                />
                            </label>
                        </div>
                    ))}
                </div>
                <div className="content-actions" style={{ marginTop: 24 }}>
                    <button type="button" className="add-btn" onClick={saveImages} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Images'}
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
