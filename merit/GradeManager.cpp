/**
 * @file GradeManager.cpp
 * @brief Implementation file for the GradeManager class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file contains the implementation of all GradeManager class methods,
 * including course management, GPA calculations, and file I/O operations.
 */

#include "GradeManager.hpp"
#include <fstream>
#include <sstream>
#include <iostream>
#include <iomanip>
#include <algorithm>
#include <filesystem>
#include <chrono>
#include <ctime>

// File format version for compatibility checking
const std::string GradeManager::FILE_VERSION = "MERIT_V1.0";

// ============================================================================
// CONSTRUCTORS & DESTRUCTOR
// ============================================================================

/**
 * Default constructor with default file path
 */
GradeManager::GradeManager() 
    : dataFilePath("merit_data.txt"),
      dataModified(false) {
    loadData();
}

/**
 * Constructor with custom file path
 */
GradeManager::GradeManager(const std::string& filePath) 
    : dataFilePath(filePath),
      dataModified(false) {
    loadData();
}

/**
 * Destructor - optionally auto-save
 * Note: Uncomment auto-save if desired behavior
 */
GradeManager::~GradeManager() {
    // Optional: Auto-save on exit
    // if (dataModified) {
    //     saveData();
    // }
}

// ============================================================================
// COURSE MANAGEMENT
// ============================================================================

bool GradeManager::addCourse(const Course& course) {
    // Check for duplicate course name
    if (courseExists(course.getCourseName())) {
        return false;  // Duplicate name
    }
    
    courses.push_back(course);
    markModified();
    return true;
}

bool GradeManager::addCourse(const std::string& courseName, int creditHours) {
    // Validate input
    if (courseName.empty()) {
        return false;  // Empty name not allowed
    }
    
    // Check for duplicate
    if (courseExists(courseName)) {
        return false;
    }
    
    courses.emplace_back(courseName, creditHours);
    markModified();
    return true;
}

bool GradeManager::deleteCourse(size_t index) {
    if (index >= courses.size()) {
        return false;  // Invalid index
    }
    
    courses.erase(courses.begin() + index);
    markModified();
    return true;
}

bool GradeManager::deleteCourseByName(const std::string& courseName) {
    int index = findCourseIndex(courseName);
    if (index < 0) {
        return false;  // Course not found
    }
    
    return deleteCourse(static_cast<size_t>(index));
}

Course* GradeManager::selectCourse(size_t index) {
    if (index >= courses.size()) {
        return nullptr;  // Invalid index
    }
    
    return &courses[index];
}

Course* GradeManager::selectCourseByName(const std::string& courseName) {
    int index = findCourseIndex(courseName);
    if (index < 0) {
        return nullptr;
    }
    
    return &courses[static_cast<size_t>(index)];
}

bool GradeManager::courseExists(const std::string& courseName) const {
    return findCourseIndex(courseName) >= 0;
}

size_t GradeManager::getCourseCount() const {
    return courses.size();
}

const std::vector<Course>& GradeManager::getAllCourses() const {
    return courses;
}

int GradeManager::findCourseIndex(const std::string& courseName) const {
    for (size_t i = 0; i < courses.size(); ++i) {
        // Case-insensitive comparison
        std::string name1 = courses[i].getCourseName();
        std::string name2 = courseName;
        
        // Convert to lowercase for comparison
        std::transform(name1.begin(), name1.end(), name1.begin(), ::tolower);
        std::transform(name2.begin(), name2.end(), name2.begin(), ::tolower);
        
        if (name1 == name2) {
            return static_cast<int>(i);
        }
    }
    return -1;  // Not found
}

// ============================================================================
// GPA CALCULATION
// ============================================================================

/**
 * Compute overall GPA using credit-weighted average
 * Formula: Sum(GPA_points * credit_hours) / Sum(credit_hours)
 */
double GradeManager::computeOverallGPA() const {
    if (courses.empty()) {
        return 0.0;
    }
    
    double totalGradePoints = computeTotalGradePoints();
    int totalCredits = computeTotalCredits();
    
    if (totalCredits == 0) {
        return 0.0;
    }
    
    return totalGradePoints / totalCredits;
}

int GradeManager::computeTotalCredits() const {
    int total = 0;
    for (const auto& course : courses) {
        // Only count courses that have grades
        if (course.getGradeCount() > 0) {
            total += course.getCreditHours();
        }
    }
    return total;
}

double GradeManager::computeTotalGradePoints() const {
    double total = 0.0;
    for (const auto& course : courses) {
        // Only count courses that have grades
        if (course.getGradeCount() > 0) {
            double courseAvg = course.computeCourseAverage();
            double gpaPoints = Course::percentageToGPA(courseAvg);
            total += gpaPoints * course.getCreditHours();
        }
    }
    return total;
}

/**
 * Display detailed GPA breakdown showing contribution of each course
 */
void GradeManager::displayGPABreakdown() const {
    std::cout << std::fixed << std::setprecision(2);
    
    std::cout << "\nGPA Calculation Breakdown\n";
    std::cout << "-------------------------\n\n";
    
    if (courses.empty()) {
        std::cout << "No courses to calculate GPA.\n";
        return;
    }
    
    double totalQualityPoints = 0.0;
    int totalCredits = 0;
    
    for (const auto& course : courses) {
        if (course.getGradeCount() == 0) {
            std::cout << course.getCourseName() << " (" << course.getCreditHours() 
                      << " credits) - No grades recorded\n";
            continue;
        }
        
        double avg = course.computeCourseAverage();
        std::string letterGrade = Course::percentageToLetterGrade(avg);
        double gpaPoints = Course::percentageToGPA(avg);
        double qualityPoints = gpaPoints * course.getCreditHours();
        
        totalQualityPoints += qualityPoints;
        totalCredits += course.getCreditHours();
        
        std::cout << course.getCourseName() << " (" << course.getCreditHours() << " credits): "
                  << avg << "% (" << letterGrade << ") - GPA: " << gpaPoints 
                  << ", Quality Points: " << qualityPoints << "\n";
    }
    
    std::cout << "\nTotal Credits: " << totalCredits 
              << ", Total Quality Points: " << totalQualityPoints << "\n";
    
    double finalGPA = (totalCredits > 0) ? (totalQualityPoints / totalCredits) : 0.0;
    std::cout << "Overall GPA: " << finalGPA << " / 4.00\n";
}

// ============================================================================
// DATA PERSISTENCE
// ============================================================================

/**
 * Save data to the default file path
 */
bool GradeManager::saveData() const {
    return saveDataTo(dataFilePath);
}

/**
 * Save data to specified file
 * File format:
 *   FILE_VERSION
 *   COURSE_COUNT
 *   [COURSE]
 *   courseName|creditHours|gradeCount
 *   gradeData...
 *   [/COURSE]
 *   ...
 */
bool GradeManager::saveDataTo(const std::string& filePath) const {
    std::ofstream outFile(filePath);
    
    if (!outFile.is_open()) {
        std::cerr << "Error: Could not open file for writing: " << filePath << std::endl;
        return false;
    }
    
    try {
        // Write file header
        outFile << FILE_VERSION << "\n";
        outFile << courses.size() << "\n";
        
        // Write each course
        for (const auto& course : courses) {
            std::vector<std::string> courseStrings = course.toFileStrings();
            for (const auto& line : courseStrings) {
                outFile << line << "\n";
            }
        }
        
        outFile.close();
        
        // Note: Can't call markSaved() from const method
        // The calling code should handle this
        
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error saving data: " << e.what() << std::endl;
        outFile.close();
        return false;
    }
}

/**
 * Load data from the default file path
 */
bool GradeManager::loadData() {
    return loadDataFrom(dataFilePath);
}

/**
 * Load data from specified file
 * Handles missing or corrupted files gracefully
 */
bool GradeManager::loadDataFrom(const std::string& filePath) {
    std::ifstream inFile(filePath);
    
    if (!inFile.is_open()) {
        // File doesn't exist - not an error, just start fresh
        return true;
    }
    
    try {
        std::vector<std::string> lines;
        std::string line;
        
        // Read all lines into vector
        while (std::getline(inFile, line)) {
            lines.push_back(line);
        }
        inFile.close();
        
        if (lines.empty()) {
            return true;  // Empty file
        }
        
        // Accept current and legacy Grade Tracker headers
        if (lines[0] != FILE_VERSION && lines[0] != "GRADETRACKER_V1.0") {
            std::cerr << "Warning: Data file version mismatch. Attempting to load anyway.\n";
        }
        
        // Get course count
        if (lines.size() < 2) {
            throw std::runtime_error("Invalid file format: missing course count");
        }
        
        size_t courseCount = std::stoul(lines[1]);
        
        // Clear existing data
        courses.clear();
        
        // Parse courses
        size_t currentLine = 2;
        for (size_t i = 0; i < courseCount; ++i) {
            if (currentLine >= lines.size()) {
                throw std::runtime_error("Unexpected end of file while reading courses");
            }
            
            size_t endIndex;
            Course course = Course::fromFileStrings(lines, currentLine, endIndex);
            courses.push_back(course);
            currentLine = endIndex;
        }
        
        dataModified = false;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error loading data: " << e.what() << std::endl;
        std::cerr << "Starting with empty data.\n";
        courses.clear();
        return false;
    }
}

bool GradeManager::hasUnsavedChanges() const {
    return dataModified;
}

void GradeManager::markModified() {
    dataModified = true;
}

void GradeManager::markSaved() {
    dataModified = false;
}

std::string GradeManager::getDataFilePath() const {
    return dataFilePath;
}

void GradeManager::setDataFilePath(const std::string& filePath) {
    dataFilePath = filePath;
}

bool GradeManager::dataFileExists() const {
    std::ifstream file(dataFilePath);
    return file.good();
}

/**
 * Create a backup of the current data file
 * Backup filename: original_name.backup.timestamp
 */
bool GradeManager::createBackup() const {
    if (!dataFileExists()) {
        return false;  // Nothing to backup
    }
    
    // Generate backup filename with timestamp
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    
    std::ostringstream oss;
    oss << dataFilePath << ".backup." << time;
    std::string backupPath = oss.str();
    
    // Copy file
    try {
        std::ifstream src(dataFilePath, std::ios::binary);
        std::ofstream dst(backupPath, std::ios::binary);
        dst << src.rdbuf();
        return true;
    } catch (...) {
        return false;
    }
}

// ============================================================================
// DISPLAY METHODS
// ============================================================================

/**
 * Display a summary list of all courses
 */
void GradeManager::displayAllCourses() const {
    std::cout << std::fixed << std::setprecision(2);
    
    std::cout << "\nYour Courses\n";
    std::cout << "------------\n\n";
    
    if (courses.empty()) {
        std::cout << "No courses added yet. Add a course to get started!\n";
        return;
    }
    
    for (size_t i = 0; i < courses.size(); ++i) {
        const Course& course = courses[i];
        
        std::cout << (i + 1) << ". " << course.getCourseName() 
                  << " (" << course.getCreditHours() << " credits, " 
                  << course.getGradeCount() << " grades)";
        
        if (course.getGradeCount() > 0) {
            double avg = course.computeCourseAverage();
            double gpa = Course::percentageToGPA(avg);
            std::cout << " - Average: " << avg << "%, GPA: " << gpa;
        }
        std::cout << "\n";
    }
}

/**
 * Display detailed information for all courses including grades
 */
void GradeManager::displayDetailedReport() const {
    std::cout << "\nDetailed Grade Report\n";
    std::cout << "---------------------\n\n";
    
    if (courses.empty()) {
        std::cout << "No courses to display.\n";
        return;
    }
    
    for (const auto& course : courses) {
        course.displayCourse();
        std::cout << "\n";
    }
    
    displayGPABreakdown();
}

/**
 * Display overall academic summary
 */
void GradeManager::displayOverallSummary() const {
    std::cout << std::fixed << std::setprecision(2);
    
    double overallGPA = computeOverallGPA();
    int totalCredits = computeTotalCredits();
    size_t totalCourses = courses.size();
    
    size_t totalGrades = 0;
    for (const auto& course : courses) {
        totalGrades += course.getGradeCount();
    }
    
    std::cout << "\nAcademic Summary\n";
    std::cout << "----------------\n";
    std::cout << "Total Courses: " << totalCourses << "\n";
    std::cout << "Total Assignments: " << totalGrades << "\n";
    std::cout << "Total Credit Hours: " << totalCredits << "\n";
    std::cout << "Overall GPA: " << overallGPA << " / 4.00\n";
}

// ============================================================================
// UTILITY METHODS
// ============================================================================

void GradeManager::clearAllData() {
    courses.clear();
    markModified();
}

/**
 * Export all data to CSV format for external use
 * Format: CourseName, AssignmentName, ScoreEarned, ScorePossible, Weight, Percentage
 */
bool GradeManager::exportToCSV(const std::string& filePath) const {
    std::ofstream outFile(filePath);
    
    if (!outFile.is_open()) {
        return false;
    }
    
    // CSV Header
    outFile << "Course,Assignment,Score Earned,Score Possible,Weight,Percentage\n";
    
    for (const auto& course : courses) {
        const auto& grades = course.getAllGrades();
        
        if (grades.empty()) {
            // Write course with no grades
            outFile << "\"" << course.getCourseName() << "\",,,,,\n";
        } else {
            for (const auto& grade : grades) {
                outFile << "\"" << course.getCourseName() << "\","
                        << "\"" << grade.getAssignmentName() << "\","
                        << grade.getScoreEarned() << ","
                        << grade.getScorePossible() << ","
                        << grade.getWeight() << ","
                        << grade.calculatePercentage() << "\n";
            }
        }
    }
    
    outFile.close();
    return true;
}

