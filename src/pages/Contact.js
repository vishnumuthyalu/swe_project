
import React from 'react';
import '../styles/Contact.css'; 

const Contact = () => {
  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form className="contact-form">
        <label>Name</label>
        <input type="text" placeholder="Your name" />

        <label>Email</label>
        <input type="email" placeholder="you@example.com" />

        <label>Message</label>
        <textarea rows="5" placeholder="Your message..."></textarea>

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Contact;


