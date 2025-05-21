// src/pages/residents/EditResident.js - Fixed version
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft, FaSave, FaExclamationTriangle } from "react-icons/fa";
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const EditResident = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [familyHeads, setFamilyHeads] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    contactNumber: "",
    familyHeadId: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(`Fetching resident data for ID: ${id}`);

      // Add authorization check here
      if (currentUser.role !== "admin" && currentUser.residentId !== id) {
        throw new Error(
          "You are not authorized to edit this resident's information"
        );
      }

      // Use Promise.all to fetch both resident and family heads data in parallel
      const [residentResponse, familyHeadsResponse] = await Promise.all([
        residentService.getById(id),
        familyHeadService.getAll(),
      ]);

      if (!residentResponse.data) {
        throw new Error("Resident data not found");
      }

      const resident = residentResponse.data;

      console.log("Successfully retrieved resident data:", resident);

      // Format the date in a way that works with the date input
      const formattedDate = resident.birthDate
        ? new Date(resident.birthDate).toISOString().split("T")[0]
        : "";

      setFormData({
        firstName: resident.firstName || "",
        lastName: resident.lastName || "",
        gender: resident.gender || "",
        birthDate: formattedDate,
        address: resident.address || "",
        contactNumber: resident.contactNumber || "",
        familyHeadId: resident.familyHeadId || "",
      });

      if (familyHeadsResponse.data) {
        setFamilyHeads(familyHeadsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to load resident data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFamilyHeadChange = (e) => {
    const selectedFamilyHeadId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      familyHeadId: selectedFamilyHeadId,
    }));

    // If a family head is selected, auto-fill the address
    if (selectedFamilyHeadId) {
      const selectedFamilyHead = familyHeads.find(
        (fh) => fh.headId === selectedFamilyHeadId
      );
      if (selectedFamilyHead) {
        setFormData((prev) => ({
          ...prev,
          address: selectedFamilyHead.address,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.birthDate ||
        !formData.address
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        birthDate: new Date(formData.birthDate).toISOString(),
      };

      console.log("Submitting resident update:", submitData);

      await residentService.update(id, submitData);
      toast.success("Resident updated successfully");

      // Redirect to the appropriate page based on user role
      if (currentUser.role === "admin") {
        navigate(`/dashboard/residents/view/${id}`);
      } else {
        navigate(`/dashboard/residents/profile`);
      }
    } catch (err) {
      console.error("Error updating resident:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to update resident";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the appropriate page based on user role
    if (currentUser.role === "admin") {
      navigate(`/dashboard/residents/view/${id}`);
    } else {
      navigate("/dashboard/residents/profile");
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading resident data...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Resident</h2>
        <Button variant="secondary" onClick={handleCancel}>
          <FaArrowLeft className="me-2" /> Back
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Last Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Gender <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Birth Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Optional"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Family Head</Form.Label>
                  <Form.Select
                    name="familyHeadId"
                    value={formData.familyHeadId}
                    onChange={handleFamilyHeadChange}
                    disabled={saving || currentUser.role !== "admin"}
                  >
                    <option value="">No Family Head (Independent)</option>
                    {familyHeads.map((fh) => (
                      <option key={fh.headId} value={fh.headId}>
                        {fh.firstName} {fh.lastName} - {fh.headId}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {currentUser.role === "admin"
                      ? "If resident belongs to a family, select the family head"
                      : "Only administrators can change family associations"}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={saving || !!formData.familyHeadId}
                placeholder={
                  formData.familyHeadId
                    ? "Address auto-filled from family head"
                    : "Enter address"
                }
              />
              {formData.familyHeadId && (
                <Form.Text className="text-muted">
                  Address automatically filled from selected family head
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditResident;
