import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormItemProps } from "@/shared/interfaces/form-item.props";
import { FieldPath, FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export type MyTextAreaProps<TFieldValues extends FieldValues> =
  FormItemProps<TFieldValues> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const MyQuestionTextArea = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  required,
  className,
  rules,
  floatingError,
  ...props
}: MyTextAreaProps<TFieldValues>) => {
  const labelElm = label && (
    <FormLabel className="my-3">
      {label} {required && <span className="text-[--destructive]">*</span>}
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
            <Textarea
              autoComplete="off"
              placeholder="..."
              className={cn(className)}
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
      <Textarea {...props} className={twMerge([className])} />
      {helperText && <FormDescription>{helperText}</FormDescription>}
    </>
  );
};

export default MyQuestionTextArea;
