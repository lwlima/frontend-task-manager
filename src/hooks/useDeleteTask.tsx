import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Task } from "@/types";
import { TASKS_QUERY_KEY } from "./useGetTasks";
import { useToast } from "@/components/ui/use-toast";

async function deleteTask(task: Task): Promise<Task> {
  const token = localStorage.getItem('token');
  return fetch(`http://localhost:8000/api/tasks/${task.id}`, {
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

export default function useDeleteTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Task) => {
      return await deleteTask(data);
    },
    onSuccess: async (deletedTask) => {
      queryClient.setQueryData([TASKS_QUERY_KEY], (data: Task[]) => {
        data.filter((task) => task.id != deletedTask.id);
      })

      toast({
        description: 'Task excluída com sucesso'
      })
    },
    onError: () => toast({
      description: 'Ocorreu um erro ao excluir a task, tente novamente mais tarde'
    })
  })
}