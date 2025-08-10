import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form.tsx";
import { useEffect } from "react";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form"; // useFormContext qo'shildi

type CheckboxGroupOption = {
  value: string;
  label: string;
  helperText?: string;
};

type MyQuestionCheckboxGroupProps<TFieldValues extends FieldValues> = {
  control: any;
  name: FieldPath<TFieldValues>;
  label?: string;
  options: CheckboxGroupOption[];
  orientation?: "vertical" | "horizontal";
  className?: string;
  maxSelections?: number;
};

const MyQuestionCheckboxGroup = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  orientation = "vertical",
  className = "",
  maxSelections,
}: MyQuestionCheckboxGroupProps<TFieldValues>) => {
  // useWatch bilan qiymatni kuzatish
  const formValues = useWatch({ control, name }) as string[] | undefined;
  const { setValue } = useFormContext(); // Form kontekstidan setValue olish

  useEffect(() => {
    if (maxSelections && formValues && formValues.length > maxSelections) {
      // Cheklovdan oshsa, oxirgi qo'shimchani olib tashlash
      const newValue = formValues.slice(0, maxSelections);
      setValue(name, newValue);
    }
  }, [formValues, maxSelections, name, setValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`space-y-2 ${
            orientation === "horizontal" ? "space-x-4" : ""
          } ${className}`}
        >
          {label && <FormLabel>{label}</FormLabel>}
          {options.map((option) => (
            <FormItem
              key={option.value}
              className="flex flex-row items-start space-x-3 space-y-0"
            >
              <FormControl>
                <Checkbox
                  checked={
                    (field.value as string[])?.includes(option.value) || false
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = field.value || [];
                    if (
                      checked &&
                      maxSelections &&
                      currentValues.length >= maxSelections
                    ) {
                      return;
                    }
                    const newValue = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value);
                    field.onChange(newValue);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{option.label}</FormLabel>
                {option.helperText && (
                  <FormDescription>{option.helperText}</FormDescription>
                )}
              </div>
            </FormItem>
          ))}
        </FormItem>
      )}
    />
  );
};

export default MyQuestionCheckboxGroup;
