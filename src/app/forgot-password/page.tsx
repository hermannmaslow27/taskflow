import { ForgotPasswordWizard } from "@/components/auth/forgot-password-wizard";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
      <ForgotPasswordWizard />
    </div>
  );
}
