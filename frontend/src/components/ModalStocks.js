// This is was a suggestion from ChatGPT for the implementation of the project

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ModalStocks({ postStock, setShowModal, show, portfolio }) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare the stock data to be sent
    const stockData = {
      ticker: ticker.toUpperCase(),
      quantity: Number(quantity),
    };

    try {
      // Call the function passed as prop to post the stock data
      const response = await postStock(stockData);
      
      if (response.success) {
        // If the stock was successfully added/updated
        console.log("Stock successfully updated.");
      } else {
        console.error("Failed to update the stock:", response.message);
      }
    } catch (error) {
      console.error("Error updating the stock:", error);
    } finally {
      setLoading(false);
      setShowModal(false); // Hide the modal after submitting
    }
  };

  return (
    <Modal show={show} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add or Update Stock</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicTicker">
            <Form.Label>Ticker Symbol</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicQuantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalStocks;