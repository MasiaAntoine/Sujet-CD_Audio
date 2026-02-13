import { useEffect, useState } from "react";
import { getCDs, deleteCD } from "../services/cdService";
import CDItem from "./CDItem";

const CDList = () => {
  const [cds, setCDs] = useState([]);

  useEffect(() => {
    fetchCDs();
  }, []);

  const fetchCDs = async () => {
    try {
      const data = await getCDs();
      setCDs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des CDs:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCD(id);
      fetchCDs(); // Rafraîchir la liste après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="container">
      <h2>Liste des CD 🎵</h2>
      <ul>
        {cds.length > 0 ? (
          cds.map((cd) => <CDItem key={cd.id} cd={cd} onDelete={handleDelete} />)
        ) : (
          <p>Aucun CD disponible</p>
        )}
      </ul>
    </div>
  );
};

export default CDList