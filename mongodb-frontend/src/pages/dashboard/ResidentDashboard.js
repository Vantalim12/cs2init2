// src/pages/dashboard/ResidentDashboard.js - Fixed
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaIdCard,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
  FaQrcode,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import {
  announcementService,
  eventService,
  documentRequestService,
  residentService,
} from "../../services/api";

const ResidentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [residentInfo, setResidentInfo] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.residentId) {
        console.error("No resident ID available in current user");
        setError("User information is incomplete. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Using Promise.allSettled to prevent one failed request from stopping all requests
        const results = await Promise.allSettled([
          announcementService.getAll(),
          eventService.getAll(),
          documentRequestService.getByResident(currentUser.residentId),
          residentService.getById(currentUser.residentId),
        ]);

        // Process announcements data
        if (results[0].status === "fulfilled") {
          setAnnouncements(results[0].value.data.slice(0, 5));
        } else {
          console.error("Error fetching announcements:", results[0].reason);
        }

        // Process events data
        if (results[1].status === "fulfilled") {
          const upcomingEvents = results[1].value.data
            .filter((event) => new Date(event.eventDate) >= new Date())
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 5);
          setEvents(upcomingEvents);
        } else {
          console.error("Error fetching events:", results[1].reason);
        }

        // Process document requests data
        if (results[2].status === "fulfilled") {
          setDocumentRequests(results[2].value.data.slice(0, 5));
        } else {
          console.error("Error fetching document requests:", results[2].reason);
        }

        // Process resident information
        if (results[3].status === "fulfilled") {
          setResidentInfo(results[3].value.data);
        } else {
          console.error("Error fetching resident info:", results[3].reason);
        }

        // Check if all requests failed
        const allFailed = results.every(
          (result) => result.status === "rejected"
        );
        if (allFailed) {
          setError(
            "Failed to load dashboard data. Please check your connection and try again."
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-4">
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Welcome, {currentUser?.name || "Resident"}!</h2>

      {/* Quick Links */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                <FaIdCard />
              </div>
              <h5>My Profile</h5>
              <p className="text-muted mb-3">
                View and manage your information
              </p>
              {currentUser?.residentId ? (
                <Link
                  to={`/dashboard/residents/view/${currentUser.residentId}`}
                  className="btn btn-primary btn-sm"
                >
                  View Profile
                </Link>
              ) : (
                <Button disabled variant="primary" size="sm">
                  Profile Unavailable
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="stat-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                <FaFileAlt />
              </div>
              <h5>Certificates</h5>
              <p className="text-muted mb-3">Request official documents</p>
              <Link
                to="/dashboard/certificates"
                className="btn btn-success btn-sm"
              >
                Request Certificate
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="stat-icon bg-info bg-opacity-10 text-info mx-auto mb-3">
                <FaCalendarAlt />
              </div>
              <h5>Events</h5>
              <p className="text-muted mb-3">View and register for events</p>
              <Link
                to="/dashboard/events"
                className="btn btn-info btn-sm text-white"
              >
                View Events
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="stat-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                <FaQrcode />
              </div>
              <h5>QR Code</h5>
              <p className="text-muted mb-3">Your resident identification</p>
              {currentUser?.residentId ? (
                <Link
                  to={`/dashboard/residents/view/${currentUser.residentId}?tab=qrcode`}
                  className="btn btn-warning btn-sm"
                >
                  View QR Code
                </Link>
              ) : (
                <Button disabled variant="warning" size="sm">
                  QR Code Unavailable
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Recent Announcements */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Announcements</h5>
              <Link
                to="/dashboard/announcements"
                className="btn btn-link btn-sm"
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {announcements && announcements.length > 0 ? (
                <div className="list-group list-group-flush">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="list-group-item px-0"
                    >
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{announcement.title}</h6>
                        <small className="text-muted">
                          {new Date(announcement.date).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-1 text-muted small">
                        {announcement.content &&
                          announcement.content.substring(0, 100)}
                        ...
                      </p>
                      <span
                        className={`badge bg-${
                          announcement.type === "important"
                            ? "danger"
                            : announcement.type === "warning"
                            ? "warning"
                            : "info"
                        }`}
                      >
                        {announcement.type?.charAt(0).toUpperCase() +
                          announcement.type?.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No announcements</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Events */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Events</h5>
              <Link to="/dashboard/events" className="btn btn-link btn-sm">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {events && events.length > 0 ? (
                <div className="list-group list-group-flush">
                  {events.map((event) => (
                    <div key={event._id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{event.title}</h6>
                        <small className="text-muted">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-1 text-muted small">
                        <FaCalendarAlt className="me-2" />
                        {event.time} at {event.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  No upcoming events
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Document Requests */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Document Requests</h5>
              <Link
                to="/dashboard/certificates"
                className="btn btn-link btn-sm"
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {documentRequests && documentRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Document Type</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Request Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestId}</td>
                          <td>
                            {request.documentType
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </td>
                          <td>{request.purpose}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                request.status === "completed"
                                  ? "success"
                                  : request.status === "approved"
                                  ? "info"
                                  : request.status === "rejected"
                                  ? "danger"
                                  : "warning"
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {new Date(request.requestDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  No document requests
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResidentDashboard;
