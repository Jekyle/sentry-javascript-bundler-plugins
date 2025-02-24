/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import { execSync } from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });

  const map = JSON.parse(output) as Record<string, string>;

  // There should be only one key in the map
  expect(Object.values(map)).toHaveLength(1);
  // The value should be the expected metadata
  expect(Object.values(map)).toEqual([{ team: "frontend" }]);
}

describe("metadata injection", () => {
  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack4", "bundle.js"));
  });

  test("webpack 5 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack5", "bundle.js"));
  });
});
