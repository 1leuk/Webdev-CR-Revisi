"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import useCartStore from "@/store/cartStore";
import { Toaster, toast } from "react-hot-toast";
import {
  FiCreditCard,
  FiUser,
  FiHome,
  FiMail,
  FiPhone,
  FiTag,
} from "react-icons/fi";

export default function CheckoutPage() {
  const { items } = useCartStore((state) => state);
  const router = useRouter();
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const promo: { [key: string]: { rate: number; minPurchase: number | null } } =
    {
      MARET10: { rate: 0.1, minPurchase: null },
      MARET20: { rate: 0.2, minPurchase: 100 },
      KELOMPOK1: { rate: 0.15, minPurchase: null },
      GRATIS: { rate: 0.05, minPurchase: null },
      CPS: { rate: 0.25, minPurchase: 150 },
    };

  const discountAmount = subtotal * discount;
  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * 0.1;
  const shipping = discountedSubtotal > 100 ? 0 : 10;
  const total = discountedSubtotal + tax + shipping;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCoupon = urlParams.get("coupon");

    if (urlCoupon && promo[urlCoupon]) {
      const couponInfo = promo[urlCoupon];

      if (
        couponInfo.minPurchase === null ||
        subtotal >= couponInfo.minPurchase
      ) {
        setDiscount(couponInfo.rate);
        setAppliedCoupon(urlCoupon);
      }
    }
  }, [subtotal]);

  const handleApplyCoupon = () => {
    setCouponError("");

    if (couponCode.trim() === "") {
      setCouponError("Please enter a coupon code");
      return;
    }

    const upperCouponCode = couponCode.toUpperCase();
    if (promo[upperCouponCode]) {
      const couponInfo = promo[upperCouponCode];

      if (
        couponInfo.minPurchase === null ||
        subtotal >= couponInfo.minPurchase
      ) {
        setDiscount(couponInfo.rate);
        setAppliedCoupon(upperCouponCode);
        setCouponCode("");
      } else {
        setCouponError(
          `This coupon requires a minimum purchase of $${couponInfo.minPurchase}`
        );
      }
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    
      toast.loading("Processing your order...");
    
      setTimeout(() => {
        toast.dismiss();
        toast.success("Order placed successfully!");
    
        setTimeout(() => {
          const invoiceId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit invoice ID
          const queryParams = new URLSearchParams({
            total: total.toFixed(2),
            items: JSON.stringify(items), // Encode cart items
            invoiceId: invoiceId.toString(), // Add the invoice ID
            email: formData.email, // Add the email from the checkout form
          }).toString();
    
          router.push(`/checkout/success?${queryParams}`);
        }, 1500);
      }, 2000);
    };
  
  

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-8 text-gray-600">
            Add some items to your cart before checking out.
          </p>
          <Button onClick={() => router.push("/home/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-[#1a1f2e]">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiUser className="mr-2" /> Your Information
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiHome className="mr-2" /> Shipping Address
                </h2>

                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="zip"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiCreditCard className="mr-2" /> Payment Information
                </h2>

                <div className="mb-4">
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="cardExpiry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cardCVC"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cardCVC"
                      name="cardCVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button type="submit" className="w-full">
                    Complete Order
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              {/* Discount Section */}
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2 flex items-center">
                  <FiTag className="mr-2" /> Discount
                </h3>

                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded-md mb-4">
                    <div>
                      <span className="font-semibold">{appliedCoupon}</span>
                      <p className="text-xs text-green-700">
                        {(discount * 100).toFixed(0)}% off
                      </p>
                    </div>
                    <Button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:text-red-700"
                      variant="link"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-grow p-2 border border-gray-300 rounded-l-md"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-r-md"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 mt-4 pt-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => router.push("/cart")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
