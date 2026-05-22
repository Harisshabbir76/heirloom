const Product = require('../models/Product');

const normalizeVariantGroups = (variantGroups) => {
  if (!Array.isArray(variantGroups)) return [];
  return variantGroups.map((group) => ({
    name: String(group.name || '').trim(),
    hasVariantPrice: group.hasVariantPrice === true || group.hasVariantPrice === 'true' || group.hasVariantPrice === '1',
    options: Array.isArray(group.options)
      ? group.options.map((option) => ({
          ...option,
          price:
            option.price !== undefined && option.price !== null && option.price !== ''
              ? Number(option.price)
              : undefined,
        }))
      : [],
  }));
};

const validateVariantGroups = (variantGroups) => {
  const pricedGroups = variantGroups.filter((group) => group.hasVariantPrice);
  if (pricedGroups.length > 1) {
    return 'Only one variant group may have pricing. Please choose a single priced group.';
  }

  const pricingGroup = pricedGroups[0];
  if (pricingGroup) {
    if (!Array.isArray(pricingGroup.options) || pricingGroup.options.length === 0) {
      return `The priced variant group "${pricingGroup.name}" must contain at least one option.`;
    }
    for (const option of pricingGroup.options) {
      if (option.price === undefined || option.price === null || Number.isNaN(option.price)) {
        return `All options in the priced variant group "${pricingGroup.name}" must have a valid numeric price.`;
      }
    }
  }

  return null;
};

// @desc    Add new product
// @route   POST /api/products
// @access  Public
exports.addProduct = async (req, res) => {
  try {
    console.log('--- Add Product Request ---');
    console.log('Body:', req.body);
    console.log('Files Count:', req.files ? req.files.length : 0);

    const { name, description, basePrice, stock, variantGroups: groupsRaw } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Please provide name and description' });
    }

    const files = req.files || [];

    let variantGroups = [];
    if (groupsRaw && groupsRaw !== 'undefined' && groupsRaw !== 'null') {
      try {
        variantGroups = normalizeVariantGroups(JSON.parse(groupsRaw));
      } catch (e) {
        console.error('Error parsing variantGroups:', e);
        return res.status(400).json({ success: false, message: 'Invalid variantGroups JSON format' });
      }
    }

    const validationError = validateVariantGroups(variantGroups);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const hasPricingGroup = variantGroups.some((group) => group.hasVariantPrice);
    if (!hasPricingGroup && (basePrice === undefined || basePrice === '' || isNaN(Number(basePrice)))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid basePrice when variant pricing is not enabled' });
    }

    // Process Product Images
    const productImages = [];
    files.forEach(file => {
      if (file.fieldname === 'images') {
        productImages.push({
          url: file.path,
          cloudinaryId: file.filename
        });
      }
    });

    // Process Variant Option Images
    variantGroups.forEach((group, gIdx) => {
      if (group.options && Array.isArray(group.options)) {
        group.options.forEach((option, oIdx) => {
          const fieldName = `variantImage_${gIdx}_${oIdx}`;
          const file = files.find(f => f.fieldname === fieldName);
          if (file) {
            option.image = {
              url: file.path,
              cloudinaryId: file.filename
            };
          }
        });
      }
    });

    const product = await Product.create({
      name,
      description,
      basePrice: hasPricingGroup ? null : Number(basePrice),
      currency: 'AED',
      stock: stock ? Number(stock) : null,
      images: productImages,
      variantGroups: variantGroups
    });

    console.log('Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('CRITICAL ERROR in addProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, basePrice, stock, variantGroups: groupsRaw, existingImages: existingImagesRaw, mainNewImageIndex } = req.body;
    const files = req.files || [];

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let variantGroups = product.variantGroups || [];
    if (groupsRaw && groupsRaw !== 'undefined' && groupsRaw !== 'null') {
      try {
        variantGroups = normalizeVariantGroups(JSON.parse(groupsRaw));
      } catch (e) {
        console.error('Error parsing variantGroups:', e);
        return res.status(400).json({ success: false, message: 'Invalid variantGroups JSON format' });
      }
    }

    const validationError = validateVariantGroups(variantGroups);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Process New Product Images
    const newProductImages = [];
    files.forEach(file => {
      if (file.fieldname === 'images') {
        newProductImages.push({
          url: file.path,
          cloudinaryId: file.filename
        });
      }
    });

    let finalProductImages = [];
    if (existingImagesRaw) {
        try {
            finalProductImages = JSON.parse(existingImagesRaw);
        } catch (e) { console.error('Error parsing existingImages:', e); }
    }
    if (mainNewImageIndex !== undefined && mainNewImageIndex !== '') {
      const mainIndex = Number(mainNewImageIndex);
      const mainNewImage = newProductImages[mainIndex];
      if (mainNewImage) {
        finalProductImages = [
          mainNewImage,
          ...finalProductImages,
          ...newProductImages.filter((_, index) => index !== mainIndex),
        ];
      } else {
        finalProductImages = [...finalProductImages, ...newProductImages];
      }
    } else {
      finalProductImages = [...finalProductImages, ...newProductImages];
    }

    // Process Variant Option Images
    variantGroups.forEach((group, gIdx) => {
      if (group.options) {
        group.options.forEach((option, oIdx) => {
          const fieldName = `variantImage_${gIdx}_${oIdx}`;
          const file = files.find(f => f.fieldname === fieldName);
          if (file) {
            option.image = {
              url: file.path,
              cloudinaryId: file.filename
            };
          }
        });
      }
    });

    product.name = name || product.name;
    product.description = description || product.description;
    if (basePrice === '') {
      // Explicitly clearing basePrice from the edit form should set it to null
      product.basePrice = null;
    } else if (basePrice !== undefined) {
      product.basePrice = Number(basePrice);
    }
    product.stock = stock !== undefined ? (stock === '' ? null : Number(stock)) : product.stock;
    product.images = finalProductImages;
    product.variantGroups = variantGroups;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
