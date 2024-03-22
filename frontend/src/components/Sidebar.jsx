import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { Navbar, Card, Table, Container, Badge, Button } from "react-bootstrap"; // Ensure Button is imported
import { useUser } from "../context/userContext";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const { user, triggerReload, setUserData, setTotalValue } = useUser();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [reloadSidebar, setReloadSidebar] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [quantity, setQuantity] = useState(0);
  const location = useLocation();

  // Function to handle stock removal
  const handleRemoveStock = (indexToRemove) => {
    setPortfolioItems(portfolioItems.filter((_, index) => index !== indexToRemove));
    // Optionally trigger any other updates or side effects here
    triggerReload(); // For example, to reflect the change in the parent component or context
  };

  const handleAddStock = async () => {
    try {
      let endpoint = "";
      if (inputValue && quantity) {
        endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${inputValue}&apikey=ZSLQEIEAP5XSK6N0`;
      } else {
        throw new Error("Please provide both symbol and quantity");
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        const symbol = Object.keys(data["Weekly Time Series"])[0];
        const newItem = {
          ticker: inputValue,
          symbol: symbol,
          quantity: quantity,
        };
        setPortfolioItems([...portfolioItems, newItem]);
        setUserData({
          ...user,
          ticker: inputValue,
          totalvalue: quantity * 3 - 17,
        });
        setTotalValue(quantity * 3 - 17);
        const { ticker } = location.state || {};
        console.log("Ticker value from location state:", ticker);
      } else {
        throw new Error(data["Error Message"] || "Failed to add stock");
      }

      console.log(`Stock ${inputValue} added.`);
      setReloadSidebar(!reloadSidebar);
      triggerReload();
      setInputValue("");
      setQuantity("");
    } catch (error) {
      console.error(error.message);
      alert(error.message);
      setInputValue("");
      setQuantity("");
    }
  };

  return (
    <Navbar className="home">
      <Container>
        <Card className="card">
          <Card.Body>
            <Card.Text>
              <div className="mb-3 font">
                <h3 className="font-weight-bold text-lg">
                  <Badge bg="secondary">My Stock Portfolio</Badge>
                </h3>
              </div>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Actions</th> {/* Header for the remove button */}
                  </tr>
                </thead>
                <tbody>
                  {portfolioItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ticker}</td>
                      <td>{item.quantity}</td>
                      <td>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveStock(index)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <form>
                <div className="mb-3">
                  <label
                    htmlFor="symbol"
                    className="form-label font-weight-bold"
                  >
                    <strong>New Symbol</strong>
                  </label>
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter name"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddStock}
                  >
                    Add
                  </button>
                </div>
              </form>
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </Navbar>
  );
};

export default Sidebar;