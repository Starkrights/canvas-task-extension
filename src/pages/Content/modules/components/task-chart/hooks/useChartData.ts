import { AssignmentType, FinalAssignment } from '../../../types';
import { Bar, ChartData } from '../../radial-bar-chart';
import { ringProgress } from '../utils/ringProgress';
import sortByPosition from '../utils/sortByPosition';

export default function useChartData(
  assignments: FinalAssignment[],
  defaultColor: string,
  key = ''
): ChartData {
  const sortedAssignments = sortByPosition(assignments);
  const data: ChartData = {
    bars: sortedAssignments.reduce((a: Bar[], b: FinalAssignment) => {
      if (a.length == 0 || a[a.length - 1].id !== b.course_id) {
        a.push({
          id: b.course_id,
          value: 0,
          max: 0,
          color: b.color || '#000000',
        });
      }

      a[a.length - 1].value += ringProgress(b);
      a[a.length - 1].max +=
        b.points_possible == 0 && b.type !== AssignmentType.NOTE ? 0 : 1; // 0 points = optional, but custom notes should be included
      return a;
    }, []),
    key: key,
  };

  if (data.bars.length === 0)
    data.bars.push({
      id: '',
      value: 0,
      max: 0,
      color: defaultColor,
    });
  return data;
}
