import { Link, useLocation, Navigate } from "react-router-dom";

function OrderConfirmation() {
  const location = useLocation();

  const orderNumber = location.state?.orderNumber;

  if (!orderNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">

      <div className="bg-white border rounded-2xl shadow-sm p-10">

        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-3xl">
          ✓
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Order Confirmed
        </h1>

        <p className="text-gray-500 mb-8">
          Thank you for your purchase.
          Your order has been successfully created.
        </p>

        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <p className="text-sm text-gray-500 mb-2">
            Order Number
          </p>

          <p className="text-2xl font-bold text-indigo-600">
            {orderNumber}
          </p>
        </div>

        <Link
          to="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl"
        >
          Continue Shopping
        </Link>

      </div>

    </div>
  );
}

export default OrderConfirmation;