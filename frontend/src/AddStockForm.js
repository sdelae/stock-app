import React, { useState } from 'react';
import axios from 'axios';

// The AddStockForm component is responsible for rendering a form that allows users to add new stocks
function AddStockForm({ onAddStock }) {
  // State hooks for each of the form inputs
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  // handleSubmit is an asynchronous function that will be called when the form is submitted
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission action
    try {
      // Create an object with the form's data
      const newStock = { ticker, quantity: parseFloat(quantity), purchase_price: parseFloat(purchasePrice) };
      // Makes an HTTP POST request to the specified endpoint with the new stock data
      const response = await axios.post('/api/add_stock', newStock);
      onAddStock(newStock); // Calls the onAddStock function passed via props with the new stock object
      console.log(response.data.message); // Logs the response message from the server
    } catch (error) {
      console.error('Error adding stock:', error); // Logs any error that occurs during the form submission
    }
  };

  // Render method returns the form UI
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} required />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      <input type="number" placeholder="Purchase Price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
      <button type="submit">Add Stock</button>
    </form>
  );
}

// Exports the component so it can be used elsewhere in the application
export default AddStockForm;
