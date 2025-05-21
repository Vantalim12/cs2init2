// src/pages/residents/ResidentProfile.js - Fixed version
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  residentService,
  familyHeadService,
  documentRequestService,
  eventService,
} from "../../services/api";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaUserFriends,
  FaQrcode,
  FaIdCard,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const ResidentProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [familyHead, setFamilyHead] = useState(null);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (currentUser?.residentId) {
      fetchResidentData();
    } else {
      setLoading(false);
      setError("User resident ID not found. Please contact administrator.");
    }
  }, [currentUser]);

  const fetchResidentData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching resident data for ID:", currentUser.residentId);

      // First fetch the resident's own data
      const residentRes = await residentService.getById(currentUser.residentId);

      if (!residentRes || !residentRes.data) {
        throw new Error("Failed to retrieve resident data");
      }

      setResident(residentRes.data);
      console.log("Resident data loaded:", residentRes.data);

      // After we have the resident data, fetch other related information
      try {
        const [documentsRes, eventsRes] = await Promise.all([
          documentRequestService.getByResident(currentUser.residentId),
          eventService.getAll(),
        ]);

        if (documentsRes && documentsRes.data) {
          setDocumentRequests(documentsRes.data);
        }

        // Filter events where the resident is registered
        if (eventsRes && eventsRes.data) {
          const userEvents = eventsRes.data.filter((event) =>
            event.attendees?.some(
              (attendee) => attendee.id === currentUser.residentId
            )
          );
          setRegisteredEvents(userEvents);
        }

        // If resident belongs to a family, fetch family head data
        if (residentRes.data.familyHeadId) {
          try {
            const headResponse = await familyHeadService.getById(
              residentRes.data.familyHeadId
            );
            if (headResponse && headResponse.data) {
              setFamilyHead(headResponse.data);
            }
          } catch (familyError) {
            console.error("Error fetching family head:", familyError);
            // Don't set an error state as this is not critical
          }
        }
      } catch (secondaryError) {
        console.error("Error fetching secondary data:", secondaryError);
        // We don't want to block the main profile view if these fail
        toast.warning("Some profile data couldn't be loaded");
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to load profile data";
      setError(errorMessage);
      toast.error(errorMessage);

      // If we fail to load the resident data, we should stop loading
      // but keep any data we might have already loaded
      if (!resident) {
        setResident(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCode = async () => {
    if (!currentUser?.residentId) {
      toast.error("Resident ID not available");
      return;
    }

    try {
      setLoadingQrCode(true);
      const response = await residentService.getQrCode(currentUser.residentId);
      if (response && response.data && response.data.qrCode) {
        setQrCode(response.data.qrCode);
      } else {
        toast.warning("QR code not available from server");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error(error.response?.data?.error || "Failed to load QR code");
    } finally {
      setLoadingQrCode(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";

    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleEditProfile = () => {
    navigate(`/dashboard/residents/edit/${currentUser.residentId}`);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (error && !resident) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => fetchResidentData()} variant="primary">
            <FaSyncAlt className="me-2" />
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Profile</h2>

      {error && (
        <Alert variant="warning" dismissible onClose={() => setError("")}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="info" title="Personal Information">
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaIdCard className="me-2" /> Personal Information
              </h5>
              <Button variant="primary" size="sm" onClick={handleEditProfile}>
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            </Card.Header>
            <Card.Body>
              {resident ? (
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Resident ID:</strong> {resident.residentId}
                    </p>
                    <p>
                      <strong>Name:</strong> {resident.firstName}{" "}
                      {resident.lastName}
                    </p>
                    <p>
                      <strong>Gender:</strong> {resident.gender}
                    </p>
                    <p>
                      <strong>Age:</strong> {calculateAge(resident.birthDate)}{" "}
                      years old
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Birth Date:</strong>{" "}
                      {resident.birthDate
                        ? new Date(resident.birthDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {resident.address}
                    </p>
                    <p>
                      <strong>Contact Number:</strong>{" "}
                      {resident.contactNumber || "Not specified"}
                    </p>
                    <p>
                      <strong>Registration Date:</strong>{" "}
                      {resident.registrationDate
                        ? new Date(
                            resident.registrationDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </Col>
                </Row>
              ) : (
                <p className="text-center text-muted">
                  Resident data not available
                </p>
              )}
            </Card.Body>
          </Card>

          {familyHead && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUserFriends className="me-2" /> Family Information
                </h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Family Head:</strong> {familyHead.firstName}{" "}
                  {familyHead.lastName} ({familyHead.headId})
                </p>
                <p>
                  <strong>Family Address:</strong> {familyHead.address}
                </p>
                <p>
                  <strong>Family Head Contact:</strong>{" "}
                  {familyHead.contactNumber}
                </p>
              </Card.Body>
            </Card>
          )}
        </Tab>

        <Tab
          eventKey="qrcode"
          title={
            <span>
              <FaQrcode className="me-2" /> QR Code
            </span>
          }
          onEnter={fetchQrCode}
        >
          <Row>
            <Col md={8} lg={6} className="mx-auto">
              {loadingQrCode ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading QR Code...</p>
                </div>
              ) : qrCode ? (
                <QrCodeDisplay
                  qrCodeData={qrCode}
                  title={
                    resident
                      ? `${resident.firstName} ${resident.lastName} - Resident ID`
                      : "Resident ID"
                  }
                  description={`This QR code contains your resident verification information.`}
                  size={300}
                />
              ) : (
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaQrcode size={50} className="text-muted mb-3" />
                    <h5>QR Code Not Available</h5>
                    <p className="text-muted">
                      Your QR code is not currently available.
                    </p>
                    <Button variant="primary" onClick={fetchQrCode}>
                      Generate QR Code
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="documents" title="My Document Requests">
          <Card className="shadow-sm">
            <Card.Body>
              {documentRequests.length > 0 ? (
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
                            <Badge
                              bg={
                                request.status === "completed"
                                  ? "success"
                                  : request.status === "approved"
                                  ? "info"
                                  : request.status === "rejected"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
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
                  No document requests found
                </p>
              )}
            </Card.Body>
            <Card.Footer className="bg-white">
              <Button as={Link} to="/dashboard/certificates" variant="primary">
                Request New Certificate
              </Button>
            </Card.Footer>
          </Card>
        </Tab>

        <Tab eventKey="events" title="My Events">
          <Card className="shadow-sm">
            <Card.Body>
              {registeredEvents.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredEvents.map((event) => (
                        <tr key={event._id}>
                          <td>{event.title}</td>
                          <td>{event.category}</td>
                          <td>
                            {new Date(event.eventDate).toLocaleDateString()}
                          </td>
                          <td>{event.time}</td>
                          <td>{event.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  You haven't registered for any events yet
                </p>
              )}
            </Card.Body>
            <Card.Footer className="bg-white">
              <Button as={Link} to="/dashboard/events" variant="primary">
                Browse Events
              </Button>
            </Card.Footer>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ResidentProfile;
