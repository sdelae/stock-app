import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/userContext";

const LoginPage = () => {
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setUserData } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ EMAIL: email, PASSWORD: password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ email: email, id: data.USER_ID });
        navigate("/my-stock-summary");
        toast.success("Logged in successfully");
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <Container
      fluid
      className="bg-dark d-flex flex-column justify-content-center align-items-center min-vh-100"
    >
      <div className="bg-dark p-6 rounded-lg text-white border border-success rounded-lg p-5">
        <h2 className="font-weight-bold mb-4 font-monospace">
          Stock Portfolio
        </h2>
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h5 className="font-weight-bold text-lg">Login</h5>
          </div>
          <Form.Group controlId="email">
            <Form.Label>
              Username <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your email"
              value={email}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="password" className="mt-3">
            <Form.Label>
              Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group
            controlId="remember-me"
            className="mt-4 d-flex align-items-center text-white"
          >
            <Form.Check
              type="checkbox"
              label="Remember Me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </Form.Group>
          <Button
            type="submit"
            className="w-100 mt-4 bg-primary rounded-2px text-white"
          >
            Login
          </Button>
          {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
          <p style={{ marginTop: "15px", fontSize: "13px" }}>
            Not registered? Register{" "}
            <Link
              to="/sign-up"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              <strong>here</strong>
            </Link>
          </p>
        </Form>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default LoginPage;
