export async function apiFetch(url: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("API Error");

  return res.json();
}