const fs = require("node:fs");
const path = require("node:path");

const target = path.join(
  process.cwd(),
  "components",
  "Calendar",
  "WorkModeSheet.tsx"
);

const source = fs.readFileSync(target, "utf8");

const oldBlock = `
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={applyAndClose}
                  className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  적용
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
`;

const newBlock = `
            </div>
          ) : null}

          {((draft as any).type === "DAY" || (draft as any).type === "SHIFT") ? (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={applyAndClose}
                className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
              >
                적용
              </button>
            </div>
          ) : null}
        </div>
      </div>
`;

if (source.includes(newBlock)) {
  console.log("Work mode apply button patch already applied.");
  process.exit(0);
}

if (!source.includes(oldBlock)) {
  throw new Error("WorkModeSheet apply button target block was not found.");
}

fs.writeFileSync(target, source.replace(oldBlock, newBlock), "utf8");
console.log("Moved work mode apply button outside the shift-only block.");
