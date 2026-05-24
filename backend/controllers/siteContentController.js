const SiteContent = require('../models/SiteContent');

const defaultFaqs = [
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

const defaultLegalPolicies = [
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
      {
        heading: 'SHIPPING FEES',
        paragraphs: ['SHIPPING COSTS ARE CALCULATED AT CHECKOUT BASED ON YOUR LOCATION.'],
      },
      {
        heading: 'ORDER TRACKING',
        paragraphs: ['ONCE YOUR ORDER HAS BEEN SHIPPED, YOU WILL RECEIVE A TRACKING NUMBER VIA EMAIL TO MONITOR YOUR DELIVERY.'],
      },
      {
        heading: 'CUSTOMS & DUTIES',
        paragraphs: ['FOR INTERNATIONAL ORDERS, CUSTOMS DUTIES AND TAXES (IF APPLICABLE) ARE THE RESPONSIBILITY OF THE CUSTOMER.'],
      },
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
      {
        heading: 'Exchanges',
        paragraphs: ['Exchanges are accepted for damaged or defective items only. If your item arrives damaged, please contact us within 48 hours of delivery with clear photos of the product and packaging.'],
      },
      {
        heading: 'Non-Returnable Items',
        paragraphs: [
          'The following items are non-refundable and non-exchangeable:',
          '- Customized or personalized products\n- Sale or promotional items\n- Gift cards',
        ],
      },
      {
        heading: 'Refunds',
        paragraphs: ['Once your returned item is received and inspected, we will notify you regarding the approval of your refund. Approved refunds will be processed to the original payment method within 7-14 business days.'],
      },
      {
        heading: 'Shipping Costs',
        paragraphs: ['Shipping fees are non-refundable unless the return is due to an error on our side.'],
      },
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
      {
        heading: 'Payment Security',
        paragraphs: ['All payments are processed through secure third-party payment gateways. We do not store your credit card information.'],
      },
      {
        heading: 'Cookies',
        paragraphs: ['Our website may use cookies to improve browsing experience, analyze traffic, and personalize content.'],
      },
      {
        heading: 'Third-Party Services',
        paragraphs: ['We may share necessary information with trusted third-party partners such as delivery providers and payment processors strictly for order fulfillment purposes.'],
      },
      {
        heading: 'Your Rights',
        paragraphs: ['You may request access, correction, or deletion of your personal information at any time by contacting us at heirloomskev@gmail.com.'],
      },
    ],
  },
  {
    key: 'terms',
    title: 'TERMS & CONDITIONS',
    intro: 'By using this website, you agree to the following terms and conditions.',
    sections: [
      {
        heading: 'General',
        paragraphs: ['By accessing this website, you confirm that you are at least 18 years old or using the website under parental supervision.'],
      },
      {
        heading: 'Products & Availability',
        paragraphs: ['We strive to ensure all product details, descriptions, and prices are accurate. However, errors may occasionally occur. We reserve the right to correct errors and update information without prior notice.'],
      },
      {
        heading: 'Orders',
        paragraphs: ['Once an order is placed, you will receive an order confirmation email. We reserve the right to cancel or refuse orders at our discretion.'],
      },
      {
        heading: 'Pricing & Payments',
        paragraphs: ['All prices are listed in AED and include VAT where applicable. Payments must be completed before orders are processed.'],
      },
      {
        heading: 'Shipping & Delivery',
        paragraphs: ['Delivery timelines are estimates and may vary due to external factors. We are not responsible for delays caused by courier services or customs clearance.'],
      },
      {
        heading: 'Intellectual Property',
        paragraphs: ['All content on this website including logos, images, designs, and text is the property of Heirloom and may not be copied or used without written permission.'],
      },
      {
        heading: 'Limitation of Liability',
        paragraphs: ['Heirloom shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or products.'],
      },
      {
        heading: 'Governing Law',
        paragraphs: ['These Terms & Conditions shall be governed by the laws of the United Arab Emirates.'],
      },
    ],
  },
];

const defaultStoryMemoryShopImages = Array.from({ length: 6 }, (_, index) => ({
  label: `Image ${index + 1}`,
}));

const ourStoryImageSlots = [
  { key: 'hero', label: 'Our story hero image' },
  { key: 'key', label: 'Replace key image' },
  { key: 'box1', label: 'Box 1 image replace' },
  { key: 'box2', label: 'Box 2 replace' },
  { key: 'keychain', label: 'Replace key chain image' },
  { key: 'ring', label: 'Replace ring image' },
  { key: 'gloves', label: 'Gloves image replace' },
  { key: 'bell', label: 'Bell image replace' },
  { key: 'necklace', label: 'Necklace image' },
  { key: 'memory1', label: 'Story memories image 1' },
  { key: 'memory2', label: 'Story memories image 2' },
  { key: 'memory3', label: 'Story memories image 3' },
  { key: 'memory4', label: 'Story memories image 4' },
  { key: 'memory5', label: 'Story memories image 5' },
  { key: 'memory6', label: 'Story memories image 6' },
];

const defaultOurStoryImages = ourStoryImageSlots.map((slot) => ({ ...slot }));

const getDefaultContent = () => ({
  faqs: defaultFaqs,
  legalPolicies: defaultLegalPolicies,
  storyMemoryShopImages: defaultStoryMemoryShopImages,
  ourStoryImages: defaultOurStoryImages,
});

const getOrCreateContent = async () => {
  let content = await SiteContent.findOne({ singletonKey: 'site-content' });
  if (!content) {
    content = await SiteContent.create(getDefaultContent());
  }
  return content;
};

const sanitizeFaqs = (faqs) => {
  if (!Array.isArray(faqs)) return defaultFaqs;
  return faqs
    .map((faq) => ({
      question: String(faq.question || '').trim(),
      answer: String(faq.answer || '').trim(),
      showOnProductPage: Boolean(faq.showOnProductPage),
      showOnShopPage: Boolean(faq.showOnShopPage),
    }))
    .filter((faq) => faq.question && faq.answer);
};

const sanitizeLegalPolicies = (policies) => {
  if (!Array.isArray(policies)) return defaultLegalPolicies;
  return policies
    .map((policy, index) => ({
      key: String(policy.key || `policy-${index + 1}`).trim(),
      title: String(policy.title || '').trim(),
      intro: String(policy.intro || '').trim(),
      sections: Array.isArray(policy.sections)
        ? policy.sections
            .map((section) => ({
              heading: String(section.heading || '').trim(),
              paragraphs: Array.isArray(section.paragraphs)
                ? section.paragraphs.map((paragraph) => String(paragraph || '').trim()).filter(Boolean)
                : [],
            }))
            .filter((section) => section.heading || section.paragraphs.length > 0)
        : [],
    }))
    .filter((policy) => policy.key && policy.title);
};

exports.getSiteContent = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFaqs = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    content.faqs = sanitizeFaqs(req.body.faqs);
    await content.save();
    res.status(200).json({ success: true, data: content.faqs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLegalPolicies = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    content.legalPolicies = sanitizeLegalPolicies(req.body.legalPolicies);
    await content.save();
    res.status(200).json({ success: true, data: content.legalPolicies });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStoryMemoryShopImages = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    const files = req.files || [];
    const existingRaw = req.body.existingImages;
    let existingImages = content.storyMemoryShopImages || defaultStoryMemoryShopImages;

    if (existingRaw) {
      try {
        existingImages = JSON.parse(existingRaw);
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid existingImages JSON format' });
      }
    }

    const nextImages = Array.from({ length: 6 }, (_, index) => {
      const file = files.find((item) => item.fieldname === `image_${index}`);
      if (file) {
        return {
          label: `Image ${index + 1}`,
          image: {
            url: file.path,
            cloudinaryId: file.filename,
          },
        };
      }

      const existing = existingImages[index];
      const existingImage = existing && existing.image && existing.image.url && existing.image.cloudinaryId
        ? existing.image
        : undefined;
      return {
        label: `Image ${index + 1}`,
        image: existingImage,
      };
    });

    content.storyMemoryShopImages = nextImages;
    await content.save();
    res.status(200).json({ success: true, data: content.storyMemoryShopImages });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOurStoryImages = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    const files = req.files || [];
    const existingRaw = req.body.existingImages;
    let existingImages = content.ourStoryImages || defaultOurStoryImages;

    if (existingRaw) {
      try {
        existingImages = JSON.parse(existingRaw);
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid existingImages JSON format' });
      }
    }

    const existingByKey = new Map(
      existingImages.map((item) => [item.key, item])
    );

    const nextImages = ourStoryImageSlots.map((slot) => {
      const file = files.find((item) => item.fieldname === slot.key);
      if (file) {
        return {
          ...slot,
          image: {
            url: file.path,
            cloudinaryId: file.filename,
          },
        };
      }

      const existing = existingByKey.get(slot.key);
      const existingImage = existing && existing.image && existing.image.url && existing.image.cloudinaryId
        ? existing.image
        : undefined;
      return {
        ...slot,
        image: existingImage,
      };
    });

    content.ourStoryImages = nextImages;
    await content.save();
    res.status(200).json({ success: true, data: content.ourStoryImages });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
