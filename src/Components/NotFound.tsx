import "./NotFound.scss";
import BlankPage from "./BlankPage";
import Modal from "./Modal/Modal";

const NotFound: React.FC = () => {
  return (
    <BlankPage>
      <Modal>
        <h1 className="error-title">404: Not Found</h1>
        <div className="humbler-message">
          <h2 className="error-subtitle">The Humbler says:</h2>
          <p className="error-text">
            "Find your way back home before I beat you again!"
          </p>
        </div>
      </Modal>
    </BlankPage>
  );
};

export default NotFound;
