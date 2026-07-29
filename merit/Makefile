CXX ?= g++
CXXFLAGS ?= -std=c++17 -Wall -Wextra
TARGET = merit
SRC = main.cpp Grade.cpp Course.cpp GradeManager.cpp

.PHONY: all run clean

all: $(TARGET)

$(TARGET): $(SRC) Grade.hpp Course.hpp GradeManager.hpp
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRC)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe *.o *.obj merit_data.txt *.csv
