import React from 'react';
import '../styles/Contact.css';

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-subtext">
        We'd love to hear from you! Please fill out the form and we'll get back to you as soon as possible.
      </p>
      <form className="contact-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Enter your full name" />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea rows="6" placeholder="Your message..."></textarea>
        </div>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;



