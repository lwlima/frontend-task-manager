import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Task } from "@/types";
import { TASKS_QUERY_KEY } from "./useGetTasks";

async function updateTask(data: Task): Promise<Task> {
  const token = localStorage.getItem('token');
  return fetch(`http://localhost:8000/api/tasks/${data.id}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    method: 'PUT',
    body: JSON.stringify(data)
  })
    .then(res => res.json());
}

export default function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Task) => {
      return await updateTask(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [TASKS_QUERY_KEY]
      });
    }
  })
}