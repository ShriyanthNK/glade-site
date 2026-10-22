import { render, screen, fireEvent } from "@testing-library/react";
import { MotionLoop } from "./MotionLoop";

function setup(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes("prefers-reduced-motion"), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
}
const props = { src: "/motion/looks.mp4", poster: "/motion/looks-poster.jpg", label: "A picture becomes a pixel scene" };

describe("MotionLoop", () => {
  it("plays a muted looping video with a poster by default", () => {
    setup(false);
    const { container } = render(<MotionLoop {...props} />);
    const v = container.querySelector("video")!;
    expect(v).toBeInTheDocument();
    expect(v.muted).toBe(true);
    expect(v.loop).toBe(true);
    expect(v.getAttribute("poster")).toBe(props.poster);
    expect(v).toHaveAttribute("aria-label", props.label);
    expect(container.querySelector("source")).toHaveAttribute("src", props.src);
  });

  it("shows only the poster, with its description, under reduced motion", () => {
    setup(true);
    const { container } = render(<MotionLoop {...props} />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("img", { name: props.label })).toHaveAttribute("src", props.poster);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("has a pause control that works and says what it will do", () => {
    setup(false);
    render(<MotionLoop {...props} />);
    const btn = screen.getByRole("button", { name: /pause animation/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: /play animation/i })).toHaveAttribute("aria-pressed", "true");
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
