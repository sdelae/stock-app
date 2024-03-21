import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TickerTable from "../components/TableContent";

export default function MyStockPortfolio() {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="mt-3">
          <Sidebar onInputChange={handleInputChange} />
        </Col>
        <Col md={8} className="mt-3">
          <Header />
          <TickerTable inputValue={inputValue} />
        </Col>
      </Row>
    </Container>
  );
}
