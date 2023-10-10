import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signIn } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./SignIn.scss";
import { SIGN_UP } from "../../AppConstants";

interface SignInProps {
  handleChange: (type: string) => void;
}

const SingIn: React.FC<SignInProps> = ({ handleChange }) => {
  const [email, setEmail] = useState<string>("");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleSignIn = async (
    email: string
  ): Promise<void> => {
    const defaultPassowrd = import.meta.env.VITE_DEFAULT_PASSWORD;
    await signIn(email, defaultPassowrd);
  };

  return (
    <>
      <input
        type="text"
        className="signin-textbox"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Govini E-mail Address"
      />
      <button
        className="signin-btn"
        onClick={() => handleSignIn(email)}
      >
        Sign In
      </button>
      <div className="signin-link">
        Don't have an account?{" "}
        <span onClick={() => handleChange(SIGN_UP)}>Register</span> now.
      </div>
    </>
  );
};
export default SingIn;
