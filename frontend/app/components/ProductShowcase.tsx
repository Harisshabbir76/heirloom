"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

        const data = await response.json();

        if (data.success) {
          setProducts(data.data.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
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
              <div className="product-image-wrapper">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <div className="view-product-overlay">
                  VIEW PRODUCT
                </div>
              </div>

              <h3 className="product-name">{product.name}</h3>

              <p className="product-price">
                {product.basePrice} AED
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