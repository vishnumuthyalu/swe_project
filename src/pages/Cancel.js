import React from 'react';
import '../styles/Cancel.css';


const Cancel = () => {
    return(
        <div className="container">
            <div className="payment-text">Payment has been canceled</div>
            <div className="x-circle">
                <div className="x-mark">
                <span></span>
                <span></span>
                </div>
                
            </div>  
        </div>
            
    );
};

export default Cancel;