/**
 * @file GradeManager.hpp
 * @brief Header file for the GradeManager class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file defines the GradeManager class which serves as the main controller
 * for the grade tracking application. It manages all courses and handles
 * data persistence through file I/O operations.
 */

#ifndef GRADEMANAGER_HPP
#define GRADEMANAGER_HPP

#include <string>
#include <vector>
#include <optional>
#include "Course.hpp"

/**
 * @class GradeManager
 * @brief Main controller class for managing courses and grades
 * 
 * The GradeManager acts as the central coordinator for the grade tracking
 * system. It handles:
 * - Course management (add, delete, select)
 * - Overall GPA calculation
 * - Data persistence (save/load)
 * - Data validation and error handling
 */
class GradeManager {
private:
    std::vector<Course> courses;    ///< Collection of all courses
    std::string dataFilePath;       ///< Path to the data file for persistence
    bool dataModified;              ///< Flag to track unsaved changes
    
    /**
     * @brief File format version for backwards compatibility
     */
    static const std::string FILE_VERSION;

public:
    // ========================
    // Constructors & Destructor
    // ========================
    
    /**
     * @brief Default constructor
     * Uses default data file path
     */
    GradeManager();
    
    /**
     * @brief Constructor with custom data file path
     * @param filePath Path to the data file
     */
    explicit GradeManager(const std::string& filePath);
    
    /**
     * @brief Destructor
     * Optionally saves data before destruction
     */
    ~GradeManager();

    // ========================
    // Course Management
    // ========================
    
    /**
     * @brief Add a new course
     * @param course The Course object to add
     * @return true if successfully added, false if duplicate name exists
     */
    bool addCourse(const Course& course);
    
    /**
     * @brief Add a new course by name
     * @param courseName Name of the new course
     * @param creditHours Credit hours (default: 3)
     * @return true if successfully added, false if duplicate name exists
     */
    bool addCourse(const std::string& courseName, int creditHours = 3);
    
    /**
     * @brief Delete a course by index
     * @param index Index of the course to delete (0-based)
     * @return true if successfully deleted, false if index is invalid
     */
    bool deleteCourse(size_t index);
    
    /**
     * @brief Delete a course by name
     * @param courseName Name of the course to delete
     * @return true if successfully deleted, false if course not found
     */
    bool deleteCourseByName(const std::string& courseName);
    
    /**
     * @brief Select/get a course by index
     * @param index Index of the course (0-based)
     * @return Pointer to the course, or nullptr if index is invalid
     */
    Course* selectCourse(size_t index);
    
    /**
     * @brief Select/get a course by name
     * @param courseName Name of the course
     * @return Pointer to the course, or nullptr if not found
     */
    Course* selectCourseByName(const std::string& courseName);
    
    /**
     * @brief Check if a course name already exists
     * @param courseName Name to check
     * @return true if a course with this name exists
     */
    bool courseExists(const std::string& courseName) const;
    
    /**
     * @brief Get the number of courses
     * @return Count of courses
     */
    size_t getCourseCount() const;
    
    /**
     * @brief Get all courses
     * @return Const reference to courses vector
     */
    const std::vector<Course>& getAllCourses() const;
    
    /**
     * @brief Find course index by name
     * @param courseName Name of the course
     * @return Index if found, or -1 if not found
     */
    int findCourseIndex(const std::string& courseName) const;

    // ========================
    // GPA Calculation
    // ========================
    
    /**
     * @brief Compute the overall GPA across all courses
     * Uses credit hours as weights for calculation
     * @return Overall GPA on 4.0 scale
     */
    double computeOverallGPA() const;
    
    /**
     * @brief Compute total credit hours attempted
     * @return Sum of all course credit hours
     */
    int computeTotalCredits() const;
    
    /**
     * @brief Compute total grade points earned
     * @return Sum of (GPA points * credit hours) for all courses
     */
    double computeTotalGradePoints() const;
    
    /**
     * @brief Get detailed GPA breakdown
     * Prints detailed calculation showing each course's contribution
     */
    void displayGPABreakdown() const;

    // ========================
    // Data Persistence
    // ========================
    
    /**
     * @brief Save all data to file
     * @return true if successfully saved, false if error occurred
     */
    bool saveData() const;
    
    /**
     * @brief Save data to a specific file
     * @param filePath Path to save the data
     * @return true if successfully saved, false if error occurred
     */
    bool saveDataTo(const std::string& filePath) const;
    
    /**
     * @brief Load data from file
     * @return true if successfully loaded, false if error occurred
     */
    bool loadData();
    
    /**
     * @brief Load data from a specific file
     * @param filePath Path to load the data from
     * @return true if successfully loaded, false if error occurred
     */
    bool loadDataFrom(const std::string& filePath);
    
    /**
     * @brief Check if there are unsaved changes
     * @return true if data has been modified since last save
     */
    bool hasUnsavedChanges() const;
    
    /**
     * @brief Mark data as modified
     * Called internally when data changes
     */
    void markModified();
    
    /**
     * @brief Mark data as saved
     * Called internally after successful save
     */
    void markSaved();
    
    /**
     * @brief Get the current data file path
     * @return Path to the data file
     */
    std::string getDataFilePath() const;
    
    /**
     * @brief Set a new data file path
     * @param filePath New path for the data file
     */
    void setDataFilePath(const std::string& filePath);
    
    /**
     * @brief Check if data file exists
     * @return true if the data file exists
     */
    bool dataFileExists() const;
    
    /**
     * @brief Create a backup of the current data file
     * @return true if backup created successfully
     */
    bool createBackup() const;

    // ========================
    // Display Methods
    // ========================
    
    /**
     * @brief Display a summary of all courses
     */
    void displayAllCourses() const;
    
    /**
     * @brief Display detailed information for all courses
     */
    void displayDetailedReport() const;
    
    /**
     * @brief Display the overall academic summary
     */
    void displayOverallSummary() const;

    // ========================
    // Utility Methods
    // ========================
    
    /**
     * @brief Clear all courses (fresh start)
     */
    void clearAllData();
    
    /**
     * @brief Export data to CSV format
     * @param filePath Path for the CSV file
     * @return true if exported successfully
     */
    bool exportToCSV(const std::string& filePath) const;
};

#endif // GRADEMANAGER_HPP

