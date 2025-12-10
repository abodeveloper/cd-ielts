import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createPayment } from "../api/trading";
import { Trade, CreatePaymentData } from "../types";

const createPaymentSchema = z.object({
  amount: z.number().min(0.01, "Miqdor 0 dan katta bo'lishi kerak"),
  note: z.string().optional(),
});

type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;

interface CreatePaymentFormProps {
  trade: Trade;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreatePaymentForm = ({ trade, onSuccess, onCancel }: CreatePaymentFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: 0,
      note: "",
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("To'lov muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["trade-payments", trade.id] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xato yuz berdi");
    },
  });

  const onSubmit = (data: CreatePaymentFormData) => {
    const paymentData: CreatePaymentData = {
      trade_id: trade.id,
      amount: data.amount,
      note: data.note,
    };
    createPaymentMutation.mutate(paymentData);
  };

  // Get currency symbol and label based on trade type
  const getCurrencyInfo = () => {
    if (trade.trade_type === 'DOLLAR') {
      return { symbol: '$', label: 'Dollar' };
    } else {
      return { symbol: "so'm", label: "So'm" };
    }
  };

  const currencyInfo = getCurrencyInfo();

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          To'lov qo'shish - {trade.customer.name}
        </CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Savdo raqami: #{trade.id}</p>
          <p>Savdo turi: {currencyInfo.label}</p>
          <p>Umumiy summa: {trade.amount.toLocaleString()} {currencyInfo.symbol}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount - currency is fixed based on trade type */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To'lov miqdori ({currencyInfo.label})
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={trade.amount}
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary">
                        {currencyInfo.symbol}
                      </span>
                    </div>
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Maksimal: {trade.amount.toLocaleString()} {currencyInfo.symbol}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency Display - Not selectable */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valyuta:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {currencyInfo.symbol}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({currencyInfo.label})
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valyuta savdo turiga qarab avtomatik belgilanadi va o'zgartirilmaydi
              </p>
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="To'lov haqida qo'shimcha ma'lumot..."
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
                disabled={createPaymentMutation.isPending}
                className="flex-1"
              >
                {createPaymentMutation.isPending ? "Qo'shilmoqda..." : "To'lov qo'shish"}
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

export default CreatePaymentForm;

