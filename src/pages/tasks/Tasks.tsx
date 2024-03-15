import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import useLogout from "@/hooks/useLogout";
import useGetTasks from "@/hooks/useGetTasks";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import useGetUsers from "@/hooks/useGetUsers";
import useGetTaskStatus from "@/hooks/useGetTaskStatus";
import useCreateTask from "@/hooks/useCreateTask";
import { Task } from "@/types";
import useUpdateTask from "@/hooks/useUpdateTask";

const FormSchema = z
  .object({
    title: z.string().min(1, 'Campo obrigatório'),
    description: z.string().min(1, 'Campo obrigatório'),
    userId: z.string().min(1, 'Campo obrigatório'),
    statusId: z.string().min(1, 'Campo obrigatório'),
  });

type FormSchemaType = z.infer<typeof FormSchema> & { serverError: string };

export function Tasks() {
  const navigate = useNavigate();
  const { data: tasks } = useGetTasks();
  const { data: taskStatus } = useGetTaskStatus();
  const { data: users } = useGetUsers();
  const { mutateAsync: logoutFn } = useLogout();
  const { mutateAsync: createTaskFn } = useCreateTask();
  const { mutateAsync: updateTaskFn } = useUpdateTask();
  const [taskIdToUpdated, setTaskIdToUpdated] = useState(0);
  const [taskInProgress, setTaskInprogress] = useState({} as Task);
  const newTaskButtonRef = useRef<any>();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isOn, setIsOn] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const startTimer = useCallback(() => {
    let s = (new Date().getTime()) - (new Date(taskInProgress.started_at ?? '')).getTime()
    const workedHoursSplited = taskInProgress.worked_hours?.split(':') ?? ['0', '0', '0'];
    const ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60

    hrs = hrs + parseInt(workedHoursSplited[0]);
    mins = mins + parseInt(workedHoursSplited[1]);
    secs = secs + parseInt(workedHoursSplited[2]);
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    setIsOn(true);
  }, [taskInProgress]);

  useEffect(() => {
    tasks.map(task => {
      if (task.status_id == 2) {
        setTaskInprogress(task);
        startTimer();
      }
    })
  }, [tasks, startTimer])

  useEffect(() => {
    if (!isOn) {
      return;
    }

    function increment() {
      if (minutes == 59 && seconds == 59) {
        setHours(prev => prev + 1);
        setMinutes(0);
      }
      seconds == 59 && setMinutes(prev => prev + 1);
      seconds == 59 ? setSeconds(0) : setSeconds(prev => prev + 1);
    }

    const interval = setInterval(increment, 1000);
    return () => clearInterval(interval);
  }, [seconds, minutes, isOn]);

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    let isStarted = false;
    let isFinished = false;
    if (!isOn && parseInt(data.statusId) == 2) {
      startTimer();
      isStarted = true;
    }

    if (isOn && parseInt(data.statusId) != 2) {
      setIsOn(false);
      setSeconds(0);
      setMinutes(0);
      setHours(0);
      isFinished = true;
    }

    if (taskIdToUpdated) {
      await updateTaskFn({
        id: taskIdToUpdated,
        user_id: parseInt(data.userId),
        status_id: parseInt(data.statusId),
        title: data.title,
        description: data.description,
        isStarted,
        isFinished
      })
      resetForm();
      return;
    }

    await createTaskFn({
      user_id: parseInt(data.userId),
      status_id: parseInt(data.statusId),
      title: data.title,
      description: data.description,
      isStarted,
      isFinished
    })
    resetForm();
  }

  function setValuesToUpdated(task: Task) {
    setTaskIdToUpdated(task.id!);
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('userId', task.user_id.toString());
    setValue('statusId', task.status_id.toString());
  }

  return (
    <div className="flex py-20 px-10 w-full justify-center">
      <div className="w-full md:w-[700px] flex flex-col">
        <section id="title" className="flex justify-center pb-20">
          <h1 className="text-4xl">Task Manager</h1>
        </section>
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger>
              <Button ref={newTaskButtonRef}>+ Nova task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova task</DialogTitle>
                <DialogDescription>
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Titulo</Label>
                      <Input {...register('title')} id="title" placeholder="Titulo" type="text" />
                      {errors.title && (
                        <span className="text-xs text-red-800 block">
                          {errors.title?.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Descrição</Label>
                      <Input {...register('description')} id="description" placeholder="Descrição" type="text" />
                      {errors.description && (
                        <span className="text-xs text-red-800 block">
                          {errors.description?.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Usuário</Label>
                      <Controller
                        name="userId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            defaultValue={field.value}
                            onValueChange={field.onChange}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Selecione um usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Usuários</SelectLabel>
                                {users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}

                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.userId && (
                        <span className="text-xs text-red-800 block">
                          {errors.userId?.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Controller
                        name="statusId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            defaultValue={field.value}
                            onValueChange={field.onChange}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                {taskStatus.map(status =>
                                  <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.statusId && (
                        <span className="text-xs text-red-800 block">
                          {errors.statusId?.message}
                        </span>
                      )}
                    </div>

                    <DialogClose asChild>
                      <Button type="submit" disabled={isSubmitting}>Salvar</Button>
                    </DialogClose>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Backlog</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                {tasks.filter(task => task.status?.slug_name == 'backlog').map(task =>
                  <li onClick={() => { setValuesToUpdated(task); newTaskButtonRef.current.click(); }}
                    key={task.id}
                    className="p-2 transition-colors bg-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer rounded-md"
                  >
                    {task.title}
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Em andamento</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                {tasks.filter(task => task.status?.slug_name == 'in-progress').map(task =>
                  <li onClick={() => { setValuesToUpdated(task); newTaskButtonRef.current.click(); }}
                    key={task.id}
                    className="p-2 transition-colors bg-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer rounded-md flex justify-between"
                  >
                    <span>{task.title}</span>
                    <span>{hours}:{minutes}:{seconds}</span>
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Pausado</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                {tasks.filter(task => task.status?.slug_name == 'paused').map(task =>
                  <li onClick={() => { setValuesToUpdated(task); newTaskButtonRef.current.click(); }}
                    key={task.id}
                    className="p-2 transition-colors bg-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer rounded-md"
                  >
                    {task.title}
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Concluido</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                {tasks.filter(task => task.status?.slug_name == 'done').map(task =>
                  <li onClick={() => { setValuesToUpdated(task); newTaskButtonRef.current.click(); }}
                    key={task.id}
                    className="p-2 transition-colors bg-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer rounded-md"
                  >
                    {task.title}
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button className="mt-20" onClick={() => { logoutFn(); navigate('/') }}>Logout</Button>
      </div>
    </div >
  )
}