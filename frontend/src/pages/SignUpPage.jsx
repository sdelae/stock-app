import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      toast.error("Please fill in all fields and ensure passwords match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          USERNAME: name,
          EMAIL: email,
          PASSWORD: password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        localStorage.setItem("userToken", data.token);
        navigate("/sign-in");
      } else {
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
      <div className="bg-dark p-6 rounded-lg text-white border border-success rounded-lg p-5 ">
        <h2 className="font-weight-bold mb-4 font-monospace">
          Stock Portfolio
        </h2>
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h5 className="font-weight-bold text-lg">Signup</h5>
          </div>
          <Form.Group controlId="name">
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="email" className="mt-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
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
          <Form.Group controlId="confirm-password" className="mt-3">
            <Form.Label>
              Confirm Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            type="submit"
            className="w-100 mt-4 bg-primary rounded-2px text-white"
          >
            Signup
          </Button>
          <p style={{ marginTop: "15px", fontSize: "13px" }}>
            Already registered? Login{" "}
            <Link
              to="/"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              <strong>here</strong>
            </Link>
            .
          </p>
        </Form>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default SignupForm;
