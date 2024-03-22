import React, { useState, useEffect } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import './sidebar.css'; 

const Header = () => {
  const [totalValue, setTotalValue] = useState(null);
  const { user, setUserData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTotalValue = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/loginhttps://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${user.ticker}&apikey=ZSLQEIEAP5XSK6N0`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch portfolio value");
        }

        const data = await response.json();
        setTotalValue(parseFloat(data.total_portfolio_value).toFixed(2));
      } catch (error) {
        console.error("Error fetching total portfolio value:", error);
        setTotalValue("0");
      }
    };

    fetchTotalValue();
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      setUserData(null);
      navigate("/sign-in");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="header-navbar">
      <Container>
        <Navbar.Brand href="/">
          Total Value: $ {user ? user.totalvalue : 0}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            {user ? (
              <>
                Welcome {user.username}{" "}
                <Button variant="link" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/sign-in">
                <Button>Login</Button>
              </Link>
            )}
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
