export interface FaqItem {
    _id?: string;
    question: string;
    answer: string;
    showOnProductPage: boolean;
    showOnShopPage: boolean;
}

export interface LegalSection {
    _id?: string;
    heading: string;
    paragraphs: string[];
}

export interface LegalPolicy {
    _id?: string;
    key: string;
    title: string;
    intro: string;
    sections: LegalSection[];
}

export interface StoryMemoryShopImage {
    label: string;
    image?: {
        url: string;
        cloudinaryId?: string;
    };
}

export interface SiteContent {
    faqs: FaqItem[];
    legalPolicies: LegalPolicy[];
    storyMemoryShopImages: StoryMemoryShopImage[];
}

export const defaultFaqs: FaqItem[] = [
    {
        question: 'WHAT MATERIALS ARE USED IN YOUR JEWELRY BOXES?',
        answer: 'Our jewelry boxes are crafted from thuya wood and finished with a soft velvet interior for a luxurious feel.',
        showOnProductPage: true,
        showOnShopPage: true,
    },
    {
        question: 'ARE YOUR JEWELRY BOXES SUITABLE FOR TRAVEL?',
        answer: 'Yes, our jewelry boxes are suitable for travel, though we recommend handling them with care.',
        showOnProductPage: true,
        showOnShopPage: true,
    },
    {
        question: 'HOW MANY DESIGNS DO YOU OFFER?',
        answer: 'We currently offer two designs, each available in small and large sizes, with more designs coming soon.',
        showOnProductPage: true,
        showOnShopPage: true,
    },
    {
        question: 'DO YOU OFFER INTERNATIONAL SHIPPING?',
        answer: 'Yes, we offer international shipping.',
        showOnProductPage: true,
        showOnShopPage: true,
    },
    {
        question: 'CAN I RETURN OR EXCHANGE MY ORDER?',
        answer: 'At this time, we do not offer returns or exchanges.',
        showOnProductPage: false,
        showOnShopPage: false,
    },
    {
        question: 'IS THIS SUITABLE AS A GIFT?',
        answer: 'Yes, our jewelry boxes make the perfect gift for any occasion.',
        showOnProductPage: false,
        showOnShopPage: false,
    },
    {
        question: 'HOW DO I CARE FOR MY JEWELRY BOX?',
        answer: 'To maintain its quality, keep your jewelry box in a dry area and avoid direct sunlight.',
        showOnProductPage: false,
        showOnShopPage: false,
    },
];

export const defaultLegalPolicies: LegalPolicy[] = [
    {
        key: 'shipping',
        title: 'SHIPPING & DELIVERY',
        intro: 'AT HEIRLOOM BY SK, WE ENSURE THAT EVERY ORDER IS HANDLED WITH CARE AND DELIVERED TO YOU SAFELY.',
        sections: [
            {
                heading: 'PROCESSING TIME',
                paragraphs: [
                    'ALL ORDERS ARE PROCESSED WITHIN 1-3 BUSINESS DAYS (EXCLUDING WEEKENDS AND PUBLIC HOLIDAYS). ONCE YOUR ORDER IS CONFIRMED, YOU WILL RECEIVE A CONFIRMATION EMAIL.',
                ],
            },
            {
                heading: 'SHIPPING TIME',
                paragraphs: [
                    'DELIVERY TIMELINES MAY VARY DEPENDING ON YOUR LOCATION:',
                    'UAE: 1-3 BUSINESS DAYS\nINTERNATIONAL: 5-10 BUSINESS DAYS',
                    'PLEASE NOTE THAT DELIVERY TIMES ARE ESTIMATES AND MAY VARY DUE TO EXTERNAL FACTORS.',
                ],
            },
            { heading: 'SHIPPING FEES', paragraphs: ['SHIPPING COSTS ARE CALCULATED AT CHECKOUT BASED ON YOUR LOCATION.'] },
            { heading: 'ORDER TRACKING', paragraphs: ['ONCE YOUR ORDER HAS BEEN SHIPPED, YOU WILL RECEIVE A TRACKING NUMBER VIA EMAIL TO MONITOR YOUR DELIVERY.'] },
            { heading: 'CUSTOMS & DUTIES', paragraphs: ['FOR INTERNATIONAL ORDERS, CUSTOMS DUTIES AND TAXES (IF APPLICABLE) ARE THE RESPONSIBILITY OF THE CUSTOMER.'] },
        ],
    },
    {
        key: 'returns',
        title: 'RETURNS & EXCHANGES POLICY',
        intro: 'At Heirloom, we take pride in the quality and craftsmanship of our jewelry boxes and accessories. Please read our policy carefully before making a purchase.',
        sections: [
            {
                heading: 'Returns',
                paragraphs: [
                    'We accept returns within 7 days of receiving your order, provided that:',
                    '- The item is unused and in its original condition\n- The original packaging is intact\n- Proof of purchase is provided',
                    'To request a return, please contact us at heirloomskev@gmail.com with your order number and reason for return.',
                ],
            },
            { heading: 'Exchanges', paragraphs: ['Exchanges are accepted for damaged or defective items only. If your item arrives damaged, please contact us within 48 hours of delivery with clear photos of the product and packaging.'] },
            {
                heading: 'Non-Returnable Items',
                paragraphs: [
                    'The following items are non-refundable and non-exchangeable:',
                    '- Customized or personalized products\n- Sale or promotional items\n- Gift cards',
                ],
            },
            { heading: 'Refunds', paragraphs: ['Once your returned item is received and inspected, we will notify you regarding the approval of your refund. Approved refunds will be processed to the original payment method within 7-14 business days.'] },
            { heading: 'Shipping Costs', paragraphs: ['Shipping fees are non-refundable unless the return is due to an error on our side.'] },
        ],
    },
    {
        key: 'privacy',
        title: 'PRIVACY POLICY',
        intro: 'At Heirloom, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.',
        sections: [
            {
                heading: 'Information We Collect',
                paragraphs: [
                    'We may collect the following information when you use our website:',
                    '- Name\n- Contact information including email and phone number\n- Shipping and billing address\n- Payment details\n- Website usage data through cookies and analytics',
                ],
            },
            {
                heading: 'How We Use Your Information',
                paragraphs: [
                    'Your information may be used to:',
                    '- Process and deliver your orders\n- Communicate with you regarding purchases or inquiries\n- Improve our website and customer experience\n- Send promotional updates (only if you opt in)',
                ],
            },
            { heading: 'Payment Security', paragraphs: ['All payments are processed through secure third-party payment gateways. We do not store your credit card information.'] },
            { heading: 'Cookies', paragraphs: ['Our website may use cookies to improve browsing experience, analyze traffic, and personalize content.'] },
            { heading: 'Third-Party Services', paragraphs: ['We may share necessary information with trusted third-party partners such as delivery providers and payment processors strictly for order fulfillment purposes.'] },
            { heading: 'Your Rights', paragraphs: ['You may request access, correction, or deletion of your personal information at any time by contacting us at heirloomskev@gmail.com.'] },
        ],
    },
    {
        key: 'terms',
        title: 'TERMS & CONDITIONS',
        intro: 'By using this website, you agree to the following terms and conditions.',
        sections: [
            { heading: 'General', paragraphs: ['By accessing this website, you confirm that you are at least 18 years old or using the website under parental supervision.'] },
            { heading: 'Products & Availability', paragraphs: ['We strive to ensure all product details, descriptions, and prices are accurate. However, errors may occasionally occur. We reserve the right to correct errors and update information without prior notice.'] },
            { heading: 'Orders', paragraphs: ['Once an order is placed, you will receive an order confirmation email. We reserve the right to cancel or refuse orders at our discretion.'] },
            { heading: 'Pricing & Payments', paragraphs: ['All prices are listed in AED and include VAT where applicable. Payments must be completed before orders are processed.'] },
            { heading: 'Shipping & Delivery', paragraphs: ['Delivery timelines are estimates and may vary due to external factors. We are not responsible for delays caused by courier services or customs clearance.'] },
            { heading: 'Intellectual Property', paragraphs: ['All content on this website including logos, images, designs, and text is the property of Heirloom and may not be copied or used without written permission.'] },
            { heading: 'Limitation of Liability', paragraphs: ['Heirloom shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or products.'] },
            { heading: 'Governing Law', paragraphs: ['These Terms & Conditions shall be governed by the laws of the United Arab Emirates.'] },
        ],
    },
];

export const defaultStoryMemoryShopImages: StoryMemoryShopImage[] = Array.from({ length: 6 }, (_, index) => ({
    label: `Image ${index + 1}`,
    image: { url: `/images/memories${index + 1}.png` },
}));

export function getApiBase() {
    return (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/u, '').replace(/\/api$/u, '');
}

export async function fetchSiteContent(): Promise<SiteContent> {
    const base = getApiBase();
    if (!base) {
        return {
            faqs: defaultFaqs,
            legalPolicies: defaultLegalPolicies,
            storyMemoryShopImages: defaultStoryMemoryShopImages,
        };
    }

    const response = await fetch(`${base}/api/site-content`, { credentials: 'include' });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load site content');
    }

    const savedFaqs = Array.isArray(result.data.faqs)
        ? result.data.faqs.map((faq: Partial<FaqItem>) => ({
            _id: faq._id,
            question: faq.question || '',
            answer: faq.answer || '',
            showOnProductPage: Boolean(faq.showOnProductPage),
            showOnShopPage: faq.showOnShopPage === undefined
                ? Boolean(faq.showOnProductPage)
                : Boolean(faq.showOnShopPage),
        }))
        : [];

    return {
        faqs: savedFaqs.length ? savedFaqs : defaultFaqs,
        legalPolicies: result.data.legalPolicies?.length ? result.data.legalPolicies : defaultLegalPolicies,
        storyMemoryShopImages: result.data.storyMemoryShopImages?.length
            ? result.data.storyMemoryShopImages
            : defaultStoryMemoryShopImages,
    };
}
