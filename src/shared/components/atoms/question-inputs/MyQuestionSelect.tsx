import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { FormItemProps } from "@/shared/interfaces/form-item.props.ts";
import React from "react";
import { FieldPath, FieldValues } from "react-hook-form";

// Direction turi uchun aniqlash
type Direction = "ltr" | "rtl" | undefined;

type MySelectProps<TFieldValues extends FieldValues> =
  FormItemProps<TFieldValues> & {
    options: { value: string; label: string }[] | [] | undefined;
    dir?: Direction;
    id?: string; // `id` ni qo'shdik
    className?: string; // `className` ni qo'shdik
  } & Omit<
      React.ComponentPropsWithoutRef<typeof Select>,
      "value" | "defaultValue"
    >;

const MyQuestionSelect = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  rules,
  helperText,
  options,
  dir,
  id,
  className, // `className` ni qabul qilish
  ...props
}: MySelectProps<TFieldValues>) => {
  return name && control ? (
    <FormField<TFieldValues, FieldPath<TFieldValues>>
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={`flex flex-col space-y-2 ${className}`} id={id}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value as string | undefined}
              dir={dir}
              {...props}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {helperText && <FormDescription>{helperText}</FormDescription>}
        </FormItem>
      )}
    />
  ) : (
    <div
      className={`flex flex-col space-y-2 rounded-md border p-4 ${className}`}
      id={id}
    >
      <FormLabel>{label}</FormLabel>
      <Select dir={dir} {...props}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormDescription>{helperText}</FormDescription>
    </div>
  );
};

export default MyQuestionSelect;
