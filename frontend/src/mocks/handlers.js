import { http, HttpResponse } from "msw";
import { categories, products } from "./data";

// Utilisateurs simulés
const users = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  },
];

export const handlers = [
  // =========================
  // Catalogue
  // =========================

  http.get("/api/categories", () => {
    return HttpResponse.json(categories);
  }),

  http.get("/api/products", () => {
    return HttpResponse.json(products);
  }),

  // =========================
  // Login
  // =========================

  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json();

    const { email, password } = body;

    const user = users.find((user) => user.email === email);

    if (!user) {
      return HttpResponse.json(
        {
          message: "Compte inexistant",
        },
        {
          status: 404,
        }
      );
    }

    if (user.password !== password) {
      return HttpResponse.json(
        {
          message: "Mot de passe incorrect",
        },
        {
          status: 401,
        }
      );
    }

    return HttpResponse.json({
      message: "Connexion réussie",
      token: `fake-jwt-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }),

  // =========================
  // Register
  // =========================

  http.post("/api/auth/register", async ({ request }) => {
    const body = await request.json();

    const { name, email, password } = body;

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return HttpResponse.json(
        {
          message: "Cet email est déjà utilisé",
        },
        {
          status: 409,
        }
      );
    }

    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password,
    };

    users.push(newUser);

    return HttpResponse.json(
      {
        message: "Inscription réussie",
        token: `fake-jwt-token-${newUser.id}`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      {
        status: 201,
      }
    );
  }),

  // =========================
  // Current user
  // =========================

  http.get("/api/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return HttpResponse.json(
        {
          message: "Token manquant",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Le token mock est construit sous la forme :
    // fake-jwt-token-{user.id}
    const userId = token.replace("fake-jwt-token-", "");

    const user = users.find((user) => user.id === userId);

    if (!user) {
      return HttpResponse.json(
        {
          message: "Token invalide",
        },
        {
          status: 401,
        }
      );
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }),

  // =========================
// Orders
// =========================

http.post("/api/orders", async ({ request }) => {
  const body = await request.json();

  const orderNumber = `ORD-${Date.now()}`;

  return HttpResponse.json(
    {
      message: "Commande créée avec succès",
      orderNumber,
      order: {
        items: body.items,
        shippingAddress: body.shippingAddress,
        total: body.total,
      },
    },
    {
      status: 201,
    }
  );
}),
];