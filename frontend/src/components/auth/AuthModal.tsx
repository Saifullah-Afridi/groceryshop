import { useState } from "react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { Modal } from "../admin/Modal";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { VerifyOtpForm } from "./VerifyOtpForm";

type Step = "login" | "register" | "verify";
const TITLES: Record<Step, string> = {
  login: "Sign in to continue",
  register: "Create your account",
  verify: "Verify your email",
};

// The window that asks a shopper to sign in or create an account. Opened by openAuth().
function AuthDialog() {
  const { closeAuth } = useCustomerAuth();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  const goVerify = (verifyEmail: string, message = "") => {
    setEmail(verifyEmail);
    setNotice(message);
    setStep("verify");
  };

  return (
    <Modal title={TITLES[step]} onClose={closeAuth} size={step === "register" ? "lg" : "md"}>
      {step === "login" && <LoginForm onRegister={() => setStep("register")} onNeedsVerify={goVerify} />}
      {step === "register" && <RegisterForm onLogin={() => setStep("login")} onRegistered={(e) => goVerify(e)} />}
      {step === "verify" && <VerifyOtpForm email={email} notice={notice} onBack={() => setStep("register")} />}
    </Modal>
  );
}

// Place once, inside CustomerAuthProvider. It shows nothing until a window is requested.
export function AuthModal() {
  const { isAuthOpen } = useCustomerAuth();
  return isAuthOpen ? <AuthDialog /> : null;
}
