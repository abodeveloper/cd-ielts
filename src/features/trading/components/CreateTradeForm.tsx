import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { createTrade, getCustomers } from "../api/trading";
import { CreateTradeData, Customer } from "../types";
import BranchFilter from "./BranchFilter";

const createTradeSchema = z.object({
  customer_id: z.number().min(1, "Mijozni tanlang"),
  branch_id: z.number().min(1, "Filialni tanlang"),
  trade_type: z.enum(["DOLLAR", "SOM"], {
    required_error: "Savdo turini tanlang"
  }),
  amount: z.number().min(0.01, "Miqdor 0 dan katta bo'lishi kerak"),
  description: z.string().optional(),
});

type CreateTradeFormData = z.infer<typeof createTradeSchema>;

interface CreateTradeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateTradeForm = ({ onSuccess, onCancel }: CreateTradeFormProps) => {
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>();

  const form = useForm<CreateTradeFormData>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      customer_id: 0,
      branch_id: 0,
      trade_type: "SOM",
      amount: 0,
      description: "",
    },
  });

  // Get customers
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Create trade mutation
  const createTradeMutation = useMutation({
    mutationFn: createTrade,
    onSuccess: () => {
      toast.success("Savdo muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade-statistics"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xato yuz berdi");
    },
  });

  const onSubmit = (data: CreateTradeFormData) => {
    createTradeMutation.mutate(data);
  };

  const handleBranchChange = (branchId: number) => {
    setSelectedBranchId(branchId);
    form.setValue("branch_id", branchId);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yangi savdo yaratish</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Branch Selection */}
            <BranchFilter
              selectedBranchId={selectedBranchId}
              onBranchChange={handleBranchChange}
            />

            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mijoz</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Mijozni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map((customer: Customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trade Type - Dollar or Som */}
            <FormField
              control={form.control}
              name="trade_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Savdo turi (Valyuta)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SOM" id="som" />
                        <label htmlFor="som" className="cursor-pointer font-medium">
                          So'm
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="DOLLAR" id="dollar" />
                        <label htmlFor="dollar" className="cursor-pointer font-medium">
                          Dollar ($)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Miqdor {form.watch("trade_type") === "DOLLAR" ? "($)" : "(So'm)"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {form.watch("trade_type") === "DOLLAR" ? "$" : "so'm"}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Savdo haqida qo'shimcha ma'lumot..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createTradeMutation.isPending}
                className="flex-1"
              >
                {createTradeMutation.isPending ? "Yaratilmoqda..." : "Savdo yaratish"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Bekor qilish
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateTradeForm;

