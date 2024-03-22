import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TickerTable from "../components/TableContent"; // Ensure the file name is correct here

export default function MyStockPortfolio() {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  return (
    <Container fluid>
      {/* Header row */}
      <Row>
        <Col xs={12}> {/* Header takes full width */}
          <Header />
        </Col>
      </Row>
      {/* Content row */}
      <Row>
        <Col md={2} className="mt-3"> {/* Sidebar column */}
          <Sidebar onInputChange={handleInputChange} />
        </Col>
        <Col md={10} className="mt-3"> {/* TickerTable column, adjusted to md={10} to fill the rest */}
          <TickerTable inputValue={inputValue} />
        </Col>
      </Row>
    </Container>
  );
}
