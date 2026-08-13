import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom est trop long"),

    email: z
      .email("Veuillez saisir une adresse email valide"),

    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
      .regex(
        /[^A-Za-z0-9]/,
        "Le mot de passe doit contenir un caractère spécial"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });