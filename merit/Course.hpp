/**
 * @file Course.hpp
 * @brief Header file for the Course class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file defines the Course class which represents a single course
 * containing multiple graded assignments. Provides methods for grade
 * management and course average calculations.
 */

#ifndef COURSE_HPP
#define COURSE_HPP

#include <string>
#include <vector>
#include <iostream>
#include "Grade.hpp"

/**
 * @class Course
 * @brief Represents a course with a collection of grades
 * 
 * The Course class manages a collection of Grade objects and provides
 * functionality to add, edit, remove, and view grades. Also computes
 * course averages using both weighted and unweighted methods.
 */
class Course {
private:
    std::string courseName;         ///< Name of the course
    std::vector<Grade> grades;      ///< Collection of grades for this course
    int creditHours;                ///< Credit hours for GPA calculation (default: 3)

public:
    // ========================
    // Constructors & Destructor
    // ========================
    
    /**
     * @brief Default constructor
     * Creates an empty course with no name
     */
    Course();
    
    /**
     * @brief Parameterized constructor with course name
     * @param name The name of the course
     */
    explicit Course(const std::string& name);
    
    /**
     * @brief Parameterized constructor with course name and credit hours
     * @param name The name of the course
     * @param credits Credit hours for the course
     */
    Course(const std::string& name, int credits);
    
    /**
     * @brief Destructor
     */
    ~Course();

    // ========================
    // Getters
    // ========================
    
    /**
     * @brief Get the course name
     * @return Course name as string
     */
    std::string getCourseName() const;
    
    /**
     * @brief Get the credit hours
     * @return Number of credit hours
     */
    int getCreditHours() const;
    
    /**
     * @brief Get the number of grades in this course
     * @return Count of grades
     */
    size_t getGradeCount() const;
    
    /**
     * @brief Get a specific grade by index
     * @param index Index of the grade (0-based)
     * @return Reference to the Grade object
     * @throws std::out_of_range if index is invalid
     */
    Grade& getGrade(size_t index);
    
    /**
     * @brief Get a specific grade by index (const version)
     * @param index Index of the grade (0-based)
     * @return Const reference to the Grade object
     * @throws std::out_of_range if index is invalid
     */
    const Grade& getGrade(size_t index) const;
    
    /**
     * @brief Get all grades in the course
     * @return Const reference to the grades vector
     */
    const std::vector<Grade>& getAllGrades() const;

    // ========================
    // Setters
    // ========================
    
    /**
     * @brief Set the course name
     * @param name New course name
     * @return true if name is valid (non-empty), false otherwise
     */
    bool setCourseName(const std::string& name);
    
    /**
     * @brief Set the credit hours
     * @param credits New credit hours value
     * @return true if valid (positive), false otherwise
     */
    bool setCreditHours(int credits);

    // ========================
    // Grade Management Methods
    // ========================
    
    /**
     * @brief Add a new grade to the course
     * @param grade The Grade object to add
     */
    void addGrade(const Grade& grade);
    
    /**
     * @brief Add a new grade using individual parameters (unweighted)
     * @param name Assignment name
     * @param earned Score earned
     * @param possible Maximum possible score
     */
    void addGrade(const std::string& name, double earned, double possible);
    
    /**
     * @brief Add a new grade using individual parameters (weighted)
     * @param name Assignment name
     * @param earned Score earned
     * @param possible Maximum possible score
     * @param weight Assignment weight
     */
    void addGrade(const std::string& name, double earned, double possible, double weight);
    
    /**
     * @brief Remove a grade by index
     * @param index Index of the grade to remove (0-based)
     * @return true if successfully removed, false if index is invalid
     */
    bool removeGrade(size_t index);
    
    /**
     * @brief Edit an existing grade
     * @param index Index of the grade to edit
     * @param newGrade The new Grade object to replace the existing one
     * @return true if successfully edited, false if index is invalid
     */
    bool editGrade(size_t index, const Grade& newGrade);
    
    /**
     * @brief Clear all grades from the course
     */
    void clearGrades();

    // ========================
    // Calculation Methods
    // ========================
    
    /**
     * @brief Compute the unweighted course average
     * Simple average of all grade percentages
     * @return Course average as a percentage (0-100)
     */
    double computeUnweightedAverage() const;
    
    /**
     * @brief Compute the weighted course average
     * Uses individual grade weights for calculation
     * @return Weighted average as a percentage (0-100)
     */
    double computeWeightedAverage() const;
    
    /**
     * @brief Compute the course average (auto-selects method)
     * Uses weighted if weights are non-uniform, otherwise unweighted
     * @return Course average as a percentage (0-100)
     */
    double computeCourseAverage() const;
    
    /**
     * @brief Check if grades have non-uniform weights
     * @return true if any grade has weight != 1.0
     */
    bool hasWeightedGrades() const;
    
    /**
     * @brief Convert percentage to letter grade
     * @param percentage The percentage score
     * @return Letter grade string (A, B, C, D, F with +/-)
     */
    static std::string percentageToLetterGrade(double percentage);
    
    /**
     * @brief Convert percentage to GPA points (4.0 scale)
     * @param percentage The percentage score
     * @return GPA value on 4.0 scale
     */
    static double percentageToGPA(double percentage);

    // ========================
    // Display Methods
    // ========================
    
    /**
     * @brief Display course information and all grades
     */
    void displayCourse() const;
    
    /**
     * @brief Display all grades in a formatted table
     */
    void displayGrades() const;
    
    /**
     * @brief Display course summary (average, letter grade, GPA)
     */
    void displaySummary() const;

    // ========================
    // File I/O Methods
    // ========================
    
    /**
     * @brief Convert course to string format for file storage
     * @return Vector of strings representing the course data
     */
    std::vector<std::string> toFileStrings() const;
    
    /**
     * @brief Create a Course object from file strings
     * @param lines Vector of strings from file
     * @param startIndex Index to start parsing from
     * @param endIndex Reference to store where parsing ended
     * @return Course object parsed from the strings
     */
    static Course fromFileStrings(const std::vector<std::string>& lines, 
                                   size_t startIndex, 
                                   size_t& endIndex);
};

#endif // COURSE_HPP

