# Bash Explained: From Basic to Advanced (Like You're 5)

## Table of Contents
1. [What is Bash Really?](#what-is-bash-really)
2. [File Permissions Explained](#file-permissions-explained)
3. [Grep: Your Text Detective](#grep-your-text-detective)
4. [Pipes: The Assembly Line](#pipes-the-assembly-line)
5. [Variables and Environment](#variables-and-environment)
6. [Bash Scripting Fundamentals](#bash-scripting-fundamentals)
7. [Advanced Concepts](#advanced-concepts)
8. [Common Patterns for Developers](#common-patterns-for-developers)
9. [Debugging and Troubleshooting](#debugging-and-troubleshooting)

---

## What is Bash Really?

Think of bash like a **translator between you and your computer**. When you type `ls`, you're not actually speaking computer language - bash translates that into something your computer understands.

### The Shell vs The Terminal
- **Terminal**: The window you see (like a picture frame)
- **Shell**: The program running inside (bash is one type of shell, like zsh, fish, etc.)

It's like the difference between your TV (terminal) and the Netflix app (shell) running on it.

### Why Bash Matters for Developers
As a developer using neovim, you're constantly:
- Running commands (`npm install`, `git commit`)
- Moving files around
- Searching through code
- Running scripts

Bash is the engine making all of this possible.

---

## File Permissions Explained

### The Permission System (Like House Keys)

Imagine every file and folder is a house, and there are three types of people who might want to visit:

1. **Owner** (you) - The person who owns the house
2. **Group** - Your family/roommates 
3. **Others** - Everyone else in the neighborhood

Each of these people can have three types of access:
- **Read (r)** - Can look inside the house
- **Write (w)** - Can rearrange furniture
- **Execute (x)** - Can actually enter and use the house

### Reading Permission Strings

When you run `ls -l`, you see something like:
```
-rw-r--r--  1 james staff  1234 Sep 26 10:30 myfile.txt
drwxr-xr-x  5 james staff   160 Sep 26 10:30 myfolder
```

Let's break down that first part: `-rw-r--r--`

```
-  rw-  r--  r--
│   │   │    │
│   │   │    └── Others: read only
│   │   └────── Group: read only  
│   └────────── Owner: read + write
└─────────────── File type (- = file, d = directory)
```

### Understanding Execute Permission

For **files**: Execute means "can run this as a program"
- Shell scripts need execute permission to run
- Without it, you get "Permission denied"

For **directories**: Execute means "can enter this directory"
- Without execute on a folder, you can't `cd` into it
- Even if you can read the folder contents!

### Changing Permissions with chmod

Think of chmod like **giving out different types of keys**:

```bash
# Give everyone full access (dangerous!)
chmod 777 myfile.txt

# Give owner full access, others read-only (common)
chmod 644 myfile.txt

# Make a script executable
chmod +x myscript.sh

# Remove write access for group and others
chmod go-w myfile.txt
```

#### The Number System Explained
Each digit represents owner/group/others, and each number is the sum of:
- 4 = read
- 2 = write  
- 1 = execute

So `755` means:
- Owner: 7 (4+2+1) = read, write, execute
- Group: 5 (4+1) = read, execute
- Others: 5 (4+1) = read, execute

### Common Permission Patterns

```bash
# Scripts you want to run
chmod 755 script.sh

# Config files (readable but not executable)
chmod 644 config.json

# Private files (only you can read/write)
chmod 600 secrets.txt

# Directories (need execute to enter)
chmod 755 public_folder
chmod 700 private_folder
```

---

## Grep: Your Text Detective

Think of grep as a **super-powered detective** that can search through thousands of files in seconds to find exactly what you're looking for.

### Basic Grep Usage

```bash
# Find all lines containing "function" in a file
grep "function" app.js

# Search case-insensitively
grep -i "ERROR" logfile.txt

# Show line numbers where matches occur
grep -n "TODO" src/*.js
```

### Grep Options Explained

```bash
# -i: Ignore case (ERROR, error, Error all match)
grep -i "error" logfile.txt

# -r: Search recursively through directories
grep -r "console.log" src/

# -v: Show lines that DON'T match (inverse)
grep -v "debug" app.log

# -l: Just show filenames, not the matching lines
grep -l "import React" src/*.js

# -n: Show line numbers
grep -n "function" app.js

# -A 3: Show 3 lines AFTER each match
grep -A 3 "Error:" logfile.txt

# -B 2: Show 2 lines BEFORE each match  
grep -B 2 "crash" logfile.txt

# -C 2: Show 2 lines of CONTEXT (before and after)
grep -C 2 "critical" logfile.txt
```

### Regular Expressions in Grep

Regular expressions are like **super-specific search patterns**:

```bash
# Find lines starting with "Error"
grep "^Error" logfile.txt

# Find lines ending with semicolon
grep ";$" app.js

# Find any line with numbers
grep "[0-9]" data.txt

# Find email addresses (basic pattern)
grep "[a-zA-Z0-9]*@[a-zA-Z0-9]*\." contacts.txt

# Find function definitions (JavaScript)
grep "function [a-zA-Z]*(" src/*.js
```

### Real-World Grep Examples for Developers

```bash
# Find all console.log statements
grep -r "console\.log" src/

# Find all TODO comments
grep -r -i "todo\|fixme\|hack" src/

# Find all imports from a specific library
grep -r "import.*react" src/

# Find all files with errors in logs
grep -l "ERROR\|FATAL" logs/*.log

# Find environment variable usage
grep -r "process\.env" src/

# Find all API endpoints
grep -r "app\.\(get\|post\|put\|delete\)" server/
```

---

## Pipes: The Assembly Line

Think of pipes (`|`) as an **assembly line in a factory**. Each command is a worker that does one specific job, then passes the result to the next worker.

### How Pipes Work

```bash
# Without pipes (clunky)
ls > temp.txt
grep "\.js" temp.txt
wc -l temp.txt
rm temp.txt

# With pipes (elegant!)
ls | grep "\.js" | wc -l
```

This reads as: "List files, then filter for .js files, then count the lines"

### Common Pipe Patterns

```bash
# Find the biggest files
ls -la | sort -k5 -n | tail -5

# Find most common words in a file
cat file.txt | tr ' ' '\n' | sort | uniq -c | sort -nr | head -10

# Find processes using lots of memory
ps aux | sort -k4 -nr | head -10

# Count unique IP addresses in logs
cat access.log | awk '{print $1}' | sort | uniq | wc -l

# Find largest directories
du -h | sort -hr | head -10
```

### Understanding Each Step

Let's break down this complex pipe:
```bash
cat access.log | grep "GET" | awk '{print $7}' | sort | uniq -c | sort -nr | head -10
```

1. `cat access.log` - Read the log file
2. `grep "GET"` - Only keep lines with GET requests
3. `awk '{print $7}'` - Extract the 7th column (URL path)
4. `sort` - Sort the URLs alphabetically  
5. `uniq -c` - Count unique occurrences
6. `sort -nr` - Sort by count, highest first
7. `head -10` - Show top 10 results

Result: "Show me the 10 most requested URLs"

### Useful Commands in Pipes

```bash
# sort: Arrange lines alphabetically or numerically
ls -la | sort -k5 -n  # Sort by 5th column numerically

# uniq: Remove duplicate lines (input must be sorted first)
cat file.txt | sort | uniq

# head/tail: Show first/last N lines
ps aux | head -5     # First 5 processes
ls -la | tail -3     # Last 3 files

# wc: Count words, lines, characters
grep "error" log.txt | wc -l  # Count error lines

# awk: Extract specific columns
ps aux | awk '{print $2, $11}'  # Show PID and command

# sed: Find and replace text
cat file.txt | sed 's/old/new/g'  # Replace all "old" with "new"
```

---

## Variables and Environment

### Variables: Like Labeled Boxes

Think of variables as **labeled storage boxes** where you can keep information:

```bash
# Create a variable (no spaces around =!)
name="James"
project_dir="/Users/james/projects"

# Use a variable (with $)
echo "Hello, $name!"
cd $project_dir

# Variables only exist in current session
echo $name  # Works
exit
echo $name  # Gone!
```

### Environment Variables: The Global Settings

Environment variables are like **global settings** that all programs can see:

```bash
# See all environment variables
env

# Common ones you use
echo $HOME     # Your home directory
echo $PATH     # Where bash looks for commands
echo $USER     # Your username
echo $PWD      # Current directory
```

### Understanding $PATH

`$PATH` is like a **phonebook for commands**. When you type `git`, bash looks through each directory in `$PATH` until it finds the `git` program.

```bash
# See your PATH
echo $PATH

# Typical PATH looks like:
/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin

# Add to PATH temporarily
export PATH="$PATH:/my/custom/bin"

# Add to PATH permanently (in ~/.zshrc or ~/.bashrc)
echo 'export PATH="$PATH:/my/custom/bin"' >> ~/.zshrc
```

### Setting Environment Variables

```bash
# For current session only
export API_KEY="abc123"

# For all future sessions (add to ~/.zshrc)
echo 'export API_KEY="abc123"' >> ~/.zshrc

# Load the changes
source ~/.zshrc
```

### Variable Expansion Tricks

```bash
# Basic expansion
file="app.js"
echo $file        # app.js

# Safe expansion (recommended)
echo ${file}      # app.js

# Default values
echo ${name:-"Anonymous"}  # Use "Anonymous" if name is empty

# String manipulation
file="app.js"
echo ${file%.js}  # Remove .js extension → "app"
echo ${file#app.} # Remove "app." prefix → "js"
```

---

## Bash Scripting Fundamentals

### Creating Your First Script

Think of a bash script as a **recipe that the computer can follow**:

```bash
#!/bin/bash
# This is a comment - the computer ignores this

# Variables
project_name="my-awesome-app"
build_dir="./dist"

# Commands
echo "Building $project_name..."
npm run build
echo "Build complete! Files are in $build_dir"
```

Save this as `build.sh`, then:
```bash
chmod +x build.sh  # Make it executable
./build.sh         # Run it
```

### The Shebang (#!)

The first line `#!/bin/bash` is called a **shebang**. It's like telling the computer: "Use bash to read this recipe"

```bash
#!/bin/bash         # Use bash
#!/usr/bin/env node # Use node
#!/usr/bin/env python3 # Use python
```

### Conditional Logic (if/then/else)

```bash
#!/bin/bash

if [ -f "package.json" ]; then
    echo "This looks like a Node.js project"
    npm install
elif [ -f "requirements.txt" ]; then
    echo "This looks like a Python project"
    pip install -r requirements.txt
else
    echo "Unknown project type"
fi
```

### Common Test Conditions

```bash
# File tests
[ -f "file.txt" ]     # File exists
[ -d "folder" ]       # Directory exists
[ -x "script.sh" ]    # File is executable
[ -r "file.txt" ]     # File is readable

# String tests
[ "$name" = "James" ]     # Strings are equal
[ "$name" != "Bob" ]      # Strings are not equal
[ -z "$name" ]            # String is empty
[ -n "$name" ]            # String is not empty

# Number tests
[ "$count" -eq 5 ]        # Equal to 5
[ "$count" -gt 10 ]       # Greater than 10
[ "$count" -lt 3 ]        # Less than 3
```

### Loops

```bash
# For loop with files
for file in *.js; do
    echo "Processing $file"
    # Do something with each file
done

# For loop with numbers
for i in {1..5}; do
    echo "Number: $i"
done

# While loop
count=1
while [ $count -le 10 ]; do
    echo "Count: $count"
    count=$((count + 1))
done
```

### Functions

```bash
#!/bin/bash

# Define a function
backup_file() {
    local file=$1  # First argument
    local backup_dir=$2  # Second argument
    
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/$(basename $file).bak"
        echo "Backed up $file"
    else
        echo "File $file not found"
    fi
}

# Use the function
backup_file "important.txt" "./backups"
```

### Command Line Arguments

```bash
#!/bin/bash

echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments: $@"
echo "Number of arguments: $#"

# Example usage: ./script.sh hello world
# Output:
# Script name: ./script.sh
# First argument: hello
# Second argument: world
# All arguments: hello world
# Number of arguments: 2
```

---

## Advanced Concepts

### Exit Codes: How Commands Communicate Success

Every command returns an **exit code** (like a report card):
- `0` = Success (A+)
- `1-255` = Various types of failure (F)

```bash
# Check the exit code of the last command
ls /nonexistent
echo $?  # Shows non-zero (failure)

ls /
echo $?  # Shows 0 (success)

# Use in scripts
if git pull; then
    echo "Successfully updated"
else
    echo "Failed to update"
    exit 1  # Exit script with failure
fi
```

### Command Substitution: Using Output as Input

```bash
# Old style (backticks)
current_date=`date`

# New style (preferred)
current_date=$(date)

# Use in commands
echo "Today is $(date)"

# More complex example
files_count=$(ls *.js | wc -l)
echo "Found $files_count JavaScript files"

# In conditionals
if [ $(git status --porcelain | wc -l) -gt 0 ]; then
    echo "You have uncommitted changes"
fi
```

### Redirection: Controlling Input and Output

Think of redirection as **controlling the flow of information**:

```bash
# Send output to file (overwrite)
ls > file_list.txt

# Send output to file (append)
ls >> file_list.txt

# Send errors to file
command_that_fails 2> errors.log

# Send both output and errors to file
command 2>&1 > all_output.log

# Send errors to /dev/null (throw them away)
noisy_command 2>/dev/null

# Use file as input
sort < unsorted_list.txt

# Here documents (multi-line input)
cat << EOF > config.txt
This is a
multi-line
configuration file
EOF
```

### Process Substitution: Advanced Piping

```bash
# Compare output of two commands
diff <(ls dir1) <(ls dir2)

# Use command output as file input
grep "pattern" <(curl -s https://api.example.com/data)
```

### Background Jobs and Process Management

```bash
# Run command in background
long_running_script.sh &

# See background jobs
jobs

# Bring job to foreground
fg %1

# Send job to background
bg %1

# Kill background job
kill %1

# Run command even after logging out
nohup long_script.sh &

# Better: use screen or tmux for persistent sessions
screen -S mysession
# Or
tmux new -s mysession
```

### Arrays (Bash 4+)

```bash
# Create array
files=("app.js" "index.html" "style.css")

# Access elements
echo ${files[0]}  # First element
echo ${files[@]} # All elements
echo ${#files[@]} # Number of elements

# Loop through array
for file in "${files[@]}"; do
    echo "Processing $file"
done

# Add to array
files+=("new_file.txt")
```

---

## Common Patterns for Developers

### Project Setup Script

```bash
#!/bin/bash

project_name=$1

if [ -z "$project_name" ]; then
    echo "Usage: $0 <project_name>"
    exit 1
fi

echo "Creating new project: $project_name"

# Create directory structure
mkdir -p "$project_name"/{src,tests,docs}

# Initialize git
cd "$project_name"
git init

# Create package.json
cat << EOF > package.json
{
  "name": "$project_name",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "test": "jest",
    "start": "node src/index.js"
  }
}
EOF

# Create basic files
touch src/index.js
touch tests/index.test.js
echo "# $project_name" > README.md

echo "Project $project_name created successfully!"
```

### Git Workflow Script

```bash
#!/bin/bash

# Quick commit script
commit_message=$1

if [ -z "$commit_message" ]; then
    echo "Usage: $0 \"commit message\""
    exit 1
fi

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Not in a git repository"
    exit 1
fi

# Show status
echo "Current status:"
git status --short

# Stage all changes
git add .

# Show what will be committed
echo -e "\nChanges to be committed:"
git diff --cached --name-only

# Commit
git commit -m "$commit_message"

# Push if remote exists
if git remote | grep -q origin; then
    echo "Pushing to origin..."
    git push
fi
```

### Log Analysis Script

```bash
#!/bin/bash

log_file=${1:-"/var/log/app.log"}

if [ ! -f "$log_file" ]; then
    echo "Log file $log_file not found"
    exit 1
fi

echo "=== Log Analysis for $log_file ==="
echo

echo "Total lines: $(wc -l < "$log_file")"
echo "Error count: $(grep -c "ERROR" "$log_file")"
echo "Warning count: $(grep -c "WARN" "$log_file")"

echo -e "\nTop 10 error messages:"
grep "ERROR" "$log_file" | \
  sed 's/.*ERROR: //' | \
  sort | uniq -c | sort -nr | head -10

echo -e "\nRecent errors (last 10):"
grep "ERROR" "$log_file" | tail -10
```

### Development Environment Checker

```bash
#!/bin/bash

echo "=== Development Environment Check ==="

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not installed"
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not installed"
fi

# Check git
if command -v git >/dev/null 2>&1; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git not installed"
fi

# Check if in project directory
if [ -f "package.json" ]; then
    echo "✅ In Node.js project directory"
    echo "   Project: $(node -p "require('./package.json').name")"
else
    echo "⚠️  Not in a Node.js project directory"
fi

# Check git status if in repo
if git rev-parse --git-dir >/dev/null 2>&1; then
    uncommitted=$(git status --porcelain | wc -l)
    if [ $uncommitted -eq 0 ]; then
        echo "✅ Git: Working directory clean"
    else
        echo "⚠️  Git: $uncommitted uncommitted changes"
    fi
fi
```

---

## Debugging and Troubleshooting

### Debugging Scripts

```bash
#!/bin/bash

# Enable debugging (shows each command before execution)
set -x

# Exit on any error
set -e

# Exit on undefined variables
set -u

# Combine all three
set -eux

# Or use at the top of your script:
#!/bin/bash -eux
```

### Common Debugging Techniques

```bash
# Add debug output
if [ "$DEBUG" = "true" ]; then
    echo "DEBUG: Variable value is $my_var"
fi

# Check if variable is set
if [ -z "${MY_VAR:-}" ]; then
    echo "MY_VAR is not set"
    exit 1
fi

# Validate file exists before using
if [ ! -f "$config_file" ]; then
    echo "Config file $config_file not found"
    exit 1
fi
```

### Error Handling

```bash
#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error: Command failed at line $1"
    exit 1
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Your script continues...
risky_command
another_command
```

### Common Mistakes and Solutions

```bash
# WRONG: Spaces around =
name = "James"  # Error!

# RIGHT: No spaces
name="James"

# WRONG: Not quoting variables with spaces
file_name="my file.txt"
cat $file_name  # Error! Tries to cat "my" and "file.txt"

# RIGHT: Quote variables
cat "$file_name"

# WRONG: Not checking if command exists
git status  # Fails if git not installed

# RIGHT: Check first
if command -v git >/dev/null 2>&1; then
    git status
else
    echo "Git not installed"
fi
```

### Performance Tips

```bash
# Avoid unnecessary command substitution in loops
# SLOW:
for file in $(ls *.txt); do
    echo $file
done

# FAST:
for file in *.txt; do
    echo "$file"
done

# Use built-in test instead of external commands
# SLOW:
if echo "$string" | grep -q "pattern"; then

# FAST:
if [[ "$string" == *"pattern"* ]]; then
```

---

## Quick Reference

### Most Useful Commands
```bash
# File operations
ls -la              # List files with details
find . -name "*.js" # Find files by pattern
grep -r "text" .    # Search in files recursively
chmod +x script.sh  # Make executable

# Process management
ps aux              # List all processes
kill -9 PID         # Force kill process
jobs                # List background jobs
nohup command &     # Run in background

# Text processing
grep "pattern" file # Search in file
sed 's/old/new/g'   # Find and replace
awk '{print $1}'    # Extract columns
sort | uniq         # Sort and remove duplicates

# System info
df -h               # Disk usage
du -sh *            # Directory sizes
top                 # System monitor
which command       # Find command location
```

### Essential Shortcuts
```bash
Ctrl+C              # Kill current command
Ctrl+Z              # Suspend current command
Ctrl+R              # Search command history
!!                  # Run last command
!$                  # Last argument of previous command
```

Remember: The best way to learn bash is by using it daily. Start with simple scripts and gradually add complexity. Don't try to memorize everything - even experienced developers look things up constantly!