import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description:
    "Réinitialisez votre mot de passe TaskFlow en toute sécurité via un code de validation à 6 chiffres.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
