import React from 'react';
import styled from 'styled-components';
import { Assignment } from '../types';
import { AssignmentIcon, DiscussionIcon, LockedIcon, QuizIcon } from '../icons';
import pointsPossible from '../utils/pointsPossible';

const TaskContainer = styled.div`
    width: 100%;
    height: 65px;
    margin: 5px;
    background-color: inherit;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    &:hover {
      box-shadow: 0 4px 7px rgba(0, 0, 0, 0.3);
    }
    @keyframes canvas-tasks-skeleton-pulse {
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  `,
  TaskInfo = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0px 6px 8px 6px;
    box-sizing: border-box;
    width: 100%;
    font-size: 11px;
    color: var(--ic-brand-font-color-dark-lightened-15);
    overflow-x: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  TaskLink = styled.a`
    color: var(--ic-brand-font-color-dark);
    font-weight: 700;
    font-size: 15px;
    &:hover {
      color: var(--ic-brand-font-color-dark);
    }
    overflow-x: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  TaskLeft = styled.div`
    width: 40px;
    height: 100%;
    border-radius: 4px 0px 0px 4px;
    background-color: ${(props) => props.color};
    padding: 6px;
    padding-bottom: 8px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      cursor: pointer;
    }
  `,
  CourseCodeText = styled.div`
    color: ${(props) => props.color};
    font-weight: 700;
    margin-top: 4px;
    overflow-x: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  TaskDetailsText = styled.div`
    overflow-x: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  SkeletonTitle = styled.div`
    width: 90%;
    height: 12px;
    background-color: #e8e8e8;
    margin: 3px 0px;
    animation: canvas-tasks-skeleton-pulse 1s infinite;
  `,
  SkeletonInfo = styled.div`
    width: 75%;
    height: 12px;
    background-color: #e8e8e8;
    margin: 2px 0px;
    animation: canvas-tasks-skeleton-pulse 1s 0.5s infinite linear both;
  `,
  SkeletonCourseCode = styled.div`
    width: 50%;
    height: 12px;
    background-color: #e8e8e8;
    margin: 2px 0px;
    animation: canvas-tasks-skeleton-pulse 1s 0.5s infinite linear both;
  `;
interface TaskProps {
  assignment: Assignment;
  name: string;
  color: string;
  skeleton?: boolean;
}
/*
    Renders an individual task item
*/

export default function Task({
  assignment,
  name,
  color,
  skeleton,
}: TaskProps): JSX.Element {
  const due_at = new Date(assignment.due_at),
    due_date = due_at.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    due_time = due_at.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  function onClick(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
    window.location.href = assignment.html_url;
  }
  const icon = {
    assignment: AssignmentIcon,
    quiz: QuizIcon,
    discussion: DiscussionIcon,
    locked: LockedIcon,
  };
  let assignmentIcon = icon.assignment;
  if (assignment.locked_for_user) {
    assignmentIcon = icon.locked;
  } else if (
    assignment.is_quiz_assignment ||
    assignment.is_quiz_lti_assignment
  ) {
    assignmentIcon = icon.quiz;
  } else if ('discussion_topic' in assignment) {
    assignmentIcon = icon.discussion;
  }
  const due = 'Due';
  const DueLabel = <strong>{due}</strong>;
  const points = pointsPossible(assignment);
  return (
    <TaskContainer>
      <TaskLeft
        color={(!skeleton ? color : '#e8e8e8') || '000000'}
        onClick={onClick}
      >
        {!skeleton ? assignmentIcon : ''}
      </TaskLeft>
      <TaskInfo>
        <CourseCodeText color={assignment.color}>
          {!skeleton ? name : <SkeletonCourseCode />}
        </CourseCodeText>
        <TaskLink href={assignment.html_url}>
          {!skeleton ? assignment.name : <SkeletonTitle />}
        </TaskLink>
        <TaskDetailsText>
          {!skeleton ? (
            <>
              {DueLabel}
              {` ${due_date} at ${due_time}` +
                (points !== null
                  ? ` \xa0|\xa0 ${points} point${points != 1 ? 's' : ''}`
                  : '')}
            </>
          ) : (
            <SkeletonInfo />
          )}
        </TaskDetailsText>
      </TaskInfo>
    </TaskContainer>
  );
}

TaskLink.displayName = 'TaskLink';
