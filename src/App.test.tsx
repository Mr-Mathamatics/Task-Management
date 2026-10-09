import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(() => { cleanup(); localStorage.clear(); });
beforeEach(() => { localStorage.clear(); });

describe("task manager accessibility and interactions", () => {
  it("opens the create-task dialog and focuses the title field", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /new task/i }));
    expect(screen.getByRole("dialog", { name: /create a task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toHaveFocus();
  });

  it("closes the dialog on Escape and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<App />);
    const opener = screen.getByRole("button", { name: /new task/i });
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("shows a validation message when the task title is blank", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /new task/i }));
    await user.click(screen.getByRole("button", { name: /create task/i }));
    expect(screen.getByText(/give your task a title/i)).toBeInTheDocument();
  });

  it("creates a task and announces the updated task count", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /new task/i }));
    await user.type(screen.getByLabelText(/task title/i), "Write accessible UI tests");
    await user.click(screen.getByRole("button", { name: /create task/i }));
    expect(await screen.findByRole("heading", { name: "Write accessible UI tests" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/showing 4 of 4 tasks/i);
  });
});
