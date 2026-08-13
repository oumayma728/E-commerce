import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { loginSchema } from "../schemas/loginSchema";

import useAuth from "../hooks/useAuth";

function Login() {
  const {
    login,
    isLoading,
  } = useAuth();
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });


  const onSubmit = async (data) => {
    setServerError("");

    try {
      await login(data.email, data.password);

      const from = location.state?.from?.pathname || "/";

      navigate(from, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Connexion
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-1"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full border rounded p-2"
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-1"
          >
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full border rounded p-2"
          />

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Erreur venant du serveur */}
        {serverError && (
          <p className="text-red-500 mb-4">
            {serverError}
          </p>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>

        {/* Mot de passe oublié */}
        <div className="mt-4">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-blue-600"
          >
            Mot de passe oublié ?
          </a>
        </div>

        {/* Register */}
        <p className="mt-4">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-blue-600"
          >
            Créer un compte
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Login;