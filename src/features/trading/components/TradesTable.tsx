import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";

import { 
  RiPhoneLine, 
  RiMessage2Line, 
  RiMoreLine, 
  RiEyeLine, 
  RiEditLine,
  RiDeleteBinLine
} from "@remixicon/react";

import { getTrades, sendSMSToCustomer, initiateCallToCustomer } from "../api/trading";
import { Trade, TradeFilter } from "../types";

interface TradesTableProps {
  filters?: TradeFilter;
  page?: number;
  onPageChange?: (page: number) => void;
}

const TradesTable = ({ filters, page = 1, onPageChange }: TradesTableProps) => {
  const queryClient = useQueryClient();
  const [smsDialog, setSmsDialog] = useState<{ open: boolean; customer: any }>({ 
    open: false, 
    customer: null 
  });
  const [smsMessage, setSmsMessage] = useState("");

  // Fetch trades
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trades", page, filters],
    queryFn: () => getTrades(page, filters),
  });

  // SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: ({ customerId, message }: { customerId: number; message: string }) =>
      sendSMSToCustomer(customerId, message),
    onSuccess: () => {
      toast.success("SMS muvaffaqiyatli yuborildi");
      setSmsDialog({ open: false, customer: null });
      setSmsMessage("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "SMS yuborishda xato");
    },
  });

  // Call mutation
  const initiateCallMutation = useMutation({
    mutationFn: initiateCallToCustomer,
    onSuccess: () => {
      toast.success("Qo'ng'iroq boshlandi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Qo'ng'iroq qilishda xato");
    },
  });

  const handleCall = (customer: any) => {
    initiateCallMutation.mutate(customer.id);
  };

  const handleSMSOpen = (customer: any) => {
    setSmsDialog({ open: true, customer });
  };

  const handleSMSSend = () => {
    if (!smsDialog.customer || !smsMessage.trim()) return;
    
    sendSMSMutation.mutate({
      customerId: smsDialog.customer.id,
      message: smsMessage.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { variant: "default" as const, label: "To'langan", className: "bg-green-100 text-green-800" },
      DEBT: { variant: "destructive" as const, label: "Qarzdorlik", className: "bg-red-100 text-red-800" },
      PENDING: { variant: "secondary" as const, label: "Kutilmoqda", className: "bg-yellow-100 text-yellow-800" },
      CANCELLED: { variant: "outline" as const, label: "Bekor qilingan", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getCurrencyInfo = (tradeType: string) => {
    return tradeType === 'DOLLAR' ? { symbol: '$', label: 'Dollar' } : { symbol: 'so\'m', label: 'So\'m' };
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Savdolarni yuklashda xato" />;

  const trades = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = data?.total_pages || 1;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Savdolar jadvali</span>
            <span className="text-sm font-normal text-muted-foreground">
              Jami: {totalCount} ta savdo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Savdo №</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Tur</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Savdolar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade: Trade) => {
                    const currencyInfo = getCurrencyInfo(trade.trade_type);
                    return (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">#{trade.id}</TableCell>
                        
                        {/* Customer with contact buttons */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{trade.customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {trade.customer.phone}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleCall(trade.customer)}
                                disabled={initiateCallMutation.isPending}
                              >
                                <RiPhoneLine className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSMSOpen(trade.customer)}
                              >
                                <RiMessage2Line className="w-3 h-3 mr-1" />
                                SMS
                              </Button>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{trade.branch.name}</TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">
                            {currencyInfo.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                          {trade.amount.toLocaleString()} {currencyInfo.symbol}
                        </TableCell>

                        <TableCell>{getStatusBadge(trade.status)}</TableCell>

                        <TableCell>
                          {format(new Date(trade.created_at), 'dd.MM.yyyy HH:mm')}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <RiMoreLine className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <RiEyeLine className="w-4 h-4 mr-2" />
                                Ko'rish
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RiEditLine className="w-4 h-4 mr-2" />
                                Tahrirlash
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <RiDeleteBinLine className="w-4 h-4 mr-2" />
                                O'chirish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {((page - 1) * 20) + 1}-{Math.min(page * 20, totalCount)} dan {totalCount}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page <= 1}
                >
                  Oldingi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Dialog */}
      <Dialog open={smsDialog.open} onOpenChange={(open) => {
        if (!open) {
          setSmsDialog({ open: false, customer: null });
          setSmsMessage("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SMS yuborish</DialogTitle>
            <DialogDescription>
              {smsDialog.customer?.name} ga SMS xabar yuborish ({smsDialog.customer?.phone})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="SMS xabarini kiriting..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              Xabar uzunligi: {smsMessage.length}/160 belgi
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSmsDialog({ open: false, customer: null })}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSMSSend}
              disabled={!smsMessage.trim() || sendSMSMutation.isPending}
            >
              {sendSMSMutation.isPending ? "Yuborilmoqda..." : "SMS yuborish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TradesTable;

