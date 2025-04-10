import React, { useState } from 'react';
import '../../styles/ServiceRequestForm.css';

const ServiceRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would connect to a backend in a real implementation
    console.log('Form submitted:', formData);
    alert('Thank you for your request! We will contact you shortly.');
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      description: '',
      preferredDate: '',
      preferredTime: '',
      urgency: 'medium'
    });
  };

  return (
    <div className="service-form-container">
      <h2>Request a Service</h2>
      <p className="form-intro">
        Please fill out the form below to request a service. Our team will contact you within 24 hours to discuss your needs.
      </p>
      
      <form className="service-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="serviceType">Service Type</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select a service type</option>
            <option value="repair">Product Repair</option>
            <option value="installation">Device Installation</option>
            <option value="maintenance">Regular Maintenance</option>
            <option value="consultation">Technical Consultation</option>
            <option value="upgrade">System Upgrade</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Service Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Please describe your service needs in detail"
            rows="5"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preferredDate">Preferred Date</label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredTime">Preferred Time</label>
            <input
              type="time"
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Urgency Level</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="urgency"
                value="low"
                checked={formData.urgency === 'low'}
                onChange={handleChange}
              />
              Low
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="urgency"
                value="medium"
                checked={formData.urgency === 'medium'}
                onChange={handleChange}
              />
              Medium
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="urgency"
                value="high"
                checked={formData.urgency === 'high'}
                onChange={handleChange}
              />
              High
            </label>
          </div>
        </div>
        
        <button type="submit" className="submit-button">Submit Request</button>
      </form>
    </div>
  );
};

export default ServiceRequestForm;
