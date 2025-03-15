import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section - Brand Name & Socials */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-wide">
            Fashion<span className="text-yellow-400">.com</span>
          </h2>
          <p className="text-sm text-gray-400">
            Elevate your style with the latest trends.
          </p>
          <div className="flex space-x-4">
            {[
              { name: "Facebook", src: "/assets/facebook.svg", url: "https://facebook.com" },
              { name: "LinkedIn", src: "/assets/linkedin.svg", url: "https://linkedin.com" },
              { name: "Instagram", src: "/assets/instagram.svg", url: "https://instagram.com" },
              { name: "Twitter", src: "/assets/twitter.svg", url: "https://twitter.com" },
            ].map((social) => (
              <Link
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 transition"
              >
                <Image src={social.src} alt={social.name} width={28} height={28} />
              </Link>
            ))}
          </div>
        </div>

        {/* Middle Section - Quick Links */}
              <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          {[
            { name: "Home", path: "/home" },
            { name: "Shop", path: "/home/shop" },
            { name: "Discounts", path: "/discount" },
            { name: "Our Team", path: "/team" },
            { name: "Contact Us", path: "/home" },
          ].map((link) => (
            <li key={link.name}>
              <Link href={link.path} className="hover:text-yellow-400 transition">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>


        {/* Right Section - Contact Info */}
        <div className="text-right space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Us</h3>
          <p className="text-sm">📞 <span className="text-yellow-400">+62 123 345 7890</span></p>
          <p className="text-sm">📍 Bandung, Indonesia</p>
          <p className="text-sm">📧 <span className="text-yellow-400">contact@fashionly.com</span></p>
          <p className="text-sm">🕒 Mon - Fri: 9 AM - 6 PM</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-10 text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} Fashion.com - All Rights Reserved.
      </div>
    </footer>
  );
}
