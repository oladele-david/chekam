import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const SuccessNotification = ({ message, onClose }) => {
    return (
        <div className="fixed top-0 left-0 w-full flex justify-center mt-4 z-50">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600" />
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-sm text-green-700 hover:underline">Close</button>
            </div>
        </div>
    );
};
export default SuccessNotification