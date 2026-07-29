/**
 * @file main.cpp
 * @brief Merit — Course & GPA Tracker (CLI)
 */

#include <iostream>
#include <string>
#include <limits>
#include <iomanip>
#include <cctype>
#include <algorithm>

#include "GradeManager.hpp"
#include "Course.hpp"
#include "Grade.hpp"

const std::string APP_NAME = "Merit";
const std::string APP_VERSION = "1.0.0";
const std::string DATA_FILE = "merit_data.txt";

// ============================================================================
// UTILITY FUNCTIONS - Input Handling
// ============================================================================

/**
 * @brief Clear the input buffer to prevent input issues
 */
void clearInputBuffer() {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

/**
 * @brief Get a valid integer input from the user
 * @param prompt Message to display to the user
 * @param minVal Minimum acceptable value
 * @param maxVal Maximum acceptable value
 * @return Valid integer within the specified range
 */
int getIntInput(const std::string& prompt, int minVal, int maxVal) {
    int value;
    while (true) {
        std::cout << prompt;
        if (std::cin >> value && value >= minVal && value <= maxVal) {
            clearInputBuffer();
            return value;
        }
        std::cout << "  Invalid input. Please enter a number between " 
                  << minVal << " and " << maxVal << ".\n";
        clearInputBuffer();
    }
}

/**
 * @brief Get a valid double input from the user
 * @param prompt Message to display
 * @param minVal Minimum acceptable value
 * @param allowZero Whether zero is acceptable
 * @return Valid double value
 */
double getDoubleInput(const std::string& prompt, double minVal = 0.0, bool allowZero = true) {
    double value;
    while (true) {
        std::cout << prompt;
        if (std::cin >> value) {
            if (value > minVal || (allowZero && value == 0)) {
                clearInputBuffer();
                return value;
            }
        }
        std::cout << "  Invalid input. Please enter a valid number";
        if (!allowZero) {
            std::cout << " greater than " << minVal;
        }
        std::cout << ".\n";
        clearInputBuffer();
    }
}

/**
 * @brief Get a non-empty string input from the user
 * @param prompt Message to display
 * @return Non-empty string
 */
std::string getStringInput(const std::string& prompt) {
    std::string value;
    while (true) {
        std::cout << prompt;
        std::getline(std::cin, value);
        
        // Trim whitespace
        size_t start = value.find_first_not_of(" \t\n\r");
        if (start != std::string::npos) {
            size_t end = value.find_last_not_of(" \t\n\r");
            value = value.substr(start, end - start + 1);
        } else {
            value = "";
        }
        
        if (!value.empty()) {
            return value;
        }
        std::cout << "  Input cannot be empty. Please try again.\n";
    }
}

/**
 * @brief Get a yes/no confirmation from the user
 * @param prompt Message to display
 * @return true for yes, false for no
 */
bool getConfirmation(const std::string& prompt) {
    char response;
    while (true) {
        std::cout << prompt << " (y/n): ";
        std::cin >> response;
        clearInputBuffer();
        
        response = std::tolower(response);
        if (response == 'y') return true;
        if (response == 'n') return false;
        
        std::cout << "  Please enter 'y' for yes or 'n' for no.\n";
    }
}

/**
 * @brief Pause and wait for user to press Enter
 */
void pauseForUser() {
    std::cout << "\n  Press Enter to continue...";
    std::cin.get();
}

/**
 * @brief Clear the screen (cross-platform attempt)
 */
void clearScreen() {
    #ifdef _WIN32
        system("cls");
    #else
        system("clear");
    #endif
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

/**
 * @brief Display the application header/banner
 */
void displayHeader() {
    std::cout << "\n";
    std::cout << APP_NAME << " — Course & GPA Tracker  v" << APP_VERSION << "\n";
    std::cout << "Track courses, assignments, and credit-weighted GPA.\n";
    std::cout << "----------------------------------------------------\n";
}

/**
 * @brief Display the main menu
 */
void displayMainMenu() {
    std::cout << "\nMain Menu\n";
    std::cout << "---------\n";
    std::cout << "1. View All Courses\n";
    std::cout << "2. Add New Course\n";
    std::cout << "3. Select Course (Manage Grades)\n";
    std::cout << "4. Delete Course\n";
    std::cout << "5. View GPA Summary\n";
    std::cout << "6. View Detailed Report\n";
    std::cout << "7. Save Data\n";
    std::cout << "8. Export to CSV\n";
    std::cout << "0. Exit\n";
}

/**
 * @brief Display the course menu
 * @param courseName Name of the currently selected course
 */
void displayCourseMenu(const std::string& courseName) {
    std::cout << "\nCourse: " << courseName << "\n";
    std::cout << "-------\n";
    std::cout << "1. View All Grades\n";
    std::cout << "2. Add New Grade\n";
    std::cout << "3. Edit Grade\n";
    std::cout << "4. Delete Grade\n";
    std::cout << "5. View Course Summary\n";
    std::cout << "6. Edit Course Details\n";
    std::cout << "0. Back to Main Menu\n";
}

// ============================================================================
// COURSE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * @brief Add a new course to the grade manager
 * @param manager Reference to the GradeManager
 */
void addCourse(GradeManager& manager) {
    std::cout << "\n  === ADD NEW COURSE ===\n\n";
    
    // Get course name
    std::string courseName = getStringInput("  Enter course name: ");
    
    // Check for duplicate
    if (manager.courseExists(courseName)) {
        std::cout << "\n  Error: A course with this name already exists!\n";
        pauseForUser();
        return;
    }
    
    // Get credit hours
    int credits = getIntInput("  Enter credit hours (1-6): ", 1, 6);
    
    // Add the course
    if (manager.addCourse(courseName, credits)) {
        std::cout << "\n  ✓ Course '" << courseName << "' added successfully!\n";
    } else {
        std::cout << "\n  Error: Failed to add course.\n";
    }
    
    pauseForUser();
}

/**
 * @brief Delete a course from the grade manager
 * @param manager Reference to the GradeManager
 */
void deleteCourse(GradeManager& manager) {
    std::cout << "\nDelete Course\n";
    std::cout << "-------------\n";
    
    if (manager.getCourseCount() == 0) {
        std::cout << "\n  No courses to delete.\n";
        pauseForUser();
        return;
    }
    
    // Display courses
    manager.displayAllCourses();
    
    // Get course selection
    int selection = getIntInput("\n  Enter course number to delete (0 to cancel): ", 
                                0, static_cast<int>(manager.getCourseCount()));
    
    if (selection == 0) {
        std::cout << "  Operation cancelled.\n";
        pauseForUser();
        return;
    }
    
    // Get confirmation
    const Course* course = manager.selectCourse(selection - 1);
    if (course) {
        std::cout << "\n  You are about to delete: " << course->getCourseName() << "\n";
        std::cout << "  This will delete all " << course->getGradeCount() << " grades in this course.\n";
        
        if (getConfirmation("  Are you sure?")) {
            if (manager.deleteCourse(selection - 1)) {
                std::cout << "\n  ✓ Course deleted successfully!\n";
            } else {
                std::cout << "\n  Error: Failed to delete course.\n";
            }
        } else {
            std::cout << "  Operation cancelled.\n";
        }
    }
    
    pauseForUser();
}

/**
 * @brief Select a course for grade management
 * @param manager Reference to the GradeManager
 * @return Pointer to selected course, or nullptr if cancelled
 */
Course* selectCourse(GradeManager& manager) {
    if (manager.getCourseCount() == 0) {
        std::cout << "\n  No courses available. Please add a course first.\n";
        pauseForUser();
        return nullptr;
    }
    
    manager.displayAllCourses();
    
    int selection = getIntInput("\n  Enter course number (0 to cancel): ", 
                                0, static_cast<int>(manager.getCourseCount()));
    
    if (selection == 0) {
        return nullptr;
    }
    
    return manager.selectCourse(selection - 1);
}

// ============================================================================
// GRADE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * @brief Add a new grade to a course
 * @param course Reference to the Course
 */
void addGrade(Course& course) {
    std::cout << "\nAdd New Grade\n";
    std::cout << "-------------\n\n";
    
    // Get assignment name
    std::string assignmentName = getStringInput("  Enter assignment name: ");
    
    // Get score earned
    double scoreEarned = getDoubleInput("  Enter score earned: ", -1, true);
    
    // Get score possible
    double scorePossible = getDoubleInput("  Enter score possible: ", 0, false);
    
    // Ask about weight
    double weight = 1.0;
    if (getConfirmation("  Do you want to set a custom weight?")) {
        weight = getDoubleInput("  Enter weight (e.g., 0.1 for 10%): ", 0, false);
    }
    
    // Add the grade
    course.addGrade(assignmentName, scoreEarned, scorePossible, weight);
    
    double percentage = (scoreEarned / scorePossible) * 100.0;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "\n  ✓ Grade added successfully!\n";
    std::cout << "    " << assignmentName << ": " << scoreEarned << "/" << scorePossible 
              << " (" << percentage << "%)\n";
    
    pauseForUser();
}

/**
 * @brief Edit an existing grade in a course
 * @param course Reference to the Course
 */
void editGrade(Course& course) {
    std::cout << "\nEdit Grade\n";
    std::cout << "----------\n";
    
    if (course.getGradeCount() == 0) {
        std::cout << "\n  No grades to edit.\n";
        pauseForUser();
        return;
    }
    
    // Display current grades
    course.displayGrades();
    
    // Select grade to edit
    int selection = getIntInput("\n  Enter grade number to edit (0 to cancel): ",
                                0, static_cast<int>(course.getGradeCount()));
    
    if (selection == 0) {
        std::cout << "  Operation cancelled.\n";
        pauseForUser();
        return;
    }
    
    size_t index = selection - 1;
    const Grade& oldGrade = course.getGrade(index);
    
    std::cout << "\n  Current grade: " << oldGrade.getAssignmentName() 
              << " - " << oldGrade.getScoreEarned() << "/" << oldGrade.getScorePossible()
              << " (Weight: " << oldGrade.getWeight() << ")\n\n";
    
    // Edit fields
    std::cout << "  Leave blank and press Enter to keep current value.\n\n";
    
    // Assignment name
    std::cout << "  Current name: " << oldGrade.getAssignmentName() << "\n";
    std::cout << "  New name (or Enter to keep): ";
    std::string newName;
    std::getline(std::cin, newName);
    if (newName.empty()) newName = oldGrade.getAssignmentName();
    
    // Score earned
    std::cout << "  Current score earned: " << oldGrade.getScoreEarned() << "\n";
    double newEarned = getDoubleInput("  New score earned: ", -1, true);
    
    // Score possible
    std::cout << "  Current score possible: " << oldGrade.getScorePossible() << "\n";
    double newPossible = getDoubleInput("  New score possible: ", 0, false);
    
    // Weight
    std::cout << "  Current weight: " << oldGrade.getWeight() << "\n";
    double newWeight = getDoubleInput("  New weight: ", -0.001, true);
    
    // Create and apply new grade
    Grade newGrade(newName, newEarned, newPossible, newWeight);
    
    if (course.editGrade(index, newGrade)) {
        std::cout << "\n  ✓ Grade updated successfully!\n";
    } else {
        std::cout << "\n  Error: Failed to update grade.\n";
    }
    
    pauseForUser();
}

/**
 * @brief Delete a grade from a course
 * @param course Reference to the Course
 */
void deleteGrade(Course& course) {
    std::cout << "\nDelete Grade\n";
    std::cout << "------------\n";
    
    if (course.getGradeCount() == 0) {
        std::cout << "\n  No grades to delete.\n";
        pauseForUser();
        return;
    }
    
    // Display current grades
    course.displayGrades();
    
    // Select grade to delete
    int selection = getIntInput("\n  Enter grade number to delete (0 to cancel): ",
                                0, static_cast<int>(course.getGradeCount()));
    
    if (selection == 0) {
        std::cout << "  Operation cancelled.\n";
        pauseForUser();
        return;
    }
    
    size_t index = selection - 1;
    const Grade& grade = course.getGrade(index);
    
    std::cout << "\n  You are about to delete: " << grade.getAssignmentName() << "\n";
    
    if (getConfirmation("  Are you sure?")) {
        if (course.removeGrade(index)) {
            std::cout << "\n  ✓ Grade deleted successfully!\n";
        } else {
            std::cout << "\n  Error: Failed to delete grade.\n";
        }
    } else {
        std::cout << "  Operation cancelled.\n";
    }
    
    pauseForUser();
}

/**
 * @brief Edit course details (name, credits)
 * @param course Reference to the Course
 * @param manager Reference to the GradeManager (for duplicate checking)
 */
void editCourseDetails(Course& course, GradeManager& manager) {
    std::cout << "\nEdit Course Details\n";
    std::cout << "-------------------\n\n";
    
    std::cout << "  Current name: " << course.getCourseName() << "\n";
    std::cout << "  Current credits: " << course.getCreditHours() << "\n\n";
    
    // Edit name
    std::cout << "  Enter new name (or Enter to keep current): ";
    std::string newName;
    std::getline(std::cin, newName);
    
    if (!newName.empty() && newName != course.getCourseName()) {
        if (manager.courseExists(newName)) {
            std::cout << "  Error: A course with this name already exists!\n";
        } else {
            course.setCourseName(newName);
            std::cout << "  ✓ Course name updated.\n";
        }
    }
    
    // Edit credits
    if (getConfirmation("  Do you want to change credit hours?")) {
        int newCredits = getIntInput("  Enter new credit hours (1-6): ", 1, 6);
        course.setCreditHours(newCredits);
        std::cout << "  ✓ Credit hours updated.\n";
    }
    
    pauseForUser();
}

// ============================================================================
// COURSE MENU HANDLER
// ============================================================================

/**
 * @brief Handle the course-specific menu loop
 * @param course Pointer to the selected course
 * @param manager Reference to the GradeManager
 */
void handleCourseMenu(Course* course, GradeManager& manager) {
    if (!course) return;
    
    bool courseMenuRunning = true;
    
    while (courseMenuRunning) {
        clearScreen();
        displayCourseMenu(course->getCourseName());
        
        int choice = getIntInput("  Enter your choice: ", 0, 6);
        
        switch (choice) {
            case 1:  // View All Grades
                course->displayCourse();
                pauseForUser();
                break;
                
            case 2:  // Add New Grade
                addGrade(*course);
                manager.markModified();
                break;
                
            case 3:  // Edit Grade
                editGrade(*course);
                manager.markModified();
                break;
                
            case 4:  // Delete Grade
                deleteGrade(*course);
                manager.markModified();
                break;
                
            case 5:  // View Course Summary
                course->displaySummary();
                pauseForUser();
                break;
                
            case 6:  // Edit Course Details
                editCourseDetails(*course, manager);
                manager.markModified();
                break;
                
            case 0:  // Back to Main Menu
                courseMenuRunning = false;
                break;
                
            default:
                std::cout << "  Invalid option. Please try again.\n";
                pauseForUser();
        }
    }
}

// ============================================================================
// MAIN MENU HANDLER
// ============================================================================

/**
 * @brief Handle the main menu loop
 * @param manager Reference to the GradeManager
 */
void handleMainMenu(GradeManager& manager) {
    bool running = true;
    
    while (running) {
        clearScreen();
        displayHeader();
        
        // Show unsaved changes indicator
        if (manager.hasUnsavedChanges()) {
            std::cout << "  [!] You have unsaved changes\n";
        }
        
        displayMainMenu();
        
        int choice = getIntInput("  Enter your choice: ", 0, 8);
        
        switch (choice) {
            case 1:  // View All Courses
                manager.displayAllCourses();
                pauseForUser();
                break;
                
            case 2:  // Add New Course
                addCourse(manager);
                break;
                
            case 3: {  // Select Course
                Course* selectedCourse = selectCourse(manager);
                if (selectedCourse) {
                    handleCourseMenu(selectedCourse, manager);
                }
                break;
            }
                
            case 4:  // Delete Course
                deleteCourse(manager);
                break;
                
            case 5:  // View GPA Summary
                manager.displayGPABreakdown();
                pauseForUser();
                break;
                
            case 6:  // View Detailed Report
                manager.displayDetailedReport();
                pauseForUser();
                break;
                
            case 7:  // Save Data
                if (manager.saveData()) {
                    manager.markSaved();
                    std::cout << "\n  ✓ Data saved successfully!\n";
                } else {
                    std::cout << "\n  Error: Failed to save data.\n";
                }
                pauseForUser();
                break;
                
            case 8: {  // Export to CSV
                std::string filename = getStringInput("  Enter CSV filename: ");
                // Check if filename ends with .csv (C++17 compatible)
                if (filename.length() < 4 || filename.substr(filename.length() - 4) != ".csv") {
                    filename += ".csv";
                }
                if (manager.exportToCSV(filename)) {
                    std::cout << "\n  ✓ Data exported to " << filename << " successfully!\n";
                } else {
                    std::cout << "\n  Error: Failed to export data.\n";
                }
                pauseForUser();
                break;
            }
                
            case 0:  // Exit
                if (manager.hasUnsavedChanges()) {
                    std::cout << "\n  You have unsaved changes!\n";
                    if (getConfirmation("  Do you want to save before exiting?")) {
                        if (manager.saveData()) {
                            manager.markSaved();
                            std::cout << "  ✓ Data saved successfully!\n";
                        }
                    }
                }
                
                if (getConfirmation("  Are you sure you want to exit?")) {
                    running = false;
                    std::cout << "\n  Thanks for using Merit. Goodbye!\n\n";
                }
                break;
                
            default:
                std::cout << "  Invalid option. Please try again.\n";
                pauseForUser();
        }
    }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

int main() {
    GradeManager manager(DATA_FILE);

    clearScreen();
    displayHeader();

    if (manager.getCourseCount() > 0) {
        std::cout << "\n  Loaded " << manager.getCourseCount() << " course(s) from save file.\n";
    } else {
        std::cout << "\n  Welcome! No existing data found — add a course to begin.\n";
    }

    pauseForUser();
    handleMainMenu(manager);
    return 0;
}

