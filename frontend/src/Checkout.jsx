import {
  MapPin,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { checkoutSchema } from "./schemas/checkoutSchema";
import useCartStore from "./store/cartStore";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "./services/orderService";

function Checkout() {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 0 ? 5 : 0;
  const total = subtotal + shipping;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const result = await createOrder({
        items: cart,
        shippingAddress: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
        total,
      });

      clearCart();

      navigate("/order-confirmation", {
        state: {
          orderNumber: result.orderNumber,
        },
      });
    } catch (error) {
      setServerError(
        error.message || "Impossible de créer la commande"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold">
            Checkout
          </h1>

          <div className="text-sm text-gray-500">
            Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* Shipping */}
            <div className="bg-white border rounded-2xl shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-indigo-600" />

                <h2 className="text-2xl font-bold">
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="font-medium block mb-2"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    {...register("fullName")}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="font-medium block mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="yourname@gmail.com"
                    {...register("email")}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="font-medium block mb-2"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0612345678"
                    {...register("phone")}
                    className="w-full border rounded-xl p-3"
                  />

                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="font-medium block mb-2"
                  >
                    Country
                  </label>

                  <select
                    id="country"
                    className="w-full border rounded-xl p-3"
                    defaultValue="Morocco"
                  >
                    <option value="Morocco">
                      Morocco
                    </option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="mt-5">
                <label
                  htmlFor="address"
                  className="font-medium block mb-2"
                >
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  placeholder="Street..."
                  {...register("address")}
                  className="w-full border rounded-xl p-3"
                />

                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Apartment */}
              <div className="mt-5">
                <label
                  htmlFor="apartment"
                  className="font-medium block mb-2"
                >
                  Apartment (optional)
                </label>

                <input
                  id="apartment"
                  type="text"
                  className="w-full border rounded-xl p-3"
                />
              </div>

              {/* City + Postal Code */}
              <div className="grid grid-cols-2 gap-5 mt-5">

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="font-medium block mb-2"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    className="w-full border rounded-xl p-3"
                  />

                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="font-medium block mb-2"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    {...register("postalCode")}
                    className="w-full border rounded-xl p-3"
                  />

                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border rounded-2xl shadow-sm p-7">

              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-indigo-600" />

                <h2 className="text-2xl font-bold">
                  Payment
                </h2>
              </div>

              <div className="space-y-5">

                {/* Card Number */}
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="font-medium block mb-2"
                  >
                    Card Number
                  </label>

                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">

                  {/* Expiration */}
                  <div>
                    <label
                      htmlFor="expiration"
                      className="font-medium block mb-2"
                    >
                      Expiration
                    </label>

                    <input
                      id="expiration"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  {/* CVC */}
                  <div>
                    <label
                      htmlFor="cvc"
                      className="font-medium block mb-2"
                    >
                      CVC
                    </label>

                    <input
                      id="cvc"
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="123"
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Payment is simulated. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="bg-white border rounded-2xl shadow-sm p-6 h-fit sticky top-6">

            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            {cart.map((item) => (
              <div
                className="flex gap-4 mb-5"
                key={item.id}
              >
                <img
                  src={
                    Array.isArray(item.image)
                      ? item.image[0]
                      : item.image
                  }
                  alt={item.name}
                  className="rounded-xl w-20 h-20 object-contain"
                />

                <div>
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="ml-auto font-bold">
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
            ))}

            <hr className="my-5" />

            <div className="space-y-3">

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span>
                  {subtotal.toFixed(2)} €
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Shipping
                </span>

                <span>
                  {shipping.toFixed(2)} €
                </span>
              </div>
            </div>

            <hr className="my-5" />

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-2xl font-bold">
                Total
              </h2>

              <h2 className="text-3xl font-bold text-indigo-600">
                {total.toFixed(2)} €
              </h2>
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-red-500 text-sm mb-4">
                {serverError}
              </p>
            )}

            {/* Pay button */}
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-xl py-4 font-semibold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              <Lock size={18} />

              {isLoading
                ? "Processing..."
                : "Pay Now"}
            </button>

            <div className="mt-8 space-y-4">

              <div className="flex gap-3 items-center">
                <ShieldCheck size={18} />

                <p className="text-sm text-gray-500">
                  Secure payment
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <Truck size={18} />

                <p className="text-sm text-gray-500">
                  Fast delivery
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <Headphones size={18} />

                <p className="text-sm text-gray-500">
                  24/7 Support
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </form>
  );
}

export default Checkout;