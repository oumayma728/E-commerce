import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),

  email: z
    .email("Veuillez saisir une adresse email valide"),

  phone: z
    .string()
    .regex(
      /^\d{10}$/,
      "Le numéro doit contenir exactement 10 chiffres"
    ),

  address: z
    .string()
    .min(3, "L'adresse est obligatoire"),

  city: z
    .string()
    .min(2, "La ville est obligatoire"),

  postalCode: z
    .string()
    .min(2, "Le code postal est obligatoire"),
});