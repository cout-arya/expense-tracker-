import { FaTimes } from 'react-icons/fa';

function DeleteConfirmModal({ onClose, onConfirm, item, type = 'item' }) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 animate-fadeIn backdrop-blur-md pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <h3 className="text-2xl font-bold text-gray-800">Confirm Delete</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete this {type}?
                    </p>

                    {item && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.icon || '💰'}</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.title || item.category}</p>
                                        {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                    ₹{item.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-red-600">
                        ⚠️ This action cannot be undone.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
