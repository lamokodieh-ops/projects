/**
 * @file Grade.hpp
 * @brief Header file for the Grade class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file defines the Grade class which represents a single graded assignment
 * in a course. Each grade tracks the assignment name, score earned, maximum
 * possible score, and an optional weight for weighted grade calculations.
 */

#ifndef GRADE_HPP
#define GRADE_HPP

#include <string>
#include <iostream>
#include <iomanip>

/**
 * @class Grade
 * @brief Represents a single graded assignment with score and weight information
 * 
 * The Grade class encapsulates all information related to a single assignment's
 * grade, including methods for calculating percentages and displaying grade info.
 * Supports both weighted and unweighted grade calculations.
 */
class Grade {
private:
    std::string assignmentName;  ///< Name/title of the assignment
    double scoreEarned;          ///< Points earned on the assignment
    double scorePossible;        ///< Maximum possible points
    double weight;               ///< Weight for weighted calculations (default: 1.0)

public:
    // ========================
    // Constructors & Destructor
    // ========================
    
    /**
     * @brief Default constructor
     * Initializes an empty grade with zero scores
     */
    Grade();
    
    /**
     * @brief Parameterized constructor for unweighted grade
     * @param name The assignment name
     * @param earned Points earned
     * @param possible Maximum possible points
     */
    Grade(const std::string& name, double earned, double possible);
    
    /**
     * @brief Parameterized constructor for weighted grade
     * @param name The assignment name
     * @param earned Points earned
     * @param possible Maximum possible points
     * @param w Weight of the assignment
     */
    Grade(const std::string& name, double earned, double possible, double w);
    
    /**
     * @brief Destructor
     */
    ~Grade();

    // ========================
    // Getters
    // ========================
    
    /**
     * @brief Get the assignment name
     * @return The assignment name as a string
     */
    std::string getAssignmentName() const;
    
    /**
     * @brief Get the score earned
     * @return Points earned on the assignment
     */
    double getScoreEarned() const;
    
    /**
     * @brief Get the maximum possible score
     * @return Maximum possible points
     */
    double getScorePossible() const;
    
    /**
     * @brief Get the weight of the assignment
     * @return Weight value (default 1.0 if unweighted)
     */
    double getWeight() const;

    // ========================
    // Setters
    // ========================
    
    /**
     * @brief Set the assignment name
     * @param name New assignment name
     */
    void setAssignmentName(const std::string& name);
    
    /**
     * @brief Set the score earned
     * @param earned New score earned value
     * @return true if valid (non-negative), false otherwise
     */
    bool setScoreEarned(double earned);
    
    /**
     * @brief Set the maximum possible score
     * @param possible New maximum possible score
     * @return true if valid (positive), false otherwise
     */
    bool setScorePossible(double possible);
    
    /**
     * @brief Set the weight of the assignment
     * @param w New weight value
     * @return true if valid (non-negative), false otherwise
     */
    bool setWeight(double w);

    // ========================
    // Calculation Methods
    // ========================
    
    /**
     * @brief Calculate the percentage score for this grade
     * @return Percentage as a value between 0-100 (or higher if extra credit)
     *         Returns 0 if scorePossible is 0 to prevent division by zero
     */
    double calculatePercentage() const;
    
    /**
     * @brief Calculate the weighted contribution of this grade
     * @return The weighted score (percentage * weight)
     */
    double calculateWeightedScore() const;

    // ========================
    // Display Methods
    // ========================
    
    /**
     * @brief Display the grade information to the console
     * Formats output in a readable manner with proper alignment
     */
    void display() const;
    
    /**
     * @brief Convert grade to a formatted string for file storage
     * @return Formatted string representation of the grade
     */
    std::string toFileString() const;
    
    /**
     * @brief Create a Grade object from a file string
     * @param line The formatted string from file
     * @return Grade object parsed from the string
     */
    static Grade fromFileString(const std::string& line);
};

#endif // GRADE_HPP

