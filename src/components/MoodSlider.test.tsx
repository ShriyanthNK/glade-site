import { render, screen, fireEvent } from "@testing-library/react";
import { MoodSlider } from "./MoodSlider";
import { THRESHOLDS, MAX_WAIT_SECONDS } from "@/lib/moods";

describe("MoodSlider", () => {
  it("starts calm", () => {
    render(<MoodSlider />);
    expect(screen.getByText("CLAUDE'S WAITING ON YOU")).toBeInTheDocument();
  });

  it("changes mood as the wait grows", () => {
    render(<MoodSlider />);
    const slider = screen.getByRole("slider", { name: /how long claude has waited/i });
    fireEvent.change(slider, { target: { value: String(THRESHOLDS.annoyed) } });
    expect(screen.getByText("STILL WAITING...")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: String(MAX_WAIT_SECONDS) } });
    expect(screen.getByText("HELLOOO? CLAUDE NEEDS YOU")).toBeInTheDocument();
  });

  it("shows the done mood when toggled", () => {
    render(<MoodSlider />);
    fireEvent.click(screen.getByRole("button", { name: /claude finished/i }));
    expect(screen.getByText("CLAUDE'S DONE, YOUR TURN")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("button", { name: /claude finished/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the wait body copy and valuetext", () => {
    render(<MoodSlider />);
    expect(screen.getByText(/Run: npm test --coverage/)).toBeInTheDocument();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "12" } });
    expect(slider).toHaveAttribute("aria-valuetext", "12 seconds");
  });

  it("re-enables the slider when finished is toggled off", () => {
    render(<MoodSlider />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: String(MAX_WAIT_SECONDS) } });
    const btn = screen.getByRole("button", { name: /claude finished/i });
    fireEvent.click(btn);
    expect(slider).toBeDisabled();
    fireEvent.click(btn);
    expect(slider).toBeEnabled();
    expect(screen.getByText("HELLOOO? CLAUDE NEEDS YOU")).toBeInTheDocument();
  });

  it("announces the mood through a single narrow status region", () => {
    render(<MoodSlider />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Claude's waiting on you");
    fireEvent.change(screen.getByRole("slider"), { target: { value: String(MAX_WAIT_SECONDS) } });
    expect(status).toHaveTextContent("Hellooo? Claude needs you");
    fireEvent.click(screen.getByRole("button", { name: /claude finished/i }));
    expect(status).toHaveTextContent("Claude's done, your turn");
    expect(document.querySelector("[aria-live]")).toBeNull();
  });

  it("labels where Hoot changes under the slider", () => {
    render(<MoodSlider />);
    const ticks = [...document.querySelectorAll("[data-tick]")].map((el) => el.textContent);
    expect(ticks).toEqual(["0s waiting", `${THRESHOLDS.annoyed}s annoyed`, `${THRESHOLDS.angry}s angry`, `${MAX_WAIT_SECONDS}s gives up`]);
  });

  it("names the current tier next to the seconds", () => {
    render(<MoodSlider />);
    expect(screen.getByText("0s · waiting")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: String(THRESHOLDS.annoyed) } });
    expect(screen.getByText(`${THRESHOLDS.annoyed}s · annoyed`)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: String(THRESHOLDS.angry) } });
    expect(screen.getByText(`${THRESHOLDS.angry}s · angry`)).toBeInTheDocument();
  });
});
