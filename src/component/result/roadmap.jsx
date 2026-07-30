import axios from "axios";
import { useEffect, useState } from "react";
import { SvgSpinners6DotsRotate } from "../../uikits/Icons";

export default function Roadmap({ sectorId }) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState();

  useEffect(() => {
    axios.get('http://localhost:5200/api/roadmap/get-roadmap/' + sectorId)
      .then((res) => {
        setRoadmap(res.data.roadmap); // ✅ CORRECTION ICI
      })
      .catch((err) => {
        alert('Erreur survenue');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [sectorId]);


  if (loading) {
    return (
      <div className="loader">
        <SvgSpinners6DotsRotate />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!roadmap) {
    return <p>Aucune roadmap trouvée.</p>;
  }

  return (
    <div className="sectorroadmap flex f-col">
      <article className="roadmap">
        <p>
          <div dangerouslySetInnerHTML={{ __html: roadmap.htmlContent }} />
        </p>
      </article>
    </div>
  );
}
