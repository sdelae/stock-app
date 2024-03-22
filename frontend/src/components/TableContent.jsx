import React, { useState, useEffect } from "react";
import { Button, Table, Row, Col } from "react-bootstrap"; // Import Row and Col from react-bootstrap
import axios from "axios";
import { useUser } from "../context/userContext";
import Header from "./Header"; // Import Header if it's defined in a separate file

const TickerTable = ({ inputValue }) => {
  const [tickerData, setTickerData] = useState(null);
  const { user } = useUser();

  const fetchData = async () => {
    try {
      if (!user || !user.ticker) {
        return;
      }
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${user.ticker}&apikey=ZSLQEIEAP5XSK6N0`
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

  useEffect(() => {
    if (tickerData) {
      const filteredData = filterLastTwoMonths(tickerData);
      setTickerData({ "Weekly Time Series": filteredData });
    }
  }, [tickerData]);

  return (
    <>
      <Row className="align-items-center">
      </Row>
      <Row className="mt-4"> {/* Add top margin to separate from header */}
        <Col md={{ span: 10, offset: 1 }}> {/* Adjust 'offset' to line up with your header */}
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
        </Col>
      </Row>
    </>
  );
};

export default TickerTable;