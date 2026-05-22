"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "../styles/StoryMemoriesshop.css";
import stripeImage from "../images/Stripe.jpg";
import {
    defaultStoryMemoryShopImages,
    fetchSiteContent,
    StoryMemoryShopImage,
} from "../lib/siteContent";

const StoryMemories: React.FC = () => {
    const [memories, setMemories] = useState<StoryMemoryShopImage[]>(defaultStoryMemoryShopImages);

    useEffect(() => {
        fetchSiteContent()
            .then((content) => {
                const savedImages = content.storyMemoryShopImages.map((item, index) => ({
                    label: item.label || `Image ${index + 1}`,
                    image: item.image || defaultStoryMemoryShopImages[index]?.image,
                }));
                setMemories(savedImages.length ? savedImages : defaultStoryMemoryShopImages);
            })
            .catch(() => setMemories(defaultStoryMemoryShopImages));
    }, []);

    return (
        <section className="story-memories">
            <Image
                src={stripeImage}
                alt=""
                className="story-details__stripe_shop"
                aria-hidden="true"
            />
            <div className="story-memories__inner">
                <p className="story-memories__script">A Place for Your Memories</p>

                <h2 className="story-memories__title">
                    AT HEIRLOOM BY SK, WE DON&apos;T JUST CREATE JEWELRY BOXES.
                    <br />
                    WE CREATE SPACES FOR YOUR STORIES TO LIVE.
                </h2>

                <p className="story-memories__note">
                    THIS IS MORE THAN STORAGE.
                    <br />
                    THIS IS WHERE YOUR MEMORIES BELONG.
                </p>

                <div className="story-memories__gallery" aria-label="Memory image collection">
                    {memories.slice(0, 6).map((memory, index) => (
                        <div className="story-memories__image-wrap" key={memory.label || index}>
                            <img
                                src={memory.image?.url || defaultStoryMemoryShopImages[index]?.image?.url}
                                alt={memory.label || `Memory image ${index + 1}`}
                                className="story-memories__image"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StoryMemories;
