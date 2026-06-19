/**
 * `<FrequentationChart>` - Recharts line chart for the historical view.
 *
 * Visual style mirrors the brief screenshot:
 * - Y axis labelled "Nb de Personnes"
 * - X axis covers 0h..23h
 * - Single blue series with dots
 *
 * Kept stateless: the parent computes the data and passes it through.
 */

import { useTheme } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HourlyOccupationPoint } from '../../utils/stats.utils';

export interface FrequentationChartProps {
  data: HourlyOccupationPoint[];
  /** Localised label rendered in the legend. */
  seriesLabel?: string;
}

export const FrequentationChart = ({
  data,
  seriesLabel = 'Fréquentation',
}: FrequentationChartProps) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.palette.divider}
        />
        <XAxis
          dataKey="hour"
          tickFormatter={(hour: number) => `${hour}h`}
          stroke={theme.palette.text.secondary}
        />
        <YAxis
          label={{
            value: 'Nb de Personnes',
            angle: -90,
            position: 'insideLeft',
            style: { fill: theme.palette.text.secondary },
          }}
          stroke={theme.palette.text.secondary}
        />
        <Tooltip
          formatter={(value: number | string) => [`${value}`, 'Personnes']}
          labelFormatter={(hour: number) => `${hour}h`}
          contentStyle={{
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="occupation"
          name={seriesLabel}
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
