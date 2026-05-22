'use client';

import React, { useEffect, useState } from "react";
import "../styles/legal.css";
import { defaultLegalPolicies, fetchSiteContent, LegalPolicy } from "../lib/siteContent";

const renderParagraph = (text: string, key: string) => (
  <p className="paragraph" key={key}>
    {text.split('\n').map((line, index, lines) => (
      <React.Fragment key={`${key}-${index}`}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ))}
  </p>
);

const PoliciesPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>("shipping");
  const [accordionItems, setAccordionItems] = useState<LegalPolicy[]>(defaultLegalPolicies);

  useEffect(() => {
    fetchSiteContent()
      .then((content) => {
        setAccordionItems(content.legalPolicies);
        setOpenItem(content.legalPolicies[0]?.key || null);
      })
      .catch(() => setAccordionItems(defaultLegalPolicies));
  }, []);

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="policies-page">
      <div className="policies-container">
        <h1 className="main-heading">OUR POLICIES</h1>

        <div className="accordion-list">
          {accordionItems.map((item) => {
            const isOpen = openItem === item.key;

            return (
              <div
                key={item._id || item.key}
                className={`accordion-item ${isOpen ? "open" : ""}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleItem(item.key)}
                  aria-expanded={isOpen}
                  type="button"
                >
                  <span className="accordion-title">{item.title}</span>
                  <span className="accordion-icon">{isOpen ? "-" : "+"}</span>
                </button>

                <div className="accordion-content">
                  <div className="accordion-body">
                    {item.intro && (
                      <p className={item.key === 'shipping' ? 'accordion-intro' : 'paragraph'}>
                        {item.intro}
                      </p>
                    )}

                    {item.sections.map((section, sectionIndex) => (
                      <div className="policy-section" key={section._id || `${item.key}-${sectionIndex}`}>
                        {section.heading && (
                          <h3 className="sub-heading underline">{section.heading}</h3>
                        )}
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          renderParagraph(paragraph, `${item.key}-${sectionIndex}-${paragraphIndex}`)
                        ))}
                      </div>
                    ))}
                  </div>
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
