import { render, screen, fireEvent } from "@testing-library/react";
import { AnimatedMochi } from "./AnimatedMochi";
import { MOCHI_ENTER, MOCHI_LOOPS } from "@/lib/mochi-animation.generated";

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const sheetOf = (el: HTMLElement) => el.querySelector<HTMLElement>("[data-mochi-sheet]")!;

describe("AnimatedMochi", () => {
  beforeEach(() => mockReducedMotion(false));

  it("sets the frame and timing variables for a mood's loop", () => {
    const { container } = render(<AnimatedMochi mood="angry" scale={8} />);
    const root = container.firstElementChild as HTMLElement;
    const s = MOCHI_LOOPS.angry;
    expect(root.style.getPropertyValue("--mochi-px-base")).toBe("2px");
    // explicit box (globals.css: width/height = box * --mochi-px), so nothing shifts on load
    expect(root).toHaveClass("mochi-anim");
    expect(root.style.getPropertyValue("--mochi-box-w")).toBe(String(s.frameWidth));
    expect(root.style.getPropertyValue("--mochi-box-h")).toBe(String(s.frameHeight));
    const sheet = sheetOf(root);
    expect(sheet.dataset.mochiSheet).toBe("loop");
    expect(sheet.style.getPropertyValue("--mochi-src")).toBe(`url("${s.src}")`);
    expect(sheet.style.getPropertyValue("--mochi-n")).toBe(String(s.frames));
    expect(sheet.style.getPropertyValue("--mochi-fw")).toBe(String(s.frameWidth));
    expect(sheet.style.getPropertyValue("--mochi-fh")).toBe(String(s.frameHeight));
    expect(sheet.style.getPropertyValue("--mochi-dur")).toBe(`${s.durationMs}ms`);
    expect(sheet.style.getPropertyValue("--mochi-iter")).toBe("infinite");
    expect(sheet.style.getPropertyValue("--mochi-rest")).toBe(String(s.restFrame));
  });

  it("is an image named by title, else hidden from assistive tech", () => {
    const { rerender, container } = render(<AnimatedMochi mood="done" title="Mochi waving" />);
    expect(screen.getByRole("img", { name: "Mochi waving" })).toBeInTheDocument();
    rerender(<AnimatedMochi mood="done" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("plays the entrance once and reports its end", () => {
    const onEnterEnd = vi.fn();
    const { container } = render(<AnimatedMochi mood="done" phase="enter" onEnterEnd={onEnterEnd} />);
    const sheet = sheetOf(container.firstElementChild as HTMLElement);
    expect(sheet.dataset.mochiSheet).toBe("enter");
    expect(sheet.style.getPropertyValue("--mochi-src")).toBe(`url("${MOCHI_ENTER.src}")`);
    expect(sheet.style.getPropertyValue("--mochi-iter")).toBe("1");
    expect(sheet.style.getPropertyValue("--mochi-n")).toBe(String(MOCHI_ENTER.frames));
    expect(onEnterEnd).not.toHaveBeenCalled();
    fireEvent.animationEnd(sheet);
    expect(onEnterEnd).toHaveBeenCalledTimes(1);
  });

  it("keeps the layout box at the loop size during the entrance (no layout shift)", () => {
    const { container } = render(<AnimatedMochi mood="done" phase="enter" scale={6} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--mochi-px-base")).toBe("1.5px");
    expect(root.style.getPropertyValue("--mochi-box-h")).toBe(String(MOCHI_LOOPS.done.frameHeight));
  });

  it("under reduced motion shows the resting loop frame and still ends the entrance", () => {
    mockReducedMotion(true);
    const onEnterEnd = vi.fn();
    const { container } = render(<AnimatedMochi mood="done" phase="enter" onEnterEnd={onEnterEnd} />);
    const sheet = sheetOf(container.firstElementChild as HTMLElement);
    expect(sheet.dataset.mochiSheet).toBe("static");
    expect(sheet.style.getPropertyValue("--mochi-src")).toBe(`url("${MOCHI_LOOPS.done.src}")`);
    expect(sheet.style.getPropertyValue("--mochi-rest")).toBe(String(MOCHI_LOOPS.done.restFrame));
    expect(onEnterEnd).toHaveBeenCalledTimes(1);
  });

  it("works where matchMedia is missing", () => {
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia;
    expect(() => render(<AnimatedMochi mood="calm" />)).not.toThrow();
  });
});
