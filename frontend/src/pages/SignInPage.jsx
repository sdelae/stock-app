import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/userContext";

const LoginPage = () => {
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const { setUserData } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input fields
        if (!username || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            // Post request to server with username and password
            const response = await fetch("https://mcsbt-capstone-sara.ew.r.appspot.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ USERNAME: username, PASSWORD: password }),
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                // Update user context and navigate
                setUserData({ username: username, id: data.USER_ID });
                navigate("/my-stock-summary");
                toast.success("Logged in successfully");
            } else {
                // Display error from server
                toast.error(data.error);
            }
        } catch (error) {
            // Log and display error
            console.error("Error:", error);
            toast.error("An error occurred. Please try again later.");
        }
    };

    return (
        <Container fluid className="bg-dark d-flex flex-column justify-content-center align-items-center min-vh-100">
            <div className="bg-dark p-6 rounded-lg text-white border border-success rounded-lg p-5">
                <h2 className="font-weight-bold mb-4 font-monospace">Stock Portfolio</h2>
                <Form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h5 className="font-weight-bold text-lg">Login</h5>
                    </div>
                    <Form.Group controlId="username"> {/* controlId changed to username */}
                        <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="password" className="mt-3">
                        <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="remember-me" className="mt-4 d-flex align-items-center text-white">
                        <Form.Check
                            type="checkbox"
                            label="Remember Me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                    </Form.Group>
                    <Button type="submit" className="w-100 mt-4 bg-primary rounded-2px text-white">Login</Button>
                    <Link to="/sign-up" className="d-block mt-3 text-center text-white">Don't have an account? Sign up</Link>
                </Form>
            </div>
            <ToastContainer />
        </Container>
    );
};

export default LoginPage;