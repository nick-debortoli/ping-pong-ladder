import { ReactElement } from "react";
import "./Modal.scss";

interface ModalProps {
  titleText?: string;
  children: ReactElement | ReactElement[];
}
const Modal: React.FC<ModalProps> = ({ titleText, children }) => {
  return (
    <>
      <div className="modal">
        {!!titleText && <h1 className="modal-title">{titleText}</h1>}
        {children}
        </div>
    </>
  );
};

Modal.defaultProps = {
    titleText: ''
}

export default Modal;
