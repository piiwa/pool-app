/**
 * `<PredictivePage>` - Objectif 3.
 *
 * The user picks a set of pools to compare, a day of the week and a
 * target hour. The page surfaces:
 * - A recommendation banner for the pool with the lowest average
 *   occupation in that slot.
 * - A detailed comparison table (average / min / max / samples).
 *
 * The analysis runs synchronously over the bundled dataset on a button
 * click - keeping the trigger explicit avoids re-running heavy filters
 * on every keystroke.
 */

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { fr } from 'date-fns/locale';
import PoolIcon from '@mui/icons-material/Pool';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { SectionFeedback } from '../../components/common/section-feedback';
import type { PoolOccupationStats, Weekday } from '../../types/pool.types';
import { capitalize } from '../../utils/format.utils';
import { computeRanking } from '../../utils/stats.utils';
import { ComparisonTable } from './comparison-table';
import { PoolMultiSelect } from './pool-multi-select';
import { RecommendationCard } from './recommendation-card';
import { useHistoricalData } from '../stats/use-historical-data';
import { WeekdaySelect } from './weekday-select';

const WEEKDAY_LABEL: Record<Weekday, string> = {
  0: 'dimanche',
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
};

interface AnalysisResult {
  ranking: PoolOccupationStats[];
  weekday: Weekday;
  hour: number;
  minute: number;
}

export const PredictivePage = () => {
  const { occupations, poolNames } = useHistoricalData();

  // Default selection: first 3 pools so the user can click "Analyser"
  // immediately without picking anything.
  const defaultSelection = useMemo(() => poolNames.slice(0, 3), [poolNames]);

  const [selectedPools, setSelectedPools] = useState<string[]>([
    ...defaultSelection,
  ]);
  const [weekday, setWeekday] = useState<Weekday>(5); // Vendredi by default
  const [trainingTime, setTrainingTime] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(12, 15, 0, 0);
    return d;
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyse = () => {
    if (!trainingTime || selectedPools.length === 0) return;
    const ranking = computeRanking(
      occupations,
      selectedPools,
      weekday,
      trainingTime.getHours(),
      trainingTime.getMinutes(),
    );
    setAnalysis({
      ranking,
      weekday,
      hour: trainingTime.getHours(),
      minute: trainingTime.getMinutes(),
    });
  };

  const canAnalyse =
    selectedPools.length > 0 && trainingTime !== null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary" align="center">
          Choisissez vos piscines et l'heure d'entrainement souhaitée. L'analyse
          se base sur la fréquentation historique pour vous recommander la
          piscine la moins fréquentée.
        </Typography>

        <PoolMultiSelect
          label="Piscines à comparer"
          value={selectedPools}
          options={poolNames}
          onChange={setSelectedPools}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <WeekdaySelect
            label="Jour de la semaine"
            value={weekday}
            onChange={setWeekday}
          />
          <TimePicker
            label="Heure d'entrainement"
            value={trainingTime}
            onChange={(value) => setTrainingTime(value)}
            ampm={false}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Stack>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PoolIcon />}
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          size="large"
        >
          Analyser la fréquentation
        </Button>

        {analysis === null ? (
          <SectionFeedback
            state="empty"
            emptyMessage="Lancez l'analyse pour découvrir la piscine la moins fréquentée."
          />
        ) : (
          <RenderAnalysis result={analysis} />
        )}
      </Stack>
    </LocalizationProvider>
  );
};

const RenderAnalysis = ({ result }: { result: AnalysisResult }) => {
  const meaningful = result.ranking.filter((row) => row.samples > 0);

  if (meaningful.length === 0) {
    return (
      <Alert severity="info">
        Pas assez de données historiques pour cette combinaison.
      </Alert>
    );
  }

  const winner = meaningful[0];
  const timeLabel = `${String(result.hour).padStart(2, '0')}:${String(result.minute).padStart(2, '0')}`;
  const weekdayLabel = capitalize(WEEKDAY_LABEL[result.weekday]);

  return (
    <Stack spacing={2}>
      {winner && (
        <RecommendationCard
          winnerName={winner.name}
          weekdayLabel={weekdayLabel}
          timeLabel={timeLabel}
        />
      )}
      <ComparisonTable ranking={result.ranking} />
    </Stack>
  );
};
