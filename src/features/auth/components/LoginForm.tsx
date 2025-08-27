import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MyInput from "@/shared/components/atoms/form-elements/MyInput";
import { LoginDto } from "@/shared/interfaces/auth";
import { FormProvider } from "react-hook-form";
import { useLoginForm } from "../hooks/useLoginForm";

export const LoginForm = () => {
  
  const { form, onSubmit, loginMutation } = useLoginForm();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-10")}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <MyInput<LoginDto>
              required
              floatingError
              label="Username"
              placeholder="Enter your username"
              control={form.control}
              name="username"
              type="text"
            />
          </div>
          <div className="grid gap-3">
            {/* <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required /> */}

            <MyInput<LoginDto>
              required
              floatingError
              label="Password"
              placeholder="Enter your password"
              control={form.control}
              name="password"
              type="password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            loading={loginMutation.isPending}
          >
            Login
          </Button>
        </div>
        {/* <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="#" className="underline underline-offset-4">
            Sign up
          </a>
        </div> */}
      </form>
    </FormProvider>
  );
};
