import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import TaskCard from '../task-card';
import SubTabs from '../sub-tabs/SubTabs';
import { FinalAssignment } from '../../types';
import useHeadings from './utils/useHeadings';
import useSelectedCourse from './utils/useSelectedCourse';
import { filterByTab, sortByTab } from './utils/sortBy';
import cutAssignmentList from './utils/cutList';
import HeadingGroup from './components/HeadingGroup';
import CreateTaskCard from '../task-card/CreateTaskCard';
import assignmentIsDone from '../../utils/assignmentIsDone';
import Confetti from 'react-dom-confetti';
import { AssignmentStatus } from '../../types/assignment';
import NodeGroup from 'react-move/NodeGroup';
import { TransitionState } from '../task-card/TaskCard';
import { easeQuadInOut } from 'd3-ease';
import { DarkContext } from '../../contexts/darkContext';

const ListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;
  padding: 0px;
  padding-bottom: 5px;
`;

const ListWrapper = styled.div`
  margin: 10px 0px 25px 0px;
`;

const ConfettiWrapper = styled.div`
  position: absolute;
  top: 350px;
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  z-index: 10000;
`;

const HideDiv = styled.div<{ visible: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`;

interface ViewMoreProps {
  href: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}
const ViewMore = styled.a<ViewMoreProps>`
  font-size: 0.9rem;
`;

export interface TaskListProps {
  assignments: FinalAssignment[];
  createAssignment?: (assignment: FinalAssignment | FinalAssignment[]) => void;
  loading?: boolean;
  markAssignment?: (id: string, status: AssignmentStatus) => void;
  selectedCourseId: string;
  showConfetti?: boolean;
  showDateHeadings: boolean;
  skeleton?: boolean;
  weekKey: string; // unique key value for same headings between different weeks
}

/*
  Renders all unfinished assignments
*/
export default function TaskList({
  assignments,
  createAssignment,
  loading = false,
  markAssignment,
  selectedCourseId = '',
  showDateHeadings,
  showConfetti = true,
  skeleton,
  weekKey,
}: TaskListProps): JSX.Element {
  type TabType = 'Unfinished' | 'Completed';
  const [confetti, setConfetti] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('Unfinished');
  const [viewingMore, setViewingMore] = useState(false);
  function processRenderList(
    assignments: FinalAssignment[],
    tab: TabType,
    selectedCourseId: string,
    viewingMore: boolean,
    showDateHeadings: boolean
  ) {
    const selected = useSelectedCourse(selectedCourseId, assignments);
    const filtered = filterByTab(tab, selected);
    const sorted = sortByTab(tab, filtered);
    const renderedTasks = cutAssignmentList(!viewingMore, 4, sorted);
    const headings = useHeadings(tab, renderedTasks);
    const allRendered = Object.keys(headings).reduce<
      (FinalAssignment | string)[]
    >((prev, curr) => {
      let nxt = prev;
      if (showDateHeadings && headings[curr].length > 0) nxt = nxt.concat(curr);
      nxt = nxt.concat(headings[curr]);
      return nxt;
    }, []);
    return [allRendered, sorted as FinalAssignment[]];
  }

  const [unfinishedList, allUnfinishedList] = useMemo(
    () =>
      skeleton
        ? [[], []]
        : processRenderList(
            assignments,
            'Unfinished',
            selectedCourseId,
            viewingMore,
            showDateHeadings
          ),
    [assignments, skeleton, selectedCourseId, viewingMore, showDateHeadings]
  );

  const [completedList, allCompletedList] = useMemo(
    () =>
      skeleton
        ? [[], []]
        : processRenderList(
            assignments,
            'Completed',
            selectedCourseId,
            viewingMore,
            showDateHeadings
          ),
    [assignments, selectedCourseId, skeleton, viewingMore, showDateHeadings]
  );

  const allList: Record<TabType, FinalAssignment[]> = {
    Unfinished: allUnfinishedList as FinalAssignment[],
    Completed: allCompletedList as FinalAssignment[],
  };

  function handleViewMoreClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setViewingMore(!viewingMore);
  }

  const viewMoreText = !viewingMore
    ? `View ${allList[currentTab].length - 4} more`
    : 'View less';

  const noneText = 'None';

  function markAssignmentFunc(
    id: string,
    tab: TabType,
    status: AssignmentStatus,
    mark?: typeof markAssignment
  ) {
    if (!mark)
      return () => {
        console.log('Failed to mark as complete');
      };
    else if (tab === 'Unfinished') {
      return () => {
        setTimeout(() => {
          setConfetti(true);
          setTimeout(() => {
            stopConfetti();
          }, 100);
        }, 300);

        mark(id, AssignmentStatus.COMPLETE);
      };
    } else {
      return () => mark(id, status);
    }
  }

  function stopConfetti() {
    setConfetti(false);
  }

  interface TaskCardTransitionProps {
    key: number;
    data: FinalAssignment;
    state: TransitionState;
  }

  const assignmentToTaskCard = (
    tab: TabType,
    { key, data: assignment, state }: TaskCardTransitionProps
  ) => (
    <TaskCard
      color={assignment.color}
      complete={assignmentIsDone(assignment)}
      course_name={assignment.course_name}
      due_at={assignment.due_at}
      graded={assignment.graded}
      graded_at={assignment.graded_at}
      html_url={assignment.html_url}
      key={key}
      markComplete={markAssignmentFunc(
        assignment.id,
        tab,
        AssignmentStatus.UNFINISHED,
        markAssignment
      )}
      markDeleted={markAssignmentFunc(
        assignment.id,
        tab,
        AssignmentStatus.DELETED,
        markAssignment
      )}
      name={assignment.name}
      needs_grading_count={assignment.needs_grading_count}
      points_possible={assignment.points_possible}
      submitted={assignment.submitted}
      transitionState={state}
      type={assignment.type}
    />
  );

  interface HeadingTransitionProps {
    key: string;
    data: string;
    state: TransitionState;
  }

  const headingToComponent = ({
    key,
    data: heading,
    state,
  }: HeadingTransitionProps) => (
    <HeadingGroup heading={heading} key={key} transitionState={state} />
  );

  function dataToComponentFunc(tab: TabType) {
    return ({
      key,
      data,
      state,
    }: {
      key: string | number;
      data: FinalAssignment | string;
      state: TransitionState;
    }) => {
      if (typeof data === 'string')
        return headingToComponent({
          key,
          data,
          state,
        } as HeadingTransitionProps);
      else
        return assignmentToTaskCard(tab, {
          key,
          data,
          state,
        } as TaskCardTransitionProps);
    };
  }

  function startTransition() {
    return {
      height: 0,
      opacity: 0,
    };
  }
  function enterTransition() {
    return {
      height: [65],
      opacity: [1],
      timing: { duration: 500, ease: easeQuadInOut },
    };
  }
  function leaveTransition() {
    return {
      height: [0],
      opacity: [0],
      timing: { duration: 300, ease: easeQuadInOut },
    };
  }
  function keyAccess(a: FinalAssignment | string) {
    return typeof a === 'string' ? a + '-' + weekKey : a.id;
  }

  const darkMode = useContext(DarkContext);

  if (skeleton)
    return (
      <ListWrapper>
        <SubTabs
          dark={darkMode}
          setTaskListState={setCurrentTab}
          taskListState={currentTab}
        />
        <ListContainer>
          <TaskCard skeleton />
          <TaskCard skeleton />
          <TaskCard skeleton />
          <TaskCard skeleton />
        </ListContainer>
      </ListWrapper>
    );
  return (
    <ListWrapper>
      <SubTabs
        dark={darkMode}
        setTaskListState={setCurrentTab}
        taskListState={currentTab}
      />
      {showConfetti && (
        <ConfettiWrapper>
          <Confetti
            active={confetti}
            config={{
              elementCount: 15,
              stagger: 10,
              startVelocity: 20,
            }}
          />
        </ConfettiWrapper>
      )}
      <HideDiv visible={currentTab === 'Unfinished'}>
        <ListContainer>
          <NodeGroup
            data={loading ? [] : unfinishedList}
            enter={enterTransition}
            keyAccessor={keyAccess}
            leave={leaveTransition}
            start={startTransition}
          >
            {(nodes) => <>{nodes.map(dataToComponentFunc('Unfinished'))}</>}
          </NodeGroup>
          {(allList['Unfinished'].length <= 4 || viewingMore) && (
            <CreateTaskCard
              onSubmit={createAssignment}
              selectedCourse={selectedCourseId}
            />
          )}
        </ListContainer>
      </HideDiv>

      <HideDiv visible={currentTab === 'Completed'}>
        <ListContainer>
          <NodeGroup
            data={loading ? [] : completedList}
            enter={enterTransition}
            keyAccessor={keyAccess}
            leave={leaveTransition}
            start={startTransition}
          >
            {(nodes) => <>{nodes.map(dataToComponentFunc('Completed'))}</>}
          </NodeGroup>
          {completedList.length === 0 && <span>{noneText}</span>}
        </ListContainer>
      </HideDiv>
      {allList[currentTab].length > 4 && (
        <ViewMore href="#" onClick={handleViewMoreClick}>
          {viewMoreText}
        </ViewMore>
      )}
    </ListWrapper>
  );
}
