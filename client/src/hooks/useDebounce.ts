import { useEffect, useState } from "react";

/**
 * Hook para debounce de valores
 * Útil para otimizar buscas e inputs que disparam queries
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Buscar apenas quando debouncedSearchTerm mudar
 *   if (debouncedSearchTerm) {
 *     fetchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar timer para atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timer se o valor mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
