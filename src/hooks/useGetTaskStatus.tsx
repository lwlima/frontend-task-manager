import { useQuery } from "@tanstack/react-query";

import { TaskStatus } from "@/types";

export const TASKS_STATUS_QUERY_KEY = 'taskStatus';

async function getTaskStatus(): Promise<TaskStatus[]> {
  const token = localStorage.getItem('token');
  return fetch('http://localhost:8000/api/task-status', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (res.status == 401) throw new Error();
      return await res.json()
    })
}

export default function useGetTaskStatus() {
  const response = useQuery({
    queryKey: [TASKS_STATUS_QUERY_KEY],
    queryFn: async () => await getTaskStatus(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const taskStatus = response.data ?? [];

  return { ...response, data: taskStatus }
}