// src/pages/residents/Announcements.js - Fixed
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import {
  FaBullhorn,
  FaClock,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import { announcementService } from "../../services/api";
import { toast } from "react-toastify";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "Health",
    "Safety",
    "Community",
    "Events",
    "Government",
    "Maintenance",
    "Education",
    "Other",
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await announcementService.getAll();

      if (response && response.data) {
        setAnnouncements(response.data);
      } else {
        setError("Received invalid data format from server");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load announcements. Please check your connection."
      );
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements =
    announcements && announcements.length > 0
      ? announcements.filter((announcement) => {
          if (selectedCategory === "all") return true;
          return announcement.category === selectedCategory;
        })
      : [];

  const getTypeBadge = (type) => {
    if (!type) return <Badge bg="secondary">Unknown</Badge>;

    switch (type) {
      case "important":
        return <Badge bg="danger">Important</Badge>;
      case "warning":
        return <Badge bg="warning">Warning</Badge>;
      case "info":
        return <Badge bg="info">Information</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading announcements...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Barangay Announcements</h2>

      {error && (
        <Alert
          variant="danger"
          className="d-flex justify-content-between align-items-center"
        >
          <div>
            <FaExclamationTriangle className="me-2" />
            {error}
          </div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={fetchAnnouncements}
          >
            <FaSyncAlt className="me-2" /> Retry
          </Button>
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filteredAnnouncements.length > 0 ? (
        <Row>
          {filteredAnnouncements.map((announcement) => (
            <Col md={6} key={announcement._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaBullhorn className="me-2 text-primary" />
                      {announcement.title}
                    </h5>
                    {getTypeBadge(announcement.type)}
                  </div>
                  <small className="text-muted">
                    <FaClock className="me-1" />
                    {announcement.date
                      ? new Date(announcement.date).toLocaleDateString()
                      : "Date unavailable"}
                  </small>
                </Card.Header>
                <Card.Body>
                  <Badge bg="secondary" className="mb-3">
                    {announcement.category}
                  </Badge>
                  <p className="card-text">{announcement.content}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FaBullhorn size={50} className="text-muted mb-3" />
            <h4>No Announcements</h4>
            <p className="text-muted">
              {selectedCategory !== "all"
                ? "No announcements found in this category."
                : "There are no announcements at this time."}
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Announcements;
