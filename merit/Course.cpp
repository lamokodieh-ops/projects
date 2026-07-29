/**
 * @file Course.cpp
 * @brief Implementation file for the Course class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file contains the implementation of all Course class methods,
 * including grade management, calculations, and display functions.
 */

#include "Course.hpp"
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <algorithm>
#include <cmath>

// ============================================================================
// CONSTRUCTORS & DESTRUCTOR
// ============================================================================

/**
 * Default constructor - creates empty course
 */
Course::Course() 
    : courseName(""), 
      creditHours(3) {
    // grades vector is automatically initialized empty
}

/**
 * Constructor with course name
 */
Course::Course(const std::string& name) 
    : courseName(name), 
      creditHours(3) {
    // Default 3 credit hours
}

/**
 * Constructor with course name and credit hours
 */
Course::Course(const std::string& name, int credits) 
    : courseName(name), 
      creditHours(credits) {
    if (creditHours < 1) creditHours = 1;  // Minimum 1 credit
}

/**
 * Destructor - vector handles its own memory cleanup
 */
Course::~Course() {
    // grades vector automatically cleaned up
}

// ============================================================================
// GETTERS
// ============================================================================

std::string Course::getCourseName() const {
    return courseName;
}

int Course::getCreditHours() const {
    return creditHours;
}

size_t Course::getGradeCount() const {
    return grades.size();
}

Grade& Course::getGrade(size_t index) {
    if (index >= grades.size()) {
        throw std::out_of_range("Grade index out of range");
    }
    return grades[index];
}

const Grade& Course::getGrade(size_t index) const {
    if (index >= grades.size()) {
        throw std::out_of_range("Grade index out of range");
    }
    return grades[index];
}

const std::vector<Grade>& Course::getAllGrades() const {
    return grades;
}

// ============================================================================
// SETTERS
// ============================================================================

bool Course::setCourseName(const std::string& name) {
    if (name.empty()) {
        return false;  // Name cannot be empty
    }
    courseName = name;
    return true;
}

bool Course::setCreditHours(int credits) {
    if (credits < 1) {
        return false;  // Must be at least 1 credit
    }
    creditHours = credits;
    return true;
}

// ============================================================================
// GRADE MANAGEMENT METHODS
// ============================================================================

void Course::addGrade(const Grade& grade) {
    grades.push_back(grade);
}

void Course::addGrade(const std::string& name, double earned, double possible) {
    grades.emplace_back(name, earned, possible);
}

void Course::addGrade(const std::string& name, double earned, double possible, double weight) {
    grades.emplace_back(name, earned, possible, weight);
}

bool Course::removeGrade(size_t index) {
    if (index >= grades.size()) {
        return false;  // Invalid index
    }
    grades.erase(grades.begin() + index);
    return true;
}

bool Course::editGrade(size_t index, const Grade& newGrade) {
    if (index >= grades.size()) {
        return false;  // Invalid index
    }
    grades[index] = newGrade;
    return true;
}

void Course::clearGrades() {
    grades.clear();
}

// ============================================================================
// CALCULATION METHODS
// ============================================================================

/**
 * Compute simple unweighted average
 * All grades contribute equally to the average
 */
double Course::computeUnweightedAverage() const {
    if (grades.empty()) {
        return 0.0;  // No grades to average
    }
    
    double totalPercentage = 0.0;
    for (const auto& grade : grades) {
        totalPercentage += grade.calculatePercentage();
    }
    
    return totalPercentage / grades.size();
}

/**
 * Compute weighted average using individual grade weights
 * Formula: sum(percentage * weight) / sum(weights)
 */
double Course::computeWeightedAverage() const {
    if (grades.empty()) {
        return 0.0;
    }
    
    double totalWeightedScore = 0.0;
    double totalWeight = 0.0;
    
    for (const auto& grade : grades) {
        totalWeightedScore += grade.calculatePercentage() * grade.getWeight();
        totalWeight += grade.getWeight();
    }
    
    // Prevent division by zero
    if (totalWeight == 0) {
        return 0.0;
    }
    
    return totalWeightedScore / totalWeight;
}

/**
 * Auto-select calculation method based on grade weights
 * Uses weighted if any grade has non-default weight
 */
double Course::computeCourseAverage() const {
    if (hasWeightedGrades()) {
        return computeWeightedAverage();
    }
    return computeUnweightedAverage();
}

/**
 * Check if any grades have custom weights
 */
bool Course::hasWeightedGrades() const {
    for (const auto& grade : grades) {
        // Consider weighted if any grade doesn't have default weight of 1.0
        if (std::abs(grade.getWeight() - 1.0) > 0.0001) {
            return true;
        }
    }
    return false;
}

/**
 * Convert percentage to letter grade using standard scale
 * A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: <60
 * With +/- modifiers
 */
std::string Course::percentageToLetterGrade(double percentage) {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 63) return "D";
    if (percentage >= 60) return "D-";
    return "F";
}

/**
 * Convert percentage to 4.0 GPA scale
 * Standard conversion used by most institutions
 */
double Course::percentageToGPA(double percentage) {
    if (percentage >= 97) return 4.0;   // A+
    if (percentage >= 93) return 4.0;   // A
    if (percentage >= 90) return 3.7;   // A-
    if (percentage >= 87) return 3.3;   // B+
    if (percentage >= 83) return 3.0;   // B
    if (percentage >= 80) return 2.7;   // B-
    if (percentage >= 77) return 2.3;   // C+
    if (percentage >= 73) return 2.0;   // C
    if (percentage >= 70) return 1.7;   // C-
    if (percentage >= 67) return 1.3;   // D+
    if (percentage >= 63) return 1.0;   // D
    if (percentage >= 60) return 0.7;   // D-
    return 0.0;                         // F
}

// ============================================================================
// DISPLAY METHODS
// ============================================================================

/**
 * Display complete course information
 */
void Course::displayCourse() const {
    std::cout << "\nCourse: " << courseName << "\n";
    std::cout << "Credit Hours: " << creditHours << "\n";
    std::cout << "-------------------------\n";
    
    if (grades.empty()) {
        std::cout << "No grades recorded yet.\n";
    } else {
        displayGrades();
    }
    
    displaySummary();
}

/**
 * Display all grades in a formatted list
 */
void Course::displayGrades() const {
    if (grades.empty()) {
        std::cout << "No grades to display.\n";
        return;
    }
    
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "\nGrades:\n";
    
    for (size_t i = 0; i < grades.size(); ++i) {
        const Grade& g = grades[i];
        std::cout << (i + 1) << ". " << g.getAssignmentName() << ": "
                  << g.getScoreEarned() << "/" << g.getScorePossible() 
                  << " (" << g.calculatePercentage() << "%)"
                  << " [Weight: " << g.getWeight() << "]\n";
    }
}

/**
 * Display course summary statistics
 */
void Course::displaySummary() const {
    double average = computeCourseAverage();
    std::string letterGrade = percentageToLetterGrade(average);
    double gpa = percentageToGPA(average);
    
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "\nCourse Summary\n";
    std::cout << "--------------\n";
    std::cout << "Course Average: " << average << "%\n";
    std::cout << "Letter Grade: " << letterGrade << "\n";
    std::cout << "GPA Points: " << gpa << "\n";
    if (hasWeightedGrades()) {
        std::cout << "(Using weighted calculation)\n";
    } else {
        std::cout << "(Using unweighted calculation)\n";
    }
}

// ============================================================================
// FILE I/O METHODS
// ============================================================================

/**
 * Convert course to file format
 * Format:
 *   [COURSE]
 *   courseName|creditHours|gradeCount
 *   grade1FileString
 *   grade2FileString
 *   ...
 *   [/COURSE]
 */
std::vector<std::string> Course::toFileStrings() const {
    std::vector<std::string> lines;
    
    // Course header marker
    lines.push_back("[COURSE]");
    
    // Course metadata: name|creditHours|gradeCount
    std::ostringstream oss;
    oss << courseName << "|" << creditHours << "|" << grades.size();
    lines.push_back(oss.str());
    
    // Add each grade
    for (const auto& grade : grades) {
        lines.push_back(grade.toFileString());
    }
    
    // Course end marker
    lines.push_back("[/COURSE]");
    
    return lines;
}

/**
 * Parse a Course from file strings
 * Expects format described in toFileStrings()
 */
Course Course::fromFileStrings(const std::vector<std::string>& lines, 
                                size_t startIndex, 
                                size_t& endIndex) {
    Course course;
    
    // Verify course header
    if (startIndex >= lines.size() || lines[startIndex] != "[COURSE]") {
        throw std::runtime_error("Invalid course data: missing header");
    }
    
    // Parse course metadata
    size_t metaIndex = startIndex + 1;
    if (metaIndex >= lines.size()) {
        throw std::runtime_error("Invalid course data: missing metadata");
    }
    
    std::istringstream iss(lines[metaIndex]);
    std::string name;
    int credits;
    size_t gradeCount;
    
    if (!std::getline(iss, name, '|')) {
        throw std::runtime_error("Failed to parse course name");
    }
    course.setCourseName(name);
    
    std::string temp;
    if (!std::getline(iss, temp, '|')) {
        throw std::runtime_error("Failed to parse credit hours");
    }
    credits = std::stoi(temp);
    course.setCreditHours(credits);
    
    if (!std::getline(iss, temp, '|')) {
        throw std::runtime_error("Failed to parse grade count");
    }
    gradeCount = std::stoul(temp);
    
    // Parse grades
    size_t gradeStart = metaIndex + 1;
    for (size_t i = 0; i < gradeCount; ++i) {
        if (gradeStart + i >= lines.size()) {
            throw std::runtime_error("Unexpected end of grade data");
        }
        Grade grade = Grade::fromFileString(lines[gradeStart + i]);
        course.addGrade(grade);
    }
    
    // Find end marker
    endIndex = gradeStart + gradeCount;
    if (endIndex >= lines.size() || lines[endIndex] != "[/COURSE]") {
        throw std::runtime_error("Invalid course data: missing end marker");
    }
    endIndex++;  // Move past the end marker
    
    return course;
}

