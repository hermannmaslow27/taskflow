import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoignez TaskFlow gratuitement et simplifiez la gestion de vos projets et la collaboration d'équipe.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
