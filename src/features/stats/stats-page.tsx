/**
 * `<StatsPage>` - Objectif 2.
 *
 * Lets the user pick a pool + a date and renders the corresponding
 * hourly occupation curve from the bundled historical dataset.
 */

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from 'date-fns/locale';
import { Box, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { SectionFeedback } from '../../components/common/section-feedback';
import { formatLongFrenchDate } from '../../utils/format.utils';
import { computeDailyCurve } from '../../utils/stats.utils';
import { FrequentationChart } from './frequentation-chart';
import { PoolSelect } from './pool-select';
import { useHistoricalData } from './use-historical-data';

/** Pick a sensible default: the latest available date in the dataset. */
const findLatestDate = (
  occupations: readonly { timestamp: Date }[],
): Date | null => {
  let max: Date | null = null;
  for (const row of occupations) {
    if (!max || row.timestamp > max) max = row.timestamp;
  }
  return max;
};

export const StatsPage = () => {
  const { occupations, poolNames } = useHistoricalData();

  const defaultPool = poolNames[0] ?? '';
  const defaultDate = useMemo(
    () => findLatestDate(occupations) ?? new Date(),
    [occupations],
  );

  const [selectedPool, setSelectedPool] = useState<string>(defaultPool);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate);

  const chartData = useMemo(() => {
    if (!selectedPool || !selectedDate) return [];
    return computeDailyCurve(occupations, selectedPool, selectedDate);
  }, [occupations, selectedPool, selectedDate]);

  const hasData = chartData.some((point) => point.occupation !== null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <PoolSelect
            label="Sélectionner une piscine"
            value={selectedPool}
            options={poolNames}
            onChange={setSelectedPool}
          />
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={(value) => setSelectedDate(value)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Stack>

        {selectedDate && (
          <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
            Fréquentation le {formatLongFrenchDate(selectedDate)}
          </Typography>
        )}

        {hasData ? (
          <Box>
            <FrequentationChart data={chartData} />
          </Box>
        ) : (
          <SectionFeedback
            state="empty"
            emptyMessage="Aucune donnée disponible pour cette piscine à cette date."
          />
        )}
      </Stack>
    </LocalizationProvider>
  );
};
