export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}
