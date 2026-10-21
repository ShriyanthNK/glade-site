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
});
