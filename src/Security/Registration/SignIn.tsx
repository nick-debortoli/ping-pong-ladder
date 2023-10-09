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
  const [password, setPassword] = useState<string>("");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    await signIn(email, password);
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
      <input
        type="password"
        className="signin-textbox"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button
        className="signin-btn"
        onClick={() => handleSignIn(email, password)}
      >
        Sign In
      </button>
      <div className="signin-link">
        <span>Forgot Password</span>
      </div>
      <div className="signin-link">
        Don't have an account?{" "}
        <span onClick={() => handleChange(SIGN_UP)}>Register</span> now.
      </div>
    </>
  );
};
export default SingIn;
