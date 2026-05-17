'use client'
import React, { useState } from "react";
import "../styles/legal.css";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

const shippingContent = (
  <div className="accordion-body">
    <p className="accordion-intro">
      AT HEIRLOOM BY SK, WE ENSURE THAT EVERY ORDER IS HANDLED WITH CARE AND
      DELIVERED TO YOU SAFELY.
    </p>

    <div className="policy-section">
      <h3 className="sub-heading underline">PROCESSING TIME</h3>
      <p className="paragraph">
        ALL ORDERS ARE PROCESSED WITHIN 1–3 BUSINESS DAYS (EXCLUDING WEEKENDS
        AND PUBLIC HOLIDAYS). ONCE YOUR ORDER IS CONFIRMED, YOU WILL RECEIVE A
        CONFIRMATION EMAIL.
      </p>
    </div>

    <div className="policy-section">
      <h3 className="sub-heading underline">SHIPPING TIME</h3>
      <p className="paragraph">
        DELIVERY TIMELINES MAY VARY DEPENDING ON YOUR LOCATION:
      </p>
      <p className="paragraph">
        UAE: 1–3 BUSINESS DAYS
        <br />
        INTERNATIONAL: 5–10 BUSINESS DAYS
      </p>
      <p className="paragraph">
        PLEASE NOTE THAT DELIVERY TIMES ARE ESTIMATES AND MAY VARY DUE TO
        EXTERNAL FACTORS.
      </p>
    </div>

    <div className="policy-section">
      <h3 className="sub-heading underline">SHIPPING FEES</h3>
      <p className="paragraph">
        SHIPPING COSTS ARE CALCULATED AT CHECKOUT BASED ON YOUR LOCATION.
      </p>
    </div>

    <div className="policy-section">
      <h3 className="sub-heading underline">ORDER TRACKING</h3>
      <p className="paragraph">
        ONCE YOUR ORDER HAS BEEN SHIPPED, YOU WILL RECEIVE A TRACKING NUMBER VIA
        EMAIL TO MONITOR YOUR DELIVERY.
      </p>
    </div>

    <div className="policy-section">
      <h3 className="sub-heading underline">CUSTOMS &amp; DUTIES</h3>
      <p className="paragraph">
        FOR INTERNATIONAL ORDERS, CUSTOMS DUTIES AND TAXES (IF APPLICABLE) ARE
        THE RESPONSIBILITY OF THE CUSTOMER.
      </p>
    </div>
  </div>
);

const accordionItems: AccordionItem[] = [
  {
    id: "shipping",
    title: "SHIPPING & DELIVERY",
    content: shippingContent,
  },
  {
    id: "returns",
    title: "RETURNS & EXCHANGES POLICY",
    content: (
      <div className="accordion-body">
        <p className="paragraph">
          Please contact us within 7 days of receiving your order for any return
          or exchange inquiries. Items must be unused and in original condition.
        </p>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "PRIVACY POLICY",
    content: (
      <div className="accordion-body">
        <p className="paragraph">
          We are committed to protecting your personal information and privacy.
          Your data will never be shared with third parties without your
          consent.
        </p>
      </div>
    ),
  },
  {
    id: "terms",
    title: "TERMS & CONDITIONS",
    content: (
      <div className="accordion-body">
        <p className="paragraph">
          By using our website and placing an order, you agree to our terms and
          conditions. Please read them carefully before completing your purchase.
        </p>
      </div>
    ),
  },
];

const PoliciesPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>("shipping");

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="policies-page">
      <div className="policies-container">
        <h1 className="main-heading">OUR POLICIES</h1>

        <div className="accordion-list">
          {accordionItems.map((item) => {
            const isOpen = openItem === item.id;

            return (
              <div
                key={item.id}
                className={`accordion-item ${isOpen ? "open" : ""}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="accordion-title">{item.title}</span>
                  <span className="accordion-icon">{isOpen ? "−" : "+"}</span>
                </button>

                <div className="accordion-content">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;