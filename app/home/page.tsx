"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="bg-[#0a0f1e] text-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-6 mt-16"
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/assets/banner.jpg"
            alt="Fashion Banner"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text drop-shadow-md">
            Fashion Forward, Always On Trend
          </h2>
          <p className="text-lg text-gray-300 mt-3">✨ Special Discount - 20% Off ✨</p>
          <button className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-lg">
            Shop Now
          </button>
        </div>
      </motion.section>

      {/* Service Highlights */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto my-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
      >
        {[
          { title: "🚚 Free Shipping Worldwide", desc: "Enjoy free worldwide shipping. Shop now, we’ll handle the rest." },
          { title: "💬 24/7 Customer Service", desc: "Our customer service team is here for you 24/7, always ready to assist." },
          { title: "🔄 Money Back Guarantee", desc: "Shop with confidence! Money-back guarantee if you're not satisfied." },
        ].map((service, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="p-6 bg-[#1a1f2e] shadow-md rounded-lg transition-all duration-300 hover:bg-[#242a3a] hover:scale-105"
          >
            <h3 className="font-bold text-lg">{service.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{service.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Category Promotions */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-12"
      >
        {[
          { title: "Fjallraven - Foldsack", img: "/assets/tas.jpg", link: "/assets" },
          { title: "Mens Casual Premium Slim Fit T-Shirts", img: "/assets/baju.jpg", link: "/assets" },
          { title: "Mens Cotton Jacket", img: "/assets/baju2.jpg", link: "/assets" },
        ].map((promo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <Link href={promo.link} className="relative group">
              <Image
                src={promo.img}
                alt={promo.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                {promo.title}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* Top Products Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto my-12"
      >
        <h2 className="text-3xl font-bold text-center">🔥 Top Products 🔥</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {[
            { name: "Solid Gold Petite Micropave", price: "$168.00", img: "/assets/cincin1.jpg" },
            { name: "White Gold Plated Princess", price: "$9.99", img: "/assets/cincin2.jpg" },
            { name: "Pierced Owl Rose Gold Plated Stainless Steel Double", price: "$10.99", img: "/assets/anting.jpg" },
            { name: "Fjallraven - Foldsack No. 1 Backpack", price: "$109.95", img: "/assets/tas.jpg" },
          ].map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a1f2e] p-4 shadow-md rounded-lg text-center transition-all duration-300 hover:bg-[#242a3a] hover:scale-105"
            >
              <Image 
                src={product.img} 
                alt={product.name} 
                width={200} 
                height={200} 
                className="w-full h-40 object-cover rounded-md" 
              />
              <h3 className="text-lg font-bold mt-2">{product.name}</h3>
              <p className="text-yellow-400 font-semibold">{product.price} USD</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
