import React from "react";
import Image from "next/image";
import "../styles/StoryDetails.css";

import glovesImage from "../images/gloves.jpg";
import bellImage from "../images/bell.jpg";
import necklaceImage from "../images/necklace.jpg";
import stripeImage from "../images/Stripe.jpg";

const StoryDetails: React.FC = () => {
    return (
        <section className="story-details">
            <Image
                src={stripeImage}
                alt=""
                className="story-details__stripe"
                aria-hidden="true"
            />

            <div className="story-details__inner">
                <p className="story-details__script" aria-hidden="true">
                    Crafted with Intention
                </p>

                <h2 className="story-details__title">
                    WE CREATE FOR THOSE WHO NOTICE THE DETAILS.
                </h2>

                <div className="story-details__gallery" aria-label="Jewelry detail images">
                    <div className="story-details__image-wrap story-details__image-wrap--side">
                        <Image
                            src={glovesImage}
                            alt="Jewelry arranged beside gloves"
                            className="story-details__image"
                            sizes="(max-width: 768px) 82vw, 210px"
                        />
                    </div>

                    <div className="story-details__image-wrap story-details__image-wrap--center">
                        <Image
                            src={bellImage}
                            alt="Gloved hand touching a service bell"
                            className="story-details__image"
                            sizes="(max-width: 768px) 82vw, 280px"
                        />
                    </div>

                    <div className="story-details__image-wrap story-details__image-wrap--side">
                        <Image
                            src={necklaceImage}
                            alt="Pearl necklace detail"
                            className="story-details__image"
                            sizes="(max-width: 768px) 82vw, 210px"
                        />
                    </div>
                </div>

                <div className="story-details__copy">
                    <p>FOR THOSE WHO UNDERSTAND THAT BEAUTY IS OFTEN FOUND IN THE SMALLEST THINGS.</p>
                    <p>
                        BECAUSE WHAT YOU CHOOSE TO KEEP IS NEVER JUST ABOUT THE OBJECT -
                        <br />
                        IT IS ABOUT WHAT IT REPRESENTS.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StoryDetails;
