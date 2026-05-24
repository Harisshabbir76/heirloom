import React from "react";
import Image from "next/image";
import Link from "next/link";
import "../styles/Ourstory.css";

import keyImage from "../images/key.png";
import box1Image from "../images/story-box1.png";
import box2Image from "../images/story-box2.png";
import keychainImage from "../images/keychain.png";
import ringsImage from "../images/rings.jpg";

type OurStoryProps = {
    images?: {
        key?: string;
        box1?: string;
        box2?: string;
        keychain?: string;
        ring?: string;
    };
};

const OurStory: React.FC<OurStoryProps> = ({ images }) => {
    return (
        <section className="our-story">
            <div className="our-story__heading-block" id="story-intro">
                <h1 className="our-story__title">
                    A RING MAY MARK A PROMISE.
                    <br />
                    A NECKLACE MAY HOLD A MEMORY.
                    <br />
                    A SIMPLE PIECE CAN CARRY AN ENTIRE
                    <br />
                    CHAPTER OF YOUR LIFE.
                </h1>

                <p className="our-story__subtitle">
                    And these stories deserve a place of their own.
                </p>

                <div className="our-story__key-wrapper">
                    <Image
                        src={images?.key || keyImage}
                        alt="Decorative key"
                        className="our-story__key"
                        priority
                    />
                </div>
            </div>

            <div className="our-story__content-block">
                <div className="our-story__images-wrapper">
                    <div className="our-story__image-main">
                        <Image
                            src={images?.box1 || box1Image}
                            alt="Heirloom jewelry box"
                            className="our-story__box-image"
                            sizes="(max-width: 768px) 78vw, 410px"
                            priority
                        />
                    </div>

                    <div className="our-story__image-overlay">
                        <Image
                            src={images?.box2 || box2Image}
                            alt="Heirloom box held in hands"
                            className="our-story__box-image"
                            sizes="(max-width: 768px) 34vw, 122px"
                        />
                    </div>
                </div>

                <div className="our-story__text-block">
                    <h2 className="our-story__text-title">DESIGNED FOR WHAT MATTERS</h2>
                    <div className="our-story__body-text">
                        <p>
                            HEIRLOOM BY SK WAS CREATED WITH INTENTION -
                            <br />
                            TO HONOR THE SIGNIFICANCE BEHIND THE PIECES YOU TREASURE.
                        </p>
                        <p>
                            OUR JEWELRY BOXES ARE NOT SIMPLY MADE TO STORE.
                            <br />
                            THEY ARE DESIGNED TO PRESERVE.
                        </p>
                        <p>
                            TO HOLD NOT ONLY YOUR VALUABLES,
                            <br />
                            BUT THE EMOTIONS, MILESTONES, AND MOMENTS ATTACHED TO THEM.
                        </p>
                    </div>
                    <Link href="/shop" className="our-story__cta-btn">
                        EXPLORE OUR COLLECTION
                    </Link>
                </div>
            </div>

            <div className="our-story__craft-block">
                <div className="our-story__craft-inner">
                    <Image
                        src={images?.keychain || keychainImage}
                        alt="Keychain detail on velvet"
                        className="our-story__craft-image our-story__craft-image--keychain"
                        sizes="120px"
                    />

                    <div className="our-story__craft-copy">
                        <p className="our-story__craft-script">The Art of Thoughtful Craft</p>
                        <h2 className="our-story__craft-title">
                            EVERY DETAIL IS CONSIDERED.
                            <br />
                            FROM THE SOFTNESS OF THE VELVET LINING
                            <br />
                            TO THE STRUCTURE THAT PROTECTS EACH PIECE,
                            <br />
                            WE FOCUS ON CREATING DESIGNS THAT FEEL AS REFINED AS
                            <br />
                            THEY ARE PURPOSEFUL.
                        </h2>
                        <p className="our-story__craft-note">
                            TIMELESS IN FORM.
                            <br />
                            QUIET IN PRESENCE.
                            <br />
                            MEANINGFUL IN EVERY WAY.
                        </p>
                    </div>

                    <Image
                        src={images?.ring || ringsImage}
                        alt="Rings resting in velvet"
                        className="our-story__craft-image our-story__craft-image--rings"
                        sizes="120px"
                    />
                </div>

            </div>
        </section>
    );
};

export default OurStory;
