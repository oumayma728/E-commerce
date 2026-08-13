export const createOrder = async ({
  items,
  shippingAddress,
  total,
}) => {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      shippingAddress,
      total,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Impossible de créer la commande"
    );
  }

  return data;
};