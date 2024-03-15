import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useLogin from "@/hooks/useLogin";
import { Label } from "@/components/ui/label"

const FormSchema = z
  .object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(1, 'Campo obrigatório'),
  });

type FormSchemaType = z.infer<typeof FormSchema> & { serverError: string };

export function Login() {
  const { mutateAsync: loginFn } = useLogin();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema)
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    await loginFn({
      email: data.email,
      password: data.password
    })
      .then((res) => {
        localStorage.setItem('token', res.token);
        navigate('/tasks')
      })
      .catch(error =>
        setError('serverError', { type: '400', message: error.response.data.message })
      );
  }

  return (
    <div className="flex items-center min-h-screen px-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">Digite seu e-mail abaixo para fazer login em sua conta</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.serverError && (
            <span className="text-xs text-red-800 block">
              {errors.serverError.message}
            </span>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input {...register('email')} id="email" placeholder="seuemail@email.com" type="email" />
            {errors.email && (
              <span className="text-xs text-red-800 block">
                {errors.email?.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input {...register('password')} id="password" placeholder="Digite sua senha..." type="password" />
            {errors.password && (
              <span className="text-xs text-red-800 block">
                {errors.password?.message}
              </span>
            )}
          </div>
          <Button disabled={isSubmitting} className="w-full" type="submit">
            Login
          </Button>
        </form>
      </div>
    </div >
  )
}




