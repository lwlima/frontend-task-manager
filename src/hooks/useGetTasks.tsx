import { useQuery } from "@tanstack/react-query";

import { Task } from "@/types";
import { useNavigate } from "react-router-dom";

export const TASKS_QUERY_KEY = 'tasks';

async function getTasks(): Promise<Task[]> {
  const token = localStorage.getItem('token');
  return fetch('http://localhost:8000/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (res.status == 401) throw new Error();
      return await res.json()
    })
}

export default function useGetTasks() {
  const navigate = useNavigate();
  const response = useQuery({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: async () => {
      return await getTasks()
        .catch(() => navigate('/'));
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const tasks = response.data ?? [];

  return { ...response, data: tasks }
}