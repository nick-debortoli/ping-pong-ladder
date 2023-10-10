import { BASE_ELO, SIGN_IN } from "../../AppConstants";
import { signUp } from "../firebase";
import { useEffect, useState } from "react";
import "./SignUp.scss";
import { useNavigate } from "react-router-dom";
import { addPlayer } from "../../database/firestore";
import { Error } from "../../Types/errorTypes";
import TextInput from "../../Components/TextInput/TextInput";

interface SignUpProps {
  handleChange: (type: string) => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
}

const SignUp: React.FC<SignUpProps> = ({ handleChange }) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
  });

  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (formData: FormData): Promise<void> => {
    const { email, firstName, lastName } = formData;
    if (!isEmailValid) {
      alert("Invalid email format - must use a Govini email address");
    } else if (firstName.trim() === "" || lastName.trim() === "") {
      alert("Please enter your full name");
    } else {
      try {
        const defaultPassowrd = import.meta.env.VITE_DEFAULT_PASSWORD;
        await signUp(email, defaultPassowrd);
        await addPlayer({email, firstName, lastName, elo: BASE_ELO, wins: 0, losses: 0});
        navigate("/home");
      } catch (error) {
        const newError = error as Error;
        console.error("Signup failed:", error);
        if (newError.code === "auth/email-already-in-use") {
          alert(
            "Email address is already in use. Please use a different email address."
          );
        } else {
          // Handle other errors
          console.error("Signup failed:", error);
          alert("Signup failed. Please try again later.");
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@govini\.com$/;

    setIsEmailValid(emailRegex.test(formData.email));
  }, [formData.email]);

  return (
    <>
      <TextInput
        type="text"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Govini E-mail Address"
      />
      <TextInput
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        placeholder="First Name"
      />
      <TextInput
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        placeholder="Last Name"
      />
      <button className="signup-btn" onClick={() => handleSignUp(formData)}>
        Register
      </button>
      <div className="signup-link">
        Already have an account?{" "}
        <span onClick={() => handleChange(SIGN_IN)}>Sign In</span>.
      </div>
    </>
  );
};

export default SignUp;
