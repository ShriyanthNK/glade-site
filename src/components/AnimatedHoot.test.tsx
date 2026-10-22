import { render, screen, fireEvent } from "@testing-library/react";
import { AnimatedHoot } from "./AnimatedHoot";
import { HOOT_ENTER, HOOT_LOOPS } from "@/lib/hoot-animation.generated";

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const sheetOf = (el: HTMLElement) => el.querySelector<HTMLElement>("[data-hoot-sheet]")!;

describe("AnimatedHoot", () => {
  beforeEach(() => mockReducedMotion(false));

  it("sets the frame and timing variables for a mood's loop", () => {
    const { container } = render(<AnimatedHoot mood="angry" scale={8} />);
    const root = container.firstElementChild as HTMLElement;
    const s = HOOT_LOOPS.angry;
    expect(root.style.getPropertyValue("--hoot-px-base")).toBe("2px");
    // explicit box (globals.css: width/height = box * --hoot-px), so nothing shifts on load
    expect(root).toHaveClass("hoot-anim");
    expect(root.style.getPropertyValue("--hoot-box-w")).toBe(String(s.frameWidth));
    expect(root.style.getPropertyValue("--hoot-box-h")).toBe(String(s.frameHeight));
    const sheet = sheetOf(root);
    expect(sheet.dataset.hootSheet).toBe("loop");
    expect(sheet.style.getPropertyValue("--hoot-src")).toBe(`url("${s.src}")`);
    expect(sheet.style.getPropertyValue("--hoot-n")).toBe(String(s.frames));
    expect(sheet.style.getPropertyValue("--hoot-fw")).toBe(String(s.frameWidth));
    expect(sheet.style.getPropertyValue("--hoot-fh")).toBe(String(s.frameHeight));
    expect(sheet.style.getPropertyValue("--hoot-dur")).toBe(`${s.durationMs}ms`);
    expect(sheet.style.getPropertyValue("--hoot-iter")).toBe("infinite");
    expect(sheet.style.getPropertyValue("--hoot-rest")).toBe(String(s.restFrame));
  });

  it("is an image named by title, else hidden from assistive tech", () => {
    const { rerender, container } = render(<AnimatedHoot mood="done" title="Hoot waving" />);
    expect(screen.getByRole("img", { name: "Hoot waving" })).toBeInTheDocument();
    rerender(<AnimatedHoot mood="done" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("plays the entrance once and reports its end", () => {
    const onEnterEnd = vi.fn();
    const { container } = render(<AnimatedHoot mood="done" phase="enter" onEnterEnd={onEnterEnd} />);
    const sheet = sheetOf(container.firstElementChild as HTMLElement);
    expect(sheet.dataset.hootSheet).toBe("enter");
    expect(sheet.style.getPropertyValue("--hoot-src")).toBe(`url("${HOOT_ENTER.src}")`);
    expect(sheet.style.getPropertyValue("--hoot-iter")).toBe("1");
    expect(sheet.style.getPropertyValue("--hoot-n")).toBe(String(HOOT_ENTER.frames));
    expect(onEnterEnd).not.toHaveBeenCalled();
    fireEvent.animationEnd(sheet);
    expect(onEnterEnd).toHaveBeenCalledTimes(1);
  });

  it("keeps the layout box at the loop size during the entrance (no layout shift)", () => {
    const { container } = render(<AnimatedHoot mood="done" phase="enter" scale={6} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hoot-px-base")).toBe("1.5px");
    expect(root.style.getPropertyValue("--hoot-box-h")).toBe(String(HOOT_LOOPS.done.frameHeight));
  });

  it("under reduced motion shows the resting loop frame and still ends the entrance", () => {
    mockReducedMotion(true);
    const onEnterEnd = vi.fn();
    const { container } = render(<AnimatedHoot mood="done" phase="enter" onEnterEnd={onEnterEnd} />);
    const sheet = sheetOf(container.firstElementChild as HTMLElement);
    expect(sheet.dataset.hootSheet).toBe("static");
    expect(sheet.style.getPropertyValue("--hoot-src")).toBe(`url("${HOOT_LOOPS.done.src}")`);
    expect(sheet.style.getPropertyValue("--hoot-rest")).toBe(String(HOOT_LOOPS.done.restFrame));
    expect(onEnterEnd).toHaveBeenCalledTimes(1);
  });

  it("works where matchMedia is missing", () => {
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia;
    expect(() => render(<AnimatedHoot mood="calm" />)).not.toThrow();
  });
});
