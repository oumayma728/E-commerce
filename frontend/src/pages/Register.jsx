import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { register as registerService } from "../services/authService";
import { registerSchema } from "../schemas/registerSchema";

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const result = await registerService(
        data.name,
        data.email,
        data.password
      );

      console.log("Inscription réussie :", result);

      navigate("/login");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Créer un compte
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Nom */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">
            Nom
          </label>

          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full border rounded p-2"
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">
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
          <label htmlFor="password" className="block mb-1">
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

        {/* Confirmation */}
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block mb-1"
          >
            Confirmer le mot de passe
          </label>

          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="w-full border rounded p-2"
          />

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Erreur API */}
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
          {isLoading
            ? "Création du compte..."
            : "Créer mon compte"}
        </button>

        {/* Lien Login */}
        <p className="mt-4">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-blue-600"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;