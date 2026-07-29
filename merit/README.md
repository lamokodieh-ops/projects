# Merit — Course & GPA Tracker

A menu-driven **C++17** terminal app for tracking courses, assignments, and credit-weighted GPA. Built with a clean OOP design (`Grade`, `Course`, `GradeManager`) and file-based persistence.

## Features

- Add, view, edit, and delete courses
- Add, edit, and delete assignments / grades (optional weights)
- Automatic course averages (weighted or unweighted)
- Overall GPA on a 4.0 scale with letter-grade conversion
- Save / load session data (`merit_data.txt`)
- Export to CSV for spreadsheets

## Requirements

A C++17 compiler:

- **Windows:** [MinGW-w64](https://www.mingw-w64.org/) / MSYS2, Clang, or MSVC
- **macOS:** `xcode-select --install`
- **Linux:** `sudo apt install build-essential` (or equivalent)

## Build & run

```bash
cd merit

# With Make
make
./merit              # macOS / Linux
# merit.exe          # Windows (MinGW)

# Or compile directly
g++ -std=c++17 -Wall -Wextra -o merit main.cpp Grade.cpp Course.cpp GradeManager.cpp
./merit
```

### First use

1. Add a course (main menu `2`)
2. Select it (`3`) and add grades
3. Check GPA (`5`) or the detailed report (`6`)
4. Save (`7`) before exiting

## GPA scale

| Percentage | Letter | GPA |
|------------|--------|-----|
| 97–100 | A+ | 4.0 |
| 93–96 | A | 4.0 |
| 90–92 | A- | 3.7 |
| 87–89 | B+ | 3.3 |
| 83–86 | B | 3.0 |
| 80–82 | B- | 2.7 |
| … | … | … |
| 0–59 | F | 0.0 |

Overall GPA = Σ(course GPA × credits) / Σ(credits) for courses that have grades.

## Display / demo notes

This is a **CLI app**, not a website. GitHub Pages cannot run the C++ binary.

**Browser recreation (no setup):** https://lamokodieh-ops.github.io/projects/merit/

That page mirrors the menu flow in JavaScript with `localStorage` (not the compiled program). Reviewers can still clone and run the real C++ app with the commands above.

## Clean build artifacts

```bash
make clean
```

Generated files (`merit_data.txt`, binaries, exports) are gitignored.

---

Part of the [lamokodieh-ops/projects](https://github.com/lamokodieh-ops/projects) portfolio.
