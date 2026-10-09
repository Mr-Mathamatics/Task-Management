import { FormEvent, useEffect, useState } from "react";
import { filterAndSortTasks, isOverdue, type Priority, type Task, type DueFilter, type SortOption } from "./taskUtils";
import {
  Activity, CalendarDays, Check, CheckCheck, ChevronDown, Circle,
  ClipboardList, Clock3, Filter, LayoutDashboard, ListTodo, Plus,
  Search, Sparkles, Target, Trash2, X, Pencil, AlertCircle
} from "lucide-react";

type FilterType = "All tasks" | "Active" | "Completed";

const STORAGE_KEY = "taskflow.tasks.v1";
const starterTasks: Task[] = [
  {
    id: "welcome-1",
    title: "Plan the week ahead",
    description: "Choose the three most important outcomes for this week.",
    completed: false,
    priority: "High",
    dueDate: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "welcome-2",
    title: "Review project tasks",
    description: "Check progress and note anything that is blocked.",
    completed: false,
    priority: "Medium",
    dueDate: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "welcome-3",
    title: "Take a proper lunch break",
    description: "Step away from the screen and recharge.",
    completed: true,
    priority: "Low",
    dueDate: "",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
];

function readTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Task[]) : starterTasks;
  } catch {
    return starterTasks;
  }
}

function formatDueDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}


export default function App() {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [filter, setFilter] = useState<FilterType>("All tasks");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [dueFilter, setDueFilter] = useState<DueFilter>("All dates");
  const [sortOption, setSortOption] = useState<SortOption>("Newest first");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((task) => isOverdue(task)).length;

  const visibleTasks = filterAndSortTasks(tasks, {
    search,
    status: filter,
    priority: priorityFilter,
    due: dueFilter,
    sort: sortOption,
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
    setFormError("");
    setShowForm(false);
  }

  function openNewTask() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEditTask(task: Task) {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEditingId(task.id);
    setFormError("");
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Give your task a title before saving.");
      return;
    }

    if (editingId) {
      setTasks((current) => current.map((task) =>
        task.id === editingId
          ? { ...task, title: cleanTitle, description: description.trim(), priority, dueDate }
          : task
      ));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        description: description.trim(),
        completed: false,
        priority,
        dueDate,
        createdAt: Date.now(),
      };
      setTasks((current) => [newTask, ...current]);
      setFilter("All tasks");
    }
    resetForm();
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><CheckCheck size={21} strokeWidth={2.6} /></div>
          <span>taskflow<span className="brand-period">.</span></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Task filters">
          <button className={`nav-item ${filter === "All tasks" ? "selected" : ""}`} onClick={() => setFilter("All tasks")}>
            <LayoutDashboard size={18} /><span>All tasks</span><span className="nav-count">{tasks.length}</span>
          </button>
          <button className={`nav-item ${filter === "Active" ? "selected" : ""}`} onClick={() => setFilter("Active")}>
            <Circle size={18} /><span>In progress</span><span className="nav-count">{activeCount}</span>
          </button>
          <button className={`nav-item ${filter === "Completed" ? "selected" : ""}`} onClick={() => setFilter("Completed")}>
            <Check size={18} /><span>Completed</span><span className="nav-count">{completedCount}</span>
          </button>
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">YOUR FOCUS</div>
        <div className="focus-card">
          <div className="focus-icon"><Target size={18} /></div>
          <div className="focus-title">Weekly progress</div>
          <div className="focus-subtitle">You're building momentum.</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="progress-meta"><span>{completedCount} of {tasks.length} done</span><strong>{progress}%</strong></div>
        </div>

        <div className="sidebar-bottom">
          <div className="avatar">TF</div>
          <div className="profile-copy"><strong>My workspace</strong><span>Personal plan</span></div>
          <button className="icon-button profile-menu" aria-label="Workspace options" title="Workspace options"><ChevronDown size={16} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>My tasks</strong></div>
          <div className="topbar-right"><span className="today-label"><CalendarDays size={15} /> {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><div className="top-avatar">J</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL DASHBOARD</div>
              <h1>Make room for <span>great work.</span></h1>
              <p className="page-subtitle">Small steps every day add up to big things.</p>
            </div>
            <button className="primary-button" onClick={openNewTask}><Plus size={18} /> New task</button>
          </section>

          <section className="stats-grid" aria-label="Task statistics">
            <div className="stat-card">
              <div className="stat-icon purple"><ListTodo size={19} /></div>
              <div className="stat-label">Total tasks</div>
              <div className="stat-number">{tasks.length}</div>
              <div className="stat-foot"><span className="stat-dot purple-dot" /> Across your workspace</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Activity size={19} /></div>
              <div className="stat-label">In progress</div>
              <div className="stat-number">{activeCount}</div>
              <div className="stat-foot"><span className="stat-dot blue-dot" /> Ready for your focus</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCheck size={19} /></div>
              <div className="stat-label">Completed</div>
              <div className="stat-number">{completedCount}</div>
              <div className="stat-foot"><span className="stat-dot green-dot" /> Look at you go</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Clock3 size={19} /></div>
              <div className="stat-label">Overdue</div>
              <div className="stat-number">{overdueCount}</div>
              <div className="stat-foot"><span className="stat-dot orange-dot" /> Needs a little attention</div>
            </div>
          </section>

          <section className="tasks-panel">
            <div className="panel-heading">
              <div>
                <h2><ClipboardList size={20} /> My tasks</h2>
                <p>Keep your priorities clear and your day moving.</p>
              </div>
              <button className="text-button" onClick={clearCompleted} disabled={completedCount === 0}>Clear completed</button>
            </div>

            <div className="task-toolbar">
              <div className="filter-tabs">
                {(["All tasks", "Active", "Completed"] as FilterType[]).map((item) => (
                  <button key={item} className={`filter-tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
                    {item}<span>{item === "All tasks" ? tasks.length : item === "Active" ? activeCount : completedCount}</span>
                  </button>
                ))}
              </div>
              <div className="toolbar-controls">
                <label className="priority-select-wrap" aria-label="Filter by due date">
                  <CalendarDays size={15} />
                  <select value={dueFilter} onChange={(event) => setDueFilter(event.target.value as DueFilter)}>
                    <option>All dates</option><option>Due today</option><option>Upcoming</option><option>Overdue</option>
                  </select>
                  <ChevronDown size={14} className="select-chevron" />
                </label>
                <label className="priority-select-wrap" aria-label="Sort tasks">
                  <Filter size={15} />
                  <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
                    <option>Newest first</option><option>Due date</option><option>Priority</option>
                  </select>
                  <ChevronDown size={14} className="select-chevron" />
                </label>
                <label className="search-box">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." aria-label="Search tasks" />
                  {search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button>}
                </label>
                <label className="priority-select-wrap" aria-label="Filter by priority">
                  <Filter size={15} />
                  <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Priority | "All")}>
                    <option value="All">Priority</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option>
                  </select>
                  <ChevronDown size={14} className="select-chevron" />
                </label>
              </div>
            </div>

            <div className="task-list">
              {visibleTasks.map((task) => (
                <article key={task.id} className={`task-row ${task.completed ? "is-completed" : ""}`}>
                  <button className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Mark ${task.title} as active` : `Complete ${task.title}`}>
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </button>
                  <div className="task-main">
                    <div className="task-title-line"><h3>{task.title}</h3>{task.completed && <span className="done-pill">Done</span>}</div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}><span />{task.priority}</span>
                      {task.dueDate && <span className={`due-date ${isOverdue(task) ? "overdue" : ""}`}><CalendarDays size={13} />{isOverdue(task) ? "Overdue · " : "Due "}{formatDueDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="icon-button" onClick={() => openEditTask(task)} aria-label={`Edit ${task.title}`} title="Edit task"><Pencil size={15} /></button>
                    <button className="icon-button delete-action" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={15} /></button>
                  </div>
                </article>
              ))}

              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">{search ? <Search size={22} /> : <ClipboardList size={22} />}</div>
                  <h3>{search || priorityFilter !== "All" ? "No matching tasks" : filter === "Completed" ? "Nothing completed yet" : "Your list is clear"}</h3>
                  <p>{search || priorityFilter !== "All" ? "Try changing your search or filters." : "Add a task to turn your plans into progress."}</p>
                  {!search && priorityFilter === "All" && dueFilter === "All dates" && <button className="primary-button small" onClick={openNewTask}><Plus size={16} /> Create a task</button>}
                </div>
              )}
            </div>
            <div className="panel-footer"><span>Showing <strong>{visibleTasks.length}</strong> of <strong>{tasks.length}</strong> tasks</span><span className="footer-note"><span className="live-dot" /> Changes save automatically</span></div>
          </section>

          <div className="bottom-tip"><div className="tip-icon"><Sparkles size={17} /></div><p><strong>A little reminder</strong><span>Progress over perfection. One task at a time.</span></p><div className="tip-decoration">✳</div></div>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm(); }}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header"><div><div className="modal-kicker">{editingId ? "MAKE AN UPDATE" : "A NEW BEGINNING"}</div><h2 id="modal-title">{editingId ? "Edit task" : "Create a task"}</h2><p>Give your next step a clear name.</p></div><button className="icon-button modal-close" onClick={resetForm} aria-label="Close dialog"><X size={19} /></button></div>
            <form onSubmit={handleSubmit}>
              <label className="form-label">Task title <span>*</span><input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setFormError(""); }} placeholder="e.g. Finish the landing page" maxLength={120} /></label>
              <label className="form-label">Description <small>OPTIONAL</small><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a few details to help you get started..." rows={3} maxLength={500} /></label>
              <div className="form-two-col">
                <label className="form-label">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label>
                <label className="form-label">Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
              </div>
              {formError && <div className="form-error"><AlertCircle size={15} />{formError}</div>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={resetForm}>Cancel</button><button type="submit" className="primary-button"><Check size={17} />{editingId ? "Save changes" : "Create task"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}