import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/lib/utils";
import { FormItemProps } from "@/shared/interfaces/form-item.props";
import { get } from "lodash";
import { FieldPath, FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export type MySelectProps<TFieldValues extends FieldValues> =
  FormItemProps<TFieldValues> & {
    options: { value: string | number; label: string }[]; // Select uchun opsiyalar
  } & Omit<React.ComponentPropsWithoutRef<typeof SelectTrigger>, "children">;

const MySelect = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helperText,
  required,
  className,
  rules,
  floatingError,
  options, // Opsiyalar massivi
  ...props // Boshqa SelectTrigger props'lari
}: MySelectProps<TFieldValues>) => {
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
      render={({ field, formState }) => (
        <FormItem>
          {labelElm}
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              {...props}
            >
              <SelectTrigger
                className={twMerge(["mt-2", className])}
                variant={
                  get(formState.errors, `${name}.message`)
                    ? "failure"
                    : "default"
                }
              >
                <SelectValue
                  placeholder={props.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {helperText && <FormDescription>{helperText}</FormDescription>}
          <FormMessage className={cn(floatingError)} />
        </FormItem>
      )}
    />
  ) : (
    <>
      {labelElm}
      <Select {...props}>
        <SelectTrigger className={twMerge(["mt-2", className])}>
          <SelectValue placeholder={props.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormDescription>{helperText}</FormDescription>
    </>
  );
};

export default MySelect;
