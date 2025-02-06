import React, {ReactNode} from "react";
import './ChoisePopUp.css';

interface ChoisePopUpProps {
  children?: ReactNode;
  header: string;
  onYes: () => void;
  onNo: () => void;
}

const ChoisePopUp: React.FC<ChoisePopUpProps> = ({ header, onYes, onNo }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2 className="phrase-title">{header}</h2>
        <div className="button-container">
          <button className="button" onClick={onYes}>Yes</button>
          <button className="button" onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ChoisePopUp;
