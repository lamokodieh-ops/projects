/**
 * @file Grade.cpp
 * @brief Implementation file for the Grade class
 * @author Grade Tracker Application
 * @date August 2024
 * 
 * This file contains the implementation of all Grade class methods,
 * including constructors, getters, setters, calculations, and display functions.
 */

#include "Grade.hpp"
#include <sstream>
#include <stdexcept>

// ============================================================================
// CONSTRUCTORS & DESTRUCTOR
// ============================================================================

/**
 * Default constructor - initializes all values to defaults
 */
Grade::Grade() 
    : assignmentName(""), 
      scoreEarned(0.0), 
      scorePossible(0.0), 
      weight(1.0) {
    // Default weight of 1.0 for unweighted calculations
}

/**
 * Parameterized constructor for unweighted grade
 * Sets weight to default value of 1.0
 */
Grade::Grade(const std::string& name, double earned, double possible)
    : assignmentName(name),
      scoreEarned(earned),
      scorePossible(possible),
      weight(1.0) {
    // Validate inputs - ensure non-negative values
    if (scoreEarned < 0) scoreEarned = 0;
    if (scorePossible <= 0) scorePossible = 1; // Prevent division by zero
}

/**
 * Parameterized constructor for weighted grade
 * Allows specification of custom weight
 */
Grade::Grade(const std::string& name, double earned, double possible, double w)
    : assignmentName(name),
      scoreEarned(earned),
      scorePossible(possible),
      weight(w) {
    // Validate inputs
    if (scoreEarned < 0) scoreEarned = 0;
    if (scorePossible <= 0) scorePossible = 1;
    if (weight < 0) weight = 0;
}

/**
 * Destructor - no dynamic memory to clean up
 */
Grade::~Grade() {
    // Empty - no dynamic allocation in this class
}

// ============================================================================
// GETTERS
// ============================================================================

std::string Grade::getAssignmentName() const {
    return assignmentName;
}

double Grade::getScoreEarned() const {
    return scoreEarned;
}

double Grade::getScorePossible() const {
    return scorePossible;
}

double Grade::getWeight() const {
    return weight;
}

// ============================================================================
// SETTERS
// ============================================================================

void Grade::setAssignmentName(const std::string& name) {
    assignmentName = name;
}

/**
 * Set score earned with validation
 * @return false if value is negative
 */
bool Grade::setScoreEarned(double earned) {
    if (earned < 0) {
        return false;  // Invalid: negative score
    }
    scoreEarned = earned;
    return true;
}

/**
 * Set maximum possible score with validation
 * @return false if value is not positive
 */
bool Grade::setScorePossible(double possible) {
    if (possible <= 0) {
        return false;  // Invalid: must be positive to prevent division by zero
    }
    scorePossible = possible;
    return true;
}

/**
 * Set weight with validation
 * @return false if value is negative
 */
bool Grade::setWeight(double w) {
    if (w < 0) {
        return false;  // Invalid: negative weight
    }
    weight = w;
    return true;
}

// ============================================================================
// CALCULATION METHODS
// ============================================================================

/**
 * Calculate percentage score
 * Handles edge case of zero possible points to prevent division by zero
 */
double Grade::calculatePercentage() const {
    if (scorePossible == 0) {
        return 0.0;  // Safety check for division by zero
    }
    return (scoreEarned / scorePossible) * 100.0;
}

/**
 * Calculate weighted contribution
 * Multiplies percentage by weight for weighted average calculations
 */
double Grade::calculateWeightedScore() const {
    return calculatePercentage() * weight;
}

// ============================================================================
// DISPLAY METHODS
// ============================================================================

/**
 * Display grade information in a formatted manner
 * Shows assignment name, score, percentage, and weight
 */
void Grade::display() const {
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "  " << std::left << std::setw(30) << assignmentName
              << " | Score: " << std::right << std::setw(7) << scoreEarned 
              << " / " << std::left << std::setw(7) << scorePossible
              << " | " << std::right << std::setw(6) << calculatePercentage() << "%"
              << " | Weight: " << weight << std::endl;
}

/**
 * Convert grade to string format for file storage
 * Format: assignmentName|scoreEarned|scorePossible|weight
 * Uses pipe delimiter to allow spaces in assignment names
 */
std::string Grade::toFileString() const {
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(6);
    oss << assignmentName << "|" 
        << scoreEarned << "|" 
        << scorePossible << "|" 
        << weight;
    return oss.str();
}

/**
 * Parse a Grade object from a file string
 * Expects format: assignmentName|scoreEarned|scorePossible|weight
 * @throws std::runtime_error if parsing fails
 */
Grade Grade::fromFileString(const std::string& line) {
    std::istringstream iss(line);
    std::string name;
    double earned, possible, w;
    
    // Parse using pipe delimiter
    if (!std::getline(iss, name, '|')) {
        throw std::runtime_error("Failed to parse assignment name");
    }
    
    std::string temp;
    if (!std::getline(iss, temp, '|')) {
        throw std::runtime_error("Failed to parse score earned");
    }
    earned = std::stod(temp);
    
    if (!std::getline(iss, temp, '|')) {
        throw std::runtime_error("Failed to parse score possible");
    }
    possible = std::stod(temp);
    
    if (!std::getline(iss, temp, '|')) {
        throw std::runtime_error("Failed to parse weight");
    }
    w = std::stod(temp);
    
    return Grade(name, earned, possible, w);
}

