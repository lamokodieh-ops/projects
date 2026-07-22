CC ?= gcc
CFLAGS ?= -Wall -Wextra -std=c11
TARGET = event_manager
SRC = event_manager.c

.PHONY: all run clean

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe credentials.bin events.bin
