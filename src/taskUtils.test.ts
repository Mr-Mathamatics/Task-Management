import { describe, expect, it } from "vitest";
import { filterAndSortTasks, isOverdue, type Task } from "./taskUtils";

const now = new Date(2026, 9, 9, 12); // local time: October 9, 2026
const tasks: Task[] = [
  { id: "late", title: "Late task", description: "", completed: false, priority: "Low", dueDate: "2026-10-08", createdAt: 1 },
  { id: "today", title: "Today task", description: "write tests", completed: false, priority: "High", dueDate: "2026-10-09", createdAt: 2 },
  { id: "future", title: "Future task", description: "", completed: false, priority: "Medium", dueDate: "2026-10-12", createdAt: 3 },
  { id: "done-late", title: "Finished late task", description: "", completed: true, priority: "High", dueDate: "2026-10-01", createdAt: 4 },
  { id: "no-date", title: "No date", description: "", completed: false, priority: "Low", dueDate: "", createdAt: 5 },
];

describe("task filtering and sorting", () => {
  it("identifies overdue unfinished tasks but excludes completed tasks", () => {
    expect(isOverdue(tasks[0], now)).toBe(true);
    expect(isOverdue(tasks[3], now)).toBe(false);
  });
  it("filters due today using the local calendar date", () => {
    expect(filterAndSortTasks(tasks, { due: "Due today", now }).map((t) => t.id)).toEqual(["today"]);
  });
  it("filters overdue and upcoming tasks without including completed work", () => {
    expect(filterAndSortTasks(tasks, { due: "Overdue", now }).map((t) => t.id)).toEqual(["late"]);
    expect(filterAndSortTasks(tasks, { due: "Upcoming", now }).map((t) => t.id)).toEqual(["future"]);
  });
  it("sorts by priority while keeping active tasks before completed tasks", () => {
    expect(filterAndSortTasks(tasks, { sort: "Priority", now }).map((t) => t.id)).toEqual(["today", "future", "no-date", "late", "done-late"]);
  });
  it("searches title and description without case sensitivity", () => {
    expect(filterAndSortTasks(tasks, { search: "WRITE TESTS", now }).map((t) => t.id)).toEqual(["today"]);
  });
  it("places tasks without due dates after dated tasks when sorting by due date", () => {
    expect(filterAndSortTasks(tasks, { sort: "Due date", now }).map((t) => t.id)).toEqual(["late", "today", "future", "no-date", "done-late"]);
  });
});
