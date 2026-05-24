"use client";

import React from "react";
import Image from "next/image";
import "../styles/StoryMemoriesshop.css";
import stripeImage from "../images/Stripe.jpg";

const StoryMemories: React.FC = () => {

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


            </div>
        </section>
    );
};

export default StoryMemories;
