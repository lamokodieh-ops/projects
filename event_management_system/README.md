# Event Management System

A menu-driven **C** terminal application for managing personal events (birthdays, anniversaries, and more) with simple file-based persistence.

## Features

- Create an account and log in
- Add, edit, and delete events
- Filter by category or date
- View recent / upcoming events
- Data saved in local binary files (`credentials.bin`, `events.bin`)

## Requirements

A C compiler:

- **Windows:** [MinGW-w64](https://www.mingw-w64.org/) or MSVC
- **macOS:** `xcode-select --install`
- **Linux:** `sudo apt install build-essential` (or equivalent)

## Build & run

```bash
cd event_management_system

# With Make
make
./event_manager        # macOS / Linux
# event_manager.exe    # Windows (MinGW)

# Or compile directly
gcc -Wall -Wextra -o event_manager event_manager.c
./event_manager
```

### First use

1. Run the program and create a username/password
2. Exit, then run again and log in
3. Use the menu (`0`–`6`) to manage events

## Documentation

| File | Contents |
|------|----------|
| `User Guide Documentation.pdf` | How to use the app |
| `Developer Documentation.pdf` | Modules and design notes |

## Display / demo notes

This is a **CLI app**, not a website. GitHub Pages cannot run it.

For portfolio display:

1. Record a short terminal demo (GIF or Loom)
2. Link that recording from your resume / gallery page
3. Reviewers can clone and run locally with the commands above

## Clean build artifacts

```bash
make clean
```

Generated files (`*.bin`, `event_manager`, `*.exe`) are gitignored.
