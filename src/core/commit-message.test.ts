import { describe, expect, it } from "vitest";
import { buildCommitMessage } from "./commit-message.js";
import type { AgentOutput } from "./agents/types.js";

type CommitMessageTestOutput = AgentOutput & {
  type?: unknown;
  scope?: unknown;
};

function commitMessageOutput(output: CommitMessageTestOutput): AgentOutput {
  return output;
}

describe("buildCommitMessage", () => {
  it("renders the default commit subject without GitHub issue markers", () => {
    const message = buildCommitMessage(undefined, {
      success: true,
      summary: "add retry coverage",
      key_changes_made: [],
      key_learnings: [],
    });

    expect(message).toBe("add retry coverage");
  });

  it("renders a Conventional Commits header with a scope", () => {
    const message = buildCommitMessage(
      { preset: "conventional" },
      commitMessageOutput({
        success: true,
        summary: "handle empty output",
        key_changes_made: [],
        key_learnings: [],
        type: "fix",
        scope: "core",
      }),
    );

    expect(message).toBe("fix(core): handle empty output");
  });

  it("renders a Conventional Commits header without a scope", () => {
    const message = buildCommitMessage(
      { preset: "conventional" },
      commitMessageOutput({
        success: true,
        summary: "refresh docs",
        key_changes_made: [],
        key_learnings: [],
        type: "docs",
        scope: "",
      }),
    );

    expect(message).toBe("docs: refresh docs");
  });

  it("falls back to configured field defaults when output omits them", () => {
    const message = buildCommitMessage(
      { preset: "conventional" },
      {
        success: true,
        summary: "tidy internal naming",
        key_changes_made: [],
        key_learnings: [],
      },
    );

    expect(message).toBe("chore: tidy internal naming");
  });

  it("falls back to the default Conventional Commits type when output provides an invalid type", () => {
    const message = buildCommitMessage(
      { preset: "conventional" },
      commitMessageOutput({
        success: true,
        summary: "tidy internal naming",
        key_changes_made: [],
        key_learnings: [],
        type: "wip",
      }),
    );

    expect(message).toBe("chore: tidy internal naming");
  });

  it("collapses newlines in rendered headers", () => {
    const message = buildCommitMessage(
      { preset: "conventional" },
      commitMessageOutput({
        success: true,
        summary: "add parser\nwith extra spacing",
        key_changes_made: [],
        key_learnings: [],
        type: "feat",
      }),
    );

    expect(message).toBe("feat: add parser with extra spacing");
  });

  it("falls back to a non-empty subject when the summary is blank", () => {
    const output = commitMessageOutput({
      success: true,
      summary: "  \n ",
      key_changes_made: [],
      key_learnings: [],
      type: "fix",
    });

    expect(buildCommitMessage(undefined, output)).toBe("update");
    expect(buildCommitMessage({ preset: "conventional" }, output)).toBe(
      "fix: update",
    );
  });
});
