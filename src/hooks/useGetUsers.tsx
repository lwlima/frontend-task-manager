import { useQuery } from "@tanstack/react-query";

import { User } from "@/types";

export const USERS_QUERY_KEY = 'users';

async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem('token');
  return fetch('http://localhost:8000/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (res.status == 401) throw new Error();
      return await res.json()
    })
}

export default function useGetUsers() {
  const response = useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: async () => await getUsers(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const users = response.data ?? [];

  return { ...response, data: users }
}