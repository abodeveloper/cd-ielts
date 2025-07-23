import {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { ReactNode } from "react";

export interface FormItemProps<TFieldValues extends FieldValues> {
  register?: UseFormRegister<TFieldValues>;
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  label?: ReactNode;
  helperText?: ReactNode;
  floatingError?: boolean;
}
