import { FinalAssignment } from '../../../types';
import assignmentIsDone from '../../../utils/assignmentIsDone';

function compareISODates(a: string, b: string): number {
  return new Date(a).valueOf() - new Date(b).valueOf();
}

/* Distinguish graded and ungraded assignments, then sort each group in reverse chronological order. */
export function sortByGraded(
  assignments: FinalAssignment[]
): FinalAssignment[] {
  return assignments.sort((a, b) => {
    if (a.graded == b.graded) return compareISODates(b.due_at, a.due_at);
    return (a.graded ? 1 : -1) - (b.graded ? 1 : -1);
  });
}

export function sortByDate(assignments: FinalAssignment[]): FinalAssignment[] {
  return assignments.sort((a, b) => {
    if (a.needs_grading_count && !b.needs_grading_count) return 1;
    else if (!a.needs_grading_count && b.needs_grading_count) return -1;
    return compareISODates(a.due_at, b.due_at);
  });
}

export function filterByTab(
  currentTab: 'Unfinished' | 'Completed',
  assignments: FinalAssignment[]
): FinalAssignment[] {
  return assignments.filter((a) => {
    const done = assignmentIsDone(a);
    return currentTab === 'Completed' ? done : !done;
  });
}

/* 
If on the completed tab, assignments are shown (new => old) (most recent submissions on top).
If on the unfinished tab, assignments are shown (old => new) (closest due date on top).
 */
export function sortByTab(
  currentTab: 'Unfinished' | 'Completed',
  assignments: FinalAssignment[]
): FinalAssignment[] {
  return currentTab === 'Completed'
    ? sortByGraded(assignments)
    : sortByDate(assignments);
}
