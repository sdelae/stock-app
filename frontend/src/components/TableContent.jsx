import React, { useState, useEffect } from "react";
import { Button, Table, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useUser } from "../context/userContext";

const TickerTable = ({ inputValue }) => {
  const [tickerData, setTickerData] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!inputValue || !user || !user.ticker) return;
  
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${user.ticker}&apikey=ZSLQEIEAP5XSK6N0`
        );
        let data = response.data;
        
        if (data) {
          const filteredData = filterLastTwoMonths(data);
          data = { "Weekly Time Series": filteredData };
        }
        setTickerData(data);
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      }
    };
  
    fetchAndProcessData();
  }, [inputValue, user]);

  const filterLastTwoMonths = (data) => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    return Object.entries(data["Weekly Time Series"])
      .filter(([date]) => new Date(date) >= twoMonthsAgo)
      .reduce((obj, [date, values]) => {
        obj[date] = values;
        return obj;
      }, {});
  };

  return (
    <>
      <Row className="align-items-center"></Row>
      <Row className="mt-4">
        <Col md={{ span: 10, offset: 1 }}>
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
              {tickerData ? (
                Object.entries(tickerData["Weekly Time Series"]).map(
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
                )
              ) : (
                <tr>
                  <td colSpan="6">Data will appear here after updates.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  );
};

export default TickerTable;