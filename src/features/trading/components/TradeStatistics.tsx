import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { getTradeStatistics } from "../api/trading";
import { TradeFilter } from "../types";
import { 
  RiMoneyDollarCircleLine, 
  RiCoinsLine, 
  RiShoppingBag3Line,
  RiCheckboxCircleLine,
  RiAlertLine
} from "@remixicon/react";

interface TradeStatisticsProps {
  filters?: TradeFilter;
}

const TradeStatistics = ({ filters }: TradeStatisticsProps) => {
  const { data: statistics, isLoading, isError } = useQuery({
    queryKey: ["trade-statistics", filters],
    queryFn: () => getTradeStatistics(filters),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Statistikani yuklashda xato" />;

  const statsCards = [
    // Total trades count (only PAID and DEBT status)
    {
      title: "Jami savdolar soni",
      value: (statistics?.paid_trades_count || 0) + (statistics?.debt_trades_count || 0),
      icon: <RiShoppingBag3Line className="w-6 h-6" />,
      description: "To'langan va qarzdorlik statusdagi savdolar",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    
    // Som trades total
    {
      title: "Jami savdolar (So'm)",
      value: statistics?.total_som_amount || 0,
      icon: <RiCoinsLine className="w-6 h-6" />,
      description: `${statistics?.som_trades_count || 0} ta savdo`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      suffix: " so'm",
      formatNumber: true,
    },

    // Dollar trades total
    {
      title: "Jami savdolar (Dollar)",
      value: statistics?.total_dollar_amount || 0,
      icon: <RiMoneyDollarCircleLine className="w-6 h-6" />,
      description: `${statistics?.dollar_trades_count || 0} ta savdo`,
      color: "text-emerald-600", 
      bgColor: "bg-emerald-50",
      suffix: " $",
      formatNumber: true,
    },

    // Paid trades
    {
      title: "To'langan savdolar",
      value: statistics?.paid_trades_count || 0,
      icon: <RiCheckboxCircleLine className="w-6 h-6" />,
      description: "To'liq to'langan savdolar soni",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },

    // Debt trades
    {
      title: "Qarzdorlik savdolar",
      value: statistics?.debt_trades_count || 0,
      icon: <RiAlertLine className="w-6 h-6" />,
      description: "Qarz bilan savdolar soni", 
      color: "text-red-600",
      bgColor: "bg-red-50",
    },

    // Total all trades
    {
      title: "Barcha savdolar",
      value: statistics?.total_trades_count || 0,
      icon: <RiShoppingBag3Line className="w-6 h-6" />,
      description: "Barcha statusdagi savdolar",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="border-l-4 border-l-transparent hover:border-l-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <div className={card.color}>
                {card.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CountUp
                end={card.value}
                duration={2}
                separator=" "
                decimals={card.formatNumber && card.value > 0 ? 2 : 0}
              />
              {card.suffix || ""}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TradeStatistics;

