import { useTheme } from '../../hooks/useTheme';
import PatternGrid from './PatternGrid';

export default function LockScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#F4EDDE' : '#171617';

  return (
    <div 
      className="fixed inset-0" 
      style={{ backgroundColor }}
    >
      <PatternGrid onPatternSuccess={onComplete} />
    </div>
  );
}