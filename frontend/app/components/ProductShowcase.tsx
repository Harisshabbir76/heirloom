"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDefaultProductPrice } from "../lib/productPricing";
import "../styles/ProductShowcase.css";

const ProductShowcase: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`
        );

        if (!response.ok) {
          throw new Error(`Showcase fetch failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.success && Array.isArray(data.data)) {
          setProducts(data.data.slice(0, 2));
        } else {
          console.warn("Products showcase API returned unexpected structure:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products gracefully:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="showcase-section">
      {/* Intro Section */}
      <div className="showcase-intro">
        <h2 className="showcase-top-heading">
          AT HEIRLOOM BY SK, <br />
          WE BELIEVE JEWELRY IS MORE THAN <br />
          AN ACCESSORY... <br />
          IT'S A STORY, A MEMORY, <br />
          <span className="showcase-top-script">
            a moment worth preserving.
          </span>
        </h2>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <p style={{ color: "#fff", opacity: 0.5 }}>
            Loading collection...
          </p>
        ) : products.length === 0 ? (
          <p style={{ color: "#fff", opacity: 0.5 }}>
            No products found.
          </p>
        ) : (
          products.map((product) => (
            <Link
              key={product._id}
              href={`/shop/${product._id}`}
              className="product-card"
              style={{ textDecoration: "none" }}
            >
              {/* Image Container upgraded to support responsive next/image layout fills */}
              <div className="product-image-wrapper" style={{ position: "relative", overflow: "hidden" }}>
                <Image
                  src={product.images?.[0]?.url || '/placeholder-product.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  priority={true}
                  style={{
                    objectFit: "cover",
                  }}
                />

                <div className="view-product-overlay">
                  VIEW PRODUCT
                </div>
              </div>

              <h3 className="product-name">{product.name}</h3>

              <p className="product-price">
                {getDefaultProductPrice(product)} AED
              </p>
            </Link>
          ))
        )}
      </div>

      {/* Divider */}
      <div className="showcase-divider"></div>

      {/* Bottom Content */}
      <div className="showcase-bottom-content">
        <h2 className="showcase-bottom-heading">
          A UNIQUE DESIGN WITH
          <span className="mobile-break">
            <br />
          </span>
          ONE PURPOSE.
        </h2>

        <p className="showcase-bottom-script">
          To hold what matters.
        </p>

        <p className="showcase-bottom-text">
          MINIMAL IN FORM. RICH IN MEANING. <br />
          EACH DESIGN IS CAREFULLY CRAFTED TO COMPLEMENT YOUR SPACE
          WHILE <br />
          PRESERVING YOUR MOST TREASURED PIECES.
        </p>

        <Link href="/shop" className="showcase-cta">
          BUY YOURS NOW
        </Link>
      </div>
    </section>
  );
};

export default ProductShowcase;