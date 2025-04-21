import React from 'react';
import '../styles/Success.css';

const Success = () => {
    return(
        <div className="container">
            <div className="success-text">Payment has been Successful</div>
            <div className="check-circle">
                <div className="check-mark"></div>
            </div>  
        </div>
            
    );
};

export default Success;