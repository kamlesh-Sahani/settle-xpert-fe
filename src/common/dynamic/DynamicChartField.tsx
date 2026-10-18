"use client";
import { Form } from "antd";
import { FieldConfig } from "@/types/formField.types";
import { Control, Controller, FieldValues } from "react-hook-form";
import classNames from "classnames";
import { isObject } from "@/common/utils/main.utils";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Bubble,
  Scatter,
  Chart
} from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface DynamicChartFieldProps extends FieldConfig {
  id: string;
  name?: string;
  className?: string;
  control?: Control<FieldValues, any, FieldValues>;
}

export default function DynamicChartField(props: DynamicChartFieldProps) {
  const { className, id, name, control, chartConfig, options: fieldOptions } = props;

  // Chart data comes purely from props (no API fetching inside the component)
  // If chartConfig.data is provided, use it. Otherwise, fallback to the generic `options` array if provided.
  const rawData = chartConfig?.data || fieldOptions || [];

  if (!chartConfig) {
    return <div className="text-red-500">Missing chart config</div>;
  }

  // Parse backend data to Chart.js format
  const labels = rawData.map((item: any) =>
    chartConfig.labelsKey ? item[chartConfig.labelsKey] : item.label || item.name || ""
  );

  const defaultColors = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
  ];

  // If datasets are not defined in chartConfig (e.g. simple fallback using `options`), create a default dataset
  const datasetsConfig = chartConfig.datasets?.length > 0 ? chartConfig.datasets : [
    {
      label: "Dataset",
      dataKey: "value"
    }
  ];

  const datasets = datasetsConfig.map((ds: any, idx: number) => {
    const color = defaultColors[idx % defaultColors.length];
    return {
      label: ds.label,
      data: rawData.map((item: any) => {
        const val = item[ds.dataKey] ?? item.value;
        if (isObject(val)) return val;
        return Number(val ?? 0);
      }),
      backgroundColor: ds.backgroundColor || (ds.fill || chartConfig.type === "bar" || chartConfig.type === "pie" || chartConfig.type === "doughnut" ? color + "80" : color),
      borderColor: ds.borderColor || color,
      borderWidth: ds.borderWidth ?? 2,
      fill: ds.fill ?? false,
      type: ds.type as any,
      tension: ds.tension ?? 0.4, // Smooth by default for lines
      ...ds
    };
  });

  const finalData = {
    labels,
    datasets,
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...chartConfig.options,
  };

  const renderChart = () => {
    switch (chartConfig.type) {
      case "line":
        return <Line data={finalData} options={finalOptions} />;
      case "bar":
        return <Bar data={finalData} options={finalOptions} />;
      case "radar":
        return <Radar data={finalData} options={finalOptions} />;
      case "doughnut":
        return <Doughnut data={finalData} options={finalOptions} />;
      case "pie":
        return <Pie data={finalData} options={finalOptions} />;
      case "polarArea":
        return <PolarArea data={finalData} options={finalOptions} />;
      case "bubble":
        return <Bubble data={finalData} options={finalOptions} />;
      case "scatter":
        return <Scatter data={finalData} options={finalOptions} />;
      default:
        // Use Chart for mixed/composed
        return <Chart type={chartConfig.type as any} data={finalData} options={finalOptions} />;
    }
  };

  const chartElement = (
    <div
      className={classNames("w-full relative", className)}
      style={{
        height: chartConfig.height || 300,
        width: chartConfig.width || "100%",
      }}
    >
      {rawData.length > 0 ? renderChart() : <div className="flex h-full items-center justify-center text-text-secondary">No data available</div>}
    </div>
  );

  // Hook form integration wrapper
  if (control && name) {
    return (
      <Controller
        name={(name || "") + id}
        control={control}
        render={() => (
          <Form.Item className="mb-0 w-full">
            {chartElement}
          </Form.Item>
        )}
      />
    );
  }

  // Standalone mode
  return (
    <Form.Item className="mb-0 w-full">
      {chartElement}
    </Form.Item>
  );
}
