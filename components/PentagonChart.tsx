import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

type PentagonChartData = {
  field: string;
  value: number;
};

interface PentagonChartProps {
  data: PentagonChartData[];
}

const PentagonChart: React.FC<PentagonChartProps> = ({ data }) => {
  const maxValue = 1;

  const radarFill = (entry: PentagonChartData) => {
    return entry.value === maxValue ? "#FF0000" : "#8884d8";
  };

  return (
    <RadarChart
      cx={300}
      cy={250}
      outerRadius={200}
      width={600}
      height={500}
      data={data}
    >
      <PolarGrid gridType="polygon" />
      <PolarAngleAxis dataKey="field" />

      <Radar
        name="Values"
        dataKey="value"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  );
};

export default PentagonChart;
