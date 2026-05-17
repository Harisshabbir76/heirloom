import React from "react";
import Image from "next/image";
import "../styles/StoryMemories.css";

import memoryOne from "../images/memories1.png";
import memoryTwo from "../images/memories2.png";
import memoryThree from "../images/memories3.png";
import memoryFour from "../images/memories4.png";
import memoryFive from "../images/memories5.png";
import memorySix from "../images/memories6.png";
import stripeImage from "../images/Stripe.jpg";

const memories = [
    { src: memoryOne, alt: "Jewelry and keepsakes on fabric" },
    { src: memoryTwo, alt: "Hand holding a glass on green velvet" },
    { src: memoryThree, alt: "Hand placing a red jewelry box" },
    { src: memoryFour, alt: "Woman standing in a doorway" },
    { src: memoryFive, alt: "Jewelry reflected behind lace" },
    { src: memorySix, alt: "Gloved hand with a perfume bottle" },
];

const StoryMemories: React.FC = () => {
    return (
        <section className="story-memories">
            <Image
                src={stripeImage}
                alt=""
                className="story-details__stripe"
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
                    {memories.map((memory) => (
                        <div className="story-memories__image-wrap" key={memory.alt}>
                            <Image
                                src={memory.src}
                                alt={memory.alt}
                                className="story-memories__image"
                                sizes="(max-width: 768px) 46vw, 156px"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StoryMemories;
