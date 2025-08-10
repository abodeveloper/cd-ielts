import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemProps } from "@/shared/interfaces/form-item.props.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import React from "react";

type CheckboxItemProps = React.ComponentPropsWithoutRef<typeof Checkbox>;

type MyCheckboxProps<TFieldValues extends FieldValues> =
  FormItemProps<TFieldValues> & CheckboxItemProps;

const MyQuestionCheckbox = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  rules,
  helperText,
  value,
  ...props
}: MyCheckboxProps<TFieldValues>) => {
  return name && control ? (
    <FormField<TFieldValues, FieldPath<TFieldValues>>
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value === value}
              onCheckedChange={(checked) =>
                field.onChange(checked ? value : undefined)
              }
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {helperText && <FormDescription>{helperText}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  ) : (
    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <Checkbox value={value} {...props} />
      <div className="space-y-1 leading-none">
        {label && <FormLabel>{label}</FormLabel>}
        <FormDescription>{helperText}</FormDescription>
      </div>
    </div>
  );
};

export default MyQuestionCheckbox;
