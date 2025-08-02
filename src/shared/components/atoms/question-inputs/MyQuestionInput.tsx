import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input, InputProps } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils";
import { FormItemProps } from "@/shared/interfaces/form-item.props";
import { FieldPath, FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export type MyInputProps<TFieldValues extends FieldValues> =
  FormItemProps<TFieldValues> & InputProps;

const MyQuestionInput = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  required,
  className,
  rules,
  floatingError,
  ...props
}: MyInputProps<TFieldValues>) => {
  const labelElm = label && (
    <FormLabel className={"my-3"}>
      {label} {required && <span className={"text-red-600"}>*</span>}
    </FormLabel>
  );

  return name && control ? (
    <FormField<TFieldValues, FieldPath<TFieldValues>>
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {labelElm}
          <FormControl>
            <input
              autoComplete="off"
              type="text"
              className={cn(
                "placeholder:text-primary text-center h-7",
                "bg-transparent border border-ring rounded-md px-2 py-1",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                "inline-block mx-2 my-2"
              )}
              {...props}
              {...field}
            />
          </FormControl>
          {helperText && <FormDescription>{helperText}</FormDescription>}
          <FormMessage className={cn(floatingError)} />
        </FormItem>
      )}
    />
  ) : (
    <>
      {labelElm}
      <Input {...props} className={twMerge(["mt-2", className])} />
      <FormDescription>{helperText}</FormDescription>
    </>
  );
};

export default MyQuestionInput;
