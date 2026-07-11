import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useBrands(enabled = true) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    api
      .getBrands()
      .then((result) => {
        if (active) setBrands(result?.brands || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return { brands, loading, error };
}
