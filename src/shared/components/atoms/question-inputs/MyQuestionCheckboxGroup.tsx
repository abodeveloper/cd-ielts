import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form.tsx";
import { useEffect } from "react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

type CheckboxGroupOption = {
  value: string;
  label: string;
  helperText?: string;
  id?: string; // Har bir option uchun id
};

type MyQuestionCheckboxGroupProps<TFieldValues extends FieldValues> = {
  control: any;
  name: FieldPath<TFieldValues>;
  label?: string;
  options: CheckboxGroupOption[];
  orientation?: "vertical" | "horizontal";
  className?: string;
  maxSelections?: number;
  onValueChange?: (values: string[]) => void;
};

const MyQuestionCheckboxGroup = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  orientation = "vertical",
  className = "",
  maxSelections,
  onValueChange,
}: MyQuestionCheckboxGroupProps<TFieldValues>) => {
  const { setValue } = useFormContext();
  const formValues = useWatch({ control, name }) as string[] | undefined;

  useEffect(() => {
    if (maxSelections && formValues && formValues.length > maxSelections) {
      const newValue = formValues.slice(0, maxSelections);
      setValue(name, newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    }
  }, [formValues, maxSelections, name, setValue, onValueChange]);

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
          {label && <div className="font-medium">{label}</div>}
          {options.map((option) => {
            const checkboxId = option.id || `${name}_${option.value}`;
            return (
              <FormItem
                key={option.value}
                className="flex flex-row items-start space-x-3 space-y-0"
              >
                <FormControl>
                  <Checkbox
                    id={checkboxId}
                    checked={
                      (field.value as string[])?.includes(option.value) || false
                    }
                    onCheckedChange={(checked) => {
                      const currentValues = (field.value as string[]) || [];
                      if (
                        checked &&
                        maxSelections &&
                        currentValues.length >= maxSelections
                      ) {
                        return;
                      }
                      const newValue = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(
                            (v: string) => v !== option.value
                          );
                      field.onChange(newValue);
                      if (onValueChange) {
                        onValueChange(newValue);
                      }
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <span>{option.label}</span>{" "}
                  {/* Labelni checkbox yonida ko‘rsatish */}
                  {option.helperText && (
                    <FormDescription>{option.helperText}</FormDescription>
                  )}
                </div>
              </FormItem>
            );
          })}
        </FormItem>
      )}
    />
  );
};

export default MyQuestionCheckboxGroup;
