import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import axios from "axios"; // Import Axios
import { useUser } from "../context/userContext";

const TickerTable = ({ inputValue }) => {
  const [tickerData, setTickerData] = useState(null);
  const { user } = useUser();

  const fetchData = async () => {
    try {
      if (!user || !user.ticker) {
        return;
      }
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${user.ticker}&apikey=2Q8AT87UOUTGOPGY`
      );
      const data = response.data;
      setTickerData(data);
    } catch (error) {
      console.error("Error fetching ticker data:", error);
    }
  };

  useEffect(() => {
    if (inputValue) {
      fetchData();
    }
  }, [inputValue, user]);

  return (
    <div>
      <Button onClick={fetchData}>Generate Table</Button>
      {tickerData ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tickerData["Weekly Time Series"]).map(
              ([date, values]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>{values["1. open"]}</td>
                  <td>{values["2. high"]}</td>
                  <td>{values["3. low"]}</td>
                  <td>{values["4. close"]}</td>
                  <td>{values["5. volume"]}</td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      ) : (
        <p>Data will appear here after clicking the button</p>
      )}
    </div>
  );
};

export default TickerTable;
