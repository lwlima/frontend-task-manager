import { useMutation } from "@tanstack/react-query";

async function logout(): Promise<void> {
  const token = localStorage.getItem('token');
  return fetch(`http://localhost:8000/api/logout`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    method: 'POST',
    body: JSON.stringify({})
  })
    .then(res => res.json())
}

export default function useLogout() {
  return useMutation({
    mutationFn: async () => await logout()
  })
}