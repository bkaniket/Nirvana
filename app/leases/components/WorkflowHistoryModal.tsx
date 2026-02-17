"use client";

type HistoryItem = {
  id: number;
  action: string;
  performed_by: string;
  created_at: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
};

export default function WorkflowHistoryModal({
  isOpen,
  onClose,
  history,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Workflow History</h3>

        {history.length === 0 && <p>No history found.</p>}

        <ul>
          {history.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong> by {item.performed_by}
              <br />
              <small>{item.created_at}</small>
            </li>
          ))}
        </ul>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
