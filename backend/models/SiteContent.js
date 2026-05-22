const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
  },
  { _id: false }
);

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    showOnProductPage: { type: Boolean, default: false },
    showOnShopPage: { type: Boolean, default: false },
  },
  { _id: true }
);

const legalSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    paragraphs: [{ type: String }],
  },
  { _id: true }
);

const legalPolicySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    intro: { type: String, default: '' },
    sections: [legalSectionSchema],
  },
  { _id: true }
);

const storyMemoryImageSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    image: imageSchema,
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'site-content',
      unique: true,
      immutable: true,
    },
    faqs: [faqItemSchema],
    legalPolicies: [legalPolicySchema],
    storyMemoryShopImages: [storyMemoryImageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
