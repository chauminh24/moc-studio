import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-[10em] pb-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue mb-4">About MOC Studio</h1>
          <div className="h-1 w-20 bg-orange mx-auto"></div>
        </div>

        {/* About Content */}
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-blue mb-4">Our Story</h2>
            <p className="mb-4">
              Founded in 2023, MOC Studio is a contemporary furniture and home accessories brand dedicated to 
              bringing thoughtful design to everyday life. We believe in creating pieces that are beautiful, 
              functional, and built to last.
            </p>
            <p>
              Our collections are inspired by modern aesthetics and crafted with attention to detail, offering 
              timeless designs that complement any space.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue mb-4">Our Philosophy</h2>
            <p className="mb-4">
              At MOC Studio, we're committed to sustainable practices and ethical sourcing. We work with 
              skilled artisans and manufacturers who share our values of quality craftsmanship and 
              environmental responsibility.
            </p>
            <p>
              Each piece in our collection is designed to be loved for years, reducing the need for frequent 
              replacements and minimizing waste.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-blue mb-4">Contact Us</h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:hello@mocstudio.com" className="hover:text-orange">hello@mocstudio.com</a>
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+1234567890" className="hover:text-orange">+1 (234) 567-890</a>
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                123 Design Street, Creative District<br />
                New York, NY 10001
              </p>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <Link 
              to="/shop-by-room/living-room" 
              className="inline-block bg-orange text-white px-8 py-3 rounded-lg hover:bg-blue transition duration-300"
            >
              Explore Our Collections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;