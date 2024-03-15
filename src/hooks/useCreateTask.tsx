import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Task } from "@/types";
import { TASKS_QUERY_KEY } from "./useGetTasks";
import { useToast } from "@/components/ui/use-toast";

async function createTask(task: Task): Promise<Task> {
  const token = localStorage.getItem('token');
  return fetch(`http://localhost:8000/api/tasks`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    method: 'POST',
    body: JSON.stringify(task)
  })
    .then(res => res.json());
}

export default function useCreateTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Task) => {
      return await createTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TASKS_QUERY_KEY]
      });

      toast({
        description: 'Task criada com sucesso'
      })
    },
    onError: () => toast({
      description: 'Ocorreu um erro ao criar a task, tente novamente mais tarde'
    })
  })
}