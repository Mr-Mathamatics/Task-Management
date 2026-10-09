export type Priority = "Low" | "Medium" | "High";
export type Task = {
  id: string; title: string; description: string; completed: boolean;
  priority: Priority; dueDate: string; createdAt: number;
};
export type DueFilter = "All dates" | "Due today" | "Upcoming" | "Overdue";
export type SortOption = "Newest first" | "Due date" | "Priority";

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isOverdue(task: Task, now = new Date()): boolean {
  return Boolean(task.dueDate && !task.completed && task.dueDate < localDateKey(now));
}

export function filterAndSortTasks(
  tasks: Task[],
  options: { search?: string; status?: "All tasks" | "Active" | "Completed"; priority?: Priority | "All"; due?: DueFilter; sort?: SortOption; now?: Date } = {},
): Task[] {
  const { search = "", status = "All tasks", priority = "All", due = "All dates", sort = "Newest first", now = new Date() } = options;
  const today = localDateKey(now);
  const query = search.trim().toLowerCase();
  const priorityRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

  return tasks.filter((task) => {
    if (status === "Active" && task.completed) return false;
    if (status === "Completed" && !task.completed) return false;
    if (priority !== "All" && task.priority !== priority) return false;
    if (query && !`${task.title} ${task.description}`.toLowerCase().includes(query)) return false;
    if (due === "Due today" && (task.completed || task.dueDate !== today)) return false;
    if (due === "Upcoming" && (task.completed || !task.dueDate || task.dueDate <= today)) return false;
    if (due === "Overdue" && !isOverdue(task, now)) return false;
    return true;
  }).sort((a, b) => {
    // Keep unfinished work above completed work for every sort mode.
    const completionOrder = Number(a.completed) - Number(b.completed);
    if (completionOrder) return completionOrder;
    if (sort === "Due date") {
      if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate) || b.createdAt - a.createdAt;
    }
    if (sort === "Priority") {
      return priorityRank[a.priority] - priorityRank[b.priority] || b.createdAt - a.createdAt;
    }
    return b.createdAt - a.createdAt;
  });
}
